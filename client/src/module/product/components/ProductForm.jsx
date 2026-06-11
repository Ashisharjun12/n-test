import { useState, useEffect } from "react";
import { ArrowLeft, Settings2, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import FieldEditModal from "./FieldEditModal";
import CategorySelectModal from "./CategorySelectModal";
import ProductSettings from "./ProductSettings";
import TaxRateModal from "./TaxRateModal";
import { uploadApi } from "../../../api/upload.api";
import { productApi } from "../../../api/product.api";
import useCompanyStore from "../../../store/company.store";
import { ImagePlus, X, Loader2 } from "lucide-react";

const UNITS = ["PCS", "BOX", "KG", "MTR", "LTR", "OTH", "NOS", "SET", "CAN", "DZN"];

const FieldRow = ({ label, value, onClick, prefix = "Add ", suffixIcon = null }) => (
  <div onClick={onClick} className="flex items-center justify-between py-3 cursor-pointer group">
    <span className="text-[14px] font-semibold text-[#0a0b0d]">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`text-[14px] ${value ? "text-[#0a0b0d] line-clamp-1 max-w-[150px] text-right" : "text-[#7c828a]"}`}>
        {value || `${prefix}${label}`}
      </span>
      {suffixIcon && <div className="text-[#a8acb3] group-hover:text-[#0052ff] transition-colors">{suffixIcon}</div>}
    </div>
  </div>
);

const ToggleRow = ({ label, checked, onChange, subtitle }) => (
  <div className="flex items-center justify-between py-3 cursor-pointer transition-all" onClick={() => onChange(!checked)}>
    <div className="flex flex-col">
      <span className="text-[14px] font-semibold text-[#0a0b0d]">{label}</span>
      {subtitle && <span className="text-[12px] mt-0.5 text-[#7c828a]">{subtitle}</span>}
    </div>
    <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-[#0052ff]' : 'bg-[#d1d5db]'}`}>
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

const FloatingInput = ({ value, onChange, placeholder, type = "text", prefix, max, suffixIcon, suffixAction, readOnly, onClick }) => {
  const isActive = value !== undefined && value !== "";
  
  return (
    <div className="relative w-full" onClick={onClick}>
      {isActive && (
        <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10 transition-all">
          {placeholder}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5b616e] font-medium">
            {prefix}
          </div>
        )}
        <input
          type={type}
          min={type === "number" ? "0" : undefined}
          max={max}
          placeholder={!isActive ? placeholder : ""}
          value={value}
          readOnly={readOnly}
          onKeyDown={(e) => {
            if (readOnly) {
              e.preventDefault();
              return;
            }
            if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+")) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            let val = e.target.value;
            if (type === "number" && val !== "") {
              if (parseFloat(val) < 0) val = "0";
              if (max !== undefined && parseFloat(val) > max) val = max.toString();
            }
            onChange(val);
          }}
          onBlur={(e) => {
            let val = e.target.value;
            if (type === "number" && val !== "") {
              if (parseFloat(val) < 0) val = "0";
              if (max !== undefined && parseFloat(val) > max) val = max.toString();
              onChange(val);
            }
          }}
          className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all px-4 ${
            isActive ? "border-[#0052ff] bg-white" : "border-transparent bg-[#eef0f3]"
          } ${readOnly ? "cursor-pointer" : ""}`}
          style={{
            paddingLeft: prefix ? "32px" : "16px",
            paddingRight: suffixIcon ? "90px" : "16px",
            border: isActive ? "1px solid #0052ff" : "1px solid transparent",
            color: "#0a0b0d",
          }}
        />
        {suffixIcon && (
          <button
            type="button"
            onClick={suffixAction}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[13px] font-medium text-[#5b616e] hover:text-[#0a0b0d] bg-[#f7f7f7] border border-[#dee1e6] px-2 py-1 rounded-[6px] transition-colors"
          >
            {suffixIcon}
          </button>
        )}
      </div>
    </div>
  );
};

export default function ProductForm({ initialData, onBack, onSave }) {
  const isEdit = !!initialData;
  const [type, setType] = useState(initialData?.type || "product"); // 'product' | 'service' | 'other'
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [taxModalOpen, setTaxModalOpen] = useState(null); // 'sellingTaxType' | 'purchaseTaxType' | null
  const [taxRateModalOpen, setTaxRateModalOpen] = useState(false);
  const companyId = useCompanyStore((state) => state.activeCompany?._id);
  const [maxDiscountLimit, setMaxDiscountLimit] = useState(100);
  
  const [form, setForm] = useState({
    name: "",
    sellingPrice: "",
    taxRate: "0",
    purchasePrice: "",
    unit: "",
    description: "",
    category: "",
    categoryName: "",
    cess: "",
    discount: "",
    amount: "",
    openingStockQty: "",
    openingPurchasePrice: "",
    lowStockAlert: "",
    images: [],
    notforsale: false,
    sellingTaxType: "inclusive",
    purchaseTaxType: "inclusive",
    gst: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        sellingPrice: initialData.sellingPrice?.toString() || initialData.price?.toString() || "",
        taxRate: initialData.taxRate?.toString() || initialData.gst?.toString() || "0",
        purchasePrice: initialData.purchasePrice?.toString() || "",
        unit: initialData.unit || "",
        description: initialData.description || "",
        category: initialData.category?._id || initialData.categoryId || initialData.category || "",
        categoryName: initialData.category?.name || initialData.categoryName || "",
        cess: initialData.cess?.toString() || "",
        discount: initialData.discount?.toString() || "",
        amount: initialData.amount?.toString() || "",
        openingStockQty: initialData.openingStock?.quantity?.toString() || initialData.stock?.toString() || "",
        openingPurchasePrice: initialData.openingStock?.purchasePrice?.toString() || initialData.purchasePrice?.toString() || "",
        lowStockAlert: initialData.lowStockAlert?.toString() || "",
        images: initialData.images || [],
        notforsale: initialData.notforsale || false,
        sellingTaxType: initialData.sellingTaxType || "inclusive",
        purchaseTaxType: initialData.purchaseTaxType || "inclusive",
        gst: initialData.gst || ""
      });
      setType(initialData.type || "product");
    }
    
    if (companyId) {
      // Fetch default settings for new product
      productApi.getSettings(companyId)
        .then(res => {
          const d = res.data?.data;
          if (d) {
            const mDiscount = d.maxDiscount ? parseFloat(d.maxDiscount) : 100;
            setMaxDiscountLimit(mDiscount);

            if (!initialData) {
              setForm(f => ({
                ...f,
                category: d.defaultCategory?._id || d.defaultCategory || "",
                categoryName: d.defaultCategory?.name || "",
                unit: d.defaultUnit || "PCS",
                discount: f.discount ? Math.min(parseFloat(f.discount), mDiscount).toString() : f.discount,
                taxRate: d.defaultPricePreference === "inclusive" ? f.taxRate : "0" // Just as an example, but let's set some defaults
              }));
              setType(d.defaultType || "product");
            } else {
              setForm(f => {
                const currentDiscount = parseFloat(f.discount);
                if (!isNaN(currentDiscount) && currentDiscount > mDiscount) {
                  return { ...f, discount: mDiscount.toString() };
                }
                return f;
              });
            }
          }
        })
        .catch(err => console.error("Error fetching product defaults:", err));
    }
  }, [initialData, companyId]);

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  
  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({
      id: initialData?.id || initialData?._id || `P${Date.now()}`,
      name: form.name,
      type,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      taxRate: parseFloat(form.taxRate) || 0,
      cess: parseFloat(form.cess) || 0,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      discount: Math.min(parseFloat(form.discount) || 0, maxDiscountLimit),
      amount: parseFloat(form.amount) || 0,
      unit: form.unit || "PCS",
      description: form.description,
      categoryId: form.category,
      openingStock: {
        quantity: parseFloat(form.openingStockQty) || 0,
        purchasePrice: parseFloat(form.openingPurchasePrice) || parseFloat(form.purchasePrice) || 0,
        stockValue: (parseFloat(form.openingStockQty) || 0) * (parseFloat(form.openingPurchasePrice) || parseFloat(form.purchasePrice) || 0)
      },
      lowStockAlert: parseFloat(form.lowStockAlert) || 0,

      // Compatibility for older components (like Quotation)
      price: parseFloat(form.sellingPrice) || 0,
      gst: form.gst || "",
      taxRate: parseFloat(form.taxRate) || 0,
      stock: parseFloat(form.openingStockQty) || initialData?.stock || 0,
      
      // Uploaded Image IDs
      images: form.images.map(img => img._id || img),
      notforsale: form.notforsale,
      sellingTaxType: form.sellingTaxType,
      purchaseTaxType: form.purchaseTaxType
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const record = await uploadApi.uploadFile(file, "products");
      update("images", [...form.images, record]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Make sure Cloudinary/R2 is configured properly.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    update("images", newImages);
  };

  if (showSettings) {
    return <ProductSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
        <button onClick={onBack} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-[16px] font-semibold flex-1 text-[#0a0b0d]">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d] bg-[#eef0f3] md:bg-transparent p-2 md:p-0 rounded-full md:rounded-none"
        >
          <Settings2 className="size-5" />
          <span className="hidden md:inline text-[14px] font-medium">Settings</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">Product Details</h3>
          <div className="flex flex-col gap-4 p-4 rounded-[24px] border border-[#dee1e6]">
            
            <div className="flex gap-4 flex-wrap">
              {["product", "service"].map((t) => (
                <label key={t} onClick={() => setType(t)} className="cursor-pointer flex items-center gap-2 text-[14px] font-medium text-[#0a0b0d] capitalize">
                  <div className="size-5 rounded-full flex items-center justify-center transition-all" style={{ border: `2px solid ${type === t ? "#0052ff" : "#dee1e6"}` }}>
                    {type === t && <div className="size-2.5 rounded-full bg-[#0052ff]" />}
                  </div> {t}
                </label>
              ))}
            </div>

            <FloatingInput value={form.name} onChange={(v) => update("name", v)} placeholder={type === "service" ? "Service Name *" : "Product Name *"} />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FloatingInput 
                  value={form.sellingPrice} 
                  onChange={(v) => update("sellingPrice", v)} 
                  placeholder="Selling Price" 
                  type="number" 
                  prefix="₹" 
                  suffixIcon={<>{form.sellingTaxType === "inclusive" ? "With Tax" : "Without Tax"} <ChevronDown className="size-4" /></>}
                  suffixAction={() => setTaxModalOpen("sellingTaxType")}
                />
                <p className="text-[11px] mt-1.5 px-1 text-[#7c828a]">{form.sellingTaxType === "inclusive" ? "Inclusive of taxes" : "Exclusive of taxes"}</p>
              </div>
              <FloatingInput 
                value={form.taxRate !== "" && form.taxRate !== null && form.taxRate !== undefined ? `${form.taxRate}%` : ""} 
                onChange={() => {}} 
                placeholder="Tax rate" 
                type="text" 
                readOnly={true}
                onClick={() => setTaxRateModalOpen(true)}
                suffixIcon={<ChevronDown className="size-4" />}
                suffixAction={() => setTaxRateModalOpen(true)}
              />
            </div>

            {form.gst ? (
              <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#0052ff] bg-[#f0f5ff]">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#0052ff] font-medium">GSTIN Validated</span>
                  <span className="text-[14px] font-semibold text-[#0a0b0d]">{form.gst}</span>
                </div>
                <button onClick={() => setActiveField("gst")} className="text-[13px] font-medium text-[#0052ff] hover:underline cursor-pointer">
                  Change
                </button>
              </div>
            ) : (
              <button onClick={() => setActiveField("gst")} className="cursor-pointer flex items-center gap-2 text-[13px] font-semibold transition-colors w-fit text-[#0052ff] hover:text-[#003ecc]">
                <div className="size-5 rounded-full flex items-center justify-center text-[16px] font-bold border-2 border-[#0052ff]">⊕</div> Enter GSTIN to add/change Tax
              </button>
            )}

            <div>
              <FloatingInput 
                value={form.purchasePrice} 
                onChange={(v) => update("purchasePrice", v)} 
                placeholder="Purchase Price" 
                type="number" 
                prefix="₹" 
                suffixIcon={<>{form.purchaseTaxType === "inclusive" ? "With Tax" : "Without Tax"} <ChevronDown className="size-4" /></>}
                suffixAction={() => setTaxModalOpen("purchaseTaxType")}
              />
              <p className="text-[11px] mt-1.5 px-1 text-[#7c828a]">{form.purchaseTaxType === "inclusive" ? "Inclusive of taxes" : "Exclusive of taxes"}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold mb-3 text-[#0a0b0d]">Units</h3>
          <div className="p-4 rounded-[24px] border border-[#dee1e6]">
            <div className="relative rounded-[12px] overflow-hidden bg-[#eef0f3] h-[48px]">
              <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="cursor-pointer w-full h-full px-4 text-[14px] appearance-none outline-none bg-transparent text-[#0a0b0d]">
                <option value="">Select Unit</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none text-[#5b616e]" />
            </div>
          </div>
        </div>

        <button onClick={() => setOptionalOpen(!optionalOpen)} className="cursor-pointer w-full flex items-center justify-between p-4 rounded-[24px] transition-all border border-[#dee1e6] bg-white hover:bg-[#f7f7f7]">
          <div className="text-left">
            <p className="text-[14px] font-semibold text-[#0a0b0d]">Optional Fields</p>
            <p className="text-[12px] mt-0.5 text-[#7c828a]">Description, Category, Stock, Not For Sale</p>
          </div>
          {optionalOpen ? <ChevronUp className="size-5 text-[#a8acb3]" /> : <ChevronDown className="size-5 text-[#a8acb3]" />}
        </button>

        {optionalOpen && (
          <div className="flex flex-col p-4 rounded-[24px] -mt-3 border border-[#dee1e6]">
            <div className="flex flex-col">
              <FieldRow label="Category" prefix="Select " value={form.categoryName || (form.category ? "Selected" : "")} onClick={() => setActiveField("category")} suffixIcon={<ChevronRight className="size-4" />} />
              <div className="h-[1px] bg-[#dee1e6] w-full my-1" />
              <FieldRow label="Description" value={form.description} onClick={() => setActiveField("description")} suffixIcon={<ChevronRight className="size-4" />} />
              <div className="h-[1px] bg-[#dee1e6] w-full my-1" />
              
              <div className="flex flex-col py-3">
                <span className="text-[14px] font-semibold text-[#0a0b0d] mb-2">Product Images</span>
                {/* Image Previews */}
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-[12px] border border-[#dee1e6] overflow-hidden group">
                        <img src={img.url || img} alt="Product" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500 cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Upload Button */}
                <label className="cursor-pointer flex items-center justify-center gap-2 w-full h-[48px] rounded-[12px] border border-dashed border-[#a8acb3] bg-[#fcfcfc] text-[#5b616e] text-[13px] font-medium hover:border-[#0052ff] hover:text-[#0052ff] transition-all">
                  {isUploading ? (
                    <><Loader2 className="size-4 animate-spin" /> Uploading to cloud...</>
                  ) : (
                    <><ImagePlus className="size-4" /> Add Product Images</>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
              <div className="h-[1px] bg-[#dee1e6] w-full my-1" />
              
              <ToggleRow label="Not For Sale" checked={form.notforsale} onChange={(v) => update("notforsale", v)} subtitle={form.notforsale ? "Disable to prevent this item from being sold" : undefined} />
              <div className="h-[1px] bg-[#dee1e6] w-full my-1" />
              
              <button onClick={() => setMoreDetailsOpen(true)} className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#7c828a] py-3 cursor-pointer hover:text-[#0a0b0d] transition-colors w-full text-center">
                ... Add more details
              </button>
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>

      <div className="px-5 pb-6 pt-3 shrink-0 border-t border-[#dee1e6] bg-white relative z-10">
        <button className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all disabled:opacity-50 bg-[#0052ff] hover:bg-[#003ecc] h-14" 
          onClick={handleSubmit} disabled={!form.name.trim()}>
          {isEdit ? "Save Changes" : "Add Product"}
        </button>
      </div>

      {activeField === "description" && (
        <FieldEditModal title="Description" placeholder="Enter product description" initialValue={form.description} type="textarea" onClose={() => setActiveField(null)} onSave={(val) => { update("description", val); setActiveField(null); }} />
      )}
      {activeField === "category" && (
        <CategorySelectModal 
          onClose={() => setActiveField(null)} 
          onSelect={(cat) => { 
            update("category", cat._id); 
            update("categoryName", cat.name); 
            setActiveField(null); 
          }} 
        />
      )}
      {activeField === "gst" && (
        <FieldEditModal 
          title="GSTIN" 
          placeholder="Enter GSTIN" 
          initialValue={form.gst} 
          onClose={() => setActiveField(null)} 
          onSave={async (val) => { 
            // Optional: You could call verifyGSTIN API here before saving
            update("gst", val); 
            setActiveField(null); 
          }} 
        />
      )}

      {/* Tax Rate Modal */}
      {taxRateModalOpen && (
        <TaxRateModal
          currentRate={form.taxRate}
          onClose={() => setTaxRateModalOpen(false)}
          onSelect={(rate) => update("taxRate", rate)}
        />
      )}

      {/* Tax Type Modal */}
      {taxModalOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[24px] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-[18px] font-bold text-[#0a0b0d]">Tax Type</h2>
              <button onClick={() => setTaxModalOpen(null)} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
                <X className="size-6" />
              </button>
            </div>
            <div className="px-5 py-2 flex flex-col gap-2">
              {[
                { label: "With Tax", value: "inclusive" },
                { label: "Without Tax", value: "exclusive" }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    update(taxModalOpen, opt.value);
                    setTaxModalOpen(null);
                  }}
                  className="flex items-center gap-3 py-3 w-full text-left cursor-pointer"
                >
                  <div className={`size-5 rounded-full flex items-center justify-center transition-all ${form[taxModalOpen] === opt.value ? 'border-2 border-[#0052ff]' : 'border-2 border-[#dee1e6]'}`}>
                    {form[taxModalOpen] === opt.value && <div className="size-2.5 rounded-full bg-[#0052ff]" />}
                  </div>
                  <span className="text-[15px] font-medium text-[#0a0b0d]">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* More Details Modal */}
      {moreDetailsOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#f7f7f7] animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0 bg-white" style={{ borderBottom: "1px solid #dee1e6" }}>
            <h2 className="text-[18px] font-bold text-[#0a0b0d]">More Details</h2>
            <button onClick={() => setMoreDetailsOpen(false)} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
              <X className="size-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput value={form.discount} onChange={(v) => update("discount", v)} placeholder={`Discount (%) - Max ${maxDiscountLimit}%`} type="number" max={maxDiscountLimit} />
              <FloatingInput value={form.amount} onChange={(v) => update("amount", v)} placeholder="Amount" type="number" />
            </div>
            
            <FloatingInput value={form.cess} onChange={(v) => update("cess", v)} placeholder="Cess %" type="number" max={100} />
            
                <div>
                  <FloatingInput value={form.lowStockAlert} onChange={(v) => update("lowStockAlert", v)} placeholder="Low Stock Alert at" type="number" />
                  <p className="text-[11px] text-[#7c828a] mt-1.5 px-1 leading-snug">You will be notified once the stock reaches the minimum stock qty. (BETA)</p>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[14px] font-semibold text-[#0052ff]">Opening Stock</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#eef0f3] text-[#5b616e]">Optional</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <FloatingInput value={form.openingStockQty} onChange={(v) => update("openingStockQty", v)} placeholder="Opening Quantity" type="number" />
                  <FloatingInput value={form.openingPurchasePrice} onChange={(v) => update("openingPurchasePrice", v)} placeholder="Opening Purchase Price (per unit with tax)" type="number" />
                  <FloatingInput 
                    value={form.openingStockQty && form.openingPurchasePrice ? (parseFloat(form.openingStockQty) * parseFloat(form.openingPurchasePrice)).toString() : ""} 
                    onChange={() => {}} 
                    placeholder="Opening Stock Value (with tax)" 
                    type="number" 
                  />
                </div>
          </div>
          <div className="px-5 pb-6 pt-3 shrink-0 bg-white border-t border-[#dee1e6]">
            <button 
              onClick={() => setMoreDetailsOpen(false)}
              className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all bg-[#0052ff] hover:bg-[#003ecc] h-14"
            >
              Save Product Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
