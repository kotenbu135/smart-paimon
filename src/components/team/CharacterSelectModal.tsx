import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import { useGoodStore } from "../../stores/good";
import { ALL_ELEMENTS, ELEMENT_TW } from "../../lib/elements";
import { charIcon, elementIcon } from "../../lib/charAssets";
import { localizeCharacterName } from "../../lib/localize";
import type { Element as GenshinElement } from "../../types/wasm";

interface CharacterSelectModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelect: (characterId: string) => void;
  readonly disabledIds: ReadonlySet<string>;
}

export function CharacterSelectModal({
  open,
  onOpenChange,
  onSelect,
  disabledIds,
}: CharacterSelectModalProps) {
  const { t, i18n } = useTranslation();
  const builds = useGoodStore((s) => s.builds);
  const [elementFilters, setElementFilters] = useState<Set<GenshinElement>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (elementFilters.size === 0) return builds;
    return builds.filter((b) => elementFilters.has(b.character.element));
  }, [builds, elementFilters]);

  const toggleElement = (el: GenshinElement) => {
    setElementFilters((prev) => {
      const next = new Set(prev);
      if (next.has(el)) next.delete(el);
      else next.add(el);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedId && !disabledIds.has(selectedId)) {
      onSelect(selectedId);
      onOpenChange(false);
      setSelectedId(null);
      setElementFilters(new Set());
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-[calc(100vw-2rem)] sm:w-[460px] max-h-[80vh] bg-navy-card border border-navy-border rounded-xl
          flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-5 pb-0">
            <Dialog.Title className="text-[14px] font-bold text-gold font-label">
              {t("team.selectCharacter")}
            </Dialog.Title>
            <Dialog.Close className="text-text-muted hover:text-text-primary transition-colors text-sm">
              ✕
            </Dialog.Close>
          </div>

          {/* Element filters */}
          <div className="flex gap-1.5 flex-wrap px-4 sm:px-5 py-3">
            {ALL_ELEMENTS.map((el) => {
              const active = elementFilters.has(el as GenshinElement);
              const tw = ELEMENT_TW[el];
              return (
                <button
                  key={el}
                  type="button"
                  onClick={() => toggleElement(el as GenshinElement)}
                  className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-wider transition-all
                    flex items-center gap-1
                    ${active ? `${tw.bg} text-white` : "bg-navy-hover text-text-secondary hover:bg-navy-border"}`}
                >
                  <img src={elementIcon(el)} alt={el} className="w-3.5 h-3.5" />
                  {t(`element.${el.toLowerCase()}`)}
                </button>
              );
            })}
          </div>

          {/* Character grid — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {filtered.map((build) => {
                const id = build.character.id;
                const disabled = disabledIds.has(id);
                const selected = selectedId === id;

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setSelectedId(id)}
                    className={`text-center p-1.5 rounded-lg transition-all
                      ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-navy-hover"}
                      ${selected ? "ring-2 ring-gold" : ""}`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden mx-auto mb-1 bg-navy-hover">
                      <img
                        src={charIcon(id)}
                        alt={build.character.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-[9px] text-text-primary truncate">
                      {localizeCharacterName(id, build.character.name, i18n.language)}
                    </div>
                    {disabled && (
                      <div className="text-[8px] text-text-muted">{t("team.alreadyInTeam")}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm button — fixed at bottom */}
          <div className="p-4 sm:p-5 pt-3 flex justify-end border-t border-navy-border">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId || disabledIds.has(selectedId)}
              className="px-5 py-2 bg-gold text-navy-page rounded-md text-[12px] font-bold font-label
                disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
              {t("team.select")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
