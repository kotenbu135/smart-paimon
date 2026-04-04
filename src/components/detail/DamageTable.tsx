import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import type { CharacterBuild, Stats, Enemy, Reaction } from "../../types/wasm";
import { ELEMENT_TW } from "../../lib/elements";
import { localizeTalentName, localizeReactionName } from "../../lib/localize";
import {
  getTalentData,
  computeTalentDamage,
  computeTransformativeDamage,
  computeLunarDamage,
  getReactionBonus,
  isTransformative,
  isLunar,
  type TalentRow,
  type TransformativeRow,
} from "../../lib/damage";

interface DamageTableProps {
  readonly build: Readonly<CharacterBuild>;
  readonly stats: Readonly<Stats>;
  readonly enemy: Readonly<Enemy>;
  readonly reaction: Reaction | null;
  readonly stickyHeader?: React.ReactNode;
}

export function DamageTable({ build, stats, enemy, reaction, stickyHeader }: DamageTableProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const el = build.character.element;
  const tw = ELEMENT_TW[el];

  const talents = useMemo(() => getTalentData(build.character.id), [build.character.id]);
  const reactionBonus = useMemo(
    () => getReactionBonus(build.artifacts.four_piece_set, reaction),
    [build.artifacts.four_piece_set, reaction],
  );

  const [normalLv, skillLv, burstLv] = build.talent_levels;

  const talentRows = useMemo(() => {
    if (!talents) return { normal: [], charged: [], plunging: [], skill: [], burst: [] };
    return {
      normal: computeTalentDamage(talents.normal_attack?.hits, normalLv, stats, build.level, el, enemy, reaction, "Normal", reactionBonus),
      charged: computeTalentDamage(talents.normal_attack?.charged, normalLv, stats, build.level, el, enemy, reaction, "Charged", reactionBonus),
      plunging: computeTalentDamage(talents.normal_attack?.plunging, normalLv, stats, build.level, el, enemy, reaction, "Plunging", reactionBonus),
      skill: computeTalentDamage(talents.elemental_skill?.scalings, skillLv, stats, build.level, el, enemy, reaction, "Skill", reactionBonus),
      burst: computeTalentDamage(talents.elemental_burst?.scalings, burstLv, stats, build.level, el, enemy, reaction, "Burst", reactionBonus),
    };
  }, [talents, build, stats, enemy, reaction, reactionBonus, normalLv, skillLv, burstLv, el]);

  const reactionRow: TransformativeRow | null = useMemo(() => {
    if (!reaction) return null;
    if (isTransformative(reaction))
      return computeTransformativeDamage(reaction, build.level, stats.elemental_mastery, enemy, reactionBonus);
    if (isLunar(reaction))
      return computeLunarDamage(reaction, build.level, stats, enemy, reactionBonus);
    return null;
  }, [reaction, build.level, stats, enemy, reactionBonus]);

  const tabs = [
    { key: "normal", label: t("detail.normalAttack"), lv: normalLv },
    { key: "skill", label: t("detail.elementalSkill"), lv: skillLv },
    { key: "burst", label: t("detail.elementalBurst"), lv: burstLv },
  ];

  const colGroup = (
    <colgroup>
      <col className="w-[40%]" />
      <col className="w-[15%]" />
      <col className="w-[15%]" />
      <col className="w-[15%]" />
      <col className="w-[15%]" />
    </colgroup>
  );

  const fmtPct = (n: number) => `${n.toFixed(1)}%`;

  const renderRows = (rows: TalentRow[]) =>
    rows.map((row, i) => (
      <tr key={i} className="glass-row-hover">
        <td className="px-6 py-4 text-[14px] font-medium text-text-primary">{localizeTalentName(row.name, locale)}</td>
        <td className="px-6 py-4 text-[14px] font-mono text-text-secondary text-right">
          <AnimatedNumber value={row.multiplier * 100} formatFn={fmtPct} />
        </td>
        <td className="px-6 py-4 text-[14px] font-mono text-text-primary text-right">
          <AnimatedNumber value={row.nonCrit} />
        </td>
        <td className={`px-6 py-4 text-[15px] font-mono font-bold text-right ${tw?.text ?? "text-gold"}`}>
          <AnimatedNumber value={row.crit} />
        </td>
        <td className="px-6 py-4 text-[14px] font-mono text-text-primary text-right">
          <AnimatedNumber value={row.average} />
        </td>
      </tr>
    ));

  const tableHeader = (
    <tr className="glass-header border-b border-white/[0.06]">
      <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary">
        {t("detail.talentName")}
      </th>
      <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary text-right">
        {t("detail.multiplier")}
      </th>
      <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary text-right">
        {t("detail.nonCrit")}
      </th>
      <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary text-right">
        {t("detail.crit")}
      </th>
      <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary text-right">
        {t("detail.average")}
      </th>
    </tr>
  );

  const renderTable = (rows: TalentRow[]) => (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          {colGroup}
          <thead>{tableHeader}</thead>
          <tbody>
            {rows.length > 0 ? renderRows(rows) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                  {!talents ? t("detail.noTalentData") : t("detail.noScalings")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transformative / Lunar reaction row */}
      {reactionRow && (
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <h4 className="text-[11px] font-label font-bold text-text-muted uppercase tracking-widest mb-2">
            {t("detail.reactionDamage")}
          </h4>
          <div className="flex justify-between text-sm">
            <span className="text-hydro font-medium">{localizeReactionName(reactionRow.name, t)}</span>
            <span className="font-mono text-hydro font-bold">
              {Math.round(reactionRow.damage).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderNormalAttackTab = () => (
    <div className="space-y-3">
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            {colGroup}
            <thead>{tableHeader}</thead>
            <tbody>
              {talentRows.normal.length > 0 ? renderRows(talentRows.normal) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    {!talents ? t("detail.noTalentData") : t("detail.noScalings")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {reactionRow && (
          <div className="px-6 py-4 border-t border-white/[0.06]">
            <h4 className="text-[11px] font-label font-bold text-text-muted uppercase tracking-widest mb-2">
              {t("detail.reactionDamage")}
            </h4>
            <div className="flex justify-between text-sm">
              <span className="text-hydro font-medium">{localizeReactionName(reactionRow.name, t)}</span>
              <span className="font-mono text-hydro font-bold">
                {Math.round(reactionRow.damage).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {talentRows.charged.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-3 border-b border-white/[0.06] glass-header">
            <span className="text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary">
              {t("detail.chargedAttack")}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              {colGroup}
              <tbody>{renderRows(talentRows.charged)}</tbody>
            </table>
          </div>
        </div>
      )}

      {talentRows.plunging.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-3 border-b border-white/[0.06] glass-header">
            <span className="text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary">
              {t("detail.plungeAttack")}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              {colGroup}
              <tbody>{renderRows(talentRows.plunging)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const tabOrder = ["normal", "skill", "burst"];
  const [activeTab, setActiveTab] = useState("normal");
  const [direction, setDirection] = useState(0);

  const handleTabChange = (value: string) => {
    setDirection(tabOrder.indexOf(value) > tabOrder.indexOf(activeTab) ? 1 : -1);
    setActiveTab(value);
  };

  const tabContent: Record<string, () => React.ReactNode> = {
    normal: renderNormalAttackTab,
    skill: () => renderTable(talentRows.skill),
    burst: () => renderTable(talentRows.burst),
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="flex flex-col">
      <div className="flex-shrink-0 space-y-4 pb-4">
        {stickyHeader}
        <Tabs.List className="flex gap-1 p-1 glass-inner rounded-lg w-fit">
          {tabs.map(({ key, label, lv }) => (
            <Tabs.Trigger
              key={key}
              value={key}
              className="px-6 py-2 rounded-md text-[13px] font-medium transition-all active:scale-95
                data-[state=active]:text-white data-[state=active]:font-bold
                text-text-secondary hover:bg-white/[0.05]"
              style={{ "--tab-active-bg": `var(--color-${el.toLowerCase()}, var(--color-gold))` } as React.CSSProperties}
              data-element={el}
            >
              {label}
              <span className="ml-1.5 text-[11px] opacity-70">Lv.{lv}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-3"
        >
          {tabContent[activeTab]?.()}
        </motion.div>
      </AnimatePresence>
    </Tabs.Root>
  );
}
