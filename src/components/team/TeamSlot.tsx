import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CharacterBuild } from "../../types/wasm";
import { ELEMENT_TW } from "../../lib/elements";
import { localizeCharacterName, localizeWeaponName } from "../../lib/localize";
import { charIcon } from "../../lib/charAssets";
import { isMoonsignCharacter } from "../../utils/moonsign";

interface TeamSlotProps {
  readonly build: Readonly<CharacterBuild>;
  readonly isMainDps: boolean;
  readonly onRemove: () => void;
  readonly onIconClick: () => void;
  readonly onCardClick: () => void;
}

export function TeamSlot({ build, isMainDps, onRemove, onIconClick, onCardClick }: TeamSlotProps) {
  const { i18n, t } = useTranslation();
  const el = build.character.element;
  const tw = ELEMENT_TW[el];
  const isMoonsign = isMoonsignCharacter(build.character.id);
  const weaponName = build.weapon
    ? localizeWeaponName(build.weapon.weapon.id, build.weapon.weapon.name, i18n.language)
    : "—";
  const refinement = build.weapon?.refinement ?? 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: build.character.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative p-3 rounded-xl text-center transition-all cursor-pointer
        ${isMainDps
          ? `border-2 ${tw.border} shadow-lg shadow-${el.toLowerCase()}/15`
          : "border border-navy-border"
        } bg-navy-card`}
      onClick={onCardClick}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full
          text-text-muted hover:text-red-400 hover:bg-red-400/10 text-[12px] transition-colors z-10"
        aria-label={t("team.remove")}
      >
        ✕
      </button>

      {/* Moonsign badge */}
      {isMoonsign && (
        <span className="absolute top-1.5 left-2 text-[8px] text-gold bg-navy-page/80 px-1.5 py-0.5 rounded">
          {t("team.moonsign")}
        </span>
      )}

      {/* Character icon — click to replace, drag to reorder */}
      <div
        {...listeners}
        onClick={(e) => { e.stopPropagation(); onIconClick(); }}
        className={`w-[52px] h-[52px] rounded-full mx-auto mt-2 mb-1.5 border-2 overflow-hidden cursor-pointer touch-none
          bg-gradient-to-br ${tw.gradient} to-transparent ${tw.border} hover:ring-2 hover:ring-gold/50`}
      >
        <img
          src={charIcon(build.character.id)}
          alt={build.character.name}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* Name */}
      <div className="text-[12px] font-semibold text-text-primary truncate">
        {localizeCharacterName(build.character.id, build.character.name, i18n.language)}
      </div>

      {/* Level / Weapon */}
      <div className="text-[9px] text-text-muted mt-0.5 truncate">
        Lv.{build.level} C{build.constellation} | {weaponName} R{refinement}
      </div>
    </div>
  );
}
