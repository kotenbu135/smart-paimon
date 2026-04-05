# WASM v0.4.2 リクエスト: チームバフ/デバフ網羅対応

## 概要

`get_character_team_buffs` の対応キャラを拡充し、全キャラクターのチームバフ/デバフを網羅する。
ランタイム依存のバフ（Furina のファンファーレ、Yelan の時間経過等）は**最大値を採用**する。

リポジトリ: https://github.com/kotenbu135/genshin-calc

## フロントエンド検証環境

- `@kotenbu135/genshin-calc-wasm@0.4.1`
- サンプルデータ: `sample/genshin_export_2026-04-03_22-17.json`

---

## A. バグ修正（値が 0 になっているキャラ）

v0.4.1 で TalentBuffDef は存在するが、計算結果が 0 になっているケース。

### A-1. Sucrose A4: EM = 0（期待: 123）

```js
get_character_team_buffs(good, "sucrose", 6, new Uint32Array([1, 1, 1]))
// 実測: [{ source: "sucrose:a1", stat: "ElementalMastery", value: 50 },
//         { source: "sucrose:a4", stat: "ElementalMastery", value: 0 }]
// 期待: a4 value = 617 * 0.20 = 123.4
```

A4「小さな慧風」: スクロースの元素熟知の20%をチームに付与。`build_stat_profile` の `elemental_mastery`（= 617）を使うべき。

### A-2. Nilou A4: TransformativeBonus = 0（期待: 1.78）

```js
// 実測: [{ source: "nilou:a4", stat: "TransformativeBonus", value: 0 }]
// 期待: floor((49810 - 30000) / 1000) * 0.09 = 19 * 0.09 = 1.71
```

A4「落花廻旋の庭」: HP30000を超える分の1000ごとに開花ダメージ+9%。`combine_stats(&profile).hp` から計算すべき。

### A-3. Yelan A4: DmgBonus = 0（期待: 0.50）

```js
// 実測: [{ source: "yelan:a4", stat: "DmgBonus", value: 0 }]
// 期待: value = 0.50 (最大値を採用)
```

A4「適者生存」: 爆発後15秒かけて1%→50%にランプアップ。**最大値 0.50 を固定値として返す**。

### A-4. Furina Burst: DmgBonus = 0.27（期待: 最大値）

```js
// 実測: [{ source: "furina:burst", stat: "DmgBonus", value: 0.27 }]
```

ファンファーレポイントが最大時の値を返すべき。Burst Lv10 時の最大 DmgBonus を確認して適用。

### A-5. Ineffa A4: EM = 0

値が 0 になっている。計算ロジックの確認が必要。

### A-6. Lauma A4: SkillDmgBonus = 0

値が 0 になっている。計算ロジックの確認が必要。

---

## B. 未実装キャラ（空配列を返す）

Web調査でチームバフ/デバフが確認されているが、`get_character_team_buffs` が空配列を返すキャラクター。

### B-1. 雷電将軍 (Raiden Shogun)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| skill | BurstDmgBonus | skill_multiplier × チームメイトの元素爆発コスト | 常時（スキル発動中） |
| c4 | AtkPercent | +0.30 | C>=4、爆発終了後10秒 |

**Note**: BurstDmgBonus の値はバフ対象の元素爆発コストに依存する。フロントエンドでは対象キャラの Burst コストを知っているため、値を後から適用可能。ただし `get_character_team_buffs` の戻り値にどう表現するかは要検討（固定値にできない）。

一案: `scales_on_target_burst_cost: true` フラグを ResolvedBuff に追加するか、`value` に「コスト1あたりの係数」を返して、フロント側で乗算する。

### B-2. シロネン (Xilonen)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| skill | ElementalResReduction(sampled) | talent_level依存（Lv10: -0.36） | パーティの元素に応じてサンプリング。岩は常時、他は2種以上の異なる元素が必要 |
| c4 | ElementalMastery | +120 | 夜魂ポイント消費時 |

**Note**: サンプリングする元素はパーティ構成依存。`get_character_team_buffs` 時点ではパーティ情報がないため、`resolve_team_stats` 側で処理するか、API にパーティ元素を追加引数として渡す設計が必要。

### B-3. シトラリ (Citlali)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| skill | ElementalResReduction(Pyro) | -0.20 | 常時 |
| skill | ElementalResReduction(Hydro) | -0.20 | 常時 |
| a4 | ElementalMastery | min(EM × 0.20, 120) | 常時 |
| c2 | ElementalResReduction(Pyro) | 追加 -0.20（合計 -0.40） | C>=2 |
| c2 | ElementalResReduction(Hydro) | 追加 -0.20（合計 -0.40） | C>=2 |

### B-4. マーヴィカ (Mavuika)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| a1 | AtkPercent | +0.30 | 夜魂加護状態のキャラに対して |
| a4 | AtkPercent | 闘志消費量 × 0.003（最大 +0.60） | **最大値 0.60 を採用** |

### B-5. シャンリン (Xiangling)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c1 | ElementalResReduction(Pyro) | -0.15 | C>=1、グゥオパァー命中時 |
| c6 | ElementalDmgBonus(Pyro) | +0.15 | C>=6、爆発中 |

### B-6. 行秋 (Xingqiu)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c2 | ElementalResReduction(Hydro) | -0.15 | C>=2、雨すだれ命中時 |

### B-7. ロサリア (Rosaria)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| a4 | CritRate | min(own_crit_rate × 0.15, 0.15) | 爆発使用後、自身を除くチームに付与 |
| c6 | PhysicalResReduction | -0.20 | C>=6、爆発命中時 |

**Note**: A4 は「ロサリア自身の会心率」に依存。`combine_stats(&profile).crit_rate` を使用。

### B-8. ユーラ (Eula)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| skill (hold) | ElementalResReduction(Cryo) | -0.25 per stack（最大 -0.50） | 凝心スタック消費時。**最大値 -0.50 を採用** |
| skill (hold) | PhysicalResReduction | -0.25 per stack（最大 -0.50） | 同上 |

### B-9. ジン (Jean)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c4 | ElementalResReduction(Anemo) | -0.40 | C>=4、爆発フィールド内の敵 |

### B-10. 閑雲 / リーユン (Xianyun)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| burst | PlungingAtkFlatDmg | ATK × talent_scaling（3スタック消費制） | 常時（爆発後） |
| a4 | PlungingAtkDmgBonus | (ATK - 1000) × 0.005（最大 +0.75） | ATK > 1000 時 |
| c2 | CritRate | +0.20 | C>=2、爆発後の落下攻撃 |

### B-11. 北斗 (Beidou)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c6 | ElementalResReduction(Electro) | -0.15 | C>=6、爆発中 |

### B-12. クレー (Klee)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c2 | DefReduction | -0.23 | C>=2、地雷命中時 |
| c6 | ElementalDmgBonus(Pyro) | +0.10 | C>=6、爆発後25秒 |

### B-13. 辛炎 (Xinyan)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c4 | PhysicalResReduction | -0.15 | C>=4、スキル命中時 |

### B-14. 宵宮 (Yoimiya)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| burst | AtkPercent | talent_level依存（Lv10: ~0.17） | 琉金の雫発動時、自身を除くチーム |

### B-15. アルベド (Albedo)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| a4 | ElementalMastery | +125 | 爆発使用後10秒 |

### B-16. ミカ (Mika)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c6 | PhysicalDmgBonus | +0.10 | C>=6、爆発回復中 HP>50% |

### B-17. コレイ (Collei)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c4 | ElementalMastery | +60 | C>=4、爆発エリア内 |

### B-18. イアンサ (Iansan)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| burst | NormalAtkDmgBonus | talent_level依存 | チームに通常攻撃DMGボーナス |
| a4 | AtkFlat | HP基準 | チームにATK付与 |

### B-19. ヴェンティ (Venti)

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c2 | ElementalResReduction(Anemo) | -0.12 | C>=2、スキル命中時 |
| c2 | PhysicalResReduction | -0.12 | C>=2 |
| c6 | ElementalResReduction(swirled) | -0.20 | C>=6、拡散した元素 |

### B-20. シュヴルーズ (Chevreuse) — 部分的に実装済み

現在 ATK% + Pyro/Electro RES Reduction は実装済み。ただし：

| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c6 | ElementalDmgBonus(Pyro) | +0.20 | C>=6、過負荷トリガー後 |
| c6 | ElementalDmgBonus(Electro) | +0.20 | C>=6 |

### B-21. 甘雨 (Ganyu) — A4 は実装済み

追加:
| Source | Stat | 計算式 | 条件 |
|--------|------|--------|------|
| c4 | DmgBonus | 最大 +0.25（3秒ごとに+0.05） | C>=4、爆発エリア内。**最大値 0.25 を採用** |

---

## C. 設計検討が必要なケース

### C-1. 雷電将軍 Skill の BurstDmgBonus

バフの値が「対象キャラの元素爆発コスト」に依存する。

```
burst_dmg_bonus = skill_multiplier × target_burst_cost
```

**案1**: `get_character_team_buffs` に追加引数 `target_burst_cost: u32` を追加
**案2**: `value` に「コスト1あたりの係数」を返し、フロント側で乗算
**案3**: `resolve_team_stats` 側で処理（TeamMember に burst_cost を追加）

### C-2. シロネンのパーティ元素依存

サンプリングする元素がパーティ構成に依存する。`get_character_team_buffs` 単体では判定不能。

**案1**: 追加引数 `party_elements: Vec<String>` を渡す
**案2**: `resolve_team_stats` 側で処理（TeamMember の element 情報から判定）

### C-3. Venti C6 / Sucrose C6 の拡散元素依存

拡散した元素に応じた RES/DMG ボーナスが変わる。

**案1**: 追加引数 `swirl_element: Option<String>` を渡す
**案2**: フロント側の selectedReaction から推定

---

## D. ランタイム依存バフの最大値ポリシー

以下のバフは最大値を固定値として返す:

| キャラ | バフ | 最大値 |
|--------|------|--------|
| Furina burst | DmgBonus | talent_level依存の最大ファンファーレ時の値 |
| Yelan A4 | DmgBonus | 0.50 |
| Mavuika A4 | AtkPercent | 0.60 |
| Eula skill | Cryo/Phys ResReduction | -0.50（2スタック） |
| Ganyu C4 | DmgBonus | 0.25（5スタック） |

---

## E. チームバフがないことを確認済みのキャラ

以下のキャラはチームバフ/デバフを持たない（空配列が正しい）:

Amber, Noelle, Keqing, Kaeya, Chongyun, Fischl, Diluc, Hu Tao, Razor (C<4),
Gaming, Kaveh, Yanfei, Tighnari, Freminet, Arlecchino, Layla, Dehya, Sethos,
Clorinde, Sigewinne, Kirara, Kachina, Mualani, Qiqi, Kinich, Charlotte,
Baizhu, Sayu, Chiori, Dori, Lynette
