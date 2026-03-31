import type { CharacterBuild } from "@kotenbu/genshin-calc/types";
import { CharacterCard } from "./CharacterCard";
import { motion } from "framer-motion";

interface Props { builds: CharacterBuild[]; }

export function CharacterGrid({ builds }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {builds.map((build) => <CharacterCard key={build.character.id} build={build} />)}
    </motion.div>
  );
}
