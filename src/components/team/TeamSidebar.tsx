import { useState, useMemo } from "react";
import { useTeamStore } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import { TeamSlot } from "./TeamSlot";
import { TeamSlotEmpty } from "./TeamSlotEmpty";
import { TeamSaveLoad } from "./TeamSaveLoad";
import { CharacterSelectModal } from "./CharacterSelectModal";
import { TeamEnemyConfig } from "./TeamEnemyConfig";
import { ReactionSelector } from "./ReactionSelector";

export function TeamSidebar() {
  const { members, mainDpsIndex, setMember, setMainDps } = useTeamStore();
  const getBuild = useGoodStore((s) => s.getBuild);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlotIndex, setModalSlotIndex] = useState(0);

  const disabledIds = useMemo(
    () => new Set(members.filter((m): m is string => m !== null)),
    [members],
  );

  const handleEmptyClick = (index: number) => {
    setModalSlotIndex(index);
    setModalOpen(true);
  };

  const handleSelect = (characterId: string) => {
    setMember(modalSlotIndex, characterId);
  };

  return (
    <aside className="w-full lg:w-[200px] flex-shrink-0 flex flex-col gap-3">
      <TeamSaveLoad />

      {/* Slots */}
      {members.map((memberId, index) => {
        if (memberId === null) {
          return <TeamSlotEmpty key={index} onClick={() => handleEmptyClick(index)} />;
        }
        const build = getBuild(memberId);
        if (!build) return null;

        return (
          <TeamSlot
            key={memberId}
            build={build}
            isMainDps={index === mainDpsIndex}
            onRemove={() => setMember(index, null)}
            onSetMainDps={() => setMainDps(index)}
          />
        );
      })}

      {/* Enemy Config + Reaction — pushed to bottom */}
      <div className="mt-auto space-y-2">
        <TeamEnemyConfig />
        <ReactionSelector />
      </div>

      <CharacterSelectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleSelect}
        disabledIds={disabledIds}
      />
    </aside>
  );
}
