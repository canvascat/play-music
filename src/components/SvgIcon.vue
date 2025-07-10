<template>
  <component :is="icon" :class="svgClass" aria-hidden="true" />
</template>

<script>
import icons from '@/assets/icons/all.js';

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
  },
  computed: {
    icon() {
      return icons[this.iconClass] 
    },
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + this.className;
      } else {
        return 'svg-icon';
      }
    },
  },
};
</script>

<style scoped>
.svg-icon {
  fill: currentColor;
}
</style>
