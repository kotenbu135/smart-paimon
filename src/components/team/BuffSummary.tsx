import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

  const aggregated = useMemo((): AggregatedBuff[] => {
    const totals: Record<string, { value: number; isPercent: boolean; label: string }> = {};

    for (const bd of breakdowns) {
      for (const buff of bd.buffs) {
        const key = String(buff.stat);
        if (!totals[key]) {
          totals[key] = { value: 0, isPercent: isPercentStat(buff.stat), label: key };
        }
        totals[key].value += buff.value;
      }
    }

    return Object.values(totals).map(({ label, value, isPercent }) => ({ label, value, isPercent }));
  }, [breakdowns]);

  if (aggregated.length === 0) return null;

  return (
    <div className="bg-navy-card border border-gold/30 rounded-xl p-3">
      <div className="text-[11px] font-bold text-gold font-label mb-2">
        {t("team.buffTotal")}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {aggregated.map((buff) => (
          <div key={buff.label} className="text-center p-1.5 bg-navy-page rounded-md">
            <div className="text-[9px] text-text-muted">{buff.label}</div>
            <div className="text-[12px] font-bold font-mono text-green-500">
              {buff.isPercent ? `+${(buff.value * 100).toFixed(1)}%` : `+${buff.value.toLocaleString()}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function isPercentStat(stat: BuffableStat): boolean {
  if (typeof stat === "object") return true;
  return !["HpFlat", "AtkFlat", "DefFlat", "NormalAtkFlatDmg", "ChargedAtkFlatDmg",
    "PlungingAtkFlatDmg", "SkillFlatDmg", "BurstFlatDmg"].includes(stat as string);
}
