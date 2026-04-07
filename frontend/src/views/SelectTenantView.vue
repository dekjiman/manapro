<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const userTenants = computed(() => {
  if (!authStore.currentUser) return []
  return tenantStore.getUserTenants(authStore.currentUser.id)
})

function selectTenant(tenantId: string) {
  authStore.setCurrentTenant(tenantId)
  tenantStore.setCurrentTenant(tenantId)
  router.push(`/w/${tenantId}/workspaces`)
}

function getPlanBadgeVariant(plan: string) {
  switch (plan) {
    case 'enterprise': return 'info'
    case 'pro': return 'warning'
    default: return 'default'
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'owner': return 'Pemilik'
    case 'admin': return 'Admin'
    case 'member': return 'Anggota'
    case 'viewer': return 'Peninjau'
    default: return role
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-2xl">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4">
          <span class="text-white font-bold text-2xl">M</span>
        </div>
        <h1 class="text-2xl font-bold text-text-primary">Pilih Bisnis</h1>
        <p class="text-text-secondary mt-1">Masuk ke bisnis yang ingin Anda kelola</p>
      </div>

      <!-- Tenant Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseCard
          v-for="tenant in userTenants"
          :key="tenant.id"
          hover
          @click="selectTenant(tenant.id)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span class="text-primary font-bold text-lg">{{ tenant.name.charAt(0) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <BaseBadge :variant="getPlanBadgeVariant(tenant.plan)">
                {{ tenant.plan.toUpperCase() }}
              </BaseBadge>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-text-primary mb-1">{{ tenant.name }}</h3>
          <p class="text-sm text-text-secondary">{{ getRoleLabel(tenant.role) }}</p>
          <p class="text-xs text-text-secondary mt-1">{{ tenant.slug }}.manapro.id</p>
        </BaseCard>
      </div>

      <!-- Create New -->
      <div class="mt-6 text-center">
        <p class="text-sm text-text-secondary mb-3">Ingin memulai bisnis baru?</p>
        <router-link to="/onboarding">
          <BaseButton variant="secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Bisnis Baru
          </BaseButton>
        </router-link>
      </div>

      <!-- Logout -->
      <div class="mt-4 text-center">
        <button
          class="text-sm text-text-secondary hover:text-danger transition-colors"
          @click="authStore.logout(); router.push('/login')"
        >
          Keluar dari akun
        </button>
      </div>
    </div>
  </div>
</template>
