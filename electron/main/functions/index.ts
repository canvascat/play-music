import * as ncm from "./ncm";
import * as theme from "./theme";
import * as window from "./window";
import * as logger from "./logger";
import * as system from "./system";

// 定义API路由
const functions = {
	ncm,
	/** 窗口管理 */
	window,

	theme,

	/** 日志功能 */
	logger,

	/** 系统信息 */
	system,
};

export type Functions = typeof functions;

export default functions;
