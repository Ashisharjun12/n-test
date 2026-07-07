import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Search, Users, Building2, Phone, MapPin, Pencil, Trash2, Loader2 } from "lucide-react";
import ProfileMenu from "@/components/shared/ProfileMenu";
import CustomerForm from "../components/CustomerForm";
import { customerApi } from "@/api/customer.api";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { useCustomerList, CUSTOMER_PAGE_SIZE } from "../hooks/useCustomerList";

export default function CustomerListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    companyId,
    search,
    setSearch,
    items,
    setItems,
    loading,
    loadingMore,
    sentinelRef,
    hasMore,
  } = useCustomerList({ enabled: true });

  const openCreate = () => {
    setEditCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer) => {
    setEditCustomer(customer);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditCustomer(null);
  };

  const handleSave = async (payload) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      if (editCustomer) {
        const res = await customerApi.updateCustomer(editCustomer._id, payload);
        const saved = res.data?.data;
        setItems((prev) => prev.map((c) => (c._id === saved._id ? saved : c)));
      } else {
        const res = await customerApi.createCustomer({ ...payload, companyId });
        const saved = res.data?.data;
        setItems((prev) => [saved, ...prev]);
      }
      closeForm();
    } catch (err) {
      console.error(err);
      alert(editCustomer ? "Failed to update customer" : "Failed to create customer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await customerApi.deleteCustomer(customer._id);
      setItems((prev) => prev.filter((c) => c._id !== customer._id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
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
          <h1 className="text-[28px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0b0d" }}>Customers</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#5b616e" }}>
            Manage customer profiles before creating quotations
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4" style={{ color: "#5b616e" }} />
          <input
            placeholder="Search by name, phone, company..."
            className="w-full h-[44px] pl-10 pr-4 rounded-[100px] text-[14px] outline-none"
            style={{ background: "#eef0f3", color: "#0a0b0d" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="size-6 animate-spin text-[#0052ff]" />
              <p className="text-[13px] text-[#7c828a]">Loading customers...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#eef0f3" }}>
                <Users className="size-6" style={{ color: "#a8acb3" }} />
              </div>
              <p className="text-[16px] font-semibold mb-1" style={{ color: "#0a0b0d" }}>
                {search ? "No customers found" : "No customers yet"}
              </p>
              <p className="text-[14px] mb-6" style={{ color: "#5b616e" }}>
                Add customers here so you can select them quickly in quotations
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="cursor-pointer inline-flex items-center gap-2 px-6 text-[14px] font-semibold text-white"
                style={{ background: "#0052ff", borderRadius: 100, height: 44 }}
              >
                <Plus className="size-4" /> Add Customer
              </button>
            </div>
          ) : (
            <>
              {items.map((customer) => (
                <div
                  key={customer._id}
                  className="flex items-start gap-4 p-5 rounded-[24px] bg-white"
                  style={{ border: "1px solid #dee1e6" }}
                >
                  <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#eef0f3" }}>
                    <span className="text-[15px] font-bold" style={{ color: "#0052ff" }}>
                      {customer.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>{customer.name}</p>
                    {customer.companyName && (
                      <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "#5b616e" }}>
                        <Building2 className="size-3.5 shrink-0" /> {customer.companyName}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="text-[12px] flex items-center gap-1.5 mt-1 font-mono" style={{ color: "#5b616e" }}>
                        <Phone className="size-3.5 shrink-0" /> {customer.phone}
                      </p>
                    )}
                    {customer.billingAddress?.city && (
                      <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "#5b616e" }}>
                        <MapPin className="size-3.5 shrink-0" />
                        {customer.billingAddress.city}, {customer.billingAddress.state}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(customer)}
                      className="cursor-pointer size-9 rounded-full flex items-center justify-center"
                      style={{ background: "#eef0f3" }}
                      title="Edit"
                    >
                      <Pencil className="size-4" style={{ color: "#5b616e" }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(customer)}
                      className="cursor-pointer size-9 rounded-full flex items-center justify-center"
                      style={{ background: "#fff0f0" }}
                      title="Delete"
                    >
                      <Trash2 className="size-4" style={{ color: "#e03" }} />
                    </button>
                  </div>
                </div>
              ))}
              <div ref={sentinelRef} className="py-2 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-[13px] text-[#7c828a]">
                    <Loader2 className="size-4 animate-spin text-[#0052ff]" />
                    Loading more...
                  </div>
                )}
                {!hasMore && items.length > CUSTOMER_PAGE_SIZE && (
                  <p className="text-[12px] text-[#a8acb3]">All {items.length} customers loaded</p>
                )}
              </div>
            </>
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
          <Plus className="size-5" /> New Customer
        </button>
      </div>

      <BottomDrawer open={formOpen} onOpenChange={(v) => !v && closeForm()}>
        <CustomerForm
          initialData={editCustomer || undefined}
          onBack={closeForm}
          onSave={handleSave}
          saving={actionLoading}
        />
      </BottomDrawer>
    </div>
  );
}
