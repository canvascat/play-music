import type { AlbumDetailResponse } from "@/types";
import db from "./db";

export async function write(id: number, album: AlbumDetailResponse) {
	await db.album.put({ id, album, updateTime: Date.now() });
}

export async function read(id: number) {
	const result = await db.album.get(+id);
	return result?.album;
}
