<template>
  <div class="mv-page">
    <div class="current-video">
      <div class="video">
        <video ref="videoPlayer" class="plyr"></video>
      </div>
      <div class="video-info">
        <div class="title">
          <router-link :to="'/artist/' + mv.data.artistId">{{
            mv.data.artistName
          }}</router-link>
          -
          {{ mv.data.name }}
          <div class="buttons">
            <button-icon class="button" v-on:click="likeMV">
              <svg-icon v-if="mv.subed" icon-class="heart-solid"></svg-icon>
              <svg-icon v-else icon-class="heart"></svg-icon>
            </button-icon>
            <button-icon class="button" v-on:click="openMenu">
              <svg-icon icon-class="more"></svg-icon>
            </button-icon>
          </div>
        </div>
        <div class="info">
          {{ formatPlayCount(mv.data.playCount) }} Views ·
          {{ mv.data.publishTime }}
        </div>
      </div>
    </div>
    <div class="more-video">
      <div class="section-title">{{ $t('mv.moreVideo') }}</div>
      <MvRow :mvs="simiMvs" />
    </div>
    <ContextMenu ref="mvMenu">
      <div class="item" @click="copyUrl(mv.data.id)">{{
        $t('contextMenu.copyUrl')
      }}</div>
      <div class="item" @click="openInBrowser(mv.data.id)">{{
        $t('contextMenu.openInBrowser')
      }}</div>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { mvDetail, mvUrl, simiMv, likeAMV } from '@/api/mv.ts';
import { isAccountLoggedIn } from '@/utils/auth';
import NProgress from 'nprogress';
import '@/assets/css/plyr.css';
import Plyr from 'plyr';

import ButtonIcon from '@/components/ButtonIcon.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import MvRow from '@/components/MvRow.vue';
import { useStore } from '@/store/pinia';
import { copyText } from '@/utils/copy';
import { formatPlayCount } from '@/utils/filters';

import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner'

const { t } = useI18n();

defineOptions({
  name: 'mv',
});
const videoPlayer = ref<HTMLVideoElement | null>(null);
const mvMenu = ref<InstanceType<typeof ContextMenu> | null>(null);

onBeforeRouteUpdate((to, _from, next) => {
  getData(to.params.id as string);
  next();
});

const mv = ref({
  url: '',
  data: {
    id: '',
    name: '',
    artistName: '',
    playCount: '',
    publishTime: '',
    cover: '',
    artistId: '',
  },
  subed: false,
});
let mvPlayer: Plyr | null = null;
const simiMvs = ref<any[]>([]);

const { player } = useStore();
const route = useRoute();
onMounted(() => {
  let videoOptions = {
    settings: ['quality'],
    autoplay: false,
    quality: {
      default: 1080,
      options: [1080, 720, 480, 240],
    },
  };
  videoOptions.autoplay = route.query.autoplay === 'true';
  mvPlayer = new Plyr(videoPlayer.value!, videoOptions);
  mvPlayer.volume = player.volume;
  mvPlayer.on('playing', () => {
    player.pause();
  });
  getData(route.params.id as string);
});

function getData(id: string) {
  mvDetail(id).then(data => {
    mv.value = data; 
    Promise.all(data.data.brs.map(br => mvUrl({ id, r: br.br }))).then(results => {
      let sources = results.map(result => {
        return {
          src: result.data.url.replace(/^http:/, 'https:'),
          type: 'video/mp4',
          size: result.data.r,
        };
      });
      mvPlayer!.source = {
        type: 'video',
        title: mv.value.data.name,
        sources: sources,
        poster: mv.value.data.cover.replace(/^http:/, 'https:'),
      };
      NProgress.done();
    });
  });
  simiMv(id).then(data => {
    simiMvs.value = data.mvs;
  });
}
function likeMV() {
  if (!isAccountLoggedIn()) {
    toast(t('toast.needToLogin'));
    return;
  }
  likeAMV({
    mvid: mv.value.data.id,
    t: mv.value.subed ? 0 : 1,
  }).then(data => {
    if (data.code === 200) mv.value.subed = !mv.value.subed;
  });
}
function openMenu(e: Event) {
  mvMenu.value?.openMenu(e as MouseEvent);
}
function copyUrl(id: string) {

  copyText(`https://music.163.com/#/mv?id=${id}`)
    .then(function () {
      toast(t('toast.copied'));
    })
    .catch(error => {
      toast(`${t('toast.copyFailed')}${error}`);
    });
}
function openInBrowser(id: string) {
  const url = `https://music.163.com/#/mv?id=${id}`;
  window.open(url);
}
</script>
<style lang="scss" scoped>
.video {
  --plyr-color-main: #335eea;
  --plyr-control-radius: 8px;
}

.mv-page {
  width: 100%;
  margin-top: 32px;
}

.current-video {
  width: 100%;
}

.video {
  border-radius: 16px;
  background: transparent;
  overflow: hidden;
  max-height: 100vh;
}

.video-info {
  margin-top: 12px;
  color: var(--color-text);

  .title {
    font-size: 24px;
    font-weight: 600;
  }

  .artist {
    font-size: 14px;
    opacity: 0.88;
    margin-top: 2px;
    font-weight: 600;
  }

  .info {
    font-size: 12px;
    opacity: 0.68;
    margin-top: 12px;
  }
}

.more-video {
  margin-top: 48px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    opacity: 0.88;
    margin-bottom: 12px;
  }
}

.buttons {
  display: inline-block;

  .button {
    display: inline-block;
  }

  .svg-icon {
    height: 18px;
    width: 18px;
    color: var(--color-primary);
  }
}
</style>
