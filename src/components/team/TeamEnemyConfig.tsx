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
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    if (!isNaN(num)) onChange(Math.max(min, Math.min(max, num)));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-muted uppercase font-label">{label}</label>
      <div className="flex items-center h-8 rounded-md border border-navy-border overflow-hidden">
        <button
          type="button"
          onClick={decrement}
          className="w-7 h-full flex items-center justify-center bg-navy-hover text-text-secondary hover:text-text-primary hover:bg-navy-border transition-colors text-sm font-bold select-none"
        >
          −
        </button>
        <div className="flex items-center bg-navy-card px-1">
          <input
            type="number"
            value={value}
            onChange={handleInput}
            className="w-10 h-full bg-transparent text-center text-[13px] font-mono text-text-primary focus:outline-none"
          />
          {suffix && <span className="text-text-muted text-[11px] -ml-0.5">{suffix}</span>}
        </div>
        <button
          type="button"
          onClick={increment}
          className="w-7 h-full flex items-center justify-center bg-navy-hover text-text-secondary hover:text-text-primary hover:bg-navy-border transition-colors text-sm font-bold select-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function TeamEnemyConfig() {
  const { t } = useTranslation();
  const { enemyConfig, setEnemy } = useTeamStore();

  return (
    <div className="flex gap-4 flex-wrap">
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
  );
}
