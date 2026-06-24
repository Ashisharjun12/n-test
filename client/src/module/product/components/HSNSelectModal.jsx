import { useState, useRef, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import BottomSheetModal, { BottomSheetSaveButton } from "../../../components/ui/bottom-sheet-modal";
import HSN_CODES from "../data/hsnCodes";

export default function HSNSelectModal({ onClose, onSelect, initialValue = "" }) {
  const [search, setSearch] = useState(initialValue);
  const [addOpen, setAddOpen] = useState(false);
  const customRef = useRef(null);

  const filtered = HSN_CODES.filter((h) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return h.code.includes(q) || h.description.toLowerCase().includes(q);
  }).slice(0, 80); // cap results for performance

  useEffect(() => {
    if (!addOpen) return undefined;
    const timer = setTimeout(() => {
      if (customRef.current) {
        customRef.current.value = search.trim();
        customRef.current.focus({ preventScroll: true });
      }
    }, 140);
    return () => clearTimeout(timer);
  }, [addOpen]); 

  const handleSelectCode = (code) => {
    onSelect(code.toUpperCase());
  };

  const handleSaveCustom = () => {
    const val = (customRef.current?.value || "").trim().toUpperCase();
    if (!val) {
      alert("Please enter an HSN code.");
      return;
    }
    onSelect(val);
  };

  const handleClose = () => {
    if (addOpen) {
      setAddOpen(false);
      return;
    }
    onClose();
  };

  return (
    <BottomSheetModal
      open
      title={addOpen ? "Enter Custom HSN Code" : "Select HSN Code"}
      onClose={handleClose}
      size={addOpen ? "compact" : "tall"}
      maxWidth="max-w-lg"
      bodyClassName={
        addOpen ? "" : "flex flex-col min-h-0 p-0 !py-0 bg-white overflow-hidden"
      }
      footer={
        addOpen ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 rounded-[100px] text-[15px] font-semibold text-[#0a0b0d] transition-all bg-[#eef0f3] hover:bg-[#dee1e6] h-12 cursor-pointer"
            >
              Cancel
            </button>
            <BottomSheetSaveButton
              label="Use This Code"
              onClick={handleSaveCustom}
              className="flex-1 h-12"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-[100px] text-[15px] font-semibold text-[#0052ff] transition-all bg-transparent hover:bg-[#f0f4ff] h-12 cursor-pointer"
          >
            <Plus className="size-4" /> Enter Custom Code
          </button>
        )
      }
    >
      {addOpen ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hsn-custom" className="text-[13px] font-semibold text-[#0a0b0d] px-1">
              HSN Code
            </label>
            <input
              ref={customRef}
              id="hsn-custom"
              type="text"
              placeholder="e.g. 8517"
              autoComplete="off"
              spellCheck={false}
              className="w-full h-[48px] rounded-[12px] text-[14px] outline-none px-4 border border-[#0052ff] bg-white text-[#0a0b0d] uppercase tracking-widest"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.toUpperCase();
              }}
            />
          </div>
          <p className="text-[12px] text-[#7c828a] px-1">
            Enter the HSN/SAC code for this product manually.
          </p>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="p-4 shrink-0 bg-white border-b border-[#dee1e6]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5b616e]" />
              <input
                type="text"
                placeholder="Search by code or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[44px] pl-10 pr-10 rounded-[12px] bg-[#eef0f3] outline-none text-[14px] text-[#0a0b0d] transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8acb3] hover:text-[#5b616e] cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 flex flex-col gap-1 bg-[#f7f7f7]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="size-12 rounded-full bg-[#eef0f3] flex items-center justify-center mb-3">
                  <Search className="size-6 text-[#a8acb3]" />
                </div>
                <p className="text-[14px] font-semibold text-[#0a0b0d] mb-1">No HSN codes found</p>
                <p className="text-[13px] text-[#7c828a] mb-4">
                  Try a different term or enter the code manually.
                </p>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="text-[14px] font-semibold text-[#0052ff] cursor-pointer hover:underline"
                >
                  Enter Custom Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((h) => (
                  <button
                    key={h.code}
                    type="button"
                    onClick={() => handleSelectCode(h.code)}
                    className="w-full flex items-center gap-4 py-3 px-1 bg-transparent cursor-pointer transition-all text-left hover:bg-white rounded-[12px] group"
                  >
                    <span className="shrink-0 min-w-[52px] text-center text-[13px] font-bold text-[#0052ff] bg-[#eef0f3] group-hover:bg-[#dde8ff] rounded-[8px] px-2 py-1 transition-colors font-mono">
                      {h.code}
                    </span>
                    <span className="text-[13px] text-[#5b616e] group-hover:text-[#0a0b0d] transition-colors leading-snug line-clamp-2">
                      {h.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </BottomSheetModal>
  );
}
