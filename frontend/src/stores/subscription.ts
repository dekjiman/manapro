import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription, Invoice, PlanFeatures } from '@/types'
import { api } from '@/services/api'

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    name: 'Free',
    price: 0,
    price_yearly: 0,
    max_members: 3,
    max_workspaces: 2,
    max_projects: 999,
    storage_mb: 100,
    kanban: true,
    calendar: false,
    gantt: false,
    financial: false,
    automation: false,
    custom_branding: false,
    audit_log: false,
    offline_mode: 'basic',
    api_access: false,
    priority_support: false
  },
  pro: {
    name: 'Pro',
    price: 49000,
    price_yearly: 470400,
    max_members: 15,
    max_workspaces: 15,
    max_projects: 999,
    storage_mb: 5120,
    kanban: true,
    calendar: true,
    gantt: true,
    financial: true,
    automation: true,
    custom_branding: false,
    audit_log: false,
    offline_mode: 'full',
    api_access: false,
    priority_support: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 199000,
    price_yearly: 1910400,
    max_members: 999999, // unlimited
    max_workspaces: 999999, // unlimited
    max_projects: 999999, // unlimited
    storage_mb: 51200,
    kanban: true,
    calendar: true,
    gantt: true,
    financial: true,
    automation: true,
    custom_branding: true,
    audit_log: true,
    offline_mode: 'full',
    api_access: true,
    priority_support: true
  }
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscriptions = ref<Subscription[]>([])
  const invoices = ref<Invoice[]>([])
  const plans = ref<any[]>([])

  async function fetchPlans() {
    try {
      plans.value = await api.get('/subscriptions/plans')
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  async function fetchTenantSubscription(tenantId: string) {
    try {
      const subscription = await api.get(`/subscriptions/tenant/${tenantId}`)
      // Update or add to subscriptions array
      const existingIndex = subscriptions.value.findIndex(s => s.tenant_id === tenantId)
      if (existingIndex >= 0) {
        subscriptions.value[existingIndex] = subscription
      } else {
        subscriptions.value.push(subscription)
      }
      return subscription
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
    return null
  }

  function getTenantSubscription(tenantId: string): Subscription | null {
    return subscriptions.value.find(s => s.tenant_id === tenantId) || null
  }

  async function getTenantInvoices(tenantId: string) {
    try {
      return await api.get(`/subscriptions/tenant/${tenantId}/invoices`)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    }
    return []
  }

  function getPlanFeatures(plan: string): PlanFeatures {
    return PLAN_FEATURES[plan] || PLAN_FEATURES.free
  }

  async function upgradePlan(tenantId: string, newPlan: 'pro' | 'enterprise', cycle: 'monthly' | 'yearly' = 'monthly') {
    try {
      const updatedSubscription = await api.post('/subscriptions/upgrade', {
        tenantId,
        newPlan,
        billingCycle: cycle,
      })
      // Update local state
      const existingIndex = subscriptions.value.findIndex(s => s.tenant_id === tenantId)
      if (existingIndex >= 0) {
        subscriptions.value[existingIndex] = updatedSubscription
      } else {
        subscriptions.value.push(updatedSubscription)
      }
      return updatedSubscription
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
    }
  }

  async function downgradeToFree(tenantId: string) {
    // For now, just call upgrade to free plan
    return await upgradePlan(tenantId, 'free', 'monthly')
  }

  async function createInvoice(tenantId: string, amount: number): Promise<Invoice | null> {
    // For now, return a mock invoice since we don't have invoice API yet
    const tax = Math.round(amount * 0.11)
    const invoice: Invoice = {
      id: `inv${Date.now()}`,
      tenant_id: tenantId,
      amount,
      tax,
      total: amount + tax,
      status: 'pending',
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      paid_at: null,
      created_at: new Date().toISOString()
    }
    invoices.value.unshift(invoice)
    return invoice
  }

  async function payInvoice(invoiceId: string): Promise<void> {
    const invoice = invoices.value.find(i => i.id === invoiceId)
    if (invoice) {
      invoice.status = 'paid'
      invoice.paid_at = new Date().toISOString()
    }
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return {
    subscriptions,
    invoices,
    plans,
    fetchPlans,
    fetchTenantSubscription,
    getTenantSubscription,
    getTenantInvoices,
    getPlanFeatures,
    upgradePlan,
    downgradeToFree,
    createInvoice,
    payInvoice,
    formatPrice
  }
})
