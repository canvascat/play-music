<template>
	<div v-show="show" class="search-page">
		<div v-show="artists.length > 0 || albums.length > 0" class="row">
			<div v-show="artists.length > 0" class="artists">
				<div v-show="artists.length > 0" class="section-title">
					{{ $t("search.artist")
					}}<router-link :to="`/search/${keywords}/artists`">{{ $t("home.seeMore") }}</router-link>
				</div>
				<CoverRow type="artist" :column-number="3" :items="artists.slice(0, 3)" gap="34px 24px" />
			</div>

			<div class="albums">
				<div v-show="albums.length > 0" class="section-title">
					{{ $t("search.album")
					}}<router-link :to="`/search/${keywords}/albums`">{{ $t("home.seeMore") }}</router-link>
				</div>
				<CoverRow
					type="album"
					:items="albums.slice(0, 3)"
					sub-text="artist"
					:column-number="3"
					sub-text-font-size="14px"
					gap="34px 24px"
					:play-button-size="26"
				/>
			</div>
		</div>

		<div v-show="tracks.length > 0" class="tracks">
			<div class="section-title">
				{{ $t("search.song")
				}}<router-link :to="`/search/${keywords}/tracks`">{{ $t("home.seeMore") }}</router-link>
			</div>
			<TrackList :tracks="tracks" type="tracklist" />
		</div>

		<div v-show="musicVideos.length > 0" class="music-videos">
			<div class="section-title">
				{{ $t("search.mv")
				}}<router-link :to="`/search/${keywords}/music-videos`">{{
					$t("home.seeMore")
				}}</router-link>
			</div>
			<MvRow :mvs="musicVideos.slice(0, 5)" />
		</div>

		<div v-show="playlists.length > 0" class="playlists">
			<div class="section-title">
				{{ $t("search.playlist")
				}}<router-link :to="`/search/${keywords}/playlists`">{{ $t("home.seeMore") }}</router-link>
			</div>
			<CoverRow
				type="playlist"
				:items="playlists.slice(0, 12)"
				sub-text="title"
				:column-number="6"
				sub-text-font-size="14px"
				gap="34px 24px"
				:play-button-size="26"
			/>
		</div>

		<div v-show="!haveResult" class="no-results">
			<div>
				<IconSearch class="size-6 mr-4" />
				{{ keywords.length === 0 ? "输入关键字搜索" : $t("search.noResult") }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import * as api from "@/api";
import NProgress from "nprogress";
import { toast } from "vue-sonner";
import { IconSearch } from "@/components/icon";

import TrackList from "@/components/TrackList.vue";
import MvRow from "@/components/MvRow.vue";
import CoverRow from "@/components/CoverRow.vue";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const show = ref(false);
const tracks = ref([]);
const artists = ref([]);
const albums = ref([]);
const playlists = ref([]);
const musicVideos = ref([]);

const keywords = computed(() => (route.params.keywords as string) ?? "");
const haveResult = computed(() => {
	return (
		tracks.value.length +
			artists.value.length +
			albums.value.length +
			playlists.value.length +
			musicVideos.value.length >
		0
	);
});

watch(
	() => keywords.value,
	(newKeywords) => {
		if (newKeywords.length === 0) return;
		getData();
	},
);

getData();

function search(type = "all") {
	const typeTable = {
		all: 1018,
		musicVideos: 1004,
		tracks: 1,
		albums: 10,
		artists: 100,
		playlists: 1000,
	};
	return api.others
		.search({
			keywords: keywords.value,
			type: typeTable[type],
			limit: 16,
		})
		.then((result) => {
			return { result: result.result, type };
		})
		.catch((err) => {
			toast(err.response.data.msg || err.response.data.message);
		});
}
function getData() {
	setTimeout(() => {
		if (!show.value) NProgress.start();
	}, 1000);
	show.value = false;

	const requestAll = (requests) => {
		const currentKeywords = keywords.value;
		Promise.all(requests).then((results) => {
			if (currentKeywords != keywords.value) return;
			results.map((result) => {
				const searchType = result.type;
				if (result.result === undefined) return;
				result = result.result;
				switch (searchType) {
					case "all":
						// this.result = result;
						break;
					case "musicVideos":
						musicVideos.value = result.mvs ?? [];
						break;
					case "artists":
						artists.value = result.artists ?? [];
						break;
					case "albums":
						albums.value = result.albums ?? [];
						break;
					case "tracks":
						tracks.value = result.songs ?? [];
						getTracksDetail();
						break;
					case "playlists":
						playlists.value = result.playlists ?? [];
						break;
				}
			});
			NProgress.done();
			show.value = true;
		});
	};

	const requests = [search("artists"), search("albums"), search("tracks")];
	const requests2 = [search("musicVideos"), search("playlists")];

	requestAll(requests);
	requestAll(requests2);
}
function getTracksDetail() {
	const trackIDs = tracks.value.map((t) => t.id);
	if (trackIDs.length === 0) return;
	api.track.getTrackDetail(trackIDs.join(",")).then((result) => {
		tracks.value = result.songs;
	});
}
</script>

<style lang="scss" scoped>
.section-title {
	font-weight: 600;
	font-size: 22px;
	opacity: 0.88;

	margin-bottom: 16px;

	display: flex;
	justify-content: space-between;
	align-items: center;

	a {
		font-size: 13px;
		font-weight: 600;
		opacity: 0.68;
	}
}

.row {
	display: flex;
	flex-wrap: wrap;
	margin-top: 32px;

	.artists {
		flex: 1;
		margin-right: 8rem;
	}

	.albums {
		flex: 1;
	}
}

.tracks,
.music-videos,
.playlists {
	margin-top: 46px;
}

.no-results {
	position: absolute;
	top: 64px;
	right: 0;
	left: 0;
	bottom: 64px;
	font-size: 24px;

	opacity: 0.38;
	display: flex;
	justify-content: center;
	align-items: center;

	div {
		display: flex;
		align-items: center;
	}
}
</style>
