<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()

const isLoading = ref(true)
const invitation = ref<any>(null)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Token tidak ditemukan'
    isLoading.value = false
    return
  }

  try {
    const data = await api.get<any>(`/invitations/${token}`)
    invitation.value = data
    isLoading.value = false
  } catch (err: any) {
    error.value = err.message || 'Invitation tidak valid atau sudah expired'
    isLoading.value = false
  }
})

async function handleAccept() {
  if (!invitation.value) return

  try {
    // If not logged in, redirect to register with token and email
    if (!authStore.isLoggedIn) {
      router.push(`/register?invitation_token=${route.query.token}&email=${encodeURIComponent(invitation.value.email)}`)
      return
    }

    // Accept invitation (adds current user to tenant)
    await api.post('/invitations/accept', { token: route.query.token })
    uiStore.showToast('Anda berhasil bergabung dengan tim!', 'success')

    // Refresh tenant data
    const { useTenantStore } = await import('@/stores/tenant')
    const tenantStore = useTenantStore()
    await tenantStore.fetchTenants()

    router.push(`/w/${invitation.value.tenantId}/workspaces`)
  } catch (err: any) {
    uiStore.showToast(err.message || 'Gagal menerima undangan', 'error')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md text-center">
      <!-- Loading -->
      <div v-if="isLoading" class="bg-surface rounded-xl border border-border p-8 shadow-sm">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-2">Memuat...</h1>
        <p class="text-text-secondary">Mohon tunggu sebentar</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-surface rounded-xl border border-border p-8 shadow-sm">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-2">Undangan Tidak Valid</h1>
        <p class="text-text-secondary mb-6">{{ error }}</p>
        <router-link to="/register" class="text-primary hover:underline">
          Kembali ke Register
        </router-link>
      </div>

      <!-- Invitation Details -->
      <div v-else-if="invitation" class="bg-surface rounded-xl border border-border p-8 shadow-sm">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-2">Undangan untuk Bergabung</h1>
        <p class="text-text-secondary mb-4">
          Anda diundang untuk bergabung sebagai <strong>{{ invitation.role }}</strong>
        </p>
        <p class="text-lg font-semibold text-text-primary mb-6">{{ invitation.tenantName }}</p>
        <BaseButton class="w-full" @click="handleAccept">
          Terima Undangan
        </BaseButton>
        <p class="text-sm text-text-secondary mt-4">
          Atau
          <router-link to="/login" class="text-primary hover:underline">login terlebih dahulu</router-link>
        </p>
      </div>
    </div>
  </div>
</template>