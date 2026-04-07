<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { api } from '@/services/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const route = useRoute()
const tenantStore = useTenantStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const tenantId = computed(() => route.params.tenantId as string)
const tenant = computed(() => tenantStore.tenants.find(t => t.id === tenantId.value))
const members = computed(() => tenantStore.currentTenantMembers)

const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'admin' | 'member' | 'viewer'>('member')

const userRole = computed(() => {
  if (!authStore.currentUser) return null
  return tenantStore.getUserRole(authStore.currentUser.id, tenantId.value)
})

const canManage = computed(() => userRole.value === 'owner' || userRole.value === 'admin')

function getMemberName(userId: string) {
  return authStore.users.find(u => u.id === userId)?.name || 'Unknown'
}

function getMemberEmail(userId: string) {
  return authStore.users.find(u => u.id === userId)?.email || ''
}

function getMemberDivisi(userId: string) {
  return authStore.users.find(u => u.id === userId)?.divisi || ''
}

function getMemberJabatan(userId: string) {
  return authStore.users.find(u => u.id === userId)?.jabatan || ''
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'owner': return 'info'
    case 'admin': return 'warning'
    case 'member': return 'default'
    case 'viewer': return 'default'
    default: return 'default'
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'owner': return 'Pemilik'
    case 'admin': return 'Admin'
    case 'member': return 'Anggota'
    case 'viewer': return 'Peninjau'
    default: return role
  }
}

async function handleInvite() {
  if (!inviteEmail.value.trim()) return

  if (USE_MOCK) {
    // Mock mode: find user in local array
    const user = authStore.users.find(u => u.email === inviteEmail.value.trim())
    if (!user) {
      uiStore.showToast('Email tidak ditemukan. User harus mendaftar terlebih dahulu.', 'error')
      return
    }
    if (!tenantStore.canAddMember(tenantId.value)) {
      uiStore.showToast('Batas anggota tercapai. Upgrade paket untuk menambah anggota.', 'warning')
      return
    }
    tenantStore.addMember(tenantId.value, user.id, inviteRole.value)
    showInviteModal.value = false
    inviteEmail.value = ''
    uiStore.showToast(`${user.name} berhasil diundang!`, 'success')
    return
  }

  // API mode: search user by email then add as member
  try {
    // Find user by email
    const users = await api.get<any[]>('/users')
    const user = users.find((u: any) => u.email === inviteEmail.value.trim())

    if (!user) {
      uiStore.showToast('Email tidak ditemukan. User harus mendaftar terlebih dahulu.', 'error')
      return
    }

    // Add member to tenant
    await api.post(`/tenants/${tenantId.value}/members`, {
      userId: user.id,
      role: inviteRole.value,
    })

    // Update local state
    tenantStore.addMember(tenantId.value, user.id, inviteRole.value)
    showInviteModal.value = false
    inviteEmail.value = ''
    uiStore.showToast(`${user.name} berhasil diundang!`, 'success')
  } catch (err: any) {
    uiStore.showToast(err.message || 'Gagal mengundang anggota', 'error')
  }
}

function handleUpdateRole(userId: string, newRole: string) {
  tenantStore.updateMemberRole(tenantId.value, userId, newRole as any)
  uiStore.showToast('Role berhasil diubah', 'success')
}

function handleRemoveMember(userId: string) {
  if (confirm('Yakin ingin menghapus anggota ini?')) {
    tenantStore.removeMember(tenantId.value, userId)
    uiStore.showToast('Anggota berhasil dihapus', 'success')
  }
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Anggota' },
  { value: 'viewer', label: 'Peninjau' }
]
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-text-primary">Anggota Tim</h1>
        <p class="text-text-secondary mt-1">
          {{ members.length }} / {{ tenant?.settings.max_members }} anggota
        </p>
      </div>
      <BaseButton v-if="canManage" @click="showInviteModal = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Undang Anggota
      </BaseButton>
    </div>

    <!-- Members List -->
    <BaseCard>
      <div class="divide-y divide-border">
        <div
          v-for="member in members"
          :key="member.user_id"
          class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <BaseAvatar :name="getMemberName(member.user_id)" />
            <div>
              <p class="font-medium text-text-primary">{{ getMemberName(member.user_id) }}</p>
              <p class="text-sm text-text-secondary">{{ getMemberEmail(member.user_id) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span v-if="getMemberJabatan(member.user_id)" class="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {{ getMemberJabatan(member.user_id) }}
                </span>
                <span v-if="getMemberDivisi(member.user_id)" class="text-xs bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded">
                  {{ getMemberDivisi(member.user_id) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <BaseBadge :variant="getRoleBadgeVariant(member.role)">
              {{ getRoleLabel(member.role) }}
            </BaseBadge>
            <div v-if="canManage && member.role !== 'owner'" class="relative group">
              <button class="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <div class="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div class="p-1">
                  <button
                    v-for="opt in roleOptions.filter(o => o.value !== member.role)"
                    :key="opt.value"
                    class="w-full px-3 py-2 text-sm text-left text-text-secondary hover:bg-gray-100 rounded-md"
                    @click="handleUpdateRole(member.user_id, opt.value)"
                  >
                    Ubah ke {{ opt.label }}
                  </button>
                  <button
                    class="w-full px-3 py-2 text-sm text-left text-danger hover:bg-red-50 rounded-md"
                    @click="handleRemoveMember(member.user_id)"
                  >
                    Hapus Anggota
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="members.length === 0" class="py-12 text-center">
        <p class="text-text-secondary">Belum ada anggota</p>
      </div>
    </BaseCard>

    <!-- Upgrade prompt -->
    <div v-if="!tenantStore.canAddMember(tenantId)" class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <p class="font-medium text-amber-800">Batas anggota tercapai</p>
          <p class="text-sm text-amber-700">Upgrade paket untuk menambah lebih banyak anggota.</p>
        </div>
        <router-link :to="`/w/${tenantId}/billing`">
          <BaseButton size="sm">Upgrade</BaseButton>
        </router-link>
      </div>
    </div>

    <!-- Invite Modal -->
    <BaseModal :show="showInviteModal" title="Undang Anggota Baru" size="sm" @close="showInviteModal = false">
      <form @submit.prevent="handleInvite">
        <div class="space-y-4">
          <BaseInput
            v-model="inviteEmail"
            label="Email"
            type="email"
            placeholder="email@example.com"
          />
          <BaseSelect
            v-model="inviteRole"
            label="Role"
            :options="roleOptions"
          />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="secondary" @click="showInviteModal = false">Batal</BaseButton>
          <BaseButton type="submit" :disabled="!inviteEmail.trim()">Undang</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
