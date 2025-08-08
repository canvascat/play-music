import {
	app,
	dialog,
	globalShortcut,
	ipcMain,
	type BrowserWindow,
	type IpcMainEvent,
} from "electron";
import UNM from "@unblockneteasemusic/rust-napi";
import { registerGlobalShortcut } from "./globalShortcut";
import { cloneDeep } from "es-toolkit";
import shortcuts from "@/utils/shortcuts";
import { createMenu } from "./menu";
import { isCreateTray, isMac } from "./platform";
import type { TrayEventEmitter } from "./tray";

const exitAsk = (e: IpcMainEvent, win: BrowserWindow) => {
	e.preventDefault(); //阻止默认行为
	dialog
		.showMessageBox({
			type: "info",
			title: "Information",
			cancelId: 2,
			defaultId: 0,
			message: "确定要关闭吗？",
			buttons: ["最小化", "直接退出"],
		})
		.then((result) => {
			if (result.response == 0) {
				e.preventDefault(); //阻止默认行为
				win.minimize(); //调用 最小化实例方法
			} else if (result.response == 1) {
				//app.quit();
				app.exit(); //exit()直接关闭客户端，不会执行quit();
			}
		})
		.catch((err) => {
			console.debug(err);
		});
};

const exitAskWithoutMac = (e: IpcMainEvent, win: BrowserWindow) => {
	e.preventDefault(); //阻止默认行为
	dialog
		.showMessageBox({
			type: "info",
			title: "Information",
			cancelId: 2,
			defaultId: 0,
			message: "确定要关闭吗？",
			buttons: ["最小化到托盘", "直接退出"],
			checkboxLabel: "记住我的选择",
		})
		.then((result) => {
			if (result.checkboxChecked && result.response !== 2) {
				win.webContents.send(
					"rememberCloseAppOption",
					result.response === 0 ? "minimizeToTray" : "exit",
				);
			}

			if (result.response === 0) {
				e.preventDefault(); //阻止默认行为
				win.hide(); //调用 最小化实例方法
			} else if (result.response === 1) {
				//app.quit();
				app.exit(); //exit()直接关闭客户端，不会执行quit();
			}
		})
		.catch((err) => {
			console.debug(err);
		});
};

/**
 * Make data a Buffer.
 */
function toBuffer(data: any) {
	if (data instanceof Buffer) {
		return data;
	} else {
		return Buffer.from(data);
	}
}

/**
 * Get the file base64 data from bilivideo.
 *
 * @param url The URL to fetch.
 * @returns The file base64 data.
 */
async function getBiliVideoFile(url: string) {
	const axios = await import("axios").then((m) => m.default);
	const response = await axios.get(url, {
		headers: {
			Referer: "https://www.bilibili.com/",
			"User-Agent": "okhttp/3.4.1",
		},
		responseType: "arraybuffer",
	});

	const buffer = toBuffer(response.data);
	const encodedData = buffer.toString("base64");

	return encodedData;
}

/**
 * Parse the source string (`a, b`) to source list `['a', 'b']`.
 */
function parseSourceStringToList(executor: UNM.Executor, sourceString: string) {
	const availableSource = executor.list();

	return sourceString
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter((s) => {
			const isAvailable = availableSource.includes(s);

			if (!isAvailable) {
				console.debug(`This source is not one of the supported source: ${s}`);
			}

			return isAvailable;
		});
}

export function initIpcMain(win: BrowserWindow, store, trayEventEmitter?: TrayEventEmitter) {
	// WIP: Do not enable logging as it has some issues in non-blocking I/O environment.
	// UNM.enableLogging(UNM.LoggingType.ConsoleEnv);
	const unmExecutor = new UNM.Executor();

	ipcMain.handle(
		"unblock-music",
		/**
		 *
		 * @param {*} _
		 * @param {string | null} sourceListString
		 * @param {Record<string, any>} ncmTrack
		 * @param {UNM.Context} context
		 */
		async (_, sourceListString, ncmTrack, context) => {
			// Formt the track input
			// FIXME: Figure out the structure of Track
			const song = {
				id: ncmTrack.id && ncmTrack.id.toString(),
				name: ncmTrack.name,
				duration: ncmTrack.dt,
				album: ncmTrack.al && {
					id: ncmTrack.al.id && ncmTrack.al.id.toString(),
					name: ncmTrack.al.name,
				},
				artists: ncmTrack.ar
					? ncmTrack.ar.map(({ id, name }) => ({
							id: id && id.toString(),
							name,
						}))
					: [],
			};

			const sourceList =
				typeof sourceListString === "string"
					? parseSourceStringToList(unmExecutor, sourceListString)
					: ["ytdl", "bilibili", "pyncm", "kugou"];
			console.debug(`[UNM] using source: ${sourceList.join(", ")}`);
			console.debug(`[UNM] using configuration: ${JSON.stringify(context)}`);

			try {
				// TODO: tell users to install yt-dlp.
				const matchedAudio = await unmExecutor.search(sourceList, song, context);
				const retrievedSong = await unmExecutor.retrieve(matchedAudio, context);

				// bilibili's audio file needs some special treatment
				if (retrievedSong.url.includes("bilivideo.com")) {
					retrievedSong.url = await getBiliVideoFile(retrievedSong.url);
				}

				console.debug(`respond with retrieve song…`);
				console.debug(JSON.stringify(matchedAudio));
				return retrievedSong;
			} catch (err) {
				const errorMessage = err instanceof Error ? `${err.message}` : `${err}`;
				console.debug(`UnblockNeteaseMusic failed: ${errorMessage}`);
				return null;
			}
		},
	);

	ipcMain.on("close", (e) => {
		if (isMac) {
			win.hide();
			exitAsk(e, win);
		} else {
			let closeOpt = store.get("settings.closeAppOption");
			if (closeOpt === "exit") {
				app.exit(); //exit()直接关闭客户端，不会执行quit();
			} else if (closeOpt === "minimizeToTray") {
				e.preventDefault();
				win.hide();
			} else {
				exitAskWithoutMac(e, win);
			}
		}
	});

	ipcMain.on("minimize", () => {
		win.minimize();
	});

	ipcMain.on("maximizeOrUnmaximize", () => {
		win.isMaximized() ? win.unmaximize() : win.maximize();
	});

	ipcMain.on("settings", (event, options) => {
		store.set("settings", options);
		if (options.enableGlobalShortcut) {
			registerGlobalShortcut(win, store);
		} else {
			console.debug("unregister global shortcut");
			globalShortcut.unregisterAll();
		}
	});

	ipcMain.on("setProxy", (_event, config) => {
		const proxyRules = `${config.protocol}://${config.server}:${config.port}`;
		store.set("proxy", proxyRules);
		win.webContents.session.setProxy({
			proxyRules,
		});
	});

	ipcMain.on("removeProxy", (event, arg) => {
		console.debug("removeProxy");
		win.webContents.session.setProxy({});
		store.set("proxy", "");
	});

	ipcMain.on("switchGlobalShortcutStatusTemporary", (e, status) => {
		console.debug("switchGlobalShortcutStatusTemporary");
		if (status === "disable") {
			globalShortcut.unregisterAll();
		} else {
			registerGlobalShortcut(win, store);
		}
	});

	ipcMain.on("updateShortcut", (e, { id, type, shortcut }) => {
		console.debug("updateShortcut");
		let shortcuts = store.get("settings.shortcuts");
		let newShortcut = shortcuts.find((s) => s.id === id);
		newShortcut[type] = shortcut;
		store.set("settings.shortcuts", shortcuts);

		createMenu(win, store);
		globalShortcut.unregisterAll();
		registerGlobalShortcut(win, store);
	});

	ipcMain.on("restoreDefaultShortcuts", () => {
		console.debug("restoreDefaultShortcuts");
		store.set("settings.shortcuts", cloneDeep(shortcuts));

		createMenu(win, store);
		globalShortcut.unregisterAll();
		registerGlobalShortcut(win, store);
	});

	if (isCreateTray) {
		ipcMain.on("updateTrayTooltip", (_, title) => {
			trayEventEmitter?.emit("updateTooltip", title);
		});
		ipcMain.on("updateTrayPlayState", (_, isPlaying) => {
			trayEventEmitter?.emit("updatePlayState", isPlaying);
		});
		ipcMain.on("updateTrayLikeState", (_, isLiked) => {
			trayEventEmitter?.emit("updateLikeState", isLiked);
		});
	}
}
