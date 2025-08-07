<script setup lang="ts">
import * as api from "@/api";
import { ref, onMounted } from "vue";
import { IconX } from "@/components/icon";
import { useLastfmStore } from "@/store/lastfm";

const message = ref("请稍等...");
const done = ref(false);
const { update } = useLastfmStore();

onMounted(() => {
	const token = new URLSearchParams(window.location.search).get("token");
	if (!token) {
		message.value = "连接失败，请重试或联系开发者（无Token）";
		done.value = true;
		return;
	}
	api.lastfm.authGetSession(token).then((result) => {
		if (!result.data.session) {
			message.value = "连接失败，请重试或联系开发者（无Session）";
			done.value = true;
			return;
		}
		localStorage.setItem("lastfm", JSON.stringify(result.data.session));
		update(result.data.session);
		message.value = "已成功连接到 Last.fm";
		done.value = true;
	});
});

function close() {
	window.close();
}
</script>

<template>
	<div class="lastfm-callback">
		<div class="section-1">
			<img src="/img/logos/yesplaymusic.png" />
			<IconX class="size-6" />
			<img src="/img/logos/lastfm.png" />
		</div>
		<div class="message">{{ message }}</div>
		<button v-show="done" @click="close">完成</button>
	</div>
</template>

<style lang="scss" scoped>
.lastfm-callback {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: calc(100vh - 192px);
}

.section-1 {
	margin-bottom: 16px;
	display: flex;
	align-items: center;

	img {
		height: 64px;
		margin: 20px;
	}

	.svg-icon {
		color: rgba(82, 82, 82, 0.28);
	}
}

.message {
	font-size: 1.4rem;
	font-weight: 500;
	color: var(--color-text);
}

button {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-weight: 600;
	background-color: var(--color-primary-bg);
	color: var(--color-primary);
	border-radius: 8px;
	margin-top: 24px;
	transition: 0.2s;
	padding: 8px 16px;

	&:hover {
		transform: scale(1.06);
	}

	&:active {
		transform: scale(0.94);
	}
}
</style>
