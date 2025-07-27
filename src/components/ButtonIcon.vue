<template>
	<button
		class="button-icon flex items-center justify-center p-2 m-1 transition-all duration-200 active:scale-95"
		:title="title"
	>
		<slot></slot>
	</button>
</template>

<script setup lang="ts">
import type { VNode } from "vue";

defineProps<{
	title?: string;
}>();

defineSlots<{
	default: () => VNode;
}>();
</script>

<style lang="scss" scoped>
button {
	// display: flex;
	// justify-content: center;
	// align-items: center;
	// padding: 8px;
	// background: transparent;
	// margin: 4px;
	border-radius: 25%;
	// transition: 0.2s;
	:deep(.svg-icon) {
		color: var(--color-text);
		height: 16px;
		width: 16px;
	}
	&:first-child {
		margin-left: 0;
	}
	&:hover {
		background: var(--color-secondary-bg-for-transparent);
	}
	// &:active {
	//   transform: scale(0.92);
	// }
}
</style>
