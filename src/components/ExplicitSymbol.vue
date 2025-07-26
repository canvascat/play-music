<script setup lang="ts">
import { IconExplicit } from "@/components/icon";
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		size?: number;
	}>(),
	{
		size: 16,
	},
);

const svgStyle = computed(() => ({
	height: props.size + "px",
	width: props.size + "px",
	position: "relative",
	left: "-1px",
}));
</script>

<template>
  <IconExplicit :style="svgStyle" />
</template>
