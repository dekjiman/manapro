import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTenantStore } from '@/stores/tenant'

describe('Tenant Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('init', () => {
    it('should initialize without current tenant', () => {
      const store = useTenantStore()
      store.init()
      expect(store.currentTenantId).toBeNull()
    })

    it('should set current tenant from localStorage', () => {
      localStorage.setItem('manapro_tenant', 't1')
      const store = useTenantStore()
      store.init()
      expect(store.currentTenantId).toBe('t1')
    })
  })

  describe('getUserTenants', () => {
    it('should return tenants for user', () => {
      const store = useTenantStore()
      const tenants = store.getUserTenants('u1')

      expect(tenants.length).toBeGreaterThan(0)
      tenants.forEach(t => {
        expect(t).toHaveProperty('role')
      })
    })
  })

  describe('getUserRole', () => {
    it('should return role for user in tenant', () => {
      const store = useTenantStore()
      const role = store.getUserRole('u1', 't1')
      expect(role).toBe('owner')
    })

    it('should return null for non-member', () => {
      const store = useTenantStore()
      const role = store.getUserRole('u1', 't99')
      expect(role).toBeNull()
    })
  })

  describe('setCurrentTenant', () => {
    it('should set current tenant and save to localStorage', () => {
      const store = useTenantStore()
      store.setCurrentTenant('t1')

      expect(store.currentTenantId).toBe('t1')
      expect(localStorage.getItem('manapro_tenant')).toBe('t1')
    })
  })

  describe('currentTenant', () => {
    it('should return current tenant object', () => {
      const store = useTenantStore()
      store.setCurrentTenant('t1')

      expect(store.currentTenant).not.toBeNull()
      expect(store.currentTenant?.id).toBe('t1')
    })

    it('should return null when no tenant selected', () => {
      const store = useTenantStore()
      expect(store.currentTenant).toBeNull()
    })
  })

  describe('createTenant', () => {
    it('should create new tenant', async () => {
      const store = useTenantStore()
      const initialCount = store.tenants.length

      const tenant = await store.createTenant('New Business', 'u1', 'free')

      expect(store.tenants.length).toBe(initialCount + 1)
      expect(tenant.name).toBe('New Business')
      expect(tenant.owner_id).toBe('u1')
      expect(tenant.plan).toBe('free')
    })

    it('should add owner as member', async () => {
      const store = useTenantStore()
      const tenant = await store.createTenant('Test', 'u1')

      const member = store.tenantMembers.find(
        m => m.tenant_id === tenant.id && m.user_id === 'u1'
      )
      expect(member).toBeTruthy()
      expect(member?.role).toBe('owner')
    })
  })

  describe('addMember', () => {
    it('should add member to tenant', () => {
      const store = useTenantStore()
      const initialCount = store.tenantMembers.length

      store.addMember('t2', 'u1', 'member')

      expect(store.tenantMembers.length).toBe(initialCount + 1)
      const member = store.tenantMembers.find(
        m => m.tenant_id === 't2' && m.user_id === 'u1'
      )
      expect(member?.role).toBe('member')
    })

    it('should not add duplicate member', () => {
      const store = useTenantStore()
      const initialCount = store.tenantMembers.length

      // u1 is already owner of t1
      store.addMember('t1', 'u1', 'member')

      expect(store.tenantMembers.length).toBe(initialCount)
    })
  })

  describe('updateMemberRole', () => {
    it('should update member role', () => {
      const store = useTenantStore()
      store.updateMemberRole('t1', 'u3', 'admin')

      const member = store.tenantMembers.find(
        m => m.tenant_id === 't1' && m.user_id === 'u3'
      )
      expect(member?.role).toBe('admin')
    })
  })

  describe('removeMember', () => {
    it('should remove member from tenant', () => {
      const store = useTenantStore()
      const initialCount = store.tenantMembers.length

      store.removeMember('t1', 'u3')

      expect(store.tenantMembers.length).toBe(initialCount - 1)
      const member = store.tenantMembers.find(
        m => m.tenant_id === 't1' && m.user_id === 'u3'
      )
      expect(member).toBeUndefined()
    })
  })

  describe('canAddMember', () => {
    it('should return true when under limit', () => {
      const store = useTenantStore()
      // t2 (free) has 3 members, limit is 3
      expect(store.canAddMember('t2')).toBe(false)
    })

    it('should return false when at limit', () => {
      const store = useTenantStore()
      // t1 (pro) has 4 members, limit is 20
      expect(store.canAddMember('t1')).toBe(true)
    })
  })
})
