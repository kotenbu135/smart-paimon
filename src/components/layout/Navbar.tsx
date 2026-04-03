import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUIStore } from "../../stores/ui";
import { useGoodStore } from "../../stores/good";
import { game_version } from "@kotenbu135/genshin-calc-wasm";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { locale, setLocale } = useUIStore();
  const builds = useGoodStore((s) => s.builds);
  const clearGood = useGoodStore((s) => s.clear);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 w-full h-14 bg-navy-card border-b border-navy-border z-50">
      <div className="flex justify-between items-center px-6 h-full max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-xl font-bold text-gold tracking-tight">
            Smart Paimon
          </Link>
          <div className="hidden md:flex items-center gap-6 h-14">
            <Link
              to={builds.length > 0 ? "/characters" : "#"}
              className={`h-full flex items-center text-sm font-semibold tracking-wide transition-colors ${
                isActive("/characters")
                  ? "text-text-primary border-b-2 border-gold"
                  : builds.length > 0
                    ? "text-text-secondary hover:text-text-primary"
                    : "text-text-muted cursor-not-allowed pointer-events-none"
              }`}
            >
              {t("nav.characters")}
            </Link>
            <span className="text-text-muted text-sm font-semibold tracking-wide cursor-not-allowed">
              {t("nav.team")}
            </span>
            <span className="text-text-muted text-sm font-semibold tracking-wide cursor-not-allowed">
              {t("nav.compare")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-navy-border">
            <span className="bg-navy-hover px-2 py-0.5 rounded text-[10px] font-mono text-gold border border-navy-border">
              {builds.length} {t("nav.characters").toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              v{game_version()}
            </span>
          </div>
          <button
            onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
            className="px-3 py-1 text-xs font-label text-text-secondary hover:bg-navy-hover rounded transition-colors"
          >
            {locale === "ja" ? "JA / EN" : "EN / JA"}
          </button>
          {builds.length > 0 && (
            <Link
              to="/"
              onClick={clearGood}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-navy-hover rounded transition-colors text-sm"
              title={t("nav.reimport")}
            >
              ↻
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
