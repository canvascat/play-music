<template>
	<div class="player bg-background/68" @click="toggleLyrics">
		<div class="progress-bar" @click.stop>
			<ProgressSlider v-model="progress" :max="player.currentTrackDuration" tooltip lazy />
		</div>
		<div class="grid grid-cols-3 h-full px-[10vw] md:max-xl:px-[5vw]">
			<div class="playing">
				<div class="container" @click.stop>
					<img
						:src="resizeImage(currentTrack.al && currentTrack.al.picUrl, 224)"
						loading="lazy"
						@click="goToAlbum"
					/>
					<div class="track-info" :title="audioSource">
						<div
							:class="[
								'line-clamp-1 break-all mb-1 text-foreground font-semibold text-base opacity-88',
								{ 'has-list': hasList() },
							]"
							@click="hasList() && goToList()"
						>
							{{ currentTrack.name }}
						</div>
						<div class="artist line-clamp-1 break-all text-foreground opacity-58 text-xs">
							<span
								v-for="(ar, index) in currentTrack.ar"
								:key="ar.id"
								@click="ar.id && goToArtist(ar.id)"
							>
								<span :class="{ ar: ar.id }"> {{ ar.name }} </span
								><span v-if="index !== currentTrack.ar.length - 1">, </span>
							</span>
						</div>
					</div>
					<div class="like-button">
						<ButtonIcon
							:title="player.isCurrentTrackLiked ? $t('player.unlike') : $t('player.like')"
							@click="likeATrack(player.currentTrack.id)"
						>
							<IconHeart v-show="!player.isCurrentTrackLiked" />
							<IconHeartSolid v-show="player.isCurrentTrackLiked" />
						</ButtonIcon>
					</div>
				</div>
				<div class="blank"></div>
			</div>
			<div class="middle-control-buttons">
				<div class="blank"></div>
				<div class="container" @click.stop>
					<ButtonIcon
						v-show="!player.isPersonalFM"
						:title="$t('player.previous')"
						@click="playPrevTrack"
						><IconPrevious
					/></ButtonIcon>
					<ButtonIcon v-show="player.isPersonalFM" title="不喜欢" @click="moveToFMTrash"
						><IconThumbsDown
					/></ButtonIcon>
					<ButtonIcon
						class="play"
						:title="$t(player.playing ? 'player.pause' : 'player.play')"
						@click="playOrPause"
					>
						<IconPause v-if="player.playing" />
						<IconPlay v-else />
					</ButtonIcon>
					<ButtonIcon :title="$t('player.next')" @click="playNextTrack"><IconNext /></ButtonIcon>
				</div>
				<div class="blank"></div>
			</div>
			<div class="right-control-buttons">
				<div class="blank"></div>
				<div class="container" @click.stop>
					<ButtonIcon
						:title="$t('player.nextUp')"
						:class="{
							active: $route.name === 'next',
							disabled: player.isPersonalFM,
						}"
						@click="goToNextTracksPage"
						><IconList
					/></ButtonIcon>
					<ButtonIcon
						:class="{
							active: player.repeatMode !== 'off',
							disabled: player.isPersonalFM,
						}"
						:title="player.repeatMode === 'one' ? $t('player.repeatTrack') : $t('player.repeat')"
						@click="switchRepeatMode"
					>
						<IconRepeat v-show="player.repeatMode !== 'one'" />
						<IconRepeat1 v-show="player.repeatMode === 'one'" />
					</ButtonIcon>
					<ButtonIcon
						:class="{ active: player.shuffle, disabled: player.isPersonalFM }"
						:title="$t('player.shuffle')"
						@click="switchShuffle"
						><IconShuffle
					/></ButtonIcon>
					<ButtonIcon
						v-if="settings.enableReversedMode"
						:class="{ active: player.reversed, disabled: player.isPersonalFM }"
						:title="$t('player.reversed')"
						@click="switchReversed"
						><IconSortUp
					/></ButtonIcon>
					<div class="volume-control">
						<ButtonIcon :title="$t('player.mute')" @click="mute">
							<IconVolume v-show="volume > 0.5" />
							<IconVolumeMute v-show="volume === 0" />
							<IconVolumeHalf v-show="volume <= 0.5 && volume !== 0" />
						</ButtonIcon>
						<div class="volume-bar">
							<VolumeSlider v-model="volume" />
						</div>
					</div>

					<ButtonIcon class="lyrics-button ml-3" title="歌词" @click="toggleLyrics"
						><IconArrowUp
					/></ButtonIcon>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useGlobalStore } from "@/store/global";
// import "@/assets/css/slider.css";

import ButtonIcon from "@/components/ButtonIcon.vue";
import ProgressSlider from "@/components/ProgressSlider.vue";
import { goToListSource, hasListSource } from "@/utils/playList";
import { resizeImage } from "@/utils/filters";
import { computed, onMounted, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
	IconArrowUp,
	IconVolume,
	IconVolumeMute,
	IconVolumeHalf,
	IconSortUp,
	IconShuffle,
	IconList,
	IconRepeat,
	IconRepeat1,
	IconPrevious,
	IconNext,
	IconHeart,
	IconPause,
	IconPlay,
	IconHeartSolid,
	IconThumbsDown,
} from "@/components/icon";
import { usePlayerProgress } from "@/lib/hook";
import { useSettingsStore } from "@/store/settings";
import VolumeSlider from "./VolumeSlider.vue";
import { useLikedStore } from "@/store/liked";

const { player, toggleLyrics } = useGlobalStore();
const { likeATrack } = useLikedStore();
const { settings } = useSettingsStore();

const currentTrack = computed(() => player.currentTrack);
const volume = computed({
	get() {
		return player.volume;
	},
	set(value) {
		player.volume = value;
	},
});

const audioSource = computed(() => player.audioSource);
const route = useRoute();
const router = useRouter();

const progress = usePlayerProgress();

onMounted(() => {
	Object.assign(window, { player });
	setupMediaControls();
	window.addEventListener("keydown", handleKeydown);
});
onBeforeMount(() => {
	window.removeEventListener("keydown", handleKeydown);
});

function playPrevTrack() {
	player.playPrevTrack();
}
function playOrPause() {
	player.playOrPause();
}
function playNextTrack() {
	if (player.isPersonalFM) {
		player.playNextFMTrack();
	} else {
		player.playNextTrack();
	}
}
function goToNextTracksPage() {
	if (player.isPersonalFM) return;
	route.name === "next" ? router.go(-1) : router.push({ name: "next" });
}

function hasList() {
	return hasListSource();
}
function goToList() {
	goToListSource();
}
function goToAlbum() {
	if (!player.currentTrack?.al?.id) return;
	router.push({ path: "/album/" + player.currentTrack.al.id });
}
function goToArtist(id: number) {
	router.push({ path: "/artist/" + id });
}
function moveToFMTrash() {
	player.moveToFMTrash();
}
function switchRepeatMode() {
	player.switchRepeatMode();
}
function switchShuffle() {
	player.switchShuffle();
}
function switchReversed() {
	player.switchReversed();
}
function mute() {
	player.mute();
}

function setupMediaControls() {
	if ("mediaSession" in navigator) {
		navigator.mediaSession.setActionHandler("play", () => {
			playOrPause();
		});
		navigator.mediaSession.setActionHandler("pause", () => {
			playOrPause();
		});
		navigator.mediaSession.setActionHandler("previoustrack", () => {
			playPrevTrack();
		});
		navigator.mediaSession.setActionHandler("nexttrack", () => {
			playNextTrack();
		});
	}
}

function handleKeydown(event: KeyboardEvent) {
	switch (event.code) {
		case "MediaPlayPause":
			playOrPause();
			break;
		case "MediaTrackPrevious":
			playPrevTrack();
			break;
		case "MediaTrackNext":
			playNextTrack();
			break;
		default:
			break;
	}
}
</script>

<style lang="scss" scoped>
.player {
	position: fixed;
	bottom: 0;
	right: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	height: 64px;
	backdrop-filter: saturate(180%) blur(30px);
	z-index: 100;
}

.progress-bar {
	margin-top: -6px;
	margin-bottom: -6px;
	width: 100%;
}

.blank {
	flex-grow: 1;
}

.playing {
	display: flex;
}

.playing .container {
	display: flex;
	align-items: center;

	img {
		height: 46px;
		border-radius: 5px;
		box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.16);
		cursor: pointer;
		user-select: none;
	}

	.track-info {
		height: 46px;
		margin-left: 12px;
		display: flex;
		flex-direction: column;
		justify-content: center;

		.has-list {
			cursor: pointer;

			&:hover {
				text-decoration: underline;
			}
		}

		.artist {
			span.ar {
				cursor: pointer;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
}

.middle-control-buttons {
	display: flex;
}

.middle-control-buttons .container {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 8px;

	.ButtonIcon {
		margin: 0 8px;
	}

	.play {
		height: 42px;
		width: 42px;

		.svg-icon {
			width: 24px;
			height: 24px;
		}
	}
}

.right-control-buttons {
	display: flex;
}

.right-control-buttons .container {
	display: flex;
	justify-content: flex-end;
	align-items: center;

	.expand {
		margin-left: 24px;

		.svg-icon {
			height: 24px;
			width: 24px;
		}
	}

	.active .svg-icon {
		color: var(--color-primary);
	}

	.volume-control {
		margin-left: 4px;
		display: flex;
		align-items: center;

		.volume-bar {
			width: 84px;
		}
	}
}

.like-button {
	margin-left: 16px;
}

.ButtonIcon.disabled {
	cursor: default;
	opacity: 0.38;

	&:hover {
		background: none;
	}

	&:active {
		transform: unset;
	}
}
</style>
