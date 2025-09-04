import type { Track } from "ncm-api/types";
import type Player from "./Player";

export function initMediaSession(this: Player) {
	if ("mediaSession" in navigator) {
		navigator.mediaSession.setActionHandler("play", () => {
			this.play();
		});
		navigator.mediaSession.setActionHandler("pause", () => {
			this.pause();
		});
		navigator.mediaSession.setActionHandler("previoustrack", () => {
			this.playPrevTrack();
		});
		navigator.mediaSession.setActionHandler("nexttrack", () => {
			this._playNextTrack();
		});
		navigator.mediaSession.setActionHandler("stop", () => {
			this.pause();
		});
		navigator.mediaSession.setActionHandler("seekto", (event) => {
			const position = this.seek(event.seekTime);
			updateMediaSessionPositionState(this.currentTrack, position);
		});
		navigator.mediaSession.setActionHandler("seekbackward", (event) => {
			const position = this.seek(this.seek() - (event.seekOffset || 10));
			updateMediaSessionPositionState(this.currentTrack, position);
		});
		navigator.mediaSession.setActionHandler("seekforward", (event) => {
			const position = this.seek(this.seek() + (event.seekOffset || 10));
			updateMediaSessionPositionState(this.currentTrack, position);
		});
	}
}

export function updateMediaSessionMetaData(this: Player, track: Track) {
	if ("mediaSession" in navigator === false) {
		return;
	}
	const artists = track.ar.map((a) => a.name);
	const metadata = {
		title: track.name,
		artist: artists.join(","),
		album: track.al.name,
		artwork: [
			{
				src: `${track.al.picUrl}?param=224y224`,
				type: "image/jpg",
				sizes: "224x224",
			},
			{
				src: `${track.al.picUrl}?param=512y512`,
				type: "image/jpg",
				sizes: "512x512",
			},
		],
		trackId: this.current,
		length: this.currentTrackDuration,
		url: `/trackid/${track.id}`,
	};

	navigator.mediaSession.metadata = new window.MediaMetadata(metadata);
	return metadata;
}

export function updateMediaSessionPositionState(track: Track | undefined, position: number) {
	if (!track || "mediaSession" in navigator === false) {
		return;
	}
	if ("setPositionState" in navigator.mediaSession) {
		navigator.mediaSession.setPositionState({
			duration: ~~(track.dt / 1000),
			playbackRate: 1.0,
			position,
		});
	}
}
