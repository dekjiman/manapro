<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspace'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useTenantStore } from '@/stores/tenant'
import { useUIStore } from '@/stores/ui'
import { useTemplateStore, type Template } from '@/stores/template'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import TemplateSelector from '@/components/template/TemplateSelector.vue'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const tenantStore = useTenantStore()
const uiStore = useUIStore()
const templateStore = useTemplateStore()

const workspaceId = computed(() => route.params.workspaceId as string)
const tenantId = computed(() => route.params.tenantId as string)

const showCreateModal = ref(false)
const showTemplateModal = ref(false)
const showEditModal = ref(false)
const viewMode = ref<'card' | 'table'>('card')
const newProject = ref({
  name: '',
  description: '',
  start_date: '',
  due_date: ''
})
const editingProject = ref<{
  id: string
  name: string
  description: string
  start_date: string
  due_date: string
  status: string
} | null>(null)

const workspace = computed(() =>
  workspaceStore.workspaces.find(w => w.id === workspaceId.value)
)

const projects = computed(() =>
  projectStore.getWorkspaceProjects(workspaceId.value)
)

watch(workspaceId, (id) => {
  workspaceStore.setCurrentWorkspace(id)
}, { immediate: true })

function getTaskCount(projectId: string) {
  return taskStore.tasks.filter(t => t.project_id === projectId).length
}

function getCompletedCount(projectId: string) {
  const projectColumns = taskStore.getProjectColumns(projectId)
  const doneColumn = projectColumns.find(c =>
    c.name.toLowerCase() === 'done' || c.name.toLowerCase() === 'selesai'
  )
  if (!doneColumn) return 0
  return taskStore.tasks.filter(t => t.column_id === doneColumn.id).length
}

function openProject(projectId: string) {
  projectStore.setCurrentProject(projectId)
  if (tenantId.value) {
    router.push(`/w/${tenantId.value}/workspaces/${workspaceId.value}/projects/${projectId}`)
  }
}

function handleCreate() {
  if (!newProject.value.name.trim() || !tenantId.value) return

  const project = projectStore.createProject({
    tenant_id: tenantId.value,
    workspace_id: workspaceId.value,
    name: newProject.value.name.trim(),
    description: newProject.value.description,
    start_date: newProject.value.start_date,
    due_date: newProject.value.due_date,
    status: 'active'
  })

  uiStore.showToast('Proyek berhasil dibuat!', 'success')
  showCreateModal.value = false
  newProject.value = { name: '', description: '', start_date: '', due_date: '' }
  openProject(project.id)
}

async function handleTemplateSelect(template: Template) {
  if (!tenantId.value || !workspaceId.value) return

  const project = await projectStore.createProject({
    tenant_id: tenantId.value,
    workspace_id: workspaceId.value,
    name: template.name,
    description: template.description,
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'active'
  })

  // Create columns from template
  for (let index = 0; index < template.columns.length; index++) {
    const col = template.columns[index]
    await taskStore.createColumn(project.id, col.name)
    const columns = taskStore.getProjectColumns(project.id)
    const newCol = columns[columns.length - 1]
    if (newCol) {
      await taskStore.updateColumn(newCol.id, { color: col.color, position: index })
    }
  }

  // Create sample tasks
  for (const sampleTask of template.sampleTasks) {
    const columns = taskStore.getProjectColumns(project.id)
    const targetColumn = columns[sampleTask.column]
    if (targetColumn) {
      await taskStore.createTask({
        column_id: targetColumn.id,
        project_id: project.id,
        title: sampleTask.title,
        description: '',
        priority: sampleTask.priority,
        assignee_id: null,
        due_date: '',
        labels: [],
        position: 0
      })
    }
  }

  showTemplateModal.value = false
  uiStore.showToast('Proyek dari template berhasil dibuat!', 'success')
  openProject(project.id)
}

function handleTemplateSkip() {
  showTemplateModal.value = false
  showCreateModal.value = true
}

function openEditModal(project: typeof projects.value[0]) {
  editingProject.value = {
    id: project.id,
    name: project.name,
    description: project.description || '',
    start_date: project.start_date || '',
    due_date: project.due_date || '',
    status: project.status || 'active'
  }
  showEditModal.value = true
}

function handleEdit() {
  if (!editingProject.value?.name.trim() || !tenantId.value) return

  projectStore.updateProject(editingProject.value.id, {
    name: editingProject.value.name.trim(),
    description: editingProject.value.description,
    start_date: editingProject.value.start_date,
    due_date: editingProject.value.due_date,
    status: editingProject.value.status
  })
  uiStore.showToast('Proyek berhasil diperbarui!', 'success')
  showEditModal.value = false
  editingProject.value = null
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'info'
    case 'completed': return 'success'
    case 'archived': return 'default'
    default: return 'default'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'active': return 'Aktif'
    case 'completed': return 'Selesai'
    case 'archived': return 'Arsip'
    default: return status
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">{{ workspace?.name }}</h1>
        <p class="text-text-secondary mt-1">Kelola proyek dalam workspace ini</p>
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

        <!-- Template Button -->
        <BaseButton variant="secondary" @click="showTemplateModal = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Dari Template
        </BaseButton>

        <BaseButton @click="showCreateModal = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Proyek Baru
        </BaseButton>
      </div>
    </div>

    <!-- Card View -->
    <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseCard
        v-for="project in projects"
        :key="project.id"
        hover
        @click="openProject(project.id)"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <div class="flex items-center gap-1">
            <BaseBadge :variant="getStatusColor(project.status)">
              {{ getStatusLabel(project.status) }}
            </BaseBadge>
            <button
              class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              @click.stop="openEditModal(project)"
            >
              <svg class="w-4 h-4 text-text-secondary hover:text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-1">{{ project.name }}</h3>
        <p class="text-sm text-text-secondary mb-4 line-clamp-2">{{ project.description }}</p>
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-3 text-text-secondary">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {{ getTaskCount(project.id) }} tugas
            </span>
            <span class="flex items-center gap-1 text-emerald-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ getCompletedCount(project.id) }} selesai
            </span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Table View -->
    <div v-else class="bg-surface rounded-xl border border-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Nama Proyek</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Tugas</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Selesai</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Mulai</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Deadline</th>
              <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="project in projects"
              :key="project.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-text-primary">{{ project.name }}</p>
                    <p class="text-xs text-text-secondary line-clamp-1">{{ project.description }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <BaseBadge :variant="getStatusColor(project.status)">{{ getStatusLabel(project.status) }}</BaseBadge>
              </td>
              <td class="py-3 px-4 text-sm text-text-primary">{{ getTaskCount(project.id) }}</td>
              <td class="py-3 px-4 text-sm text-emerald-600">{{ getCompletedCount(project.id) }}</td>
              <td class="py-3 px-4 text-sm text-text-secondary">{{ formatDate(project.start_date) }}</td>
              <td class="py-3 px-4 text-sm text-text-secondary">{{ formatDate(project.due_date) }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <button class="text-sm text-primary hover:underline" @click="openProject(project.id)">Buka</button>
                  <button class="p-1.5 hover:bg-gray-200 rounded transition-colors" @click="openEditModal(project)">
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
    <div v-if="projects.length === 0" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-text-primary mb-2">Belum ada proyek</h3>
      <p class="text-text-secondary mb-4">Buat proyek baru atau mulai dari template</p>
      <div class="flex justify-center gap-3">
        <BaseButton variant="secondary" @click="showTemplateModal = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          </svg>
          Dari Template
        </BaseButton>
        <BaseButton @click="showCreateModal = true">Buat Kosong</BaseButton>
      </div>
    </div>

    <!-- Create Modal -->
    <BaseModal :show="showCreateModal" title="Buat Proyek Baru" @close="showCreateModal = false">
      <form @submit.prevent="handleCreate">
        <div class="space-y-4">
          <BaseInput v-model="newProject.name" label="Nama Proyek" placeholder="Contoh: Rebranding Toko" />
          <BaseTextarea v-model="newProject.description" label="Deskripsi" placeholder="Jelaskan tujuan proyek ini" :rows="3" />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="newProject.start_date" label="Tanggal Mulai" type="date" />
            <BaseInput v-model="newProject.due_date" label="Tanggal Selesai" type="date" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="secondary" @click="showCreateModal = false">Batal</BaseButton>
          <BaseButton type="submit" :disabled="!newProject.name.trim()">Buat</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Edit Modal -->
    <BaseModal :show="showEditModal" title="Edit Proyek" @close="showEditModal = false">
      <form @submit.prevent="handleEdit">
        <div class="space-y-4">
          <BaseInput v-model="editingProject!.name" label="Nama Proyek" placeholder="Contoh: Rebranding Toko" />
          <BaseTextarea v-model="editingProject!.description" label="Deskripsi" placeholder="Jelaskan tujuan proyek ini" :rows="3" />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="editingProject!.start_date" label="Tanggal Mulai" type="date" />
            <BaseInput v-model="editingProject!.due_date" label="Tanggal Selesai" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              v-model="editingProject!.status"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="active">Aktif</option>
              <option value="completed">Selesai</option>
              <option value="archived">Arsip</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="secondary" @click="showEditModal = false">Batal</BaseButton>
          <BaseButton type="submit" :disabled="!editingProject?.name.trim()">Simpan</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Template Selector -->
    <TemplateSelector
      :show="showTemplateModal"
      @close="showTemplateModal = false"
      @select="handleTemplateSelect"
      @skip="handleTemplateSkip"
    />
  </div>
</template>
