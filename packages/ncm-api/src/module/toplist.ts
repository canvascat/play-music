import request from "../util/request";

/**
 * ### 所有榜单
 *
 * 说明 : 调用此接口,可获取所有榜单
 */
export default function toplist() {
	return request(`/api/toplist`);
}
