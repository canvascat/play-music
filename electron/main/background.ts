import {
	app,
	protocol,
	BrowserWindow,
	shell,
	dialog,
	globalShortcut,
	nativeTheme,
	screen,
} from "electron";
import { isWindows, isMac, isLinux, isDevelopment, isCreateTray, isCreateMpris } from "./platform";

import { startNeteaseMusicApi } from "./services";
import { initIpcMain } from "./ipcMain";
import { createMenu } from "./menu";
import { createTray, type TrayEventEmitter } from "./tray";
import { createDockMenu } from "./dockMenu";
import { registerGlobalShortcut } from "./globalShortcut";

import Store from "electron-store";
import { createMpris, createDbus } from "./mpris";
import { spawn } from "node:child_process";

const log = (text) => console.log(`[background.js]  ${text}`);

const closeOnLinux = (e, win, store) => {
	let closeOpt = store.get("settings.closeAppOption");
	if (closeOpt !== "exit") {
		e.preventDefault();
	}

	if (closeOpt === "ask") {
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
					win.hide(); //调用 最小化实例方法
				} else if (result.response === 1) {
					win = null;
					app.exit(); //exit()直接关闭客户端，不会执行quit();
				}
			})
			.catch((err) => {
				log(err);
			});
	} else if (closeOpt === "exit") {
		win = null;
		app.quit();
	} else {
		win.hide();
	}
};

type StoreType = {
	width: number;
	height: number;
	window?: {
		x: number;
		y: number;
	};
	proxy?: string;
};

class Background {
	window?: BrowserWindow;
	ypmTrayImpl = null;

	willQuitApp = !isMac;

	trayEventEmitter?: TrayEventEmitter;

	store = new Store<StoreType>({
		defaults: {
			width: 1440,
			height: 840,
		},
	});
	constructor() {
		this.init();
	}

	init() {
		log("initializing");

		// Make sure the app is singleton.
		if (!app.requestSingleInstanceLock()) return app.quit();

		// start netease music api
		startNeteaseMusicApi();

		// create Express app
		this.createExpressApp();

		// Scheme must be registered before the app is ready
		protocol.registerSchemesAsPrivileged([
			{ scheme: "app", privileges: { secure: true, standard: true } },
		]);

		// handle app events
		this.handleAppEvents();

		// disable chromium mpris
		if (isCreateMpris) {
			app.commandLine.appendSwitch(
				"disable-features",
				"HardwareMediaKeyHandling,MediaSessionService",
			);
		}
	}

	async initDevtools() {
		// Exit cleanly on request from parent process in development mode.
		if (isWindows) {
			process.on("message", (data) => {
				if (data === "graceful-exit") {
					app.quit();
				}
			});
		} else {
			process.on("SIGTERM", () => {
				app.quit();
			});
		}
	}

	createExpressApp() {}

	createWindow() {
		const appearance = this.store.get("settings.appearance");
		const showLibraryDefault = this.store.get("settings.showLibraryDefault");

		const options: Electron.BrowserWindowConstructorOptions = {
			width: this.store.get("window.width") || 1440,
			height: this.store.get("window.height") || 840,
			minWidth: 1080,
			minHeight: 720,
			titleBarStyle: "hiddenInset",
			frame: !(isWindows || (isLinux && this.store.get("settings.linuxEnableCustomTitlebar"))),
			title: "YesPlayMusic",
			show: false,
			webPreferences: {
				webSecurity: false,
				nodeIntegration: true,

				contextIsolation: false,
			},
			backgroundColor:
				((appearance === undefined || appearance === "auto") && nativeTheme.shouldUseDarkColors) ||
				appearance === "dark"
					? "#222"
					: "#fff",
		};

		let x = this.store.get("window.x");
		let y = this.store.get("window.y");
		if (x && y) {
			let displays = screen.getAllDisplays();
			let isResetWindiw = false;
			if (displays.length === 1) {
				let { bounds } = displays[0];
				if (
					x < bounds.x ||
					x > bounds.x + bounds.width - 50 ||
					y < bounds.y ||
					y > bounds.y + bounds.height - 50
				) {
					isResetWindiw = true;
				}
			} else {
				isResetWindiw = true;
				for (let i = 0; i < displays.length; i++) {
					let { bounds } = displays[i];
					if (
						x > bounds.x &&
						x < bounds.x + bounds.width &&
						y > bounds.y &&
						y < bounds.y - bounds.height
					) {
						// 检测到APP窗口当前处于一个可用的屏幕里，break
						isResetWindiw = false;
						break;
					}
				}
			}

			if (!isResetWindiw) {
				options.x = x;
				options.y = y;
			}
		}

		this.window = new BrowserWindow(options);

		// hide menu bar on Microsoft Windows and Linux
		this.window.setMenuBarVisibility(false);

		if (process.env.WEBPACK_DEV_SERVER_URL) {
			// Load the url of the dev server if in development mode
			this.window.loadURL(
				showLibraryDefault
					? `${process.env.WEBPACK_DEV_SERVER_URL}/#/library`
					: process.env.WEBPACK_DEV_SERVER_URL,
			);
		} else {
			this.window.loadURL(
				showLibraryDefault ? "http://localhost:27232/#/library" : "http://localhost:27232",
			);
		}
		return this.window;
	}

	handleWindowEvents(win: BrowserWindow) {
		win.once("ready-to-show", () => {
			log("window ready-to-show event");
			win.show();
			this.store.set("window", win.getBounds());
		});

		win.on("close", (e) => {
			log("window close event");

			if (isLinux) {
				closeOnLinux(e, this.window, this.store);
			} else if (isMac) {
				if (this.willQuitApp) {
					this.window = undefined;
					app.quit();
				} else {
					e.preventDefault();
					this.window?.hide();
				}
			} else {
				let closeOpt = this.store.get("settings.closeAppOption");
				if (this.willQuitApp && (closeOpt === "exit" || closeOpt === "ask")) {
					this.window = undefined;
					app.quit();
				} else {
					e.preventDefault();
					this.window?.hide();
				}
			}
		});

		win.on("resized", () => {
			this.store.set("window", win.getBounds());
		});

		win.on("moved", () => {
			this.store.set("window", win.getBounds());
		});

		win.on("maximize", () => {
			win.webContents.send("isMaximized", true);
		});

		win.on("unmaximize", () => {
			win.webContents.send("isMaximized", false);
		});
		win.webContents.setWindowOpenHandler(({ url }) => {
			const excludeHosts = ["www.last.fm"];
			const exclude = excludeHosts.find((host) => url.includes(host));
			if (exclude) {
				const newWindow = new BrowserWindow({
					width: 800,
					height: 600,
					titleBarStyle: "default",
					title: "YesPlayMusic",
				});
				newWindow.loadURL(url);
			} else {
				shell.openExternal(url);
			}
			return { action: "deny" };
		});
	}

	handleAppEvents() {
		app.on("ready", async () => {
			// This method will be called when Electron has finished
			// initialization and is ready to create browser windows.
			// Some APIs can only be used after this event occurs.
			log("app ready event");

			// for development
			if (isDevelopment) {
				this.initDevtools();
			}

			// create window
			const win = this.createWindow();
			win.once("ready-to-show", () => {
				win.show();
			});
			this.handleWindowEvents(win);

			// create tray
			if (isCreateTray) {
				this.trayEventEmitter = createTray(win);
			}

			// init ipcMain
			initIpcMain(win, this.store, this.trayEventEmitter);

			// set proxy
			const proxyRules = this.store.get("proxy");
			if (proxyRules) {
				win.webContents.session
					.setProxy({ proxyRules })
					.then((result) => {
						console.debug("finished setProxy", result);
					})
					.catch((err) => {
						console.error("failed to setProxy", err);
					});
			}

			// create menu
			createMenu(win, this.store);

			// create dock menu for macOS
			const createdDockMenu = createDockMenu(win);
			if (createdDockMenu && app.dock) app.dock.setMenu(createdDockMenu);

			// register global shortcuts
			if (this.store.get("settings.enableGlobalShortcut") !== false) {
				registerGlobalShortcut(win, this.store);
			}

			// try to start osdlyrics process on start
			if (this.store.get("settings.enableOsdlyricsSupport")) {
				await createDbus(win);
				log("try to start osdlyrics process");
				const osdlyricsProcess = spawn("osdlyrics");

				osdlyricsProcess.on("error", (err) => {
					log(`failed to start osdlyrics: ${err.message}`);
				});

				osdlyricsProcess.on("exit", (code, signal) => {
					log(`osdlyrics process exited with code ${code}, signal ${signal}`);
				});
			}

			// create mpris
			if (isCreateMpris) {
				createMpris(this.window);
			}
		});

		app.on("activate", () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			log("app activate event");
			if (!this.window) {
				this.createWindow();
			} else {
				this.window.show();
			}
		});

		app.on("window-all-closed", () => {
			if (!isMac) {
				app.quit();
			}
		});

		app.on("before-quit", () => {
			this.willQuitApp = true;
		});

		app.on("quit", () => {
			//
		});

		app.on("will-quit", () => {
			// unregister all global shortcuts
			globalShortcut.unregisterAll();
		});

		if (!isMac) {
			app.on("second-instance", () => {
				if (this.window) {
					this.window.show();
					if (this.window.isMinimized()) {
						this.window.restore();
					}
					this.window.focus();
				}
			});
		}
	}
}

new Background();
