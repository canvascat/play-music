<template>
	<button
		class="button-icon flex items-center justify-center p-2 m-1 transition-all duration-200 active:scale-95 rounded-[25%]"
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

<style scoped>
button:hover {
	background: var(--color-secondary-bg-for-transparent);
}
</style>
