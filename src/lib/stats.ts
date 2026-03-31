import type { CharacterBuild, Stats } from "@kotenbu/genshin-calc/types";

const BASE_CRIT_RATE = 0.05;
const BASE_CRIT_DMG = 0.50;
const BASE_ENERGY_RECHARGE = 1.0;

const DMG_BONUS_ASCENSION_STATS = new Set([
  "pyro_dmg_bonus", "hydro_dmg_bonus", "electro_dmg_bonus", "cryo_dmg_bonus",
  "anemo_dmg_bonus", "geo_dmg_bonus", "dendro_dmg_bonus", "physical_dmg_bonus",
]);

export function buildStats(build: CharacterBuild): Stats {
  const { character, weapon, artifacts } = build;
  const art = artifacts.stats;

  const baseHp = character.base_hp;
  const baseAtk = character.base_atk + (weapon?.weapon.base_atk ?? 0);
  const baseDef = character.base_def;

  const weaponSub = weapon?.weapon.sub_stat;
  const weaponSubVal = weapon?.weapon.sub_stat_value ?? 0;
  const ascStat = character.ascension_stat;
  const ascVal = character.ascension_stat_value;

  const add = (stat: string) =>
    (weaponSub === stat ? weaponSubVal : 0) + (ascStat === stat ? ascVal : 0);

  const hp = baseHp * (1 + art.hp_percent + add("hp_percent")) + art.hp_flat;
  const atk = baseAtk * (1 + art.atk_percent + add("atk_percent")) + art.atk_flat;
  const def = baseDef * (1 + art.def_percent + add("def_percent")) + art.def_flat;
  const elemental_mastery = art.elemental_mastery + add("elemental_mastery");
  const crit_rate = BASE_CRIT_RATE + art.crit_rate + add("crit_rate");
  const crit_dmg = BASE_CRIT_DMG + art.crit_dmg + add("crit_dmg");
  const energy_recharge = BASE_ENERGY_RECHARGE + art.energy_recharge + add("energy_recharge");
  const dmg_bonus = art.dmg_bonus + (DMG_BONUS_ASCENSION_STATS.has(ascStat) ? ascVal : 0);

  return { hp, atk, def, elemental_mastery, crit_rate, crit_dmg, energy_recharge, dmg_bonus };
}
