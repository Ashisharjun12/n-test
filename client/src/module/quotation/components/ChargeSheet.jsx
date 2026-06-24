import { useEffect, useState } from "react";
import BottomSheetModal, { BottomSheetSaveButton } from "@/components/ui/bottom-sheet-modal";
import {
  CHARGE_TAX_RATES,
  EMPTY_CHARGE,
  getChargeLabel,
  summarizeCharge,
} from "@/lib/chargeUtils";

function TogglePill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer flex-1 h-[40px] rounded-[100px] text-[13px] font-semibold transition-all"
      style={{
        background: active ? "#0052ff" : "#eef0f3",
        color: active ? "#ffffff" : "#5b616e",
      }}
    >
      {children}
    </button>
  );
}

export default function ChargeSheet({ open, onClose, title, chargeType, charge, baseSubtotal, onSave }) {
  const [draft, setDraft] = useState({ ...EMPTY_CHARGE });

  useEffect(() => {
    if (!open) return;
    if (charge?.rawValue) {
      setDraft({
        rawValue: String(charge.rawValue),
        valueMode: charge.valueMode || "flat",
        taxRate: charge.taxRate ?? 0,
        taxInclusive: charge.taxInclusive ?? false,
      });
    } else {
      setDraft({ ...EMPTY_CHARGE });
    }
  }, [open, charge]);

  const summary = draft.rawValue ? summarizeCharge(draft, baseSubtotal) : null;
  const label = getChargeLabel({ type: chargeType, label: title });

  const handleSave = () => {
    const rawValue = parseFloat(draft.rawValue) || 0;
    if (rawValue <= 0) {
      onSave?.(null);
      return;
    }
    onSave?.({
      type: chargeType,
      label,
      rawValue,
      valueMode: draft.valueMode,
      taxRate: draft.taxRate,
      taxInclusive: draft.taxInclusive,
    });
  };

  return (
    <BottomSheetModal
      open={open}
      onClose={onClose}
      title={title}
      size="default"
      maxWidth="max-w-lg"
      bodyClassName="px-5 py-4 flex flex-col gap-4 !bg-white"
      footer={<BottomSheetSaveButton label="Save" onClick={handleSave} />}
    >
      <div className="flex gap-2">
        <TogglePill active={draft.valueMode === "flat"} onClick={() => setDraft((d) => ({ ...d, valueMode: "flat" }))}>
          ₹ Flat
        </TogglePill>
        <TogglePill
          active={draft.valueMode === "percent"}
          onClick={() => setDraft((d) => ({ ...d, valueMode: "percent" }))}
        >
          % Percent
        </TogglePill>
      </div>

      <div>
        <label className="text-[13px] font-semibold text-[#0a0b0d] px-1 mb-1.5 block">
          {draft.valueMode === "percent" ? "Percentage" : "Amount"}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#5b616e]">
            {draft.valueMode === "percent" ? "%" : "₹"}
          </span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={draft.rawValue}
            onChange={(e) => setDraft((d) => ({ ...d, rawValue: e.target.value }))}
            className="w-full h-[48px] pl-8 pr-4 rounded-[12px] text-[14px] outline-none border border-[#0052ff] bg-white text-[#0a0b0d]"
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="text-[13px] font-semibold text-[#0a0b0d] px-1 mb-1.5 block">Tax %</label>
        <select
          value={draft.taxRate}
          onChange={(e) => setDraft((d) => ({ ...d, taxRate: Number(e.target.value) }))}
          className="cursor-pointer w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none bg-[#eef0f3] text-[#0a0b0d]"
        >
          {CHARGE_TAX_RATES.map((r) => (
            <option key={r} value={r}>
              {r}%
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <TogglePill
          active={!draft.taxInclusive}
          onClick={() => setDraft((d) => ({ ...d, taxInclusive: false }))}
        >
          Without Tax
        </TogglePill>
        <TogglePill
          active={draft.taxInclusive}
          onClick={() => setDraft((d) => ({ ...d, taxInclusive: true }))}
        >
          With Tax
        </TogglePill>
      </div>

      {summary && (
        <p className="text-[13px] text-[#5b616e] px-1">
          ₹{summary.baseBeforeTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          {draft.taxRate > 0 && (
            <>
              {" "}
              + {draft.taxRate}% tax (₹{summary.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
            </>
          )}{" "}
          = ₹{summary.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })} including taxes
        </p>
      )}
    </BottomSheetModal>
  );
}

export function DeliveryChargeSheet(props) {
  return <ChargeSheet {...props} title="Delivery / Shipping Charges" chargeType="shipping" />;
}

export function PackagingChargeSheet(props) {
  return <ChargeSheet {...props} title="Packaging Charges" chargeType="packaging" />;
}
