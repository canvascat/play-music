/// <reference types="vite/client" />

declare interface Window {
  IS_ELECTRON: boolean;
  ipcRenderer: any | null;
  resetApp: () => string;
}
