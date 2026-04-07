<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { useProjectStore } from '@/stores/project'
import { useTenantStore } from '@/stores/tenant'
import BaseAvatar from './BaseAvatar.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const tenantStore = useTenantStore()

const isOpen = ref(false)

const userId = computed(() => authStore.currentUser?.id || '')
const notifications = computed(() =>
  notificationStore.getUserNotifications(userId.value)
)
const unreadCount = computed(() =>
  notificationStore.getUnreadCount(userId.value)
)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleNotificationClick(notification: typeof notifications.value[0]) {
  notificationStore.markAsRead(notification.id)
  closeDropdown()

  if (notification.task_id && notification.project_id) {
    const project = projectStore.projects.find(p => p.id === notification.project_id)
    if (project) {
      const tenantId = tenantStore.currentTenantId
      if (tenantId) {
        // Navigate to project board with task_id query param to auto-open task detail
        router.push({
          path: `/w/${tenantId}/workspaces/${project.workspace_id}/projects/${notification.project_id}`,
          query: { task: notification.task_id }
        })
      }
    }
  }
}

function handleMarkAllRead() {
  notificationStore.markAllAsRead(userId.value)
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'task_assigned': return 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
    case 'task_updated': return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    case 'task_moved': return 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
    case 'task_deleted': return 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    case 'comment_added': return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    case 'member_joined': return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    case 'mention': return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    default: return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'task_assigned': return 'text-blue-500 bg-blue-50'
    case 'task_updated': return 'text-amber-500 bg-amber-50'
    case 'task_moved': return 'text-violet-500 bg-violet-50'
    case 'task_deleted': return 'text-red-500 bg-red-50'
    case 'comment_added': return 'text-emerald-500 bg-emerald-50'
    case 'member_joined': return 'text-cyan-500 bg-cyan-50'
    case 'mention': return 'text-pink-500 bg-pink-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="relative">
    <!-- Bell Button -->
    <button
      class="p-2 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors relative"
      @click="toggleDropdown"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-1"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    />

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-96 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 class="font-semibold text-text-primary">Notifikasi</h3>
          <button
            v-if="unreadCount > 0"
            class="text-xs text-primary hover:underline"
            @click="handleMarkAllRead"
          >
            Tandai semua dibaca
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex border-b border-border">
          <button
            class="flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="notificationStore.filter === 'all'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'"
            @click="notificationStore.setFilter('all')"
          >
            Semua
          </button>
          <button
            class="flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="notificationStore.filter === 'unread'
              ? 'text-primary border-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary'"
            @click="notificationStore.setFilter('unread')"
          >
            Belum dibaca
            <span v-if="unreadCount > 0" class="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {{ unreadCount }}
            </span>
          </button>
        </div>

        <!-- Notification List -->
        <div class="max-h-96 overflow-y-auto">
          <div
            v-for="notification in notifications.slice(0, 10)"
            :key="notification.id"
            class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
            :class="{ 'bg-blue-50/50': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Icon -->
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :class="getIconColor(notification.type)"
            >
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getNotificationIcon(notification.type)" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-text-primary" :class="{ 'font-medium': !notification.is_read }">
                {{ notification.title }}
              </p>
              <p class="text-xs text-text-secondary mt-0.5 line-clamp-2">
                {{ notification.message }}
              </p>
              <p class="text-xs text-text-secondary mt-1">
                {{ formatTime(notification.created_at) }}
              </p>
            </div>

            <!-- Unread dot -->
            <div
              v-if="!notification.is_read"
              class="w-2 h-2 bg-primary rounded-full shrink-0 mt-2"
            />
          </div>

          <!-- Empty State -->
          <div v-if="notifications.length === 0" class="py-12 text-center">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="text-sm text-text-secondary">Tidak ada notifikasi</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
