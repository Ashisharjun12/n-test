/** Resolve selling price from API or legacy compat fields */
export function getProductPrice(product) {
  return Number(product?.sellingPrice ?? product?.price ?? 0);
}

/** Resolve tax rate (%). Never use gst — that field stores GSTIN on products */
export function getProductTaxRate(product) {
  return Number(product?.taxRate ?? 0);
}

/** Normalize a product for quotation line-item math */
export function normalizeProductForQuotation(product, qty = 1) {
  return {
    ...product,
    _id: product._id || product.id,
    qty,
    sellingPrice: getProductPrice(product),
    taxRate: getProductTaxRate(product),
  };
}

/** Strip UI-only / compat fields before POST/PATCH to product API */
export function stripProductApiPayload(data) {
  const {
    id,
    _id,
    price,
    stock,
    qty,
    category,
    categoryName,
    createdAt,
    updatedAt,
    __v,
    ...rest
  } = data;
  return rest;
}
