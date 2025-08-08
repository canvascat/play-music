import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed } from "vue";
import type { User } from "@/types";
import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";

export interface DataStore {
	user?: User;
	likedSongPlaylistID?: number;
	libraryPlaylistFilter?: "mine" | "all" | "liked";
}

export const useDataStore = defineStore("data", () => {
	const data = useLocalStorage<DataStore>("data", {});

	const user = computed(() => data.value.user);
	const likedSongPlaylistID = computed(() => data.value.likedSongPlaylistID);
	const libraryPlaylistFilter = computed(() => data.value.libraryPlaylistFilter);

	const update = <K extends keyof DataStore>(key: K, value: DataStore[K]) => {
		data.value[key] = value;
	};

	async function fetchUserProfile() {
		if (!isAccountLoggedIn()) return;
		const result = await api.user.userAccount();
		if (result.code !== 200) return;
		data.value.user = result.profile;
	}

	return {
		user,
		likedSongPlaylistID,
		libraryPlaylistFilter,

		update,
		fetchUserProfile,
	} as const;
});
