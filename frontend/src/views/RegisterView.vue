<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

// If coming from invitation link, pre-fill email
const invitationToken = route.query.invitation_token as string | undefined
const name = ref('')
const email = ref(route.query.email as string || '')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isRegistering = ref(false)

async function handleRegister() {
  if (!name.value.trim() || !email.value.trim() || !password.value) return
  if (password.value !== confirmPassword.value) {
    authStore.$patch({ error: 'Kata sandi tidak cocok' })
    return
  }
  if (password.value.length < 6) {
    authStore.$patch({ error: 'Kata sandi minimal 6 karakter' })
    return
  }

  authStore.clearError()

  try {
    isRegistering.value = true
    const user = await authStore.register(name.value, email.value, password.value, invitationToken)
    if (user) {
      if (invitationToken) {
        // Coming from invitation - go to select tenant or workspace
        uiStore.showToast('Pendaftaran berhasil! Anda telah bergabung dengan tim.', 'success')
        const tid = user.current_tenant_id || user.tenant_ids?.[0]
        if (tid) {
          router.push(`/w/${tid}/workspaces`)
        } else {
          router.push('/onboarding')
        }
      } else {
        uiStore.showToast('Pendaftaran berhasil! Silakan cek email untuk aktivasi akun.', 'success')
        router.push('/login')
      }
    }
  } finally {
    isRegistering.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-lg">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4">
          <span class="text-white font-bold text-2xl">M</span>
        </div>
        <h1 class="text-2xl font-bold text-text-primary">Buat Akun Baru</h1>
        <p class="text-text-secondary mt-1">Mulai kelola proyek Anda hari ini</p>
      </div>



      <!-- Form Card -->
      <div class="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-text-primary mb-4">Buat Akun</h2>
        <div class="space-y-4">
          <BaseInput
            v-model="name"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
          />
          <BaseInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
          />
          <div class="relative">
            <BaseInput
              v-model="password"
              label="Kata Sandi"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 6 karakter"
            />
            <button
              type="button"
              class="absolute right-3 top-9 text-text-secondary hover:text-text-primary"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <BaseInput
            v-model="confirmPassword"
            label="Konfirmasi Kata Sandi"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Ulangi kata sandi"
          />

          <p v-if="authStore.error" class="text-sm text-danger bg-red-50 p-3 rounded-lg">
            {{ authStore.error }}
          </p>

          <BaseButton
            type="button"
            class="w-full"
            :disabled="!name.trim() || !email.trim() || !password || !confirmPassword"
            :loading="authStore.isLoading"
            @click="handleRegister"
          >
            Simpan
          </BaseButton>
        </div>

        <!-- Login Link -->
        <div class="mt-6 pt-6 border-t border-border text-center">
          <p class="text-sm text-text-secondary">
            Sudah punya akun?
            <router-link to="/login" class="text-primary font-medium hover:underline">Masuk</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
