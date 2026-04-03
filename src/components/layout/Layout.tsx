import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useUIStore } from "../../stores/ui";
import { useTranslation } from "react-i18next";

export function Layout() {
  const { wasmReady, wasmError } = useUIStore();
  const { t } = useTranslation();

  if (wasmError) {
    return (
      <div className="min-h-screen bg-navy-page flex items-center justify-center">
        <div className="text-center p-8 bg-navy-card border border-navy-border rounded-lg max-w-md">
          <h2 className="text-pyro text-xl font-bold mb-2">{t("common.error")}</h2>
          <p className="text-text-secondary mb-4">{wasmError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-navy-page font-semibold rounded-md transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!wasmReady) {
    return (
      <div className="min-h-screen bg-navy-page flex items-center justify-center">
        <p className="text-text-muted text-lg animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-page text-text-primary">
      <Navbar />
      <main className="pt-14 pb-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
