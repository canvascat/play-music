import "@/index.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia, useStore } from "./store/pinia";
import "@/utils/filters";
import "@/assets/css/global.scss";
import NProgress from "nprogress";
import "@/assets/css/nprogress.css";
import { createI18n } from "vue-i18n";
import { messages } from "./locale";

function resetApp() {
	localStorage.clear();
	indexedDB.deleteDatabase("yesplaymusic");
	document.cookie.split(";").forEach((c) => {
		document.cookie = c
			.replace(/^ +/, "")
			.replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
	});
	return "已重置应用，请刷新页面（按Ctrl/Command + R）";
}

Object.assign(window, { resetApp });

console.log(
	"如出现问题，可尝试在本页输入 %cresetApp()%c 然后按回车重置应用。",
	"background: #eaeffd;color:#335eea;padding: 4px 6px;border-radius:3px;",
	"background:unset;color:unset;",
);

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

const app = createApp(App);

app.use(pinia);
const store = useStore();

store.$subscribe((_mutation, state) => {
	localStorage.setItem("settings", JSON.stringify(state.settings));
});

app.use(
	createI18n({
		locale: store.settings.lang,
		messages,
		silentTranslationWarn: true,
	}),
);
app.use(router);
app.mount("#app");
