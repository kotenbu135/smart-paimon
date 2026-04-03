import type { CharacterBuild } from "../../types/wasm";
import { CharacterCard } from "./CharacterCard";
import { motion } from "framer-motion";

interface CharacterGridProps {
  readonly builds: readonly CharacterBuild[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function CharacterGrid({ builds }: CharacterGridProps) {
  return (
    <motion.div
      key={builds.map((b) => b.character.id).join(",")}
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
    >
      {builds.map((build) => (
        <motion.div key={build.character.id} variants={item}>
          <CharacterCard build={build} />
        </motion.div>
      ))}
    </motion.div>
  );
}
