import { randomBytes } from "node:crypto";
import { decrypt, encrypt } from "../crypto/native";
import { APP_CONF, getDeviceId, osMap, WNMCID } from "./config";
import type { RequestOptions } from "./option";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

/**
 * 响应接口
 */
export interface RequestAnswer<Data = any> {
	status: number;
	body: Data;
	cookie?: string[];
}

/**
 * 将值转换为布尔值
 * @param val - 要转换的值
 * @returns 转换后的布尔值
 */
function toBoolean(val: unknown): boolean {
	if (typeof val === "boolean") return val;
	if (val === "") return false;
	return val === "true" || val == "1";
}

/**
 * 选择用户代理字符串
 * @param crypto - 加密方式
 * @param uaType - 用户代理类型
 * @returns 用户代理字符串
 */
const chooseUserAgent = (crypto: string, uaType: string = "pc"): string => {
	const userAgentMap: Record<string, Record<string, string>> = {
		weapi: {
			pc: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
		},
		linuxapi: {
			linux:
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36",
		},
		api: {
			pc: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152",
			android:
				"NeteaseMusic/9.1.65.240927161425(9001065);Dalvik/2.1.0 (Linux; U; Android 14; 23013RK75C Build/UKQ1.230804.001)",
			iphone: "NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)",
		},
	};
	return userAgentMap[crypto]?.[uaType] || "";
};

function cookieToJson(cookie: string = "") {
	return Object.fromEntries(
		cookie
			.split(";")
			.map((item) => item.split("="))
			.filter((item) => item.length === 2)
			.map(([key, value]) => [key.trim(), value.trim()]),
	);
}

let anonymous_token = null as string | null;
async function getAnonymousToken() {
	if (!anonymous_token) {
		anonymous_token = await readFile(path.resolve(tmpdir(), "./anonymous_token"), "utf-8");
	}
	return anonymous_token;
}

async function normalizeCookie(cookie?: string | Record<string, string>) {
	cookie = cookie || {};
	if (typeof cookie === "string") {
		cookie = cookieToJson(cookie);
	}

	const _ntes_nuid = randomBytes(32).toString("hex");
	const os = osMap[cookie.os] || osMap["iphone"];
	cookie = {
		...cookie,
		__remember_me: "true",
		// NMTID: randomBytes(16).toString("hex"),
		ntes_kaola_ad: "1",
		_ntes_nuid: cookie._ntes_nuid || _ntes_nuid,
		_ntes_nnid: cookie._ntes_nnid || `${_ntes_nuid},${Date.now().toString()}`,
		WNMCID: cookie.WNMCID || WNMCID,
		WEVNSM: cookie.WEVNSM || "1.0.0",

		osver: cookie.osver || os.osver,
		deviceId: cookie.deviceId || (await getDeviceId()),
		os: cookie.os || os.os,
		channel: cookie.channel || os.channel,
		appver: cookie.appver || os.appver,
	};

	if (!cookie.MUSIC_U) {
		// 游客
		cookie.MUSIC_A = cookie.MUSIC_A || (await getAnonymousToken());
	}
	return cookie;
}

/**
 * 标准化请求参数
 * @param uri 请求路径
 * @param data 请求数据
 * @param options 请求选项
 * @returns 标准化请求参数
 */
export async function normalizeArguments(uri: string, options: RequestOptions = {}) {
	const data = { ...options.data };
	const headers = { ...options.headers };
	const ip = options.realIP || options.ip || "";
	// console.log(ip)
	if (ip) {
		headers["X-Real-IP"] = ip;
		headers["X-Forwarded-For"] = ip;
	}
	// headers['X-Real-IP'] = '118.88.88.88'

	const cookie = await normalizeCookie(options.cookie);
	if (uri.indexOf("login") === -1) {
		cookie["NMTID"] = randomBytes(16).toString("hex");
	}

	headers["Cookie"] = Object.keys(cookie)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(cookie[key])}`)
		.join("; ");

	let url = "";
	let encryptData: ConstructorParameters<typeof URLSearchParams>[0] = "";
	let crypto = options.crypto;
	const csrfToken = cookie["__csrf"] || "";

	if (crypto === "") {
		// 加密方式为空，以配置文件的加密方式为准
		if (APP_CONF.encrypt) {
			crypto = "eapi";
		} else {
			crypto = "api";
		}
	}

	// 根据加密方式加密请求数据；目前任意uri都支持四种加密方式
	switch (crypto) {
		case "weapi":
			headers["Referer"] = APP_CONF.domain;
			headers["User-Agent"] = options.ua || chooseUserAgent("weapi");
			data.csrf_token = csrfToken;
			encryptData = encrypt.weapi(data);
			url = `${APP_CONF.domain}/weapi/${uri.slice(5)}`;
			break;

		case "linuxapi":
			headers["User-Agent"] = options.ua || chooseUserAgent("linuxapi", "linux");
			encryptData = encrypt.linuxapi({
				method: "POST",
				url: `${APP_CONF.domain}${uri}`,
				params: data,
			});
			url = `${APP_CONF.domain}/api/linux/forward`;
			break;

		case "eapi":
		case "api":
			// 两种加密方式，都应生成客户端的cookie
			const header: Record<string, string> = {
				osver: cookie.osver, //系统版本
				deviceId: cookie.deviceId,
				os: cookie.os, //系统类型
				appver: cookie.appver, // app版本
				versioncode: cookie.versioncode || "140", //版本号
				mobilename: cookie.mobilename || "", //设备model
				buildver: cookie.buildver || Date.now().toString().slice(0, 10),
				resolution: cookie.resolution || "1920x1080", //设备分辨率
				__csrf: csrfToken,
				channel: cookie.channel, //下载渠道
				requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
					.toString()
					.padStart(4, "0")}`,
			};
			if (cookie.MUSIC_U) header["MUSIC_U"] = cookie.MUSIC_U;
			if (cookie.MUSIC_A) header["MUSIC_A"] = cookie.MUSIC_A;
			headers["Cookie"] = Object.keys(header)
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(header[key])}`)
				.join("; ");
			headers["User-Agent"] = options.ua || chooseUserAgent("api", "iphone");

			if (crypto === "eapi") {
				// 使用eapi加密
				data.header = header;
				data.e_r = toBoolean(
					options.e_r !== undefined
						? options.e_r
						: data.e_r !== undefined
							? data.e_r
							: APP_CONF.encryptResponse,
				); // 用于加密接口返回值
				encryptData = encrypt.eapi(uri, data);
				url = `${APP_CONF.apiDomain}/eapi/${uri.slice(5)}`;
			} else if (crypto === "api") {
				// 不使用任何加密
				url = `${APP_CONF.apiDomain}${uri}`;
				encryptData = data;
			}
			break;

		default:
			// 未知的加密方式
			console.log("[ERR]", "Unknown Crypto:", crypto);
			break;
	}
	headers["Content-Type"] = "application/x-www-form-urlencoded";

	const body = new URLSearchParams(encryptData).toString();

	const needDecrypt = crypto === "eapi" && data.e_r;

	return { url, headers, body, needDecrypt };
}
/**
 * 标准化响应
 * @param res 响应
 * @param needDecrypt 是否需要解密
 * @returns 标准化响应
 */
export async function normalizeResponse(
	res: Response,
	needDecrypt?: boolean,
): Promise<RequestAnswer> {
	const answer: RequestAnswer = { status: 500, body: {}, cookie: [] };
	// 处理cookies
	const setCookieHeaders = res.headers.get("set-cookie");
	answer.cookie = setCookieHeaders
		? setCookieHeaders.split(",").map((x) => x.replace(/\s*Domain=[^(;|$)]+;*/, ""))
		: [];

	try {
		if (needDecrypt) {
			// eapi接口返回值被加密，需要解密
			const arrayBuffer = await res.arrayBuffer();
			const hexString = Buffer.from(arrayBuffer).toString("hex").toUpperCase();
			answer.body = decrypt.eapiRes(hexString);
		} else {
			// 解析JSON响应
			const text = await res.text();
			try {
				answer.body = JSON.parse(text);
			} catch {
				answer.body = text;
			}
		}

		if (answer.body && answer.body.code) {
			answer.body.code = Number(answer.body.code);
		}

		answer.status = Number(answer.body?.code || res.status);
		if ([201, 302, 400, 502, 800, 801, 802, 803].indexOf(answer.body?.code) > -1) {
			// 特殊状态码
			answer.status = 200;
		}
	} catch (e) {
		console.log(e);
		// can't decrypt and can't parse directly
		answer.body = await res.text();
		answer.status = res.status;
	}

	answer.status = 100 < answer.status && answer.status < 600 ? answer.status : 400;
	return answer;
}
