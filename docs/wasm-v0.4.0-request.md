# WASM v0.4.0 API 追加リクエスト

## 背景

smart-paimon のアーキテクチャ原則「計算はすべてWASM、フロントは表示のみ」に対して、
現在 TypeScript 側に以下の計算ロジックが残っている：

1. **キャラバフ値の計算** (`src/data/character-buffs.ts`)
   - Bennett Q: 基礎ATK × 天賦倍率 → AtkFlat
   - Kazuha A4: EM × 0.0004 → DmgBonus
   - Nahida A1: (EM - 200) × 0.25 (上限250) → ElementalMastery
   - Mona Q: 天賦倍率テーブル → DmgBonus
   - Shenhe E: 総ATK × 天賦倍率 → FlatDmg (全攻撃種別)
   - Kujou Sara E: 基礎ATK × 天賦倍率 → AtkFlat, C6: CritDmg +0.60
   - Yun Jin Q: 総DEF × 天賦倍率 → NormalAtkFlatDmg
   - Furina Q: ファンファーレレート × 想定ポイント → DmgBonus

2. **ステータス組み立て** (`src/lib/team.ts` の `buildStatProfile()`)
   - 基礎ステータス(base_hp/atk/def) の突破段階に応じた取得
   - 固有値の加算 (crit_rate +5%, crit_dmg +50%, ER +100%)
   - 武器サブステータスの累積
   - キャラ突破ステータスの加算

## 現在の問題

### 問題1: キャラバフ計算がTS側にある

`resolve_team_stats` は `TeamMember.buffs_provided` を**適用**するだけで、
バフ**値**は外部で計算する必要がある。`TeamMember` に `character_id` がないため
WASM側でキャラ固有バフを自動計算できない。

### 問題2: stats フォーマットの不一致

- `resolve_team_stats` の入力: `StatProfile` + per-element DMG bonus (base_hp, atk_percent 等 + pyro_dmg_bonus 等)
- `build_stats_from_good` の出力: `ExtendedStats` (hp, atk, def は最終値、base 値なし)
- パイプラインが直結しないため、TS側で `buildStatProfile()` を手動実装している

## リクエスト

### 1. 新API: `get_character_team_buffs`

キャラクター固有のチームバフ値を計算して返す関数。

```rust
#[wasm_bindgen]
pub fn get_character_team_buffs(
    character_id: &str,
    level: u32,
    constellation: u32,
    talent_levels: Vec<u32>,  // [normal, skill, burst]
    stats: JsValue,           // ExtendedStats (build_stats_from_good の出力)
) -> Result<JsValue, JsError>
// Returns: Vec<ResolvedBuff>
```

#### 入力例

```js
const buffs = get_character_team_buffs(
  "bennett",
  90,          // level
  6,           // constellation
  [1, 1, 13],  // talent_levels
  {            // stats (ExtendedStats from build_stats_from_good)
    hp: 20000, atk: 800, def: 700,
    elemental_mastery: 0,
    crit_rate: 0.05, crit_dmg: 0.50,
    energy_recharge: 2.0, dmg_bonus: 0,
    pyro_dmg_bonus: 0, hydro_dmg_bonus: 0,
    electro_dmg_bonus: 0, cryo_dmg_bonus: 0,
    dendro_dmg_bonus: 0, anemo_dmg_bonus: 0,
    geo_dmg_bonus: 0, physical_dmg_bonus: 0,
  }
);
```

#### 出力例

```js
[
  { source: "bennett:burst", stat: "AtkFlat", value: 756, target: "Team" },
  { source: "bennett:c6", stat: { "ElementalDmgBonus": "Pyro" }, value: 0.15, target: "Team" },
]
```

#### 必要なバフ計算ロジック（現在TSに実装済みのもの）

| キャラ | ソース | 条件 | 計算 |
|--------|--------|------|------|
| Bennett | burst | 常時 | base_atk(キャラ+武器) × 天賦倍率 → AtkFlat |
| Bennett | c6 | C6 | 炎元素ダメージ+15% → ElementalDmgBonus Pyro |
| Kazuha | a4 | 突破4以上 | EM × 0.04% → DmgBonus |
| Nahida | a1 | 突破1以上 | min(max((EM-200)×0.25, 0), 250) → ElementalMastery (TeamExcludeSelf) |
| Mona | burst | 常時 | 天賦倍率テーブル → DmgBonus |
| Shenhe | skill | 常時 | 総ATK × 天賦倍率 → 全攻撃種別FlatDmg |
| Kujou Sara | skill | 常時 | base_atk × 天賦倍率 → AtkFlat |
| Kujou Sara | c6 | C6 | CritDmg +0.60 |
| Yun Jin | burst | 常時 | 総DEF × 天賦倍率 → NormalAtkFlatDmg |
| Furina | burst | 常時 | ファンファーレレート × ポイント → DmgBonus |

**注**: `stats` 引数は `ExtendedStats` 形式（`build_stats_from_good` の出力）。
`base_atk` が必要なバフ（Bennett, Sara）は、WASM内部で `find_character` + ascension レベルから取得可能。

#### 未対応キャラについて

上記は V1 で対応するキャラ。今後追加されるサポートキャラ（Zhongli シールド耐性減少など）は
同じ関数で拡張していく方針。対応していないキャラは空配列 `[]` を返す。

### 2. 新API: `build_member_stats`

`resolve_team_stats` に渡すためのステータスを GOOD JSON から構築する関数。

```rust
#[wasm_bindgen]
pub fn build_member_stats(
    json: &str,
    character_id: &str,
) -> Result<JsValue, JsError>
// Returns: MemberStats (resolve_team_stats が受け付ける形式)
```

#### 目的

現在 `build_stats_from_good` は `ExtendedStats`（最終値）を返すが、
`resolve_team_stats` は `base_hp` / `atk_percent` 等の分解された入力を要求する。
この関数は `resolve_team_stats` の入力に直結するフォーマットで返す。

#### 出力例

```js
{
  // StatProfile fields (for resolve_team_stats percentage buff calculation)
  base_hp: 13103,
  base_atk: 544,   // character base + weapon base
  base_def: 784,
  hp_percent: 0.0,
  atk_percent: 0.466,
  def_percent: 0.0,
  hp_flat: 4780,
  atk_flat: 311,
  def_flat: 0,
  elemental_mastery: 0,
  crit_rate: 0.361,   // artifact + innate 5%
  crit_dmg: 1.122,    // artifact + innate 50%
  energy_recharge: 1.518,  // artifact + innate 100% + ascension stat
  dmg_bonus: 0.0,
  // Per-element DMG bonus
  pyro_dmg_bonus: 0.466,
  hydro_dmg_bonus: 0,
  electro_dmg_bonus: 0,
  cryo_dmg_bonus: 0,
  dendro_dmg_bonus: 0,
  anemo_dmg_bonus: 0,
  geo_dmg_bonus: 0,
  physical_dmg_bonus: 0,
}
```

これにより TS 側の `buildStatProfile()` (約100行) を削除できる。

## フロント側の移行イメージ

### Before (現在)

```ts
// TS でステータス組み立て + バフ計算
const stats = buildStatProfile(build);        // TS計算
const charBuffs = getCharacterBuffs(build);   // TS計算
const member: TeamMember = {
  element, weapon_type, stats,
  buffs_provided: [...charBuffs, ...weaponBuffs, ...artifactBuffs],
  is_moonsign,
};
```

### After (v0.4.0)

```ts
// すべてWASM
const stats = build_member_stats(rawJson, characterId);     // WASM
const charBuffs = get_character_team_buffs(                  // WASM
  characterId, level, constellation, talentLevels,
  build_stats_from_good(rawJson, characterId)
);
const member: TeamMember = {
  element, weapon_type, stats,
  buffs_provided: [...charBuffs, ...weaponBuffs, ...artifactBuffs],
  is_moonsign,
};
```

## 削除可能になるTSコード

| ファイル | 行数 | 内容 |
|----------|------|------|
| `src/data/character-buffs.ts` | 154行 | 全削除 |
| `src/lib/team.ts` の `buildStatProfile` 関連 | ~100行 | STAT_KEY_MAP, ascensionToBaseStatIndex, clampIndex, addStatBonus, buildStatProfile |

**合計: ~254行のTS計算ロジックを削除**

## BuffableStat 型リファレンス

`get_character_team_buffs` が返す `ResolvedBuff.stat` の型:

```rust
enum BuffableStat {
    HpPercent, AtkPercent, DefPercent,
    HpFlat, AtkFlat, DefFlat,
    CritRate, CritDmg,
    ElementalMastery, EnergyRecharge,
    DmgBonus,
    ElementalDmgBonus(Element),
    PhysicalDmgBonus,
    NormalAtkDmgBonus, ChargedAtkDmgBonus, PlungingAtkDmgBonus,
    SkillDmgBonus, BurstDmgBonus,
    HealingBonus, ShieldStrength,
    AmplifyingBonus, TransformativeBonus, AdditiveBonus,
    ElementalRes(Element),
    ElementalResReduction(Element),
    PhysicalResReduction,
    DefReduction,
    NormalAtkFlatDmg, ChargedAtkFlatDmg, PlungingAtkFlatDmg,
    SkillFlatDmg, BurstFlatDmg,
    DefPercentRaw,
}
```

これは既存の `resolve_team_stats` で使用されている型と同一。
