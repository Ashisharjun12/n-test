export type TaxBreakdown = {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  totalTax: number;
  isInterState: boolean;
};

export type QuotationLineItem = {
  quantity?: number;
  price?: number;
  taxRate?: number;
  total?: number;
};

function normalizeState(s?: string): string {
  return (s || "").trim().toUpperCase();
}

export function isInterState(companyState?: string, customerState?: string): boolean {
  const a = normalizeState(companyState);
  const b = normalizeState(customerState);
  if (!a || !b) return false;
  return a !== b;
}

export function computeTaxBreakdown(
  items: QuotationLineItem[],
  withGst: boolean,
  companyState?: string,
  customerState?: string
): TaxBreakdown {
  let taxableAmount = 0;
  let totalTax = 0;
  let weightedRate = 0;

  for (const item of items) {
    const qty = item.quantity ?? 0;
    const price = item.price ?? 0;
    const lineSub = qty * price;
    const rate = withGst ? (item.taxRate ?? 0) : 0;
    const lineTax = (lineSub * rate) / 100;
    taxableAmount += lineSub;
    totalTax += lineTax;
    if (lineSub > 0) weightedRate = rate;
  }

  const inter = isInterState(companyState, customerState);

  if (inter) {
    return {
      taxableAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: totalTax,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: weightedRate,
      totalTax,
      isInterState: true,
    };
  }

  const halfRate = weightedRate / 2;
  return {
    taxableAmount,
    cgstAmount: totalTax / 2,
    sgstAmount: totalTax / 2,
    igstAmount: 0,
    cgstRate: halfRate,
    sgstRate: halfRate,
    igstRate: 0,
    totalTax,
    isInterState: false,
  };
}
