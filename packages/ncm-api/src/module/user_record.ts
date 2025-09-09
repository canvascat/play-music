import { UserRecordType } from "../types/const";

import request from "../util/request";

/**
 * ### 获取用户播放记录
 *
 * 说明 : 登录后调用此接口 , 传入用户 id, 可获取用户播放记录
 *
 * **必选参数 :** `uid` : 用户 id
 *
 * **可选参数 :** `type` : type=1 时只返回 weekData, type=0 时返回 allData  1: 最近一周, 0: 所有时间
 *
 * **接口地址 :** `/user/record`
 *
 * **调用例子 :** `/user/record?uid=32953014&type=1`
 *
 */
export default function user_record(query: { uid: string | number; type?: UserRecordType }) {
	const { uid, type = UserRecordType.all } = query;
	const data = { uid, type };
	return request(`/api/v1/play/record`, data);
}
