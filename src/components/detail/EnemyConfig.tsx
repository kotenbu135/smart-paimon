import { useTranslation } from "react-i18next";
import { useCalcStore } from "../../stores/calc";

export function EnemyConfig() {
  const { t } = useTranslation();
  const { enemyConfig, setEnemy } = useCalcStore();

  const update = (field: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEnemy({ ...enemyConfig, [field]: field === "level" ? num : num / 100 });
  };

  return (
    <section className="bg-navy-card border border-navy-border rounded-lg p-4 flex flex-wrap gap-6 items-center">
      <span className="text-[12px] font-label font-bold text-text-secondary uppercase tracking-wider">
        {t("enemy.title")}
      </span>
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text-muted uppercase font-label">{t("enemy.level")}</label>
          <input
            type="number"
            value={enemyConfig.level}
            onChange={(e) => setEnemy({ ...enemyConfig, level: parseInt(e.target.value) || 90 })}
            className="w-20 h-9 bg-navy-card border border-navy-border rounded px-3 text-[14px] font-mono text-text-primary focus:border-gold focus:outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text-muted uppercase font-label">{t("enemy.resistance")}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={Math.round(enemyConfig.resistance * 100)}
              onChange={(e) => update("resistance", e.target.value)}
              className="w-20 h-9 bg-navy-card border border-navy-border rounded px-3 text-[14px] font-mono text-text-primary focus:border-gold focus:outline-none transition-colors"
            />
            <span className="text-text-muted text-sm">%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text-muted uppercase font-label">{t("enemy.defReduction")}</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={Math.round(enemyConfig.def_reduction * 100)}
              onChange={(e) => update("def_reduction", e.target.value)}
              className="w-20 h-9 bg-navy-card border border-navy-border rounded px-3 text-[14px] font-mono text-text-primary focus:border-gold focus:outline-none transition-colors"
            />
            <span className="text-text-muted text-sm">%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
