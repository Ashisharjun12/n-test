import { useState, useEffect, useCallback } from "react";
import { Landmark, Banknote, Loader2, Plus } from "lucide-react";
import BottomSheetModal from "@/components/ui/bottom-sheet-modal";
import BankForm from "@/module/bank/components/BankForm";
import { bankApi } from "@/api/bank.api";
import useCompanyStore from "@/store/company.store";

export const CASH_OPTION = { id: "cash", type: "cash", name: "Cash", paymentMethod: "cash" };

const RadioCircle = ({ selected }) => (
  <div
    className="size-5 rounded-full flex items-center justify-center shrink-0"
    style={{ border: `2px solid ${selected ? "#0052ff" : "#dee1e6"}` }}
  >
    {selected && <div className="size-2.5 rounded-full bg-[#0052ff]" />}
  </div>
);

export function BankRow({ selectedBank, onClick }) {
  const current = selectedBank || CASH_OPTION;
  const label = current.name || current.bankName || "Cash";

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left hover:bg-[#f7f7f7]"
    >
      <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-[#eef0f3]">
        {current.type === "bank" || current.paymentMethod === "bank" ? (
          <Landmark className="size-4 text-[#0052ff]" />
        ) : (
          <Banknote className="size-4 text-[#05b169]" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[12px] font-medium text-[#5b616e]">Bank</p>
        <p className="text-[14px] font-semibold text-[#0a0b0d] truncate">{label}</p>
      </div>
      <span className="text-[13px] font-semibold text-[#0052ff] shrink-0">Change</span>
    </button>
  );
}

export function BankSelectSheet({ open, onClose, selectedBank, onSelect }) {
  const [formOpen, setFormOpen] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);
  const current = selectedBank || CASH_OPTION;

  const loadBanks = useCallback(() => {
    if (!companyId) return Promise.resolve();
    setLoading(true);
    return bankApi
      .getBanks(companyId)
      .then((res) => {
        const list = res.data?.data || [];
        list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        setBanks(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    if (!open || !companyId) return;
    loadBanks();
  }, [open, companyId, loadBanks]);

  const options = [
    CASH_OPTION,
    ...banks.map((b) => ({ ...b, type: "bank", paymentMethod: "bank", name: b.bankName })),
  ];

  const handleSelect = (bank) => {
    onSelect(bank);
    onClose();
  };

  const handleSaved = (saved) => {
    loadBanks();
    if (saved) {
      onSelect({ ...saved, type: "bank", paymentMethod: "bank", name: saved.bankName });
      onClose();
    }
  };

  return (
    <>
      <BottomSheetModal
        open={open}
        title="Select Bank"
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
          <Plus className="size-4" /> Add New Bank
        </button>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-[#0052ff]" />
          </div>
        ) : (
          options.map((bank) => {
            const key = bank._id || bank.id;
            const isSelected = (current._id || current.id) === key;
            const isBank = bank.type === "bank";

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(bank)}
                className="cursor-pointer flex items-center gap-3 w-full p-4 rounded-[16px] text-left transition-all"
                style={{
                  border: `1px solid ${isSelected ? "#0052ff44" : "#dee1e6"}`,
                  background: isSelected ? "#0052ff08" : "#ffffff",
                }}
              >
                <RadioCircle selected={isSelected} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#0a0b0d]">{bank.name || bank.bankName}</p>
                  {isBank && (
                    <p className="text-[12px] text-[#7c828a] mt-0.5 truncate">
                      {[bank.branch, bank.accountNumber ? `••••${String(bank.accountNumber).slice(-4)}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                      {bank.isDefault ? " · Default" : ""}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </BottomSheetModal>

      <BankForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        companyId={companyId}
        onSaved={handleSaved}
      />
    </>
  );
}

export default function Banks({ selectedBank, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BankRow selectedBank={selectedBank} onClick={() => setOpen(true)} />
      <BankSelectSheet
        open={open}
        onClose={() => setOpen(false)}
        selectedBank={selectedBank}
        onSelect={onSelect}
      />
    </>
  );
}
