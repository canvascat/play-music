import type { GlobalState, Track } from "@/types";
import Player from "@/utils/Player";
import updateApp from "@/utils/updateApp";
import pkg from "../../package.json";
import { defineStore } from "pinia";

updateApp();

const player = new Player();
// new Proxy(new Player(), {
//   set(target, prop, val) {
//     // console.log({ prop, val });
//     target[prop] = val;
//     if (prop === '_howler') return true;
//     target.saveSelfToLocalStorage();
//     target.sendSelfToIpcMain();
//     return true;
//   },
// });

// Object.assign(player, JSON.parse(localStorage.getItem('player')));

export const useGlobalStore = defineStore("global", {
	state: (): GlobalState => ({
		showLyrics: false,
		title: pkg.name,

		dailyTracks: [],
		player: player,
	}),
	actions: {
		toggleLyrics() {
			this.showLyrics = !this.showLyrics;
		},
		updateDailyTracks(dailyTracks: Track[]) {
			this.dailyTracks = dailyTracks;
		},

		updateTitle(title: string) {
			this.title = title;
		},
	},
});
