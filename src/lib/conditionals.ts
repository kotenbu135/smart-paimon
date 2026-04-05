import { find_artifact_set, find_weapon, get_talent_conditional_buffs } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ConditionalBuff, TalentConditionalBuff } from "../types/wasm";

export interface ConditionalBuffInfo {
  readonly kind: "weapon" | "artifact" | "talent";
  readonly label: string;
  readonly buff: ConditionalBuff | TalentConditionalBuff;
  readonly refinement?: number;
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
          label: weapon.passive.name ?? build.weapon.weapon.name,
          buff: cb,
          refinement: build.weapon.refinement,
        });
      }
    }
  }

  // Artifact 4-piece conditional buffs
  const fourPiece = build.artifacts.sets.find((s) => s.piece_count >= 4);
  if (fourPiece) {
    const setData = find_artifact_set(fourPiece.set.id);
    const conditionals = setData?.four_piece?.conditional_buffs;
    if (conditionals) {
      for (const cb of conditionals) {
        results.push({
          kind: "artifact",
          label: fourPiece.set.name,
          buff: cb,
        });
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
        label: build.character.name,
        buff: cb,
      });
    }
  }

  return results;
}
