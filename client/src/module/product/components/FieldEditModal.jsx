import FormSheetModal from "../../../components/ui/form-sheet-modal";

export default function FieldEditModal({
  title,
  placeholder,
  initialValue = "",
  onSave,
  onClose,
  type = "text",
  saving = false,
  uppercase = false,
  helperText,
}) {
  const isTextarea = type === "textarea";

  return (
    <FormSheetModal
      title={title}
      label={title}
      placeholder={placeholder}
      helperText={helperText ?? `Enter the ${title.toLowerCase()} for this product.`}
      initialValue={initialValue}
      onClose={onClose}
      onSave={onSave}
      type={type === "textarea" ? "text" : type}
      multiline={isTextarea}
      uppercase={uppercase}
      saving={saving}
    />
  );
}
