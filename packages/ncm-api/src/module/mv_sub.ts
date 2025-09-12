import type { SubAction } from "../types/const";

import request from "../util/request";

/**
 * ### 收藏/取消收藏 MV
 *
 * 说明 : 调用此接口,可收藏/取消收藏 MV
 *
 * **必选参数 :**
 *
 * `mvid` : MV id
 *
 * `t` : 1 为收藏,其他为取消收藏
 *
 * **接口地址 :** `/mv/sub`
 *
 * **调用例子 :** `/mv/sub`
 */
export default function mv_sub(params: { t: SubAction; mvid: string | number }) {
	const { t, mvid } = params;
	const action = t == 1 ? "sub" : "unsub";
	const data = { mvId: mvid, mvIds: `["${mvid}"]` };
	return request(`/api/mv/${action}`, { data, crypto: "weapi" });
}
