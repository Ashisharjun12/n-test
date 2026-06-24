import api from "./api";

export const productApi = {
  getProducts: (companyId, { page = 1, limit = 20, search = "" } = {}) => {
    return api.get("/product", { params: { companyId, page, limit, search } });
  },
  getProductById: (id) => {
    return api.get(`/product/${id}`);
  },
  createProduct: (data) => {
    return api.post("/product", data);
  },
  updateProduct: (id, data) => {
    return api.patch(`/product/${id}`, data);
  },
  deleteProduct: (id) => {
    return api.delete(`/product/${id}`);
  },
  getSettings: (companyId) => {
    return api.get("/product/settings", { params: { companyId } });
  },
  updateSettings: (companyId, data) => {
    return api.put("/product/settings", data, { params: { companyId } });
  }
};
