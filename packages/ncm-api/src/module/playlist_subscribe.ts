import type { SubAction } from "../types/const";

import { request } from "../util/request";

/**
 * ### 收藏/取消收藏歌单
 *
 * 说明 : 调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单
 *
 * **必选参数 :**
 *
 * `t` : 类型,1:收藏,2:取消收藏
 *
 * `id` : 歌单 id
 *
 * **接口地址 :** `/playlist/subscribe`
 *
 * **调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`
 *
 */
export default function playlist_subscribe(query: { t: SubAction; id: string | number }) {
	const { t, id } = query;
	const action = t == 1 ? "subscribe" : "unsubscribe";
	const data = { id };
	return request(`/api/playlist/${action}`, data);
}
