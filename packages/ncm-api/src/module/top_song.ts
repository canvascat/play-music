import type { TopSongType } from "../types/const";
import type { TopSongResponse } from "../types";

import { request } from "../util/request";

/**
 * ### 新歌速递
 *
 * 说明 : 调用此接口 , 可获取新歌速递
 *
 * **必选参数 :**
 *
 * `type`: 地区类型 id,对应以下:
 *
 * ```
 * 全部:0
 *
 * 华语:7
 *
 * 欧美:96
 *
 * 日本:8
 *
 * 韩国:16
 * ```
 *
 * **接口地址 :** `/top/song`
 *
 * **调用例子 :** `/top/song?type=96`
 *
 */
export default function top_song(query: { type: TopSongType }) {
	const data = {
		areaId: query.type || 0, // 全部:0 华语:7 欧美:96 日本:8 韩国:16
		// limit: query.limit || 100,
		// offset: query.offset || 0,
		total: true,
	};
	return request<TopSongResponse>(`/api/v1/discovery/new/songs`, data);
}
