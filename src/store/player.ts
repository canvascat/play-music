import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

class PlayerState {
	// 播放器状态
	/** 是否正在播放中 */
	_playing: boolean = false;
	/** 当前播放歌曲的进度 */
	_progress: number = 0;
	/** 是否启用Player */
	_enabled: boolean = false;
	/** 循环模式 */
	_repeatMode: "off" | "on" | "one" = "off";
	/** 是否随机播放 */
	_shuffle: boolean = false;
	/** 是否倒序播放 */
	_reversed: boolean = false;
	/** 音量 0-1 */
	_volume: number = 1;
	/** 静音前的音量 */
	_volumeBeforeMuted: number = 1;
	/** 是否正在私人FM中加载新的track */
	_personalFMLoading: boolean = false;
	/** 是否正在缓存私人FM的下一首歌曲 */
	_personalFMNextLoading: boolean = false;

	// 播放信息
	/** 播放列表 */
	_list: number[] = [];
	/** 当前播放歌曲在播放列表里的index */
	_current: number = 0;
	/** 被随机打乱的播放列表，随机播放模式下会使用此播放列表 */
	_shuffledList: number[] = [];
	/** 当前播放歌曲在随机列表里面的index */
	_shuffledCurrent: number = 0;
	/** 当前播放列表的信息 */
	_playlistSource: { type: string; id: number } = { type: "album", id: 123 };
	/** 当前播放歌曲的详细信息 */
	_currentTrack: { id: number } = { id: 86827685 };
	/** 当这个list不为空时，会优先播放这个list的歌 */
	_playNextList: number[] = [];
	/** 是否是私人FM模式 */
	_isPersonalFM: boolean = false;
	/** 私人FM当前歌曲 */
	_personalFMTrack: { id: number } = { id: 0 };
	/** 私人FM下一首歌曲信息（为了快速加载下一首） */
	_personalFMNextTrack: { id: number } = { id: 0 };

	/** The blob records for cleanup. */
	createdBlobRecords: string[] = [];
}

export const usePlayerStore = defineStore("player", () => {
	const _howler = ref<Howl | null>(null);
	const state = reactive(new PlayerState());

	const repeatMode = computed({
		get() {
			return state._repeatMode;
		},
		set(value) {
			if (state._isPersonalFM) return;
			state._repeatMode = value;
		},
	});
	const shuffle = computed({
		get() {
			return state._shuffle;
		},

		set(shuffle) {
			if (state._isPersonalFM) return;
			state._shuffle = shuffle;
			if (shuffle) {
				// this._shuffleTheList();
			}
			// 同步当前歌曲在列表中的下标
			// this.current = this.list.indexOf(this.currentTrackID);
		},
	});
	const reversed = computed(() => state._reversed);
	const volume = computed(() => state._volume);
	const volumeBeforeMuted = computed(() => state._volumeBeforeMuted);
	const personalFMLoading = computed(() => state._personalFMLoading);
	const personalFMNextLoading = computed(() => state._personalFMNextLoading);
	const list = computed(() => state._list);
	const current = computed(() => state._current);
	const shuffledList = computed(() => state._shuffledList);
	const shuffledCurrent = computed(() => state._shuffledCurrent);
	const playlistSource = computed(() => state._playlistSource);
	const currentTrack = computed(() => state._currentTrack);
	const playNextList = computed(() => state._playNextList);
	const isPersonalFM = computed(() => state._isPersonalFM);
	const personalFMTrack = computed(() => state._personalFMTrack);

	return {
		repeatMode,
		shuffle,
		reversed,
		volume,
		volumeBeforeMuted,
		personalFMLoading,
		personalFMNextLoading,
		list,
		current,
		shuffledList,
		shuffledCurrent,
		playlistSource,
		currentTrack,
		playNextList,
		isPersonalFM,
		personalFMTrack,
	};
});

usePlayerStore().repeatMode;
