import { useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Search, X } from "lucide-react";
import AddressSheet from "./AddressSheet";
import TaxSectionSheet from "./TaxSectionSheet";
import { TDS_SECTIONS } from "../data/tdsData";
import { TCS_SECTIONS } from "../data/tcsData";
import { gstApi } from "../../../api/gst.api";
import { COUNTRY_CODES, DEFAULT_COUNTRY } from "../data/countryCodes";
import BottomSheetModal from "../../../components/ui/bottom-sheet-modal";

/* ── FloatingInput ─────────────────────────────────────────────── */
const FloatingInput = ({ value, onChange, placeholder, type = "text", inputMode, maxLength, rightSlot, readOnly, onClick }) => {
  const isActive = value !== undefined && value !== "";
  return (
    <div className="relative w-full" onClick={onClick}>
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
          style={{ border: isActive ? "1px solid #0052ff" : "1px solid transparent", color: "#0a0b0d", paddingRight: rightSlot ? "130px" : "16px" }}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
    </div>
  );
};

/* ── FieldRow (address / section selector) ──────────────────────── */
const FieldRow = ({ label, value, onClick, placeholder }) => (
  <div onClick={onClick} className="flex items-center justify-between py-3 cursor-pointer group">
    <span className="text-[14px] font-semibold text-[#0a0b0d]">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`text-[14px] ${value ? "text-[#0a0b0d] line-clamp-1 max-w-[160px] text-right" : "text-[#7c828a]"}`}>
        {value || placeholder}
      </span>
      <ChevronRight className="size-4 text-[#a8acb3] group-hover:text-[#0052ff] transition-colors" />
    </div>
  </div>
);

/* ── ToggleRow ─────────────────────────────────────────────────── */
const ToggleRow = ({ label, checked, onChange, subtitle }) => (
  <div className="flex items-center justify-between py-3 cursor-pointer" onClick={() => onChange(!checked)}>
    <div className="flex flex-col">
      <span className="text-[14px] font-semibold text-[#0a0b0d]">{label}</span>
      {subtitle && <span className="text-[12px] mt-0.5 text-[#7c828a]">{subtitle}</span>}
    </div>
    <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-[#0052ff]" : "bg-[#d1d5db]"}`}>
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  </div>
);

/* ── PhoneInput ────────────────────────────────────────────────── */
const PhoneInput = ({ value, onChange, country, onCountryClick }) => {
  const isActive = value !== "";
  const maxLen = country?.code === "IN" ? 10 : 15;
  return (
    <div className="relative w-full">
      {isActive && <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10">Phone Number</label>}
      <div
        className={`flex items-center h-[48px] rounded-[12px] px-3 gap-2 transition-all ${isActive ? "bg-white" : "bg-[#eef0f3]"}`}
        style={{ border: isActive ? "1px solid #0052ff" : "1px solid transparent" }}
      >
        <button
          type="button"
          onClick={onCountryClick}
          className="flex items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[18px] leading-none">{country?.flag ?? "🇮🇳"}</span>
          <span className="text-[12px] font-semibold text-[#5b616e]">{country?.code ?? "IN"}</span>
          <span className="text-[12px] font-semibold text-[#5b616e]">{country?.dial ?? "+91"}</span>
          <ChevronDown className="size-3 text-[#a8acb3]" />
        </button>
        <div className="w-px h-4 shrink-0 bg-[#dee1e6]" />
        <input
          type="tel"
          inputMode="numeric"
          maxLength={maxLen}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, maxLen))}
          placeholder={!isActive ? "Enter phone number" : ""}
          className="flex-1 text-[14px] font-medium outline-none bg-transparent text-[#0a0b0d]"
        />
      </div>
    </div>
  );
};

/* ── CountryPickerModal ────────────────────────────────────────── */
const CountryPickerModal = ({ open, onClose, onSelect }) => {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return COUNTRY_CODES;
    const lq = q.toLowerCase();
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(lq) || c.dial.includes(lq) || c.code.toLowerCase().includes(lq)
    );
  }, [q]);

  return (
    <BottomSheetModal
      open={open}
      title="Select Country Code"
      onClose={onClose}
      size="tall"
      maxWidth="max-w-lg"
      bodyClassName="flex flex-col min-h-0 p-0 !py-0 bg-white overflow-hidden"
    >
      <div className="p-4 shrink-0 bg-white border-b border-[#dee1e6]">
        <div className="flex items-center gap-3 h-[48px] rounded-[12px] px-4 bg-[#eef0f3]">
          <Search className="size-4 shrink-0 text-[#a8acb3]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search country..."
            className="flex-1 text-[14px] outline-none bg-transparent text-[#0a0b0d]"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="cursor-pointer">
              <X className="size-4 text-[#a8acb3]" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain py-2 px-4 bg-[#f7f7f7]">
        <div className="flex flex-col bg-white rounded-[16px] overflow-hidden border border-[#dee1e6]">
          {filtered.map((c, i) => (
            <div key={c.code}>
              <button
                type="button"
                onClick={() => { onSelect(c); setQ(""); onClose(); }}
                className="cursor-pointer flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#f7f8fa] transition-colors"
              >
                <span className="text-[20px] leading-none shrink-0">{c.flag}</span>
                <span className="flex-1 text-[14px] text-[#0a0b0d] font-medium">{c.name}</span>
                <span className="text-[13px] font-semibold text-[#5b616e] shrink-0 font-mono">{c.dial}</span>
              </button>
              {i < filtered.length - 1 && <div className="h-px bg-[#eef0f3] mx-4" />}
            </div>
          ))}
        </div>
      </div>
    </BottomSheetModal>
  );
};

/* ── SelectRow (native select styled like FloatingInput) ───────── */
const SelectRow = ({ value, onChange, placeholder, options }) => {
  const isActive = !!value;
  return (
    <div className="relative w-full">
      {isActive && <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10">{placeholder}</label>}
      <div className={`relative h-[48px] rounded-[12px] overflow-hidden transition-all ${isActive ? "bg-white" : "bg-[#eef0f3]"}`}
        style={{ border: isActive ? "1px solid #0052ff" : "1px solid transparent" }}>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="cursor-pointer w-full h-full px-4 pr-10 text-[14px] appearance-none outline-none bg-transparent text-[#0a0b0d]">
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none text-[#5b616e]" />
      </div>
    </div>
  );
};

/* ── Divider ───────────────────────────────────────────────────── */
const Divider = () => <div className="h-px bg-[#dee1e6] w-full my-1" />;

/* ── CollapsibleSection ────────────────────────────────────────── */
const CollapsibleSection = ({ title, subtitle, open, onToggle, children }) => (
  <div>
    <button onClick={onToggle}
      className="cursor-pointer w-full flex items-center justify-between p-4 rounded-[24px] transition-all border border-[#dee1e6] bg-white hover:bg-[#f7f8fa]">
      <div className="text-left">
        <p className="text-[14px] font-semibold text-[#0a0b0d]">{title}</p>
        <p className="text-[12px] mt-0.5 text-[#7c828a]">{subtitle}</p>
      </div>
      {open ? <ChevronUp className="size-5 text-[#a8acb3] shrink-0" /> : <ChevronDown className="size-5 text-[#a8acb3] shrink-0" />}
    </button>
    {open && (
      <div className="flex flex-col p-4 -mt-3 rounded-b-[24px] border border-t-0 border-[#dee1e6]">
        {children}
      </div>
    )}
  </div>
);

/* ── DUE DATE OPTIONS ──────────────────────────────────────────── */
const DUE_DATE_OPTIONS = [
  { value: "0", label: "Due on receipt" },
  { value: "7", label: "Net 7 days" },
  { value: "15", label: "Net 15 days" },
  { value: "30", label: "Net 30 days" },
  { value: "45", label: "Net 45 days" },
  { value: "60", label: "Net 60 days" },
  { value: "90", label: "Net 90 days" },
];

/* ── Parse stored phone ("+91XXXXXXXXXX") → { digits, country } ── */
function parseStoredPhone(phone) {
  if (!phone) return { digits: "", country: DEFAULT_COUNTRY };
  for (const c of [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length)) {
    if (phone.startsWith(c.dial)) return { digits: phone.slice(c.dial.length), country: c };
  }
  return { digits: phone, country: DEFAULT_COUNTRY };
}

/* ── Main CustomerForm ─────────────────────────────────────────── */
export default function CustomerForm({ initialData = null, onBack, onSave, saving = false }) {
  const parsed = parseStoredPhone(initialData?.phone);

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    phone: parsed.digits,
    email: initialData?.email ?? "",
    companyName: initialData?.companyName ?? "",
    gst: initialData?.gst ?? "",
    billingAddress: initialData?.billingAddress ?? null,
    shippingAddress: initialData?.shippingAddress ?? null,
    // preferences
    discount: initialData?.discount != null ? String(initialData.discount) : "",
    discountType: initialData?.discountType ?? "Percent",
    creditLimit: initialData?.creditLimit != null ? String(initialData.creditLimit) : "",
    priceList: initialData?.priceList ?? "",
    defaultDueDate: initialData?.defaultDueDate ?? "",
    tdsApplicable: initialData?.tdsApplicable ?? false,
    tdsSection: initialData?.tdsSection ?? null,
    tcsApplicable: initialData?.tcsApplicable ?? false,
    tcsSection: initialData?.tcsSection ?? null,
    // other details
    openingBalance: initialData?.openingBalance != null ? String(initialData.openingBalance) : "",
    openingBalanceType: initialData?.openingBalanceType ?? "Debit",
    notes: initialData?.notes ?? "",
    pan: initialData?.pan ?? "",
    ccEmails: Array.isArray(initialData?.ccEmails) ? initialData.ccEmails.join(", ") : (initialData?.ccEmails ?? ""),
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : (initialData?.tags ?? ""),
  });

  const [country, setCountry] = useState(parsed.country);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [tdsSheetOpen, setTdsSheetOpen] = useState(false);
  const [tcsSheetOpen, setTcsSheetOpen] = useState(false);
  const [gstFetching, setGstFetching] = useState(false);
  const [gstStatus, setGstStatus] = useState(null); // null | "ok" | "error"
  const [gstError, setGstError] = useState("");

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const resetGstStatus = () => {
    setGstStatus(null);
    setGstError("");
  };

  const fetchGst = async () => {
    if (form.gst.length !== 15 || gstFetching) return;
    setGstFetching(true);
    setGstStatus(null);
    setGstError("");
    try {
      const res = await gstApi.verifyGstin(form.gst);
      const data = res.data?.data ?? res.data;
      if (data?.isValid) {
        setGstStatus("ok");
        if (data.tradeName && !form.companyName) {
          setForm((f) => ({ ...f, companyName: data.tradeName }));
        }
      } else {
        setGstStatus("error");
        setGstError("Could not verify GSTIN.");
      }
    } catch (err) {
      setGstStatus("error");
      const msg = err?.response?.data?.message || "Invalid GSTIN format.";
      setGstError(msg);
    } finally {
      setGstFetching(false);
    }
  };

  const toggleTds = (val) => setForm((f) => ({
    ...f, tdsApplicable: val,
    tcsApplicable: val ? false : f.tcsApplicable,
    tcsSection: val ? null : f.tcsSection,
    tdsSection: val ? f.tdsSection : null,
  }));

  const toggleTcs = (val) => setForm((f) => ({
    ...f, tcsApplicable: val,
    tdsApplicable: val ? false : f.tdsApplicable,
    tdsSection: val ? null : f.tdsSection,
    tcsSection: val ? f.tcsSection : null,
  }));

  const canSubmit = form.name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || saving) return;
    onSave({
      name: form.name.trim(),
      phone: form.phone ? `${country.dial}${form.phone}` : undefined,
      email: form.email || undefined,
      companyName: form.companyName || undefined,
      gst: form.gst || undefined,
      billingAddress: form.billingAddress || undefined,
      shippingAddress: form.shippingAddress || undefined,
      discount: form.discount ? parseFloat(form.discount) : undefined,
      discountType: form.discount ? form.discountType : undefined,
      creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
      priceList: form.priceList || undefined,
      defaultDueDate: form.defaultDueDate || undefined,
      tdsApplicable: form.tdsApplicable,
      tdsSection: form.tdsApplicable ? form.tdsSection : undefined,
      tcsApplicable: form.tcsApplicable,
      tcsSection: form.tcsApplicable ? form.tcsSection : undefined,
      openingBalance: form.openingBalance ? parseFloat(form.openingBalance) : undefined,
      openingBalanceType: form.openingBalance ? form.openingBalanceType : undefined,
      notes: form.notes || undefined,
      pan: form.pan || undefined,
      ccEmails: form.ccEmails ? form.ccEmails.split(",").map(e => e.trim()).filter(Boolean) : undefined,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
        <button onClick={onBack} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-[16px] font-semibold flex-1 text-[#0a0b0d]">
          {initialData ? "Edit Customer" : "Add Customer"}
        </h2>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        {/* Basic Details */}
        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">Basic Details</h3>
          <div className="flex flex-col gap-4 p-4 rounded-[24px] border border-[#dee1e6]">
            <FloatingInput value={form.name} onChange={set("name")} placeholder="Name *" />
            <PhoneInput
              value={form.phone}
              onChange={set("phone")}
              country={country}
              onCountryClick={() => setCountryPickerOpen(true)}
            />
            <FloatingInput value={form.email} onChange={set("email")} placeholder="Email" type="email" />
          </div>
        </div>

        {/* Company Details */}
        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">
            Company Details <span className="text-[12px] font-normal text-[#7c828a]">(Optional)</span>
          </h3>
          <div className="flex flex-col gap-4 p-4 rounded-[24px] border border-[#dee1e6]">
            <FloatingInput
              value={form.gst}
              onChange={(val) => {
                set("gst")(val.toUpperCase());
                resetGstStatus();
              }}
              placeholder="GST Number"
              maxLength={15}
              rightSlot={
                form.gst.length === 15 ? (
                  gstStatus === "ok" ? (
                    <span className="flex items-center gap-1 text-[13px] font-medium text-[#16a34a]">
                      <CheckCircle2 className="size-4" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={fetchGst}
                      disabled={gstFetching}
                      className="cursor-pointer text-[13px] font-semibold text-white bg-[#0052ff] hover:bg-[#003ecc] px-3 py-1.5 rounded-[8px] transition-colors flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
                    >
                      {gstFetching && <Loader2 className="size-3.5 animate-spin" />}
                      Fetch Details
                    </button>
                  )
                ) : null
              }
            />
            {gstStatus === "error" && (
              <div className="flex items-center gap-1.5 -mt-2 px-1">
                <XCircle className="size-4 text-red-500 shrink-0" />
                <p className="text-[12px] text-red-500">{gstError}</p>
              </div>
            )}
            {form.gst.length === 15 && gstStatus !== "error" && (
              <p className="text-[11px] -mt-2 px-1 text-[#7c828a]">
                Entering the GSTIN will automatically fetch the company details
              </p>
            )}
            <FloatingInput value={form.companyName} onChange={set("companyName")} placeholder="Company Name" />
            <p className="text-[11px] -mt-2 px-1 text-[#7c828a]">eg. Tata Motors Private Limited</p>
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">
            Billing Address <span className="text-[12px] font-normal text-[#7c828a]">(Optional)</span>
          </h3>
          <div className="p-4 rounded-[24px] border border-[#dee1e6]">
            <FieldRow
              label="Billing Address"
              address={form.billingAddress}
              value={form.billingAddress?.line1 ? `${form.billingAddress.line1}${form.billingAddress.city ? `, ${form.billingAddress.city}` : ""}` : ""}
              placeholder="Add Billing Address"
              onClick={() => setBillingOpen(true)}
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">
            Shipping Address <span className="text-[12px] font-normal text-[#7c828a]">(Optional)</span>
          </h3>
          <div className="p-4 rounded-[24px] border border-[#dee1e6]">
            <FieldRow
              label="Shipping Address"
              value={form.shippingAddress?.line1 ? `${form.shippingAddress.line1}${form.shippingAddress.city ? `, ${form.shippingAddress.city}` : ""}` : ""}
              placeholder="Add Shipping Address"
              onClick={() => setShippingOpen(true)}
            />
          </div>
        </div>

        {/* Customer Preferences (collapsible) */}
        <CollapsibleSection
          title="Customer Preferences"
          subtitle="Discount, Price List, Credit Limit, TDS, TCS, Due Date"
          open={prefOpen}
          onToggle={() => setPrefOpen((v) => !v)}
        >
          {/* Discount + Discount Type */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <FloatingInput value={form.discount} onChange={set("discount")} placeholder="Discount" type="number" inputMode="decimal" />
            <SelectRow
              value={form.discountType} onChange={set("discountType")}
              placeholder="Discount Type"
              options={[{ value: "Percent", label: "Percent" }, { value: "Flat", label: "Amount" }]}
            />
          </div>

          {/* Credit Limit */}
          <FloatingInput value={form.creditLimit} onChange={set("creditLimit")} placeholder="Credit Limit" type="number" inputMode="decimal" />
          <p className="text-[11px] mt-1.5 mb-4 px-1 text-[#7c828a]">Warning will be shown when customer is exceeding the credit limit while creating invoice</p>

          {/* Price List */}
          <FloatingInput value={form.priceList} onChange={set("priceList")} placeholder="Select Price List" />
          <p className="text-[11px] mt-1.5 mb-4 px-1 text-[#7c828a]">Price List will be automatically selected while creating the document</p>

          {/* Default Due Date */}
          <SelectRow
            value={form.defaultDueDate} onChange={set("defaultDueDate")}
            placeholder="Default Due Date"
            options={DUE_DATE_OPTIONS}
          />
          <p className="text-[11px] mt-1.5 mb-4 px-1 text-[#7c828a]">Specifies the number of days until payment is due, which can be adjusted when creating a document.</p>

          {/* TDS */}
          <Divider />
          <ToggleRow label="TDS applicable?" checked={form.tdsApplicable} onChange={toggleTds} />
          {form.tdsApplicable && (
            <>
              <Divider />
              <FieldRow
                label="TDS Section"
                value={form.tdsSection ? `${form.tdsSection.code} — ${form.tdsSection.rate}%` : ""}
                placeholder="Select TDS Section"
                onClick={() => setTdsSheetOpen(true)}
              />
            </>
          )}

          {/* TCS */}
          <Divider />
          <ToggleRow label="TCS applicable?" checked={form.tcsApplicable} onChange={toggleTcs} />
          {form.tcsApplicable && (
            <>
              <Divider />
              <FieldRow
                label="TCS Section"
                value={form.tcsSection ? `${form.tcsSection.code} — ${form.tcsSection.rate}%` : ""}
                placeholder="Select TCS Section"
                onClick={() => setTcsSheetOpen(true)}
              />
            </>
          )}
        </CollapsibleSection>

        {/* Other Details (collapsible) */}
        <CollapsibleSection
          title="Other Details"
          subtitle="Opening Balance, Notes, PAN, CC Emails, Tags"
          open={otherOpen}
          onToggle={() => setOtherOpen((v) => !v)}
        >
          {/* Opening Balance */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <FloatingInput value={form.openingBalance} onChange={set("openingBalance")} placeholder="Opening Balance" type="number" inputMode="decimal" />
            <SelectRow
              value={form.openingBalanceType} onChange={set("openingBalanceType")}
              placeholder="Balance Type"
              options={[{ value: "Debit", label: "Debit (Receivable)" }, { value: "Credit", label: "Credit (Payable)" }]}
            />
          </div>

          <Divider />
          {/* Notes */}
          <div className="py-3">
            <div className="relative w-full">
              {form.notes && <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10">Notes</label>}
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Notes"
                className={`w-full rounded-[12px] text-[14px] outline-none transition-all px-4 py-3 resize-none ${form.notes ? "bg-white" : "bg-[#eef0f3]"}`}
                style={{ border: form.notes ? "1px solid #0052ff" : "1px solid transparent", color: "#0a0b0d" }}
              />
            </div>
          </div>
          <Divider />

          {/* PAN */}
          <div className="py-3">
            <FloatingInput value={form.pan} onChange={set("pan")} placeholder="PAN Number" maxLength={10} />
          </div>
          <Divider />

          {/* CC Emails */}
          <div className="py-3">
            <FloatingInput value={form.ccEmails} onChange={set("ccEmails")} placeholder="CC Emails (comma separated)" type="email" />
            <p className="text-[11px] mt-1.5 px-1 text-[#7c828a]">Multiple emails separated by comma</p>
          </div>
          <Divider />

          {/* Tags */}
          <div className="py-3">
            <FloatingInput value={form.tags} onChange={set("tags")} placeholder="Tags (comma separated)" />
            <p className="text-[11px] mt-1.5 px-1 text-[#7c828a]">eg. VIP, Wholesale, Regular</p>
          </div>
        </CollapsibleSection>

        <div className="h-4" />
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 pt-3 shrink-0 border-t border-[#dee1e6] bg-white relative z-10">
        <button
          className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all disabled:opacity-50 bg-[#0052ff] hover:bg-[#003ecc] h-14 flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
        >
          {saving && <Loader2 className="size-5 animate-spin" />}
          {initialData ? "Update Customer" : "Add Customer"}
        </button>
      </div>

      {/* Sheets */}
      <CountryPickerModal
        open={countryPickerOpen}
        onClose={() => setCountryPickerOpen(false)}
        onSelect={(c) => setCountry(c)}
      />

      <AddressSheet open={billingOpen} onOpenChange={setBillingOpen} type="billing"
        address={form.billingAddress} companyName={form.companyName}
        onSave={(addr) => setForm((f) => ({ ...f, billingAddress: addr }))} />

      <AddressSheet open={shippingOpen} onOpenChange={setShippingOpen} type="shipping"
        address={form.shippingAddress} billingAddress={form.billingAddress} companyName={form.companyName}
        onSave={(addr) => setForm((f) => ({ ...f, shippingAddress: addr }))} />

      <TaxSectionSheet open={tdsSheetOpen} onOpenChange={setTdsSheetOpen}
        type="tds" sections={TDS_SECTIONS}
        onSelect={(s) => setForm((f) => ({ ...f, tdsSection: s }))} />

      <TaxSectionSheet open={tcsSheetOpen} onOpenChange={setTcsSheetOpen}
        type="tcs" sections={TCS_SECTIONS}
        onSelect={(s) => setForm((f) => ({ ...f, tcsSection: s }))} />
    </div>
  );
}
