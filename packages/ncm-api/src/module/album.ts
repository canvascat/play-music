import type { AlbumDetailResponse } from "../types";
import request from "../util/request";

/**
 * ### 获取专辑内容
 *
 * 说明 : 调用此接口 , 传入专辑 id, 可获得专辑内容
 *
 * **必选参数 :** `id`: 专辑 id
 *
 * **接口地址 :** `/album`
 *
 * **调用例子 :** `/album?id=32311`
 *
 */
export default function album(params: { id: string | number }) {
	const { id } = params;
	return request<AlbumDetailResponse>(`/api/v1/album/${id}`, { crypto: "weapi" });
}
