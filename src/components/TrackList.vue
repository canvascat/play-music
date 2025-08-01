<template>
	<div class="track-list">
		<div :style="listStyles">
			<ContextMenu
				v-for="(track, index) in tracks"
				:key="itemKey === 'id' ? track.id : `${track.id}${index}`"
			>
				<ContextMenuTrigger>
					<TrackListItem
						:track-prop="track"
						:track-no="index + 1"
						:highlight-playing-track="highlightPlayingTrack"
						:type="type"
						:album-artist-name="albumObject.artist.name"
						@dblclick.native="playThisList(track.id || track.songId)"
					/>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						v-show="type !== 'cloudDisk'"
						class="pointer-events-none flex items-center gap-2"
					>
						<img
							:src="resizeImage(track.al.picUrl, 224)"
							loading="lazy"
							class="w-10 h-10 rounded-sm"
						/>
						<div class="pr-2">
							<div class="line-clamp-1 font-bold text-base">{{ track.name }}</div>
							<div class="line-clamp-1 text-xs text-muted-foreground">{{ track.ar[0].name }}</div>
						</div>
					</ContextMenuItem>
					<ContextMenuSeparator v-show="type !== 'cloudDisk'" />

					<ContextMenuItem @click="play(track.id)">{{ $t("contextMenu.play") }}</ContextMenuItem>

					<ContextMenuItem @click="addToQueue(track.id)">{{
						$t("contextMenu.addToQueue")
					}}</ContextMenuItem>
					<ContextMenuItem
						v-if="extraContextMenuItem.includes('removeTrackFromQueue')"
						@click="removeTrackFromQueue(track.id)"
						>从队列删除</ContextMenuItem
					>
					<ContextMenuSeparator v-show="type !== 'cloudDisk'" />

					<ContextMenuItem v-show="type !== 'cloudDisk'" @click="like(track.id)">
						{{
							liked.songs.includes(track.id)
								? $t("contextMenu.removeFromMyLikedSongs")
								: $t("contextMenu.saveToMyLikedSongs")
						}}
					</ContextMenuItem>
					<ContextMenuItem
						v-if="extraContextMenuItem.includes('removeTrackFromPlaylist')"
						@click="removeTrackFromPlaylist(track)"
						>从歌单中删除</ContextMenuItem
					>
					<ContextMenuItem v-show="type !== 'cloudDisk'" @click="addTrackToPlaylist(track.id)">{{
						$t("contextMenu.addToPlaylist")
					}}</ContextMenuItem>
					<ContextMenuItem v-show="type !== 'cloudDisk'" @click="copyLink(track.id)">{{
						$t("contextMenu.copyUrl")
					}}</ContextMenuItem>
					<ContextMenuItem
						v-if="extraContextMenuItem.includes('removeTrackFromCloudDisk')"
						@click="removeTrackFromCloudDisk(track.id)"
						>从云盘中删除</ContextMenuItem
					>
				</ContextMenuContent>
			</ContextMenu>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "@/store/pinia";
import * as api from "@/api";
import { isAccountLoggedIn } from "@/utils/auth";
import { resizeImage } from "@/utils/filters";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";
import TrackListItem from "@/components/TrackListItem.vue";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
	ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { copyText } from "@/utils/copy";
import { useModalStore } from "@/store/modal";

const { t } = useI18n();
const modalStore = useModalStore();
const emits = defineEmits(["removeTrack"]);
interface Props {
	tracks?: any[];
	type?: "tracklist" | "album" | "playlist" | "cloudDisk";
	id?: number;
	dbclickTrackFunc?: string;
	albumObject?: any;
	extraContextMenuItem?: string[];
	columnNumber?: number;
	highlightPlayingTrack?: boolean;
	itemKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
	tracks: () => [],
	type: "tracklist",
	id: 0,
	dbclickTrackFunc: "default",
	albumObject: () => ({
		artist: {
			name: "",
		},
	}),
	extraContextMenuItem: () => [],
	columnNumber: 4,
	highlightPlayingTrack: true,
	itemKey: "id",
});
const { liked, player, likeATrack, updateLiked } = useStore();

const listStyles = ref({
	// display: 'grid',
	// gap: '4px',
	// gridTemplateColumns: `repeat(${props.columnNumber}, 1fr)`,
});

if (props.type === "tracklist") {
	listStyles.value = {
		display: "grid",
		gap: "4px",
		gridTemplateColumns: `repeat(${props.columnNumber}, 1fr)`,
	};
}

function playThisList(trackID: string) {
	if (props.dbclickTrackFunc === "default") {
		playThisListDefault(trackID);
	} else if (props.dbclickTrackFunc === "none") {
		// do nothing
	} else if (props.dbclickTrackFunc === "playTrackOnListByID") {
		player.playTrackOnListByID(trackID);
	} else if (props.dbclickTrackFunc === "playPlaylistByID") {
		player.playPlaylistByID(props.id, trackID);
	} else if (props.dbclickTrackFunc === "playAList") {
		let trackIDs = props.tracks.map((t) => t.id || t.songId);
		player.replacePlaylist(trackIDs, props.id, "artist", trackID);
	} else if (props.dbclickTrackFunc === "dailyTracks") {
		let trackIDs = props.tracks.map((t) => t.id);
		player.replacePlaylist(trackIDs, "/daily/songs", "url", trackID);
	} else if (props.dbclickTrackFunc === "playCloudDisk") {
		let trackIDs = props.tracks.map((t) => t.id || t.songId);
		player.replacePlaylist(trackIDs, props.id, "cloudDisk", trackID);
	}
}
function playThisListDefault(trackID: string) {
	if (props.type === "playlist") {
		player.playPlaylistByID(props.id, trackID);
	} else if (props.type === "album") {
		player.playAlbumByID(props.id, trackID);
	} else if (props.type === "tracklist") {
		let trackIDs = props.tracks.map((t) => t.id);
		player.replacePlaylist(trackIDs, props.id, "artist", trackID);
	}
}
function play(trackID: string) {
	player.addTrackToPlayNext(trackID, true);
}
function addToQueue(trackID: string) {
	player.addTrackToPlayNext(trackID);
}
function like(trackID: string) {
	likeATrack(trackID);
}
function addTrackToPlaylist(trackID: string) {
	if (!isAccountLoggedIn()) {
		toast(t("toast.needToLogin"));
		return;
	}
	modalStore.showAddTrackToPlaylist(trackID);
}
function removeTrackFromPlaylist(track: any) {
	if (!isAccountLoggedIn()) {
		toast(t("toast.needToLogin"));
		return;
	}
	if (confirm(`确定要从歌单删除 ${track.name}？`)) {
		let trackID = track.id;
		api.playlist
			.addOrRemoveTrackFromPlaylist({
				op: "del",
				pid: props.id,
				tracks: trackID,
			})
			.then((data) => {
				toast(data.body.code === 200 ? t("toast.removedFromPlaylist") : data.body.message);
				emits("removeTrack", trackID);
			});
	}
}
function copyLink(trackID: string) {
	copyText(`https://music.163.com/song?id=${trackID}`)
		.then(() => {
			toast(t("toast.copied"));
		})
		.catch((err) => {
			toast(`${t("toast.copyFailed")}${err}`);
		});
}
function removeTrackFromQueue(trackID: string) {
	player.removeTrackFromQueue(trackID);
}
function removeTrackFromCloudDisk(track: any) {
	if (confirm(`确定要从云盘删除 ${track.songName}？`)) {
		// ?? 这里track.songId 和 track.id 不一样
		let trackID = track.songId;
		api.user.cloudDiskTrackDelete(trackID).then((data) => {
			toast(data.code === 200 ? "已将此歌曲从云盘删除" : data.message);
			updateLiked(
				"cloudDisk",
				liked.cloudDisk.filter((t) => t.songId !== trackID),
			);
		});
	}
}
</script>
