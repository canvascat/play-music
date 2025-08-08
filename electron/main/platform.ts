import process from "node:process";

/** Checks if we are in renderer process */
export const isRenderer = process.type === "renderer";

/** Checks if we are in main process */
export const isMain = process.type === "browser";

/** Checks if we are under Mac OS */
export const isMac = process.platform === "darwin";

/** Checks if we are under Windows OS */
export const isWindows = process.platform === "win32";

/** Checks if we are under Linux OS */
export const isLinux = process.platform === "linux";

/** Checks if we are the processor's arch is x86 */
export const isX86 = process.arch === "ia32";

/** Checks if we are the processor's arch is x64 */
export const isX64 = process.arch === "x64";

/** Checks if the app is running in a sandbox on macOS */
export const isSandbox = "APP_SANDBOX_CONTAINER_ID" in process.env;

/** Checks if the app is running as a Mac App Store build */
export const isMas = process.mas === true;

/** Checks if the app is running as a Windows Store (appx) build */
export const isWindowsStore = process.windowsStore === true;
export const isDevelopment = import.meta.env.MODE === "development";

export const isCreateTray = isWindows || isLinux || isDevelopment;
export const isCreateMpris = isLinux;
