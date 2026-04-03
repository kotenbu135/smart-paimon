import { useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoodStore } from "../stores/good";
import { CharacterGrid } from "../components/characters/CharacterGrid";
import { CharacterFilter } from "../components/characters/CharacterFilter";
import type { Element, WeaponType, CharacterBuild } from "../types/wasm";
import { localizeCharacterName } from "../lib/localize";
import { PageTransition } from "../components/ui/PageTransition";

export type SortKey = "default" | "level" | "rarity" | "name";
export type SortDir = "asc" | "desc";

const STORAGE_KEY = "smart-paimon-sort";

function loadSort(): { key: SortKey; dir: SortDir } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.key && parsed.dir) return parsed;
    }
  } catch { /* ignore */ }
  return { key: "default", dir: "asc" };
}

function parseRarity(rarity: string): number {
  const m = rarity.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

function compareFn(key: SortKey, dir: SortDir, locale: string) {
  return (a: [number, CharacterBuild], b: [number, CharacterBuild]): number => {
    let cmp: number;
    switch (key) {
      case "default":
        cmp = a[0] - b[0];
        break;
      case "level":
        cmp = a[1].level - b[1].level;
        break;
      case "rarity":
        cmp = parseRarity(a[1].character.rarity) - parseRarity(b[1].character.rarity);
        break;
      case "name": {
        const nameA = localizeCharacterName(a[1].character.id, a[1].character.name, locale);
        const nameB = localizeCharacterName(b[1].character.id, b[1].character.name, locale);
        cmp = nameA.localeCompare(nameB, locale);
        break;
      }
    }
    return dir === "desc" ? -cmp : cmp;
  };
}

export function CharactersPage() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const builds = useGoodStore((s) => s.builds);
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [weaponFilter, setWeaponFilter] = useState<WeaponType | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(loadSort().key);
  const [sortDir, setSortDir] = useState<SortDir>(loadSort().dir);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: sortKey, dir: sortDir }));
  }, [sortKey, sortDir]);

  const filteredBuilds = useMemo(() => {
    const indexed: [number, CharacterBuild][] = builds
      .map((b, i) => [i, b] as [number, CharacterBuild])
      .filter(([, b]) => {
        if (elementFilter && b.character.element !== elementFilter) return false;
        if (weaponFilter && b.character.weapon_type !== weaponFilter) return false;
        return true;
      });
    return indexed.sort(compareFn(sortKey, sortDir, locale)).map(([, b]) => b);
  }, [builds, elementFilter, weaponFilter, sortKey, sortDir, locale]);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  if (builds.length === 0) return <Navigate to="/" replace />;

  return (
    <PageTransition>
      <div>
        <CharacterFilter
          elementFilter={elementFilter}
          weaponFilter={weaponFilter}
          onElementChange={setElementFilter}
          onWeaponChange={setWeaponFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />
        <CharacterGrid builds={filteredBuilds} />
      </div>
    </PageTransition>
  );
}
