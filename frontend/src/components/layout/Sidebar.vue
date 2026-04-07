<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useProjectStore } from '@/stores/project'
import { useTenantStore } from '@/stores/tenant'
import { useI18n } from '@/utils/i18n'
import TenantSwitcher from '@/components/ui/TenantSwitcher.vue'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const tenantStore = useTenantStore()
const { t } = useI18n()

const tenantId = computed(() => route.params.tenantId as string || tenantStore.currentTenantId)

const userWorkspaces = computed(() => {
  if (!authStore.currentUser || !tenantId.value) return []
  return workspaceStore.getUserWorkspaces(authStore.currentUser.id, tenantId.value)
})

const currentWorkspaceId = computed(() => {
  return route.params.workspaceId as string || workspaceStore.currentWorkspaceId
})

const workspaceProjects = computed(() => {
  if (!currentWorkspaceId.value) return []
  return projectStore.getWorkspaceProjects(currentWorkspaceId.value)
})

function selectWorkspace(id: string) {
  workspaceStore.setCurrentWorkspace(id)
  if (tenantId.value) {
    router.push(`/w/${tenantId.value}/workspaces/${id}/projects`)
  }
}

function selectProject(projectId: string) {
  if (!currentWorkspaceId.value || !tenantId.value) return
  projectStore.setCurrentProject(projectId)
  router.push(`/w/${tenantId.value}/workspaces/${currentWorkspaceId.value}/projects/${projectId}`)
}

function isActiveProject(projectId: string) {
  return route.params.projectId === projectId
}

const userRole = computed(() => {
  if (!authStore.currentUser || !tenantId.value) return null
  return tenantStore.getUserRole(authStore.currentUser.id, tenantId.value)
})

const canManage = computed(() => userRole.value === 'owner' || userRole.value === 'admin')
</script>

<template>
  <aside
    class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200"
    :class="uiStore.sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'"
  >
    <!-- Tenant Switcher -->
    <div v-show="!uiStore.sidebarCollapsed" class="border-b border-border p-2">
      <TenantSwitcher />
    </div>

    <!-- Logo (collapsed) -->
    <div v-if="uiStore.sidebarCollapsed" class="flex items-center justify-center h-14 border-b border-border shrink-0">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-sm">M</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-3">
      <!-- Projects Section -->
      <div v-show="!uiStore.sidebarCollapsed" class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {{ t('nav.projects') }}
          </span>
        </div>
        <ul class="space-y-1">
          <li v-for="project in workspaceProjects" :key="project.id">
            <button
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              :class="isActiveProject(project.id)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'"
              @click="selectProject(project.id)"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              <span class="truncate">{{ project.name }}</span>
            </button>
          </li>
          <li v-if="workspaceProjects.length === 0">
            <p class="text-xs text-text-secondary px-3 py-2">{{ t('project.empty') }}</p>
          </li>
        </ul>
      </div>

      <!-- Quick Links -->
      <div class="border-t border-border pt-3">
        <ul class="space-y-1">
          <li>
            <router-link
              :to="tenantId ? `/w/${tenantId}/workspaces` : '/workspaces'"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
              :class="{ 'justify-center': uiStore.sidebarCollapsed }"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span v-show="!uiStore.sidebarCollapsed">{{ t('nav.workspace') }}</span>
            </router-link>
          </li>
          <li v-if="tenantId">
            <router-link
              :to="`/w/${tenantId}/members`"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
              :class="{ 'justify-center': uiStore.sidebarCollapsed }"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span v-show="!uiStore.sidebarCollapsed">{{ t('nav.members') }}</span>
            </router-link>
          </li>
          <li v-if="tenantId && canManage">
            <router-link
              :to="`/w/${tenantId}/billing`"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
              :class="{ 'justify-center': uiStore.sidebarCollapsed }"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span v-show="!uiStore.sidebarCollapsed">{{ t('nav.billing') }}</span>
            </router-link>
          </li>
          <li v-if="tenantId">
            <router-link
              :to="`/w/${tenantId}/settings`"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
              :class="{ 'justify-center': uiStore.sidebarCollapsed }"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span v-show="!uiStore.sidebarCollapsed">{{ t('nav.settings') }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- User Info -->
    <div class="border-t border-border p-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
          {{ authStore.currentUser?.name.charAt(0) }}
        </div>
        <div v-show="!uiStore.sidebarCollapsed" class="min-w-0 flex-1">
          <p class="text-sm font-medium text-text-primary truncate">{{ authStore.currentUser?.name }}</p>
          <p class="text-xs text-text-secondary truncate">{{ authStore.currentUser?.email }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>
