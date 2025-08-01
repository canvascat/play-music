<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginCookie from "./loginCookie.vue";
import LoginQRCode from "./loginQRCode.vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store/pinia";

const router = useRouter();
const { fetchUserProfile, fetchLikedPlaylist } = useStore();

async function handleLoginSuccess() {
	await fetchUserProfile();
	await fetchLikedPlaylist();
	router.push({ path: "/library" });
}
</script>

<template>
	<div class="mt-8">
		<div class="flex flex-col items-center justify-center">
			<div class="mb-4 flex items-center">
				<img src="/img/logos/netease-music.png" class="size-16 m-5 select-none" />
			</div>
			<div class="text-2xl font-bold mb-12">{{ $t("login.loginText") }}</div>

			<Tabs default-value="cookie" class="w-[400px]">
				<TabsList class="grid w-full grid-cols-2">
					<TabsTrigger value="cookie"> Cookie 登录 </TabsTrigger>
					<TabsTrigger value="qrcode"> 扫码登录 </TabsTrigger>
				</TabsList>
				<TabsContent value="cookie">
					<LoginCookie @success="handleLoginSuccess" />
				</TabsContent>
				<TabsContent value="qrcode">
					<LoginQRCode @success="handleLoginSuccess" />
				</TabsContent>
			</Tabs>
		</div>
	</div>
</template>
