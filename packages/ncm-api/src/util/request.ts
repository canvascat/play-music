import { normalizeArguments, normalizeResponse, type RequestAnswer } from "./normalize";
import type { RequestOptions } from "./option";

/**
 * 创建HTTP请求
 * 提供网易云音乐API的HTTP请求功能，支持多种加密方式
 * @param uri - API路径
 * @param data - 请求数据
 * @param options - 请求选项
 */
export default async function request(
	uri: string,
	data: Record<string, any>,
	options: RequestOptions,
): Promise<RequestAnswer> {
	const { url, headers, body, needDecrypt } = await normalizeArguments(uri, data, options);

	let res: Response;
	try {
		res = await fetch(url, { method: "POST", headers, body });
	} catch (error) {
		throw { status: 502, body: { code: 502, msg: error } };
	}
	const answer = await normalizeResponse(res, needDecrypt);

	if (answer.status === 200) return answer;
	throw answer;
}
