import { request } from "../util/request";

/**
 * ### 喜欢音乐
 *
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 *
 * **必选参数 :** `id`: 歌曲 id
 *
 * **可选参数 :** `like`: 布尔值 , 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 *
 * **接口地址 :** `/like`
 *
 * **调用例子 :** `/like?id=347230`
 *
 *
 *
 * 喜欢成功则返回数据的 code 为 200, 其余为失败
 *
 *
 */
export default function like(query: {
	like?: "true" | "false" | boolean;
	id: string | number;
	alg?: string;
	time?: string | number;
}) {
	query.like = query.like == "false" ? false : true;
	const data = {
		alg: "itembased",
		trackId: query.id,
		like: query.like,
		time: "3",
	};
	return request(`/api/radio/like`, data);
}
