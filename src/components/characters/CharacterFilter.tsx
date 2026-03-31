import { useTranslation } from "react-i18next";
import type { Element, WeaponType } from "@kotenbu/genshin-calc/types";

const ELEMENTS: Element[] = ["Pyro", "Hydro", "Electro", "Cryo", "Anemo", "Geo", "Dendro"];
const WEAPON_TYPES: WeaponType[] = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

interface Props {
  elementFilter: Element | null;
  weaponFilter: WeaponType | null;
  onElementChange: (el: Element | null) => void;
  onWeaponChange: (wt: WeaponType | null) => void;
}

export function CharacterFilter({ elementFilter, weaponFilter, onElementChange, onWeaponChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm">{t("characters.filter.element")}:</span>
        <button onClick={() => onElementChange(null)} className={`px-2 py-1 text-xs rounded ${!elementFilter ? "bg-amber-400/20 text-amber-400" : "text-gray-400 hover:text-gray-200"}`}>{t("characters.filter.all")}</button>
        {ELEMENTS.map((el) => (
          <button key={el} onClick={() => onElementChange(elementFilter === el ? null : el)}
            className={`px-2 py-1 text-xs rounded ${elementFilter === el ? "bg-amber-400/20 text-amber-400" : "text-gray-400 hover:text-gray-200"}`}>
            {t(`element.${el.toLowerCase()}`)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm">{t("characters.filter.weapon")}:</span>
        <button onClick={() => onWeaponChange(null)} className={`px-2 py-1 text-xs rounded ${!weaponFilter ? "bg-amber-400/20 text-amber-400" : "text-gray-400 hover:text-gray-200"}`}>{t("characters.filter.all")}</button>
        {WEAPON_TYPES.map((wt) => (
          <button key={wt} onClick={() => onWeaponChange(weaponFilter === wt ? null : wt)}
            className={`px-2 py-1 text-xs rounded ${weaponFilter === wt ? "bg-amber-400/20 text-amber-400" : "text-gray-400 hover:text-gray-200"}`}>
            {t(`weaponType.${wt.toLowerCase()}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
