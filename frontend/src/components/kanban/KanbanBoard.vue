<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import type { Task } from '@/types'
import KanbanColumn from './KanbanColumn.vue'
import { useTaskStore } from '@/stores/task'
import { useUIStore } from '@/stores/ui'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'task-click': [task: Task]
  'add-task': [columnId: string]
}>()

const taskStore = useTaskStore()
const uiStore = useUIStore()

const columns = computed({
  get: () => taskStore.getProjectColumns(props.projectId),
  set: (value: any[]) => {
    value.forEach((column, index) => {
      taskStore.updateColumn(column.id, { position: index })
    })
  }
})

const showAddColumn = computed(() => columns.value.length < 15)

function addColumn() {
  const name = prompt('Nama kolom baru:')
  if (name?.trim()) {
    taskStore.createColumn(props.projectId, name.trim())
    uiStore.showToast('Kolom baru ditambahkan', 'success')
  }
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4 h-full">
    <draggable
      v-model="columns"
      :group="{ name: 'columns' }"
      item-key="id"
      class="flex gap-4"
      handle=".column-handle"
    >
      <template #item="{ element }">
        <div class="column-handle cursor-grab active:cursor-grabbing">
          <KanbanColumn
            :column="element"
            @task-click="emit('task-click', $event)"
            @add-task="emit('add-task', $event)"
          />
        </div>
      </template>
    </draggable>

    <!-- Add Column Button -->
    <div v-if="showAddColumn" class="shrink-0">
      <button
        class="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 border-2 border-dashed border-border hover:border-primary/30 rounded-xl transition-colors w-80"
        @click="addColumn"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Kolom
      </button>
    </div>
  </div>
</template>
