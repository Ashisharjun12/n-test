import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Landmark, Pencil, Trash2, Loader2, Star } from "lucide-react";
import ProfileMenu from "@/components/shared/ProfileMenu";
import BankForm from "../components/BankForm";
import { bankApi } from "@/api/bank.api";
import useCompanyStore from "@/store/company.store";

export default function BankListPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editBank, setEditBank] = useState(null);

  const companyId = useCompanyStore((s) => s.activeCompany?._id);

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
    loadBanks();
  }, [loadBanks]);

  const openCreate = () => {
    setEditBank(null);
    setFormOpen(true);
  };

  const openEdit = (bank) => {
    setEditBank(bank);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditBank(null);
  };

  const handleSaved = () => {
    loadBanks();
    closeForm();
  };

  const handleDelete = async (bank) => {
    if (!window.confirm(`Delete "${bank.bankName}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await bankApi.deleteBank(bank._id);
      setBanks((prev) => prev.filter((b) => b._id !== bank._id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete bank");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (bank) => {
    if (!companyId || bank.isDefault) return;
    setActionLoading(true);
    try {
      await bankApi.setDefault(bank._id, companyId);
      await loadBanks();
    } catch (err) {
      console.error(err);
      alert("Failed to set default bank");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <header
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ height: 64, background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #dee1e6" }}
      >
        <div className="max-w-3xl mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0a0b0d] hover:text-[#0052ff] transition-colors">
            <ArrowLeft className="size-4" />
            <span className="text-[14px] font-medium hidden sm:inline">Home</span>
          </Link>
          <span className="text-[20px] font-bold tracking-tight select-none absolute left-1/2 -translate-x-1/2" style={{ color: "#0052ff" }}>
            nero.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="hidden md:inline-flex cursor-pointer items-center gap-2 px-5 text-[14px] font-semibold text-white transition-all active:scale-[0.97]"
              style={{ background: "#0052ff", borderRadius: 100, height: 40 }}
            >
              <Plus className="size-4" /> New
            </button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-7 pb-28 md:pb-7 space-y-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0b0d" }}>Banks</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#5b616e" }}>
            Manage bank accounts for quotations and invoices
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="size-6 animate-spin text-[#0052ff]" />
              <p className="text-[13px] text-[#7c828a]">Loading banks...</p>
            </div>
          ) : banks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#eef0f3" }}>
                <Landmark className="size-6" style={{ color: "#a8acb3" }} />
              </div>
              <p className="text-[16px] font-semibold mb-1" style={{ color: "#0a0b0d" }}>No banks yet</p>
              <p className="text-[14px] mb-6" style={{ color: "#5b616e" }}>
                Add bank details here to use them in quotations
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="cursor-pointer inline-flex items-center gap-2 px-6 text-[14px] font-semibold text-white"
                style={{ background: "#0052ff", borderRadius: 100, height: 44 }}
              >
                <Plus className="size-4" /> Add Bank
              </button>
            </div>
          ) : (
            banks.map((bank) => (
              <div
                key={bank._id}
                className="flex items-start gap-4 p-5 rounded-[24px] bg-white"
                style={{ border: `1px solid ${bank.isDefault ? "#0052ff44" : "#dee1e6"}`, background: bank.isDefault ? "#0052ff08" : "#ffffff" }}
              >
                <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#e8eeff" }}>
                  <Landmark className="size-5" style={{ color: "#0052ff" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold truncate" style={{ color: "#0a0b0d" }}>{bank.bankName}</p>
                    {bank.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e8eeff", color: "#0052ff" }}>
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] mt-1 truncate" style={{ color: "#7c828a" }}>
                    {[bank.branch, bank.accountNumber ? `••••${String(bank.accountNumber).slice(-4)}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {bank.upi && (
                    <p className="text-[12px] mt-1 font-mono truncate" style={{ color: "#5b616e" }}>UPI: {bank.upi}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!bank.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(bank)}
                      className="cursor-pointer flex items-center gap-1 text-[11px] font-semibold text-[#0052ff]"
                      title="Set as default"
                    >
                      <Star className="size-3.5" /> Default
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(bank)}
                      className="cursor-pointer size-9 rounded-full flex items-center justify-center"
                      style={{ background: "#eef0f3" }}
                      title="Edit"
                    >
                      <Pencil className="size-4" style={{ color: "#5b616e" }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bank)}
                      className="cursor-pointer size-9 rounded-full flex items-center justify-center"
                      style={{ background: "#fff0f0" }}
                      title="Delete"
                    >
                      <Trash2 className="size-4" style={{ color: "#e03" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pb-[env(safe-area-inset-bottom)]">
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer inline-flex items-center gap-2.5 px-7 text-[15px] font-semibold text-white active:scale-[0.97] transition-transform"
          style={{ background: "#0052ff", borderRadius: 100, height: 52, boxShadow: "0 8px 28px rgba(0,82,255,0.45)" }}
        >
          <Plus className="size-5" /> New Bank
        </button>
      </div>

      <BankForm
        open={formOpen}
        onClose={closeForm}
        companyId={companyId}
        initialData={editBank || undefined}
        onSaved={handleSaved}
      />

      {actionLoading && (
        <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <Loader2 className="size-8 animate-spin text-[#0052ff]" />
        </div>
      )}
    </div>
  );
}
