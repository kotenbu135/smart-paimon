import { useEffect, useMemo } from "react";
import type { CharacterBuild, BuffActivation } from "../../types/wasm";
import { getConditionalBuffs, type ConditionalBuffInfo } from "../../lib/conditionals";
import { useTeamStore, type MemberActivations } from "../../stores/team";
import { useGoodStore } from "../../stores/good";

const CINDER_CITY_SET_ID = "scroll_of_the_hero_of_cinder_city";

/** Check if a conditional buff's stat matches a given element */
function buffMatchesElement(info: ConditionalBuffInfo, element: string): boolean {
  const stat = info.buff.stat;
  if (typeof stat === "object" && "ElementalDmgBonus" in stat) {
    return stat.ElementalDmgBonus.toLowerCase() === element.toLowerCase();
  }
  return false;
}

interface ActivationPanelProps {
  readonly build: Readonly<CharacterBuild>;
  readonly memberIndex: number;
}

export function ActivationPanel({ build, memberIndex }: ActivationPanelProps) {
  const setActivation = useTeamStore((s) => s.setActivation);
  const stored = useTeamStore((s) => s.activations[memberIndex]);
  const mainDpsIndex = useTeamStore((s) => s.mainDpsIndex);
  const members = useTeamStore((s) => s.members);
  const getBuild = useGoodStore((s) => s.getBuild);
  const conditionals = useMemo(() => getConditionalBuffs(build), [build]);

  // Check if this member has the Cinder City artifact set (4-piece)
  const hasCinderCity = useMemo(() => {
    return build.artifacts.sets.some(
      (entry) => entry.set.id === CINDER_CITY_SET_ID && entry.piece_count >= 4,
    );
  }, [build]);

  // Initialize or reconcile activations when conditionals change
  useEffect(() => {
    if (conditionals.length === 0) return;

    const [existingWeapon = [], existingArtifact = [], existingTalent = []] = stored ?? [[], [], []];

    // Get main DPS element for Cinder City default activation
    let mainElement: string | null = null;
    if (hasCinderCity) {
      const mainDpsId = members[mainDpsIndex];
      if (mainDpsId) {
        const mainBuild = getBuild(mainDpsId);
        mainElement = mainBuild?.character.element ?? null;
      }
    }
    const equippedElement = build.character.element;

    const reconcile = (kind: ConditionalBuffInfo["kind"], existing: readonly BuffActivation[]): BuffActivation[] => {
      const infos = conditionals.filter((c) => c.kind === kind);
      const result: BuffActivation[] = infos.map((info) => {
        const found = existing.find((a) => a.name === info.buff.name);
        if (found) return { ...found };

        // Default activation for Cinder City artifact set
        if (hasCinderCity && kind === "artifact") {
          const matchesMainDps = mainElement !== null && buffMatchesElement(info, mainElement);
          const matchesEquipped = buffMatchesElement(info, equippedElement);
          if (matchesMainDps || matchesEquipped) {
            return { name: info.buff.name, active: true };
          }
        }

        return { name: info.buff.name, active: false };
      });
      return result;
    };

    const weaponActs = reconcile("weapon", existingWeapon);
    const artifactActs = reconcile("artifact", existingArtifact);
    const talentActs = reconcile("talent", existingTalent);

    // Only update if there's a mismatch
    const match = (acts: BuffActivation[], existing: readonly BuffActivation[]) =>
      acts.length === existing.length && acts.every((a, i) => a.name === existing[i]?.name);

    if (!stored || !match(weaponActs, existingWeapon) || !match(artifactActs, existingArtifact) || !match(talentActs, existingTalent)) {
      setActivation(memberIndex, [weaponActs, artifactActs, talentActs]);
    }
  }, [conditionals, memberIndex, setActivation, stored, hasCinderCity, members, mainDpsIndex, build.character.element, getBuild]);

  // No visual UI - activation toggles are in BuffCard
  return null;
}
