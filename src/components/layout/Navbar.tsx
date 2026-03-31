import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUIStore } from "../../stores/ui";
import { useGoodStore } from "../../stores/good";
import { game_version } from "@kotenbu/genshin-calc";

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { locale, setLocale } = useUIStore();
  const builds = useGoodStore((s) => s.builds);

  const navItems = [
    { to: "/", label: t("nav.import") },
    { to: "/characters", label: t("nav.characters") },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold text-amber-400">{t("app.title")}</Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <Link key={to} to={to} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive(to) ? "bg-amber-400/10 text-amber-400" : "text-gray-400 hover:text-gray-200"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {builds.length > 0 && (
            <span className="text-gray-500">
              {t("characters.count", { count: builds.length })} | {t("common.version", { version: game_version() })}
            </span>
          )}
          <button onClick={() => setLocale(locale === "ja" ? "en" : "ja")} className="px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors">
            {locale === "ja" ? "EN" : "JP"}
          </button>
        </div>
      </div>
    </nav>
  );
}
