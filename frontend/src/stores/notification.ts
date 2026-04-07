import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types'
import { api } from '@/services/api'
import notificationsData from '@/mock/notifications.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>(notificationsData as Notification[])
  const filter = ref<'all' | 'unread'>('all')
  const isLoading = ref(false)

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.is_read).length
  )

  const filteredNotifications = computed(() => {
    const sorted = [...notifications.value].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    if (filter.value === 'unread') {
      return sorted.filter(n => !n.is_read)
    }
    return sorted
  })

  function getUserNotifications(userId: string) {
    return notifications.value
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  function getUnreadCount(userId: string) {
    return notifications.value.filter(n => n.user_id === userId && !n.is_read).length
  }

  function getProjectNotifications(projectId: string) {
    return notifications.value
      .filter(n => n.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async function fetchNotifications(userId: string) {
    if (USE_MOCK) return
    isLoading.value = true
    try {
      const data = await api.get<Notification[]>(`/notifications?userId=${userId}`)
      notifications.value = data
    } catch { /* use mock */ }
    isLoading.value = false
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.is_read = true
    }
  }

  function markAllAsRead(userId: string) {
    notifications.value
      .filter(n => n.user_id === userId)
      .forEach(n => { n.is_read = true })
  }

  function addNotification(data: Omit<Notification, 'id' | 'is_read' | 'created_at'>) {
    const notification: Notification = {
      ...data,
      id: `n${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString()
    }
    notifications.value.unshift(notification)
    return notification
  }

  function deleteNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function setFilter(f: 'all' | 'unread') {
    filter.value = f
  }

  return {
    notifications,
    filter,
    isLoading,
    unreadCount,
    filteredNotifications,
    getUserNotifications,
    getUnreadCount,
    getProjectNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
    setFilter
  }
})
