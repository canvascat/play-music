import { procedure } from "../tipc";

export const info = procedure.on((message: string) => {
	console.log(`[INFO] ${message}`);
});

export const error = procedure.on((error: string) => {
	console.error(`[ERROR] ${error}`);
});

export const warn = procedure.on((warning: string) => {
	console.warn(`[WARN] ${warning}`);
});
