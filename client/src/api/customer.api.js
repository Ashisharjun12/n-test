import api from "./api";

export const customerApi = {
  getCustomers: (companyId, { page = 1, limit = 20, search = "" } = {}) =>
    api.get("/customer", { params: { companyId, page, limit, search } }),

  getCustomerById: (id) =>
    api.get(`/customer/${id}`),

  createCustomer: (data) =>
    api.post("/customer", data),

  updateCustomer: (id, data) =>
    api.patch(`/customer/${id}`, data),

  deleteCustomer: (id) =>
    api.delete(`/customer/${id}`),
};
