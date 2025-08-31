<template>
	<div
		class="h-[198px] bg-secondary flex select-none rounded-2xl p-4"
		:style="{ background }"
		data-theme="dark"
	>
		<img
			class="cover rounded-xl h-full mr-5 cursor-pointer"
			:src="resizeImage(track?.album?.picUrl, 512)"
			loading="lazy"
			@click="goToAlbum"
		/>
		<div class="text-2xl font-semibold flex flex-col justify-between w-full text-white">
			<div>
				<div class="mb-2.5 line-clamp-2 break-all">{{ track.name }}</div>
				<div class="line-clamp-2 break-all opacity-68">
					<ArtistsInLine :artists="artists" />
				</div>
			</div>
			<div class="flex justify-between items-baseline">
				<div class="flex gap-2">
					<ButtonIcon title="不喜欢" @click="moveToFMTrash">
						<IconThumbsDown class="size-5.5" />
					</ButtonIcon>
					<ButtonIcon
						:title="$t(isPlaying ? 'player.pause' : 'player.play')"
						class="play"
						@click="play"
					>
						<IconPause v-if="isPlaying" class="size-6" />
						<IconPlay v-else class="size-6" />
					</ButtonIcon>
					<ButtonIcon :title="$t('player.next')" @click="next">
						<IconNext class="size-6" />
					</ButtonIcon>
				</div>
				<div class="flex items-center opacity-18">
					<IconFm class="size-4 mr-2" />
					<span class="font-semibold text-lg select-none">私人FM</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import ButtonIcon from "@/components/ButtonIcon.vue";
import ArtistsInLine from "@/components/ArtistsInLine.vue";
import { IconThumbsDown, IconPlay, IconPause, IconNext, IconFm } from "@/components/icon";
import { useGlobalStore } from "@/store/global";
import { resizeImage } from "@/utils/filters";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import getImageColor from "@/utils/image-color";

const { player } = useGlobalStore();

const router = useRouter();

const background = ref("");

const track = computed(() => player.personalFMTrack || Object.create(null));
const isPlaying = computed(() => player.playing && player.isPersonalFM);
const artists = computed(() => track.value?.artists || track.value?.ar || []);

const play = () => {
	player.playPersonalFM();
};
const next = () => {
	player.playNextFMTrack();
};
const goToAlbum = () => {
	if (track.value.album.id === 0) return;
	router.push({ path: "/album/" + track.value.album.id });
};
const moveToFMTrash = () => {
	player.moveToFMTrash();
};
const getColor = (imgUrl: string) => {
	if (!imgUrl) return;
	const cover = `${imgUrl.replace("http://", "https://")}?param=512y512`;
	getImageColor(cover, "Vibrant").then((originColor) => {
		const color = originColor.darken(0.1).rgb().string();
		const color2 = originColor.lighten(0.28).rotate(-30).rgb().string();
		background.value = `linear-gradient(to top left, ${color}, ${color2})`;
	});
};

watch(() => track.value?.album?.picUrl, getColor, { immediate: true });
</script>
