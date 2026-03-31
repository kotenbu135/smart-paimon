import { useTranslation } from "react-i18next";
import type { CharacterBuild } from "@kotenbu/genshin-calc/types";

interface Props { build: CharacterBuild; }

export function CharacterProfile({ build }: Props) {
  const { t } = useTranslation();
  const { character, level, constellation, weapon, artifacts } = build;
  return (
    <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl space-y-3">
      <div className="text-center">
        <p className="text-xl font-bold">{character.name}</p>
        <p className="text-sm text-gray-400">{t("detail.level", { level })} / {t("detail.constellation", { count: constellation })}</p>
        <p className="text-xs text-gray-500">{"★".repeat(character.rarity)}</p>
      </div>
      {weapon && (
        <div className="border-t border-gray-800 pt-3">
          <p className="text-xs text-gray-500 mb-1">{t("detail.weapon")}</p>
          <p className="font-medium text-sm">{weapon.weapon.name}</p>
          <p className="text-xs text-gray-400">Lv.{weapon.level} R{weapon.refinement}</p>
        </div>
      )}
      <div className="border-t border-gray-800 pt-3">
        <p className="text-xs text-gray-500 mb-1">{t("detail.artifacts")}</p>
        {artifacts.sets.map((set) => <p key={set.id} className="text-sm">{set.name}</p>)}
        {artifacts.four_piece_set && <p className="text-xs text-amber-400/70 mt-1">4pc {artifacts.four_piece_set.name}</p>}
      </div>
    </div>
  );
}
