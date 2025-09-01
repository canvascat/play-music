import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import * as constant from "./constant";
import rsaEncrypt from "./rsa-encrypt";

/**
 * AES加密
 * @param text - 要加密的文本
 * @param mode - 加密模式 ('cbc', 'ecb')
 * @param key - 加密密钥
 * @param iv - 初始化向量
 * @param format - 输出格式 ('base64' 或 'hex')
 * @returns 加密后的字符串
 */
const aesEncrypt = (
	text: string,
	mode: "cbc" | "ecb",
	key: string,
	iv: string,
	format: "base64" | "hex" = "base64",
): string => {
	try {
		if (mode === "cbc") {
			// CBC 模式需要 IV
			const cipher = createCipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(iv));
			let encrypted = cipher.update(text, "utf8", "base64");
			encrypted += cipher.final("base64");

			if (format === "hex") {
				return Buffer.from(encrypted, "base64").toString("hex").toUpperCase();
			}
			return encrypted;
		} else {
			// ECB 模式不需要 IV
			const cipher = createCipheriv("aes-128-ecb", Buffer.from(key), null);
			let encrypted = cipher.update(text, "utf8", "base64");
			encrypted += cipher.final("base64");

			if (format === "hex") {
				return Buffer.from(encrypted, "base64").toString("hex").toUpperCase();
			}
			return encrypted;
		}
	} catch (error) {
		console.error("AES 加密失败:", error);
		return "";
	}
};

/**
 * AES解密
 * @param ciphertext - 要解密的密文
 * @param key - 解密密钥
 * @param iv - 初始化向量
 * @param format - 输入格式 ('base64' 或 'hex')
 * @returns 解密后的字符串
 */
const aesDecrypt = (
	ciphertext: string,
	key: string,
	_iv: string,
	format: "base64" | "hex" = "base64",
): string => {
	try {
		let inputBuffer: Buffer;

		if (format === "hex") {
			inputBuffer = Buffer.from(ciphertext, "hex");
		} else {
			inputBuffer = Buffer.from(ciphertext, "base64");
		}

		// 由于原代码中 ECB 模式没有使用 IV，这里统一使用 ECB 模式
		const decipher = createDecipheriv("aes-128-ecb", Buffer.from(key), null);
		let decrypted = decipher.update(inputBuffer, undefined, "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		console.error("AES 解密失败:", error);
		return "";
	}
};

/**
 * 生成随机字符串
 * @param length - 字符串长度
 * @returns 随机字符串
 */
function randomString(length: number): string {
	const bytes = randomBytes(length);
	let result = "";
	for (let i = 0; i < length; i++) {
		result += constant.BASE62[bytes[i] % constant.BASE62.length];
	}
	return result;
}

/**
 * 网易云音乐WeAPI加密
 * @param object - 要加密的对象
 * @returns 包含加密参数的对象
 */
const weapi = (object: Record<string, any>): { params: string; encSecKey: string } => {
	const text = JSON.stringify(object);
	const secretKey = randomString(16);
	const encText = aesEncrypt(text, "cbc", constant.PRESET_KEY, constant.IV);
	const encText2 = aesEncrypt(encText, "cbc", secretKey, constant.IV);
	const encSecKey = rsaEncrypt(secretKey, constant.PUBLIC_KEY);

	return {
		params: encText2,
		encSecKey: encSecKey,
	};
};

/**
 * 网易云音乐Linux API加密
 * @param object - 要加密的对象
 * @returns 包含加密参数的对象
 */
const linuxapi = (object: Record<string, any>): { eparams: string } => {
	const text = JSON.stringify(object);
	return {
		eparams: aesEncrypt(text, "ecb", constant.LINUXAPI_KEY, "", "hex"),
	};
};

/**
 * 网易云音乐EAPI加密
 * @param url - API URL
 * @param object - 要加密的对象或字符串
 * @returns 包含加密参数的对象
 */
const eapi = (url: string, object: Record<string, any> | string): { params: string } => {
	const text = typeof object === "object" ? JSON.stringify(object) : object;
	const message = `nobody${url}use${text}md5forencrypt`;

	// 使用 Node.js 内置 crypto 模块计算 MD5
	const digest = createHash("md5").update(message).digest("hex");
	const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`;

	return {
		params: aesEncrypt(data, "ecb", constant.EAPI_KEY, "", "hex"),
	};
};

/**
 * EAPI响应解密
 * @param encryptedParams - 加密的参数
 * @returns 解密后的数据对象
 */
const eapiResDecrypt = (encryptedParams: string): any => {
	// 使用aesDecrypt解密参数
	const decryptedData = aesDecrypt(encryptedParams, constant.EAPI_KEY, "", "hex");
	return JSON.parse(decryptedData);
};

/**
 * EAPI请求解密
 * @param encryptedParams - 加密的参数
 * @returns 解密后的URL和数据，如果解密失败返回null
 */
const eapiReqDecrypt = (encryptedParams: string): { url: string; data: any } | null => {
	// 使用aesDecrypt解密参数
	const decryptedData = aesDecrypt(encryptedParams, constant.EAPI_KEY, "", "hex");
	// 使用正则表达式解析出URL和数据
	const match = decryptedData.match(/(.*?)-36cd479b6b5-(.*?)-36cd479b6b5-(.*)/);

	if (match) {
		const url = match[1];
		const data = JSON.parse(match[2]);
		return { url, data };
	}

	// 如果没有匹配到，返回null
	return null;
};

export const encrypt = {
	eapi,
	linuxapi,
	weapi,
};

/**
 * 通用解密函数
 * @param cipher - 密文
 * @returns 解密后的字符串
 */
export function decrypt(cipher: string): string {
	const decipher = createDecipheriv("aes-128-ecb", Buffer.from(constant.EAPI_KEY), null);
	let decrypted = decipher.update(Buffer.from(cipher, "hex"), undefined, "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

decrypt.eapiRes = eapiResDecrypt;
decrypt.eapiReq = eapiReqDecrypt;
