import type { Album } from "ncm-api/types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useI18n } from "vue-i18n";

export function formatTime(Milliseconds: number, format = "HH:MM:SS") {
	if (!Milliseconds) return "";
	dayjs.extend(duration);
	dayjs.extend(relativeTime);

	const time = dayjs.duration(Milliseconds);
	const hours = time.hours().toString();
	const mins = time.minutes().toString();
	const seconds = time.seconds().toString().padStart(2, "0");

	if (format === "HH:MM:SS") {
		return hours !== "0" ? `${hours}:${mins.padStart(2, "0")}:${seconds}` : `${mins}:${seconds}`;
	} else if (format === "Human") {
		let hoursUnit: string, minitesUnit: string;
		switch (useI18n().locale.value) {
			case "zh-CN":
				hoursUnit = "小时";
				minitesUnit = "分钟";
				break;
			case "zh-TW":
				hoursUnit = "小時";
				minitesUnit = "分鐘";
				break;
			default:
				hoursUnit = "hr";
				minitesUnit = "min";
				break;
		}
		return hours !== "0"
			? `${hours} ${hoursUnit} ${mins} ${minitesUnit}`
			: `${mins} ${minitesUnit}`;
	}
}

export function formatDate(timestamp: number, format = "MMM D, YYYY") {
	if (!timestamp) return "";
	const locale = useI18n().locale.value;
	if (locale === "zh-CN") format = "YYYY年MM月DD日";
	else if (locale === "zh-TW") format = "YYYY年MM月DD日";
	return dayjs(timestamp).format(format);
}

export function formatAlbumType(type: string, album: Album) {
	if (!type) return "";
	if (type === "EP/Single") {
		return album.size === 1 ? "Single" : "EP";
	} else if (type === "Single") {
		return "Single";
	} else if (type === "专辑") {
		return "Album";
	} else {
		return type;
	}
}

export function resizeImage(imgUrl?: string, size = 512) {
	if (!imgUrl) return "";
	let httpsImgUrl = imgUrl;
	if (imgUrl.slice(0, 5) !== "https") {
		httpsImgUrl = "https" + imgUrl.slice(4);
	}
	return `${httpsImgUrl}?param=${size}y${size}`;
}

export function formatPlayCount(count?: number) {
	if (!count) return "";

	if (count > 10000000) {
		return `${Math.floor((count / 1000000) * 10) / 10}M`; // 233.2M
	}
	if (count > 1000000) {
		return `${Math.floor((count / 1000000) * 100) / 100}M`; // 2.3M
	}
	if (count > 1000) {
		return `${Math.floor((count / 1000) * 100) / 100}K`; // 233.23K
	}
	return count;
}

export function toHttps(url: string) {
	if (!url) return "";
	return url.replace(/^http:/, "https:");
}
