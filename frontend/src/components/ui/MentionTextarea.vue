<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { User } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  rows: 2
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'mentions': [userIds: string[]]
}>()

const authStore = useAuthStore()
const tenantStore = useTenantStore()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showDropdown = ref(false)
const dropdownFilter = ref('')
const selectedIndex = ref(0)
const mentionStartPos = ref(-1)

const tenantMembers = computed(() => {
  const currentTenantId = tenantStore.currentTenantId
  if (!currentTenantId) return []

  const memberRecords = tenantStore.tenantMembers.filter(m => m.tenant_id === currentTenantId)
  return memberRecords
    .map(m => authStore.users.find(u => u.id === m.user_id))
    .filter((u): u is User => !!u && u.id !== authStore.currentUser?.id)
})

const filteredMembers = computed(() => {
  if (!dropdownFilter.value) return tenantMembers.value
  const filter = dropdownFilter.value.toLowerCase()
  return tenantMembers.value.filter(u =>
    u.name.toLowerCase().includes(filter)
  )
})

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  const cursorPos = target.selectionStart ?? value.length

  emit('update:modelValue', value)

  // Find last @ before cursor
  const textBeforeCursor = value.slice(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1) {
    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
    // Show dropdown if no space after @ OR if we're still typing a name
    if (!textAfterAt.includes(' ')) {
      mentionStartPos.value = lastAtIndex
      dropdownFilter.value = textAfterAt
      showDropdown.value = true
      selectedIndex.value = 0
      return
    }
  }

  showDropdown.value = false
}

function selectMember(user: User) {
  if (!textareaRef.value) return

  const value = props.modelValue
  const before = value.slice(0, mentionStartPos.value)
  const after = value.slice(textareaRef.value.selectionStart ?? value.length)
  const newValue = `${before}@${user.name} ${after}`

  emit('update:modelValue', newValue)
  showDropdown.value = false

  nextTick(() => {
    if (textareaRef.value) {
      const newPos = mentionStartPos.value + user.name.length + 2
      textareaRef.value.focus()
      textareaRef.value.setSelectionRange(newPos, newPos)
    }
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (!showDropdown.value || filteredMembers.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredMembers.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    selectMember(filteredMembers.value[selectedIndex.value])
  } else if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Parse mentions from text - called externally
function parseMentionsFromText(text: string): string[] {
  const mentionRegex = /@([A-Za-z\s]+?)(?=\s|$|[.,!?;])/g
  const mentionedNames: string[] = []
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    mentionedNames.push(match[1].trim())
  }

  return mentionedNames
    .map(name => authStore.users.find(u => u.name.toLowerCase() === name.toLowerCase()))
    .filter((u): u is User => !!u)
    .map(u => u.id)
}

// Expose parseMentions to parent
defineExpose({ parseMentions: parseMentionsFromText })
</script>

<template>
  <div class="relative">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      class="w-full px-3 py-2 border rounded-lg text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none border-border"
      @input="handleInput"
      @keydown="handleKeydown"
      @blur="handleBlur"
    />

    <!-- Mention Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showDropdown && filteredMembers.length > 0"
        class="absolute bottom-full left-0 mb-1 w-64 bg-surface rounded-lg shadow-lg border border-border z-50 max-h-48 overflow-y-auto"
      >
        <div class="p-2 border-b border-border">
          <p class="text-xs text-text-secondary">Sebut anggota tim</p>
        </div>
        <div class="py-1">
          <button
            v-for="(user, index) in filteredMembers"
            :key="user.id"
            class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
            :class="{ 'bg-primary/5': index === selectedIndex }"
            @mousedown.prevent="selectMember(user)"
          >
            <BaseAvatar :name="user.name" size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ user.name }}</p>
              <p class="text-xs text-text-secondary truncate">{{ user.jabatan || user.email }}</p>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
