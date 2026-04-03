# genshin-calc-wasm 0.2.4 移行 + キャラクターステータス画面 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@kotenbu/genshin-calc` を `@kotenbu135/genshin-calc-wasm` v0.2.4 に移行し、ステータス計算を WASM に完全委譲、StatsPanel に元素別 DMG ボーナス（非ゼロのみ）を表示する。

**Architecture:** ローカル型定義ファイル `src/types/wasm.ts` を新規作成し、全インポートを新パッケージに一括更新する。`src/lib/stats.ts` の手動計算を `build_stats_from_good` 呼び出しに置き換え、`CharacterDetailPage` が `rawJson` ベースでステータスを取得する。

**Tech Stack:** Vite + React 19 + TypeScript, `@kotenbu135/genshin-calc-wasm` 0.2.4, Zustand, Tailwind CSS v4, Vitest

---

## ファイルマップ

| ファイル | 操作 | 内容 |
|------|------|------|
| `src/types/wasm.ts` | **新規作成** | `ExtendedStats`, `Stats`, `CharacterBuild` 等すべての型 |
| `src/wasm.ts` | 修正 | import パス更新 |
| `src/lib/stats.ts` | 修正 | 手動計算 → `build_stats_from_good` ラッパー |
| `src/lib/damage.ts` | 修正 | import パス更新 |
| `src/stores/good.ts` | 修正 | import パス更新 |
| `src/stores/calc.ts` | 修正 | import パス更新 |
| `src/components/detail/CharacterProfile.tsx` | 修正 | import パス更新 |
| `src/components/detail/StatsPanel.tsx` | 修正 | 元素別 DMG ボーナス行を追加 |
| `src/pages/CharacterDetailPage.tsx` | 修正 | `rawJson` + `buildStats` を使用 |
| `package.json` | 確認 | `@kotenbu135/genshin-calc-wasm` が依存に含まれること（既存） |

---

## Task 1: ローカル型定義ファイルを作成する

**Files:**
- Create: `src/types/wasm.ts`

旧パッケージの `types.ts` の内容を `ExtendedStats`（元素別フィールド付き）に拡張して定義する。`Stats` は `ExtendedStats` の alias として export する。

- [ ] **Step 1: `src/types/wasm.ts` を作成する**

```typescript
// src/types/wasm.ts
// genshin-calc-wasm TypeScript type definitions (local)
// Migrated from @kotenbu/genshin-calc/types.ts and extended for v0.2.4

export interface ExtendedStats {
  hp: number;
  atk: number;
  def: number;
  elemental_mastery: number;
  crit_rate: number;
  crit_dmg: number;
  energy_recharge: number;
  dmg_bonus: number;
  // per-element DMG bonus fields (new in v0.2.4)
  pyro_dmg_bonus: number;
  hydro_dmg_bonus: number;
  electro_dmg_bonus: number;
  cryo_dmg_bonus: number;
  dendro_dmg_bonus: number;
  anemo_dmg_bonus: number;
  geo_dmg_bonus: number;
  physical_dmg_bonus: number;
}

// Stats is an alias for ExtendedStats for backward compatibility
export type Stats = ExtendedStats;

export type Element = "Pyro" | "Hydro" | "Electro" | "Cryo" | "Anemo" | "Geo" | "Dendro";
export type ScalingStat = "Atk" | "Hp" | "Def" | "Em";
export type DamageType = "Normal" | "Charged" | "Plunging" | "Skill" | "Burst";
export type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";

export type Reaction =
  | "Vaporize" | "Melt"
  | "Aggravate" | "Spread"
  | "Overloaded" | "Superconduct" | "ElectroCharged" | "Shattered"
  | { Swirl: Element }
  | "Bloom" | "Hyperbloom" | "Burgeon" | "Burning"
  | "LunarElectroCharged" | "LunarBloom" | "LunarCrystallize" | "LunarCrystallizeSecondary";

export type BuffTarget = "OnlySelf" | "Team" | "TeamExcludeSelf";

type ElementalDmgBonusStat = { ElementalDmgBonus: Element };
type ElementalResStat = { ElementalRes: Element };
type ElementalResReductionStat = { ElementalResReduction: Element };

export type BuffableStat =
  | "HpPercent" | "AtkPercent" | "DefPercent"
  | "HpFlat" | "AtkFlat" | "DefFlat"
  | "CritRate" | "CritDmg"
  | "ElementalMastery" | "EnergyRecharge"
  | "DmgBonus"
  | ElementalDmgBonusStat
  | "PhysicalDmgBonus"
  | "NormalAtkDmgBonus" | "ChargedAtkDmgBonus" | "PlungingAtkDmgBonus"
  | "SkillDmgBonus" | "BurstDmgBonus"
  | "HealingBonus" | "ShieldStrength"
  | "AmplifyingBonus" | "TransformativeBonus" | "AdditiveBonus"
  | ElementalResStat
  | ElementalResReductionStat
  | "PhysicalResReduction"
  | "DefReduction"
  | "NormalAtkFlatDmg" | "ChargedAtkFlatDmg" | "PlungingAtkFlatDmg"
  | "SkillFlatDmg" | "BurstFlatDmg"
  | "DefPercentRaw";

export interface Enemy {
  level: number;
  resistance: number;
  def_reduction: number;
}

export interface DamageInput {
  character_level: number;
  stats: Stats;
  talent_multiplier: number;
  scaling_stat: ScalingStat;
  damage_type: DamageType;
  element: Element | null;
  reaction: Reaction | null;
  reaction_bonus: number;
  flat_dmg: number;
}

export interface DamageResult {
  non_crit: number;
  crit: number;
  average: number;
  reaction: Reaction | null;
}

export interface TransformativeInput {
  character_level: number;
  elemental_mastery: number;
  reaction: Reaction;
  reaction_bonus: number;
}

export interface TransformativeResult {
  damage: number;
  damage_element: Element | null;
}

export interface LunarInput {
  character_level: number;
  elemental_mastery: number;
  reaction: Reaction;
  reaction_bonus: number;
  crit_rate: number;
  crit_dmg: number;
  base_dmg_bonus: number;
}

export interface LunarResult {
  non_crit: number;
  crit: number;
  average: number;
  damage_element: Element | null;
}

export interface StatProfile {
  base_hp: number;
  base_atk: number;
  base_def: number;
  hp_percent: number;
  atk_percent: number;
  def_percent: number;
  hp_flat: number;
  atk_flat: number;
  def_flat: number;
  elemental_mastery: number;
  crit_rate: number;
  crit_dmg: number;
  energy_recharge: number;
  dmg_bonus: number;
}

export interface ResolvedBuff {
  source: string;
  stat: BuffableStat;
  value: number;
  target: BuffTarget;
}

export interface TeamMember {
  element: Element;
  weapon_type: WeaponType;
  stats: StatProfile;
  buffs_provided: ResolvedBuff[];
  is_moonsign: boolean;
}

export interface GoodImport {
  source: string;
  version: number;
  builds: CharacterBuild[];
  warnings: ImportWarning[];
}

export interface CharacterBuild {
  character: CharacterData;
  level: number;
  ascension: number;
  constellation: number;
  talent_levels: [number, number, number];
  weapon: WeaponBuild | null;
  artifacts: ArtifactsBuild;
}

export interface WeaponBuild {
  weapon: WeaponData;
  level: number;
  refinement: number;
}

export interface ArtifactsBuild {
  sets: ArtifactSetData[];
  four_piece_set: ArtifactSetData | null;
  stats: StatProfile;
}

export interface ImportWarning {
  kind: string;
  message: string;
}

export interface CharacterData {
  id: string;
  name: string;
  element: Element;
  weapon_type: WeaponType;
  rarity: number;
  base_hp: number;
  base_atk: number;
  base_def: number;
  ascension_stat: string;
  ascension_stat_value: number;
}

export interface WeaponData {
  id: string;
  name: string;
  weapon_type: WeaponType;
  rarity: number;
  base_atk: number;
  sub_stat: string | null;
  sub_stat_value: number;
}

export interface ArtifactSetData {
  id: string;
  name: string;
}
```

- [ ] **Step 2: ビルドが通ることを確認する（型ファイル単体）**

```bash
cd /home/sakis/work/smart-paimon
npx tsc --noEmit src/types/wasm.ts 2>&1 | head -20
```

Expected: エラーなし（または `Cannot find module` 系のみ — 他ファイルとの依存がないため）

- [ ] **Step 3: コミット**

```bash
git add src/types/wasm.ts
git commit -m "feat: add local wasm type definitions with ExtendedStats"
```

---

## Task 2: WASM 初期化ファイルのインポートを更新する

**Files:**
- Modify: `src/wasm.ts`

- [ ] **Step 1: `src/wasm.ts` のインポートを更新する**

```typescript
// src/wasm.ts
import wasmInit, { init } from "@kotenbu135/genshin-calc-wasm";
import { useUIStore } from "./stores/ui";

export async function initWasm(): Promise<void> {
  try {
    await wasmInit();
    init();
    useUIStore.getState().setWasmReady(true);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown WASM error";
    useUIStore.getState().setWasmError(message);
  }
}
```

- [ ] **Step 2: コミット**

```bash
git add src/wasm.ts
git commit -m "chore: update wasm.ts import to @kotenbu135/genshin-calc-wasm"
```

---

## Task 3: ストアとライブラリのインポートを一括更新する

**Files:**
- Modify: `src/stores/good.ts`
- Modify: `src/stores/calc.ts`
- Modify: `src/lib/damage.ts`
- Modify: `src/components/detail/CharacterProfile.tsx`

各ファイルで `@kotenbu/genshin-calc` → `@kotenbu135/genshin-calc-wasm`、`@kotenbu/genshin-calc/types` → `../types/wasm` または `../../types/wasm` に変更する。

- [ ] **Step 1: `src/stores/good.ts` を更新する**

変更箇所（1行目と2行目）:

```typescript
import { import_good } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ImportWarning } from "../types/wasm";
```

残りのコードは変更なし。

- [ ] **Step 2: `src/stores/calc.ts` を更新する**

変更箇所（2行目）:

```typescript
import type { Enemy, Reaction } from "../types/wasm";
```

残りのコードは変更なし。

- [ ] **Step 3: `src/lib/damage.ts` を更新する**

変更箇所（1行目と2行目）:

```typescript
import { calculate_damage, calculate_transformative, calculate_lunar, find_character } from "@kotenbu135/genshin-calc-wasm";
import type { Stats, Enemy, DamageInput, Reaction, DamageType, ArtifactSetData } from "../types/wasm";
```

残りのコードは変更なし。

- [ ] **Step 4: `src/components/detail/CharacterProfile.tsx` を更新する**

変更箇所（2行目）:

```typescript
import type { CharacterBuild } from "../../types/wasm";
```

残りのコードは変更なし。

- [ ] **Step 5: 旧インポートが残っていないことを確認する**

```bash
grep -r "@kotenbu/genshin-calc" /home/sakis/work/smart-paimon/src/
```

Expected: 出力なし（マッチなし）

- [ ] **Step 6: コミット**

```bash
git add src/stores/good.ts src/stores/calc.ts src/lib/damage.ts src/components/detail/CharacterProfile.tsx
git commit -m "chore: update all imports to @kotenbu135/genshin-calc-wasm and local types"
```

---

## Task 4: `stats.ts` の計算ロジックを WASM に委譲する

**Files:**
- Modify: `src/lib/stats.ts`

手動計算を削除し、`build_stats_from_good` のラッパーに置き換える。

- [ ] **Step 1: `src/lib/stats.ts` を書き換える**

```typescript
// src/lib/stats.ts
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

- [ ] **Step 2: コミット**

```bash
git add src/lib/stats.ts
git commit -m "feat: replace manual stats calculation with WASM build_stats_from_good"
```

---

## Task 5: `CharacterDetailPage` を `rawJson` ベースに更新する

**Files:**
- Modify: `src/pages/CharacterDetailPage.tsx`

`buildStats` の呼び出しシグネチャが変わったため、`rawJson` を store から取得し渡す。

- [ ] **Step 1: `src/pages/CharacterDetailPage.tsx` の変更箇所のみ更新する**

以下の差分を適用する（他の行は変更しない）:

```diff
-import { useGoodStore } from "../stores/good";
+import { useGoodStore } from "../stores/good";  // rawJson も取得
```

`useGoodStore` の呼び出し行を変更（`getBuild` の直下に追加）:

```typescript
  const getBuild = useGoodStore((s) => s.getBuild);
  const rawJson = useGoodStore((s) => s.rawJson);   // ← 追加
```

`useMemo` の中身を変更:

```typescript
  // 変更前
  const stats = useMemo(() => (build ? buildStats(build) : null), [build]);

  // 変更後
  const stats = useMemo(
    () => (build && rawJson && id ? buildStats(rawJson, id) : null),
    [build, rawJson, id]
  );
```

`buildStats` の引数が変わる（`build` → `rawJson, id`）のでこの2箇所のみ変更。JSX 部分は一切変更しない。
```

- [ ] **Step 2: ビルドを確認する**

```bash
cd /home/sakis/work/smart-paimon && npx tsc -b 2>&1
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/pages/CharacterDetailPage.tsx
git commit -m "feat: use rawJson + build_stats_from_good in CharacterDetailPage"
```

---

## Task 6: `StatsPanel` に元素別 DMG ボーナスを追加する

**Files:**
- Modify: `src/components/detail/StatsPanel.tsx`

非ゼロの元素別 DMG ボーナスフィールドをセクション区切りで追加表示する。

- [ ] **Step 1: `src/components/detail/StatsPanel.tsx` を更新する**

```typescript
// src/components/detail/StatsPanel.tsx
import { useTranslation } from "react-i18next";
import type { ExtendedStats } from "../../types/wasm";

interface StatsPanelProps {
  readonly stats: Readonly<ExtendedStats>;
  readonly elementDmgLabel?: string;
}

const fmt = (v: number, pct: boolean) =>
  pct ? `${(v * 100).toFixed(1)}%` : Math.round(v).toLocaleString();

const ELEMENT_BONUSES: Array<{
  key: keyof ExtendedStats;
  labelKey: string;
  color: string;
}> = [
  { key: "pyro_dmg_bonus",     labelKey: "element.pyro",     color: "#EF7938" },
  { key: "hydro_dmg_bonus",    labelKey: "element.hydro",    color: "#4CC2F1" },
  { key: "electro_dmg_bonus",  labelKey: "element.electro",  color: "#B57EDC" },
  { key: "cryo_dmg_bonus",     labelKey: "element.cryo",     color: "#9FD6E3" },
  { key: "dendro_dmg_bonus",   labelKey: "element.dendro",   color: "#A5C83B" },
  { key: "anemo_dmg_bonus",    labelKey: "element.anemo",    color: "#74C2A8" },
  { key: "geo_dmg_bonus",      labelKey: "element.geo",      color: "#F0B232" },
  { key: "physical_dmg_bonus", labelKey: "element.physical", color: "#aabbcc" },
];

export function StatsPanel({ stats, elementDmgLabel }: StatsPanelProps) {
  const { t } = useTranslation();

  const baseRows = [
    { label: t("stats.hp"),       value: stats.hp,               pct: false },
    { label: t("stats.atk"),      value: stats.atk,              pct: false },
    { label: t("stats.def"),      value: stats.def,              pct: false },
    { label: t("stats.em"),       value: stats.elemental_mastery, pct: false },
    { label: t("stats.critRate"), value: stats.crit_rate,        pct: true  },
    { label: t("stats.critDmg"),  value: stats.crit_dmg,         pct: true  },
    { label: t("stats.er"),       value: stats.energy_recharge,  pct: true  },
    { label: elementDmgLabel ?? t("stats.dmgBonus"), value: stats.dmg_bonus, pct: true, highlight: true },
  ];

  const activeElementBonuses = ELEMENT_BONUSES.filter(
    ({ key }) => (stats[key] as number) > 0
  );

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg overflow-hidden">
      <div className="bg-navy-hover/50 px-4 py-2 border-b border-navy-border">
        <span className="text-[11px] font-label font-bold tracking-widest text-text-secondary uppercase">
          {t("detail.stats")}
        </span>
      </div>
      <div className="p-2">
        {baseRows.map(({ label, value, pct, highlight }) => (
          <div
            key={label}
            className="flex justify-between items-center h-9 px-3 border-b border-navy-border/50 last:border-0"
          >
            <span className="text-[13px] text-text-secondary">{label}</span>
            <span className={`text-[14px] font-mono ${highlight ? "text-pyro" : "text-text-primary"}`}>
              {fmt(value, pct)}
            </span>
          </div>
        ))}

        {activeElementBonuses.length > 0 && (
          <>
            <div className="px-3 py-1 text-[10px] font-bold tracking-widest text-text-muted uppercase border-b border-navy-border/50">
              {t("stats.elementDmgBonus")}
            </div>
            {activeElementBonuses.map(({ key, labelKey, color }) => (
              <div
                key={key}
                className="flex justify-between items-center h-9 px-3 border-b border-navy-border/50 last:border-0"
              >
                <span className="text-[13px] text-text-secondary flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {t(labelKey)}
                </span>
                <span className="text-[14px] font-mono" style={{ color }}>
                  {fmt(stats[key] as number, true)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: i18n キーを追加する**

`src/i18n/index.ts` を開き、`stats` セクションに以下を追加する（ja と en 両方）:

```
"stats.elementDmgBonus": "元素ダメージボーナス"  // ja
"stats.elementDmgBonus": "Elemental DMG Bonus"   // en

"element.pyro":     "炎" / "Pyro"
"element.hydro":    "水" / "Hydro"
"element.electro":  "雷" / "Electro"
"element.cryo":     "氷" / "Cryo"
"element.dendro":   "草" / "Dendro"
"element.anemo":    "風" / "Anemo"
"element.geo":      "岩" / "Geo"
"element.physical": "物理" / "Physical"
```

（`i18n/index.ts` の実際の構造に合わせて記述すること）

- [ ] **Step 3: i18n の実際の構造を確認してキーを追加する**

```bash
cat /home/sakis/work/smart-paimon/src/i18n/index.ts
```

構造を確認して、`stats` および `element` セクションに適切にキーを追加する。

- [ ] **Step 4: ビルドを確認する**

```bash
cd /home/sakis/work/smart-paimon && npx tsc -b 2>&1
```

Expected: エラーなし

- [ ] **Step 5: コミット**

```bash
git add src/components/detail/StatsPanel.tsx src/i18n/index.ts
git commit -m "feat: show non-zero element DMG bonuses in StatsPanel"
```

---

## Task 7: 最終確認

- [ ] **Step 1: 旧パッケージを `package.json` から削除する**

```bash
cd /home/sakis/work/smart-paimon && npm uninstall @kotenbu/genshin-calc
```

Expected: `package.json` の `dependencies` から `@kotenbu/genshin-calc` が消える

- [ ] **Step 2: 旧パッケージへのソースコード参照がないことを確認する**

```bash
grep -r "@kotenbu/genshin-calc" /home/sakis/work/smart-paimon/src/
```

Expected: 出力なし

- [ ] **Step 3: `package.json` に旧パッケージが残っていないことを確認する**

```bash
grep "@kotenbu/genshin-calc" /home/sakis/work/smart-paimon/package.json
```

Expected: 出力なし

- [ ] **Step 4: フルビルドを確認する**

```bash
cd /home/sakis/work/smart-paimon && npx tsc -b && npx vite build 2>&1 | tail -20
```

Expected: `✓ built in` のようなメッセージ、エラーなし

- [ ] **Step 5: テストを実行する**

```bash
cd /home/sakis/work/smart-paimon && npm test 2>&1
```

Expected: 全テスト PASS（既存テストが壊れていないこと）

- [ ] **Step 6: 完了コミット（必要なら）**

未コミット変更があれば:

```bash
git add -A
git commit -m "chore: finalize wasm migration to @kotenbu135/genshin-calc-wasm"
```

---

## 受け入れ基準チェックリスト

- [ ] `package.json` に `@kotenbu135/genshin-calc-wasm` が依存として含まれる
- [ ] `tsc -b && vite build` がエラーなしで通る
- [ ] `src/` 配下に `@kotenbu/genshin-calc` へのインポートが残っていない
- [ ] GOOD インポート後、キャラ詳細画面でステータスが表示される
- [ ] 炎ゴブレット装備キャラで炎 DMG ボーナス行が表示される
- [ ] ゼロの元素ボーナス行は表示されない
- [ ] GOOD 未インポートでキャラ詳細 URL に直接アクセスした場合、キャラ一覧にリダイレクトされる
