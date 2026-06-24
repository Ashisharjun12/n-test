import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Plus, Clock, CheckCircle2, XCircle, Receipt,
  Send, MoreHorizontal, Pencil, Trash2, ArrowLeft, Loader2, Download, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileMenu from "@/components/shared/ProfileMenu";
import { quotationApi } from "../../../api/quotation.api";
import useCompanyStore from "../../../store/company.store";

const mapStatus = (status) => {
  if (status === "DRAFT") return "draft";
  if (status === "CREATED") return "sent";
  return "draft";
};

const mapQuotation = (q) => ({
  id: q._id,
  number: q.quotationNo || "—",
  date: q.createdAt
    ? new Date(q.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—",
  customer: q.customer?.name || "Unknown",
  amount: q.totalAmount || 0,
  status: mapStatus(q.status),
  items: q.items?.length || 0,
  rawStatus: q.status,
});

const STATUS_CFG = {
  draft:    { label: "Draft",    Icon: Clock,        bg: "#eef0f3", fg: "#5b616e" },
  sent:     { label: "Sent",     Icon: Send,         bg: "#e8eeff", fg: "#0052ff" },
  accepted: { label: "Accepted", Icon: CheckCircle2, bg: "#e6f8f0", fg: "#05b169" },
  declined: { label: "Declined", Icon: XCircle,      bg: "#fdecea", fg: "#cf202f" },
};

const STATUS_DESC = {
  draft:    "Created but not yet shared with the customer.",
  sent:     "Shared with the customer — waiting for their response.",
  accepted: "Customer confirmed. Ready to convert to an invoice.",
  declined: "Customer rejected this quotation.",
};

function StatusBadge({ status, size = "sm" }) {
  const { label, Icon, bg, fg } = STATUS_CFG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-semibold rounded-full", size === "sm" ? "px-2.5 py-0.5 text-[12px]" : "px-3 py-1 text-[13px]")}
      style={{ background: bg, color: fg }}>
      <Icon className="size-3" />{label}
    </span>
  );
}

function StatusSheet({ open, onClose, quotation, onStatusChange, onDelete, onDownloadPdf }) {
  if (!quotation) return null;
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[24px] p-0 max-h-[84vh] overflow-y-auto border-0"
        style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#dee1e6" }} />
        </div>
        <div className="px-5 pt-2 pb-4" style={{ borderBottom: "1px solid #dee1e6" }}>
          <p className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>{quotation.number}</p>
          <p className="text-[13px] mt-0.5" style={{ color: "#5b616e" }}>{quotation.customer}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: "#7c828a" }}>Change Status</p>
          <div className="flex flex-col gap-2">
            {["draft","sent","accepted","declined"].map((s) => {
              const isActive = quotation.status === s;
              return (
                <button key={s} onClick={() => { onStatusChange(quotation.id, s); onClose(); }}
                  className="cursor-pointer flex items-start gap-3 p-3.5 rounded-[16px] text-left transition-all"
                  style={{ border: `1px solid ${isActive ? "#0052ff44" : "#dee1e6"}`, background: isActive ? "#0052ff08" : "transparent" }}>
                  <StatusBadge status={s} />
                  <p className="text-[13px] leading-relaxed flex-1" style={{ color: "#5b616e" }}>{STATUS_DESC[s]}</p>
                  {isActive && (
                    <div className="size-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0052ff" }}>
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-5 pb-8 pt-3 flex flex-col gap-1" style={{ borderTop: "1px solid #dee1e6" }}>
          <Link to={`/quotation/${quotation.id}/preview`} onClick={onClose}>
            <button
              type="button"
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors"
              style={{ color: "#0a0b0d" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#eef0f3" }}>
                <Eye className="size-3.5" style={{ color: "#0052ff" }} />
              </div>
              Preview
            </button>
          </Link>
          <button
            type="button"
            onClick={() => { onDownloadPdf(quotation); onClose(); }}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors"
            style={{ color: "#0a0b0d" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#eef0f3" }}>
              <Download className="size-3.5" style={{ color: "#0052ff" }} />
            </div>
            Download PDF
          </button>
          <Link to={`/quotation/${quotation.id}/edit`} onClick={onClose}>
            <button className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors" style={{ color: "#0a0b0d" }}
              onMouseEnter={e => e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#eef0f3" }}><Pencil className="size-3.5" style={{ color: "#5b616e" }} /></div>
              Edit Quotation
            </button>
          </Link>
          <button onClick={() => { onDelete(quotation.id); onClose(); }}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors" style={{ color: "#cf202f" }}
            onMouseEnter={e => e.currentTarget.style.background="#fdecea"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#fdecea" }}><Trash2 className="size-3.5" style={{ color: "#cf202f" }} /></div>
            Delete Quotation
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function QuotationList() {
  const [filter, setFilter]         = useState("all");
  const [quotations, setQuotations] = useState([]);
  const [activeQ, setActiveQ]       = useState(null);
  const [showStatus, setShowStatus] = useState(false);
  const [loading, setLoading]       = useState(true);
  const companyId = useCompanyStore((s) => s.activeCompany?._id);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    quotationApi
      .getQuotations(companyId)
      .then((res) => setQuotations((res.data?.data || []).map(mapQuotation)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const filtered = filter === "all" ? quotations : quotations.filter(q => q.status === filter);

  const changeStatus = async (id, st) => {
    const apiStatus = st === "draft" ? "DRAFT" : "CREATED";
    try {
      await quotationApi.updateQuotation(id, { status: apiStatus });
      setQuotations((qs) => qs.map((q) => (q.id === id ? { ...q, status: st, rawStatus: apiStatus } : q)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const deleteQ = async (id) => {
    try {
      await quotationApi.deleteQuotation(id);
      setQuotations((qs) => qs.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete quotation");
    }
  };

  const downloadPdf = async (quotation) => {
    try {
      const res = await quotationApi.downloadPdf(quotation.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quotation.number.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to download PDF");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", fontFamily: "Inter, sans-serif" }}>

      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur-md" style={{ height: 64, background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #dee1e6" }}>
        <div className="max-w-3xl mx-auto px-5 h-full flex items-center justify-between">
          {/* Back to home */}
          <Link to="/" className="flex items-center gap-2 text-[#0a0b0d] hover:text-[#0052ff] transition-colors">
            <ArrowLeft className="size-4" />
            <span className="text-[14px] font-medium hidden sm:inline">Home</span>
          </Link>

          <span className="text-[20px] font-bold tracking-tight select-none absolute left-1/2 -translate-x-1/2" style={{ color: '#0052ff' }}>nero.</span>

          <div className="flex items-center gap-3">
            {/* Desktop only — FAB handles mobile */}
            <Link to="/quotation/create" className="hidden md:block">
              <button className="cursor-pointer inline-flex items-center gap-2 px-5 text-[14px] font-semibold text-white transition-all active:scale-[0.97]"
                style={{ background: "#0052ff", borderRadius: 100, height: 40 }}
                onMouseEnter={e => e.currentTarget.style.background="#003ecc"}
                onMouseLeave={e => e.currentTarget.style.background="#0052ff"}>
                <Plus className="size-4" /> New
              </button>
            </Link>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-7 pb-28 md:pb-7 space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.4px]" style={{ color: "#0a0b0d" }}>Quotations</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "#5b616e" }}>{quotations.length} estimates total</p>
        </div>



        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["all","draft","sent","accepted","declined"].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className="cursor-pointer px-4 py-2 text-[13px] font-medium capitalize whitespace-nowrap transition-all"
              style={{ borderRadius: 100, background: filter===tab ? "#0052ff" : "#eef0f3", color: filter===tab ? "#ffffff" : "#5b616e" }}>
              {tab === "all" ? "All" : STATUS_CFG[tab]?.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="size-6 animate-spin text-[#0052ff]" />
              <p className="text-[13px] text-[#7c828a]">Loading quotations...</p>
            </div>
          ) : filtered.map(q => {
            const { Icon } = STATUS_CFG[q.status];
            return (
              <div key={q.id} className="flex items-start gap-4 p-5 rounded-[24px] bg-white transition-all"
                style={{ border: "1px solid #dee1e6", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor="#c8cbd1"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="#dee1e6"; }}>

                <Link to={`/quotation/${q.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[15px] font-semibold" style={{ color: "#0a0b0d" }}>{q.number}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <p className="text-[13px] mb-0.5" style={{ color: "#7c828a" }}>{q.date}</p>
                  <p className="text-[14px] font-medium truncate" style={{ color: "#0a0b0d" }}>{q.customer}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#a8acb3" }}>{q.items} item{q.items > 1 ? "s" : ""}</p>
                </Link>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <p className="text-[17px] font-medium" style={{ color: "#0a0b0d", fontFamily: "'JetBrains Mono', monospace" }}>
                    ₹{q.amount.toLocaleString("en-IN")}
                  </p>
                  <button onClick={e => { e.preventDefault(); setActiveQ(q); setShowStatus(true); }}
                    className="cursor-pointer size-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "#eef0f3" }}
                    onMouseEnter={e => e.currentTarget.style.background="#dee1e6"}
                    onMouseLeave={e => e.currentTarget.style.background="#eef0f3"}>
                    <MoreHorizontal className="size-4" style={{ color: "#5b616e" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#eef0f3" }}>
              <Receipt className="size-6" style={{ color: "#a8acb3" }} />
            </div>
            <p className="text-[16px] font-semibold mb-1" style={{ color: "#0a0b0d" }}>No quotations</p>
            <p className="text-[14px] mb-6" style={{ color: "#5b616e" }}>Create your first quotation to get started</p>
            <Link to="/quotation/create">
              <button className="cursor-pointer inline-flex items-center gap-2 px-6 text-[14px] font-semibold text-white transition-all"
                style={{ background: "#0052ff", borderRadius: 100, height: 44 }}
                onMouseEnter={e => e.currentTarget.style.background="#003ecc"}
                onMouseLeave={e => e.currentTarget.style.background="#0052ff"}>
                <Plus className="size-4" /> New Quotation
              </button>
            </Link>
          </div>
        )}
        <div className="h-4" />
      </div>

      <StatusSheet open={showStatus} onClose={() => setShowStatus(false)} quotation={activeQ} onStatusChange={changeStatus} onDelete={deleteQ} onDownloadPdf={downloadPdf} />

      {/* ── Paytm-style floating FAB — mobile only ── */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pb-[env(safe-area-inset-bottom)]">
        <Link to="/quotation/create">
          <button
            className="cursor-pointer inline-flex items-center gap-2.5 px-7 text-[15px] font-semibold text-white active:scale-[0.97] transition-transform"
            style={{
              background: "#0052ff",
              borderRadius: 100,
              height: 52,
              boxShadow: "0 8px 28px rgba(0,82,255,0.45), 0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <Plus className="size-5" strokeWidth={2.5} />
            New Quotation
          </button>
        </Link>
      </div>
    </div>
  );
}
