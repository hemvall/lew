import test from 'node:test';import assert from 'node:assert/strict';
import {fork} from 'node:child_process';import {once} from 'node:events';
import {mkdtemp,rm,readFile} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
const fixture=new URL('./fixtures/mission-crash-worker.mjs',import.meta.url);
function launch(root,phase,point){
 const child=fork(fixture,[root,phase,point],{stdio:['ignore','ignore','pipe','ipc']});let stderr='';child.stderr.on('data',chunk=>stderr+=chunk);
 const message=new Promise((resolve,reject)=>{child.once('message',resolve);child.once('exit',(code,signal)=>{if(code||signal)reject(new Error(stderr||`Exited ${code} ${signal}`));});});
 return {child,message};
}
for(const point of ['prepare','result','commit'])test(`hard worker restart after ${point} resumes without duplicate development, commits or PRs`,{timeout:60000},async()=>{
 const root=await mkdtemp(join(tmpdir(),'lew-crash-'));let child;
 try{
  let run=launch(root,'start',point);child=run.child;assert.equal((await run.message).crashReady,true);
  const exited=once(child,'exit');child.kill('SIGKILL');await exited;
  run=launch(root,'resume',point);child=run.child;const result=await run.message;
  assert.equal(result.status,'published');assert.equal(result.requests,1);assert.equal(result.commits,'1');assert.ok(result.checkpoints>4);
  assert.deepEqual((await readFile(join(root,'calls.log'),'utf8')).trim().split('\n'),['orchestrator','developer','reviewer','validation']);
  await once(child,'exit');child=null;
 }finally{child?.kill('SIGKILL');await rm(root,{recursive:true,force:true});}
});
