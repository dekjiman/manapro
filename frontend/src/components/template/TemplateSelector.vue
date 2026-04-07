<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplateStore, type Template } from '@/stores/template'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [template: Template]
  skip: []
}>()

const templateStore = useTemplateStore()

const selectedCategory = ref('marketing')
const selectedTemplate = ref<Template | null>(null)
const step = ref<'category' | 'preview'>('category')

const filteredTemplates = computed(() =>
  templateStore.getTemplatesByCategory(selectedCategory.value)
)

function selectCategory(cat: string) {
  selectedCategory.value = cat
  selectedTemplate.value = null
  step.value = 'category'
}

function selectTemplate(tmpl: Template) {
  selectedTemplate.value = tmpl
  step.value = 'preview'
}

function handleConfirm() {
  if (selectedTemplate.value) {
    emit('select', selectedTemplate.value)
  }
}

function handleBack() {
  step.value = 'category'
  selectedTemplate.value = null
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'marketing': return 'info'
    case 'hr': return 'success'
    case 'finance': return 'warning'
    case 'sales': return 'danger'
    case 'operations': return 'default'
    default: return 'default'
  }
}
</script>

<template>
  <BaseModal
    :show="show"
    title=""
    size="lg"
    @close="emit('close')"
  >
    <!-- Category Selection -->
    <template v-if="step === 'category'">
      <h2 class="text-xl font-bold text-text-primary mb-2">Pilih Template</h2>
      <p class="text-sm text-text-secondary mb-6">Mulai cepat dengan template yang sudah disiapkan</p>

      <!-- Category Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="cat in templateStore.categories"
          :key="cat.key"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="selectedCategory === cat.key
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Template Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        <button
          v-for="tmpl in filteredTemplates"
          :key="tmpl.id"
          class="text-left p-4 rounded-xl border-2 transition-all hover:shadow-md"
          :class="selectedTemplate?.id === tmpl.id
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/30'"
          @click="selectTemplate(tmpl)"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-text-primary">{{ tmpl.name }}</h3>
            <BaseBadge :variant="getCategoryColor(tmpl.category)" size="sm">
              {{ tmpl.columns.length }} kolom
            </BaseBadge>
          </div>
          <p class="text-sm text-text-secondary">{{ tmpl.description }}</p>
          <div class="flex gap-1 mt-3">
            <span
              v-for="col in tmpl.columns.slice(0, 4)"
              :key="col.name"
              class="text-xs px-1.5 py-0.5 rounded"
              :style="{ backgroundColor: col.color + '20', color: col.color }"
            >
              {{ col.name }}
            </span>
            <span v-if="tmpl.columns.length > 4" class="text-xs text-text-secondary">
              +{{ tmpl.columns.length - 4 }}
            </span>
          </div>
        </button>
      </div>

      <div class="flex justify-between mt-6 pt-4 border-t border-border">
        <BaseButton variant="ghost" @click="emit('skip')">
          Lewati, buat kosong
        </BaseButton>
        <BaseButton
          :disabled="!selectedTemplate"
          @click="step = 'preview'"
        >
          Lihat Preview
        </BaseButton>
      </div>
    </template>

    <!-- Preview -->
    <template v-if="step === 'preview' && selectedTemplate">
      <button
        class="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4"
        @click="handleBack"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      <h2 class="text-xl font-bold text-text-primary mb-1">{{ selectedTemplate.name }}</h2>
      <p class="text-sm text-text-secondary mb-6">{{ selectedTemplate.description }}</p>

      <!-- Preview Columns -->
      <div class="flex gap-3 overflow-x-auto pb-4 mb-6">
        <div
          v-for="(col, index) in selectedTemplate.columns"
          :key="index"
          class="w-48 shrink-0 bg-gray-50 rounded-lg p-3"
        >
          <div class="flex items-center gap-2 mb-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: col.color }" />
            <span class="text-sm font-medium text-text-primary">{{ col.name }}</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="task in selectedTemplate.sampleTasks.filter(t => t.column === index)"
              :key="task.title"
              class="bg-surface rounded-lg p-2 border border-border"
            >
              <p class="text-xs text-text-primary">{{ task.title }}</p>
              <span
                class="inline-block mt-1 text-[10px] px-1 rounded"
                :class="{
                  'bg-red-100 text-red-600': task.priority === 'high',
                  'bg-amber-100 text-amber-600': task.priority === 'medium',
                  'bg-gray-100 text-gray-600': task.priority === 'low'
                }"
              >
                {{ task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah' }}
              </span>
            </div>
            <div v-if="selectedTemplate.sampleTasks.filter(t => t.column === index).length === 0" class="text-xs text-text-secondary text-center py-2">
              Kosong
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-border">
        <BaseButton variant="secondary" @click="handleBack">Kembali</BaseButton>
        <BaseButton @click="handleConfirm">Gunakan Template Ini</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
