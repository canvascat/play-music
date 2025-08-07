import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useLastfmStore = defineStore("lastfm", () => {
	const lastfm = useLocalStorage<Record<string, any>>("lastfm", {});

	const update = (session: Record<string, any>) => {
		lastfm.value = session;
	};

	return {
		value: lastfm,
		update,
	};
});
