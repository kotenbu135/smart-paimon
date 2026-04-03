import type { ArtifactSlot } from "./charAssets";

export interface GoodArtifact {
  setKey: string;
  slotKey: ArtifactSlot;
  level: number;
  rarity: number;
  mainStatKey: string;
  location: string;
  substats: ReadonlyArray<{ key: string; value: number }>;
}

interface GoodJson {
  artifacts?: GoodArtifact[];
}

/** Convert PascalCase GOOD key to snake_case wasm ID */
function toSnakeCase(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/** Extract the 5 equipped artifacts for a character from raw GOOD JSON */
export function getCharacterArtifacts(
  rawJson: string,
  characterId: string,
): Partial<Record<ArtifactSlot, GoodArtifact>> {
  try {
    const data: GoodJson = JSON.parse(rawJson);
    const artifacts = data.artifacts ?? [];
    const result: Partial<Record<ArtifactSlot, GoodArtifact>> = {};

    for (const art of artifacts) {
      if (!art.location) continue;
      if (toSnakeCase(art.location) === characterId) {
        result[art.slotKey] = art;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** GOOD stat key → i18n key mapping */
const STAT_I18N: Record<string, string> = {
  hp: "artifact.stat.hpFlat",
  hp_: "artifact.stat.hpPercent",
  atk: "artifact.stat.atkFlat",
  atk_: "artifact.stat.atkPercent",
  def: "artifact.stat.defFlat",
  def_: "artifact.stat.defPercent",
  eleMas: "artifact.stat.em",
  enerRech_: "artifact.stat.er",
  critRate_: "artifact.stat.critRate",
  critDMG_: "artifact.stat.critDmg",
  heal_: "artifact.stat.healing",
  pyro_dmg_: "artifact.stat.pyroDmg",
  hydro_dmg_: "artifact.stat.hydroDmg",
  electro_dmg_: "artifact.stat.electroDmg",
  cryo_dmg_: "artifact.stat.cryoDmg",
  dendro_dmg_: "artifact.stat.dendroDmg",
  anemo_dmg_: "artifact.stat.anemoDmg",
  geo_dmg_: "artifact.stat.geoDmg",
  physical_dmg_: "artifact.stat.physicalDmg",
};

export function statI18nKey(statKey: string): string {
  return STAT_I18N[statKey] ?? statKey;
}

/** Whether the stat is displayed as percentage */
export function isPercentStat(statKey: string): boolean {
  return statKey.endsWith("_") || statKey.endsWith("_dmg_");
}

/** Format stat value for display */
export function formatStatValue(statKey: string, value: number): string {
  return isPercentStat(statKey) ? `${value.toFixed(1)}%` : Math.round(value).toLocaleString();
}

/** Convert GOOD setKey (PascalCase) to asset ID (snake_case) */
export function setKeyToAssetId(setKey: string): string {
  return toSnakeCase(setKey);
}
