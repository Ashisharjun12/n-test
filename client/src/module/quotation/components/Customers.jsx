import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, UserPlus, Users, Building2, Phone, MapPin, Loader2, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { customerApi } from "../../../api/customer.api";
import useCompanyStore from "../../../store/company.store";
import CustomerForm from "../../customer/components/CustomerForm";
import { BottomDrawer, safeAreaBottom } from "@/components/ui/bottom-drawer";

const PAGE_SIZE = 20;

export default function Customers({ open, onOpenChange, selectedCustomer, onSelect }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [editCustomer, setEditCustomer] = useState(null);

  // pagination state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const sentinelRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);

  // ── Fetch a specific page ──────────────────────────────────────
  const fetchPage = useCallback(async (pageNum, searchTerm, replace = false) => {
    if (!companyId) return;
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const res = await customerApi.getCustomers(companyId, { page: pageNum, limit: PAGE_SIZE, search: searchTerm });
      const data = res.data?.data;
      setItems((prev) => replace ? (data?.items || []) : [...prev, ...(data?.items || [])]);
      setPage(data?.page ?? pageNum);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      if (replace) setLoading(false); else setLoadingMore(false);
    }
  }, [companyId]);

  // Re-fetch from page 1 when drawer opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setItems([]);
      setPage(1);
      fetchPage(1, "", true);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search → fetch from page 1
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setItems([]);
      setPage(1);
      fetchPage(1, search, true);
    }, 350);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search, fetchPage]);

  // IntersectionObserver — load next page when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage, search);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages, search, fetchPage]);

  const hasMore = page < totalPages;

  // ── Handlers ──────────────────────────────────────────────────
  const handleDelete = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await customerApi.deleteCustomer(customer._id);
      setItems((prev) => prev.filter((c) => c._id !== customer._id));
      if (selectedCustomer?._id === customer._id) onSelect(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = (isOpen) => {
    if (isOpen) return;
    setView("list");
    setSearch("");
    setEditCustomer(null);
    onOpenChange(false);
  };

  const handleSave = async (payload) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      const res = await customerApi.createCustomer({ ...payload, companyId });
      const newCustomer = res.data?.data;
      setItems((prev) => [newCustomer, ...prev]);
      onSelect(newCustomer);
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save customer");
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (customer) => {
    setEditCustomer(customer);
    setView("edit");
  };

  const saveEdit = async (payload) => {
    if (!companyId || !editCustomer) return;
    setActionLoading(true);
    try {
      const res = await customerApi.updateCustomer(editCustomer._id, payload);
      const updated = res.data?.data;
      setItems((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      if (selectedCustomer?._id === updated._id) onSelect(updated);
      setView("list");
      setEditCustomer(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <BottomDrawer open={open} onOpenChange={handleClose}>
      {/* ── Add view ── */}
      {view === "add" && (
        <CustomerForm onBack={() => setView("list")} onSave={handleSave} saving={actionLoading} />
      )}

      {/* ── Edit view ── */}
      {view === "edit" && editCustomer && (
        <CustomerForm
          initialData={editCustomer}
          onBack={() => { setView("list"); setEditCustomer(null); }}
          onSave={saveEdit}
          saving={actionLoading}
        />
      )}

      {/* ── List view ── */}
      {view === "list" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
            <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Select Customer</h2>
            <button
              onClick={() => setView("add")}
              className="cursor-pointer flex items-center gap-1.5 text-[14px] font-semibold transition-colors"
              style={{ color: "#0052ff" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#003ecc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#0052ff")}
            >
              <UserPlus className="size-4" /> New
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-4 shrink-0">
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
          </div>

          {/* List */}
          <div className={`flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-2 ${safeAreaBottom}`}>
            {/* Add new CTA */}
            <button
              onClick={() => setView("add")}
              className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-[16px] transition-all"
              style={{ border: "1px solid #dee1e6", background: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f8fa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0052ff14" }}>
                <UserPlus className="size-5" style={{ color: "#0052ff" }} />
              </div>
              <div className="text-left flex-1">
                <p className="text-[14px] font-semibold" style={{ color: "#0a0b0d" }}>Add New Customer</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#7c828a" }}>Create a new customer profile</p>
              </div>
              <ChevronRight className="size-4 shrink-0" style={{ color: "#a8acb3" }} />
            </button>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="size-6 animate-spin" style={{ color: "#0052ff" }} />
                <p className="text-[13px]" style={{ color: "#7c828a" }}>Loading customers...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="size-10 mb-4" style={{ color: "#a8acb3" }} />
                <p className="text-[14px] font-medium" style={{ color: "#5b616e" }}>
                  {search ? "No customers found" : "No customers yet"}
                </p>
              </div>
            ) : (
              <>
                {items.map((customer) => {
                  const isSelected = selectedCustomer?._id === customer._id;
                  return (
                    <div
                      key={customer._id}
                      className="rounded-[16px] p-4 transition-all"
                      style={{
                        border: `1px solid ${isSelected ? "#0052ff44" : "#dee1e6"}`,
                        background: isSelected ? "#0052ff08" : "#ffffff",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#eef0f3" }}>
                          <span className="text-[15px] font-bold" style={{ color: "#0052ff" }}>
                            {customer.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Info — tap to select */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => { onSelect(customer); handleClose(); }}
                        >
                          <p className="text-[15px] font-semibold leading-tight" style={{ color: "#0a0b0d" }}>{customer.name}</p>
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

                        {/* Edit + Delete + selected check */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(customer); }}
                              className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-all"
                              style={{ background: "#eef0f3" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#dee1e6")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#eef0f3")}
                              title="Edit"
                            >
                              <Pencil className="size-3.5" style={{ color: "#5b616e" }} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(customer); }}
                              className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-all"
                              style={{ background: "#fff0f0" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#ffd5d5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff0f0")}
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" style={{ color: "#e03" }} />
                            </button>
                          </div>
                          {isSelected && (
                            <div className="size-5 rounded-full flex items-center justify-center" style={{ background: "#0052ff" }}>
                              <span className="text-white text-[10px] font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="py-2 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-[13px] text-[#7c828a]">
                      <Loader2 className="size-4 animate-spin text-[#0052ff]" />
                      Loading more...
                    </div>
                  )}
                  {!hasMore && items.length > PAGE_SIZE && (
                    <p className="text-[12px] text-[#a8acb3]">All {items.length} customers loaded</p>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Loading overlay */}
      {actionLoading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#0052ff]" />
        </div>
      )}
    </BottomDrawer>
  );
}
