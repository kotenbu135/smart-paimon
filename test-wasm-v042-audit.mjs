import fs from 'fs';
import { initSync, get_character_team_buffs, build_member_stats } from '@kotenbu135/genshin-calc-wasm';

const wasmBytes = fs.readFileSync('node_modules/@kotenbu135/genshin-calc-wasm/genshin_calc_wasm_bg.wasm');
initSync({ module: wasmBytes });

const good = fs.readFileSync('sample/genshin_export_2026-04-03_22-17.json', 'utf-8');
const goodData = JSON.parse(good);

// ============================================================
// 1. Test ALL characters with actual data — find zero values
// ============================================================
console.log('='.repeat(70));
console.log('  AUDIT: All characters in sample data');
console.log('='.repeat(70));

const issues = [];

for (const char of goodData.characters) {
  const id = char.key.replace(/([A-Z])/g, (m, c, i) => i === 0 ? c.toLowerCase() : `_${c.toLowerCase()}`);
  // Try common ID formats
  const ids = [
    char.key.charAt(0).toLowerCase() + char.key.slice(1), // camelCase
    char.key.toLowerCase(), // lowercase
    id, // snake_case from PascalCase
  ];

  let result = null;
  let usedId = null;
  for (const tryId of ids) {
    try {
      result = get_character_team_buffs(
        good, tryId, char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1])
      );
      usedId = tryId;
      break;
    } catch (e) {
      // try next format
    }
  }

  if (!result) continue;

  if (result.length > 0) {
    console.log(`\n${char.key} (C${char.constellation}, id=${usedId}):`);
    for (const b of result) {
      const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
      const flag = b.value === 0 ? ' <<<< ZERO VALUE!' : '';
      console.log(`  ${b.source} | ${statStr} = ${b.value} [target: ${b.target}]${flag}`);

      if (b.value === 0) {
        issues.push({ char: char.key, id: usedId, constellation: char.constellation, source: b.source, stat: statStr });
      }
    }
  }
}

// ============================================================
// 2. Test B-section characters with MAX constellation
//    (to catch buffs only active at high C)
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('  AUDIT: B-section chars at C6 (max constellation check)');
console.log('='.repeat(70));

const bSectionChars = [
  { key: 'RaidenShogun', id: 'raiden_shogun' },
  { key: 'Xilonen', id: 'xilonen' },
  { key: 'Citlali', id: 'citlali' },
  { key: 'Mavuika', id: 'mavuika' },
  { key: 'Xiangling', id: 'xiangling' },
  { key: 'Xingqiu', id: 'xingqiu' },
  { key: 'Rosaria', id: 'rosaria' },
  { key: 'Eula', id: 'eula' },
  { key: 'Jean', id: 'jean' },
  { key: 'Xianyun', id: 'xianyun' },
  { key: 'Beidou', id: 'beidou' },
  { key: 'Xinyan', id: 'xinyan' },
  { key: 'Mika', id: 'mika' },
  { key: 'Collei', id: 'collei' },
  { key: 'Iansan', id: 'iansan' },
  { key: 'Chevreuse', id: 'chevreuse' },
  { key: 'Ganyu', id: 'ganyu' },
];

for (const { key, id } of bSectionChars) {
  const char = goodData.characters.find(c => c.key === key);
  if (!char) continue;

  try {
    const result = get_character_team_buffs(good, id, 6, new Uint32Array([10, 10, 10]));
    console.log(`\n${key} (C6, talents=[10,10,10], id=${id}):`);
    if (result.length === 0) {
      console.log('  [] (empty) <<<< UNEXPECTED EMPTY!');
      issues.push({ char: key, id, constellation: 6, source: 'ALL', stat: 'EMPTY' });
    }
    for (const b of result) {
      const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
      const flag = b.value === 0 ? ' <<<< ZERO VALUE!' : '';
      console.log(`  ${b.source} | ${statStr} = ${b.value} [target: ${b.target}]${flag}`);
      if (b.value === 0) {
        issues.push({ char: key, id, constellation: 6, source: b.source, stat: statStr });
      }
    }
  } catch (e) {
    console.log(`\n${key} (id=${id}): ERROR: ${e.message || e}`);
  }
}

// ============================================================
// 3. Specific expected-value checks from the request doc
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('  AUDIT: Expected value verification');
console.log('='.repeat(70));

function expect(label, actual, expected, tolerance = 0.01) {
  const pass = Math.abs(actual - expected) < tolerance;
  const icon = pass ? 'PASS' : 'FAIL';
  console.log(`  [${icon}] ${label}: got ${actual}, expected ${expected}`);
  if (!pass) issues.push({ char: label, source: 'value_mismatch', stat: `got=${actual} expected=${expected}` });
}

// A-1: Sucrose A4 EM
{
  const r = get_character_team_buffs(good, 'sucrose', 6, new Uint32Array([1, 1, 1]));
  const a4 = r.find(b => b.source === 'sucrose:a4');
  expect('Sucrose A4 EM', a4?.value ?? -1, 123.4, 1);
}

// A-2: Nilou A4
{
  const r = get_character_team_buffs(good, 'nilou', 0, new Uint32Array([1, 1, 1]));
  const a4 = r.find(b => b.source === 'nilou:a4');
  expect('Nilou A4 TransformativeBonus', a4?.value ?? -1, 1.71, 0.1);
}

// A-3: Yelan A4
{
  const r = get_character_team_buffs(good, 'yelan', 0, new Uint32Array([1, 1, 1]));
  const a4 = r.find(b => b.source === 'yelan:a4');
  expect('Yelan A4 DmgBonus (max)', a4?.value ?? -1, 0.50, 0.01);
}

// A-4: Furina burst (should be max fanfare)
{
  const char = goodData.characters.find(c => c.key === 'Furina');
  const r = get_character_team_buffs(good, 'furina', char.constellation,
    new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
  const burst = r.find(b => b.source === 'furina:burst');
  // Burst Lv10, 300 max fanfare points, scaling ~0.27% per point at lv10
  // Max should be much higher than 0.27
  console.log(`  [INFO] Furina burst DmgBonus = ${burst?.value} (C${char.constellation}, burst lv ${char.talent?.burst})`);
  if (burst?.value <= 0.30) {
    console.log(`  [WARN] Furina value looks like base, not max fanfare`);
    issues.push({ char: 'Furina', id: 'furina', constellation: char.constellation, source: 'furina:burst', stat: `value=${burst?.value} seems too low for max fanfare` });
  }
}

// B-4: Mavuika
{
  const r = get_character_team_buffs(good, 'mavuika', 0, new Uint32Array([1, 1, 1]));
  const a1 = r.find(b => b.source === 'mavuika:a1');
  const a4 = r.find(b => b.source === 'mavuika:a4');
  expect('Mavuika A1 AtkPercent', a1?.value ?? -1, 0.30, 0.01);
  expect('Mavuika A4 AtkPercent (max)', a4?.value ?? -1, 0.60, 0.01);
}

// B-7: Rosaria — A4 CritRate check
{
  const r = get_character_team_buffs(good, 'rosaria', 6, new Uint32Array([10, 10, 10]));
  const a4 = r.find(b => b.source === 'rosaria:a4');
  const c6 = r.find(b => b.source === 'rosaria:c6');
  console.log(`  [INFO] Rosaria A4 CritRate: ${a4 ? `value=${a4.value}` : 'NOT FOUND'}`);
  console.log(`  [INFO] Rosaria C6 PhysResRed: ${c6 ? `value=${c6.value}` : 'NOT FOUND'}`);
  if (!a4) {
    issues.push({ char: 'Rosaria', id: 'rosaria', constellation: 6, source: 'rosaria:a4', stat: 'CritRate MISSING' });
  }
}

// B-8: Eula max res reduction
{
  const r = get_character_team_buffs(good, 'eula', 0, new Uint32Array([1, 1, 1]));
  for (const b of r) {
    const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
    expect(`Eula ${statStr}`, b.value, 0.50, 0.01);
  }
}

// B-10: Xianyun
{
  const r = get_character_team_buffs(good, 'xianyun', 2, new Uint32Array([1, 1, 10]));
  const a4 = r.find(b => b.source === 'xianyun:a4');
  if (a4) {
    // Max is 0.75
    console.log(`  [INFO] Xianyun A4 PlungingAtkDmgBonus = ${a4.value} (max 0.75)`);
  }
}

// B-21: Ganyu C4 max
{
  const r = get_character_team_buffs(good, 'ganyu', 4, new Uint32Array([1, 1, 1]));
  const c4 = r.find(b => b.source === 'ganyu:c4');
  expect('Ganyu C4 DmgBonus (max)', c4?.value ?? -1, 0.25, 0.01);
}

// ============================================================
// 4. Check characters that SHOULD have no buffs
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('  AUDIT: Characters that should return empty');
console.log('='.repeat(70));

const noBuff = ['amber', 'noelle', 'keqing', 'kaeya', 'diluc', 'hu_tao', 'fischl', 'razor'];
for (const id of noBuff) {
  try {
    const r = get_character_team_buffs(good, id, 0, new Uint32Array([1, 1, 1]));
    if (r.length > 0) {
      console.log(`  [WARN] ${id} returned ${r.length} buffs (expected 0)`);
      issues.push({ char: id, source: 'unexpected_buffs', stat: `count=${r.length}` });
    } else {
      console.log(`  [PASS] ${id}: empty`);
    }
  } catch (e) {
    console.log(`  [SKIP] ${id}: ${e.message || e}`);
  }
}

// ============================================================
// 5. Check well-known characters that were already working in v0.4.1
//    for regressions
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('  AUDIT: v0.4.1 regression check');
console.log('='.repeat(70));

// Bennett burst ATK
{
  const char = goodData.characters.find(c => c.key === 'Bennett');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'bennett', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nBennett (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Bennett', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Bennett: ERROR ${e}`); }
  }
}

// Kazuha A4
{
  const char = goodData.characters.find(c => c.key === 'KaedeharaKazuha');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'kaedehara_kazuha', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nKazuha (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Kazuha', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Kazuha: ERROR ${e}`); }
  }
}

// Nahida
{
  const char = goodData.characters.find(c => c.key === 'Nahida');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'nahida', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nNahida (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Nahida', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Nahida: ERROR ${e}`); }
  }
}

// Shenhe
{
  const char = goodData.characters.find(c => c.key === 'Shenhe');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'shenhe', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nShenhe (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Shenhe', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Shenhe: ERROR ${e}`); }
  }
}

// Zhongli
{
  const char = goodData.characters.find(c => c.key === 'Zhongli');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'zhongli', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nZhongli (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Zhongli', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Zhongli: ERROR ${e}`); }
  }
}

// Faruzan
{
  const char = goodData.characters.find(c => c.key === 'Faruzan');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'faruzan', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nFaruzan (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Faruzan', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Faruzan: ERROR ${e}`); }
  }
}

// Mona
{
  const char = goodData.characters.find(c => c.key === 'Mona');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'mona', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nMona (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'Mona', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`Mona: ERROR ${e}`); }
  }
}

// KujouSara
{
  const char = goodData.characters.find(c => c.key === 'KujouSara');
  if (char) {
    try {
      const r = get_character_team_buffs(good, 'kujou_sara', char.constellation,
        new Uint32Array([char.talent?.auto || 1, char.talent?.skill || 1, char.talent?.burst || 1]));
      console.log(`\nKujouSara (C${char.constellation}):`);
      for (const b of r) {
        const statStr = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        const flag = b.value === 0 ? ' <<<< ZERO!' : '';
        console.log(`  ${b.source} | ${statStr} = ${b.value}${flag}`);
        if (b.value === 0) issues.push({ char: 'KujouSara', source: b.source, stat: statStr + ' ZERO' });
      }
    } catch (e) { console.log(`KujouSara: ERROR ${e}`); }
  }
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(70));
console.log('  ISSUE SUMMARY');
console.log('='.repeat(70));
if (issues.length === 0) {
  console.log('  No issues found!');
} else {
  for (const issue of issues) {
    console.log(`  [BUG] ${issue.char} (C${issue.constellation ?? '?'}) — ${issue.source}: ${issue.stat}`);
  }
}
console.log(`\nTotal issues: ${issues.length}`);
