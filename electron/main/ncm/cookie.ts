import store from "@main/store";
import { type BaseWindow, BrowserWindow, shell } from "electron";

export const fetchCookies = async (parent?: BaseWindow, login?: boolean) => {
	// 创建子窗口访问网易云音乐
	const childWindow = new BrowserWindow({
		parent,
		width: 720,
		height: 480,
		title: "登录网易云音乐",
		show: false,
		resizable: false,
		fullscreenable: false,
		minimizable: false,
		maximizable: false,
		// closable: false,
		// modal: true,
		webPreferences: {
			devTools: false,
		},
	});

	return new Promise<Electron.Cookie[]>((resolve, reject) => {
		// 窗口准备好后显示
		childWindow.once("ready-to-show", async () => {
			if (
				!login ||
				(await childWindow.webContents.executeJavaScript(
					`!document.querySelector("[data-action=login]")`,
					true,
				))
			) {
				resolve(await childWindow.webContents.session.cookies.get({}));
				childWindow.close();
				return;
			}
			await childWindow.webContents.insertCSS(`
			.m-playbar {
				display: none !important;
			}
			.mrc-modal-container > :nth-child(2) > div > div	{
				inset: 0;
				position: fixed;
				z-index: 999;
				width: 100vw;
				height: 100vh; 	
			}
			`);

			await childWindow.webContents.executeJavaScript(
				`
			document.querySelector("[data-action=login]")?.click()
			`,
				true,
			);
			childWindow.show();

			childWindow.webContents.setWindowOpenHandler(({ url }) => {
				shell.openExternal(url);
				return { action: "deny" };
			});
			childWindow.webContents.session.cookies.addListener(
				"changed",
				async (_event, cookie) => {
					if (cookie.name !== "MUSIC_U") return;
					resolve(await childWindow.webContents.session.cookies.get({}));
					childWindow.close();
				},
			);
		});

		// 处理窗口关闭
		childWindow.on("closed", () => {
			// 清理引用
			reject(new Error("Window closed"));
		});

		// 加载网易云音乐网站
		childWindow.loadURL("https://music.163.com/");
	});
};

export const getCookies = async () => {
	let cookies = store.get("cookies");
	if (cookies) return cookies;
	cookies = await fetchCookies();
	store.set("cookies", cookies);
	return cookies;
};
