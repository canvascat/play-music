import request, { noCacheParams } from '@/utils/request';
import * as NCMAPI from './NCMAPI';
import type { UserAccountResponse, UserDetailResponse, UserPlaylistResponse } from '@/types';
import type { CloudDiskResponse, UserPlayHistoryResponse } from '@/types/api';
import type {  LikedAlbumsResponse, LikedMVsResponse, LikedSongsResponse } from '@/types/api';
import type { LikedArtistsResponse } from '@/types/api';

/**
 * 获取用户详情
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情
 * - uid : 用户 id 
 */
export function userDetail(uid: NCMAPI.user_detail[0]['uid']): Promise<UserDetailResponse> {
  return request({
    url: '/user/detail',
    method: 'get',
    params: noCacheParams({ uid }),
  });
}

/**
 * 获取账号详情
 * 说明 : 登录后调用此接口 ,可获取用户账号信息
 */
export function userAccount(): Promise<UserAccountResponse> {
  return request({
    url: '/user/account',
    method: 'get',
    params: noCacheParams({}),
  });
}

/**
 * 获取用户歌单
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单
 * - uid : 用户 id
 * - limit : 返回数量 , 默认为 30
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0 
 */
export function userPlaylist(params: NCMAPI.user_playlist[0]): Promise<UserPlaylistResponse> {
  return request({
    url: '/user/playlist',
    method: 'get',
    params,
  });
}

/**
 * 获取用户播放记录
 * 说明 : 登录后调用此接口 , 传入用户 id, 可获取用户播放记录
 * - uid : 用户 id
 * - type : type=1 时只返回 weekData, type=0 时返回 allData 
 */
export function userPlayHistory(params: NCMAPI.user_record[0]): Promise<UserPlayHistoryResponse> {
  return request({
    url: '/user/record',
    method: 'get',
    params,
  });
}

/**
 * 喜欢音乐列表（需要登录）
 * 说明 : 调用此接口 , 传入用户 id, 可获取已喜欢音乐id列表(id数组)
 * - uid: 用户 id
 * @param {number} uid
 */
export function userLikedSongsIDs(uid: NCMAPI.likelist[0]['uid']): Promise<LikedSongsResponse> {
  return request({
    url: '/likelist',
    method: 'get',
    params: noCacheParams({ uid }),
  });
}

/**
 * 每日签到
 * @deprecated  - 容易被封号，不建议使用
 * 说明 : 调用此接口可签到获取积分
 * -  type: 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到
 */
export function dailySignin(type: NCMAPI.daily_signin[0]['type'] = 0) {
  return request({
    url: '/daily_signin',
    method: 'post',
    params: noCacheParams({ type }),
  });
}

/**
 * 获取收藏的专辑（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的专辑
 * - limit : 返回数量 , 默认为 25
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*25, 其中 25 为 limit 的值 , 默认为 0
 */
export function likedAlbums(params: NCMAPI.album_sublist[0]): Promise<LikedAlbumsResponse> {
  return request({
    url: '/album/sublist',
    method: 'get',
    params: noCacheParams(params),
  });
}

/**
 * 获取收藏的歌手（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的歌手
 */
export function likedArtists(params: NCMAPI.artist_sublist[0]): Promise<LikedArtistsResponse> {
  return request({
    url: '/artist/sublist',
    method: 'get',
    params: noCacheParams(params),
  });
}

/**
 * 获取收藏的MV（需要登录）
 * 说明 : 调用此接口可获取到用户收藏的MV
 */
export function likedMVs(params: NCMAPI.mv_sublist[0]): Promise<LikedMVsResponse> {
  return request({
    url: '/mv/sublist',
    method: 'get',
    params: noCacheParams(params),
  });
}

/**
 * 上传歌曲到云盘（需要登录）
 */
export function uploadSong(file: File)  {
  let formData = new FormData();
  formData.append('songFile', file);
  return request({
    url: '/cloud',
    method: 'post',
    params: noCacheParams({}),
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 200000,
  }).catch(error => {
    alert(`上传失败，Error: ${error}`);
  });
}

/**
 * 获取云盘歌曲（需要登录）
 * 说明 : 登录后调用此接口 , 可获取云盘数据 , 获取的数据没有对应 url, 需要再调用一 次 /song/url 获取 url
 * - limit : 返回数量 , 默认为 200
 * - offset : 偏移数量，用于分页 , 如 :( 页数 -1)*200, 其中 200 为 limit 的值 , 默认为 0 
 */
export function cloudDisk(params: NCMAPI.user_cloud[0]): Promise<CloudDiskResponse> {
  return request({
    url: '/user/cloud',
    method: 'get',
    params: noCacheParams(params),
  });
}

/**
 * 获取云盘歌曲详情（需要登录）
 */
export function cloudDiskTrackDetail(id: NCMAPI.user_cloud_detail[0]['id'])  {
  return request({
    url: '/user/cloud/detail',
    method: 'get',
    params: noCacheParams({ id }),
  });
}

/**
 * 删除云盘歌曲（需要登录） 
 */
export function cloudDiskTrackDelete(id: NCMAPI.user_cloud_del[0]['id']) {
  return request({
    url: '/user/cloud/del',
    method: 'get',
    params: noCacheParams({ id }),
  });
}
