// Last.fm API documents 👉 https://www.last.fm/api

import { useLocalStorage } from "@vueuse/core";
import axios, { type AxiosResponse } from "axios";
import md5 from "crypto-js/md5";

const apiKey: string = import.meta.env.VUE_APP_LASTFM_API_KEY;
const apiSharedSecret: string = import.meta.env.VUE_APP_LASTFM_API_SHARED_SECRET;
const baseUrl: string = window.location.origin;
const url: string = "https://ws.audioscrobbler.com/2.0/";

interface LastfmParams {
	[key: string]: string | number;
}

interface LastfmSession {
	key: string;
	name: string;
	subscriber: number;
}

interface AuthGetSessionResponse {
	session: LastfmSession;
}

interface TrackUpdateNowPlayingParams {
	artist: string;
	track: string;
	album?: string;
	albumArtist?: string;
	duration?: number;
	trackNumber?: number;
	mbid?: string;
	api_key?: string;
	method?: string;
	sk?: string;
}

interface TrackScrobbleParams extends TrackUpdateNowPlayingParams {
	timestamp: number;
}

const sign = (params: LastfmParams): string => {
	const sortParamsKeys = Object.keys(params).sort();
	const sortedParams = sortParamsKeys.reduce((acc: LastfmParams, key) => {
		acc[key] = params[key];
		return acc;
	}, {});
	let signature = "";
	for (const [key, value] of Object.entries(sortedParams)) {
		signature += `${key}${value}`;
	}
	return md5(signature + apiSharedSecret).toString();
};

export function auth(): void {
	const authUrl = window.IS_ELECTRON
		? `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${baseUrl}/#/lastfm/callback`
		: `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${baseUrl}/lastfm/callback`;
	window.open(authUrl);
}

export function authGetSession(token: string): Promise<AxiosResponse<AuthGetSessionResponse>> {
	const signature = md5(
		`api_key${apiKey}methodauth.getSessiontoken${token}${apiSharedSecret}`,
	).toString();
	return axios({
		url,
		method: "GET",
		params: {
			method: "auth.getSession",
			format: "json",
			api_key: apiKey,
			api_sig: signature,
			token,
		},
	});
}

export function trackUpdateNowPlaying(
	params: TrackUpdateNowPlayingParams,
): Promise<AxiosResponse<any>> {
	const requestParams: any = { ...params };
	requestParams.api_key = apiKey;
	requestParams.method = "track.updateNowPlaying";
	requestParams.sk = getLastfm().key;
	const signature = sign(requestParams);

	return axios({
		url,
		method: "POST",
		params: {
			...requestParams,
			api_sig: signature,
			format: "json",
		},
	});
}

/**
 * @deprecated 容易被封号，不建议使用
 */
export function trackScrobble(params: TrackScrobbleParams): Promise<AxiosResponse<any>> {
	const requestParams: any = { ...params };
	requestParams.api_key = apiKey;
	requestParams.method = "track.scrobble";
	requestParams.sk = getLastfm().key;
	const signature = sign(requestParams);

	return axios({
		url,
		method: "POST",
		params: {
			...requestParams,
			api_sig: signature,
			format: "json",
		},
	});
}

export function getLastfm(): { key?: string } {
	return JSON.parse(localStorage.getItem("lastfm") || "{}");
}

export const useLastfmKey = () => useLocalStorage("lastfm", { key: undefined });
