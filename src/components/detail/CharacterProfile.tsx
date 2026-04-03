import { useTranslation } from "react-i18next";
import type { CharacterBuild } from "../../types/wasm";
import { ELEMENT_TW, RARITY_COLORS } from "../../lib/elements";
import { charIcon, charBanner, elementIcon } from "../../lib/charAssets";

interface CharacterProfileProps {
  readonly build: Readonly<CharacterBuild>;
}

export function CharacterProfile({ build }: CharacterProfileProps) {
  const { t } = useTranslation();
  const { character, level, constellation, weapon, artifacts } = build;
  const el = character.element;
  const tw = ELEMENT_TW[el];

  return (
    <div className="space-y-3">
      {/* Profile Card */}
      <section className="relative bg-navy-card border border-navy-border rounded-lg p-5 flex flex-col items-center text-center overflow-hidden">
        {/* Namecard banner background */}
        <div className="absolute inset-0 h-28">
          <img
            src={charBanner(character.id)}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-card" />
        </div>

        <div className="relative mb-4 mt-6">
          <div
            className={`w-[120px] h-[120px] rounded-full overflow-hidden border-[3px] ${tw?.border ?? "border-navy-border"}`}
            style={{ boxShadow: `0 0 15px ${getElementColor(el)}30` }}
          >
            <img
              src={charIcon(character.id)}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 ${tw?.bg ?? "bg-navy-hover"} w-7 h-7 rounded-full flex items-center justify-center border-2 border-navy-card p-1`}
          >
            <img src={elementIcon(el)} alt={el} className="w-full h-full" />
          </div>
        </div>
        <h1 className="text-[20px] font-bold text-text-primary leading-tight">{character.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[14px] text-text-secondary">
            Lv.{level} · C{constellation}
          </span>
          <div className={`text-[10px] ${RARITY_COLORS[+character.rarity.replace("Star", "")] ?? "text-text-muted"}`}>
            {"★".repeat(+character.rarity.replace("Star", ""))}
          </div>
        </div>
      </section>

      {/* Weapon Card */}
      {weapon && (
        <section className="bg-navy-card border border-navy-border rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-navy-hover rounded-lg border border-navy-border flex-shrink-0 flex items-center justify-center text-text-muted text-lg">
            ⚔
          </div>
          <div className="flex-grow min-w-0">
            <div className="text-[14px] font-semibold text-text-primary truncate">{weapon.weapon.name}</div>
            <div className="text-[12px] text-text-secondary">Lv.{weapon.level} · R{weapon.refinement}</div>
          </div>
          {weapon.weapon.sub_stat && (() => {
            const [statName, statValues] = Object.entries(weapon.weapon.sub_stat)[0];
            const statValue = statValues[statValues.length - 1];
            return (
              <div className="text-right flex-shrink-0">
                <div className="text-[12px] font-mono font-semibold text-gold">{statName}</div>
                <div className="text-[12px] font-mono text-text-primary">
                  {`${(statValue * 100).toFixed(1)}%`}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Artifact Card */}
      <section className="bg-navy-card border border-navy-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[14px] font-semibold text-text-primary truncate">
            {artifacts.four_piece_set?.name ?? t("detail.artifacts")}
          </h3>
          {artifacts.four_piece_set && (
            <span className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded border border-gold/30 font-bold">
              (4)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {["flower", "plume", "sands", "goblet", "circlet"].map((slot) => (
            <div
              key={slot}
              className="w-10 h-10 bg-navy-hover rounded-lg border border-navy-border flex items-center justify-center text-text-muted text-xs"
            >
              {slot[0].toUpperCase()}
            </div>
          ))}
        </div>
      </section>
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
