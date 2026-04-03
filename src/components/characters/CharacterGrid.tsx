import type { CharacterBuild } from "../../types/wasm";
import { CharacterCard } from "./CharacterCard";
import { motion } from "framer-motion";

interface CharacterGridProps {
  readonly builds: readonly CharacterBuild[];
}

export function CharacterGrid({ builds }: CharacterGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {builds.map((build) => (
        <CharacterCard key={build.character.id} build={build} />
      ))}
    </motion.div>
  );
}
