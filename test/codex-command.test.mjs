import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {codexCommand} from '../codex-command.mjs';
test('Windows npm shim starts the official Node entrypoint without cmd shell',()=>{
  const root=mkdtempSync(join(tmpdir(),'lew-npm-'));
  try{const bin=join(root,'node_modules','@openai','codex','bin');mkdirSync(bin,{recursive:true});writeFileSync(join(root,'codex.cmd'),'shim');const script=join(bin,'codex.js');writeFileSync(script,'entrypoint');assert.deepEqual(codexCommand('codex','win32',root),{file:process.execPath,args:[script]});}finally{rmSync(root,{recursive:true,force:true});}
});
test('Windows native binary can be selected explicitly',()=>{
  const root=mkdtempSync(join(tmpdir(),'lew-exe-'));
  try{const bin=join(root,'codex.exe');writeFileSync(bin,'native');assert.deepEqual(codexCommand(bin,'win32',''),{file:bin,args:[]});}finally{rmSync(root,{recursive:true,force:true});}
});
test('Linux binary resolution remains unchanged',()=>assert.deepEqual(codexCommand('/usr/bin/codex','linux',''),{file:'/usr/bin/codex',args:[]}));
