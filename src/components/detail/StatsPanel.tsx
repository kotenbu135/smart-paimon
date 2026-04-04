import { useTranslation } from "react-i18next";
import type { ExtendedStats } from "../../types/wasm";

interface StatsPanelProps {
  readonly stats: Readonly<ExtendedStats>;
}

const fmt = (v: number, pct: boolean) =>
  pct ? `${(v * 100).toFixed(1)}%` : Math.round(v).toLocaleString();

const ELEMENT_BONUSES: Array<{
  key: keyof ExtendedStats;
  labelKey: string;
  color: string;
}> = [
  { key: "pyro_dmg_bonus",     labelKey: "element.pyro",     color: "#EF7938" },
  { key: "hydro_dmg_bonus",    labelKey: "element.hydro",    color: "#4CC2F1" },
  { key: "electro_dmg_bonus",  labelKey: "element.electro",  color: "#B57EDC" },
  { key: "cryo_dmg_bonus",     labelKey: "element.cryo",     color: "#9FD6E3" },
  { key: "dendro_dmg_bonus",   labelKey: "element.dendro",   color: "#A5C83B" },
  { key: "anemo_dmg_bonus",    labelKey: "element.anemo",    color: "#74C2A8" },
  { key: "geo_dmg_bonus",      labelKey: "element.geo",      color: "#F0B232" },
  { key: "physical_dmg_bonus", labelKey: "element.physical", color: "#aabbcc" },
];

export function StatsPanel({ stats }: StatsPanelProps) {
  const { t } = useTranslation();

  const baseRows = [
    { label: t("stats.hp"),       value: stats.hp,                pct: false },
    { label: t("stats.atk"),      value: stats.atk,               pct: false },
    { label: t("stats.def"),      value: stats.def,               pct: false },
    { label: t("stats.em"),       value: stats.elemental_mastery, pct: false },
    { label: t("stats.critRate"), value: stats.crit_rate,         pct: true  },
    { label: t("stats.critDmg"),  value: stats.crit_dmg,          pct: true  },
    { label: t("stats.er"),       value: stats.energy_recharge,   pct: true  },
    ...(stats.dmg_bonus > 0
      ? [{ label: t("stats.dmgBonus"), value: stats.dmg_bonus, pct: true, highlight: true }]
      : []),
  ];

  const activeElementBonuses = ELEMENT_BONUSES.filter(
    ({ key }) => (stats[key] as number) > 0
  );

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg overflow-hidden">
      <div className="bg-navy-hover/50 px-4 py-2 border-b border-navy-border">
        <span className="text-[11px] font-label font-bold tracking-widest text-text-secondary uppercase">
          {t("detail.stats")}
        </span>
      </div>
      <div className="p-2">
        {baseRows.map(({ label, value, pct, highlight }) => (
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

        {activeElementBonuses.length > 0 && (
          <>
            <div className="px-3 py-1 text-[10px] font-bold tracking-widest text-text-muted uppercase border-b border-navy-border/50">
              {t("stats.elementDmgBonus")}
            </div>
            {activeElementBonuses.map(({ key, labelKey, color }) => (
              <div
                key={key}
                className="flex justify-between items-center h-9 px-3 border-b border-navy-border/50 last:border-0"
              >
                <span className="text-[13px] text-text-secondary flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {t(labelKey)}
                </span>
                <span className="text-[14px] font-mono" style={{ color }}>
                  {fmt(stats[key] as number, true)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
