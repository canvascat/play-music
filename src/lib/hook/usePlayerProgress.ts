import { useGlobalStore } from "@/store/global";
import { useRafFn } from "@vueuse/core";
import { computed, ref } from "vue";

export function usePlayerProgress() {
	const { player } = useGlobalStore();
	const progress = ref(player.progress);

	useRafFn(() => {
		progress.value = player.progress;
	});

	return computed({
		get() {
			return progress.value;
		},
		set(value) {
			player.progress = value;
			progress.value = value;
		},
	});
}
