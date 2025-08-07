<script setup lang="ts">
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

defineProps<{
	description: string;
	title: string;
}>();
</script>

<template>
	<Dialog>
		<DialogTrigger asChild>
			<div
				class="select-none opacity-68 line-clamp-3 mt-6 cursor-pointer text-sm hover:opacity-88 transition-opacity"
			>
				{{ description }}
			</div>
		</DialogTrigger>
		<DialogContent
			class="sm:max-w-[50vw] grid-rows-[auto_minmax(0,1fr)_auto] p-0 bg-white/78 backdrop-blur-sm max-h-[90dvh]"
			overlayClass="bg-white/58"
		>
			<DialogHeader class="p-6 pb-0">
				<DialogTitle>{{ title }}</DialogTitle>
			</DialogHeader>
			<div class="grid gap-4 py-4 overflow-y-auto px-6">
				<div class="flex flex-col justify-between h-[300dvh]">
					<DialogDescription class="text-base mt-4 whitespace-pre-line">
						{{ description }}
					</DialogDescription>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>
