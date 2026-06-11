import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMyCompanies, createCompany as createCompanyApi, updateCompany as updateCompanyApi, deleteCompany as deleteCompanyApi } from '../api/company.api'

const useCompanyStore = create(
  persist(
    (set, get) => ({
      companies: [],          // all companies for this user
      activeCompany: null,    // currently selected company
      isLoading: false,
      error: null,

      // Fetch all companies for a user
      fetchCompanies: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const companies = await getMyCompanies(userId)
          set({
            companies,
            // auto-select first if no active company yet
            activeCompany: get().activeCompany || companies[0] || null,
            isLoading: false,
          })
        } catch (err) {
          set({ isLoading: false, error: err.message })
        }
      },

      // Set which company is "active"
      setActiveCompany: (company) => set({ activeCompany: company }),

      // Create a new company
      addCompany: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const company = await createCompanyApi(payload)
          set((s) => ({
            companies: [...s.companies, company],
            activeCompany: s.activeCompany ?? company, // set as active if none
            isLoading: false,
          }))
          return company
        } catch (err) {
          set({ isLoading: false, error: err.message })
          throw err
        }
      },

      // Update an existing company
      updateCompany: async (id, payload) => {
        set({ isLoading: true, error: null })
        try {
          const updatedCompany = await updateCompanyApi(id, payload)
          set((s) => {
            const newCompanies = s.companies.map(c => c._id === id ? updatedCompany : c)
            return {
              companies: newCompanies,
              activeCompany: s.activeCompany?._id === id ? updatedCompany : s.activeCompany,
              isLoading: false,
            }
          })
          return updatedCompany
        } catch (err) {
          set({ isLoading: false, error: err.message })
          throw err
        }
      },

      // Delete a company
      deleteCompany: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await deleteCompanyApi(id)
          set((s) => {
            const newCompanies = s.companies.filter(c => c._id !== id)
            let newActive = s.activeCompany
            if (s.activeCompany?._id === id) {
              newActive = newCompanies[0] || null
            }
            return {
              companies: newCompanies,
              activeCompany: newActive,
              isLoading: false,
            }
          })
        } catch (err) {
          set({ isLoading: false, error: err.message })
          throw err
        }
      },

      clearError: () => set({ error: null }),
      reset: () => set({ companies: [], activeCompany: null }),
    }),
    {
      name: 'nero-company',
      partialize: (state) => ({
        activeCompany: state.activeCompany,
      }),
    }
  )
)

export default useCompanyStore
