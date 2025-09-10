/**
 * 请求选项接口
 */
export interface RequestOptions<T = Record<string, any>> {
	crypto?: string;
	cookie?: Record<string, string> | string;
	headers?: Record<string, string>;
	ua?: string;
	// proxy?: string;
	ip?: string;
	realIP?: string;
	e_r?: boolean | string;
	data?: T;
}

/**
 * 查询参数接口
 */
export type RequestParams<T extends Record<string, any> = {}> = Omit<RequestOptions<T>, "data"> & T;

/**
 * 创建请求选项
 * @param params - 查询参数对象
 * @param crypto - 默认加密方式（可选）
 * @returns 请求选项对象
 */
export function createOption<T extends Record<string, any> = {}>(
	params: RequestParams<T>,
	crypto?: string,
): RequestOptions<T> {
	const { crypto: _crypto, cookie, headers, ua = "", ip, realIP, e_r, ...rest } = params;
	crypto = _crypto || crypto || "";
	return { crypto, headers, cookie, ua, realIP, ip, e_r, data: rest as T };
}
