import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";
import router from "../router";

import { useDataStore } from "@/store/data";
import { useGlobalStore } from "@/store/global";
import type { Playlist } from "ncm-api/types";

export function hasListSource() {
	const { player } = useGlobalStore();
	return !player.isPersonalFM && player.playlistSource.id !== 0;
}

export function goToListSource() {
	router.push({ path: `${getListSourcePath()}` });
}

export function getListSourcePath() {
	const dataStore = useDataStore();
	const { player } = useGlobalStore();
	if (player.playlistSource.id === dataStore.likedSongPlaylistID) {
		return "/library/liked-songs";
	} else if (player.playlistSource.type === "url") {
		return player.playlistSource.id;
	} else if (player.playlistSource.type === "cloudDisk") {
		return "/library";
	} else {
		return `/${player.playlistSource.type}/${player.playlistSource.id}`;
	}
}
/**
 * 获取推荐歌单
 * @param limit 限制数量
 * @param removePrivateRecommand 是否移除私人歌单
 * @returns 推荐歌单
 */
export async function getRecommendPlayList(
	limit: number,
	removePrivateRecommand: boolean,
): Promise<Playlist[]> {
	if (isAccountLoggedIn()) {
		const playlists = await Promise.all([
			api.playlist.dailyRecommendPlaylist(),
			api.playlist.recommendPlaylist({ limit }),
		]);
		let recommend = playlists[0].recommend ?? [];
		if (recommend.length) {
			if (removePrivateRecommand) recommend = recommend.slice(1);
			await replaceRecommendResult(recommend);
		}
		return recommend.concat(playlists[1].result).slice(0, limit);
	} else {
		const response = await api.playlist.recommendPlaylist({ limit });
		return response.result;
	}
}

async function replaceRecommendResult(recommend) {
	for (const r of recommend) {
		if (specialPlaylist.indexOf(r.id) > -1) {
			const data = await api.playlist.getPlaylistDetail(r.id, true);
			const playlist = data.playlist;
			if (playlist) {
				r.name = playlist.name;
				r.picUrl = playlist.coverImgUrl;
			}
		}
	}
}

const specialPlaylist = [3136952023, 2829883282, 2829816518, 2829896389];
