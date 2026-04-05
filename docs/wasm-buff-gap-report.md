# WASM バフ機能ギャップレポート

## 概要

`resolve_team_stats` は `TeamMember[].buffs_provided` に含まれる `ResolvedBuff` を処理してターゲットキャラの最終 `Stats` を返すが、**全ての `BuffableStat` が反映されるわけではない**。Stats オブジェクトに対応するフィールドが存在しないバフ種別は無視される。

本レポートは `resolve_team_stats` に無視される全バフ種別と、それを使用している既存のキャラ・武器・聖遺物・元素共鳴の定義を網羅的に列挙する。

## `resolve_team_stats` の BuffableStat 対応状況

### Stats に反映される（正常動作）

| BuffableStat | Stats フィールド |
|---|---|
| `AtkFlat` | `atk` |
| `AtkPercent` | `atk` |
| `HpPercent` | `hp` |
| `DefPercent` | `def` |
| `CritRate` | `crit_rate` |
| `CritDmg` | `crit_dmg` |
| `ElementalMastery` | `elemental_mastery` |
| `EnergyRecharge` | `energy_recharge` |
| `DmgBonus` | `dmg_bonus` |
| `{ ElementalDmgBonus: Element }` | `{element}_dmg_bonus` |

### Stats に反映されない（無視される）

| BuffableStat | 用途 | 反映先として必要な場所 |
|---|---|---|
| `NormalAtkDmgBonus` | 通常攻撃ダメージバフ | `calculate_damage` の入力 |
| `ChargedAtkDmgBonus` | 重撃ダメージバフ | 同上 |
| `PlungingAtkDmgBonus` | 落下攻撃ダメージバフ | 同上 |
| `SkillDmgBonus` | 元素スキルダメージバフ | 同上 |
| `BurstDmgBonus` | 元素爆発ダメージバフ | 同上 |
| `NormalAtkFlatDmg` | 通常攻撃追加ダメージ | `calculate_damage` の `flat_dmg` |
| `ChargedAtkFlatDmg` | 重撃追加ダメージ | 同上 |
| `PlungingAtkFlatDmg` | 落下攻撃追加ダメージ | 同上 |
| `SkillFlatDmg` | スキル追加ダメージ | 同上 |
| `BurstFlatDmg` | 爆発追加ダメージ | 同上 |
| `{ ElementalResReduction: Element }` | 敵元素耐性ダウン | `calculate_damage` の `enemy.resistance` |
| `PhysicalResReduction` | 敵物理耐性ダウン | 同上 |
| `DefReduction` | 敵防御ダウン | `calculate_damage` の `enemy.def_reduction` |
| `HealingBonus` | 回復量バフ | ダメージ計算外 |
| `ShieldStrength` | シールド強度バフ | ダメージ計算外 |
| `AmplifyingBonus` | 蒸発/溶解反応バフ | `calculate_damage` の `reaction_bonus` |
| `TransformativeBonus` | 過負荷等反応バフ | `calculate_transformative` の `reaction_bonus` |
| `AdditiveBonus` | 激化反応バフ | `calculate_damage` の `reaction_bonus` |
| `DefPercentRaw` | 防御%（基礎値非参照） | Stats 反映なし |

---

## 影響を受ける既存バフ定義

### カテゴリ1: 敵耐性ダウン（ElementalResReduction / PhysicalResReduction）

`resolve_team_stats` で無視され、`calculate_damage` の `Enemy` にも反映手段がない。

| ソース | バフ | 値 | ファイル |
|---|---|---|---|
| **シトラリ Q** | 氷耐性 -20%, 炎耐性 -20% | 0.2 | `character-buffs.ts` |
| **シロネン E** | 炎/水/雷/氷耐性 -9~42%（天賦Lv依存） | 0.09–0.42 | `character-buffs.ts` |
| 鍾離シールド（**未実装**） | 全元素+物理耐性 -20% | 0.2 | — |
| スーパーコンダクト（**未実装**） | 物理耐性 -40% | 0.4 | — |
| 翠緑の影4pc（**VV、空バフ扱い**） | 拡散元素耐性 -40% | 0.4 | `artifact-buffs.ts`（`buffs: []`） |
| 深林の記憶4pc（**空バフ扱い**） | 草耐性 -30% | 0.3 | `artifact-buffs.ts`（`buffs: []`） |

### カテゴリ2: ダメージタイプ別 DMG ボーナス（NormalAtkDmgBonus 等）

`resolve_team_stats` で無視される。`calculate_damage` にも該当フィールドがない。

| ソース | バフ | 値 | ファイル |
|---|---|---|---|
| **風鷹剣（Freedom-Sworn）** | NormalAtkDmgBonus +16~32% | 0.16–0.32 | `weapon-buffs.ts` |
| **風鷹剣（Freedom-Sworn）** | ChargedAtkDmgBonus +16~32% | 0.16–0.32 | `weapon-buffs.ts` |
| **風鷹剣（Freedom-Sworn）** | PlungingAtkDmgBonus +16~32% | 0.16–0.32 | `weapon-buffs.ts` |

### カテゴリ3: Flat DMG 追加ダメージ（NormalAtkFlatDmg 等）

`resolve_team_stats` で無視される。`calculate_damage` には `flat_dmg` パラメータが存在するが、チームバフから自動注入される仕組みがない。

| ソース | バフ | 値 | ファイル |
|---|---|---|---|
| **シトラリ C6** | 通常/重撃/落下 flat DMG = EM × 2.0 | EM依存 | `character-buffs.ts` |
| **申鶴 E** | 全タイプ flat DMG = ATK × 倍率 | ATK依存 | `character-buffs.ts` |
| **雲菫 Q** | 通常攻撃 flat DMG = DEF × 倍率 | DEF依存 | `character-buffs.ts` |
| **昔日の歌4pc（Song of Days Past）** | 通常/重撃/落下 flat DMG +1000 | 1000 | `artifact-buffs.ts` |

### カテゴリ4: 敵防御ダウン（DefReduction）

`resolve_team_stats` で無視される。`calculate_damage` の `Enemy.def_reduction` に反映すべきだが、チームバフからの注入がない。

| ソース | バフ | 値 | ファイル |
|---|---|---|---|
| リサ A4（**未実装**） | 敵DEF -15% | 0.15 | — |
| 雷電将軍 E（**未実装**） | 敵DEF -? % | — | — |

### カテゴリ5: 反応ボーナス（AmplifyingBonus / TransformativeBonus / AdditiveBonus）

`resolve_team_stats` で無視される。`calculate_damage` の `reaction_bonus` に反映すべき。

| ソース | バフ | 値 | ファイル |
|---|---|---|---|
| 現在の実装では該当なし | — | — | — |
| ※ 紅炎の魔女4pc等はキャラ自身のみ（`artifact-buffs.ts`でなく`damage.ts`の`getReactionBonus`で処理） | — | — | — |

---

## 未実装だが同様の問題を持つキャラクター

以下のキャラはまだ `character-buffs.ts` に定義されていないが、追加時に同じWASM機能不足の影響を受ける。

### 耐性ダウン系

| キャラ | 効果 | 必要な BuffableStat |
|---|---|---|
| 鍾離 | シールド展開中: 全元素+物理耐性 -20% | `ElementalResReduction` × 7 + `PhysicalResReduction` |
| 楓原万葉 C2 | 翠緑の影のようなEM+200（実装済み相当） + 元素耐性ダウン | `ElementalResReduction` |
| フレミネ（Freminet） | 氷/物理耐性ダウン（C2） | `ElementalResReduction` + `PhysicalResReduction` |
| ミカ | 物理耐性ダウン（C6） | `PhysicalResReduction` |
| ラーヴァナ（Dehya） | 炎耐性ダウン（C1） | `ElementalResReduction` |

### Flat DMG 系

| キャラ | 効果 | 必要な BuffableStat |
|---|---|---|
| 閑雲（Xianyun） | 落下攻撃 flat DMG = ATK × 倍率 | `PlungingAtkFlatDmg` |

### ダメージタイプ別 DMG ボーナス系

| キャラ | 効果 | 必要な BuffableStat |
|---|---|---|
| 夜蘭（Yelan） A4 | 通常攻撃DMG +1~3.5%/秒（累積） | `NormalAtkDmgBonus` |
| 雲菫 A4 | 通常攻撃DMG +2.5~11.5%（チーム元素種別依存） | `NormalAtkDmgBonus` |

### 防御ダウン系

| キャラ | 効果 | 必要な BuffableStat |
|---|---|---|
| リサ A4 | Q命中時、敵DEF -15% | `DefReduction` |

## まとめ

| カテゴリ | 影響件数 | 現状 |
|---|---|---|
| 敵耐性ダウン | 実装済み2 + 未実装5 + 聖遺物2 = **9件** | 完全に無視 |
| ダメージタイプ別DMGボーナス | 実装済み3 + 未実装2 = **5件** | 完全に無視 |
| Flat DMG | 実装済み3 + 未実装1 = **4件** | Stats非反映、`flat_dmg`への注入なし |
| 敵防御ダウン | 未実装1 = **1件** | Stats非反映、`def_reduction`への注入なし |
| 反応ボーナス | 0件（現状該当なし） | — |
| 合計 | **19件** | — |
