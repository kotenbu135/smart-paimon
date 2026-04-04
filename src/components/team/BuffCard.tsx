import { useTranslation } from "react-i18next";
import { ELEMENT_TW } from "../../lib/elements";
import { charIcon } from "../../lib/charAssets";
import { localizeCharacterName } from "../../lib/localize";
import type { BuffBreakdown } from "../../stores/team";
import type { BuffableStat } from "../../types/wasm";

interface BuffCardProps {
  readonly breakdown: Readonly<BuffBreakdown>;
}

export function BuffCard({ breakdown }: BuffCardProps) {
  const { t, i18n } = useTranslation();
  const tw = ELEMENT_TW[breakdown.sourceElement];
  const name = localizeCharacterName(breakdown.sourceCharacterId, breakdown.sourceCharacterName, i18n.language);

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-3.5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${tw.border} bg-gradient-to-br ${tw.gradient} to-transparent`}>
          <img src={charIcon(breakdown.sourceCharacterId)} alt={name} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <div className={`text-[12px] font-bold ${tw.text}`}>{name}</div>
          <div className="text-[9px] text-text-muted">{t(`element.${breakdown.sourceElement.toLowerCase()}`)}</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {breakdown.buffs.map((buff, i) => (
          <div key={i} className="flex justify-between items-center px-2.5 py-1.5 bg-navy-page rounded-md">
            <div>
              <div className="text-[11px] text-text-primary">{buff.name}</div>
              {buff.condition && (
                <div className="text-[9px] text-text-muted">
                  {t("team.condition")}: {buff.condition}
                  {buff.duration && ` | ${buff.duration}`}
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-green-500 font-mono">
              {buff.value > 0 ? "+" : ""}{formatBuffValue(buff.value, buff.stat)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatBuffValue(value: number, stat: BuffableStat): string {
  if (typeof stat === "object") return `${(value * 100).toFixed(1)}%`;
  if (stat === "HpFlat" || stat === "AtkFlat" || stat === "DefFlat"
    || stat === "NormalAtkFlatDmg" || stat === "ChargedAtkFlatDmg"
    || stat === "PlungingAtkFlatDmg" || stat === "SkillFlatDmg" || stat === "BurstFlatDmg") {
    return value.toLocaleString();
  }
  return `${(value * 100).toFixed(1)}%`;
}
