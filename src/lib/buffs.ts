import type { CharacterBuild, Element as GenshinElement, ResolvedBuff } from "../types/wasm";
import type { BuffBreakdown, BuffBreakdownEntry } from "../stores/team";
import { getResonanceBuffs } from "../data/resonance";
import { getArtifactTeamBuffs } from "../data/artifact-buffs";
import { getCharacterBuffs } from "../data/character-buffs";
import { getWeaponTeamBuffs } from "../data/weapon-buffs";

// ---------- Buff assembly for TeamMember.buffs_provided ----------

export function assembleBuffsProvided(build: CharacterBuild): readonly ResolvedBuff[] {
  return [
    ...getCharacterBuffs(build),
    ...getWeaponTeamBuffs(build),
    ...getArtifactTeamBuffs(build.artifacts.four_piece_set?.id, build.character.id),
  ];
}

// ---------- Element resonance (applied as if from a virtual "resonance" member) ----------

export function assembleResonanceBuffs(
  elements: readonly (GenshinElement | null)[],
): readonly ResolvedBuff[] {
  return getResonanceBuffs(elements);
}

// ---------- BuffBreakdown for UI ----------

function parseBuffSource(source: string): { characterId: string; label: string } {
  // Formats:
  //   "bennett:burst" → characterId=bennett, label=burst
  //   "bennett:weapon:ttds" → characterId=bennett, label=weapon:ttds
  //   "resonance:pyro" → characterId=resonance, label=pyro
  //   "artifact:noblesse_oblige" → characterId=artifact, label=noblesse_oblige
  //   "kazuha:artifact:noblesse_oblige" → characterId=kazuha, label=artifact:noblesse_oblige
  const firstColon = source.indexOf(":");
  if (firstColon === -1) return { characterId: source, label: source };
  return {
    characterId: source.slice(0, firstColon),
    label: source.slice(firstColon + 1),
  };
}

interface BuildInfo {
  readonly characterId: string;
  readonly characterName: string;
  readonly element: GenshinElement;
}

export function buildBuffBreakdown(
  memberBuilds: readonly (BuildInfo | null)[],
  memberBuffs: readonly (readonly ResolvedBuff[])[],
  resonanceBuffs: readonly ResolvedBuff[],
): readonly BuffBreakdown[] {
  const breakdowns: BuffBreakdown[] = [];

  // Per-character buffs
  for (let i = 0; i < memberBuilds.length; i++) {
    const info = memberBuilds[i];
    const buffs = memberBuffs[i];
    if (!info || !buffs || buffs.length === 0) continue;

    breakdowns.push({
      sourceCharacterId: info.characterId,
      sourceCharacterName: info.characterName,
      sourceElement: info.element,
      buffs: buffs.map((b): BuffBreakdownEntry => {
        const { label } = parseBuffSource(b.source);
        return {
          name: label,
          stat: b.stat,
          value: b.value,
          target: b.target,
        };
      }),
    });
  }

  // Element resonance buffs (grouped under "resonance" source)
  if (resonanceBuffs.length > 0) {
    breakdowns.push({
      sourceCharacterId: "resonance",
      sourceCharacterName: "Element Resonance",
      sourceElement: "Pyro", // placeholder — UI should handle "resonance" specially
      buffs: resonanceBuffs.map((b): BuffBreakdownEntry => {
        const { label } = parseBuffSource(b.source);
        return {
          name: label,
          stat: b.stat,
          value: b.value,
          target: b.target,
        };
      }),
    });
  }

  return breakdowns;
}
