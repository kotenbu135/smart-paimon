import { useTranslation } from "react-i18next";
import { artifactIcon } from "../../lib/charAssets";
import type { ArtifactSlot } from "../../lib/charAssets";
import {
  type GoodArtifact,
  statI18nKey,
  formatStatValue,
  setKeyToAssetId,
} from "../../lib/goodArtifacts";
import { RARITY_COLORS } from "../../lib/elements";

interface ArtifactDetailPopoverProps {
  readonly artifact: GoodArtifact;
}

const SLOT_LABELS: Record<ArtifactSlot, string> = {
  flower: "artifact.slot.flower",
  plume: "artifact.slot.plume",
  sands: "artifact.slot.sands",
  goblet: "artifact.slot.goblet",
  circlet: "artifact.slot.circlet",
};

export function ArtifactDetailPopover({ artifact }: ArtifactDetailPopoverProps) {
  const { t } = useTranslation();
  const assetId = setKeyToAssetId(artifact.setKey);
  const rarityColor = RARITY_COLORS[artifact.rarity] ?? "text-text-muted";

  return (
    <div className="pt-3 space-y-2">
      {/* Header row */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 glass-inner rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={artifactIcon(assetId, artifact.slotKey)}
            alt={artifact.slotKey}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-text-primary truncate">
            {t(SLOT_LABELS[artifact.slotKey])}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] leading-none ${rarityColor}`}>
              {"★".repeat(artifact.rarity)}
            </span>
            <span className="text-[11px] text-text-muted">+{artifact.level}</span>
          </div>
        </div>
        {/* Main stat on the right */}
        <div className="text-right flex-shrink-0">
          <div className="text-[11px] text-gold">{t(statI18nKey(artifact.mainStatKey))}</div>
          <div className="text-[14px] font-mono font-semibold text-text-primary">
            {getMainStatDisplay(artifact.mainStatKey, artifact.level, artifact.rarity)}
          </div>
        </div>
      </div>

      {/* Substats */}
      {artifact.substats.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-white/[0.06]">
          {artifact.substats.map((sub) => (
            <div key={sub.key} className="flex justify-between items-center">
              <span className="text-[11px] text-text-muted">{t(statI18nKey(sub.key))}</span>
              <span className="text-[12px] font-mono text-text-secondary">
                {formatStatValue(sub.key, sub.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getMainStatDisplay(mainStatKey: string, level: number, rarity: number): string {
  if (mainStatKey === "hp") {
    const base = rarity === 5 ? 717 : rarity === 4 ? 645 : 430;
    const perLevel = rarity === 5 ? 203.15 : rarity === 4 ? 182.84 : 121.89;
    return Math.round(base + perLevel * level).toLocaleString();
  }
  if (mainStatKey === "atk") {
    const base = rarity === 5 ? 47 : rarity === 4 ? 42 : 28;
    const perLevel = rarity === 5 ? 13.2 : rarity === 4 ? 11.88 : 7.92;
    return Math.round(base + perLevel * level).toLocaleString();
  }

  const scales: Record<string, [number, number]> = {
    hp_: [7.0, 2.2], atk_: [7.0, 2.2], def_: [8.7, 2.8],
    eleMas: [28.0, 8.95], enerRech_: [7.8, 2.45],
    critRate_: [4.7, 1.46], critDMG_: [9.3, 2.92], heal_: [5.4, 1.7],
    pyro_dmg_: [7.0, 2.2], hydro_dmg_: [7.0, 2.2], electro_dmg_: [7.0, 2.2],
    cryo_dmg_: [7.0, 2.2], dendro_dmg_: [7.0, 2.2], anemo_dmg_: [7.0, 2.2],
    geo_dmg_: [7.0, 2.2], physical_dmg_: [8.7, 2.8],
  };

  const [base, perLevel] = scales[mainStatKey] ?? [7.0, 2.2];
  const value = base + perLevel * level;

  if (mainStatKey === "eleMas") return Math.round(value).toLocaleString();
  return `${value.toFixed(1)}%`;
}
