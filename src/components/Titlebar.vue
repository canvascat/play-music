<template>
	<div class="win32-titlebar flex items-start fixed top-0 left-0 right-0" :class="$style.drag">
		<div class="text-sm py-2 px-3">{{ title }}</div>
		<div class="flex ml-auto" :class="$style['no-drag']">
			<div
				class="w-12 h-8 place-items-center place-content-center cursor-pointer hover:bg-accent"
				@click="windowMinimize"
			>
				<ChevronDownIcon />
			</div>
			<div
				class="w-12 h-8 place-items-center place-content-center cursor-pointer hover:bg-accent"
				@click="windowMaxRestore"
			>
				<component :is="isMaximized ? MinimizeIcon : MaximizeIcon" class="size-6" />
			</div>
			<div
				class="w-12 h-8 place-items-center place-content-center cursor-pointer hover:bg-red-500 hover:text-white"
				@click="windowClose"
			>
				<XIcon class="size-6" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import "@vscode/codicons/dist/codicon.css";
import { ref, computed } from "vue";
import { useStore } from "@/store/pinia";
import { MaximizeIcon, MinimizeIcon, XIcon, ChevronDownIcon } from "lucide-vue-next";

const isMaximized = ref(false);

const title = computed(() => useStore().title);

if (window.IS_ELECTRON === true) {
	window.ipcRenderer?.on("isMaximized", (_, value) => {
		isMaximized.value = value;
	});
}

const windowMinimize = () => {
	window.ipcRenderer?.send("minimize");
};
const windowMaxRestore = () => {
	window.ipcRenderer?.send("maximizeOrUnmaximize");
};
const windowClose = () => {
	window.ipcRenderer?.send("close");
};
</script>

<style module>
.drag {
	-webkit-app-region: drag;
}

.no-drag {
	-webkit-app-region: no-drag;
}
</style>
