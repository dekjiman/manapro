<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import BaseBadge from './BaseBadge.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const isOpen = ref(false)

const userTenants = computed(() => {
  if (!authStore.currentUser) return []
  return tenantStore.getUserTenants(authStore.currentUser.id)
})

const currentTenant = computed(() => tenantStore.currentTenant)

function switchTenant(tenantId: string) {
  authStore.setCurrentTenant(tenantId)
  tenantStore.setCurrentTenant(tenantId)
  isOpen.value = false
  router.push(`/w/${tenantId}/workspaces`)
}

function getPlanColor(plan: string) {
  switch (plan) {
    case 'enterprise': return 'info'
    case 'pro': return 'warning'
    default: return 'default'
  }
}
</script>

<template>
  <div class="relative">
    <button
      class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      @click="isOpen = !isOpen"
    >
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
        {{ currentTenant?.name.charAt(0) || '?' }}
      </div>
      <div class="flex-1 min-w-0 text-left">
        <p class="text-sm font-medium text-text-primary truncate">{{ currentTenant?.name || 'Pilih Bisnis' }}</p>
        <div class="flex items-center gap-1">
          <BaseBadge v-if="currentTenant" :variant="getPlanColor(currentTenant.plan)" size="sm">
            {{ currentTenant.plan.toUpperCase() }}
          </BaseBadge>
        </div>
      </div>
      <svg class="w-4 h-4 text-text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    </button>

    <!-- Backdrop -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full mt-1 w-full bg-surface rounded-lg shadow-lg border border-border z-50 py-1"
      >
        <div class="px-3 py-2 border-b border-border">
          <p class="text-xs font-medium text-text-secondary uppercase">Bisnis Saya</p>
        </div>
        <button
          v-for="tenant in userTenants"
          :key="tenant.id"
          class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-primary/5': tenant.id === currentTenant?.id }"
          @click="switchTenant(tenant.id)"
        >
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
            :class="tenant.id === currentTenant?.id ? 'bg-primary' : 'bg-gray-400'"
          >
            {{ tenant.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-medium text-text-primary truncate">{{ tenant.name }}</p>
          </div>
          <BaseBadge :variant="getPlanColor(tenant.plan)" size="sm">
            {{ tenant.plan.toUpperCase() }}
          </BaseBadge>
        </button>
        <div class="border-t border-border mt-1 pt-1">
          <router-link
            to="/onboarding"
            class="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
            @click="isOpen = false"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Buat Bisnis Baru
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>
