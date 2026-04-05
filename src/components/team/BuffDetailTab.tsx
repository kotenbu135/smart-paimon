import { useTeamStore } from "../../stores/team";
import { BuffCard } from "./BuffCard";

export function BuffDetailTab() {
  const { buffBreakdown } = useTeamStore();

  const mid = Math.ceil(buffBreakdown.length / 2);
  const col1 = buffBreakdown.slice(0, mid);
  const col2 = buffBreakdown.slice(mid);

  return (
    <>
      <div className="flex flex-col gap-3">
        {col1.map((bd, i) => (
          <BuffCard key={`${bd.sourceCharacterId}-${i}`} breakdown={bd} />
        ))}
      </div>
      {col2.length > 0 && (
        <div className="flex flex-col gap-3">
          {col2.map((bd, i) => (
            <BuffCard key={`${bd.sourceCharacterId}-${mid + i}`} breakdown={bd} />
          ))}
        </div>
      )}
    </>
  );
}
