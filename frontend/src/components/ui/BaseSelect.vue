<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  options?: Option[]
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="props.label" class="block text-sm font-medium text-text-primary mb-1.5">
      {{ props.label }}
    </label>
    <select
      :value="props.modelValue"
      :disabled="props.disabled"
      class="w-full px-3 py-2 border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
      :class="props.error ? 'border-danger' : 'border-border'"
      @change="handleChange"
    >
      <option v-if="props.placeholder" value="" disabled>{{ props.placeholder }}</option>
      <option v-for="opt in props.options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="props.error" class="mt-1 text-xs text-danger">{{ props.error }}</p>
  </div>
</template>
