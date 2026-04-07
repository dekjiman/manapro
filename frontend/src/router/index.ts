import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Default redirect
    {
      path: '/',
      redirect: '/login'
    },
    // Auth routes (guest only)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { guest: true }
    },
    // Onboarding (auth required, no tenant yet)
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true, noTenant: true }
    },
    // Welcome (after onboarding)
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
      meta: { requiresAuth: true }
    },
    // Select tenant (auth required)
    {
      path: '/select-tenant',
      name: 'select-tenant',
      component: () => import('@/views/SelectTenantView.vue'),
      meta: { requiresAuth: true }
    },
    // Pricing (public)
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/PricingView.vue')
    },
    // Tenant-scoped routes
    {
      path: '/w/:tenantId',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true, requiresTenant: true },
      children: [
        {
          path: '',
          redirect: (to) => `/w/${to.params.tenantId}/workspaces`
        },
        {
          path: 'workspaces',
          name: 'tenant-workspaces',
          component: () => import('@/views/WorkspaceListView.vue')
        },
        {
          path: 'workspaces/:workspaceId/projects',
          name: 'tenant-projects',
          component: () => import('@/views/ProjectListView.vue')
        },
        {
          path: 'workspaces/:workspaceId/projects/:projectId',
          name: 'tenant-project-board',
          component: () => import('@/views/ProjectBoardView.vue')
        },
        {
          path: 'members',
          name: 'tenant-members',
          component: () => import('@/views/MembersView.vue')
        },
        {
          path: 'billing',
          name: 'tenant-billing',
          component: () => import('@/views/BillingView.vue')
        },
        {
          path: 'settings',
          name: 'tenant-settings',
          component: () => import('@/views/SettingsView.vue')
        }
      ]
    },
    // Catch all - redirect to login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  // Guest routes - redirect if logged in
  if (to.meta.guest && authStore.isLoggedIn) {
    // If user has no tenants, go to onboarding
    if (!authStore.currentUser?.tenant_ids?.length) {
      return next('/onboarding')
    }
    // If user has tenants but no current tenant, go to select
    if (!authStore.currentUser?.current_tenant_id) {
      return next('/select-tenant')
    }
    return next(`/w/${authStore.currentUser.current_tenant_id}/workspaces`)
  }

  // Protected routes - redirect to login if not authenticated
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }

  // Tenant-scoped routes - verify tenant access
  if (to.meta.requiresTenant && to.params.tenantId) {
    const tenantId = to.params.tenantId as string
    const hasAccess = authStore.currentUser?.tenant_ids?.includes(tenantId)
    if (!hasAccess) {
      return next('/select-tenant')
    }
    // Set current tenant
    tenantStore.setCurrentTenant(tenantId)
    authStore.setCurrentTenant(tenantId)
  }

  next()
})

export default router
