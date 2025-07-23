import Dexie, { type EntityTable } from "dexie";
import type {
	AlbumDetailResponse,
	Track,
	TrackLyricResponse,
	TrackPrivilege,
} from "@/types/index";

interface AlbumCache {
	id: number;
	album: AlbumDetailResponse;
	updateTime: number;
}

interface TrackDetailCache {
	id: number;
	detail: Track;
	privilege: TrackPrivilege;
	updateTime: number;
}

interface LyricCache {
	id: number;
	lyrics: TrackLyricResponse;
	updateTime: number;
}

interface TrackSourceCache {
	id: number;
	source: ArrayBuffer;
	bitRate: number;
	from: "netease" | string;
	name: string;
	artist: string;
	createTime: number;
}

class YesPlayMusicDB extends Dexie {
	declare trackDetail: EntityTable<TrackDetailCache, "id">;
	declare lyric: EntityTable<LyricCache, "id">;
	declare album: EntityTable<AlbumCache, "id">;
	declare trackSources: EntityTable<TrackSourceCache, "id">;

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

export default db;
