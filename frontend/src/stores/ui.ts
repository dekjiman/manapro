import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export const useUIStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const toasts = ref<Toast[]>([])
  const modals = ref<Record<string, boolean>>({})

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  function showToast(message: string, type: Toast['type'] = 'info') {
    const id = `toast_${Date.now()}`
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function openModal(name: string) {
    modals.value[name] = true
  }

  function closeModal(name: string) {
    modals.value[name] = false
  }

  function isModalOpen(name: string) {
    return modals.value[name] ?? false
  }

  return {
    sidebarCollapsed,
    toasts,
    toggleSidebar,
    setSidebarCollapsed,
    showToast,
    removeToast,
    openModal,
    closeModal,
    isModalOpen
  }
})
