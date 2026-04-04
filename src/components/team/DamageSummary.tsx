import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { useTeamStore, type TalentCategoryResults } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import { localizeCharacterName } from "../../lib/localize";

interface SummaryRow {
  readonly label: string;
  readonly soloAvg: number;
  readonly teamAvg: number;
}

export function DamageSummary() {
  const { t, i18n } = useTranslation();
  const { members, mainDpsIndex, soloResults, teamResults, isResolving } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);

  const mainDpsId = members[mainDpsIndex];
  const mainDpsBuild = mainDpsId ? getBuild(mainDpsId) : undefined;

  const rows = useMemo((): SummaryRow[] => {
    if (!mainDpsId) return [];
    const solo = soloResults[mainDpsId];
    const team = teamResults[mainDpsId];
    if (!solo) return [];

    const categories: { label: string; key: keyof TalentCategoryResults }[] = [
      { label: t("detail.normalAttack"), key: "normal" },
      { label: t("detail.elementalSkill"), key: "skill" },
      { label: t("detail.elementalBurst"), key: "burst" },
    ];

    return categories.map(({ label, key }) => {
      const soloArr = solo[key] ?? [];
      const teamArr = team?.[key] ?? [];
      const soloAvg = soloArr.reduce((sum, r) => sum + r.average, 0);
      const teamAvg = teamArr.reduce((sum, r) => sum + r.average, 0);
      return { label, soloAvg, teamAvg };
    });
  }, [mainDpsId, soloResults, teamResults, t]);

  const maxValue = Math.max(...rows.map((r) => Math.max(r.soloAvg, r.teamAvg)), 1);

  if (!mainDpsBuild) {
    return (
      <div className="bg-navy-card border border-navy-border rounded-xl p-6 text-center text-text-muted text-sm">
        {t("team.noTeamMembers")}
      </div>
    );
  }

  const dpsName = localizeCharacterName(mainDpsBuild.character.id, mainDpsBuild.character.name, i18n.language);

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] font-bold text-gold font-label">
          {t("team.damageSummary")} — {dpsName}
        </span>
        <div className="flex gap-3">
          <span className="text-[10px] text-text-muted flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#4b5563] inline-block" /> {t("team.solo")}
          </span>
          <span className="text-[10px] text-green-500 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> {t("team.withTeam")}
          </span>
        </div>
      </div>

      {isResolving && (
        <div className="text-text-muted text-[11px] text-center py-4">{t("team.resolving")}</div>
      )}

      {!isResolving && (
        <div className="flex gap-4">
          <div className="flex-1 flex items-end gap-5 h-[80px] px-4">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-col items-center gap-1 flex-1">
                <div className="flex items-end gap-1 h-[65px]">
                  <div
                    className="w-5 bg-[#4b5563] rounded-t"
                    style={{ height: `${(row.soloAvg / maxValue) * 65}px` }}
                  />
                  <div
                    className="w-5 bg-green-500 rounded-t"
                    style={{ height: `${(row.teamAvg / maxValue) * 65}px` }}
                  />
                </div>
                <span className="text-[9px] text-text-muted whitespace-nowrap">{row.label}</span>
              </div>
            ))}
          </div>

          <div className="w-[200px] flex flex-col gap-1.5 justify-center">
            {rows.map((row) => {
              const diff = row.soloAvg > 0 ? ((row.teamAvg - row.soloAvg) / row.soloAvg) * 100 : 0;
              const diffColor = diff >= 0 ? "text-green-500" : "text-red-400";

              return (
                <div key={row.label} className="flex justify-between items-center px-2 py-1 bg-navy-page rounded-md">
                  <span className="text-[10px] text-text-muted">{row.label}</span>
                  <span className={`text-[11px] font-bold font-mono ${diffColor}`}>
                    <AnimatedNumber value={row.teamAvg} formatFn={(v) => v.toLocaleString()} />
                    {row.soloAvg > 0 && (
                      <span className="text-[9px] ml-1">
                        {diff >= 0 ? "+" : ""}{diff.toFixed(0)}%
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
