export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Final line amount incl. charge tax logic */
export function computeChargeAmount({ rawValue, valueMode, taxRate, taxInclusive, baseSubtotal }) {
  let base = valueMode === "percent" ? (baseSubtotal * rawValue) / 100 : rawValue;
  if (taxRate > 0 && !taxInclusive) base += (base * taxRate) / 100;
  return round2(base);
}

export function getChargeLabel(charge) {
  if (charge?.label) return charge.label;
  if (charge?.type === "shipping") return "Delivery / Shipping Charges";
  if (charge?.type === "packaging") return "Packaging Charges";
  return "Additional Charge";
}

export function findChargeByType(extraCharges, type) {
  if (!extraCharges?.length) return null;
  const byType = extraCharges.find((c) => c.type === type);
  if (byType) return byType;
  if (type === "shipping") return extraCharges.find((c) => c.label === "Shipping") || null;
  if (type === "packaging") return extraCharges.find((c) => c.label === "Packaging") || null;
  return null;
}

export function normalizeLegacyCharge(charge) {
  if (!charge) return null;
  const type =
    charge.type ||
    (charge.label === "Shipping" ? "shipping" : charge.label === "Packaging" ? "packaging" : "other");
  return {
    type,
    label: charge.label || getChargeLabel({ type }),
    rawValue: charge.rawValue ?? charge.amount ?? 0,
    valueMode: charge.valueMode || "flat",
    taxRate: charge.taxRate ?? 0,
    taxInclusive: charge.taxInclusive ?? false,
    amount: charge.amount ?? charge.rawValue ?? 0,
  };
}

export function buildChargePayload(charge, baseSubtotal) {
  const rawValue = parseFloat(charge?.rawValue) || 0;
  if (!charge || rawValue <= 0) return null;
  const valueMode = charge.valueMode || "flat";
  const taxRate = charge.taxRate ?? 0;
  const taxInclusive = charge.taxInclusive ?? false;
  const amount = computeChargeAmount({ rawValue, valueMode, taxRate, taxInclusive, baseSubtotal });
  return {
    type: charge.type || "other",
    label: charge.label || getChargeLabel(charge),
    rawValue,
    valueMode,
    taxRate,
    taxInclusive,
    amount,
  };
}

/** Live preview: base, tax portion, and total for the charge sheet */
export function summarizeCharge(charge, baseSubtotal) {
  const rawValue = parseFloat(charge?.rawValue) || 0;
  const valueMode = charge?.valueMode || "flat";
  const taxRate = charge?.taxRate ?? 0;
  const taxInclusive = charge?.taxInclusive ?? false;

  let baseBeforeTax = valueMode === "percent" ? (baseSubtotal * rawValue) / 100 : rawValue;
  let taxAmount = 0;
  let total = baseBeforeTax;

  if (taxRate > 0) {
    if (taxInclusive) {
      total = baseBeforeTax;
      taxAmount = total - total / (1 + taxRate / 100);
      baseBeforeTax = total - taxAmount;
    } else {
      taxAmount = (baseBeforeTax * taxRate) / 100;
      total = baseBeforeTax + taxAmount;
    }
  }

  return {
    baseBeforeTax: round2(baseBeforeTax),
    taxAmount: round2(taxAmount),
    total: round2(total),
  };
}

export const CHARGE_TAX_RATES = [0, 5, 12, 18, 28];

export const EMPTY_CHARGE = {
  rawValue: "",
  valueMode: "flat",
  taxRate: 0,
  taxInclusive: false,
};
