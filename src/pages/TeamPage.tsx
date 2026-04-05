import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PageTransition } from "../components/ui/PageTransition";
import { TeamSidebar } from "../components/team/TeamSidebar";
import { TeamEnemyConfig } from "../components/team/TeamEnemyConfig";
import { ReactionSelector } from "../components/team/ReactionSelector";
import { BuffDetailTab } from "../components/team/BuffDetailTab";
import { TeamDamageTable } from "../components/team/TeamDamageTable";
import { useTeamStore } from "../stores/team";
import { useGoodStore } from "../stores/good";
import { useUIStore } from "../stores/ui";

export function TeamPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("buffs");

  const members = useTeamStore((s) => s.members);
  const mainDpsIndex = useTeamStore((s) => s.mainDpsIndex);
  const enemyConfig = useTeamStore((s) => s.enemyConfig);
  const selectedReaction = useTeamStore((s) => s.selectedReaction);
  const resolveTeam = useTeamStore((s) => s.resolveTeam);
  const rawJson = useGoodStore((s) => s.rawJson);
  const wasmReady = useUIStore((s) => s.wasmReady);

  useEffect(() => {
    const filledCount = members.filter((m) => m !== null).length;
    if (!wasmReady || !rawJson || filledCount === 0) return;
    resolveTeam();
  }, [members, mainDpsIndex, enemyConfig, selectedReaction, rawJson, wasmReady, resolveTeam]);

  return (
    <PageTransition>
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col">
        <div className="py-6 pb-0 mb-6">
          <h1 className="text-xl font-bold text-gold font-label uppercase tracking-wider">
            {t("team.title")}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 pb-6">
          <TeamSidebar />

          <div className="flex-grow flex flex-col gap-4">
            <section className="bg-navy-card border border-navy-border rounded-lg p-4 flex flex-wrap gap-6 items-center">
              <span className="text-[12px] font-label font-bold text-text-secondary uppercase tracking-wider">
                {t("enemy.title")}
              </span>
              <TeamEnemyConfig />
              <ReactionSelector />
            </section>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex gap-1 p-1 bg-navy-border/50 rounded-lg w-fit">
                <Tabs.Trigger
                  value="buffs"
                  className="px-6 py-2 rounded-md text-[12px] font-medium transition-all active:scale-95
                    data-[state=active]:bg-gold data-[state=active]:text-navy-page data-[state=active]:font-bold
                    text-text-secondary hover:bg-navy-hover"
                >
                  {t("team.buffDetail")}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="damage"
                  className="px-6 py-2 rounded-md text-[12px] font-medium transition-all active:scale-95
                    data-[state=active]:bg-gold data-[state=active]:text-navy-page data-[state=active]:font-bold
                    text-text-secondary hover:bg-navy-hover"
                >
                  {t("team.damageTable")}
                </Tabs.Trigger>
              </Tabs.List>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="mt-4"
                >
                  <Tabs.Content value="buffs" forceMount={activeTab === "buffs" ? true : undefined}>
                    <BuffDetailTab />
                  </Tabs.Content>
                  <Tabs.Content value="damage" forceMount={activeTab === "damage" ? true : undefined}>
                    <TeamDamageTable />
                  </Tabs.Content>
                </motion.div>
              </AnimatePresence>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
