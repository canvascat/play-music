<template>
	<div :class="cn('grid grid-cols-5 gap-x-11 gap-y-6', props.class)" :style="rowStyles">
		<div v-for="item in items" :key="item.id" class="item" :class="{ artist: type === 'artist' }">
			<Cover
				:id="item.id"
				:image-url="getImageUrl(item)"
				:type="type"
				:play-button-size="type === 'artist' ? 26 : playButtonSize"
			/>
			<div class="text">
				<div v-if="showPlayCount" class="info">
					<span class="play-count"><IconPlay />{{ formatPlayCount(item.playCount) }} </span>
				</div>
				<div class="title" :style="{ fontSize: subTextFontSize }">
					<span v-if="isExplicit(item)" class="explicit-symbol"><ExplicitSymbol /></span>
					<span v-if="isPrivacy(item)" class="lock-icon">
						<IconLock />
					</span>
					<router-link :to="getTitleLink(item)">{{ item.name }}</router-link>
				</div>
				<div v-if="type !== 'artist' && subText !== 'none'" class="info">
					<span v-html="getSubText(item)"></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import Cover from "@/components/Cover.vue";
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";
import { formatPlayCount } from "@/utils/filters";
import { cn } from "@/lib/utils";
import { IconLock, IconPlay } from "@/components/icon";

// 定义接口
interface Artist {
	id: number;
	name: string;
}

interface Creator {
	nickname: string;
}

interface CoverRowItem {
	id: number;
	name: string;
	img1v1Url?: string;
	picUrl?: string;
	coverImgUrl?: string;
	playCount?: number;
	copywriter?: string;
	description?: string;
	updateFrequency?: string;
	creator?: Creator;
	publishTime?: string;
	artist?: Artist;
	artists?: Artist[];
	type?: string | string[];
	size?: number;
	mark?: number;
	privacy?: number;
}

// 定义props
interface Props {
	class?: HTMLAttributes["class"];
	/** @deprecated */
	columnNumber?: number;
	/** @deprecated */
	gap?: string;
	items: CoverRowItem[];
	type: "artist" | "album" | "playlist";
	subText?: string;
	subTextFontSize?: string;
	showPlayCount?: boolean;
	playButtonSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
	subText: "none",
	subTextFontSize: "16px",
	showPlayCount: false,
	columnNumber: 5,
	gap: "44px 24px",
	playButtonSize: 22,
});

// 计算属性
const rowStyles = computed(() => ({
	"grid-template-columns": `repeat(${props.columnNumber}, 1fr)`,
	gap: props.gap as string,
}));

// 方法
const getSubText = (item: CoverRowItem): string => {
	if (props.subText === "copywriter") return item.copywriter || "";
	if (props.subText === "description") return item.description || "";
	if (props.subText === "updateFrequency") return item.updateFrequency || "";
	if (props.subText === "creator") return "by " + (item.creator?.nickname || "");
	if (props.subText === "releaseYear")
		return new Date(item.publishTime || "").getFullYear().toString();
	if (props.subText === "artist") {
		if (item.artist !== undefined)
			return `<a href="/artist/${item.artist.id}">${item.artist.name}</a>`;
		if (item.artists !== undefined)
			return `<a href="/artist/${item.artists[0].id}">${item.artists[0].name}</a>`;
	}
	if (props.subText === "albumType+releaseYear") {
		let albumType = item.type || "";
		if (typeof item.type === "string" && item.type === "EP/Single") {
			albumType = item.size === 1 ? "Single" : "EP";
		} else if (typeof item.type === "string" && item.type === "Single") {
			albumType = "Single";
		} else if (typeof item.type === "string" && item.type === "专辑") {
			albumType = "Album";
		}
		return `${albumType} · ${new Date(item.publishTime || "").getFullYear()}`;
	}
	if (props.subText === "appleMusic") return "by Apple Music";
	return "";
};

const isPrivacy = (item: CoverRowItem): boolean => {
	return props.type === "playlist" && item.privacy === 10;
};

const isExplicit = (item: CoverRowItem): boolean => {
	return props.type === "album" && (item.mark || 0 & 1048576) === 1048576;
};

const getTitleLink = (item: CoverRowItem): string => {
	return `/${props.type}/${item.id}`;
};

const getImageUrl = (item: CoverRowItem): string => {
	if (item.img1v1Url) {
		const img1v1ID = item.img1v1Url.split("/").slice(-1)[0];
		if (img1v1ID === "5639395138885805.jpg") {
			// 没有头像的歌手，网易云返回的img1v1Url并不是正方形的 😅😅😅
			return "https://p2.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg?param=512y512";
		}
	}
	let img = item.img1v1Url || item.picUrl || item.coverImgUrl;
	return `${img?.replace("http://", "https://")}?param=512y512`;
};
</script>

<style lang="scss" scoped>
.item {
	color: var(--color-text);
	.text {
		margin-top: 8px;
		.title {
			font-size: 16px;
			font-weight: 600;
			line-height: 20px;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			word-break: break-all;
		}
		.info {
			font-size: 12px;
			opacity: 0.68;
			line-height: 18px;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			word-break: break-word;
		}
	}
}

.item.artist {
	display: flex;
	flex-direction: column;
	text-align: center;
	.cover {
		display: flex;
	}
	.title {
		margin-top: 4px;
	}
}

@media (max-width: 834px) {
	.item .text .title {
		font-size: 14px;
	}
}

.explicit-symbol {
	opacity: 0.28;
	color: var(--color-text);
	float: right;
	.svg-icon {
		margin-bottom: -3px;
	}
}

.lock-icon {
	opacity: 0.28;
	color: var(--color-text);
	margin-right: 4px;
	// float: right;
	.svg-icon {
		height: 12px;
		width: 12px;
	}
}

.play-count {
	font-weight: 600;
	opacity: 0.58;
	color: var(--color-text);
	font-size: 12px;
	.svg-icon {
		margin-right: 3px;
		height: 8px;
		width: 8px;
	}
}
</style>
