<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/landing/Navbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import PricingSection from '@/components/landing/PricingSection.vue'
import TestimonialsSection from '@/components/landing/TestimonialsSection.vue'
import CTASection from '@/components/landing/CTASection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'

const lang = ref<'id' | 'en'>('id')

function toggleLang() {
  lang.value = lang.value === 'id' ? 'en' : 'id'
}
</script>

<template>
  <div class="min-h-screen">
    <Navbar :lang="lang" @toggle-lang="toggleLang" />
    <HeroSection :lang="lang" />
    <FeaturesSection :lang="lang" />
    <PricingSection :lang="lang" />
    <TestimonialsSection :lang="lang" />
    <CTASection :lang="lang" />
    <FooterSection :lang="lang" />
  </div>
</template>
