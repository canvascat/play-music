<template>
	<div class="explore-page">
		<h1 class="text-foreground text-6xl">{{ $t("explore.explore") }}</h1>
		<div class="flex flex-wrap">
			<div
				v-for="category in settings.enabledPlaylistCategories"
				:key="category"
				class="button"
				:class="{ active: category === activeCategory && !showCatOptions }"
				@click="goToCategory(category)"
			>
				{{ category }}
			</div>
			<div
				class="button more"
				:class="{ active: showCatOptions }"
				@click="showCatOptions = !showCatOptions"
			>
				<IconMore class="size-6" />
			</div>
		</div>

		<div v-show="showCatOptions" class="panel">
			<div v-for="bigCat in allBigCats" :key="bigCat" class="big-cat">
				<div class="name">{{ bigCat }}</div>
				<div class="cats">
					<div
						v-for="cat in getCatsByBigCat(bigCat)"
						:key="cat.name"
						class="cat"
						:class="{
							active: settings.enabledPlaylistCategories.includes(cat.name),
						}"
						@click="toggleCat(cat.name)"
					>
						<span>{{ cat.name }}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="playlists">
			<CoverRow
				type="playlist"
				:items="playlists"
				:sub-text="subText"
				:show-play-button="true"
				:show-play-count="activeCategory !== '排行榜' ? true : false"
				:image-size="activeCategory !== '排行榜' ? 512 : 1024"
			/>
		</div>
		<div v-show="['推荐歌单', '排行榜'].includes(activeCategory) === false" class="load-more">
			<ButtonTwoTone
				v-show="showLoadMoreButton && hasMore"
				color="grey"
				:loading="loadingMore"
				@click="getPlaylist"
				>{{ $t("explore.loadMore") }}</ButtonTwoTone
			>
		</div>
	</div>
</template>

<script setup lang="ts">
import NProgress from "nprogress";
import * as api from "@/api";
import { playlistCategories } from "@/utils/staticData";
import { getRecommendPlayList as getRecommendPlayListApi } from "@/utils/playList";
import { onBeforeRouteUpdate } from "vue-router";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import CoverRow from "@/components/CoverRow.vue";
import { IconMore } from "@/components/icon";
import { ref, computed, onActivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSettingsStore } from "@/store/settings";

const { settings, togglePlaylistCategory } = useSettingsStore();
const show = ref(false);
const playlists = ref([]);
const activeCategory = ref("全部");
const loadingMore = ref(false);
const showLoadMoreButton = ref(false);
const hasMore = ref(true);
const allBigCats = ref(["语种", "风格", "场景", "情感", "主题"]);
const showCatOptions = ref(false);
const route = useRoute();
const router = useRouter();

onBeforeRouteUpdate((to, _from, next) => {
	showLoadMoreButton.value = false;
	hasMore.value = true;
	playlists.value = [];

	activeCategory.value = to.query.category as string;
	getPlaylist();
	next();
});

const subText = computed(() => {
	if (activeCategory.value === "排行榜") return "updateFrequency";
	if (activeCategory.value === "推荐歌单") return "copywriter";
	return "none";
});

onActivated(() => {
	loadData();
	// TODO scrollbar.restorePosition();
});

function loadData() {
	setTimeout(() => {
		if (!show.value) NProgress.start();
	}, 1000);
	const queryCategory = route.query.category as string;
	if (queryCategory === undefined) {
		playlists.value = [];
		activeCategory.value = "全部";
	} else {
		activeCategory.value = queryCategory;
	}
	getPlaylist();
}
function goToCategory(Category) {
	showCatOptions.value = false;
	router.push({ name: "explore", query: { category: Category } });
}
function updatePlaylist(_playlists) {
	playlists.value.push(..._playlists);
	loadingMore.value = false;
	showLoadMoreButton.value = true;
	NProgress.done();
	show.value = true;
}
function getPlaylist() {
	loadingMore.value = true;
	if (activeCategory.value === "推荐歌单") {
		return getRecommendPlayList();
	}
	if (activeCategory.value === "精品歌单") {
		return getHighQualityPlaylist();
	}
	if (activeCategory.value === "排行榜") {
		return getTopLists();
	}
	return getTopPlayList();
}
function getRecommendPlayList() {
	getRecommendPlayListApi(100, true).then((list) => {
		playlists.value = [];
		updatePlaylist(list);
	});
}
function getHighQualityPlaylist() {
	let _playlists = playlists.value;
	let before = _playlists.length !== 0 ? _playlists[_playlists.length - 1].updateTime : 0;
	api.playlist.highQualityPlaylist({ limit: 50, before }).then((data) => {
		updatePlaylist(data.playlists);
		hasMore.value = data.more;
	});
}
function getTopLists() {
	api.playlist.toplists().then((data) => {
		playlists.value = [];
		updatePlaylist(data.list);
	});
}
function getTopPlayList() {
	api.playlist
		.topPlaylist({
			cat: activeCategory.value,
			offset: playlists.value.length,
		})
		.then((data) => {
			updatePlaylist(data.playlists);
			hasMore.value = data.more;
		});
}
function getCatsByBigCat(name) {
	return playlistCategories.filter((c) => c.bigCat === name);
}
function toggleCat(name) {
	togglePlaylistCategory(name);
}
</script>

<style lang="scss" scoped>
.button {
	user-select: none;
	cursor: pointer;
	padding: 8px 16px;
	margin: 10px 16px 6px 0;
	display: flex;
	justify-content: center;
	align-items: center;
	font-weight: 600;
	font-size: 18px;
	border-radius: 10px;
	background-color: var(--color-secondary-bg);
	color: var(--color-secondary);
	transition: 0.2s;

	&:hover {
		background-color: var(--color-primary-bg);
		color: var(--color-primary);
	}
}

.button.active {
	background-color: var(--color-primary-bg);
	color: var(--color-primary);
}

.panel {
	margin-top: 10px;
	background: var(--color-secondary-bg);
	border-radius: 10px;
	padding: 8px;

	.big-cat {
		display: flex;
		margin-bottom: 32px;
	}

	.name {
		font-size: 24px;
		font-weight: 700;
		opacity: 0.68;
		margin-left: 24px;
		min-width: 54px;
		height: 26px;
		margin-top: 8px;
	}

	.cats {
		margin-left: 24px;
		display: flex;
		flex-wrap: wrap;
	}

	.cat {
		user-select: none;
		margin: 4px 0px 0 0;
		display: flex;
		// justify-content: center;
		align-items: center;
		font-weight: 500;
		font-size: 16px;
		transition: 0.2s;
		min-width: 98px;

		span {
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			padding: 6px 12px;
			height: 26px;
			border-radius: 10px;
			opacity: 0.88;

			&:hover {
				opacity: 1;
				background-color: var(--color-primary-bg);
				color: var(--color-primary);
			}
		}
	}

	.cat.active {
		color: var(--color-primary);
	}
}

.playlists {
	margin-top: 24px;
}

.load-more {
	display: flex;
	justify-content: center;
	margin-top: 32px;
}
</style>
