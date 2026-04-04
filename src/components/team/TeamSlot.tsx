import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CharacterBuild } from "../../types/wasm";
import { ELEMENT_TW } from "../../lib/elements";
import { localizeCharacterName } from "../../lib/localize";
import { charIcon } from "../../lib/charAssets";
import { isMoonsignCharacter } from "../../utils/moonsign";

interface TeamSlotProps {
  readonly build: Readonly<CharacterBuild>;
  readonly isMainDps: boolean;
  readonly onRemove: () => void;
  readonly onSetMainDps: () => void;
}

export function TeamSlot({ build, isMainDps, onRemove, onSetMainDps }: TeamSlotProps) {
  const { i18n, t } = useTranslation();
  const el = build.character.element;
  const tw = ELEMENT_TW[el];
  const isMoonsign = isMoonsignCharacter(build.character.id);
  const weaponName = build.weapon?.weapon.name ?? "—";
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
      className={`relative p-3 rounded-xl text-center transition-all
        ${isMainDps
          ? `border-2 ${tw.border} shadow-lg shadow-${el.toLowerCase()}/15`
          : "border border-navy-border"
        } bg-navy-card`}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-2 text-text-muted hover:text-text-primary text-[10px] transition-colors z-10"
      >
        ✕
      </button>

      {/* DPS badge — tap to set main DPS */}
      {isMainDps ? (
        <span className={`absolute top-1.5 left-2 text-[8px] ${tw.text} bg-navy-page/80 px-1.5 py-0.5 rounded`}>
          {t("team.mainDps")}
        </span>
      ) : (
        <button
          type="button"
          onClick={onSetMainDps}
          className="absolute top-1.5 left-2 text-[8px] text-text-muted hover:text-gold bg-navy-page/80 px-1.5 py-0.5 rounded transition-colors z-10"
        >
          {t("team.setDps")}
        </button>
      )}

      {/* Moonsign badge — below DPS badge to avoid overlap */}
      {isMoonsign && (
        <span className={`absolute text-[8px] text-gold bg-navy-page/80 px-1.5 py-0.5 rounded
          ${isMainDps ? "top-6 left-2" : "top-6 left-2"}`}
        >
          {t("team.moonsign")}
        </span>
      )}

      {/* Character icon — drag handle */}
      <div
        {...listeners}
        className={`w-[52px] h-[52px] rounded-full mx-auto mt-2 mb-1.5 border-2 overflow-hidden cursor-grab touch-none
          bg-gradient-to-br ${tw.gradient} to-transparent ${tw.border}`}
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
