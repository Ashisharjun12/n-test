import { useEffect, useId, useRef, useState } from "react";
import BottomSheetModal, { BottomSheetSaveButton } from "./bottom-sheet-modal";

const TextareaInput = ({ id, value, onChange, label, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-[13px] font-semibold text-[#0a0b0d] px-1">
        {label}
      </label>
    )}
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[120px] rounded-[12px] p-4 text-[14px] outline-none border border-[#0052ff] bg-white text-[#0a0b0d] resize-none"
      autoFocus
    />
  </div>
);

const TextInput = ({ id, inputRef, label, placeholder, type, uppercase, defaultValue }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-[13px] font-semibold text-[#0a0b0d] px-1">
        {label}
      </label>
    )}
    <input
      ref={inputRef}
      id={id}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      inputMode="text"
      onInput={(e) => {
        if (uppercase) e.currentTarget.value = e.currentTarget.value.toUpperCase();
      }}
      className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 border border-[#0052ff] bg-white text-[#0a0b0d] ${
        uppercase ? "uppercase" : ""
      }`}
    />
  </div>
);

export default function FormSheetModal({
  open = true,
  title,
  label,
  placeholder,
  helperText,
  initialValue = "",
  onSave,
  onClose,
  type = "text",
  multiline = false,
  uppercase = false,
  saving = false,
  saveLabel = "Save",
  extraContent,
}) {
  const fieldId = useId();
  const inputRef = useRef(null);
  const [textareaValue, setTextareaValue] = useState(initialValue);

  useEffect(() => {
    if (!open) return undefined;
    if (multiline) {
      setTextareaValue(initialValue);
      return undefined;
    }
    // Set value immediately; BottomSheetModal handles focus after mount
    if (inputRef.current) {
      inputRef.current.value = initialValue;
    }
    // Also try focusing after a short delay as a backup
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = initialValue;
        inputRef.current.focus({ preventScroll: true });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [open, initialValue, multiline]);

  const handleSave = () => {
    if (multiline) {
      onSave?.(textareaValue);
      return;
    }
    const raw = inputRef.current?.value ?? "";
    onSave?.(uppercase ? raw.toUpperCase() : raw);
  };

  const displayLabel = label || placeholder;

  return (
    <BottomSheetModal
      open={open}
      title={title}
      onClose={onClose}
      size="compact"
      footer={
        <BottomSheetSaveButton label={saveLabel} loading={saving} onClick={handleSave} />
      }
    >
      {multiline ? (
        <TextareaInput
          id={fieldId}
          value={textareaValue}
          onChange={setTextareaValue}
          label={displayLabel}
          placeholder={placeholder}
        />
      ) : (
        <TextInput
          id={fieldId}
          inputRef={inputRef}
          label={displayLabel}
          placeholder={placeholder}
          type={type}
          uppercase={uppercase}
          defaultValue={initialValue}
        />
      )}
      {helperText && <p className="text-[12px] text-[#7c828a] mt-2 px-1">{helperText}</p>}
      {extraContent}
    </BottomSheetModal>
  );
}
