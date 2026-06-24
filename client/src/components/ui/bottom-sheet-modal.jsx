/**
 * Reusable bottom sheet modal — always slides from bottom, portaled to document.body
 * so it works inside Vaul drawers and supports nested modal stacking.
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { useModalLayer } from "./modal-stack";

const SIZE_CLASSES = {
  compact: "h-auto max-h-[min(360px,85dvh)]",
  default: "max-h-[min(85dvh,720px)]",
  tall: "h-[min(85dvh,720px)] max-h-[min(85dvh,720px)]",
  full: "h-[100dvh] max-h-[100dvh] rounded-t-[24px]",
};

export default function BottomSheetModal({
  open = true,
  title,
  onClose,
  children,
  footer,
  size = "default",
  maxWidth = "max-w-md",
  showHandle = true,
  className = "",
  bodyClassName = "",
  disableBackdropClose = false,
  showClose = true,
}) {
  const { zIndex, isTopLayer } = useModalLayer(open);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open || !onClose || !isTopLayer) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose, isTopLayer]);

  // After mount, move focus into the modal panel (or its first input).
  useEffect(() => {
    if (!open || !panelRef.current) return undefined;
    const timer = setTimeout(() => {
      if (!panelRef.current) return;
      const focusable = panelRef.current.querySelector(
        'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus({ preventScroll: true });
      } else {
        panelRef.current.focus({ preventScroll: true });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [open]);

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.default;
  const isCompact = size === "compact";
  const scrollBody = !isCompact;

  const handleClose = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onClose?.();
  };

  const handleBackdropClick = (e) => {
    if (disableBackdropClose || !onClose || !isTopLayer) return;
    e.stopPropagation();
    onClose();
  };

  const handlePanelMouseDown = (e) => {
    e.stopPropagation();
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0"
      style={{
        zIndex,
        pointerEvents: isTopLayer ? "auto" : "none",
      }}
    >
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 mx-auto w-full ${maxWidth} bg-white rounded-t-[24px] flex flex-col min-h-0 overflow-hidden shadow-[0_-4px_32px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300 pointer-events-auto ${sizeClass} ${className} outline-none`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
        onMouseDown={handlePanelMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        {showHandle && (
          <div className="flex justify-center pt-3 pb-0 shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#dee1e6]" />
          </div>
        )}

        {(title || showClose) && (
          <div
            className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0"
            style={{ borderBottom: "1px solid #dee1e6" }}
          >
            {title ? (
              <h2 id="bottom-sheet-title" className="text-[18px] font-bold text-[#0a0b0d]">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {showClose && onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d] p-1 -mr-1"
                aria-label="Close"
              >
                <X className="size-6" />
              </button>
            )}
          </div>
        )}

        <div
          className={`px-5 py-5 bg-[#f7f7f7] ${
            scrollBody ? "flex-1 min-h-0 overflow-y-auto overscroll-y-contain" : "shrink-0"
          } ${bodyClassName}`}
        >
          {children}
        </div>

        {footer && (
          <div className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-white border-t border-[#dee1e6]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function BottomSheetSaveButton({
  onClick,
  label = "Save",
  disabled = false,
  loading = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all bg-[#0052ff] hover:bg-[#003ecc] h-14 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {label}
    </button>
  );
}
