<template>
	<div v-show="show" class="home">
		<div v-if="settings.showPlaylistsByAppleMusic !== false" class="index-row first-row">
			<div class="title" @click="toast('Hello')">by Apple Music</div>
			<CoverRow type="playlist" :items="byAppleMusic" sub-text="appleMusic" :image-size="1024" />
		</div>
		<div class="index-row">
			<div class="title">
				{{ $t("home.recommendPlaylist") }}
				<router-link to="/explore?category=推荐歌单">{{ $t("home.seeMore") }}</router-link>
			</div>
			<CoverRow type="playlist" :items="recommendPlaylist" sub-text="copywriter" />
		</div>
		<div class="index-row">
			<div class="title">For You</div>
			<div class="for-you-row">
				<DailyTracksCard ref="dailyTracksCardRef" />
				<FMCard />
			</div>
		</div>
		<div class="index-row">
			<div class="title">{{ $t("home.recommendArtist") }}</div>
			<CoverRow type="artist" :column-number="6" :items="recommendArtists" />
		</div>
		<div class="index-row">
			<div class="title">
				{{ $t("home.newAlbum") }}
				<router-link to="/new-album">{{ $t("home.seeMore") }}</router-link>
			</div>
			<CoverRow type="album" :items="newReleasesAlbum" sub-text="artist" />
		</div>
		<div class="index-row">
			<div class="title">
				{{ $t("home.charts") }}
				<router-link to="/explore?category=排行榜">{{ $t("home.seeMore") }}</router-link>
			</div>
			<CoverRow type="playlist" :items="topList" sub-text="updateFrequency" :image-size="1024" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onActivated } from "vue";
import { toast } from "vue-sonner";
import * as api from "@/api";
import { byAppleMusic } from "@/utils/staticData";
import { getRecommendPlayList } from "@/utils/playList";
import NProgress from "nprogress";
import CoverRow from "@/components/CoverRow.vue";
import FMCard from "@/components/FMCard.vue";
import DailyTracksCard from "@/components/DailyTracksCard.vue";
import { useSettingsStore } from "@/store/settings";
import { AlbumListArea, ToplistArtistType } from "ncm-api/types";
import { shuffle } from "es-toolkit";
import type { Album, Artist, Playlist } from "ncm-api/types";

const { settings } = useSettingsStore();

// 响应式数据
const show = ref(false);
const recommendPlaylist = ref<Playlist[]>([]);
const newReleasesAlbum = ref<Album[]>([]);
const topList = ref<Playlist[]>([]);
const recommendArtists = ref<Artist[]>([]);

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
		recommendPlaylist.value = items;
		NProgress.done();
		show.value = true;
	});

	api.album
		.newAlbums({
			area: settings.musicLanguage ?? AlbumListArea.all,
			limit: 10,
		})
		.then((data) => {
			newReleasesAlbum.value = data.albums;
		});

	// 获取歌手榜
	const toplistOfArtistsAreaTable = {
		[AlbumListArea.all]: ToplistArtistType.zh,
		[AlbumListArea.zh]: ToplistArtistType.zh,
		[AlbumListArea.ea]: ToplistArtistType.ea,
		[AlbumListArea.jp]: ToplistArtistType.ja,
		[AlbumListArea.kr]: ToplistArtistType.kr,
	};
	const area = toplistOfArtistsAreaTable[settings.musicLanguage ?? AlbumListArea.all];
	api.artist.toplistOfArtists(area).then((data) => {
		recommendArtists.value = shuffle(data.list.artists).slice(0, 6);
	});

	// 获取排行榜歌单
	api.playlist.toplists().then((data) => {
		const ids = [19723756, 180106, 60198, 3812895, 60131];
		topList.value = data.list.filter((l) => ids.includes(l.id));
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
