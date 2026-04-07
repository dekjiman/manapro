<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useI18n } from '@/utils/i18n'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { t } = useI18n()

const email = ref('budi@manapro.id')
const password = ref('password123')
const showPassword = ref(false)

async function handleLogin() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    uiStore.showToast(t('toast.loginSuccess'), 'success')

    const user = authStore.currentUser
    if (!user) return

    if (!user.tenant_ids || user.tenant_ids.length === 0) {
      router.push('/onboarding')
      return
    }

    if (user.tenant_ids.length > 1 && !user.current_tenant_id) {
      router.push('/select-tenant')
      return
    }

    const tid = user.current_tenant_id || user.tenant_ids[0]
    authStore.setCurrentTenant(tid)
    router.push(`/w/${tid}/workspaces`)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4">
          <span class="text-white font-bold text-2xl">M</span>
        </div>
        <h1 class="text-2xl font-bold text-text-primary">{{ t('auth.loginTitle') }}</h1>
        <p class="text-text-secondary mt-1">{{ t('auth.loginSubtitle') }}</p>
      </div>

      <!-- Form -->
      <form class="bg-surface rounded-xl border border-border p-6 shadow-sm" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <BaseInput
            v-model="email"
            :label="t('auth.email')"
            type="email"
            placeholder="email@example.com"
          />
          <div class="relative">
            <BaseInput
              v-model="password"
              :label="t('auth.password')"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
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

          <p v-if="authStore.error" class="text-sm text-danger bg-red-50 p-3 rounded-lg">
            {{ authStore.error }}
          </p>

          <BaseButton
            type="submit"
            class="w-full"
            :loading="authStore.isLoading"
          >
            {{ t('auth.login') }}
          </BaseButton>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm">
          <router-link to="/forgot-password" class="text-primary hover:underline">
            {{ t('auth.forgotPassword') }}
          </router-link>
          <router-link to="/pricing" class="text-text-secondary hover:text-primary">
            {{ t('pricing.title').split(' ').slice(0, 3).join(' ') }}...
          </router-link>
        </div>

        <div class="mt-6 pt-6 border-t border-border text-center">
          <p class="text-sm text-text-secondary">
            {{ t('auth.noAccount') }}
            <router-link to="/register" class="text-primary font-medium hover:underline">{{ t('auth.register') }}</router-link>
          </p>
        </div>
      </form>

      <p class="text-center text-xs text-text-secondary mt-6">
        Demo: <code class="bg-gray-100 px-1.5 py-0.5 rounded">budi@manapro.id</code> / {{ t('auth.minPassword') }}
      </p>
    </div>
  </div>
</template>
