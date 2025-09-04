import { request } from "../util/request";

/**
 * ### 相似 mv
 *
 * 说明 : 调用此接口 , 传入 `mvid` 可获取相似 mv
 *
 * **必选参数 :** `mvid`: mv id
 *
 * **接口地址 :** `/simi/mv`
 *
 * **调用例子 :** `/simi/mv?mvid=5436712`
 */
export default function simi_mv(params: { mvid: string | number }) {
	const { mvid } = params;
	const data = { mvid };
	return request(`/api/discovery/simiMV`, data);
}
