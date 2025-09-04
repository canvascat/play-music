import type { MultiPageConfig } from "../types/common";
import { request } from "../util/request";

/**
 * ### 获取用户歌单
 *
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单
 *
 * **必选参数 :** `uid` : 用户 id
 *
 * **可选参数 :**
 *
 * `limit` : 返回数量 , 默认为 30
 *
 * `offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0
 *
 * **接口地址 :** `/user/playlist`
 *
 * **调用例子 :** `/user/playlist?uid=32953014`
 *
 *
 */
export default function user_playlist(query: { uid: string | number } & MultiPageConfig) {
	const { uid, limit = 30, offset = 0 } = query;
	const data = { uid, limit, offset, includeVideo: true };
	return request(`/api/user/playlist`, data);
}
