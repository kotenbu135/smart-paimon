# smart-paimon — build_stats_from_good 置き換え設計

**Date:** 2026-04-01
**Status:** Approved

## Goal

`@kotenbu/genshin-calc@0.2.2` の `build_stats_from_good(json, character_id)` を使って、キャラクター単体の最終ステータスをWASM側で構築し、詳細画面に表示する。

今回の変更では、TypeScript側の `buildStats()` 手計算ロジックを廃止し、GOOD取り込み時の元JSONと `CharacterBuild.character.id` を入力としてWASMへ委譲する。

## Scope

- `GoodStore` にGOOD元JSON文字列を保持する
- キャラクター詳細画面で `build_stats_from_good()` を呼ぶ
- `StatsPanel` に元素別DMGボーナス表示を追加する
- 既存の `buildStats()` 利用箇所を削除する
- 配線テストを追加または更新する

今回のスコープ外:

- `build_stats()` の activation 対応
- チームバフ込みの `resolve_team_stats()` 連携
- ダメージ計算ロジック全体の再設計
- GOOD importer UI の体験変更

## Current State

現在の詳細画面は `CharacterBuild` を受け取り、TypeScript側の `buildStats(build)` で以下を手計算している。

- キャラ基礎HP/ATK/DEF
- 武器基礎ATKと副ステ
- 聖遺物集計済み `artifacts.stats`
- キャラ突破ステータス

この方式は `@kotenbu/genshin-calc` 側と同じ責務をアプリ側でも再実装しており、将来的な仕様差分や計算ズレの温床になる。

`@kotenbu/genshin-calc@0.2.2` には `build_stats_from_good(json, character_id)` があり、GOOD JSONから単体キャラの最終ステータスを直接構築できる。戻り値には通常の `Stats` に加え、`pyro_dmg_bonus` などの元素別DMGボーナスが含まれる。

## Proposed Design

## Data Ownership

`GoodStore` は `builds`, `warnings`, `error` に加えて `rawJson: string | null` を保持する。

- `importGood(json)` 成功時: `rawJson` に入力JSONを保存する
- `importGood(json)` 失敗時: `rawJson` は `null` に戻す
- `clear()` 実行時: `rawJson` もクリアする

これにより、詳細画面は `CharacterBuild` と同時に、WASM再計算に必要な元データへアクセスできる。

## Detail Page Flow

[`src/pages/CharacterDetailPage.tsx`](/home/sakis/work/smart-paimon/src/pages/CharacterDetailPage.tsx) では以下の条件で表示用ステータスを構築する。

1. `id` から `build` を取得する
2. `GoodStore.rawJson` を取得する
3. `build` と `rawJson` が揃っている場合のみ `build_stats_from_good(rawJson, build.character.id)` を呼ぶ
4. WASM戻り値から:
   - ダメージ計算向けの基本 `Stats`
   - 表示向けの元素別DMGボーナス群
   を分離して扱う

再計算は `useMemo` に閉じ込め、依存は `rawJson` と `build.character.id` に限定する。単体ページで十分軽量なため、追加ストアや永続キャッシュは持たない。

## Display Model

表示用にはローカルの拡張型を定義する。

```ts
type ElementalBonusKey =
  | "pyro_dmg_bonus"
  | "hydro_dmg_bonus"
  | "electro_dmg_bonus"
  | "cryo_dmg_bonus"
  | "anemo_dmg_bonus"
  | "geo_dmg_bonus"
  | "dendro_dmg_bonus"
  | "physical_dmg_bonus";

type DisplayStats = Stats & Partial<Record<ElementalBonusKey, number>>;
```

この型はUI表示専用とし、既存のダメージ計算関数には従来どおり基本 `Stats` だけを渡す。そうすることで `src/lib/damage.ts` や関連コンポーネントの変更範囲を抑える。

## Stats Panel Changes

[`src/components/detail/StatsPanel.tsx`](/home/sakis/work/smart-paimon/src/components/detail/StatsPanel.tsx) は基本8項目の表示を維持しつつ、追加で元素別DMGボーナス行を出す。

表示ルール:

- `dmg_bonus` は従来どおり表示する
- 元素別DMGボーナスは値が `0` より大きい項目を表示する
- キャラクター自身の元素に対応するボーナス行は強調表示する
- 物理DMGボーナスも値があれば表示する

これにより、たとえば炎杯やセット効果を持つキャラでは `Pyro DMG Bonus` が明示的に見える。

## Error Handling

`build_stats_from_good()` が `null` を返す、または例外を投げる場合は詳細画面でエラー状態を出す。

- プロフィールカードは既存 `build` から表示できるため維持する
- `StatsPanel` と `DamageTable` は非表示または失敗メッセージに切り替える
- メッセージは「GOODデータからステータスを構築できませんでした」と分かる内容にする

エラーはページローカルに閉じ、グローバルストアへ新しい状態は追加しない。

## File Changes

- 更新: [`src/stores/good.ts`](/home/sakis/work/smart-paimon/src/stores/good.ts)
- 更新: [`src/pages/CharacterDetailPage.tsx`](/home/sakis/work/smart-paimon/src/pages/CharacterDetailPage.tsx)
- 更新: [`src/components/detail/StatsPanel.tsx`](/home/sakis/work/smart-paimon/src/components/detail/StatsPanel.tsx)
- 削除候補: [`src/lib/stats.ts`](/home/sakis/work/smart-paimon/src/lib/stats.ts)
- 更新または削除: [`tests/lib/stats.test.ts`](/home/sakis/work/smart-paimon/tests/lib/stats.test.ts)
- 追加または更新: GOOD store / detail page / stats panel のテスト

## Testing Strategy

今回のテストは「WASM APIを正しく配線しているか」に限定する。

1. `GoodStore` が `rawJson` を保存し、`clear()` で消すこと
2. 詳細画面が `build_stats_from_good(rawJson, characterId)` を正しい引数で呼ぶこと
3. `StatsPanel` が元素別DMGボーナス行を表示できること
4. `build_stats_from_good()` 失敗時に詳細画面がエラー状態へ落ちること

`build_stats_from_good()` 自体の計算正しさはライブラリ側の責務として再検証しない。

## Trade-offs

### Pros

- 計算ロジックの重複を削除できる
- `genshin-calc` 側の仕様更新に追従しやすい
- 元素別DMGボーナスをそのまま表示できる
- 単体キャラ表示の責務が明確になる

### Cons

- ステータス表示が `rawJson` 保持に依存する
- 詳細画面でWASM呼び出しが1回増える
- 戻り値型が `Stats` より広いため、UI側で軽い整形が必要になる

## Decision

今回は `build_stats()` ではなく `build_stats_from_good()` のみを使う。条件付きバフやスタックUIが必要になった時点で、別仕様として `build_stats()` への移行を検討する。

## Acceptance Criteria

- 詳細画面でTS側 `buildStats()` を使っていない
- ステータスは `build_stats_from_good()` の結果から構築される
- 元素別DMGボーナスが画面に表示される
- GOOD JSON未保持またはWASM失敗時に壊れた表示にならない
- 関連テストが通る
