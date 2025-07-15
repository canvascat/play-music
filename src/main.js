import '@/index.css'
import { createApp } from 'vue'; 
import App from './App.vue';
import router from './router';
import { pinia } from './store/pinia';
import '@/utils/filters';
import '@/assets/css/global.scss';
import NProgress from 'nprogress';
import '@/assets/css/nprogress.css';
import SvgIcon from '@/components/SvgIcon.vue';
import i18n from './locale';


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

// Vue.use(
//   VueGtag,
//   {
//     config: { id: 'G-KMJJCFZDKF' },
//   },
//   router
// );
// Vue.config.productionTip = false;

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });


const app = createApp(App);

app.component('svg-icon', SvgIcon);
app.use(pinia);

app.use(i18n);
app.use(router);
app.mount('#app');