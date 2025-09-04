import { request } from "../util/request";

/**
 * ### 获取每日推荐歌单
 *
 * 说明 : 调用此接口 , 可获得每日推荐歌单 ( 需要登录 )
 *
 * **接口地址 :** `/recommend/resource`
 *
 * **调用例子 :** `/recommend/resource`
 */
export default function recommend_resource() {
	return request(`/api/v1/discovery/recommend/resource`);
}
