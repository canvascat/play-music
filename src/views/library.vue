<template>
  <div v-show="show" ref="library">
    <h1>
      <img class="avatar" :src="resizeImage(data.user.avatarUrl)" loading="lazy" />{{ data.user.nickname }}{{
        $t('library.sLibrary') }}
    </h1>
    <div class="section-one">
      <div class="liked-songs" @click="goToLikedSongsList">
        <div class="top">
          <p>
            <span v-for="(line, index) in pickedLyric" v-show="line !== ''" :key="`${line}${index}`">{{ line
              }}<br /></span>
          </p>
        </div>
        <div class="bottom">
          <div class="titles">
            <div class="title">{{ $t('library.likedSongs') }}</div>
            <div class="sub-title">
              {{ liked.songs.length }} {{ $t('common.songs') }}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger @click.stop as-child>
              <button>
                <svg-icon icon-class="play" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="playLikedSongs">{{ $t('library.likedSongs') }}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="playIntelligenceList">{{
                $t('contextMenu.cardiacMode')
                }}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div class="songs">
        <TrackList :id="liked.playlists.length > 0 ? liked.playlists[0].id : 0" :tracks="liked.songsWithDetails"
          :column-number="3" type="tracklist" dbclick-track-func="playPlaylistByID"
          :album-object="{ artist: { name: '' } }" :extra-context-menu-item="[]" :highlight-playing-track="true"
          item-key="id" />
      </div>
    </div>

    <div class="section-two">
      <div class="tabs-row">
        <div class="tabs">
          <div class="tab dropdown" :class="{ active: currentTab === 'playlists' }"
            @click="updateCurrentTab('playlists')">
            <span class="text">{{
              {
                all: $t('contextMenu.allPlaylists'),
                mine: $t('contextMenu.minePlaylists'),
                liked: $t('contextMenu.likedPlaylists'),
              }[playlistFilter]
            }}</span>
            <DropdownMenu>
              <DropdownMenuTrigger @click.stop as-child>
                <span class="icon"><svg-icon icon-class="dropdown" /></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click="changePlaylistFilter('all')">{{
                  $t('contextMenu.allPlaylists')
                  }}</DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem @click="changePlaylistFilter('mine')">{{
                  $t('contextMenu.minePlaylists')
                  }}</DropdownMenuItem>
                <DropdownMenuItem @click="changePlaylistFilter('liked')">{{
                  $t('contextMenu.likedPlaylists')
                  }}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          <div class="tab" :class="{ active: currentTab === 'albums' }" @click="updateCurrentTab('albums')">
            {{ $t('library.albums') }}
          </div>
          <div class="tab" :class="{ active: currentTab === 'artists' }" @click="updateCurrentTab('artists')">
            {{ $t('library.artists') }}
          </div>
          <div class="tab" :class="{ active: currentTab === 'mvs' }" @click="updateCurrentTab('mvs')">
            {{ $t('library.mvs') }}
          </div>
          <div class="tab" :class="{ active: currentTab === 'cloudDisk' }" @click="updateCurrentTab('cloudDisk')">
            {{ $t('library.cloudDisk') }}
          </div>
          <div class="tab" :class="{ active: currentTab === 'playHistory' }" @click="updateCurrentTab('playHistory')">
            {{ $t('library.playHistory.title') }}
          </div>
        </div>
        <button v-show="currentTab === 'playlists'" class="tab-button" @click="openAddPlaylistModal"><svg-icon
            icon-class="plus" />{{ $t('library.newPlayList') }}
        </button>
        <button v-show="currentTab === 'cloudDisk'" class="tab-button" @click="selectUploadFiles"><svg-icon
            icon-class="arrow-up-alt" />{{ $t('library.uploadSongs') }}
        </button>
      </div>

      <div v-show="currentTab === 'playlists'">
        <div v-if="liked.playlists.length > 1">
          <CoverRow :items="filterPlaylists" type="playlist" sub-text="creator" :show-play-button="true" />
        </div>
      </div>

      <div v-show="currentTab === 'albums'">
        <CoverRow :items="liked.albums" type="album" sub-text="artist" :show-play-button="true" />
      </div>

      <div v-show="currentTab === 'artists'">
        <CoverRow :items="liked.artists" type="artist" :show-play-button="true" />
      </div>

      <div v-show="currentTab === 'mvs'">
        <MvRow :mvs="liked.mvs" />
      </div>

      <div v-show="currentTab === 'cloudDisk'">
        <TrackList :id="-8" :tracks="liked.cloudDisk" :column-number="3" type="cloudDisk"
          dbclick-track-func="playCloudDisk" :extra-context-menu-item="['removeTrackFromCloudDisk']"
          :album-object="{ artist: { name: '' } }" :highlight-playing-track="true" item-key="id" />
      </div>

      <div v-show="currentTab === 'playHistory'">
        <button :class="{
          'playHistory-button': true,
          'playHistory-button--selected': playHistoryMode === 'week',
        }" @click="playHistoryMode = 'week'">
          {{ $t('library.playHistory.week') }}
        </button>
        <button :class="{
          'playHistory-button': true,
          'playHistory-button--selected': playHistoryMode === 'all',
        }" @click="playHistoryMode = 'all'">
          {{ $t('library.playHistory.all') }}
        </button>
        <TrackList :tracks="playHistoryList" :column-number="1" type="tracklist" :id="0" dbclick-track-func="default"
          :album-object="{ artist: { name: '' } }" :extra-context-menu-item="[]" :highlight-playing-track="true"
          item-key="id" />
      </div>
    </div>

    <input ref="cloudDiskUploadInput" type="file" style="display: none" @change="uploadSongToCloudDisk" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store/pinia';
import { isAccountLoggedIn } from '@/utils/auth';
import * as api from '@/api';
import NProgress from 'nprogress';
import { resizeImage } from '@/utils/filters';
import { toast } from 'vue-sonner';
import { randomInt } from 'es-toolkit';
import { useI18n } from 'vue-i18n';

import TrackList from '@/components/TrackList.vue';
import CoverRow from '@/components/CoverRow.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import MvRow from '@/components/MvRow.vue';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// 定义接口
interface Playlist {
  id: number;
  creator: {
    userId: number;
  };
  [key: string]: any;
}

interface CloudDiskItem {
  songId: number;
  songName: string;
  [key: string]: any;
}

/**
 * Pick the lyric part from a string formed in `[timecode] lyric`.
 *
 * @param {string} rawLyric The raw lyric string formed in `[timecode] lyric`
 * @returns {string} The lyric part
 */
function extractLyricPart(rawLyric: string): string {
  return rawLyric.split(']').pop()?.trim() || '';
}

const router = useRouter();
const { t } = useI18n();
const {
  data,
  liked,
  player,
  updateModal,
  updateData,
  fetchLikedSongsWithDetails,
  fetchLikedSongs,
  fetchLikedPlaylist,
  fetchLikedAlbums,
  fetchLikedArtists,
  fetchLikedMVs,
  fetchCloudDisk,
  fetchPlayHistory,
  updateLikedXXX
} = useStore();

// 响应式数据
const show = ref(false);

const lyric = ref<string>();
const currentTab = ref('playlists');
const playHistoryMode = ref<'week' | 'all'>('week');
const library = ref<HTMLElement>();
const cloudDiskUploadInput = ref<HTMLInputElement>();

// 计算属性
const pickedLyric = computed((): string[] => {
  // Returns [] if we got no lyrics.
  if (!lyric.value) return [];

  const lyricLine = lyric.value
    .split('\n')
    .filter(line => !line.includes('作词') && !line.includes('作曲'));

  // Pick 3 or fewer lyrics based on the lyric lines.
  const lyricsToPick = Math.min(lyricLine.length, 3);

  // The upperBound of the lyric line to pick
  const randomUpperBound = lyricLine.length - lyricsToPick;
  const startLyricLineIndex = randomInt(0, randomUpperBound - 1);

  // Pick lyric lines to render.
  return lyricLine
    .slice(startLyricLineIndex, startLyricLineIndex + lyricsToPick)
    .map(extractLyricPart);
});

const playlistFilter = computed(() => {
  return data.libraryPlaylistFilter || 'all';
});

const filterPlaylists = computed((): Playlist[] => {
  const playlists = liked.playlists.slice(1);
  const userId = data.user.userId;
  if (playlistFilter.value === 'mine') {
    return playlists.filter(p => p.creator.userId === userId);
  } else if (playlistFilter.value === 'liked') {
    return playlists.filter(p => p.creator.userId !== userId);
  }
  return playlists;
});

const playHistoryList = computed(() => {
  if (show.value && playHistoryMode.value === 'week') {
    return liked.playHistory.weekData;
  }
  if (show.value && playHistoryMode.value === 'all') {
    return liked.playHistory.allData;
  }
  return [];
});

// 生命周期
onMounted(() => {
  setTimeout(() => {
    if (!show.value) NProgress.start();
  }, 1000);
  loadData();
});

onActivated(() => {
  // this.$parent.$refs.scrollbar.restorePosition();
  loadData();
});

// 方法
const loadData = () => {
  if (liked.songsWithDetails.length > 0) {
    NProgress.done();
    show.value = true;
    fetchLikedSongsWithDetails();
    getRandomLyric();
  } else {
    fetchLikedSongsWithDetails().then(() => {
      NProgress.done();
      show.value = true;
      getRandomLyric();
    });
  }
  fetchLikedSongs();
  fetchLikedPlaylist();
  fetchLikedAlbums();
  fetchLikedArtists();
  fetchLikedMVs();
  fetchCloudDisk();
  fetchPlayHistory();
};

const playLikedSongs = () => {
  player.playPlaylistByID(
    liked.playlists[0].id,
    'first',
    true
  );
};

const playIntelligenceList = () => {
  player.playIntelligenceListById(
    liked.playlists[0].id,
    'first',
    true
  );
};

const updateCurrentTab = (tab: string) => {
  if (!isAccountLoggedIn() && tab !== 'playlists') {
    toast(t('toast.needToLogin'));
    return;
  }
  currentTab.value = tab;
  // TODO scrollTo({ top: 375, behavior: 'smooth' });
};

const goToLikedSongsList = () => {
  router.push({ path: '/library/liked-songs' });
};

const getRandomLyric = () => {
  if (liked.songs.length === 0) return;
  api.track.getLyric(
    liked.songs[randomInt(0, liked.songs.length - 1)]
  ).then(data => {
    if (data.lrc !== undefined) {
      const isInstrumental = data.lrc.lyric
        .split('\n')
        .filter(l => l.includes('纯音乐，请欣赏'));
      if (isInstrumental.length === 0) {
        lyric.value = data.lrc.lyric;
      }
    }
  });
};

const openAddPlaylistModal = () => {
  if (!isAccountLoggedIn()) {
    toast(t('toast.needToLogin'));
    return;
  }
  updateModal({
    modalName: 'newPlaylistModal',
    key: 'show',
    value: true,
  });
};




const changePlaylistFilter = (type: string) => {
  updateData({ key: 'libraryPlaylistFilter', value: type });
  window.scrollTo({ top: 375, behavior: 'smooth' });
};

const selectUploadFiles = () => {
  cloudDiskUploadInput.value?.click();
};

const uploadSongToCloudDisk = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  api.user.uploadSong(files[0]).then(result => {
    if (result.code === 200) {
      let newCloudDisk = liked.cloudDisk;
      newCloudDisk.unshift(result.privateCloud);
      updateLikedXXX({
        name: 'cloudDisk',
        data: newCloudDisk,
      });
    }
  });
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 42px;
  color: var(--color-text);
  display: flex;
  align-items: center;

  .avatar {
    height: 44px;
    margin-right: 12px;
    vertical-align: -7px;
    border-radius: 50%;
    border: rgba(0, 0, 0, 0.2);
  }
}

.section-one {
  display: flex;
  margin-top: 24px;

  .songs {
    flex: 7;
    margin-top: 8px;
    margin-left: 36px;
    overflow: hidden;
  }
}

.liked-songs {
  flex: 3;
  margin-top: 8px;
  cursor: pointer;
  border-radius: 16px;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s;
  box-sizing: border-box;

  background: var(--color-primary-bg);

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--color-primary);

    .title {
      font-size: 24px;
      font-weight: 700;
    }

    .sub-title {
      font-size: 15px;
      margin-top: 2px;
    }

    button {
      margin-bottom: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 44px;
      width: 44px;
      background: var(--color-primary);
      border-radius: 50%;
      transition: 0.2s;
      box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.2);
      cursor: default;

      .svg-icon {
        color: var(--color-primary-bg);
        margin-left: 4px;
        height: 16px;
        width: 16px;
      }

      &:hover {
        transform: scale(1.06);
        box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.4);
      }

      &:active {
        transform: scale(0.94);
      }
    }
  }

  .top {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    opacity: 0.88;
    color: var(--color-primary);

    p {
      margin-top: 2px;
    }
  }
}

.section-two {
  margin-top: 54px;
  min-height: calc(100vh - 182px);
}

.tabs-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  font-size: 18px;
  color: var(--color-text);

  .tab {
    font-weight: 600;
    padding: 8px 14px;
    margin-right: 14px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: 0.2s;
    opacity: 0.68;

    &:hover {
      opacity: 0.88;
      background-color: var(--color-secondary-bg);
    }
  }

  .tab.active {
    opacity: 0.88;
    background-color: var(--color-secondary-bg);
  }

  .tab.dropdown {
    display: flex;
    align-items: center;
    padding: 0;
    overflow: hidden;

    .text {
      padding: 8px 3px 8px 14px;
    }

    .icon {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 8px 0 3px;

      .svg-icon {
        height: 16px;
        width: 16px;
      }
    }
  }
}

button.tab-button {
  color: var(--color-text);
  border-radius: 8px;
  padding: 0 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 500;

  .svg-icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }

  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }

  &:active {
    opacity: 1;
    transform: scale(0.92);
  }
}

button.playHistory-button {
  color: var(--color-text);
  border-radius: 8px;
  padding: 6px 8px;
  margin-bottom: 12px;
  margin-right: 4px;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }

  &:active {
    transform: scale(0.95);
  }
}

button.playHistory-button--selected {
  color: var(--color-text);
  background: var(--color-secondary-bg);
  opacity: 1;
  font-weight: 700;

  &:active {
    transform: none;
  }
}
</style>
