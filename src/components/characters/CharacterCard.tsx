import { Link } from "react-router-dom";
import type { CharacterBuild } from "@kotenbu/genshin-calc/types";
import { ELEMENT_META, ELEMENT_TW, RARITY_COLORS } from "../../lib/elements";

interface CharacterCardProps {
  readonly build: Readonly<CharacterBuild>;
}

export function CharacterCard({ build }: CharacterCardProps) {
  const { character, level } = build;
  const el = character.element;
  const meta = ELEMENT_META[el];
  const tw = ELEMENT_TW[el];

  return (
    <Link to={`/characters/${character.id}`}>
      <div
        className={`bg-navy-card border border-navy-border rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${meta?.glowClass ?? ""}`}
      >
        {/* Avatar area with element gradient */}
        <div className={`relative aspect-square overflow-hidden bg-gradient-to-b ${tw?.gradient ?? ""} to-transparent`}>
          {/* Placeholder avatar */}
          <div className="w-full h-full bg-navy-hover flex items-center justify-center text-text-muted text-3xl">
            {meta?.abbr ?? "?"}
          </div>
          {/* Element badge */}
          <div
            className={`absolute top-2 right-2 w-5 h-5 rounded-full ${tw?.bg ?? "bg-navy-hover"} flex items-center justify-center text-[10px] font-bold text-white`}
          >
            {meta?.abbr ?? "?"}
          </div>
        </div>
        {/* Info area */}
        <div className="p-3 text-center">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {character.name}
          </h3>
          <div className={`text-[10px] my-1 ${RARITY_COLORS[character.rarity] ?? "text-text-muted"}`}>
            {"★".repeat(character.rarity)}
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Lv.{level}
          </span>
        </div>
      </div>
    </Link>
  );
}
