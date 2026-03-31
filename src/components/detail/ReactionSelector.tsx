import { useTranslation } from "react-i18next";
import { useCalcStore } from "../../stores/calc";
import type { Reaction } from "@kotenbu/genshin-calc/types";

interface ReactionGroup {
  readonly label: string;
  readonly items: readonly { key: string; value: Reaction | null }[];
}

const GROUPS: ReactionGroup[] = [
  {
    label: "Amplifying",
    items: [
      { key: "none", value: null },
      { key: "vaporize", value: "Vaporize" },
      { key: "melt", value: "Melt" },
    ],
  },
  {
    label: "Transformative",
    items: [
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
    ],
  },
];

export function ReactionSelector() {
  const { t } = useTranslation();
  const { selectedReaction, setReaction } = useCalcStore();

  const isSelected = (value: Reaction | null) =>
    JSON.stringify(value) === JSON.stringify(selectedReaction);

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        {GROUPS.map((group, gi) => (
          <div key={group.label} className="space-y-3">
            {gi > 0 && <div className="lg:hidden border-t border-navy-border" />}
            <h4 className="text-[11px] font-label font-bold text-text-muted uppercase tracking-widest">
              {group.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.items.map(({ key, value }) => (
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
          </div>
        ))}
      </div>
    </section>
  );
}
