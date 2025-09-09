import request from "../util/request";

/**
 * ### 私人FM
 *
 * 说明 : 私人 FM( 需要登录 )
 *
 * **接口地址 :** `/personal_fm`
 *
 * **调用例子 :** `/personal_fm`
 */
export default function personal_fm() {
	return request(`/api/v1/radio/get`);
}
