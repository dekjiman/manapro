<script setup lang="ts">
interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-pink-500',
    'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-full text-white font-medium shrink-0"
    :class="[sizeClasses[props.size], getColor(props.name)]"
    :title="props.name"
  >
    {{ getInitials(props.name) }}
  </div>
</template>
