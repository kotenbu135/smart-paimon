# smart-paimon

Genshin Impact damage calculator Web UI.
Uses `@kotenbu135/genshin-calc-wasm` (WASM) for calculations.

## Tech Stack
Vite + React 19 + TypeScript, Tailwind CSS v4, Zustand, Radix UI, Framer Motion, react-i18next

## Related
- Calculation engine: https://github.com/kotenbu135/genshin-calc
- npm package: @kotenbu135/genshin-calc-wasm (WASM bindings)
- GOOD format: Genshin Open Object Description (player data import format)

## Key Decisions
- HashRouter for GitHub Pages deployment
- GOOD import is handled WASM-side (import_good in genshin-calc-good crate), not in TS
- find_character() returns CharacterData with talents (TalentSet with multiplier tables)
- 3 separate WASM calls for damage: calculate_damage (standard/amplifying), calculate_transformative, calculate_lunar
- i18n: Japanese + English

## Architecture Principle: WASM-only calculation
- All damage/buff/debuff calculations are performed exclusively in WASM (`@kotenbu135/genshin-calc-wasm`)
- Frontend (TypeScript/React) is responsible only for displaying WASM calculation results
- Do NOT implement calculation logic in TypeScript — no manual buff formulas, no stat computations, no resistance math in TS
- `resolve_team_stats` applies buffs from `buffs_provided` and computes elemental resonance, but does NOT compute character-specific buff values (Bennett Q, Kazuha A4, etc.)
- Character buff value computation is temporarily in TS (`src/data/character-buffs.ts`) — pending WASM v0.4.0 `get_character_team_buffs` API (see `docs/wasm-v0.4.0-request.md`)
- Stat profile assembly is temporarily in TS (`src/lib/team.ts` `buildStatProfile()`) — pending WASM v0.4.0 `build_member_stats` API
- `resolve_team_stats` input stats require combined format: StatProfile fields (base_hp, base_atk, base_def, etc.) + per-element DMG bonus (pyro_dmg_bonus, etc.)
- WASM can be tested in Node.js: `initSync({ module: fs.readFileSync('node_modules/@kotenbu135/genshin-calc-wasm/genshin_calc_wasm_bg.wasm') })`

## Design Spec
See `docs/superpowers/specs/2026-03-31-smart-paimon-design.md`
