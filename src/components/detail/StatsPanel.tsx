import { useTranslation } from "react-i18next";
import type { Stats } from "@kotenbu/genshin-calc/types";

interface Props { stats: Stats; }
const fmt = (v: number, pct: boolean) => pct ? `${(v * 100).toFixed(1)}%` : Math.round(v).toLocaleString();

export function StatsPanel({ stats }: Props) {
  const { t } = useTranslation();
  const rows = [
    { label: t("stats.hp"), value: stats.hp, pct: false },
    { label: t("stats.atk"), value: stats.atk, pct: false },
    { label: t("stats.def"), value: stats.def, pct: false },
    { label: t("stats.em"), value: stats.elemental_mastery, pct: false },
    { label: t("stats.critRate"), value: stats.crit_rate, pct: true },
    { label: t("stats.critDmg"), value: stats.crit_dmg, pct: true },
    { label: t("stats.er"), value: stats.energy_recharge, pct: true },
    { label: t("stats.dmgBonus"), value: stats.dmg_bonus, pct: true },
  ];
  return (
    <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
      <p className="text-sm font-bold text-sky-400 mb-3">{t("detail.stats")}</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ label, value, pct }) => (
            <tr key={label} className="border-b border-gray-800/50 last:border-0">
              <td className="py-1.5 text-gray-400">{label}</td>
              <td className="py-1.5 text-right font-mono">{fmt(value, pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
