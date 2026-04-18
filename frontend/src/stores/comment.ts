import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'

interface CommentUser {
  id: string
  name: string
  avatar: string | null
}

interface CommentResponse {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[]
  createdAt: string
  user: CommentUser
}

interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  mentions: string[]
  created_at: string
}

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Comment[]>([])
  const isLoading = ref(false)

  function getTaskComments(taskId: string) {
    return comments.value.filter(c => c.task_id === taskId)
  }

  async function fetchComments(taskId: string) {
    isLoading.value = true
    try {
      const response = await api.get<{ data: CommentResponse[] }>(`/comments/task/${taskId}`)
      // Convert API response (camelCase) to local format (snake_case)
      const converted = response.data.map(c => ({
        id: c.id,
        task_id: c.taskId,
        user_id: c.userId,
        content: c.content,
        mentions: c.mentions || [],
        created_at: c.createdAt
      }))
      comments.value = converted
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addComment(taskId: string, content: string, projectId: string) {
    const response = await api.post<CommentResponse>(`/comments/task/${taskId}`, {
      content,
      projectId
    })

    const comment: Comment = {
      id: response.id,
      task_id: response.taskId,
      user_id: response.userId,
      content: response.content,
      mentions: response.mentions || [],
      created_at: response.createdAt
    }

    comments.value.push(comment)
    return comment
  }

  async function deleteComment(commentId: string) {
    await api.delete(`/comments/${commentId}`)
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value.splice(index, 1)
    }
  }

  return {
    comments,
    isLoading,
    getTaskComments,
    fetchComments,
    addComment,
    deleteComment
  }
})