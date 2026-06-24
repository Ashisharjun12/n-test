import api from "./api";

export const quotationApi = {
  getQuotations: (companyId) =>
    api.get("/quotation", { params: { companyId } }),

  getQuotationById: (id) =>
    api.get(`/quotation/${id}`),

  createQuotation: (data) =>
    api.post("/quotation", data),

  updateQuotation: (id, data) =>
    api.patch(`/quotation/${id}`, data),

  deleteQuotation: (id) =>
    api.delete(`/quotation/${id}`),

  downloadPdf: (id) =>
    api.get(`/quotation/${id}/pdf`, { responseType: "blob" }),

  getPreviewHtml: (id) =>
    api.get(`/quotation/${id}/preview`, { responseType: "text" }),
};
