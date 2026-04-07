import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '@/stores/task'

describe('Task Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getProjectColumns', () => {
    it('should return columns for a project', () => {
      const store = useTaskStore()
      const columns = store.getProjectColumns('p1')

      expect(columns.length).toBeGreaterThan(0)
      expect(columns[0].project_id).toBe('p1')
    })

    it('should return columns sorted by position', () => {
      const store = useTaskStore()
      const columns = store.getProjectColumns('p1')

      for (let i = 1; i < columns.length; i++) {
        expect(columns[i].position).toBeGreaterThanOrEqual(columns[i - 1].position)
      }
    })
  })

  describe('getColumnTasks', () => {
    it('should return tasks for a column', () => {
      const store = useTaskStore()
      const tasks = store.getColumnTasks('col1')

      tasks.forEach(task => {
        expect(task.column_id).toBe('col1')
      })
    })
  })

  describe('createTask', () => {
    it('should create a new task', () => {
      const store = useTaskStore()
      const initialCount = store.tasks.length

      store.createTask({
        column_id: 'col1',
        project_id: 'p1',
        title: 'New Task',
        description: 'Test',
        priority: 'high',
        assignee_id: null,
        due_date: '',
        labels: [],
        position: 99,
      })

      expect(store.tasks.length).toBe(initialCount + 1)
      expect(store.tasks.find(t => t.title === 'New Task')).toBeTruthy()
    })
  })

  describe('updateTask', () => {
    it('should update task title', () => {
      const store = useTaskStore()
      store.updateTask('t1', { title: 'Updated Title' })

      const task = store.tasks.find(t => t.id === 't1')
      expect(task?.title).toBe('Updated Title')
    })

    it('should update task priority', () => {
      const store = useTaskStore()
      store.updateTask('t1', { priority: 'low' })

      const task = store.tasks.find(t => t.id === 't1')
      expect(task?.priority).toBe('low')
    })
  })

  describe('deleteTask', () => {
    it('should delete task', () => {
      const store = useTaskStore()
      // Get fresh task count after init
      const initialCount = store.tasks.length
      const taskToDelete = store.tasks[0]?.id
      if (!taskToDelete) return

      store.deleteTask(taskToDelete)
      expect(store.tasks.length).toBe(initialCount - 1)
      expect(store.tasks.find(t => t.id === taskToDelete)).toBeUndefined()
    })

    it('should clear selectedTaskId if deleted task was selected', () => {
      const store = useTaskStore()
      const taskToDelete = store.tasks[0]?.id
      if (!taskToDelete) return

      store.selectTask(taskToDelete)
      expect(store.selectedTaskId).toBe(taskToDelete)

      store.deleteTask(taskToDelete)
      expect(store.selectedTaskId).toBeNull()
    })
  })

  describe('moveTask', () => {
    it('should move task to different column', () => {
      const store = useTaskStore()
      const task = store.tasks[0]
      if (!task) return

      const originalColumn = task.column_id
      const targetColumn = store.columns.find(c => c.id !== originalColumn)?.id
      if (!targetColumn) return

      store.moveTask(task.id, originalColumn, targetColumn, 0)

      const movedTask = store.tasks.find(t => t.id === task.id)
      expect(movedTask?.column_id).toBe(targetColumn)
    })
  })

  describe('addComment', () => {
    it('should add comment to task', () => {
      const store = useTaskStore()
      const initialCount = store.comments.length

      store.addComment('t1', 'u1', 'Test comment')

      expect(store.comments.length).toBe(initialCount + 1)
      const comment = store.comments[store.comments.length - 1]
      expect(comment.content).toBe('Test comment')
      expect(comment.task_id).toBe('t1')
    })

    it('should add comment with mentions', () => {
      const store = useTaskStore()
      store.addComment('t1', 'u1', 'Hello @user', ['u2'])

      const comment = store.comments[store.comments.length - 1]
      expect(comment.mentions).toContain('u2')
    })
  })

  describe('selectTask', () => {
    it('should set selected task', () => {
      const store = useTaskStore()
      store.selectTask('t1')
      expect(store.selectedTaskId).toBe('t1')
    })

    it('should clear selection with null', () => {
      const store = useTaskStore()
      store.selectTask('t1')
      store.selectTask(null)
      expect(store.selectedTaskId).toBeNull()
    })
  })

  describe('createColumn', () => {
    it('should create new column', () => {
      const store = useTaskStore()
      const initialCount = store.columns.length

      store.createColumn('p1', 'New Column')

      expect(store.columns.length).toBe(initialCount + 1)
      const col = store.columns[store.columns.length - 1]
      expect(col.name).toBe('New Column')
      expect(col.project_id).toBe('p1')
    })
  })

  describe('deleteColumn', () => {
    it('should delete column and its tasks', () => {
      const store = useTaskStore()
      const colTasks = store.getColumnTasks('col1')
      const initialTaskCount = store.tasks.length

      store.deleteColumn('col1')

      expect(store.columns.find(c => c.id === 'col1')).toBeUndefined()
      expect(store.tasks.length).toBe(initialTaskCount - colTasks.length)
    })
  })
})
