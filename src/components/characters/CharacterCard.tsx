import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CharacterBuild } from "../../types/wasm";
import { ELEMENT_META, ELEMENT_TW, RARITY_COLORS } from "../../lib/elements";
import { charIcon, elementIcon } from "../../lib/charAssets";
import { localizeCharacterName } from "../../lib/localize";

interface CharacterCardProps {
  readonly build: Readonly<CharacterBuild>;
}

export function CharacterCard({ build }: CharacterCardProps) {
  const { t, i18n } = useTranslation();
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
          <img
            src={charIcon(character.id)}
            alt={character.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Element badge */}
          <div
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-navy-card flex items-center justify-center border-2 border-navy-border p-1.5"
          >
            <img src={elementIcon(el)} alt={el} className="w-full h-full" />
          </div>
        </div>
        {/* Info area */}
        <div className="p-3 text-center">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {localizeCharacterName(character.id, character.name, i18n.language)}
          </h3>
          <div className={`text-[10px] my-1 ${RARITY_COLORS[+character.rarity.replace("Star", "")] ?? "text-text-muted"}`}>
            {"★".repeat(+character.rarity.replace("Star", ""))}
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            {t("detail.level", { level })}
          </span>
        </div>
      </div>
    </Link>
  );
}
