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
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full p-12 border-2 border-dashed rounded-2xl text-center transition-colors cursor-pointer ${isDragging ? "border-amber-400 bg-amber-400/5" : "border-gray-700 hover:border-gray-600 bg-gray-900/50"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("good-file-input")?.click()}
      >
        <div className="text-4xl mb-4">📁</div>
        <p className="text-gray-300 text-lg mb-2">{t("import.dragDrop")}</p>
        <p className="text-gray-500 text-sm">{t("import.or")}</p>
        <button className="mt-3 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-medium rounded-lg transition-colors">
          {t("import.selectFile")}
        </button>
        <input id="good-file-input" type="file" accept=".json" onChange={handleFileInput} className="hidden" />
      </motion.div>

      {error && (
        <div className="w-full p-4 bg-red-950/50 border border-red-800 rounded-xl">
          <p className="text-red-400 font-medium">{t("import.error")}</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="w-full p-4 bg-yellow-950/50 border border-yellow-800 rounded-xl">
          <p className="text-yellow-400 font-medium">{t("import.warnings")}</p>
          <ul className="text-yellow-300 text-sm mt-1 list-disc list-inside">
            {warnings.map((w, i) => <li key={i}>{w.message}</li>)}
          </ul>
        </div>
      )}

      <p className="text-gray-600 text-xs text-center">{t("import.supported")}</p>
    </div>
  );
}
