import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="fixed bottom-0 w-full bg-navy-card border-t border-navy-border z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex justify-between items-center gap-2">
        <span className="text-[10px] sm:text-[11px] text-text-muted leading-tight">
          Smart Paimon — {t("footer.disclaimer")}
        </span>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/kotenbu135/smart-paimon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/kotenbu135/genshin-calc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Calc Engine
          </a>
        </div>
      </div>
    </footer>
  );
}
