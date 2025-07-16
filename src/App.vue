<template>
  <Navbar v-show="showNavbar" ref="navbar" />
  <ScrollArea as="main"
    scroll-bar-class="top-[64px]! bottom-[64px]! h-[auto]!"
    class="fixed! left-0 right-0 top-0 bottom-0">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </ScrollArea>
  <transition name="slide-up">
    <Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
  </transition>

  <ModalAddTrackToPlaylist v-if="isAccountLoggedIn" />
  <ModalNewPlaylist v-if="isAccountLoggedIn" />
  <transition v-if="enablePlayer" name="slide-up">
    <Lyrics v-show="showLyrics" />
  </transition>

  <Toaster />
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import ModalAddTrackToPlaylist from './components/ModalAddTrackToPlaylist.vue';
import ModalNewPlaylist from './components/ModalNewPlaylist.vue';
// import Scrollbar from './components/Scrollbar.vue';
import Navbar from './components/Navbar.vue';
import Player from './components/Player.vue';
import { ScrollArea } from '@/components/ui/scroll-area'

import * as auth from '@/utils/auth';
import Lyrics from './views/lyrics.vue';
import { useStore } from '@/store/pinia';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({ name: 'App' });

const store = useStore()

const showLyrics = computed(() => store.showLyrics);
const player = computed(() => store.player);

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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  fetchData();
});
</script>

<style>
main > [data-reka-scroll-area-viewport] {
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
}

@media (max-width: 1336px) {
  main > [data-reka-scroll-area-viewport] {
    padding: 64px 5vw 96px 5vw;
  }
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
