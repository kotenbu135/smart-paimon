import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
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
import { ActivationPanel } from "./ActivationPanel";

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
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
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
    <aside className="flex flex-col gap-3">
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
              <div key={memberId}>
                <TeamSlot
                  build={build}
                  isMainDps={index === mainDpsIndex}
                  onRemove={() => setMember(index, null)}
                  onSetMainDps={() => setMainDps(index)}
                />
                <ActivationPanel build={build} memberIndex={index} />
              </div>
            );
          })}
        </SortableContext>
      </DndContext>

      <CharacterSelectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleSelect}
        disabledIds={disabledIds}
      />
    </aside>
  );
}
