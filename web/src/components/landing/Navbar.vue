<script setup lang="ts">
import { ref } from 'vue'
import { config } from '@/config'

defineProps<{
  lang: 'id' | 'en'
}>()

const emit = defineEmits<{
  toggleLang: []
}>()

const isMenuOpen = ref(false)
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">M</span>
          </div>
          <span class="font-bold text-xl text-text-primary">Manapro</span>
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm text-text-secondary hover:text-text-primary transition-colors">
            {{ lang === 'id' ? 'Fitur' : 'Features' }}
          </a>
          <a href="#pricing" class="text-sm text-text-secondary hover:text-text-primary transition-colors">
            {{ lang === 'id' ? 'Harga' : 'Pricing' }}
          </a>
          <button
            class="text-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded"
            @click="emit('toggleLang')"
          >
            {{ lang === 'id' ? 'EN' : 'ID' }}
          </button>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center gap-3">
          <a
            :href="config.loginUrl"
            class="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {{ lang === 'id' ? 'Masuk' : 'Sign In' }}
          </a>
          <a
            :href="config.registerUrl"
            class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            {{ lang === 'id' ? 'Mulai Gratis' : 'Get Started Free' }}
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 rounded-lg hover:bg-gray-100"
          @click="isMenuOpen = !isMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden py-4 border-t border-border">
        <div class="flex flex-col gap-4">
          <a href="#features" class="text-sm text-text-secondary" @click="isMenuOpen = false">
            {{ lang === 'id' ? 'Fitur' : 'Features' }}
          </a>
          <a href="#pricing" class="text-sm text-text-secondary" @click="isMenuOpen = false">
            {{ lang === 'id' ? 'Harga' : 'Pricing' }}
          </a>
          <hr class="border-border" />
          <a :href="config.loginUrl" class="text-sm text-text-secondary">
            {{ lang === 'id' ? 'Masuk' : 'Sign In' }}
          </a>
          <a :href="config.registerUrl" class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg text-center">
            {{ lang === 'id' ? 'Mulai Gratis' : 'Get Started Free' }}
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>
