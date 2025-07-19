import { createRouter,  createWebHistory, type RouteRecordRaw } from 'vue-router';
import { isLooseLoggedIn, isAccountLoggedIn } from '@/utils/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
  },
  {
    path: '/playlist/:id',
    name: 'playlist',
    component: () => import('@/views/playlist.vue'),
  },
  {
    path: '/album/:id',
    name: 'album',
    component: () => import('@/views/album.vue'),
  },
  {
    path: '/artist/:id',
    name: 'artist',
    component: () => import('@/views/artist.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/artist/:id/mv',
    name: 'artistMV',
    component: () => import('@/views/artistMV.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/mv/:id',
    name: 'mv',
    component: () => import('@/views/mv.vue'),
  },
  {
    path: '/next',
    name: 'next',
    component: () => import('@/views/next.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/search/:keywords?',
    name: 'search',
    component: () => import('@/views/search.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/search/:keywords/:type',
    name: 'searchType',
    component: () => import('@/views/searchType.vue'),
  },
  {
    path: '/new-album',
    name: 'newAlbum',
    component: () => import('@/views/newAlbum.vue'),
  },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('@/views/explore.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/library.vue'),
    meta: {
      requireLogin: true,
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/library/liked-songs',
    name: 'likedSongs',
    component: () => import('@/views/playlist.vue'),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings.vue'),
  },
  {
    path: '/daily/songs',
    name: 'dailySongs',
    component: () => import('@/views/dailyTracks.vue'),
    meta: {
      requireAccountLogin: true,
    },
  },
  {
    path: '/lastfm/callback',
    name: 'lastfmCallback',
    component: () => import('@/views/lastfmCallback.vue'),
  },
] as const satisfies RouteRecordRaw[];

const router = createRouter({
  history:  createWebHistory() ,
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    console.log(savedPosition?.top, _to);
    return {
      el: document.querySelector('main > [data-reka-scroll-area-viewport]'), 
      top: savedPosition?.top,
    }
  },
});

// const originalPush = VueRouter.prototype.push;
// VueRouter.prototype.push = function push(location) {
//   return originalPush.call(this, location).catch(err => err);
// };

router.beforeEach((to, from, next) => {
  // 需要登录的逻辑
  if (to.meta.requireAccountLogin) {
    if (isAccountLoggedIn()) {
      next();
    } else {
      next({ path: '/login/account' });
    }
  }
  if (to.meta.requireLogin) {
    if (isLooseLoggedIn()) {
      next();
    } else {
      if (window.IS_ELECTRON === true) {
        next({ path: '/login/account' });
      } else {
        next({ path: '/login' });
      }
    }
  } else {
    next();
  }
});

export default router;
