import type { ListOrder } from "../types/const";
import type { MultiPageConfig } from "../types/common";
import request from "../util/request";

/**
 * ### 歌单 ( 网友精选碟 )
 *
 * 说明 : 调用此接口 , 可获取网友精选碟歌单
 *
 * **可选参数 :** `order`: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为
 * 'hot'
 *
 * `cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
 * "全部",可从歌单分类接口获取(/playlist/catlist)
 *
 * `limit`: 取出歌单数量 , 默认为 50
 *
 * `offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值
 *
 * **接口地址 :** `/top/playlist`
 *
 * **调用例子 :** `/top/playlist?limit=10&order=new`
 *
 */
export default async function top_playlist(
	query: { cat?: string; order?: ListOrder } & MultiPageConfig,
) {
	const { cat = "全部", order = "hot", limit = 50, offset = 0 } = query;
	const data = { cat, order, limit, offset, total: true };
	const res = await request(`/api/playlist/list`, data);
	const result = JSON.stringify(res).replace(/avatarImgId_str/g, "avatarImgIdStr");
	return JSON.parse(result);
}
