<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import type { Column, Task } from '@/types'
import TaskCard from './TaskCard.vue'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

interface Props {
  column: Column
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'task-click': [task: Task]
  'add-task': [columnId: string]
  'delete-column': [columnId: string]
}>()

const taskStore = useTaskStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const showMenu = ref(false)
const isEditing = ref(false)
const editName = ref(props.column.name)

const tasks = computed({
  get: () => taskStore.getColumnTasks(props.column.id),
  set: (value: Task[]) => {
    if (value.length > 0) {
      value.forEach((task, index) => {
        taskStore.updateTask(task.id, { column_id: props.column.id, position: index })
      })
    }
  }
})

function getAssigneeName(assigneeId: string | null) {
  if (!assigneeId) return undefined
  const user = authStore.users.find(u => u.id === assigneeId)
  return user?.name
}

function handleDragChange(event: any) {
  if (event.added) {
    const task = event.added.element
    taskStore.updateTask(task.id, {
      column_id: props.column.id,
      position: event.added.newIndex
    })
  }
}

function saveName() {
  if (editName.value.trim()) {
    taskStore.updateColumn(props.column.id, { name: editName.value.trim() })
    uiStore.showToast('Nama kolom diubah', 'success')
  }
  isEditing.value = false
}

function deleteColumn() {
  if (confirm(`Hapus kolom "${props.column.name}" dan semua tugas di dalamnya?`)) {
    taskStore.deleteColumn(props.column.id)
    uiStore.showToast('Kolom dihapus', 'success')
  }
  showMenu.value = false
}
</script>

<template>
  <div class="flex flex-col bg-gray-50/50 rounded-xl w-80 shrink-0">
    <!-- Column Header -->
    <div class="flex items-center justify-between px-3 py-3 border-b border-border/50">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: column.color }" />
        <template v-if="!isEditing">
          <h3 class="text-sm font-semibold text-text-primary truncate">{{ column.name }}</h3>
          <span class="text-xs text-text-secondary bg-gray-200 px-1.5 py-0.5 rounded-full">
            {{ tasks.length }}
          </span>
        </template>
        <input
          v-else
          v-model="editName"
          class="flex-1 px-2 py-1 text-sm border border-primary rounded focus:outline-none"
          @blur="saveName"
          @keydown.enter="saveName"
          @keydown.escape="isEditing = false"
          autofocus
        />
      </div>

      <!-- Column Menu -->
      <div class="relative">
        <button
          class="p-1 rounded text-text-secondary hover:bg-gray-200 transition-colors"
          @click="showMenu = !showMenu"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 top-full mt-1 w-40 bg-surface rounded-lg shadow-lg border border-border z-10 py-1"
          @mouseleave="showMenu = false"
        >
          <button
            class="w-full px-3 py-2 text-sm text-left text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
            @click="isEditing = true; showMenu = false"
          >
            Ubah Nama
          </button>
          <button
            class="w-full px-3 py-2 text-sm text-left text-danger hover:bg-red-50 transition-colors"
            @click="deleteColumn"
          >
            Hapus Kolom
          </button>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div class="flex-1 overflow-y-auto p-2">
      <draggable
        v-model="tasks"
        :group="{ name: 'tasks' }"
        item-key="id"
        class="space-y-2 min-h-[100px]"
        ghost-class="opacity-50"
        @change="handleDragChange"
      >
        <template #item="{ element }">
          <TaskCard
            :task="element"
            :assignee-name="getAssigneeName(element.assignee_id)"
            @click="emit('task-click', element)"
          />
        </template>
      </draggable>
    </div>

    <!-- Add Task Button -->
    <div class="p-2 border-t border-border/50">
      <button
        class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
        @click="emit('add-task', column.id)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Tugas
      </button>
    </div>
  </div>
</template>
