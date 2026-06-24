import api from "./api";

export const dispatchAddressApi = {
  getAddresses: (companyId) =>
    api.get("/dispatchAddress", { params: { companyId } }),

  getAddressById: (id) =>
    api.get(`/dispatchAddress/${id}`),

  createAddress: (data) =>
    api.post("/dispatchAddress", data),

  updateAddress: (id, data) =>
    api.patch(`/dispatchAddress/${id}`, data),

  deleteAddress: (id) =>
    api.delete(`/dispatchAddress/${id}`),
};
