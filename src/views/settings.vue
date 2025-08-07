<template>
	<div class="flex justify-center mt-8" @click="clickOutside">
		<div class="container mt-6">
			<div v-if="showUserInfo" class="user">
				<div class="flex items-center">
					<img class="size-16 rounded-full" :src="dataStore.user?.avatarUrl" loading="lazy" />
					<div class="ml-6">
						<div class="mb-1 text-lg font-bold">{{ dataStore.user?.nickname }}</div>
						<div class="text-sm">
							<span class="opacity-68">{{ dataStore.user?.signature }}</span>
						</div>
					</div>
				</div>

				<button
					class="text-lg flex gap-1 items-center font-bold rounded-xl px-4 py-2 opacity-68"
					@click="logout"
				>
					<IconLogout class="size-[1em]" />
					{{ $t("settings.logout") }}
				</button>
			</div>

			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.language") }}</div>
				</div>
				<div class="right">
					<select v-model="lang">
						<option value="en">🇬🇧 English</option>
						<option value="zh-CN">🇨🇳 简体中文</option>
						<option value="zh-TW">繁體中文</option>
					</select>
				</div>
			</div>
			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.appearance.text") }}</div>
				</div>
				<div class="right">
					<select v-model="appearance">
						<option value="auto">{{ $t("settings.appearance.auto") }}</option>
						<option value="light">🌞 {{ $t("settings.appearance.light") }}</option>
						<option value="dark">🌚 {{ $t("settings.appearance.dark") }}</option>
					</select>
				</div>
			</div>
			<div class="item">
				<div class="left">
					<div class="title">
						{{ $t("settings.MusicGenrePreference.text") }}
					</div>
				</div>
				<div class="right">
					<select v-model="musicLanguage">
						<option value="all">{{ $t("settings.MusicGenrePreference.none") }}</option>
						<option value="zh">{{ $t("settings.MusicGenrePreference.mandarin") }}</option>
						<option value="ea">{{ $t("settings.MusicGenrePreference.western") }}</option>
						<option value="jp">{{ $t("settings.MusicGenrePreference.japanese") }}</option>
						<option value="kr">{{ $t("settings.MusicGenrePreference.korean") }}</option>
					</select>
				</div>
			</div>

			<!-- <h3>音质</h3> -->
			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.musicQuality.text") }}</div>
				</div>
				<div class="right">
					<select v-model="musicQuality">
						<option value="128000">{{ $t("settings.musicQuality.low") }} - 128Kbps</option>
						<option value="192000">{{ $t("settings.musicQuality.medium") }} - 192Kbps</option>
						<option value="320000">{{ $t("settings.musicQuality.high") }} - 320Kbps</option>
						<option value="flac">{{ $t("settings.musicQuality.lossless") }} - FLAC</option>
						<option value="999000">Hi-Res</option>
					</select>
				</div>
			</div>
			<div v-if="isElectron" class="item">
				<div class="left">
					<div class="title">{{ $t("settings.deviceSelector") }}</div>
				</div>
				<div class="right">
					<select v-model="outputDevice">
						<option
							v-for="device in allOutputDevices"
							:key="device.deviceId"
							:value="device.deviceId"
							:selected="device.deviceId == outputDevice"
						>
							{{ $t(device.label) }}
						</option>
					</select>
				</div>
			</div>

			<h3 v-if="isElectron">缓存</h3>
			<div v-if="isElectron" class="item">
				<div class="left">
					<div class="title">
						{{ $t("settings.automaticallyCacheSongs") }}
					</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="automatically-cache-songs"
							v-model="automaticallyCacheSongs"
							type="checkbox"
							name="automatically-cache-songs"
						/>
						<label for="automatically-cache-songs"></label>
					</div>
				</div>
			</div>
			<div v-if="isElectron" class="item">
				<div class="left">
					<div class="title">{{ $t("settings.cacheLimit.text") }}</div>
				</div>
				<div class="right">
					<select v-model="cacheLimit">
						<option :value="false">
							{{ $t("settings.cacheLimit.none") }}
						</option>
						<option :value="512">500MB</option>
						<option :value="1024">1GB</option>
						<option :value="2048">2GB</option>
						<option :value="4096">4GB</option>
						<option :value="8192">8GB</option>
					</select>
				</div>
			</div>
			<div v-if="isElectron" class="item">
				<div class="left">
					<div class="title">
						{{
							$t("settings.cacheCount", {
								song: tracksCache.length,
								size: tracksCache.size,
							})
						}}
					</div>
				</div>
				<div class="right">
					<button @click="clearCache()">
						{{ $t("settings.clearSongsCache") }}
					</button>
				</div>
			</div>

			<h3>{{ $t("settings.lyric") }}</h3>
			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.showLyricsTranslation") }}</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="show-lyrics-translation"
							v-model="showLyricsTranslation"
							type="checkbox"
							name="show-lyrics-translation"
						/>
						<label for="show-lyrics-translation"></label>
					</div>
				</div>
			</div>
			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.lyricsBackground.text") }}</div>
				</div>
				<div class="right">
					<select v-model="lyricsBackground">
						<option :value="false">
							{{ $t("settings.lyricsBackground.off") }}
						</option>
						<option :value="true">
							{{ $t("settings.lyricsBackground.on") }}
						</option>
						<option value="blur">模糊封面</option>
						<option value="dynamic">
							{{ $t("settings.lyricsBackground.dynamic") }}
						</option>
					</select>
				</div>
			</div>

			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.lyricFontSize.text") }}</div>
				</div>
				<div class="right">
					<select v-model="lyricFontSize">
						<option value="16">{{ $t("settings.lyricFontSize.small") }} - 16px</option>
						<option value="22">{{ $t("settings.lyricFontSize.medium") }} - 22px</option>
						<option value="28">{{ $t("settings.lyricFontSize.large") }} - 28px</option>
						<option value="36">{{ $t("settings.lyricFontSize.xlarge") }} - 36px</option>
					</select>
				</div>
			</div>
			<div v-if="isElectron && isLinux" class="item">
				<div class="left">
					<div class="title">
						{{ $t("settings.unm.enable") }}
						<a target="_blank" href="https://github.com/osdlyrics/osdlyrics">OSDLyrics</a>
						{{ $t("settings.enableOsdlyricsSupport.title") }}
					</div>
					<div class="description">
						{{ $t("settings.enableOsdlyricsSupport.desc1") }}
						<br />
						{{ $t("settings.enableOsdlyricsSupport.desc2") }}
					</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="enable-osdlyrics-support"
							v-model="enableOsdlyricsSupport"
							type="checkbox"
							name="enable-osdlyrics-support"
						/>
						<label for="enable-osdlyrics-support"></label>
					</div>
				</div>
			</div>

			<section v-if="isElectron" class="unm-configuration">
				<h3>UnblockNeteaseMusic</h3>
				<div class="item">
					<div class="left">
						<div class="title">
							{{ $t("settings.unm.enable") }}
							<a href="https://github.com/UnblockNeteaseMusic/server" target="blank"
								>UnblockNeteaseMusic</a
							>
						</div>
					</div>
					<div class="right">
						<div class="toggle">
							<input
								id="enable-unblock-netease-music"
								v-model="enableUnblockNeteaseMusic"
								type="checkbox"
								name="enable-unblock-netease-music"
							/>
							<label for="enable-unblock-netease-music"></label>
						</div>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">
							{{ $t("settings.unm.audioSource.title") }}
						</div>
						<div class="description">
							音源的具体代号
							<a
								href="https://github.com/UnblockNeteaseMusic/server-rust/blob/main/README.md#支援的所有引擎"
								target="_blank"
							>
								可以点此到 UNM 的说明页面查询。 </a
							><br />
							多个音源请用 <code>,</code> 逗号分隔。<br />
							留空则使用 UNM 内置的默认值。
						</div>
					</div>
					<div class="right">
						<input
							v-model="unmSource"
							class="text-input margin-right-0"
							placeholder="例 bilibili, kuwo"
						/>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.unm.enableFlac.title") }}</div>
						<div class="description">
							{{ $t("settings.unm.enableFlac.desc") }}
						</div>
					</div>
					<div class="right">
						<div class="toggle">
							<input id="unm-enable-flac" v-model="unmEnableFlac" type="checkbox" />
							<label for="unm-enable-flac" />
						</div>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.unm.searchMode.title") }}</div>
					</div>
					<div class="right">
						<select v-model="unmSearchMode">
							<option value="fast-first">
								{{ $t("settings.unm.searchMode.fast") }}
							</option>
							<option value="order-first">
								{{ $t("settings.unm.searchMode.order") }}
							</option>
						</select>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.unm.cookie.joox") }}</div>
						<div class="description">
							<a
								href="https://github.com/UnblockNeteaseMusic/server-rust/tree/main/engines#joox-cookie-設定說明"
								target="_blank"
								>{{ $t("settings.unm.cookie.desc1") }}
							</a>
							{{ $t("settings.unm.cookie.desc2") }}
						</div>
					</div>
					<div class="right">
						<input
							v-model="unmJooxCookie"
							class="text-input margin-right-0"
							placeholder="wmid=..; session_key=.."
						/>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.unm.cookie.qq") }}</div>
						<div class="description">
							<a
								href="https://github.com/UnblockNeteaseMusic/server-rust/tree/main/engines#qq-cookie-設定說明"
								target="_blank"
								>{{ $t("settings.unm.cookie.desc1") }}
							</a>
							{{ $t("settings.unm.cookie.desc2") }}
						</div>
					</div>
					<div class="right">
						<input
							v-model="unmQQCookie"
							class="text-input margin-right-0"
							placeholder="uin=..; qm_keyst=..;"
						/>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.unm.ytdl") }}</div>
						<div class="description">
							<a
								href="https://github.com/UnblockNeteaseMusic/server-rust/tree/main/engines#ytdlexe-設定說明"
								target="_blank"
								>{{ $t("settings.unm.cookie.desc1") }}
							</a>
							{{ $t("settings.unm.cookie.desc2") }}
						</div>
					</div>
					<div class="right">
						<input
							v-model="unmYtDlExe"
							class="text-input margin-right-0"
							placeholder="ex. youtube-dl"
						/>
					</div>
				</div>

				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.unm.proxy.title") }}</div>
						<div class="description">
							{{ $t("settings.unm.proxy.desc1") }}<br />
							{{ $t("settings.unm.proxy.desc2") }}
						</div>
					</div>
					<div class="right">
						<input
							v-model="unmProxyUri"
							class="text-input margin-right-0"
							placeholder="ex. https://192.168.11.45"
						/>
					</div>
				</div>
			</section>

			<h3>{{ $t("settings.customization") }}</h3>
			<div class="item">
				<div class="left">
					<div class="title">
						{{ isLastfmConnected ? `已连接到 Last.fm (${lastfm.name})` : "连接 Last.fm " }}
					</div>
				</div>
				<div class="right">
					<button v-if="isLastfmConnected" @click="lastfmDisconnect()">断开连接</button>
					<button v-else @click="lastfmConnect()">授权连接</button>
				</div>
			</div>
			<div v-if="isElectron" class="item">
				<div class="left">
					<div class="title">
						{{ $t("settings.enableDiscordRichPresence") }}
					</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="enable-discord-rich-presence"
							v-model="enableDiscordRichPresence"
							type="checkbox"
							name="enable-discord-rich-presence"
						/>
						<label for="enable-discord-rich-presence"></label>
					</div>
				</div>
			</div>

			<h3>{{ $t("settings.others") }}</h3>
			<div v-if="isElectron && !isMac" class="item">
				<div class="left">
					<div class="title">{{ $t("settings.closeAppOption.text") }}</div>
				</div>
				<div class="right">
					<select v-model="closeAppOption">
						<option value="ask">
							{{ $t("settings.closeAppOption.ask") }}
						</option>
						<option value="exit">
							{{ $t("settings.closeAppOption.exit") }}
						</option>
						<option value="minimizeToTray">
							{{ $t("settings.closeAppOption.minimizeToTray") }}
						</option>
					</select>
				</div>
			</div>

			<div v-if="isElectron && isLinux" class="item">
				<div class="left">
					<div class="title">{{ $t("settings.enableCustomTitlebar") }}</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="enable-custom-titlebar"
							v-model="enableCustomTitlebar"
							type="checkbox"
							name="enable-custom-titlebar"
						/>
						<label for="enable-custom-titlebar"></label>
					</div>
				</div>
			</div>

			<div v-if="isElectron" class="item">
				<div class="left">
					<div class="title">{{ $t("settings.showLibraryDefault") }}</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="show-library-default"
							v-model="showLibraryDefault"
							type="checkbox"
							name="show-library-default"
						/>
						<label for="show-library-default"></label>
					</div>
				</div>
			</div>

			<div class="item">
				<div class="left">
					<div class="title">
						{{ $t("settings.showPlaylistsByAppleMusic") }}
					</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="show-playlists-by-apple-music"
							v-model="showPlaylistsByAppleMusic"
							type="checkbox"
							name="show-playlists-by-apple-music"
						/>
						<label for="show-playlists-by-apple-music"></label>
					</div>
				</div>
			</div>

			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.subTitleDefault") }}</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="sub-title-default"
							v-model="subTitleDefault"
							type="checkbox"
							name="sub-title-default"
						/>
						<label for="sub-title-default"></label>
					</div>
				</div>
			</div>

			<div class="item">
				<div class="left">
					<div class="title">{{ $t("settings.enableReversedMode") }}</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input
							id="enable-reversed-mode"
							v-model="enableReversedMode"
							type="checkbox"
							name="enable-reversed-mode"
						/>
						<label for="enable-reversed-mode"></label>
					</div>
				</div>
			</div>

			<div class="item">
				<div class="left">
					<div class="title" style="transform: scaleX(-1)">🐈️ 🏳️‍🌈</div>
				</div>
				<div class="right">
					<div class="toggle">
						<input id="nyancat-style" v-model="nyancatStyle" type="checkbox" name="nyancat-style" />
						<label for="nyancat-style"></label>
					</div>
				</div>
			</div>

			<div v-if="isElectron">
				<h3>代理</h3>
				<div class="item">
					<div class="left">
						<div class="title">代理协议</div>
					</div>
					<div class="right">
						<select v-model="proxyProtocol">
							<option value="noProxy">关闭代理</option>
							<option value="HTTP">HTTP 代理</option>
							<option value="HTTPS">HTTPS 代理</option>
							<!-- <option value="SOCKS"> SOCKS 代理 </option> -->
						</select>
					</div>
				</div>
				<div id="proxy-form" :class="{ disabled: proxyProtocol === 'noProxy' }">
					<input
						v-model="proxyServer"
						class="text-input"
						placeholder="服务器地址"
						:disabled="proxyProtocol === 'noProxy'"
					/><input
						v-model="proxyPort"
						class="text-input"
						placeholder="端口"
						type="number"
						min="1"
						max="65535"
						:disabled="proxyProtocol === 'noProxy'"
					/>
					<button @click="sendProxyConfig">更新代理</button>
				</div>
			</div>
			<div v-if="isElectron">
				<h3>Real IP</h3>
				<div class="item">
					<div class="left">
						<div class="title">Real IP</div>
					</div>
					<div class="right">
						<div class="toggle">
							<input
								id="enable-real-ip"
								v-model="enableRealIP"
								type="checkbox"
								name="enable-real-ip"
							/>
							<label for="enable-real-ip"></label>
						</div>
					</div>
				</div>
				<div id="real-ip" :class="{ disabled: !enableRealIP }">
					<input
						v-model="realIP"
						class="text-input"
						placeholder="IP地址"
						:disabled="!enableRealIP"
					/>
				</div>
			</div>

			<div v-if="isElectron">
				<h3>快捷键</h3>
				<div class="item">
					<div class="left">
						<div class="title">{{ $t("settings.enableGlobalShortcut") }}</div>
					</div>
					<div class="right">
						<div class="toggle">
							<input
								id="enable-enable-global-shortcut"
								v-model="enableGlobalShortcut"
								type="checkbox"
								name="enable-enable-global-shortcut"
							/>
							<label for="enable-enable-global-shortcut"></label>
						</div>
					</div>
				</div>
				<div
					id="shortcut-table"
					:class="{ 'global-disabled': !enableGlobalShortcut }"
					tabindex="0"
					@keydown="handleShortcutKeydown"
				>
					<div class="row row-head">
						<div class="col">功能</div>
						<div class="col">快捷键</div>
						<div class="col">全局快捷键</div>
					</div>
					<div v-for="shortcut in settings.shortcuts" :key="shortcut.id" class="row">
						<div class="col">{{ shortcut.name }}</div>
						<div class="col">
							<div
								class="keyboard-input"
								:class="{
									active: shortcutInput.id === shortcut.id && shortcutInput.type === 'shortcut',
								}"
								@click.stop="readyToRecordShortcut(shortcut.id, 'shortcut')"
							>
								{{
									shortcutInput.id === shortcut.id &&
									shortcutInput.type === "shortcut" &&
									recordedShortcutComputed !== ""
										? formatShortcut(recordedShortcutComputed)
										: formatShortcut(shortcut.shortcut)
								}}
							</div>
						</div>
						<div class="col">
							<div
								class="keyboard-input"
								:class="{
									active:
										shortcutInput.id === shortcut.id &&
										shortcutInput.type === 'globalShortcut' &&
										enableGlobalShortcut,
								}"
								@click.stop="readyToRecordShortcut(shortcut.id, 'globalShortcut')"
							>
								{{
									shortcutInput.id === shortcut.id &&
									shortcutInput.type === "globalShortcut" &&
									recordedShortcutComputed !== ""
										? formatShortcut(recordedShortcutComputed)
										: formatShortcut(shortcut.globalShortcut)
								}}
							</div>
						</div>
					</div>
					<button class="restore-default-shortcut" @click="restoreDefaultShortcuts">
						恢复默认快捷键
					</button>
				</div>
			</div>

			<div class="flex flex-col items-center mt-24 font-bold text-black">
				<p>
					MADE BY
					<a :href="pkg.author.url" target="_blank">{{ pkg.author.name }}</a>
				</p>
				<p class="opacity-50">v{{ pkg.version }}</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import * as api from "@/api";
import { useStore } from "@/store/pinia";
import { doLogout, isAccountLoggedIn } from "@/utils/auth";
import { bytesToSize, changeAppearance } from "@/utils/common";
import * as db from "@/utils/db/index";
import { isLinux } from "@/utils/platform";
import pkg from "../../package.json";
import { IconLogout } from "@/components/icon";
import { useDataStore } from "@/store/data";
import { useSettingsStore } from "@/store/settings";
import { useLastfmStore } from "@/store/lastfm";

const i18n = useI18n();
const validShortcutCodes = ["=", "-", "~", "[", "]", ";", "'", ",", ".", "/"];
const router = useRouter();

const tracksCache = ref({
	size: "0KB",
	length: 0,
});

const allOutputDevices = ref([
	{
		deviceId: "default",
		label: "settings.permissionRequired",
	},
]);

const shortcutInput = ref({
	id: "",
	type: "",
	recording: false,
});

const recordedShortcut = ref<KeyboardEvent[]>([]);

const { player, lastfm } = useStore();

const {
	settings,
	update: updateSetting,
	updateShortcut,
	restoreDefaultShortcuts,
} = useSettingsStore();

const dataStore = useDataStore();

const isElectron = window.IS_ELECTRON;
const isMac = /macintosh|mac os x/i.test(navigator.userAgent);

const lastfmStore = useLastfmStore();

const showUserInfo = computed(() => isAccountLoggedIn() && dataStore.user?.nickname);

const recordedShortcutComputed = computed(() => {
	let shortcut: string[] = [];
	recordedShortcut.value.map((e) => {
		if (e.keyCode >= 65 && e.keyCode <= 90) {
			// A-Z
			shortcut.push(e.code.replace("Key", ""));
		} else if (e.key === "Meta") {
			// ⌘ Command on macOS
			shortcut.push("Command");
		} else if (["Alt", "Control", "Shift"].includes(e.key)) {
			shortcut.push(e.key);
		} else if (e.keyCode >= 48 && e.keyCode <= 57) {
			// 0-9
			shortcut.push(e.code.replace("Digit", ""));
		} else if (e.keyCode >= 112 && e.keyCode <= 123) {
			// F1-F12
			shortcut.push(e.code);
		} else if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
			// Arrows
			shortcut.push(e.code.replace("Arrow", ""));
		} else if (validShortcutCodes.includes(e.key)) {
			shortcut.push(e.key);
		}
	});
	const sortTable = {
		Control: 1,
		Shift: 2,
		Alt: 3,
		Command: 4,
	};
	shortcut = shortcut.sort((a, b) => {
		if (!sortTable[a] || !sortTable[b]) return 0;
		if (sortTable[a] - sortTable[b] <= -1) {
			return -1;
		} else if (sortTable[a] - sortTable[b] >= 1) {
			return 1;
		} else {
			return 0;
		}
	});
	return shortcut.join("+");
});

const lang = computed({
	get() {
		return settings.lang;
	},
	set(lang) {
		i18n.locale.value = lang;
		updateSetting("lang", lang);
	},
});

const musicLanguage = computed({
	get() {
		return settings.musicLanguage ?? "all";
	},
	set(value) {
		updateSetting("musicLanguage", value);
	},
});

const appearance = computed({
	get() {
		if (settings.appearance === undefined) return "auto";
		return settings.appearance;
	},
	set(value) {
		updateSetting("appearance", value);
		changeAppearance(value);
	},
});

const musicQuality = computed({
	get() {
		return settings.musicQuality ?? 320000;
	},
	set(value) {
		if (value === settings.musicQuality) return;
		updateSetting("musicQuality", value);
		clearCache();
	},
});

const lyricFontSize = computed({
	get() {
		if (settings.lyricFontSize === undefined) return 28;
		return settings.lyricFontSize;
	},
	set(value) {
		updateSetting("lyricFontSize", value);
	},
});
const outputDevice = computed({
	get() {
		const isValidDevice = allOutputDevices.value.find(
			(device) => device.deviceId === settings.outputDevice,
		);
		if (settings.outputDevice === undefined || isValidDevice === undefined) return "default"; // Default deviceId
		return settings.outputDevice;
	},
	set(deviceId) {
		if (deviceId === settings.outputDevice || deviceId === undefined) return;

		updateSetting("outputDevice", deviceId);
		player.setOutputDevice();
	},
});
const enableUnblockNeteaseMusic = computed({
	get() {
		const value = settings.enableUnblockNeteaseMusic;
		return value !== undefined ? value : true;
	},
	set(value) {
		updateSetting("enableUnblockNeteaseMusic", value);
	},
});
const showPlaylistsByAppleMusic = computed({
	get() {
		if (settings.showPlaylistsByAppleMusic === undefined) return true;
		return settings.showPlaylistsByAppleMusic;
	},
	set(value) {
		updateSetting("showPlaylistsByAppleMusic", value);
	},
});
const nyancatStyle = computed({
	get() {
		if (settings.nyancatStyle === undefined) return false;
		return settings.nyancatStyle;
	},
	set(value) {
		updateSetting("nyancatStyle", value);
	},
});
const automaticallyCacheSongs = computed({
	get() {
		if (settings.automaticallyCacheSongs === undefined) return false;
		return settings.automaticallyCacheSongs;
	},
	set(value) {
		updateSetting("automaticallyCacheSongs", value);
		if (value === false) {
			clearCache();
		}
	},
});
const showLyricsTranslation = computed({
	get() {
		return settings.showLyricsTranslation;
	},
	set(value) {
		updateSetting("showLyricsTranslation", value);
	},
});
const lyricsBackground = computed({
	get() {
		return settings.lyricsBackground || false;
	},
	set(value) {
		updateSetting("lyricsBackground", value);
	},
});

const enableOsdlyricsSupport = computed({
	get() {
		return settings.enableOsdlyricsSupport;
	},
	set(value) {
		updateSetting("enableOsdlyricsSupport", value);
	},
});
const closeAppOption = computed({
	get() {
		return settings.closeAppOption;
	},
	set(value) {
		updateSetting("closeAppOption", value);
	},
});
const enableDiscordRichPresence = computed({
	get() {
		return settings.enableDiscordRichPresence;
	},
	set(value) {
		updateSetting("enableDiscordRichPresence", value);
	},
});
const subTitleDefault = computed({
	get() {
		return settings.subTitleDefault;
	},
	set(value) {
		updateSetting("subTitleDefault", value);
	},
});
const enableReversedMode = computed({
	get() {
		if (settings.enableReversedMode === undefined) return false;
		return settings.enableReversedMode;
	},
	set(value) {
		updateSetting("enableReversedMode", value);
		if (value === false) {
			player.reversed = false;
		}
	},
});
const enableGlobalShortcut = computed({
	get() {
		return settings.enableGlobalShortcut;
	},
	set(value) {
		updateSetting("enableGlobalShortcut", value);
	},
});
const showLibraryDefault = computed({
	get() {
		return settings.showLibraryDefault || false;
	},
	set(value) {
		updateSetting("showLibraryDefault", value);
	},
});
const cacheLimit = computed({
	get() {
		return settings.cacheLimit;
	},
	set(value) {
		updateSetting("cacheLimit", value);
	},
});
const proxyProtocol = computed({
	get() {
		return settings.proxyConfig?.protocol || "noProxy";
	},
	set(value) {
		const config = settings.proxyConfig || {};
		config.protocol = value;
		if (value === "noProxy") {
			window.ipcRenderer?.send("removeProxy");
			toast("已关闭代理");
		}
		updateSetting("proxyConfig", config);
	},
});
const proxyServer = computed({
	get() {
		return settings.proxyConfig?.server || "";
	},
	set(value) {
		const config = settings.proxyConfig || {};
		config.server = value;
		updateSetting("proxyConfig", config);
	},
});
const enableRealIP = computed({
	get() {
		return settings.enableRealIP || false;
	},
	set(value) {
		updateSetting("enableRealIP", value);
	},
});
const realIP = computed({
	get() {
		return settings.realIP || "";
	},
	set(value) {
		updateSetting("realIP", value);
	},
});
const proxyPort = computed({
	get() {
		return settings.proxyConfig?.port || "";
	},
	set(value) {
		const config = settings.proxyConfig || {};
		config.port = value;
		updateSetting("proxyConfig", config);
	},
});
const unmSource = computed({
	get() {
		return settings.unmSource || "";
	},
	/** @param {string?} value */
	set(value) {
		updateSetting("unmSource", value);
	},
});
const unmSearchMode = computed({
	get() {
		return settings.unmSearchMode || "fast-first";
	},
	set(value) {
		updateSetting("unmSearchMode", value);
	},
});
const unmEnableFlac = computed({
	get() {
		return settings.unmEnableFlac || false;
	},
	set(value) {
		updateSetting("unmEnableFlac", value || false);
	},
});
const unmProxyUri = computed({
	get() {
		return settings.unmProxyUri || "";
	},
	set(value) {
		updateSetting("unmProxyUri", value);
	},
});
const unmJooxCookie = computed({
	get() {
		return settings.unmJooxCookie || "";
	},
	set(value) {
		updateSetting("unmJooxCookie", value);
	},
});
const unmQQCookie = computed({
	get() {
		return settings.unmQQCookie || "";
	},
	set(value) {
		updateSetting("unmQQCookie", value);
	},
});
const unmYtDlExe = computed({
	get() {
		return settings.unmYtDlExe || "";
	},
	set(value) {
		updateSetting("unmYtDlExe", value);
	},
});
const enableCustomTitlebar = computed({
	get() {
		return settings.linuxEnableCustomTitlebar;
	},
	set(value) {
		updateSetting("linuxEnableCustomTitlebar", value);
	},
});
const isLastfmConnected = computed(() => lastfmStore.value.key !== undefined);

countDBSize();
if (window.IS_ELECTRON) getAllOutputDevices();

onActivated(() => {
	countDBSize();
	if (window.IS_ELECTRON) getAllOutputDevices();
});

function getAllOutputDevices() {
	navigator.mediaDevices.enumerateDevices().then((devices) => {
		allOutputDevices.value = devices.filter((device) => {
			return device.kind == "audiooutput";
		});
		if (allOutputDevices.value.length > 0 && allOutputDevices.value[0].label !== "") {
			// withoutAudioPriviledge.value = false;
		} else {
			allOutputDevices.value = [
				{
					deviceId: "default",
					label: "settings.permissionRequired",
				},
			];
		}
	});
}
function logout() {
	doLogout();
	router.push({ name: "home" });
}
function countDBSize() {
	db.track.source.size().then((data) => {
		if (data === undefined) {
			tracksCache.value = {
				size: "0KB",
				length: 0,
			};
			return;
		}
		tracksCache.value.size = bytesToSize(data.bytes);
		tracksCache.value.length = data.length;
	});
}
function clearCache() {
	db.track.source.clear().then(() => {
		countDBSize();
	});
}
function lastfmConnect() {
	api.lastfm.auth();
	const lastfmChecker = setInterval(() => {
		const session = localStorage.getItem("lastfm");
		if (session) {
			lastfmStore.update(JSON.parse(session));
			clearInterval(lastfmChecker);
		}
	}, 1000);
}
function lastfmDisconnect() {
	lastfmStore.update({});
}
function sendProxyConfig() {
	if (proxyProtocol.value === "noProxy") return;
	const config = settings.proxyConfig;
	if (config.server === "" || !config.port || config.protocol === "noProxy") {
		window.ipcRenderer?.send("removeProxy");
	} else {
		window.ipcRenderer?.send("setProxy", config);
	}
	toast("已更新代理设置");
}
function clickOutside() {
	exitRecordShortcut();
}
function formatShortcut(shortcut: string) {
	shortcut = shortcut
		.replace(/\+/g, " + ")
		.replace("Up", "↑")
		.replace("Down", "↓")
		.replace("Right", "→")
		.replace("Left", "←");
	if (settings.lang === "zh-CN") {
		shortcut = shortcut.replace("Space", "空格");
	} else if (settings.lang === "zh-TW") {
		shortcut = shortcut.replace("Space", "空白鍵");
	}
	if (process.platform === "darwin") {
		return shortcut
			.replace("CommandOrControl", "⌘")
			.replace("Command", "⌘")
			.replace("Alt", "⌥")
			.replace("Control", "⌃")
			.replace("Shift", "⇧");
	}
	return shortcut.replace("CommandOrControl", "Ctrl");
}
function readyToRecordShortcut(id, type) {
	if (type === "globalShortcut" && enableGlobalShortcut.value === false) {
		return;
	}
	shortcutInput.value = { id, type, recording: true };
	recordedShortcut.value = [];
	window.ipcRenderer?.send("switchGlobalShortcutStatusTemporary", "disable");
}
function handleShortcutKeydown(e: KeyboardEvent) {
	if (shortcutInput.value.recording === false) return;
	e.preventDefault();
	if (recordedShortcut.value.find((s) => s.keyCode === e.keyCode)) return;
	recordedShortcut.value.push(e);
	if (
		(e.keyCode >= 65 && e.keyCode <= 90) || // A-Z
		(e.keyCode >= 48 && e.keyCode <= 57) || // 0-9
		(e.keyCode >= 112 && e.keyCode <= 123) || // F1-F12
		["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key) || // Arrows
		validShortcutCodes.includes(e.key)
	) {
		saveShortcut();
	}
}
// function handleShortcutKeyup(e) {
//   if (recordedShortcut.value.find(s => s.keyCode === e.keyCode)) {
//     recordedShortcut.value = recordedShortcut.value.filter(
//       s => s.keyCode !== e.keyCode
//     );
//   }
// }
function saveShortcut() {
	const { id, type } = shortcutInput.value;
	const shortcut = recordedShortcut.value;
	updateShortcut(id, type, shortcut);
	window.ipcRenderer?.send("updateShortcut", { id, type, shortcut });
	toast("快捷键已保存");
	recordedShortcut.value = [];
}
function exitRecordShortcut() {
	if (shortcutInput.value.recording === false) return;
	shortcutInput.value = { id: "", type: "", recording: false };
	recordedShortcut.value = [];
	window.ipcRenderer?.send("switchGlobalShortcutStatusTemporary", "enable");
}
// function restoreDefaultShortcuts() {
//   this.restoreDefaultShortcuts();
//   window.ipcRenderer?.send('restoreDefaultShortcuts');
// }
</script>

<style lang="scss" scoped>
.container {
	width: 720px;
}

h2 {
	margin-top: 48px;
	font-size: 36px;
	color: var(--color-text);
}

h3 {
	margin-top: 48px;
	padding-bottom: 12px;
	font-size: 26px;
	color: var(--color-text);
	border-bottom: 1px solid rgba(128, 128, 128, 0.18);
}

.user {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: var(--color-secondary-bg);
	color: var(--color-text);
	padding: 16px 20px;
	border-radius: 16px;
	margin-bottom: 48px;

	button {
		color: var(--color-text);
		transition: 0.2s;

		&:hover {
			opacity: 1;
			background: #eaeffd;
			color: #335eea;
		}

		&:active {
			opacity: 1;
			transform: scale(0.92);
			transition: 0.2s;
		}
	}
}

.item {
	margin: 24px 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: var(--color-text);

	.title {
		font-size: 16px;
		font-weight: 500;
		opacity: 0.78;
	}

	.description {
		font-size: 14px;
		margin-top: 0.5em;
		opacity: 0.7;
	}
}

select {
	min-width: 192px;
	max-width: 600px;
	font-weight: 600;
	border: none;
	padding: 8px 12px 8px 12px;
	border-radius: 8px;
	color: var(--color-text);
	background: var(--color-secondary-bg);
	appearance: none;

	&:focus {
		outline: none;
		color: var(--color-primary);
		background: var(--color-primary-bg);
	}
}

button {
	color: var(--color-text);
	background: var(--color-secondary-bg);
	padding: 8px 12px 8px 12px;
	font-weight: 600;
	border-radius: 8px;
	transition: 0.2s;

	&:hover {
		transform: scale(1.06);
	}

	&:active {
		transform: scale(0.94);
	}
}

input.text-input.margin-right-0 {
	margin-right: 0;
}

input.text-input {
	background: var(--color-secondary-bg);
	border: none;
	margin-right: 22px;
	padding: 8px 12px 8px 12px;
	border-radius: 8px;
	color: var(--color-text);
	font-weight: 600;
	font-size: 16px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
}

#proxy-form,
#real-ip {
	display: flex;
	align-items: center;
}

#proxy-form.disabled,
#real-ip.disabled {
	opacity: 0.47;

	button:hover {
		transform: unset;
	}
}

#shortcut-table {
	font-size: 14px;
	/* border: 1px solid black; */
	user-select: none;
	color: var(--color-text);

	.row {
		display: flex;
	}

	.row.row-head {
		opacity: 0.58;
		font-size: 13px;
		font-weight: 500;
	}

	.col {
		min-width: 192px;
		padding: 8px;
		display: flex;
		align-items: center;

		/* border: 1px solid red; */
		&:first-of-type {
			padding-left: 0;
			min-width: 128px;
		}
	}

	.keyboard-input {
		font-weight: 600;
		background-color: var(--color-secondary-bg);
		padding: 8px 12px 8px 12px;
		border-radius: 0.5rem;
		min-width: 146px;
		min-height: 34px;
		box-sizing: border-box;

		&.active {
			color: var(--color-primary);
			background-color: var(--color-primary-bg);
		}
	}

	.restore-default-shortcut {
		margin-top: 12px;
	}

	&.global-disabled {
		.row .col:last-child {
			opacity: 0.48;
		}

		.row.row-head .col:last-child {
			opacity: 1;
		}
	}

	&:focus {
		outline: none;
	}
}

.beforeAnimation {
	-webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
	transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
}

.afterAnimation {
	box-shadow:
		0 0 0 1px hsla(0, 0%, 0%, 0.1),
		0 4px 0px 0 hsla(0, 0%, 0%, 0.04),
		0 4px 9px hsla(0, 0%, 0%, 0.13),
		0 3px 3px hsla(0, 0%, 0%, 0.05);
	-webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
	transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
}

.toggle {
	margin: auto;
}

.toggle input {
	opacity: 0;
	position: absolute;
}

.toggle input + label {
	position: relative;
	display: inline-block;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	-webkit-transition: 0.4s ease;
	transition: 0.4s ease;
	height: 32px;
	width: 52px;
	background: var(--color-secondary-bg);
	border-radius: 8px;
}

.toggle input + label:before {
	content: "";
	position: absolute;
	display: block;
	-webkit-transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
	transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
	height: 32px;
	width: 52px;
	top: 0;
	left: 0;
	border-radius: 8px;
}

.toggle input + label:after {
	content: "";
	position: absolute;
	display: block;
	box-shadow:
		0 0 0 1px hsla(0, 0%, 0%, 0.02),
		0 4px 0px 0 hsla(0, 0%, 0%, 0.01),
		0 4px 9px hsla(0, 0%, 0%, 0.08),
		0 3px 3px hsla(0, 0%, 0%, 0.03);
	-webkit-transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
	transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
	background: #fff;
	height: 20px;
	width: 20px;
	top: 6px;
	left: 6px;
	border-radius: 6px;
}

.toggle input:checked + label:before {
	background: var(--color-primary);
	-webkit-transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
	transition: width 0.2s cubic-bezier(0, 0, 0, 0.1);
}

.toggle input:checked + label:after {
	left: 26px;
}
</style>
