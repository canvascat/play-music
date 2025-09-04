import { request } from "../util/request";

/**
 * ### 对歌单添加或删除歌曲
 *
 * 收藏单曲到歌单 从歌单删除歌曲
 *
 * 说明 : 调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )
 *
 * **必选参数 :**
 *
 * `op`: 从歌单增加单曲为 add, 删除为 del
 *
 * `pid`: 歌单 id
 * `tracks`: 歌曲 id,可多个,用逗号隔开
 *
 * **接口地址 :** `/playlist/tracks`
 *
 * **调用例子 :** `/playlist/tracks?op=add&pid=24381616&tracks=347231` ( 对应把歌曲添加到 ' 我 ' 的歌单 , 测试的时候请把这里的 pid 换成你自己的, id 和 tracks 不对可能会报 502 错误)
 *
 */
export default async function playlist_tracks(query: {
	op: "add" | "del";
	pid: string | number;
	tracks: string;
}) {
	const { op, pid } = query;
	const tracks = query.tracks.split(",");
	let trackIds = JSON.stringify(tracks);
	let data = {
		op,
		pid,
		trackIds,
		imme: "true",
	};

	try {
		const res = await request(`/api/playlist/manipulate/tracks`, data, "eapi");
		return {
			status: 200,
			body: { ...res },
		};
	} catch (error) {
		if (error.body.code === 512) {
			trackIds = JSON.stringify([...tracks, ...tracks]);
			data = { ...data, trackIds };
			return request(`/api/playlist/manipulate/tracks`, data, "eapi");
		} else {
			return {
				status: 200,
				body: error.body,
			};
		}
	}
}
