import request from "../util/request";

/**
 * ### 获取用户详情
 *
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情
 *
 * **必选参数 :** `uid` : 用户 id
 *
 * **接口地址 :** `/user/detail`
 *
 * **调用例子 :** `/user/detail?uid=32953014`
 *
 */
export default async function user_detail(query: { uid: string | number }) {
	const res = await request(`/api/v1/user/detail/${query.uid}`, { crypto: "weapi" });
	const result = JSON.stringify(res).replace(/avatarImgId_str/g, "avatarImgIdStr");
	return JSON.parse(result);
}
