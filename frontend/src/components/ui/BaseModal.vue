<script setup lang="ts">
interface Props {
  show?: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  size: 'md'
})

const emit = defineEmits<{
  close: []
}>()

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
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
        v-if="props.show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="emit('close')"
      >
        <div
          :class="[sizeClasses[props.size], 'w-full bg-surface rounded-xl shadow-xl']"
          @click.stop
        >
          <div v-if="props.title" class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 class="text-lg font-semibold text-text-primary">{{ props.title }}</h3>
            <button
              class="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors"
              @click="emit('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-border bg-gray-50 rounded-b-xl">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
