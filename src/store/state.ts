import type { GlobalState } from "@/types";
import Player from "@/utils/Player";
import updateApp from "@/utils/updateApp";
import pkg from "../../package.json";
import initLocalStorage from "./initLocalStorage";

if (localStorage.getItem("appVersion") === null) {
	localStorage.setItem("settings", JSON.stringify(initLocalStorage.settings));
	localStorage.setItem("data", JSON.stringify(initLocalStorage.data));
	localStorage.setItem("appVersion", pkg.version);
}

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

const state: GlobalState = {
	showLyrics: false,
	title: pkg.name,
	liked: {
		songs: [],
		songsWithDetails: [], // 只有前12首
		playlists: [],
		albums: [],
		artists: [],
		mvs: [],
		cloudDisk: [],
		playHistory: {
			weekData: [],
			allData: [],
		},
	},
	dailyTracks: [],
	lastfm: JSON.parse(localStorage.getItem("lastfm")) || {},
	player: player,
	settings: JSON.parse(localStorage.getItem("settings")),
};

export default state;
