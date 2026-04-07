<script setup lang="ts">
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const uiStore = useUIStore()

const email = ref('')
const sent = ref(false)

function handleSubmit() {
  sent.value = true
  uiStore.showToast('Link reset kata sandi telah dikirim ke email Anda', 'success')
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
        <h1 class="text-2xl font-bold text-text-primary">Lupa Kata Sandi?</h1>
        <p class="text-text-secondary mt-1">Masukkan email untuk reset kata sandi</p>
      </div>

      <!-- Form -->
      <div class="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <template v-if="!sent">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <BaseInput
              v-model="email"
              label="Email"
              type="email"
              placeholder="email@example.com"
            />
            <BaseButton type="submit" class="w-full">
              Kirim Link Reset
            </BaseButton>
          </form>
        </template>
        <template v-else>
          <div class="text-center py-4">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-text-primary mb-2">Email Terkirim!</h3>
            <p class="text-sm text-text-secondary">
              Kami telah mengirim link reset kata sandi ke <strong>{{ email }}</strong>. Silakan cek inbox Anda.
            </p>
          </div>
        </template>

        <div class="mt-6 pt-6 border-t border-border text-center">
          <p class="text-sm text-text-secondary">
            Ingat kata sandi?
            <router-link to="/login" class="text-primary font-medium hover:underline">Masuk</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
