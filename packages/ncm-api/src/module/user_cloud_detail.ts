import request from "../util/request";

/**
 * ### 云盘数据详情
 *
 * 说明 : 登录后调用此接口 , 传入云盘歌曲 id，可获取云盘数据详情
 *
 * **必选参数 :** `id`: 歌曲 id,可多个,用逗号隔开
 *
 * **接口地址 :** `/user/cloud/detail`
 *
 * **调用例子 :** `/user/cloud/detail?id=5374627`
 *
 */
export default function user_cloud_detail(query: { id: string | number }) {
	const songIds = `${query.id}`.replace(/\s/g, "").split(",");
	const data = { songIds };
	return request(`/api/v1/cloud/get/byids`, { data, crypto: "weapi" });
}
