import { useTranslation } from "react-i18next";

interface TeamSlotEmptyProps {
  readonly onClick: () => void;
}

export function TeamSlotEmpty({ onClick }: TeamSlotEmptyProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-5 border-2 border-dashed border-navy-border rounded-xl bg-navy-page text-center
        transition-all hover:border-gold group cursor-pointer"
    >
      <span className="text-xl text-text-muted group-hover:text-gold transition-colors">+</span>
      <div className="text-[10px] text-text-muted group-hover:text-gold transition-colors mt-1">
        {t("team.addCharacter")}
      </div>
    </button>
  );
}
