import request from "../util/request";

/**
 * ### 获取歌单详情
 *
 * 说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可
 * 以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，但是返回的 trackIds 是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 `song/detail` 接口获取所有歌曲的详情
 *
 * **必选参数 :** `id` : 歌单 id
 *
 * **可选参数 :** `s` : 歌单最近的 s 个收藏者,默认为 8
 *
 * **接口地址 :** `/playlist/detail`
 *
 * **调用例子 :** `/playlist/detail?id=24381616`
 *
 */
export default function playlist_detail(query: { id: string | number; s?: string | number }) {
	const data = {
		id: query.id,
		n: 100000,
		s: query.s || 8,
	};
	return request(`/api/v6/playlist/detail`, data);
}
