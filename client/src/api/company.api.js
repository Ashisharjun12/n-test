import api from './api'

// GET /api/v1/company?userId=xxx
export const getMyCompanies = async (userId) => {
  const { data } = await api.get('/company', { params: { userId } })
  return data.data
}

// GET /api/v1/company/:id
export const getCompanyById = async (id) => {
  const { data } = await api.get(`/company/${id}`)
  return data.data
}

// POST /api/v1/company
export const createCompany = async (payload) => {
  const { data } = await api.post('/company', payload)
  return data.data
}

// PATCH /api/v1/company/:id
export const updateCompany = async (id, payload) => {
  const { data } = await api.patch(`/company/${id}`, payload)
  return data.data
}

// DELETE /api/v1/company/:id
export const deleteCompany = async (id) => {
  const { data } = await api.delete(`/company/${id}`)
  return data
}
