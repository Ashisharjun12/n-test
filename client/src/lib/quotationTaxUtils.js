/** Normalize state name for comparison */
function norm(s) {
  return (s || "").trim().toUpperCase();
}

export function isInterState(companyState, customerState) {
  const a = norm(companyState);
  const b = norm(customerState);
  if (!a || !b) return false;
  return a !== b;
}

export function computeLineSubtotal(items, getPrice, getQty) {
  return items.reduce((s, p) => s + getPrice(p) * getQty(p), 0);
}

export function computeGstTotal(items, getPrice, getQty, getTaxRate, withGst = true) {
  if (!withGst) return 0;
  return items.reduce(
    (s, p) => s + (getPrice(p) * getQty(p) * getTaxRate(p)) / 100,
    0
  );
}

/** Split GST into CGST/SGST (intra) or IGST (inter) */
export function splitGst(items, getPrice, getQty, getTaxRate, withGst, companyState, customerState) {
  const taxable = computeLineSubtotal(items, getPrice, getQty);
  const totalTax = computeGstTotal(items, getPrice, getQty, getTaxRate, withGst);

  if (!withGst || totalTax === 0) {
    return { taxable, totalTax: 0, cgst: 0, sgst: 0, igst: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, isInterState: false };
  }

  const inter = isInterState(companyState, customerState);
  const avgRate = items.length ? getTaxRate(items[0]) : 0;

  if (inter) {
    return { taxable, totalTax, cgst: 0, sgst: 0, igst: totalTax, cgstRate: 0, sgstRate: 0, igstRate: avgRate, isInterState: true };
  }

  return {
    taxable,
    totalTax,
    cgst: totalTax / 2,
    sgst: totalTax / 2,
    igst: 0,
    cgstRate: avgRate / 2,
    sgstRate: avgRate / 2,
    igstRate: 0,
    isInterState: false,
  };
}

export function computeGrandTotal({
  subtotal,
  gstTotal,
  discount = 0,
  extraCharges = [],
  shipping = 0,
  additionalCharges = 0,
  roundOff = false,
}) {
  const fromArray = extraCharges.reduce((s, c) => s + (c.amount || 0), 0);
  const chargesTotal = extraCharges.length ? fromArray : shipping + additionalCharges;
  let total = subtotal + gstTotal - discount + chargesTotal;
  if (roundOff) total = Math.round(total);
  return total;
}
