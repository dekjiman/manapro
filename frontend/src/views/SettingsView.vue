<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useUIStore } from '@/stores/ui'
import { useI18n } from '@/utils/i18n'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const route = useRoute()
const authStore = useAuthStore()
const tenantStore = useTenantStore()
const uiStore = useUIStore()
const { t } = useI18n()

const activeTab = ref<'profile' | 'business' | 'about'>('profile')
const fileInput = ref<HTMLInputElement | null>(null)
const logoInput = ref<HTMLInputElement | null>(null)

const tenantId = computed(() => route.params.tenantId as string)
const tenant = computed(() => tenantStore.tenants.find(t => t.id === tenantId.value))
const isEnterprise = computed(() => tenant.value?.plan === 'enterprise')

const profileForm = ref({
  name: authStore.currentUser?.name || '',
  email: authStore.currentUser?.email || '',
  divisi: authStore.currentUser?.divisi || '',
  jabatan: authStore.currentUser?.jabatan || '',
  phone: authStore.currentUser?.phone || ''
})

const businessForm = ref({
  name: tenant.value?.name || '',
  slug: tenant.value?.slug || ''
})

const avatarPreview = computed(() => authStore.currentUser?.avatar || '')
const logoPreview = computed(() => tenant.value?.logo_url || '')

const divisiOptions = [
  { value: 'Manajemen', label: 'Manajemen' },
  { value: 'Operasional', label: 'Operasional' },
  { value: 'Produksi', label: 'Produksi' },
  { value: 'Desain', label: 'Desain' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Keuangan', label: 'Keuangan' },
  { value: 'HRD', label: 'HRD' },
  { value: 'IT', label: 'IT' },
  { value: 'Gudang', label: 'Gudang' },
  { value: 'Lapangan', label: 'Lapangan' }
]

const jabatanOptions = [
  { value: 'Direktur', label: 'Direktur' },
  { value: 'Manajer', label: 'Manajer' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Kepala Divisi', label: 'Kepala Divisi' },
  { value: 'Staff Senior', label: 'Staff Senior' },
  { value: 'Staff', label: 'Staff' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Freelancer', label: 'Freelancer' },
  { value: 'Magang', label: 'Magang' }
]

// User Avatar
function triggerFileInput() {
  fileInput.value?.click()
}

function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uiStore.showToast('File harus berupa gambar', 'error')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    uiStore.showToast('Ukuran file maksimal 2MB', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    authStore.updateProfile({ avatar: e.target?.result as string })
    uiStore.showToast('Foto profil berhasil diubah', 'success')
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  authStore.updateProfile({ avatar: '' })
  uiStore.showToast('Foto profil dihapus', 'success')
}

// Business Logo
function triggerLogoInput() {
  logoInput.value?.click()
}

function handleLogoChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !tenantId.value) return
  if (!file.type.startsWith('image/')) {
    uiStore.showToast('File harus berupa gambar', 'error')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    uiStore.showToast('Ukuran file maksimal 2MB', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    tenantStore.updateTenant(tenantId.value!, { logo_url: e.target?.result as string })
    uiStore.showToast('Logo bisnis berhasil diubah', 'success')
  }
  reader.readAsDataURL(file)
}

function removeLogo() {
  if (!tenantId.value) return
  tenantStore.updateTenant(tenantId.value, { logo_url: null })
  uiStore.showToast('Logo bisnis dihapus', 'success')
}

function saveBusiness() {
  if (!tenantId.value || !businessForm.value.name.trim()) return
  tenantStore.updateTenant(tenantId.value, {
    name: businessForm.value.name.trim()
  })
  uiStore.showToast('Informasi bisnis berhasil disimpan', 'success')
}

function saveProfile() {
  if (!profileForm.value.name.trim()) return
  authStore.updateProfile({
    name: profileForm.value.name.trim(),
    divisi: profileForm.value.divisi,
    jabatan: profileForm.value.jabatan,
    phone: profileForm.value.phone
  })
  uiStore.showToast(t('settings.profileSaved'), 'success')
}

async function changeLanguage(lang: 'id' | 'en') {
  await authStore.updateProfile({ language_pref: lang })
  // Show message in the NEW language after update
  const msg = lang === 'id' ? 'Bahasa diubah ke Indonesia' : 'Language changed to English'
  uiStore.showToast(msg, 'success')
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-text-primary mb-8">{{ t('settings.title') }}</h1>

    <!-- Tabs -->
    <div class="flex border-b border-border mb-6">
      <button
        class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'profile'
          ? 'text-primary border-primary'
          : 'text-text-secondary border-transparent hover:text-text-primary'"
        @click="activeTab = 'profile'"
      >
        {{ t('settings.profile') }}
      </button>
      <button
        v-if="tenantId"
        class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'business'
          ? 'text-primary border-primary'
          : 'text-text-secondary border-transparent hover:text-text-primary'"
        @click="activeTab = 'business'"
      >
        Bisnis
      </button>
      <button
        class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === 'about'
          ? 'text-primary border-primary'
          : 'text-text-secondary border-transparent hover:text-text-primary'"
        @click="activeTab = 'about'"
      >
        {{ t('settings.about') }}
      </button>
    </div>

    <!-- Profile Tab -->
    <template v-if="activeTab === 'profile'">
      <!-- Profile Header -->
      <BaseCard class="mb-6">
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer"
              :class="avatarPreview ? 'bg-gray-200' : 'bg-primary'"
              @click="triggerFileInput"
            >
              <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" alt="Avatar" />
              <span v-else>{{ authStore.currentUser?.name.charAt(0) }}</span>
            </div>
            <div
              class="absolute inset-0 w-16 h-16 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="triggerFileInput"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-text-primary">{{ authStore.currentUser?.name }}</h3>
            <p class="text-text-secondary">{{ authStore.currentUser?.email }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="authStore.currentUser?.jabatan" class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {{ authStore.currentUser.jabatan }}
              </span>
              <span v-if="authStore.currentUser?.divisi" class="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
                {{ authStore.currentUser.divisi }}
              </span>
            </div>
          </div>
          <button v-if="avatarPreview" class="text-xs text-danger hover:underline" @click="removeAvatar">Hapus foto</button>
        </div>
      </BaseCard>

      <!-- Personal Info -->
      <BaseCard class="mb-6">
        <h3 class="text-lg font-semibold text-text-primary mb-6">{{ t('settings.personalInfo') }}</h3>
        <form class="space-y-4" @submit.prevent="saveProfile">
          <BaseInput v-model="profileForm.name" :label="t('auth.fullName')" />
          <BaseInput v-model="profileForm.email" :label="t('auth.email')" type="email" disabled />
          <BaseInput v-model="profileForm.phone" :label="t('settings.phone')" type="tel" placeholder="+628123456789" />
          <div class="flex justify-end pt-2">
            <BaseButton type="submit">{{ t('common.save') }}</BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Work Info -->
      <BaseCard class="mb-6">
        <h3 class="text-lg font-semibold text-text-primary mb-2">{{ t('settings.workInfo') }}</h3>
        <p class="text-sm text-text-secondary mb-6">{{ t('settings.workInfoDesc') }}</p>
        <form class="space-y-4" @submit.prevent="saveProfile">
          <BaseSelect v-model="profileForm.divisi" :label="t('settings.division')" placeholder="Pilih divisi" :options="divisiOptions" />
          <BaseSelect v-model="profileForm.jabatan" :label="t('settings.position')" placeholder="Pilih jabatan" :options="jabatanOptions" />
          <div class="flex justify-end pt-2">
            <BaseButton type="submit">{{ t('common.save') }}</BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Language -->
      <BaseCard>
        <h3 class="text-lg font-semibold text-text-primary mb-4">{{ t('settings.language') }}</h3>
        <div class="flex gap-3">
          <button
            class="flex-1 p-4 rounded-lg border-2 text-center transition-colors"
            :class="authStore.currentUser?.language_pref === 'id' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'"
            @click="changeLanguage('id')"
          >
            <span class="text-2xl mb-1 block">ID</span>
            <span class="text-sm font-medium">{{ t('settings.languageId') }}</span>
          </button>
          <button
            class="flex-1 p-4 rounded-lg border-2 text-center transition-colors"
            :class="authStore.currentUser?.language_pref === 'en' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'"
            @click="changeLanguage('en')"
          >
            <span class="text-2xl mb-1 block">EN</span>
            <span class="text-sm font-medium">{{ t('settings.languageEn') }}</span>
          </button>
        </div>
      </BaseCard>
    </template>

    <!-- Business Tab -->
    <template v-if="activeTab === 'business' && tenant">
      <!-- Business Logo -->
      <BaseCard class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-text-primary">Logo Bisnis</h3>
          <BaseBadge :variant="tenant.plan === 'enterprise' ? 'info' : tenant.plan === 'pro' ? 'warning' : 'default'">
            {{ tenant.plan.toUpperCase() }}
          </BaseBadge>
        </div>

        <div class="flex items-center gap-6">
          <div class="relative group">
            <div
              class="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed transition-colors"
              :class="[
                logoPreview ? 'border-transparent bg-gray-100' : 'border-border hover:border-primary'
              ]"
              @click="triggerLogoInput"
            >
              <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-contain" alt="Logo" />
              <svg v-else class="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div
              class="absolute inset-0 w-20 h-20 rounded-xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="triggerLogoInput"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="handleLogoChange" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-text-primary">{{ tenant.name }}</p>
            <p class="text-sm text-text-secondary">{{ tenant.slug }}.manapro.id</p>
            <div class="mt-2 flex gap-2">
              <button
                v-if="logoPreview"
                class="text-xs text-danger hover:underline"
                @click="removeLogo"
              >
                Hapus logo
              </button>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Business Info -->
      <BaseCard class="mb-6">
        <h3 class="text-lg font-semibold text-text-primary mb-6">Informasi Bisnis</h3>
        <form class="space-y-4" @submit.prevent="saveBusiness">
          <BaseInput v-model="businessForm.name" label="Nama Bisnis" />
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1.5">URL Bisnis</label>
            <div class="flex items-center gap-2">
              <input
                :value="tenant.slug"
                disabled
                class="flex-1 px-3 py-2 border border-border rounded-lg text-sm text-text-secondary bg-gray-50"
              />
              <span class="text-sm text-text-secondary">.manapro.id</span>
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <BaseButton type="submit">{{ t('common.save') }}</BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Plan Info -->
      <BaseCard>
        <h3 class="text-lg font-semibold text-text-primary mb-4">Paket Langganan</h3>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-text-primary">{{ tenant.plan.toUpperCase() }}</p>
            <p class="text-sm text-text-secondary">
              {{ tenant.settings.max_members }} anggota · {{ tenant.settings.max_projects }} proyek
            </p>
          </div>
          <router-link v-if="tenantId" :to="`/w/${tenantId}/billing`">
            <BaseButton variant="secondary" size="sm">Kelola Langganan</BaseButton>
          </router-link>
        </div>
      </BaseCard>
    </template>

    <!-- About Tab -->
    <template v-if="activeTab === 'about'">
      <BaseCard>
        <h3 class="text-lg font-semibold text-text-primary mb-4">Manapro</h3>
        <div class="space-y-3 text-sm text-text-secondary">
          <p>
            <strong class="text-text-primary">Manapro</strong>
            {{ authStore.currentUser?.language_pref === 'id'
              ? 'adalah aplikasi manajemen proyek yang dirancang khusus untuk UMKM Indonesia.'
              : 'is a project management application designed specifically for Indonesian MSMEs.' }}
          </p>
        </div>
        <div class="mt-6 pt-6 border-t border-border">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-text-secondary">Version</span><p class="font-medium text-text-primary">1.0.0 MVP</p></div>
            <div><span class="text-text-secondary">Stack</span><p class="font-medium text-text-primary">Vue 3 + Vite + Tailwind</p></div>
            <div><span class="text-text-secondary">Status</span><p class="font-medium text-success">Development</p></div>
            <div><span class="text-text-secondary">Target</span><p class="font-medium text-text-primary">Q3 2026</p></div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
