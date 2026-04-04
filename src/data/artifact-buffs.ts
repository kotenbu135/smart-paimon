import type { ResolvedBuff } from "../types/wasm";

interface ArtifactSetBuffDef {
  readonly setId: string;
  readonly buffs: readonly ResolvedBuff[];
}

// Artifact 4-piece set effects that provide team-wide buffs.
// Only sets with Team or TeamExcludeSelf target are listed here.
// Self-only set bonuses are already factored into the character's own stats.
const ARTIFACT_TEAM_BUFFS: readonly ArtifactSetBuffDef[] = [
  {
    // Noblesse Oblige 4pc: Using an Elemental Burst increases all party members' ATK by 20%
    setId: "noblesse_oblige",
    buffs: [{ source: "artifact:noblesse_oblige", stat: "AtkPercent", value: 0.2, target: "Team" }],
  },
  {
    // Tenacity of the Millelith 4pc: Elemental Skill hits increase ATK of all party members by 20%
    setId: "tenacity_of_the_millelith",
    buffs: [{ source: "artifact:tenacity_of_the_millelith", stat: "AtkPercent", value: 0.2, target: "Team" }],
  },
  {
    // Instructor 4pc: After using Elemental Skill, increase EM of all party members by 120
    setId: "instructor",
    buffs: [{ source: "artifact:instructor", stat: "ElementalMastery", value: 120, target: "Team" }],
  },
  {
    // Archaic Petra 4pc: Gain 35% DMG Bonus for that element (conditional on crystallize pickup)
    // Simplified: apply as generic DmgBonus since element matching is complex
    setId: "archaic_petra",
    buffs: [{ source: "artifact:archaic_petra", stat: "DmgBonus", value: 0.35, target: "Team" }],
  },
  {
    // Viridescent Venerer 4pc: Decreases opponent's Elemental RES to the element in Swirl by 40%
    // Modeled as team benefit — applied as resistance reduction
    // Since BuffableStat doesn't directly model enemy RES reduction in a generic way,
    // we skip this for now. The DPS increase from VV is handled via enemy resistance in combat.
    setId: "viridescent_venerer",
    buffs: [],
  },
  {
    // Deepwood Memories 4pc: Decreases opponent's Dendro RES by 30%
    // Same as VV — enemy resistance reduction, not a direct stat buff
    setId: "deepwood_memories",
    buffs: [],
  },
  {
    // Song of Days Past 4pc (Nighttime Whispers in the Echoing Woods):
    // After Normal/Charged/Plunging/Skill/Burst hits, party members gain Yearning effect
    // Max 1000 flat DMG bonus to Normal/Charged/Plunging attacks
    setId: "song_of_days_past",
    buffs: [
      { source: "artifact:song_of_days_past", stat: "NormalAtkFlatDmg", value: 1000, target: "TeamExcludeSelf" },
      { source: "artifact:song_of_days_past", stat: "ChargedAtkFlatDmg", value: 1000, target: "TeamExcludeSelf" },
      { source: "artifact:song_of_days_past", stat: "PlungingAtkFlatDmg", value: 1000, target: "TeamExcludeSelf" },
    ],
  },
  {
    // Scroll of the Hero of Cinder City 4pc:
    // When Burning/Vaporize/Melt/Overload/Bloom triggers, all nearby party members gain
    // 12% Elemental DMG Bonus for the corresponding element(s)
    // Simplified as generic DmgBonus
    setId: "scroll_of_the_hero_of_cinder_city",
    buffs: [{ source: "artifact:scroll_of_the_hero_of_cinder_city", stat: "DmgBonus", value: 0.12, target: "Team" }],
  },
];

export function getArtifactTeamBuffs(
  fourPieceSetId: string | undefined,
  sourceCharacterId: string,
): readonly ResolvedBuff[] {
  if (!fourPieceSetId) return [];
  const def = ARTIFACT_TEAM_BUFFS.find((d) => d.setId === fourPieceSetId);
  if (!def || def.buffs.length === 0) return [];
  // Override source to include the character who wears the set
  return def.buffs.map((b) => ({ ...b, source: `${sourceCharacterId}:${b.source}` }));
}
