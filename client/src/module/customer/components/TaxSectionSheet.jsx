import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import BottomSheetModal from "../../../components/ui/bottom-sheet-modal";

export default function TaxSectionSheet({ open, onOpenChange, type = "tds", sections = [], onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [query, sections]);

  const handleSelect = (section) => {
    onSelect(section);
    setQuery("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setQuery("");
    onOpenChange(false);
  };

  const label = type === "tds" ? "TDS" : "TCS";

  return (
    <BottomSheetModal
      open={open}
      title={`Select ${label} Section`}
      onClose={handleClose}
      size="tall"
      maxWidth="max-w-lg"
      bodyClassName="flex flex-col min-h-0 p-0 !py-0 bg-white overflow-hidden"
    >
      {/* Search bar */}
      <div className="p-4 shrink-0 bg-white border-b border-[#dee1e6]">
        <div className="flex items-center gap-3 h-[48px] rounded-[12px] px-4 bg-[#eef0f3]">
          <Search className="size-4 shrink-0 text-[#a8acb3]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label} section...`}
            className="flex-1 text-[14px] outline-none bg-transparent text-[#0a0b0d] placeholder:text-[#a8acb3]"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="cursor-pointer">
              <X className="size-4 text-[#a8acb3]" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 py-3 bg-[#f7f7f7]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-[14px] text-[#7c828a]">No sections found</p>
          </div>
        ) : (
          <div className="flex flex-col bg-white rounded-[16px] overflow-hidden border border-[#dee1e6]">
            {filtered.map((section, i) => (
              <div key={section.code + i}>
                <button
                  type="button"
                  onClick={() => handleSelect(section)}
                  className="cursor-pointer flex items-center justify-between w-full py-4 px-4 text-left transition-colors hover:bg-[#f7f8fa] group"
                >
                  <div className="flex-1 pr-4 min-w-0">
                    <p className="text-[13px] font-bold text-[#0052ff] mb-0.5">{section.code}</p>
                    <p className="text-[13px] text-[#0a0b0d] leading-snug">{section.name}</p>
                  </div>
                  <span className="text-[15px] font-bold shrink-0 text-[#0052ff]">
                    {section.rate}%
                  </span>
                </button>
                {i < filtered.length - 1 && (
                  <div className="h-px bg-[#dee1e6] mx-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheetModal>
  );
}
