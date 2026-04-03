# genshin-calc-wasm 0.2.4 移行 + キャラクターステータス画面

**Date:** 2026-04-04  
**Status:** Approved

## 概要

`@kotenbu/genshin-calc` から `@kotenbu135/genshin-calc-wasm` v0.2.4 へ移行し、キャラクターステータス画面のステータス計算をすべて WASM に委譲する。合わせて、StatsPanel に元素別 DMG ボーナス（非ゼロのみ）を表示する。

## 背景・動機

- パッケージ名が変更になった（`@kotenbu/genshin-calc` → `@kotenbu135/genshin-calc-wasm`）
- v0.2.4 では `build_stats_from_good` が元素別 DMG ボーナスフィールドを返すようになった
- 現状の `src/lib/stats.ts` は手動でステータスを計算しており、WASM の計算結果と乖離する可能性がある
- 旧パッケージの `types.ts` は新パッケージに同梱されないため、型定義をローカルに定義する必要がある

## 変更後のアーキテクチャ

```
GOODインポート
  └── good.ts (import_good WASM)
        └── rawJson を store に保存

CharacterDetailPage
  └── build_stats_from_good(rawJson, characterId)  ← WASM計算
        └── ExtendedStats（元素別 DMG ボーナス付き）
              └── StatsPanel（非ゼロ元素行を追加表示）
```

## 型定義

### `ExtendedStats`（新規）

```ts
interface ExtendedStats {
  hp: number;
  atk: number;
  def: number;
  elemental_mastery: number;
  crit_rate: number;
  crit_dmg: number;
  energy_recharge: number;
  dmg_bonus: number;
  // 元素別（v0.2.4 新規フィールド）
  pyro_dmg_bonus: number;
  hydro_dmg_bonus: number;
  electro_dmg_bonus: number;
  cryo_dmg_bonus: number;
  dendro_dmg_bonus: number;
  anemo_dmg_bonus: number;
  geo_dmg_bonus: number;
  physical_dmg_bonus: number;
}
```

### 型の後方互換

`Stats` は `ExtendedStats` の strict alias（同一型）として定義する。既存の `DamageInput` 等で `stats: Stats` を要求している箇所は `ExtendedStats` をそのまま渡せる。元素別ボーナスフィールドは `Stats` にも含まれる（余分なフィールドがあっても構造的型付けで互換）。

`Stats` を `keyof` でイテレートしているコードは存在しないため、フィールド追加による破壊的変更は発生しない。

## ファイル別変更仕様

### `src/types/wasm.ts`（新規作成）

旧パッケージの `types.ts` の内容を移植し、`Stats` を `ExtendedStats` に拡張して定義する。  
既存コードとの互換性のため `Stats` 型も `ExtendedStats` の alias として export する。

含む型: `ExtendedStats`, `Stats`, `Element`, `ScalingStat`, `DamageType`, `WeaponType`, `Reaction`, `BuffTarget`, `BuffableStat`, `Enemy`, `DamageInput`, `DamageResult`, `TransformativeInput`, `TransformativeResult`, `LunarInput`, `LunarResult`, `TeamMember`, `StatProfile`, `ResolvedBuff`, `GoodImport`, `CharacterBuild`, `WeaponBuild`, `ArtifactsBuild`, `ImportWarning`, `CharacterData`, `WeaponData`, `ArtifactSetData`

### `src/wasm.ts`

```ts
// 変更前
import wasmInit, { init } from "@kotenbu/genshin-calc";
// 変更後
import wasmInit, { init } from "@kotenbu135/genshin-calc-wasm";
```

### `src/lib/stats.ts`

手動計算を削除し、WASM の `build_stats_from_good` のラッパーに置き換える。

`rawJson` は `GoodStore` に `string` 型で保存されている（`import_good` に渡した JSON 文字列をそのまま保存）。

エラーハンドリング: `build_stats_from_good` が throw した場合（WASM 未初期化、不正 JSON 等）は `null` を返す。呼び出し元は `null` を「ステータス取得不可」として扱い、`<Navigate to="/characters" replace />` でリダイレクトする（既存の挙動を維持）。

```ts
import { build_stats_from_good } from "@kotenbu135/genshin-calc-wasm";
import type { ExtendedStats } from "../types/wasm";

export function buildStats(rawJson: string, characterId: string): ExtendedStats | null {
  try {
    return build_stats_from_good(rawJson, characterId) as ExtendedStats | null;
  } catch {
    return null;
  }
}
```

### `src/stores/good.ts`

```ts
// import パスを更新
import { import_good } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ImportWarning } from "../types/wasm";
```

### `src/stores/calc.ts`

```ts
// import パスを更新
import type { Enemy, Reaction } from "../types/wasm";
```

### `src/lib/damage.ts`

```ts
// import パスを更新
import { calculate_damage, calculate_transformative, calculate_lunar, find_character } from "@kotenbu135/genshin-calc-wasm";
import type { Stats, Enemy, DamageInput, Reaction, DamageType, ArtifactSetData } from "../types/wasm";
```

### `src/components/detail/CharacterProfile.tsx`

```ts
// import パスを更新
import type { CharacterBuild } from "../../types/wasm";
```

### `src/components/detail/StatsPanel.tsx`

基本8行の後、`ExtendedStats` の元素別フィールドを走査して 0 より大きい値の行を追加表示する。  
各元素行には色付きドットを付ける。

**元素カラーマッピング:**

| 元素 | フィールド | カラー |
|------|------|------|
| 炎 | `pyro_dmg_bonus` | `#EF7938` |
| 水 | `hydro_dmg_bonus` | `#4CC2F1` |
| 雷 | `electro_dmg_bonus` | `#B57EDC` |
| 氷 | `cryo_dmg_bonus` | `#9FD6E3` |
| 草 | `dendro_dmg_bonus` | `#A5C83B` |
| 風 | `anemo_dmg_bonus` | `#74C2A8` |
| 岩 | `geo_dmg_bonus` | `#F0B232` |
| 物理 | `physical_dmg_bonus` | `#aabbcc` |

**表示ロジック:**
```ts
const elementBonuses = [
  { key: "pyro_dmg_bonus", label: t("element.pyro"), color: "#EF7938" },
  // ...
].filter(({ key }) => (stats as ExtendedStats)[key] > 0);
```

### `src/pages/CharacterDetailPage.tsx`

`buildStats` の呼び出しを `rawJson` + `characterId` ベースに変更する。

`build` は `useGoodStore` の `getBuild(id)` で取得した `CharacterBuild | undefined`。`rawJson` は同ストアの `string | null`。どちらかが falsy の場合は `null` を返し、既存の `<Navigate to="/characters" replace />` が発動する。

```ts
const rawJson = useGoodStore((s) => s.rawJson);
const build = id ? getBuild(id) : undefined;
const stats = useMemo(
  () => (build && rawJson && id ? buildStats(rawJson, id) : null),
  [build, rawJson, id]
);
// null の場合は既存通り <Navigate to="/characters" replace />
```

## 非対応事項

- 条件付きバフ（`build_stats` の `weapon_activations` / `artifact_activations`）は今回のスコープ外
- チーム編成バフ（`resolve_team_stats`）は今回のスコープ外

## 受け入れ基準

- [ ] `package.json` から `@kotenbu/genshin-calc` が削除され、`@kotenbu135/genshin-calc-wasm` が依存に含まれる
- [ ] ビルドエラーなし（`tsc -b && vite build`）
- [ ] 旧パッケージ（`@kotenbu/genshin-calc`）への import 参照がコードベースに残っていない
- [ ] GOOD インポート後、キャラ詳細画面でステータスが表示される
- [ ] 炎ゴブレット装備キャラで炎 DMG ボーナス行が表示される
- [ ] ゼロの元素ボーナス行は表示されない
- [ ] GOOD 未インポート状態でキャラ詳細URLに直接アクセスした場合、キャラ一覧へリダイレクトされる
