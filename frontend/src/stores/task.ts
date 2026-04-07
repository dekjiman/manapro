import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, Column, Comment } from '@/types'
import { api } from '@/services/api'
import tasksData from '@/mock/tasks.json'
import columnsData from '@/mock/columns.json'
import commentsData from '@/mock/comments.json'
import { useNotificationStore } from './notification'
import { useActivityStore } from './activity'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>(tasksData as Task[])
  const columns = ref<Column[]>(columnsData as Column[])
  const comments = ref<Comment[]>(commentsData as Comment[])
  const selectedTaskId = ref<string | null>(null)
  const isLoading = ref(false)

  const selectedTask = computed(() =>
    tasks.value.find(t => t.id === selectedTaskId.value) || null
  )

  function getProjectColumns(projectId: string) {
    return columns.value
      .filter(c => c.project_id === projectId)
      .sort((a, b) => a.position - b.position)
  }

  function getColumnTasks(columnId: string) {
    return tasks.value
      .filter(t => t.column_id === columnId)
      .sort((a, b) => a.position - b.position)
  }

  function getTaskComments(taskId: string) {
    return comments.value.filter(c => c.task_id === taskId)
  }

  function selectTask(taskId: string | null) {
    selectedTaskId.value = taskId
  }

  function getColumnName(columnId: string) {
    return columns.value.find(c => c.id === columnId)?.name || ''
  }

  async function fetchTasks(projectId: string) {
    if (USE_MOCK) return
    isLoading.value = true
    try {
      const data = await api.get<Task[]>(`/tasks?projectId=${projectId}`)
      tasks.value = data
    } catch { /* use mock */ }
    isLoading.value = false
  }

  function createTask(data: Omit<Task, 'id' | 'created_at'>, userId?: string): Task {
    const task: Task = {
      ...data,
      id: `t${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    }
    tasks.value.push(task)

    try {
      const activityStore = useActivityStore()
      activityStore.addLog({
        user_id: userId || 'u1',
        action: 'created',
        entity_type: 'task',
        entity_name: task.title,
        project_id: task.project_id
      })

      if (task.assignee_id && task.assignee_id !== userId) {
        const notificationStore = useNotificationStore()
        notificationStore.addNotification({
          type: 'task_assigned',
          title: 'Tugas Baru',
          message: `Anda ditugaskan: "${task.title}"`,
          user_id: task.assignee_id,
          project_id: task.project_id,
          task_id: task.id
        })
      }
    } catch { /* store not initialized yet */ }

    return task
  }

  function updateTask(id: string, data: Partial<Task>, userId?: string) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const oldTask = { ...tasks.value[index] }
      tasks.value[index] = { ...tasks.value[index], ...data }
      const updatedTask = tasks.value[index]

      try {
        const activityStore = useActivityStore()
        activityStore.addLog({
          user_id: userId || 'u1',
          action: 'updated',
          entity_type: 'task',
          entity_name: updatedTask.title,
          project_id: updatedTask.project_id
        })

        if (data.assignee_id && data.assignee_id !== oldTask.assignee_id && data.assignee_id !== userId) {
          const notificationStore = useNotificationStore()
          notificationStore.addNotification({
            type: 'task_assigned',
            title: 'Tugas Baru',
            message: `Anda ditugaskan: "${updatedTask.title}"`,
            user_id: data.assignee_id,
            project_id: updatedTask.project_id,
            task_id: updatedTask.id
          })
        }
      } catch { /* store not initialized yet */ }
    }
  }

  function deleteTask(id: string, userId?: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      try {
        const activityStore = useActivityStore()
        activityStore.addLog({
          user_id: userId || 'u1',
          action: 'deleted',
          entity_type: 'task',
          entity_name: task.title,
          project_id: task.project_id
        })

        const notificationStore = useNotificationStore()
        notificationStore.addNotification({
          type: 'task_deleted',
          title: 'Tugas Dihapus',
          message: `Tugas "${task.title}" telah dihapus`,
          user_id: task.assignee_id || 'u1',
          project_id: task.project_id,
          task_id: null
        })
      } catch { /* store not initialized yet */ }
    }

    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      if (selectedTaskId.value === id) {
        selectedTaskId.value = null
      }
      comments.value = comments.value.filter(c => c.task_id !== id)
    }
  }

  function moveTask(taskId: string, _fromColumnId: string, toColumnId: string, newIndex: number, userId?: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    const oldColumnName = getColumnName(task.column_id)
    task.column_id = toColumnId
    task.position = newIndex

    const columnTasks = tasks.value
      .filter(t => t.column_id === toColumnId && t.id !== taskId)
      .sort((a, b) => a.position - b.position)

    columnTasks.splice(newIndex, 0, task)

    columnTasks.forEach((t, i) => {
      t.position = i
    })

    try {
      const newColumnName = getColumnName(toColumnId)
      const activityStore = useActivityStore()
      activityStore.addLog({
        user_id: userId || 'u1',
        action: 'moved',
        entity_type: 'task',
        entity_name: task.title,
        project_id: task.project_id
      })

      if (task.assignee_id && task.assignee_id !== userId) {
        const notificationStore = useNotificationStore()
        notificationStore.addNotification({
          type: 'task_moved',
          title: 'Tugas Dipindahkan',
          message: `"${task.title}" dipindahkan ke ${newColumnName}`,
          user_id: task.assignee_id,
          project_id: task.project_id,
          task_id: task.id
        })
      }
    } catch { /* store not initialized yet */ }
  }

  function reorderTasks(columnId: string, oldIndex: number, newIndex: number) {
    const columnTasks = tasks.value
      .filter(t => t.column_id === columnId)
      .sort((a, b) => a.position - b.position)

    const [movedTask] = columnTasks.splice(oldIndex, 1)
    columnTasks.splice(newIndex, 0, movedTask)

    columnTasks.forEach((t, i) => {
      t.position = i
    })
  }

  function addComment(taskId: string, userId: string, content: string, mentions: string[] = []): Comment {
    const comment: Comment = {
      id: `cmt${Date.now()}`,
      task_id: taskId,
      user_id: userId,
      content,
      mentions,
      created_at: new Date().toISOString()
    }
    comments.value.push(comment)

    try {
      const task = tasks.value.find(t => t.id === taskId)
      if (task) {
        const activityStore = useActivityStore()
        activityStore.addLog({
          user_id: userId,
          action: 'commented',
          entity_type: 'task',
          entity_name: task.title,
          project_id: task.project_id
        })

        // Notify task assignee
        if (task.assignee_id && task.assignee_id !== userId) {
          const notificationStore = useNotificationStore()
          notificationStore.addNotification({
            type: 'comment_added',
            title: 'Komentar Baru',
            message: `Seseorang mengomentari "${task.title}"`,
            user_id: task.assignee_id,
            project_id: task.project_id,
            task_id: task.id
          })
        }

        // Notify mentioned users
        if (mentions.length > 0) {
          const notificationStore = useNotificationStore()
          const mentionedUsers = new Set(mentions)
          if (task.assignee_id) mentionedUsers.delete(task.assignee_id)
          mentionedUsers.delete(userId)

          for (const mentionedUserId of mentionedUsers) {
            notificationStore.addNotification({
              type: 'mention',
              title: 'Anda disebutkan',
              message: `Anda disebutkan di "${task.title}"`,
              user_id: mentionedUserId,
              project_id: task.project_id,
              task_id: task.id
            })
          }
        }
      }
    } catch { /* store not initialized yet */ }

    return comment
  }

  function deleteComment(commentId: string) {
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value.splice(index, 1)
    }
  }

  function createColumn(projectId: string, name: string): Column {
    const projectColumns = columns.value.filter(c => c.project_id === projectId)
    const column: Column = {
      id: `col${Date.now()}`,
      project_id: projectId,
      name,
      position: projectColumns.length,
      color: '#94A3B8'
    }
    columns.value.push(column)
    return column
  }

  function updateColumn(id: string, data: Partial<Column>) {
    const index = columns.value.findIndex(c => c.id === id)
    if (index !== -1) {
      columns.value[index] = { ...columns.value[index], ...data }
    }
  }

  function deleteColumn(id: string) {
    const index = columns.value.findIndex(c => c.id === id)
    if (index !== -1) {
      columns.value.splice(index, 1)
      tasks.value = tasks.value.filter(t => t.column_id !== id)
    }
  }

  function reorderColumns(projectId: string, oldIndex: number, newIndex: number) {
    const projectColumns = columns.value
      .filter(c => c.project_id === projectId)
      .sort((a, b) => a.position - b.position)

    const [movedColumn] = projectColumns.splice(oldIndex, 1)
    projectColumns.splice(newIndex, 0, movedColumn)

    projectColumns.forEach((c, i) => {
      c.position = i
    })
  }

  return {
    tasks,
    columns,
    comments,
    selectedTaskId,
    selectedTask,
    isLoading,
    getProjectColumns,
    getColumnTasks,
    getTaskComments,
    selectTask,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    addComment,
    deleteComment,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns
  }
})
