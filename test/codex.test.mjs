import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Codex } from '../codex.mjs';
const dir=mkdtempSync(join(tmpdir(),'lew-protocol-'));
const bin=join(dir,'codex');
writeFileSync(bin,`#!/usr/bin/env node
const rl=require('node:readline').createInterface({input:process.stdin});let initialized=false;
function send(v){process.stdout.write(JSON.stringify(v)+'\\n');}
rl.on('line',line=>{const m=JSON.parse(line);
if(m.method==='initialize')return send({id:m.id,result:{}});
if(m.method==='initialized'){initialized=true;return;}
if(!initialized)return send({id:m.id,error:{message:'Not initialized'}});
if(m.method==='account/login/start')return send({id:m.id,result:{type:'chatgptDeviceCode',userCode:'TEST-1234',verificationUrl:'https://auth.openai.com/codex/device',loginId:'login'}});
if(m.method==='thread/start')return send({id:m.id,result:{thread:{id:'thread'}}});
if(m.method==='turn/start'){send({id:m.id,result:{turn:{id:'turn'}}});send({method:'item/agentMessage/delta',params:{itemId:'message',delta:'hello'}});send({method:'turn/completed',params:{turn:{id:'turn',status:'completed'}}});return;}
if(m.method==='crash')return process.exit(1);
return send({id:m.id,error:{message:'Unknown method'}});
});`);chmodSync(bin,0o755);
test.after(()=>rmSync(dir,{recursive:true,force:true}));
test('handshake, device login and streamed completion follow the protocol',async()=>{
  const events=[],c=new Codex(m=>events.push(m),bin);
  try{await c.initialize();const login=await c.request('account/login/start',{type:'chatgptDeviceCode'});assert.equal(login.userCode,'TEST-1234');const thread=await c.request('thread/start');assert.equal(thread.thread.id,'thread');await c.request('turn/start',{threadId:'thread'});await new Promise(r=>setTimeout(r,50));assert.equal(events.at(-1).params.turn.status,'completed');assert.equal(events[0].params.delta,'hello');await assert.rejects(c.request('unknown'),/Unknown method/);}finally{c.close();}
});
test('process failure rejects pending requests rather than leaving the UI running',async()=>{
  const c=new Codex(()=>{},bin);await c.initialize();await assert.rejects(c.request('crash'),/arrêté/);c.close();
});
test('missing binary produces a recoverable error',async()=>{
  const c=new Codex(()=>{},join(dir,'missing'));await assert.rejects(c.initialize(),/ENOENT/);c.close();
});
