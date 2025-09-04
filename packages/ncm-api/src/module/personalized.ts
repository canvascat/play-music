import { request } from "../util/request";

/**
 * ### 推荐歌单
 *
 * 说明 : 调用此接口 , 可获取推荐歌单
 *
 * **可选参数 :** `limit`: 取出数量 , 默认为 30 (不支持 offset)
 *
 * **接口地址 :** `/personalized`
 *
 * **调用例子 :** `/personalized?limit=1`
 *
 */
export default function personalized(params: { limit?: string | number }) {
	const { limit = 30 } = params;
	const data = { limit, total: true, n: 1000 };
	return request(`/api/personalized/playlist`, data);
}
