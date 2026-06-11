import { useState, useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import customersData from "../data/customers.json";
import {
  Search, UserPlus, Plus, ChevronDown, Phone,
  Building2, X, ArrowLeft, Users, Headphones, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal",
];

/* ── Enter Address Sheet ─────────────────────────────────────────────── */
function AddressSheet({ open, onClose, value, onChange, title }) {
  const [form, setForm] = useState(
    value || { title: "", addressLine1: "", addressLine2: "", pincode: "", city: "", state: "", country: "India", notes: "" }
  );

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const handleSave = () => { onChange(form); onClose(); };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[24px] max-h-[90vh] flex flex-col p-0 border-0 overflow-hidden" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
          <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Enter Address</h2>
          <button onClick={onClose} className="cursor-pointer transition-colors" style={{ color: "#7c828a" }} onMouseEnter={e=>e.currentTarget.style.color="#0a0b0d"} onMouseLeave={e=>e.currentTarget.style.color="#7c828a"}><X className="size-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          <input placeholder="Title" value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
          <button className="cursor-pointer text-left text-[13px] font-semibold transition-colors" style={{ color: "#0052ff" }}>Autofill Company Name</button>
          <input placeholder="Address Line 1 *" value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
          <input placeholder="Address Line 2" value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
          <div className="flex gap-0 rounded-[12px] overflow-hidden" style={{ background: "#eef0f3" }}>
            <input placeholder="Pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className="flex-1 h-[48px] px-4 text-[14px] outline-none bg-transparent" maxLength={6} style={{ color: "#0a0b0d" }} />
            <button className="cursor-pointer px-5 text-[14px] font-semibold text-white transition-colors" style={{ background: "#0052ff" }} onMouseEnter={e=>e.currentTarget.style.background="#003ecc"} onMouseLeave={e=>e.currentTarget.style.background="#0052ff"}>Fetch Details</button>
          </div>
          <input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
          <div className="relative">
            <select value={form.state} onChange={(e) => update("state", e.target.value)} className="cursor-pointer w-full h-[48px] px-4 rounded-[12px] text-[14px] appearance-none outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }}>
              <option value="">State *</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: "#5b616e" }} />
          </div>
          <input placeholder="Country" value={form.country} onChange={(e) => update("country", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
          <input placeholder="Notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
        </div>

        <div className="px-5 pb-6 pt-3 shrink-0">
          <button className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all" style={{ background: "#0052ff", height: 56 }} onClick={handleSave} onMouseEnter={e=>e.currentTarget.style.background="#003ecc"} onMouseLeave={e=>e.currentTarget.style.background="#0052ff"}>Save &amp; Update</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Add Customer Form ───────────────────────────────────────────────── */
function AddCustomerForm({ onBack, onAdd }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", gstin: "", companyName: "", billingAddress: null, shippingAddress: null, sameAsBilling: false });
  const [showBilling, setShowBilling] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const handleSubmit = () => { if (!form.name.trim()) return; onAdd({ id: `C${Date.now()}`, ...form, shippingAddress: form.sameAsBilling ? form.billingAddress : form.shippingAddress }); };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
        <button onClick={onBack} className="cursor-pointer transition-colors" style={{ color: "#5b616e" }} onMouseEnter={e=>e.currentTarget.style.color="#0a0b0d"} onMouseLeave={e=>e.currentTarget.style.color="#5b616e"}><ArrowLeft className="size-5" /></button>
        <h2 className="text-[16px] font-semibold flex-1" style={{ color: "#0a0b0d" }}>Add Customer</h2>
        <span className="text-[14px] font-semibold cursor-pointer" style={{ color: "#0052ff" }}>Import ↓</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        <div>
          <h3 className="text-[14px] font-semibold mb-3" style={{ color: "#0a0b0d" }}>Basic Details</h3>
          <div className="flex flex-col gap-3 p-4 rounded-[24px]" style={{ border: "1px solid #dee1e6" }}>
            <input placeholder="Name *" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
            <div className="flex items-center gap-0 rounded-[12px] overflow-hidden" style={{ background: "#eef0f3" }}>
              <div className="flex items-center gap-2 px-4 h-[48px] cursor-pointer hover:bg-black/5 transition-colors" style={{ borderRight: "1px solid #dee1e6" }}>
                <span className="text-[16px]">🇮🇳</span>
                <span className="text-[13px] font-medium" style={{ color: "#5b616e" }}>IN +91</span>
                <ChevronDown className="size-4" style={{ color: "#5b616e" }} />
              </div>
              <input type="tel" placeholder="Enter Phone Number" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="flex-1 h-[48px] px-4 text-[14px] outline-none bg-transparent" style={{ color: "#0a0b0d" }} />
            </div>
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold mb-3" style={{ color: "#0a0b0d" }}>Company Details <span style={{ color: "#7c828a", fontWeight: 400 }}>(Optional)</span></h3>
          <div className="flex flex-col gap-3 p-4 rounded-[24px]" style={{ border: "1px solid #dee1e6" }}>
            <div>
              <div className="flex rounded-[12px] overflow-hidden" style={{ background: "#eef0f3" }}>
                <input placeholder="GST Number (e.g. 22AAAA...)" value={form.gstin} onChange={(e) => update("gstin", e.target.value.toUpperCase())} className="flex-1 h-[48px] px-4 text-[14px] outline-none bg-transparent" maxLength={15} style={{ color: "#0a0b0d" }} />
                <button className="cursor-pointer px-5 text-[13px] font-semibold text-white transition-colors" style={{ background: "#0052ff" }} onMouseEnter={e=>e.currentTarget.style.background="#003ecc"} onMouseLeave={e=>e.currentTarget.style.background="#0052ff"}>Fetch Details</button>
              </div>
              <p className="text-[11px] mt-1.5 px-1" style={{ color: "#7c828a" }}>Entering the GSTIN will automatically fetch the company details</p>
            </div>
            <div>
              <input placeholder="Company Name" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className="w-full h-[48px] px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
              <p className="text-[11px] mt-1.5 px-1" style={{ color: "#7c828a" }}>eg. Tata Motors Private Limited</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold mb-3" style={{ color: "#0a0b0d" }}>Billing Address <span style={{ color: "#7c828a", fontWeight: 400 }}>(Optional)</span></h3>
          <button onClick={() => setShowBilling(true)} className="cursor-pointer w-full flex items-center gap-3 p-3.5 rounded-[16px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
            <div className="size-8 rounded-full flex items-center justify-center text-[16px] font-bold" style={{ border: "2px solid #0052ff", color: "#0052ff" }}>⊕</div>
            <span className="text-[14px] font-medium" style={{ color: form.billingAddress ? "#0a0b0d" : "#5b616e" }}>{form.billingAddress ? (form.billingAddress.addressLine1 || form.billingAddress.city) : "Billing Address"}</span>
          </button>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold mb-3" style={{ color: "#0a0b0d" }}>Shipping Address <span style={{ color: "#7c828a", fontWeight: 400 }}>(Optional)</span></h3>
          <div className="flex flex-col gap-3">
            <button onClick={() => !form.sameAsBilling && setShowShipping(true)} className="cursor-pointer w-full flex items-center gap-3 p-3.5 rounded-[16px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff", opacity: form.sameAsBilling ? 0.5 : 1 }} onMouseEnter={e=>!form.sameAsBilling && (e.currentTarget.style.background="#f7f7f7")} onMouseLeave={e=>!form.sameAsBilling && (e.currentTarget.style.background="#ffffff")} disabled={form.sameAsBilling}>
              <div className="size-8 rounded-full flex items-center justify-center text-[16px] font-bold" style={{ border: "2px solid #0052ff", color: "#0052ff" }}>⊕</div>
              <span className="text-[14px] font-medium" style={{ color: (form.shippingAddress && !form.sameAsBilling) ? "#0a0b0d" : "#5b616e" }}>{(form.shippingAddress && !form.sameAsBilling) ? (form.shippingAddress.addressLine1 || form.shippingAddress.city) : "Shipping Address"}</span>
            </button>
            <label className="flex items-center gap-2 px-1 cursor-pointer w-max select-none">
              <div className="relative size-4 rounded-[4px] flex items-center justify-center transition-all" style={{ border: `1px solid ${form.sameAsBilling ? "#0052ff" : "#dee1e6"}`, background: form.sameAsBilling ? "#0052ff" : "#ffffff" }}>
                <input type="checkbox" checked={form.sameAsBilling} onChange={(e) => update("sameAsBilling", e.target.checked)} className="sr-only" />
                {form.sameAsBilling && <span className="text-white text-[9px] font-bold">✓</span>}
              </div>
              <span className="text-[13px] font-medium" style={{ color: "#5b616e" }}>Same as Billing?</span>
            </label>
          </div>
        </div>

        <button className="cursor-pointer w-full flex items-center justify-between p-4 rounded-[16px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
          <div className="text-left">
            <p className="text-[14px] font-medium" style={{ color: "#0a0b0d" }}>Customer Preferences</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#7c828a" }}>Discount, Price list, Credit Limit, TDS, TCS, Due Date</p>
          </div>
          <ChevronDown className="size-4" style={{ color: "#a8acb3" }} />
        </button>
        <button className="cursor-pointer w-full flex items-center justify-between p-4 rounded-[16px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
          <div className="text-left">
            <p className="text-[14px] font-medium" style={{ color: "#0a0b0d" }}>Other Details</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#7c828a" }}>Opening balance, Notes, CC Emails, Tags, Custom Fields</p>
          </div>
          <ChevronDown className="size-4" style={{ color: "#a8acb3" }} />
        </button>

        <div className="h-4" />
      </div>

      <div className="px-5 pb-6 pt-3 shrink-0" style={{ borderTop: "1px solid #dee1e6" }}>
        <button className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all disabled:opacity-50" style={{ background: "#0052ff", height: 56 }} onClick={handleSubmit} disabled={!form.name.trim()} onMouseEnter={e=>!e.currentTarget.disabled && (e.currentTarget.style.background="#003ecc")} onMouseLeave={e=>!e.currentTarget.disabled && (e.currentTarget.style.background="#0052ff")}>Add Customer</button>
      </div>

      <AddressSheet open={showBilling} onClose={() => setShowBilling(false)} value={form.billingAddress} onChange={(addr) => update("billingAddress", addr)} title="Billing Address" />
      <AddressSheet open={showShipping} onClose={() => setShowShipping(false)} value={form.shippingAddress} onChange={(addr) => update("shippingAddress", addr)} title="Shipping Address" />
    </div>
  );
}

/* ── Main Customers Sheet ────────────────────────────────────────────── */
export default function Customers({ open, onOpenChange, selectedCustomer, onSelect }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [localCustomers, setLocalCustomers] = useState(customersData);

  const filtered = useMemo(() => {
    if (!search.trim()) return localCustomers;
    const q = search.toLowerCase();
    return localCustomers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.companyName || "").toLowerCase().includes(q));
  }, [search, localCustomers]);

  const handleAdd = (c) => { setLocalCustomers(p => [...p, c]); onSelect(c); setView("list"); onOpenChange(false); };
  const handleClose = () => { setView("list"); setSearch(""); onOpenChange(false); };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-[24px] h-[92vh] max-h-[92vh] flex flex-col p-0 border-0 overflow-hidden" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
        {view === "list" ? (
          <>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "#dee1e6" }} />
            </div>
            <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
              <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Select Customer</h2>
              <button onClick={() => setView("add")} className="cursor-pointer flex items-center gap-1.5 text-[14px] font-semibold transition-colors" style={{ color: "#0052ff" }} onMouseEnter={e=>e.currentTarget.style.color="#003ecc"} onMouseLeave={e=>e.currentTarget.style.color="#0052ff"}>
                <UserPlus className="size-4" /> New
              </button>
            </div>

            <div className="px-5 py-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4" style={{ color: "#5b616e" }} />
                <input placeholder="Search by name, phone, company..." className="w-full h-[44px] pl-10 pr-4 rounded-[100px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-2">
              <button onClick={() => setView("add")} className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-[16px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
                <div className="size-10 rounded-full flex items-center justify-center" style={{ background: "#0052ff14" }}><UserPlus className="size-5" style={{ color: "#0052ff" }} /></div>
                <div className="text-left">
                  <p className="text-[14px] font-semibold" style={{ color: "#0a0b0d" }}>Add New Customer</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#7c828a" }}>Create a new customer profile</p>
                </div>
              </button>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Users className="size-10 mb-4" style={{ color: "#a8acb3" }} />
                  <p className="text-[14px] font-medium" style={{ color: "#5b616e" }}>No customers found</p>
                </div>
              ) : (
                filtered.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id;
                  return (
                    <button key={customer.id} onClick={() => { onSelect(customer); handleClose(); }} className="cursor-pointer w-full flex items-start gap-4 p-4 rounded-[16px] text-left transition-all" style={{ border: `1px solid ${isSelected ? "#0052ff44" : "#dee1e6"}`, background: isSelected ? "#0052ff08" : "#ffffff" }} onMouseEnter={e=>!isSelected && (e.currentTarget.style.background="#f7f7f7")} onMouseLeave={e=>!isSelected && (e.currentTarget.style.background="#ffffff")}>
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#eef0f3" }}><span className="text-[15px] font-bold" style={{ color: "#0052ff" }}>{customer.name.charAt(0).toUpperCase()}</span></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold leading-tight" style={{ color: "#0a0b0d" }}>{customer.name}</p>
                        {customer.companyName && <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "#5b616e" }}><Building2 className="size-3.5" /> {customer.companyName}</p>}
                        <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "#5b616e", fontFamily: "'JetBrains Mono', monospace" }}><Phone className="size-3.5" /> +91 {customer.phone}</p>
                        {customer.billingAddress?.city && <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: "#5b616e" }}><MapPin className="size-3.5" /> {customer.billingAddress.city}, {customer.billingAddress.state}</p>}
                      </div>
                      {isSelected && <div className="size-5 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: "#0052ff" }}><span className="text-white text-[10px] font-bold">✓</span></div>}
                    </button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <AddCustomerForm onBack={() => setView("list")} onAdd={handleAdd} />
        )}
      </SheetContent>
    </Sheet>
  );
}
