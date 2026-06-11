import api from './api'

// POST /api/v1/auth/login
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data.data   // { user }
}

// POST /api/v1/auth/logout
export const logout = async () => {
  const { data } = await api.post('/auth/logout')
  return data
}
