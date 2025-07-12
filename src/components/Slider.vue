<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: number[]
  min?: number
  max?: number
  step?: number
  height?: number
  dotSize?: number
  tooltip?: boolean | 'always' | 'none'
  tooltipFormatter?: (val: number) => string
  lazy?: boolean
  silent?: boolean
  disabled?: boolean
  theme?: 'default' | 'nyancat' | 'lyrics'
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  height: 2,
  dotSize: 12,
  tooltip: true,
  lazy: false,
  silent: false,
  disabled: false,
  theme: 'default',
  isDark: false
})

const emit = defineEmits(['update:modelValue', 'change'])

const sliderValue = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== sliderValue.value) {
    sliderValue.value = newVal
  }
})

// 监听内部值变化
watch(sliderValue, (newVal) => {
  emit('update:modelValue', newVal)
  if (!props.lazy) {
    emit('change', newVal)
  }
})

// 计算slider的样式
const sliderClass = computed(() => {
  const baseClass = 'relative flex items-center select-none touch-none'
  const themeClass = {
    default: '',
    nyancat: 'nyancat',
    lyrics: 'lyrics-page'
  }[props.theme]
  
  return `${baseClass} ${themeClass}`
})

// 计算track的样式
const trackClass = computed(() => {
  const baseClass = 'relative grow rounded-full'
  const heightClass = `h-${props.height}`
  const themeClass = {
    default: 'bg-stone-500/30',
    nyancat: 'bg-stone-500/18 py-2.5 rounded-none',
    lyrics: props.isDark ? 'bg-white/18' : 'bg-stone-500/18 opacity-88'
  }[props.theme]
  
  return `${baseClass} ${heightClass} ${themeClass}`
})

// 计算range的样式
const rangeClass = computed(() => {
  const baseClass = 'absolute h-full'
  const themeClass = {
    default: 'bg-grass8 rounded-full',
    nyancat: 'px-1 -top-2 rounded-none bg-gradient-to-b from-red-500 via-yellow-500 to-blue-500',
    lyrics: props.isDark ? 'bg-white' : 'bg-black'
  }[props.theme]
  
  return `${baseClass} ${themeClass}`
})

// 计算thumb的样式
const thumbClass = computed(() => {
  const baseClass = 'block'
  const sizeClass = `w-${props.dotSize} h-${props.dotSize}`
  const themeClass = {
    default: 'bg-white rounded-full hover:bg-stone-50 shadow-sm focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-grass9',
    nyancat: 'bg-[url(/img/logos/nyancat.gif)] bg-cover w-9 h-6 -mt-1.5 shadow-none rounded-none',
    lyrics: props.isDark ? 'bg-white rounded-full shadow-none' : 'bg-black rounded-full shadow-none'
  }[props.theme]
  
  return `${baseClass} ${props.theme === 'default' ? sizeClass : ''} ${themeClass}`
})


</script>

<template>
  <SliderRoot
    v-model="sliderValue"
    :class="sliderClass"
    :max="max"
    :min="min"
    :step="step"
    :disabled="disabled"
  >
    <SliderTrack :class="trackClass">
      <SliderRange :class="rangeClass" />
    </SliderTrack>
    <SliderThumb
      :class="thumbClass"
      :aria-label="tooltip === 'none' ? undefined : String(sliderValue)"
    />
  </SliderRoot>
</template>