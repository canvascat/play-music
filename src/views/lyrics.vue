<template>
	<div
		class="lyrics-page fixed inset-0 flex z-200"
		:class="{ 'no-lyric': noLyric }"
		:data-theme="theme"
	>
		<div
			v-if="settings.lyricsBackground === 'blur' || settings.lyricsBackground === 'dynamic'"
			class="lyrics-background"
			:class="{
				'dynamic-background': settings.lyricsBackground === 'dynamic',
			}"
		>
			<div class="top-right" :style="{ backgroundImage: `url(${bgImageUrl})` }" />
			<div class="bottom-left" :style="{ backgroundImage: `url(${bgImageUrl})` }" />
		</div>
		<div
			v-if="settings.lyricsBackground === true"
			class="gradient-background"
			:style="{ background }"
		></div>

		<div class="left-side">
			<div>
				<div class="cover">
					<div class="cover-container">
						<img :src="imageUrl" loading="lazy" />
						<div class="shadow" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
					</div>
				</div>
				<div class="controls">
					<div class="top-part">
						<div class="track-info">
							<div class="title line-clamp-1" :title="currentTrack.name">
								<router-link v-if="hasList()" :to="`${getListPath()}`" @click="toggleLyrics"
									>{{ currentTrack.name }}
								</router-link>
								<span v-else>
									{{ currentTrack.name }}
								</span>
							</div>
							<div class="subtitle line-clamp-1">
								<router-link
									v-if="artist.id !== 0"
									:to="`/artist/${artist.id}`"
									@click="toggleLyrics"
									>{{ artist.name }}
								</router-link>
								<span v-else>
									{{ artist.name }}
								</span>
								<span v-if="album.id !== 0">
									-
									<router-link :to="`/album/${album.id}`" :title="album.name" @click="toggleLyrics"
										>{{ album.name }}
									</router-link>
								</span>
							</div>
						</div>
						<div class="top-right">
							<div class="volume-control">
								<ButtonIcon :title="$t('player.mute')" @click="mute">
									<IconVolume v-show="volume > 0.5" />
									<IconVolumeMute v-show="volume === 0" />
									<IconVolumeHalf v-show="volume <= 0.5 && volume !== 0" />
								</ButtonIcon>
								<div class="volume-bar">
									<vue-slider
										v-model="volume"
										:min="0"
										:max="1"
										:interval="0.01"
										:drag-on-click="true"
										:duration="0"
										tooltip="none"
										:dot-size="12"
									></vue-slider>
								</div>
							</div>
							<div class="buttons">
								<ButtonIcon :title="$t('player.like')" @click="likeATrack(player.currentTrack.id)">
									<IconHeartSolid v-if="player.isCurrentTrackLiked" class="size-4.5" />
									<IconHeart v-else class="size-4.5" />
								</ButtonIcon>
								<ButtonIcon :title="$t('contextMenu.addToPlaylist')" @click="addToPlaylist">
									<IconPlus class="size-4.5" />
								</ButtonIcon>

								<!-- <ButtonIcon>
									<IconMore class="size-4.5" />
								</ButtonIcon> -->
							</div>
						</div>
					</div>
					<div class="progress-bar">
						<span>{{ formatTrackTime(progress) || "0:00" }}</span>
						<div class="slider">
							<vue-slider
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
							></vue-slider>
						</div>
						<span>{{ formatTrackTime(player.currentTrackDuration) }}</span>
					</div>
					<div class="media-controls">
						<ButtonIcon
							v-show="!player.isPersonalFM"
							:title="player.repeatMode === 'one' ? $t('player.repeatTrack') : $t('player.repeat')"
							:class="{ active: player.repeatMode !== 'off' }"
							@click="switchRepeatMode"
						>
							<IconRepeat v-show="player.repeatMode !== 'one'" />
							<IconRepeat1 v-show="player.repeatMode === 'one'" />
						</ButtonIcon>
						<div class="middle">
							<ButtonIcon
								v-show="!player.isPersonalFM"
								:title="$t('player.previous')"
								@click="playPrevTrack"
							>
								<IconPrevious />
							</ButtonIcon>
							<ButtonIcon v-show="player.isPersonalFM" title="不喜欢" @click="moveToFMTrash">
								<IconThumbsDown />
							</ButtonIcon>
							<ButtonIcon
								id="play"
								:title="$t(player.playing ? 'player.pause' : 'player.play')"
								@click="playOrPause"
							>
								<IconPause v-if="player.playing" />
								<IconPlay v-else />
							</ButtonIcon>
							<ButtonIcon :title="$t('player.next')" @click="playNextTrack">
								<IconNext />
							</ButtonIcon>
						</div>
						<ButtonIcon
							v-show="!player.isPersonalFM"
							:title="$t('player.shuffle')"
							:class="{ active: player.shuffle }"
							@click="switchShuffle"
						>
							<IconShuffle />
						</ButtonIcon>
						<ButtonIcon
							v-show="
								isShowLyricTypeSwitch &&
								settings.showLyricsTranslation &&
								lyricType === 'translation'
							"
							:title="$t('player.translationLyric')"
							@click="switchLyricType"
						>
							<span class="lyric-switch-icon">译</span>
						</ButtonIcon>
						<ButtonIcon
							v-show="
								isShowLyricTypeSwitch &&
								settings.showLyricsTranslation &&
								lyricType === 'romaPronunciation'
							"
							:title="$t('player.PronunciationLyric')"
							@click="switchLyricType"
						>
							<span class="lyric-switch-icon">音</span>
						</ButtonIcon>
					</div>
				</div>
			</div>
		</div>
		<div class="right-side">
			<transition name="slide-fade">
				<div
					v-show="!noLyric"
					ref="lyricsContainer"
					class="lyrics-container"
					:style="lyricFontSize"
				>
					<div id="line-1" class="line"></div>
					<div
						v-for="(line, index) in lyricToShow"
						:id="`line${index}`"
						:key="index"
						class="line"
						:class="{
							highlight: highlightLyricIndex === index,
						}"
						@click="clickLyricLine(line.time)"
						@dblclick="clickLyricLine(line.time, true)"
					>
						<div class="content">
							<span v-if="line.contents[0]">{{ line.contents[0] }}</span>
							<br />
							<span v-if="line.contents[1] && settings.showLyricsTranslation" class="translation">{{
								line.contents[1]
							}}</span>
						</div>
					</div>
				</div>
			</transition>
		</div>
		<div class="close-button" @click="toggleLyrics">
			<button>
				<IconArrowDown />
			</button>
		</div>
		<div class="close-button" style="left: 24px" @click="toggleFullscreen">
			<button>
				<IconFullscreenExit v-if="isFullscreen" />
				<IconFullscreen v-else />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
// The lyrics page of Apple Music is so gorgeous, so I copy the design.
// Some of the codes are from https://github.com/sl1673495/vue-netease-music

import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "@/store/pinia";
import VueSlider from "vue-slider-component";
import { formatTrackTime, getImageColor } from "@/utils/common";
import * as api from "@/api";
import { lyricParser } from "@/utils/lyrics";
import ButtonIcon from "@/components/ButtonIcon.vue";
import {
	IconArrowDown,
	IconFullscreen,
	IconFullscreenExit,
	IconVolume,
	IconVolumeMute,
	IconVolumeHalf,
	IconRepeat,
	IconRepeat1,
	IconPrevious,
	IconNext,
	IconShuffle,
	IconHeart,
	IconHeartSolid,
	IconThumbsDown,
	IconPlus,
	IconPause,
	IconPlay,
} from "@/components/icon";

import { isAccountLoggedIn } from "@/utils/auth";
import { hasListSource, getListSourcePath } from "@/utils/playList";
import { toast } from "vue-sonner";
import { useModalStore } from "@/store/modal";
import { useI18n } from "vue-i18n";
import { usePlayerProgress, useRafFnWithDep } from "@/lib/hook";
import { useFullscreen } from "@vueuse/core";

const { t } = useI18n();

const modalStore = useModalStore();

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(document.documentElement);

// 定义接口
interface LyricLine {
	rawTime: string;
	time: number;
	content: string;
}

interface LyricItem {
	time: number;
	content: string;
	contents: string[];
}

const store = useStore();
const { player, settings, toggleLyrics, likeATrack, fetchLikedPlaylist } = store;

const lyric = ref<LyricLine[]>([]);
const tlyric = ref<LyricLine[]>([]);
const romalyric = ref<LyricLine[]>([]);
const lyricType = ref<"translation" | "romaPronunciation">("translation");
const highlightLyricIndex = ref(-1);
const background = ref("");

const lyricsContainer = ref<HTMLElement>();

const progress = usePlayerProgress();

// 计算属性
const currentTrack = computed(() => player.currentTrack);

const volume = computed({
	get() {
		return player.volume;
	},
	set(value: number) {
		player.volume = value;
	},
});

const imageUrl = computed(() => {
	return player.currentTrack?.al?.picUrl + "?param=1024y1024";
});

const bgImageUrl = computed(() => {
	return player.currentTrack?.al?.picUrl + "?param=512y512";
});

const isShowLyricTypeSwitch = computed(() => {
	return romalyric.value.length > 0 && tlyric.value.length > 0;
});

const lyricToShow = computed(() => {
	return lyricType.value === "translation"
		? lyricWithTranslation.value
		: lyricWithRomaPronunciation.value;
});

const lyricWithTranslation = computed((): LyricItem[] => {
	let ret: LyricItem[] = [];
	// 空内容的去除
	const lyricFiltered = lyric.value.filter(({ content }) => Boolean(content));
	// content统一转换数组形式
	if (lyricFiltered.length) {
		lyricFiltered.forEach((l) => {
			const { rawTime, time, content } = l;
			const lyricItem: LyricItem = { time, content, contents: [content] };
			const sameTimeTLyric = tlyric.value.find(
				({ rawTime: tLyricRawTime }) => tLyricRawTime === rawTime,
			);
			if (sameTimeTLyric) {
				const { content: tLyricContent } = sameTimeTLyric;
				if (content) {
					lyricItem.contents.push(tLyricContent);
				}
			}
			ret.push(lyricItem);
		});
	} else {
		ret = lyricFiltered.map(({ time, content }) => ({
			time,
			content,
			contents: [content],
		}));
	}
	return ret;
});

const lyricWithRomaPronunciation = computed((): LyricItem[] => {
	let ret: LyricItem[] = [];
	// 空内容的去除
	const lyricFiltered = lyric.value.filter(({ content }) => Boolean(content));
	// content统一转换数组形式
	if (lyricFiltered.length) {
		lyricFiltered.forEach((l) => {
			const { rawTime, time, content } = l;
			const lyricItem: LyricItem = { time, content, contents: [content] };
			const sameTimeRomaLyric = romalyric.value.find(
				({ rawTime: tLyricRawTime }) => tLyricRawTime === rawTime,
			);
			if (sameTimeRomaLyric) {
				const { content: romaLyricContent } = sameTimeRomaLyric;
				if (content) {
					lyricItem.contents.push(romaLyricContent);
				}
			}
			ret.push(lyricItem);
		});
	} else {
		ret = lyricFiltered.map(({ time, content }) => ({
			time,
			content,
			contents: [content],
		}));
	}
	return ret;
});

const lyricFontSize = computed(() => {
	return {
		fontSize: `${settings.lyricFontSize || 28}px`,
	};
});

const noLyric = computed(() => {
	return lyric.value.length === 0;
});

const artist = computed(() => {
	return currentTrack.value?.ar ? currentTrack.value.ar[0] : { id: 0, name: "unknown" };
});

const album = computed(() => {
	return currentTrack.value?.al || { id: 0, name: "unknown" };
});

const theme = computed(() => {
	return settings.lyricsBackground === true ? "dark" : "auto";
});

// 监听器
watch(currentTrack, () => {
	getLyric();
	getCoverColor();
});

// 生命周期
onMounted(() => {
	getLyric();
	getCoverColor();
});

const addToPlaylist = () => {
	if (!isAccountLoggedIn()) {
		toast(t("toast.needToLogin"));
		return;
	}
	fetchLikedPlaylist();
	modalStore.showAddTrackToPlaylist(currentTrack.value!.id);
};

const playPrevTrack = () => {
	player.playPrevTrack();
};

const playOrPause = () => {
	player.playOrPause();
};

const playNextTrack = () => {
	if (player.isPersonalFM) {
		player.playNextFMTrack();
	} else {
		player.playNextTrack();
	}
};

const getLyric = () => {
	if (!currentTrack.value?.id) return;
	return api.track.getLyric(currentTrack.value.id).then((data) => {
		if (!data?.lrc?.lyric) {
			lyric.value = [];
			tlyric.value = [];
			romalyric.value = [];
			return false;
		} else {
			let {
				lyric: parsedLyric,
				tlyric: parsedTLyric,
				romalyric: parsedRomaLyric,
			} = lyricParser(data);
			parsedLyric = parsedLyric.filter((l) => !/^作(词|曲)\s*(:|：)\s*无$/.exec(l.content));
			let includeAM =
				parsedLyric.length <= 10 && parsedLyric.map((l) => l.content).includes("纯音乐，请欣赏");
			if (includeAM) {
				let reg = /^作(词|曲)\s*(:|：)\s*/;
				let author = currentTrack.value?.ar[0]?.name;
				parsedLyric = parsedLyric.filter((l) => {
					let regExpArr = l.content.match(reg);
					return !regExpArr || l.content.replace(regExpArr[0], "") !== author;
				});
			}
			if (parsedLyric.length === 1 && includeAM) {
				lyric.value = [];
				tlyric.value = [];
				romalyric.value = [];
				return false;
			} else {
				lyric.value = parsedLyric;
				tlyric.value = parsedTLyric;
				romalyric.value = parsedRomaLyric;
				if (parsedTLyric.length * parsedRomaLyric.length > 0) {
					lyricType.value = "translation";
				} else {
					lyricType.value = parsedLyric.length > 0 ? "translation" : "romaPronunciation";
				}
				return true;
			}
		}
	});
};

const switchLyricType = () => {
	lyricType.value = lyricType.value === "translation" ? "romaPronunciation" : "translation";
};

const clickLyricLine = (value: number, startPlay = false) => {
	// TODO: 双击选择还会选中文字，考虑搞个右键菜单复制歌词
	let jumpFlag = false;
	lyric.value.filter(function (item) {
		if (item.content == "纯音乐，请欣赏") {
			jumpFlag = true;
		}
	});
	if (window.getSelection()?.toString().length === 0 && !jumpFlag) {
		player.seek(value);
	}
	if (startPlay === true) {
		player.play();
	}
};

function updateLyricsPosition() {
	const progress = player.seek(null) ?? 0;
	let oldHighlightLyricIndex = highlightLyricIndex.value;
	highlightLyricIndex.value = lyric.value.findIndex((l, index) => {
		const nextLyric = lyric.value[index + 1];
		return progress >= l.time && (nextLyric ? progress < nextLyric.time : true);
	});
	if (oldHighlightLyricIndex !== highlightLyricIndex.value) {
		const el = document.getElementById(`line${highlightLyricIndex.value}`);
		if (el)
			el.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
	}
}
useRafFnWithDep(updateLyricsPosition, { dep: () => store.showLyrics });

const moveToFMTrash = () => {
	player.moveToFMTrash();
};

const switchRepeatMode = () => {
	player.switchRepeatMode();
};

const switchShuffle = () => {
	player.switchShuffle();
};

const getCoverColor = () => {
	if (settings.lyricsBackground !== true) return;
	const cover = currentTrack.value?.al?.picUrl + "?param=256y256";
	getImageColor(cover, "DarkMuted").then((originColor) => {
		const color = originColor.darken(0.1).rgb().string();
		const color2 = originColor.lighten(0.28).rotate(-30).rgb().string();
		background.value = `linear-gradient(to top left, ${color}, ${color2})`;
	});
};

const hasList = () => {
	return hasListSource();
};

const getListPath = () => {
	return getListSourcePath();
};

const mute = () => {
	player.mute();
};
</script>

<style lang="scss" scoped>
.lyrics-page {
	background: var(--color-body-bg);
	clip: rect(auto, auto, auto, auto);
}

.lyrics-background {
	--contrast-lyrics-background: 75%;
	--brightness-lyrics-background: 150%;
}

[data-theme="dark"] .lyrics-background {
	--contrast-lyrics-background: 125%;
	--brightness-lyrics-background: 50%;
}

.lyrics-background {
	filter: blur(50px) contrast(var(--contrast-lyrics-background))
		brightness(var(--brightness-lyrics-background));
	position: absolute;
	height: 100vh;
	width: 100vw;

	.top-right,
	.bottom-left {
		z-index: 0;
		width: 140vw;
		height: 140vw;
		opacity: 0.6;
		position: absolute;
		background-size: cover;
	}

	.top-right {
		right: 0;
		top: 0;
		mix-blend-mode: luminosity;
	}

	.bottom-left {
		left: 0;
		bottom: 0;
		animation-direction: reverse;
		animation-delay: 10s;
	}
}

.dynamic-background > div {
	animation: rotate 150s linear infinite;
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.gradient-background {
	position: absolute;
	height: 100vh;
	width: 100vw;
}

.left-side {
	flex: 1;
	display: flex;
	justify-content: flex-end;
	margin-right: 32px;
	margin-top: 24px;
	align-items: center;
	transition: all 0.5s;

	z-index: 1;

	.controls {
		max-width: 54vh;
		margin-top: 24px;
		color: var(--color-text);

		.title {
			margin-top: 8px;
			font-size: 1.4rem;
			font-weight: 600;
			opacity: 0.88;
		}

		.subtitle {
			margin-top: 4px;
			font-size: 1rem;
			opacity: 0.58;
		}

		.top-part {
			display: flex;
			justify-content: space-between;

			.top-right {
				display: flex;
				justify-content: space-between;

				.volume-control {
					margin: 0 10px;
					display: flex;
					align-items: center;

					.volume-bar {
						width: 84px;
					}
				}

				.buttons {
					display: flex;
					align-items: center;

					button {
						margin: 0 0 0 4px;
					}

					.svg-icon {
						height: 18px;
						width: 18px;
					}
				}
			}
		}

		.progress-bar {
			margin-top: 22px;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.slider {
				width: 100%;
				flex-grow: grow;
				padding: 0 10px;
			}

			span {
				font-size: 15px;
				opacity: 0.58;
				min-width: 28px;
			}
		}

		.media-controls {
			display: flex;
			justify-content: center;
			margin-top: 18px;
			align-items: center;

			button {
				margin: 0;
			}

			.svg-icon {
				opacity: 0.38;
				height: 14px;
				width: 14px;
			}

			.active .svg-icon {
				opacity: 0.88;
			}

			.middle {
				padding: 0 16px;
				display: flex;
				align-items: center;

				button {
					margin: 0 8px;
				}

				button#play .svg-icon {
					height: 28px;
					width: 28px;
					padding: 2px;
				}

				.svg-icon {
					opacity: 0.88;
					height: 22px;
					width: 22px;
				}
			}

			.lyric-switch-icon {
				color: var(--color-text);
				font-size: 14px;
				line-height: 14px;
				opacity: 0.88;
			}
		}
	}
}

.cover {
	position: relative;

	.cover-container {
		position: relative;
	}

	img {
		border-radius: 0.75em;
		width: 54vh;
		height: 54vh;
		user-select: none;
		object-fit: cover;
	}

	.shadow {
		position: absolute;
		top: 12px;
		height: 54vh;
		width: 54vh;
		filter: blur(16px) opacity(0.6);
		transform: scale(0.92, 0.96);
		z-index: -1;
		background-size: cover;
		border-radius: 0.75em;
	}
}

.right-side {
	flex: 1;
	font-weight: 600;
	color: var(--color-text);
	margin-right: 24px;
	z-index: 0;

	.lyrics-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		padding-left: 78px;
		max-width: 460px;
		overflow-y: auto;
		transition: 0.5s;
		scrollbar-width: none; // firefox

		.line {
			margin: 2px 0;
			padding: 12px 18px;
			transition: 0.5s;
			border-radius: 12px;

			&:hover {
				background: var(--color-secondary-bg-for-transparent);
			}

			.content {
				transform-origin: center left;
				transform: scale(0.95);
				transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
				user-select: none;

				span {
					opacity: 0.28;
					cursor: default;
					font-size: 1em;
					transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
				}

				span.translation {
					opacity: 0.2;
					font-size: 0.925em;
				}
			}
		}

		.line#line-1:hover {
			background: unset;
		}

		.translation {
			margin-top: 0.1em;
		}

		.highlight div.content {
			transform: scale(1);

			span {
				opacity: 0.98;
				display: inline-block;
			}

			span.translation {
				opacity: 0.65;
			}
		}
	}

	::-webkit-scrollbar {
		display: none;
	}

	.lyrics-container .line:first-child {
		margin-top: 50vh;
	}

	.lyrics-container .line:last-child {
		margin-bottom: calc(50vh - 128px);
	}
}

.close-button {
	position: fixed;
	top: 24px;
	right: 24px;
	z-index: 300;
	border-radius: 0.75rem;
	height: 44px;
	width: 44px;
	display: flex;
	justify-content: center;
	align-items: center;
	opacity: 0.28;
	transition: 0.2s;
	-webkit-app-region: no-drag;

	.svg-icon {
		color: var(--color-text);
		height: 22px;
		width: 22px;
	}

	&:hover {
		background: var(--color-secondary-bg-for-transparent);
		opacity: 0.88;
	}
}

.lyrics-page.no-lyric {
	.left-side {
		transition: all 0.5s;
		transform: translateX(27vh);
		margin-right: 0;
	}
}

@media (max-aspect-ratio: 10/9) {
	.left-side {
		display: none;
	}

	.right-side .lyrics-container {
		max-width: 100%;
	}
}

@media screen and (min-width: 1200px) {
	.right-side .lyrics-container {
		max-width: 600px;
	}
}

.slide-fade-enter-active {
	transition: all 0.5s ease;
}

.slide-fade-leave-active {
	transition: all 0.5s cubic-bezier(0.2, 0.2, 0, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
	transform: translateX(27vh);
	opacity: 0;
}
</style>
