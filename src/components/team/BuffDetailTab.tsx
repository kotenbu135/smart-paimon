import { useTeamStore } from "../../stores/team";
import { BuffCard } from "./BuffCard";
import { BuffSummary } from "./BuffSummary";

export function BuffDetailTab() {
  const { buffBreakdown } = useTeamStore();

  return (
    <div className="space-y-3">
      {buffBreakdown.map((bd) => (
        <BuffCard key={bd.sourceCharacterId} breakdown={bd} />
      ))}
      <BuffSummary breakdowns={buffBreakdown} />
    </div>
  );
}
