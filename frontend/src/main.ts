import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useWorkspaceStore } from './stores/workspace'
import { useProjectStore } from './stores/project'
import { useTenantStore } from './stores/tenant'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const tenantStore = useTenantStore()

authStore.init()
tenantStore.init()
workspaceStore.init()
projectStore.init()

app.mount('#app')
