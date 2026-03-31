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
| Calculation Engine | @kotenbu/genshin-calc (WASM) |
| Routing | React Router v7 (HashRouter for GitHub Pages) |
| Deployment | GitHub Pages (GitHub Actions auto-deploy) |

## Data Flow

```
GOOD JSON file
  → Drag & drop / file picker
  → WASM GOOD Adapter (import_good in @kotenbu/genshin-calc)
  → Zustand stores (characters, weapons, artifacts)
  → User interaction (select character, configure enemy, pick reaction)
  → WASM calculation (calculate_damage / resolve_team_stats)
  → Damage results displayed in UI
```

## GOOD Adapter (package-side addition)

A new function `import_good(json: string)` will be added to `@kotenbu/genshin-calc`. A design spec already exists in the `genshin-calc` repository (`docs/superpowers/specs/2026-03-31-good-import-design.md`). The new crate `genshin-calc-good` will be published as part of the WASM package.

Key responsibilities:
- Parses GOOD JSON format (version 1)
- Converts `CharacterKey` (PascalCase: `"HuTao"`) → genshin-calc ID (snake_case: `"hu_tao"`)
- Converts `WeaponKey` (`"WolfsGravestone"`) → `"wolfs_gravestone"`
- Converts `ArtifactSetKey` to internal IDs
- Builds `StatProfile` from artifact main stats + substats (percentage values ÷100 to decimal)
- Main stat value lookup tables for artifacts (3-5 stars, level 0-20)
- Returns `GoodImport` struct with `CharacterBuild` array and warnings for unknown keys
- Implemented in Rust (WASM), so Web UI just calls `import_good()`

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
- `raw`: Raw GOOD JSON
- `characters`: Parsed character data array
- `weapons`: Parsed weapon data array
- `artifacts`: Parsed artifact data array
- `importGood(json)`: Import GOOD file via WASM adapter
- `clear()`: Clear all data

### CalcStore
- `selectedCharacterId`: Currently selected character
- `enemyConfig`: `{ level, resistance, def_reduction }` — resistance is a single flat value matching the WASM `Enemy` type. Known simplification: real enemies have per-element resistances. Users set the relevant element's resistance manually.
- `selectedReaction`: Active reaction or null
- `damageResults`: `Map<string, DamageResult[]>` (character ID → per-talent results)
- `transformativeResults`: Transformative reaction results (from `calculate_transformative`)
- `lunarResults`: Lunar reaction results (from `calculate_lunar`)
- `setEnemy(config)`, `setReaction(reaction)`, `calculateDamage(characterId)`

**Damage calculation strategy:**

`find_character(id)` returns `CharacterData` which includes a `talents: TalentSet` field with complete multiplier tables (15 talent levels per scaling entry). Each `TalentScaling` has `name`, `scaling_stat`, `damage_element`, and `values[0..15]`.

For each talent scaling entry:
1. Get `talent_multiplier` from `talents.values[talentLevel - 1]`
2. Assemble `DamageInput` from character stats + talent data + enemy config
3. Call `calculate_damage(input, enemy)` → `{ non_crit, crit, average }`
4. If amplifying reaction selected: re-call with `reaction` field set → values include reaction multiplier
5. If transformative reaction selected: call `calculate_transformative` separately
6. If lunar reaction selected: call `calculate_lunar` separately

`reaction_bonus` is auto-derived from equipped artifact set bonuses (e.g., Crimson Witch 4pc = 0.15 for Vaporize/Melt).

### TeamStore (Phase 2)
- `members`: 4-slot array of character IDs
- `mainDpsIndex`: Index of the main DPS
- `resolvedStats`: Stats after team buff resolution
- `setMember(index, id)`, `setMainDps(index)`, `resolveTeam()`

**TeamMember assembly:** Each `TeamMember` for `resolve_team_stats` requires `element`, `weapon_type`, `stats: StatProfile`, `buffs_provided: ResolvedBuff[]`, and `is_moonsign`. Character/weapon data comes from `find_character`/`find_weapon`. `buffs_provided` must be sourced from character passive talents, constellation effects, and weapon passives — this data assembly strategy will be detailed in a Phase 2 spec.

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
├── pages/
│   ├── HomePage.tsx
│   ├── CharactersPage.tsx
│   └── CharacterDetailPage.tsx
└── types/
    └── good.ts                   # GOOD format type definitions
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

Before starting Web UI implementation:
1. Implement `genshin-calc-good` crate (design spec exists at `genshin-calc` repo)
2. Expose `import_good()` function in WASM bindings
3. Publish updated `@kotenbu/genshin-calc` package version to npm

Source repository: https://github.com/kotenbu135/genshin-calc
