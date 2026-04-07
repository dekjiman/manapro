import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types'
import { api } from '@/services/api'
import projectsData from '@/mock/projects.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>(projectsData as Project[])
  const currentProjectId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentProject = computed(() =>
    projects.value.find(p => p.id === currentProjectId.value) || null
  )

  function getTenantProjects(tenantId: string) {
    return projects.value.filter(p => p.tenant_id === tenantId)
  }

  function getWorkspaceProjects(workspaceId: string) {
    return projects.value.filter(p => p.workspace_id === workspaceId)
  }

  function setCurrentProject(id: string) {
    currentProjectId.value = id
    localStorage.setItem('manapro_project', id)
  }

  function init() {
    const stored = localStorage.getItem('manapro_project')
    if (stored && projects.value.find(p => p.id === stored)) {
      currentProjectId.value = stored
    }
  }

  async function fetchProjects(tenantId: string) {
    if (USE_MOCK) return
    isLoading.value = true
    try {
      const data = await api.get<Project[]>(`/projects?tenantId=${tenantId}`)
      projects.value = data
    } catch { /* use mock */ }
    isLoading.value = false
  }

  function createProject(data: Omit<Project, 'id' | 'created_at'>): Project {
    const project: Project = {
      ...data,
      id: `p${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    }
    projects.value.push(project)
    return project
  }

  function updateProject(id: string, data: Partial<Project>) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
    }
  }

  function deleteProject(id: string) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      if (currentProjectId.value === id) {
        currentProjectId.value = null
        localStorage.removeItem('manapro_project')
      }
    }
  }

  function getProjectCount(tenantId: string): number {
    return projects.value.filter(p => p.tenant_id === tenantId).length
  }

  return {
    projects,
    currentProjectId,
    currentProject,
    isLoading,
    getTenantProjects,
    getWorkspaceProjects,
    setCurrentProject,
    init,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectCount
  }
})
