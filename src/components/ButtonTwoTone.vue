<script setup lang="ts">
import { computed, type CSSProperties } from "vue";

interface Props {
	iconClass?: string;
	iconButton?: boolean;
	horizontalPadding?: number;
	color?: string;
	backgroundColor?: string;
	textColor?: string;
	shape?: string;
}

const props = withDefaults(defineProps<Props>(), {
	iconButton: false,
	horizontalPadding: 16,
	color: "blue",
	backgroundColor: "",
	textColor: "",
	shape: "square",
});

const buttonStyle = computed(() => {
	const styles: CSSProperties = {
		borderRadius: props.shape === "round" ? "50%" : "8px",
		padding: `8px ${props.horizontalPadding}px`,
		// height: "38px",
		width: props.shape === "round" ? "38px" : "auto",
	};
	if (props.backgroundColor !== "") styles.backgroundColor = props.backgroundColor;
	if (props.textColor !== "") styles.color = props.textColor;
	return styles;
});
</script>

<template>
  <button :style="buttonStyle" :class="color">
    <svg-icon
      v-if="iconClass"
      :icon-class="iconClass"
      :style="{ marginRight: iconButton ? '0px' : '8px' }"
    />
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 18px;
  font-weight: 600;
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  margin-right: 12px;
  transition: 0.2s;
  user-select: none;
  .svg-icon {
    width: 16px;
    height: 16px;
  }
  &:hover {
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
}
button.grey {
  background-color: var(--color-secondary-bg);
  color: var(--color-text);
  opacity: 0.78;
}
button.transparent {
  background-color: transparent;
}
</style>
