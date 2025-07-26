<template>
  <div v-show="show" class="home">
    <div
      v-if="settings.showPlaylistsByAppleMusic !== false"
      class="index-row first-row"
    >
      <div class="title" @click="toast('Hello')"> by Apple Music </div>
      <CoverRow
        type="playlist"
        :items="byAppleMusic"
        sub-text="appleMusic"
        :image-size="1024"
      />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t('home.recommendPlaylist') }}
        <router-link to="/explore?category=推荐歌单">{{
          $t('home.seeMore')
        }}</router-link>
      </div>
      <CoverRow
        type="playlist"
        :items="recommendPlaylist.items"
        sub-text="copywriter"
      />
    </div>
    <div class="index-row">
      <div class="title"> For You </div>
      <div class="for-you-row">
        <DailyTracksCard ref="dailyTracksCardRef" />
        <FMCard />
      </div>
    </div>
    <div class="index-row">
      <div class="title">{{ $t('home.recommendArtist') }}</div>
      <CoverRow
        type="artist"
        :column-number="6"
        :items="recommendArtists.items"
      />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t('home.newAlbum') }}
        <router-link to="/new-album">{{ $t('home.seeMore') }}</router-link>
      </div>
      <CoverRow
        type="album"
        :items="newReleasesAlbum.items"
        sub-text="artist"
      />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t('home.charts') }}
        <router-link to="/explore?category=排行榜">{{
          $t('home.seeMore')
        }}</router-link>
      </div>
      <CoverRow
        type="playlist"
        :items="topList.items"
        sub-text="updateFrequency"
        :image-size="1024"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated } from "vue";
import { useStore } from "@/store/pinia";
import { toast } from "vue-sonner";
import * as api from "@/api";
import { byAppleMusic } from "@/utils/staticData";
import { getRecommendPlayList } from "@/utils/playList";
import NProgress from "nprogress";
import CoverRow from "@/components/CoverRow.vue";
import FMCard from "@/components/FMCard.vue";
import DailyTracksCard from "@/components/DailyTracksCard.vue";

// 定义接口
interface PlaylistItem {
	id: number;
	name: string;
	coverImgUrl: string;
	copywriter?: string;
	updateFrequency?: string;
	[key: string]: any;
}

interface AlbumItem {
	id: number;
	name: string;
	picUrl: string;
	artist: {
		id: number;
		name: string;
	};
	[key: string]: any;
}

interface ArtistItem {
	id: number;
	name: string;
	img1v1Url: string;
	[key: string]: any;
}

interface RecommendPlaylist {
	items: PlaylistItem[];
}

interface NewReleasesAlbum {
	items: AlbumItem[];
}

interface TopList {
	items: PlaylistItem[];
	ids: number[];
}

interface RecommendArtists {
	items: ArtistItem[];
	indexs: number[];
}

const { settings } = useStore();

// 响应式数据
const show = ref(false);
const recommendPlaylist = ref<RecommendPlaylist>({ items: [] });
const newReleasesAlbum = ref<NewReleasesAlbum>({ items: [] });
const topList = ref<TopList>({
	items: [],
	ids: [19723756, 180106, 60198, 3812895, 60131],
});
const recommendArtists = ref<RecommendArtists>({
	items: [],
	indexs: [],
});

// 模板引用
const dailyTracksCardRef = ref<InstanceType<typeof DailyTracksCard>>();

// 生命周期
onActivated(() => {
	loadData();
	// TODO scrollbar.restorePosition?.();
});

// 方法
const loadData = () => {
	setTimeout(() => {
		if (!show.value) NProgress.start();
	}, 1000);

	getRecommendPlayList(10, false).then((items) => {
		recommendPlaylist.value.items = items;
		NProgress.done();
		show.value = true;
	});

	api.album
		.newAlbums({
			area: settings.musicLanguage ?? "ALL",
			limit: 10,
		})
		.then((data) => {
			newReleasesAlbum.value.items = data.albums;
		});

	const toplistOfArtistsAreaTable: Record<string, number | null> = {
		all: null,
		zh: 1,
		ea: 2,
		jp: 4,
		kr: 3,
	};

	const area = toplistOfArtistsAreaTable[settings.musicLanguage ?? "all"];
	if (area !== null) {
		api.artist.toplistOfArtists(area).then((data) => {
			const indexs: number[] = [];
			while (indexs.length < 6) {
				const tmp = ~~(Math.random() * 100);
				if (!indexs.includes(tmp)) indexs.push(tmp);
			}
			recommendArtists.value.indexs = indexs;
			recommendArtists.value.items = data.list.artists.filter((l: ArtistItem, index: number) =>
				indexs.includes(index),
			);
		});
	}

	api.playlist.toplists().then((data) => {
		topList.value.items = data.list.filter((l: PlaylistItem) => topList.value.ids.includes(l.id));
	});

	dailyTracksCardRef.value?.loadDailyTracks();
};
</script>

<style lang="scss" scoped>
.index-row {
  margin-top: 54px;
}
.index-row.first-row {
  margin-top: 32px;
}
.playlists {
  display: flex;
  flex-wrap: wrap;
  margin: {
    right: -12px;
    left: -12px;
  }
  .index-playlist {
    margin: 12px 12px 24px 12px;
  }
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

footer {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.for-you-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 78px;
}
</style>
