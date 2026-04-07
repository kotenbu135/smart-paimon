import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ELEMENT_TW } from "../../lib/elements";
import { charIcon, elementIcon } from "../../lib/charAssets";
import { localizeCharacterName, localizeBuffSource, localizeWeaponName, localizeArtifactSetName } from "../../lib/localize";
import { getConditionalBuffs, getManualActivation, isNightsoulRequired, type ConditionalBuffInfo } from "../../lib/conditionals";
import type { BuffBreakdown } from "../../stores/team";
import { useTeamStore, type MemberActivations } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import type { BuffableStat, CharacterBuild, BuffActivation } from "../../types/wasm";

interface BuffCardProps {
  readonly breakdown: Readonly<BuffBreakdown>;
  readonly memberIndex?: number;
  readonly build?: Readonly<CharacterBuild>;
  readonly canNightsoul?: boolean;
}

export function BuffCard({ breakdown, memberIndex, build, canNightsoul = false }: BuffCardProps) {
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

    const manual = getManualActivation(info.buff.activation);
    if (!manual) return;

    const isStacks = typeof manual === "object" && "Stacks" in manual;

    if (idx === -1) {
      // Entry doesn't exist yet — create it as active
      list.push({
        name: info.buff.name,
        active: true,
        ...(isStacks ? { stacks: manual.Stacks } : {}),
      });
    } else {
      const current = list[idx];
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

  // Filter element-specific toggles to only show relevant elements (main DPS + self)
  const mainDpsId = useTeamStore((s) => s.members[s.mainDpsIndex]);
  const mainDpsBuild = useGoodStore((s) => mainDpsId ? s.getBuild(mainDpsId) : undefined);
  const relevantConditionals = useMemo(() => {
    const mainElement = mainDpsBuild?.character.element ?? null;
    const selfElement = build?.character.element ?? null;
    return toggleableConditionals.filter((info) => {
      const el = getStatElement(info.buff.stat);
      if (el === null) return true; // non-element stat → always show
      return (mainElement !== null && el.toLowerCase() === mainElement.toLowerCase()) ||
             (selfElement !== null && el.toLowerCase() === selfElement.toLowerCase());
    });
  }, [toggleableConditionals, mainDpsBuild?.character.element, build?.character.element]);

  /** Localize a conditional buff label using frontend dictionaries (not WASM names) */
  const localizeConditionalLabel = (info: ConditionalBuffInfo): string => {
    if (info.kind === "weapon" && info.sourceId) {
      return localizeWeaponName(info.sourceId, info.label, i18n.language);
    }
    if (info.kind === "artifact" && info.sourceId) {
      return localizeArtifactSetName(info.sourceId, info.label, i18n.language);
    }
    // talent: label is buff.name (EN talent name) → localize via name dictionaries
    return localizeBuffSource(info.label, i18n.language);
  };

  /** Generate a distinct label for a conditional buff toggle */
  const getToggleLabel = (info: ConditionalBuffInfo): string => {
    const localizedLabel = localizeConditionalLabel(info);
    const stat = info.buff.stat;
    // For element-specific stats, show full stat type name (e.g. "岩元素耐性減少")
    // to distinguish between different stat types for the same element
    if (typeof stat === "object") {
      const [statType, element] = Object.entries(stat)[0];
      const elKey = `element.${(element as string).toLowerCase()}`;
      const elName = t(elKey);
      const statKey = `buff.stat.${statType}`;
      const statName = t(statKey, { element: elName });
      if (statName !== statKey) {
        return `${localizedLabel} (${statName})`;
      }
      return `${localizedLabel} (${elName})`;
    }
    // For non-element stats, show the stat name
    const statKey = `buff.stat.${stat}`;
    const statName = t(statKey);
    if (statName !== statKey) {
      return `${localizedLabel} (${statName})`;
    }
    return localizedLabel;
  };

  // Check if there are duplicate labels to decide whether to show stat info
  const hasDuplicateLabels = relevantConditionals.length > 1 &&
    new Set(relevantConditionals.map((c) => c.label)).size < relevantConditionals.length;

  // Match conditional buffs to resolved breakdown buffs (name match → stat match fallback)
  const { conditionalValueMap, matchedIndices } = useMemo(() => {
    const map = new Map<string, BuffBreakdownEntry>();
    const matched = new Set<number>();
    const statKey = (s: BuffableStat) => JSON.stringify(s);

    for (const info of relevantConditionals) {
      // Try exact name match first
      let idx = breakdown.buffs.findIndex((b, i) => !matched.has(i) && b.name === info.buff.name);
      // Fallback: match by stat type
      if (idx === -1) {
        const key = statKey(info.buff.stat);
        idx = breakdown.buffs.findIndex((b, i) => !matched.has(i) && statKey(b.stat) === key);
      }
      if (idx !== -1) {
        map.set(info.buff.name, breakdown.buffs[idx]);
        matched.add(idx);
      }
    }
    return { conditionalValueMap: map, matchedIndices: matched };
  }, [relevantConditionals, breakdown.buffs]);

  // Regular buffs = breakdown buffs NOT matched to any conditional,
  // filtered to exclude element-specific buffs for irrelevant elements
  const regularBuffs = useMemo(() => {
    const mainEl = mainDpsBuild?.character.element ?? null;
    const selfEl = build?.character.element ?? null;
    return breakdown.buffs.filter((b, i) => {
      if (matchedIndices.has(i)) return false;
      const el = getStatElement(b.stat);
      if (el === null) return true;
      const lower = el.toLowerCase();
      return (mainEl !== null && lower === mainEl.toLowerCase()) ||
             (selfEl !== null && lower === selfEl.toLowerCase());
    });
  }, [breakdown.buffs, matchedIndices, mainDpsBuild?.character.element, build?.character.element]);

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

      {/* Unified buff list — conditionals shown in fixed position, cards never appear/disappear */}
      <div className="space-y-1.5">
        {/* Regular (non-conditional) buffs */}
        {regularBuffs.map((buff, i) => (
          <div key={`buff-${i}`} className="flex justify-between items-center px-2.5 py-1.5 bg-navy-page rounded-md">
            <div className="min-w-0">
              <div className="text-[11px] text-text-primary">{localizeBuffSource(buff.name, i18n.language)}</div>
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

        {/* All conditional buffs in fixed order — always visible, toggle changes value display */}
        {relevantConditionals.map((info) => {
          const act = findActivation(info);
          const active = act?.active ?? false;
          const nightsoul = isNightsoulRequired(info.buff.activation);
          const manual = getManualActivation(info.buff.activation);
          const isStacks = manual !== null && typeof manual === "object" && "Stacks" in manual;
          const maxStacks = isStacks ? manual.Stacks : 0;
          const currentStacks = act?.stacks ?? 0;
          const resolvedBuff = conditionalValueMap.get(info.buff.name);

          return (
            <button
              key={`cond-${info.buff.name}`}
              type="button"
              onClick={() => toggleActivation(info)}
              title={`${info.buff.description}${nightsoul ? " (夜魂キャラのみ)" : ""}`}
              className={`w-full flex justify-between items-center px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer
                ${active
                  ? "bg-gold/10 border border-gold/30 hover:bg-gold/15"
                  : "bg-navy-page/60 border border-dashed border-navy-border/60 hover:bg-navy-hover"
                }`}
            >
              <div className="min-w-0">
                <div className={`text-[11px] ${active ? "text-gold" : "text-text-secondary"}`}>
                  {nightsoul && <span className="mr-0.5" aria-label="夜魂キャラのみ">◆</span>}
                  {hasDuplicateLabels ? getToggleLabel(info) : localizeConditionalLabel(info)}
                  {isStacks && (
                    <span className="ml-1 text-[10px] opacity-70">
                      {active ? `${currentStacks}/${maxStacks}` : `0/${maxStacks}`}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-text-muted">{localizeBuffStat(info.buff.stat, t)}</div>
              </div>
              <span className={`text-[11px] font-bold font-mono shrink-0 ml-2 ${active ? "text-green-500" : "text-text-secondary"}`}>
                {(() => {
                  const fallbackVal = (canNightsoul && info.buff.nightsoul_value != null)
                    ? info.buff.nightsoul_value
                    : info.buff.value;
                  const val = resolvedBuff ? resolvedBuff.value : fallbackVal;
                  const stat = resolvedBuff ? resolvedBuff.stat : info.buff.stat;
                  return `${val > 0 ? "+" : ""}${formatBuffValue(val, stat)}`;
                })()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Extract element from an element-specific stat, or null for generic stats */
function getStatElement(stat: BuffableStat): string | null {
  if (typeof stat === "object") {
    if ("ElementalDmgBonus" in stat) return stat.ElementalDmgBonus;
    if ("ElementalRes" in stat) return stat.ElementalRes;
    if ("ElementalResReduction" in stat) return stat.ElementalResReduction;
  }
  return null;
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
