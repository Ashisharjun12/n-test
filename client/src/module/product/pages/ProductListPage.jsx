import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Search, PackageSearch, Pencil, Trash2, Loader2 } from "lucide-react";
import ProfileMenu from "@/components/shared/ProfileMenu";
import ProductForm from "../components/ProductForm";
import { productApi } from "@/api/product.api";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { useProductList, PRODUCT_PAGE_SIZE } from "../hooks/useProductList";
import { getProductPrice, getProductTaxRate, stripProductApiPayload } from "@/lib/productUtils";

export default function ProductListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
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
    refresh,
  } = useProductList({ enabled: true });

  const openCreate = () => {
    setEditProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditProduct(null);
  };

  const handleSave = async (payload) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      if (editProduct) {
        const id = editProduct._id || editProduct.id;
        const res = await productApi.updateProduct(id, stripProductApiPayload(payload));
        const saved = res.data?.data;
        setItems((prev) => prev.map((p) => ((p._id || p.id) === saved._id ? saved : p)));
      } else {
        const res = await productApi.createProduct({ ...stripProductApiPayload(payload), companyId });
        const saved = res.data?.data;
        setItems((prev) => [saved, ...prev]);
      }
      closeForm();
    } catch (err) {
      console.error(err);
      alert(editProduct ? "Failed to update product" : "Failed to create product");
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
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
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
          <h1 className="text-[28px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0b0d" }}>Products</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#5b616e" }}>
            Manage your catalog before creating quotations
          </p>
        </div>

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

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="size-6 animate-spin text-[#0052ff]" />
              <p className="text-[13px] text-[#7c828a]">Loading products...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#eef0f3" }}>
                <PackageSearch className="size-6" style={{ color: "#a8acb3" }} />
              </div>
              <p className="text-[16px] font-semibold mb-1" style={{ color: "#0a0b0d" }}>
                {search ? "No products found" : "No products yet"}
              </p>
              <p className="text-[14px] mb-6" style={{ color: "#5b616e" }}>
                Add products here so you can pick them quickly in quotations
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="cursor-pointer inline-flex items-center gap-2 px-6 text-[14px] font-semibold text-white"
                style={{ background: "#0052ff", borderRadius: 100, height: 44 }}
              >
                <Plus className="size-4" /> Add Product
              </button>
            </div>
          ) : (
            <>
              {items.map((product) => {
                const pid = product._id || product.id;
                const price = getProductPrice(product);
                const taxRate = getProductTaxRate(product);
                return (
                  <div
                    key={pid}
                    className="flex items-start gap-4 p-5 rounded-[24px] bg-white"
                    style={{ border: "1px solid #dee1e6" }}
                  >
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
                      <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>{product.name}</p>
                      <p className="text-[16px] font-semibold mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0a0b0d" }}>
                        ₹{price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="cursor-pointer size-9 rounded-full flex items-center justify-center"
                        style={{ background: "#eef0f3" }}
                        title="Edit"
                      >
                        <Pencil className="size-4" style={{ color: "#5b616e" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="cursor-pointer size-9 rounded-full flex items-center justify-center"
                        style={{ background: "#fff0f0" }}
                        title="Delete"
                      >
                        <Trash2 className="size-4" style={{ color: "#e03" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={sentinelRef} className="py-2 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-[13px] text-[#7c828a]">
                    <Loader2 className="size-4 animate-spin text-[#0052ff]" />
                    Loading more...
                  </div>
                )}
                {!hasMore && items.length > PRODUCT_PAGE_SIZE && (
                  <p className="text-[12px] text-[#a8acb3]">All {items.length} products loaded</p>
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
          <Plus className="size-5" /> New Product
        </button>
      </div>

      <BottomDrawer open={formOpen} onOpenChange={(v) => !v && closeForm()}>
        <ProductForm
          initialData={editProduct || undefined}
          onBack={closeForm}
          onSave={handleSave}
        />
        {actionLoading && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-[#0052ff]" />
          </div>
        )}
      </BottomDrawer>
    </div>
  );
}
