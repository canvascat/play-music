<template>
	<div v-show="show" class="album-page">
		<div class="playlist-info">
			<Cover
				:id="album.id"
				:image-url="resizeImage(album.picUrl, 1024)"
				:show-play-button="true"
				:always-show-shadow="true"
				:click-cover-to-play="true"
				:fixed-size="288"
				type="album"
				:cover-hover="false"
				:play-button-size="18"
			/>
			<div class="info">
				<div class="title">{{ title }}</div>
				<div v-if="subtitle !== ''" class="subtitle">{{ subtitle }}</div>
				<div class="artist">
					<span v-if="album.artist.id !== 104700">
						<span>{{ formatAlbumType(album.type, album) }} by </span
						><router-link :to="`/artist/${album.artist.id}`">{{
							album.artist.name
						}}</router-link></span
					>
					<span v-else>Compilation by Various Artists</span>
				</div>
				<div class="date-and-count">
					<span v-if="(album.mark & 1048576) === 1048576" class="explicit-symbol">
						<ExplicitSymbol />
					</span>
					<span :title="formatDate(album.publishTime)">{{
						new Date(album.publishTime).getFullYear()
					}}</span>
					<span> · {{ album.size }} {{ $t("common.songs") }}</span
					>,
					{{ formatTime(albumTime, "Human") }}
				</div>

				<Description :description="album.description" :title="$t('album.albumDesc')" />

				<div class="buttons" style="margin-top: 32px">
					<ButtonTwoTone @click="player.playAlbumByID(album.id)" :icon="IconPlay">
						{{ $t("common.play") }}
					</ButtonTwoTone>
					<ButtonTwoTone
						:icon="dynamicDetail.isSub ? IconHeartSolid : IconHeart"
						:color="dynamicDetail.isSub ? 'blue' : 'grey'"
						:text-color="dynamicDetail.isSub ? '#335eea' : ''"
						:background-color="dynamicDetail.isSub ? 'var(--color-secondary-bg)' : ''"
						@click="likeAlbum"
					/>
					<DropdownMenu>
						<DropdownMenuTrigger as-child>
							<ButtonTwoTone :icon="IconMore" color="grey" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem @click="likeAlbum(true)">
								{{
									dynamicDetail.isSub
										? $t("contextMenu.removeFromLibrary")
										: $t("contextMenu.saveToLibrary")
								}}
							</DropdownMenuItem>
							<DropdownMenuItem>
								{{ $t("contextMenu.addToPlaylist") }}
							</DropdownMenuItem>
							<DropdownMenuItem @click="copyUrl(album.id)">
								{{ $t("contextMenu.copyUrl") }}
							</DropdownMenuItem>
							<DropdownMenuItem @click="openInBrowser(album.id)">
								{{ $t("contextMenu.openInBrowser") }}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
		<div v-if="tracksByDisc.length > 1">
			<div v-for="item in tracksByDisc" :key="item.disc">
				<h2 class="disc">Disc {{ item.disc }}</h2>
				<TrackList :id="album.id" :tracks="item.tracks" :type="'album'" :album-object="album" />
			</div>
		</div>
		<div v-else>
			<TrackList :id="album.id" :tracks="tracks" :type="'album'" :album-object="album" />
		</div>
		<div class="extra-info">
			<div class="album-time"></div>
			<div class="release-date">
				{{ $t("album.released") }}
				{{ formatDate(album.publishTime, "MMMM D, YYYY") }}
			</div>
			<div v-if="album.company" class="copyright">© {{ album.company }}</div>
		</div>
		<div v-if="filteredMoreAlbums.length !== 0" class="more-by">
			<div class="section-title">
				More by
				<router-link :to="`/artist/${album.artist.id}`">{{ album.artist.name }} </router-link>
			</div>
			<div>
				<CoverRow type="album" :items="filteredMoreAlbums" sub-text="albumType+releaseYear" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStore } from "@/store/pinia";
import * as api from "@/api";
import { splitSoundtrackAlbumTitle, splitAlbumTitle } from "@/utils/common";
import NProgress from "nprogress";
import { isAccountLoggedIn } from "@/utils/auth";
import { groupBy, sortBy } from "es-toolkit";
import { toPairs } from "es-toolkit/compat";
import { resizeImage, formatDate, formatTime, formatAlbumType } from "@/utils/filters";
import { useI18n } from "vue-i18n";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import TrackList from "@/components/TrackList.vue";
import CoverRow from "@/components/CoverRow.vue";
import Cover from "@/components/Cover.vue";
import Description from "@/components/Description.vue";
import { copyText } from "@/utils/copy.ts";
import { toast } from "vue-sonner";
import { computed, ref, toValue, shallowRef } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { IconHeart, IconHeartSolid, IconMore, IconPlay } from "@/components/icon";
import type { Album, AlbumDetailDynamicResponse, Track } from "@/types";

const { t } = useI18n();

const show = ref(false);
const album = ref<Album>({
	id: 0,
	picUrl: "",
	name: "",
	artist: {
		id: 0,
		name: "",
	},
	type: "",
	mark: 0,
	publishTime: 0,
	size: 0,
	description: "default description",
	company: "",
} as Album);

const tracks = shallowRef<Track[]>([]);
const moreAlbums = ref<Album[]>([]);
const dynamicDetail = ref<Pick<AlbumDetailDynamicResponse, "isSub">>({ isSub: false });
const subtitle = ref("");
const title = ref("");

onBeforeRouteUpdate((to, _from, next) => {
	show.value = false;
	loadData(+to.params.id);
	next();
});

const albumTime = computed(() => {
	return tracks.value.reduce((acc, track) => acc + track.dt, 0);
});

const filteredMoreAlbums = computed<Album[]>(() => {
	let _moreAlbums = moreAlbums.value.filter((a) => a.id !== album.value.id);
	let realAlbums = _moreAlbums.filter((a) => a.type === "专辑");
	let eps = _moreAlbums.filter(
		(a) => a.type === "EP" || (a.type === "EP/Single" && a.size && a.size > 1),
	);
	let restItems = _moreAlbums.filter(
		(a) =>
			realAlbums.find((a1) => a1.id === a.id) === undefined &&
			eps.find((a1) => a1.id === a.id) === undefined,
	);
	if (realAlbums.length === 0) {
		return [...realAlbums, ...eps, ...restItems].slice(0, 5);
	} else {
		return [...realAlbums, ...restItems].slice(0, 5);
	}
});

const tracksByDisc = computed(() => {
	if (tracks.value.length <= 1) return [];

	const pairs = toPairs(groupBy(toValue(tracks), (item) => item.cd));
	return sortBy(pairs, [(p) => +p[0]]).map((items) => ({
		disc: items[0],
		tracks: items[1],
	}));
});
const router = useRouter();
loadData(+router.currentRoute.value.params.id);

const { player } = useStore();

function likeAlbum(showToast = false) {
	if (!isAccountLoggedIn()) {
		toast(t("toast.needToLogin"));
		return;
	}
	api.album
		.likeAAlbum({
			id: album.value.id,
			t: dynamicDetail.value.isSub ? 0 : 1,
		})
		.then((data) => {
			if (data.code === 200) {
				dynamicDetail.value.isSub = !dynamicDetail.value.isSub;
				if (showToast) toast(dynamicDetail.value.isSub ? "已保存到音乐库" : "已从音乐库删除");
			}
		})
		.catch((error) => {
			toast(`${error.response.data.message || error}`);
		});
}
function formatTitle() {
	let splitTitle = splitSoundtrackAlbumTitle(album.value.name);
	let splitTitle2 = splitAlbumTitle(splitTitle.title);
	title.value = splitTitle2.title;
	if (splitTitle.subtitle !== "" && splitTitle2.subtitle !== "") {
		subtitle.value = splitTitle.subtitle + " · " + splitTitle2.subtitle;
	} else {
		subtitle.value = splitTitle.subtitle === "" ? splitTitle2.subtitle : splitTitle.subtitle;
	}
}
function loadData(id: number) {
	setTimeout(() => {
		if (!show.value) NProgress.start();
	}, 1000);
	api.album.getAlbum(id).then((data) => {
		album.value = data.album;
		tracks.value = data.songs;
		formatTitle();
		NProgress.done();
		show.value = true;

		// to get explicit mark
		let trackIDs = tracks.value.map((t) => t.id);
		api.track.getTrackDetail(trackIDs.join(",")).then((data) => {
			tracks.value = data.songs;
		});

		// get more album by this artist
		api.artist.getArtistAlbum({ id: album.value.artist.id, limit: 100 }).then((data) => {
			moreAlbums.value = data.hotAlbums;
		});
	});
	api.album.albumDynamicDetail(id).then((data) => {
		dynamicDetail.value = data;
	});
}

function copyUrl(id: number | string) {
	copyText(`https://music.163.com/#/album?id=${id}`)
		.then(function () {
			toast(t("toast.copied"));
		})
		.catch((error) => {
			toast(`${t("toast.copyFailed")}${error}`);
		});
}
function openInBrowser(id: number | string) {
	const url = `https://music.163.com/#/album?id=${id}`;
	window.open(url);
}
</script>

<style lang="scss" scoped>
.album-page {
	margin-top: 32px;
}

.playlist-info {
	display: flex;
	width: 78vw;
	margin-bottom: 72px;

	.info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		margin-left: 56px;

		.title {
			font-size: 56px;
			font-weight: 700;
		}

		.subtitle {
			font-size: 22px;
			font-weight: 600;
		}

		.artist {
			font-size: 18px;
			opacity: 0.88;
			margin-top: 24px;

			a {
				font-weight: 600;
			}
		}

		.date-and-count {
			font-size: 14px;
			opacity: 0.68;
			margin-top: 2px;
		}

		.description {
			user-select: none;
			font-size: 14px;
			opacity: 0.68;
			margin-top: 24px;
			cursor: pointer;
			white-space: pre-line;

			&:hover {
				transition: opacity 0.3s;
				opacity: 0.88;
			}
		}

		.buttons {
			margin-top: 32px;
			display: flex;

			button {
				margin-right: 16px;
			}
		}
	}
}

.explicit-symbol {
	opacity: 0.28;

	margin-right: 4px;

	.svg-icon {
		margin-bottom: -3px;
	}
}

.extra-info {
	margin-top: 36px;
	margin-bottom: 36px;
	font-size: 12px;
	opacity: 0.48;

	div {
		margin-bottom: 4px;
	}

	.album-time {
		opacity: 0.68;
	}
}

.more-by {
	border-top: 1px solid rgba(128, 128, 128, 0.18);

	padding-top: 22px;

	.section-title {
		font-size: 22px;
		font-weight: 600;
		opacity: 0.88;

		margin-bottom: 20px;
	}
}

.description-fulltext {
	font-size: 16px;
	margin-top: 24px;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	overflow: hidden;
	white-space: pre-line;
}
</style>
