import request from "../util/request";

/**
 * ### 获取相似歌手
 *
 * 说明 : 调用此接口 , 传入歌手 id, 可获得相似歌手
 *
 * **必选参数 :** `id`: 歌手 id
 *
 * **接口地址 :** `/simi/artist`
 *
 * **调用例子 :** `/simi/artist?id=6452` ( 对应和周杰伦相似歌手 )
 *
 */
export default function simi_artist(params: { id: string | number }) {
	const { id } = params;
	const data = { artistid: id };
	return request(`/api/discovery/simiArtist`, data);
}
