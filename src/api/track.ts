import type {
	TrackDetailResponse,
	TrackLyricResponse,
	TrackUrlResponse,
	TopSongResponse,
	BaseApiResponse,
} from "@/types/api";
import { mapTrackPlayableStatus } from "@/utils/common";
import * as db from "@/utils/db/index";
import request, { noCacheParams } from "@/utils/request";
import type * as NCMAPI from "./NCMAPI";
import { useSettingsStore } from "@/store/settings";
import { pinia } from "@/store/pinia";

/**
 * 获取音乐 url
 * 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,
 * !!!未登录状态返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
 * @param {string} id - 音乐的 id，例如 id=405998841,33894312
 */
export function getMP3(id: NCMAPI.song_url[0]["id"]): Promise<TrackUrlResponse> {
	const getBr = () => {
		// 当返回的 quality >= 400000时，就会优先返回 hi-res
		const quality = useSettingsStore(pinia).settings?.musicQuality ?? "320000";
		return quality === "flac" ? "350000" : quality;
	};

	return request({
		url: "/song/url",
		method: "get",
		params: {
			id,
			br: getBr(),
		},
	});
}

/**
 * 获取歌曲详情
 * 说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 , 隔开), 可获得歌曲详情(注意:歌曲封面现在需要通过专辑内容接口获取)
 * @param {string} ids - 音乐 id, 例如 ids=405998841,33894312
 */
export function getTrackDetail(ids: number | string): Promise<TrackDetailResponse> {
	const fetchLatest = () => {
		return request({
			url: "/song/detail",
			method: "get",
			params: {
				ids,
			},
		}).then((data) => {
			data.songs.map((song) => {
				const privilege = data.privileges.find((t) => t.id === song.id);
				db.track.detail.write(song, privilege);
			});
			data.songs = mapTrackPlayableStatus(data.songs, data.privileges);
			return data;
		});
	};
	fetchLatest();

	let idsInArray = [String(ids)];
	if (typeof ids === "string") {
		idsInArray = ids.split(",");
	}

	return db.track.detail.read(idsInArray).then((result) => {
		if (result) {
			result.songs = mapTrackPlayableStatus(result.songs, result.privileges);
		}
		return result ?? fetchLatest();
	});
}

/**
 * 获取歌词
 * 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 * @param {number} id - 音乐 id
 */
export async function getLyric(id: number): Promise<TrackLyricResponse> {
	let result = await db.lyric.read(id);
	if (result) return result;
	result = (await request({
		url: "/lyric",
		method: "get",
		params: { id },
	})) as TrackLyricResponse;
	db.lyric.write(id, result);
	return result;
}

/**
 * 新歌速递
 * 说明 : 调用此接口 , 可获取新歌速递
 * @param {number} type - 地区类型 id, 对应以下: 全部:0 华语:7 欧美:96 日本:8 韩国:16
 */
export function topSong(type: NCMAPI.top_song[0]["type"]): Promise<TopSongResponse> {
	return request({
		url: "/top/song",
		method: "get",
		params: {
			type,
		},
	});
}

/**
 * 喜欢音乐
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * - id - 歌曲 id
 * - like - 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 */
export function likeATrack(params: NCMAPI.like[0]): Promise<BaseApiResponse> {
	return request({
		url: "/like",
		method: "get",
		params: noCacheParams(params),
	});
}

/**
 * 听歌打卡
 * @deprecated 容易被封号，不建议使用
 * 说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据
 * - id - 歌曲 id
 * - sourceid - 歌单或专辑 id
 * - time - 歌曲播放时间,单位为秒
 */
export function scrobble(params: NCMAPI.scrobble[0]): Promise<BaseApiResponse> {
	return request({
		url: "/scrobble",
		method: "get",
		params: noCacheParams(params),
	});
}
