import api from './api'

// POST /api/v1/user  (register)
export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post('/user', { name, email, password })
  return data.data
}

// GET /api/v1/user
export const getAllUsers = async () => {
  const { data } = await api.get('/user')
  return data.data
}

// GET /api/v1/user/:id
export const getUserById = async (id) => {
  const { data } = await api.get(`/user/${id}`)
  return data.data
}

// PATCH /api/v1/user/:id
export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/user/${id}`, payload)
  return data.data
}

// PATCH /api/v1/user/:id/role
export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/user/${id}/role`, { role })
  return data.data
}

// DELETE /api/v1/user/:id
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/user/${id}`)
  return data
}
