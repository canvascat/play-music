import request from "../util/request";

/**
 * ### 心动模式/智能播放
 *
 * 说明 : 登录后调用此接口 , 可获取心动模式/智能播放列表
 * **必选参数 :** `id` : 歌曲 id
 *
 * `pid` : 歌单 id
 *
 * **可选参数 :**
 * `sid` : 要开始播放的歌曲的 id
 *
 * **接口地址 :** `/playmode/intelligence/list`
 *
 * **调用例子 :** `/playmode/intelligence/list?id=33894312&pid=24381616` , `/playmode/intelligence/list?id=33894312&pid=24381616&sid=36871368`
 *
 */
export default function playmode_intelligence_list(query: {
	id: string | number;
	pid: string | number;
	sid?: string | number;
	count?: string | number;
}) {
	const { id, pid, sid, count = 1 } = query;
	const data = { songId: id, type: "fromPlayOne", playlistId: pid, startMusicId: sid || id, count };
	return request(`/api/playmode/intelligence/list`, data);
}
