import { useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoodStore } from "../stores/good";
import { useCalcStore } from "../stores/calc";
import { buildStats } from "../lib/stats";
import { CharacterProfile } from "../components/detail/CharacterProfile";
import { StatsPanel } from "../components/detail/StatsPanel";
import { DamageTable } from "../components/detail/DamageTable";
import { EnemyConfig } from "../components/detail/EnemyConfig";
import { localizeCharacterName } from "../lib/localize";

export function CharacterDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const getBuild = useGoodStore((s) => s.getBuild);
  const rawJson = useGoodStore((s) => s.rawJson);
  const { enemyConfig } = useCalcStore();
  const build = id ? getBuild(id) : undefined;
  const stats = useMemo(
    () => (build && rawJson && id ? buildStats(rawJson, id) : null),
    [build, rawJson, id]
  );

  if (!build || !stats) return <Navigate to="/characters" replace />;

  return (
    <div className="max-w-[1440px] mx-auto px-6 flex flex-col">
      {/* Breadcrumb */}
      <div className="py-6 pb-0 mb-6 flex items-center gap-2 text-xs font-label uppercase tracking-widest text-text-secondary">
        <Link to="/characters" className="hover:text-text-primary transition-colors">
          {t("nav.characters")}
        </Link>
        <span className="text-text-muted">›</span>
        <span className="text-gold">{localizeCharacterName(build.character.id, build.character.name, i18n.language)}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 pb-6">
        {/* Left Column: Profile & Stats */}
        <aside className="w-full lg:w-[360px] flex-shrink-0 space-y-3">
          <CharacterProfile build={build} />
          <StatsPanel stats={stats} />
        </aside>

        {/* Right Column: Calculator */}
        <div className="flex-grow flex flex-col">
          <DamageTable
            build={build}
            stats={stats}
            enemy={enemyConfig}
            reaction={null}
            stickyHeader={<EnemyConfig />}
          />
        </div>
      </div>
    </div>
  );
}
