import type { TrackLyricResponse } from "ncm-api/types";
import db from "./db";

export async function write(id: number, lyrics: TrackLyricResponse) {
	await db.lyric.put({ id, lyrics, updateTime: Date.now() });
}

export async function read(id: number) {
	const result = await db.lyric.get(+id);
	return result?.lyrics;
}
