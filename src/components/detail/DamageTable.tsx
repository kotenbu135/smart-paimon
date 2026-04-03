import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as Tabs from "@radix-ui/react-tabs";
import type { CharacterBuild, Stats, Enemy, Reaction } from "../../types/wasm";
import { ELEMENT_TW } from "../../lib/elements";
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
}

export function DamageTable({ build, stats, enemy, reaction }: DamageTableProps) {
  const { t } = useTranslation();
  const el = build.character.element;
  const tw = ELEMENT_TW[el];

  const talents = useMemo(() => getTalentData(build.character.id), [build.character.id]);
  const reactionBonus = useMemo(
    () => getReactionBonus(build.artifacts.four_piece_set, reaction),
    [build.artifacts.four_piece_set, reaction],
  );

  const [normalLv, skillLv, burstLv] = build.talent_levels;

  const talentRows = useMemo(() => {
    if (!talents) return { normal: [], skill: [], burst: [] };
    return {
      normal: computeTalentDamage(talents.normal_attack?.hits, normalLv, stats, build.level, el, enemy, reaction, "Normal", reactionBonus),
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
    { key: "normal", label: t("detail.normalAttack") },
    { key: "skill", label: t("detail.elementalSkill") },
    { key: "burst", label: t("detail.elementalBurst") },
  ];

  const renderTable = (rows: TalentRow[]) => (
    <div className="bg-navy-card border border-navy-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-hover/50 border-b border-navy-border">
              <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary">
                {t("detail.talentName")}
              </th>
              <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary">
                {t("detail.multiplier")}
              </th>
              <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary">
                {t("detail.nonCrit")}
              </th>
              <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary text-right">
                {t("detail.crit")}
              </th>
              <th className="px-6 py-4 text-[11px] font-label font-bold uppercase tracking-widest text-text-secondary text-right">
                {t("detail.average")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-border/50">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-navy-hover/30 transition-colors">
                <td className="px-6 py-4 text-[14px] font-medium text-text-primary">{row.name}</td>
                <td className="px-6 py-4 text-[14px] font-mono text-text-secondary">
                  {(row.multiplier * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-[14px] font-mono text-text-primary">
                  {Math.round(row.nonCrit).toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-[15px] font-mono font-bold text-right ${tw?.text ?? "text-gold"}`}>
                  {Math.round(row.crit).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-[14px] font-mono text-text-primary text-right">
                  {Math.round(row.average).toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
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
        <div className="px-6 py-4 border-t border-navy-border">
          <h4 className="text-[11px] font-label font-bold text-text-muted uppercase tracking-widest mb-2">
            {t("detail.reactionDamage")}
          </h4>
          <div className="flex justify-between text-sm">
            <span className="text-hydro font-medium">{reactionRow.name}</span>
            <span className="font-mono text-hydro font-bold">
              {Math.round(reactionRow.damage).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs.Root defaultValue="normal">
        <Tabs.List className="flex gap-1 p-1 bg-navy-border/50 rounded-lg w-fit">
          {tabs.map(({ key, label }) => (
            <Tabs.Trigger
              key={key}
              value={key}
              className={`px-6 py-2 rounded-md text-[13px] font-medium transition-colors
                data-[state=active]:${tw?.bg ?? "bg-gold"} data-[state=active]:text-white data-[state=active]:font-bold
                text-text-secondary hover:bg-navy-hover`}
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="normal">{renderTable(talentRows.normal)}</Tabs.Content>
        <Tabs.Content value="skill">{renderTable(talentRows.skill)}</Tabs.Content>
        <Tabs.Content value="burst">{renderTable(talentRows.burst)}</Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
