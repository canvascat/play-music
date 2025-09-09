import type { SubAction } from "../types/const";

import request from "../util/request";

/**
 * ### 收藏/取消收藏歌手
 *
 * 说明 : 调用此接口,可收藏歌手
 *
 * **必选参数 :**
 *
 * `id` : 歌手 id
 *
 * `t`:操作,1 为收藏,其他为取消收藏
 *
 * **接口地址 :** `/artist/sub`
 *
 * **调用例子 :** `/artist/sub?id=6452&t=1`
 *
 */
export default function artist_sub(params: { id: string | number; t: SubAction }) {
	const { id, t } = params;
	const action = t == 1 ? "sub" : "unsub";
	const data = { artistId: id, artistIds: `[${id}]` };
	return request(`/api/artist/${action}`, data);
}
