<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Task } from '@/types'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
import TaskTableView from '@/components/table/TaskTableView.vue'
import TaskDetail from '@/components/task/TaskDetail.vue'
import TaskFormModal from '@/components/task/TaskFormModal.vue'
import ActivityFeed from '@/components/layout/ActivityFeed.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const projectId = computed(() => route.params.projectId as string)

const project = computed(() =>
  projectStore.projects.find(p => p.id === projectId.value)
)

const showDetail = ref(false)
const showForm = ref(false)
const showActivity = ref(true)
const showTips = ref(false)
const selectedTask = ref<Task | null>(null)
const selectedColumnId = ref('')
const viewMode = ref<'kanban' | 'table'>('kanban')

const userId = computed(() => authStore.currentUser?.id || 'u1')

// Show tips on first visit
const tipsDismissed = ref(localStorage.getItem('kanban_tips_dismissed') === 'true')

function dismissTips() {
  showTips.value = false
  tipsDismissed.value = true
  localStorage.setItem('kanban_tips_dismissed', 'true')
}

// Load view mode from localStorage
watch(projectId, (id) => {
  if (id) {
    projectStore.setCurrentProject(id)
    const saved = localStorage.getItem(`view_mode_${id}`)
    if (saved === 'kanban' || saved === 'table') {
      viewMode.value = saved
    }

    // Show tips if not dismissed and this is first time
    if (!tipsDismissed.value) {
      setTimeout(() => {
        showTips.value = true
      }, 1000)
    }
  }
}, { immediate: true })

// Auto-open task detail from query param (from notification click)
watch(() => route.query.task, (taskId) => {
  if (taskId && typeof taskId === 'string') {
    const task = taskStore.tasks.find(t => t.id === taskId)
    if (task) {
      selectedTask.value = task
      showDetail.value = true
    }
  }
}, { immediate: true })

function setViewMode(mode: 'kanban' | 'table') {
  viewMode.value = mode
  if (projectId.value) {
    localStorage.setItem(`view_mode_${projectId.value}`, mode)
  }
}

function handleTaskClick(task: Task) {
  selectedTask.value = task
  showDetail.value = true
}

function handleAddTask(columnId: string) {
  selectedTask.value = null
  selectedColumnId.value = columnId
  showForm.value = true
}

function handleEditTask(task: Task) {
  selectedTask.value = task
  selectedColumnId.value = task.column_id
  showDetail.value = false
  showForm.value = true
}

function handleSaveTask(data: Omit<Task, 'id' | 'created_at'>) {
  if (selectedTask.value) {
    taskStore.updateTask(selectedTask.value.id, data, userId.value)
    uiStore.showToast('Tugas diperbarui', 'success')
  } else {
    taskStore.createTask(data, userId.value)
    uiStore.showToast('Tugas baru dibuat', 'success')
  }
  selectedTask.value = null
}

function handleCloseDetail() {
  showDetail.value = false
  selectedTask.value = null
  // Clear the task query param
  if (route.query.task) {
    router.replace({ query: { ...route.query, task: undefined } })
  }
}

function handleCloseForm() {
  showForm.value = false
  selectedTask.value = null
  selectedColumnId.value = ''
}

const taskCount = computed(() => {
  if (!projectId.value) return 0
  return taskStore.tasks.filter(t => t.project_id === projectId.value).length
})

const completedCount = computed(() => {
  if (!projectId.value) return 0
  const columns = taskStore.getProjectColumns(projectId.value)
  const doneColumn = columns.find(c =>
    c.name.toLowerCase() === 'done' || c.name.toLowerCase() === 'selesai'
  )
  if (!doneColumn) return 0
  return taskStore.tasks.filter(t => t.column_id === doneColumn.id).length
})
</script>

<template>
  <div class="h-full flex gap-4">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Project Header -->
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text-primary">{{ project?.name }}</h1>
            <p v-if="project?.description" class="text-text-secondary mt-1 text-sm">{{ project.description }}</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Stats -->
            <div class="flex items-center gap-3 text-sm text-text-secondary">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ taskCount }} tugas
              </span>
              <span class="flex items-center gap-1 text-emerald-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ completedCount }} selesai
              </span>
            </div>

            <!-- View Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                :class="viewMode === 'kanban' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
                @click="setViewMode('kanban')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                Board
              </button>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                :class="viewMode === 'table' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
                @click="setViewMode('table')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Tabel
              </button>
            </div>

            <!-- Activity Toggle -->
            <button
              class="p-2 rounded-lg transition-colors"
              :class="showActivity ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-100'"
              @click="showActivity = !showActivity"
              title="Aktivitas Tim"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- View Content -->
      <div class="flex-1 overflow-hidden">
        <!-- Kanban Board -->
        <KanbanBoard
          v-if="viewMode === 'kanban'"
          :project-id="projectId"
          @task-click="handleTaskClick"
          @add-task="handleAddTask"
        />

        <!-- Table View -->
        <TaskTableView
          v-else
          :project-id="projectId"
          @task-click="handleTaskClick"
          @add-task="handleAddTask"
        />
      </div>
    </div>

    <!-- Activity Feed Sidebar -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="w-0 opacity-0"
      enter-to-class="w-72 opacity-100"
      leave-active-class="transition-all duration-200"
      leave-from-class="w-72 opacity-100"
      leave-to-class="w-0 opacity-0"
    >
      <div
        v-if="showActivity"
        class="w-72 bg-surface border border-border rounded-xl p-4 overflow-hidden shrink-0"
      >
        <ActivityFeed :project-id="projectId" :limit="20" />
      </div>
    </Transition>

    <!-- Task Detail Panel -->
    <TaskDetail
      :task="selectedTask"
      :show="showDetail"
      @close="handleCloseDetail"
      @edit="handleEditTask"
    />

    <!-- Task Form Modal -->
    <TaskFormModal
      :show="showForm"
      :task="selectedTask"
      :column-id="selectedColumnId"
      :project-id="projectId"
      @close="handleCloseForm"
      @save="handleSaveTask"
    />

    <!-- Tips Overlay (First Time) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showTips"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        @click="dismissTips"
      >
        <div
          class="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
          @click.stop
        >
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
              <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-text-primary mb-2">Selamat Datang!</h3>
            <p class="text-sm text-text-secondary">Berikut tips untuk menggunakan Kanban Board</p>
          </div>

          <div class="space-y-4">
            <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-text-primary">Drag & Drop</p>
                <p class="text-xs text-text-secondary">Seret task card untuk memindahkan antar kolom</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-text-primary">Klik Task</p>
                <p class="text-xs text-text-secondary">Klik task card untuk melihat detail dan komentar</p>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                <span class="text-violet-600 font-bold text-sm">@</span>
              </div>
              <div>
                <p class="text-sm font-medium text-text-primary">Mention</p>
                <p class="text-xs text-text-secondary">Ketik @ untuk menyebut anggota tim di komentar</p>
              </div>
            </div>
          </div>

          <BaseButton class="w-full mt-6" @click="dismissTips">
            Mengerti, Mulai Bekerja!
          </BaseButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
