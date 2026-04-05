import fs from 'fs';
import { initSync, get_character_team_buffs } from '@kotenbu135/genshin-calc-wasm';

const wasmBytes = fs.readFileSync('node_modules/@kotenbu135/genshin-calc-wasm/genshin_calc_wasm_bg.wasm');
initSync({ module: wasmBytes });

const good = fs.readFileSync('sample/genshin_export_2026-04-03_22-17.json', 'utf-8');

// Helper
function test(label, charId, constellation, talents) {
  try {
    const result = get_character_team_buffs(good, charId, constellation, new Uint32Array(talents));
    console.log(`\n=== ${label} (${charId}, C${constellation}) ===`);
    if (result.length === 0) {
      console.log('  [] (empty)');
    } else {
      for (const b of result) {
        console.log(`  ${b.source} | ${b.stat} = ${b.value}`);
      }
    }
    return result;
  } catch (e) {
    console.log(`\n=== ${label} (${charId}, C${constellation}) ===`);
    console.log(`  ERROR: ${e.message || e}`);
    return null;
  }
}

console.log('========================================');
console.log('  WASM v0.4.2 Verification');
console.log('========================================');

// --- Section A: Bug fixes (value was 0) ---
console.log('\n\n--- A. Bug Fixes (previously returned 0) ---');

test('A-1 Sucrose A4 EM', 'sucrose', 6, [1, 1, 1]);
test('A-2 Nilou A4 TransformativeBonus', 'nilou', 0, [1, 1, 1]);
test('A-3 Yelan A4 DmgBonus', 'yelan', 0, [1, 1, 1]);
test('A-4 Furina burst DmgBonus', 'furina', 0, [1, 1, 1]);
test('A-5 Ineffa A4 EM', 'ineffa', 0, [1, 1, 1]);
test('A-6 Lauma A4 SkillDmgBonus', 'lauma', 0, [1, 1, 1]);

// --- Section B: Previously unimplemented (returned []) ---
console.log('\n\n--- B. Previously Unimplemented Characters ---');

test('B-1 Raiden Shogun', 'raiden_shogun', 0, [1, 1, 1]);
test('B-2 Xilonen', 'xilonen', 0, [1, 1, 1]);
test('B-3 Citlali', 'citlali', 0, [1, 1, 1]);
test('B-4 Mavuika', 'mavuika', 0, [1, 1, 1]);
test('B-5 Xiangling C6', 'xiangling', 6, [1, 1, 1]);
test('B-6 Xingqiu C2', 'xingqiu', 2, [1, 1, 1]);
test('B-7 Rosaria C6', 'rosaria', 6, [1, 1, 1]);
test('B-8 Eula', 'eula', 0, [1, 1, 1]);
test('B-9 Jean C4', 'jean', 4, [1, 1, 1]);
test('B-10 Xianyun', 'xianyun', 2, [1, 1, 1]);
test('B-11 Beidou C6', 'beidou', 6, [1, 1, 1]);
test('B-12 Klee C6', 'klee', 6, [1, 1, 1]);
test('B-13 Xinyan C4', 'xinyan', 4, [1, 1, 1]);
test('B-14 Yoimiya', 'yoimiya', 0, [1, 1, 1]);
test('B-15 Albedo', 'albedo', 0, [1, 1, 1]);
test('B-16 Mika C6', 'mika', 6, [1, 1, 1]);
test('B-17 Collei C4', 'collei', 4, [1, 1, 1]);
test('B-18 Iansan', 'iansan', 0, [1, 1, 1]);
test('B-19 Venti C6', 'venti', 6, [1, 1, 1]);
test('B-20 Chevreuse C6', 'chevreuse', 6, [1, 1, 1]);
test('B-21 Ganyu C4', 'ganyu', 4, [1, 1, 1]);

// --- Section E: Characters with NO team buffs (should return []) ---
console.log('\n\n--- E. No Team Buffs (should be empty) ---');

for (const charId of ['amber', 'noelle', 'keqing', 'kaeya', 'diluc', 'hu_tao']) {
  test(`No buffs: ${charId}`, charId, 0, [1, 1, 1]);
}
