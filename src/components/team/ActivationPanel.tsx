import { useEffect, useMemo } from "react";
import type { CharacterBuild, BuffActivation } from "../../types/wasm";
import { getConditionalBuffs, getManualActivation, type ConditionalBuffInfo } from "../../lib/conditionals";
import { useTeamStore } from "../../stores/team";
import { useGoodStore } from "../../stores/good";

/** Extract element from an element-specific stat, or null for generic stats */
function getStatElement(stat: import("../../types/wasm").BuffableStat): string | null {
  if (typeof stat === "object") {
    if ("ElementalDmgBonus" in stat) return stat.ElementalDmgBonus;
    if ("ElementalRes" in stat) return stat.ElementalRes;
    if ("ElementalResReduction" in stat) return stat.ElementalResReduction;
  }
  return null;
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

  // Initialize or reconcile activations when conditionals change
  useEffect(() => {
    if (conditionals.length === 0) return;

    const [existingWeapon = [], existingArtifact = [], existingTalent = []] = stored ?? [[], [], []];

    // Get main DPS element for relevance check
    const mainDpsId = members[mainDpsIndex];
    const mainElement = mainDpsId ? (getBuild(mainDpsId)?.character.element ?? null) : null;
    const equippedElement = build.character.element;

    const isElementRelevant = (buffElement: string): boolean => {
      const el = buffElement.toLowerCase();
      return (mainElement !== null && el === mainElement.toLowerCase()) ||
             el === equippedElement.toLowerCase();
    };

    const reconcile = (kind: ConditionalBuffInfo["kind"], existing: readonly BuffActivation[]): BuffActivation[] => {
      const infos = conditionals.filter((c) => c.kind === kind);
      return infos.map((info) => {
        const found = existing.find((a) => a.name === info.buff.name);
        const buffElement = getStatElement(info.buff.stat);
        const isAutoOnly = getManualActivation(info.buff.activation) === null;

        // Auto-only + element-specific: always re-evaluate based on team composition
        // (no manual state to preserve)
        if (isAutoOnly && buffElement !== null) {
          return { name: info.buff.name, active: isElementRelevant(buffElement) };
        }

        // Manual/Both: preserve existing user toggle & stacks
        if (found) return { ...found };

        // New entry: default based on element relevance
        if (buffElement !== null) {
          return { name: info.buff.name, active: isElementRelevant(buffElement) };
        }

        return { name: info.buff.name, active: true };
      });
    };

    const weaponActs = reconcile("weapon", existingWeapon);
    const artifactActs = reconcile("artifact", existingArtifact);
    const talentActs = reconcile("talent", existingTalent);

    // Only update if there's a mismatch
    const match = (acts: BuffActivation[], existing: readonly BuffActivation[]) =>
      acts.length === existing.length && acts.every((a, i) =>
        a.name === existing[i]?.name && a.active === existing[i]?.active && a.stacks === existing[i]?.stacks);

    if (!stored || !match(weaponActs, existingWeapon) || !match(artifactActs, existingArtifact) || !match(talentActs, existingTalent)) {
      setActivation(memberIndex, [weaponActs, artifactActs, talentActs]);
    }
  }, [conditionals, memberIndex, setActivation, stored, members, mainDpsIndex, build.character.element, getBuild]);

  // No visual UI - activation toggles are in BuffCard
  return null;
}
