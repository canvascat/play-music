<template>
  <div class="fm" :style="{ background }" data-theme="dark">
    <img :src="nextTrackCover" style="display: none" loading="lazy" />
    <img class="cover" :src="resizeImage(track.album && track.album.picUrl, 512)" loading="lazy" @click="goToAlbum" />
    <div class="right-part">
      <div class="info">
        <div class="title">{{ track.name }}</div>
        <div class="artist">
          <ArtistsInLine :artists="artists" />
        </div>
      </div>
      <div class="controls">
        <div class="buttons">
          <button-icon title="不喜欢" v-on:click="moveToFMTrash">
            <svg-icon id="thumbs-down" icon-class="thumbs-down" />
          </button-icon>
          <button-icon :title="$t(isPlaying ? 'player.pause' : 'player.play')" class="play" v-on:click="play">
            <svg-icon :icon-class="isPlaying ? 'pause' : 'play'" />
          </button-icon>
          <button-icon :title="$t('player.next')" v-on:click="next">
            <svg-icon icon-class="next" />
          </button-icon>
        </div>
        <div class="card-name"><svg-icon icon-class="fm" />私人FM</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonIcon from "@/components/ButtonIcon.vue";
import ArtistsInLine from "@/components/ArtistsInLine.vue";

import { useStore } from "@/store/pinia";
import * as Vibrant from "node-vibrant/dist/vibrant.worker.min.js";
import Color from "color";
import { resizeImage } from "@/utils/filters";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
const { player } = useStore();

const router = useRouter();

const background = ref("");

const track = computed(() => player.personalFMTrack);
const isPlaying = computed(() => player.playing && player.isPersonalFM);
const artists = computed(() => track.value.artists || track.value.ar || []);
const nextTrackCover = computed(
	() =>
		`${player._personalFMNextTrack?.album?.picUrl.replace("http://", "https://")}?param=512y512`,
);

watch(track, () => {
	getColor();
});

const play = () => {
	player.playPersonalFM();
};
const next = () => {
	player.playNextFMTrack();
};
const goToAlbum = () => {
	if (track.value.album.id === 0) return;
	router.push({ path: "/album/" + track.value.album.id });
};
const moveToFMTrash = () => {
	player.moveToFMTrash();
};
const getColor = () => {
	if (!track.value.album?.picUrl) return;
	const cover = `${track.value.album.picUrl.replace("http://", "https://")}?param=512y512`;
	Vibrant.from(cover, { colorCount: 1 })
		.getPalette()
		.then((palette) => {
			const color = Color.rgb(palette.Vibrant._rgb).darken(0.1).rgb().string();
			const color2 = Color.rgb(palette.Vibrant._rgb).lighten(0.28).rotate(-30).rgb().string();
			background.value = `linear-gradient(to top left, ${color}, ${color2})`;
		});
};

getColor();
</script>

<style lang="scss" scoped>
.fm {
  padding: 1rem;
  background: var(--color-secondary-bg);
  border-radius: 1rem;
  display: flex;
  height: 198px;
  box-sizing: border-box;
}

.cover {
  height: 100%;
  clip-path: border-box;
  border-radius: 0.75rem;
  margin-right: 1.2rem;
  cursor: pointer;
  user-select: none;
}

.right-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text);
  width: 100%;

  .title {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }

  .artist {
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: break-all;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-left: -0.4rem;

    .buttons {
      display: flex;
    }

    .button-icon {
      margin: 0 8px 0 0;
    }

    .svg-icon {
      width: 24px;
      height: 24px;
    }

    .svg-icon#thumbs-down {
      width: 22px;
      height: 22px;
    }

    .card-name {
      font-size: 1rem;
      opacity: 0.18;
      display: flex;
      align-items: center;
      font-weight: 600;
      user-select: none;

      .svg-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
    }
  }
}
</style>
