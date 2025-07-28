<template>
	<div class="mt-8">
		<div class="flex flex-col items-center justify-center">
			<div class="mb-4 flex items-center">
				<img src="/img/logos/netease-music.png" class="size-16 m-5 select-none" />
			</div>
			<div class="text-2xl font-bold mb-12">{{ $t("login.loginText") }}</div>
			<div class="flex flex-col items-center">
				<div>
					<div
						v-show="qrCodeSvg"
						class="bg-[var(--color-primary-bg)] relative overflow-hidden mb-3 rounded-2xl p-6"
					>
						<img :src="qrCodeSvg" loading="lazy" />
						<div
							v-if="expired"
							class="size-full flex items-center justify-center absolute top-0 left-0 z-1 bg-white/50 backdrop-blur-lg backdrop-saturate-180"
						>
							<Button
								variant="outline"
								size="icon"
								class="rounded-full hover:bg-white/80"
								:disabled="!updateQrCode.isReady"
								@click="updateQrCode.executeImmediate"
							>
								<RefreshCwIcon class="size-4" />
							</Button>
						</div>
					</div>
					<div class="text-center text-sm text-gray-500">
						{{ qrCodeInformation }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import NProgress from "nprogress";
import QRCode from "qrcode";
import { ref } from "vue";
import { useRouter } from "vue-router";
import * as api from "@/api";
import { useStore } from "@/store/pinia";
import { setCookies } from "@/utils/auth";
import nativeAlert from "@/utils/nativeAlert";
import { useAsyncState, useTimeoutPoll } from "@vueuse/core";
import pkg from "../../package.json";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-vue-next";

const router = useRouter();
const processing = ref(false);
const expired = ref(true);
const qrCodeKey = ref("");
const qrCodeSvg = ref("");
const qrCodeInformation = ref("打开网易云音乐APP扫码登录");

const { fetchUserProfile, fetchLikedPlaylist } = useStore();

function handleLoginResponse(data) {
	if (!data) {
		processing.value = false;
		return;
	}
	if (data.code === 200) {
		setCookies(data.cookie);
		fetchUserProfile().then(() => {
			fetchLikedPlaylist().then(() => {
				router.push({ path: "/library" });
			});
		});
	} else {
		processing.value = false;
		nativeAlert(data.msg ?? data.message ?? "账号或密码错误，请检查");
	}
}

async function updateQrCodeSvg(text: string) {
	const svg = await QRCode.toString(text, {
		width: 192,
		margin: 0,
		color: { dark: "#335eea", light: "#00000000" },
		type: "svg",
	});

	qrCodeSvg.value = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
updateQrCodeSvg(pkg.repository.url);

const updateQrCode = useAsyncState(
	async () => {
		const result = await api.auth.loginQrCodeKey();
		if (result.code !== 200) return;
		qrCodeKey.value = result.data.unikey;
		try {
			await updateQrCodeSvg(`https://music.163.com/login?codekey=${qrCodeKey.value}`);
			expired.value = false;
			checkPoll.resume();
		} finally {
			NProgress.done();
		}
	},
	undefined,
	{ immediate: false },
);

async function checkQrCodeLogin() {
	// 清除二维码检测
	if (qrCodeKey.value === "") return;
	const result = await api.auth.loginQrCodeCheck(qrCodeKey.value);
	if (result.code === 800) {
		// getQrCodeKey(); // 重新生成QrCode
		expired.value = true;
		qrCodeInformation.value = "二维码已失效，请重新扫码";
	} else if (result.code === 802) {
		qrCodeInformation.value = "扫描成功，请在手机上确认登录";
	} else if (result.code === 801) {
		qrCodeInformation.value = "打开网易云音乐APP扫码登录";
	} else if (result.code === 803) {
		checkPoll.pause();
		qrCodeInformation.value = "登录成功，请稍等...";
		result.code = 200;
		result.cookie = result.cookie.replaceAll(" HTTPOnly", "");
		handleLoginResponse(result);
	}
}
const checkPoll = useTimeoutPoll(checkQrCodeLogin, 1000, { immediate: false });
</script>
