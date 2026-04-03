import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useGoodStore } from "../../stores/good";

export function GoodImporter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { importGood, error, warnings } = useGoodStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    importGood(text);
    if (useGoodStore.getState().builds.length > 0) navigate("/characters");
  }, [importGood, navigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-gold bg-gold/5"
            : "border-navy-border bg-navy-card/50 hover:border-gold"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("good-file-input")?.click()}
      >
        <div className={`text-[32px] mb-3 transition-colors ${isDragging ? "text-gold" : "text-text-muted"}`}>
          ☁
        </div>
        <p className="text-base text-text-secondary">
          {t("import.dragDrop")}
        </p>
        <p className="text-[12px] text-text-muted mt-1">
          {t("import.or")} <span className="underline">{t("import.selectFile")}</span>
        </p>
        <input
          id="good-file-input"
          type="file"
          accept=".json"
          onChange={handleFileInput}
          className="hidden"
        />
      </motion.div>

      {/* Sample Data CTA */}
      <button
        className="w-full h-[44px] bg-gold hover:bg-gold-light text-navy-page font-semibold text-[15px] rounded-md transition-all active:scale-[0.98]"
        onClick={async () => {
          const res = await fetch(`${import.meta.env.BASE_URL}sample.json`);
          const text = await res.text();
          importGood(text);
          if (useGoodStore.getState().builds.length > 0) navigate("/characters");
        }}
      >
        {t("import.sampleData")}
      </button>

      {/* Error / Warning messages */}
      {error && (
        <div className="w-full p-4 bg-navy-card border border-pyro/40 rounded-lg">
          <p className="text-pyro font-medium">{t("import.error")}</p>
          <p className="text-text-secondary text-sm mt-1">{error}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="w-full p-4 bg-navy-card border border-gold/40 rounded-lg">
          <p className="text-gold font-medium">{t("import.warnings")}</p>
          <ul className="text-text-secondary text-sm mt-1 list-disc list-inside">
            {warnings.map((w, i) => <li key={i}>{w.message}</li>)}
          </ul>
        </div>
      )}

      {/* Format note */}
      <p className="text-[11px] text-text-muted leading-relaxed max-w-[400px] text-center">
        {t("import.supported")}
      </p>
    </div>
  );
}
