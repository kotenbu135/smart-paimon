import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTeamStore } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import { getAvailableReactionKeys } from "../../lib/damage";
import type { Reaction } from "../../types/wasm";

const REACTIONS: readonly { key: string; value: Reaction | null }[] = [
  { key: "none", value: null },
  { key: "vaporize", value: "Vaporize" },
  { key: "melt", value: "Melt" },
  { key: "overloaded", value: "Overloaded" },
  { key: "superconduct", value: "Superconduct" },
  { key: "electroCharged", value: "ElectroCharged" },
  { key: "swirl", value: { Swirl: "Pyro" } },
  { key: "bloom", value: "Bloom" },
  { key: "hyperbloom", value: "Hyperbloom" },
  { key: "burgeon", value: "Burgeon" },
  { key: "burning", value: "Burning" },
  { key: "aggravate", value: "Aggravate" },
  { key: "spread", value: "Spread" },
  { key: "lunarElectroCharged", value: "LunarElectroCharged" },
  { key: "lunarBloom", value: "LunarBloom" },
  { key: "lunarCrystallize", value: "LunarCrystallize" },
  { key: "lunarCrystallizeSecondary", value: "LunarCrystallizeSecondary" },
];

interface ReactionSelectorProps {
  readonly inline?: boolean;
}

export function ReactionSelector({ inline }: ReactionSelectorProps) {
  const { t } = useTranslation();
  const { selectedReaction, setReaction, members, mainDpsIndex } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);

  const availableKeys = useMemo(() => {
    const dpsId = members[mainDpsIndex];
    if (!dpsId) return null;
    const build = getBuild(dpsId);
    if (!build) return null;
    return new Set(getAvailableReactionKeys(build.character.element));
  }, [members, mainDpsIndex, getBuild]);

  const isSelected = (value: Reaction | null) =>
    JSON.stringify(value) === JSON.stringify(selectedReaction);

  const buttons = (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ key, value }) => {
        const disabled = value !== null && availableKeys !== null && !availableKeys.has(key);
        return (
          <button
            key={key}
            onClick={() => !disabled && setReaction(value)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
              disabled
                ? "bg-navy-border/50 text-text-secondary/30 cursor-not-allowed"
                : isSelected(value)
                  ? "bg-pyro text-white"
                  : "bg-navy-border text-text-secondary hover:bg-navy-hover"
            }`}
          >
            {t(`reaction.${key}`)}
          </button>
        );
      })}
    </div>
  );

  if (inline) return buttons;

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg p-5">
      {buttons}
    </section>
  );
}
