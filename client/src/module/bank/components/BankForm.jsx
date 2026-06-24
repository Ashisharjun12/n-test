import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import BottomSheetModal, { BottomSheetSaveButton } from "@/components/ui/bottom-sheet-modal";
import { bankApi } from "@/api/bank.api";

const EMPTY = {
  bankName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  branch: "",
  upi: "",
  openingBalance: "",
  gpay: "",
  notes: "",
  isDefault: false,
};

const FloatingInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
  rightSlot,
  error,
}) => {
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
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={!isActive ? placeholder : ""}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 ${isActive ? "bg-white" : "bg-[#eef0f3]"}`}
          style={{
            border: error ? "1px solid #ef4444" : isActive ? "1px solid #0052ff" : "1px solid transparent",
            color: "#0a0b0d",
            paddingRight: rightSlot ? "100px" : "16px",
          }}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && <p className="text-[11px] text-[#ef4444] mt-1 px-1">{error}</p>}
    </div>
  );
};

const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 cursor-pointer" onClick={() => onChange(!checked)}>
    <span className="text-[14px] font-semibold text-[#0a0b0d]">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium text-[#7c828a]">{checked ? "Yes" : "No"}</span>
      <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-[#0052ff]" : "bg-[#d1d5db]"}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </div>
    </div>
  </div>
);

const UPI_PATTERN = /^[\w.-]+@[\w.-]+$/;

export default function BankForm({ open, onClose, companyId, initialData, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [upiStatus, setUpiStatus] = useState(null);

  const isEdit = Boolean(initialData?._id);
  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (key === "upi") setUpiStatus(null);
  };

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        bankName: initialData.bankName || "",
        accountNumber: initialData.accountNumber || "",
        confirmAccountNumber: initialData.accountNumber || "",
        branch: initialData.branch || "",
        upi: initialData.upi || "",
        openingBalance: initialData.openingBalance != null ? String(initialData.openingBalance) : "",
        gpay: initialData.gpay || "",
        notes: initialData.notes || "",
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setUpiStatus(null);
  }, [open, initialData]);

  const verifyUpi = () => {
    const upi = form.upi.trim();
    if (!upi) {
      setUpiStatus({ ok: false, message: "Enter a UPI ID first" });
      return;
    }
    if (!UPI_PATTERN.test(upi)) {
      setUpiStatus({ ok: false, message: "Invalid UPI format (e.g. name@bank)" });
      return;
    }
    setUpiStatus({ ok: true, message: "UPI format looks valid" });
  };

  const validate = () => {
    const next = {};
    if (!form.bankName.trim()) next.bankName = "Bank name is required";
    if (!form.accountNumber.trim()) next.accountNumber = "Account number is required";
    if (!form.confirmAccountNumber.trim()) next.confirmAccountNumber = "Please confirm account number";
    else if (form.accountNumber !== form.confirmAccountNumber) next.confirmAccountNumber = "Account numbers do not match";
    if (!form.branch.trim()) next.branch = "Branch name is required";
    if (form.upi.trim() && !UPI_PATTERN.test(form.upi.trim())) next.upi = "Invalid UPI format";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!companyId || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        companyId,
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        branch: form.branch.trim(),
        upi: form.upi.trim() || undefined,
        openingBalance: form.openingBalance !== "" ? Number(form.openingBalance) : 0,
        gpay: form.gpay.trim() || undefined,
        notes: form.notes.trim() || undefined,
        isDefault: form.isDefault,
      };

      const res = isEdit
        ? await bankApi.updateBank(initialData._id, payload)
        : await bankApi.createBank(payload);

      const saved = res.data?.data;
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save bank details";
      setErrors({ submit: msg });
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
      bodyClassName="!p-0 !bg-white flex flex-col min-h-0"
      footer={
        <BottomSheetSaveButton
          label={isEdit ? "Update Bank" : "Add New Bank"}
          loading={saving}
          onClick={handleSubmit}
          className="!bg-[#05b169] hover:!bg-[#049a5c]"
        />
      }
    >
      <div className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-[#dee1e6]">
        <button type="button" onClick={onClose} className="cursor-pointer p-1 -ml-1 text-[#0a0b0d]">
          <ArrowLeft className="size-6" />
        </button>
        <h2 className="text-[18px] font-bold text-[#0a0b0d] flex-1">
          {isEdit ? "Edit Bank Detail" : "Add New Bank Detail"}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4 bg-[#f7f7f7]">
        <FloatingInput
          value={form.bankName}
          onChange={set("bankName")}
          placeholder="Bank name*"
          error={errors.bankName}
        />

        <FloatingInput
          value={form.accountNumber}
          onChange={set("accountNumber")}
          placeholder="Bank account no.*"
          inputMode="numeric"
          error={errors.accountNumber}
        />

        <FloatingInput
          value={form.confirmAccountNumber}
          onChange={set("confirmAccountNumber")}
          placeholder="Confirm Bank account no.*"
          inputMode="numeric"
          error={errors.confirmAccountNumber}
        />

        <FloatingInput
          value={form.branch}
          onChange={set("branch")}
          placeholder="Bank branch name*"
          error={errors.branch}
        />

        <div>
          <div className="flex items-center gap-1 mb-2 px-1">
            <span className="text-[13px] font-semibold text-[#0a0b0d]">UPI</span>
            <Info className="size-3.5 text-[#7c828a]" />
          </div>
          <FloatingInput
            value={form.upi}
            onChange={set("upi")}
            placeholder="Enter UPI (Optional)"
            error={errors.upi}
            rightSlot={
              <button
                type="button"
                onClick={verifyUpi}
                className="cursor-pointer px-3 py-1.5 rounded-[8px] text-[13px] font-semibold text-white bg-[#0052ff] hover:bg-[#003ecc]"
              >
                Verify
              </button>
            }
          />
          {upiStatus && (
            <p className={`text-[11px] mt-1.5 px-1 flex items-center gap-1 ${upiStatus.ok ? "text-[#05b169]" : "text-[#ef4444]"}`}>
              {upiStatus.ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
              {upiStatus.message}
            </p>
          )}
          <p className="text-[11px] mt-1.5 px-1 text-[#7c828a]">
            This UPI ID will be used to generate Dynamic QR codes on the invoices and bills.
          </p>
        </div>

        <FloatingInput
          value={form.openingBalance}
          onChange={set("openingBalance")}
          placeholder="Opening balance (Optional)"
          type="number"
          inputMode="decimal"
        />

        <FloatingInput
          value={form.gpay}
          onChange={set("gpay")}
          placeholder="Enter GPay/PhonePe number (Optional)"
          inputMode="tel"
        />

        <div>
          <label className="text-[13px] font-semibold text-[#0a0b0d] px-1 mb-2 block">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            placeholder="Beneficiary Name, SWIFT Code etc."
            className="w-full min-h-[100px] rounded-[12px] p-4 text-[14px] outline-none border border-transparent bg-[#eef0f3] focus:bg-white focus:border-[#0052ff] text-[#0a0b0d] resize-none"
          />
        </div>

        <div className="rounded-[12px] bg-white px-4">
          <ToggleRow label="Default" checked={form.isDefault} onChange={set("isDefault")} />
        </div>

        {errors.submit && (
          <p className="text-[13px] text-[#ef4444] text-center px-2">{errors.submit}</p>
        )}
      </div>
    </BottomSheetModal>
  );
}
