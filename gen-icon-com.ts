import { optimize } from 'svgo';
import { glob } from 'glob';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { camelCase, upperFirst } from 'es-toolkit';
 

glob('**/*.svg', { cwd: path.join(process.cwd(), 'src/assets/icons') }) 

async function main() {
  const root = path.join(process.cwd(), 'src/assets/icons');
  const files = await glob('**/*.svg', { cwd: root });

  const coms = Object.create(null);
  let input = ''
  for (const file of files) {
    const svg = await fsp.readFile(path.join(root, file), 'utf-8');
    // 添加class svg-icon
    const data = optimize(svg, {
      plugins: [
        {
          name: 'preset-default',
        },
        {
          name: 'addClassesToSVGElement',
          params: {
            classNames: ['svg-icon'],
          },
        },
      ],
    }).data;
    const name = path.basename(file, '.svg');
    const comName = upperFirst(camelCase(`icon-${name}`)); 
    // console.log(comName);
    const content = `<template>
  ${data}
</template>

<script>
export default {
  name: '${comName}'
}
</script>`;
    await fsp.writeFile(path.join(root, 'components', `${comName}.vue`), content);
    input += `import ${comName} from './components/${comName}.vue'\n`;
    coms[name] = comName;
  }
  input += `\nexport { ${Object.values(coms).join(', ')} }\n\n`;
  input += `export default ${JSON.stringify(coms, null, 2).replace(/",\n/g, ',\n').replace(/: "/g, ': ').replace(/"\n/g, '\n')}`
  await fsp.writeFile(path.join(root, 'index.js'), input);
}

main();
// const svg = ``;

// const result = optimize(svg, {
//   plugins: [
//     {
//       name: 'preset-default',
//     },
//   ],
// });