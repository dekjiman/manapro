<script setup lang="ts">
defineProps<{
  lang: 'id' | 'en'
}>()

const features = [
  {
    icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7',
    color: 'bg-blue-100 text-blue-600',
    titleKey: 'kanban',
    titleId: 'Kanban Board',
    titleEn: 'Kanban Board',
    descId: 'Visualisasi tugas dengan drag & drop. Pindahkan tugas antar kolom dengan mudah.',
    descEn: 'Visualize tasks with drag & drop. Move tasks between columns effortlessly.'
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'bg-emerald-100 text-emerald-600',
    titleKey: 'collaboration',
    titleId: 'Kolaborasi Tim',
    titleEn: 'Team Collaboration',
    descId: 'Komentar, @mention anggota tim, dan notifikasi real-time untuk koordinasi yang lebih baik.',
    descEn: 'Comments, @mentions, and real-time notifications for better coordination.'
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'bg-amber-100 text-amber-600',
    titleKey: 'finance',
    titleId: 'Tracking Keuangan',
    titleEn: 'Financial Tracking',
    descId: 'Pantau biaya dan pendapatan proyek. Integrasi dengan e-invoicing lokal.',
    descEn: 'Monitor project costs and revenue. Integration with local e-invoicing.'
  },
  {
    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    color: 'bg-violet-100 text-violet-600',
    titleKey: 'mobile',
    titleId: 'Mobile Friendly',
    titleEn: 'Mobile Friendly',
    descId: 'Akses dari mana saja, kapan saja. Tampilan responsif untuk semua perangkat.',
    descEn: 'Access from anywhere, anytime. Responsive design for all devices.'
  },
  {
    icon: 'M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3',
    color: 'bg-cyan-100 text-cyan-600',
    titleKey: 'offline',
    titleId: 'Offline Mode',
    titleEn: 'Offline Mode',
    descId: 'Tetap produktif tanpa internet. Data otomatis tersinkron saat online.',
    descEn: 'Stay productive without internet. Data syncs automatically when online.'
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'bg-pink-100 text-pink-600',
    titleKey: 'analytics',
    titleId: 'Analitik & Laporan',
    titleEn: 'Analytics & Reports',
    descId: 'Dashboard performa tim dan laporan KPI untuk pengambilan keputusan yang lebih baik.',
    descEn: 'Team performance dashboard and KPI reports for better decision making.'
  }
]
</script>

<template>
  <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          {{ lang === 'id' ? 'Fitur yang Anda Butuhkan' : 'Everything You Need' }}
        </h2>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto">
          {{ lang === 'id'
            ? 'Semua yang diperlukan untuk mengelola bisnis Anda dengan efisien'
            : 'All the tools required to manage your business efficiently'
          }}
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="feature in features"
          :key="feature.titleKey"
          class="group p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            :class="feature.color"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-text-primary mb-2">
            {{ lang === 'id' ? feature.titleId : feature.titleEn }}
          </h3>
          <p class="text-sm text-text-secondary">
            {{ lang === 'id' ? feature.descId : feature.descEn }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
