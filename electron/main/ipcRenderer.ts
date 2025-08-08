import type { ExposeIpcRenderer } from "./preload";
import { useRouter } from "vue-router";

export function ipcRenderer() {
	// 添加专有的类名
	document.body.setAttribute("data-electron", "yes");
	// document.body.setAttribute("data-electron-os", window.require("os").platform());

	const ipcRenderer: ExposeIpcRenderer = window.ipcRenderer;

	// listens to the main process 'changeRouteTo' event and changes the route from
	// inside this Vue instance, according to what path the main process requires.
	// responds to Menu click() events at the main process and changes the route accordingly.

	ipcRenderer.addListener("changeRouteTo", (_event, path) => {
		useRouter().push(path);

		// if (store.state.showLyrics) {
		// 	store.commit("toggleLyrics");
		// }
	});

	ipcRenderer.addListener("search", () => {
		// 触发数据响应
		// TODO 搜索框聚焦
	});

	ipcRenderer.addListener("play", () => {
		// player.playOrPause();
	});

	ipcRenderer.addListener("next", () => {
		// if (player.isPersonalFM) {
		// 	player.playNextFMTrack();
		// } else {
		// 	player.playNextTrack();
		// }
	});

	ipcRenderer.addListener("previous", () => {
		// player.playPrevTrack();
	});

	ipcRenderer.addListener("increaseVolume", () => {
		// if (player.volume + 0.1 >= 1) {
		// 	return (player.volume = 1);
		// }
		// player.volume += 0.1;
	});

	ipcRenderer.addListener("decreaseVolume", () => {
		// if (player.volume - 0.1 <= 0) {
		// 	return (player.volume = 0);
		// }
		// player.volume -= 0.1;
	});

	ipcRenderer.addListener("like", () => {
		// store.dispatch("likeATrack", player.currentTrack.id);
	});

	ipcRenderer.addListener("repeat", () => {
		// player.switchRepeatMode();
	});

	ipcRenderer.addListener("shuffle", () => {
		// player.switchShuffle();
	});

	ipcRenderer.addListener("routerGo", (_event, _where) => {
		// TODO go(where);
	});

	ipcRenderer.addListener("nextUp", () => {
		// TODO goToNextTracksPage();
	});

	ipcRenderer.addListener("rememberCloseAppOption", (_event, value) => {
		// store.commit("updateSettings", {
		// 	key: "closeAppOption",
		// 	value,
		// });
	});

	ipcRenderer.addListener("setPosition", (_event, position) => {
		// player._howler.seek(position);
	});
}
