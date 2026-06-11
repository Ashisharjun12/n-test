import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Search, Plus, Minus, QrCode, Pencil, PackageSearch, ArrowLeft, ChevronDown, Headphones, Settings2, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import ProductForm from "../../product/components/ProductForm";
import { productApi } from "../../../api/product.api";
import useCompanyStore from "../../../store/company.store";

/* ── Main Products Sheet ─────────────────────────────────────────────── */
export default function Products({ open, onOpenChange, selectedProducts, onProductsChange }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [editProduct, setEditProduct] = useState(null);
  const [localProducts, setLocalProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const companyId = useCompanyStore(state => state.activeCompany?._id);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const res = await productApi.getProducts(companyId);
        setLocalProducts(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      fetchProducts();
    }
  }, [open, companyId]);

  const quantities = useMemo(() => { const map = {}; selectedProducts.forEach((p) => { map[p._id || p.id] = p.qty; }); return map; }, [selectedProducts]);
  const filtered = useMemo(() => { const arr = Array.isArray(localProducts) ? localProducts : []; if (!search.trim()) return arr; const q = search.toLowerCase(); return arr.filter((p) => p.name?.toLowerCase().includes(q) || (p.hsn || "").includes(q)); }, [search, localProducts]);

  const updateQty = (product, delta) => {
    const pid = product._id || product.id;
    const current = quantities[pid] || 0;
    const newQty = Math.max(0, current + delta);
    const updated = selectedProducts.filter((p) => (p._id || p.id) !== pid);
    if (newQty > 0) updated.push({ ...product, qty: newQty });
    onProductsChange(updated);
  };

  const handleAdd = async (p) => { 
    if (!companyId) return;
    setActionLoading(true);
    try {
      const res = await productApi.createProduct({ ...p, companyId });
      const newProduct = res.data?.data;
      setLocalProducts((prev) => [...prev, newProduct]); 
      onProductsChange([...selectedProducts, { ...newProduct, qty: 1 }]); 
      setView("list"); 
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleClose = () => { setView("list"); setSearch(""); onOpenChange(false); };

  const openEdit = (product) => { setEditProduct(product); setView("edit"); };
  
  const saveEdit = async (updatedProduct) => { 
    if (!companyId) return;
    setActionLoading(true);
    try {
      const res = await productApi.updateProduct(updatedProduct._id || updatedProduct.id, { ...updatedProduct, companyId });
      const savedProduct = res.data?.data;
      setLocalProducts((prev) => prev.map((p) => (p._id || p.id) === savedProduct._id ? savedProduct : p)); 
      onProductsChange(selectedProducts.map(p => (p._id || p.id) === savedProduct._id ? { ...savedProduct, qty: p.qty } : p));
      setView("list"); 
      setEditProduct(null); 
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-[24px] h-[92vh] max-h-[92vh] flex flex-col p-0 border-0 overflow-hidden" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
        {view === "list" && (
          <>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: "#dee1e6" }} /></div>
            <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
              <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Search Products</h2>
            </div>

            <div className="px-5 py-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4" style={{ color: "#5b616e" }} />
                <input placeholder="Search products or HSN..." className="w-full h-[44px] pl-10 pr-4 rounded-[100px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="px-5 pb-3 shrink-0">
              <button onClick={() => setView("add")} className="cursor-pointer w-full flex items-center gap-3 p-4 rounded-[16px] transition-all text-[14px] font-medium" style={{ border: "1px solid #dee1e6", background: "#ffffff", color: "#0a0b0d" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
                <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#0052ff14" }}><Plus className="size-4" style={{ color: "#0052ff" }} /></div> Add Product
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <Loader2 className="size-6 animate-spin text-[#0052ff]" />
                  <p className="text-[13px] text-[#7c828a] font-medium">Loading products...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <PackageSearch className="size-10 mb-4" style={{ color: "#a8acb3" }} />
                  <p className="text-[14px] font-medium" style={{ color: "#5b616e" }}>No products found</p>
                </div>
              ) : (
                (Array.isArray(filtered) ? filtered : []).map((product) => {
                  const pid = product._id || product.id;
                  const qty = quantities[pid] || 0;
                  return (
                    <div key={pid} className="rounded-[16px] p-4 transition-all" style={{ border: `1px solid ${qty > 0 ? "#0052ff44" : "#dee1e6"}`, background: qty > 0 ? "#0052ff08" : "#ffffff" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px]" style={{ background: "#eef0f3", color: "#5b616e" }}>{product.unit || "PCS"}</span>
                            {(product.gst > 0 || product.taxRate > 0) && <span className="text-[12px] font-medium" style={{ color: "#7c828a" }}>GST {product.gst || product.taxRate}%</span>}
                          </div>
                          <p className="text-[15px] font-semibold leading-tight" style={{ color: "#0a0b0d" }}>{product.name}</p>
                          <p className="text-[16px] font-semibold mt-1" style={{ color: "#0a0b0d", fontFamily: "'JetBrains Mono', monospace" }}>₹{(product.price || product.sellingPrice || 0).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <button onClick={() => updateQty(product, -1)} className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-all" style={{ background: qty > 0 ? "#eef0f3" : "#ffffff", border: qty > 0 ? "none" : "1px solid #dee1e6", color: qty > 0 ? "#0a0b0d" : "#a8acb3" }} onMouseEnter={e=>qty > 0 && (e.currentTarget.style.background="#dee1e6")} onMouseLeave={e=>qty > 0 && (e.currentTarget.style.background="#eef0f3")}><Minus className="size-4" /></button>
                          <span className="w-5 text-center text-[15px] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0a0b0d" }}>{qty}</span>
                          <button onClick={() => updateQty(product, 1)} className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-all" style={{ background: "#0052ff", color: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#003ecc"} onMouseLeave={e=>e.currentTarget.style.background="#0052ff"}><Plus className="size-4" /></button>
                        </div>
                      </div>
                      <button onClick={() => openEdit(product)} className="cursor-pointer mt-3 flex items-center gap-1.5 text-[12px] font-semibold transition-colors" style={{ color: "#0052ff" }} onMouseEnter={e=>e.currentTarget.style.color="#003ecc"} onMouseLeave={e=>e.currentTarget.style.color="#0052ff"}><Pencil className="size-3" /> Edit</button>
                    </div>
                  );
                })
              )}
            </div>

            {selectedProducts.length > 0 && (
              <div className="px-5 pb-6 pt-3 shrink-0" style={{ borderTop: "1px solid #dee1e6" }}>
                <button className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all" style={{ background: "#0052ff", height: 56 }} onClick={() => onOpenChange(false)} onMouseEnter={e=>e.currentTarget.style.background="#003ecc"} onMouseLeave={e=>e.currentTarget.style.background="#0052ff"}>Add {selectedProducts.length} Product{selectedProducts.length > 1 ? "s" : ""}</button>
              </div>
            )}
          </>
        )}

        {/* ── Add View ── */}
        {view === "add" && <ProductForm onBack={() => setView("list")} onSave={handleAdd} />}

        {/* ── Edit View ── */}
        {view === "edit" && editProduct && (
          <ProductForm initialData={editProduct} onBack={() => { setView("list"); setEditProduct(null); }} onSave={saveEdit} />
        )}

        {/* Loading Overlay for Actions */}
        {actionLoading && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-[#0052ff]" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
