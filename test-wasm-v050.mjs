import fs from 'fs';
import { initSync, build_team_member, build_member_stats, resolve_team_stats, find_artifact_set, find_character, get_character_team_buffs } from '@kotenbu135/genshin-calc-wasm';

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

function expectTrue(label, condition) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    pass++;
  } else {
    console.log(`  [FAIL] ${label}`);
    fail++;
  }
}

// ============================================================
// 1. build_team_member basic call
// ============================================================
console.log('\n=== 1. build_team_member basic call ===');
{
  // Use a character from the sample data
  const chars = goodData.characters.map(c => c.key.toLowerCase());
  console.log(`  Available characters: ${chars.slice(0, 10).join(', ')}...`);

  // Try with Bennett (common support)
  try {
    const member = build_team_member(good, 'bennett', [], []);
    console.log('  build_team_member("bennett") returned:');
    console.log(`    element: ${member.element}`);
    console.log(`    weapon_type: ${member.weapon_type}`);
    console.log(`    is_moonsign: ${member.is_moonsign}`);
    console.log(`    stats keys: ${Object.keys(member.stats).join(', ')}`);
    console.log(`    buffs_provided count: ${member.buffs_provided.length}`);

    expectTrue('Has element', !!member.element);
    expectTrue('Has weapon_type', !!member.weapon_type);
    expectTrue('Has stats', !!member.stats);
    expectTrue('Has buffs_provided', Array.isArray(member.buffs_provided));
    expectTrue('buffs_provided has entries', member.buffs_provided.length > 0);

    // Show all buffs
    console.log('    Buffs:');
    for (const b of member.buffs_provided) {
      const stat = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
      console.log(`      ${b.source} → ${stat} = ${b.value} (target: ${b.target})`);
    }
  } catch (e) {
    console.log(`  [FAIL] build_team_member threw: ${e.message}`);
    fail++;
  }
}

// ============================================================
// 2. Compare build_team_member vs build_member_stats
// ============================================================
console.log('\n=== 2. build_team_member vs build_member_stats (no activations) ===');
{
  try {
    const memberNew = build_team_member(good, 'bennett', [], []);
    const statsOld = build_member_stats(good, 'bennett');

    console.log('  Old (build_member_stats) stat keys:', Object.keys(statsOld).join(', '));
    console.log('  New (build_team_member) stat keys:', Object.keys(memberNew.stats).join(', '));

    // Stats should be comparable when no activations
    const oldKeys = Object.keys(statsOld).sort();
    const newKeys = Object.keys(memberNew.stats).sort();
    expectTrue('Same stat keys', JSON.stringify(oldKeys) === JSON.stringify(newKeys));

    // Compare some values
    for (const key of ['base_hp', 'base_atk', 'base_def', 'crit_rate', 'crit_dmg']) {
      if (statsOld[key] !== undefined && memberNew.stats[key] !== undefined) {
        expect(`${key} match`, memberNew.stats[key], statsOld[key], 0.001);
      }
    }
  } catch (e) {
    console.log(`  [FAIL] Comparison threw: ${e.message}`);
    fail++;
  }
}

// ============================================================
// 3. build_team_member with artifact activations
// ============================================================
console.log('\n=== 3. build_team_member with artifact activations ===');
{
  // Find a character with a crit-boosting artifact set
  // Check what sets are in sample data
  for (const char of goodData.characters.slice(0, 5)) {
    const id = char.key.toLowerCase();
    try {
      const memberBase = build_team_member(good, id, [], []);
      const charInfo = find_character(id);
      if (!charInfo) continue;

      // Find their artifact set
      const artifacts = goodData.artifacts?.filter(a => a.location === char.key) || [];
      const setCounts = {};
      for (const a of artifacts) {
        setCounts[a.setKey] = (setCounts[a.setKey] || 0) + 1;
      }
      const fourPiece = Object.entries(setCounts).find(([, count]) => count >= 4);
      if (!fourPiece) continue;

      const setId = fourPiece[0].replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      const setData = find_artifact_set(setId);

      console.log(`  ${char.key}: 4-piece ${fourPiece[0]} (id: ${setId})`);
      if (setData?.conditional_buffs?.length > 0) {
        console.log(`    Has ${setData.conditional_buffs.length} conditional buff(s):`);
        for (const cb of setData.conditional_buffs) {
          console.log(`      ${cb.name}: ${cb.stat} activation=${JSON.stringify(cb.activation)}`);
        }

        // Try activating the conditional buff
        const activations = setData.conditional_buffs.map(cb => ({
          name: cb.name,
          active: true,
          stacks: cb.activation?.Manual?.Stacks || undefined,
        }));

        const memberActivated = build_team_member(good, id, [], activations);

        // Compare stats
        console.log('    Comparing stats (no activation vs activated):');
        const diffKeys = [];
        for (const key of Object.keys(memberBase.stats)) {
          const diff = memberActivated.stats[key] - memberBase.stats[key];
          if (Math.abs(diff) > 0.001) {
            console.log(`      ${key}: ${memberBase.stats[key]} → ${memberActivated.stats[key]} (diff: ${diff > 0 ? '+' : ''}${diff.toFixed(4)})`);
            diffKeys.push(key);
          }
        }
        if (diffKeys.length > 0) {
          console.log(`    [PASS] Activation changed ${diffKeys.length} stat(s)`);
          pass++;
        } else {
          console.log(`    [INFO] No stat difference (may be expected for team-only buffs)`);
        }
      }
    } catch (e) {
      // Skip characters that fail
    }
  }
}

// ============================================================
// 4. build_team_member includes character team buffs?
// ============================================================
console.log('\n=== 4. build_team_member buffs_provided vs manual assembly ===');
{
  try {
    const member = build_team_member(good, 'bennett', [], []);
    const bennettChar = goodData.characters.find(c => c.key === 'Bennett');
    const charBuffs = get_character_team_buffs(good, 'bennett', bennettChar.constellation,
      new Uint32Array([bennettChar.talent?.auto || 1, bennettChar.talent?.skill || 1, bennettChar.talent?.burst || 1]));

    console.log(`  build_team_member buffs: ${member.buffs_provided.length}`);
    console.log(`  get_character_team_buffs: ${charBuffs.length}`);

    // Check if character team buffs are included
    for (const cb of charBuffs) {
      const found = member.buffs_provided.find(b => b.source === cb.source && b.stat === cb.stat);
      if (found) {
        console.log(`    [INCLUDED] ${cb.source} (${cb.stat})`);
      } else {
        console.log(`    [MISSING] ${cb.source} (${cb.stat})`);
      }
    }

    // List any extra buffs from build_team_member not in charBuffs
    const charSources = new Set(charBuffs.map(b => `${b.source}:${typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat}`));
    const extras = member.buffs_provided.filter(b => {
      const key = `${b.source}:${typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat}`;
      return !charSources.has(key);
    });
    if (extras.length > 0) {
      console.log(`    Extra buffs from build_team_member (${extras.length}):`);
      for (const b of extras) {
        const stat = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        console.log(`      ${b.source} → ${stat} = ${b.value}`);
      }
    }
  } catch (e) {
    console.log(`  [FAIL] Comparison threw: ${e.message}`);
    fail++;
  }
}

// ============================================================
// 5. resolve_team_stats with build_team_member
// ============================================================
console.log('\n=== 5. resolve_team_stats with build_team_member ===');
{
  try {
    // Build a 2-person team: Bennett + a DPS
    const dpsChar = goodData.characters.find(c => c.key !== 'Bennett');
    const dpsId = dpsChar?.key.toLowerCase();

    if (dpsId) {
      const bennettMember = build_team_member(good, 'bennett', [], []);
      const dpsMember = build_team_member(good, dpsId, [], []);

      console.log(`  Team: ${dpsId} (DPS) + Bennett`);
      const result = resolve_team_stats([dpsMember, bennettMember], 0);

      console.log(`  base_stats.atk: ${result.base_stats.atk}`);
      console.log(`  final_stats.atk: ${result.final_stats.atk}`);
      console.log(`  applied_buffs: ${result.applied_buffs.length}`);
      console.log(`  resonances: ${JSON.stringify(result.resonances)}`);

      expectTrue('final_stats.atk >= base_stats.atk', result.final_stats.atk >= result.base_stats.atk);
      expectTrue('Has applied_buffs', result.applied_buffs.length > 0);

      console.log('  Applied buffs:');
      for (const b of result.applied_buffs) {
        const stat = typeof b.stat === 'object' ? JSON.stringify(b.stat) : b.stat;
        console.log(`    ${b.source} → ${stat} = ${b.value}`);
      }
    }
  } catch (e) {
    console.log(`  [FAIL] resolve_team_stats threw: ${e.message}`);
    fail++;
  }
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`  RESULTS: ${pass} passed, ${fail} failed`);
console.log('='.repeat(50));
process.exit(fail > 0 ? 1 : 0);
