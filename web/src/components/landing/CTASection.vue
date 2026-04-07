<script setup lang="ts">
import { config } from '@/config'

defineProps<{
  lang: 'id' | 'en'
}>()
</script>

<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8 hero-gradient">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
        {{ lang === 'id'
          ? 'Siap Tingkatkan Produktivitas Bisnis Anda?'
          : 'Ready to Boost Your Business Productivity?'
        }}
      </h2>
      <p class="text-lg text-white/80 mb-8">
        {{ lang === 'id'
          ? 'Bergabung dengan ribuan UMKM Indonesia yang sudah menggunakan Manapro'
          : 'Join thousands of Indonesian MSMEs already using Manapro'
        }}
      </p>
        <a
        :href="config.registerUrl"
        class="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
      >
        {{ lang === 'id' ? 'Mulai Gratis Sekarang' : 'Start Free Now' }}
      </a>
      <p class="mt-4 text-sm text-white/60">
        {{ lang === 'id' ? 'Gratis selamanya untuk 3 anggota' : 'Free forever for up to 3 members' }}
      </p>
    </div>
  </section>
</template>
