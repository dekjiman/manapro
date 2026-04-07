import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Workspace } from '@/types'
import { api } from '@/services/api'
import workspacesData from '@/mock/workspaces.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>(workspacesData as Workspace[])
  const currentWorkspaceId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentWorkspace = computed(() =>
    workspaces.value.find(w => w.id === currentWorkspaceId.value) || null
  )

  function getTenantWorkspaces(tenantId: string) {
    return workspaces.value.filter(w => w.tenant_id === tenantId)
  }

  function getUserWorkspaces(userId: string, tenantId?: string) {
    if (USE_MOCK) {
      let result = workspaces.value.filter(w => w.members.includes(userId))
      if (tenantId) result = result.filter(w => w.tenant_id === tenantId)
      return result
    }
    return workspaces.value.filter(w => w.tenant_id === tenantId)
  }

  function setCurrentWorkspace(id: string) {
    currentWorkspaceId.value = id
    localStorage.setItem('manapro_workspace', id)
  }

  function init() {
    const stored = localStorage.getItem('manapro_workspace')
    if (stored) currentWorkspaceId.value = stored
  }

  async function fetchWorkspaces(tenantId: string) {
    if (USE_MOCK) return
    isLoading.value = true
    try {
      const data = await api.get<Workspace[]>(`/workspaces?tenantId=${tenantId}`)
      workspaces.value = data
    } catch { /* use mock */ }
    isLoading.value = false
  }

  function createWorkspace(name: string, tenantId: string, ownerId: string): Workspace {
    const workspace: Workspace = {
      id: `w${Date.now()}`,
      tenant_id: tenantId,
      name,
      owner_id: ownerId,
      members: [ownerId],
      created_at: new Date().toISOString().split('T')[0]
    }
    workspaces.value.push(workspace)
    return workspace
  }

  function updateWorkspace(id: string, data: Partial<Workspace>) {
    const index = workspaces.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workspaces.value[index] = { ...workspaces.value[index], ...data }
    }
  }

  function deleteWorkspace(id: string) {
    const index = workspaces.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workspaces.value.splice(index, 1)
      if (currentWorkspaceId.value === id) {
        currentWorkspaceId.value = null
        localStorage.removeItem('manapro_workspace')
      }
    }
  }

  function addMember(workspaceId: string, userId: string) {
    const ws = workspaces.value.find(w => w.id === workspaceId)
    if (ws && !ws.members.includes(userId)) ws.members.push(userId)
  }

  function removeMember(workspaceId: string, userId: string) {
    const ws = workspaces.value.find(w => w.id === workspaceId)
    if (ws) {
      const index = ws.members.indexOf(userId)
      if (index !== -1) ws.members.splice(index, 1)
    }
  }

  return {
    workspaces, currentWorkspaceId, currentWorkspace, isLoading,
    getTenantWorkspaces, getUserWorkspaces, setCurrentWorkspace, init,
    fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace,
    addMember, removeMember
  }
})
