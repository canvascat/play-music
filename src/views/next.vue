<script setup lang="ts">
import { ref, computed, watch, onActivated } from "vue";
import { useGlobalStore } from "@/store/global";
import * as api from "@/api";
import TrackList from "@/components/TrackList.vue";
import Button from "@/components/ui/button/Button.vue";

// 定义接口
interface Track {
	id: number;
	name: string;
	ar: any[];
	al: any;
	dt: number;
	[key: string]: any;
}

const { player } = useGlobalStore();

// 响应式数据
const tracks = ref<Track[]>([]);

// 计算属性
const currentTrack = computed(() => player.currentTrack);
const playerShuffle = computed(() => player.shuffle);
const filteredTracks = computed(() => {
	const trackIDs = player.list.slice(player.current + 1, player.current + 100);
	return trackIDs.map((tid) => tracks.value.find((t) => t.id === tid)).filter((t) => t) as Track[];
});

const playNextList = computed(() => player.playNextList);
const playNextTracks = computed(() => {
	return playNextList.value
		.map((tid) => {
			return tracks.value.find((t) => t.id === tid);
		})
		.filter((t) => t) as Track[];
});

// 监听器
watch(currentTrack, () => {
	loadTracks();
});

watch(playerShuffle, () => {
	loadTracks();
});

watch(playNextList, () => {
	loadTracks();
});

// 生命周期
onActivated(() => {
	loadTracks();
	// TODO scrollbar.restorePosition();
});

// 方法
const loadTracks = () => {
	// 获取播放列表当前歌曲后100首歌
	const trackIDs = player.list.slice(player.current + 1, player.current + 100);

	// 将playNextList的歌曲加进trackIDs
	trackIDs.push(...playNextList.value);

	// 获取已经加载了的歌曲
	const loadedTrackIDs = tracks.value.map((t) => t.id);

	if (trackIDs.length > 0) {
		api.track.getTrackDetail(trackIDs.join(",")).then((data) => {
			const newTracks = data.songs.filter((t: Track) => !loadedTrackIDs.includes(t.id));
			tracks.value.push(...newTracks);
		});
	}
};
</script>

<template>
	<h1 class="mt-9 mb-4.5">{{ $t("next.nowPlaying") }}</h1>
	<TrackList :tracks="[currentTrack]" type="playlist" dbclick-track-func="none" />

	<div class="mt-9 mb-4.5 flex justify-between" v-show="playNextList.length > 0">
		<h1>插队播放</h1>
		<Button variant="ghost" @click="player.clearPlayNextList()">清除队列</Button>
	</div>

	<TrackList
		v-show="playNextList.length > 0"
		:tracks="playNextTracks"
		type="playlist"
		:highlight-playing-track="false"
		dbclick-track-func="playTrackOnListByID"
		item-key="id+index"
		:extra-context-menu-item="['removeTrackFromQueue']"
	/>
	<h1 class="mt-9 mb-4.5">{{ $t("next.nextUp") }}</h1>
	<TrackList
		:tracks="filteredTracks"
		type="playlist"
		:highlight-playing-track="false"
		dbclick-track-func="playTrackOnListByID"
	/>
</template>
