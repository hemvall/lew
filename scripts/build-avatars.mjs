import { build } from 'esbuild';
import Ajv2020 from 'ajv/dist/2020.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { readFile,writeFile } from 'node:fs/promises';
const schema=JSON.parse(await readFile(new URL('../node_modules/@bible-strong/avatar-core/dist/avatarDefinition.schema.json',import.meta.url),'utf8'));
const ajv=new Ajv2020({strict:true,allErrors:true,code:{source:true,esm:true}});
const validator=standaloneCode(ajv,ajv.compile(schema));
// Precompile validation at build time. No unsafe-eval is required in the browser CSP.
await build({stdin:{contents:"export { createAvatar } from '@bible-strong/avatar-web';",resolveDir:process.cwd()},outfile:'public/vendor/avatar-runtime.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',banner:{js:'/* Avatar Core/Web 0.1.0 © Stéphane Montlouis-Calixte · AGPL-3.0-only. See AVATAR-LICENSE.txt and repository THIRD_PARTY_NOTICES.md for source. */'},plugins:[{name:'static-avatar-validator',setup(b){b.onResolve({filter:/^ajv\/dist\/2020\.js$/},()=>({path:'avatar-validator',namespace:'lew'}));b.onLoad({filter:/.*/,namespace:'lew'},()=>({contents:validator.replace('export default validate20;','')+'\nexport default class Ajv { compile() { return validate20; } }',loader:'js',resolveDir:process.cwd()}));}}]});
await writeFile('public/vendor/AVATAR-LICENSE.txt',Buffer.concat([await readFile('node_modules/@bible-strong/avatar-core/LICENSE'),Buffer.from('\n\n'),await readFile('node_modules/@bible-strong/avatar-web/LICENSE')]));

await writeFile('public/vendor/AJV-LICENSE.txt',await readFile('node_modules/ajv/LICENSE'));
