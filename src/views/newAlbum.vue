

<script setup lang="ts">
import { newAlbums } from '@/api/album';
import NProgress from 'nprogress';
import { ref, onMounted } from 'vue';

import CoverRow from '@/components/CoverRow.vue';
import type { Album } from '@/types';
import { AlbumListArea } from '@/api/NCMAPI';

const albums = ref<Album[]>([]);

onMounted(() => {
  newAlbums({
    area: AlbumListArea.ea,
    limit: 100,
  }).then(data => {
    albums.value = data.albums;
    NProgress.done();
  });
});
</script>

<template>
  <div class="newAlbum">
    <h1>{{ $t('home.newAlbum') }}</h1>
    <div class="playlist-row">
      <div class="playlists">
        <CoverRow type="album" :items="albums" sub-text="artist" :show-play-button="true" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
h1 {
  color: var(--color-text);
  font-size: 56px;
}
</style>
