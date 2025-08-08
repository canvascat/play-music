import defaultShortcuts from "@/utils/shortcuts";
import { globalShortcut, type BrowserWindow } from "electron";

type CommandId = (typeof defaultShortcuts)[number]["id"];

export function registerGlobalShortcut(win: BrowserWindow, store) {
	let shortcuts: typeof defaultShortcuts = store.get("settings.shortcuts");
	if (shortcuts === undefined) {
		shortcuts = defaultShortcuts;
	}

	const commands = new Set<CommandId>([
		"play",
		"next",
		"previous",
		"increaseVolume",
		"decreaseVolume",
		"like",
	]);

	shortcuts.forEach((shortcut) => {
		if (!commands.has(shortcut.id)) return;
		globalShortcut.register(shortcut.globalShortcut, () => {
			win.webContents.send(shortcut.id);
		});
	});

	const minimizeShortcut = shortcuts.find((s) => s.id === "minimize");
	if (minimizeShortcut) {
		globalShortcut.register(minimizeShortcut.globalShortcut, () => {
			win.isVisible() ? win.hide() : win.show();
		});
	}
}
