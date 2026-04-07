import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import id from '@/locales/id.json'
import en from '@/locales/en.json'

const translations: Record<string, Record<string, any>> = { id, en }

export function useI18n() {
  const authStore = useAuthStore()

  const locale = computed(() => authStore.currentUser?.language_pref || 'id')

  function t(key: string): string {
    const keys = key.split('.')
    let value: any = translations[locale.value]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  return { t, locale }
}
