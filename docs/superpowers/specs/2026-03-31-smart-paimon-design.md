# smart-paimon — Genshin Impact Damage Calculator Web UI

**Date:** 2026-03-31
**Status:** Approved

## Overview

A web-based damage calculator for Genshin Impact that uses `@kotenbu/genshin-calc` (WASM) as its calculation engine. Players import their data via GOOD (Genshin Open Object Description) JSON files exported from tools like Irminsul, Inventory Kamera, or Amenoma. The UI displays character stats, calculates talent-specific damage, supports team composition with buff resolution, and enables build comparison.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + custom CSS (Genshin-inspired theme) |
| State Management | Zustand |
| i18n | react-i18next (Japanese / English) |
| UI Components | Radix UI (headless, accessible) |
| Animation | Framer Motion |
| Calculation Engine | @kotenbu/genshin-calc@0.2.0 (WASM) |
| Routing | React Router v7 (HashRouter for GitHub Pages) |
| Deployment | GitHub Pages (GitHub Actions auto-deploy) |

## Data Flow

```
GOOD JSON file
  → Drag & drop / file picker
  → WASM import_good(json) → GoodImport { builds: CharacterBuild[], warnings }
  → Zustand GoodStore (builds array)
  → User interaction (select character, configure enemy, pick reaction)
  → WASM calculation (calculate_damage / resolve_team_stats)
  → Damage results displayed in UI
```

## GOOD Adapter (v0.2.0 — fully available)

`import_good(json: string)` is exported from `@kotenbu/genshin-calc@0.2.0`. Throws `JsError` on invalid JSON or unsupported format.

### Return types (from `types.ts`)

```
GoodImport
├── source: string                          // GOOD source identifier
├── version: number                         // GOOD format version
├── builds: CharacterBuild[]
│   ├── character: CharacterData            // { id, name, element, weapon_type, rarity, base_hp/atk/def, ascension_stat/value }
│   ├── level: number
│   ├── ascension: number
│   ├── constellation: number
│   ├── talent_levels: [number, number, number]  // [normal, skill, burst]
│   ├── weapon: WeaponBuild | null
│   │   ├── weapon: WeaponData              // { id, name, weapon_type, rarity, base_atk, sub_stat/value }
│   │   ├── level: number
│   │   └── refinement: number
│   └── artifacts: ArtifactsBuild
│       ├── stats: StatProfile              // 聖遺物ステータス算出済み（メイン+サブ全合算）
│       ├── sets: ArtifactSetData[]         // [{ id, name }, ...]
│       └── four_piece_set: ArtifactSetData | null
└── warnings: ImportWarning[]               // [{ kind, message }, ...]
```

### Key features
- ID変換: PascalCase (`"HuTao"`) → snake_case (`"hu_tao"`) 実装済み
- Stat変換: GOOD stat keys → StatProfile（percentage ÷100 → decimal）実装済み
- `character` フィールドに `CharacterData` が入るため、Web UIは別途 `find_character()` を呼ぶ必要がない
- `ImportWarning` で部分インポートをサポート（未知キャラ・武器はスキップしつつ `kind` + `message` で警告）

### CharacterData の注意点
`CharacterData` には天賦倍率テーブルは含まれない（`id`, `name`, `element`, `weapon_type`, `rarity`, `base_hp/atk/def`, `ascension_stat/value` のみ）。天賦倍率は `find_character(id)` で取得する `any` 型の戻り値から参照する。

## Pages & Routing

| Route | Page | Phase |
|-------|------|-------|
| `/` | Home — GOOD file import (drag & drop + file picker + sample data) | 1 |
| `/characters` | Character grid — filterable by element/weapon, sortable by level/rarity | 1 |
| `/characters/:id` | Character detail — stats + damage table (2-column + tab layout) | 1 |
| `/team` | Team composition — 4 slots, buff resolution, before/after comparison | 2 |
| `/compare` | Build comparison — side-by-side A vs B with diff highlighting | 3 |

## Character Detail Layout (2-Column + Tabs)

**Left column:**
- Character profile (icon, name, level, constellation)
- Equipped weapon (name, level, refinement)
- Artifact set summary (set name, slot overview)
- Final stats table (HP, ATK, DEF, EM, CR, CD, ER, Elemental DMG%)

**Right column (wide):**
- Header with enemy config (level, resistance) and reaction selector
- Tab bar: Normal Attack | Elemental Skill | Elemental Burst
- Damage table per tab: Talent name, Multiplier, Non-crit, Crit, Average
- When an amplifying reaction (Vaporize/Melt) is selected, the non-crit/crit/average columns show reaction-applied values
- Transformative reactions (Overloaded, Superconduct, Swirl, etc.) are shown as separate rows via `calculate_transformative`
- Lunar reactions (Nod-Krai) are shown via `calculate_lunar`

## Zustand Stores

### GoodStore
- `builds`: `CharacterBuild[]` — `import_good()` の結果。各ビルドに `character`（CharacterData）、`weapon`、`artifacts`（算出済みStatProfile含む）、`talent_levels` が入っている
- `warnings`: `ImportWarning[]` — インポート時の警告（`{ kind, message }`）
- `importGood(json)`: WASM `import_good()` を呼び、結果を格納。エラー時は `GoodError` をUIに表示
- `clear()`: データクリア
- `getBuild(characterId)`: IDでビルドを検索

### CalcStore
- `selectedCharacterId`: Currently selected character
- `enemyConfig`: `{ level, resistance, def_reduction }` — resistance is a single flat value matching the WASM `Enemy` type. Known simplification: real enemies have per-element resistances. Users set the relevant element's resistance manually.
- `selectedReaction`: Active reaction or null
- `damageResults`: `Map<string, DamageResult[]>` (character ID → per-talent results)
- `transformativeResults`: Transformative reaction results (from `calculate_transformative`)
- `lunarResults`: Lunar reaction results (from `calculate_lunar`)
- `setEnemy(config)`, `setReaction(reaction)`, `calculateDamage(characterId)`

**Damage calculation strategy:**

`CharacterBuild.character` に `CharacterData`（id, name, element, base stats 等）が入っている。ただし天賦倍率テーブルは `CharacterData` に含まれないため、`find_character(build.character.id)` を呼んで天賦データを取得する必要がある。

最終ステータスの組み立て:
- キャラ基礎ステ: `build.character.base_hp/atk/def` + `ascension_stat/ascension_stat_value`
- 武器基礎ステ: `build.weapon.weapon.base_atk` + `sub_stat/sub_stat_value`
- 聖遺物ステ: `build.artifacts.stats`（`StatProfile`、算出済み）
- これらを合算して `Stats` を構築し `DamageInput` に渡す

For each talent scaling entry:
1. `find_character(build.character.id)` で天賦倍率テーブルを取得
2. `build.talent_levels` の天賦レベルから倍率を参照
3. Assemble `DamageInput` from computed stats + talent data + enemy config
4. Call `calculate_damage(input, enemy)` → `{ non_crit, crit, average }`
5. If amplifying reaction selected: re-call with `reaction` field set → values include reaction multiplier
6. If transformative reaction selected: call `calculate_transformative` separately
7. If lunar reaction selected: call `calculate_lunar` separately

`reaction_bonus` is auto-derived from `build.artifacts.four_piece_set` (e.g., Crimson Witch 4pc = 0.15 for Vaporize/Melt).

### TeamStore (Phase 2)
- `members`: 4-slot array of character IDs
- `mainDpsIndex`: Index of the main DPS
- `resolvedStats`: Stats after team buff resolution
- `setMember(index, id)`, `setMainDps(index)`, `resolveTeam()`

**TeamMember assembly:** Each `TeamMember` for `resolve_team_stats` requires `element`, `weapon_type`, `stats: StatProfile`, `buffs_provided: ResolvedBuff[]`, and `is_moonsign`. `CharacterBuild` から `character.element`, `character.weapon_type` を取得、`StatProfile` はキャラ基礎+武器+`artifacts.stats` から構築。`buffs_provided` は character passive talents, constellation effects, weapon passives から組み立てる — 詳細は Phase 2 spec で定義。

### CompareStore (Phase 3)
- `buildA`, `buildB`: Build configurations — detailed type definition deferred to Phase 3 spec
- `results`: Damage results for both builds
- `compare()`: Run comparison calculation

### UIStore
- `locale`: `"ja" | "en"`
- `wasmReady`: WASM initialization status
- `wasmError`: `string | null` — error message if WASM fails to load
- `setLocale(locale)`

**WASM initialization error handling:** If WASM fails to load (network error, browser incompatibility, CSP restrictions), display an error banner with a retry button. The app is non-functional without WASM, so no graceful degradation — just a clear error state.

## File Structure (Phase 1 MVP)

```
src/
├── main.tsx
├── App.tsx
├── wasm.ts                       # WASM initialization
├── i18n/
│   ├── index.ts
│   ├── ja.json
│   └── en.json
├── stores/
│   ├── good.ts                   # GoodStore
│   ├── calc.ts                   # CalcStore
│   └── ui.ts                     # UIStore
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Layout.tsx
│   ├── import/
│   │   └── GoodImporter.tsx      # Drag & drop + file picker
│   ├── characters/
│   │   ├── CharacterGrid.tsx
│   │   ├── CharacterCard.tsx
│   │   └── CharacterFilter.tsx
│   └── detail/
│       ├── CharacterProfile.tsx  # Left column
│       ├── StatsPanel.tsx
│       ├── DamageTable.tsx       # Right column (tabbed)
│       ├── EnemyConfig.tsx
│       └── ReactionSelector.tsx
└── pages/
    ├── HomePage.tsx
    ├── CharactersPage.tsx
    └── CharacterDetailPage.tsx
```

Types are imported directly from `@kotenbu/genshin-calc/types`:
```ts
import type { GoodImport, CharacterBuild, Stats, DamageInput, Enemy } from "@kotenbu/genshin-calc/types";
```

## Phased Delivery

### Phase 1 — MVP
- GOOD file import (drag & drop, file picker)
- Character grid with element/weapon filtering
- Character detail page with stats and damage table
- Enemy level/resistance configuration
- Elemental reaction toggle
- Japanese/English language switch

### Phase 2 — Team Composition
- 4-slot team builder UI
- `resolve_team_stats` integration for buff-inclusive stats
- Buff breakdown (which teammate provides what)
- Before/after damage comparison
- Team save/load (localStorage)

### Phase 3 — Build Comparison
- Artifact set swap simulation
- Weapon swap simulation
- Side-by-side Build A vs B display
- Diff highlighting (green = improvement, red = decrease)
- Damage comparison chart per talent

## UI Theme

Genshin Impact-inspired rich UI:
- Dark background with warm accent colors per element
- Card-based layouts with subtle borders and glow effects
- Element-colored highlights (Pyro red-orange, Hydro blue, etc.)
- Framer Motion transitions for page changes and card interactions
- Desktop-first responsive design (tablet supported, mobile shows desktop recommendation)

## Global UI Elements

- **Navbar:** Logo, Characters, Team, Compare, Language toggle, GOOD file re-import
- **Data status:** Loaded character count and game version always visible
- **Sample data:** "Try with sample data" button on home page for users without GOOD files

## Prerequisites

All prerequisites are met:
1. ~~Implement `genshin-calc-good` crate~~ ✅ Done
2. ~~Expose `import_good()` in WASM bindings~~ ✅ Done (@kotenbu/genshin-calc@0.2.0)
3. ~~Include `types.ts` in npm package~~ ✅ Done (v0.2.0)

Source repository: https://github.com/kotenbu135/genshin-calc
