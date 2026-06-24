import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, PenLine } from "lucide-react";
import BottomSheetModal, { BottomSheetSaveButton } from "@/components/ui/bottom-sheet-modal";
import { uploadApi } from "@/api/upload.api";
import { addCompanySignature, getCompanyById } from "@/api/company.api";
import useCompanyStore from "@/store/company.store";

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

const STEPS = [
  "Grab a white paper and sign it.",
  'Click "Upload signature".',
  'Choose "Camera" or "Gallery".',
  "Take a well-lit photo or pick one from the gallery.",
  "Crop the image to show only the signature.",
  "Check the result and try again if needed.",
];

export default function SignatureForm({ open, onClose, onSaved }) {
  const fileRef = useRef(null);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);
  const refreshCompanyInStore = async (id) => {
    const updated = await getCompanyById(id);
    useCompanyStore.setState((s) => ({
      activeCompany: updated,
      companies: s.companies.map((c) => (c._id === id ? updated : c)),
    }));
    return updated;
  };

  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadRecord, setUploadRecord] = useState(null);
  const [isDefault, setIsDefault] = useState(true);
  const [withStamp, setWithStamp] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setName("");
    setPreviewUrl(null);
    setUploadRecord(null);
    setIsDefault(true);
    setWithStamp(false);
    setErrors({});
  }, [open]);

  const handlePickFile = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setErrors({});
    try {
      const record = await uploadApi.uploadFile(file, "signature");
      setUploadRecord(record);
    } catch (err) {
      console.error(err);
      setPreviewUrl(null);
      setUploadRecord(null);
      setErrors({ submit: "Failed to upload signature image." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const next = {};
    if (!uploadRecord?.url) next.image = "Please upload your signature";
    if (!name.trim()) next.name = "Signature name is required";
    setErrors(next);
    if (Object.keys(next).length || !companyId) return;

    setSaving(true);
    try {
      const saved = await addCompanySignature(companyId, {
        url: uploadRecord.url,
        name: name.trim(),
        withStamp,
        isDefault,
        uploadId: uploadRecord._id,
      });
      await refreshCompanyInStore(companyId);
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || "Failed to save signature." });
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
      footer={
        <BottomSheetSaveButton label="Add Signature" loading={saving || uploading} onClick={handleSubmit} />
      }
    >
      <div className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-[#dee1e6] bg-white">
        <button type="button" onClick={onClose} className="cursor-pointer p-1 -ml-1 text-[#0a0b0d]">
          <ArrowLeft className="size-6" />
        </button>
        <h2 className="text-[18px] font-bold text-[#0a0b0d] flex-1">Add Signature</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <div className="rounded-[16px] bg-white p-4 flex flex-col gap-4">
          <p className="text-[14px] font-semibold text-[#0a0b0d]">Signature</p>

          <button
            type="button"
            onClick={handlePickFile}
            disabled={uploading}
            className="cursor-pointer w-full aspect-square max-w-[220px] mx-auto rounded-[12px] bg-[#eef0f3] flex flex-col items-center justify-center gap-2 overflow-hidden relative"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Signature preview" className="w-full h-full object-contain p-3" />
            ) : (
              <>
                <PenLine className="size-8 text-[#7c828a]" />
                <span className="text-[14px] font-semibold text-[#0052ff]">Upload your signature</span>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[#0052ff]" />
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-[11px] text-center text-[#7c828a]">you can change image by tapping on image</p>
          {errors.image && <p className="text-[12px] text-[#ef4444] text-center">{errors.image}</p>}

          <div>
            <label className="text-[13px] font-semibold text-[#0a0b0d] px-1 mb-2 block">Signature name *</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Please enter signature name"
              className="w-full h-[48px] rounded-[12px] text-[14px] outline-none px-4 bg-[#eef0f3] focus:bg-white focus:border-[#0052ff] border border-transparent text-[#0a0b0d]"
            />
            {errors.name && <p className="text-[11px] text-[#ef4444] mt-1 px-1">{errors.name}</p>}
          </div>

          <ToggleRow label="Default" checked={isDefault} onChange={setIsDefault} />
          <ToggleRow label="With stamp" checked={withStamp} onChange={setWithStamp} />
        </div>

        <div className="px-1">
          <p className="text-[13px] font-semibold text-[#0a0b0d] mb-2">*Follows the below steps to generate a digital signature.</p>
          <ol className="list-decimal list-inside text-[12px] text-[#5b616e] space-y-1.5">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        {errors.submit && <p className="text-[13px] text-[#ef4444] text-center">{errors.submit}</p>}
      </div>
    </BottomSheetModal>
  );
}
