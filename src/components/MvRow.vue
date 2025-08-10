<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { FadeIn } from "./transition";

// 定义接口
interface Creator {
	userName: string;
	userId: number;
}

interface MvItem {
	id?: number;
	vid?: number;
	name?: string;
	title?: string;
	imgurl16v9?: string;
	cover?: string;
	coverUrl?: string;
	artistName?: string;
	artistId?: number;
	creator?: Creator[];
	publishTime?: string;
}

// 定义props
interface Props {
	playing?: boolean;
	mvs: MvItem[];
	subtitle?: "artist" | "publishTime";
	/** @deprecated */
	withoutPadding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	subtitle: "artist",
	withoutPadding: false,
});

const router = useRouter();
const hoverVideoID = ref(0);

// 方法
const goToMv = (id: number) => {
	let query: Record<string, any> = {};
	if (typeof props.playing === "boolean") {
		query = { autoplay: props.playing };
	}
	router.push({ path: "/mv/" + id, query });
};

const getUrl = (mv: MvItem): string => {
	const url = mv.imgurl16v9 ?? mv.cover ?? mv.coverUrl ?? "";
	return url.replace(/^http:/, "https:") + "?param=464y260";
};

const getID = (mv: MvItem): number => {
	if (mv.id !== undefined) return mv.id;
	if (mv.vid !== undefined) return mv.vid;
	return 0;
};

const getTitle = (mv: MvItem): string => {
	if (mv.name !== undefined) return mv.name;
	if (mv.title !== undefined) return mv.title;
	return "";
};

const getSubtitle = (mv: MvItem): string => {
	if (props.subtitle === "artist") {
		let artistName = "null";
		let artistID = 0;
		if (mv.artistName !== undefined) {
			artistName = mv.artistName;
			artistID = mv.artistId ?? 0;
		} else if (mv.creator !== undefined && mv.creator.length > 0) {
			artistName = mv.creator[0].userName;
			artistID = mv.creator[0].userId;
		}
		return `<a href="/artist/${artistID}">${artistName}</a>`;
	} else if (props.subtitle === "publishTime") {
		return mv.publishTime ?? "";
	}
	return "";
};
</script>

<template>
	<div
		class="mv-row grid gap-x-9 gap-y-6 grid-cols-5 md:max-xl:grid-cols-4 lg:max-xl:grid-cols-3 xl:max-xl:grid-cols-2 2xl:max-xl:grid-cols-1"
	>
		<div v-for="mv in mvs" :key="getID(mv)">
			<div
				class="cursor-pointer relative transition-transform duration-300 md:hover:scale-105"
				@mouseover="hoverVideoID = getID(mv)"
				@mouseleave="hoverVideoID = 0"
				@click="goToMv(getID(mv))"
			>
				<img :src="getUrl(mv)" loading="lazy" class="rounded-2xl w-full select-none" />
				<FadeIn>
					<div
						v-show="hoverVideoID === getID(mv)"
						class="absolute top-1.5 h-full w-full filter blur-16 opacity-40 scale-90 z-[-1] bg-cover rounded-2xl"
						:style="{ background: 'url(' + getUrl(mv) + ')' }"
					></div>
				</FadeIn>
			</div>
			<div>
				<div class="line-clamp-2 text-sm font-semibold opacity-88 break-all">
					<RouterLink :to="'/mv/' + getID(mv)">{{ getTitle(mv) }}</RouterLink>
				</div>
				<div class="text-xs opacity-68 line-clamp-2" v-html="getSubtitle(mv)"></div>
			</div>
		</div>
	</div>
</template>
