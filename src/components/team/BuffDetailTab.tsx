import { useMemo } from "react";
import { useTeamStore, type BuffBreakdown } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import { getConditionalBuffs, getManualActivation } from "../../lib/conditionals";
import { BuffCard } from "./BuffCard";
import type { CharacterBuild } from "../../types/wasm";

/** Estimate relative height of a card based on content */
function estimateCardHeight(breakdown: BuffBreakdown, build: CharacterBuild | undefined): number {
  // Header: ~1 unit
  let h = 1;
  // Buff entries: ~1 unit each
  h += breakdown.buffs.length;
  // Conditional buff toggles: estimate rows (roughly 3 buttons per row = ~0.5 unit per button)
  if (build) {
    const conditionals = getConditionalBuffs(build);
    const toggleable = conditionals.filter((c) => getManualActivation(c.buff.activation) !== null);
    h += Math.ceil(toggleable.length / 3);
  }
  return h;
}

/** Distribute items into two columns to minimize height difference (greedy) */
function balanceColumns<T>(items: T[], getHeight: (item: T) => number): [T[], T[]] {
  const col1: T[] = [];
  const col2: T[] = [];
  let h1 = 0;
  let h2 = 0;

  for (const item of items) {
    const h = getHeight(item);
    if (h1 <= h2) {
      col1.push(item);
      h1 += h;
    } else {
      col2.push(item);
      h2 += h;
    }
  }

  return [col1, col2];
}

interface CardData {
  readonly breakdown: BuffBreakdown;
  readonly memberIndex: number;
  readonly build: CharacterBuild | undefined;
}

export function BuffDetailTab() {
  const { buffBreakdown, members } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);

  const cards: CardData[] = useMemo(() => {
    return buffBreakdown.map((bd) => {
      const memberIndex = members.findIndex((m) => m === bd.sourceCharacterId);
      const build = memberIndex >= 0 ? getBuild(bd.sourceCharacterId) : undefined;
      return { breakdown: bd, memberIndex, build };
    });
  }, [buffBreakdown, members, getBuild]);

  const [col1, col2] = useMemo(
    () => balanceColumns(cards, (c) => estimateCardHeight(c.breakdown, c.build)),
    [cards],
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        {col1.map((c, i) => (
          <BuffCard
            key={`${c.breakdown.sourceCharacterId}-${i}`}
            breakdown={c.breakdown}
            memberIndex={c.memberIndex >= 0 ? c.memberIndex : undefined}
            build={c.build}
          />
        ))}
      </div>
      {col2.length > 0 && (
        <div className="flex flex-col gap-3">
          {col2.map((c, i) => (
            <BuffCard
              key={`${c.breakdown.sourceCharacterId}-${i}`}
              breakdown={c.breakdown}
              memberIndex={c.memberIndex >= 0 ? c.memberIndex : undefined}
              build={c.build}
            />
          ))}
        </div>
      )}
    </>
  );
}
