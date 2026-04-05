import { motion } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface PageTransitionProps {
  readonly children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (ref.current) {
          ref.current.style.transform = "none";
        }
      }}
    >
      {children}
    </motion.div>
  );
}
