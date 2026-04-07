<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

interface Props {
  task: Task
  assigneeName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [task: Task]
}>()

const priorityVariant = computed(() => {
  switch (props.task.priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'default'
    default: return 'default'
  }
})

const priorityLabel = computed(() => {
  switch (props.task.priority) {
    case 'high': return 'Tinggi'
    case 'medium': return 'Sedang'
    case 'low': return 'Rendah'
    default: return props.task.priority
  }
})

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  return new Date(props.task.due_date) < new Date()
})

const formattedDate = computed(() => {
  if (!props.task.due_date) return ''
  const date = new Date(props.task.due_date)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
})
</script>

<template>
  <div
    class="bg-surface border border-border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
    @click="emit('click', task)"
  >
    <!-- Labels -->
    <div v-if="task.labels.length > 0" class="flex flex-wrap gap-1 mb-2">
      <span
        v-for="label in task.labels.slice(0, 3)"
        :key="label"
        class="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-text-secondary"
      >
        {{ label }}
      </span>
    </div>

    <!-- Title -->
    <h4 class="text-sm font-medium text-text-primary mb-2 group-hover:text-primary transition-colors">
      {{ task.title }}
    </h4>

    <!-- Bottom info -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <BaseBadge :variant="priorityVariant" size="sm">
          {{ priorityLabel }}
        </BaseBadge>
        <span
          v-if="task.due_date"
          class="flex items-center gap-1 text-xs"
          :class="isOverdue ? 'text-danger' : 'text-text-secondary'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formattedDate }}
        </span>
      </div>
      <BaseAvatar
        v-if="assigneeName"
        :name="assigneeName"
        size="sm"
      />
    </div>
  </div>
</template>
