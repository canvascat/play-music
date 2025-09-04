import type { SubAction } from "../types/const";

import { request } from "../util/request";

/**
 * ### 收藏/取消收藏专辑
 *
 * 说明 : 调用此接口,可收藏/取消收藏专辑
 *
 * **必选参数 :**
 *
 * `id` : 专辑 id
 *
 * `t` : 1 为收藏,其他为取消收藏
 *
 * **接口地址 :** `/album/sub`
 *
 * **调用例子 :** `/album/sub?t=1` `/album/sub?t=0`
 *
 */
export default function album_sub(params: {
	id: string | number;
	t?: SubAction;
	action?: "sub" | "unsub";
}) {
	let { t, id, action } = params;
	action ??= t == 1 ? "sub" : "unsub";

	return request(`/api/album/${action}`, { id }, "weapi");
}
