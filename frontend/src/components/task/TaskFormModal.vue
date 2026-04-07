<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Task } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  show: boolean
  task?: Task | null
  columnId?: string
  projectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  columnId: '',
  projectId: ''
})

const emit = defineEmits<{
  close: []
  save: [data: Omit<Task, 'id' | 'created_at'>]
}>()

const authStore = useAuthStore()
const taskStore = useTaskStore()

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as Task['priority'],
  assignee_id: '' as string | null,
  due_date: '',
  labels: [] as string[]
})

const labelInput = ref('')
const isEditing = computed(() => !!props.task)

const memberOptions = computed(() =>
  authStore.users.map(u => ({ value: u.id, label: u.name }))
)

const priorityOptions = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' }
]

const columnOptions = computed(() => {
  if (!props.projectId) return []
  return taskStore.getProjectColumns(props.projectId).map(c => ({
    value: c.id,
    label: c.name
  }))
})

const selectedColumnId = ref(props.columnId)

watch(() => props.task, (task) => {
  if (task) {
    form.value = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee_id: task.assignee_id,
      due_date: task.due_date,
      labels: [...task.labels]
    }
    selectedColumnId.value = task.column_id
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.columnId, (id) => {
  selectedColumnId.value = id
})

function resetForm() {
  form.value = {
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: null,
    due_date: '',
    labels: []
  }
  labelInput.value = ''
  selectedColumnId.value = props.columnId
}

function addLabel() {
  const label = labelInput.value.trim().toLowerCase()
  if (label && !form.value.labels.includes(label)) {
    form.value.labels.push(label)
    labelInput.value = ''
  }
}

function removeLabel(label: string) {
  form.value.labels = form.value.labels.filter(l => l !== label)
}

function handleSubmit() {
  if (!form.value.title.trim()) return

  emit('save', {
    column_id: selectedColumnId.value,
    project_id: props.projectId,
    title: form.value.title.trim(),
    description: form.value.description,
    priority: form.value.priority,
    assignee_id: form.value.assignee_id || null,
    due_date: form.value.due_date,
    labels: form.value.labels,
    position: props.task ? props.task.position : taskStore.getColumnTasks(selectedColumnId.value).length
  })

  emit('close')
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Tugas' : 'Buat Tugas Baru'"
    size="md"
    @close="emit('close')"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <BaseInput
          v-model="form.title"
          label="Judul Tugas"
          placeholder="Apa yang perlu dilakukan?"
        />
        <BaseTextarea
          v-model="form.description"
          label="Deskripsi"
          placeholder="Jelaskan detail tugas..."
          :rows="3"
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseSelect
            v-model="form.priority"
            label="Prioritas"
            :options="priorityOptions"
          />
          <BaseSelect
            v-model="selectedColumnId"
            label="Kolom"
            :options="columnOptions"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseSelect
            :model-value="form.assignee_id ?? ''"
            label="Ditugaskan ke"
            placeholder="Pilih anggota"
            :options="memberOptions"
            @update:model-value="form.assignee_id = $event || null"
          />
          <BaseInput
            v-model="form.due_date"
            label="Tenggat"
            type="date"
          />
        </div>

        <!-- Labels -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1.5">Label</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="label in form.labels"
              :key="label"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-text-secondary"
            >
              {{ label }}
              <button type="button" class="hover:text-danger" @click="removeLabel(label)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
          <div class="flex gap-2">
            <BaseInput
              v-model="labelInput"
              placeholder="Tambah label..."
              class="flex-1"
              @keydown.enter.prevent="addLabel"
            />
            <BaseButton variant="secondary" size="sm" @click="addLabel">Tambah</BaseButton>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <BaseButton variant="secondary" @click="emit('close')">Batal</BaseButton>
        <BaseButton type="submit" :disabled="!form.title.trim()">
          {{ isEditing ? 'Simpan' : 'Buat Tugas' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
