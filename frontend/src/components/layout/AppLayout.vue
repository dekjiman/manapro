<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Topbar />
      <main class="flex-1 overflow-auto p-6">
        <RouterView />
      </main>
    </div>
    <!-- Mobile sidebar overlay -->
    <div
      v-if="!uiStore.sidebarCollapsed"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="uiStore.setSidebarCollapsed(true)"
    />
  </div>
</template>
