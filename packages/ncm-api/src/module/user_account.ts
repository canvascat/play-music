import request from "../util/request";

/**
 * ### 获取账号信息
 *
 * 说明 : 登录后调用此接口 ,可获取用户账号信息
 *
 */
export default function user_account() {
	return request(`/api/nuser/account/get`);
}
