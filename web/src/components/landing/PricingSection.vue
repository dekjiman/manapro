<script setup lang="ts">
import { ref } from 'vue'
import { config } from '@/config'

defineProps<{
  lang: 'id' | 'en'
}>()

const billingCycle = ref<'monthly' | 'yearly'>('monthly')

const plans = [
  {
    key: 'free',
    popular: false,
    priceId: 'Rp 0',
    priceEn: 'Rp 0',
    nameId: 'Free',
    nameEn: 'Free',
    descId: 'Untuk memulai',
    descEn: 'To get started',
    featuresId: ['3 anggota tim', '2 proyek', '100 MB storage', 'Kanban Board', 'Komentar'],
    featuresEn: ['3 team members', '2 projects', '100 MB storage', 'Kanban Board', 'Comments']
  },
  {
    key: 'pro',
    popular: true,
    priceId: 'Rp 49.000',
    priceEn: 'Rp 49,000',
    nameId: 'Pro',
    nameEn: 'Pro',
    descId: 'Untuk tim yang berkembang',
    descEn: 'For growing teams',
    featuresId: ['20 anggota tim', '20 proyek', '5 GB storage', 'Semua fitur Free', 'Kalender & Gantt', 'Financial tracking', 'Priority support'],
    featuresEn: ['20 team members', '20 projects', '5 GB storage', 'All Free features', 'Calendar & Gantt', 'Financial tracking', 'Priority support']
  },
  {
    key: 'enterprise',
    popular: false,
    priceId: 'Rp 199.000',
    priceEn: 'Rp 199,000',
    nameId: 'Enterprise',
    nameEn: 'Enterprise',
    descId: 'Untuk perusahaan',
    descEn: 'For companies',
    featuresId: ['Unlimited anggota', 'Unlimited proyek', '50 GB storage', 'Semua fitur Pro', 'Custom branding', 'Audit log', 'API access', 'Dedicated support'],
    featuresEn: ['Unlimited members', 'Unlimited projects', '50 GB storage', 'All Pro features', 'Custom branding', 'Audit log', 'API access', 'Dedicated support']
  }
]
</script>

<template>
  <section id="pricing" class="py-20 px-4 sm:px-6 lg:px-8 bg-background">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          {{ lang === 'id' ? 'Harga yang Terjangkau' : 'Affordable Pricing' }}
        </h2>
        <p class="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          {{ lang === 'id'
            ? 'Mulai gratis dan upgrade kapan saja sesuai kebutuhan bisnis Anda'
            : 'Start free and upgrade anytime as your business grows'
          }}
        </p>

        <!-- Billing Toggle -->
        <div class="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="billingCycle === 'monthly' ? 'bg-white shadow text-text-primary' : 'text-text-secondary'"
            @click="billingCycle = 'monthly'"
          >
            {{ lang === 'id' ? 'Bulanan' : 'Monthly' }}
          </button>
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="billingCycle === 'yearly' ? 'bg-white shadow text-text-primary' : 'text-text-secondary'"
            @click="billingCycle = 'yearly'"
          >
            {{ lang === 'id' ? 'Tahunan' : 'Yearly' }}
            <span class="ml-1 text-xs text-success">{{ lang === 'id' ? 'Hemat 20%' : 'Save 20%' }}</span>
          </button>
        </div>
      </div>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="relative bg-white rounded-2xl border-2 p-8 flex flex-col"
          :class="plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'"
        >
          <!-- Popular Badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-medium rounded-full"
          >
            {{ lang === 'id' ? 'Paling Populer' : 'Most Popular' }}
          </div>

          <h3 class="text-xl font-bold text-text-primary">
            {{ lang === 'id' ? plan.nameId : plan.nameEn }}
          </h3>
          <p class="text-sm text-text-secondary mt-1 mb-4">
            {{ lang === 'id' ? plan.descId : plan.descEn }}
          </p>

          <div class="mb-6">
            <span class="text-4xl font-bold text-text-primary">
              {{ lang === 'id' ? plan.priceId : plan.priceEn }}
            </span>
            <span class="text-text-secondary text-sm">
              {{ billingCycle === 'monthly'
                ? (lang === 'id' ? '/bulan' : '/month')
                : (lang === 'id' ? '/tahun' : '/year')
              }}
            </span>
          </div>

          <ul class="flex-1 space-y-3 mb-8">
            <li
              v-for="(feature, index) in (lang === 'id' ? plan.featuresId : plan.featuresEn)"
              :key="index"
              class="flex items-start gap-2 text-sm"
            >
              <svg class="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-text-secondary">{{ feature }}</span>
            </li>
          </ul>

          <a
            :href="config.registerUrl"
            class="w-full py-3 rounded-xl text-center font-medium transition-colors"
            :class="plan.popular
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'border-2 border-border text-text-primary hover:border-primary hover:text-primary'"
          >
            {{ plan.key === 'free'
              ? (lang === 'id' ? 'Mulai Gratis' : 'Start Free')
              : (lang === 'id' ? 'Pilih Paket' : 'Choose Plan')
            }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
