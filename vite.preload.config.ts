import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// https://vitejs.dev/config
export default defineConfig({
	build: {
		// sourcemap: sourcemap ? "inline" : undefined, // #332
		// minify: isBuild,
		// outDir: "dist-electron/preload",
		rollupOptions: {
			external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
			// input: "electron/preload/index.ts",
			output: {
				format: "cjs",
				inlineDynamicImports: true,
				entryFileNames: `[name].mjs`,
				chunkFileNames: `[name].mjs`,
				assetFileNames: "[name].[ext]",
			},
		},
	},
});
