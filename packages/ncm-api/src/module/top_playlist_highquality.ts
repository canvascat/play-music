import request from "../util/request";

/**
 * ### 获取精品歌单
 *
 * 说明 : 调用此接口 , 可获取精品歌单
 *
 * **可选参数 :** `cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
 * "全部",可从精品歌单标签列表接口获取(`/playlist/highquality/tags`)
 *
 * `limit`: 取出歌单数量 , 默认为 50
 *
 * `before`: 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据
 *
 * **接口地址 :** `/top/playlist/highquality`
 *
 * **调用例子 :** `/top/playlist/highquality?before=1503639064232&limit=3`
 *
 */
export default function top_playlist_highquality(query: {
	cat?: string;
	before?: string | number;
	limit?: string | number;
}) {
	const { cat = "全部", before = 0, limit = 50 } = query;
	const data = { cat, limit, lasttime: before, total: true };
	return request(`/api/playlist/highquality/list`, { data, crypto: "weapi" });
}
