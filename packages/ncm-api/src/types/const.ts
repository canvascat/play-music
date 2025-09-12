type ConstValue<T> = T[keyof T];

export const SubAction = {
	sub: 1,
	unsub: 0,
} as const;

export const AlbumListArea = {
	all: "ALL",
	zh: "ZH",
	ea: "EA",
	kr: "KR",
	jp: "JP",
} as const;

export const ListOrder = {
	hot: "hot",
	new: "new",
} as const;

export const AlbumListStyleArea = {
	zh: "Z_H",
	ea: "E_A",
	kr: "KR",
	jp: "JP",
} as const;

export const AlbumSongsaleboardType = {
	daily: "daily",
	week: "week",
	year: "year",
	total: "total",
} as const;

export const AlbumSongsaleboardAlbumType = {
	album: 0,
	single: 1,
} as const;

export const ArtistListArea = {
	zh: "Z_H",
	ea: "E_A",
	kr: "KR",
	jp: "JP",
} as const;

export const ArtistArea = {
	all: "-1",
	zh: "7",
	ea: "96",
	ja: "8",
	kr: "16",
	other: "0",
} as const;

export const ArtistType = {
	male: "1",
	female: "2",
	band: "3",
} as const;

export const ArtistSongsOrder = {
	hot: "hot",
	time: "time",
} as const;

export const BannerType = {
	pc: 0,
	android: 1,
	iphone: 2,
	ipad: 3,
} as const;

export const SearchType = {
	single: 1,
	album: 10,
	artist: 100,
	playlist: 1000,
	user: 1002,
	mv: 1004,
	lyric: 1006,
	dj: 1009,
	video: 1014,
	complex: 1018,
} as const;

export const CommentType = {
	song: 0,
	mv: 1,
	playlist: 2,
	album: 3,
	dj: 4,
	video: 5,
	event: 6,
} as const;

export const CommentAction = {
	add: 1,
	delete: 0,
	reply: 2,
} as const;

export const DailySigninType = {
	android: 0,
	pc: 1,
} as const;

export const MvArea = {
	all: "全部",
	zh: "内地",
	hk: "港台",
	ea: "欧美",
	kr: "韩国",
	jp: "日本",
} as const;

export const MvType = {
	all: "全部",
	offical: "官方版",
	raw: "原生",
	live: "现场版",
	netease: "网易出品",
} as const;

export const MvOrder = {
	trend: "上升最快",
	hot: "最热",
	new: "最新",
} as const;

export const ResourceType = {
	mv: 1,
	dj: 4,
	video: 5,
	event: 6,
} as const;

export const SearchSuggestType = {
	mobile: "mobile",
	web: "web",
} as const;

export const ShareResourceType = {
	song: "song",
	playlist: "playlist",
	mv: "mv",
	djprogram: "djprogram",
	djradio: "djradio",
} as const;

export const SoundQualityType = {
	standard: "standard",
	exhigh: "exhigh",
	lossless: "lossless",
	hires: "hires",
	jyeffect: "jyeffect",
	jymaster: "jymaster",
	sky: "sky",
} as const;

export const TopSongType = {
	all: 0,
	zh: 7,
	ea: 96,
	kr: 16,
	ja: 8,
} as const;

export const ToplistArtistType = {
	zh: 1,
	ea: 2,
	kr: 3,
	ja: 4,
} as const;

export const UserRecordType = {
	all: 0,
	weekly: 1,
} as const;

export const PlaylistType = {
	NROMAL: "NROMAL",
	VIDEO: "VIDEO",
	SHARED: "SHARED",
} as const;

export type SubAction = ConstValue<typeof SubAction>;
export type AlbumListArea = ConstValue<typeof AlbumListArea>;
export type ListOrder = ConstValue<typeof ListOrder>;
export type AlbumListStyleArea = ConstValue<typeof AlbumListStyleArea>;
export type AlbumSongsaleboardType = ConstValue<typeof AlbumSongsaleboardType>;
export type AlbumSongsaleboardAlbumType = ConstValue<typeof AlbumSongsaleboardAlbumType>;
export type ArtistListArea = ConstValue<typeof ArtistListArea>;
export type ArtistArea = ConstValue<typeof ArtistArea>;
export type ArtistType = ConstValue<typeof ArtistType>;
export type ArtistSongsOrder = ConstValue<typeof ArtistSongsOrder>;
export type BannerType = ConstValue<typeof BannerType>;
export type SearchType = ConstValue<typeof SearchType>;
export type CommentType = ConstValue<typeof CommentType>;
export type CommentAction = ConstValue<typeof CommentAction>;
export type DailySigninType = ConstValue<typeof DailySigninType>;
export type MvArea = ConstValue<typeof MvArea>;
export type MvType = ConstValue<typeof MvType>;
export type MvOrder = ConstValue<typeof MvOrder>;
export type ResourceType = ConstValue<typeof ResourceType>;
export type SearchSuggestType = ConstValue<typeof SearchSuggestType>;
export type ShareResourceType = ConstValue<typeof ShareResourceType>;
export type SoundQualityType = ConstValue<typeof SoundQualityType>;
export type TopSongType = ConstValue<typeof TopSongType>;
export type ToplistArtistType = ConstValue<typeof ToplistArtistType>;
export type UserRecordType = ConstValue<typeof UserRecordType>;
export type PlaylistType = ConstValue<typeof PlaylistType>;
