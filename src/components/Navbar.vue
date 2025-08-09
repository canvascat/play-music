<template>
	<nav
		:class="
			cn(
				{ 'has-custom-titlebar': hasCustomTitlebar },
				'z-40 fixed top-0 right-0 left-0 flex justify-between items-center h-16 bg-background/68',
			)
		"
	>
		<Titlebar v-if="hasCustomTitlebar" />
		<div class="navigation-buttons flex items-center flex-1">
			<button-icon @click="go('back')">
				<IconArrowLeft class="size-6" />
			</button-icon>
			<button-icon @click="go('forward')">
				<IconArrowRight class="size-6" />
			</button-icon>
		</div>
		<div
			class="navigation-links flex items-center justify-center flex-1 select-none uppercase mx-3"
		>
			<router-link to="/" :class="{ active: $route.name === 'home' }">{{
				$t("nav.home")
			}}</router-link>
			<router-link to="/explore" :class="{ active: $route.name === 'explore' }">{{
				$t("nav.explore")
			}}</router-link>
			<router-link to="/library" :class="{ active: $route.name === 'library' }">{{
				$t("nav.library")
			}}</router-link>
		</div>
		<div class="right-part flex items-center justify-end flex-1">
			<div class="search-box flex justify-end">
				<div
					class="container flex items-center h-8 rounded-lg w-50"
					:class="{ active: inputFocus }"
				>
					<IconSearch class="size-4" />
					<div class="input">
						<input
							class="text-base border-0 bg-transparent font-semibold"
							ref="searchInput"
							v-model="keywords"
							type="search"
							:placeholder="inputFocus ? '' : $t('nav.search')"
							@keydown.enter="doSearch"
							@focus="inputFocus = true"
							@blur="inputFocus = false"
						/>
					</div>
				</div>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<img
						draggable="false"
						class="avatar select-none size-8 rounded-full cursor-pointer hover:brightness-80 ml-3"
						:src="avatarUrl"
						loading="lazy"
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem as-child>
						<RouterLink to="/settings" class="no-underline!">
							<IconSettings />
							{{ $t("library.userProfileMenu.settings") }}
						</RouterLink>
					</DropdownMenuItem>
					<DropdownMenuItem v-if="!isLoggedIn" as-child>
						<RouterLink to="/login" class="no-underline!">
							<IconLogin />
							{{ $t("login.login") }}
						</RouterLink>
					</DropdownMenuItem>
					<DropdownMenuItem v-else @click="logout" class="cursor-pointer">
						<IconLogout />
						{{ $t("library.userProfileMenu.logout") }}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem as-child>
						<a :href="pkg.repository.url" target="_blank" class="no-underline!">
							<IconGithub />
							{{ $t("nav.github") }}
						</a>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</nav>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import ButtonIcon from "@/components/ButtonIcon.vue";
import {
	IconArrowLeft,
	IconArrowRight,
	IconGithub,
	IconLogin,
	IconLogout,
	IconSearch,
	IconSettings,
} from "@/components/icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Titlebar from "@/components/Titlebar.vue";
import { cn } from "@/lib/utils";
import { doLogout, isAccountLoggedIn } from "@/utils/auth";
import pkg from "../../package.json";
import { useDataStore } from "@/store/data";

const inputFocus = ref(false);
const keywords = ref("");
const enableWin32Titlebar = ref(false);
const enableLinuxTitlebar = ref(false);

const dataStore = useDataStore();

const isLoggedIn = computed(() => isAccountLoggedIn());
const avatarUrl = computed(() => {
	return dataStore.user?.avatarUrl && isLoggedIn.value
		? `${dataStore.user?.avatarUrl}?param=512y512`
		: "http://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=60y60";
});

const router = useRouter();

const hasCustomTitlebar = computed(() => {
	return enableWin32Titlebar.value || enableLinuxTitlebar.value;
});

// created() {
//   if (process.platform === 'win32') {
//     this.enableWin32Titlebar = true;
//   } else if (
//     process.platform === 'linux' &&
//     this.settings.linuxEnableCustomTitlebar
//   ) {
//     this.enableLinuxTitlebar = true;
//   }
// },

const go = (where: "back" | "forward") => {
	if (where === "back") router.go(-1);
	else router.go(1);
};

const doSearch = () => {
	if (!keywords.value) return;
	if (
		router.currentRoute.value.name === "search" &&
		router.currentRoute.value.params.keywords === keywords.value
	) {
		return;
	}
	router.push({
		name: "search",
		params: { keywords: keywords.value },
	});
};

const logout = () => {
	if (!confirm("确定要退出登录吗？")) return;
	doLogout();
	router.push({ name: "home" });
};
</script>

<style lang="scss" scoped>
nav {
	padding: {
		right: 10vw;
		left: 10vw;
	}

	backdrop-filter: saturate(180%) blur(20px);
	-webkit-app-region: drag;
}

@media (max-width: 1336px) {
	nav {
		padding: 0 max(5vw, 90px);
	}
}

nav.has-custom-titlebar {
	padding-top: 20px;
	-webkit-app-region: no-drag;
}

.navigation-buttons {
	button {
		-webkit-app-region: no-drag;
	}
}

@media (max-width: 970px) {
	.navigation-buttons {
		flex: unset;
	}
}

.navigation-links {
	a {
		-webkit-app-region: no-drag;
		font-size: 18px;
		font-weight: 700;
		text-decoration: none;
		border-radius: 6px;
		padding: 6px 10px;

		transition: 0.2s;
		-webkit-user-drag: none;

		&:hover {
			background: var(--color-secondary-bg-for-transparent);
		}

		&:active {
			transform: scale(0.92);
			transition: 0.2s;
		}
	}

	a.active {
		color: var(--color-primary);
	}
}

.search-box {
	-webkit-app-region: no-drag;

	.container {
		background: var(--color-secondary-bg-for-transparent);
	}

	.svg-icon {
		height: 15px;
		width: 15px;

		opacity: 0.28;

		margin: {
			left: 8px;
			right: 4px;
		}
	}

	input {
		width: 96%;
		margin-top: -1px;
	}

	.active {
		background: var(--color-primary-bg-for-transparent);

		input,
		.svg-icon {
			opacity: 1;
			color: var(--color-primary);
		}
	}
}

[data-theme="dark"] {
	.search-box {
		.active {
			input,
			.svg-icon {
			}
		}
	}
}

.right-part .avatar {
	-webkit-app-region: no-drag;
}
</style>
