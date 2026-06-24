import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import BottomSheetModal, { BottomSheetSaveButton } from "@/components/ui/bottom-sheet-modal";
import { dispatchAddressApi } from "@/api/dispatchAddress.api";

const EMPTY = {
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  city: "",
  state: "",
};

const FloatingInput = ({ value, onChange, placeholder, inputMode, maxLength, rightSlot, error }) => {
  const isActive = value !== undefined && value !== "";
  return (
    <div className="relative w-full">
      {isActive && (
        <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-[#f7f7f7] text-[#0052ff] z-10">
          {placeholder}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={!isActive ? placeholder : ""}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 ${isActive ? "bg-white" : "bg-[#eef0f3]"}`}
          style={{
            border: error ? "1px solid #ef4444" : isActive ? "1px solid #0052ff" : "1px solid transparent",
            color: "#0a0b0d",
            paddingRight: rightSlot ? "130px" : "16px",
          }}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && <p className="text-[11px] text-[#ef4444] mt-1 px-1">{error}</p>}
    </div>
  );
};

export default function DispatchAddressForm({ open, onClose, companyId, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setErrors({});
  }, [open]);

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
        }));
      }
    } catch {
      /* silent */
    } finally {
      setPincodeLoading(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!form.addressLine1.trim()) next.addressLine1 = "Address line 1 is required";
    if (!form.pincode.trim()) next.pincode = "Pincode is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!companyId || !validate()) return;
    setSaving(true);
    try {
      const res = await dispatchAddressApi.createAddress({
        companyId,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        pincode: form.pincode.trim(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      });
      onSaved?.(res.data?.data);
      onClose?.();
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || "Failed to save address." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetModal
      open={open}
      title={null}
      onClose={onClose}
      size="full"
      maxWidth="max-w-lg"
      showHandle={false}
      bodyClassName="!p-0 !bg-[#f7f7f7] flex flex-col min-h-0"
      footer={<BottomSheetSaveButton label="Add Address" loading={saving} onClick={handleSubmit} />}
    >
      <div className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-[#dee1e6] bg-white">
        <button type="button" onClick={onClose} className="cursor-pointer p-1 -ml-1 text-[#0a0b0d]">
          <ArrowLeft className="size-6" />
        </button>
        <h2 className="text-[18px] font-bold text-[#0a0b0d] flex-1">Add Dispatch Address</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <FloatingInput
          value={form.addressLine1}
          onChange={set("addressLine1")}
          placeholder="Address Line 1*"
          error={errors.addressLine1}
        />
        <FloatingInput value={form.addressLine2} onChange={set("addressLine2")} placeholder="Address Line 2 (Optional)" />
        <FloatingInput
          value={form.pincode}
          onChange={set("pincode")}
          placeholder="Pincode*"
          inputMode="numeric"
          maxLength={6}
          error={errors.pincode}
          rightSlot={
            <button
              type="button"
              onClick={fetchPincode}
              disabled={pincodeLoading || form.pincode.length < 6}
              className="cursor-pointer px-3 py-1.5 rounded-[8px] text-[13px] font-semibold text-white bg-[#0052ff] hover:bg-[#003ecc] disabled:opacity-50"
            >
              {pincodeLoading ? <Loader2 className="size-4 animate-spin" /> : "Fetch"}
            </button>
          }
        />
        <FloatingInput value={form.city} onChange={set("city")} placeholder="City" />
        <FloatingInput value={form.state} onChange={set("state")} placeholder="State" />
        {errors.submit && <p className="text-[13px] text-[#ef4444] text-center">{errors.submit}</p>}
      </div>
    </BottomSheetModal>
  );
}
