<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore, PLAN_LIMITS } from '@/stores/tenant'
import { useWorkspaceStore } from '@/stores/workspace'
import { useSubscriptionStore } from '@/stores/subscription'
import { useUIStore } from '@/stores/ui'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()
const workspaceStore = useWorkspaceStore()
const subscriptionStore = useSubscriptionStore()
const uiStore = useUIStore()

const tenantName = ref('')
const isCreating = ref(false)

// Check if user already has tenants
const existingTenants = computed(() => {
  if (!authStore.currentUser) return []
  return tenantStore.getUserTenants(authStore.currentUser.id)
})

// If user already has tenant, redirect to workspace
onMounted(() => {
  if (existingTenants.value.length > 0) {
    const tenant = existingTenants.value[0]
    router.replace(`/w/${tenant.id}/workspaces`)
  }
})

async function handleCreateBusiness() {
  if (!tenantName.value.trim() || !authStore.currentUser || isCreating.value) return

  // Check if tenant with same name exists
  const existingByName = existingTenants.value.find(
    t => t.name.toLowerCase() === tenantName.value.trim().toLowerCase()
  )
  if (existingByName) {
    uiStore.showToast('Bisnis dengan nama ini sudah ada', 'warning')
    return
  }

  isCreating.value = true

  // Get selected plan from register step
  const selectedPlan = (localStorage.getItem('manapro_selected_plan') as 'free' | 'pro' | 'enterprise') || 'free'
  localStorage.removeItem('manapro_selected_plan')

  // Create tenant
  const tenant = await tenantStore.createTenant(
    tenantName.value.trim(),
    authStore.currentUser.id,
    selectedPlan
  )

  // Create subscription
  subscriptionStore.subscriptions.push({
    id: `sub${Date.now()}`,
    tenant_id: tenant.id,
    plan: selectedPlan,
    status: selectedPlan === 'free' ? 'active' : 'trial',
    billing_cycle: 'monthly',
    price: subscriptionStore.getPlanFeatures(selectedPlan).price,
    current_period_start: new Date().toISOString().split('T')[0],
    current_period_end: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  })

  // Auto-create first workspace
  const workspace = workspaceStore.createWorkspace(
    'Proyek Pertama',
    tenant.id,
    authStore.currentUser.id
  )

  // Update user tenant info
  authStore.setCurrentTenant(tenant.id)
  tenantStore.setCurrentTenant(tenant.id)

  uiStore.showToast('Bisnis berhasil dibuat!', 'success')

  // Redirect to welcome page
  router.push({
    path: '/welcome',
    query: {
      tenantId: tenant.id,
      workspaceId: workspace.id
    }
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4">
          <span class="text-white font-bold text-2xl">M</span>
        </div>
        <h1 class="text-2xl font-bold text-text-primary">Satu Langkah Lagi!</h1>
        <p class="text-text-secondary mt-1">Buat bisnis Anda untuk mulai menggunakan Manapro</p>
      </div>

      <!-- Form -->
      <div class="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <div class="space-y-4">
          <BaseInput
            v-model="tenantName"
            label="Nama Bisnis/UMKM"
            placeholder="Contoh: Toko Budi Online"
          />
          <p class="text-xs text-text-secondary">
            Bisnis ini akan menjadi tempat Anda mengelola semua proyek dan tim.
          </p>
        </div>

        <BaseButton
          class="w-full mt-6"
          :loading="isCreating"
          :disabled="!tenantName.trim()"
          @click="handleCreateBusiness"
        >
          Buat Bisnis Saya
        </BaseButton>

        <p class="text-xs text-text-secondary text-center mt-4">
          Anda bisa menambah bisnis lain nanti
        </p>
      </div>
    </div>
  </div>
</template>
