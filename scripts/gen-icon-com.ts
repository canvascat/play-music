import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { camelCase, upperFirst } from "es-toolkit";
import { glob } from "glob";
import * as svgo from "svgo";

function genIconCom(content: string, name: string) {
	return `<template>
  ${content}
</template>

<script setup lang="ts">
defineOptions({
  name: '${name}'
})
</script>`;
}

function optimize(svg: string) {
	return svgo.optimize(svg, {
		plugins: [
			{
				name: "preset-default",
			},
			{
				name: "addClassesToSVGElement",
				params: {
					classNames: ["svg-icon"],
				},
			},
		],
	}).data;
}

async function main() {
	const input = path.join(process.cwd(), "src/assets/icons");
	const output = path.join(process.cwd(), "src/components/icon");
	const files = await glob("**/*.svg", { cwd: input });

	const coms = Object.create(null);

	for (const file of files) {
		const svg = await fsp.readFile(path.join(input, file), "utf-8");

		const data = optimize(svg);
		const name = path.basename(file, ".svg");
		const comName = upperFirst(camelCase(`icon-${name}`));
		const content = genIconCom(data, comName);

		await fsp.writeFile(path.join(output, `${comName}.vue`), content);
		// += `import ${comName} from './components/${comName}.vue'\n`;
		coms[name] = comName;
	}
	const indexContent = Object.values(coms)
		.map((comName) => `export { default as ${comName} } from './${comName}.vue'`)
		.join("\n");
	await fsp.writeFile(path.join(output, "index.ts"), indexContent);

	let mapContent = Object.values(coms)
		.map((comName) => `import ${comName} from './${comName}.vue'`)
		.join("\n");
	//  += `\nexport { ${Object.values(coms).join(', ')} }\n\n`;
	mapContent += `\n\nexport default ${JSON.stringify(coms, null, 2).replace(/",\n/g, ",\n").replace(/: "/g, ": ").replace(/"\n/g, "\n")}`;
	await fsp.writeFile(path.join(output, "map.ts"), mapContent);
}

main();
