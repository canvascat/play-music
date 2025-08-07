import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";
import router from "../router";
import state from "../store/state";
import { useDataStore } from "@/store/data";

export function hasListSource() {
	return !state.player.isPersonalFM && state.player.playlistSource.id !== 0;
}

export function goToListSource() {
	router.push({ path: `${getListSourcePath()}` });
}

export function getListSourcePath() {
	const dataStore = useDataStore();
	if (state.player.playlistSource.id === dataStore.likedSongPlaylistID) {
		return "/library/liked-songs";
	} else if (state.player.playlistSource.type === "url") {
		return state.player.playlistSource.id;
	} else if (state.player.playlistSource.type === "cloudDisk") {
		return "/library";
	} else {
		return `/${state.player.playlistSource.type}/${state.player.playlistSource.id}`;
	}
}

export async function getRecommendPlayList(limit, removePrivateRecommand) {
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
