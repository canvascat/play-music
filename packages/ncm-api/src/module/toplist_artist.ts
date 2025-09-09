import type { ToplistArtistType } from "../types/const";
import type { MultiPageConfig } from "../types/common";
import request from "../util/request";

/**
 * ### 歌手榜
 *
 * 说明 : 调用此接口 , 可获取排行榜中的歌手榜
 *
 * **可选参数 :**
 *
 * ```
 * type : 地区
 * 1: 华语
 * 2: 欧美
 * 3: 韩国
 * 4: 日本
 * ```
 *
 * **接口地址 :** `/toplist/artist`
 *
 * **调用例子 :** `/toplist/artist`
 *
 */
export default function toplist_artist(params: { type?: ToplistArtistType } & MultiPageConfig) {
	const { type = 1, limit = 100, offset = 0 } = params;
	const data = { type, limit, offset, total: true };
	return request(`/api/toplist/artist`, data);
}
