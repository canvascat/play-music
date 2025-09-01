/**
 * 请求选项接口
 */
export interface RequestOptions {
	cookie?: Record<string, string>;
	headers?: Record<string, string>;
	ip?: string;
	crypto?: string;
	ua?: string;
	proxy?: string;
	realIP?: string;
	e_r?: boolean | string;
}

/**
 * 查询参数接口
 */
export interface QueryParams {
	crypto?: string;
	ua?: string;
	proxy?: string;
	realIP?: string;
	e_r?: string;
}

/**
 * 创建请求选项
 * @param query - 查询参数对象
 * @param crypto - 默认加密方式（可选）
 * @returns 请求选项对象
 */
export const createOption = (crypto: string = ""): RequestOptions => {
	return {
		crypto: crypto || "",
		ua: "",

		e_r: undefined,
	};
};
