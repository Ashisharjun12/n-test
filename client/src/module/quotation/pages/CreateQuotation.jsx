import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductPrice, getProductTaxRate, normalizeProductForQuotation } from "@/lib/productUtils";
import { splitGst, computeGrandTotal } from "@/lib/quotationTaxUtils";
import { buildChargePayload, findChargeByType, normalizeLegacyCharge } from "@/lib/chargeUtils";
import { quotationApi } from "../../../api/quotation.api";
import useCompanyStore from "../../../store/company.store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CASH_OPTION, BankRow, BankSelectSheet } from "../components/Banks";
import DispatchAddressSheet, { DispatchAddressRow } from "../components/DispatchAddressSheet";
import SignatureSheet, { SignatureRow, getCompanySignatures } from "../components/SignatureSheet";
import AdditionalChargesSheet from "../components/AdditionalChargesSheet";
import OptionalChargeRow from "../components/OptionalChargeRow";
import QuotationTextSheet from "../components/QuotationTextSheet";
import { bankApi } from "../../../api/bank.api";
import Products from "../components/Products";
import Customers from "../components/Customers";
import {
  ArrowLeft, Pencil, UserCircle2, Package,
  PackageOpen, Plus, X,
  Calendar, ChevronDown, Tag, StickyNote, FileText, Box,
} from "lucide-react";

/* ── Helpers & Data ─────────────────────────────────────────────────── */
const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const toInputDate = (d) => d.toISOString().split("T")[0];
const fromInputDate = (s) => s ? new Date(s) : new Date();

const EST_NUMBER = "EST-" + (Math.floor(Math.random() * 5) + 6);

/* ── Add New Prefix Dialog ───────────────────────────────────────────── */
function AddPrefixDialog({ open, onClose, onAdd }) {
  const [newPrefix, setNewPrefix] = useState("");
  const [setDefault, setSetDefault] = useState(false);

  const handleSave = () => {
    if (!newPrefix.trim()) return;
    onAdd(newPrefix.trim().toUpperCase(), setDefault);
    setNewPrefix("");
    setSetDefault(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[24px] p-0 border-0" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #dee1e6" }}>
          <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Add New Prefix</h2>
          <button onClick={onClose} className="cursor-pointer transition-colors" style={{ color: "#7c828a" }} onMouseEnter={e=>e.currentTarget.style.color="#0a0b0d"} onMouseLeave={e=>e.currentTarget.style.color="#7c828a"}><X className="size-5" /></button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-5">
          <div className="relative">
            <input type="text" placeholder="New Prefix" value={newPrefix} onChange={(e) => setNewPrefix(e.target.value)} autoFocus
              className="w-full h-[48px] px-4 rounded-[12px] text-[15px] outline-none transition-all"
              style={{ border: "1px solid #0052ff", background: "#ffffff", color: "#0a0b0d" }} />
            <label className="absolute -top-2 left-3 text-[11px] font-medium px-1" style={{ color: "#0052ff", background: "#ffffff" }}>New Prefix</label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium" style={{ color: "#0a0b0d" }}>Set as Default</span>
            <button onClick={() => setSetDefault(!setDefault)}
              className="cursor-pointer relative w-11 h-6 rounded-full transition-colors"
              style={{ background: setDefault ? "#0052ff" : "#eef0f3" }}>
              <span className="absolute top-1 size-4 rounded-full bg-white transition-all" style={{ left: setDefault ? "24px" : "4px" }} />
            </button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button onClick={onClose} className="cursor-pointer text-[14px] font-medium transition-colors" style={{ color: "#5b616e" }}>Cancel</button>
            <button onClick={handleSave} disabled={!newPrefix.trim()}
              className="cursor-pointer px-6 rounded-[100px] text-[14px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "#0052ff", height: 44 }}>
              Save
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Prefix Selector Sheet ───────────────────────────────────────────── */
function PrefixSheet({ open, onClose, prefix, onSelect }) {
  const [prefixes, setPrefixes] = useState(["EST-", "QT-", "INV-"]);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (p, isDefault) => {
    setPrefixes((prev) => isDefault ? [p, ...prev.filter(x => x !== p)] : [...prev, p]);
    onSelect(p);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-[24px] p-0 border-0 max-h-[60vh] overflow-y-auto" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #dee1e6" }}>
            <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Select Prefix</h2>
            <button onClick={onClose} className="cursor-pointer transition-colors" style={{ color: "#7c828a" }} onMouseEnter={e=>e.currentTarget.style.color="#0a0b0d"} onMouseLeave={e=>e.currentTarget.style.color="#7c828a"}><X className="size-5" /></button>
          </div>
          <div className="px-5 py-4 flex flex-col gap-2">
            <button onClick={() => setShowAdd(true)}
              className="cursor-pointer w-full flex items-center gap-3 p-3.5 rounded-[16px] transition-all"
              style={{ border: "1px solid #dee1e6", background: "#ffffff" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
              <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#0052ff14" }}>
                <Plus className="size-4" style={{ color: "#0052ff" }} />
              </div>
              <span className="text-[14px] font-medium" style={{ color: "#0052ff" }}>Add New Prefix</span>
            </button>
            {prefixes.map((p) => (
              <button key={p} onClick={() => { onSelect(p); onClose(); }}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-all"
                style={{ border: "1px solid #dee1e6", background: "#ffffff" }}
                onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
                <div className="size-5 rounded-full flex items-center justify-center transition-all" style={{ border: `2px solid ${prefix === p ? "#0052ff" : "#dee1e6"}` }}>
                  {prefix === p && <div className="size-2.5 rounded-full" style={{ background: "#0052ff" }} />}
                </div>
                <span className="text-[14px] font-medium" style={{ color: "#0a0b0d" }}>{p}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <AddPrefixDialog open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </>
  );
}

/* ── Edit Document Sheet ─────────────────────────────────────────────── */
function EditDocumentSheet({ open, onClose, docNum, setDocNum, docDate, setDocDate, dueDate, setDueDate, docTitle, setDocTitle, discountOn, setDiscountOn }) {
  const [prefix, setPrefix] = useState("EST-");
  const [numPart, setNumPart] = useState(docNum.replace(/^\D+-?/, ""));
  const [localDate, setLocalDate] = useState(toInputDate(docDate));
  const [localDue, setLocalDue] = useState(toInputDate(dueDate));
  const [localTitle, setLocalTitle] = useState(docTitle);
  const [localDiscount, setLocalDiscount] = useState(discountOn);
  const [showPrefixSheet, setShowPrefixSheet] = useState(false);
  const [activeTerm, setActiveTerm] = useState("custom");

  const NET_TERMS = ["custom", "net 0", "net 15", "net 30", "net 60"];

  const applyNet = (term) => {
    setActiveTerm(term);
    if (term === "custom") return;
    const days = parseInt(term.replace("net ", ""));
    const due = new Date(localDate);
    due.setDate(due.getDate() + days);
    setLocalDue(toInputDate(due));
  };

  const handleSave = () => {
    setDocNum(prefix + numPart);
    setDocDate(fromInputDate(localDate));
    setDueDate(fromInputDate(localDue));
    setDocTitle(localTitle);
    setDiscountOn(localDiscount);
    onClose();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-[24px] max-h-[92vh] overflow-y-auto p-0 border-0" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
          <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #dee1e6" }}>
            <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Edit Document</h2>
            <button onClick={onClose} className="cursor-pointer transition-colors" style={{ color: "#7c828a" }} onMouseEnter={e=>e.currentTarget.style.color="#0a0b0d"} onMouseLeave={e=>e.currentTarget.style.color="#7c828a"}><X className="size-5" /></button>
          </div>
          <div className="px-5 py-5 flex flex-col gap-6">
            <div>
              <label className="text-[13px] font-medium mb-2 block" style={{ color: "#0a0b0d" }}>Quotation/Estimate #</label>
              <div className="flex gap-2">
                <button onClick={() => setShowPrefixSheet(true)} className="cursor-pointer flex-1 h-[48px] flex items-center justify-between px-4 rounded-[12px] text-[14px] transition-colors" style={{ background: "#eef0f3", color: "#0a0b0d" }}>
                  <span>{prefix}</span>
                  <ChevronDown className="size-4" style={{ color: "#5b616e" }} />
                </button>
                <input type="text" value={numPart} onChange={(e) => setNumPart(e.target.value)} placeholder="2" className="flex-1 px-4 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium mb-2 block" style={{ color: "#0a0b0d" }}>Document Date</label>
              <div className="relative">
                <input type="date" value={localDate} onChange={(e) => setLocalDate(e.target.value)} className="w-full h-[48px] px-4 pr-10 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: "#5b616e" }} />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium mb-2 block" style={{ color: "#0a0b0d" }}>Due Date</label>
              <div className="relative">
                <input type="date" value={localDue} onChange={(e) => { setLocalDue(e.target.value); setActiveTerm("custom"); }} className="w-full h-[48px] px-4 pr-10 rounded-[12px] text-[14px] outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }} />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: "#5b616e" }} />
              </div>
              <p className="text-[12px] mt-1.5" style={{ color: "#7c828a" }}>The invoice due date is the date on which you expect to receive payment.</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {NET_TERMS.map((t) => {
                  const isActive = activeTerm === t;
                  return (
                    <button key={t} onClick={() => applyNet(t)} className="cursor-pointer px-4 py-1.5 rounded-[100px] text-[12px] font-semibold transition-all"
                      style={{ border: `1px solid ${isActive ? "#0052ff" : "#dee1e6"}`, background: isActive ? "#0052ff" : "transparent", color: isActive ? "#ffffff" : "#5b616e" }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium mb-3 block" style={{ color: "#0a0b0d" }}>Document Title</label>
              <div className="flex gap-6">
                {["Quotation", "Estimate"].map((opt) => (
                  <label key={opt} className="cursor-pointer flex items-center gap-2 text-[14px]" style={{ color: "#0a0b0d" }}>
                    <div className="size-5 rounded-full flex items-center justify-center transition-all" style={{ border: `2px solid ${localTitle === opt ? "#0052ff" : "#dee1e6"}` }}>
                      {localTitle === opt && <div className="size-2.5 rounded-full" style={{ background: "#0052ff" }} />}
                    </div>
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium mb-2 block" style={{ color: "#0a0b0d" }}>Discount On</label>
              <div className="relative">
                <select value={localDiscount} onChange={(e) => setLocalDiscount(e.target.value)} className="cursor-pointer w-full h-[48px] pl-4 pr-10 rounded-[12px] text-[14px] appearance-none outline-none" style={{ background: "#eef0f3", color: "#0a0b0d" }}>
                  <option>Total Amount</option>
                  <option>Per Item</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: "#5b616e" }} />
              </div>
            </div>
          </div>
          <div className="px-5 pb-6">
            <button className="w-full cursor-pointer rounded-[100px] text-[16px] font-semibold text-white transition-all" onClick={handleSave} style={{ background: "#0052ff", height: 56 }} onMouseEnter={e=>e.currentTarget.style.background="#003ecc"} onMouseLeave={e=>e.currentTarget.style.background="#0052ff"}>
              Save &amp; Update
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <PrefixSheet open={showPrefixSheet} onClose={() => setShowPrefixSheet(false)} prefix={prefix} onSelect={setPrefix} />
    </>
  );
}

/* ── UI Helpers ──────────────────────────────────────────────────────── */
function SummaryRow({ label, value, bold, neg }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[14px]" style={{ color: bold ? "#0a0b0d" : "#5b616e", fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="text-[15px]" style={{ color: bold ? "#0a0b0d" : (neg ? "#cf202f" : "#0a0b0d"), fontWeight: bold ? 700 : 500, fontFamily: "'JetBrains Mono', monospace" }}>
        {neg ? "-" : ""}₹{Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────── */
export default function CreateQuotation() {
  const navigate = useNavigate();
  const { id: quotationId } = useParams();
  const isEditMode = Boolean(quotationId);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);
  const activeCompany = useCompanyStore((s) => s.activeCompany);

  const [withGst, setWithGst] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(CASH_OPTION);
  const [dispatchAddress, setDispatchAddress] = useState(null);
  const [signature, setSignature] = useState(null);
  const [showDispatch, setShowDispatch] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showAdditionalCharges, setShowAdditionalCharges] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showEditDoc, setShowEditDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [roundOff, setRoundOff] = useState(false);

  const [docNum, setDocNum] = useState(EST_NUMBER);
  const [docDate, setDocDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [docTitle, setDocTitle] = useState("Quotation");
  const [discountOn, setDiscountOn] = useState("Total Amount");

  const [shippingCharge, setShippingCharge] = useState(null);
  const [packagingCharge, setPackagingCharge] = useState(null);
  const [additionalCharges, setAdditionalCharges] = useState([]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (!isEditMode || !quotationId) return;
    setLoading(true);
    quotationApi
      .getQuotationById(quotationId)
      .then((res) => {
        const q = res.data?.data;
        if (!q) return;
        setDocNum(q.quotationNo || EST_NUMBER);
        if (q.documentDate) setDocDate(new Date(q.documentDate));
        if (q.dueDate) setDueDate(new Date(q.dueDate));
        setDocTitle(q.documentTitle || "Quotation");
        setWithGst(q.withGst !== false);
        setRoundOff(q.roundOff || false);
        setDispatchAddress(q.dispatchAddress || null);
        setSignature(q.signature || null);
        if (q.paymentMethod === "bank" && q.bank) {
          setSelectedBank({ ...q.bank, type: "bank", paymentMethod: "bank", name: q.bank.bankName });
        } else {
          setSelectedBank(CASH_OPTION);
        }
        setSelectedCustomer(q.customer);
        setSelectedProducts(
          (q.items || []).map((item) =>
            normalizeProductForQuotation(
              {
                _id: item.productId,
                name: item.name,
                hsn: item.hsn,
                unit: item.unit,
                sellingPrice: item.price,
                taxRate: item.taxRate,
              },
              item.quantity
            )
          )
        );
        setReference(q.reference || "");
        setNotes(q.notes || "");
        setTerms(q.terms || "");
        const shipping = findChargeByType(q.extraCharges, "shipping");
        const packaging = findChargeByType(q.extraCharges, "packaging");
        setShippingCharge(shipping ? normalizeLegacyCharge(shipping) : null);
        setPackagingCharge(packaging ? normalizeLegacyCharge(packaging) : null);
        setAdditionalCharges(
          (q.extraCharges || [])
            .filter((c) => {
              const type = c.type || (c.label === "Shipping" ? "shipping" : c.label === "Packaging" ? "packaging" : "other");
              return type === "other";
            })
            .map((c) => normalizeLegacyCharge(c))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isEditMode, quotationId]);

  // Auto-select default bank & signature on new quotations
  useEffect(() => {
    if (isEditMode || !companyId) return;

    bankApi.getBanks(companyId).then((res) => {
      const banks = res.data?.data || [];
      const defaultBank = banks.find((b) => b.isDefault);
      if (!defaultBank) return;
      setSelectedBank((prev) => {
        if (prev?.paymentMethod === "bank" && prev?._id) return prev;
        return {
          ...defaultBank,
          type: "bank",
          paymentMethod: "bank",
          name: defaultBank.bankName,
        };
      });
    }).catch(console.error);

    const sigs = getCompanySignatures(activeCompany);
    const defaultSig = sigs.find((s) => s.isDefault) || sigs[0];
    if (!defaultSig?.url) return;
    setSignature((prev) => prev?.url ? prev : {
      url: defaultSig.url,
      name: defaultSig.name,
      withStamp: defaultSig.withStamp,
    });

    setReference((prev) => prev || activeCompany?.defaultReference || "");
    setNotes((prev) => prev || activeCompany?.defaultNotes || "");
    setTerms((prev) => prev || activeCompany?.defaultTerms || "");
  }, [isEditMode, companyId, activeCompany]);

  const companyState = activeCompany?.billingAddress?.state;
  const customerState = selectedCustomer?.billingAddress?.state;

  const subtotal = selectedProducts.reduce(
    (s, p) => s + getProductPrice(p) * p.qty,
    0
  );
  const taxBreakdown = splitGst(
    selectedProducts,
    getProductPrice,
    (p) => p.qty,
    (p) => (withGst ? getProductTaxRate(p) : 0),
    withGst,
    companyState,
    customerState
  );
  const gstTotal = taxBreakdown.totalTax;

  const builtExtraCharges = [
    buildChargePayload(shippingCharge, subtotal),
    buildChargePayload(packagingCharge, subtotal),
    ...additionalCharges.map((c) =>
      buildChargePayload({ ...c, type: "other" }, subtotal) || (c.amount ? c : null)
    ),
  ].filter(Boolean);

  const grandTotal = computeGrandTotal({ subtotal, gstTotal, extraCharges: builtExtraCharges, roundOff });

  const handleSave = async () => {
    if (!companyId || !selectedCustomer || selectedProducts.length === 0) return;
    setSaving(true);
    try {
      const effectiveTaxRate = (p) => (withGst ? getProductTaxRate(p) : 0);
      const payload = {
        companyId,
        quotationNo: docNum,
        customer: selectedCustomer._id,
        documentDate: docDate.toISOString(),
        dueDate: dueDate.toISOString(),
        documentTitle: docTitle,
        withGst,
        isExportSEZ: false,
        paymentMethod: selectedBank?.paymentMethod === "bank" ? "bank" : "cash",
        bank: selectedBank?.paymentMethod === "bank" ? selectedBank._id : undefined,
        dispatchAddress: dispatchAddress || undefined,
        signature: signature || undefined,
        roundOff,
        items: selectedProducts.map((p) => {
          const price = getProductPrice(p);
          const rate = effectiveTaxRate(p);
          const lineSub = price * p.qty;
          const lineTax = (lineSub * rate) / 100;
          return {
            productId: p._id || p.id,
            name: p.name,
            description: p.description,
            hsn: p.hsn,
            unit: p.unit || "PCS",
            quantity: p.qty,
            price,
            taxRate: rate,
            total: lineSub + lineTax,
          };
        }),
        subTotal: subtotal,
        discount: 0,
        reference: reference || undefined,
        notes: notes || undefined,
        terms: terms || undefined,
        extraCharges: builtExtraCharges,
        totalAmount: grandTotal,
        status: "CREATED",
      };

      if (isEditMode) {
        const { companyId: _, ...updatePayload } = payload;
        await quotationApi.updateQuotation(quotationId, updatePayload);
        navigate(`/quotation/${quotationId}`);
      } else {
        const res = await quotationApi.createQuotation(payload);
        const newId = res.data?.data?._id;
        navigate(newId ? `/quotation/${newId}` : "/quotations");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#ffffff", fontFamily: "Inter, sans-serif" }}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-[#7c828a]">Loading quotation...</p>
        </div>
      ) : (
      <>
      {/* App Bar */}
      <div className="sticky top-0 z-20 backdrop-blur-md" style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #dee1e6", height: 64 }}>
        <div className="max-w-2xl mx-auto px-5 h-full flex items-center gap-4">
          <button onClick={() => (isEditMode ? navigate(`/quotation/${quotationId}`) : navigate(-1))} className="cursor-pointer transition-colors" style={{ color: "#5b616e" }} onMouseEnter={e=>e.currentTarget.style.color="#0a0b0d"} onMouseLeave={e=>e.currentTarget.style.color="#5b616e"}>
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-[16px] font-medium flex-1" style={{ color: "#0a0b0d" }}>{docTitle} / Estimate</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-5">

          {/* EST Card */}
          <div className="flex items-center justify-between p-5 rounded-[24px]" style={{ border: "1px solid #dee1e6", background: "#ffffff" }}>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>{docNum}</p>
              <p className="text-[13px] mt-0.5" style={{ color: "#7c828a" }}>{fmtDate(docDate)}</p>
            </div>
            <button onClick={() => setShowEditDoc(true)} className="cursor-pointer flex items-center gap-1.5 text-[14px] font-medium transition-colors" style={{ color: "#0052ff" }} onMouseEnter={e=>e.currentTarget.style.color="#003ecc"} onMouseLeave={e=>e.currentTarget.style.color="#0052ff"}>
              <Pencil className="size-3.5" /> Edit
            </button>
          </div>

          {/* GST Toggle */}
          <div className="flex items-center gap-6 px-1">
            {["With GST", "Without GST"].map((opt) => {
              const active = (opt === "With GST") === withGst;
              return (
                <label key={opt} className="cursor-pointer flex items-center gap-2 text-[14px]" style={{ color: "#0a0b0d" }}>
                  <div className="size-5 rounded-full flex items-center justify-center" style={{ border: `2px solid ${active ? "#0052ff" : "#dee1e6"}` }}>
                    {active && <div className="size-2.5 rounded-full" style={{ background: "#0052ff" }} />}
                  </div>
                  <input type="radio" className="sr-only" checked={active} onChange={() => setWithGst(opt === "With GST")} />
                  {opt}
                </label>
              );
            })}
          </div>

          {/* Customer */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>Customer</p>
            </div>
            {selectedCustomer ? (
              <div className="flex items-start gap-4 p-5 rounded-[24px]" style={{ border: "1px solid #dee1e6", background: "#ffffff" }}>
                <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#eef0f3" }}>
                  <span className="text-[16px] font-bold" style={{ color: "#0052ff" }}>{selectedCustomer.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>{selectedCustomer.name}</p>
                  {selectedCustomer.companyName && <p className="text-[13px] mt-0.5" style={{ color: "#5b616e" }}>{selectedCustomer.companyName}</p>}
                  <p className="text-[13px] mt-0.5 font-medium" style={{ color: "#7c828a", fontFamily: "'JetBrains Mono', monospace" }}>+91 {selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setShowCustomers(true)} className="cursor-pointer text-[13px] font-semibold transition-colors" style={{ color: "#0052ff" }} onMouseEnter={e=>e.currentTarget.style.color="#003ecc"} onMouseLeave={e=>e.currentTarget.style.color="#0052ff"}>Change</button>
              </div>
            ) : (
              <button onClick={() => setShowCustomers(true)} className="cursor-pointer w-full flex items-center gap-3 p-4 rounded-[100px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
                <div className="size-10 rounded-full flex items-center justify-center" style={{ background: "#0052ff14" }}>
                  <UserCircle2 className="size-5" style={{ color: "#0052ff" }} />
                </div>
                <span className="text-[15px] font-semibold" style={{ color: "#0052ff" }}>Select Customer</span>
              </button>
            )}
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>Products</p>
            </div>
            {selectedProducts.length > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {selectedProducts.map((p) => {
                  const price = getProductPrice(p);
                  return (
                  <div key={p._id || p.id} className="flex items-center justify-between p-4 rounded-[16px]" style={{ border: "1px solid #dee1e6", background: "#ffffff" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate" style={{ color: "#0a0b0d" }}>{p.name}</p>
                      <p className="text-[13px] mt-1" style={{ color: "#5b616e", fontFamily: "'JetBrains Mono', monospace" }}>{p.qty} × ₹{price} = ₹{(p.qty * price).toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-[12px] font-medium px-2 py-1 rounded-[6px] ml-3" style={{ background: "#eef0f3", color: "#5b616e" }}>{p.unit}</span>
                  </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowProducts(true)} className="cursor-pointer w-full flex items-center gap-3 p-4 rounded-[100px] transition-all" style={{ border: "1px solid #dee1e6", background: "#ffffff" }} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="#ffffff"}>
              <div className="size-10 rounded-full flex items-center justify-center" style={{ background: "#0052ff14" }}>
                <Package className="size-5" style={{ color: "#0052ff" }} />
              </div>
              <span className="text-[15px] font-semibold" style={{ color: "#0052ff" }}>
                {selectedProducts.length > 0 ? "+ Add More Products" : "Select Products"}
              </span>
            </button>
          </div>

          {/* Optional */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>Optional</p>
              <button
                type="button"
                onClick={() => setShowAdditionalCharges(true)}
                className="cursor-pointer flex items-center gap-1.5 text-[13px] font-medium transition-colors"
                style={{ color: additionalCharges.length ? "#0052ff" : "#5b616e" }}
              >
                <Plus className="size-3.5" /> Additional Charges{additionalCharges.length ? ` (${additionalCharges.length})` : ""}
              </button>
            </div>
            <div className="flex flex-col rounded-[24px] overflow-hidden" style={{ border: "1px solid #dee1e6", background: "#ffffff" }}>
              <DispatchAddressRow selected={dispatchAddress} onClick={() => setShowDispatch(true)} />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <BankRow selectedBank={selectedBank} onClick={() => setShowBank(true)} />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <SignatureRow selected={signature} onClick={() => setShowSignature(true)} />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <QuotationTextSheet
                icon={<Tag className="size-4" style={{ color: "#5b616e" }} />}
                label="Reference"
                value={reference}
                placeholder="Add reference"
                fieldKey="reference"
                saveLabel="Submit"
                onSave={(text) => setReference(text || "")}
              />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <QuotationTextSheet
                icon={<StickyNote className="size-4" style={{ color: "#5b616e" }} />}
                label="Notes"
                value={notes}
                placeholder="Add notes"
                fieldKey="notes"
                multiline
                onSave={(text) => setNotes(text || "")}
              />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <QuotationTextSheet
                icon={<FileText className="size-4" style={{ color: "#5b616e" }} />}
                label="Terms & Conditions"
                value={terms}
                placeholder="Add terms & conditions"
                fieldKey="terms"
                multiline
                onSave={(text) => setTerms(text || "")}
              />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <OptionalChargeRow
                icon={<PackageOpen className="size-4" style={{ color: "#5b616e" }} />}
                chargeType="shipping"
                label="Delivery / Shipping Charges"
                charge={shippingCharge}
                baseSubtotal={subtotal}
                onSave={setShippingCharge}
              />
              <div className="mx-5 h-[1px]" style={{ background: "#dee1e6" }} />
              <OptionalChargeRow
                icon={<Box className="size-4" style={{ color: "#5b616e" }} />}
                chargeType="packaging"
                label="Packaging Charges"
                charge={packagingCharge}
                baseSubtotal={subtotal}
                onSave={setPackagingCharge}
              />
            </div>
          </div>

          {/* Summary */}
          {selectedProducts.length > 0 && (
            <div className="rounded-[24px] p-5 space-y-3" style={{ border: "1px solid #dee1e6", background: "#ffffff" }}>
              <p className="text-[15px] font-semibold mb-4" style={{ color: "#0a0b0d" }}>Summary</p>
              <SummaryRow label="Subtotal" value={subtotal} />
              {withGst && taxBreakdown.isInterState && taxBreakdown.igst > 0 && (
                <SummaryRow label={`IGST (${taxBreakdown.igstRate}%)`} value={taxBreakdown.igst} />
              )}
              {withGst && !taxBreakdown.isInterState && taxBreakdown.cgst > 0 && (
                <>
                  <SummaryRow label={`CGST (${taxBreakdown.cgstRate}%)`} value={taxBreakdown.cgst} />
                  <SummaryRow label={`SGST (${taxBreakdown.sgstRate}%)`} value={taxBreakdown.sgst} />
                </>
              )}
              {withGst && taxBreakdown.totalTax === 0 && gstTotal === 0 && (
                <SummaryRow label="GST" value={0} />
              )}
              {builtExtraCharges.map((c) => (
                <SummaryRow key={c.label || c.type} label={c.label} value={c.amount} />
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-[14px]" style={{ color: "#5b616e" }}>Round Off</span>
                <button
                  type="button"
                  onClick={() => setRoundOff(!roundOff)}
                  className="cursor-pointer relative w-11 h-6 rounded-full transition-colors"
                  style={{ background: roundOff ? "#0052ff" : "#d1d5db" }}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${roundOff ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="h-[1px] my-3" style={{ background: "#dee1e6" }} />
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Grand Total</span>
                <span className="text-[20px] font-bold" style={{ color: "#0052ff", fontFamily: "'JetBrains Mono', monospace" }}>
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
          <div className="h-6" />
        </div>
      </div>

      {/* Create / Save Button */}
      <div
        className="sticky bottom-0 w-full border-t pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 px-4"
        style={{ background: "rgba(255,255,255,0.92)", borderTop: "1px solid #dee1e6" }}
      >
        <button
          type="button"
          disabled={!selectedCustomer || selectedProducts.length === 0 || saving}
          onClick={handleSave}
          className="cursor-pointer w-full flex items-center justify-between gap-3 rounded-[100px] text-[16px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed px-6"
          style={{ background: "#0052ff", height: 56 }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "#003ecc")}
          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "#0052ff")}
        >
          <span>{saving ? (isEditMode ? "Saving..." : "Creating...") : "Create"}</span>
          {grandTotal > 0 && (
            <span className="font-bold shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          )}
        </button>
      </div>

      <EditDocumentSheet open={showEditDoc} onClose={() => setShowEditDoc(false)} docNum={docNum} setDocNum={setDocNum} docDate={docDate} setDocDate={setDocDate} dueDate={dueDate} setDueDate={setDueDate} docTitle={docTitle} setDocTitle={setDocTitle} discountOn={discountOn} setDiscountOn={setDiscountOn} />
      <DispatchAddressSheet open={showDispatch} onClose={() => setShowDispatch(false)} selected={dispatchAddress} onSelect={setDispatchAddress} />
      <BankSelectSheet open={showBank} onClose={() => setShowBank(false)} selectedBank={selectedBank} onSelect={setSelectedBank} />
      <SignatureSheet open={showSignature} onClose={() => setShowSignature(false)} selected={signature} onSelect={setSignature} />
      <AdditionalChargesSheet
        open={showAdditionalCharges}
        onClose={() => setShowAdditionalCharges(false)}
        charges={additionalCharges}
        onChange={setAdditionalCharges}
      />
      <Customers open={showCustomers} onOpenChange={setShowCustomers} selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />
      <Products open={showProducts} onOpenChange={setShowProducts} selectedProducts={selectedProducts} onProductsChange={setSelectedProducts} />
      </>
      )}
    </div>
  );
}
