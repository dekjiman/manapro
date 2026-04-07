<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
  secondary: 'bg-white text-text-primary border border-border hover:bg-gray-50 focus:ring-primary',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-gray-100 focus:ring-primary',
  danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled || props.loading"
    :class="[baseClasses, variantClasses[props.variant], sizeClasses[props.size]]"
    @click="emit('click', $event)"
  >
    <svg
      v-if="props.loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>
