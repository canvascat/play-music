import { nativeTheme } from "electron";
import { fromEvent } from "rxjs";
import { procedure } from "../tipc";

export const modify = procedure.on(
	(theme: Electron.NativeTheme["themeSource"] = "system") => {
		nativeTheme.themeSource = theme;
	},
);

export const onUpdate = procedure.subscription(() =>
	fromEvent(nativeTheme, "updated", () => ({
		isDark: nativeTheme.shouldUseDarkColors,
		source: nativeTheme.themeSource,
	})),
);

export const shouldUseDark = procedure.handle(
	() => nativeTheme.shouldUseDarkColors,
);

export const source = procedure.handle(() => nativeTheme.themeSource);
