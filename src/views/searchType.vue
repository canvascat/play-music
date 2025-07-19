<template>
  <div v-show="show" class="search">
    <h1>
      <span>{{ $t('search.searchFor') }} {{ typeNameTable[type] }}</span> "{{
        keywords
      }}"
    </h1>

    <div v-if="type === 'artists'">
      <CoverRow type="artist" :items="result" :column-number="6" />
    </div>
    <div v-if="type === 'albums'">
      <CoverRow type="album" :items="result" sub-text="artist" sub-text-font-size="14px" />
    </div>
    <div v-if="type === 'tracks'">
      <TrackList :tracks="result" type="playlist" dbclick-track-func="playAList" />
    </div>
    <div v-if="type === 'musicVideos'">
      <MvRow :mvs="result" />
    </div>
    <div v-if="type === 'playlists'">
      <CoverRow type="playlist" :items="result" sub-text="title" />
    </div>

    <div class="load-more">
      <ButtonTwoTone v-show="hasMore" color="grey" v-on:click="fetchData">{{
        $t('explore.loadMore')
        }}</ButtonTwoTone>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTrackDetail } from '@/api/track';
import { search } from '@/api/others';
import { camelCase } from 'es-toolkit';
import NProgress from 'nprogress';
import { useI18n } from 'vue-i18n';
import TrackList from '@/components/TrackList.vue';
import MvRow from '@/components/MvRow.vue';
import CoverRow from '@/components/CoverRow.vue';
import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const show = ref(false);
const result = ref([]);
const hasMore = ref(true);


const keywords = computed(() => {
  return route.params.keywords as string;
});
const type = computed(() => {
  return camelCase(route.params.type as string);
});
const typeNameTable = computed(() => {
  return {
    musicVideos: t('search.mv'),
    tracks: t('search.song'),
    albums: t('search.album'),
    artists: t('search.artist'),
    playlists: t('search.playlist'),
  };
});

onMounted(() => {
  fetchData();
});

function fetchData() {
  const typeTable = {
    musicVideos: 1004,
    tracks: 1,
    albums: 10,
    artists: 100,
    playlists: 1000,
  };
  return search({
    keywords: keywords.value,
    type: typeTable[type.value],
    offset: result.value.length,
  }).then((res) => {
    const data = res.result;
    hasMore.value = data.hasMore ?? true;
    switch (type.value) {
      case 'musicVideos':
        result.value.push(...data.mvs);
        if (data.mvCount <= result.value.length) {
          hasMore.value = false;
        }
        break;
      case 'artists':
        result.value.push(...data.artists);
        break;
      case 'albums':
        result.value.push(...data.albums);
        if (data.albumCount <= result.value.length) {
          hasMore.value = false;
        }
        break;
      case 'tracks':
        result.value.push(...data.songs);
        getTracksDetail();
        break;
      case 'playlists':
        result.value.push(...data.playlists);
        break;
    }
    NProgress.done();
    show.value = true;
  });
}
function getTracksDetail() {
  const trackIDs = result.value.map(t => t.id);
  if (trackIDs.length === 0) return;
  getTrackDetail(trackIDs.join(',')).then(result => {
    result.value = result.songs;
  });
} 
</script>

<style lang="scss" scoped>
h1 {
  margin-top: 32px;
  margin-bottom: 28px;
  color: var(--color-text);

  span {
    opacity: 0.58;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.button.more {
  .svg-icon {
    height: 24px;
    width: 24px;
  }
}
</style>
