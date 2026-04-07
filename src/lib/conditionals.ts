import { find_artifact_set, find_weapon, get_talent_conditional_buffs } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ConditionalBuff, TalentConditionalBuff, BuffActivationType, ManualActivation } from "../types/wasm";

export interface ConditionalBuffInfo {
  readonly kind: "weapon" | "artifact" | "talent";
  readonly label: string;
  readonly sourceId?: string;
  readonly buff: ConditionalBuff | TalentConditionalBuff;
  readonly refinement?: number;
}

/** Extract the Manual activation part from any BuffActivationType */
export function getManualActivation(activation: BuffActivationType): ManualActivation | null {
  if ("Manual" in activation) return activation.Manual;
  if ("Both" in activation) return activation.Both[1];
  return null; // Auto-only has no manual control
}

/** Check if an activation requires nightsoul */
export function isNightsoulRequired(activation: BuffActivationType): boolean {
  if ("Auto" in activation) return activation.Auto === "NightsoulRequired";
  if ("Both" in activation) return activation.Both[0] === "NightsoulRequired";
  return false;
}

export function getConditionalBuffs(build: CharacterBuild): readonly ConditionalBuffInfo[] {
  const results: ConditionalBuffInfo[] = [];

  // Weapon conditional buffs
  if (build.weapon) {
    const weapon = find_weapon(build.weapon.weapon.id);
    const conditionals = weapon?.passive?.effect?.conditional_buffs;
    if (conditionals) {
      for (const cb of conditionals) {
        results.push({
          kind: "weapon",
          label: build.weapon.weapon.name,
          sourceId: build.weapon.weapon.id,
          buff: cb,
          refinement: build.weapon.refinement,
        });
      }
    }
  }

  // Artifact conditional buffs (2-piece and 4-piece)
  for (const entry of build.artifacts.sets) {
    const setData = find_artifact_set(entry.set.id);
    if (!setData) continue;

    if (entry.piece_count >= 2) {
      const twoPieceConditionals = setData.two_piece?.conditional_buffs;
      if (twoPieceConditionals) {
        for (const cb of twoPieceConditionals) {
          results.push({
            kind: "artifact",
            label: entry.set.name,
            sourceId: entry.set.id,
            buff: cb,
          });
        }
      }
    }

    if (entry.piece_count >= 4) {
      const fourPieceConditionals = setData.four_piece?.conditional_buffs;
      if (fourPieceConditionals) {
        for (const cb of fourPieceConditionals) {
          results.push({
            kind: "artifact",
            label: entry.set.name,
            sourceId: entry.set.id,
            buff: cb,
          });
        }
      }
    }
  }

  // Talent conditional buffs (v0.5.3)
  const talentConditionals = get_talent_conditional_buffs(
    build.character.id,
    build.constellation,
    new Uint32Array(build.talent_levels),
  ) as TalentConditionalBuff[];
  if (talentConditionals) {
    for (const cb of talentConditionals) {
      results.push({
        kind: "talent",
        label: cb.name,
        buff: cb,
      });
    }
  }

  return results;
}
