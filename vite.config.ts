import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), vueJsx(), tailwindcss()],
	resolve: {
		// https://vitejs.dev/config/shared-options.html#resolve-alias
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
		extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
	},
	define: {
		"process.env.IS_ELECTRON": JSON.stringify(process.env),
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
});
