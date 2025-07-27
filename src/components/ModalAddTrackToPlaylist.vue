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
			<div class="new-playlist-button" @click="newPlaylist"><IconPlus />新建歌单</div>
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
import { useStore } from "@/store/pinia";
import Modal from "@/components/Modal.vue";
import * as api from "@/api";
import { resizeImage } from "@/utils/filters";
import { toast } from "vue-sonner";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModalStore } from "@/store/modal";
import { IconPlus } from "@/components/icon";

const modalStore = useModalStore();

const { t } = useI18n();

const { liked, data } = useStore();

const show = computed(() => modalStore.show.addTrackToPlaylist);

const ownPlaylists = computed(() => {
	return liked.playlists.filter(
		(p) => p.creator.userId === data.user.userId && p.id !== data.likedSongPlaylistID,
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
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 16px;
	font-weight: 500;
	color: var(--color-text);
	background: var(--color-secondary-bg-for-transparent);
	border-radius: 8px;
	height: 48px;
	margin-bottom: 16px;
	margin-right: 6px;
	margin-left: 6px;
	cursor: pointer;
	transition: 0.2s;

	.svg-icon {
		width: 16px;
		height: 16px;
		margin-right: 8px;
	}

	&:hover {
		color: var(--color-primary);
		background: var(--color-primary-bg-for-transparent);
	}
}
</style>
