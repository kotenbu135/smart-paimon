import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { CharacterBuild } from "../../types/wasm";
import { ELEMENT_TW, RARITY_COLORS } from "../../lib/elements";
import { charIcon, charBanner, elementIcon, weaponIcon, artifactIcon } from "../../lib/charAssets";
import type { ArtifactSlot } from "../../lib/charAssets";
import { getCharacterArtifacts, setKeyToAssetId } from "../../lib/goodArtifacts";
import { useGoodStore } from "../../stores/good";
import { ArtifactDetailPopover } from "./ArtifactDetailDialog";
import { localizeCharacterName, localizeWeaponName, localizeWeaponStat } from "../../lib/localize";

interface CharacterProfileProps {
  readonly build: Readonly<CharacterBuild>;
}

export function CharacterProfile({ build }: CharacterProfileProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { character, level, constellation, weapon, artifacts } = build;
  const el = character.element;
  const tw = ELEMENT_TW[el];
  const rawJson = useGoodStore((s) => s.rawJson);
  const charArtifacts = useMemo(
    () => (rawJson ? getCharacterArtifacts(rawJson, character.id) : {}),
    [rawJson, character.id],
  );
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlot | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <div className="space-y-3">
      {/* Profile Card */}
      <section className="relative bg-navy-card border border-navy-border rounded-lg p-4 flex flex-col items-center text-center overflow-hidden">
        {/* Namecard banner background */}
        <div className="absolute inset-0 h-32">
          <img
            src={charBanner(character.id)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-card" />
        </div>

        <div className="relative mb-2 mt-2">
          <div
            className={`w-[96px] h-[96px] rounded-full overflow-hidden border-[3px] bg-navy-card ${tw?.border ?? "border-navy-border"}`}
            style={{ boxShadow: `0 0 15px ${getElementColor(el)}30` }}
          >
            <img
              src={charIcon(character.id)}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute -bottom-1 -right-1 bg-navy-card w-7 h-7 rounded-full flex items-center justify-center border-2 border-navy-border p-1"
          >
            <img src={elementIcon(el)} alt={el} className="w-full h-full" />
          </div>
        </div>
        <h1 className="text-[20px] font-bold text-text-primary leading-tight">{localizeCharacterName(character.id, character.name, locale)}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[14px] text-text-secondary">
            {t("detail.level", { level })} · {t("detail.constellation", { count: constellation })}
          </span>
          <div className={`text-[10px] ${RARITY_COLORS[+character.rarity.replace("Star", "")] ?? "text-text-muted"}`}>
            {"★".repeat(+character.rarity.replace("Star", ""))}
          </div>
        </div>
      </section>

      {/* Weapon Card */}
      {weapon && (
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="bg-navy-card border border-navy-border rounded-lg p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-navy-hover rounded-lg border border-navy-border flex-shrink-0 overflow-hidden">
            <img
              src={weaponIcon(weapon.weapon.id, weapon.refinement >= 5)}
              alt={weapon.weapon.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-text-primary truncate">{localizeWeaponName(weapon.weapon.id, weapon.weapon.name, locale)}</span>
              <span className={`text-[10px] flex-shrink-0 ${RARITY_COLORS[+weapon.weapon.rarity.replace("Star", "")] ?? "text-text-muted"}`}>
                {"★".repeat(+weapon.weapon.rarity.replace("Star", ""))}
              </span>
            </div>
            <div className="text-[12px] text-text-secondary">{t("detail.level", { level: weapon.level })} · {t("detail.refinement", { rank: weapon.refinement })}</div>
          </div>
          {weapon.weapon.sub_stat && (() => {
            const [statName, statValues] = Object.entries(weapon.weapon.sub_stat)[0];
            const statValue = statValues[statValues.length - 1];
            return (
              <div className="text-right flex-shrink-0">
                <div className="text-[12px] font-mono font-semibold text-gold">{localizeWeaponStat(statName, t)}</div>
                <div className="text-[12px] font-mono text-text-primary">
                  {statName.includes("Percent") || statName === "CritRate" || statName === "CritDmg" || statName === "EnergyRecharge"
                    ? `${(statValue * 100).toFixed(1)}%`
                    : Math.round(statValue).toLocaleString()}
                </div>
              </div>
            );
          })()}
        </motion.section>
      )}

      {/* Artifact Card */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="bg-navy-card border border-navy-border rounded-lg p-4"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[14px] font-semibold text-text-primary truncate">
            {artifacts.four_piece_set?.name ?? artifacts.sets[0]?.name ?? t("detail.artifacts")}
          </h3>
          {artifacts.four_piece_set && (
            <span className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded border border-gold/30 font-bold">
              (4)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {(["flower", "plume", "sands", "goblet", "circlet"] as const).map((slot) => {
            const art = charArtifacts[slot];
            const assetId = art ? setKeyToAssetId(art.setKey) : undefined;
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => art && setSelectedSlot(isSelected ? null : slot)}
                className={`w-10 h-10 bg-navy-hover rounded-lg border overflow-hidden transition-colors ${isSelected ? "border-gold/60" : "border-navy-border"} ${art ? "cursor-pointer hover:border-gold/40" : "cursor-default"}`}
              >
                {assetId ? (
                  <img
                    src={artifactIcon(assetId, slot)}
                    alt={slot}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                    {slot[0].toUpperCase()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedSlot && charArtifacts[selectedSlot] && (
          <ArtifactDetailPopover artifact={charArtifacts[selectedSlot]} />
        )}
      </motion.section>
    </div>
  );
}

function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    Pyro: "#EF7938", Hydro: "#4CC2F1", Electro: "#B57EDC",
    Cryo: "#9FD6E3", Dendro: "#A5C83B", Anemo: "#74C2A8", Geo: "#F0B232",
  };
  return colors[element] ?? "#3A3F5C";
}
