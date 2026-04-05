# WASM v0.4.0 フロントエンド検証フィードバック

## テスト環境

- `@kotenbu135/genshin-calc-wasm@0.4.0`
- サンプルデータ: `sample/genshin_export_2026-04-03_22-17.json`
- Node.js で `get_character_team_buffs` / `build_member_stats` を直接呼び出して検証

## `build_member_stats` ✅ 問題なし

per-element DMG bonus フィールド（`pyro_dmg_bonus` 等）が含まれており、`resolve_team_stats` への入力として使える形式になっている。

## `get_character_team_buffs` — バグ3件

### BUG 1: Shenhe skill の stat が `AtkFlat` になっている (CRITICAL)

**現象:**
```js
get_character_team_buffs(good, "shenhe", 1, new Uint32Array([1, 10, 10]))
// => [{ source: "shenhe:skill", stat: "AtkFlat", value: 714.03, target: "Team" }, ...]
```

**期待:**
```js
[
  { source: "shenhe:skill", stat: "NormalAtkFlatDmg", value: 714.03, target: "Team" },
  { source: "shenhe:skill", stat: "ChargedAtkFlatDmg", value: 714.03, target: "Team" },
  { source: "shenhe:skill", stat: "PlungingAtkFlatDmg", value: 714.03, target: "Team" },
  { source: "shenhe:skill", stat: "SkillFlatDmg", value: 714.03, target: "Team" },
  { source: "shenhe:skill", stat: "BurstFlatDmg", value: 714.03, target: "Team" },
]
```

**理由:**
申鶴の氷翎（元素スキル）は**ダメージに直接加算**されるフラットダメージであり、ATKステータスに加算される `AtkFlat` とは根本的に異なるメカニクス。

- `AtkFlat` → ATK値に加算（攻撃力が上がる → ダメージ計算式の「ATK」部分に影響）
- `NormalAtkFlatDmg` 等 → ダメージ計算式に直接加算（天賦倍率計算後に加算される）

`AtkFlat` のままだと、申鶴の氷翎バフが過大に適用される（ATKに乗算される天賦倍率の影響を二重に受ける）。

**修正案:** data crate の `TalentBuffDef` で申鶴の stat を以下の5エントリに変更:
```
NormalAtkFlatDmg, ChargedAtkFlatDmg, PlungingAtkFlatDmg, SkillFlatDmg, BurstFlatDmg
```

### BUG 2: Yun Jin burst の stat が `AtkFlat` になっている (CRITICAL)

**現象:**
```js
get_character_team_buffs(good, "yun_jin", 4, new Uint32Array([1, 1, 10]))
// => [{ source: "yun_jin:burst", stat: "AtkFlat", value: 547.29, target: "Team" }]
```

**期待:**
```js
[{ source: "yun_jin:burst", stat: "NormalAtkFlatDmg", value: 547.29, target: "Team" }]
```

**理由:**
雲菫の元素爆発「破嶂の旌儀」は通常攻撃に防御力ベースのフラットダメージを加算する。仕様書にも `NormalAtkFlatDmg` と記載されているが、実装が `AtkFlat` になっている。

### BUG 3: Nahida A1 の EM バフが常に 0 を返す (HIGH)

**現象:**
```js
get_character_team_buffs(good, "nahida", 2, new Uint32Array([1, 10, 10]))
// => [{ source: "nahida:a4", stat: "ElementalMastery", value: 0, target: "Team" }]
```

**期待:**
```js
// Nahida EM = 711.7 → (711.7 - 200) × 0.25 = 127.925 → 127 or 128
[{ source: "nahida:a1", stat: "ElementalMastery", value: 128, target: "Team" }]
```

**追加の疑問:**
- source が `nahida:a4` になっているが、ナヒーダのこのパッシブは A1（固有天賦1「浄善摂受明論」、Lv40突破で解放）。仕様書にも `level>=40` / `a1` と記載されている。
- EM の計算で `build_stat_profile` の `elemental_mastery` フィールドを使っているか確認してほしい。`elemental_mastery: 711.7` は `build_member_stats` で確認済み。

## 正常動作の確認

| キャラ | 結果 |
|--------|------|
| Bennett burst (C0/C6) | ✅ AtkFlat + C6 PyroBonus |
| Mona burst | ✅ DmgBonus 0.7 |
| Kujou Sara (C0/C6) | ✅ AtkFlat + C6 CritDmg |
| Shenhe A4 | ✅ SkillDmgBonus + BurstDmgBonus (0.15) |
| 未対応キャラ (Diluc) | ✅ 空配列 |

## その他の確認事項

- `talent_levels` の型が `Vec<u32>` (設計仕様書) → `Uint32Array` (実装) に変更されている。フロントエンド側で `new Uint32Array([1, 1, 13])` で渡す必要がある。問題なし。
- `build_stats` API が設計仕様書にない追加API。武器/聖遺物の条件付きバフを解決する機能で、将来的に有用。
