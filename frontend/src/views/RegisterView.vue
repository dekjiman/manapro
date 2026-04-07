<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const step = ref(1)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const selectedPlan = ref<'free' | 'pro' | 'enterprise'>('free')

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: 'Rp 0',
    desc: '3 anggota, 2 proyek',
    popular: false
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 'Rp 49rb',
    desc: '20 anggota, 20 proyek',
    popular: true
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Rp 199rb',
    desc: 'Unlimited, branding kustom',
    popular: false
  }
]

function nextStep() {
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
  step.value = 2
}

async function handleRegister() {
  const user = await authStore.register(name.value, email.value, password.value)
  if (user) {
    // Store selected plan for onboarding
    localStorage.setItem('manapro_selected_plan', selectedPlan.value)
    uiStore.showToast('Berhasil mendaftar!', 'success')
    router.push('/onboarding')
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

      <!-- Steps Indicator -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          :class="step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary'"
        >1</div>
        <div class="w-16 h-0.5" :class="step >= 2 ? 'bg-primary' : 'bg-gray-200'" />
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          :class="step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary'"
        >2</div>
      </div>

      <!-- Form Card -->
      <div class="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <!-- Step 1: Account Info -->
        <template v-if="step === 1">
          <h2 class="text-lg font-semibold text-text-primary mb-4">Informasi Akun</h2>
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
              @click="nextStep"
            >
              Lanjutkan
            </BaseButton>
          </div>
        </template>

        <!-- Step 2: Plan Selection -->
        <template v-if="step === 2">
          <button
            type="button"
            class="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4"
            @click="step = 1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>

          <h2 class="text-lg font-semibold text-text-primary mb-2">Pilih Paket</h2>
          <p class="text-sm text-text-secondary mb-6">Anda bisa upgrade kapan saja</p>

          <div class="space-y-3">
            <button
              v-for="plan in plans"
              :key="plan.key"
              type="button"
              class="w-full p-4 rounded-xl border-2 text-left transition-all relative"
              :class="selectedPlan === plan.key
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'"
              @click="selectedPlan = plan.key as any"
            >
              <!-- Popular Badge -->
              <span
                v-if="plan.popular"
                class="absolute -top-2 right-4 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full"
              >
                Populer
              </span>

              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-text-primary">{{ plan.name }}</p>
                  <p class="text-sm text-text-secondary">{{ plan.desc }}</p>
                </div>
                <p class="text-lg font-bold text-primary">
                  {{ plan.price }}
                  <span v-if="plan.key !== 'free'" class="text-xs font-normal text-text-secondary">/bln</span>
                </p>
              </div>

              <!-- Checkmark -->
              <div
                v-if="selectedPlan === plan.key"
                class="absolute top-4 right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
              >
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>

          <p v-if="authStore.error" class="text-sm text-danger bg-red-50 p-3 rounded-lg mt-4">
            {{ authStore.error }}
          </p>

          <BaseButton
            type="button"
            class="w-full mt-6"
            :loading="authStore.isLoading"
            @click="handleRegister"
          >
            Daftar & Mulai
          </BaseButton>

          <p class="text-xs text-text-secondary text-center mt-3">
            Tidak perlu kartu kredit untuk paket Free
          </p>
        </template>

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
