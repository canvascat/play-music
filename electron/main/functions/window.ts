import { procedure } from "@main/tipc";
import { BrowserWindow } from "electron";
import { fromEvent, map, merge } from "rxjs";

/** 打开新窗口 */
export const open = procedure.handle(async (arg: string) => {
	const childWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	// 这里需要根据实际环境加载URL
	// 简化处理，实际使用时需要根据开发/生产环境调整
	childWindow.loadURL(`http://localhost:7777/#${arg}`);
	return { success: true, windowId: childWindow.id };
});

// 获取窗口信息
export const getInfo = procedure.handle(function () {
	const window = BrowserWindow.fromId(this.senderId);
	return {
		id: this.senderId,
		bounds: window?.getBounds(),
		isMaximized: window?.isMaximized(),
		isMinimized: window?.isMinimized(),
	};
});

// 最大化窗口
export const maximize = procedure.on(function () {
	const window = BrowserWindow.fromId(this.senderId);
	window?.maximize();
});

export const isMaximized = procedure.subscription(function () {
	const window = BrowserWindow.fromId(this.senderId);
	if (!window) throw new Error("Window not found");
	return merge(
		fromEvent(window, "maximize").pipe(map(() => true)),
		fromEvent(window, "unmaximize").pipe(map(() => false)),
	);
});

// 恢复窗口
export const restore = procedure.on(function () {
	const window = BrowserWindow.fromId(this.senderId);
	window?.unmaximize();
});

// 最小化窗口
export const minimize = procedure.on(function () {
	const window = BrowserWindow.fromId(this.senderId);
	window?.minimize();
});

// 关闭窗口
export const close = procedure.on(function () {
	const window = BrowserWindow.fromId(this.senderId);
	window?.close();
});
