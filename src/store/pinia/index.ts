import { createPinia, defineStore } from 'pinia'
import _state from '../state';
import shortcuts from '@/utils/shortcuts';
import { cloneDeep } from 'es-toolkit';

import { isAccountLoggedIn, isLooseLoggedIn } from '@/utils/auth';
import * as api from '@/api';
import { changeAppearance } from '@/utils/common';
import { toast } from 'vue-sonner'

export const pinia = createPinia()
 
export const useStore = defineStore('store', {
  state: () => _state,
  actions: {
    updateLikedXXX({ name, data }) {
      this.liked[name] = data;
    },
    changeLang(lang) {
      this.settings.lang = lang; 
    },
    changeMusicQuality(value) {
      this.settings.musicQuality = value;
    },
    changeLyricFontSize(value) {
      this.settings.lyricFontSize = value;
    },
    changeOutputDevice(deviceId) {
      this.settings.outputDevice = deviceId;
    },
    updateSettings({ key, value }) {
      this.settings[key] = value;
    },
    updateData({ key, value }) {
      this.data[key] = value;
    },
    togglePlaylistCategory(name) {
      const index = this.settings.enabledPlaylistCategories.findIndex(
        c => c === name
      );
      if (index !== -1) {
        this.settings.enabledPlaylistCategories =
          this.settings.enabledPlaylistCategories.filter(c => c !== name);
      } else {
        this.settings.enabledPlaylistCategories.push(name);
      }
    },
    toggleLyrics() {
      this.showLyrics = !this.showLyrics;
    },
    updateDailyTracks(dailyTracks) {
      this.dailyTracks = dailyTracks;
    },
    updateLastfm(session) {
      this.lastfm = session;
    },
    updateShortcut({ id, type, shortcut }) {
      let newShortcut = this.settings.shortcuts.find(s => s.id === id);
      newShortcut[type] = shortcut;
      this.settings.shortcuts = this.settings.shortcuts.map(s => {
        if (s.id !== id) return s;
        return newShortcut;
      });
    },
    restoreDefaultShortcuts() {
      this.settings.shortcuts = cloneDeep(shortcuts);
    },
    updateTitle(title: string) {
      this.title = title;
    },
    likeATrack(id: number) {
      if (!isAccountLoggedIn()) {
        toast('此操作需要登录网易云账号');
        return;
      }
      let like = true;
      if (this.liked.songs.includes(id)) like = false;
      api.track.likeATrack({ id, like })
        .then(() => {
          if (like === false) {
            this.updateLikedXXX({
              name: 'songs',
              data: this.liked.songs.filter(d => d !== id),
            });
          } else {
            let newLikeSongs = this.liked.songs;
            newLikeSongs.push(id);
            this.updateLikedXXX({
              name: 'songs',
              data: newLikeSongs,
            });
          }
          this.fetchLikedSongsWithDetails();
        })
        .catch(() => {
          toast('操作失败，专辑下架或版权锁定');
        });
    },
    fetchLikedSongs() {
      if (!isLooseLoggedIn()) return;
      if (isAccountLoggedIn()) {
        return api.user.userLikedSongsIDs( this.data.user.userId  ).then(result => {
          if (result.ids) {
            this.updateLikedXXX({
              name: 'songs',
              data: result.ids,
            });
          }
        });
      } else {
        // TODO:搜索ID登录的用户
      }
    },
    fetchLikedSongsWithDetails() {
      return api.playlist.getPlaylistDetail(this.data.likedSongPlaylistID, true).then(
        result => {
          if (result.playlist?.trackIds?.length === 0) {
            return Promise.resolve();
          }
          return api.track.getTrackDetail(
            result.playlist.trackIds
              .slice(0, 12)
              .map(t => t.id)
              .join(',')
          ).then(result => {
            this.updateLikedXXX({
              name: 'songsWithDetails',
              data: result.songs,
            });
          });
        }
      );
    },
    async fetchLikedPlaylist() {
      if (!isLooseLoggedIn()) return;
      if (isAccountLoggedIn()) {
        return api.user.userPlaylist({
          uid: this.data.user?.userId,
          limit: 2000, // 最多只加载2000个歌单（等有用户反馈问题再修）
        }).then(result => {
          if (result.playlist) {
            this.updateLikedXXX({
              name: 'playlists',
              data: result.playlist,
            });
            // 更新用户”喜欢的歌曲“歌单ID
            this.updateData({
              key: 'likedSongPlaylistID',
              value: result.playlist[0].id,
            });
          }
        });
      } else {
        // TODO:搜索ID登录的用户
      }
    },
    fetchLikedAlbums() {
      if (!isAccountLoggedIn()) return;
      return api.user.likedAlbums({ limit: 2000 }).then(result => {
        if (result.data) {
          this.updateLikedXXX({
            name: 'albums',
            data: result.data,
          });
        }
      });
    },
    fetchLikedArtists() {
      if (!isAccountLoggedIn()) return;
      return api.user.likedArtists({ limit: 2000 }).then(result => {
        if (result.data) {
          this.updateLikedXXX({
            name: 'artists',
            data: result.data,
          });
        }
      });
    },
    fetchLikedMVs() {
      if (!isAccountLoggedIn()) return;
      return api.user.likedMVs({ limit: 1000 }).then(result => {
        if (result.data) {
          this.updateLikedXXX({
            name: 'mvs',
            data: result.data,
          });
        }
      });
    },
    fetchCloudDisk() {
      if (!isAccountLoggedIn()) return;
      // FIXME: #1242
      return api.user.cloudDisk({ limit: 1000 }).then(result => {
        if (result.data) {
          this.updateLikedXXX({
            name: 'cloudDisk',
            data: result.data,
          });
        }
      });
    },
    fetchPlayHistory() {
      if (!isAccountLoggedIn()) return;
      return Promise.all([
        api.user.userPlayHistory({ uid: this.data.user?.userId, type: 0 }),
        api.user.userPlayHistory({ uid: this.data.user?.userId, type: 1 }),
      ]).then(result => {
        const data = {};
        const dataType = { 0: 'allData', 1: 'weekData' };
        if (result[0] && result[1]) {
          for (let i = 0; i < result.length; i++) {
            const songData = result[i][dataType[i]].map(item => {
              const song = item.song;
              song.playCount = item.playCount;
              return song;
            });
            data[[dataType[i]]] = songData;
          }
          this.updateLikedXXX({
            name: 'playHistory',
            data: data,
          });
        }
      });
    },
    async fetchUserProfile() {
      if (!isAccountLoggedIn()) return;
      return api.user.userAccount().then(result => {
        if (result.code === 200) {
          this.updateData({ key: 'user', value: result.profile });
        }
      });
    }

  }
});


const store = useStore(pinia);

if ([undefined, null].includes(store.settings.lang)) {
  const defaultLang = 'en';
  const langMapper = new Map()
    .set('zh', 'zh-CN')
    .set('zh-TW', 'zh-TW')
    .set('en', 'en')
    .set('tr', 'tr');
  store.settings.lang =
    langMapper.get(
      langMapper.has(navigator.language)
        ? navigator.language
        : navigator.language.slice(0, 2)
    ) || defaultLang;
  localStorage.setItem('settings', JSON.stringify(store.settings));
}

changeAppearance(store.settings.appearance);

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (store.settings.appearance === 'auto') {
      changeAppearance(store.settings.appearance);
    }
  });



