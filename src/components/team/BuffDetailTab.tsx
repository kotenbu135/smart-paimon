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
  // Conditional buff toggles: each is a full card row (~1 unit each)
  if (build) {
    const conditionals = getConditionalBuffs(build);
    const toggleable = conditionals.filter((c) => getManualActivation(c.buff.activation) !== null);
    h += toggleable.length;
  }
  return h;
}

/** Distribute items into two columns to minimize height difference (LFD heuristic) */
function balanceColumns<T>(items: T[], getHeight: (item: T) => number): [T[], T[]] {
  // Sort by height descending — placing tallest items first produces better balance
  const indexed = items.map((item, i) => ({ item, i, h: getHeight(item) }));
  indexed.sort((a, b) => b.h - a.h);

  const col1: T[] = [];
  const col2: T[] = [];
  let h1 = 0;
  let h2 = 0;

  for (const { item } of indexed) {
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
  readonly canNightsoul: boolean;
}

export function BuffDetailTab() {
  const { buffBreakdown, members, nightsoulFlags } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);

  const cards: CardData[] = useMemo(() => {
    return buffBreakdown
      .map((bd) => {
        const memberIndex = members.findIndex((m) => m === bd.sourceCharacterId);
        const build = memberIndex >= 0 ? getBuild(bd.sourceCharacterId) : undefined;
        const canNightsoul = memberIndex >= 0 ? (nightsoulFlags[memberIndex] ?? false) : false;
        return { breakdown: bd, memberIndex, build, canNightsoul };
      })
      .filter((c) => {
        // Hide cards with no buffs and no toggleable conditionals
        if (c.breakdown.buffs.length > 0) return true;
        if (!c.build) return false;
        const conditionals = getConditionalBuffs(c.build);
        return conditionals.some((info) => getManualActivation(info.buff.activation) !== null);
      });
  }, [buffBreakdown, members, getBuild, nightsoulFlags]);

  // Stable key: only changes when the set of visible characters changes
  const charIdKey = useMemo(
    () => cards.map((c) => c.breakdown.sourceCharacterId).join(","),
    [cards],
  );

  // Column assignment: only rebalances when team composition changes, NOT on buff toggles
  const columnAssignment = useMemo(() => {
    const [col1, col2] = balanceColumns(cards, (c) => estimateCardHeight(c.breakdown, c.build));
    const assignment = new Map<string, number>();
    for (const c of col1) assignment.set(c.breakdown.sourceCharacterId, 0);
    for (const c of col2) assignment.set(c.breakdown.sourceCharacterId, 1);
    return assignment;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIdKey]);

  // Split current (fresh) card data according to stable column assignment
  const col1 = cards.filter((c) => (columnAssignment.get(c.breakdown.sourceCharacterId) ?? 0) === 0);
  const col2 = cards.filter((c) => columnAssignment.get(c.breakdown.sourceCharacterId) === 1);

  return (
    <>
      <div className="flex flex-col gap-3">
        {col1.map((c, i) => (
          <BuffCard
            key={`${c.breakdown.sourceCharacterId}-${i}`}
            breakdown={c.breakdown}
            memberIndex={c.memberIndex >= 0 ? c.memberIndex : undefined}
            build={c.build}
            canNightsoul={c.canNightsoul}
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
