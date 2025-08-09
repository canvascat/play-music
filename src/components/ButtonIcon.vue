<script setup lang="ts">
import type { VNode } from "vue";

defineProps<{
	title?: string;
}>();

defineSlots<{
	default: () => VNode;
}>();
</script>

<template>
	<button
		class="button-icon flex items-center justify-center p-2 m-1 transition-all duration-200 active:scale-95 rounded-[25%] hover:bg-secondary-foreground/8"
		:title="title"
	>
		<slot></slot>
	</button>
</template>
