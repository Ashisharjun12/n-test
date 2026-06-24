import { useState } from "react";
import { Plus } from "lucide-react";
import FormSheetModal from "@/components/ui/form-sheet-modal";
import useCompanyStore from "@/store/company.store";

const DEFAULT_FIELD_MAP = {
  reference: "defaultReference",
  notes: "defaultNotes",
  terms: "defaultTerms",
};

export default function QuotationTextSheet({
  icon,
  label,
  value,
  placeholder,
  multiline = false,
  fieldKey,
  saveLabel = "Save",
  onSave,
  showSaveForFuture = true,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(false);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);
  const updateCompany = useCompanyStore((s) => s.updateCompany);

  const handleSave = async (text) => {
    setSaving(true);
    try {
      await onSave?.(text.trim() || undefined);
      if (saveForFuture && companyId && fieldKey) {
        const companyField = DEFAULT_FIELD_MAP[fieldKey];
        if (companyField) {
          await updateCompany(companyId, { [companyField]: text.trim() || "" });
        }
      }
      setOpen(false);
      setSaveForFuture(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const display = value ? (value.length > 36 ? `${value.slice(0, 36)}…` : value) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left hover:bg-[#f7f7f7]"
      >
        <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-[#eef0f3]">
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12px] font-medium text-[#5b616e]">{label}</p>
          <p className={`text-[14px] font-semibold truncate ${display ? "text-[#0a0b0d]" : "text-[#7c828a]"}`}>
            {display || placeholder}
          </p>
        </div>
        {value ? (
          <span className="text-[13px] font-semibold text-[#0052ff] shrink-0">Change</span>
        ) : (
          <span className="size-8 rounded-full flex items-center justify-center shrink-0 text-[#0052ff]">
            <Plus className="size-5" />
          </span>
        )}
      </button>

      <FormSheetModal
        open={open}
        title={label}
        label={label}
        placeholder={placeholder}
        initialValue={value || ""}
        multiline={multiline}
        saving={saving}
        saveLabel={saveLabel}
        onClose={() => {
          setOpen(false);
          setSaveForFuture(false);
        }}
        onSave={handleSave}
        extraContent={
          showSaveForFuture ? (
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-[14px] font-medium text-[#0a0b0d]">Save for Future</span>
              <button
                type="button"
                onClick={() => setSaveForFuture(!saveForFuture)}
                className="cursor-pointer relative w-11 h-6 rounded-full transition-colors"
                style={{ background: saveForFuture ? "#0052ff" : "#eef0f3" }}
              >
                <span
                  className="absolute top-1 size-4 rounded-full bg-white transition-all"
                  style={{ left: saveForFuture ? "24px" : "4px" }}
                />
              </button>
            </div>
          ) : null
        }
      />
    </>
  );
}
