import type { LikedState } from "@/types";
import { ref } from "vue";
import { defineStore } from "pinia";
import { useDataStore } from "./data";
import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";
import { toast } from "vue-sonner";

export const useLikedStore = defineStore("liked", () => {
	const liked = ref<LikedState>({
		songs: [],
		songsWithDetails: [], // 只有前12首
		playlists: [],
		albums: [],
		artists: [],
		mvs: [],
		cloudDisk: [],
		playHistory: {
			weekData: [],
			allData: [],
		},
	});

	const update = <K extends keyof LikedState>(key: K, payload: LikedState[K]) => {
		liked.value[key] = payload;
	};

	/**
	 * 获取用户喜欢的歌曲详情
	 */
	async function fetchLikedSongsWithDetails() {
		const { likedSongPlaylistID } = useDataStore();
		if (!likedSongPlaylistID) return;
		const result = await api.playlist.getPlaylistDetail(likedSongPlaylistID, true);
		if (!result.playlist?.trackIds?.length) return;
		const trackIds = result.playlist.trackIds
			.slice(0, 12)
			.map((t) => t.id)
			.join(",");
		const { songs } = await api.track.getTrackDetail(trackIds);
		update("songsWithDetails", songs);
	}

	/**
	 * 获取用户喜欢的歌曲
	 */
	async function fetchLikedSongs() {
		const user = useDataStore().user;
		if (!user) return;
		const result = await api.user.userLikedSongsIDs(user.userId);

		update("songs", result.ids);
	}

	/**
	 * 喜欢/取消喜欢歌曲
	 */
	async function likeATrack(id: number) {
		if (!isAccountLoggedIn()) {
			toast("此操作需要登录网易云账号");
			return;
		}
		let like = true;
		if (liked.value.songs.includes(id)) like = false;
		api.track
			.likeATrack({ id, like })
			.then(() => {
				if (like === false) {
					update(
						"songs",
						liked.value.songs.filter((d) => d !== id),
					);
				} else {
					const newLikeSongs = liked.value.songs;
					newLikeSongs.push(id);
					update("songs", newLikeSongs);
				}
				fetchLikedSongsWithDetails();
			})
			.catch(() => {
				toast("操作失败，专辑下架或版权锁定");
			});
	}

	/**
	 * 获取用户喜欢的歌单
	 */
	async function fetchLikedPlaylist() {
		const user = useDataStore().user;
		if (!user) return;
		const result = await api.user.userPlaylist({
			uid: user.userId,
			limit: 2000, // 最多只加载2000个歌单（等有用户反馈问题再修）
		});

		if (result.playlist) {
			update("playlists", result.playlist || []);
			// 更新用户”喜欢的歌曲“歌单ID
			useDataStore().update("likedSongPlaylistID", result.playlist[0].id);
		}
	}

	/**
	 * 获取用户喜欢的专辑
	 */
	async function fetchLikedAlbums() {
		if (!isAccountLoggedIn()) return;
		const result = await api.user.likedAlbums({ limit: 2000 });
		update("albums", result.data || []);
	}

	/**
	 * 获取用户喜欢的歌手
	 */
	async function fetchLikedArtists() {
		if (!isAccountLoggedIn()) return;
		const result = await api.user.likedArtists({ limit: 2000 });
		update("artists", result.data || []);
	}

	/**
	 * 获取用户喜欢的MV
	 */
	async function fetchLikedMVs() {
		if (!isAccountLoggedIn()) return;
		const result = await api.user.likedMVs({ limit: 1000 });
		update("mvs", result.data || []);
	}

	/**
	 * 获取用户云盘
	 */
	async function fetchCloudDisk() {
		if (!isAccountLoggedIn()) return;
		const result = await api.user.cloudDisk({ limit: 1000 });
		update("cloudDisk", result.data || []);
	}

	/**
	 * 获取用户播放历史
	 */
	async function fetchPlayHistory() {
		const user = useDataStore().user;
		if (!user) return;
		const [{ allData }, { weekData }] = await Promise.all([
			api.user.userPlayHistory({ uid: user.userId, type: 0 }),
			api.user.userPlayHistory({ uid: user.userId, type: 1 }),
		]);
		if (allData && weekData) {
			update("playHistory", {
				allData: allData.map(({ song, playCount }) => ({ ...song, playCount })),
				weekData: weekData.map(({ song, playCount }) => ({ ...song, playCount })),
			});
		}
	}

	async function uploadSongToCloudDisk(files?: FileList | null) {
		if (!files || files.length === 0) return;

		const result = await api.user.uploadSong(files[0]);
		if (result.code === 200) {
			update("cloudDisk", [result.privateCloud, ...liked.value.cloudDisk]);
		}
	}

	function removeTrackFromCloudDisk(track: any) {
		if (confirm(`确定要从云盘删除 ${track.songName}？`)) {
			// ?? 这里track.songId 和 track.id 不一样
			let trackID = track.songId;
			api.user.cloudDiskTrackDelete(trackID).then((data) => {
				toast(data.code === 200 ? "已将此歌曲从云盘删除" : data.message);
				update(
					"cloudDisk",
					liked.value.cloudDisk.filter((t) => t.songId !== trackID),
				);
			});
		}
	}

	function fetchLikedData() {
		if (!isAccountLoggedIn()) return;
		fetchLikedSongs();
		fetchLikedSongsWithDetails();
		fetchLikedPlaylist();
		fetchLikedAlbums();
		fetchLikedArtists();
		fetchLikedMVs();
		fetchCloudDisk();
	}

	return {
		liked,

		update,

		fetchLikedSongs,
		fetchLikedSongsWithDetails,
		likeATrack,
		fetchLikedPlaylist,
		fetchLikedAlbums,
		fetchLikedArtists,
		fetchLikedMVs,
		fetchCloudDisk,
		fetchPlayHistory,
		uploadSongToCloudDisk,
		removeTrackFromCloudDisk,

		fetchLikedData,
	};
});
