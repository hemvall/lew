import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,chmod,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {MissionAdapter} from '../mission-adapter.mjs';
import {defaults} from '../agents.mjs';
import {resultSchema} from '../mission-model.mjs';

test('a protocol interruption preserves the workspace state and signals mission recovery',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'lew-interrupt-'));
  const binary=join(dir,process.platform==='win32'?'codex.js':'codex'),previous=process.env.LEW_CODEX_BIN;
  await writeFile(binary,`#!/usr/bin/env node
const send=m=>process.stdout.write(JSON.stringify(m)+'\\n');
require('node:readline').createInterface({input:process.stdin}).on('line',line=>{
  const m=JSON.parse(line);
  if(m.method==='initialize')send({id:m.id,result:{}});
  if(m.method==='thread/start')send({id:m.id,result:{thread:{id:'thread'}}});
  if(m.method==='turn/start')send({id:m.id,result:{turn:{id:'turn'}}});
  if(m.method==='turn/interrupt'){
    send({id:m.id,result:{}});
    send({method:'turn/completed',params:{turn:{id:'turn',status:'interrupted'}}});
  }
});`);
  await chmod(binary,0o755);process.env.LEW_CODEX_BIN=binary;
  const workers=new Map(),approvals=new Map(),queries=[];
  const adapter=new MissionAdapter({root:dir,workers,approvals,query:async(...args)=>queries.push(args),event:async(id,kind)=>{if(kind==='turn')await adapter.interrupt(id);}});
  try{
    await assert.rejects(adapter.execute({id:'workspace',cwd:dir},defaults[1],'Develop',resultSchema,Date.now()+5000),error=>error.code==='MISSION_STOPPED');
    assert.ok(queries.some(args=>args[0]==='UPDATE workspaces SET status=? WHERE id=?'&&args[1]==='interrupted'));
    assert.equal(workers.size,0);assert.equal(approvals.size,0);
  }finally{
    if(previous===undefined)delete process.env.LEW_CODEX_BIN;else process.env.LEW_CODEX_BIN=previous;
    await rm(dir,{recursive:true,force:true});
  }
});
