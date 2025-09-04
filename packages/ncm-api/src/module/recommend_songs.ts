import { request } from "../util/request";

/**
 * ### 获取每日推荐歌曲
 *
 * 说明 : 调用此接口 , 可获得每日推荐歌曲 ( 需要登录 )
 *
 * **接口地址 :** `/recommend/songs`
 *
 * **调用例子 :** `/recommend/songs`
 *
 *
 */
export default function recommend_songs() {
	return request(`/api/v3/discovery/recommend/songs`);
}
