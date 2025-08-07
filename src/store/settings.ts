import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import type { Settings } from "@/types";
import shortcuts, { type Shortcut } from "@/utils/shortcuts";
import { cloneDeep } from "es-toolkit";
import { changeAppearance } from "@/utils/common";

// {
//   "lang": "zh-CN",
//   "musicLanguage": "all",
//   "appearance": "auto",
//   "musicQuality": 320000,
//   "lyricFontSize": 28,
//   "outputDevice": "default",
//   "showPlaylistsByAppleMusic": true,
//   "enableUnblockNeteaseMusic": true,
//   "automaticallyCacheSongs": true,
//   "cacheLimit": 8192,
//   "enableReversedMode": false,
//   "nyancatStyle": false,
//   "showLyricsTranslation": true,
//   "lyricsBackground": true,
//   "enableOsdlyricsSupport": false,
//   "closeAppOption": "ask",
//   "enableDiscordRichPresence": false,
//   "enableGlobalShortcut": true,
//   "showLibraryDefault": false,
//   "subTitleDefault": false,
//   "linuxEnableCustomTitlebar": false,
//   "enabledPlaylistCategories": [
//     "全部",
//     "推荐歌单",
//     "精品歌单",
//     "官方",
//     "排行榜",
//     "欧美",
//     "流行",
//     "摇滚",
//     "电子",
//     "说唱",
//     "ACG"
//   ],
//   "proxyConfig": {
//     "protocol": "noProxy",
//     "server": "",
//     "port": null
//   },
//   "enableRealIP": false,
//   "realIP": null,
//   "shortcuts": [
//     {
//       "id": "play",
//       "name": "播放/暂停",
//       "shortcut": "CommandOrControl+P",
//       "globalShortcut": "Alt+CommandOrControl+P"
//     },
//     {
//       "id": "next",
//       "name": "下一首",
//       "shortcut": "CommandOrControl+Right",
//       "globalShortcut": "Alt+CommandOrControl+Right"
//     },
//     {
//       "id": "previous",
//       "name": "上一首",
//       "shortcut": "CommandOrControl+Left",
//       "globalShortcut": "Alt+CommandOrControl+Left"
//     },
//     {
//       "id": "increaseVolume",
//       "name": "增加音量",
//       "shortcut": "CommandOrControl+Up",
//       "globalShortcut": "Alt+CommandOrControl+Up"
//     },
//     {
//       "id": "decreaseVolume",
//       "name": "减少音量",
//       "shortcut": "CommandOrControl+Down",
//       "globalShortcut": "Alt+CommandOrControl+Down"
//     },
//     {
//       "id": "like",
//       "name": "喜欢歌曲",
//       "shortcut": "CommandOrControl+L",
//       "globalShortcut": "Alt+CommandOrControl+L"
//     },
//     {
//       "id": "minimize",
//       "name": "隐藏/显示播放器",
//       "shortcut": "CommandOrControl+M",
//       "globalShortcut": "Alt+CommandOrControl+M"
//     }
//   ]
// }

function getDefaultLang() {
	const defaultLang = "en";
	const langMapper = new Map()
		.set("zh", "zh-CN")
		.set("zh-TW", "zh-TW")
		.set("en", "en")
		.set("tr", "tr");
	return (
		langMapper.get(
			langMapper.has(navigator.language) ? navigator.language : navigator.language.slice(0, 2),
		) || defaultLang
	);
}

// TODO: 需要重构
export const useSettingsStore = defineStore("settings", () => {
	const settings = useLocalStorage<Settings>("settings", {
		appearance: "auto",
		lang: getDefaultLang(),
		musicQuality: "standard",
		lyricFontSize: 16,
		outputDevice: "default",
		enabledPlaylistCategories: [],
		shortcuts: [],
	});

	changeAppearance(settings.value.appearance);

	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
		if (settings.value.appearance === "auto") {
			changeAppearance(settings.value.appearance);
		}
	});

	const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
		settings.value[key] = value;
	};

	const togglePlaylistCategory = (name: string) => {
		const index = settings.value.enabledPlaylistCategories.indexOf(name);
		if (index !== -1) {
			settings.value.enabledPlaylistCategories.splice(index, 1);
		} else {
			settings.value.enabledPlaylistCategories.push(name);
		}
	};

	const updateShortcut = <K extends keyof Omit<Shortcut, "id">>(
		id: string,
		type: K,
		shortcut: Shortcut[K],
	) => {
		const newShortcut = settings.value.shortcuts.find((s) => s.id === id);
		if (!newShortcut) return;
		newShortcut[type] = shortcut;
	};

	const restoreDefaultShortcuts = () => {
		settings.value.shortcuts = cloneDeep(shortcuts);
	};

	return {
		settings,

		togglePlaylistCategory,

		updateShortcut,
		restoreDefaultShortcuts,

		update,
	};
});
