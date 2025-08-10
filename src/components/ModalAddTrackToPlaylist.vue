<template>
	<Modal
		class="add-track-to-playlist-modal"
		:show="show"
		:close="modalStore.closeAddTrackToPlaylist"
		:show-footer="false"
		title="添加到歌单"
		width="25vw"
	>
		<template v-slot:default>
			<div
				class="new-playlist-button text-foreground flex items-center justify-center text-base font-medium rounded-lg mb-4 mx-1.5 cursor-pointer"
				@click="newPlaylist"
			>
				<IconPlus class="size-4 mr-2" />新建歌单
			</div>
			<div
				v-for="playlist in ownPlaylists"
				:key="playlist.id"
				class="flex p-2 rounded-xl cursor-pointer hover:bg-gray-100"
				@click="addTrackToPlaylist(playlist.id)"
			>
				<img
					class="rounded-lg h-11 w-11 mr-3 border border-gray-200"
					:src="resizeImage(playlist.coverImgUrl, 224)"
					loading="lazy"
				/>
				<div>
					<div class="line-clamp-1 break-all pr-4 text-base font-medium">{{ playlist.name }}</div>
					<div class="text-sm opacity-68">{{ playlist.trackCount }} 首</div>
				</div>
			</div>
		</template>
	</Modal>
</template>

<script setup lang="ts">
import Modal from "@/components/Modal.vue";
import * as api from "@/api";
import { resizeImage } from "@/utils/filters";
import { toast } from "vue-sonner";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModalStore } from "@/store/modal";
import { IconPlus } from "@/components/icon";
import { useDataStore } from "@/store/data";
import { useLikedStore } from "@/store/liked";

const modalStore = useModalStore();

const { t } = useI18n();

const dataStore = useDataStore();

const { liked } = useLikedStore();

const show = computed(() => modalStore.show.addTrackToPlaylist);

const ownPlaylists = computed(() => {
	return liked.playlists.filter(
		(p) => p.creator.userId === dataStore.user?.userId && p.id !== dataStore.likedSongPlaylistID,
	);
});

function addTrackToPlaylist(playlistID: string) {
	api.playlist
		.addOrRemoveTrackFromPlaylist({
			op: "add",
			pid: playlistID,
			tracks: `${modalStore.selectedTrackID}`,
		})
		.then((data) => {
			if (data.body.code === 200) {
				modalStore.closeAddTrackToPlaylist();
				toast(t("toast.savedToPlaylist"));
			} else {
				toast(data.body.message);
			}
		});
}

function newPlaylist() {
	modalStore.showNewPlaylist(modalStore.selectedTrackID);
	modalStore.closeAddTrackToPlaylist();
}
</script>

<style lang="scss" scoped>
.new-playlist-button {
	background: var(--color-secondary-bg-for-transparent);

	height: 48px;

	transition: 0.2s;

	&:hover {
		color: var(--color-primary);
		background: var(--color-primary-bg-for-transparent);
	}
}
</style>
