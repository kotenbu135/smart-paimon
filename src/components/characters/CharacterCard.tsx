import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { CharacterBuild } from "@kotenbu/genshin-calc/types";

const ELEMENT_COLORS: Record<string, string> = {
  Pyro: "border-red-500/30 hover:border-red-500/60",
  Hydro: "border-blue-500/30 hover:border-blue-500/60",
  Electro: "border-purple-500/30 hover:border-purple-500/60",
  Cryo: "border-cyan-500/30 hover:border-cyan-500/60",
  Anemo: "border-teal-500/30 hover:border-teal-500/60",
  Geo: "border-yellow-600/30 hover:border-yellow-600/60",
  Dendro: "border-green-500/30 hover:border-green-500/60",
};

const ELEMENT_BG: Record<string, string> = {
  Pyro: "bg-red-500/10", Hydro: "bg-blue-500/10", Electro: "bg-purple-500/10",
  Cryo: "bg-cyan-500/10", Anemo: "bg-teal-500/10", Geo: "bg-yellow-600/10", Dendro: "bg-green-500/10",
};

const ELEMENT_EMOJI: Record<string, string> = {
  Pyro: "🔥", Hydro: "💧", Electro: "⚡", Cryo: "❄️", Anemo: "🌪️", Geo: "🪨", Dendro: "🌿",
};

interface Props { build: CharacterBuild; }

export function CharacterCard({ build }: Props) {
  const { t } = useTranslation();
  const { character, level, constellation } = build;
  const el = character.element;
  return (
    <Link to={`/characters/${character.id}`}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className={`p-4 rounded-xl border ${ELEMENT_COLORS[el] ?? "border-gray-700"} ${ELEMENT_BG[el] ?? "bg-gray-900/50"} transition-all cursor-pointer`}>
        <div className="text-center">
          <div className="text-2xl mb-2">{ELEMENT_EMOJI[el] ?? "?"}</div>
          <p className="font-bold text-sm truncate">{character.name}</p>
          <p className="text-xs text-gray-400 mt-1">{t("detail.level", { level })} / {t("detail.constellation", { count: constellation })}</p>
          <p className="text-xs text-gray-500 mt-0.5">{"★".repeat(character.rarity)}</p>
        </div>
      </motion.div>
    </Link>
  );
}
