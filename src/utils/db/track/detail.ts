import type { Track, TrackPrivilege } from "ncm-api/types";
import db from "../db";

export function write(track: Track, privilege: TrackPrivilege) {
	db.trackDetail.put({
		id: track.id,
		detail: track,
		privilege,
		updateTime: Date.now(),
	});
}

export async function read(ids: string[]) {
	const tracks = await db.trackDetail.filter((track) => ids.includes(String(track.id))).toArray();

	const songs: Track[] = [];
	const privileges: TrackPrivilege[] = [];
	for (const id of ids) {
		const track = tracks.find((t) => String(t.id) === id);
		if (!track) return;
		songs.push(track.detail);
		privileges.push(track.privilege);
	}
	return { songs, privileges };
}
