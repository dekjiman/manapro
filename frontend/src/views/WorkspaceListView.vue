<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useProjectStore } from '@/stores/project'
import { useTenantStore } from '@/stores/tenant'
import { useUIStore } from '@/stores/ui'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const tenantStore = useTenantStore()
const uiStore = useUIStore()

const tenantId = computed(() => route.params.tenantId as string)
const tenant = computed(() => tenantStore.tenants.find(t => t.id === tenantId.value))

// Fetch workspaces on mount and when tenantId changes
onMounted(async () => {
  if (tenantId.value) {
    await workspaceStore.fetchWorkspaces(tenantId.value)
  }
})

watch(tenantId, async (newTenantId) => {
  if (newTenantId) {
    await workspaceStore.fetchWorkspaces(newTenantId)
  }
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const newWorkspaceName = ref('')
const editingWorkspace = ref<{ id: string; name: string } | null>(null)
const viewMode = ref<'card' | 'table'>('card')

const userWorkspaces = computed(() => {
  if (!authStore.currentUser || !tenantId.value) return []
  return workspaceStore.getUserWorkspaces(authStore.currentUser.id, tenantId.value)
})

function getProjectCount(workspaceId: string) {
  return projectStore.getWorkspaceProjects(workspaceId).length
}

function getMemberCount(workspace: typeof userWorkspaces.value[0]) {
  return workspace.members.length
}

function openWorkspace(workspaceId: string) {
  workspaceStore.setCurrentWorkspace(workspaceId)
  if (tenantId.value) {
    router.push(`/w/${tenantId.value}/workspaces/${workspaceId}/projects`)
  }
}

async function handleCreate() {
  if (!newWorkspaceName.value.trim() || !authStore.currentUser || !tenantId.value) return

  const currentCount = userWorkspaces.value.length
  if (!tenantStore.canAddProject(tenantId.value, currentCount)) {
    uiStore.showToast('Batas workspace tercapai. Upgrade paket untuk menambah.', 'warning')
    return
  }

  const ws = await workspaceStore.createWorkspace(newWorkspaceName.value.trim(), tenantId.value, authStore.currentUser.id)
  uiStore.showToast('Workspace berhasil dibuat!', 'success')
  showCreateModal.value = false
  newWorkspaceName.value = ''
  openWorkspace(ws.id)
}

function openEditModal(ws: typeof userWorkspaces.value[0]) {
  editingWorkspace.value = { id: ws.id, name: ws.name }
  showEditModal.value = true
}

function handleEdit() {
  if (!editingWorkspace.value?.name.trim() || !tenantId.value) return

  workspaceStore.updateWorkspace(editingWorkspace.value.id, { name: editingWorkspace.value.name.trim() })
  uiStore.showToast('Workspace berhasil diperbarui!', 'success')
  showEditModal.value = false
  editingWorkspace.value = null
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">Workspace</h1>
        <p class="text-text-secondary mt-1">{{ tenant?.name }} - Kelola workspace Anda</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            :class="viewMode === 'card' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
            @click="viewMode = 'card'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Card
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            :class="viewMode === 'table' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
            @click="viewMode = 'table'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Tabel
          </button>
        </div>

        <BaseButton @click="showCreateModal = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Workspace Baru
        </BaseButton>
      </div>
    </div>

    <!-- Card View -->
    <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard
        v-for="ws in userWorkspaces"
        :key="ws.id"
        hover
        @click="openWorkspace(ws.id)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="text-primary font-bold text-lg">{{ ws.name.charAt(0) }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span
              v-if="ws.ownerId === authStore.currentUser?.id"
              class="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
            >
              Owner
            </span>
            <button
              class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              :disabled="ws.ownerId !== authStore.currentUser?.id"
              :class="{ 'opacity-50 cursor-not-allowed': ws.ownerId !== authStore.currentUser?.id }"
              @click.stop="openEditModal(ws)"
            >
              <svg class="w-4 h-4 text-text-secondary hover:text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-2">{{ ws.name }}</h3>
        <div class="flex items-center gap-4 text-sm text-text-secondary">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            {{ getProjectCount(ws.id) }} proyek
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ getMemberCount(ws) }} anggota
          </span>
        </div>
      </BaseCard>
    </div>

    <!-- Table View -->
    <div v-else class="bg-surface rounded-xl border border-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Nama</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Proyek</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Anggota</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Dibuat</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="ws in userWorkspaces"
              :key="ws.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span class="text-primary font-bold text-sm">{{ ws.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium text-text-primary">{{ ws.name }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <BaseBadge v-if="ws.ownerId === authStore.currentUser?.id" variant="info">Owner</BaseBadge>
                <BaseBadge v-else variant="default">Member</BaseBadge>
              </td>
              <td class="py-3 px-4 text-sm text-text-primary">{{ getProjectCount(ws.id) }}</td>
              <td class="py-3 px-4 text-sm text-text-primary">{{ getMemberCount(ws) }}</td>
              <td class="py-3 px-4 text-sm text-text-secondary">{{ formatDate(ws.createdAt) }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <button
                    class="text-sm text-primary hover:underline"
                    @click="openWorkspace(ws.id)"
                  >
                    Buka
                  </button>
                  <button
                    class="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    :disabled="ws.ownerId !== authStore.currentUser?.id"
                    :class="{ 'opacity-50 cursor-not-allowed': ws.ownerId !== authStore.currentUser?.id }"
                    @click="openEditModal(ws)"
                  >
                    <svg class="w-4 h-4 text-text-secondary hover:text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="userWorkspaces.length === 0" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-text-primary mb-2">Belum ada workspace</h3>
      <p class="text-text-secondary mb-4">Buat workspace pertama Anda untuk mulai mengelola proyek</p>
      <BaseButton @click="showCreateModal = true">Buat Workspace</BaseButton>
    </div>

    <!-- Create Modal -->
    <BaseModal :show="showCreateModal" title="Buat Workspace Baru" size="sm" @close="showCreateModal = false">
      <form @submit.prevent="handleCreate">
        <div class="space-y-4">
          <BaseInput
            v-model="newWorkspaceName"
            label="Nama Workspace"
            placeholder="Contoh: Tim Marketing"
          />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="secondary" @click="showCreateModal = false">Batal</BaseButton>
          <BaseButton type="submit" :disabled="!newWorkspaceName.trim()">Buat</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Edit Modal -->
    <BaseModal :show="showEditModal" title="Edit Workspace" size="sm" @close="showEditModal = false">
      <form @submit.prevent="handleEdit">
        <div class="space-y-4">
          <BaseInput
            v-model="editingWorkspace!.name"
            label="Nama Workspace"
            placeholder="Contoh: Tim Marketing"
          />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="secondary" @click="showEditModal = false">Batal</BaseButton>
          <BaseButton type="submit" :disabled="!editingWorkspace?.name.trim()">Simpan</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
