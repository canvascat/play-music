<template>
	<Card class="text-center">
		<CardHeader>
			<CardDescription> {{ qrCodeInformation }} </CardDescription>
		</CardHeader>
		<CardContent class="flex justify-center">
			<div
				v-show="qrCodeSvg"
				class="bg-[var(--color-primary-bg)] overflow-hidden mb-3 rounded-2xl p-6"
			>
				<img :src="qrCodeSvg" loading="lazy" />
			</div>
		</CardContent>
	</Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import NProgress from "nprogress";
import QRCode from "qrcode";
import { onMounted, ref } from "vue";
import * as api from "@/api";
import { setCookies } from "@/utils/auth";
import { useTimeoutPoll } from "@vueuse/core";
import pkg from "../../../package.json";
import { toast } from "vue-sonner";

const qrCodeKey = ref("");
const qrCodeSvg = ref("");
const qrCodeInformation = ref("打开网易云音乐APP扫码登录");

const emits = defineEmits<{
	success: [];
}>();

function handleLoginResponse(data) {
	if (!data) {
		return;
	}
	if (data.code === 200) {
		setCookies(data.cookie);
		emits("success");
	} else {
		toast(data.msg ?? data.message ?? "账号或密码错误，请检查");
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

const updateQrCode = async () => {
	const result = await api.auth.loginQrCodeKey();
	if (result.code !== 200) return;
	qrCodeKey.value = result.data.unikey;
	try {
		await updateQrCodeSvg(`https://music.163.com/login?codekey=${qrCodeKey.value}`);
		checkPoll.resume();
	} finally {
		NProgress.done();
	}
};

async function checkQrCodeLogin() {
	// 清除二维码检测
	if (qrCodeKey.value === "") return;
	const result = await api.auth.loginQrCodeCheck(qrCodeKey.value);
	if (result.code === 800) {
		updateQrCode(); // 重新生成QrCode
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

onMounted(() => {
	updateQrCode();
});
</script>
