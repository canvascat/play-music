import { procedure } from "../tipc";
import { app } from "electron";
import os from "node:os";

// 获取系统信息
export const getInfo = procedure.handle(async () => {
	return {
		platform: os.platform(),
		arch: os.arch(),
		version: os.release(),
		cpus: os.cpus().length,
		memory: {
			total: os.totalmem(),
			free: os.freemem(),
		},
	};
});

// 获取应用信息
export const getAppInfo = procedure.handle(() => {
	return {
		name: app.getName(),
		version: app.getVersion(),
		path: app.getAppPath(),
	};
});
