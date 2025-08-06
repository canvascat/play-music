<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed, useSlots, type CSSProperties, type Component } from "vue";

interface Props {
	icon?: Component;
	color?: string;
	backgroundColor?: string;
	textColor?: string;
	shape?: string;
}

const props = withDefaults(defineProps<Props>(), {
	color: "blue",
	shape: "square",
});

const slots = useSlots();

const buttonStyle = computed(() => {
	const styles: CSSProperties = {
		borderRadius: props.shape === "round" ? "50%" : "8px",
		width: props.shape === "round" ? "38px" : "auto",
	};
	if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
	if (props.textColor) styles.color = props.textColor;
	return styles;
});
</script>

<template>
	<button
		:style="buttonStyle"
		:class="
			cn(
				color,
				'flex items-center justify-center select-none py-2 mr-3 font-semibold hover:scale-106 active:scale-94',
				slots.default ? 'px-4' : '',
			)
		"
	>
		<component :is="props.icon" :class="cn('size-4', slots.default ? 'mr-2' : '')" />
		<slot></slot>
	</button>
</template>

<style scoped>
button {
	height: 40px;
	min-width: 40px;
	font-size: 18px;
	line-height: 18px;
	background-color: var(--color-primary-bg);
	color: var(--color-primary);
	transition: 0.2s;
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
