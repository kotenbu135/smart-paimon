import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 w-full bg-navy-card border-b border-navy-border z-50">
      <div className="flex justify-between items-center px-4 md:px-6 h-14 max-w-7xl mx-auto">
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
            <Link
              to={builds.length > 0 ? "/team" : "#"}
              className={`h-full flex items-center text-sm font-semibold tracking-wide transition-colors ${
                isActive("/team")
                  ? "text-text-primary border-b-2 border-gold"
                  : builds.length > 0
                    ? "text-text-secondary hover:text-text-primary"
                    : "text-text-muted cursor-not-allowed pointer-events-none"
              }`}
            >
              {t("nav.team")}
            </Link>
            <span className="text-text-muted text-sm font-semibold tracking-wide cursor-not-allowed">
              {t("nav.compare")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-navy-border">
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
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-1.5 text-text-secondary hover:text-text-primary hover:bg-navy-hover rounded transition-colors"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-navy-card border-b border-navy-border px-4 pb-3 space-y-1">
          <Link
            to={builds.length > 0 ? "/characters" : "#"}
            onClick={() => setMenuOpen(false)}
            className={`block px-3 py-2 rounded text-sm font-semibold tracking-wide transition-colors ${
              isActive("/characters")
                ? "text-gold bg-navy-hover"
                : builds.length > 0
                  ? "text-text-secondary hover:text-text-primary hover:bg-navy-hover"
                  : "text-text-muted cursor-not-allowed pointer-events-none"
            }`}
          >
            {t("nav.characters")}
          </Link>
          <span className="block px-3 py-2 text-text-muted text-sm font-semibold tracking-wide cursor-not-allowed">
            {t("nav.team")}
          </span>
          <span className="block px-3 py-2 text-text-muted text-sm font-semibold tracking-wide cursor-not-allowed">
            {t("nav.compare")}
          </span>
          <div className="flex items-center gap-3 px-3 pt-2 border-t border-navy-border sm:hidden">
            <span className="bg-navy-hover px-2 py-0.5 rounded text-[10px] font-mono text-gold border border-navy-border">
              {builds.length} {t("nav.characters").toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              v{game_version()}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
