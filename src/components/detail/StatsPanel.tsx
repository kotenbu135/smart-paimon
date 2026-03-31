import { useTranslation } from "react-i18next";
import type { Stats } from "@kotenbu/genshin-calc/types";

interface StatsPanelProps {
  readonly stats: Readonly<Stats>;
  readonly elementDmgLabel?: string;
}

const fmt = (v: number, pct: boolean) =>
  pct ? `${(v * 100).toFixed(1)}%` : Math.round(v).toLocaleString();

export function StatsPanel({ stats, elementDmgLabel }: StatsPanelProps) {
  const { t } = useTranslation();

  const rows = [
    { label: t("stats.hp"), value: stats.hp, pct: false },
    { label: t("stats.atk"), value: stats.atk, pct: false },
    { label: t("stats.def"), value: stats.def, pct: false },
    { label: t("stats.em"), value: stats.elemental_mastery, pct: false },
    { label: t("stats.critRate"), value: stats.crit_rate, pct: true },
    { label: t("stats.critDmg"), value: stats.crit_dmg, pct: true },
    { label: t("stats.er"), value: stats.energy_recharge, pct: true },
    { label: elementDmgLabel ?? t("stats.dmgBonus"), value: stats.dmg_bonus, pct: true, highlight: true },
  ];

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg overflow-hidden">
      <div className="bg-navy-hover/50 px-4 py-2 border-b border-navy-border">
        <span className="text-[11px] font-label font-bold tracking-widest text-text-secondary uppercase">
          {t("detail.stats")}
        </span>
      </div>
      <div className="p-2">
        {rows.map(({ label, value, pct, highlight }) => (
          <div
            key={label}
            className="flex justify-between items-center h-9 px-3 border-b border-navy-border/50 last:border-0"
          >
            <span className="text-[13px] text-text-secondary">{label}</span>
            <span className={`text-[14px] font-mono ${highlight ? "text-pyro" : "text-text-primary"}`}>
              {fmt(value, pct)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
