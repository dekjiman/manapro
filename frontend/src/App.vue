<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from './components/ui/ToastContainer.vue'
import ErrorBoundary from './components/ui/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
  <ToastContainer />
</template>
