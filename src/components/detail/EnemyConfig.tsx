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
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-500">{t("enemy.title")}:</span>
      <label className="flex items-center gap-1">
        <span className="text-gray-400">{t("enemy.level")}</span>
        <input type="number" value={enemyConfig.level} onChange={(e) => setEnemy({ ...enemyConfig, level: parseInt(e.target.value) || 90 })}
          className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-sm" />
      </label>
      <label className="flex items-center gap-1">
        <span className="text-gray-400">{t("enemy.resistance")}</span>
        <input type="number" value={Math.round(enemyConfig.resistance * 100)} onChange={(e) => update("resistance", e.target.value)}
          className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-sm" />
        <span className="text-gray-500">%</span>
      </label>
      <label className="flex items-center gap-1">
        <span className="text-gray-400">{t("enemy.defReduction")}</span>
        <input type="number" value={Math.round(enemyConfig.def_reduction * 100)} onChange={(e) => update("def_reduction", e.target.value)}
          className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-sm" />
        <span className="text-gray-500">%</span>
      </label>
    </div>
  );
}
