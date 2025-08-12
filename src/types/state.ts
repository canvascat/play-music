import type Player from "@/utils/Player";
import type { Album, Artist, CloudDiskTrack, MV, Playlist, Track } from "./core";
import type { AlbumListArea } from "@/api/NCMAPI";
import type { Shortcut } from "@/utils/shortcuts";

// 播放器相关类型
export interface PlayerState extends Player {
	playing: boolean;
	progress: number;
	enabled: boolean;
	shuffle: boolean;
	repeatMode: RepeatMode;
	reversed: boolean;
	volume: number;
	playlistSource: PlaylistSource;
	personalFMTrack: Track | undefined;
}

export type RepeatMode = "off" | "on" | "one";

export interface PlaylistSource {
	type: "album" | "artist" | "playlist" | "url" | "cloudDisk" | "search";
	id: number | string;
}

// 设置相关类型
export interface Settings {
	lang: string;
	appearance: "auto" | "light" | "dark";
	musicQuality: string; // "standard" | "higher" | "exhigh" | "lossless" | "flac" | "hires";
	lyricFontSize: number;
	outputDevice: string;
	showPlaylistsByAppleMusic?: boolean;
	enableUnblockNeteaseMusic?: boolean;
	unmSource?: string;
	enableReversedMode?: boolean;
	showLyricsTranslation?: boolean;
	lyricsBackground?: boolean | "blur" | "dynamic";
	closeAppOption?: "ask" | "close" | "minimize";
	enableDiscordRichPresence?: boolean;
	enableGlobalShortcut?: boolean;
	showLibraryDefault?: boolean;
	subTitleDefault?: boolean;
	linuxEnableCustomTitlebar?: boolean;
	enabledPlaylistCategories: string[];
	proxyConfig?: {
		protocol?: string;
		server?: string;
		port?: number;
	};
	shortcuts: Shortcut[];
	deviceId?: string;
	cacheLimit?: number;
	// 新增的播放器相关设置
	automaticallyCacheSongs?: boolean;
	unmEnableFlac?: boolean;
	unmProxyUri?: string;
	unmSearchMode?: string;
	unmJooxCookie?: string;
	unmQQCookie?: string;
	unmYtDlExe?: string;
	enableOsdlyricsSupport?: boolean;
	/** 音乐语言偏好 */
	musicLanguage?: AlbumListArea;
	enableRealIP?: boolean;
	realIP?: string;
}

// 全局状态类型
export interface LikedState {
	songs: number[];
	songsWithDetails: Track[];
	playlists: Playlist[];
	albums: Album[];
	artists: Artist[];
	mvs: MV[];
	cloudDisk: CloudDiskTrack[];
	playHistory: {
		weekData: (Track & { playCount: number })[];
		allData: (Track & { playCount: number })[];
	};
}

export interface GlobalState {
	showLyrics: boolean;
	title: string;

	dailyTracks: Track[];
	player: PlayerState;
}
