<script setup lang="ts">
import type { SliderRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { computed } from "vue";
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
	Omit<SliderRootProps, "orientation" | "modelValue" | "defaultValue" | "min" | "step" | "max"> & {
		class?: HTMLAttributes["class"];
		white?: boolean;
	}
>();

const modelValue = defineModel<number>();

const delegatedProps = reactiveOmit(props, "class", "white");

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
		:min="0"
		:max="1"
		:step="0.01"
		v-bind="forwarded"
		v-model="value"
	>
		<SliderTrack
			data-slot="slider-track"
			:class="
				cn('bg-muted relative grow overflow-hidden rounded-full h-1 w-full', white && 'bg-white/18')
			"
		>
			<SliderRange
				data-slot="slider-range"
				:class="cn('bg-primary absolute h-full rounded-xs', white && 'bg-white')"
			/>
		</SliderTrack>

		<SliderThumb
			data-slot="slider-thumb"
			:class="
				cn(
					'bg-white invisible group-hover:visible ring-ring/50 block size-3 shrink-0 rounded-full shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
					white && 'ring-white/50',
				)
			"
		/>
	</SliderRoot>
</template>
