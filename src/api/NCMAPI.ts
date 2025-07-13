export interface RequestBaseConfig { }

export interface MultiPageConfig {
  limit?: string | number
  offset?: string | number
}

export interface ImageUploadConfig {
  imgFile: {
    name: string
    data: string | ArrayBuffer
  }
  imgSize?: number
  imgX?: number
  imgY?: number
}

// export interface APIBaseResponse {
//   code: number
//   cookie: string
//   [index: string]: unknown
// }

// export interface Response<Body = APIBaseResponse> {
//   status: number // The Http Response Code
//   body: Body // API Response body
//   cookie: string[]
// }

export const enum SubAction {
  sub = 1,
  unsub = 0,
}
export const enum AlbumListArea {
  all = 'ALL',
  zh = 'ZH',
  ea = 'EA',
  kr = 'KR',
  jp = 'JP',
}

export const enum ListOrder {
  hot = 'hot',
  new = 'new',
}

export const enum AlbumListStyleArea {
  zh = 'Z_H',
  ea = 'E_A',
  kr = 'KR',
  jp = 'JP',
}


export const enum AlbumSongsaleboardType {
  daily = 'daily',
  week = 'week',
  year = 'year',
  total = 'total',
}

export const enum AlbumSongsaleboardAlbumType {
  album = 0,
  single = 1,
}

export const enum ArtistListArea {
  zh = 'Z_H',
  ea = 'E_A',
  kr = 'KR',
  jp = 'JP',
}

export const enum ArtistArea {
  all = '-1',
  zh = '7',
  ea = '96',
  ja = '8',
  kr = '16',
  other = '0',
}

export const enum ArtistType {
  male = '1',
  female = '2',
  band = '3',
}

export const enum ArtistSongsOrder {
  hot = 'hot',
  time = 'time',
}

export const enum BannerType {
  pc = 0,
  android = 1,
  iphone = 2,
  ipad = 3,
}


export const enum SearchType {
  single = 1,
  album = 10,
  artist = 100,
  playlist = 1000,
  user = 1002,
  mv = 1004,
  lyric = 1006,
  dj = 1009,
  video = 1014,
  complex = 1018,
}



export const enum CommentType {
  song = 0,
  mv = 1,
  playlist = 2,
  album = 3,
  dj = 4,
  video = 5,
  event = 6,
}

export const enum CommentAction {
  add = 1,
  delete = 0,
  reply = 2,
}


export const enum DailySigninType {
  android = 0,
  pc = 1,
}

export type activate_init_profile = [{ nickname: string }, any]

export type album = [{ id: string | number }, any]

export type album_detail = [{ id: string | number }, any]

export type album_detail_dynamic = [{ id: string | number }, any]

export type album_list = [{ area?: AlbumListArea; type: string } & MultiPageConfig, any]
export type album_list_style = [{ area?: AlbumListStyleArea } & MultiPageConfig, any]

export type album_new = [{ area?: AlbumListArea } & MultiPageConfig, any]

export type album_newest = [{}, any]
export type album_songsaleboard = [{
  albumType?: AlbumSongsaleboardAlbumType // 0 为数字专辑,1 为数字单曲
  type?: AlbumSongsaleboardType
  year?: string | number // 年份，默认本年。 type 为 year 时有效
}, any]

export type album_sub = [{ id: string | number, t: SubAction }, any]

export type album_sublist = [MultiPageConfig, any]

export type artist_album = [{ id: string | number } & MultiPageConfig, any]

export type artist_desc = [{ id: string | number }, any]
export type artist_list = [{
  area: ArtistArea
  initial?:
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  type?: ArtistType
} & MultiPageConfig, any]

export type artist_mv = [{ id: string | number } & MultiPageConfig, any]


export type artist_songs = [{
  id: string | number
  order?: ArtistSongsOrder
} & MultiPageConfig, any]

export type artist_sub = [{ id: string | number; t: SubAction }, any]

export type artist_sublist = [MultiPageConfig, any]

export type artist_top_song = [{
  id: string | number
}, any]

export type artists = [{ id: string | number }, any]

export type audio_match = [{
  duration: string | number
  audioFP: string | number
}, any]

export type avatar_upload = [ImageUploadConfig, any]


export type banner = [{ type?: BannerType }, any]

export type batch = [{ [index: string]: unknown }, any]

export type captcha_sent = [{ phone: string; ctcode?: number | string }, any]

export type captcha_verify = [{
  ctcode?: number | string
  phone: number | string
  captcha: string
}, any]

export type cellphone_existence_check = [{
  phone: number | string
  countrycode: number | string
}, any]

export type check_music = [{ id: string | number; br: string | number }, any]


export type cloudsearch = [{
  keywords: string
  type?: SearchType
} & MultiPageConfig, any]

export type comment = [{
  id: string | number
  type: CommentType
  t: CommentAction.delete
  commentId: string | number
}, any]

export type comment_1 = [{
  type: CommentType.event
  t: CommentAction.delete
  threadId: string
  commentId: string | number
}, any]

export type comment_2 = [{
  id: string | number
  type: CommentType
  t: CommentAction.add
  content: string | number
}, any]

export type comment_3 = [{
  type: CommentType.event
  t: CommentAction.add
  threadId: string
  content: string | number
}, any]

export type comment_4 = [{
  id: string | number
  type: CommentType
  t: CommentAction.reply
  content: string | number
  commentId: string | number
}, any]

export type comment_5 = [{
  type: CommentType.event
  t: CommentAction.reply
  threadId: string
  content: string | number
  commentId: string | number
}, any]

export type comment_album = [{
  id: string | number
  before?: string | number
} & MultiPageConfig, any]

export type comment_dj = [{
  id: string | number
  before?: string | number
} & MultiPageConfig, any]

export type comment_event = [{
  threadId: string
  before?: string | number
} & MultiPageConfig, any]

export type comment_floor = [{
  id: string | number
  parentCommentId: string | number
  type: CommentType
  limit?: string | number
  time?: string | number
}, any]

export type comment_hot = [{
  id: string | number
  type: CommentType
  before?: string | number
} & MultiPageConfig, any]

export type comment_hotwall_list = [RequestBaseConfig, any]

export type comment_like = [{
  id: string | number
  type: CommentType
  t: SubAction
  cid: string | number
  threadId?: string
}, any]

export type comment_music = [{
  id: string | number
  before?: string | number
} & MultiPageConfig, any]

export type comment_mv = [{
  id: string | number
  before?: string | number
} & MultiPageConfig, any]

export type comment_playlist = [{
  id: string | number

  before?: string | number
} & MultiPageConfig, any]

export type comment_video = [{
  id: string | number
  before?: string | number
} & MultiPageConfig, any]

export type countries_code_list = [RequestBaseConfig, any]


export type daily_signin = [{ type?: DailySigninType }, any]

export type digitalAlbum_ordering = [{
  payment: string
  id: string | number
  quantity: string
}, any]

export type digitalAlbum_purchased = [MultiPageConfig, any]

export type dj_banner = [{}, any]

export type dj_category_excludehot = [RequestBaseConfig, any]

export type dj_category_recommend = [RequestBaseConfig, any]

export type dj_catelist = [{}, any]

export type dj_detail = [{ rid: string | number }, any]

export type dj_hot = [MultiPageConfig, any]

export type dj_paygift = [MultiPageConfig, any]

export type dj_personalize_recommend = [{ limit?: string | number }, any]

export type dj_program = [{
  rid: string | number
  asc: 'true' | 1 | 'false' | 0
} & MultiPageConfig, any]

export type dj_program_detail = [{ id: string | number }, any]

export type dj_program_toplist = [MultiPageConfig, any]

export type dj_program_toplist_hours = [{ limit?: string | number }, any]

export type dj_radio_hot = [{
  cateId: string | number
} & MultiPageConfig, any]

export type dj_recommend = [{}, any]

/*
  有声书 10001
  知识技能 453050
  商业财经 453051
  人文历史 11
  外语世界 13
  亲子宝贝 14
  创作|翻唱 2001
  音乐故事 2
  3D|电子 10002
  相声曲艺 8
  情感调频 3
  美文读物 6
  脱口秀 5
  广播剧 7
  二次元 3001
  明星做主播 1
  娱乐|影视 4
  科技科学 453052
  校园|教育 4001
  旅途|城市 12
*/

export type dj_recommend_type = [{ type: number }, any]

export type dj_sub = [{ t: SubAction; rid: string | number }, any]

export type dj_sublist = [MultiPageConfig, any]

export type dj_today_perfered = [{ page?: string | number }, any]

export type dj_toplist = [{ type?: ListOrder } & MultiPageConfig, any]

export type dj_toplist_hours = [{ limit?: string | number }, any]

export type dj_toplist_newcomer = [MultiPageConfig, any]

export type dj_toplist_pay = [{ limit?: string | number }, any]

export type dj_toplist_popular = [{ limit?: string | number }, any]

export type event = [{ pagesize?: number; lasttime?: number }, any]

export type event_del = [{ evId: string | number }, any]

export type event_forward = [{
  forwords: string
  evId: string | number
  uid: string | number
}, any]

export type fm_trash = [{ id: string | number; time?: string | number }, any]

export type follow = [{ t: SubAction; id: string | number }, any]

export type history_recommend_songs = [RequestBaseConfig, any]

export type history_recommend_songs_detail = [{ date?: string }, any]

export type homepage_block_page = [{
  refresh?: 'true' | 'false' | boolean
  cursor?: string
}, any]

export type homepage_dragon_ball = [RequestBaseConfig, any]

export type hot_topic = [MultiPageConfig, any]

export type like = [{
  like?: 'true' | 'false' | boolean
  id: string | number
  alg?: string
  time?: string | number
}, any]

export type likelist = [{ uid: string | number }, any]

export type login = [{ email: string; password: string }, any]

export type login_1 = [{ email: string; md5_password: string }, any]

export type login_cellphone = [{
  phone: number | string
  countrycode?: number | string
  password: string
}, any]

export type login_cellphone_1 = [{
  phone: number | string
  countrycode?: number | string
  md5_password: string
}, any]

export type login_cellphone_2 = [{
  phone: number | string
  countrycode?: number | string
  captcha: number | string
}, any]

export type login_refresh = [{}, any]

export type login_status = [{}, any]

export type logout = [{}, any]

export type lyric = [{ id: string | number }, any]

export type lyric_new = [{ id: string | number }, any]

export type msg_comments = [{
  uid: string | number
  before?: string | number
  limit?: string | number
}, any]

export type msg_forwards = [MultiPageConfig, any]

export type msg_notices = [{
  limit?: string | number
  lasttime?: string | number
}, any]

export type msg_private = [MultiPageConfig, any]

export type msg_private_history = [{
  before?: string | number
  limit?: string | number
  uid: string | number
}, any]

export const enum MvArea {
  all = '全部',
  zh = '内地',
  hk = '港台',
  ea = '欧美',
  kr = '韩国',
  jp = '日本',
}

export const enum MvType {
  all = '全部',
  offical = '官方版',
  raw = '原生',
  live = '现场版',
  netease = '网易出品',
}

export const enum MvOrder {
  trend = '上升最快',
  hot = '最热',
  new = '最新',
}

export type mv_all = [{
  area?: MvArea
  type?: MvType
  order?: MvOrder
} & MultiPageConfig, any]

export type mv_detail = [{ mvid?: string | number }, any]

export type mv_detail_info = [{ mvid: string | number }, any]

export type mv_exclusive_rcmd = [MultiPageConfig, any]

export type mv_first = [{ area?: MvArea; limit?: string | number }, any]

export type mv_sub = [{ t: SubAction; mvid: string | number }, any]

export type mv_sublist = [MultiPageConfig, any]

export type mv_url = [{ id?: string | number; r?: string | number }, any]

export type personal_fm = [{}, any]

export type personalized = [{ limit?: string | number }, any]

export type personalized_djprogram = [RequestBaseConfig, any]

export type personalized_mv = [{}, any]

export type personalized_newsong = [{
  area?: string | number
  limit?: string | number
}, any]

export type personalized_privatecontent = [RequestBaseConfig, any]

export type personalized_privatecontent_list = [MultiPageConfig, any]

export type playlist_catlist = [{}, any]

export type playlist_cover_update = [{ id: string } & ImageUploadConfig, any]

export type playlist_create = [{
  name: string
  privacy: 0 | 10
  type?: PlaylistType
}, any]

export type playlist_delete = [{ id: string | number }, any]

export type playlist_desc_update = [{ id: string | number; desc: string }, any]

export type playlist_detail = [{ id: string | number; s?: string | number }, any]

export type playlist_highquality_tags = [RequestBaseConfig, any]

export type playlist_hot = [{}, any]

export type playlist_name_update = [{ id: string | number; name: string }, any]

export type playlist_order_update = [{ ids: string }, any]

export type playlist_subscribe = [{ t: SubAction; id: string | number }, any]

export type playlist_subscribers = [{ id?: string | number } & MultiPageConfig, any]

export type playlist_tags_update = [{ id: string | number; tags: string }, any]

export type playlist_tracks = [{
  op: 'add' | 'del'
  pid: string | number
  tracks: string
}, any]

export type playlist_update = [{
  id: string | number
  name: string
  desc?: string
  tags?: string
}, any]

export type playmode_intelligence_list = [{
  id: string | number
  pid: string | number
  sid?: string | number
  count?: string | number
}, any]

export type program_recommend = [{ type: string } & MultiPageConfig, any]

export type rebind = [{
  captcha: string
  phone: string
  oldcaptcha: string
  ctcode?: number | string
}, any]

export type recommend_resource = [{}, any]

export type recommend_songs = [{}, any]

export type register_cellphone = [{
  captcha: string
  phone: string
  password: string
  nickname: string
}, any]

export type related_allvideo = [{ id: string | number }, any]

export type related_playlist = [{ id: string | number }, any]

export const enum ResourceType {
  mv = 1,
  dj = 4,
  video = 5,
  event = 6,
}
type PlaylistType = 'NROMAL' | 'VIDEO'

export type resource_like = [{
  t: SubAction
  type: ResourceType
  id?: string | number
  threadId?: string
}, any]

export type scrobble = [{
  id: string | number
  sourceid: string | number
  time: string | number
}, any]

export type search = [{
  keywords: string
  type?: SearchType
} & MultiPageConfig, any]

export type search_default = [{}, any]

export type search_hot = [{}, any]

export type search_hot_detail = [{}, any]

export type search_multimatch = [{ type?: number; keywords: string }, any]

export const enum SearchSuggestType {
  mobile = 'mobile',
  web = 'web',
}

export type search_suggest = [{ keywords: string; type?: SearchSuggestType }, any]

export type send_playlist = [{
  playlist: string | number
  msg: string
  user_ids: string
}, any]

export type send_text = [{ msg: string; user_ids: string }, any]

export type setting = [{}, any]

export const enum ShareResourceType {
  song = 'song',
  playlist = 'playlist',
  mv = 'mv',
  djprogram = 'djprogram',
  djradio = 'djradio',
}

export type share_resource = [{
  type?: ShareResourceType
  msg?: string
  id?: string | number
}, any]

export type simi_artist = [{ id: string | number }, any]

export type simi_mv = [{ mvid: string | number }, any]

export type simi_playlist = [{ id: string | number } & MultiPageConfig, any]

export type simi_song = [{ id: string | number } & MultiPageConfig, any]

export type simi_user = [{ id: string | number } & MultiPageConfig, any]

export type song_detail = [{ ids: string }, {
  songs: SongDetail[]
  privileges: unknown[]
  code: number
}]

type SongDetail = {
  name: string
  id: number
  pst: number
  t: number
  ar: SongDetailArtist[]
  alia: string[]
  pop: number
  st: number
  rt: string | null
  fee: SongDetailFee
  v: number
  crbt: string | null
  cf: string
  al: SongDetailAlbum
  dt: number
  h: SongDetailQuality | null
  m: SongDetailQuality | null
  l: SongDetailQuality | null
  sq: SongDetailQuality | null
  hr: SongDetailQuality | null
  a: unknown | null
  cd: string
  no: number
  rtUrl: unknown | null
  ftype: number
  rtUrls: unknown[]
  djId: number
  copyright: SongDetailCopyright
  s_id: number
  mark: number
  originCoverType: SongDetailOriginCoverType
  originSongSimpleData: unknown | null
  tagPicList: unknown | null
  resourceState: boolean
  version: number
  songJumpInfo: unknown | null
  entertainmentTags: unknown | null
  awardTags: unknown | null
  single: number
  noCopyrightRcmd: unknown | null
  mv: number
  rtype: number
  rurl: unknown | null
  mst: number
  cp: number
  publishTime: number
}

type SongDetailArtist = {
  id: number
  name: string
  tns: unknown[]
  alias: unknown[]
}

type SongDetailFee = 0 | 1 | 4 | 8

type SongDetailAlbum = {
  id: number
  name: string
  picUrl: string
  tns: unknown[]
  pic: number
}

type SongDetailQuality = {
  br: number
  fid: number
  size: number
  vd: number
  sr: number
}

type SongDetailCopyright = 0 | 1 | 2

type SongDetailOriginCoverType = 0 | 1 | 2

export type song_order_update = [{ pid: string | number; ids: string }, any]

export type song_url = [{ id: string | number; br?: string | number }, any]

export const enum SoundQualityType {
  standard = 'standard',
  exhigh = 'exhigh',
  lossless = 'lossless',
  hires = 'hires',
  jyeffect = 'jyeffect',
  jymaster = 'jymaster',
  sky = 'sky',
}

export type song_url_v1 = [{ id: string | number; level: SoundQualityType }, any]

export type top_album = [{
  area?: AlbumListArea
  type?: ListOrder
  year?: string
  mouth?: string
} & MultiPageConfig, any]

export type top_artists = [MultiPageConfig, any]

export type top_list = [{ id: string | number }, any]

export type top_mv = [{ area?: MvArea } & MultiPageConfig, any]

export type top_playlist = [{ cat?: string; order?: ListOrder } & MultiPageConfig, any]

export type top_playlist_highquality = [{
  cat?: string
  before?: string | number
  limit?: string | number
}, any]

export const enum TopSongType {
  all = 0,
  zh = 7,
  ea = 96,
  kr = 16,
  ja = 8,
}

export type top_song = [{ type: TopSongType }, any]

export type toplist = [{}, any]

export const enum ToplistArtistType {
  zh = 1,
  ea = 2,
  kr = 3,
  ja = 4,
}

export type toplist_artist = [{ type?: ToplistArtistType }, any]

export type toplist_detail = [{}, any]

export type user_audio = [{ uid: string | number }, any]

export type user_cloud = [MultiPageConfig, any]

export type user_cloud_del = [{ id: string | number }, any]

export type user_cloud_detail = [{ id: string | number }, any]

export type user_detail = [{ uid: string | number }, any]

export type user_dj = [{ uid: string | number } & MultiPageConfig, any]

export type user_event = [{
  lasttime?: string | number
  limit?: string | number
  uid: string | number
}, any]

export type user_followeds = [{
  uid: string | number
  lasttime?: string | number
  limit?: string | number
}, any]

export type user_follows = [{ uid: string | number } & MultiPageConfig, any]

export type user_level = [{}, any]

export type user_playlist = [{ uid: string | number } & MultiPageConfig, any]

export const enum UserRecordType {
  all = 0,
  weekly = 1,
}

export type user_record = [{ uid: string | number; type?: UserRecordType }, any]

export type user_subcount = [{}, any]

export type user_update = [{
  birthday: string
  city: string
  gender: string
  nickname: string
  province: string
  signature: string
}, any]

export type video_category_list = [MultiPageConfig, any]

export type video_detail = [{ id: string }, any]

export type video_detail_info = [{ vid: string }, any]

export type video_group = [{ id: string; offset?: string | number }, any]

export type video_group_list = [{}, any]

export type video_sub = [{ t?: SubAction; id: string }, any]

export type video_timeline_all = [{ offset?: string | number }, any]

export type video_timeline_recommend = [{ offset?: string | number }, any]

export type video_url = [{ id: string | number; res?: number }, any]

export type weblog = [{ data?: { [index: string]: unknown } }, any]

export type playlist_mylike = [{
  time?: number | string
  limit: number | string
}, any]

export type playlist_track_add = [{ pid?: number | string; ids: number | string }, any]

export type playlist_track_delete = [{ pid?: number | string; ids: number | string }, any]

export type comment_new = [{
  type?: number | string
  id: number | string
  pageNo?: number | string
  pageSize?: number | string
  sortType?: number | string
}, any]

export type calendar = [{
  startTime?: number | string
  endTime: number | string
}, any]

export type playlist_video_recent = [RequestBaseConfig, any]

export type user_binding = [{ uid?: number | string }, any]

export type user_replacephone = [{
  phone: number | string
  captcha: number | string
  oldcaptcha: number | string
  countrycode?: number | string
}, any]

export type user_safe = [{}, any]

export type dj_subscriber = [{
  id: number | string
  limit?: number | string
  time?: number | string
}, any]

export type user_account = [{}, any]

export type yunbei = [{}, any]

export type yunbei_info = [{}, any]

export type yunbei_sign = [{}, any]

export type yunbei_receipt = [MultiPageConfig, any]

export type yunbei_expense = [MultiPageConfig, any]

export type yunbei_tasks = [{}, any]

export type yunbei_today = [{}, any]

export type yunbei_tasks_todo = [{}, any]

export type yunbei_task_finish = [{
  userTaskId: number | string
  depositCode?: number | string
}, any]

export type msg_recentcontact = [{}, any]

export type hug_comment = [{
  uid: number | string
  cid: number | string
  sid: number | string
}, any]

export type comment_hug_list = [{
  page: number | string
  cursor: number | string
  idCursor: number | string
  pageSize?: number | string
}, any]

export type topic_sublist = [MultiPageConfig, any]

export type topic_sublist_1 = [MultiPageConfig, any]

export type artist_new_mv = [{
  limit?: number | string
  startTimestamp?: number | string
}, any]

export type artist_new_song = [{
  limit?: number | string
  startTimestamp?: number | string
}, any]

export type artist_detail = [{
  id: number | string
}, any]

export type cloud = [{
  songFile: {
    name: string
    data: ArrayBuffer
  }
}, any]

export type topic_detail = [{
  actid?: number | string
}, any]

export type topic_detail_event_hot = [{
  actid?: number | string
}, any]

export type login_qr_key = [{}, any]

export type login_qr_create = [{
  key?: number | string
  qrimg?: boolean | string
}, any]

export type login_qr_check = [{
  key?: number | string
}, any]

export type playlist_detail_dynamic = [{ id: string | number }, any]

export type user_bindingcellphone = [{
  phone: number | string
  captcha: number | string
  countrycode?: number | string
  password?: string
}, any]

export type listen_together_status = [RequestBaseConfig, any]

export type user_comment_history = [{
  limit?: number | string
  uid: number | string
  time?: number | string
}, any]

export type cloud_match = [{
  uid: number | string
  sid: number | string
  asid: number | string
}, any]

export type yunbei_rcmd_song = [{
  id: number | string
  reason?: number | string
}, any]

export type yunbei_rcmd_song_history = [{
  size?: number | string
  cursor?: number | string
}, any]

export type song_purchased = [MultiPageConfig, any]

export type mlog_url = [{
  id?: number | string
  res?: number | string
}, any]

export type mlog_to_video = [{
  id?: number | string
}, any]

export type vip_growthpoint = [{}, any]

export type vip_growthpoint_details = [MultiPageConfig, any]

export type vip_tasks = [{}, any]

export type vip_growthpoint_get = [{
  ids?: number | string
}, any]

export type artist_fans = [{ id: number | string } & MultiPageConfig, any]

export type digitalAlbum_detail = [{
  id: number | string
}, any]

export type digitalAlbum_sales = [{
  ids: number | string
}, any]

export type musician_data_overview = [RequestBaseConfig, any]

export type musician_play_trend = [{
  startTime: number | string
  endTime: number | string
}, any]

export type musician_tasks = [{}, any]

export type musician_cloudbean = [{}, any]

export type musician_cloudbean_obtain = [{
  id: number | string
  period: number | string
}, any]

export type vip_info = [{
  uid?: number | string
}, any]

export type vip_info_v2 = [{
  uid?: number | string
}, any]

export type musician_sign = [{}, any]

export type song_download_url = [{
  id: number | string
  br?: number | string
}, any]

export type playlist_track_all = [{
  id: number | string
  s?: number | string
} & MultiPageConfig, any]

export type artist_video = [{
  id: number | string
  size?: number | string
  cursor?: number | string
  order?: number | string
}, any]

export type sign_happy_info = [{}, any]

export type record_recent_song = [{
  limit?: number | string
}, any]

export type record_recent_video = [{
  limit?: number | string
}, any]

export type record_recent_voice = [{
  limit?: number | string
}, any]

export type record_recent_playlist = [{
  limit?: number | string
}, any]

export type record_recent_album = [{
  limit?: number | string
}, any]

export type record_recent_dj = [{
  limit?: number | string
}, any]

export type signin_progress = [{
  moduleId?: string
}, any]

export type nickname_check = [{
  nickname: string
}, any]

export type musician_tasks_new = [{}, any]

export type playlist_update_playcount = [{
  id?: number | string
}, any]

export type vip_timemachine = [{
  startTime?: number | string
  endTime?: number | string
  limit?: number | string
}, any]

export type song_wiki_summary = [{
  id: number | string
}, any]

export type sheet_list = [{
  id: number | string
  abTest?: 'a' | 'b'
}, any]

export type sheet_preview = [{
  id: number | string
}, any]

export type style_list = [{}, any]

export type style_preference = [{}, any]

export type style_detail = [{
  tagId: number | string
}, any]

export type style_song = [{
  tagId: number | string
  size?: number | string
  cursor?: number | string
  sort?: number | string
}, any]

export type style_album = [{
  tagId: number | string
  size?: number | string
  cursor?: number | string
  sort?: number | string
}, any]

export type style_playlist = [{
  tagId: number | string
  size?: number | string
  cursor?: number | string
}, any]

export type style_artist = [{
  tagId: number | string
  size?: number | string
  cursor?: number | string
}, any]

export type pl_count = [{}, any]

export type get_userids = [{
  nicknames: string
}, any]

export type voicelist_list_search = [{
  limit?: string | number
  offset?: string | number
  name?: string
  displayStatus?: string
  type?: string
  voiceFeeType?: string | number
  radioId?: string
}, any]

export type voice_delete = [{
  ids: number | string
}, any]

export type djRadio_top = [{
  djRadioId?: number | string
  sortIndex?: number | string
  dataGapDays?: number | string
  dataType?: number | string
}, any]

export type voice_lyric = [{
  id: number | string
}, any]