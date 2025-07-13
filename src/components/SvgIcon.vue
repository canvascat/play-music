<template>
  <component :is="icon" :class="svgClass" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import icons from './icon/map';

/** @deprecated */
defineOptions({
  name: 'SvgIcon',
})

const props = defineProps<{
  iconClass: keyof typeof icons;
  className?: string;
}>(); 

const icon = computed(() => icons[props.iconClass]);
const svgClass = computed(() => props.className ? `svg-icon ${props.className}` : 'svg-icon');
</script>

<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>
