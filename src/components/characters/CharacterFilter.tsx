import { useTranslation } from "react-i18next";
import type { Element, WeaponType } from "../../types/wasm";
import type { SortKey, SortDir } from "../../pages/CharactersPage";
import { ALL_ELEMENTS, ALL_WEAPONS, ELEMENT_TW } from "../../lib/elements";
import { elementIcon } from "../../lib/charAssets";

const SORT_KEYS: SortKey[] = ["default", "level", "rarity", "name"];

interface CharacterFilterProps {
  readonly elementFilter: Element | null;
  readonly weaponFilter: WeaponType | null;
  readonly onElementChange: (el: Element | null) => void;
  readonly onWeaponChange: (wt: WeaponType | null) => void;
  readonly sortKey: SortKey;
  readonly sortDir: SortDir;
  readonly onSortChange: (key: SortKey) => void;
}

export function CharacterFilter({ elementFilter, weaponFilter, onElementChange, onWeaponChange, sortKey, sortDir, onSortChange }: CharacterFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-14 z-30 bg-navy-page/95 backdrop-blur-md px-6 py-4 border-b border-navy-border flex flex-col gap-3">
      {/* Row 1: Element filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {ALL_ELEMENTS.map((el) => {
          const active = elementFilter === el;
          const tw = ELEMENT_TW[el];
          return (
            <button
              key={el}
              onClick={() => onElementChange(active ? null : el as Element)}
              className={`px-4 py-1.5 rounded text-xs font-label uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                active
                  ? `${tw.bg} text-white`
                  : "bg-navy-card text-text-secondary hover:bg-navy-hover"
              }`}
            >
              <img src={elementIcon(el)} alt={el} className="w-4 h-4 inline-block" />
              <span>{t(`element.${el.toLowerCase()}`)}</span>
            </button>
          );
        })}
      </div>
      {/* Row 2: Weapon filters + Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ALL_WEAPONS.map((wt) => {
            const active = weaponFilter === wt;
            return (
              <button
                key={wt}
                onClick={() => onWeaponChange(active ? null : wt as WeaponType)}
                className={`px-3 py-1 rounded text-[11px] font-label uppercase tracking-widest transition-all active:scale-95 ${
                  active
                    ? "bg-gold text-navy-page font-bold"
                    : "bg-navy-card text-text-secondary hover:bg-navy-hover"
                }`}
              >
                {t(`weaponType.${wt.toLowerCase()}`)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          {SORT_KEYS.map((key) => {
            const active = sortKey === key;
            return (
              <button
                key={key}
                onClick={() => onSortChange(key)}
                className={`px-2.5 py-1 rounded text-[11px] font-label transition-all active:scale-95 ${
                  active
                    ? "bg-navy-hover text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t(`characters.sort.${key}`)}
                {active && (
                  <span className="ml-0.5">{sortDir === "desc" ? "▼" : "▲"}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
