import { useTranslation } from "react-i18next";
import { useTeamStore } from "../../stores/team";

interface StepperProps {
  readonly label: string;
  readonly value: number;
  readonly onChange: (v: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly suffix?: string;
}

function Stepper({ label, value, onChange, min = 0, max = 200, step = 1, suffix }: StepperProps) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    if (!isNaN(num)) onChange(Math.max(min, Math.min(max, num)));
  };

  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[8px] text-text-muted uppercase font-label">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={handleInput}
        className="w-full bg-navy-page border border-navy-border rounded-md px-2 py-1.5
          text-[10px] font-mono text-text-primary text-center
          focus:outline-none focus:border-gold transition-colors"
      />
      {suffix && <span className="text-text-muted text-[8px] text-center -mt-0.5">{suffix}</span>}
    </div>
  );
}

export function TeamEnemyConfig() {
  const { t } = useTranslation();
  const { enemyConfig, setEnemy } = useTeamStore();

  return (
    <section className="bg-navy-card border border-navy-border rounded-xl p-3">
      <div className="text-[10px] font-label font-bold text-gold uppercase tracking-wider mb-2">
        {t("team.enemyConfig")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stepper
          label={t("enemy.level")}
          value={enemyConfig.level}
          onChange={(v) => setEnemy({ ...enemyConfig, level: v })}
          min={1}
          max={100}
        />
        <Stepper
          label={t("enemy.resistance")}
          value={Math.round(enemyConfig.resistance * 100)}
          onChange={(v) => setEnemy({ ...enemyConfig, resistance: v / 100 })}
          min={-200}
          max={200}
          step={5}
          suffix="%"
        />
        <Stepper
          label={t("enemy.defReduction")}
          value={Math.round(enemyConfig.def_reduction * 100)}
          onChange={(v) => setEnemy({ ...enemyConfig, def_reduction: v / 100 })}
          min={-100}
          max={100}
          step={5}
          suffix="%"
        />
      </div>
    </section>
  );
}
