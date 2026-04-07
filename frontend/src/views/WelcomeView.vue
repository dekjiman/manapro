<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTenantStore } from '@/stores/tenant'
import { useWorkspaceStore } from '@/stores/workspace'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const tenantStore = useTenantStore()
const workspaceStore = useWorkspaceStore()

const tenantId = computed(() => route.query.tenantId as string)
const workspaceId = computed(() => route.query.workspaceId as string)

const tenant = computed(() => tenantStore.tenants.find(t => t.id === tenantId.value))
const workspace = computed(() => workspaceStore.workspaces.find(w => w.id === workspaceId.value))

function goToWorkspace() {
  if (tenantId.value && workspaceId.value) {
    router.push(`/w/${tenantId.value}/workspaces/${workspaceId.value}/projects`)
  } else {
    router.push('/workspaces')
  }
}

function goToProject() {
  if (tenantId.value && workspaceId.value) {
    router.push(`/w/${tenantId.value}/workspaces/${workspaceId.value}/projects`)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-lg text-center">
      <!-- Success Icon -->
      <div class="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 animate-fade-in">
        <svg class="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-text-primary mb-3 animate-fade-in">
        Selamat Datang di Manapro!
      </h1>

      <!-- Success Message -->
      <div class="bg-surface rounded-xl border border-border p-6 mb-8 animate-fade-in" style="animation-delay: 0.2s">
        <p class="text-text-secondary mb-4">
          Bisnis Anda <strong class="text-text-primary">{{ tenant?.name }}</strong> sudah siap digunakan.
        </p>

        <div class="flex items-center justify-center gap-6 text-sm">
          <div class="text-center">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p class="text-text-primary font-medium">{{ workspace?.name }}</p>
            <p class="text-xs text-text-secondary">Workspace pertama</p>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="space-y-4 animate-fade-in" style="animation-delay: 0.4s">
        <p class="text-sm text-text-secondary">
          Langkah selanjutnya:
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <BaseButton @click="goToProject">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            Buka Dashboard
          </BaseButton>
          <BaseButton variant="secondary" @click="goToWorkspace">
            Eksplorasi Dulu
          </BaseButton>
        </div>
      </div>

      <!-- Tips -->
      <div class="mt-12 text-left bg-surface rounded-xl border border-border p-6 animate-fade-in" style="animation-delay: 0.6s">
        <h3 class="font-semibold text-text-primary mb-3">Tips Memulai</h3>
        <ul class="space-y-2 text-sm text-text-secondary">
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Buat proyek baru atau gunakan template yang sudah disediakan</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Undang anggota tim untuk berkolaborasi</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Gunakan fitur drag & drop untuk mengatur tugas</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
