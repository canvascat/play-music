import type { MultiPageConfig } from "../types/common";
import request from "../util/request";

/**
 * ### 收藏的歌手列表 关注歌手列表
 *
 * 说明 : 调用此接口,可获取收藏的歌手列表
 *
 * **可选参数 :**
 *
 * `limit`: 取出歌单数量 , 默认为 25
 *
 * `offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*25, 其中 25 为 limit 的值
 *
 * **接口地址 :** `/artist/sublist`
 *
 * **调用例子 :** `/artist/sublist`
 *
 */
export default function artist_sublist(query: MultiPageConfig) {
	const data = {
		limit: query.limit || 25,
		offset: query.offset || 0,
		total: true,
	};
	return request(`/api/artist/sublist`, { data, crypto: "weapi" });
}
