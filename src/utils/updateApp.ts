import initLocalStorage from "@/store/initLocalStorage";
import pkg from "../../package.json";

/** @deprecated */
const updateSetting = () => {
	const parsedSettings = JSON.parse(localStorage.getItem("settings") ?? "{}");
	const settings = {
		...initLocalStorage.settings,
		...parsedSettings,
	};

	if (settings.shortcuts.length !== initLocalStorage.settings.shortcuts.length) {
		// 当新增 shortcuts 时
		const oldShortcutsId = settings.shortcuts.map((s) => s.id);
		const newShortcutsId = initLocalStorage.settings.shortcuts.filter(
			(s) => oldShortcutsId.includes(s.id) === false,
		);
		newShortcutsId.map((id) => {
			settings.shortcuts.push(initLocalStorage.settings.shortcuts.find((s) => s.id === id));
		});
	}

	if (localStorage.getItem("appVersion") === '"0.3.9"') {
		settings.lyricsBackground = true;
	}

	localStorage.setItem("settings", JSON.stringify(settings));
};

const updatePlayer = () => {
	let parsedData = JSON.parse(localStorage.getItem("player"));
	const data = {
		...parsedData,
	};
	localStorage.setItem("player", JSON.stringify(data));
};

const removeOldStuff = () => {
	// remove old indexedDB databases created by localforage
	indexedDB.deleteDatabase("tracks");
};

export default function () {
	updateSetting();

	updatePlayer();
	removeOldStuff();
	localStorage.setItem("appVersion", JSON.stringify(pkg.version));
}
