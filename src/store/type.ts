import type { User } from '@/types';

export interface DataStore {
  user: User;
  likedSongPlaylistID: number;
  lastRefreshCookieDate: number;
}
