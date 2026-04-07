<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenantStore, PLAN_LIMITS } from '@/stores/tenant'
import { useSubscriptionStore, PLAN_FEATURES } from '@/stores/subscription'
import { useUIStore } from '@/stores/ui'
import { useI18n } from '@/utils/i18n'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const route = useRoute()
const tenantStore = useTenantStore()
const subscriptionStore = useSubscriptionStore()
const uiStore = useUIStore()
const { t } = useI18n()

const tenantId = computed(() => route.params.tenantId as string)
const tenant = computed(() => tenantStore.tenants.find(t => t.id === tenantId.value))
const subscription = computed(() => subscriptionStore.getTenantSubscription(tenantId.value))
const invoices = computed(() => subscriptionStore.getTenantInvoices(tenantId.value))
const planFeatures = computed(() => subscription.value ? subscriptionStore.getPlanFeatures(subscription.value.plan) : null)

const showUpgradeModal = ref(false)
const selectedPlan = ref<'pro' | 'enterprise'>('pro')
const billingCycle = ref<'monthly' | 'yearly'>('monthly')

function handleUpgrade() {
  if (!tenant.value) return
  subscriptionStore.upgradePlan(tenantId.value, selectedPlan.value, billingCycle.value)
  tenantStore.updateTenant(tenantId.value, { plan: selectedPlan.value })
  tenantStore.updateTenantSettings(tenantId.value, PLAN_LIMITS[selectedPlan.value])
  showUpgradeModal.value = false
  uiStore.showToast(`Berhasil upgrade ke ${selectedPlan.value.toUpperCase()}!`, 'success')
}

function handleDowngrade() {
  if (!tenant.value) return
  if (confirm('Yakin ingin downgrade ke Free? Beberapa fitur akan dibatasi.')) {
    subscriptionStore.downgradeToFree(tenantId.value)
    tenantStore.updateTenant(tenantId.value, { plan: 'free' })
    tenantStore.updateTenantSettings(tenantId.value, PLAN_LIMITS.free)
    uiStore.showToast('Berhasil downgrade ke Free', 'info')
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid': return 'success'
    case 'pending': return 'warning'
    case 'overdue': return 'danger'
    default: return 'default'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'paid': return 'Lunas'
    case 'pending': return 'Menunggu'
    case 'overdue': return 'Jatuh Tempo'
    default: return status
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-text-primary mb-8">{{ t('billing.title') }}</h1>

    <!-- Loading / No tenant -->
    <div v-if="!tenant" class="text-center py-16">
      <p class="text-text-secondary">Tenant tidak ditemukan</p>
    </div>

    <template v-else>
      <!-- Current Plan -->
      <BaseCard class="mb-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-text-primary">{{ t('billing.currentPlan') }}</h2>
            <div class="flex items-center gap-2 mt-1">
              <BaseBadge
                :variant="tenant.plan === 'enterprise' ? 'info' : tenant.plan === 'pro' ? 'warning' : 'default'"
                size="md"
              >
                {{ tenant.plan?.toUpperCase() }}
              </BaseBadge>
              <span v-if="subscription" class="text-sm text-text-secondary">
                · {{ subscription.status === 'trial' ? t('billing.trial') : subscription.status === 'active' ? t('billing.active') : subscription.status }}
              </span>
            </div>
          </div>
        <div class="flex gap-2">
          <BaseButton
            v-if="tenant?.plan !== 'enterprise'"
            @click="selectedPlan = tenant?.plan === 'free' ? 'pro' : 'enterprise'; showUpgradeModal = true"
          >
            Upgrade
          </BaseButton>
          <BaseButton
            v-if="tenant?.plan !== 'free'"
            variant="ghost"
            @click="handleDowngrade"
          >
            Downgrade
          </BaseButton>
        </div>
      </div>

      <div v-if="subscription" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-text-secondary">Harga</p>
          <p class="font-semibold text-text-primary">{{ subscriptionStore.formatPrice(subscription.price) }}/{{ subscription.billing_cycle === 'yearly' ? 'tahun' : 'bulan' }}</p>
        </div>
        <div>
          <p class="text-sm text-text-secondary">Periode</p>
          <p class="font-semibold text-text-primary">{{ formatDate(subscription.current_period_start) }}</p>
        </div>
        <div>
          <p class="text-sm text-text-secondary">Berikutnya</p>
          <p class="font-semibold text-text-primary">{{ formatDate(subscription.current_period_end) }}</p>
        </div>
        <div>
          <p class="text-sm text-text-secondary">Status</p>
          <BaseBadge :variant="subscription.status === 'active' ? 'success' : subscription.status === 'trial' ? 'info' : 'warning'">
            {{ subscription.status === 'active' ? 'Aktif' : subscription.status === 'trial' ? 'Trial' : subscription.status }}
          </BaseBadge>
        </div>
      </div>
    </BaseCard>

    <!-- Plan Limits -->
    <BaseCard class="mb-6">
      <h2 class="text-lg font-semibold text-text-primary mb-4">Batas Penggunaan</h2>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-text-secondary">Anggota</span>
            <span class="text-text-primary">{{ tenantStore.currentTenantMembers.length }} / {{ tenant?.settings.max_members }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full"
              :style="{ width: `${Math.min(100, (tenantStore.currentTenantMembers.length / (tenant?.settings.max_members || 1)) * 100)}%` }"
            />
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-text-secondary">Proyek</span>
            <span class="text-text-primary">{{ subscription ? '∞' : '0' }} / {{ tenant?.settings.max_projects }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full" style="width: 20%" />
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Invoice History -->
    <BaseCard>
      <h2 class="text-lg font-semibold text-text-primary mb-4">Riwayat Tagihan</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 text-sm font-medium text-text-secondary">Tanggal</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-text-secondary">Jumlah</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-text-secondary">PPN 11%</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-text-secondary">Total</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-border/50">
              <td class="py-3 px-4 text-sm text-text-primary">{{ formatDate(invoice.created_at) }}</td>
              <td class="py-3 px-4 text-sm text-text-primary">{{ subscriptionStore.formatPrice(invoice.amount) }}</td>
              <td class="py-3 px-4 text-sm text-text-secondary">{{ subscriptionStore.formatPrice(invoice.tax) }}</td>
              <td class="py-3 px-4 text-sm font-medium text-text-primary">{{ subscriptionStore.formatPrice(invoice.total) }}</td>
              <td class="py-3 px-4">
                <BaseBadge :variant="getStatusColor(invoice.status)">{{ getStatusLabel(invoice.status) }}</BaseBadge>
              </td>
              <td class="py-3 px-4">
                <button
                  v-if="invoice.status === 'pending'"
                  class="text-sm text-primary hover:underline"
                  @click="subscriptionStore.payInvoice(invoice.id); uiStore.showToast('Pembayaran berhasil!', 'success')"
                >
                  Bayar
                </button>
                <span v-else class="text-sm text-text-secondary">-</span>
              </td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="6" class="py-8 text-center text-text-secondary">Belum ada tagihan</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Upgrade Modal -->
    <BaseModal :show="showUpgradeModal" title="Upgrade Paket" @close="showUpgradeModal = false">
      <div class="space-y-4">
        <!-- Billing Cycle -->
        <div class="flex gap-2">
          <button
            class="flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors"
            :class="billingCycle === 'monthly' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'"
            @click="billingCycle = 'monthly'"
          >
            Bulanan
          </button>
          <button
            class="flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors"
            :class="billingCycle === 'yearly' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary'"
            @click="billingCycle = 'yearly'"
          >
            Tahunan <span class="text-xs text-success">-20%</span>
          </button>
        </div>

        <!-- Plan Selection -->
        <div class="space-y-2">
          <button
            class="w-full p-4 rounded-lg border-2 text-left"
            :class="selectedPlan === 'pro' ? 'border-primary bg-primary/5' : 'border-border'"
            @click="selectedPlan = 'pro'"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-semibold">Pro</p>
                <p class="text-xs text-text-secondary">20 anggota, 20 proyek</p>
              </div>
              <p class="font-bold text-primary">
                {{ subscriptionStore.formatPrice(billingCycle === 'yearly' ? PLAN_FEATURES.pro.price_yearly : PLAN_FEATURES.pro.price) }}
                <span class="text-xs font-normal">/{{ billingCycle === 'yearly' ? 'tahun' : 'bulan' }}</span>
              </p>
            </div>
          </button>
          <button
            class="w-full p-4 rounded-lg border-2 text-left"
            :class="selectedPlan === 'enterprise' ? 'border-primary bg-primary/5' : 'border-border'"
            @click="selectedPlan = 'enterprise'"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-semibold">Enterprise</p>
                <p class="text-xs text-text-secondary">Unlimited, branding kustom</p>
              </div>
              <p class="font-bold text-primary">
                {{ subscriptionStore.formatPrice(billingCycle === 'yearly' ? PLAN_FEATURES.enterprise.price_yearly : PLAN_FEATURES.enterprise.price) }}
                <span class="text-xs font-normal">/{{ billingCycle === 'yearly' ? 'tahun' : 'bulan' }}</span>
              </p>
            </div>
          </button>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <BaseButton variant="secondary" @click="showUpgradeModal = false">Batal</BaseButton>
          <BaseButton @click="handleUpgrade">Upgrade Sekarang</BaseButton>
        </div>
      </div>
    </BaseModal>

    </template>
  </div>
</template>
