export const ELEMENT_META: Record<string, { abbr: string; glowClass: string }> = {
  Pyro:    { abbr: "炎", glowClass: "glow-pyro" },
  Hydro:   { abbr: "水", glowClass: "glow-hydro" },
  Electro: { abbr: "雷", glowClass: "glow-electro" },
  Cryo:    { abbr: "氷", glowClass: "glow-cryo" },
  Dendro:  { abbr: "草", glowClass: "glow-dendro" },
  Anemo:   { abbr: "風", glowClass: "glow-anemo" },
  Geo:     { abbr: "岩", glowClass: "glow-geo" },
};

export const ELEMENT_TW: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Pyro:    { bg: "bg-pyro",    text: "text-pyro",    border: "border-pyro",    gradient: "from-pyro/15" },
  Hydro:   { bg: "bg-hydro",   text: "text-hydro",   border: "border-hydro",   gradient: "from-hydro/15" },
  Electro: { bg: "bg-electro", text: "text-electro", border: "border-electro", gradient: "from-electro/15" },
  Cryo:    { bg: "bg-cryo",    text: "text-cryo",    border: "border-cryo",    gradient: "from-cryo/15" },
  Dendro:  { bg: "bg-dendro",  text: "text-dendro",  border: "border-dendro",  gradient: "from-dendro/15" },
  Anemo:   { bg: "bg-anemo",   text: "text-anemo",   border: "border-anemo",   gradient: "from-anemo/15" },
  Geo:     { bg: "bg-geo",     text: "text-geo",     border: "border-geo",     gradient: "from-geo/15" },
};

export const RARITY_COLORS: Record<number, string> = {
  5: "text-gold",
  4: "text-electro",
  3: "text-hydro",
};

export const ALL_ELEMENTS = ["Pyro", "Hydro", "Electro", "Cryo", "Dendro", "Anemo", "Geo"] as const;
export const ALL_WEAPONS = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"] as const;
