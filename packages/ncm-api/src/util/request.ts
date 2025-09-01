/**
 * 请求工具模块
 * 提供网易云音乐API的HTTP请求功能，支持多种加密方式和代理配置
 */

import { URLSearchParams } from "node:url";
import { normalizeArguments, normalzieResponse } from "./normalize";

/**
 * 创建HTTP请求
 * @param uri - API路径
 * @param data - 请求数据
 * @param options - 请求选项
 */
export const request = async (...args: Parameters<typeof normalizeArguments>) => {
	const { url, headers, encryptData, e_r } = await normalizeArguments(...args);
	const body = new URLSearchParams(encryptData);
	const response = await fetch(url, { method: "POST", headers, body });
	return normalzieResponse(response, e_r);
};
