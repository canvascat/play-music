export function lyricParser(lrc: {
	lrc?: { lyric?: string };
	tlyric?: { lyric?: string };
	romalrc?: { lyric?: string };
	lyricUser?: string;
	transUser?: string;
}) {
	return {
		lyric: parseLyric(lrc?.lrc?.lyric || ""),
		tlyric: parseLyric(lrc?.tlyric?.lyric || ""),
		romalyric: parseLyric(lrc?.romalrc?.lyric || ""),
		lyricuser: lrc.lyricUser,
		transuser: lrc.transUser,
	};
}

// regexr.com/6e52n
const extractLrcRegex = /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm;
const extractTimestampRegex = /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g;

interface ParsedLyric {
	time: number;
	rawTime: string;
	content: string;
}

/**
 * Parse the lyric string.
 *
 * @example parseLyric("[00:00.00] Hello, World!\n[00:00.10] Test\n");
 */
function parseLyric(lrc: string): ParsedLyric[] {
	/**
	 * A sorted list of parsed lyric and its timestamp.
	 *
	 * @see binarySearch
	 */
	const parsedLyrics: ParsedLyric[] = [];

	/**
	 * Find the appropriate index to push our parsed lyric.
	 */
	const binarySearch = (lyric: ParsedLyric) => {
		let time = lyric.time;

		let low = 0;
		let high = parsedLyrics.length - 1;

		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			const midTime = parsedLyrics[mid].time;
			if (midTime === time) {
				return mid;
			} else if (midTime < time) {
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}

		return low;
	};

	for (const line of lrc.trim().matchAll(extractLrcRegex)) {
		const { lyricTimestamps, content } = line.groups as {
			lyricTimestamps: string;
			content: string;
		};

		for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
			const { min, sec, ms } = timestamp.groups as { min: string; sec: string; ms: string };
			const rawTime = timestamp[0];
			const time = Number(min) * 60 + Number(sec) + Number(ms ?? 0) * 0.001;
			const parsedLyric: ParsedLyric = { rawTime, time, content: trimContent(content) };
			parsedLyrics.splice(binarySearch(parsedLyric), 0, parsedLyric);
		}
	}

	return parsedLyrics;
}

function trimContent(content: string) {
	let t = content.trim();
	return t.length < 1 ? content : t;
}

export async function copyLyric(lyric: string) {
	const textToCopy = lyric;
	if (navigator.clipboard && navigator.clipboard.writeText) {
		try {
			await navigator.clipboard.writeText(textToCopy);
		} catch (_err) {
			alert("复制失败，请手动复制！");
		}
	} else {
		const tempInput = document.createElement("textarea");
		tempInput.value = textToCopy;
		tempInput.style.position = "absolute";
		tempInput.style.left = "-9999px";
		document.body.appendChild(tempInput);
		tempInput.select();
		try {
			document.execCommand("copy");
		} catch (_err) {
			alert("复制失败，请手动复制！");
		}
		document.body.removeChild(tempInput);
	}
}
