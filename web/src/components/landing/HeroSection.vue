<script setup lang="ts">
import { config } from '@/config'

defineProps<{
  lang: 'id' | 'en'
}>()
</script>

<template>
  <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8 hero-gradient">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Text Content -->
        <div class="text-center lg:text-left animate-fade-in">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {{ lang === 'id'
              ? 'Kelola Proyek Bisnis Anda dengan Mudah'
              : 'Manage Your Business Projects with Ease'
            }}
          </h1>
          <p class="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
            {{ lang === 'id'
              ? 'Dirancang khusus untuk UMKM Indonesia. Sederhana, efisien, dan terjangkau. Tingkatkan produktivitas tim Anda hari ini.'
              : 'Designed specifically for Indonesian MSMEs. Simple, efficient, and affordable. Boost your team productivity today.'
            }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              :href="config.registerUrl"
              class="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors text-center shadow-lg"
            >
              {{ lang === 'id' ? 'Mulai Gratis' : 'Start Free' }}
            </a>
            <a
              href="#features"
              class="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-center border border-white/20"
            >
              {{ lang === 'id' ? 'Lihat Fitur' : 'View Features' }}
            </a>
          </div>
          <p class="mt-4 text-sm text-white/60">
            {{ lang === 'id' ? 'Tidak perlu kartu kredit' : 'No credit card required' }}
          </p>
        </div>

        <!-- Illustration -->
        <div class="hidden lg:block animate-float">
          <div class="relative">
            <!-- App Mockup -->
            <div class="bg-white rounded-2xl shadow-2xl p-4 transform rotate-2">
              <div class="bg-gray-100 rounded-xl p-6">
                <!-- Header -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-primary rounded-lg"></div>
                  <div class="h-3 bg-gray-300 rounded w-24"></div>
                </div>
                <!-- Columns -->
                <div class="flex gap-3">
                  <div class="flex-1">
                    <div class="h-3 bg-gray-300 rounded w-16 mb-3"></div>
                    <div class="space-y-2">
                      <div class="bg-white rounded-lg p-3 shadow-sm">
                        <div class="h-2 bg-primary/20 rounded w-full mb-2"></div>
                        <div class="h-2 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div class="bg-white rounded-lg p-3 shadow-sm">
                        <div class="h-2 bg-amber-200 rounded w-full mb-2"></div>
                        <div class="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="h-3 bg-gray-300 rounded w-20 mb-3"></div>
                    <div class="space-y-2">
                      <div class="bg-white rounded-lg p-3 shadow-sm">
                        <div class="h-2 bg-blue-200 rounded w-full mb-2"></div>
                        <div class="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="h-3 bg-gray-300 rounded w-12 mb-3"></div>
                    <div class="space-y-2">
                      <div class="bg-white rounded-lg p-3 shadow-sm">
                        <div class="h-2 bg-emerald-200 rounded w-full mb-2"></div>
                        <div class="h-2 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div class="bg-white rounded-lg p-3 shadow-sm">
                        <div class="h-2 bg-emerald-200 rounded w-full mb-2"></div>
                        <div class="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
