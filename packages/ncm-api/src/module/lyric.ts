import request from "../util/request";

/**
 * ### 获取歌词
 *
 * 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 *
 * **必选参数 :** `id`: 音乐 id
 *
 * **接口地址 :** `/lyric`
 *
 * **调用例子 :** `/lyric?id=33894312`
 *
 *
 */
export default function lyric(query: { id: string | number }) {
	const data = {
		id: query.id,
		tv: -1,
		lv: -1,
		rv: -1,
		kv: -1,
		_nmclfl: 1,
	};
	return request(`/api/song/lyric`, data);
}
