import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { useTeamStore, type TalentCategoryResults } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import { localizeTalentName } from "../../lib/localize";
import type { DamageResult } from "../../types/wasm";

const tabOrder = ["normal", "skill", "burst"] as const;
type TabKey = typeof tabOrder[number];

const TAB_TO_CATEGORY: Record<TabKey, (keyof TalentCategoryResults)[]> = {
  normal: ["normal", "charged", "plunging"],
  skill: ["skill"],
  burst: ["burst"],
};

export function TeamDamageTable() {
  const { t, i18n } = useTranslation();
  const { members, mainDpsIndex, teamResults } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);

  const mainDpsId = members[mainDpsIndex];
  const build = mainDpsId ? getBuild(mainDpsId) : undefined;
  const teamData = mainDpsId ? teamResults[mainDpsId] : undefined;

  const [activeTab, setActiveTab] = useState<TabKey>("normal");
  const [direction, setDirection] = useState(0);

  const handleTabChange = (value: string) => {
    const v = value as TabKey;
    setDirection(tabOrder.indexOf(v) > tabOrder.indexOf(activeTab) ? 1 : -1);
    setActiveTab(v);
  };

  if (!build || !teamData) {
    return (
      <div className="text-text-muted text-[12px] text-center py-8">
        {t("team.noTeamMembers")}
      </div>
    );
  }

  const rows: DamageResult[] = TAB_TO_CATEGORY[activeTab].flatMap((k) => teamData[k] ?? []);
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
          <div className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] gap-px text-[10px] font-label text-text-muted uppercase tracking-wider mb-1">
            <div className="px-2 py-1.5">{t("detail.talentName")}</div>
            <div className="px-2 py-1.5 text-right">{t("detail.nonCrit")}</div>
            <div className="px-2 py-1.5 text-right">{t("detail.crit")}</div>
            <div className="px-2 py-1.5 text-right">{t("detail.average")}</div>
          </div>

          <div className="space-y-0.5">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] gap-px bg-navy-card rounded-md">
                <div className="px-2 py-2 text-[11px] text-text-primary truncate">
                  {localizeTalentName(row.name, i18n.language)}
                </div>
                <DmgCell value={row.non_crit} />
                <DmgCell value={row.crit} />
                <DmgCell value={row.average} bold />
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </Tabs.Root>
  );
}

interface DmgCellProps {
  readonly value: number;
  readonly bold?: boolean;
}

function DmgCell({ value, bold }: DmgCellProps) {
  return (
    <div className={`px-2 py-2 text-right text-[11px] font-mono text-text-primary
      ${bold ? "font-bold" : ""}`}
    >
      <AnimatedNumber value={value} formatFn={(v) => Math.round(v).toLocaleString()} />
    </div>
  );
}
