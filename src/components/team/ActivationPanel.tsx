import { useEffect, useMemo } from "react";
import type { CharacterBuild, BuffActivation } from "../../types/wasm";
import { getConditionalBuffs, type ConditionalBuffInfo } from "../../lib/conditionals";
import { useTeamStore, type MemberActivations } from "../../stores/team";

interface ActivationPanelProps {
  readonly build: Readonly<CharacterBuild>;
  readonly memberIndex: number;
}

export function ActivationPanel({ build, memberIndex }: ActivationPanelProps) {
  const setActivation = useTeamStore((s) => s.setActivation);
  const stored = useTeamStore((s) => s.activations[memberIndex]);
  const conditionals = useMemo(() => getConditionalBuffs(build), [build]);

  // Initialize or reconcile activations when conditionals change
  useEffect(() => {
    if (conditionals.length === 0) return;

    const [existingWeapon = [], existingArtifact = [], existingTalent = []] = stored ?? [[], [], []];

    const reconcile = (kind: ConditionalBuffInfo["kind"], existing: readonly BuffActivation[]): BuffActivation[] => {
      const names = conditionals.filter((c) => c.kind === kind).map((c) => c.buff.name);
      const result: BuffActivation[] = names.map((name) => {
        const found = existing.find((a) => a.name === name);
        return found ? { ...found } : { name, active: false };
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
  }, [conditionals, memberIndex, setActivation, stored]);

  if (conditionals.length === 0) return null;

  const [weaponActs = [], artifactActs = [], talentActs = []] = stored ?? [[], [], []];

  const getList = (kind: ConditionalBuffInfo["kind"]): readonly BuffActivation[] => {
    if (kind === "weapon") return weaponActs;
    if (kind === "artifact") return artifactActs;
    return talentActs;
  };

  const findActivation = (buff: ConditionalBuffInfo): BuffActivation | undefined => {
    return getList(buff.kind).find((a) => a.name === buff.buff.name);
  };

  const toggleActivation = (info: ConditionalBuffInfo) => {
    const list = [...getList(info.kind)];
    const idx = list.findIndex((a) => a.name === info.buff.name);
    if (idx === -1) return;

    const current = list[idx];
    const activation = info.buff.activation;
    const isStacks = typeof activation === "object" && "Manual" in activation && typeof activation.Manual === "object" && "Stacks" in activation.Manual;

    if (isStacks) {
      const maxStacks = (activation.Manual as { Stacks: number }).Stacks;
      const currentStacks = current.stacks ?? 0;
      if (!current.active) {
        list[idx] = { name: current.name, active: true, stacks: maxStacks };
      } else if (currentStacks > 1) {
        list[idx] = { name: current.name, active: true, stacks: currentStacks - 1 };
      } else {
        list[idx] = { name: current.name, active: false };
      }
    } else {
      list[idx] = { name: current.name, active: !current.active };
    }

    const next: MemberActivations = info.kind === "weapon"
      ? [list, [...artifactActs], [...talentActs]]
      : info.kind === "artifact"
        ? [[...weaponActs], list, [...talentActs]]
        : [[...weaponActs], [...artifactActs], list];
    setActivation(memberIndex, next);
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {conditionals.map((info) => {
        const act = findActivation(info);
        const active = act?.active ?? false;
        const activation = info.buff.activation;
        const isStacks = typeof activation === "object" && "Manual" in activation && typeof activation.Manual === "object" && "Stacks" in activation.Manual;
        const maxStacks = isStacks ? (activation.Manual as { Stacks: number }).Stacks : 0;
        const currentStacks = act?.stacks ?? 0;

        return (
          <button
            key={info.buff.name}
            type="button"
            onClick={() => toggleActivation(info)}
            title={info.buff.description}
            className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors
              ${active
                ? "bg-gold/20 text-gold border border-gold/40"
                : "bg-navy-border/50 text-text-muted border border-transparent hover:bg-navy-hover"
              }`}
          >
            {info.label}
            {isStacks && active && (
              <span className="ml-0.5 text-[8px]">×{currentStacks}/{maxStacks}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
