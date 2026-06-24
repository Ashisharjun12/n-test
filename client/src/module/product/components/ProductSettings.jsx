import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import CategorySelectModal from "./CategorySelectModal";
import UnitSelectModal from "./UnitSelectModal";
import TaxRateModal from "./TaxRateModal";
import { productApi } from "../../../api/product.api";
import useCompanyStore from "../../../store/company.store";
import { getUnitLabel } from "../data/units";

const FieldRow = ({ label, value, onClick, prefix = "Select ", suffixIcon = null }) => (
  <div onClick={onClick} className="flex items-center justify-between py-3 cursor-pointer group">
    <span className="text-[14px] font-semibold text-[#0a0b0d]">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`text-[14px] ${value ? "text-[#0a0b0d] line-clamp-1 max-w-[150px] text-right" : "text-[#7c828a]"}`}>
        {value || `${prefix}${label}`}
      </span>
      {suffixIcon && <div className="text-[#a8acb3] group-hover:text-[#0052ff] transition-colors">{suffixIcon}</div>}
    </div>
  </div>
);

const FloatingInput = ({ value, onChange, placeholder, type = "text", max }) => {
  const isActive = value !== undefined && value !== "";

  return (
    <div className="relative w-full">
      {isActive && (
        <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10 transition-all">
          {placeholder}
        </label>
      )}
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        max={max}
        placeholder={!isActive ? placeholder : ""}
        value={value}
        onKeyDown={(e) => {
          if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+")) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          let val = e.target.value;
          if (type === "number" && val !== "") {
            if (parseFloat(val) < 0) val = "0";
            if (max !== undefined && parseFloat(val) > max) val = max.toString();
          }
          onChange(val);
        }}
        className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 ${
          isActive ? "border-[#0052ff] bg-white" : "border-transparent bg-[#eef0f3]"
        }`}
        style={{
          border: isActive ? "1px solid #0052ff" : "1px solid transparent",
          color: "#0a0b0d",
        }}
      />
    </div>
  );
};

export default function ProductSettings({ onBack }) {
  const companyId = useCompanyStore((state) => state.activeCompany?._id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [taxRateModalOpen, setTaxRateModalOpen] = useState(false);

  const [form, setForm] = useState({
    defaultCategory: "",
    defaultCategoryName: "",
    defaultType: "product",
    defaultPricePreference: "exclusive",
    defaultUnit: "PCS",
    defaultTaxRate: "0",
    maxDiscount: "100",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!companyId) return;
      try {
        const res = await productApi.getSettings(companyId);
        const data = res.data?.data;
        if (data) {
          setForm({
            defaultCategory: data.defaultCategory?._id || data.defaultCategory || "",
            defaultCategoryName: data.defaultCategory?.name || "",
            defaultType: data.defaultType || "product",
            defaultPricePreference: data.defaultPricePreference || "exclusive",
            defaultUnit: data.defaultUnit || "PCS",
            defaultTaxRate: data.defaultTaxRate?.toString() ?? "0",
            maxDiscount: data.maxDiscount?.toString() || "100",
          });
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [companyId]);

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      await productApi.updateSettings(companyId, {
        defaultCategory: form.defaultCategory || undefined,
        defaultType: form.defaultType,
        defaultPricePreference: form.defaultPricePreference,
        defaultUnit: form.defaultUnit,
        defaultTaxRate: parseFloat(form.defaultTaxRate) || 0,
        maxDiscount: parseFloat(form.maxDiscount) || 0,
      });
      onBack();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <Loader2 className="size-6 animate-spin text-[#0052ff]" />
        <p className="text-[13px] text-[#7c828a] font-medium">Loading settings...</p>
      </div>
    );
  }

  const priceInclusive = form.defaultPricePreference === "inclusive";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
        <button onClick={onBack} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-[16px] font-semibold flex-1 text-[#0a0b0d]">Product Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">Preferences</h3>
          <div className="flex flex-col gap-4 p-4 rounded-[24px] border border-[#dee1e6]">
            <div>
              <p className="text-[13px] font-medium text-[#7c828a] mb-2">Default Product Type</p>
              <div className="flex gap-4 flex-wrap">
                {["product", "service"].map((t) => (
                  <label
                    key={t}
                    onClick={() => update("defaultType", t)}
                    className="cursor-pointer flex items-center gap-2 text-[14px] font-medium text-[#0a0b0d] capitalize"
                  >
                    <div
                      className="size-5 rounded-full flex items-center justify-center transition-all"
                      style={{ border: `2px solid ${form.defaultType === t ? "#0052ff" : "#dee1e6"}` }}
                    >
                      {form.defaultType === t && <div className="size-2.5 rounded-full bg-[#0052ff]" />}
                    </div>
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-[#dee1e6] w-full" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#0a0b0d]">Default Price Preference</p>
                <p className="text-[12px] mt-0.5 text-[#7c828a] leading-snug">
                  Choose how product prices are set by default — either inclusive (ON) or exclusive of tax (OFF).
                </p>
              </div>
              <button
                type="button"
                onClick={() => update("defaultPricePreference", priceInclusive ? "exclusive" : "inclusive")}
                className="cursor-pointer relative w-11 h-6 rounded-full transition-colors shrink-0"
                style={{ background: priceInclusive ? "#0052ff" : "#eef0f3" }}
              >
                <span
                  className="absolute top-1 size-4 rounded-full bg-white transition-all"
                  style={{ left: priceInclusive ? "24px" : "4px" }}
                />
              </button>
            </div>

            <div className="h-[1px] bg-[#dee1e6] w-full" />

            <FieldRow
              label="Default Unit"
              value={form.defaultUnit ? `${form.defaultUnit} — ${getUnitLabel(form.defaultUnit)}` : ""}
              prefix="Select "
              onClick={() => setActiveField("unit")}
              suffixIcon={<ChevronDown className="size-4" />}
            />

            <div className="h-[1px] bg-[#dee1e6] w-full" />

            <div
              onClick={() => setTaxRateModalOpen(true)}
              className="flex items-center justify-between py-3 cursor-pointer group"
            >
              <div>
                <p className="text-[13px] font-semibold text-[#0a0b0d]">Default Tax Rate</p>
                <p className="text-[12px] mt-0.5 text-[#7c828a]">
                  The selected tax rate will be set by default when creating a new product.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#0a0b0d]">{form.defaultTaxRate}%</span>
                <ChevronDown className="size-4 text-[#a8acb3]" />
              </div>
            </div>

            <div className="h-[1px] bg-[#dee1e6] w-full" />

            <FloatingInput
              value={form.maxDiscount}
              onChange={(v) => update("maxDiscount", v)}
              placeholder="Max Discount (%)"
              type="number"
              max={100}
            />

            <div className="h-[1px] bg-[#dee1e6] w-full my-1" />

            <FieldRow
              label="Default Category"
              prefix="Select "
              value={form.defaultCategoryName || (form.defaultCategory ? "Selected" : "")}
              onClick={() => setActiveField("category")}
              suffixIcon={<ChevronRight className="size-4" />}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-3 shrink-0 border-t border-[#dee1e6] bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-[#0052ff] hover:bg-[#003ecc] h-14"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 className="size-5 animate-spin" />}
          Save Settings
        </button>
      </div>

      {activeField === "category" && (
        <CategorySelectModal
          title="Select Category"
          onClose={() => setActiveField(null)}
          onSelect={(cat) => {
            update("defaultCategory", cat._id);
            update("defaultCategoryName", cat.name);
            setActiveField(null);
          }}
        />
      )}

      {activeField === "unit" && (
        <UnitSelectModal
          value={form.defaultUnit}
          onClose={() => setActiveField(null)}
          onSelect={(code) => update("defaultUnit", code)}
        />
      )}

      {taxRateModalOpen && (
        <TaxRateModal
          currentRate={form.defaultTaxRate}
          onClose={() => setTaxRateModalOpen(false)}
          onSelect={(rate) => update("defaultTaxRate", rate)}
        />
      )}
    </div>
  );
}
