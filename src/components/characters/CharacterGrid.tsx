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
    transition: { staggerChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export function CharacterGrid({ builds }: CharacterGridProps) {
  return (
    <motion.div
      key={builds.map((b) => b.character.id).join(",")}
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3"
    >
      {builds.map((build) => (
        <motion.div key={build.character.id} variants={item}>
          <CharacterCard build={build} />
        </motion.div>
      ))}
    </motion.div>
  );
}
