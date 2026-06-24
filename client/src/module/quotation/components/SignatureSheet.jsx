import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import BottomSheetModal from "@/components/ui/bottom-sheet-modal";
import SignatureForm from "@/module/signature/components/SignatureForm";
import useCompanyStore from "@/store/company.store";

export const NO_SIGNATURE = { id: "none", name: "No Signature", url: null };

const RadioCircle = ({ selected }) => (
  <div
    className="size-5 rounded-full flex items-center justify-center shrink-0"
    style={{ border: `2px solid ${selected ? "#0052ff" : "#dee1e6"}` }}
  >
    {selected && <div className="size-2.5 rounded-full bg-[#0052ff]" />}
  </div>
);

export function getCompanySignatures(company) {
  const list = company?.signatures?.filter((s) => s.url) || [];
  if (list.length) {
    return [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }
  if (company?.signature?.url) {
    return [{
      _id: "legacy",
      name: company.signature.name || "Company Signature",
      url: company.signature.url,
      withStamp: company.signature.withStamp,
      isDefault: true,
    }];
  }
  return [];
}

export default function SignatureSheet({ open, onClose, selected, onSelect }) {
  const [formOpen, setFormOpen] = useState(false);
  const company = useCompanyStore((s) => s.activeCompany);

  const signatures = useMemo(() => getCompanySignatures(company), [company]);

  const options = useMemo(
    () => [NO_SIGNATURE, ...signatures.map((s) => ({ ...s, id: s._id }))],
    [signatures]
  );

  const handleSelect = (opt) => {
    if (opt.id === "none" || opt._id === "none") {
      onSelect(null);
    } else {
      onSelect({ url: opt.url, name: opt.name, withStamp: opt.withStamp });
    }
    onClose();
  };

  const handleSaved = (saved) => {
    if (saved) {
      onSelect({ url: saved.url, name: saved.name, withStamp: saved.withStamp });
      onClose();
    }
  };

  return (
    <>
      <BottomSheetModal
        open={open}
        title="Select Signature"
        onClose={onClose}
        size="default"
        maxWidth="max-w-lg"
        bodyClassName="px-5 py-4 flex flex-col gap-2 !bg-white"
      >
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="cursor-pointer flex items-center gap-1.5 text-[14px] font-semibold text-[#0052ff] py-1 mb-1 self-start"
        >
          <Plus className="size-4" /> Add New
        </button>

        {options.map((opt) => {
          const key = opt._id || opt.id;
          const isSelected =
            key === "none" || opt.id === "none"
              ? !selected?.url
              : selected?.url === opt.url;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(opt)}
              className="cursor-pointer flex items-center gap-3 w-full p-4 rounded-[16px] text-left transition-all"
              style={{
                border: `1px solid ${isSelected ? "#0052ff44" : "#dee1e6"}`,
                background: isSelected ? "#0052ff08" : "#ffffff",
              }}
            >
              <RadioCircle selected={isSelected} />
              <span className="text-[14px] font-medium text-[#0a0b0d] flex-1 truncate">{opt.name}</span>
              {opt.url && (
                <img src={opt.url} alt="" className="size-10 rounded-full object-contain border border-[#dee1e6] bg-white shrink-0" />
              )}
            </button>
          );
        })}
      </BottomSheetModal>

      <SignatureForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
    </>
  );
}

export function SignatureRow({ selected, onClick }) {
  const label = selected?.name || "Select Signature";

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left hover:bg-[#f7f7f7]"
    >
      <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-[#eef0f3]">
        <span className="text-[14px]">✍</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[12px] font-medium text-[#5b616e]">Signature</p>
        <p className="text-[14px] font-semibold text-[#0a0b0d] truncate">{label}</p>
      </div>
      <span className="text-[13px] font-semibold text-[#0052ff] shrink-0">Change</span>
    </button>
  );
}
