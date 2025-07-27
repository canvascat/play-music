<template>
	<div class="player" @click="toggleLyrics">
		<div
			class="progress-bar"
			:class="{
				nyancat: settings.nyancatStyle,
				'nyancat-stop': settings.nyancatStyle && !player.playing,
			}"
			@click.stop
		>
			<VueSlider
				v-model="progress"
				:min="0"
				:max="player.currentTrackDuration"
				:interval="1"
				:drag-on-click="true"
				:duration="0"
				:dot-size="12"
				:height="2"
				:tooltip-formatter="formatTrackTime"
				:lazy="true"
				:silent="true"
			></VueSlider>
		</div>
		<div class="controls">
			<div class="playing">
				<div class="container" @click.stop>
					<img
						:src="resizeImage(currentTrack.al && currentTrack.al.picUrl, 224)"
						loading="lazy"
						@click="goToAlbum"
					/>
					<div class="track-info" :title="audioSource">
						<div :class="['name', { 'has-list': hasList() }]" @click="hasList() && goToList()">
							{{ currentTrack.name }}
						</div>
						<div class="artist">
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
							v-on:click="likeATrack(player.currentTrack.id)"
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
						v-on:click="playPrevTrack"
						><IconPrevious
					/></ButtonIcon>
					<ButtonIcon v-show="player.isPersonalFM" title="不喜欢" v-on:click="moveToFMTrash"
						><IconThumbsDown
					/></ButtonIcon>
					<ButtonIcon
						class="play"
						:title="$t(player.playing ? 'player.pause' : 'player.play')"
						v-on:click="playOrPause"
					>
						<IconPause v-if="player.playing" />
						<IconPlay v-else />
					</ButtonIcon>
					<ButtonIcon :title="$t('player.next')" v-on:click="playNextTrack"
						><IconNext
					/></ButtonIcon>
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
						v-on:click="goToNextTracksPage"
						><IconList
					/></ButtonIcon>
					<ButtonIcon
						:class="{
							active: player.repeatMode !== 'off',
							disabled: player.isPersonalFM,
						}"
						:title="player.repeatMode === 'one' ? $t('player.repeatTrack') : $t('player.repeat')"
						v-on:click="switchRepeatMode"
					>
						<IconRepeat v-show="player.repeatMode !== 'one'" />
						<IconRepeat1 v-show="player.repeatMode === 'one'" />
					</ButtonIcon>
					<ButtonIcon
						:class="{ active: player.shuffle, disabled: player.isPersonalFM }"
						:title="$t('player.shuffle')"
						v-on:click="switchShuffle"
						><IconShuffle
					/></ButtonIcon>
					<ButtonIcon
						v-if="settings.enableReversedMode"
						:class="{ active: player.reversed, disabled: player.isPersonalFM }"
						:title="$t('player.reversed')"
						v-on:click="switchReversed"
						><IconSortUp
					/></ButtonIcon>
					<div class="volume-control">
						<ButtonIcon :title="$t('player.mute')" v-on:click="mute">
							<IconVolume v-show="volume > 0.5" />
							<IconVolumeMute v-show="volume === 0" />
							<IconVolumeHalf v-show="volume <= 0.5 && volume !== 0" />
						</ButtonIcon>
						<div class="volume-bar">
							<VueSlider
								v-model="volume"
								:min="0"
								:max="1"
								:interval="0.01"
								:drag-on-click="true"
								:duration="0"
								tooltip="none"
								:dot-size="12"
							></VueSlider>
						</div>
					</div>

					<ButtonIcon class="lyrics-button ml-3" title="歌词" v-on:click="toggleLyrics"
						><IconArrowUp
					/></ButtonIcon>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStore } from "@/store/pinia";
import "@/assets/css/slider.css";

import ButtonIcon from "@/components/ButtonIcon.vue";
import VueSlider from "vue-slider-component";
import { goToListSource, hasListSource } from "@/utils/playList";
import { formatTrackTime } from "@/utils/common";
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

const { player, settings, toggleLyrics, likeATrack } = useStore();

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
	// background-color: rgba(255, 255, 255, 0.86);
	background-color: var(--color-navbar-bg);
	z-index: 100;
}

@supports (-moz-appearance: none) {
	.player {
		background-color: var(--color-body-bg);
	}
}

.progress-bar {
	margin-top: -6px;
	margin-bottom: -6px;
	width: 100%;
}

.controls {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	height: 100%;

	padding: {
		right: 10vw;
		left: 10vw;
	}
}

@media (max-width: 1336px) {
	.controls {
		padding: 0 5vw;
	}
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

		.name {
			font-weight: 600;
			font-size: 16px;
			opacity: 0.88;
			color: var(--color-text);
			margin-bottom: 4px;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
			word-break: break-all;
		}

		.has-list {
			cursor: pointer;

			&:hover {
				text-decoration: underline;
			}
		}

		.artist {
			font-size: 12px;
			opacity: 0.58;
			color: var(--color-text);
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
			word-break: break-all;

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
