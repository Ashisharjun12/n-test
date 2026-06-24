import { useState } from "react";
import { Plus } from "lucide-react";
import FormSheetModal from "@/components/ui/form-sheet-modal";

export default function OthersTextRow({
  icon,
  label,
  value,
  placeholder,
  multiline = false,
  onSave,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (text) => {
    setSaving(true);
    try {
      await onSave?.(text.trim() || undefined);
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const display = value
    ? value.length > 36
      ? `${value.slice(0, 36)}…`
      : value
    : null;

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
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
