import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login as loginApi, logout as logoutApi } from '../api/auth.api'
import { registerUser } from '../api/user.api'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register new user
      register: async ({ name, email, password }) => {
        set({ isLoading: true, error: null })
        try {
          const user = await registerUser({ name, email, password })
          set({ isLoading: false })
          return user
        } catch (err) {
          set({ isLoading: false, error: err.message })
          throw err
        }
      },

      // Login
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null })
        try {
          const { user } = await loginApi({ email, password })
          set({ user, isAuthenticated: true, isLoading: false, error: null })
          return user
        } catch (err) {
          set({ isLoading: false, error: err.message, isAuthenticated: false })
          throw err
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true })
        try {
          await logoutApi()
        } catch (_) {
          // ignore logout errors — clear state anyway
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false, error: null })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nero-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
