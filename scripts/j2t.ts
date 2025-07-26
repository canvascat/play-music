import fsp from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { glob } from "glob";

const require = createRequire(import.meta.url);

async function main() {
	const root = path.join(process.cwd(), "src/locale/lang");
	const files = await glob("**/*.ts", { cwd: root });

	for (const file of files) {
		const content = require(path.join(root, file));
		const json = JSON.stringify(content, null, 2);
		await fsp.writeFile(path.join(root, file.replace(".ts", ".json")), json);
		// console.log(json, path.join(root, file));
		// break;
		// await fsp.rename(path.join(root, file), path.join(root, file.replace('.js', '.ts')));
	}

	// for (const file of files) {
	//   const content = await fsp.readFile(`./src/components/${file}`, 'utf-8');
	//   const newContent = content.replace(/<script setup lang="ts">/, '<script setup lang="ts">\nimport type { VNode } from "vue";\n\ndefineOptions({ name: "ButtonIcon" });\ndefineSlots<{\n  default: () => VNode;\n}>();');
	//   await fsp.writeFile(`./src/components/${file}`, newContent);
	// }
}

main();
