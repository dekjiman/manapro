<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="props.label" class="block text-sm font-medium text-text-primary mb-1.5">
      {{ props.label }}
    </label>
    <input
      :type="props.type"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="w-full px-3 py-2 border rounded-lg text-sm text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
      :class="props.error ? 'border-danger' : 'border-border'"
      @input="handleInput"
    />
    <p v-if="props.error" class="mt-1 text-xs text-danger">{{ props.error }}</p>
  </div>
</template>
