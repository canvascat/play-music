import type {
	AlbumDetailDynamicResponse,
	AlbumDetailResponse,
	LikedAlbumsResponse,
	NewAlbumResponse,
} from "ncm-api/types";
import { mapTrackPlayableStatus } from "@/utils/common";
import * as db from "@/utils/db/index";
import request, { noCacheParams } from "@/utils/request";
import type * as NCMAPI from "./NCMAPI";

/**
 * 获取专辑内容
 * 说明 : 调用此接口 , 传入专辑 id, 可获得专辑内容
 */
export async function getAlbum(id: number): Promise<AlbumDetailResponse> {
	let result = await db.album.read(id);
	if (result) return result;
	result = await request<AlbumDetailResponse>({
		url: "/album",
		method: "get",
		params: { id },
	});

	result.songs = mapTrackPlayableStatus(result.songs);
	db.album.write(id, result);
	return result;
}

/**
 * 全部新碟
 * 说明 : 登录后调用此接口 ,可获取全部新碟
 * - limit - 返回数量 , 默认为 30
 * - offset - 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * - area - ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
 */
export function newAlbums(params: NCMAPI.album_new[0]): Promise<NewAlbumResponse> {
	return request({
		url: "/album/new",
		method: "get",
		params,
	});
}

/**
 * 专辑动态信息
 * 说明 : 调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数
 * - id - 专辑id
 * @param {number} id
 */
export function albumDynamicDetail(
	id: NCMAPI.album_detail_dynamic[0]["id"],
): Promise<AlbumDetailDynamicResponse> {
	return request({
		url: "/album/detail/dynamic",
		method: "get",
		params: noCacheParams({ id }),
	});
}

/**
 * 收藏/取消收藏专辑
 * 说明 : 调用此接口,可收藏/取消收藏专辑
 * - id - 返专辑 id
 * - t - 1 为收藏,其他为取消收藏
 */
export function likeAAlbum(params: NCMAPI.album_sub[0]): Promise<LikedAlbumsResponse> {
	return request({
		url: "/album/sub",
		method: "post",
		params,
	});
}
