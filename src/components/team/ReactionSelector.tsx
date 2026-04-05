import * as Select from "@radix-ui/react-select";
import { useTranslation } from "react-i18next";
import { useTeamStore } from "../../stores/team";
import type { Reaction } from "../../types/wasm";

const REACTIONS: readonly { key: string; value: Reaction | null }[] = [
  { key: "none", value: null },
  { key: "vaporize", value: "Vaporize" },
  { key: "melt", value: "Melt" },
  { key: "aggravate", value: "Aggravate" },
  { key: "spread", value: "Spread" },
  { key: "overloaded", value: "Overloaded" },
  { key: "superconduct", value: "Superconduct" },
  { key: "electroCharged", value: "ElectroCharged" },
] as const;

export function ReactionSelector() {
  const { t } = useTranslation();
  const { selectedReaction, setReaction } = useTeamStore();

  const currentKey = REACTIONS.find((r) => r.value === selectedReaction)?.key ?? "none";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-muted uppercase font-label">{t("reaction.title")}</label>
      <Select.Root value={currentKey} onValueChange={(v) => {
        const found = REACTIONS.find((r) => r.key === v);
        setReaction(found?.value ?? null);
      }}>
        <Select.Trigger className="h-8 bg-navy-card border border-navy-border rounded-md px-3
          text-[13px] text-text-primary text-left focus:outline-none focus:border-gold transition-colors">
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="bg-navy-card border border-navy-border rounded-lg shadow-xl z-50 overflow-hidden">
            <Select.Viewport className="p-1">
              {REACTIONS.map(({ key }) => (
                <Select.Item
                  key={key}
                  value={key}
                  className="px-3 py-1.5 text-[11px] text-text-primary rounded cursor-pointer
                    hover:bg-navy-hover outline-none"
                >
                  <Select.ItemText>{t(`reaction.${key}`)}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
