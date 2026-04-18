import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { api } from '@/services/api'
import usersData from '@/mock/users.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const useAuthStore = defineStore('auth', () => {
  const users = ref<User[]>(usersData as User[])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!currentUser.value)

  function init() {
    const stored = localStorage.getItem('manapro_user')
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored)
      } catch {
        localStorage.removeItem('manapro_user')
      }
    }
  }

  async function fetchUserTenants() {
    if (USE_MOCK || !currentUser.value) return
    try {
      const { useTenantStore } = await import('./tenant')
      const tenantStore = useTenantStore()
      await tenantStore.fetchTenants()
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    if (USE_MOCK) {
      const user = users.value.find(u => u.email === email)
      if (user && password.length >= 6) {
        currentUser.value = user
        localStorage.setItem('manapro_user', JSON.stringify(user))
        isLoading.value = false
        return true
      }
      error.value = 'Email atau kata sandi salah'
      isLoading.value = false
      return false
    }

    try {
      const data = await api.post<{ user: User; accessToken: string }>('/auth/login', { email, password })
      currentUser.value = data.user
      localStorage.setItem('manapro_user', JSON.stringify(data.user))
      localStorage.setItem('manapro_token', data.accessToken)

      // Fetch user's tenants from backend
      await fetchUserTenants()

      isLoading.value = false
      return true
    } catch (err: any) {
      error.value = err.message || 'Login gagal'
      isLoading.value = false
      return false
    }
  }

  async function register(name: string, email: string, _password: string, invitationToken?: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    if (USE_MOCK) {
      const exists = users.value.find(u => u.email === email)
      if (exists) {
        error.value = 'Email sudah terdaftar'
        isLoading.value = false
        return false
      }

      // Add user but don't log in - wait for email verification
      const newUser: User = {
        id: `u${Date.now()}`,
        name,
        email,
        current_tenant_id: null,
        tenant_ids: [],
        avatar: '',
        divisi: '',
        jabatan: '',
        phone: '',
        language_pref: 'id',
        email_verified: false // Assume added to User type
      }

      users.value.push(newUser)
      isLoading.value = false
      return true
    }

    try {
      const data = await api.post<{ user: User; accessToken?: string }>('/auth/register', { name, email, password: _password, invitationToken })
      if (invitationToken && data.accessToken) {
        // Auto-login for invited users
        currentUser.value = data.user
        localStorage.setItem('manapro_user', JSON.stringify(data.user))
        localStorage.setItem('manapro_token', data.accessToken)

        // Fetch user's tenants
        await fetchUserTenants()
      }
      isLoading.value = false
      return true
    } catch (err: any) {
      error.value = err.message || 'Registrasi gagal'
      isLoading.value = false
      return false
    }
  }

  function setCurrentTenant(tenantId: string) {
    if (currentUser.value) {
      currentUser.value.current_tenant_id = tenantId
      if (!currentUser.value.tenant_ids) {
        currentUser.value.tenant_ids = []
      }
      if (!currentUser.value.tenant_ids.includes(tenantId)) {
        currentUser.value.tenant_ids.push(tenantId)
      }
      localStorage.setItem('manapro_user', JSON.stringify(currentUser.value))
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('manapro_user')
    localStorage.removeItem('manapro_token')
    localStorage.removeItem('manapro_tenant')
  }

  async function updateProfile(data: Partial<User>) {
    if (!currentUser.value) return

    if (USE_MOCK) {
      currentUser.value = { ...currentUser.value, ...data }
      localStorage.setItem('manapro_user', JSON.stringify(currentUser.value))
      return
    }

    try {
      const updated = await api.patch<User>('/users/me', data)
      currentUser.value = { ...currentUser.value, ...updated }
      localStorage.setItem('manapro_user', JSON.stringify(currentUser.value))
    } catch (err: any) {
      error.value = err.message || 'Update gagal'
    }
  }

  async function refreshProfile() {
    if (!currentUser.value) return
    if (USE_MOCK) return

    try {
      const user = await api.get<User>('/auth/me')
      currentUser.value = { ...currentUser.value, ...user }
      localStorage.setItem('manapro_user', JSON.stringify(currentUser.value))
    } catch { /* ignore */ }
  }

  function clearError() {
    error.value = null
  }

  return {
    users,
    currentUser,
    isLoading,
    error,
    isLoggedIn,
    init,
    login,
    register,
    setCurrentTenant,
    logout,
    updateProfile,
    refreshProfile,
    clearError
  }
})
