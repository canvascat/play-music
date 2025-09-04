import { request } from "../util/request";

/**
 * ### 删除歌单
 *
 * 说明 : 调用此接口 , 传入歌单 id 可删除歌单
 *
 * **必选参数 :** `id` : 歌单 id,可多个,用逗号隔开
 *
 * **接口地址 :** `/playlist/delete`
 *
 * **调用例子 :** `/playlist/delete?id=2947311456` , `/playlist/delete?id=5013464397,5013427772`
 *
 */
export default function playlist_delete(query: { id: string | number }) {
	const data = {
		ids: "[" + query.id + "]",
	};
	return request(`/api/playlist/remove`, data);
}
