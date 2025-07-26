<template>
	<transition name="slide-up">
		<div class="lyrics-page" :class="{ 'no-lyric': noLyric }" :data-theme="theme">
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
					<div v-if="settings.showLyricsTime" class="date">
						{{ date }}
					</div>
					<div class="cover">
						<div class="cover-container">
							<img :src="imageUrl" loading="lazy" />
							<div class="shadow" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
						</div>
					</div>
					<div class="controls">
						<div class="top-part">
							<div class="track-info">
								<div class="title" :title="currentTrack.name">
									<router-link v-if="hasList()" :to="`${getListPath()}`" v-on:click="toggleLyrics"
										>{{ currentTrack.name }}
									</router-link>
									<span v-else>
										{{ currentTrack.name }}
									</span>
								</div>
								<div class="subtitle">
									<router-link
										v-if="artist.id !== 0"
										:to="`/artist/${artist.id}`"
										v-on:click="toggleLyrics"
										>{{ artist.name }}
									</router-link>
									<span v-else>
										{{ artist.name }}
									</span>
									<span v-if="album.id !== 0">
										-
										<router-link
											:to="`/album/${album.id}`"
											:title="album.name"
											v-on:click="toggleLyrics"
											>{{ album.name }}
										</router-link>
									</span>
								</div>
							</div>
							<div class="top-right">
								<div class="volume-control">
									<button-icon :title="$t('player.mute')" v-on:click="mute">
										<svg-icon v-show="volume > 0.5" icon-class="volume" />
										<svg-icon v-show="volume === 0" icon-class="volume-mute" />
										<svg-icon v-show="volume <= 0.5 && volume !== 0" icon-class="volume-half" />
									</button-icon>
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
									<button-icon
										:title="$t('player.like')"
										v-on:click="likeATrack(player.currentTrack.id)"
									>
										<svg-icon :icon-class="player.isCurrentTrackLiked ? 'heart-solid' : 'heart'" />
									</button-icon>
									<button-icon :title="$t('contextMenu.addToPlaylist')" v-on:click="addToPlaylist">
										<svg-icon icon-class="plus" />
									</button-icon>
									<!-- <button-icon v-on:click="openMenu" title="Menu"
                    ><svg-icon icon-class="more"
                  /></button-icon> -->
								</div>
							</div>
						</div>
						<div class="progress-bar">
							<span>{{ formatTrackTime(player.progress) || "0:00" }}</span>
							<div class="slider">
								<vue-slider
									v-model="player.progress"
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
							<button-icon
								v-show="!player.isPersonalFM"
								:title="
									player.repeatMode === 'one' ? $t('player.repeatTrack') : $t('player.repeat')
								"
								:class="{ active: player.repeatMode !== 'off' }"
								v-on:click="switchRepeatMode"
							>
								<svg-icon v-show="player.repeatMode !== 'one'" icon-class="repeat" />
								<svg-icon v-show="player.repeatMode === 'one'" icon-class="repeat-1" />
							</button-icon>
							<div class="middle">
								<button-icon
									v-show="!player.isPersonalFM"
									:title="$t('player.previous')"
									v-on:click="playPrevTrack"
								>
									<svg-icon icon-class="previous" />
								</button-icon>
								<button-icon v-show="player.isPersonalFM" title="不喜欢" v-on:click="moveToFMTrash">
									<svg-icon icon-class="thumbs-down" />
								</button-icon>
								<button-icon
									id="play"
									:title="$t(player.playing ? 'player.pause' : 'player.play')"
									v-on:click="playOrPause"
								>
									<svg-icon :icon-class="player.playing ? 'pause' : 'play'" />
								</button-icon>
								<button-icon :title="$t('player.next')" v-on:click="playNextTrack">
									<svg-icon icon-class="next" />
								</button-icon>
							</div>
							<button-icon
								v-show="!player.isPersonalFM"
								:title="$t('player.shuffle')"
								:class="{ active: player.shuffle }"
								v-on:click="switchShuffle"
							>
								<svg-icon icon-class="shuffle" />
							</button-icon>
							<button-icon
								v-show="
									isShowLyricTypeSwitch &&
									settings.showLyricsTranslation &&
									lyricType === 'translation'
								"
								:title="$t('player.translationLyric')"
								v-on:click="switchLyricType"
							>
								<span class="lyric-switch-icon">译</span>
							</button-icon>
							<button-icon
								v-show="
									isShowLyricTypeSwitch &&
									settings.showLyricsTranslation &&
									lyricType === 'romaPronunciation'
								"
								:title="$t('player.PronunciationLyric')"
								v-on:click="switchLyricType"
							>
								<span class="lyric-switch-icon">音</span>
							</button-icon>
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
								<span v-if="line.contents[0]" @click.right="openLyricMenu($event, line, 0)">{{
									line.contents[0]
								}}</span>
								<br />
								<span
									v-if="line.contents[1] && settings.showLyricsTranslation"
									class="translation"
									@click.right="openLyricMenu($event, line, 1)"
									>{{ line.contents[1] }}</span
								>
							</div>
						</div>
						<ContextMenu v-if="!noLyric" ref="lyricMenu">
							<div class="item" @click="copyLyric(false)">{{ $t("contextMenu.copyLyric") }}</div>
							<div
								v-if="
									rightClickLyric && rightClickLyric.contents[1] && settings.showLyricsTranslation
								"
								class="item"
								@click="copyLyric(true)"
							>
								{{ $t("contextMenu.copyLyricWithTranslation") }}
							</div>
						</ContextMenu>
					</div>
				</transition>
			</div>
			<div class="close-button" @click="toggleLyrics">
				<button>
					<svg-icon icon-class="arrow-down" />
				</button>
			</div>
			<div class="close-button" style="left: 24px" @click="fullscreen">
				<button>
					<svg-icon v-if="isFullscreen" icon-class="fullscreen-exit" />
					<svg-icon v-else icon-class="fullscreen" />
				</button>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
// The lyrics page of Apple Music is so gorgeous, so I copy the design.
// Some of the codes are from https://github.com/sl1673495/vue-netease-music

import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "@/store/pinia";
import VueSlider from "vue-slider-component";
import ContextMenu from "@/components/ContextMenu.vue";
import { formatTrackTime, getImageColor } from "@/utils/common";
import * as api from "@/api";
import { lyricParser } from "@/utils/lyrics";
import ButtonIcon from "@/components/ButtonIcon.vue";

import { isAccountLoggedIn } from "@/utils/auth";
import { hasListSource, getListSourcePath } from "@/utils/playList";
import { toast } from "vue-sonner";
import { useModalStore } from "@/store/modal";
import { useI18n } from "vue-i18n";
import { copyText } from "@/utils/copy";

const { t } = useI18n();

const modalStore = useModalStore();

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

interface RightClickLyric extends LyricItem {
	idx: number;
}
const store = useStore();
const { player, settings, toggleLyrics, likeATrack, fetchLikedPlaylist } = store;

// 响应式数据
let lyricsInterval: number;
const lyric = ref<LyricLine[]>([]);
const tlyric = ref<LyricLine[]>([]);
const romalyric = ref<LyricLine[]>([]);
const lyricType = ref<"translation" | "romaPronunciation">("translation");
const highlightLyricIndex = ref(-1);
const background = ref("");
const date = ref(formatTime(new Date()));
const isFullscreen = ref(!!document.fullscreenElement);
const rightClickLyric = ref<RightClickLyric | null>(null);
const timer = ref<number | null>(null);
const lyricsContainer = ref<HTMLElement>();
const lyricMenu = ref<InstanceType<typeof ContextMenu>>();

// const progress = ref(player.progress);
// useRafFn(() => {
//   progress.value = player.progress;
// })

// const setProgress = (value: number) => {
//   player.progress = value;
//   progress.value = value;
// }

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

watch(
	() => store.showLyrics,
	(show) => {
		if (show) setLyricsInterval();
		else if (lyricsInterval) clearInterval(lyricsInterval);
	},
);

// 生命周期
onMounted(() => {
	getLyric();
	getCoverColor();
	initDate();
	document.addEventListener("keydown", (e) => {
		if (e.key === "F11") {
			e.preventDefault();
			fullscreen();
		}
	});
	document.addEventListener("fullscreenchange", () => {
		isFullscreen.value = !!document.fullscreenElement;
	});
});

onBeforeUnmount(() => {
	if (timer.value) {
		clearInterval(timer.value);
	}
	if (lyricsInterval) {
		clearInterval(lyricsInterval);
	}
});

// 方法
function formatTime(value: Date): string {
	let hour = value.getHours().toString();
	let minute = value.getMinutes().toString();
	let second = value.getSeconds().toString();
	return hour.padStart(2, "0") + ":" + minute.padStart(2, "0") + ":" + second.padStart(2, "0");
}

const initDate = () => {
	if (timer.value) {
		clearInterval(timer.value);
	}
	timer.value = setInterval(() => {
		date.value = formatTime(new Date());
	}, 1000);
};

const fullscreen = () => {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.documentElement.requestFullscreen();
	}
};

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
	if (!currentTrack.value.id) return;
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

const openLyricMenu = (e: MouseEvent, lyricItem: LyricItem, idx: number) => {
	rightClickLyric.value = { ...lyricItem, idx };
	lyricMenu.value?.openMenu(e);
	e.preventDefault();
};

const copyLyric = (withTranslation: boolean) => {
	if (rightClickLyric.value) {
		const idx = rightClickLyric.value.idx;
		if (!withTranslation) {
			copyText(rightClickLyric.value.contents[idx]);
		} else {
			copyText(rightClickLyric.value.contents.join(" "));
		}
	}
};

const setLyricsInterval = () => {
	lyricsInterval = setInterval(() => {
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
	}, 50);
};

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
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	z-index: 200;
	background: var(--color-body-bg);
	display: flex;
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

	.date {
		max-width: 54vh;
		margin: 24px 0;
		color: var(--color-text);
		text-align: center;
		font-size: 4rem;
		font-weight: 600;
		opacity: 0.88;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
	}

	.controls {
		max-width: 54vh;
		margin-top: 24px;
		color: var(--color-text);

		.title {
			margin-top: 8px;
			font-size: 1.4rem;
			font-weight: 600;
			opacity: 0.88;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
		}

		.subtitle {
			margin-top: 4px;
			font-size: 1rem;
			opacity: 0.58;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
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
		padding-top: 5px;
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

.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.4s;
}

.slide-up-enter-from,
.slide-up-leave-to

/* .fade-leave-active below version 2.1.8 */ {
	transform: translateY(100%);
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
