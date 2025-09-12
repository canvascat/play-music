import request from "../util/request";

/**
 * ### 获取 mv 数据
 *
 * 说明 : 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应
 * MV 数据 , 数据包含 mv 名字 , 歌手 , 发布时间 , mv 视频地址等数据 , 其中 mv 视频
 * 网易做了防盗链处理 , 可能不能直接播放 , 需要播放的话需要调用 ' mv 地址' 接口
 *
 * **必选参数 :** `mvid`: mv 的 id
 *
 * **接口地址 :** `/mv/detail`
 *
 * **调用例子 :** `/mv/detail?mvid=5436712`
 */
export default function mv_detail(params: { mvid?: string | number }) {
	const { mvid } = params;
	const data = { id: mvid };
	return request(`/api/v1/mv/detail`, { data, crypto: "weapi" });
}
