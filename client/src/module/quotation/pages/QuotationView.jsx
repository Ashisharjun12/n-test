import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Box,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  StickyNote,
  Tag,
} from "lucide-react";
import { quotationApi } from "@/api/quotation.api";
import { splitGst, computeGrandTotal } from "@/lib/quotationTaxUtils";
import {
  buildChargePayload,
  findChargeByType,
  getChargeLabel,
  normalizeLegacyCharge,
} from "@/lib/chargeUtils";
import useCompanyStore from "@/store/company.store";
import { CASH_OPTION, BankRow, BankSelectSheet } from "../components/Banks";
import SignatureSheet, { SignatureRow } from "../components/SignatureSheet";
import QuotationTextSheet from "../components/QuotationTextSheet";
import OptionalChargeRow from "../components/OptionalChargeRow";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const fmtMoney = (n) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_CFG = {
  DRAFT: { label: "draft", bg: "#fef3c7", fg: "#b45309" },
  CREATED: { label: "open", bg: "#fef3c7", fg: "#b45309" },
};

function SummaryLine({ label, value, bold, accent }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-[14px] ${bold ? "font-semibold text-[#0a0b0d]" : "text-[#5b616e]"}`}>{label}</span>
      <span
        className={`text-[14px] font-mono ${bold ? "font-bold text-[#0a0b0d]" : "text-[#0a0b0d]"}`}
        style={accent ? { color: accent } : undefined}
      >
        {fmtMoney(value)}
      </span>
    </div>
  );
}

function ItemCard({ item, withGst }) {
  const [expanded, setExpanded] = useState(false);
  const qty = item.quantity ?? 0;
  const price = item.price ?? 0;
  const lineSub = qty * price;
  const taxRate = withGst ? (item.taxRate ?? 0) : 0;
  const lineTax = (lineSub * taxRate) / 100;
  const hasDesc = Boolean(item.description?.trim());

  return (
    <div className="rounded-[16px] border border-[#dee1e6] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => hasDesc && setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-start justify-between gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#0a0b0d]">{item.name}</p>
          <p className="text-[12px] text-[#5b616e] mt-1">
            {qty} {item.unit || "PCS"} × {fmtMoney(price)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[14px] font-semibold font-mono text-[#0a0b0d]">{fmtMoney(lineSub + lineTax)}</span>
          {hasDesc && (expanded ? <ChevronUp className="size-4 text-[#a8acb3]" /> : <ChevronDown className="size-4 text-[#a8acb3]" />)}
        </div>
      </button>
      {expanded && hasDesc && (
        <div className="px-4 pb-4 pt-0 border-t border-[#eef0f3]">
          <p className="text-[12px] text-[#5b616e] mt-3 whitespace-pre-wrap">{item.description}</p>
        </div>
      )}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-[12px] text-[#5b616e]">
        <div>
          <span className="block text-[#7c828a]">Net Amount</span>
          {fmtMoney(lineSub)}
        </div>
        <div className="text-right">
          <span className="block text-[#7c828a]">Total Tax ({taxRate}%)</span>
          {fmtMoney(lineTax)}
        </div>
      </div>
    </div>
  );
}

export default function QuotationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeCompany = useCompanyStore((s) => s.activeCompany);

  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const [selectedBank, setSelectedBank] = useState(CASH_OPTION);
  const [signature, setSignature] = useState(null);

  const load = useCallback(() => {
    if (!id) return Promise.resolve();
    setLoading(true);
    return quotationApi
      .getQuotationById(id)
      .then((res) => {
        const data = res.data?.data;
        setQ(data);
        if (data?.paymentMethod === "bank" && data.bank) {
          setSelectedBank({
            ...data.bank,
            type: "bank",
            paymentMethod: "bank",
            name: data.bank.bankName,
          });
        } else {
          setSelectedBank(CASH_OPTION);
        }
        setSignature(data?.signature || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = useCallback(
    async (payload) => {
      if (!id) return;
      await quotationApi.updateQuotation(id, payload);
      await load();
    },
    [id, load]
  );

  const companyState =
    activeCompany?.billingAddress?.state ||
    (typeof q?.companyId === "object" ? q?.companyId?.billingAddress?.state : undefined);
  const customerState = q?.customer?.billingAddress?.state;

  const taxBreakdown = useMemo(() => {
    if (!q?.items?.length) return null;
    return splitGst(
      q.items,
      (i) => i.price ?? 0,
      (i) => i.quantity ?? 0,
      (i) => (q.withGst !== false ? i.taxRate ?? 0 : 0),
      q.withGst !== false,
      companyState,
      customerState
    );
  }, [q, companyState, customerState]);

  const grandTotal =
    q?.totalAmount ??
    computeGrandTotal({
      subtotal: q?.subTotal ?? 0,
      gstTotal: taxBreakdown?.totalTax ?? 0,
      extraCharges: q?.extraCharges ?? [],
    });

  const shippingCharge = useMemo(
    () => normalizeLegacyCharge(findChargeByType(q?.extraCharges, "shipping")),
    [q?.extraCharges]
  );
  const packagingCharge = useMemo(
    () => normalizeLegacyCharge(findChargeByType(q?.extraCharges, "packaging")),
    [q?.extraCharges]
  );

  const patchExtraCharges = useCallback(
    async (type, charge) => {
      if (!q) return;
      const subtotal = q.subTotal ?? 0;
      const others = (q.extraCharges || []).filter((c) => {
        const t =
          c.type ||
          (c.label === "Shipping" ? "shipping" : c.label === "Packaging" ? "packaging" : "other");
        return t !== type;
      });
      const built = charge ? buildChargePayload({ ...charge, type }, subtotal) : null;
      const extraCharges = [...others, ...(built ? [built] : [])];
      const gstTotal = taxBreakdown?.totalTax ?? 0;
      const totalAmount = computeGrandTotal({
        subtotal,
        gstTotal,
        extraCharges,
        roundOff: q.roundOff,
      });
      await patch({ extraCharges, totalAmount });
    },
    [q, taxBreakdown, patch]
  );

  const handleBankSelect = async (bank) => {
    setSelectedBank(bank);
    await patch({
      paymentMethod: bank?.paymentMethod === "bank" ? "bank" : "cash",
      bank: bank?.paymentMethod === "bank" ? bank._id : undefined,
    });
  };

  const handleSignatureSelect = async (sig) => {
    setSignature(sig);
    await patch({ signature: sig || undefined });
  };

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const res = await quotationApi.downloadPdf(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${q?.quotationNo || "quotation"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef0f3]">
        <Loader2 className="size-8 animate-spin text-[#0052ff]" />
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#eef0f3] gap-4">
        <p className="text-[14px] text-[#5b616e]">Quotation not found</p>
        <button type="button" onClick={() => navigate("/quotations")} className="text-[#0052ff] font-semibold">
          Back to list
        </button>
      </div>
    );
  }

  const status = STATUS_CFG[q.status] || STATUS_CFG.CREATED;

  return (
    <div className="min-h-screen flex flex-col bg-[#eef0f3]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 shrink-0 border-b border-[#dee1e6]"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button type="button" onClick={() => navigate("/quotations")} className="cursor-pointer text-[#5b616e] p-1">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-bold text-[#0a0b0d] truncate">{q.quotationNo || "—"}</h1>
            <p className="text-[12px] text-[#5b616e]">{q.documentTitle || "Quotation"}</p>
          </div>
          <Link
            to={`/quotation/${id}/edit`}
            className="cursor-pointer flex items-center gap-1 text-[13px] font-semibold text-[#0052ff] px-3 py-1.5"
          >
            <Pencil className="size-3.5" /> Edit
          </Link>
          <button type="button" className="cursor-pointer p-1 text-[#5b616e]">
            <MoreHorizontal className="size-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">
          {/* Customer */}
          <div className="rounded-[16px] border border-[#dee1e6] bg-white p-4 relative">
            <span
              className="absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.fg }}
            >
              {status.label}
            </span>
            <p className="text-[16px] font-bold text-[#0a0b0d] pr-16">{q.customer?.name || "—"}</p>
            <p className="text-[13px] text-[#5b616e] mt-2">
              Invoice Date: <span className="text-[#0a0b0d] font-medium">{fmtDate(q.documentDate || q.createdAt)}</span>
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-[14px] font-semibold text-[#0a0b0d] mb-3 px-1">
              Items ({q.items?.length || 0})
            </p>
            <div className="flex flex-col gap-3">
              {(q.items || []).map((item, idx) => (
                <ItemCard key={item._id || idx} item={item} withGst={q.withGst !== false} />
              ))}
            </div>
          </div>

          {/* Bill summary */}
          <div className="rounded-[16px] border border-[#dee1e6] bg-white p-4">
            <p className="text-[14px] font-semibold text-[#0a0b0d] mb-3">Bill Summary</p>
            <SummaryLine label={`Subtotal (${q.items?.length || 0} item${q.items?.length === 1 ? "" : "s"})`} value={q.subTotal} />
            {taxBreakdown?.isInterState && taxBreakdown.igst > 0 && (
              <SummaryLine label={`IGST (${taxBreakdown.igstRate}%)`} value={taxBreakdown.igst} />
            )}
            {taxBreakdown && !taxBreakdown.isInterState && taxBreakdown.cgst > 0 && (
              <>
                <SummaryLine label={`CGST (${taxBreakdown.cgstRate}%)`} value={taxBreakdown.cgst} />
                <SummaryLine label={`SGST (${taxBreakdown.sgstRate}%)`} value={taxBreakdown.sgst} />
              </>
            )}
            {(q.extraCharges || []).map((c, idx) => (
              <SummaryLine key={c._id || c.label || idx} label={getChargeLabel(c)} value={c.amount} />
            ))}
            <div className="h-px bg-[#dee1e6] my-2" />
            <SummaryLine label="Total Amount" value={grandTotal} bold />
            <SummaryLine label="Pending" value={grandTotal} accent="#cf202f" />
          </div>

          {/* Others */}
          <div>
            <p className="text-[14px] font-semibold text-[#0a0b0d] mb-2 px-1">Others...</p>
            <div className="rounded-[16px] border border-[#dee1e6] bg-white overflow-hidden divide-y divide-[#dee1e6]">
              <BankRow selectedBank={selectedBank} onClick={() => setShowBank(true)} />
              <SignatureRow selected={signature} onClick={() => setShowSignature(true)} />
              <OptionalChargeRow
                icon={<PackageOpen className="size-4 text-[#5b616e]" />}
                chargeType="shipping"
                label="Delivery / Shipping Charges"
                charge={shippingCharge}
                baseSubtotal={q.subTotal ?? 0}
                onSave={(charge) => patchExtraCharges("shipping", charge)}
              />
              <OptionalChargeRow
                icon={<Box className="size-4 text-[#5b616e]" />}
                chargeType="packaging"
                label="Packaging Charges"
                charge={packagingCharge}
                baseSubtotal={q.subTotal ?? 0}
                onSave={(charge) => patchExtraCharges("packaging", charge)}
              />
              <QuotationTextSheet
                icon={<Tag className="size-4 text-[#5b616e]" />}
                label="Reference"
                value={q.reference}
                placeholder="Add reference"
                fieldKey="reference"
                saveLabel="Submit"
                onSave={(text) => patch({ reference: text })}
              />
              <QuotationTextSheet
                icon={<StickyNote className="size-4 text-[#5b616e]" />}
                label="Notes"
                value={q.notes}
                placeholder="Add notes"
                fieldKey="notes"
                multiline
                onSave={(text) => patch({ notes: text })}
              />
              <QuotationTextSheet
                icon={<FileText className="size-4 text-[#5b616e]" />}
                label="Terms & Conditions"
                value={q.terms}
                placeholder="Add terms & conditions"
                fieldKey="terms"
                multiline
                onSave={(text) => patch({ terms: text })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dee1e6] bg-white/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/quotation/${id}/preview`)}
            className="cursor-pointer flex-1 h-[52px] rounded-[100px] text-[15px] font-semibold border border-[#dee1e6] text-[#0a0b0d] bg-white hover:bg-[#f7f7f7] flex items-center justify-center gap-2"
          >
            <Eye className="size-4" /> View
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={handleDownloadPdf}
            className="cursor-pointer flex-1 h-[52px] rounded-[100px] text-[15px] font-semibold text-white bg-[#0052ff] hover:bg-[#003ecc] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 className="size-5 animate-spin" /> : <><Download className="size-4" /> Download PDF</>}
          </button>
        </div>
      </div>

      <BankSelectSheet
        open={showBank}
        onClose={() => setShowBank(false)}
        selectedBank={selectedBank}
        onSelect={handleBankSelect}
      />
      <SignatureSheet
        open={showSignature}
        onClose={() => setShowSignature(false)}
        selected={signature}
        onSelect={handleSignatureSelect}
      />
    </div>
  );
}
