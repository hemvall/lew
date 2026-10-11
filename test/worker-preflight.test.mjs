import test from 'node:test';
import assert from 'node:assert/strict';
import {workerPreflight,workerFailure,requireWorkerReady} from '../worker-preflight.mjs';
test('preflight launches bounded direct commands including Windows Codex entrypoint',async()=>{
  const calls=[];const result=await workerPreflight({resolveCodex:()=>({file:'node',args:['codex.js']}),execute:async(...args)=>{calls.push(args);}});
  assert.equal(result.ready,true);assert.deepEqual(calls.map(c=>c.slice(0,2)),[['git',['--version']],['node',['codex.js','--version']]]);
  for(const c of calls){assert.equal(c[2].timeout,5000);assert.equal(c[2].windowsHide,true);assert.equal(c[2].shell,undefined);}
});
test('permission denial names the blocked tool and hides raw paths, stderr and secrets',async()=>{
  const error=Object.assign(new Error('secret/path'),{code:'EPERM',stderr:'TOKEN=secret'});
  const result=await workerPreflight({resolveCodex:()=>({file:'codex',args:[]}),execute:async file=>{if(file==='git')throw error;}});
  assert.equal(result.ready,false);assert.match(result.checks[0].message,/permissions/);assert.equal(result.checks[1].ready,true);assert.doesNotMatch(JSON.stringify(result),/secret|TOKEN/);
  await assert.rejects(requireWorkerReady(async()=>result),/Git/);
});
test('missing Codex is reported even when Git succeeds',async()=>{
  const result=await workerPreflight({resolveCodex:()=>{throw new Error('private path');},execute:async()=>{}});
  assert.equal(result.ready,false);assert.match(result.checks[1].message,/introuvable/);assert.doesNotMatch(JSON.stringify(result),/private/);
});
test('timeouts and unknown failures have actionable sanitized messages',()=>{
  assert.match(workerFailure('git',{killed:true}),/ne répond pas/);
  assert.match(workerFailure('codex',{code:'ETIMEDOUT'}),/réessayez/);
  assert.match(workerFailure('git',{code:'EACCES'}),/permissions/);
  assert.match(workerFailure('codex',{code:'ENOENT'}),/PATH/);
  assert.doesNotMatch(workerFailure('codex',new Error('secret')),/secret/);
});
test('ready gate accepts a recovered worker on the next attempt',async()=>{
  let ready=false;const check=async()=>({ready,checks:[{ready,message:'Bloqué'}]});
  await assert.rejects(requireWorkerReady(check),/Bloqué/);ready=true;assert.equal((await requireWorkerReady(check)).ready,true);
});

import {missionRoutes} from '../mission-routes.mjs';
test('mission API exposes diagnostics without storage and rejects blocked POST before persistence',async()=>{
  let writes=0;const result={ready:false,checks:[{tool:'git',ready:false,message:'Git : permissions requises'}]};
  const routes=missionRoutes({root:'.',query:async()=>{writes++;throw Error('unexpected write');},all:async()=>{throw Error('unexpected read');},one:async()=>{throw Error('unexpected read');},workerPreflight:async()=>result});
  assert.deepEqual(await routes.route({method:'GET'},'/api/missions/preflight'),result);
  await assert.rejects(routes.route({method:'POST'},'/api/missions'),/permissions/);
  assert.equal(writes,0);
});
