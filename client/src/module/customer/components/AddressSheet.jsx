import { useState, useEffect } from "react";
import { Loader2, Copy } from "lucide-react";
import BottomSheetModal, { BottomSheetSaveButton } from "../../../components/ui/bottom-sheet-modal";

/* ── FloatingInput ─────────────────────────────────────────────── */
const FloatingInput = ({ value, onChange, placeholder, type = "text", inputMode, maxLength, rightSlot, rows, readOnly }) => {
  const isActive = value !== undefined && value !== "";

  if (rows) {
    return (
      <div className="relative w-full">
        {isActive && (
          <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10">
            {placeholder}
          </label>
        )}
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={!isActive ? placeholder : ""}
          className={`w-full rounded-[12px] text-[14px] outline-none transition-all px-4 py-3 resize-none ${isActive ? "bg-white" : "bg-[#eef0f3]"}`}
          style={{ border: isActive ? "1px solid #0052ff" : "1px solid transparent", color: "#0a0b0d" }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isActive && (
        <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10">
          {placeholder}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={!isActive ? placeholder : ""}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 ${isActive ? "bg-white" : "bg-[#eef0f3]"} ${readOnly ? "cursor-pointer" : ""}`}
          style={{
            border: isActive ? "1px solid #0052ff" : "1px solid transparent",
            color: "#0a0b0d",
            paddingRight: rightSlot ? "140px" : "16px",
          }}
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
};

const EMPTY = {
  title: "", line1: "", line2: "", pincode: "",
  city: "", state: "", country: "India", notes: "",
};

export default function AddressSheet({
  open,
  onOpenChange,
  type = "billing",
  address,
  billingAddress,
  companyName,
  onSave,
}) {
  const [form, setForm] = useState({ ...EMPTY });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);

  const isBilling = type === "billing";
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (open) {
      setForm(address ? { ...EMPTY, ...address } : { ...EMPTY });
      setSameAsBilling(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sameAsBilling && billingAddress) {
      setForm((f) => ({
        ...f,
        line1: billingAddress.line1 || "",
        line2: billingAddress.line2 || "",
        pincode: billingAddress.pincode || "",
        city: billingAddress.city || "",
        state: billingAddress.state || "",
        country: billingAddress.country || "India",
      }));
    }
  }, [sameAsBilling, billingAddress]);

  const fetchPincode = async () => {
    if (!form.pincode || form.pincode.length < 6) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
      const data = await res.json();
      if (data[0]?.Status === "Success") {
        const po = data[0].PostOffice?.[0];
        setForm((f) => ({
          ...f,
          city: po?.District || f.city,
          state: po?.State || f.state,
          country: "India",
        }));
      }
    } catch { /* silent */ }
    finally { setPincodeLoading(false); }
  };

  const canSave = form.line1.trim() && form.pincode.trim() && form.city.trim() && form.state.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <BottomSheetModal
      open={open}
      title={isBilling ? "Billing Address" : "Shipping Address"}
      onClose={() => onOpenChange(false)}
      size="tall"
      maxWidth="max-w-lg"
      footer={
        <BottomSheetSaveButton
          label="Save & Update"
          onClick={handleSave}
          disabled={!canSave}
        />
      }
    >
      <div className="flex flex-col gap-4">

        {/* Shipping: same as billing checkbox */}
        {!isBilling && billingAddress?.line1 && (
          <button
            type="button"
            onClick={() => setSameAsBilling((v) => !v)}
            className="cursor-pointer flex items-center gap-2 self-start text-[13px] font-semibold transition-colors"
            style={{ color: sameAsBilling ? "#0052ff" : "#5b616e" }}
          >
            <div
              className="size-5 rounded-[5px] border-2 flex items-center justify-center transition-all shrink-0"
              style={{
                borderColor: sameAsBilling ? "#0052ff" : "#a8acb3",
                background: sameAsBilling ? "#0052ff" : "transparent",
              }}
            >
              {sameAsBilling && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
            </div>
            Same as Billing Address
          </button>
        )}

        {/* Shipping: title */}
        {!isBilling && (
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              value={form.title}
              onChange={set("title")}
              placeholder="Title (e.g. Warehouse, Office)"
            />
            {companyName && !form.title && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, title: companyName }))}
                className="cursor-pointer flex items-center gap-1 text-[12px] font-semibold self-start transition-colors text-[#0052ff] hover:text-[#003ecc]"
              >
                <Copy className="size-3" />
                Autofill Company Name
              </button>
            )}
          </div>
        )}

        {/* Address Line 1 */}
        <FloatingInput
          value={form.line1}
          onChange={set("line1")}
          placeholder="Address Line 1 *"
        />

        {/* Address Line 2 */}
        <FloatingInput
          value={form.line2}
          onChange={set("line2")}
          placeholder="Address Line 2"
        />

        {/* Pincode + Fetch */}
        <FloatingInput
          value={form.pincode}
          onChange={set("pincode")}
          placeholder="Pincode *"
          inputMode="numeric"
          maxLength={6}
          rightSlot={
            <button
              type="button"
              onClick={fetchPincode}
              disabled={pincodeLoading || form.pincode.length < 6}
              className="cursor-pointer text-[13px] font-medium text-[#5b616e] hover:text-[#0a0b0d] bg-[#f7f7f7] border border-[#dee1e6] px-3 py-1.5 rounded-[8px] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {pincodeLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Fetch Details
            </button>
          }
        />

        {/* City */}
        <FloatingInput value={form.city} onChange={set("city")} placeholder="City *" />

        {/* State */}
        <FloatingInput value={form.state} onChange={set("state")} placeholder="State *" />

        {/* Country */}
        <FloatingInput value={form.country} onChange={set("country")} placeholder="Country" />

        {/* Notes — shipping only */}
        {!isBilling && (
          <FloatingInput
            value={form.notes}
            onChange={set("notes")}
            placeholder="Notes"
            rows={3}
          />
        )}
      </div>
    </BottomSheetModal>
  );
}
