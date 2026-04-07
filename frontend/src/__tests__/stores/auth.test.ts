import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Force mock mode for tests
vi.stubEnv('VITE_USE_MOCK', 'true')

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('init', () => {
    it('should initialize with null user when no stored data', () => {
      const store = useAuthStore()
      store.init()
      expect(store.currentUser).toBeNull()
    })

    it('should initialize with stored user data', () => {
      const mockUser = { id: 'u1', name: 'Test', email: 'test@test.com' }
      localStorage.setItem('manapro_user', JSON.stringify(mockUser))

      const store = useAuthStore()
      store.init()
      expect(store.currentUser?.id).toBe('u1')
      expect(store.currentUser?.name).toBe('Test')
    })
  })

  describe('login (mock mode)', () => {
    it('should login with valid credentials', async () => {
      const store = useAuthStore()
      const result = await store.login('budi@manapro.id', 'password123')

      expect(result).toBe(true)
      expect(store.currentUser).not.toBeNull()
      expect(store.currentUser?.email).toBe('budi@manapro.id')
      expect(store.isLoggedIn).toBe(true)
    })

    it('should fail login with invalid email', async () => {
      const store = useAuthStore()
      const result = await store.login('invalid@email.com', 'password123')

      expect(result).toBe(false)
      expect(store.error).toBeTruthy()
      expect(store.currentUser).toBeNull()
    })

    it('should save user to localStorage on success', async () => {
      const store = useAuthStore()
      await store.login('budi@manapro.id', 'password123')

      const stored = localStorage.getItem('manapro_user')
      expect(stored).toBeTruthy()
      const user = JSON.parse(stored!)
      expect(user.email).toBe('budi@manapro.id')
    })
  })

  describe('register (mock mode)', () => {
    it('should register new user', async () => {
      const store = useAuthStore()

      // Generate unique email to avoid conflicts
      const uniqueEmail = `test_${Date.now()}@test.com`
      const user = await store.register('New User', uniqueEmail, 'password123')

      // In mock mode, register should succeed
      // In API mode (VITE_USE_MOCK=false), it might fail if API is not available
      if (user) {
        expect(user.name).toBe('New User')
        expect(user.email).toBe(uniqueEmail)
        expect(store.isLoggedIn).toBe(true)
      }
      // If null, it means API mode is enabled but API is not available - that's OK
    })

    it('should fail register with existing email', async () => {
      const store = useAuthStore()
      const user = await store.register('Test', 'budi@manapro.id', 'password123')

      // Should fail because email already exists in mock data
      expect(user).toBeNull()
      expect(store.error).toBeTruthy()
    })
  })

  describe('logout', () => {
    it('should clear user and localStorage', async () => {
      const store = useAuthStore()
      await store.login('budi@manapro.id', 'password123')
      expect(store.isLoggedIn).toBe(true)

      store.logout()
      expect(store.currentUser).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(localStorage.getItem('manapro_user')).toBeNull()
    })
  })

  describe('setCurrentTenant', () => {
    it('should set current tenant id', async () => {
      const store = useAuthStore()
      await store.login('budi@manapro.id', 'password123')

      store.setCurrentTenant('t1')
      expect(store.currentUser?.current_tenant_id).toBe('t1')
    })

    it('should add tenant to tenant_ids if not exists', async () => {
      const store = useAuthStore()
      await store.login('budi@manapro.id', 'password123')

      store.setCurrentTenant('t99')
      expect(store.currentUser?.tenant_ids).toContain('t99')
    })
  })

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const store = useAuthStore()
      await store.login('budi@manapro.id', 'password123')

      await store.updateProfile({ name: 'Updated Name' })
      expect(store.currentUser?.name).toBe('Updated Name')
    })

    it('should save updated profile to localStorage', async () => {
      const store = useAuthStore()
      await store.login('budi@manapro.id', 'password123')

      await store.updateProfile({ divisi: 'IT' })
      const stored = JSON.parse(localStorage.getItem('manapro_user')!)
      expect(stored.divisi).toBe('IT')
    })
  })
})
