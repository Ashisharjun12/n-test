import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BottomSheetModal, { BottomSheetSaveButton } from "@/components/ui/bottom-sheet-modal";

const FloatingInput = ({ value, onChange, placeholder, type = "text", inputMode }) => {
  const isActive = value !== undefined && value !== "";
  return (
    <input
      type={type}
      inputMode={inputMode}
      placeholder={!isActive ? placeholder : ""}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 ${isActive ? "bg-white border-[#0052ff]" : "bg-[#eef0f3] border-transparent"} border`}
      style={{ color: "#0a0b0d" }}
    />
  );
};

export default function AdditionalChargesSheet({ open, onClose, charges, onChange }) {
  const [draft, setDraft] = useState(charges);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraft(charges);
    setLabel("");
    setAmount("");
  }, [open, charges]);

  const addCharge = () => {
    const val = parseFloat(amount);
    if (!label.trim() || !val || val <= 0) return;
    setDraft((prev) => [
      ...prev,
      {
        type: "other",
        label: label.trim(),
        rawValue: val,
        valueMode: "flat",
        amount: val,
        taxRate: 0,
        taxInclusive: false,
      },
    ]);
    setLabel("");
    setAmount("");
  };

  const removeCharge = (index) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onChange?.(draft);
    onClose?.();
  };

  return (
    <BottomSheetModal
      open={open}
      onClose={onClose}
      title="Additional Charges"
      size="default"
      maxWidth="max-w-lg"
      bodyClassName="px-5 py-4 flex flex-col gap-3 !bg-white"
      footer={<BottomSheetSaveButton label="Done" onClick={handleSave} />}
    >
      {draft.length > 0 && (
        <div className="flex flex-col gap-2">
          {draft.map((c, i) => (
            <div
              key={`${c.label}-${i}`}
              className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6]"
            >
              <div>
                <p className="text-[14px] font-medium text-[#0a0b0d]">{c.label}</p>
                <p className="text-[13px] text-[#5b616e] font-mono">₹{c.amount.toLocaleString("en-IN")}</p>
              </div>
              <button type="button" onClick={() => removeCharge(i)} className="cursor-pointer p-2 text-[#cf202f]">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[16px] border border-[#dee1e6] p-4 flex flex-col gap-3">
        <p className="text-[13px] font-semibold text-[#0a0b0d]">Add charge</p>
        <FloatingInput value={label} onChange={setLabel} placeholder="Label (e.g. Packaging)" />
        <FloatingInput value={amount} onChange={setAmount} placeholder="Amount" type="number" inputMode="decimal" />
        <button
          type="button"
          onClick={addCharge}
          className="cursor-pointer flex items-center justify-center gap-1.5 text-[14px] font-semibold text-[#0052ff] py-2"
        >
          <Plus className="size-4" /> Add to list
        </button>
      </div>
    </BottomSheetModal>
  );
}
