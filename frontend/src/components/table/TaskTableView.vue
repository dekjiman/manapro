<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'task-click': [task: Task]
  'add-task': [columnId: string]
}>()

const taskStore = useTaskStore()
const authStore = useAuthStore()

const sortField = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const columns = computed(() => taskStore.getProjectColumns(props.projectId))

const allTasks = computed(() => {
  return taskStore.tasks
    .filter(t => t.project_id === props.projectId)
    .map(task => ({
      ...task,
      columnName: columns.value.find(c => c.id === task.column_id)?.name || '',
      assigneeName: task.assignee_id
        ? authStore.users.find(u => u.id === task.assignee_id)?.name || ''
        : ''
    }))
})

const sortedTasks = computed(() => {
  if (!sortField.value) return allTasks.value

  return [...allTasks.value].sort((a, b) => {
    let aVal: any, bVal: any

    switch (sortField.value) {
      case 'title':
        aVal = a.title.toLowerCase()
        bVal = b.title.toLowerCase()
        break
      case 'status':
        aVal = a.columnName.toLowerCase()
        bVal = b.columnName.toLowerCase()
        break
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        aVal = priorityOrder[a.priority] || 0
        bVal = priorityOrder[b.priority] || 0
        break
      case 'due_date':
        aVal = a.due_date ? new Date(a.due_date).getTime() : 0
        bVal = b.due_date ? new Date(b.due_date).getTime() : 0
        break
      default:
        return 0
    }

    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

function handleSort(field: string) {
  if (sortField.value === field) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortField.value = null
      sortDirection.value = 'asc'
    }
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function getSortIcon(field: string) {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'default'
    default: return 'default'
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case 'high': return 'Tinggi'
    case 'medium': return 'Sedang'
    case 'low': return 'Rendah'
    default: return priority
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function isOverdue(date: string) {
  if (!date) return false
  return new Date(date) < new Date()
}
</script>

<template>
  <div class="h-full flex flex-col bg-surface rounded-xl border border-border overflow-hidden">
    <!-- Table Header -->
    <div class="overflow-x-auto flex-1">
      <table class="w-full min-w-[700px]">
        <thead class="bg-gray-50 sticky top-0">
          <tr>
            <th
              class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              @click="handleSort('title')"
            >
              Judul {{ getSortIcon('title') }}
            </th>
            <th
              class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none w-32"
              @click="handleSort('status')"
            >
              Status {{ getSortIcon('status') }}
            </th>
            <th
              class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none w-28"
              @click="handleSort('priority')"
            >
              Prioritas {{ getSortIcon('priority') }}
            </th>
            <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider w-40">
              Ditugaskan
            </th>
            <th
              class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none w-28"
              @click="handleSort('due_date')"
            >
              Tenggat {{ getSortIcon('due_date') }}
            </th>
            <th class="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
              Label
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="task in sortedTasks"
            :key="task.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="emit('task-click', task)"
          >
            <!-- Title -->
            <td class="py-3 px-4">
              <p class="text-sm font-medium text-text-primary">{{ task.title }}</p>
            </td>

            <!-- Status -->
            <td class="py-3 px-4">
              <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-text-secondary">
                {{ task.columnName }}
              </span>
            </td>

            <!-- Priority -->
            <td class="py-3 px-4">
              <BaseBadge :variant="getPriorityVariant(task.priority)">
                {{ getPriorityLabel(task.priority) }}
              </BaseBadge>
            </td>

            <!-- Assignee -->
            <td class="py-3 px-4">
              <div v-if="task.assigneeName" class="flex items-center gap-2">
                <BaseAvatar :name="task.assigneeName" size="sm" />
                <span class="text-sm text-text-primary">{{ task.assigneeName }}</span>
              </div>
              <span v-else class="text-sm text-text-secondary">-</span>
            </td>

            <!-- Due Date -->
            <td class="py-3 px-4">
              <span
                class="text-sm"
                :class="isOverdue(task.due_date) ? 'text-danger font-medium' : 'text-text-secondary'"
              >
                {{ formatDate(task.due_date) }}
              </span>
            </td>

            <!-- Labels -->
            <td class="py-3 px-4">
              <div v-if="task.labels.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="label in task.labels.slice(0, 2)"
                  :key="label"
                  class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-text-secondary"
                >
                  {{ label }}
                </span>
                <span v-if="task.labels.length > 2" class="text-xs text-text-secondary">
                  +{{ task.labels.length - 2 }}
                </span>
              </div>
              <span v-else class="text-sm text-text-secondary">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="sortedTasks.length === 0" class="py-16 text-center">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-text-secondary">Belum ada tugas</p>
        <p class="text-sm text-text-secondary mt-1">Klik "Tambah Tugas" untuk membuat tugas baru</p>
      </div>
    </div>
  </div>
</template>
