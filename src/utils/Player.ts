import * as api from '@/api';
import { pinia, useStore } from '@/store/pinia';
import { isAccountLoggedIn } from '@/utils/auth';
import { cacheTrackSource, getTrackSource } from '@/utils/db';
import { isCreateMpris } from '@/utils/platform';
import { Howl, Howler } from 'howler';
import { shuffle } from 'es-toolkit';
import { decode as base642Buffer } from '@/utils/base64';
import { toast } from 'vue-sonner';
import type { Track, RepeatMode, PlaylistSource, PersonalFMResponse } from '@/types';

const PLAY_PAUSE_FADE_DURATION = 200;

const INDEX_IN_PLAY_NEXT = -1;

/**
 * @readonly
 * @enum {string}
 */
const UNPLAYABLE_CONDITION = {
  PLAY_NEXT_TRACK: 'playNextTrack',
  PLAY_PREV_TRACK: 'playPrevTrack',
} as const;

type UnplayableCondition = typeof UNPLAYABLE_CONDITION[keyof typeof UNPLAYABLE_CONDITION];

const delay = (ms: number = 0): Promise<void> => new Promise<void>(resolve => setTimeout(resolve, ms));
const excludeSaveKeys = [
  '_playing',
  '_personalFMLoading',
  '_personalFMNextLoading',
];

function setTitle(track?: Track): void {
  document.title = track
    ? `${track.name} · ${track.ar[0].name} - YesPlayMusic`
    : 'YesPlayMusic';
  useStore().updateTitle(document.title);
}

 
// TODO: 重构 分离播放器和播放列表

export default class Player {
  // 播放器状态
  /** howler (https://github.com/goldfire/howler.js) */
  private _howler: Howl | null = null;
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
  private _repeatMode: RepeatMode = 'off';
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
  private _playlistSource: PlaylistSource = { type: 'album', id: 123 };

  /** 是否是私人FM模式 */
  private _isPersonalFM: boolean = false;
  /** 私人FM当前歌曲 */
  private _personalFMTrack?: Track;
  /** 私人FM下一首歌曲信息（为了快速加载下一首） */
  private _personalFMNextTrack?: Track;


  constructor() {
    Object.defineProperty(this, '_howler', {
      enumerable: false,
    });

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
    this._howler?.volume(volume);
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
    let duration = ~~(trackDuration / 1000);
    return duration > 1 ? duration - 1 : duration;
  }
  get progress() {
    return this._progress;
  }
  set progress(value) { 
    this._howler?.seek(value);
  }
  get isCurrentTrackLiked() {
    return this.currentTrack && useStore(pinia).liked.songs.includes(this.currentTrack.id);
  }

  get audioSource() {
    return this._howler?._src.includes('kuwo.cn')
      ? '音源来自酷我音乐'
      : '';
  }

  private _init() {
    this._loadSelfFromLocalStorage();
    this._howler?.volume(this.volume);

    if (this._enabled) {
      // 恢复当前播放歌曲
      this._replaceCurrentTrack(this.currentTrackID, false).then(() => {
        this._howler?.seek(this._progress || 0);
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
      api.others.personalFM().then(result => {
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
      if (this._howler === null) return;
      this._progress = this._howler.seek();
    }, 1000);
  }
  private _getNextTrack(): [trackID: number, index: number] {
    const next = this._reversed ? this.current - 1 : this.current + 1;

    if (this._playNextList.length > 0) {
      let trackID = this._playNextList[0];
      return [trackID, INDEX_IN_PLAY_NEXT];
    }

    // 循环模式开启，则重新播放当前模式下的相对的下一首
    if (this.repeatMode === 'on') {
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
    if (this.repeatMode === 'on') {
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
  private async _shuffleTheList(firstTrackID: number | 'first' = this.currentTrackID) {
    let list = this._list.filter(tid => tid !== firstTrackID);
    if (firstTrackID === 'first') list = this._list;
    this._shuffledList = shuffle(list);
    if (firstTrackID !== 'first') this._shuffledList.unshift(firstTrackID);
  }
 
  private _playAudioSource(source: string, autoplay = true) {
    Howler.unload();
    this._howler = new Howl({
      src: [source],
      html5: true,
      preload: true,
      format: ['mp3', 'flac'],
      onend: () => {
        this._nextTrackCallback();
      },
    });
    this._howler.on('loaderror', (_, errCode) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code
      // code 3: MEDIA_ERR_DECODE
      if (errCode === 3) {
        this._playNextTrack(this._isPersonalFM);
      } else if (errCode === 4) {
        // code 4: MEDIA_ERR_SRC_NOT_SUPPORTED
        toast(`无法播放: 不支持的音频格式`);
        this._playNextTrack(this._isPersonalFM);
      } else {
        const t = this.progress;
        this._replaceCurrentTrackAudio(this.currentTrack, false, false).then(
          replaced => {
            // 如果 replaced 为 false，代表当前的 track 已经不是这里想要替换的track
            // 此时则不修改当前的歌曲进度
            if (replaced) {
              this._howler?.seek(t);
              this.play();
            }
          }
        );
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
  private _getAudioSourceBlobURL(data) {
    // Create a new object URL.
    const source = URL.createObjectURL(new Blob([data]));

    // Clean up the previous object URLs since we've created a new one.
    // Revoke object URLs can release the memory taken by a Blob,
    // which occupied a large proportion of memory.
    for (const url in this.createdBlobRecords) {
      URL.revokeObjectURL(url);
    }

    // Then, we replace the createBlobRecords with new one with
    // our newly created object URL.
    this.createdBlobRecords = [source];

    return source;
  }
  private _getAudioSourceFromCache(id) {
    return getTrackSource(id).then(t => {
      if (!t) return null;
      return this._getAudioSourceBlobURL(t.source);
    });
  }
  private _getAudioSourceFromNetease(track) {
    if (isAccountLoggedIn()) {
      return api.track.getMP3(track.id).then(result => {
        if (!result.data[0]) return null;
        if (!result.data[0].url) return null;
        if (result.data[0].freeTrialInfo !== null) return null; // 跳过只能试听的歌曲
        const source = result.data[0].url.replace(/^http:/, 'https:');
        if (useStore(pinia).settings.automaticallyCacheSongs) {
          cacheTrackSource(track, source, result.data[0].br);
        }
        return source;
      });
    } else {
      return new Promise(resolve => {
        resolve(`https://music.163.com/song/media/outer/url?id=${track.id}`);
      });
    }
  }
  private async _getAudioSourceFromUnblockMusic(track) {
    console.debug(`[debug][Player.js] _getAudioSourceFromUnblockMusic`);

    if (
      window.IS_ELECTRON !== true ||
      useStore(pinia).settings.enableUnblockNeteaseMusic === false
    ) {
      return null;
    }

    /**
     *
     * @param {string=} searchMode
     * @returns {import("@unblockneteasemusic/rust-napi").SearchMode}
     */
    const determineSearchMode = searchMode => {
      /**
       * FastFirst = 0
       * OrderFirst = 1
       */
      switch (searchMode) {
        case 'fast-first':
          return 0;
        case 'order-first':
          return 1;
        default:
          return 0;
      }
    };

    const retrieveSongInfo = await window.ipcRenderer?.invoke(
      'unblock-music',
      useStore(pinia).settings.unmSource,
      track,
      {
        enableFlac: useStore(pinia).settings.unmEnableFlac || null,
        proxyUri: useStore(pinia).settings.unmProxyUri || null,
        searchMode: determineSearchMode(useStore(pinia).settings.unmSearchMode),
        config: {
          'joox:cookie': useStore(pinia).settings.unmJooxCookie || null,
          'qq:cookie': useStore(pinia).settings.unmQQCookie || null,
          'ytdl:exe': useStore(pinia).settings.unmYtDlExe || null,
        },
      }
    );

    if (useStore(pinia).settings.automaticallyCacheSongs && retrieveSongInfo?.url) {
      // 对于来自 bilibili 的音源
      // retrieveSongInfo.url 是音频数据的base64编码
      // 其他音源为实际url
      const url =
        retrieveSongInfo.source === 'bilibili'
          ? `data:application/octet-stream;base64,${retrieveSongInfo.url}`
          : retrieveSongInfo.url;
      cacheTrackSource(track, url, 128000, `unm:${retrieveSongInfo.source}`);
    }

    if (!retrieveSongInfo) {
      return null;
    }

    if (retrieveSongInfo.source !== 'bilibili') {
      return retrieveSongInfo.url;
    }

    const buffer = base642Buffer(retrieveSongInfo.url);
    return this._getAudioSourceBlobURL(buffer);
  }
  private _getAudioSource(track) {
    return this._getAudioSourceFromCache(String(track.id))
      .then(source => {
        return source ?? this._getAudioSourceFromNetease(track);
      })
      .then(source => {
        return source ?? this._getAudioSourceFromUnblockMusic(track);
      });
  }
  private _replaceCurrentTrack(
    id,
    autoplay = true,
    ifUnplayableThen: UnplayableCondition = UNPLAYABLE_CONDITION.PLAY_NEXT_TRACK
  ) {
    return api.track.getTrackDetail(id).then(data => {
      const track = data.songs[0];
      this._currentTrack = track;
      this._updateMediaSessionMetaData(track);
      return this._replaceCurrentTrackAudio(
        track,
        autoplay,
        true,
        ifUnplayableThen
      );
    });
  }
  /**
   * @returns 是否成功加载音频，并使用加载完成的音频替换了howler实例
   */
  private _replaceCurrentTrackAudio(
    track,
    autoplay,
    isCacheNextTrack,
    ifUnplayableThen: UnplayableCondition = UNPLAYABLE_CONDITION.PLAY_NEXT_TRACK
  ) {
    return this._getAudioSource(track).then(source => {
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
            this._playNextTrack(this.isPersonalFM);
            break;
          case UNPLAYABLE_CONDITION.PLAY_PREV_TRACK:
            this.playPrevTrack();
            break;
          default:
            toast(
              `undefined Unplayable condition: ${ifUnplayableThen}`
            );
            break;
        }
        return false;
      }
    });
  }
  private _cacheNextTrack() {
    let nextTrackID = this._isPersonalFM
      ? this._personalFMNextTrack?.id ?? 0
      : this._getNextTrack()[0];
    if (!nextTrackID) return;
    if (this._personalFMTrack?.id == nextTrackID) return;
    api.track.getTrackDetail(`${nextTrackID}`).then(data => {
      this._getAudioSource(data.songs[0]);
    });
  }
  private _loadSelfFromLocalStorage() {
    const player = JSON.parse(localStorage.getItem('player') || 'null');
    if (!player) return;
    for (const [key, value] of Object.entries(player)) {
      this[key] = value;
    }
  }

  saveSelfToLocalStorage() {
    let player = {};
    for (let [key, value] of Object.entries(this)) {
      if (excludeSaveKeys.includes(key)) continue;
      player[key] = value;
    }

    localStorage.setItem('player', JSON.stringify(player));
  }
  private _initMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.playPrevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this._playNextTrack(this.isPersonalFM);
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('seekto', event => {
        this.seek(event.seekTime);
        this._updateMediaSessionPositionState();
      });
      navigator.mediaSession.setActionHandler('seekbackward', event => {
        this.seek(this.seek() - (event.seekOffset || 10));
        this._updateMediaSessionPositionState();
      });
      navigator.mediaSession.setActionHandler('seekforward', event => {
        this.seek(this.seek() + (event.seekOffset || 10));
        this._updateMediaSessionPositionState();
      });
    }
  }
  private _updateMediaSessionMetaData(track: Track) {
    if ('mediaSession' in navigator === false) {
      return;
    }
    let artists = track.ar.map(a => a.name);
    const metadata = {
      title: track.name,
      artist: artists.join(','),
      album: track.al.name,
      artwork: [
        {
          src: track.al.picUrl + '?param=224y224',
          type: 'image/jpg',
          sizes: '224x224',
        },
        {
          src: track.al.picUrl + '?param=512y512',
          type: 'image/jpg',
          sizes: '512x512',
        },
      ],
      length: this.currentTrackDuration,
      trackId: this.current,
      url: '/trackid/' + track.id,
    };

    navigator.mediaSession.metadata = new window.MediaMetadata(metadata);
    if (isCreateMpris) {
      this._updateMprisState(track, metadata);
    }
  }
  // OSDLyrics 会检测 Mpris 状态并寻找对应歌词文件，所以要在更新 Mpris 状态之前保证歌词下载完成
  private async _updateMprisState(track: Track, metadata: MediaMetadata) {
    if (!useStore(pinia).settings.enableOsdlyricsSupport) {
      return window.ipcRenderer?.send('metadata', metadata);
    }

    let lyricContent = await api.track.getLyric(track.id);

    if (!lyricContent.lrc || !lyricContent.lrc.lyric) {
      return window.ipcRenderer?.send('metadata', metadata);
    }

    window.ipcRenderer?.send('sendLyrics', {
      track,
      lyrics: lyricContent.lrc.lyric,
    });

    window.ipcRenderer?.on('saveLyricFinished', () => {
      window.ipcRenderer?.send('metadata', metadata);
    });
  }
  private _updateMediaSessionPositionState() {
    if (!this.currentTrack || 'mediaSession' in navigator === false) {
      return;
    }
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: ~~(this.currentTrack.dt / 1000),
        playbackRate: 1.0,
        position: this.seek(),
      });
    }
  }
  private _nextTrackCallback() {
    if (!this.isPersonalFM && this.repeatMode === 'one') {
      this._replaceCurrentTrack(this.currentTrackID);
    } else {
      this._playNextTrack(this.isPersonalFM);
    }
  }
  private _loadPersonalFMNextTrack() {
    if (this._personalFMNextLoading) {
      return [false, undefined];
    }
    this._personalFMNextLoading = true;
    return api.others.personalFM()
      .then(result => {
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
  private _playDiscordPresence(track: Track, seekTime = 0) {
    if (
      window.IS_ELECTRON !== true ||
      useStore(pinia).settings.enableDiscordRichPresence === false
    ) {
      return null;
    }
    let copyTrack = { ...track };
    copyTrack.dt -= seekTime * 1000;
    window.ipcRenderer?.send('playDiscordPresence', copyTrack);
  }
  private _pauseDiscordPresence(track: Track) {
    if (
      window.IS_ELECTRON !== true ||
      useStore(pinia).settings.enableDiscordRichPresence === false
    ) {
      return null;
    }
    window.ipcRenderer?.send('pauseDiscordPresence', track);
  }
  private _playNextTrack(isPersonal: boolean) {
    if (isPersonal) {
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
      this._howler?.stop();
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
          toast('personal fm timeout');
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
        let content = '获取私人FM数据时重试次数过多，请手动切换下一首';
        toast(content);
        console.log(content);
        return false;
      }
      // 这里只能拿到一条数据
      this._personalFMTrack = result?.data[0];
    } else {
      if (this._personalFMTrack &&this._personalFMNextTrack.id === this._personalFMTrack.id) {
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
    this._replaceCurrentTrack(
      trackID,
      true,
      UNPLAYABLE_CONDITION.PLAY_PREV_TRACK
    );
    return true;
  }

  pause() {
    this._howler?.fade(this.volume, 0, PLAY_PAUSE_FADE_DURATION);

    this._howler?.once('fade', () => {
      this._howler?.pause();
      this._setPlaying(false);
      setTitle();
      this._pauseDiscordPresence(this._currentTrack!);
    });
  }
  play() {
    if (this._howler?.playing()) return;

    this._howler?.play();

    this._howler?.once('play', () => {
      this._howler?.fade(0, this.volume, PLAY_PAUSE_FADE_DURATION);

      // 播放时确保开启player.
      // 避免因"忘记设置"导致在播放时播放器不显示的Bug
      this._enabled = true;
      this._setPlaying(true); 
      setTitle(this._currentTrack);
      if (!this._currentTrack) return;
      this._playDiscordPresence(this._currentTrack, this.seek());
      if (useStore(pinia).lastfm.key !== undefined) {
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
    if (this._howler?.playing()) {
      this.pause();
    } else {
      this.play();
    }
  }
  seek(time: number | null = null) {
    if (time !== null) {
      this._howler?.seek(time);
      if (this._playing && this._currentTrack) {
        this._playDiscordPresence(this._currentTrack, this.seek(null));
      }
    }
    return this._howler === null ? 0 : this._howler.seek();
  }
  mute() {
    if (this.volume === 0) {
      this.volume = this._volumeBeforeMuted;
    } else {
      this._volumeBeforeMuted = this.volume;
      this.volume = 0;
    }
  }
  setOutputDevice() {
    // TODO: 设置输出设备
    // if (this._howler?._sounds.length <= 0 || !this._howler?._sounds[0]._node) {
    //   return;
    // }
    // this._howler?._sounds[0]._node.setSinkId(useStore(pinia).settings.outputDevice);
  }

  replacePlaylist(
    trackIDs: number[],
    playlistSourceID: number,
    playlistSourceType: PlaylistSource['type'],
    autoPlayTrackID: number | 'first' = 'first'
  ) {
    this._isPersonalFM = false;
    this.list = trackIDs;
    this.current = 0;
    this._playlistSource = {
      type: playlistSourceType,
      id: playlistSourceID,
    };
    if (this.shuffle) this._shuffleTheList(autoPlayTrackID);
    if (autoPlayTrackID === 'first') {
      this._replaceCurrentTrack(this.list[0]);
    } else {
      this.current = this.list.indexOf(autoPlayTrackID);
      this._replaceCurrentTrack(autoPlayTrackID);
    }
  }
  playAlbumByID(id: number, trackID: number | 'first' = 'first') {
    api.album.getAlbum(id).then(data => {
      let trackIDs = data.songs.map(t => t.id);
      this.replacePlaylist(trackIDs, id, 'album', trackID);
    });
  }
  playPlaylistByID(id: number, trackID: number | 'first' = 'first', noCache: boolean = false) {
    console.debug(
      `[debug][Player.js] playPlaylistByID 👉 id:${id} trackID:${trackID} noCache:${noCache}`
    );
    api.playlist.getPlaylistDetail(id, noCache).then(data => {
      let trackIDs = data.playlist.trackIds.map(t => t.id);
      this.replacePlaylist(trackIDs, id, 'playlist', trackID);
    });
  }
  playArtistByID(id: number, trackID: number | 'first' = 'first') {
    api.artist.getArtist(id).then(data => {
      let trackIDs = data.hotSongs.map(t => t.id);
      this.replacePlaylist(trackIDs, id, 'artist', trackID);
    });
  }
  playTrackOnListByID(id: number, listName: string = 'default') {
    if (listName === 'default') {
      this._current = this._list.findIndex(t => t === id);
    }
    this._replaceCurrentTrack(id);
  }
  playIntelligenceListById(id: number, trackID: number | 'first' = 'first', noCache: boolean = false) {
    api.playlist.getPlaylistDetail(id, noCache).then(data => {
      const randomId = Math.floor(
        Math.random() * (data.playlist.trackIds.length + 1)
      );
      const songId = data.playlist.trackIds[randomId].id;
      api.playlist.intelligencePlaylist({ id: songId, pid: id }).then(result => {
        let trackIDs = result.data.map(t => t.id);
        this.replacePlaylist(trackIDs, id, 'playlist', trackID);
      });
    });
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
    let id = this._personalFMTrack.id;
    if (await this.playNextFMTrack()) {
      api.others.fmTrash(id);
    }
  }

  switchRepeatMode() {
    if (this._repeatMode === 'on') {
      this.repeatMode = 'one';
    } else if (this._repeatMode === 'one') {
      this.repeatMode = 'off';
    } else {
      this.repeatMode = 'on';
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