# Phase 1 改善: WASM側 修正TODO

> Date: 2026-03-31
> Scope: `@kotenbu/genshin-calc` (genshin-calc リポジトリ)
> Context: smart-paimon Web UI の Phase 1 ギャップ分析に基づく

## 方針

- 計算ロジックはなるべくWASM側に寄せる。UI側は表示に専念する
- 各項目でAPI設計（新規関数 or 既存関数の戻り値拡張）を含む
- 対応順序: A → D → C

---

## A. ステータス計算をWASM側に移管

### 背景

現在 UI 側の `buildStats()` (`src/lib/stats.ts`) で `CharacterBuild` から最終 `Stats` を組み立てている。以下のバグが存在する:

1. **武器サブステのDMG%未反映**: 武器の `sub_stat` が `pyro_dmg_bonus` 等の元素DMG%系の場合、`Stats.dmg_bonus` に加算されていない
2. **物理ダメージボーナス未反映**: 武器サブステまたは突破ステが `physical_dmg_bonus` の場合、`dmg_bonus` に加算されていない

### TODO

- [ ] ステータス計算関数のAPI設計
  - 新関数 `build_stats(build: CharacterBuild) -> Stats` を追加するか、`import_good()` の戻り値に計算済み `Stats` を含めるか
- [ ] 以下を正しく `Stats` に反映する計算ロジックの実装:
  - キャラ基礎ステータス (base_hp, base_atk, base_def)
  - 武器基礎攻撃力
  - 武器サブステ（全種類: ATK%, CRIT Rate, CRIT DMG, ER, EM, 元素DMG%, 物理DMG%, HP% 等）
  - 突破ステータス
  - 聖遺物ステータス合算 (StatProfile)
  - 基礎値の加算 (会心率 5%, 会心ダメ 50%, 元チャ 100%)
- [ ] 物理DMGと元素DMGの取り扱い方針の決定
  - `Stats.dmg_bonus` に統合するか、別フィールド (`physical_dmg_bonus`) を追加するか

---

## D. 聖遺物セット効果API

### 背景

現在 WASM は `ArtifactsBuild` に `four_piece_set` の ID/名前のみを返す。セット効果（2セット/4セット）の解決はUI側でハードコード (`REACTION_BONUS_MAP`) しており、対応範囲が限定的。

### TODO

- [ ] セット効果データの内部実装
  - 全聖遺物セットの2セット効果・4セット効果をデータとして保持
- [ ] セット効果を解決するAPIの設計
  - 対応が必要な効果の種類:
    - **ステータスバフ**: ATK+18%, HP+20% 等（2セット効果）
    - **ダメージバフ**: 通常攻撃+35% (剣闘士4セット), 通常攻撃+50% (しめ縄4セット) 等
    - **反応ボーナス**: 蒸発/溶解+15% (魔女4セット), 過負荷/超電導+40% (雷怒4セット) 等
    - **条件付きバフ**: スタック数依存、HP閾値、元素タイプ条件など
  - 検討事項:
    - `find_artifact_set(id)` の戻り値拡張 vs 新規関数
    - 条件付き効果のパラメータ化（スタック数、発動条件のon/off等）
    - A のステータス計算APIとの統合方法（セット効果をStats計算に含めるか、別途バフとして返すか）

---

## C. タレントデータに damage_type 追加

### 背景

`find_character()` が返すタレントデータの `normal_attack.hits` 配列に、各スケーリング項目の `damage_type` フィールドがない。UI側では全て `"Normal"` として `calculate_damage()` に渡しており、重撃・落下攻撃のダメージ計算が不正確。

### TODO

- [ ] `normal_attack.hits` の各スケーリング項目に `damage_type` フィールドを追加
  - 型: `"Normal" | "Charged" | "Plunging"`
  - 既存の `DamageType` 型と一致させる
- [ ] 全キャラの通常攻撃データを通常/重撃/落下に分類
- [ ] 型定義の更新 (`types.ts` にスケーリング項目のインターフェースを追加)

---

## 参考: UI側のみの対応 (WASM修正不要)

以下はWASMが既に必要なデータを提供済み。WASM修正後にUI側で対応する。

### B. 天賦レベル表示

`CharacterBuild.talent_levels: [number, number, number]` を `CharacterProfile` コンポーネントに表示。

### E. インポート警告改善

`ImportWarning { kind, message }` の表示を改善。キャラ一覧ページでの警告バナー等。

### UI側ステータス計算の置き換え

A のWASM API完成後、`src/lib/stats.ts` の `buildStats()` をWASM呼び出しに置き換える。

### 重撃/落下攻撃の分離表示

C のWASM修正後、`DamageTable.tsx` で `damage_type` を使って通常/重撃/落下を分離表示する。

### 聖遺物セット効果の反映

D のWASM API完成後、`damage.ts` の `REACTION_BONUS_MAP` ハードコードをWASM呼び出しに置き換える。
