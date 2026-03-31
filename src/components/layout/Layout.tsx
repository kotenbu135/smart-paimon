import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useUIStore } from "../../stores/ui";
import { useTranslation } from "react-i18next";

export function Layout() {
  const { wasmReady, wasmError } = useUIStore();
  const { t } = useTranslation();

  if (wasmError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center p-8 bg-red-950/50 border border-red-800 rounded-xl max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">{t("common.error")}</h2>
          <p className="text-red-300 mb-4">{wasmError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors">
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!wasmReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
