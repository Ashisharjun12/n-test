import api from "./api";

export const bankApi = {
  getBanks: (companyId) =>
    api.get("/bank", { params: { companyId } }),

  getBankById: (id) =>
    api.get(`/bank/${id}`),

  createBank: (data) =>
    api.post("/bank", data),

  updateBank: (id, data) =>
    api.patch(`/bank/${id}`, data),

  setDefault: (id, companyId) =>
    api.patch(`/bank/${id}/default`, { companyId }),

  deleteBank: (id) =>
    api.delete(`/bank/${id}`),
};
