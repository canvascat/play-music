<script setup lang="ts">
import type { SliderRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { computed } from "vue";
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
	Omit<SliderRootProps, "orientation" | "modelValue" | "defaultValue"> & {
		class?: HTMLAttributes["class"];
	}
>();

const modelValue = defineModel<number>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardProps(delegatedProps);

// 将 number 转换为 number[] 以适配 SliderRoot
const value = computed({
	get() {
		return [modelValue.value ?? 0];
	},
	set(value) {
		modelValue.value = value?.[0] ?? 0;
	},
});
</script>

<template>
	<SliderRoot
		data-slot="slider"
		:class="
			cn(
				'group relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 py-1',
				props.class,
			)
		"
		v-bind="forwarded"
		v-model="value"
	>
		<SliderTrack
			data-slot="slider-track"
			class="bg-muted relative grow overflow-hidden rounded-full h-1 w-full"
		>
			<SliderRange data-slot="slider-range" class="bg-primary absolute h-full rounded-xs" />
		</SliderTrack>

		<SliderThumb
			data-slot="slider-thumb"
			class="bg-white invisible group-hover:visible ring-ring/50 block size-3 shrink-0 rounded-full shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
		/>
	</SliderRoot>
</template>
