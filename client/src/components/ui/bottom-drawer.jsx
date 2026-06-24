/**
 * Custom bottom drawer — NO Vaul, NO Radix, NO focus trapping.
 * Portaled to document.body so it sits outside any stacking context.
 * Sub-modals (BottomSheetModal portals) can receive focus freely.
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function BottomDrawer({ open, onOpenChange, children, className }) {
  const panelRef = useRef(null);

  // Lock body scroll while drawer is open (only if no BottomSheetModal is also open,
  // which manages overflow via ModalStackProvider)
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 100 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-[24px] flex flex-col overflow-hidden",
          "h-[92vh] max-h-[92vh]",
          "animate-in slide-in-from-bottom duration-300",
          className
        )}
        style={{
          background: "#ffffff",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export const safeAreaBottom = "pb-[max(1.5rem,env(safe-area-inset-bottom))]";
