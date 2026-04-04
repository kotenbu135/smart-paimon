import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { useTranslation } from "react-i18next";
import { useTeamStore } from "../../stores/team";

export function TeamSaveLoad() {
  const { t } = useTranslation();
  const { savedTeams, saveTeam, loadTeam, deleteTeam } = useTeamStore();
  const [teamName, setTeamName] = useState("");

  const handleSave = () => {
    const name = teamName.trim() || `Team ${savedTeams.length + 1}`;
    saveTeam(name);
    setTeamName("");
  };

  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-3 space-y-2">
      {/* Team name input */}
      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder={t("team.teamName")}
        className="w-full bg-navy-page border border-navy-border rounded-md px-2.5 py-1.5
          text-[11px] text-text-primary placeholder:text-text-muted font-mono
          focus:outline-none focus:border-gold transition-colors"
      />

      {/* Save / Load buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-1.5 bg-gold text-navy-page rounded-md text-[10px] font-bold font-label
            hover:brightness-110 transition-all"
        >
          {t("team.save")}
        </button>

        {savedTeams.length > 0 ? (
          <Select.Root onValueChange={(v) => loadTeam(parseInt(v))}>
            <Select.Trigger className="flex-1 py-1.5 bg-navy-hover text-text-secondary rounded-md
              text-[10px] font-label text-center hover:bg-navy-border transition-colors">
              <Select.Value placeholder={t("team.load")} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-navy-card border border-navy-border rounded-lg shadow-xl z-50 overflow-hidden">
                <Select.Viewport className="p-1">
                  {savedTeams.map((team, i) => (
                    <Select.Item
                      key={i}
                      value={String(i)}
                      className="px-3 py-2 text-[11px] text-text-primary rounded-md cursor-pointer
                        hover:bg-navy-hover outline-none flex justify-between items-center"
                    >
                      <Select.ItemText>{team.name}</Select.ItemText>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteTeam(i); }}
                        className="text-text-muted hover:text-red-400 text-[9px] ml-2"
                      >
                        {t("team.deleteTeam")}
                      </button>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        ) : (
          <div className="flex-1 py-1.5 bg-navy-hover text-text-muted rounded-md text-[10px] font-label text-center">
            {t("team.load")}
          </div>
        )}
      </div>
    </div>
  );
}
