import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { useTeamStore, type TalentCategoryResults } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import type { DamageResult } from "../../types/wasm";

const tabOrder = ["normal", "skill", "burst"] as const;
type TabKey = typeof tabOrder[number];

const TAB_TO_CATEGORY: Record<TabKey, (keyof TalentCategoryResults)[]> = {
  normal: ["normal", "charged", "plunging"],
  skill: ["skill"],
  burst: ["burst"],
};

export function TeamDamageTable() {
  const { t } = useTranslation();
  const { members, mainDpsIndex, soloResults, teamResults } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);

  const mainDpsId = members[mainDpsIndex];
  const build = mainDpsId ? getBuild(mainDpsId) : undefined;
  const soloData = mainDpsId ? soloResults[mainDpsId] : undefined;
  const teamData = mainDpsId ? teamResults[mainDpsId] : undefined;

  const [activeTab, setActiveTab] = useState<TabKey>("normal");
  const [direction, setDirection] = useState(0);

  const handleTabChange = (value: string) => {
    const v = value as TabKey;
    setDirection(tabOrder.indexOf(v) > tabOrder.indexOf(activeTab) ? 1 : -1);
    setActiveTab(v);
  };

  if (!build || !soloData) {
    return (
      <div className="text-text-muted text-[12px] text-center py-8">
        {t("team.noTeamMembers")}
      </div>
    );
  }

  const soloRows: DamageResult[] = TAB_TO_CATEGORY[activeTab].flatMap((k) => soloData[k] ?? []);
  const teamRows: DamageResult[] = TAB_TO_CATEGORY[activeTab].flatMap((k) => teamData?.[k] ?? []);

  const el = build.character.element;

  const tabs = [
    { key: "normal", label: t("detail.normalAttack") },
    { key: "skill", label: t("detail.elementalSkill") },
    { key: "burst", label: t("detail.elementalBurst") },
  ];

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="flex flex-col">
      <Tabs.List className="flex gap-1 p-1 bg-navy-border/50 rounded-lg w-fit mb-4">
        {tabs.map(({ key, label }) => (
          <Tabs.Trigger
            key={key}
            value={key}
            className="px-5 py-2 rounded-md text-[12px] font-medium transition-all active:scale-95
              data-[state=active]:text-white data-[state=active]:font-bold
              text-text-secondary hover:bg-navy-hover"
            style={{ "--tab-active-bg": `var(--color-${el.toLowerCase()}, var(--color-gold))` } as React.CSSProperties}
            data-element={el}
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] gap-px text-[10px] font-label text-text-muted uppercase tracking-wider mb-1">
            <div className="px-2 py-1.5">{t("detail.talentName")}</div>
            <div className="px-2 py-1.5 text-right">{t("team.solo")} NC</div>
            <div className="px-2 py-1.5 text-right">{t("team.solo")} C</div>
            <div className="px-2 py-1.5 text-right">{t("team.solo")} Avg</div>
            <div className="px-2 py-1.5 text-right">{t("team.withTeam")} NC</div>
            <div className="px-2 py-1.5 text-right">{t("team.withTeam")} C</div>
            <div className="px-2 py-1.5 text-right">{t("team.withTeam")} Avg</div>
            <div className="px-2 py-1.5 text-right">{t("team.diff")}</div>
          </div>

          <div className="space-y-0.5">
            {soloRows.map((soloRow, i) => {
              const teamRow = teamRows[i];
              const diff = soloRow.average > 0 && teamRow
                ? ((teamRow.average - soloRow.average) / soloRow.average) * 100
                : 0;
              const diffColor = diff >= 0 ? "text-green-500" : "text-red-400";

              return (
                <div key={i} className="grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] gap-px bg-navy-card rounded-md">
                  <div className="px-2 py-2 text-[11px] text-text-primary">Row {i + 1}</div>
                  <DmgCell value={soloRow.non_crit} />
                  <DmgCell value={soloRow.crit} />
                  <DmgCell value={soloRow.average} bold />
                  <DmgCell value={teamRow?.non_crit ?? 0} team />
                  <DmgCell value={teamRow?.crit ?? 0} team />
                  <DmgCell value={teamRow?.average ?? 0} team bold />
                  <div className={`px-2 py-2 text-right text-[11px] font-mono font-bold ${diffColor}`}>
                    {diff >= 0 ? "+" : ""}{diff.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </Tabs.Root>
  );
}

interface DmgCellProps {
  readonly value: number;
  readonly bold?: boolean;
  readonly team?: boolean;
}

function DmgCell({ value, bold, team }: DmgCellProps) {
  return (
    <div className={`px-2 py-2 text-right text-[11px] font-mono
      ${bold ? "font-bold" : ""}
      ${team ? "text-green-400" : "text-text-primary"}`}
    >
      <AnimatedNumber value={value} formatFn={(v) => Math.round(v).toLocaleString()} />
    </div>
  );
}
