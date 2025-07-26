/// <reference types="vite/client" />

declare interface Window {
	IS_ELECTRON: boolean;
	ipcRenderer: any | null;
	resetApp: () => string;
}

import "vue-router";

declare module "vue-router" {
	interface RouteMeta {
		keepAlive?: boolean;
		savePosition?: boolean;
	}
}
