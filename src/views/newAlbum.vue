<script setup lang="ts">
import * as api from "@/api";
import NProgress from "nprogress";
import { ref, onMounted } from "vue";

import CoverRow from "@/components/CoverRow.vue";
import type { Album } from "ncm-api/types";
import { AlbumListArea } from "ncm-api/types";

const albums = ref<Album[]>([]);

onMounted(() => {
	api.album
		.newAlbums({
			area: AlbumListArea.ea,
			limit: 100,
		})
		.then((data) => {
			albums.value = data.albums;
			NProgress.done();
		});
});
</script>

<template>
	<div class="text-foreground text-6xl">
		<h1>{{ $t("home.newAlbum") }}</h1>
		<div class="playlist-row">
			<div class="playlists">
				<CoverRow type="album" :items="albums" sub-text="artist" :show-play-button="true" />
			</div>
		</div>
	</div>
</template>
