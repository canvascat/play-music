<template>
	<div v-show="show" class="mt-8">
		<div class="flex items-center mb-6 text-text">
			<img
				:src="resizeImage(artist.img1v1Url, 1024)"
				class="flex-shrink-0 rounded-full size-62 mr-14 shadow-lg"
				loading="lazy"
			/>

			<div>
				<div class="text-5xl font-bold">{{ artist.name }}</div>
				<div class="text-xl opacity-88 mt-6">{{ $t("artist.artist") }}</div>
				<div class="text-sm opacity-68 mt-1">
					<a @click="scrollTo('popularTracks')">{{ artist.musicSize }} {{ $t("common.songs") }}</a>
					·
					<a @click="scrollTo('seeMore', 'start')"
						>{{ artist.albumSize }} {{ $t("artist.withAlbums") }}</a
					>
					·
					<a @click="scrollTo('mvs')">{{ artist.mvSize }} {{ $t("artist.videos") }}</a>
				</div>

				<Description :description="artist.briefDesc" :title="$t('artist.artistDesc')" />
				<div class="mt-6 flex gap-2">
					<ButtonTwoTone :icon="IconPlay" @click="playPopularSongs()">
						{{ $t("common.play") }}
					</ButtonTwoTone>
					<ButtonTwoTone color="grey" @click="followArtist">
						<span v-if="artist.followed">{{ $t("artist.following") }}</span>
						<span v-else>{{ $t("artist.follow") }}</span>
					</ButtonTwoTone>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<ButtonTwoTone :icon="IconMore" color="grey" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem @click="copyUrl(artist.id)">{{
								$t("contextMenu.copyUrl")
							}}</DropdownMenuItem>
							<DropdownMenuItem @click="openInBrowser(artist.id)">{{
								$t("contextMenu.openInBrowser")
							}}</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
		<div v-if="latestRelease !== undefined" class="latest-release">
			<div class="section-title">
				{{ $t("artist.latestRelease") }}
			</div>
			<div class="flex">
				<div class="container">
					<Cover
						:id="latestRelease.id"
						:image-url="resizeImage(latestRelease.picUrl)"
						type="album"
						:fixed-size="128"
						:play-button-size="30"
					/>
					<div class="info">
						<div class="name">
							<router-link :to="`/album/${latestRelease.id}`">{{ latestRelease.name }}</router-link>
						</div>
						<div class="date">
							{{ formatDate(latestRelease.publishTime) }}
						</div>
						<div class="type">
							{{ formatAlbumType(latestRelease.type, latestRelease) }} · {{ latestRelease.size }}
							{{ $t("common.songs") }}
						</div>
					</div>
				</div>
				<div v-show="latestMV.id" class="container latest-mv">
					<div
						class="cover"
						@mouseover="mvHover = true"
						@mouseleave="mvHover = false"
						@click="goToMv(latestMV.id)"
					>
						<img :src="latestMV.coverUrl" loading="lazy" class="rounded-lg size-24" />
						<transition name="fade">
							<div
								v-show="mvHover"
								class="shadow"
								:style="{
									background: 'url(' + latestMV.coverUrl + ')',
								}"
							></div>
						</transition>
					</div>
					<div class="info">
						<div class="name">
							<router-link :to="'/mv/' + latestMV.id">{{ latestMV.name }}</router-link>
						</div>
						<div class="date">
							{{ formatDate(latestMV.publishTime) }}
						</div>
						<div class="type">{{ $t("artist.latestMV") }}</div>
					</div>
				</div>
				<div v-show="!latestMV.id"></div>
			</div>
		</div>
		<div id="popularTracks" class="popular-tracks">
			<div class="section-title">{{ $t("artist.popularSongs") }}</div>
			<TrackList
				:tracks="popularTracks.slice(0, showMorePopTracks ? 24 : 12)"
				:type="'tracklist'"
			/>

			<div id="seeMore" class="show-more">
				<button @click="showMorePopTracks = !showMorePopTracks">
					<span v-show="!showMorePopTracks">{{ $t("artist.showMore") }}</span>
					<span v-show="showMorePopTracks">{{ $t("artist.showLess") }}</span>
				</button>
			</div>
		</div>
		<div v-if="albums.length !== 0" id="albums" class="albums">
			<div class="section-title">{{ $t("artist.albums") }}</div>
			<CoverRow type="album" :items="albums" :sub-text="'releaseYear'" :show-play-button="true" />
		</div>
		<div v-if="mvs.length !== 0" id="mvs" class="mvs">
			<div class="section-title">
				MVs
				<router-link v-show="hasMoreMV" :to="`/artist/${artist.id}/mv`">{{
					$t("home.seeMore")
				}}</router-link>
			</div>
			<MvRow :mvs="mvs" subtitle="publishTime" :playing="player?.playing" />
		</div>
		<div v-if="eps.length !== 0" class="eps">
			<div class="section-title">{{ $t("artist.EPsSingles") }}</div>
			<CoverRow
				type="album"
				:items="eps"
				:sub-text="'albumType+releaseYear'"
				:show-play-button="true"
			/>
		</div>

		<div v-if="similarArtists.length !== 0">
			<div class="section-title mt-6">{{ $t("artist.similarArtists") }}</div>
			<CoverRow
				type="artist"
				:column-number="6"
				gap="36px 28px"
				:items="similarArtists.slice(0, 12)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStore } from "@/store/pinia";

import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";
import NProgress from "nprogress";
import { resizeImage, formatDate, formatAlbumType } from "@/utils/filters";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import TrackList from "@/components/TrackList.vue";
import CoverRow from "@/components/CoverRow.vue";
import Cover from "@/components/Cover.vue";
import MvRow from "@/components/MvRow.vue";
import Description from "@/components/Description.tsx";
import { copyText } from "@/utils/copy";
import { toast } from "vue-sonner";
import { ref, computed, onActivated } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { useI18n } from "vue-i18n";
import { IconMore, IconPlay } from "@/components/icon";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { player } = useStore();
const show = ref(false);
const artist = ref({
	img1v1Url: "https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg",
});
const popularTracks = ref([]);
const albumsData = ref([]);
const latestRelease = ref({
	picUrl: "",
	publishTime: 0,
	id: 0,
	name: "",
	type: "",
	size: "",
});
const showMorePopTracks = ref(false);

const mvs = ref([]);
const hasMoreMV = ref(false);
const similarArtists = ref([]);
const mvHover = ref(false);

onBeforeRouteUpdate((to, _from, next) => {
	artist.value.img1v1Url =
		"https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg";
	loadData(to.params.id as string, next);
});

const albums = computed(() => {
	return albumsData.value.filter((a) => a.type === "专辑" || a.type === "精选集");
});
const eps = computed(() => {
	return albumsData.value.filter((a) => ["EP/Single", "EP", "Single"].includes(a.type));
});
const latestMV = computed(() => {
	const mv = mvs.value[0] || {};
	return {
		id: mv.id || mv.vid,
		name: mv.name || mv.title,
		coverUrl: `${mv.imgurl16v9 || mv.cover || mv.coverUrl}?param=464y260`,
		publishTime: mv.publishTime,
	};
});

onActivated(() => {
	if (artist.value?.id?.toString() !== route.params.id) {
		loadData(route.params.id);
	} else {
		// TODO scrollbar.restorePosition();
	}
});

function loadData(id: string, next?: () => void) {
	setTimeout(() => {
		if (!show.value) NProgress.start();
	}, 1000);
	show.value = false;
	// TODO scrollTo({ top: 0 });
	api.artist.getArtist(id).then((data) => {
		artist.value = data.artist;
		setPopularTracks(data.hotSongs);
		if (next !== undefined) next();
		NProgress.done();
		show.value = true;
	});
	api.artist.getArtistAlbum({ id: id, limit: 200 }).then((data) => {
		albumsData.value = data.hotAlbums;
		latestRelease.value = data.hotAlbums[0];
	});
	api.artist.artistMv({ id }).then((data) => {
		mvs.value = data.mvs;
		hasMoreMV.value = data.hasMore;
	});
	if (isAccountLoggedIn()) {
		api.artist.similarArtists(id).then((data) => {
			similarArtists.value = data.artists;
		});
	}
}
function setPopularTracks(hotSongs) {
	const trackIDs = hotSongs.map((t) => t.id);
	api.track.getTrackDetail(trackIDs.join(",")).then((data) => {
		popularTracks.value = data.songs;
	});
}

function goToMv(id: string) {
	router.push({ path: "/mv/" + id });
}
function playPopularSongs(trackID = "first") {
	let trackIDs = popularTracks.value.map((t) => t.id);
	player.replacePlaylist(trackIDs, artist.value.id, "artist", trackID);
}
function followArtist() {
	if (!isAccountLoggedIn()) {
		toast(t("toast.needToLogin"));
		return;
	}
	api.artist
		.followAArtist({
			id: artist.value.id,
			t: artist.value.followed ? 0 : 1,
		})
		.then((data) => {
			if (data.code === 200) artist.value.followed = !artist.value.followed;
		});
}
function scrollTo(div: string, block: ScrollLogicalPosition = "center") {
	document.getElementById(div).scrollIntoView({
		behavior: "smooth",
		block,
	});
}

function copyUrl(id: string) {
	copyText(`https://music.163.com/#/artist?id=${id}`)
		.then(function () {
			toast(t("toast.copied"));
		})
		.catch((error) => {
			toast(`${t("toast.copyFailed")}${error}`);
		});
}
function openInBrowser(id: string) {
	const url = `https://music.163.com/#/artist?id=${id}`;
	window.open(url);
}
</script>

<style lang="scss" scoped>
.section-title {
	font-weight: 600;
	font-size: 22px;
	color: var(--color-text);

	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	padding-top: 46px;
	margin-bottom: 16px;
	opacity: 0.88;

	a {
		font-size: 13px;
		font-weight: 600;
		opacity: 0.68;
	}
}

.latest-release {
	color: var(--color-text);

	.container {
		display: flex;
		flex: 1;
		align-items: center;
		border-radius: 12px;
	}

	.info {
		margin-left: 24px;
	}

	.name {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.date {
		font-size: 14px;
		opacity: 0.78;
	}

	.type {
		margin-top: 2px;
		font-size: 12px;
		opacity: 0.68;
	}
}

.popular-tracks {
	.show-more {
		display: flex;

		button {
			padding: 4px 8px;
			margin-top: 8px;
			border-radius: 6px;
			font-size: 12px;
			opacity: 0.78;
			color: var(--color-secondary);
			font-weight: 600;

			&:hover {
				opacity: 1;
			}
		}
	}
}

.latest-mv {
	.cover {
		position: relative;
		transition: transform 0.3s;

		&:hover {
			cursor: pointer;
		}
	}

	img {
		border-radius: 0.75em;
		height: 128px;
		object-fit: cover;
		user-select: none;
	}

	.shadow {
		position: absolute;
		top: 6px;
		height: 100%;
		width: 100%;
		filter: blur(16px) opacity(0.4);
		transform: scale(0.9, 0.9);
		z-index: -1;
		background-size: cover;
		border-radius: 0.75em;
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s;
	}

	.fade-enter-from,
  .fade-leave-to

  /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
}
</style>
