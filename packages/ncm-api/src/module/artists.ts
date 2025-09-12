import request from "../util/request";

/**
 * ### 获取歌手单曲
 *
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲
 *
 * **必选参数 :** `id`: 歌手 id, 可由搜索接口获得
 *
 * **接口地址 :** `/artists`
 *
 * **调用例子 :** `/artists?id=6452`
 *
 */
export default function artists(params: { id: string | number }) {
	const { id } = params;
	return request(`/api/v1/artist/${id}`, { crypto: "weapi" });
}
