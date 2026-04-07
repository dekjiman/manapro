import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tenant, TenantMember, TenantSettings } from '@/types'
import { api } from '@/services/api'
import tenantsData from '@/mock/tenants.json'
import tenantMembersData from '@/mock/tenantMembers.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const PLAN_LIMITS: Record<string, TenantSettings> = {
  free: {
    max_members: 3,
    max_projects: 2,
    custom_branding: false,
    audit_log: false,
    storage_limit_mb: 100,
    primary_color: null
  },
  pro: {
    max_members: 20,
    max_projects: 20,
    custom_branding: false,
    audit_log: false,
    storage_limit_mb: 5120,
    primary_color: null
  },
  enterprise: {
    max_members: 999,
    max_projects: 999,
    custom_branding: true,
    audit_log: true,
    storage_limit_mb: 51200,
    primary_color: '#2563EB'
  }
}

export const useTenantStore = defineStore('tenant', () => {
  const tenants = ref<Tenant[]>([])
  const tenantMembers = ref<TenantMember[]>([])
  const currentTenantId = ref<string | null>(null)
  const isLoading = ref(false)

  // Load from localStorage or mock data
  function loadData() {
    const storedTenants = localStorage.getItem('manapro_tenants')
    const storedMembers = localStorage.getItem('manapro_tenant_members')

    if (storedTenants && storedMembers) {
      try {
        tenants.value = JSON.parse(storedTenants)
        tenantMembers.value = JSON.parse(storedMembers)
      } catch {
        loadFromMock()
      }
    } else {
      loadFromMock()
    }
  }

  function loadFromMock() {
    tenants.value = tenantsData as Tenant[]
    tenantMembers.value = tenantMembersData as TenantMember[]
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem('manapro_tenants', JSON.stringify(tenants.value))
    localStorage.setItem('manapro_tenant_members', JSON.stringify(tenantMembers.value))
  }

  const currentTenant = computed(() =>
    tenants.value.find(t => t.id === currentTenantId.value) || null
  )

  const currentTenantMembers = computed(() =>
    tenantMembers.value.filter(m => m.tenant_id === currentTenantId.value)
  )

  function getUserTenants(userId: string) {
    const memberRecords = tenantMembers.value.filter(m => m.user_id === userId)
    return memberRecords.map(m => {
      const tenant = tenants.value.find(t => t.id === m.tenant_id)
      return { ...tenant, role: m.role }
    }).filter(Boolean) as (Tenant & { role: string })[]
  }

  function getUserRole(userId: string, tenantId: string): string | null {
    const member = tenantMembers.value.find(
      m => m.user_id === userId && m.tenant_id === tenantId
    )
    return member?.role || null
  }

  function setCurrentTenant(tenantId: string) {
    currentTenantId.value = tenantId
    localStorage.setItem('manapro_tenant', tenantId)
  }

  function init() {
    // Load data from localStorage
    loadData()

    // Restore current tenant
    const stored = localStorage.getItem('manapro_tenant')
    if (stored && tenants.value.find(t => t.id === stored)) {
      currentTenantId.value = stored
    }
  }

  async function fetchTenants() {
    if (USE_MOCK) return
    try {
      const data = await api.get<(Tenant & { role: string })[]>('/tenants/my')
      tenants.value = data.map(t => ({ ...t, id: t.id }))

      // Update tenant members from fetched data
      const members: TenantMember[] = []
      for (const t of data) {
        members.push({
          user_id: t.owner_id,
          tenant_id: t.id,
          role: t.role as TenantMember['role'],
          joined_at: t.created_at
        })
      }
      tenantMembers.value = members

      // Update user tenant_ids
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      if (authStore.currentUser) {
        authStore.currentUser.tenant_ids = data.map(t => t.id)
        if (data.length > 0 && !authStore.currentUser.current_tenant_id) {
          authStore.currentUser.current_tenant_id = data[0].id
        }
        localStorage.setItem('manapro_user', JSON.stringify(authStore.currentUser))
      }

      // Save to localStorage
      saveToStorage()
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    }
  }

  async function createTenant(name: string, ownerId: string, plan: 'free' | 'pro' | 'enterprise' = 'free'): Promise<Tenant> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const limits = PLAN_LIMITS[plan]

    let tenant: Tenant

    if (USE_MOCK) {
      // Mock mode: create locally
      tenant = {
        id: `t${Date.now()}`,
        name,
        slug,
        logo_url: null,
        owner_id: ownerId,
        plan,
        settings: { ...limits },
        created_at: new Date().toISOString().split('T')[0]
      }
      tenants.value.push(tenant)
      tenantMembers.value.push({
        user_id: ownerId,
        tenant_id: tenant.id,
        role: 'owner',
        joined_at: tenant.created_at
      })
      saveToStorage()
    } else {
      // API mode: create via backend
      try {
        const data = await api.post<Tenant>('/tenants', { name, slug, plan })
        tenant = data
        tenants.value.push(tenant)
        tenantMembers.value.push({
          user_id: ownerId,
          tenant_id: tenant.id,
          role: 'owner',
          joined_at: new Date().toISOString().split('T')[0]
        })
        saveToStorage()
      } catch (err) {
        console.error('Failed to create tenant:', err)
        // Fallback to mock
        tenant = {
          id: `t${Date.now()}`,
          name,
          slug,
          logo_url: null,
          owner_id: ownerId,
          plan,
          settings: { ...limits },
          created_at: new Date().toISOString().split('T')[0]
        }
        tenants.value.push(tenant)
        tenantMembers.value.push({
          user_id: ownerId,
          tenant_id: tenant.id,
          role: 'owner',
          joined_at: tenant.created_at
        })
        saveToStorage()
      }
    }

    return tenant
  }

  async function updateTenant(id: string, data: Partial<Tenant>) {
    // Update local state
    const index = tenants.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tenants.value[index] = { ...tenants.value[index], ...data }
    }

    // Persist to localStorage
    saveToStorage()

    // Sync ke backend API
    if (!USE_MOCK) {
      try {
        await api.patch(`/tenants/${id}`, data)
      } catch (err) {
        console.error('Failed to update tenant:', err)
      }
    }
  }

  function updateTenantSettings(tenantId: string, settings: Partial<TenantSettings>) {
    const tenant = tenants.value.find(t => t.id === tenantId)
    if (tenant) {
      tenant.settings = { ...tenant.settings, ...settings }
    }
  }

  function addMember(tenantId: string, userId: string, role: 'admin' | 'member' | 'viewer') {
    const existing = tenantMembers.value.find(
      m => m.user_id === userId && m.tenant_id === tenantId
    )
    if (!existing) {
      tenantMembers.value.push({
        user_id: userId,
        tenant_id: tenantId,
        role,
        joined_at: new Date().toISOString().split('T')[0]
      })
      saveToStorage()
    }
  }

  function updateMemberRole(tenantId: string, userId: string, role: TenantMember['role']) {
    const member = tenantMembers.value.find(
      m => m.user_id === userId && m.tenant_id === tenantId
    )
    if (member) {
      member.role = role
      saveToStorage()
    }
  }

  function removeMember(tenantId: string, userId: string) {
    const index = tenantMembers.value.findIndex(
      m => m.user_id === userId && m.tenant_id === tenantId
    )
    if (index !== -1) {
      tenantMembers.value.splice(index, 1)
      saveToStorage()
    }
  }

  function canAddMember(tenantId: string): boolean {
    const tenant = tenants.value.find(t => t.id === tenantId)
    if (!tenant) return false
    const currentCount = tenantMembers.value.filter(m => m.tenant_id === tenantId).length
    return currentCount < tenant.settings.max_members
  }

  function canAddProject(tenantId: string, projectCount: number): boolean {
    const tenant = tenants.value.find(t => t.id === tenantId)
    if (!tenant) return false
    return projectCount < tenant.settings.max_projects
  }

  return {
    tenants,
    tenantMembers,
    currentTenantId,
    currentTenant,
    currentTenantMembers,
    isLoading,
    getUserTenants,
    getUserRole,
    setCurrentTenant,
    init,
    fetchTenants,
    createTenant,
    updateTenant,
    updateTenantSettings,
    addMember,
    updateMemberRole,
    removeMember,
    canAddMember,
    canAddProject
  }
})
