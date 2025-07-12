export function getSendSettingsPlugin() {
 
  return store => {
    store.subscribe((mutation, state) => {
      // console.log(mutation);
      if (mutation.type !== 'updateSettings') return;
      window.window.ipcRenderer?.send('settings', state.settings);
    });
  };
}
