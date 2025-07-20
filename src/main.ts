import '@/index.css'
import { createApp } from 'vue'; 
import App from './App.vue';
// import  App from './Demo.vue';
import router from './router';
import { pinia, useStore } from './store/pinia';
import '@/utils/filters';
import '@/assets/css/global.scss';
import NProgress from 'nprogress';
import '@/assets/css/nprogress.css';
import SvgIcon from '@/components/SvgIcon.vue';
import { createI18n } from 'vue-i18n';
import { messages } from './locale';


window.resetApp = () => {
  localStorage.clear();
  indexedDB.deleteDatabase('yesplaymusic');
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
  return '已重置应用，请刷新页面（按Ctrl/Command + R）';
};

console.log(
  '如出现问题，可尝试在本页输入 %cresetApp()%c 然后按回车重置应用。',
  'background: #eaeffd;color:#335eea;padding: 4px 6px;border-radius:3px;',
  'background:unset;color:unset;'
);

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

const app = createApp(App);

app.component('svg-icon', SvgIcon);
app.use(pinia); 
const store = useStore()

store.$subscribe((_mutation, state) => {
  // console.log(mutation, state, '---subscribe');
  // const events = Array.isArray(mutation.events) ? mutation.events : [mutation.events];
  // if(events.some(event => event.key === 'settings')) {
  //   localStorage.setItem('settings', JSON.stringify(state.settings));
  // }
  // if(events.some(event => event.key === 'data')) {
  //   localStorage.setItem('data', JSON.stringify(state.data));
  // }
  localStorage.setItem('data', JSON.stringify(state.data));
  localStorage.setItem('settings', JSON.stringify(state.settings));
})

app.use(createI18n({
  locale: store.settings.lang,
  messages,
  silentTranslationWarn: true,
}));
app.use(router);
app.mount('#app');
