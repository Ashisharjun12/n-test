/**
 * @deprecated Use bottom-sheet-modal.jsx instead.
 * Kept for backward compatibility during migration.
 */
import BottomSheetModal, { BottomSheetSaveButton } from "./bottom-sheet-modal";

export default function SheetModal({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-md",
  compact = false,
  open = true,
}) {
  return (
    <BottomSheetModal
      open={open}
      title={title}
      onClose={onClose}
      footer={footer}
      maxWidth={maxWidth}
      size={compact ? "compact" : "default"}
    >
      {children}
    </BottomSheetModal>
  );
}

export { BottomSheetSaveButton as SheetModalSaveButton };
