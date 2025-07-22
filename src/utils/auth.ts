import Cookies from 'js-cookie';
import * as api from '@/api';
import { useStore } from '@/store/pinia';

export function setCookies(string: string) {
  const cookies = string.split(';;');
  for (const cookie of cookies) {
    const cookieKeyValue = cookie.split(';')[0].split('=');
    Cookies.set(cookieKeyValue[0], cookieKeyValue[1]);
    localStorage.setItem(`cookie-${cookieKeyValue[0]}`, cookieKeyValue[1]);
  }
}

export function getCookie(key: string) {
  return Cookies.get(key) ?? localStorage.getItem(`cookie-${key}`);
}

function removeCookie(key: string) {
  Cookies.remove(key);
  localStorage.removeItem(`cookie-${key}`);
}

// 账号登录
export function isAccountLoggedIn() {
  return getCookie('MUSIC_U') !== undefined;
}

/** @deprecated */
export const isLooseLoggedIn = isAccountLoggedIn;

export function doLogout() {
  api.auth.logout();
  removeCookie('MUSIC_U');
  removeCookie('__csrf');
  const store = useStore();
  // 更新状态仓库中的用户信息
  store.updateData({ key: 'user', value: {} });
  // 更新状态仓库中的喜欢列表
  store.updateData({ key: 'likedSongPlaylistID', value: undefined });
}
