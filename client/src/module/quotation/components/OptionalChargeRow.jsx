import { useState } from "react";
import { IndianRupee, Plus } from "lucide-react";
import { getChargeLabel, summarizeCharge } from "@/lib/chargeUtils";
import ChargeSheet from "./ChargeSheet";

export default function OptionalChargeRow({ icon, chargeType, label, charge, baseSubtotal, onSave }) {
  const [open, setOpen] = useState(false);
  const summary = charge?.rawValue ? summarizeCharge(charge, baseSubtotal) : null;
  const displayLabel = charge ? getChargeLabel({ ...charge, type: chargeType, label }) : label;
  const amount = summary?.total ?? charge?.amount ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div className="size-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#eef0f3" }}>
          {icon}
        </div>
        <span className="text-[14px] flex-1 font-medium" style={{ color: "#0a0b0d" }}>
          {displayLabel}
        </span>
        {amount > 0 ? (
          <span
            className="text-[15px] font-semibold"
            style={{ color: "#0a0b0d", fontFamily: "'JetBrains Mono', monospace" }}
          >
            ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="size-8 rounded-full flex items-center justify-center shrink-0 text-[#0052ff]">
            <Plus className="size-5" />
          </span>
        )}
      </button>

      <ChargeSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        chargeType={chargeType}
        charge={charge}
        baseSubtotal={baseSubtotal}
        onSave={(next) => {
          onSave?.(next);
          setOpen(false);
        }}
      />
    </>
  );
}
