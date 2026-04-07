<script setup lang="ts">
defineProps<{
  lang: 'id' | 'en'
}>()

const testimonials = [
  {
    name: 'Budi Santoso',
    business: 'Toko Budi Online',
    avatar: 'B',
    color: 'bg-blue-500',
    quoteId: 'Manapro sangat membantu saya mengelola tim dan proyek. Sekarang semua tugas terorganisir dengan baik.',
    quoteEn: 'Manapro really helps me manage my team and projects. Now all tasks are well organized.'
  },
  {
    name: 'Siti Rahayu',
    business: 'Kerajinan Kulit Bali',
    avatar: 'S',
    color: 'bg-emerald-500',
    quoteId: 'Fitur Kanban-nya sangat intuitif. Tim saya langsung bisa menggunakannya tanpa pelatihan khusus.',
    quoteEn: 'The Kanban feature is very intuitive. My team can use it right away without special training.'
  },
  {
    name: 'Ahmad Rizki',
    business: 'CV Mandiri Jaya',
    avatar: 'A',
    color: 'bg-violet-500',
    quoteId: 'Harga terjangkau untuk fitur yang lengkap. Cocok untuk UMKM seperti kami.',
    quoteEn: 'Affordable price for complete features. Perfect for MSMEs like us.'
  }
]
</script>

<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          {{ lang === 'id' ? 'Dipercaya oleh UMKM Indonesia' : 'Trusted by Indonesian MSMEs' }}
        </h2>
        <p class="text-lg text-text-secondary">
          {{ lang === 'id' ? 'Lihat apa kata mereka tentang Manapro' : 'See what they say about Manapro' }}
        </p>
      </div>

      <!-- Testimonials Grid -->
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.name"
          class="bg-background rounded-2xl p-6 border border-border"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              :class="testimonial.color"
            >
              {{ testimonial.avatar }}
            </div>
            <div>
              <p class="font-medium text-text-primary">{{ testimonial.name }}</p>
              <p class="text-xs text-text-secondary">{{ testimonial.business }}</p>
            </div>
          </div>
          <p class="text-sm text-text-secondary italic">
            "{{ lang === 'id' ? testimonial.quoteId : testimonial.quoteEn }}"
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
