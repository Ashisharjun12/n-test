import { useState, useEffect, useCallback } from "react";
import { MapPin, Loader2, Plus } from "lucide-react";
import BottomSheetModal from "@/components/ui/bottom-sheet-modal";
import DispatchAddressForm from "@/module/dispatchAddress/components/DispatchAddressForm";
import { dispatchAddressApi } from "@/api/dispatchAddress.api";
import useCompanyStore from "@/store/company.store";

function formatAddress(addr) {
  if (!addr) return "";
  return [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
}

const RadioCircle = ({ selected }) => (
  <div
    className="size-5 rounded-full flex items-center justify-center shrink-0"
    style={{ border: `2px solid ${selected ? "#0052ff" : "#dee1e6"}` }}
  >
    {selected && <div className="size-2.5 rounded-full bg-[#0052ff]" />}
  </div>
);

export function DispatchAddressRow({ selected, onClick }) {
  const label = selected
    ? [selected.city, selected.state].filter(Boolean).join(", ") || selected.addressLine1
    : "Select Dispatch Address";

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left hover:bg-[#f7f7f7]"
    >
      <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-[#eef0f3]">
        <MapPin className="size-4 text-[#5b616e]" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[12px] font-medium text-[#5b616e]">Dispatch Address</p>
        <p className="text-[14px] font-semibold text-[#0a0b0d] truncate">{label}</p>
      </div>
      <span className="text-[13px] font-semibold text-[#0052ff] shrink-0">Change</span>
    </button>
  );
}

export default function DispatchAddressSheet({ open, onClose, selected, onSelect }) {
  const [formOpen, setFormOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);

  const loadAddresses = useCallback(() => {
    if (!companyId) return Promise.resolve();
    setLoading(true);
    return dispatchAddressApi
      .getAddresses(companyId)
      .then((res) => setAddresses(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    if (!open || !companyId) return;
    loadAddresses();
  }, [open, companyId, loadAddresses]);

  const handleSelect = (addr) => {
    onSelect({
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
    });
    onClose();
  };

  const handleSaved = (saved) => {
    loadAddresses();
    if (saved) {
      handleSelect(saved);
    }
  };

  return (
    <>
      <BottomSheetModal
        open={open}
        title="Select Dispatch Address"
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

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-[#0052ff]" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MapPin className="size-10 mb-3 text-[#a8acb3]" />
            <p className="text-[14px] font-medium text-[#5b616e]">No dispatch address yet</p>
            <p className="text-[12px] mt-1 text-[#7c828a]">Tap Add New to create one</p>
          </div>
        ) : (
          addresses.map((addr) => {
            const isSelected =
              selected?.addressLine1 === addr.addressLine1 && selected?.pincode === addr.pincode;
            return (
              <button
                key={addr._id}
                type="button"
                onClick={() => handleSelect(addr)}
                className="cursor-pointer flex items-center gap-3 w-full p-4 rounded-[16px] text-left transition-all"
                style={{
                  border: `1px solid ${isSelected ? "#0052ff44" : "#dee1e6"}`,
                  background: isSelected ? "#0052ff08" : "#ffffff",
                }}
              >
                <RadioCircle selected={isSelected} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#0a0b0d] line-clamp-2">{formatAddress(addr)}</p>
                </div>
              </button>
            );
          })
        )}
      </BottomSheetModal>

      <DispatchAddressForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        companyId={companyId}
        onSaved={handleSaved}
      />
    </>
  );
}
