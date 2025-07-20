import type { User } from "@/types";

type LoginMode = 'account' | 'phone' | 'email';

export interface DataStore {
  user: User;
  loginMode: LoginMode | null;
  likedSongPlaylistID: number;
  lastRefreshCookieDate: number;
}