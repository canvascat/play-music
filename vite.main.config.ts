import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// https://vitejs.dev/config
export default defineConfig({
	build: {
		// sourcemap,
		// minify: isBuild,
		// outDir: "dist-electron/main",
		rollupOptions: {
			external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
			platform: "node",
			output: {
				format: "cjs",
				inlineDynamicImports: true,
				entryFileNames: `[name].cjs`,
				chunkFileNames: `[name].cjs`,
				assetFileNames: "[name].[ext]",
			},
		},
	},
});
