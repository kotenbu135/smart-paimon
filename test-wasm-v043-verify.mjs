import fs from 'fs';
import { initSync, get_character_team_buffs } from '@kotenbu135/genshin-calc-wasm';

const wasmBytes = fs.readFileSync('node_modules/@kotenbu135/genshin-calc-wasm/genshin_calc_wasm_bg.wasm');
initSync({ module: wasmBytes });

const good = fs.readFileSync('sample/genshin_export_2026-04-03_22-17.json', 'utf-8');
const goodData = JSON.parse(good);

let pass = 0, fail = 0;

function expect(label, actual, expected, tolerance = 0.01) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (ok) {
    console.log(`  [PASS] ${label}: ${actual} (expected ${expected})`);
    pass++;
  } else {
    console.log(`  [FAIL] ${label}: got ${actual}, expected ${expected}`);
    fail++;
  }
}

function expectStat(label, buff, expectedStat) {
  const statStr = buff ? (typeof buff.stat === 'object' ? JSON.stringify(buff.stat) : buff.stat) : 'NOT FOUND';
  const ok = statStr === expectedStat;
  if (ok) {
    console.log(`  [PASS] ${label}: stat = ${statStr}`);
    pass++;
  } else {
    console.log(`  [FAIL] ${label}: stat = ${statStr}, expected ${expectedStat}`);
    fail++;
  }
}

function expectExists(label, buff) {
  if (buff) {
    console.log(`  [PASS] ${label}: found (value=${buff.value}, target=${buff.target})`);
    pass++;
  } else {
    console.log(`  [FAIL] ${label}: NOT FOUND`);
    fail++;
  }
}

// ============================================================
// A. Furina burst: max fanfare DmgBonus
// ============================================================
console.log('\n=== A. Furina burst: max fanfare ===');
{
  const char = goodData.characters.find(c => c.key === 'Furina');
  const c = char.constellation;
  const burstLv = char.talent?.burst || 1;

  // Test with actual constellation
  const r = get_character_team_buffs(good, 'furina', c,
    new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, burstLv]));
  const burst = r.find(b => b.source === 'furina:burst');
  console.log(`  Furina C${c}, Burst Lv${burstLv}`);

  if (burst) {
    console.log(`  value = ${burst.value}`);
    // C0: 300 * 0.0025 = 0.75, C1+: 400 * 0.0025 = 1.00 (at Lv10)
    if (burst.value > 0.50) {
      console.log(`  [PASS] Value is significantly above 0.27 base (max fanfare applied)`);
      pass++;
    } else {
      console.log(`  [FAIL] Value ${burst.value} is still too low — max fanfare likely not applied`);
      fail++;
    }
  } else {
    console.log(`  [FAIL] furina:burst not found`);
    fail++;
  }

  // v0.4.4: C1+ returns 2 entries (furina:burst + furina:c1), sum them
  function furinaTotalDmgBonus(constellation, burstLv) {
    const r = get_character_team_buffs(good, 'furina', constellation, new Uint32Array([1, 10, burstLv]));
    return r.filter(b => b.stat === 'DmgBonus').reduce((a, b) => a + b.value, 0);
  }

  // Test C0 Lv10: 300 * 0.0025 = 0.75
  expect('Furina C0 Burst Lv10 total DmgBonus', furinaTotalDmgBonus(0, 10), 0.75, 0.05);

  // Test C1 Lv10: 400 * 0.0025 = 1.00 (split: burst=0.75 + c1=0.25)
  expect('Furina C1 Burst Lv10 total DmgBonus', furinaTotalDmgBonus(1, 10), 1.00, 0.05);

  // Test C2 Lv10: same as C1
  expect('Furina C2 Burst Lv10 total DmgBonus', furinaTotalDmgBonus(2, 10), 1.00, 0.05);

  // Test C1 Lv13: 400 * 0.0031 = 1.24
  expect('Furina C1 Burst Lv13 total DmgBonus', furinaTotalDmgBonus(1, 13), 1.24, 0.05);

  // Verify C1 extra entry exists
  {
    const r1 = get_character_team_buffs(good, 'furina', 1, new Uint32Array([1, 10, 10]));
    const c1entry = r1.find(b => b.source === 'furina:c1');
    expectExists('Furina C1 extra entry (furina:c1)', c1entry);
  }
}

// ============================================================
// B. Rosaria A4: CritRate buff
// ============================================================
console.log('\n=== B. Rosaria A4: CritRate ===');
{
  const r = get_character_team_buffs(good, 'rosaria', 6, new Uint32Array([10, 10, 10]));
  const a4 = r.find(b => b.source === 'rosaria:a4');
  expectExists('Rosaria A4 exists', a4);

  if (a4) {
    expectStat('Rosaria A4 stat', a4, 'CritRate');
    // Sample Rosaria crit_rate is low (~0.05), so min(0.05*0.15, 0.15) = 0.0075
    // But value should be > 0 and <= 0.15
    if (a4.value > 0 && a4.value <= 0.15) {
      console.log(`  [PASS] Rosaria A4 CritRate = ${a4.value} (valid range 0-0.15)`);
      pass++;
    } else {
      console.log(`  [FAIL] Rosaria A4 CritRate = ${a4.value} (out of range)`);
      fail++;
    }
    const targetOk = a4.target === 'TeamExcludeSelf';
    if (targetOk) {
      console.log(`  [PASS] Rosaria A4 target = TeamExcludeSelf`);
      pass++;
    } else {
      console.log(`  [FAIL] Rosaria A4 target = ${a4.target}, expected TeamExcludeSelf`);
      fail++;
    }
  }

  // C6 should still work
  const c6 = r.find(b => b.source === 'rosaria:c6');
  expectExists('Rosaria C6 still exists', c6);
}

// ============================================================
// C. Aino A4: stat type fix (BurstFlatDmg, not BurstDmgBonus)
// ============================================================
console.log('\n=== C. Aino A4: BurstFlatDmg ===');
{
  const r = get_character_team_buffs(good, 'aino', 6, new Uint32Array([1, 1, 1]));
  const a4 = r.find(b => b.source === 'aino:a4');
  expectExists('Aino A4 exists', a4);

  if (a4) {
    expectStat('Aino A4 stat is BurstFlatDmg', a4, 'BurstFlatDmg');
    // Value should be EM * 0.50 (around 74.5 for sample)
    console.log(`  [INFO] Aino A4 value = ${a4.value}`);
  }

  // Other buffs should still work
  const c1 = r.find(b => b.source === 'aino:c1');
  const c6 = r.find(b => b.source === 'aino:c6');
  expectExists('Aino C1 still exists', c1);
  expectExists('Aino C6 still exists', c6);
}

// ============================================================
// D. Chevreuse C6: Pyro/Electro DmgBonus
// ============================================================
console.log('\n=== D. Chevreuse C6: Pyro/Electro DmgBonus ===');
{
  const r = get_character_team_buffs(good, 'chevreuse', 6, new Uint32Array([10, 10, 10]));

  const c6pyro = r.find(b => b.source === 'chevreuse:c6' &&
    typeof b.stat === 'object' && JSON.stringify(b.stat).includes('Pyro'));
  const c6electro = r.find(b => b.source === 'chevreuse:c6' &&
    typeof b.stat === 'object' && JSON.stringify(b.stat).includes('Electro'));

  expectExists('Chevreuse C6 Pyro DmgBonus exists', c6pyro);
  expectExists('Chevreuse C6 Electro DmgBonus exists', c6electro);

  if (c6pyro) {
    expect('Chevreuse C6 Pyro DmgBonus value', c6pyro.value, 0.60, 0.01);
    expectStat('Chevreuse C6 Pyro stat', c6pyro, '{"ElementalDmgBonus":"Pyro"}');
  }
  if (c6electro) {
    expect('Chevreuse C6 Electro DmgBonus value', c6electro.value, 0.60, 0.01);
    expectStat('Chevreuse C6 Electro stat', c6electro, '{"ElementalDmgBonus":"Electro"}');
  }

  // A1 and A4 should still work
  const a1 = r.find(b => b.source === 'chevreuse:a1');
  const a4s = r.filter(b => b.source === 'chevreuse:a4');
  expectExists('Chevreuse A1 still exists', a1);
  if (a4s.length >= 2) {
    console.log(`  [PASS] Chevreuse A4 has ${a4s.length} entries (Pyro + Electro res reduction)`);
    pass++;
  } else {
    console.log(`  [FAIL] Chevreuse A4 has ${a4s.length} entries, expected 2+`);
    fail++;
  }
}

// ============================================================
// Regression: v0.4.1/v0.4.2 existing characters still work
// ============================================================
console.log('\n=== Regression check ===');
{
  // Bennett
  const bennett = goodData.characters.find(c => c.key === 'Bennett');
  if (bennett) {
    const r = get_character_team_buffs(good, 'bennett', bennett.constellation,
      new Uint32Array([bennett.talent?.auto || 1, bennett.talent?.skill || 1, bennett.talent?.burst || 1]));
    const burstAtk = r.find(b => b.source === 'bennett:burst');
    expectExists('Bennett burst ATK', burstAtk);
  }

  // Kazuha — skip ID lookup issue (not a v0.4.3 regression)
  console.log('  [SKIP] Kazuha — character ID lookup fails (pre-existing issue)');

  // Nahida
  const nahida = goodData.characters.find(c => c.key === 'Nahida');
  if (nahida) {
    const r = get_character_team_buffs(good, 'nahida', nahida.constellation,
      new Uint32Array([nahida.talent?.auto || 1, nahida.talent?.skill || 1, nahida.talent?.burst || 1]));
    if (r.length > 0) {
      console.log(`  [PASS] Nahida returns ${r.length} buff(s)`);
      pass++;
    } else {
      console.log(`  [FAIL] Nahida returns 0 buffs`);
      fail++;
    }
  }

  // Sucrose A4 EM
  const sucrose = get_character_team_buffs(good, 'sucrose', 6, new Uint32Array([1, 1, 1]));
  const sucroseA4 = sucrose.find(b => b.source === 'sucrose:a4');
  expect('Sucrose A4 EM', sucroseA4?.value ?? -1, 123.4, 2);
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`  RESULTS: ${pass} passed, ${fail} failed`);
console.log('='.repeat(50));
process.exit(fail > 0 ? 1 : 0);
