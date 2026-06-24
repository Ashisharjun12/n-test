import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { UNITS } from "../data/units";
import BottomSheetModal from "../../../components/ui/bottom-sheet-modal";

export default function UnitSelectModal({ title = "Select Unit", value, onClose, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return UNITS;
    const q = search.toLowerCase();
    return UNITS.filter(
      (u) => u.code.toLowerCase().includes(q) || u.label.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <BottomSheetModal
      title={title}
      onClose={onClose}
      size="tall"
      maxWidth="max-w-lg"
      bodyClassName="flex flex-col min-h-0 p-0 bg-white"
    >
      <div className="p-4 shrink-0 bg-white" style={{ borderBottom: "1px solid #dee1e6" }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5b616e]" />
          <input
            placeholder="Search Product Unit"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full h-[48px] pl-10 pr-4 rounded-[12px] text-[14px] outline-none border border-[#0052ff] bg-white text-[#0a0b0d]"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 flex flex-col gap-1 bg-[#f7f7f7]">
        {filtered.length === 0 ? (
          <p className="text-center text-[14px] text-[#7c828a] py-12">No units found</p>
        ) : (
          filtered.map((unit) => {
            const selected = value === unit.code;
            return (
              <button
                key={unit.code}
                type="button"
                onClick={() => {
                  onSelect(unit.code);
                  onClose();
                }}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] text-left transition-all"
                style={{
                  background: selected ? "#0052ff08" : "#ffffff",
                  border: `1px solid ${selected ? "#0052ff44" : "#dee1e6"}`,
                }}
              >
                <span className="text-[13px] font-bold text-[#5b616e] w-12 shrink-0">{unit.code}</span>
                <span className="text-[14px] font-medium text-[#0a0b0d]">{unit.label}</span>
              </button>
            );
          })
        )}
      </div>
    </BottomSheetModal>
  );
}
