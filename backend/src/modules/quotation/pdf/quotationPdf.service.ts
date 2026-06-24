import fs from "fs";
import ejs from "ejs";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../../../shared/errors/apiError.js";
import { IQuotationRepository } from "../quotation.interface.js";
import { IQuotation } from "../quotation.schema.js";
import { computeTaxBreakdown } from "../utils/quotationTaxUtils.js";
import { formatPlaceOfSupply, getStateFromGstin } from "../utils/stateCodes.js";
import { amountInWordsINR } from "../utils/amountInWords.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTemplatePath(): string {
  const candidates = [
    path.join(__dirname, "quotationPdf.template.ejs"),
    path.join(process.cwd(), "src/modules/quotation/pdf/quotationPdf.template.ejs"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Quotation PDF template not found");
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d?: Date | string): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAddress(addr?: Record<string, unknown>): string {
  if (!addr) return "";
  const parts = [
    addr.line1 || addr.addressLine1,
    addr.line2 || addr.addressLine2,
    addr.city,
    addr.state,
    addr.pincode,
  ].filter(Boolean);
  return parts.join(", ");
}

async function buildTemplateData(quotation: IQuotation) {
  const company = quotation.companyId as unknown as Record<string, unknown>;
  const customer = quotation.customer as unknown as Record<string, unknown>;
  const bank = quotation.bank as unknown as Record<string, unknown> | null;
  const billingAddr = customer?.billingAddress as Record<string, unknown> | undefined;

  const companyState =
    (company?.billingAddress as Record<string, unknown> | undefined)?.state?.toString() ||
    getStateFromGstin(company?.gst as string);
  const customerState =
    billingAddr?.state?.toString() || getStateFromGstin(customer?.gst as string);

  const withGst = quotation.withGst !== false;
  const tax = computeTaxBreakdown(quotation.items, withGst, companyState, customerState);

  const extraChargesTotal = (quotation.extraCharges || []).reduce(
    (s, c) => s + (c.amount ?? 0),
    0
  );
  const extraChargeLines = (quotation.extraCharges || [])
    .filter((c) => (c.amount ?? 0) > 0)
    .map((c) => ({
      label:
        c.label ||
        (c.type === "shipping"
          ? "Delivery / Shipping Charges"
          : c.type === "packaging"
            ? "Packaging Charges"
            : "Additional Charge"),
      amount: fmt(c.amount ?? 0),
    }));
  const grandTotal =
    quotation.totalAmount ?? tax.taxableAmount + tax.totalTax + extraChargesTotal;

  const items = quotation.items.map((item) => {
    const qty = item.quantity ?? 0;
    const price = item.price ?? 0;
    return {
      name: item.name || "",
      description: item.description || "",
      hsn: item.hsn || "",
      price: fmt(price),
      qty: `${qty} ${item.unit || "PCS"}`,
      gross: fmt(qty * price),
    };
  });

  const totalQty = quotation.items.reduce((s, i) => s + (i.quantity ?? 0), 0);

  let qrDataUrl = "";
  const upi = bank?.upi as string | undefined;
  if (upi) {
    const upiLink = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent((company?.name as string) || "Payee")}&am=${grandTotal.toFixed(2)}`;
    qrDataUrl = await QRCode.toDataURL(upiLink, { width: 200, margin: 1 });
  }

  const placeOfSupply =
    quotation.placeOfSupply ||
    formatPlaceOfSupply(billingAddr?.state as string, customer?.gst as string);

  const termsList = (quotation.terms || "")
    .split(/\n+/)
    .map((t) => t.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  return {
    docTitle: (quotation.documentTitle || "Quotation").toUpperCase(),
    company: {
      name: company?.tradeName || company?.name || "",
      gst: company?.gst || "",
      pan: company?.pan || "",
      logo: company?.logo || "",
      phone: company?.phone || "",
      altPhone: company?.alternatePhone || "",
      email: company?.email || "",
      website: company?.website || "",
      address: formatAddress(company?.billingAddress as Record<string, unknown>),
    },
    customer: {
      name: customer?.name || "",
      companyName: customer?.companyName || "",
      address: formatAddress(billingAddr),
    },
    quotation: {
      quotationNo: quotation.quotationNo || "",
      documentDate: fmtDate(quotation.documentDate || quotation.createdAt),
      dueDate: fmtDate(quotation.dueDate),
      placeOfSupply,
      reference: quotation.reference || "",
      notes: quotation.notes || "",
    },
    extraChargeLines,
    items,
    totalItems: quotation.items.length,
    totalQty,
    tax: {
      cgstRate: tax.cgstRate.toFixed(1),
      sgstRate: tax.sgstRate.toFixed(1),
      igstRate: tax.igstRate.toFixed(1),
      cgst: fmt(tax.cgstAmount),
      sgst: fmt(tax.sgstAmount),
      igst: fmt(tax.igstAmount),
    },
    totals: {
      taxable: fmt(tax.taxableAmount),
      grand: fmt(grandTotal),
    },
    amountWords: amountInWordsINR(grandTotal),
    bank: bank
      ? {
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
          ifsc: bank.ifsc,
          branch: bank.branch,
          upi: bank.upi,
        }
      : null,
    signature: quotation.signature || (company?.signature as Record<string, unknown>) || null,
    qrDataUrl,
    termsList,
    filename: `${(quotation.quotationNo || "quotation").replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`,
  };
}

export class QuotationPdfService {
  constructor(private readonly quotationRepo: IQuotationRepository) {}

  async renderHtml(id: string): Promise<{ html: string; filename: string }> {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) throw ApiError.notFound("Quotation not found.");

    const data = await buildTemplateData(quotation);
    const { filename, ...templateVars } = data;
    const html = await ejs.renderFile(getTemplatePath(), templateVars);
    return { html, filename };
  }

  async generate(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const { html, filename } = await this.renderHtml(id);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
      });
      return { buffer: Buffer.from(buffer), filename };
    } finally {
      await browser.close();
    }
  }
}
