import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useGoodStore } from "../stores/good";
import { CharacterGrid } from "../components/characters/CharacterGrid";
import { CharacterFilter } from "../components/characters/CharacterFilter";
import type { Element, WeaponType } from "../types/wasm";

export function CharactersPage() {
  const builds = useGoodStore((s) => s.builds);
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [weaponFilter, setWeaponFilter] = useState<WeaponType | null>(null);

  const filteredBuilds = useMemo(() => builds.filter((b) => {
    if (elementFilter && b.character.element !== elementFilter) return false;
    if (weaponFilter && b.character.weapon_type !== weaponFilter) return false;
    return true;
  }), [builds, elementFilter, weaponFilter]);

  if (builds.length === 0) return <Navigate to="/" replace />;

  return (
    <div>
      <CharacterFilter
        elementFilter={elementFilter}
        weaponFilter={weaponFilter}
        onElementChange={setElementFilter}
        onWeaponChange={setWeaponFilter}
      />
      <CharacterGrid builds={filteredBuilds} />
    </div>
  );
}
