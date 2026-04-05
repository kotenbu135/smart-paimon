# WASM v0.4.3 リクエスト: v0.4.2 検証で発見されたバグ修正

## 概要

v0.4.2 の検証（`test-wasm-v042-audit.mjs`）で発見された4件のバグ修正リクエスト。
v0.4.2 で新規実装されたキャラバフの大半は正常動作を確認済み。

リポジトリ: https://github.com/kotenbu135/genshin-calc

## フロントエンド検証環境

- `@kotenbu135/genshin-calc-wasm@0.4.2`
- サンプルデータ: `sample/genshin_export_2026-04-03_22-17.json`

---

## A. Furina burst: 最大ファンファーレ値が未適用

### 現象

```js
get_character_team_buffs(good, "furina", 2, new Uint32Array([1, 10, 10]))
// 実測: [{ source: "furina:burst", stat: "DmgBonus", value: 0.27, target: "Team" }]
// 期待: value = 1.00
```

Burst Lv10 C2 で `0.27` を返す。これは最大ファンファーレ時の値ではなく、基礎倍率のみ。

### 期待される計算

- Burst Lv10 のファンファーレ1ptあたりの DMG Bonus: **0.25%**
- C0 最大ファンファーレ: **300pt** → 300 × 0.0025 = **0.75**
- C1+ 最大ファンファーレ: **400pt**（C1 で上限+100）→ 400 × 0.0025 = **1.00**

| C | Burst Lv | 最大 Fanfare | 期待 DmgBonus |
|---|----------|-------------|---------------|
| 0 | 10       | 300         | 0.75          |
| 1+| 10       | 400         | 1.00          |
| 0 | 13       | 300         | 0.93          |
| 1+| 13       | 400         | 1.24          |

### 修正方針

`get_character_team_buffs` で Furina burst の DmgBonus を返す際、最大ファンファーレポイント（C0: 300, C1+: 400）を前提として計算する。v0.4.2 リクエストの「最大値ポリシー」に従う。

### 参考

- [Let the People Rejoice - Honey Hunter World](https://genshin.honeyhunterworld.com/s_893901/?lang=EN)
- [Furina - Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Let_the_People_Rejoice)

---

## B. Rosaria A4: CritRate バフが未実装

### 現象

```js
get_character_team_buffs(good, "rosaria", 6, new Uint32Array([10, 10, 10]))
// 実測: [{ source: "rosaria:c6", stat: "PhysicalResReduction", value: 0.2, target: "Team" }]
// 期待: rosaria:a4 が含まれるべき
```

C6 の `PhysicalResReduction` は出力されるが、A4「影から支える暗色」の CritRate バフが完全に欠落。

### 期待される仕様

- **天賦名**: 影から支える暗色（Shadow Samaritan）
- **トリガー**: 元素爆発使用時
- **対象**: 自身を除くチーム（`TeamExcludeSelf`）
- **ステータス**: `CritRate`
- **値**: `min(rosaria_crit_rate × 0.15, 0.15)`
- **持続**: 10秒

サンプルデータのロサリア（Lv50, 突破3）は `crit_rate = 0.05` なので:
```
min(0.05 × 0.15, 0.15) = 0.0075
```

高投資ロサリア（CritRate 100%）の場合:
```
min(1.00 × 0.15, 0.15) = 0.15
```

### 修正方針

`combine_stats(&profile).crit_rate` を使用してロサリア自身の会心率を取得し、`min(crit_rate * 0.15, 0.15)` を計算。`target: TeamExcludeSelf` で返す。

### 参考

- [Shadow Samaritan - Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Shadow_Samaritan)

---

## C. Aino A4: stat type が誤っている（BurstDmgBonus → BurstFlatDmg）

### 現象

```js
get_character_team_buffs(good, "aino", 6, new Uint32Array([1, 1, 1]))
// 実測: [
//   { source: "aino:c1", stat: "ElementalMastery", value: 80, target: "Team" },
//   { source: "aino:a4", stat: "BurstDmgBonus", value: 74.5, target: "OnlySelf" },  // ← BUG
//   { source: "aino:c6", stat: "TransformativeBonus", value: 0.15, target: "Team" },
// ]
```

A4「構造化パワーブースター」の stat が `BurstDmgBonus` になっているが、正しくは **`BurstFlatDmg`**。

### 問題の影響

- `BurstDmgBonus = 74.5` → ダメージ計算で **+7450% の爆発 DMG ボーナス**として適用される（壊滅的な計算ミス）
- `BurstFlatDmg = 74.5` → 爆発の基礎ダメージに **+74.5 のフラット加算**として適用される（正しい挙動）

### 期待される仕様

- **天賦名**: 構造化パワーブースター（Structured Power Booster）
- **効果**: 元素爆発のダメージが元素熟知の50%分増加（フラット加算）
- **値**: `elemental_mastery × 0.50`（サンプル: 149 × 0.50 = 74.5）
- **stat**: **`BurstFlatDmg`**（not `BurstDmgBonus`）
- **target**: `OnlySelf`

### 修正方針

TalentBuffDef の `stat` を `BurstDmgBonus` から `BurstFlatDmg` に変更する。値の計算ロジック自体は正しい。

### 参考

- [Structured Power Booster - Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Structured_Power_Booster)
- [Aino Quick Guide - KQM](https://keqingmains.com/q/aino-quickguide/)

---

## D. Chevreuse C6: Pyro/Electro DMG Bonus が未実装

### 現象

```js
get_character_team_buffs(good, "chevreuse", 6, new Uint32Array([10, 10, 10]))
// 実測: [
//   { source: "chevreuse:a1", stat: "AtkPercent", value: 0.2, target: "Team" },
//   { source: "chevreuse:a4", stat: { ElementalResReduction: "Pyro" }, value: 0.4, target: "Team" },
//   { source: "chevreuse:a4", stat: { ElementalResReduction: "Electro" }, value: 0.4, target: "Team" },
// ]
// 期待: chevreuse:c6 の Pyro/Electro DmgBonus が含まれるべき
```

A1 と A4 は正常だが、C6「排邪弾雨の追撃」の効果が欠落。

### 期待される仕様

- **命星名**: 排邪弾雨の追撃（In Pursuit of Ending Evil）
- **トリガー**: チームメンバーが短距離急速射撃（元素スキル）で回復された時
- **対象**: `Team`
- **ステータスと値**:

| stat | 1スタック | 最大（3スタック） |
|------|-----------|-------------------|
| `{ ElementalDmgBonus: "Pyro" }` | +0.20 | +0.60 |
| `{ ElementalDmgBonus: "Electro" }` | +0.20 | +0.60 |

- **持続**: 8秒/スタック（独立カウント）

### 修正方針

最大値ポリシーに従い、3スタック時の値（各 +0.60）を返す。

```
{ source: "chevreuse:c6", stat: { ElementalDmgBonus: "Pyro" }, value: 0.60, target: "Team" }
{ source: "chevreuse:c6", stat: { ElementalDmgBonus: "Electro" }, value: 0.60, target: "Team" }
```

### 参考

- [Chevreuse - Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Chevreuse)

---

## v0.4.2 検証結果サマリ

### 正常動作を確認（リグレッションなし）

v0.4.1 既存: Bennett, Nahida, Shenhe, Zhongli, Faruzan, Mona, KujouSara, Sucrose, Nilou, Yelan, Kazuha

v0.4.2 新規実装（正常）:
Raiden Shogun, Xilonen, Citlali, Mavuika, Xiangling, Xingqiu, Eula, Jean, Xianyun, Beidou, Xinyan, Mika, Collei, Iansan, Ganyu, Ineffa, Lauma

バフなしキャラ（空配列 OK）: Amber, Noelle, Keqing, Kaeya, Diluc, Hu Tao, Fischl, Razor

### サンプルデータに未所持（検証不可）

Klee, Yoimiya, Albedo, Venti — これらのキャラは v0.4.3 でサンプルデータを追加するか、別途テスト用 GOOD データで検証が必要。

### 設計メモ

- `Columbina:cx` の命名は妥当。全命星に付随する Lunar Reaction DMG Elevation パッシブを表す
- Raiden `BurstDmgBonus = 0.0044`（C2, skill Lv10）は「爆発コスト1あたりの係数」として返されている。フロント側で `value × target_burst_cost` の乗算が必要（セクションC設計は v0.4.2 リクエストを参照）
