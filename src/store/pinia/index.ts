import { createPinia, defineStore } from "pinia";
import { toast } from "vue-sonner";
import * as api from "@/api";
import type { GlobalState } from "@/types";
import { isAccountLoggedIn } from "@/utils/auth";

import _state from "../state";
import { useDataStore } from "../data";

export const pinia = createPinia();

export const useStore = defineStore("store", {
	state: () => _state,
	actions: {
		updateLiked<K extends keyof GlobalState["liked"]>(key: K, payload: GlobalState["liked"][K]) {
			this.liked[key] = payload;
		},

		toggleLyrics() {
			this.showLyrics = !this.showLyrics;
		},
		updateDailyTracks(dailyTracks) {
			this.dailyTracks = dailyTracks;
		},

		updateTitle(title: string) {
			this.title = title;
		},
		likeATrack(id: number) {
			if (!isAccountLoggedIn()) {
				toast("此操作需要登录网易云账号");
				return;
			}
			let like = true;
			if (this.liked.songs.includes(id)) like = false;
			api.track
				.likeATrack({ id, like })
				.then(() => {
					if (like === false) {
						this.updateLiked(
							"songs",
							this.liked.songs.filter((d) => d !== id),
						);
					} else {
						const newLikeSongs = this.liked.songs;
						newLikeSongs.push(id);
						this.updateLiked("songs", newLikeSongs);
					}
					this.fetchLikedSongsWithDetails();
				})
				.catch(() => {
					toast("操作失败，专辑下架或版权锁定");
				});
		},
		async fetchLikedSongs() {
			const user = useDataStore().user;
			if (!user) return;
			const result = await api.user.userLikedSongsIDs(user.userId);

			this.updateLiked("songs", result.ids);
		},
		async fetchLikedSongsWithDetails() {
			const { likedSongPlaylistID } = useDataStore();
			if (!likedSongPlaylistID) return;
			const result = await api.playlist.getPlaylistDetail(likedSongPlaylistID, true);
			if (!result.playlist?.trackIds?.length) return;
			const trackIds = result.playlist.trackIds
				.slice(0, 12)
				.map((t) => t.id)
				.join(",");
			const { songs } = await api.track.getTrackDetail(trackIds);
			this.updateLiked("songsWithDetails", songs);
		},
		async fetchLikedPlaylist() {
			const user = useDataStore().user;
			if (!user) return;
			const result = await api.user.userPlaylist({
				uid: user.userId,
				limit: 2000, // 最多只加载2000个歌单（等有用户反馈问题再修）
			});

			if (result.playlist) {
				this.updateLiked("playlists", result.playlist || []);
				// 更新用户”喜欢的歌曲“歌单ID
				useDataStore().update("likedSongPlaylistID", result.playlist[0].id);
			}
		},
		async fetchLikedAlbums() {
			if (!isAccountLoggedIn()) return;
			const result = await api.user.likedAlbums({ limit: 2000 });
			this.updateLiked("albums", result.data || []);
		},
		async fetchLikedArtists() {
			if (!isAccountLoggedIn()) return;
			const result = await api.user.likedArtists({ limit: 2000 });
			this.updateLiked("artists", result.data || []);
		},
		async fetchLikedMVs() {
			if (!isAccountLoggedIn()) return;
			const result = await api.user.likedMVs({ limit: 1000 });
			this.updateLiked("mvs", result.data || []);
		},
		async fetchCloudDisk() {
			if (!isAccountLoggedIn()) return;
			const result = await api.user.cloudDisk({ limit: 1000 });
			this.updateLiked("cloudDisk", result.data || []);
		},
		async fetchPlayHistory() {
			const user = useDataStore().user;
			if (!user) return;
			const [{ allData }, { weekData }] = await Promise.all([
				api.user.userPlayHistory({ uid: user.userId, type: 0 }),
				api.user.userPlayHistory({ uid: user.userId, type: 1 }),
			]);
			if (allData && weekData) {
				this.updateLiked("playHistory", {
					allData: allData.map(({ song, playCount }) => ({ ...song, playCount })),
					weekData: weekData.map(({ song, playCount }) => ({ ...song, playCount })),
				});
			}
		},
		async fetchUserProfile() {
			if (!isAccountLoggedIn()) return;
			const result = await api.user.userAccount();
			if (result.code !== 200) return;
			useDataStore().update("user", result.profile);
		},
	},
});
