// 核心音乐数据类型定义
export interface Track {
  id: number;
  name: string;
  ar: Artist[];
  al: Album;
  dt: number;
  pop: number;
  st: number;
  rt?: string;
  fee: number;
  v: number;
  crbt?: string;
  cf: string;
  alia: string[];
  ftype: number;
  djId: number;
  copyright: number;
  s_id: number;
  mark: number;
  originCoverType: number;
  single: number;
  noCopyrightRcmd?: any;
  rtype: number;
  rurl?: string;
  mst: number;
  cp: number;
  mv: number;
  publishTime: number;
  tns?: string[];
  pc?: {
    nickname: string;
    uid: number;
    pcid: string;
    cid: string;
    sn: number;
    br: number;
    alg: string;
  };
  // 扩展字段
  matched?: boolean;
  reason?: string;
  privilege?: TrackPrivilege;
  rtUrls?: any[];
  freeTrialPrivilege?: {
    resConsumable: boolean;
    userConsumable: boolean;
  };
  chargeInfoList?: any[];
}

export interface Artist {
  id: number;
  name: string;
  tns?: string[];
  alias?: string[];
  picUrl?: string;
  img1v1Url?: string;
  briefDesc?: string;
  albumSize?: number;
  musicSize?: number;
  mvSize?: number;
  followed?: boolean;
  trans?: string;
  picId?: number;
  img1v1?: number;
  transNames?: string[];
}

export interface Album {
  id: number;
  name: string;
  pic: number;
  picUrl: string;
  tns?: string[];
  pic_str?: string;
  alia?: string[];
  transNames?: string[];
  artist?: Artist;
  artists?: Artist[];
  publishTime?: number;
  size?: number;
  copyrightId?: number;
  status?: number;
  picId?: number;
  mark?: number;
  tags?: string;
  company?: string;
  briefDesc?: string;
  commentThreadId?: string;
  blurPicUrl?: string;
  companyId?: number;
  subType?: string;
  description?: string;
  alias?: string[];
  artists_credits?: any;
  songs?: Track[];
}

export interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string;
  creator: User;
  subscribed: boolean;
  trackCount: number;
  userId: number;
  playCount: number;
  bookCount: number;
  specialType: number;
  officialPlaylistType?: any;
  copywriter?: string;
  description?: string;
  tags?: string[];
  createTime: number;
  updateTime: number;
  subscribedCount: number;
  shareCount: number;
  commentCount: number;
  privacy: number;
  newImported: boolean;
  anonimous: boolean;
  totalDuration: number;
  cloudTrackCount: number;
  highQuality: boolean;
  trackUpdateTime: number;
  trackNumberUpdateTime: number;
  adType: number;
  algTags?: any;
  tracks?: Track[];
  trackIds?: TrackId[];
}

export interface TrackId {
  id: number;
  v: number;
  t: number;
  at: number;
  alg?: string;
  uid?: number;
  rcmdReason?: string;
  sc?: any;
  f?: any;
  sr?: any;
}

export interface User {
  userId: number;
  nickname: string;
  signature?: string;
  description?: string;
  avatarUrl: string;
  backgroundUrl?: string;
  province: number;
  city: number;
  gender: number;
  followeds: number;
  follows: number;
  playlistCount: number;
  playlistBeSubscribedCount: number;
  accountStatus: number;
  vipType: number;
  djStatus: number;
  mutual: boolean;
  followed: boolean;
  remarkName?: string;
  authStatus: number;
  detailDescription?: string;
  experts?: any;
  expertTags?: any;
  djStatusChange?: number;
  vipLogs?: any;
  authority: number;
  anchor: boolean;
  avatarImgId: number;
  backgroundImgId: number;
  userType: number;
  createTime: number;
  userName: string;
  avatarImgIdStr?: string;
  backgroundImgIdStr?: string;
  avatarDetail?: any;
  defaultAvatar: boolean;
}

export interface TrackPrivilege {
  id: number;
  fee: number;
  payed: number;
  st: number;
  pl: number;
  dl: number;
  sp: number;
  cp: number;
  subp: number;
  cs: boolean;
  maxbr: number;
  fl: number;
  toast: boolean;
  flag: number;
  preSell: boolean;
  playMaxbr: number;
  downloadMaxbr: number;
  maxBrLevel: string;
  playMaxBrLevel: string;
  downloadMaxBrLevel: string;
  plLevel: string;
  dlLevel: string;
  flLevel: string;
  rscl: any;
  freeTrialPrivilege: {
    resConsumable: boolean;
    userConsumable: boolean;
    listenType?: any;
  };
  chargeInfoList: any[];
}

export interface MV {
  id: number;
  name: string;
  artistId: number;
  artistName: string;
  briefDesc?: string;
  desc?: string;
  cover: string;
  coverId: number;
  playCount: number;
  subCount: number;
  shareCount: number;
  commentCount: number;
  duration: number;
  nType: number;
  publishTime: string;
  brs: MVBr[];
  artists: Artist[];
  commentThreadId: string;
  videoGroup: any[];
}

export interface MVBr {
  size: number;
  br: number;
  point: number;
}

// 播放器相关类型
export interface PlayerState {
  id: number;
  playing: boolean;
  progress: number;
  enabled: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  reversed: boolean;
  volume: number;
  volumeBeforeMuted: number;
  playlist: {
    id: number;
    tracks: Track[];
  };
  currentTrackIndex: number;
  playlistSource: PlaylistSource;
  personalFMTrack: Track | null;
  personalFMLoading: boolean;
  personalFMNextLoading: boolean;
}

export type RepeatMode = 'off' | 'on' | 'one';

export interface PlaylistSource {
  type: 'album' | 'artist' | 'playlist' | 'url' | 'cloudDisk' | 'search';
  id: number | string;
}

// 设置相关类型
export interface Settings {
  lang: string;
  appearance: 'auto' | 'light' | 'dark';
  musicQuality: 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires';
  lyricFontSize: number;
  outputDevice: string;
  showPlaylistsByAppleMusic: boolean;
  enableUnblockNeteaseMusic: boolean;
  unmSource: string[];
  enableReversedMode: boolean;
  nyancatStyle: boolean;
  showLyricsTranslation: boolean;
  lyricsBackground: boolean;
  closeAppOption: 'ask' | 'close' | 'minimize';
  enableDiscordRichPresence: boolean;
  enableGlobalShortcut: boolean;
  showLibraryDefault: boolean;
  subTitleDefault: boolean;
  linuxEnableCustomTitlebar: boolean;
  enabledPlaylistCategories: string[];
  proxyConfig: {
    protocol: string;
    server: string;
    port: number;
  };
  shortcuts: Record<string, string>;
  deviceId: string;
}

// 全局状态类型
export interface GlobalState {
  showLyrics: boolean;
  title: string;
  liked: {
    songs: number[];
    songsWithDetails: Track[];
    playlists: number[];
    albums: number[];
    artists: number[];
    mvs: number[];
    cloudDisk: Track[];
    playHistory: {
      weekData: Track[];
      allData: Track[];
    };
  };
  contextMenu: {
    clickObjectID: number;
    showMenu: boolean;
  };
  modals: {
    addTrackToPlaylistModal: {
      show: boolean;
      selectedTrackID: number;
    };
    newPlaylistModal: {
      show: boolean;
      afterCreateAddTrackID: number;
    };
  };
  dailyTracks: Track[];
  lastfm: Record<string, any>;
  player: PlayerState;
  settings: Settings;
  data: {
    user: User | null;
    loginMode: string | null;
    likedSongPlaylistID: number;
  };
}

// 搜索相关类型
export interface SearchResult {
  songs?: {
    songs: Track[];
    songCount: number;
  };
  albums?: {
    albums: Album[];
    albumCount: number;
  };
  artists?: {
    artists: Artist[];
    artistCount: number;
  };
  playlists?: {
    playlists: Playlist[];
    playlistCount: number;
  };
  mvs?: {
    mvs: MV[];
    mvCount: number;
  };
}

// 歌词类型
export interface LyricLine {
  time: number;
  rawTime: string;
  content: string;
}

export interface Lyric {
  lrc: {
    lyric: string;
  };
  tlyric: {
    lyric: string;
  };
  romalrc?: {
    lyric: string;
  };
  yrc?: {
    lyric: string;
  };
  ytlf?: {
    lyric: string;
  };
  code: number;
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;
  data?: T;
  result?: T;
  [key: string]: any;
}

// 分页类型
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// 事件类型
export interface EventBus {
  'player:progress': number;
  'player:track-change': Track;
  'player:play': void;
  'player:pause': void;
  'player:next': void;
  'player:previous': void;
  'player:repeat-mode-change': RepeatMode;
  'player:shuffle-change': boolean;
  'player:volume-change': number;
  'toast:show': { message: string; type?: 'success' | 'error' | 'warning' | 'info' };
}

// 组件通用Props类型
export interface BaseProps {
  class?: string;
  style?: string | Record<string, any>;
}

// 路由相关类型
export interface RouteQuery {
  [key: string]: string | string[] | undefined;
}

export interface RouteParams {
  [key: string]: string;
}

// 重新导出API类型
export * from './api';