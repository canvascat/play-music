export const isWindows = false; // process.platform === 'win32';
export const isMac = false; // process.platform === 'darwin';
export const isLinux = false; // process.platform === 'linux';
export const isDevelopment = import.meta.env.MODE === "development";

export const isCreateTray = isWindows || isLinux || isDevelopment;
export const isCreateMpris = isLinux;
