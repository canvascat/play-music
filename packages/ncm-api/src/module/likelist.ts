import request from "../util/request";

/**
 * ### 喜欢音乐列表
 * 喜欢的歌曲(无序)
 *
 * 说明 : 调用此接口 , 传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)
 *
 * **必选参数 :** `uid`: 用户 id
 *
 * **接口地址 :** `/likelist`
 *
 * **调用例子 :** `/likelist?uid=32953014`
 *
 */
export default function likelist(params: { uid: string | number }) {
	const { uid } = params;
	const data = { uid };
	return request(`/api/song/like/get`, data);
}
