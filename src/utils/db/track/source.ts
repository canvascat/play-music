import axios from "axios";
import type { Track } from "ncm-api/types";
import db from "../db";

let tracksCacheBytes = 0;

/**
 * 删除过期缓存
 * @param cacheLimit 缓存限制 MB
 */
async function deleteExcessCache(cacheLimit?: number) {
	if (!cacheLimit || tracksCacheBytes < cacheLimit * 1024 ** 2) {
		return;
	}
	try {
		const delCache = await db.trackSources.orderBy("createTime").first();
		if (!delCache) return;
		await db.trackSources.delete(delCache.id);
		tracksCacheBytes -= delCache.source.byteLength;
		console.debug(
			`[debug][db.js] deleteExcessCacheSucces, track: ${delCache.name}, size: ${delCache.source.byteLength}, cacheSize:${tracksCacheBytes}`,
		);
		await deleteExcessCache(cacheLimit);
	} catch (error) {
		console.debug("[debug][db.js] deleteExcessCacheFailed", error);
	}
}

export async function write(
	trackInfo: Track,
	url: string,
	bitRate: number,
	from: string = "netease",
) {
	if (!window.IS_ELECTRON) return;
	const name = trackInfo.name;
	const artist = trackInfo.ar?.[0]?.name || trackInfo.artists?.[0]?.name || "Unknown";
	let cover = trackInfo.al.picUrl;
	if (cover.slice(0, 5) !== "https") {
		cover = `https${cover.slice(4)}`;
	}
	axios.get(`${cover}?param=512y512`);
	axios.get(`${cover}?param=224y224`);
	axios.get(`${cover}?param=1024y1024`);
	const response = await axios.get(url, { responseType: "arraybuffer" });

	await db.trackSources.put({
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
}

export async function read(id: number | string) {
	const track = await db.trackSources.get(+id);
	if (!track) return null;
	console.debug(`[debug][db.js] get track from cache 👉 ${track.name} by ${track.artist}`);
	return track;
}

export async function size() {
	const trackSizes: number[] = [];
	await db.trackSources.each((track) => {
		trackSizes.push(track.source.byteLength);
	});

	const bytes = trackSizes.reduce((s1, s2) => s1 + s2, 0);
	const length = trackSizes.length;

	tracksCacheBytes = bytes;
	console.debug(`[debug][db.js] load tracksCacheBytes: ${tracksCacheBytes}`);
	return { bytes, length };
}

export function clear() {
	return new Promise<void>((resolve) => {
		db.tables.forEach((table) => {
			table.clear();
		});
		resolve();
	});
}
