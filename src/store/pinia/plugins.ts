import type { PiniaPluginContext } from 'pinia';

export function localStoragePiniaPlugin(context: PiniaPluginContext) {
  context.store.$subscribe((_mutation, state) => {
    localStorage.setItem('settings', JSON.stringify(state.settings));
    localStorage.setItem('data', JSON.stringify(state.data));
  });
}

export function getSendSettingsPlugin(context: PiniaPluginContext) {
  return context.store.$subscribe((mutation, state) => {
    console.log(mutation, state);
    // if (mutation.events?.type !== 'updateSettings') return;
    // window.ipcRenderer?.send('settings', state.settings);
  });
}