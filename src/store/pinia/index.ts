import { createPinia, defineStore } from "pinia";

import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";

import _state from "../state";
import { useDataStore } from "../data";

export const pinia = createPinia();

export const useStore = defineStore("store", {
	state: () => _state,
	actions: {
		toggleLyrics() {
			this.showLyrics = !this.showLyrics;
		},
		updateDailyTracks(dailyTracks) {
			this.dailyTracks = dailyTracks;
		},

		updateTitle(title: string) {
			this.title = title;
		},

		async fetchUserProfile() {
			if (!isAccountLoggedIn()) return;
			const result = await api.user.userAccount();
			if (result.code !== 200) return;
			useDataStore().update("user", result.profile);
		},
	},
});
