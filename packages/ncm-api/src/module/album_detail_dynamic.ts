import request from "../util/request";

/**
 * ### 专辑动态信息
 *
 * 说明 : 调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数
 *
 * **必选参数 :** `id`: 专辑 id
 *
 * **接口地址 :** `/album/detail/dynamic`
 *
 * **调用例子 :** `/album/detail/dynamic?id=32311`
 *
 */
export default function album_detail_dynamic(params: { id: string | number }) {
	return request(`/api/album/detail/dynamic`, params);
}
