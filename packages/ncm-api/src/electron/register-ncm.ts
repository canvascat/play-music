import { app, protocol } from "electron";
import apiRouter from "../server/router";

export function registerNcmProtocol(customScheme: Electron.CustomScheme | string) {
	if (typeof customScheme === "string") {
		customScheme = { scheme: customScheme };
	}
	const { scheme, privileges = { standard: true, bypassCSP: true, supportFetchAPI: true } } =
		customScheme;
	protocol.registerSchemesAsPrivileged([
		{
			scheme,
			privileges,
		},
	]);

	app.whenReady().then(() => {
		// 'ncm://music.163.com/ncm/album/detail/dynamic?id=32311'
		protocol.handle(scheme, async (request) => {
			// const { host, pathname, searchParams } = new URL(request.url);
			// console.log(host, pathname);
			return apiRouter.fetch(request);
		});
	});

	return () => protocol.unhandle(scheme);
}
