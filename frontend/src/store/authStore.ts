import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { axiosInstance } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'
import type { Usuario } from '../features/auth/types'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        const form = new URLSearchParams({ username, password })
        await axiosInstance.post('/auth/token', form, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const { data } = await axiosInstance.get<Usuario>('/auth/me')
        set({ usuario: data })
      },
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout')
        } finally {
          queryClient.clear()
          set({ usuario: null })
        }
      },
      checkSession: async () => {
        try {
          const { data } = await axiosInstance.get<Usuario>('/auth/me')
          set({ usuario: data, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      limpiarSesion: () => {
        queryClient.clear()
        set({ usuario: null })
      },
    }),
    {
      name: 'auth',
      // Solo se guarda el usuario; el token vive en la cookie HttpOnly.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
