import server from "NeteaseCloudMusicApi/server";
import moduleDefs from "./ncmModDef";

export async function startNeteaseMusicApi() {
	// Let user know that the service is starting
	console.log(`[NetEase API] initiating NCM API`);

	// Load the NCM API.
	await server.serveNcmApi({ port: 10754, moduleDefs });
}
