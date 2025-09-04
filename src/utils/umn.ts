import type { SearchMode } from "@unblockneteasemusic/rust-napi";

import * as db from "@/utils/db/index";
import { decode as base642Buffer } from "@/utils/base64";
import type { Track } from "ncm-api/types";
import { useSettingsStore } from "@/store/settings";
import { pinia } from "@/store/pinia";

const determineSearchMode = (searchMode?: string): SearchMode => {
	switch (searchMode) {
		case "order-first":
			return 1;
		case "fast-first":
		default:
			return 0;
	}
};

export async function getAudioSourceFromUnblockMusic(track: Track) {
	console.debug(`[debug][Player.js] _getAudioSourceFromUnblockMusic`);

	if (
		window.IS_ELECTRON !== true ||
		useSettingsStore(pinia).settings.enableUnblockNeteaseMusic === false
	) {
		return null;
	}

	const retrieveSongInfo = await window.ipcRenderer?.invoke(
		"unblock-music",
		useSettingsStore(pinia).settings.unmSource,
		track,
		{
			enableFlac: useSettingsStore(pinia).settings.unmEnableFlac || null,
			proxyUri: useSettingsStore(pinia).settings.unmProxyUri || null,
			searchMode: determineSearchMode(useSettingsStore(pinia).settings.unmSearchMode),
			config: {
				"joox:cookie": useSettingsStore(pinia).settings.unmJooxCookie || null,
				"qq:cookie": useSettingsStore(pinia).settings.unmQQCookie || null,
				"ytdl:exe": useSettingsStore(pinia).settings.unmYtDlExe || null,
			},
		},
	);

	if (useSettingsStore(pinia).settings.automaticallyCacheSongs && retrieveSongInfo?.url) {
		// 对于来自 bilibili 的音源
		// retrieveSongInfo.url 是音频数据的base64编码
		// 其他音源为实际url
		const url =
			retrieveSongInfo.source === "bilibili"
				? `data:application/octet-stream;base64,${retrieveSongInfo.url}`
				: retrieveSongInfo.url;
		db.track.source.write(track, url, 128000, `unm:${retrieveSongInfo.source}`);
	}

	if (!retrieveSongInfo) {
		return null;
	}

	if (retrieveSongInfo.source !== "bilibili") {
		return retrieveSongInfo.url;
	}

	const buffer = base642Buffer(retrieveSongInfo.url);
	return buffer;
}
