import { useTranslation } from "react-i18next";
import { useCalcStore } from "../../stores/calc";
import type { Reaction } from "@kotenbu/genshin-calc/types";

const REACTIONS: { key: string; value: Reaction | null }[] = [
  { key: "none", value: null },
  { key: "vaporize", value: "Vaporize" },
  { key: "melt", value: "Melt" },
  { key: "aggravate", value: "Aggravate" },
  { key: "spread", value: "Spread" },
  { key: "overloaded", value: "Overloaded" },
  { key: "superconduct", value: "Superconduct" },
  { key: "electroCharged", value: "ElectroCharged" },
  { key: "swirl", value: { Swirl: "Pyro" } },
  { key: "bloom", value: "Bloom" },
  { key: "hyperbloom", value: "Hyperbloom" },
  { key: "burgeon", value: "Burgeon" },
  { key: "burning", value: "Burning" },
];

export function ReactionSelector() {
  const { t } = useTranslation();
  const { selectedReaction, setReaction } = useCalcStore();
  const isSelected = (value: Reaction | null) => JSON.stringify(value) === JSON.stringify(selectedReaction);
  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTIONS.map(({ key, value }) => (
        <button key={key} onClick={() => setReaction(value)}
          className={`px-2 py-1 text-xs rounded transition-colors ${isSelected(value) ? "bg-sky-500/20 text-sky-400 border border-sky-500/40" : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200"}`}>
          {t(`reaction.${key}`)}
        </button>
      ))}
    </div>
  );
}
