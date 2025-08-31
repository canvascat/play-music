import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { timeout } from "hono/timeout";
import fsp from "node:fs/promises";
import path from "node:path";
import { serveStatic } from "hono/bun";
import { fileURLToPath } from "node:url";
import request from "NeteaseCloudMusicApi/util/request";

async function getModulesDefinitions(modulesPath: string, specificRoute: Record<string, string>) {
	const files = await fsp.readdir(modulesPath);

	const parseRoute = (fileName: string) =>
		specificRoute && fileName in specificRoute
			? specificRoute[fileName]
			: `/${fileName.replace(/\.js$/i, "").replace(/_/g, "/")}`;

	const modules = files
		.reverse()
		.filter((file) => file.endsWith(".js"))
		.map((file) => {
			const identifier = file.split(".").shift();
			const route = parseRoute(file);
			const modulePath = path.join(modulesPath, file);

			return { identifier, route, modulePath };
		});

	return modules;
}

const app = new Hono();

const NeteaseCloudMusicApiRoot = path.dirname(
	fileURLToPath(import.meta.resolve("NeteaseCloudMusicApi")),
);

app.use("*", serveStatic({ root: path.join(NeteaseCloudMusicApiRoot, "public") }));

const ncm = app;
// .basePath("/ncm");

ncm.use(
	"*",
	cors({
		origin: "*",
		allowHeaders: ["Content-Type"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

ncm.use("*", timeout(15_000));

const special = {
	"daily_signin.js": "/daily_signin",
	"fm_trash.js": "/fm_trash",
	"personal_fm.js": "/personal_fm",
};

const moduleDefinitions = await getModulesDefinitions(
	path.join(NeteaseCloudMusicApiRoot, "module"),
	special,
);

for (const moduleDef of moduleDefinitions) {
	ncm.use(moduleDef.route, async (c) => {
		const module = await import(moduleDef.modulePath);
		const cookie = getCookie(c);
		const query: Record<string, any> = {
			cookie,
			...c.req.query(),
			// ...(await c.req.json()),
		};
		try {
			const moduleResponse = await module.default(query, request);
			// console.log("[OK]", decode(req.originalUrl));
			c.status(moduleResponse.status);
			return c.json(moduleResponse.body);
		} catch (moduleResponse) {
			if (!moduleResponse.body) {
				c.status(404);
				return c.json({
					code: 404,
					data: null,
					msg: "Not Found",
				});
			}
			if (moduleResponse.body.code == "301") moduleResponse.body.msg = "需要登录";
			if (!query.noCookie) {
				c.header("Set-Cookie", moduleResponse.cookie);
			}

			c.status(moduleResponse.status);
			return c.json(moduleResponse.body);
		}
	});
}

export default app;
