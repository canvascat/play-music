<template>
	<div
		class="track"
		:class="trackClass"
		:style="trackStyle"
		:title="showUnavailableSongInGreyStyle ? track.reason : ''"
		@mouseover="hover = true"
		@mouseleave="hover = false"
		tabindex="-1"
	>
		<img
			v-if="!isAlbum"
			:src="imgUrl"
			loading="lazy"
			:class="{ hover: focus }"
			@click="goToAlbum"
		/>
		<div v-if="showOrderNumber" class="no">
			<button v-show="focus && playable && !isPlaying" @click="playTrack">
				<IconPlay class="size-[14px]" />
			</button>
			<span v-show="(!focus || !playable) && !isPlaying">{{ trackNo }}</span>
			<button v-show="isPlaying">
				<IconVolume class="size-4" />
			</button>
		</div>
		<div class="title-and-artist">
			<div class="container">
				<div class="title line-clamp-1 break-all">
					{{ track.name }}
					<span v-if="isSubTitle" :title="subTitle" class="sub-title"> ({{ subTitle }}) </span>
					<span v-if="isAlbum" class="featured">
						<ArtistsInLine :artists="track.ar" :exclude="albumArtistName" prefix="-"
					/></span>
					<span v-if="isAlbum && (track.mark & 1048576) === 1048576" class="explicit-symbol"
						><ExplicitSymbol
					/></span>
				</div>
				<div v-if="!isAlbum" class="artist line-clamp-1">
					<span v-if="(track.mark & 1048576) === 1048576" class="explicit-symbol before-artist"
						><ExplicitSymbol :size="15"
					/></span>
					<ArtistsInLine :artists="artists" />
				</div>
			</div>
			<div></div>
		</div>

		<div v-if="showAlbumName" class="album line-clamp-2">
			<router-link v-if="album && album.id" :to="`/album/${album.id}`">{{
				album.name
			}}</router-link>
			<div></div>
		</div>

		<div v-if="showLikeButton" class="actions">
			<button @click="likeThisSong">
				<IconHeart
					:style="{
						visibility: focus && !isLiked ? 'visible' : 'hidden',
					}"
				/>
				<IconHeartSolid v-show="isLiked" />
			</button>
		</div>
		<div v-if="showTrackTime" class="time">
			{{ formatTime(track.dt) }}
		</div>

		<div v-if="track.playCount" class="count">{{ track.playCount }}</div>
	</div>
</template>

<script setup lang="ts">
import ArtistsInLine from "@/components/ArtistsInLine.vue";
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";
import { useGlobalStore } from "@/store/global";
import { isNil } from "es-toolkit";
import { formatTime } from "@/utils/filters";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { Track, Artist, Album } from "@/types";
import { IconPlay, IconHeart, IconHeartSolid, IconVolume } from "@/components/icon";
import { useSettingsStore } from "@/store/settings";

interface Props {
	trackProp: Track | any;
	trackNo?: number;
	highlightPlayingTrack?: boolean;
	type?: "album" | "playlist" | "tracklist" | "cloudDisk";
	albumArtistName?: string;
}

const props = withDefaults(defineProps<Props>(), {
	highlightPlayingTrack: true,
	type: "playlist",
});

const router = useRouter();
const store = useGlobalStore();
const { player } = store;
const { settings } = useSettingsStore();

const hover = ref(false);
const trackStyle = ref({});

const track = computed((): Track => {
	return props.type === "cloudDisk" ? props.trackProp.simpleSong : props.trackProp;
});
const playable = computed(() => {
	return track.value && ((track.value.privilege?.pl ?? 0) > 0 || track.value.playable);
});

const imgUrl = computed((): string => {
	let image =
		track.value?.al?.picUrl ??
		track.value?.album?.picUrl ??
		"https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg";
	return image + "?param=224y224";
});

const artists = computed((): Artist[] => {
	const { ar, artists } = track.value;
	if (!isNil(ar)) return ar;
	if (!isNil(artists)) return artists;
	return [];
});

const album = computed((): Album => {
	return track.value.album || track.value.al || track.value?.simpleSong?.al;
});
const subTitle = computed((): string | undefined => {
	let tn = undefined;
	if (track.value?.tns?.length > 0 && track.value.name !== track.value.tns[0]) {
		tn = track.value.tns[0];
	}

	//优先显示alia
	if (settings.subTitleDefault) {
		return track.value?.alia?.length > 0 ? track.value.alia[0] : tn;
	} else {
		return tn === undefined ? track.value.alia[0] : tn;
	}
});

const isAlbum = computed((): boolean => {
	return props.type === "album";
});

const isSubTitle = computed((): boolean => {
	return (
		(track.value?.tns?.length > 0 && track.value.name !== track.value.tns[0]) ||
		track.value.alia?.length > 0
	);
});

const isPlaylist = computed(() => {
	return props.type === "playlist";
});

const isLiked = computed((): boolean => {
	return false;
	// return this.$parent.liked.songs.includes(this.track?.id);
});

const isPlaying = computed((): boolean => {
	return player.currentTrack?.id === track.value?.id;
});

const focus = computed((): boolean => {
	return hover.value;
});

const showUnavailableSongInGreyStyle = computed((): boolean => {
	return window.IS_ELECTRON ? !settings.enableUnblockNeteaseMusic : true;
});

const trackClass = computed((): string[] => {
	let classList = [props.type || "playlist"];
	if (!playable.value && showUnavailableSongInGreyStyle.value) classList.push("disable");
	if (isPlaying.value && props.highlightPlayingTrack) classList.push("playing");
	if (focus.value) classList.push("focus");
	return classList;
});

// isMenuOpened() {
//   return this.$parent.rightClickedTrack.id === this.track.id ? true : false;
// },

const showLikeButton = computed(() => {
	return props.type !== "tracklist" && props.type !== "cloudDisk";
});

const showOrderNumber = computed(() => {
	return props.type === "album";
});

const showAlbumName = computed(() => {
	return props.type !== "album" && props.type !== "tracklist";
});

const showTrackTime = computed(() => {
	return props.type !== "tracklist";
});

const goToAlbum = () => {
	if (track.value.al.id === 0) return;
	router.push({ path: "/album/" + track.value.al.id });
};

const playTrack = () => {
	// this.$parent.playThisList(this.track.id);
};

const likeThisSong = () => {
	// this.$parent.likeATrack(this.track.id);
};
</script>

<style lang="scss" scoped>
button {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 8px;
	background: transparent;
	border-radius: 25%;
	transition: transform 0.2s;
	.svg-icon {
		height: 16px;
		width: 16px;
		color: var(--color-primary);
	}
	&:hover {
		transform: scale(1.12);
	}
	&:active {
		transform: scale(0.96);
	}
}

.track {
	display: flex;
	align-items: center;
	padding: 8px;
	border-radius: 12px;
	user-select: none;

	.no {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 8px;
		margin: 0 20px 0 10px;
		width: 12px;

		cursor: default;
		span {
			opacity: 0.58;
		}
	}

	.explicit-symbol {
		opacity: 0.28;

		.svg-icon {
			margin-bottom: -3px;
		}
	}

	.explicit-symbol.before-artist {
		.svg-icon {
			margin-bottom: -3px;
		}
	}

	img {
		border-radius: 8px;
		height: 46px;
		width: 46px;
		margin-right: 20px;
		border: 1px solid rgba(0, 0, 0, 0.04);
		cursor: pointer;
	}

	img.hover {
		filter: drop-shadow(100 200 0 black);
	}

	.title-and-artist {
		flex: 1;
		display: flex;
		.container {
			display: flex;
			flex-direction: column;
		}
		.title {
			font-size: 18px;
			font-weight: 600;

			cursor: default;
			padding-right: 16px;
			.featured {
				margin-right: 2px;
				font-weight: 500;
				font-size: 14px;
				opacity: 0.72;
			}
			.sub-title {
				color: #7a7a7a;
				opacity: 0.7;
				margin-left: 4px;
			}
		}
		.artist {
			margin-top: 2px;
			font-size: 13px;
			opacity: 0.68;

			a {
				span {
					margin-right: 3px;
					opacity: 0.8;
				}
				&:hover {
					text-decoration: underline;
					cursor: pointer;
				}
			}
		}
	}
	.album {
		flex: 1;
		display: flex;
		font-size: 16px;
		opacity: 0.88;
	}
	.time,
	.count {
		font-size: 16px;
		width: 50px;
		cursor: default;
		display: flex;
		justify-content: flex-end;
		margin-right: 10px;
		font-variant-numeric: tabular-nums;
		opacity: 0.88;
	}
	.count {
		font-weight: bold;
		font-size: 22px;
		line-height: 22px;
	}
}

.track:focus {
	transition: all 0.3s;
	background: var(--color-secondary-bg);
}

.track.disable {
	img {
		filter: grayscale(1) opacity(0.6);
	}
	.title,
	.artist,
	.album,
	.time,
	.no,
	.featured {
		opacity: 0.28 !important;
	}
	&:hover {
		background: none;
	}
}

.track.tracklist {
	img {
		height: 36px;
		width: 36px;
		border-radius: 6px;
		margin-right: 14px;
		cursor: pointer;
	}
	.title {
		font-size: 16px;
	}
	.artist {
		font-size: 12px;
	}
}

.track.album {
	height: 48px;
}

.actions {
	width: 80px;
	display: flex;
	justify-content: flex-end;
}

.track.playing {
	background: var(--color-primary-bg);
	color: var(--color-primary);
	.title,
	.album,
	.time,
	.title-and-artist .sub-title {
		color: var(--color-primary);
	}
	.title .featured,
	.artist,
	.explicit-symbol,
	.count {
		color: var(--color-primary);
		opacity: 0.88;
	}
	.no span {
		color: var(--color-primary);
		opacity: 0.78;
	}
}
</style>
