import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ELEMENT_TW } from "../../lib/elements";
import { charIcon, elementIcon } from "../../lib/charAssets";
import { localizeCharacterName } from "../../lib/localize";
import { getConditionalBuffs, getManualActivation, isNightsoulRequired, type ConditionalBuffInfo } from "../../lib/conditionals";
import type { BuffBreakdown } from "../../stores/team";
import { useTeamStore, type MemberActivations } from "../../stores/team";
import type { BuffableStat, CharacterBuild, BuffActivation } from "../../types/wasm";

interface BuffCardProps {
  readonly breakdown: Readonly<BuffBreakdown>;
  readonly memberIndex?: number;
  readonly build?: Readonly<CharacterBuild>;
}

export function BuffCard({ breakdown, memberIndex, build }: BuffCardProps) {
  const { t, i18n } = useTranslation();
  const tw = ELEMENT_TW[breakdown.sourceElement];
  const isResonance = breakdown.sourceCharacterId === "resonance";
  const name = isResonance
    ? t("team.resonance")
    : localizeCharacterName(breakdown.sourceCharacterId, breakdown.sourceCharacterName, i18n.language);
  const iconSrc = isResonance
    ? elementIcon(breakdown.sourceElement)
    : charIcon(breakdown.sourceCharacterId);

  const conditionals = useMemo(() => (build ? getConditionalBuffs(build) : []), [build]);
  const stored = useTeamStore((s) => memberIndex !== undefined ? s.activations[memberIndex] : null);
  const setActivation = useTeamStore((s) => s.setActivation);

  const [weaponActs = [], artifactActs = [], talentActs = []] = stored ?? [[], [], []];

  const getList = (kind: ConditionalBuffInfo["kind"]): readonly BuffActivation[] => {
    if (kind === "weapon") return weaponActs;
    if (kind === "artifact") return artifactActs;
    return talentActs;
  };

  const findActivation = (info: ConditionalBuffInfo): BuffActivation | undefined => {
    return getList(info.kind).find((a) => a.name === info.buff.name);
  };

  const toggleActivation = (info: ConditionalBuffInfo) => {
    if (memberIndex === undefined) return;
    const list = [...getList(info.kind)];
    const idx = list.findIndex((a) => a.name === info.buff.name);
    if (idx === -1) return;

    const current = list[idx];
    const manual = getManualActivation(info.buff.activation);
    if (!manual) return;

    const isStacks = typeof manual === "object" && "Stacks" in manual;

    if (isStacks) {
      const maxStacks = manual.Stacks;
      const currentStacks = current.stacks ?? 0;
      if (!current.active) {
        list[idx] = { name: current.name, active: true, stacks: maxStacks };
      } else if (currentStacks > 1) {
        list[idx] = { name: current.name, active: true, stacks: currentStacks - 1 };
      } else {
        list[idx] = { name: current.name, active: false };
      }
    } else {
      list[idx] = { name: current.name, active: !current.active };
    }

    const next: MemberActivations = info.kind === "weapon"
      ? [list, [...artifactActs], [...talentActs]]
      : info.kind === "artifact"
        ? [[...weaponActs], list, [...talentActs]]
        : [[...weaponActs], [...artifactActs], list];
    setActivation(memberIndex, next);
  };

  // Filter to only manually toggleable conditionals
  const toggleableConditionals = conditionals.filter((info) => getManualActivation(info.buff.activation) !== null);

  /** Generate a distinct label for a conditional buff toggle */
  const getToggleLabel = (info: ConditionalBuffInfo): string => {
    const stat = info.buff.stat;
    // For element-specific stats, show element name alongside the source label
    if (typeof stat === "object") {
      const [, element] = Object.entries(stat)[0];
      const elKey = `element.${(element as string).toLowerCase()}`;
      const elName = t(elKey);
      return `${info.label} (${elName})`;
    }
    // For non-element stats, show the stat name
    const statKey = `buff.stat.${stat}`;
    const statName = t(statKey);
    if (statName !== statKey) {
      return `${info.label} (${statName})`;
    }
    return info.label;
  };

  // Check if there are duplicate labels to decide whether to show stat info
  const hasDuplicateLabels = toggleableConditionals.length > 1 &&
    new Set(toggleableConditionals.map((c) => c.label)).size < toggleableConditionals.length;

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

      {/* Conditional buff toggles */}
      {toggleableConditionals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {toggleableConditionals.map((info) => {
            const act = findActivation(info);
            const active = act?.active ?? false;
            const nightsoul = isNightsoulRequired(info.buff.activation);
            const manual = getManualActivation(info.buff.activation);
            const isStacks = manual !== null && typeof manual === "object" && "Stacks" in manual;
            const maxStacks = isStacks ? manual.Stacks : 0;
            const currentStacks = act?.stacks ?? 0;

            return (
              <button
                key={info.buff.name}
                type="button"
                onClick={() => toggleActivation(info)}
                title={`${info.buff.description}${nightsoul ? " (夜魂キャラのみ)" : ""}`}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer
                  ${active
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-navy-border/50 text-text-muted border border-transparent hover:bg-navy-hover"
                  }`}
              >
                {nightsoul && <span className="mr-0.5" aria-label="夜魂キャラのみ">◆</span>}
                {hasDuplicateLabels ? getToggleLabel(info) : info.label}
                {isStacks && active && (
                  <span className="ml-1 text-[10px]">{currentStacks}/{maxStacks}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Buff entries */}
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
