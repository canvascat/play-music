import type { ToplistArtistType } from "@/api/NCMAPI";
import type {
	Album,
	Artist,
	CloudDiskTrack,
	Lyric,
	MV,
	PaginationParams,
	Playlist,
	PlaylistCategory,
	Track,
	TrackPrivilege,
	TrackUrl,
	User,
} from "./core";

// API响应基础结构
export interface BaseApiResponse {
	code: number;
	message?: string;
	msg?: string;
}

export interface ApiResponse<T = any> extends BaseApiResponse {
	data?: T;
	result?: T;
	[key: string]: any;
}

// 用户相关API响应
export interface UserDetailResponse extends BaseApiResponse {
	profile: User;
	level: number;
	listenSongs: number;
	mobileSign: boolean;
	pcSign: boolean;
	createTime: number;
	createDays: number;
	peopleCanSeeMyPlayRecord: boolean;
}

export interface UserAccountResponse extends BaseApiResponse {
	profile: User;
	account: {
		id: number;
		userName: string;
		type: number;
		status: number;
		whitelistAuthority: number;
		createTime: number;
		tokenVersion: number;
		ban: number;
		baoyueVersion: number;
		donateVersion: number;
		vipType: number;
		anonimousUser: boolean;
		uninitialized: boolean;
	};
}

export interface UserPlaylistResponse extends BaseApiResponse {
	version: string;
	more: boolean;
	playlist: Playlist[];
}

interface UserPlayHistory {
	playCount: number;
	score: number;
	song: Track;
}

export interface UserPlayHistoryResponse extends BaseApiResponse {
	weekData?: UserPlayHistory[];
	allData?: UserPlayHistory[];
}

export interface LikedSongsResponse extends BaseApiResponse {
	ids: number[];
}

export interface LikedAlbumsResponse extends BaseApiResponse {
	data: Album[];
	count: number;
	hasMore: boolean;
}

export interface LikedArtistsResponse extends BaseApiResponse {
	data: Artist[];
	count: number;
	hasMore: boolean;
}

export interface LikedMVsResponse extends BaseApiResponse {
	data: MV[];
	count: number;
	hasMore: boolean;
}

export interface CloudDiskResponse extends BaseApiResponse {
	data: CloudDiskTrack[];
	count: number;
	size: string;
	maxSize: string;
	upgradeSign: number;
	hasMore: boolean;
}

// 歌曲相关API响应
export interface TrackDetailResponse extends BaseApiResponse {
	songs: Track[];
	privileges: TrackPrivilege[];
}

export interface TrackLyricResponse extends BaseApiResponse, Lyric {}

/**
 * 歌曲URL响应类型
 * 包含歌曲的播放链接、音质、文件大小等信息
 */
export interface TrackUrlResponse extends BaseApiResponse {
	data: TrackUrl[];
}

export interface TopSongResponse extends BaseApiResponse {
	data: Track[];
}

// 歌单相关API响应
export interface PlaylistDetailResponse extends BaseApiResponse {
	playlist: Playlist;
	privileges: any[];
}

export interface PlaylistTracksResponse extends BaseApiResponse {
	songs: Track[];
	privileges: any[];
}

/**
 * 歌单分类响应类型
 * 包含歌单分类的完整信息，包括全部歌单、子分类和分类映射
 */
export interface PlaylistCatResponse extends BaseApiResponse {
	/** 全部歌单信息 */
	all: PlaylistCategory;
	/** 子分类列表 */
	sub: PlaylistCategory[];
	/** 分类映射表 */
	categories: Record<string, string>;
}

export interface TopPlaylistResponse extends BaseApiResponse {
	playlists: Playlist[];
	total: number;
	more: boolean;
	// cat: string;
}

// 专辑相关API响应
export interface AlbumDetailResponse extends BaseApiResponse {
	album: Album;
	songs: Track[];
}
export interface AlbumDetailDynamicResponse extends BaseApiResponse {
	onSale: boolean;
	albumGameInfo: any;
	commentCount: number;
	likedCount: number;
	shareCount: number;
	isSub: boolean;
	subTime: number;
	subCount: number;
}

export interface NewAlbumResponse extends BaseApiResponse {
	albums: Album[];
	total: number;
}

// 歌手相关API响应
export interface ArtistDetailResponse extends BaseApiResponse {
	artist: Artist;
	hotSongs: Track[];
	more: boolean;
}

export interface ArtistAlbumResponse extends BaseApiResponse {
	artist: Artist;
	hotAlbums: Album[];
	more: boolean;
}

export interface ArtistMVResponse extends BaseApiResponse {
	mvs: MV[];
	hasMore: boolean;
}

export interface TopArtistResponse extends BaseApiResponse {
	list: {
		artists: Artist[];
		type: ToplistArtistType;
	};
}

export interface SimilarArtistResponse extends BaseApiResponse {
	artists: Artist[];
}

// 搜索相关API响应
export interface SearchResponse extends BaseApiResponse {
	result: {
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
		userprofiles?: {
			userprofiles: User[];
			userprofileCount: number;
		};
	};
}

export interface SearchSuggestResponse extends BaseApiResponse {
	result: {
		albums?: Album[];
		artists?: Artist[];
		songs?: Track[];
		playlists?: Playlist[];
		order: string[];
	};
}

// MV相关API响应
export interface MVDetailResponse extends BaseApiResponse {
	data: MV & {
		desc: string;
		videoGroup: any[];
		relatdVideo: any[];
	};
}

export interface MVUrlResponse extends BaseApiResponse {
	data: {
		id: number;
		url: string;
		r: number;
		size: number;
		md5: string;
		code: number;
		expi: number;
		fee: number;
		mvFee: number;
		st: number;
		promotionVo: any;
		msg: string;
	};
}

// 个人FM相关API响应
export interface PersonalFMResponse extends BaseApiResponse {
	data: Track[];
	popAdjust: boolean;
}

// 推荐相关API响应
export interface DailyRecommendResponse extends BaseApiResponse {
	recommend: Track[];
}

export interface RecommendPlaylistResponse extends BaseApiResponse {
	result: Playlist[];
}

export interface RecommendResourceResponse extends BaseApiResponse {
	recommend: Playlist[];
}

// 评论相关API响应
export interface CommentResponse extends BaseApiResponse {
	comments: Array<{
		user: User;
		beReplied: any[];
		pendantData: any;
		showFloorComment: any;
		status: number;
		commentId: number;
		content: string;
		contentResource: any;
		time: number;
		likedCount: number;
		expressionUrl: any;
		commentLocationType: number;
		parentCommentId: number;
		decoration: any;
		repliedMark: any;
		grade: any;
		liked: boolean;
		ipLocation: {
			ip: any;
			location: string;
			userId: any;
		};
	}>;
	hotComments?: Array<any>;
	total: number;
	more: boolean;
	moreHot: boolean;
	topComments: Array<any>;
	cursor: string;
}

// 登录相关API响应
export interface LoginStatusResponse extends BaseApiResponse {
	data: {
		profile: User | null;
		account: any;
		token: string;
	};
}

export interface QRKeyResponse extends BaseApiResponse {
	data: {
		code: number;
		unikey: string;
	};
}

export interface QRCreateResponse extends BaseApiResponse {
	data: {
		qrurl: string;
		qrimg: string;
	};
}

export interface QRCheckResponse extends BaseApiResponse {
	code: number;
	message: string;
	cookie?: string;
}

// 榜单相关API响应
export interface ToplistResponse extends BaseApiResponse {
	list: Playlist[];
}

// 通用分页查询参数
export interface PaginatedQuery extends PaginationParams {
	offset?: number;
	limit?: number;
}

// 搜索查询参数
export interface SearchQuery extends PaginatedQuery {
	keywords: string;
	type?: number;
}
