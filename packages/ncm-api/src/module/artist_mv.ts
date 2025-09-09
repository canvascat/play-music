import type { MultiPageConfig } from "../types/common";
import request from "../util/request";

/**
 * ### 获取歌手 mv
 *
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手 mv 信息 , 具体 mv 播放地址可调
 * 用`/mv`传入此接口获得的 mvid 来拿到 , 如 :
 * `/artist/mv?id=6452`,`/mv?mvid=5461064`
 *
 * **必选参数 :** `id`: 歌手 id, 可由搜索接口获得
 *
 * **接口地址 :** `/artist/mv`
 *
 * **调用例子 :** `/artist/mv?id=6452`
 *
 */
export default function artist_mv(params: { id: string | number } & MultiPageConfig) {
	const { id, limit, offset } = params;
	const data = { artistId: id, limit, offset, total: true };
	return request(`/api/artist/mvs`, data);
}
