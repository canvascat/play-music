import { delay, shuffle } from "es-toolkit";
import { Howl, Howler } from "howler";
import { isProxy } from "vue";
import { toast } from "vue-sonner";
import * as api from "@/api";
import { pinia, useStore } from "@/store/pinia";
import type { PersonalFMResponse, PlaylistSource, RepeatMode, Track } from "@/types";
import { isAccountLoggedIn } from "@/utils/auth";
import * as db from "@/utils/db/index";
import { isCreateMpris } from "@/utils/platform";
import { randomItem, setTitle } from "./common";
import { getAudioSourceFromUnblockMusic } from "./umn";
import { getLastfm } from "@/api/lastfm";

const PLAY_PAUSE_FADE_DURATION = 200;

const INDEX_IN_PLAY_NEXT = -1;

/**
 * @readonly
 * @enum {string}
 */
const UNPLAYABLE_CONDITION = {
	PLAY_NEXT_TRACK: "playNextTrack",
	PLAY_PREV_TRACK: "playPrevTrack",
} as const;

type UnplayableCondition = (typeof UNPLAYABLE_CONDITION)[keyof typeof UNPLAYABLE_CONDITION];

const excludeSaveKeys = ["_playing", "_personalFMLoading", "_personalFMNextLoading"];

const _howler = Symbol.for("howler");

export default class Player {
	// 播放器状态
	/** howler (https://github.com/goldfire/howler.js) */
	private [_howler]: Howl | null = null;
	/** 是否正在播放中 */
	private _playing: boolean = false;
	/** 当前播放歌曲的进度 */
	private _progress: number = 0;
	/** 音量 0-1 */
	private _volume: number = 1;
	/** 静音前的音量 */
	private _volumeBeforeMuted: number = 1;
	/** The blob records for cleanup. */
	private createdBlobRecords: string[] = [];

	/** 是否正在私人FM中加载新的track */
	private _personalFMLoading: boolean = false;
	/** 是否正在缓存私人FM的下一首歌曲 */
	private _personalFMNextLoading: boolean = false;
	/** 是否启用Player */
	private _enabled: boolean = false;

	// 播放模式

	/** 循环模式 */
	private _repeatMode: RepeatMode = "off";
	/** 是否随机播放 */
	private _shuffle: boolean = false;
	/** 是否倒序播放 */
	private _reversed: boolean = false;

	/** 当前播放歌曲在播放列表里的index */
	private _current: number = 0;
	/** 当前播放歌曲在随机列表里面的index */
	private _shuffledCurrent: number = 0;
	/** 当前播放歌曲的详细信息 */
	private _currentTrack?: Track;

	/** 播放列表 */
	private _list: number[] = [];
	/** 被随机打乱的播放列表，随机播放模式下会使用此播放列表 */
	private _shuffledList: number[] = [];
	/** 当这个list不为空时，会优先播放这个list的歌 */
	private _playNextList: number[] = [];

	/** 当前播放列表的信息 */
	private _playlistSource: PlaylistSource = { type: "album", id: 123 };

	/** 是否是私人FM模式 */
	private _isPersonalFM: boolean = false;
	/** 私人FM当前歌曲 */
	private _personalFMTrack?: Track;
	/** 私人FM下一首歌曲信息（为了快速加载下一首） */
	private _personalFMNextTrack?: Track;

	constructor() {
		this._init();
	}

	get repeatMode() {
		return this._repeatMode;
	}
	set repeatMode(mode) {
		if (this._isPersonalFM) return;
		this._repeatMode = mode;
	}
	get shuffle() {
		return this._shuffle;
	}
	set shuffle(shuffle) {
		if (this._isPersonalFM) return;
		this._shuffle = shuffle;
		if (shuffle) {
			this._shuffleTheList();
		}
		// 同步当前歌曲在列表中的下标
		this.current = this.list.indexOf(this.currentTrackID);
	}
	get reversed() {
		return this._reversed;
	}
	set reversed(reversed) {
		if (this._isPersonalFM) return;
		this._reversed = reversed;
	}
	get volume() {
		return this._volume;
	}
	set volume(volume) {
		this._volume = volume;
		this[_howler]?.volume(volume);
	}
	get list() {
		return this.shuffle ? this._shuffledList : this._list;
	}
	set list(list) {
		this._list = list;
	}
	get current() {
		return this.shuffle ? this._shuffledCurrent : this._current;
	}
	set current(current) {
		if (this.shuffle) {
			this._shuffledCurrent = current;
		} else {
			this._current = current;
		}
	}
	get enabled() {
		return this._enabled;
	}
	get playing() {
		return this._playing;
	}
	get currentTrack() {
		return this._currentTrack;
	}
	get currentTrackID() {
		return this._currentTrack?.id ?? 0;
	}
	get playlistSource() {
		return this._playlistSource;
	}
	get playNextList() {
		return this._playNextList;
	}
	get isPersonalFM() {
		return this._isPersonalFM;
	}
	get personalFMTrack() {
		return this._personalFMTrack;
	}
	get currentTrackDuration() {
		const trackDuration = this._currentTrack?.dt || 1000;
		const duration = ~~(trackDuration / 1000);
		return duration > 1 ? duration - 1 : duration;
	}
	get progress() {
		return this._progress;
	}
	set progress(value) {
		this[_howler]?.seek(value);
	}
	get isCurrentTrackLiked() {
		return this.currentTrack && useStore(pinia).liked.songs.includes(this.currentTrack.id);
	}

	get audioSource() {
		return (this[_howler] as any)?._src?.includes("kuwo.cn") ? "音源来自酷我音乐" : "";
	}

	private _init() {
		this._loadSelfFromLocalStorage();
		this[_howler]?.volume(this.volume);

		if (this._enabled) {
			// 恢复当前播放歌曲
			this._replaceCurrentTrack(this.currentTrackID, false).then(() => {
				this[_howler]?.seek(this._progress || 0);
			}); // update audio source and init howler
			this._initMediaSession();
		}

		this._setIntervals();

		// 初始化私人FM
		if (
			!this._personalFMTrack ||
			this._personalFMTrack.id === 0 ||
			!this._personalFMNextTrack ||
			this._personalFMNextTrack.id === 0 ||
			this._personalFMTrack.id === this._personalFMNextTrack.id
		) {
			api.others.personalFM().then((result) => {
				this._personalFMTrack = result.data[0];
				this._personalFMNextTrack = result.data[1];
				return this._personalFMTrack;
			});
		}
	}
	private _setPlaying(isPlaying: boolean) {
		this._playing = isPlaying;
	}
	private _setIntervals() {
		setInterval(() => {
			if (this[_howler] === null) return;
			this._progress = this[_howler].seek();
		}, 1000);
	}
	private _getNextTrack(): [trackID: number, index: number] {
		const next = this._reversed ? this.current - 1 : this.current + 1;

		if (this._playNextList.length > 0) {
			const trackID = this._playNextList[0];
			return [trackID, INDEX_IN_PLAY_NEXT];
		}

		// 循环模式开启，则重新播放当前模式下的相对的下一首
		if (this.repeatMode === "on") {
			if (this._reversed && this.current === 0) {
				// 倒序模式，当前歌曲是第一首，则重新播放列表最后一首
				return [this.list[this.list.length - 1], this.list.length - 1];
			} else if (this.list.length === this.current + 1) {
				// 正序模式，当前歌曲是最后一首，则重新播放第一首
				return [this.list[0], 0];
			}
		}
		return [this.list[next], next];
	}
	private _getPrevTrack(): [trackID: number, index: number] {
		const next = this._reversed ? this.current + 1 : this.current - 1;

		// 循环模式开启，则重新播放当前模式下的相对的下一首
		if (this.repeatMode === "on") {
			if (this._reversed && this.current === 0) {
				// 倒序模式，当前歌曲是最后一首，则重新播放列表第一首
				return [this.list[0], 0];
			} else if (this.list.length === this.current + 1) {
				// 正序模式，当前歌曲是第一首，则重新播放列表最后一首
				return [this.list[this.list.length - 1], this.list.length - 1];
			}
		}

		return [this.list[next], next];
	}
	private async _shuffleTheList(firstTrackID: number | "first" = this.currentTrackID) {
		let list = this._list.filter((tid) => tid !== firstTrackID);
		if (firstTrackID === "first") list = this._list;
		this._shuffledList = shuffle(list);
		if (firstTrackID !== "first") this._shuffledList.unshift(firstTrackID);
	}

	private _playAudioSource(source: string, autoplay = true) {
		Howler.unload();
		this[_howler] = new Howl({
			src: [source],
			html5: true,
			preload: true,
			format: ["mp3", "flac"],
			onend: () => {
				this._nextTrackCallback();
			},
		});

		this[_howler].on("loaderror", (_, errCode) => {
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code
			// code 3: MEDIA_ERR_DECODE
			if (errCode === 3) {
				this._playNextTrack();
			} else if (errCode === 4) {
				// code 4: MEDIA_ERR_SRC_NOT_SUPPORTED
				toast(`无法播放: 不支持的音频格式`);
				this._playNextTrack();
			} else {
				const t = this._progress;
				this._replaceCurrentTrackAudio(this.currentTrack, false, false).then((replaced) => {
					// 如果 replaced 为 false，代表当前的 track 已经不是这里想要替换的track
					// 此时则不修改当前的歌曲进度
					if (replaced) {
						this[_howler]?.seek(t);
						this.play();
					}
				});
			}
		});
		if (autoplay) {
			this.play();
			if (this._currentTrack?.name) {
				setTitle(this._currentTrack);
			}
		}
		this.setOutputDevice();
	}
	private _getAudioSourceBlobURL(data: ArrayBuffer) {
		const source = URL.createObjectURL(new Blob([data]));
		this.createdBlobRecords.forEach(URL.revokeObjectURL);
		this.createdBlobRecords = [source];
		return source;
	}
	private async _getAudioSourceFromCache(id: string) {
		const t = await db.track.source.read(id);
		if (!t) return null;
		return this._getAudioSourceBlobURL(t.source);
	}
	private async _getAudioSourceFromNetease(track: Track) {
		if (isAccountLoggedIn()) {
			const result = await api.track.getMP3(track.id);
			if (!result.data[0]?.url) return null;
			if (result.data[0].freeTrialInfo !== null) return null; // 跳过只能试听的歌曲
			const source = result.data[0].url.replace(/^http:/, "https:");
			if (useStore(pinia).settings.automaticallyCacheSongs) {
				db.track.source.write(track, source, result.data[0].br);
			}
			return source;
		} else {
			return `https://music.163.com/song/media/outer/url?id=${track.id}`;
		}
	}

	private async _getAudioSource(track: Track) {
		let source = await this._getAudioSourceFromCache(String(track.id));
		source ??= await this._getAudioSourceFromNetease(track);
		source ??= this._getAudioSourceBlobURL(await getAudioSourceFromUnblockMusic(track));
		return source;
	}
	private _replaceCurrentTrack(
		id: number,
		autoplay = true,
		ifUnplayableThen: UnplayableCondition = UNPLAYABLE_CONDITION.PLAY_NEXT_TRACK,
	) {
		return api.track.getTrackDetail(id).then((data) => {
			const track = data.songs[0];
			this._currentTrack = track;
			this._updateMediaSessionMetaData(track);
			return this._replaceCurrentTrackAudio(track, autoplay, true, ifUnplayableThen);
		});
	}
	/**
	 * @returns 是否成功加载音频，并使用加载完成的音频替换了howler实例
	 */
	private _replaceCurrentTrackAudio(
		track,
		autoplay,
		isCacheNextTrack,
		ifUnplayableThen: UnplayableCondition = UNPLAYABLE_CONDITION.PLAY_NEXT_TRACK,
	) {
		return this._getAudioSource(track).then((source) => {
			if (source) {
				let replaced = false;
				if (track.id === this.currentTrackID) {
					this._playAudioSource(source, autoplay);
					replaced = true;
				}
				if (isCacheNextTrack) {
					this._cacheNextTrack();
				}
				return replaced;
			} else {
				toast(`无法播放 ${track.name}`);
				switch (ifUnplayableThen) {
					case UNPLAYABLE_CONDITION.PLAY_NEXT_TRACK:
						this._playNextTrack();
						break;
					case UNPLAYABLE_CONDITION.PLAY_PREV_TRACK:
						this.playPrevTrack();
						break;
					default:
						toast(`undefined Unplayable condition: ${ifUnplayableThen}`);
						break;
				}
				return false;
			}
		});
	}
	private _cacheNextTrack() {
		const nextTrackID = this._isPersonalFM
			? (this._personalFMNextTrack?.id ?? 0)
			: this._getNextTrack()[0];
		if (!nextTrackID) return;
		if (this._personalFMTrack?.id === nextTrackID) return;
		api.track.getTrackDetail(`${nextTrackID}`).then((data) => {
			this._getAudioSource(data.songs[0]);
		});
	}
	private _loadSelfFromLocalStorage() {
		const player = JSON.parse(localStorage.getItem("player") || "null");
		if (!player) return;
		for (const [key, value] of Object.entries(player)) {
			this[key] = value;
		}
	}

	saveSelfToLocalStorage() {
		const player = {};
		for (const [key, value] of Object.entries(this)) {
			if (excludeSaveKeys.includes(key)) continue;
			player[key] = value;
		}

		localStorage.setItem("player", JSON.stringify(player));
	}
	private _initMediaSession() {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.setActionHandler("play", () => {
				this.play();
			});
			navigator.mediaSession.setActionHandler("pause", () => {
				this.pause();
			});
			navigator.mediaSession.setActionHandler("previoustrack", () => {
				this.playPrevTrack();
			});
			navigator.mediaSession.setActionHandler("nexttrack", () => {
				this._playNextTrack();
			});
			navigator.mediaSession.setActionHandler("stop", () => {
				this.pause();
			});
			navigator.mediaSession.setActionHandler("seekto", (event) => {
				this.seek(event.seekTime);
				this._updateMediaSessionPositionState();
			});
			navigator.mediaSession.setActionHandler("seekbackward", (event) => {
				this.seek(this.seek() - (event.seekOffset || 10));
				this._updateMediaSessionPositionState();
			});
			navigator.mediaSession.setActionHandler("seekforward", (event) => {
				this.seek(this.seek() + (event.seekOffset || 10));
				this._updateMediaSessionPositionState();
			});
		}
	}
	private _updateMediaSessionMetaData(track: Track) {
		if ("mediaSession" in navigator === false) {
			return;
		}
		const artists = track.ar.map((a) => a.name);
		const metadata = {
			title: track.name,
			artist: artists.join(","),
			album: track.al.name,
			artwork: [
				{
					src: `${track.al.picUrl}?param=224y224`,
					type: "image/jpg",
					sizes: "224x224",
				},
				{
					src: `${track.al.picUrl}?param=512y512`,
					type: "image/jpg",
					sizes: "512x512",
				},
			],
			length: this.currentTrackDuration,
			trackId: this.current,
			url: `/trackid/${track.id}`,
		};

		navigator.mediaSession.metadata = new window.MediaMetadata(metadata);
		if (isCreateMpris) {
			this._updateMprisState(track, metadata);
		}
	}
	// OSDLyrics 会检测 Mpris 状态并寻找对应歌词文件，所以要在更新 Mpris 状态之前保证歌词下载完成
	private async _updateMprisState(track: Track, metadata: MediaMetadata) {
		if (!useStore(pinia).settings.enableOsdlyricsSupport) {
			return window.ipcRenderer?.send("metadata", metadata);
		}

		const lyricContent = await api.track.getLyric(track.id);

		if (!lyricContent.lrc || !lyricContent.lrc.lyric) {
			return window.ipcRenderer?.send("metadata", metadata);
		}

		window.ipcRenderer?.send("sendLyrics", {
			track,
			lyrics: lyricContent.lrc.lyric,
		});

		window.ipcRenderer?.on("saveLyricFinished", () => {
			window.ipcRenderer?.send("metadata", metadata);
		});
	}
	private _updateMediaSessionPositionState() {
		if (!this.currentTrack || "mediaSession" in navigator === false) {
			return;
		}
		if ("setPositionState" in navigator.mediaSession) {
			navigator.mediaSession.setPositionState({
				duration: ~~(this.currentTrack.dt / 1000),
				playbackRate: 1.0,
				position: this.seek(),
			});
		}
	}
	private _nextTrackCallback() {
		if (!this._isPersonalFM && this.repeatMode === "one") {
			this._replaceCurrentTrack(this.currentTrackID);
		} else {
			this._playNextTrack();
		}
	}
	private _loadPersonalFMNextTrack() {
		if (this._personalFMNextLoading) {
			return [false, undefined];
		}
		this._personalFMNextLoading = true;
		return api.others
			.personalFM()
			.then((result) => {
				if (!result || !result.data) {
					this._personalFMNextTrack = undefined;
				} else {
					this._personalFMNextTrack = result.data[0];
					this._cacheNextTrack(); // cache next track
				}
				this._personalFMNextLoading = false;
				return [true, this._personalFMNextTrack];
			})
			.catch(() => {
				this._personalFMNextTrack = undefined;
				this._personalFMNextLoading = false;
				return [false, this._personalFMNextTrack];
			});
	}

	_playNextTrack() {
		if (this._isPersonalFM) {
			this.playNextFMTrack();
		} else {
			this.playNextTrack();
		}
	}

	appendTrack(trackID: number) {
		this.list.push(trackID);
	}
	playNextTrack() {
		// TODO: 切换歌曲时增加加载中的状态
		const [trackID, index] = this._getNextTrack();
		if (trackID === undefined) {
			this[_howler]?.stop();
			this._setPlaying(false);
			return false;
		}
		let next = index;
		if (index === INDEX_IN_PLAY_NEXT) {
			this._playNextList.shift();
			next = this.current;
		}
		this.current = next;
		this._replaceCurrentTrack(trackID);
		return true;
	}
	async playNextFMTrack() {
		if (this._personalFMLoading) {
			return false;
		}

		this._isPersonalFM = true;
		if (!this._personalFMNextTrack) {
			this._personalFMLoading = true;
			let result: PersonalFMResponse | null = null;
			let retryCount = 5;
			for (; retryCount >= 0; retryCount--) {
				result = await api.others.personalFM().catch(() => null);
				if (!result) {
					this._personalFMLoading = false;
					toast("personal fm timeout");
					return false;
				}
				if (result.data?.length > 0) {
					break;
				} else if (retryCount > 0) {
					await delay(1000);
				}
			}
			this._personalFMLoading = false;

			if (retryCount < 0) {
				const content = "获取私人FM数据时重试次数过多，请手动切换下一首";
				toast(content);
				return false;
			}
			// 这里只能拿到一条数据
			this._personalFMTrack = result?.data[0];
		} else {
			if (this._personalFMTrack && this._personalFMNextTrack.id === this._personalFMTrack.id) {
				return false;
			}
			this._personalFMTrack = this._personalFMNextTrack;
		}
		if (this._isPersonalFM && this._personalFMTrack) {
			this._replaceCurrentTrack(this._personalFMTrack.id);
		}
		this._loadPersonalFMNextTrack();
		return true;
	}
	playPrevTrack() {
		const [trackID, index] = this._getPrevTrack();
		if (trackID === undefined) return false;
		this.current = index;
		this._replaceCurrentTrack(trackID, true, UNPLAYABLE_CONDITION.PLAY_PREV_TRACK);
		return true;
	}

	pause() {
		this[_howler]?.fade(this.volume, 0, PLAY_PAUSE_FADE_DURATION);

		this[_howler]?.once("fade", () => {
			this[_howler]?.pause();
			this._setPlaying(false);
			setTitle();
		});
	}
	play() {
		if (this[_howler]?.playing()) return;

		this[_howler]?.play();

		this[_howler]?.once("play", () => {
			console.debug("play", this[_howler], isProxy(this[_howler]));
			this[_howler]?.fade(0, this.volume, PLAY_PAUSE_FADE_DURATION);

			// 播放时确保开启player.
			// 避免因"忘记设置"导致在播放时播放器不显示的Bug
			this._enabled = true;
			this._setPlaying(true);
			setTitle(this._currentTrack);
			if (!this._currentTrack) return;
			if (getLastfm().key !== undefined) {
				api.lastfm.trackUpdateNowPlaying({
					artist: this._currentTrack.ar[0].name,
					track: this._currentTrack.name,
					album: this._currentTrack.al.name,
					trackNumber: this._currentTrack.no,
					duration: ~~(this._currentTrack.dt / 1000),
				});
			}
		});
	}
	playOrPause() {
		if (this[_howler]?.playing()) {
			this.pause();
		} else {
			this.play();
		}
	}
	seek(time: number | null = null) {
		if (time !== null) {
			this[_howler]?.seek(time);
		}
		return this[_howler] === null ? 0 : this[_howler].seek();
	}
	mute() {
		if (this.volume === 0) {
			this.volume = this._volumeBeforeMuted;
		} else {
			this._volumeBeforeMuted = this.volume;
			this.volume = 0;
		}
	}
	// TODO
	setOutputDevice() {
		// TODO: 设置输出设备
		// if (this[_howler]?._sounds.length <= 0 || !this[_howler]?._sounds[0]._node) {
		//   return;
		// }
		// const audio: HTMLAudioElement = (this[_howler] as any)?._sounds[0]._node
		// audio.setSinkId(useStore(pinia).settings.outputDevice);
		// this[_howler]?._sounds[0]._node.setSinkId(useStore(pinia).settings.outputDevice);
	}

	replacePlaylist(
		trackIDs: number[],
		playlistSourceID: PlaylistSource["id"],
		playlistSourceType: PlaylistSource["type"],
		autoPlayTrackID: number | "first" = "first",
	) {
		this._isPersonalFM = false;
		this.list = trackIDs;
		this.current = 0;
		this._playlistSource = {
			type: playlistSourceType,
			id: playlistSourceID,
		};
		if (this.shuffle) this._shuffleTheList(autoPlayTrackID);
		if (autoPlayTrackID === "first") {
			this._replaceCurrentTrack(this.list[0]);
		} else {
			this.current = this.list.indexOf(autoPlayTrackID);
			this._replaceCurrentTrack(autoPlayTrackID);
		}
	}
	playAlbumByID(id: number, trackID: number | "first" = "first") {
		api.album.getAlbum(id).then((data) => {
			const trackIDs = data.songs.map((t) => t.id);
			this.replacePlaylist(trackIDs, id, "album", trackID);
		});
	}
	playPlaylistByID(id: number, trackID: number | "first" = "first", noCache: boolean = false) {
		console.debug(
			`[debug][Player.js] playPlaylistByID 👉 id:${id} trackID:${trackID} noCache:${noCache}`,
		);
		api.playlist.getPlaylistDetail(id, noCache).then((data) => {
			const trackIDs = data.playlist.trackIds?.map((t) => t.id) ?? [];
			this.replacePlaylist(trackIDs, id, "playlist", trackID);
		});
	}
	playArtistByID(id: number, trackID: number | "first" = "first") {
		api.artist.getArtist(id).then((data) => {
			const trackIDs = data.hotSongs.map((t) => t.id);
			this.replacePlaylist(trackIDs, id, "artist", trackID);
		});
	}
	playTrackOnListByID(id: number, listName: string = "default") {
		if (listName === "default") {
			this._current = this._list.findIndex((t) => t === id);
		}
		this._replaceCurrentTrack(id);
	}
	async playIntelligenceListById(
		id: number,
		trackID: number | "first" = "first",
		noCache: boolean = false,
	) {
		const data = await api.playlist.getPlaylistDetail(id, noCache);
		const songId = randomItem(data.playlist.trackIds)?.id;
		if (!songId) return;
		const result = await api.playlist.intelligencePlaylist({ id: songId, pid: id });
		const trackIDs = result.data.map((t) => t.id);
		this.replacePlaylist(trackIDs, id, "playlist", trackID);
	}
	addTrackToPlayNext(trackID: number, playNow: boolean = false) {
		this._playNextList.push(trackID);
		if (playNow) {
			this.playNextTrack();
		}
	}
	playPersonalFM() {
		this._isPersonalFM = true;
		if (this._personalFMTrack && this.currentTrackID !== this._personalFMTrack.id) {
			this._replaceCurrentTrack(this._personalFMTrack.id, true);
		} else {
			this.playOrPause();
		}
	}
	async moveToFMTrash() {
		if (!this._personalFMTrack) return;
		this._isPersonalFM = true;
		const id = this._personalFMTrack.id;
		if (await this.playNextFMTrack()) {
			api.others.fmTrash(id);
		}
	}

	switchRepeatMode() {
		if (this._repeatMode === "on") {
			this.repeatMode = "one";
		} else if (this._repeatMode === "one") {
			this.repeatMode = "off";
		} else {
			this.repeatMode = "on";
		}
	}
	switchShuffle() {
		this.shuffle = !this.shuffle;
	}
	switchReversed() {
		this.reversed = !this.reversed;
	}

	clearPlayNextList() {
		this._playNextList = [];
	}
	removeTrackFromQueue(index: number) {
		this._playNextList.splice(index, 1);
	}
}
