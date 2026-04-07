import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/ui/BaseButton.vue'

describe('BaseButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me',
      },
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('shows loading spinner when loading', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
    })
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
  })

  it('applies primary variant classes by default', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.classes()).toContain('bg-primary')
  })

  it('applies secondary variant classes', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'secondary' },
    })
    expect(wrapper.classes()).toContain('bg-white')
    expect(wrapper.classes()).toContain('border')
  })

  it('applies danger variant classes', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'danger' },
    })
    expect(wrapper.classes()).toContain('bg-danger')
  })

  it('applies size classes', () => {
    const wrapper = mount(BaseButton, {
      props: { size: 'sm' },
    })
    expect(wrapper.classes()).toContain('px-3')
    expect(wrapper.classes()).toContain('py-1.5')
  })
})
