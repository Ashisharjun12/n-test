import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Pencil, Loader2 } from "lucide-react";
import { quotationApi } from "../../../api/quotation.api";

export default function QuotationPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    quotationApi
      .getPreviewHtml(id)
      .then((res) => setHtml(res.data))
      .catch((err) => setError(err.message || "Failed to load preview"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const res = await quotationApi.downloadPdf(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef0f3]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-md shrink-0"
        style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #dee1e6", height: 64 }}
      >
        <div className="max-w-4xl mx-auto px-5 h-full flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            className="cursor-pointer text-[#5b616e] hover:text-[#0a0b0d] transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-[16px] font-semibold flex-1 text-[#0a0b0d]">Quotation Preview</h1>
          <Link
            to={`/quotation/${id}/edit`}
            className="cursor-pointer flex items-center gap-1.5 text-[13px] font-semibold text-[#0052ff] hover:text-[#003ecc]"
          >
            <Pencil className="size-3.5" /> Edit
          </Link>
        </div>
      </div>

      {/* Preview body */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-[#0052ff]" />
              <p className="text-[14px] text-[#7c828a]">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[14px] text-[#cf202f]">{error}</p>
            </div>
          ) : (
            <div
              className="flex-1 bg-white rounded-[12px] overflow-hidden shadow-sm border border-[#dee1e6]"
              style={{ minHeight: "70vh" }}
            >
              <iframe
                title="Quotation preview"
                srcDoc={html}
                className="w-full h-full border-0"
                style={{ minHeight: "70vh" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      {!loading && !error && (
        <div
          className="sticky bottom-0 shrink-0 border-t border-[#dee1e6] bg-white/95 backdrop-blur-md px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/quotation/${id}`)}
              className="cursor-pointer flex-1 h-[52px] rounded-[100px] text-[15px] font-semibold border border-[#dee1e6] text-[#0a0b0d] bg-white hover:bg-[#f7f7f7] transition-colors"
            >
              Back to View
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={handleExportPdf}
              className="cursor-pointer flex-1 h-[52px] rounded-[100px] text-[15px] font-semibold text-white bg-[#0052ff] hover:bg-[#003ecc] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {exporting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Download className="size-4" /> Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
