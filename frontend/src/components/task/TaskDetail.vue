<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import MentionTextarea from '@/components/ui/MentionTextarea.vue'

interface Props {
  task: Task | null
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [task: Task]
}>()

const taskStore = useTaskStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const newComment = ref('')

const comments = computed(() => {
  if (!props.task) return []
  return taskStore.getTaskComments(props.task.id)
})

const assignee = computed(() => {
  if (!props.task?.assignee_id) return null
  return authStore.users.find(u => u.id === props.task!.assignee_id)
})

const column = computed(() => {
  if (!props.task) return null
  return taskStore.columns.find(c => c.id === props.task!.column_id)
})

const priorityVariant = computed(() => {
  switch (props.task?.priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'default'
    default: return 'default'
  }
})

const priorityLabel = computed(() => {
  switch (props.task?.priority) {
    case 'high': return 'Tinggi'
    case 'medium': return 'Sedang'
    case 'low': return 'Rendah'
    default: return ''
  }
})

function getCommentUserName(userId: string) {
  return authStore.users.find(u => u.id === userId)?.name || 'Unknown'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function parseMentionsFromText(text: string): string[] {
  const mentionRegex = /@([A-Za-z\s]+?)(?=\s|$|[.,!?;])/g
  const mentionedNames: string[] = []
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    mentionedNames.push(match[1].trim())
  }
  return [...new Set(
    mentionedNames
      .map(name => authStore.users.find(u => u.name.toLowerCase() === name.toLowerCase()))
      .filter((u): u is typeof authStore.users[0] => !!u)
      .map(u => u.id)
  )]
}

function addComment() {
  if (!newComment.value.trim() || !props.task || !authStore.currentUser) return
  const mentions = parseMentionsFromText(newComment.value.trim())
  taskStore.addComment(props.task.id, authStore.currentUser.id, newComment.value.trim(), mentions)
  newComment.value = ''
  uiStore.showToast('Komentar ditambahkan', 'success')
}

function renderCommentContent(content: string): string {
  return content.replace(
    /@([A-Za-z\s]+?)(?=\s|$|[.,!?;])/g,
    '<span class="text-primary font-semibold cursor-pointer hover:underline">@$1</span>'
  )
}

function deleteTask() {
  if (!props.task) return
  if (confirm('Hapus tugas ini?')) {
    taskStore.deleteTask(props.task.id)
    emit('close')
    uiStore.showToast('Tugas dihapus', 'success')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show && task"
        class="fixed inset-0 z-50 flex items-start justify-end bg-black/50 p-4"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-lg bg-surface rounded-xl shadow-xl max-h-[90vh] overflow-y-auto" @click.stop>
          <!-- Header -->
          <div class="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h2 class="text-lg font-semibold text-text-primary">Detail Tugas</h2>
            <div class="flex items-center gap-2">
              <button class="p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors" @click="emit('edit', task!)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button class="p-2 rounded-lg text-text-secondary hover:bg-red-100 hover:text-danger transition-colors" @click="deleteTask">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button class="p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors" @click="emit('close')">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Title -->
            <div>
              <h3 class="text-xl font-semibold text-text-primary mb-1">{{ task.title }}</h3>
              <p v-if="column" class="text-sm text-text-secondary">
                dalam kolom <span class="font-medium">{{ column.name }}</span>
              </p>
            </div>

            <!-- Description -->
            <div v-if="task.description">
              <h4 class="text-sm font-medium text-text-secondary mb-2">Deskripsi</h4>
              <p class="text-sm text-text-primary whitespace-pre-wrap">{{ task.description }}</p>
            </div>

            <!-- Meta -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-text-secondary mb-1">Prioritas</h4>
                <BaseBadge :variant="priorityVariant">{{ priorityLabel }}</BaseBadge>
              </div>
              <div v-if="task.due_date">
                <h4 class="text-sm font-medium text-text-secondary mb-1">Tenggat</h4>
                <p class="text-sm text-text-primary">{{ formatDate(task.due_date) }}</p>
              </div>
              <div v-if="assignee">
                <h4 class="text-sm font-medium text-text-secondary mb-1">Ditugaskan ke</h4>
                <div class="flex items-center gap-2">
                  <BaseAvatar :name="assignee.name" size="sm" />
                  <span class="text-sm text-text-primary">{{ assignee.name }}</span>
                </div>
              </div>
            </div>

            <!-- Labels -->
            <div v-if="task.labels.length > 0">
              <h4 class="text-sm font-medium text-text-secondary mb-2">Label</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="label in task.labels" :key="label" class="px-2 py-1 text-xs rounded-full bg-gray-100 text-text-secondary">{{ label }}</span>
              </div>
            </div>

            <!-- Comments -->
            <div class="border-t border-border pt-4">
              <h4 class="text-sm font-medium text-text-secondary mb-4">Komentar ({{ comments.length }})</h4>

              <div class="space-y-4 mb-4">
                <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
                  <BaseAvatar :name="getCommentUserName(comment.user_id)" size="sm" />
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-text-primary">{{ getCommentUserName(comment.user_id) }}</span>
                      <span class="text-xs text-text-secondary">{{ formatCommentDate(comment.created_at) }}</span>
                    </div>
                    <p class="text-sm text-text-primary" v-html="renderCommentContent(comment.content)" />
                  </div>
                </div>
                <p v-if="comments.length === 0" class="text-sm text-text-secondary text-center py-4">Belum ada komentar</p>
              </div>

              <!-- Add Comment -->
              <div class="flex gap-3">
                <BaseAvatar :name="authStore.currentUser?.name || ''" size="sm" />
                <div class="flex-1">
                  <MentionTextarea
                    v-model="newComment"
                    placeholder="Tulis komentar... (ketik @ untuk menyebut anggota)"
                    :rows="2"
                  />
                  <div class="flex justify-end mt-2">
                    <BaseButton size="sm" :disabled="!newComment.trim()" @click="addComment">Kirim</BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
