import apiClient from "./api";

export const categoryApi = {
  getCategories: async (companyId) => {
    const response = await apiClient.get(`/product/category`, {
      params: { companyId }
    });
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await apiClient.get(`/product/category/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await apiClient.post(`/product/category`, data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await apiClient.patch(`/product/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/product/category/${id}`);
    return response.data;
  }
};
