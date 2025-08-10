<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
import { computed, KeepAlive, onMounted } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalStore } from "@/store/global";
import * as auth from "@/utils/auth";
import ModalAddTrackToPlaylist from "./components/ModalAddTrackToPlaylist.vue";
import ModalNewPlaylist from "./components/ModalNewPlaylist.vue";
import Navbar from "./components/Navbar.vue";
import Player from "./components/Player.vue";
import Lyrics from "./views/lyrics.vue";
import { useLikedStore } from "@/store/liked";
import { SlideUp } from "./components/transition";

const store = useGlobalStore();
const router = useRouter();
const { fetchLikedData } = useLikedStore();

const keepAliveComponents = computed(() =>
	router
		.getRoutes()
		.filter((route) => route.meta.keepAlive)
		.map((route) => route.name as string),
);

const showLyrics = computed(() => store.showLyrics);
const player = computed(() => store.player);

const isAccountLoggedIn = computed(() => auth.isAccountLoggedIn());
const route = useRoute();

const showPlayer = computed(() => {
	return !["mv", "loginUsername", "login", "lastfmCallback"].includes(route.name as string);
});

const enablePlayer = computed(() => {
	return player.value.enabled && route.name !== "lastfmCallback";
});

const showNavbar = computed(() => {
	return route.name !== "lastfmCallback";
});

const handleKeydown = (e: KeyboardEvent) => {
	if (e.code === "Space") {
		if (e.target && "tagName" in e.target && e.target.tagName === "INPUT") return false;
		if (route.name === "mv") return false;
		e.preventDefault();
		player.value.playOrPause();
	}
};

onMounted(() => {
	window.addEventListener("keydown", handleKeydown);
	fetchLikedData();
});
</script>

<template>
	<Navbar v-show="showNavbar" />
	<ScrollArea
		as="main"
		scroll-bar-class="top-[64px]! bottom-[64px]! h-[auto]!"
		class="fixed! left-0 right-0 top-0 bottom-0 [&>[data-reka-scroll-area-viewport]]:pt-16 [&>[data-reka-scroll-area-viewport]]:pb-24 [&>[data-reka-scroll-area-viewport]]:px-[5vw] xl:[&>[data-reka-scroll-area-viewport]]:px-[10vw]"
	>
		<RouterView v-slot="{ Component }">
			<KeepAlive :include="keepAliveComponents">
				<component :is="Component" />
			</KeepAlive>
		</RouterView>
	</ScrollArea>
	<SlideUp>
		<Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
	</SlideUp>

	<ModalAddTrackToPlaylist v-if="isAccountLoggedIn" />
	<ModalNewPlaylist v-if="isAccountLoggedIn" />
	<SlideUp v-if="enablePlayer">
		<Lyrics v-show="showLyrics" />
	</SlideUp>

	<Toaster />
</template>
