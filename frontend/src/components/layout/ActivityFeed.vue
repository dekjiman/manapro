<script setup lang="ts">
import { computed } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { useAuthStore } from '@/stores/auth'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

interface Props {
  projectId?: string
  limit?: number
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 15,
  compact: false
})

const activityStore = useActivityStore()
const authStore = useAuthStore()

const logs = computed(() => {
  if (props.projectId) {
    return activityStore.getProjectLogs(props.projectId, props.limit)
  }
  return activityStore.activityLogs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, props.limit)
})

function getUserName(userId: string) {
  return authStore.users.find(u => u.id === userId)?.name || 'Seseorang'
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes}m lalu`
  if (hours < 24) return `${hours}j lalu`
  if (days < 7) return `${days}h lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function getActionColor(action: string) {
  switch (action) {
    case 'created': return 'bg-emerald-500'
    case 'updated': return 'bg-amber-500'
    case 'moved': return 'bg-violet-500'
    case 'deleted': return 'bg-red-500'
    case 'commented': return 'bg-blue-500'
    case 'assigned': return 'bg-cyan-500'
    default: return 'bg-gray-500'
  }
}

function getActionVerb(action: string) {
  switch (action) {
    case 'created': return 'menambahkan'
    case 'updated': return 'memperbarui'
    case 'moved': return 'memindahkan'
    case 'deleted': return 'menghapus'
    case 'commented': return 'mengomentari'
    case 'assigned': return 'menugaskan'
    default: return action
  }
}

function getEntityType(entityType: string) {
  switch (entityType) {
    case 'task': return 'tugas'
    case 'project': return 'proyek'
    case 'workspace': return 'workspace'
    case 'comment': return 'komentar'
    default: return entityType
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="!compact" class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-text-primary">Aktivitas Tim</h3>
      <span class="text-xs text-text-secondary">{{ logs.length }} aktivitas</span>
    </div>

    <div class="flex-1 overflow-y-auto" :class="{ 'space-y-0': compact, 'space-y-1': !compact }">
      <div
        v-for="log in logs"
        :key="log.id"
        class="flex items-start gap-3 py-2.5"
        :class="compact ? 'px-3 border-b border-border/50 last:border-0' : 'px-1'"
      >
        <!-- Timeline dot -->
        <div class="relative shrink-0 mt-1">
          <div
            class="w-2 h-2 rounded-full"
            :class="getActionColor(log.action)"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-text-primary">
            <span class="font-medium">{{ getUserName(log.user_id) }}</span>
            <span class="text-text-secondary"> {{ getActionVerb(log.action) }} </span>
            <span class="text-text-secondary">{{ getEntityType(log.entity_type) }}</span>
          </p>
          <p class="text-xs text-text-secondary mt-0.5 truncate">
            "{{ log.entity_name }}"
          </p>
          <p class="text-xs text-text-secondary mt-0.5">
            {{ formatTime(log.created_at) }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="logs.length === 0" class="py-8 text-center">
        <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-text-secondary">Belum ada aktivitas</p>
      </div>
    </div>
  </div>
</template>
