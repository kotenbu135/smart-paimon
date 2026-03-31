import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as Tabs from "@radix-ui/react-tabs";
import type { CharacterBuild, Stats, Enemy, Reaction } from "@kotenbu/genshin-calc/types";
import { getTalentData, computeTalentDamage, computeTransformativeDamage, computeLunarDamage, getReactionBonus, isTransformative, isLunar, type TalentRow, type TransformativeRow } from "../../lib/damage";

interface Props { build: CharacterBuild; stats: Stats; enemy: Enemy; reaction: Reaction | null; }

export function DamageTable({ build, stats, enemy, reaction }: Props) {
  const { t } = useTranslation();
  const talents = useMemo(() => getTalentData(build.character.id), [build.character.id]);
  const reactionBonus = useMemo(() => getReactionBonus(build.artifacts.four_piece_set, reaction), [build.artifacts.four_piece_set, reaction]);

  const [normalLv, skillLv, burstLv] = build.talent_levels;

  const talentRows = useMemo(() => {
    if (!talents) return { normal: [], skill: [], burst: [] };
    return {
      normal: computeTalentDamage(talents.normal_attack?.hits, normalLv, stats, build.level, build.character.element, enemy, reaction, "Normal", reactionBonus),
      skill: computeTalentDamage(talents.elemental_skill?.scalings, skillLv, stats, build.level, build.character.element, enemy, reaction, "Skill", reactionBonus),
      burst: computeTalentDamage(talents.elemental_burst?.scalings, burstLv, stats, build.level, build.character.element, enemy, reaction, "Burst", reactionBonus),
    };
  }, [talents, build, stats, enemy, reaction, reactionBonus, normalLv, skillLv, burstLv]);

  const reactionRow: TransformativeRow | null = useMemo(() => {
    if (!reaction) return null;
    if (isTransformative(reaction)) return computeTransformativeDamage(reaction, build.level, stats.elemental_mastery, enemy, reactionBonus);
    if (isLunar(reaction)) return computeLunarDamage(reaction, build.level, stats, enemy, reactionBonus);
    return null;
  }, [reaction, build.level, stats, enemy, reactionBonus]);

  const tabs = [
    { key: "normal", label: t("detail.normalAttack") },
    { key: "skill", label: t("detail.elementalSkill") },
    { key: "burst", label: t("detail.elementalBurst") },
  ];

  const renderTable = (rows: TalentRow[]) => (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 font-normal">{t("detail.talentName")}</th>
            <th className="text-center py-2 font-normal">{t("detail.multiplier")}</th>
            <th className="text-right py-2 font-normal">{t("detail.nonCrit")}</th>
            <th className="text-right py-2 font-normal text-red-400">{t("detail.crit")}</th>
            <th className="text-right py-2 font-normal text-amber-400">{t("detail.average")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-800/50 last:border-0">
              <td className="py-2">{row.name}</td>
              <td className="py-2 text-center text-gray-400">{(row.multiplier * 100).toFixed(1)}%</td>
              <td className="py-2 text-right font-mono">{Math.round(row.nonCrit).toLocaleString()}</td>
              <td className="py-2 text-right font-mono text-red-400">{Math.round(row.crit).toLocaleString()}</td>
              <td className="py-2 text-right font-mono text-amber-400">{Math.round(row.average).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">{!talents ? "Talent data not available" : "No scalings found"}</td></tr>}
        </tbody>
      </table>
      {reactionRow && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex justify-between text-sm">
            <span className="text-sky-400">{reactionRow.name}</span>
            <span className="font-mono text-sky-400">{Math.round(reactionRow.damage).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
      <Tabs.Root defaultValue="normal">
        <Tabs.List className="flex gap-1 mb-4">
          {tabs.map(({ key, label }) => (
            <Tabs.Trigger key={key} value={key} className="px-4 py-2 text-sm rounded-t-lg transition-colors data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400 hover:text-gray-200">
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
