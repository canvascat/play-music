<template>
  <div id="app" :class="{ 'user-select-none': userSelectNone }">
    <Scrollbar v-show="!showLyrics" ref="scrollbar" :main="main" v-model:user-select-none="userSelectNone" />
    <Navbar v-show="showNavbar" ref="navbar" />
    <main ref="main" :style="{ overflow: enableScrolling ? 'auto' : 'hidden' }" @scroll="handleScroll" class="main">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
    <transition name="slide-up">
      <Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
    </transition>
    <Toast />
    <ModalAddTrackToPlaylist v-if="isAccountLoggedIn" />
    <ModalNewPlaylist v-if="isAccountLoggedIn" />
    <transition v-if="enablePlayer" name="slide-up">
      <Lyrics v-show="showLyrics" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import ModalAddTrackToPlaylist from './components/ModalAddTrackToPlaylist.vue';
import ModalNewPlaylist from './components/ModalNewPlaylist.vue';
import Scrollbar from './components/Scrollbar.vue';
import Navbar from './components/Navbar.vue';
import Player from './components/Player.vue';
import Toast from './components/Toast.vue';

import * as auth from '@/utils/auth';
import Lyrics from './views/lyrics.vue';
import { useStore } from '@/store/pinia';
import { computed, onMounted, provide, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import { restorePositionSymbol } from './injectionSymbols';

const main = useTemplateRef('main');
const scrollbar = useTemplateRef('scrollbar');

defineOptions({ name: 'App' });

const userSelectNone = ref(false);

const store = useStore()

const showLyrics = computed(() => store.showLyrics);
const player = computed(() => store.player);
const enableScrolling = computed(() => store.enableScrolling);

const isAccountLoggedIn = computed(() => auth.isAccountLoggedIn());
const route = useRoute();

const showPlayer = computed(() => {
  return !['mv', 'loginUsername', 'login', 'loginAccount', 'lastfmCallback'].includes(route.name as string);
});

const enablePlayer = computed(() => {
  return player.value.enabled && route.name !== 'lastfmCallback';
});

const showNavbar = computed(() => {
  return route.name !== 'lastfmCallback';
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    if (e.target && 'tagName' in e.target && e.target.tagName === 'INPUT') return false;
    if (route.name === 'mv') return false;
    e.preventDefault();
    player.value.playOrPause();
  }
};

function fetchData() {
  if (!auth.isLooseLoggedIn()) return;
  store.fetchLikedSongs();
  store.fetchLikedSongsWithDetails();
  store.fetchLikedPlaylist();
  if (auth.isAccountLoggedIn()) {
    store.fetchLikedAlbums();
    store.fetchLikedArtists();
    store.fetchLikedMVs();
    store.fetchCloudDisk();
  }
}

const handleScroll = (payload: Event) => {
  scrollbar.value?.handleScroll(payload);
};


onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  fetchData();
});

defineExpose({
  main, scrollbar
});
provide(restorePositionSymbol, () => scrollbar.value?.restorePosition());
</script>

<style lang="scss">
#app {
  width: 100%;
  transition: all 0.4s;
}

main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
  scrollbar-width: none; // firefox
}

@media (max-width: 1336px) {
  main {
    padding: 64px 5vw 96px 5vw;
  }
}

main::-webkit-scrollbar {
  width: 0px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
