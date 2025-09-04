import { request } from "../util/request";

/**
 * ### mv 地址
 *
 * 说明 : 调用此接口 , 传入 mv id,可获取 mv 播放地址
 *
 * **必选参数 :** `id`: mv id
 *
 * **可选参数 :** `r`: 分辨率,默认 1080,可从 `/mv/detail` 接口获取分辨率列表
 *
 * **接口地址 :** `/mv/url`
 *
 * **调用例子 :** `/mv/url?id=5436712` `/mv/url?id=10896407&r=1080`
 */
export default function mv_url(params: { id?: string | number; r?: string | number }) {
	const { id, r = 1080 } = params;
	const data = { id, r };
	return request(`/api/song/enhance/play/mv/url`, data);
}
