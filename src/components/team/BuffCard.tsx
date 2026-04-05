import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ELEMENT_TW } from "../../lib/elements";
import { charIcon, elementIcon } from "../../lib/charAssets";
import { localizeCharacterName } from "../../lib/localize";
import type { BuffBreakdown } from "../../stores/team";
import type { BuffableStat } from "../../types/wasm";

interface BuffCardProps {
  readonly breakdown: Readonly<BuffBreakdown>;
}

export function BuffCard({ breakdown }: BuffCardProps) {
  const { t, i18n } = useTranslation();
  const tw = ELEMENT_TW[breakdown.sourceElement];
  const isResonance = breakdown.sourceCharacterId === "resonance";
  const name = isResonance
    ? t("team.resonance")
    : localizeCharacterName(breakdown.sourceCharacterId, breakdown.sourceCharacterName, i18n.language);
  const iconSrc = isResonance
    ? elementIcon(breakdown.sourceElement)
    : charIcon(breakdown.sourceCharacterId);

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-3.5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${tw.border} bg-gradient-to-br ${tw.gradient} to-transparent flex items-center justify-center`}>
          <img src={iconSrc} alt={name} className={isResonance ? "w-5 h-5 object-contain" : "w-full h-full object-cover"} loading="lazy" />
        </div>
        <div>
          <div className={`text-[12px] font-bold ${tw.text}`}>{name}</div>
          <div className="text-[9px] text-text-muted">{t(`element.${breakdown.sourceElement.toLowerCase()}`)}</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {breakdown.buffs.map((buff, i) => (
          <div key={i} className="flex justify-between items-center px-2.5 py-1.5 bg-navy-page rounded-md">
            <div className="min-w-0">
              <div className="text-[11px] text-text-primary">{buff.name}</div>
              <div className="text-[9px] text-text-muted">{localizeBuffStat(buff.stat, t)}</div>
              {buff.condition && (
                <div className="text-[9px] text-text-muted">
                  {t("team.condition")}: {buff.condition}
                  {buff.duration && ` | ${buff.duration}`}
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-green-500 font-mono shrink-0 ml-2">
              {buff.value > 0 ? "+" : ""}{formatBuffValue(buff.value, buff.stat)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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

const FLAT_STATS = new Set([
  "HpFlat", "AtkFlat", "DefFlat", "ElementalMastery",
  "NormalAtkFlatDmg", "ChargedAtkFlatDmg", "PlungingAtkFlatDmg",
  "SkillFlatDmg", "BurstFlatDmg",
]);

function formatBuffValue(value: number, stat: BuffableStat): string {
  if (typeof stat === "object") return `${(value * 100).toFixed(1)}%`;
  if (FLAT_STATS.has(stat)) return value.toLocaleString();
  return `${(value * 100).toFixed(1)}%`;
}
