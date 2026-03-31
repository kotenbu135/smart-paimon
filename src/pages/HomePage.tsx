import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GoodImporter } from "../components/import/GoodImporter";

export function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6">
      {/* Ambient background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] flex flex-col items-center text-center"
      >
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-gold tracking-[-0.5px] leading-tight">
            {t("app.title")}
          </h1>
          <p className="text-base text-text-secondary mt-1">
            {t("app.subtitle")}
          </p>
        </div>

        <GoodImporter />
      </motion.div>
    </div>
  );
}
