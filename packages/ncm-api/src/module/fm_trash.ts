import { request } from "../util/request";

/**
 *
 * ### 垃圾桶
 *
 * 说明 : 调用此接口 , 传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶
 *
 * **必选参数 :** `id`: 歌曲 id
 *
 * **接口地址 :** `/fm_trash`
 *
 * **调用例子 :** `/fm_trash?id=347230`
 */
export default function fm_trash(params: { id: string | number; time?: string | number }) {
	const { id, time = 25 } = params;
	const data = { songId: id, alg: "RT", time };
	return request(`/api/radio/trash/add`, data);
}
