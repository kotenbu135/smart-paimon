import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTeamStore } from "../../stores/team";
import { useGoodStore } from "../../stores/good";
import { TeamSlot } from "./TeamSlot";
import { TeamSlotEmpty } from "./TeamSlotEmpty";
import { TeamSaveLoad } from "./TeamSaveLoad";
import { CharacterSelectModal } from "./CharacterSelectModal";
import { TeamEnemyConfig } from "./TeamEnemyConfig";
import { ReactionSelector } from "./ReactionSelector";

export function TeamSidebar() {
  const { members, mainDpsIndex, setMember, setMainDps, swapMembers } = useTeamStore();
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const sortableIds = members.map((m, i) => m ?? `empty-${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = sortableIds.indexOf(String(active.id));
    const toIndex = sortableIds.indexOf(String(over.id));
    if (fromIndex !== -1 && toIndex !== -1) {
      swapMembers(fromIndex, toIndex);
    }
  };

  return (
    <aside className="w-full lg:w-[200px] flex-shrink-0 flex flex-col gap-3">
      <TeamSaveLoad />

      {/* Slots */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
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
        </SortableContext>
      </DndContext>

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
