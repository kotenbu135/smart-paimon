import { useTranslation } from "react-i18next";
import { useTeamStore } from "../../stores/team";
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
];

export function ReactionSelector() {
  const { t } = useTranslation();
  const { selectedReaction, setReaction } = useTeamStore();

  const isSelected = (value: Reaction | null) =>
    JSON.stringify(value) === JSON.stringify(selectedReaction);

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg p-5">
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map(({ key, value }) => (
          <button
            key={key}
            onClick={() => setReaction(value)}
            className={`px-3 py-1.5 rounded text-[12px] font-medium transition-colors ${
              isSelected(value)
                ? "bg-pyro text-white"
                : "bg-navy-border text-text-secondary hover:bg-navy-hover"
            }`}
          >
            {t(`reaction.${key}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
