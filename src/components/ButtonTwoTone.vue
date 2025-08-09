<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useSlots, type Component, type HTMLAttributes } from "vue";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
	"flex items-center justify-center select-none py-2 mr-3 font-semibold hover:scale-106 active:scale-94 rounded-lg h-10 min-w-10 text-lg",
	{
		variants: {
			color: {
				blue: "bg-[var(--color-primary-bg)] text-primary",
				grey: "bg-[var(--color-secondary-bg)] text-foreground opacity-78",
			},
		},
		defaultVariants: {
			color: "blue",
		},
	},
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface Props {
	class?: HTMLAttributes["class"];
	color?: ButtonVariants["color"];
	icon?: Component;
}

const props = withDefaults(defineProps<Props>(), {
	color: "blue",
});

const slots = useSlots();
</script>

<template>
	<button :class="cn(buttonVariants({ color }), slots.default ? 'px-4' : '', props.class)">
		<component :is="props.icon" :class="cn('size-4', slots.default ? 'mr-2' : '')" />
		<slot></slot>
	</button>
</template>
