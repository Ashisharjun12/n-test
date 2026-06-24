import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Minus, Pencil, Trash2, PackageSearch, Loader2 } from "lucide-react";

import ProductForm from "../../product/components/ProductForm";
import { productApi } from "../../../api/product.api";
import useCompanyStore from "../../../store/company.store";
import { BottomDrawer, safeAreaBottom } from "@/components/ui/bottom-drawer";
import {
  getProductPrice,
  getProductTaxRate,
  normalizeProductForQuotation,
  stripProductApiPayload,
} from "@/lib/productUtils";

const PAGE_SIZE = 20;

export default function Products({ open, onOpenChange, selectedProducts, onProductsChange }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [editProduct, setEditProduct] = useState(null);

  // pagination state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const sentinelRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const companyId = useCompanyStore((state) => state.activeCompany?._id);

  // ── Fetch a specific page ──────────────────────────────────────
  const fetchPage = useCallback(async (pageNum, searchTerm, replace = false) => {
    if (!companyId) return;
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const res = await productApi.getProducts(companyId, { page: pageNum, limit: PAGE_SIZE, search: searchTerm });
      const data = res.data?.data;
      setItems((prev) => replace ? (data?.items || []) : [...prev, ...(data?.items || [])]);
      setPage(data?.page ?? pageNum);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to fetch products", err);
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

  // ── Quantities map from selected products ─────────────────────
  const quantities = useMemo(() => {
    const map = {};
    selectedProducts.forEach((p) => { map[p._id || p.id] = p.qty; });
    return map;
  }, [selectedProducts]);

  // ── Handlers ──────────────────────────────────────────────────
  const updateQty = (product, delta) => {
    const pid = product._id || product.id;
    const current = quantities[pid] || 0;
    const newQty = Math.max(0, current + delta);
    const updated = selectedProducts.filter((p) => (p._id || p.id) !== pid);
    if (newQty > 0) updated.push(normalizeProductForQuotation(product, newQty));
    onProductsChange(updated);
  };

  const handleAdd = async (p) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      const res = await productApi.createProduct({ ...stripProductApiPayload(p), companyId });
      const newProduct = res.data?.data;
      setItems((prev) => [newProduct, ...prev]);
      onProductsChange([...selectedProducts, normalizeProductForQuotation(newProduct, 1)]);
      setView("list");
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (product) => {
    const pid = product._id || product.id;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await productApi.deleteProduct(pid);
      setItems((prev) => prev.filter((p) => (p._id || p.id) !== pid));
      onProductsChange(selectedProducts.filter((p) => (p._id || p.id) !== pid));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = (isOpen) => {
    if (isOpen) return;
    setView("list");
    setSearch("");
    onOpenChange(false);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setView("edit");
  };

  const saveEdit = async (updatedProduct) => {
    if (!companyId || !editProduct) return;
    setActionLoading(true);
    try {
      const id = editProduct._id || editProduct.id;
      const res = await productApi.updateProduct(id, { ...stripProductApiPayload(updatedProduct) });
      const savedProduct = res.data?.data;
      setItems((prev) => prev.map((p) => ((p._id || p.id) === savedProduct._id ? savedProduct : p)));
      onProductsChange(
        selectedProducts.map((p) =>
          (p._id || p.id) === savedProduct._id
            ? normalizeProductForQuotation(savedProduct, p.qty)
            : p
        )
      );
      setView("list");
      setEditProduct(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setActionLoading(false);
    }
  };

  const hasMore = page < totalPages;

  return (
    <BottomDrawer open={open} onOpenChange={handleClose}>
      {view === "list" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
            <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Search Products</h2>
          </div>

          {/* Search */}
          <div className="px-5 py-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4" style={{ color: "#5b616e" }} />
              <input
                placeholder="Search products..."
                className="w-full h-[44px] pl-10 pr-4 rounded-[100px] text-[14px] outline-none"
                style={{ background: "#eef0f3", color: "#0a0b0d" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Add product CTA */}
          <div className="px-5 pb-3 shrink-0">
            <button
              onClick={() => setView("add")}
              className="cursor-pointer w-full flex items-center gap-3 p-4 rounded-[16px] transition-all text-[14px] font-medium"
              style={{ border: "1px solid #dee1e6", background: "#ffffff", color: "#0a0b0d" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#0052ff14" }}>
                <Plus className="size-4" style={{ color: "#0052ff" }} />
              </div>
              Add Product
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="size-6 animate-spin text-[#0052ff]" />
                <p className="text-[13px] text-[#7c828a] font-medium">Loading products...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <PackageSearch className="size-10 mb-4" style={{ color: "#a8acb3" }} />
                <p className="text-[14px] font-medium" style={{ color: "#5b616e" }}>
                  {search ? "No products found" : "No products yet"}
                </p>
              </div>
            ) : (
              <>
                {items.map((product) => {
                  const pid = product._id || product.id;
                  const qty = quantities[pid] || 0;
                  const price = getProductPrice(product);
                  const taxRate = getProductTaxRate(product);
                  return (
                    <div
                      key={pid}
                      className="rounded-[16px] p-4 transition-all"
                      style={{
                        border: `1px solid ${qty > 0 ? "#0052ff44" : "#dee1e6"}`,
                        background: qty > 0 ? "#0052ff08" : "#ffffff",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px]" style={{ background: "#eef0f3", color: "#5b616e" }}>
                              {product.unit || "PCS"}
                            </span>
                            {taxRate > 0 && (
                              <span className="text-[12px] font-medium" style={{ color: "#7c828a" }}>
                                GST {taxRate}%
                              </span>
                            )}
                          </div>
                          <p className="text-[15px] font-semibold leading-tight" style={{ color: "#0a0b0d" }}>{product.name}</p>
                          <p className="text-[16px] font-semibold mt-1" style={{ color: "#0a0b0d", fontFamily: "'JetBrains Mono', monospace" }}>
                            ₹{price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={() => updateQty(product, -1)}
                            className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: qty > 0 ? "#eef0f3" : "#ffffff",
                              border: qty > 0 ? "none" : "1px solid #dee1e6",
                              color: qty > 0 ? "#0a0b0d" : "#a8acb3",
                            }}
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-5 text-center text-[15px] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0a0b0d" }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(product, 1)}
                            className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-all"
                            style={{ background: "#0052ff", color: "#ffffff" }}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          onClick={() => openEdit(product)}
                          className="cursor-pointer flex items-center gap-1.5 text-[12px] font-semibold transition-colors text-[#0052ff] hover:text-[#003ecc]"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="cursor-pointer flex items-center gap-1.5 text-[12px] font-semibold transition-colors text-[#e03] hover:text-[#c00]"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
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
                    <p className="text-[12px] text-[#a8acb3]">All {items.length} products loaded</p>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedProducts.length > 0 && (
            <div className={`px-5 pt-3 shrink-0 ${safeAreaBottom}`} style={{ borderTop: "1px solid #dee1e6" }}>
              <button
                className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all"
                style={{ background: "#0052ff", height: 56 }}
                onClick={() => onOpenChange(false)}
              >
                Add {selectedProducts.length} Product{selectedProducts.length > 1 ? "s" : ""}
              </button>
            </div>
          )}
        </>
      )}

      {view === "add" && <ProductForm onBack={() => setView("list")} onSave={handleAdd} />}

      {view === "edit" && editProduct && (
        <ProductForm
          initialData={editProduct}
          onBack={() => { setView("list"); setEditProduct(null); }}
          onSave={saveEdit}
        />
      )}

      {actionLoading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#0052ff]" />
        </div>
      )}
    </BottomDrawer>
  );
}
