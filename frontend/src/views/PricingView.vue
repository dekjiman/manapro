<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore, PLAN_FEATURES } from '@/stores/subscription'
import { useUIStore } from '@/stores/ui'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const uiStore = useUIStore()

const plans = computed(() => [
  {
    key: 'free',
    ...PLAN_FEATURES.free,
    popular: false,
    features: [
      '3 anggota tim',
      '2 proyek',
      '100 MB storage',
      'Kanban Board',
      'Komentar & lampiran',
      'Notifikasi real-time'
    ]
  },
  {
    key: 'pro',
    ...PLAN_FEATURES.pro,
    popular: true,
    features: [
      '20 anggota tim',
      '20 proyek',
      '5 GB storage',
      'Semua fitur Free',
      'Kalender & Gantt Chart',
      'Otomatisasi workflow',
      'Financial tracking',
      'Offline mode penuh',
      'Priority support'
    ]
  },
  {
    key: 'enterprise',
    ...PLAN_FEATURES.enterprise,
    popular: false,
    features: [
      'Unlimited anggota',
      'Unlimited proyek',
      '50 GB storage',
      'Semua fitur Pro',
      'Custom branding',
      'Audit log',
      'API access',
      'Dedicated support',
      'SLA 99.9%'
    ]
  }
])

function selectPlan(planKey: string) {
  if (planKey === 'free') {
    router.push('/onboarding')
  } else {
    uiStore.showToast('Silakan buat bisnis terlebih dahulu, lalu upgrade dari dashboard', 'info')
    router.push('/onboarding')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="bg-surface border-b border-border">
      <div class="max-w-5xl mx-auto px-6 py-12 text-center">
        <h1 class="text-3xl font-bold text-text-primary mb-3">Pilih Paket yang Tepat untuk Bisnis Anda</h1>
        <p class="text-text-secondary max-w-xl mx-auto">
          Mulai gratis dan upgrade kapan saja. Semua paket termasuk fitur Kanban board dan kolaborasi tim.
        </p>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="max-w-5xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="relative bg-surface rounded-xl border-2 p-6 flex flex-col"
          :class="plan.popular ? 'border-primary shadow-lg' : 'border-border'"
        >
          <!-- Popular badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full"
          >
            Paling Populer
          </div>

          <h3 class="text-xl font-bold text-text-primary">{{ plan.name }}</h3>
          <div class="mt-2 mb-4">
            <span class="text-3xl font-bold text-text-primary">
              {{ subscriptionStore.formatPrice(plan.price) }}
            </span>
            <span class="text-text-secondary text-sm">/bulan</span>
            <p v-if="plan.price > 0" class="text-xs text-text-secondary mt-1">
              atau {{ subscriptionStore.formatPrice(plan.price_yearly) }}/tahun (hemat 20%)
            </p>
          </div>

          <ul class="flex-1 space-y-2 mb-6">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm">
              <svg class="w-4 h-4 text-success mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-text-secondary">{{ feature }}</span>
            </li>
          </ul>

          <BaseButton
            :variant="plan.popular ? 'primary' : 'secondary'"
            class="w-full"
            @click="selectPlan(plan.key)"
          >
            {{ plan.key === 'free' ? 'Mulai Gratis' : 'Pilih ' + plan.name }}
          </BaseButton>
        </div>
      </div>

      <!-- Back link -->
      <div class="text-center mt-8">
        <router-link to="/login" class="text-sm text-text-secondary hover:text-primary transition-colors">
          &larr; Kembali ke login
        </router-link>
      </div>
    </div>
  </div>
</template>
