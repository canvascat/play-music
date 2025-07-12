import { createI18n as _createI18n } from 'vue-i18n';
import en from './lang/en';
import zhCN from './lang/zh-CN';
import zhTW from './lang/zh-TW';
import tr from './lang/tr';
import { pinia, useStore } from '@/store/pinia';

const messages = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  tr,
};
 
const store = useStore(pinia)
const i18n = _createI18n({
  locale: store.settings.lang,
  messages,
  silentTranslationWarn: true,
});

 export default i18n;
