import type { MultiPageConfig } from "../types/common";
import { request } from "../util/request";

/**
 * ### 获取歌手专辑
 *
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手专辑内容
 *
 * **必选参数 :** `id`: 歌手 id
 *
 * **可选参数 :** `limit`: 取出数量 , 默认为 30
 *
 * `offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认
 * 为 0
 *
 * **接口地址 :** `/artist/album`
 *
 * **调用例子 :** `/artist/album?id=6452&limit=5` ( 周杰伦 )
 *
 *
 */
export default function artist_album(params: { id: string | number } & MultiPageConfig) {
	const { id, limit = 30, offset = 0 } = params;
	const data = { limit, offset, total: true };
	return request(`/api/artist/albums/${id}`, data);
}
