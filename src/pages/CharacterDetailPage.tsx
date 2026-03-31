import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useGoodStore } from "../stores/good";
import { useCalcStore } from "../stores/calc";
import { buildStats } from "../lib/stats";
import { CharacterProfile } from "../components/detail/CharacterProfile";
import { StatsPanel } from "../components/detail/StatsPanel";
import { DamageTable } from "../components/detail/DamageTable";
import { EnemyConfig } from "../components/detail/EnemyConfig";
import { ReactionSelector } from "../components/detail/ReactionSelector";

export function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const getBuild = useGoodStore((s) => s.getBuild);
  const { enemyConfig, selectedReaction } = useCalcStore();
  const build = id ? getBuild(id) : undefined;
  const stats = useMemo(() => build ? buildStats(build) : null, [build]);

  if (!build || !stats) return <Navigate to="/characters" replace />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{build.character.name}</h2>
      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <CharacterProfile build={build} />
          <StatsPanel stats={stats} />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
            <EnemyConfig />
            <div className="w-px h-8 bg-gray-800" />
            <ReactionSelector />
          </div>
          <DamageTable build={build} stats={stats} enemy={enemyConfig} reaction={selectedReaction} />
        </div>
      </div>
    </div>
  );
}
