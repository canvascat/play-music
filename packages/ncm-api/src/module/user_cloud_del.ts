import request from "../util/request";

/**
 * ### 云盘歌曲删除
 *
 * 说明 : 登录后调用此接口 , 可删除云盘歌曲
 *
 * **必选参数 :** `id`: 歌曲 id,可多个,用逗号隔开
 *
 * **接口地址 :** `/user/cloud/del`
 *
 * **调用例子 :** `/user/cloud/del`
 *
 */
export default function user_cloud_del(query: { id: string | number }) {
	const data = {
		songIds: [query.id],
	};
	return request(`/api/cloud/del`, { data, crypto: "weapi" });
}
