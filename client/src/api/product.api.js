import api from "./api";

export const productApi = {
  getProducts: (companyId) => {
    return api.get("/product", { params: { companyId } });
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
