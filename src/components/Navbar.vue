<template>
	<nav :class="cn({ 'has-custom-titlebar': hasCustomTitlebar }, 'z-40')">
		<Win32Titlebar v-if="enableWin32Titlebar" />
		<LinuxTitlebar v-if="enableLinuxTitlebar" />
		<div class="navigation-buttons">
			<button-icon v-on:click="go('back')">
				<IconArrowLeft />
			</button-icon>
			<button-icon v-on:click="go('forward')">
				<IconArrowRight />
			</button-icon>
		</div>
		<div class="navigation-links">
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
		<div class="right-part">
			<div class="search-box">
				<div class="container" :class="{ active: inputFocus }">
					<IconSearch />
					<div class="input">
						<input
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
					<img class="avatar" :src="avatarUrl" loading="lazy" />
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
import LinuxTitlebar from "@/components/LinuxTitlebar.vue";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Win32Titlebar from "@/components/Win32Titlebar.vue";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/pinia";
import { doLogout, isAccountLoggedIn } from "@/utils/auth";
import pkg from "../../package.json";

const inputFocus = ref(false);
const keywords = ref("");
const enableWin32Titlebar = ref(false);
const enableLinuxTitlebar = ref(false);

const store = useStore();
const isLoggedIn = computed(() => isAccountLoggedIn());
const avatarUrl = computed(() => {
	return store.data?.user?.avatarUrl && isLoggedIn.value
		? `${store.data?.user?.avatarUrl}?param=512y512`
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
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 64px;

	padding: {
		right: 10vw;
		left: 10vw;
	}

	backdrop-filter: saturate(180%) blur(20px);

	background-color: var(--color-navbar-bg);

	-webkit-app-region: drag;
}

@media (max-width: 1336px) {
	nav {
		padding: 0 max(5vw, 90px);
	}
}

@supports (-moz-appearance: none) {
	nav {
		background-color: var(--color-body-bg);
	}
}

nav.has-custom-titlebar {
	padding-top: 20px;
	-webkit-app-region: no-drag;
}

.navigation-buttons {
	flex: 1;
	display: flex;
	align-items: center;

	.svg-icon {
		height: 24px;
		width: 24px;
	}

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
	flex: 1;
	display: flex;
	justify-content: center;
	text-transform: uppercase;
	user-select: none;

	a {
		-webkit-app-region: no-drag;
		font-size: 18px;
		font-weight: 700;
		text-decoration: none;
		border-radius: 6px;
		padding: 6px 10px;
		color: var(--color-text);
		transition: 0.2s;
		-webkit-user-drag: none;

		margin: {
			right: 12px;
			left: 12px;
		}

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

.search {
	.svg-icon {
		height: 18px;
		width: 18px;
	}
}

.search-box {
	display: flex;
	justify-content: flex-end;
	-webkit-app-region: no-drag;

	.container {
		display: flex;
		align-items: center;
		height: 32px;
		background: var(--color-secondary-bg-for-transparent);
		border-radius: 8px;
		width: 200px;
	}

	.svg-icon {
		height: 15px;
		width: 15px;
		color: var(--color-text);
		opacity: 0.28;

		margin: {
			left: 8px;
			right: 4px;
		}
	}

	input {
		font-size: 16px;
		border: none;
		background: transparent;
		width: 96%;
		font-weight: 600;
		margin-top: -1px;
		color: var(--color-text);
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
				color: var(--color-text);
			}
		}
	}
}

.right-part {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;

	.avatar {
		user-select: none;
		height: 30px;
		margin-left: 12px;
		vertical-align: -7px;
		border-radius: 50%;
		cursor: pointer;
		-webkit-app-region: no-drag;
		-webkit-user-drag: none;

		&:hover {
			filter: brightness(80%);
		}
	}

	.search-button {
		display: none;
		-webkit-app-region: no-drag;
	}
}
</style>
