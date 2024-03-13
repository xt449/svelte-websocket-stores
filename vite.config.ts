import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { viteSingleFile } from "vite-plugin-singlefile"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			onwarn(warning, defaultHandler) {
				if (warning.code === "a11y-missing-attribute") return;
				defaultHandler!(warning);
			},
		}),
		viteSingleFile()
	],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$utils: path.resolve('./src/utils')
		}
	}
});
