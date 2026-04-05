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
- `build_team_member(json, character_id, weapon_activations, artifact_activations)` → TeamMember (v0.5.0): キャラ天賦バフ + 武器バフ + 聖遺物バフ + conditional activations を全て含む
- `resolve_team_stats(members, target_index)` → TeamResolveResult: チームバフ適用、元素共鳴、最終ステータス計算
- TS側でバフを手動組み立てする必要はない（旧 `assembleBuffsProvided`, `get_character_team_buffs` は廃止）
- バフの source 名は WASM が生成する英語の説明的名前（例: "Fantastic Voyage ATK Bonus"）
- Conditional buffs: `find_artifact_set().four_piece.conditional_buffs` / `find_weapon().passive.effect.conditional_buffs` で取得、activation UI から `BuffActivation[]` として渡す
- WASM can be tested in Node.js: `initSync({ module: fs.readFileSync('node_modules/@kotenbu135/genshin-calc-wasm/genshin_calc_wasm_bg.wasm') })`

## Working with Genshin Data
- 原神のゲーム仕様に関する質問は、知識に自信がなければ必ず Web 検索で確認してから回答する
- 聖遺物・キャラ天賦の効果は頻繁に追加・変更されるため、推測で答えない

## Design Spec
See `docs/superpowers/specs/2026-03-31-smart-paimon-design.md`
