import { useStore } from "@/store/pinia";
import type { Track, TrackPrivilege } from "@/types/index";
import { isAccountLoggedIn } from "./auth";

function isTrackPlayable(track: Track, vipType?: number) {
	const result = {
		playable: true,
		reason: "",
	};
	if (track?.privilege?.pl && track.privilege.pl > 0) {
		return result;
	}
	// cloud storage judgement logic
	if (isAccountLoggedIn() && track?.privilege?.cs) {
		return result;
	}
	if (track.fee === 1 || track.privilege?.fee === 1) {
		if (vipType === 11) {
			result.playable = true;
		} else {
			result.playable = false;
			result.reason = "VIP Only";
		}
	} else if (track.fee === 4 || track.privilege?.fee === 4) {
		result.playable = false;
		result.reason = "付费专辑";
	} else if (
		track.noCopyrightRcmd !== null &&
		track.noCopyrightRcmd !== undefined
	) {
		result.playable = false;
		result.reason = "无版权";
	} else if (
		track.privilege?.st &&
		track.privilege.st < 0 &&
		isAccountLoggedIn()
	) {
		result.playable = false;
		result.reason = "已下架";
	}
	return result;
}

export function mapTrackPlayableStatus(
	tracks: Track[],
	privileges: TrackPrivilege[] = [],
) {
	if (tracks?.length === undefined) return tracks;
	const vipType = useStore().data.user?.vipType;
	return tracks.map((t) => {
		const privilege = privileges.find((item) => item.id === t.id);
		if (t.privilege) {
			Object.assign(t.privilege, privilege);
		} else {
			t.privilege = privilege;
		}
		const result = isTrackPlayable(t, vipType);
		t.playable = result.playable;
		t.reason = result.reason;
		return t;
	});
}

export function changeAppearance(appearance?: "auto" | "dark" | "light") {
	if (appearance === "auto" || appearance === undefined) {
		appearance = window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	document.body.setAttribute("data-theme", appearance);
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", appearance === "dark" ? "#222" : "#fff");
}

export function splitSoundtrackAlbumTitle(title: string) {
	const keywords = [
		"Music from the Original Motion Picture Score",
		"The Original Motion Picture Soundtrack",
		"Original MGM Motion Picture Soundtrack",
		"Complete Original Motion Picture Score",
		"Original Music From The Motion Picture",
		"Music From The Disney+ Original Movie",
		"Original Music From The Netflix Film",
		"Original Score to the Motion Picture",
		"Original Motion Picture Soundtrack",
		"Soundtrack from the Motion Picture",
		"Original Television Soundtrack",
		"Original Motion Picture Score",
		"Music From the Motion Picture",
		"Music From The Motion Picture",
		"Complete Motion Picture Score",
		"Music from the Motion Picture",
		"Original Videogame Soundtrack",
		"La Bande Originale du Film",
		"Music from the Miniseries",
		"Bande Originale du Film",
		"Die Original Filmmusik",
		"Original Soundtrack",
		"Complete Score",
		"Original Score",
	];
	for (const keyword of keywords) {
		if (title.includes(keyword) === false) continue;
		return {
			title: title
				.replace(`(${keyword})`, "")
				.replace(`: ${keyword}`, "")
				.replace(`[${keyword}]`, "")
				.replace(`- ${keyword}`, "")
				.replace(`${keyword}`, ""),
			subtitle: keyword,
		};
	}
	return {
		title: title,
		subtitle: "",
	};
}

export function splitAlbumTitle(title: string) {
	const keywords = [
		"Bonus Tracks Edition",
		"Complete Edition",
		"Deluxe Edition",
		"Deluxe Version",
		"Tour Edition",
	];
	for (const keyword of keywords) {
		if (title.includes(keyword) === false) continue;
		return {
			title: title
				.replace(`(${keyword})`, "")
				.replace(`: ${keyword}`, "")
				.replace(`[${keyword}]`, "")
				.replace(`- ${keyword}`, "")
				.replace(`${keyword}`, ""),
			subtitle: keyword,
		};
	}
	return {
		title: title,
		subtitle: "",
	};
}

export function bytesToSize(bytes: number) {
	const marker = 1024; // Change to 1000 if required
	const decimal = 2; // Change as required
	const kiloBytes = marker;
	const megaBytes = marker * marker;
	const gigaBytes = marker * marker * marker;

	const lang = useStore().settings.lang;

	if (bytes < kiloBytes) return bytes + (lang === "en" ? " Bytes" : "字节");
	else if (bytes < megaBytes)
		return `${(bytes / kiloBytes).toFixed(decimal)} KB`;
	else if (bytes < gigaBytes)
		return `${(bytes / megaBytes).toFixed(decimal)} MB`;
	else return `${(bytes / gigaBytes).toFixed(decimal)} GB`;
}

export function formatTrackTime(value?: number | string) {
	value = Number(value);
	if (!value) return "";
	const min = ~~(value / 60);
	const sec = (~~(value % 60)).toString().padStart(2, "0");
	return `${min}:${sec}`;
}
