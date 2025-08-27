import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type UserConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
import { rmSync } from "node:fs";
import electron from "vite-plugin-electron";
import pkg from "./package.json" with { type: "json" };
import process from "node:process";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
	const alias = {
		"@": fileURLToPath(new URL("./src", import.meta.url)),
		"@electron": fileURLToPath(new URL("./electron", import.meta.url)),
		"@main": fileURLToPath(new URL("./electron/main", import.meta.url)),
	};
	const config = {
		mode: "development",
		plugins: [vue(), tailwindcss(), vueDevTools()],
		resolve: {
			alias,
		},

		server: {
			proxy: {
				"/api": {
					target: "http://localhost:3000",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
		clearScreen: false,
		dev: {
			sourcemap: true,
		},
		css: {
			devSourcemap: true,
		},
		optimizeDeps: {
			rollupOptions: {
				// https://github.com/vitejs/rolldown-vite/issues/304
				jsx: "preserve",
			},
		},
	} satisfies UserConfig;

	if (mode === "electron") {
		rmSync("dist-electron", { recursive: true, force: true });

		const isServe = command === "serve";
		const isBuild = command === "build";
		const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
		const external = Object.keys(
			"dependencies" in pkg ? (pkg.dependencies as Record<string, string>) : {},
		);
		config.plugins.push(
			electron([
				{
					entry: "electron/main/index.ts",
					onstart(args) {
						if (process.env.VSCODE_DEBUG) {
							console.log(/* For `.vscode/.debug.script.mjs` */ "[startup] Electron App");
						} else {
							args.startup();
						}
					},
					vite: {
						resolve: {
							alias,
						},
						build: {
							sourcemap,
							minify: isBuild,
							outDir: "dist-electron/main",
							rollupOptions: {
								external,
								platform: "node",
							},
						},
					},
				},
				{
					onstart(args) {
						if (process.env.VSCODE_DEBUG) {
							console.log(/* For `.vscode/.debug.script.mjs` */ "[startup] Electron App");
						} else {
							args.startup();
						}
					},
					vite: {
						resolve: {
							alias,
						},
						build: {
							sourcemap: sourcemap ? "inline" : undefined, // #332
							minify: isBuild,
							outDir: "dist-electron/preload",
							rollupOptions: {
								external,
								input: "electron/preload/index.ts",
								output: {
									format: "cjs",
									inlineDynamicImports: true,
									entryFileNames: `[name].mjs`,
									chunkFileNames: `[name].mjs`,
									assetFileNames: "[name].[ext]",
								},
							},
						},
					},
				},
			]),
		);

		if (process.env.VSCODE_DEBUG) {
			const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);

			Object.assign(config.server, {
				host: url.hostname,
				port: +url.port,
			});
		}
		config.clearScreen = false;
	}

	return config;
});
