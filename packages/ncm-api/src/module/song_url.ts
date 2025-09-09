import request from "../util/request";
import UNM from "@unblockneteasemusic/rust-napi";
import { Buffer } from "node:buffer";
import type { TrackUrlResponse } from "../types";

let executor: UNM.Executor;

export async function unm(song: UNM.Song, ctx: UNM.Context = {}) {
	executor ??= new UNM.Executor();
	const searchResult = await executor.search(executor.list(), song, ctx);

	const songInfo = await executor.retrieve(searchResult, ctx);
	if (songInfo.source === "bilibili") {
		const response = await fetch(songInfo.url, {
			method: "GET",
			headers: {
				Referer: "https://www.bilibili.com/",
				"User-Agent": "okhttp/3.4.1",
			},
		});
		const url = `data:application/octet-stream;base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
		return { ...songInfo, url };
	}
	return songInfo;
}

/**
 * ### 获取音乐 url
 *
 * 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,未登录状态或者非会员返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
 *
 * 遇到 403 错误时，请在 head 标签内加入 `<meta name="referrer" content="no-referrer">`
 *
 * **必选参数 :** `id` : 音乐 id
 *
 * **可选参数 :** `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推
 *
 * **接口地址 :** `/song/url`
 *
 * **调用例子 :** `/song/url?id=33894312` `/song/url?id=405998841,33894312`
 *
 */
export default async function song_url(query: { id: string | number; br?: string | number }) {
	const ids = String(query.id).split(",");
	const data = {
		ids: JSON.stringify(ids),
		br: parseInt(String(query.br || 999000)),
	};
	const res = await request<TrackUrlResponse>(`/api/song/enhance/player/url`, data, "eapi");

	res.body.data = res.body.data.sort(
		(a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)),
	);

	return res;
}

song_url.unm = unm;
