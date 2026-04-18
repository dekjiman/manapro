import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

// API response type (matches backend camelCase)
interface WorkspaceApiResponse {
  id: string
  tenantId: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
  members: Array<{ id: string; workspaceId: string; userId: string; joinedAt: string }>
  projects: any[]
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<WorkspaceApiResponse[]>([])
  const currentWorkspaceId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentWorkspace = computed(() =>
    workspaces.value.find(w => w.id === currentWorkspaceId.value) || null
  )

  function getTenantWorkspaces(tenantId: string) {
    return workspaces.value.filter(w => w.tenantId === tenantId)
  }

  function getUserWorkspaces(userId: string, tenantId?: string) {
    let result = workspaces.value.filter(w => w.tenantId === tenantId)
    // members from backend is array of objects { userId, ... }
    if (userId) result = result.filter(w => w.members?.some(m => m.userId === userId))
    return result
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
    isLoading.value = true
    try {
      const data = await api.get<WorkspaceApiResponse[]>(`/workspaces?tenantId=${tenantId}`)
      workspaces.value = data
    } catch (err) {
      console.error('Failed to fetch workspaces:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createWorkspace(name: string, tenantId: string, ownerId: string): Promise<WorkspaceApiResponse> {
    const created = await api.post<WorkspaceApiResponse>('/workspaces', { name })
    workspaces.value.push(created)
    return created
  }

  async function updateWorkspace(id: string, data: Partial<WorkspaceApiResponse>) {
    await api.patch(`/workspaces/${id}`, data)
    const index = workspaces.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workspaces.value[index] = { ...workspaces.value[index], ...data }
    }
  }

  async function deleteWorkspace(id: string) {
    await api.delete(`/workspaces/${id}`)
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
    if (ws && !ws.members?.some(m => m.userId === userId)) {
      ws.members.push({ id: '', workspaceId, userId, joinedAt: '' })
    }
  }

  function removeMember(workspaceId: string, userId: string) {
    const ws = workspaces.value.find(w => w.id === workspaceId)
    if (ws) {
      const index = ws.members.findIndex(m => m.userId === userId)
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