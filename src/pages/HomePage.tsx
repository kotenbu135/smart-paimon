import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GoodImporter } from "../components/import/GoodImporter";

export function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-bold text-amber-400 mb-2">{t("app.title")}</h1>
        <p className="text-gray-400">{t("app.subtitle")}</p>
      </motion.div>
      <GoodImporter />
    </div>
  );
}
