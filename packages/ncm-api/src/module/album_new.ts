import type { AlbumListArea } from "../types/const";
import type { MultiPageConfig } from "../types/common";
import { request } from "../util/request";

/**
 * ### 全部新碟
 *
 * 说明 : 登录后调用此接口 ,可获取全部新碟
 *
 * **可选参数 :**
 *
 * `limit` : 返回数量 , 默认为 30
 *
 * `offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0
 *
 * `area` : ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
 *
 * **接口地址 :** `/album/new`
 *
 * **调用例子 :** `/album/new?area=KR&limit=10`
 *
 */
export default function album_new(params: { area?: AlbumListArea } & MultiPageConfig) {
	const { area = "ALL", limit = 30, offset = 0 } = params;
	const data = { limit, offset, total: true, area };
	return request(`/api/album/new`, data);
}
