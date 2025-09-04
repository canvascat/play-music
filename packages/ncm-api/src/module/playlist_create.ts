import { request } from "../util/request";

export type PlaylistType = "NROMAL" | "VIDEO";

/**
 * ### 新建歌单
 *
 * 说明 : 调用此接口 , 传入歌单名字可新建歌单
 *
 * **必选参数 :** `name` : 歌单名
 *
 * **可选参数 :**
 *
 * `privacy` : 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单
 *
 * `type` : 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单,传 'SHARED'则为共享歌单
 *
 * **接口地址 :** `/playlist/create`
 *
 * **调用例子 :** `/playlist/create?name=测试歌单`,`/playlist/create?name=test&type=VIDEO`
 *
 */
export default function playlist_create(query: {
	name: string;
	privacy: 0 | 10;
	type?: PlaylistType;
}) {
	const { name, privacy = 0, type = "NORMAL" } = query;
	const data = { name, privacy, type };
	return request(`/api/playlist/create`, data);
}
