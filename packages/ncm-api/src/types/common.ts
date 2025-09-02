export interface MultiPageConfig {
	limit?: string | number;
	offset?: string | number;
}

export interface APIBaseResponse {
	code: number;
	cookie?: string;
	[index: string]: unknown;
}

export interface IResponse<Body = APIBaseResponse> {
	status: number; // The Http Response Code
	body: Body; // API Response body
	cookie?: string[];
}
