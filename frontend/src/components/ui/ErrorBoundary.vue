<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const errorInfo = ref<string>('')

onErrorCaptured((err, _instance, info) => {
  error.value = err as Error
  errorInfo.value = info
  console.error('ErrorBoundary caught:', err, info)
  return false
})

function reset() {
  error.value = null
  errorInfo.value = ''
}
</script>

<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
        <svg class="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-text-primary mb-2">Terjadi Kesalahan</h1>
      <p class="text-text-secondary mb-2">{{ error.message }}</p>
      <p v-if="errorInfo" class="text-xs text-text-secondary mb-6">Detail: {{ errorInfo }}</p>
      <div class="flex justify-center gap-3">
        <button
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          @click="reset"
        >
          Coba Lagi
        </button>
        <button
          class="px-4 py-2 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition-colors"
          @click="$router.push('/')"
        >
          Kembali ke Home
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>
