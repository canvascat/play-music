import request from "../util/request";

/**
 * ### 歌单分类
 *
 * 全部歌单分类
 *
 * 说明 : 调用此接口,可获取歌单分类,包含 category 信息
 *
 * **接口地址 :** `/playlist/catlist`
 *
 * **调用例子 :** `/playlist/catlist`
 *
 */
export default function playlist_catlist() {
	return request(`/api/playlist/catalogue`, { crypto: "weapi" });
}
