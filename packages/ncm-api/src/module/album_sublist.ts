import type { MultiPageConfig } from "../types/common";
import { request } from "../util/request";

/**
 * ### 获取已收藏专辑列表
 *
 * 说明 : 调用此接口 , 可获得已收藏专辑列表
 *
 * **可选参数 :**
 * `limit`: 取出数量 , 默认为 25
 *
 * `offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*25, 其中 25 为 limit 的值 , 默认
 * 为 0
 *
 * **接口地址 :** `/album/sublist`
 *
 * **调用例子 :** `/album/sublist` ( 周杰伦 )
 *
 */
export default function album_sublist(params: MultiPageConfig) {
	const { limit = 25, offset = 0 } = params;
	const data = { limit, offset, total: true };
	return request(`/api/album/sublist`, data);
}
