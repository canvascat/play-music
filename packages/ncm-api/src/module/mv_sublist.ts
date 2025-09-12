import type { MultiPageConfig } from "../types/common";
import request from "../util/request";

/**
 * ### 收藏的 MV 列表
 *
 * 说明 : 调用此接口,可获取收藏的 MV 列表
 *
 * **接口地址 :** `/mv/sublist`
 *
 * **调用例子 :** `/mv/sublist`
 *
 */
export default function mv_sublist(query: MultiPageConfig) {
	const { limit = 25, offset = 0 } = query;
	const data = { limit, offset, total: true };
	return request(`/api/cloudvideo/allvideo/sublist`, { data, crypto: "weapi" });
}
