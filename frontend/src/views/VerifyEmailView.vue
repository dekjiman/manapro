<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useUIStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()

const isVerifying = ref(true)
const isVerified = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Token tidak ditemukan'
    isVerifying.value = false
    return
  }

  try {
    await api.post('/auth/verify-email', { token })
    isVerified.value = true
    uiStore.showToast('Email berhasil diverifikasi! Silakan login.', 'success')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Verifikasi gagal. Token mungkin expired.'
  } finally {
    isVerifying.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md text-center">
      <!-- Success -->
      <div v-if="isVerified" class="bg-surface rounded-xl border border-border p-8 shadow-sm">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-2">Email Diverifikasi!</h1>
        <p class="text-text-secondary mb-6">Akun Anda sudah aktif. Mengalihkan ke login...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-surface rounded-xl border border-border p-8 shadow-sm">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-2">Verifikasi Gagal</h1>
        <p class="text-text-secondary mb-6">{{ error }}</p>
        <router-link to="/register" class="text-primary hover:underline">
          Kembali ke Register
        </router-link>
      </div>

      <!-- Loading -->
      <div v-else class="bg-surface rounded-xl border border-border p-8 shadow-sm">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-2">Memverifikasi Email...</h1>
        <p class="text-text-secondary">Mohon tunggu sebentar</p>
      </div>
    </div>
  </div>
</template>
