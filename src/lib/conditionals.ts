import { find_artifact_set, find_weapon } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ConditionalBuff } from "../types/wasm";

export interface ConditionalBuffInfo {
  readonly kind: "weapon" | "artifact";
  readonly label: string;
  readonly buff: ConditionalBuff;
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

  return results;
}
