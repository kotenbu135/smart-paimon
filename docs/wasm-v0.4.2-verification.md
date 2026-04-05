# WASM v0.4.2 検証レポート

検証日: 2026-04-05
パッケージ: `@kotenbu135/genshin-calc-wasm@0.4.2`
サンプルデータ: `sample/genshin_export_2026-04-03_22-17.json`

---

## 検証結果サマリ

| セクション | 件数 | OK | バグ/未実装 | データなし |
|-----------|------|-----|-----------|-----------|
| A. バグ修正 | 6 | 4 | 1 | 0 |
| B. 新規実装 | 21 | 13 | 1 | 4 |
| E. バフなし確認 | 6 | 6 | 0 | 0 |

---

## A. バグ修正（値が 0 → 修正確認）

| # | キャラ | stat | 期待値 | v0.4.2 実測値 | 判定 |
|---|--------|------|--------|--------------|------|
| A-1 | Sucrose A4 | ElementalMastery | 123.4 | 123.4 | **OK** |
| A-2 | Nilou A4 | TransformativeBonus | 1.71 | 1.71 | **OK** |
| A-3 | Yelan A4 | DmgBonus | 0.50 | 0.50 | **OK** |
| A-4 | Furina burst | DmgBonus | 最大ファンファーレ時の値 | 0.27 (Lv10) | **NG** |
| A-5 | Ineffa A4 | ElementalMastery | 非ゼロ | 135.28 | **OK** |
| A-6 | Lauma A4 | SkillDmgBonus | 非ゼロ | 0.228 | **OK** |

### A-4 Furina burst — 未修正

ファンファーレ最大時の DmgBonus を返すべきだが、基礎値（ファンファーレ0pt相当）のみ返している。

```
talents=[1,1,1]  → 0.09
talents=[1,1,10] → 0.27
talents=[1,10,10] C2 → 0.27
```

Burst Lv10 の最大ファンファーレ(300pt)時の DmgBonus はおよそ 0.75〜1.0+ の範囲になるはず。
現在の 0.27 は talent_scaling の基礎部分のみと推測される。

**対応依頼**: `max_fanfare_points` での最大値計算を適用してください。

---

## B. 新規実装（空配列 → バフ出力確認）

### 実装確認済み

| # | キャラ | バフ内容 | 実測値 | 判定 |
|---|--------|---------|--------|------|
| B-1 | Raiden Shogun | skill: BurstDmgBonus | 0.0022（コスト1あたり係数） | **OK** |
| B-2 | Xilonen | skill: ElementalResReduction(Geo) | 0.1296 | **OK** |
| B-3 | Citlali | skill: ResReduction(Pyro,Hydro) + a4: EM | 0.2, 0.2, 120 | **OK** |
| B-4 | Mavuika | a1: AtkPercent + a4: AtkPercent | 0.3, 0.6 | **OK** |
| B-5 | Xiangling C6 | c1: ResReduction(Pyro) + c6: DmgBonus(Pyro) | 0.15, 0.15 | **OK** |
| B-6 | Xingqiu C2 | c2: ResReduction(Hydro) | 0.15 | **OK** |
| B-8 | Eula | skill: ResReduction(Cryo) + PhysResRed | 0.5, 0.5 | **OK** |
| B-9 | Jean C4 | c4: ResReduction(Anemo) | 0.4 | **OK** |
| B-10 | Xianyun C2 | burst: PlungingFlatDmg + a4: PlungingDmgBonus + c2: CritRate | 7266.8, 0.75, 0.2 | **OK** |
| B-11 | Beidou C6 | c6: ResReduction(Electro) | 0.15 | **OK** |
| B-13 | Xinyan C4 | c4: PhysicalResReduction | 0.15 | **OK** |
| B-16 | Mika C6 | c6: PhysicalDmgBonus | 0.1 | **OK** |
| B-17 | Collei C4 | c4: ElementalMastery | 60 | **OK** |
| B-18 | Iansan | burst: NormalAtkDmgBonus + a4: AtkFlat | 0.3, 4176.3 | **OK** |
| B-20 | Chevreuse C6 | a1: AtkPercent + a4: ResReduction(Pyro,Electro) | 0.2, 0.4, 0.4 | **OK** |
| B-21 | Ganyu C4 | a4: DmgBonus(Cryo) + c4: DmgBonus | 0.2, 0.25 | **OK** |

### 未実装

| # | キャラ | 問題 | 詳細 |
|---|--------|------|------|
| B-7 | Rosaria A4 | CritRate バフが未出力 | C0〜C4 で空配列。C6 では PhysicalResReduction のみ出力。A4「矜持の氷槍」（自身の会心率×15%、上限15%）が未実装 |

```
Rosaria C0: []
Rosaria C4: []
Rosaria C6: [rosaria:c6 | PhysicalResReduction = 0.2]
// A4 CritRate が全パターンで欠落
// build_member_stats crit_rate = 0.05 → 期待: min(0.05 * 0.15, 0.15) = 0.0075
```

**対応依頼**: `combine_stats(&profile).crit_rate` を使って `min(crit_rate * 0.15, 0.15)` を A4 バフとして返してください。

### サンプルデータに未所持（検証不可）

| # | キャラ | 備考 |
|---|--------|------|
| B-12 | Klee | C2: DefReduction, C6: Pyro DmgBonus |
| B-14 | Yoimiya | burst: AtkPercent |
| B-15 | Albedo | a4: EM +125 |
| B-19 | Venti | C2: Anemo/Phys ResReduction, C6: swirled ResReduction |

→ 別途サンプルデータで確認するか、unit test で検証を推奨。

---

## E. バフなしキャラ（空配列が正しい）

全件 OK: Amber, Noelle, Keqing, Kaeya, Diluc, Hu Tao → すべて空配列。

---

## 新規発見: API の変更点

### 1. `target` フィールドの追加

v0.4.2 で ResolvedBuff に `target` フィールドが追加されている。

```js
{ source: "furina:burst", stat: "DmgBonus", value: 0.27, target: "Team" }
```

フロントエンド側で `target` を活用するか、無視するかの判断が必要。

### 2. stat フィールドのオブジェクト形式

元素指定付きバフの `stat` はオブジェクト形式で返される:

```js
// 単純な stat
{ stat: "DmgBonus", value: 0.5 }
{ stat: "ElementalMastery", value: 60 }
{ stat: "PhysicalResReduction", value: 0.2 }

// 元素指定付き stat（オブジェクト形式）
{ stat: { "ElementalResReduction": "Geo" }, value: 0.1296 }
{ stat: { "ElementalResReduction": "Pyro" }, value: 0.15 }
{ stat: { "ElementalDmgBonus": "Pyro" }, value: 0.15 }
```

フロントエンドのパーサーで `typeof stat === 'object'` のハンドリングが必要。

### 3. Raiden skill のコスト係数方式

BurstDmgBonus はバフ対象の元素爆発コストに依存するため、コスト1あたりの係数を返す設計:

```js
// value = 0.0022（コスト1あたり）
// フロント側計算: burst_dmg_bonus = 0.0022 × target_burst_cost
// 例: コスト90 → 0.0022 × 90 = 0.198
```

セクション C-1 の案2が採用された。フロントエンドで乗算処理の実装が必要。

---

## 対応依頼まとめ

| 優先度 | 内容 | 詳細 |
|--------|------|------|
| HIGH | A-4 Furina burst 最大値未適用 | ファンファーレ最大時の DmgBonus を返すよう修正 |
| HIGH | B-7 Rosaria A4 CritRate 未実装 | `combine_stats` の crit_rate から計算して返す |
| LOW | B-12,14,15,19 の実装確認 | unit test での検証を推奨（サンプルデータに未所持） |
