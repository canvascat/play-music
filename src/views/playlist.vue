<template>
  <div v-show="show" class="playlist">
    <div v-if="specialPlaylistInfo === undefined && !isLikeSongsPage" class="playlist-info">
      <Cover :id="playlist.id" :image-url="resizeImage(playlist.coverImgUrl, 1024)" :show-play-button="true"
        :always-show-shadow="true" :click-cover-to-play="true" :fixed-size="288" type="playlist" :cover-hover="false"
        :play-button-size="18" />
      <div class="info">
        <div class="title"><span v-if="playlist.privacy === 10" class="lock-icon">
            <svg-icon icon-class="lock" /></span>{{ playlist.name }}</div>
        <div class="artist">
          Playlist by
          <span v-if="
            [
              5277771961, 5277965913, 5277969451, 5277778542, 5278068783,
            ].includes(playlist.id)
          " style="font-weight: 600">Apple Music</span>
          <a v-else :href="`https://music.163.com/#/user/home?id=${playlist.creator.userId}`" target="blank">{{
            playlist.creator.nickname }}</a>
        </div>
        <div class="date-and-count">
          {{ $t('playlist.updatedAt') }}
          {{ formatDate(playlist.updateTime) }} · {{ playlist.trackCount }}
          {{ $t('common.songs') }}
        </div>
        <Description v-if="playlist.description" :description="playlist.description" title="歌单介绍" />
        <div class="buttons">
          <ButtonTwoTone icon-class="play" v-on:click="playPlaylistByID()">
            {{ $t('common.play') }}
          </ButtonTwoTone>
          <ButtonTwoTone v-if="playlist.creator.userId !== data.user.userId"
            :icon-class="playlist.subscribed ? 'heart-solid' : 'heart'" :icon-button="true" :horizontal-padding="0"
            :color="playlist.subscribed ? 'blue' : 'grey'" :text-color="playlist.subscribed ? '#335eea' : ''"
            :background-color="playlist.subscribed ? 'var(--color-secondary-bg)' : ''
              " v-on:click="likePlaylist">
          </ButtonTwoTone>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <ButtonTwoTone icon-class="more" :icon-button="true" :horizontal-padding="0" color="grey">

              </ButtonTwoTone>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="likePlaylist(true)">{{
                playlist.subscribed
                  ? $t('contextMenu.removeFromLibrary')
                  : $t('contextMenu.saveToLibrary')
                }}</DropdownMenuItem>
              <DropdownMenuItem @click="searchInPlaylist()">{{
                $t('contextMenu.searchInPlaylist')
                }}</DropdownMenuItem>
              <DropdownMenuItem v-if="playlist.creator.userId === data.user.userId" @click="editPlaylist">编辑歌单信息
              </DropdownMenuItem>
              <DropdownMenuItem v-if="playlist.creator.userId === data.user.userId" @click="deletePlaylist">删除歌单
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div v-if="displaySearchInPlaylist" class="search-box">
        <div class="container" :class="{ active: inputFocus }">
          <svg-icon icon-class="search" />
          <div class="input">
            <input v-model.trim="inputSearchKeyWords" :placeholder="inputFocus ? '' : $t('playlist.search')"
              @input="inputDebounce()" @focus="inputFocus = true" @blur="inputFocus = false" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="specialPlaylistInfo !== undefined" class="special-playlist">
      <div class="title" :class="specialPlaylistInfo.gradient">
        {{ specialPlaylistInfo.name }}
      </div>
      <div class="subtitle">{{ playlist.englishTitle }} · {{ playlist.updateFrequency }}
      </div>

      <div class="buttons">
        <ButtonTwoTone class="play-button" icon-class="play" color="grey" v-on:click="playPlaylistByID()">
          {{ $t('common.play') }}
        </ButtonTwoTone>
        <ButtonTwoTone v-if="playlist.creator.userId !== data.user.userId"
          :icon-class="playlist.subscribed ? 'heart-solid' : 'heart'" :icon-button="true" :horizontal-padding="0"
          :color="playlist.subscribed ? 'blue' : 'grey'" :text-color="playlist.subscribed ? '#335eea' : ''"
          :background-color="playlist.subscribed ? 'var(--color-secondary-bg)' : ''
            " v-on:click="likePlaylist">
        </ButtonTwoTone>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <ButtonTwoTone icon-class="more" :icon-button="true" :horizontal-padding="0" color="grey">

            </ButtonTwoTone>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="likePlaylist(true)">{{
              playlist.subscribed
                ? $t('contextMenu.removeFromLibrary')
                : $t('contextMenu.saveToLibrary')
            }}</DropdownMenuItem>
            <DropdownMenuItem @click="searchInPlaylist()">{{
              $t('contextMenu.searchInPlaylist')
            }}</DropdownMenuItem>
            <DropdownMenuItem v-if="playlist.creator.userId === data.user.userId" @click="editPlaylist">编辑歌单信息
            </DropdownMenuItem>
            <DropdownMenuItem v-if="playlist.creator.userId === data.user.userId" @click="deletePlaylist">删除歌单
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


      </div>
    </div>

    <div v-if="isLikeSongsPage" class="user-info">
      <h1>
        <img class="avatar" :src="resizeImage(data.user.avatarUrl)" loading="lazy" />
        {{ data.user.nickname }}{{ $t('library.sLikedSongs') }}
      </h1>
      <div class="search-box-likepage" @click="searchInPlaylist()">
        <div class="container" :class="{ active: inputFocus }">
          <svg-icon icon-class="search" />
          <div class="input" :style="{ width: searchInputWidth }">
            <input v-if="displaySearchInPlaylist" v-model.trim="inputSearchKeyWords" v-focus
              :placeholder="inputFocus ? '' : $t('playlist.search')" @input="inputDebounce()" @focus="inputFocus = true"
              @blur="inputFocus = false" />
          </div>
        </div>
      </div>
    </div>

    <TrackList :id="playlist.id" :tracks="filteredTracks" type="playlist" :extra-context-menu-item="isUserOwnPlaylist ? ['removeTrackFromPlaylist'] : []
      " @removeTrack="removeTrack" />

    <div class="load-more">
      <ButtonTwoTone v-show="hasMore" color="grey" :loading="loadingMore" v-on:click="loadMore(100)">{{
        $t('explore.loadMore') }}</ButtonTwoTone>
    </div>




  </div>
</template>

<script setup lang="ts">
import NProgress from "nprogress";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import * as api from "@/api";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import Cover from "@/components/Cover.vue";
import Description from "@/components/Description.tsx";
import TrackList from "@/components/TrackList.vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { specialPlaylist } from "@/const";
import { useStore } from "@/store/pinia";
import type { Playlist } from "@/types";
import { isAccountLoggedIn } from "@/utils/auth";
import { formatDate, resizeImage } from "@/utils/filters";
import nativeAlert from "@/utils/nativeAlert";

const { player, data } = useStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const show = ref(false);
const playlist = ref<Playlist>({
  id: 0,
  coverImgUrl: "",
  creator: Object.create(null),
  trackIds: [],
  description: "",
} as any);

const tracks = ref([]);
const loadingMore = ref(false);
const hasMore = ref(false);
const lastLoadedTrackIndex = ref(9);
const displaySearchInPlaylist = ref(false); // 是否显示搜索框
const searchKeyWords = ref(""); // 搜索使用的关键字
const inputSearchKeyWords = ref(""); // 搜索框中正在输入的关键字
const inputFocus = ref(false);
let debounceTimeout: number;
const searchInputWidth = ref("0px"); // 搜索框宽度

const isLikeSongsPage = computed(() => {
  return route.name === "likedSongs";
});
const specialPlaylistInfo = computed(() => {
  return specialPlaylist[playlist.value.id];
});
const isUserOwnPlaylist = computed(() => {
  return (
    playlist.value.creator.userId === data.user.userId &&
    playlist.value.id !== data.likedSongPlaylistID
  );
});
const filteredTracks = computed(() => {
  return tracks.value.filter(
    (track) =>
      (track.name && track.name.toLowerCase().includes(searchKeyWords.value.toLowerCase())) ||
      (track.al.name && track.al.name.toLowerCase().includes(searchKeyWords.value.toLowerCase())) ||
      track.ar.find(
        (artist) =>
          artist.name && artist.name.toLowerCase().includes(searchKeyWords.value.toLowerCase()),
      ),
  );
});

onMounted(() => {
  if (route.name === "likedSongs") {
    loadData(data.likedSongPlaylistID);
  } else {
    loadData(route.params.id);
  }
  setTimeout(() => {
    if (!show.value) NProgress.start();
  }, 1000);
});

function playPlaylistByID(trackID = "first") {
  const trackIDs = playlist.value.trackIds.map((t) => t.id);
  player.replacePlaylist(trackIDs, playlist.value.id, "playlist", trackID);
}
function likePlaylist(showToast = false) {
  if (!isAccountLoggedIn()) {
    toast(t("toast.needToLogin"));
    return;
  }
  api.playlist
    .subscribePlaylist({
      id: playlist.value.id,
      t: playlist.value.subscribed ? 2 : 1,
    })
    .then((data) => {
      if (data.code === 200) {
        playlist.value.subscribed = !playlist.value.subscribed;
        if (showToast === true)
          toast(playlist.value.subscribed ? "已保存到音乐库" : "已从音乐库删除");
      }
      api.playlist.getPlaylistDetail(playlist.value.id, true).then((data) => {
        playlist.value = data.playlist;
      });
    });
}
function loadData(id, next = undefined) {
  playlist.value.id = id;
  api.playlist
    .getPlaylistDetail(playlist.value.id, true)
    .then((data) => {
      playlist.value = data.playlist;
      tracks.value = data.playlist.tracks;
      NProgress.done();
      if (next !== undefined) next();
      show.value = true;
      lastLoadedTrackIndex.value = data.playlist.tracks.length - 1;
      return data;
    })
    .then(() => {
      if (playlist.value.trackCount > tracks.value.length) {
        loadingMore.value = true;
        loadMore();
      }
    });
}
function loadMore(loadNum = 100) {
  let trackIDs = playlist.value.trackIds.filter((t, index) => {
    if (index > lastLoadedTrackIndex.value && index <= lastLoadedTrackIndex.value + loadNum) {
      return t;
    }
  });
  trackIDs = trackIDs.map((t) => t.id);
  api.track.getTrackDetail(trackIDs.join(",")).then((data) => {
    tracks.value.push(...data.songs);
    lastLoadedTrackIndex.value += trackIDs.length;
    loadingMore.value = false;
    if (lastLoadedTrackIndex.value + 1 === playlist.value.trackIds.length) {
      hasMore.value = false;
    } else {
      hasMore.value = true;
    }
  });
}

function deletePlaylist() {
  if (!isAccountLoggedIn()) {
    toast(t("toast.needToLogin"));
    return;
  }
  const confirmation = confirm(`确定要删除歌单 ${playlist.value.name}？`);
  if (confirmation === true) {
    api.playlist.deletePlaylist(playlist.value.id).then((data) => {
      if (data.code === 200) {
        nativeAlert(`已删除歌单 ${playlist.value.name}`);
        router.go(-1);
      } else {
        nativeAlert("发生错误");
      }
    });
  }
}
function editPlaylist() {
  nativeAlert("此功能开发中");
}
function searchInPlaylist() {
  displaySearchInPlaylist.value = !displaySearchInPlaylist.value || isLikeSongsPage.value;
  if (displaySearchInPlaylist.value == false) {
    searchKeyWords.value = "";
    inputSearchKeyWords.value = "";
  } else {
    searchInputWidth.value = "172px";
    loadMore(500);
  }
}
function removeTrack(trackID) {
  if (!isAccountLoggedIn()) {
    toast(t("toast.needToLogin"));
    return;
  }
  tracks.value = tracks.value.filter((t) => t.id !== trackID);
}
function inputDebounce() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchKeyWords.value = inputSearchKeyWords.value;
  }, 600);
}
</script>

<style lang="scss" scoped>
.playlist {
  margin-top: 32px;
}

.playlist-info {
  display: flex;
  margin-bottom: 72px;
  position: relative;

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;

    .title {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text);

      .lock-icon {
        opacity: 0.28;
        color: var(--color-text);
        margin-right: 8px;

        .svg-icon {
          height: 26px;
          width: 26px;
        }
      }
    }

    .artist {
      font-size: 18px;
      opacity: 0.88;
      color: var(--color-text);
      margin-top: 24px;
    }

    .date-and-count {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 2px;
    }


    .buttons {
      margin-top: 32px;
      display: flex;

      button {
        margin-right: 16px;
      }
    }
  }
}

.special-playlist {
  margin-top: 192px;
  margin-bottom: 128px;
  border-radius: 1.25em;
  text-align: center;

  @keyframes letterSpacing4 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 4px;
    }
  }

  @keyframes letterSpacing1 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 1px;
    }
  }

  .title {
    font-size: 84px;
    line-height: 1.05;
    font-weight: 700;
    text-transform: uppercase;

    letter-spacing: 4px;
    animation-duration: 0.8s;
    animation-name: letterSpacing4;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    // background-image: linear-gradient(
    //   225deg,
    //   var(--color-primary),
    //   var(--color-primary)
    // );

    img {
      height: 78px;
      border-radius: 0.125em;
      margin-right: 24px;
    }
  }

  .subtitle {
    font-size: 18px;
    letter-spacing: 1px;
    margin: 28px 0 54px 0;
    animation-duration: 0.8s;
    animation-name: letterSpacing1;
    text-transform: uppercase;
    color: var(--color-text);
  }

  .buttons {
    margin-top: 32px;
    display: flex;
    justify-content: center;

    button {
      margin-right: 16px;
    }
  }
}

.gradient-test {
  background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
}

[data-theme='dark'] {
  .gradient-radar {
    background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
  }
}

.gradient-radar {
  background-image: linear-gradient(to left, #0ba360 0%, #3cba92 100%);
}

.gradient-blue-purple {
  background-image: linear-gradient(45deg,
      #89c4f5 0%,
      #6284ff 42%,
      #ff0000 100%);
}

.gradient-sharp-blue {
  background-image: linear-gradient(45deg, #00c6fb 0%, #005bea 100%);
}

.gradient-yellow-pink {
  background-image: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
}

.gradient-pink {
  background-image: linear-gradient(45deg, #ee9ca7 0%, #ffdde1 100%);
}

.gradient-indigo-pink-yellow {
  background-image: linear-gradient(43deg,
      #4158d0 0%,
      #c850c0 46%,
      #ffcc70 100%);
}

.gradient-light-red-light-blue {
  background-image: linear-gradient(225deg,
      hsl(190, 30%, 50%) 0%,
      #081abb 38%,
      #ec3841 58%,
      hsl(13, 99%, 49%) 100%);
}

.gradient-fog {
  background: linear-gradient(-180deg, #bcc5ce 0%, #929ead 98%),
    radial-gradient(at top left,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(0, 0, 0, 0.3) 100%);
  background-blend-mode: screen;
}

.gradient-red {
  background-image: linear-gradient(213deg, #ff0844 0%, #ffb199 100%);
}

.gradient-sky-blue {
  background-image: linear-gradient(147deg, #48c6ef 0%, #6f86d6 100%);
}

.gradient-dark-blue-midnight-blue {
  background-image: linear-gradient(213deg, #09203f 0%, #537895 100%);
}

.gradient-yellow-red {
  background: linear-gradient(147deg, #fec867 0%, #f72c61 100%);
}

.gradient-yellow {
  background: linear-gradient(147deg, #fceb02 0%, #fec401 100%);
}

.gradient-midnight-blue {
  background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
}

.gradient-orange-red {
  background-image: linear-gradient(147deg, #ffe53b 0%, #ff2525 74%);
}

.gradient-moonstone-blue {
  background-image: linear-gradient(147deg,
      hsl(200, 34%, 8%) 0%,
      hsl(204, 35%, 38%) 50%,
      hsl(200, 34%, 18%) 100%);
}

.gradient-pink-purple-blue {
  background-image: linear-gradient(to right,
      #ff3cac 0%,
      #784ba0 50%,
      #2b86c5 100%) !important;
}

.gradient-green {
  background-image: linear-gradient(90deg,
      #c6f6d5,
      #68d391,
      #38b2ac) !important;
}

.user-info {
  h1 {
    font-size: 42px;
    position: relative;
    color: var(--color-text);

    .avatar {
      height: 44px;
      margin-right: 12px;
      vertical-align: -7px;
      border-radius: 50%;
      border: rgba(0, 0, 0, 0.2);
    }
  }
}

.search-box {
  display: flex;
  position: absolute;
  right: 20px;
  bottom: -55px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;

    margin: {
      left: 8px;
      right: 4px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);

    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box {
    .active {

      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

.search-box-likepage {
  display: flex;
  position: absolute;
  right: 12vw;
  top: 95px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .input {
    transition: all 0.5s;
  }

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;

    margin: {
      left: 8px;
      right: 8px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);

    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box-likepage {
    .active {

      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

@media (max-width: 1336px) {
  .search-box-likepage {
    right: 8vw;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
