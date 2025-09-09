import request from "../util/request";

/**
 * ### 听歌打卡
 *
 * 说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据
 *
 * **必选参数 :** `id`: 歌曲 id, `sourceid`: 歌单或专辑 id
 *
 * **可选参数 :** `time`: 歌曲播放时间,单位为秒
 *
 * **接口地址 :** `/scrobble`
 *
 * **调用例子 :** `/scrobble?id=518066366&sourceid=36780169&time=291`
 *
 */
export default function scrobble(query: {
	id: string | number;
	sourceid: string | number;
	time: string | number;
}) {
	const data = {
		logs: JSON.stringify([
			{
				action: "play",
				json: {
					download: 0,
					end: "playend",
					id: query.id,
					sourceId: query.sourceid,
					time: query.time,
					type: "song",
					wifi: 0,
					source: "list",
					mainsite: 1,
					content: "",
				},
			},
		]),
	};

	return request(`/api/feedback/weblog`, data);
}
