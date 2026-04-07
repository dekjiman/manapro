import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription, Invoice, PlanFeatures } from '@/types'
import subscriptionsData from '@/mock/subscriptions.json'
import invoicesData from '@/mock/invoices.json'

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    name: 'Free',
    price: 0,
    price_yearly: 0,
    max_members: 3,
    max_projects: 2,
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
    max_members: 20,
    max_projects: 20,
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
    max_members: 999,
    max_projects: 999,
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
  const subscriptions = ref<Subscription[]>(subscriptionsData as Subscription[])
  const invoices = ref<Invoice[]>(invoicesData as Invoice[])

  function getTenantSubscription(tenantId: string): Subscription | null {
    return subscriptions.value.find(s => s.tenant_id === tenantId) || null
  }

  function getTenantInvoices(tenantId: string) {
    return invoices.value
      .filter(i => i.tenant_id === tenantId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  function getPlanFeatures(plan: string): PlanFeatures {
    return PLAN_FEATURES[plan] || PLAN_FEATURES.free
  }

  function upgradePlan(tenantId: string, newPlan: 'pro' | 'enterprise', cycle: 'monthly' | 'yearly' = 'monthly') {
    const sub = subscriptions.value.find(s => s.tenant_id === tenantId)
    if (sub) {
      sub.plan = newPlan
      sub.status = 'active'
      sub.billing_cycle = cycle
      sub.price = cycle === 'yearly'
        ? PLAN_FEATURES[newPlan].price_yearly
        : PLAN_FEATURES[newPlan].price

      const now = new Date()
      sub.current_period_start = now.toISOString().split('T')[0]
      const endDate = new Date(now)
      if (cycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }
      sub.current_period_end = endDate.toISOString().split('T')[0]
    }
  }

  function downgradeToFree(tenantId: string) {
    const sub = subscriptions.value.find(s => s.tenant_id === tenantId)
    if (sub) {
      sub.plan = 'free'
      sub.price = 0
      sub.billing_cycle = 'monthly'
      sub.current_period_end = '2099-12-31'
    }
  }

  function createInvoice(tenantId: string, amount: number): Invoice {
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

  function payInvoice(invoiceId: string) {
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
