import fs from 'fs';
import { initSync, get_character_team_buffs, build_member_stats } from '@kotenbu135/genshin-calc-wasm';

const wasmBytes = fs.readFileSync('node_modules/@kotenbu135/genshin-calc-wasm/genshin_calc_wasm_bg.wasm');
initSync({ module: wasmBytes });

const good = fs.readFileSync('sample/genshin_export_2026-04-03_22-17.json', 'utf-8');
const goodData = JSON.parse(good);

// Find character talent levels from GOOD data
function findCharTalents(goodData, key) {
  const char = goodData.characters?.find(c => c.key === key);
  if (!char) return null;
  return {
    constellation: char.constellation,
    talents: [char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1],
    level: char.level,
    ascension: char.ascension,
  };
}

// Deep print helper
function printBuffs(label, buffs) {
  console.log(`\n=== ${label} ===`);
  if (!buffs || buffs.length === 0) {
    console.log('  [] (empty)');
    return;
  }
  for (const b of buffs) {
    const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
    console.log(`  ${b.source} | ${statStr} = ${b.value}`);
    // Print all keys
    const extraKeys = Object.keys(b).filter(k => !['source', 'stat', 'value'].includes(k));
    if (extraKeys.length > 0) {
      console.log(`    extra keys: ${JSON.stringify(Object.fromEntries(extraKeys.map(k => [k, b[k]])))}`);
    }
  }
}

// === A-4: Furina with actual talent levels ===
console.log('========================================');
console.log('  Detailed Verification');
console.log('========================================');

const furinaInfo = findCharTalents(goodData, 'Furina');
console.log('\n--- Furina character data ---');
console.log(JSON.stringify(furinaInfo, null, 2));

if (furinaInfo) {
  const r1 = get_character_team_buffs(good, 'furina', furinaInfo.constellation, new Uint32Array(furinaInfo.talents));
  printBuffs(`A-4 Furina (C${furinaInfo.constellation}, talents=${furinaInfo.talents})`, r1);
}

// Also test with talent [1,1,10] and [10,10,10] to see scaling
const furinaLv1 = get_character_team_buffs(good, 'furina', 0, new Uint32Array([1, 1, 1]));
printBuffs('A-4 Furina (C0, talents=[1,1,1])', furinaLv1);

const furinaLv10 = get_character_team_buffs(good, 'furina', 0, new Uint32Array([1, 1, 10]));
printBuffs('A-4 Furina (C0, talents=[1,1,10])', furinaLv10);

// === B-7: Rosaria A4 CritRate ===
const rosariaInfo = findCharTalents(goodData, 'Rosaria');
console.log('\n--- Rosaria character data ---');
console.log(JSON.stringify(rosariaInfo, null, 2));

if (rosariaInfo) {
  const r2 = get_character_team_buffs(good, 'rosaria', rosariaInfo.constellation, new Uint32Array(rosariaInfo.talents));
  printBuffs(`B-7 Rosaria (C${rosariaInfo.constellation}, actual talents)`, r2);
}
// Force C6 test
const rosariaC6 = get_character_team_buffs(good, 'rosaria', 6, new Uint32Array([1, 1, 1]));
printBuffs('B-7 Rosaria (C6, talents=[1,1,1])', rosariaC6);
// C0 test - should show A4 only
const rosariaC0 = get_character_team_buffs(good, 'rosaria', 0, new Uint32Array([1, 1, 1]));
printBuffs('B-7 Rosaria (C0, talents=[1,1,1])', rosariaC0);

// Check rosaria stats to understand A4 calc
try {
  const rosariaStats = build_member_stats(good, 'rosaria');
  console.log('\n--- Rosaria build_member_stats ---');
  console.log('crit_rate:', rosariaStats.crit_rate);
  console.log('crit_rate_percent:', rosariaStats.crit_rate_percent);
  // Print all keys that might contain crit
  for (const [k, v] of Object.entries(rosariaStats)) {
    if (k.toLowerCase().includes('crit')) {
      console.log(`  ${k}: ${v}`);
    }
  }
} catch(e) {
  console.log('build_member_stats error:', e.message || e);
}

// === B-2: Xilonen detail (stat object structure) ===
const xilonen = get_character_team_buffs(good, 'xilonen', 0, new Uint32Array([1, 1, 1]));
printBuffs('B-2 Xilonen detail', xilonen);

// === B-1: Raiden detail ===
const raiden = get_character_team_buffs(good, 'raiden_shogun', 0, new Uint32Array([1, 1, 10]));
printBuffs('B-1 Raiden (talents=[1,1,10]) - skill scaling check', raiden);

// === Check which characters exist in sample data ===
console.log('\n--- Characters in sample GOOD data ---');
const charKeys = goodData.characters?.map(c => c.key) || [];
console.log(charKeys.join(', '));

// Check missing chars
for (const id of ['Klee', 'Yoimiya', 'Albedo', 'Venti']) {
  const found = charKeys.includes(id);
  console.log(`  ${id}: ${found ? 'FOUND' : 'NOT IN DATA'}`);
}
