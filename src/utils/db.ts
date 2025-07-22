import axios from "axios";
import Dexie, { type Table } from "dexie";
import { useStore } from "@/store/pinia";

// import pkg from "../../package.json";

class YesPlayMusicDB extends Dexie {
	declare trackDetail: Table;
	declare lyric: Table;
	declare album: Table;
	declare trackSources: Table;

	constructor() {
		super("yesplaymusic");
		this.version(1).stores({
			trackDetail: "&id, updateTime",
			lyric: "&id, updateTime",
			album: "&id, updateTime",
			trackSources: "&id, createTime",
		});
	}
}

const db = new YesPlayMusicDB();

let tracksCacheBytes = 0;

async function deleteExcessCache() {
	const store = useStore();
	if (
		!store.settings.cacheLimit ||
		tracksCacheBytes < store.settings.cacheLimit * 1024 ** 2
	) {
		return;
	}
	try {
		const delCache = await db.trackSources.orderBy("createTime").first();
		await db.trackSources.delete(delCache.id);
		tracksCacheBytes -= delCache.source.byteLength;
		console.debug(
			`[debug][db.js] deleteExcessCacheSucces, track: ${delCache.name}, size: ${delCache.source.byteLength}, cacheSize:${tracksCacheBytes}`,
		);
		deleteExcessCache();
	} catch (error) {
		console.debug("[debug][db.js] deleteExcessCacheFailed", error);
	}
}

export function cacheTrackSource(trackInfo, url, bitRate, from = "netease") {
	if (!window.IS_ELECTRON) return;
	const name = trackInfo.name;
	const artist =
		(trackInfo.ar && trackInfo.ar[0]?.name) ||
		(trackInfo.artists && trackInfo.artists[0]?.name) ||
		"Unknown";
	let cover = trackInfo.al.picUrl;
	if (cover.slice(0, 5) !== "https") {
		cover = `https${cover.slice(4)}`;
	}
	axios.get(`${cover}?param=512y512`);
	axios.get(`${cover}?param=224y224`);
	axios.get(`${cover}?param=1024y1024`);
	return axios
		.get(url, {
			responseType: "arraybuffer",
		})
		.then((response) => {
			db.trackSources.put({
				id: trackInfo.id,
				source: response.data,
				bitRate,
				from,
				name,
				artist,
				createTime: Date.now(),
			});
			console.debug(`[debug][db.js] cached track 👉 ${name} by ${artist}`);
			tracksCacheBytes += response.data.byteLength;
			deleteExcessCache();
			return { trackID: trackInfo.id, source: response.data, bitRate };
		});
}

export function getTrackSource(id: number | string) {
	return db.trackSources.get(+id).then((track) => {
		if (!track) return null;
		console.debug(
			`[debug][db.js] get track from cache 👉 ${track.name} by ${track.artist}`,
		);
		return track;
	});
}

export function cacheTrackDetail(track, privileges) {
	db.trackDetail.put({
		id: track.id,
		detail: track,
		privileges,
		updateTime: Date.now(),
	});
}

export function getTrackDetailFromCache(ids: string[]) {
	return db.trackDetail
		.filter((track) => ids.includes(String(track.id)))
		.toArray()
		.then((tracks) => {
			const result = { songs: [], privileges: [] };
			ids.map((id) => {
				const one = tracks.find((t) => String(t.id) === id);
				result.songs.push(one?.detail);
				result.privileges.push(one?.privileges);
			});
			if (result.songs.includes(undefined)) {
				return;
			}
			return result;
		});
}

export function cacheLyric(id: number, lyrics: any) {
	db.lyric.put({
		id,
		lyrics,
		updateTime: Date.now(),
	});
}

export function getLyricFromCache(id: string | number) {
	return db.lyric.get(+id).then((result) => {
		if (!result) return;
		return result.lyrics;
	});
}

export function cacheAlbum(id: number, album: any) {
	db.album.put({
		id: +id,
		album,
		updateTime: Date.now(),
	});
}

export function getAlbumFromCache(id: number) {
	return db.album.get(+id).then((result) => {
		if (!result) return;
		return result.album;
	});
}

export function countDBSize() {
	const trackSizes: number[] = [];
	return db.trackSources
		.each((track) => {
			trackSizes.push(track.source.byteLength);
		})
		.then(() => {
			const res = {
				bytes: trackSizes.reduce((s1, s2) => s1 + s2, 0),
				length: trackSizes.length,
			};
			tracksCacheBytes = res.bytes;
			console.debug(
				`[debug][db.js] load tracksCacheBytes: ${tracksCacheBytes}`,
			);
			return res;
		});
}

export function clearDB() {
	return new Promise<void>((resolve) => {
		db.tables.forEach((table) => {
			table.clear();
		});
		resolve();
	});
}
