import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ActivityLog } from '@/types'
import activityLogsData from '@/mock/activityLogs.json'

export const useActivityStore = defineStore('activity', () => {
  const activityLogs = ref<ActivityLog[]>(activityLogsData as ActivityLog[])

  function getProjectLogs(projectId: string, limit = 20) {
    return activityLogs.value
      .filter(log => log.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  function getUserLogs(userId: string, limit = 20) {
    return activityLogs.value
      .filter(log => log.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  function addLog(data: Omit<ActivityLog, 'id' | 'created_at'>) {
    const log: ActivityLog = {
      ...data,
      id: `al${Date.now()}`,
      created_at: new Date().toISOString()
    }
    activityLogs.value.unshift(log)
    return log
  }

  function getActionLabel(action: string): string {
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

  function getEntityLabel(entityType: string): string {
    switch (entityType) {
      case 'task': return 'tugas'
      case 'project': return 'proyek'
      case 'workspace': return 'workspace'
      case 'comment': return 'komentar'
      default: return entityType
    }
  }

  return {
    activityLogs,
    getProjectLogs,
    getUserLogs,
    addLog,
    getActionLabel,
    getEntityLabel
  }
})
