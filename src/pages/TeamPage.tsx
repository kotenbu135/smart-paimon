import { useTranslation } from "react-i18next";
import { PageTransition } from "../components/ui/PageTransition";

export function TeamPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col">
        <div className="py-6 pb-0 mb-6">
          <h1 className="text-xl font-bold text-gold font-label uppercase tracking-wider">
            {t("team.title")}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 pb-6">
          {/* Left Sidebar — placeholder */}
          <aside className="w-full lg:w-[200px] flex-shrink-0 space-y-3">
            <div className="bg-navy-card border border-navy-border rounded-lg p-4 text-text-muted text-sm">
              {t("team.noTeamMembers")}
            </div>
          </aside>

          {/* Right Main Panel — placeholder */}
          <div className="flex-grow flex flex-col gap-4">
            <div className="bg-navy-card border border-navy-border rounded-lg p-4 text-text-muted text-sm">
              {t("team.damageSummary")}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
