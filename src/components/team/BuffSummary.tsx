import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { BuffBreakdown } from "../../stores/team";
import type { BuffableStat } from "../../types/wasm";

interface BuffSummaryProps {
  readonly breakdowns: readonly Readonly<BuffBreakdown>[];
}

interface AggregatedBuff {
  readonly label: string;
  readonly value: number;
  readonly isPercent: boolean;
}

export function BuffSummary({ breakdowns }: BuffSummaryProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const aggregated = useMemo((): AggregatedBuff[] => {
    const totals: Record<string, { value: number; isPercent: boolean; label: string }> = {};

    for (const bd of breakdowns) {
      for (const buff of bd.buffs) {
        const key = statToKey(buff.stat);
        if (!totals[key]) {
          totals[key] = { value: 0, isPercent: isPercentStat(buff.stat), label: localizeBuffStat(buff.stat, t) };
        }
        totals[key].value += buff.value;
      }
    }

    return Object.values(totals).map(({ label, value, isPercent }) => ({ label, value, isPercent }));
  }, [breakdowns, t]);

  if (aggregated.length === 0) return null;

  return (
    <div className="bg-navy-card border border-gold/30 rounded-xl p-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <span className="text-[11px] font-bold text-gold font-label">
          {t("team.buffTotal")}
        </span>
        <span className={`text-[10px] text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {aggregated.map((buff) => (
            <div key={buff.label} className="text-center p-1.5 bg-navy-page rounded-md">
              <div className="text-[9px] text-text-muted">{buff.label}</div>
              <div className="text-[12px] font-bold font-mono text-green-500">
                {buff.isPercent ? `+${(buff.value * 100).toFixed(1)}%` : `+${buff.value.toLocaleString()}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statToKey(stat: BuffableStat): string {
  if (typeof stat === "object") {
    const [key, value] = Object.entries(stat)[0];
    return `${key}:${value}`;
  }
  return stat;
}

function isPercentStat(stat: BuffableStat): boolean {
  if (typeof stat === "object") return true;
  return !["HpFlat", "AtkFlat", "DefFlat", "NormalAtkFlatDmg", "ChargedAtkFlatDmg",
    "PlungingAtkFlatDmg", "SkillFlatDmg", "BurstFlatDmg"].includes(stat as string);
}

function localizeBuffStat(stat: BuffableStat, t: TFunction): string {
  if (typeof stat === "object") {
    const [type, element] = Object.entries(stat)[0];
    const elementLabel = t(`element.${(element as string).toLowerCase()}`);
    return t(`buff.stat.${type}`, { element: elementLabel });
  }
  const key = `buff.stat.${stat}`;
  const translated = t(key);
  return translated !== key ? translated : stat;
}
