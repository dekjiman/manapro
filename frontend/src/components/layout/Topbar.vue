<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useProjectStore } from '@/stores/project'
import { useTenantStore } from '@/stores/tenant'
import NotificationDropdown from '@/components/ui/NotificationDropdown.vue'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const tenantStore = useTenantStore()

const tenantId = computed(() => route.params.tenantId as string)

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to?: string }[] = []
  const tid = tenantId.value

  if (tid) {
    const tenant = tenantStore.tenants.find(t => t.id === tid)
    crumbs.push({
      label: tenant?.name || 'Bisnis',
      to: `/w/${tid}/workspaces`
    })
  }

  if (route.params.workspaceId) {
    const ws = workspaceStore.workspaces.find(w => w.id === route.params.workspaceId)
    crumbs.push({
      label: ws?.name || 'Workspace',
      to: tid ? `/w/${tid}/workspaces/${route.params.workspaceId}/projects` : undefined
    })
  }

  if (route.params.projectId) {
    const project = projectStore.projects.find(p => p.id === route.params.projectId)
    crumbs.push({
      label: project?.name || 'Proyek'
    })
  }

  if (route.name === 'tenant-workspaces') {
    crumbs.push({ label: 'Workspace' })
  }
  if (route.name === 'tenant-members') {
    crumbs.push({ label: 'Anggota' })
  }
  if (route.name === 'tenant-billing') {
    crumbs.push({ label: 'Langganan' })
  }
  if (route.name === 'tenant-settings') {
    crumbs.push({ label: 'Pengaturan' })
  }

  return crumbs
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-4">
      <!-- Sidebar toggle -->
      <button
        class="p-2 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors lg:hidden"
        @click="uiStore.toggleSidebar()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <router-link
            v-if="crumb.to && index < breadcrumbs.length - 1"
            :to="crumb.to"
            class="text-text-secondary hover:text-text-primary transition-colors"
          >
            {{ crumb.label }}
          </router-link>
          <span v-else :class="index === breadcrumbs.length - 1 ? 'text-text-primary font-medium' : 'text-text-secondary'">
            {{ crumb.label }}
          </span>
          <svg
            v-if="index < breadcrumbs.length - 1"
            class="w-4 h-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </template>
      </nav>
    </div>

    <div class="flex items-center gap-3">
      <!-- Notifications -->
      <NotificationDropdown />

      <!-- User menu -->
      <div class="relative group">
        <button class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
            {{ authStore.currentUser?.name.charAt(0) }}
          </div>
        </button>
        <div class="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div class="p-3 border-b border-border">
            <p class="text-sm font-medium text-text-primary">{{ authStore.currentUser?.name }}</p>
            <p class="text-xs text-text-secondary">{{ authStore.currentUser?.email }}</p>
          </div>
          <div class="p-1">
            <router-link
              v-if="tenantId"
              :to="`/w/${tenantId}/settings`"
              class="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary rounded-md transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pengaturan
            </router-link>
            <router-link
              to="/select-tenant"
              class="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary rounded-md transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Ganti Bisnis
            </router-link>
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-md transition-colors"
              @click="handleLogout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
