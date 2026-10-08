import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('API access is gated and Supabase configuration never leaks to the browser',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'lew-server-'));
  const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,DATABASE_URL:'',LEW_ACCESS_TOKEN:'test-only-access-token',LEW_DATA_DIR:dir,LEW_HOST:'127.0.0.1',PORT:'0',LEW_CODEX_BIN:'missing-codex-test'}});
  try{
    const [out]=await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error('Server did not start')})]);
    // The startup log exposes the assigned port for tests when PORT=0.
    const url=out.toString().match(/http:\/\/[^\s]+/)[0];
    assert.equal((await fetch(url+'/api/state')).status,401);
    const response=await fetch(url+'/api/state',{headers:{Authorization:'Bearer test-only-access-token'}});
    assert.equal(response.status,200);const data=await response.json();assert.equal(data.storage.provider,'supabase');assert.equal(data.storage.configured,false);assert.equal('DATABASE_URL' in data,false);
    assert.equal((await fetch(url+'/.env')).status,404);
    assert.equal((await fetch(url+'/api/auth/login',{method:'POST',headers:{Origin:'https://other.example',Authorization:'Bearer test-only-access-token'}})).status,403);
  }finally{child.kill();await once(child,'exit');rmSync(dir,{recursive:true,force:true});}
});

test('HTTP starts before a stalled database handshake and reports timeout without crashing or leaking credentials',async()=>{
  const {createServer}=await import('node:net');
  const sockets=new Set();
  const stalled=createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
  stalled.listen(0,'127.0.0.1');await once(stalled,'listening');
  const dir=mkdtempSync(join(tmpdir(),'lew-outage-'));
  const secret='do-not-leak-db-password';
  const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,DATABASE_URL:`postgresql://postgres:${secret}@127.0.0.1:${stalled.address().port}/postgres`,LEW_ACCESS_TOKEN:'',LEW_DATA_DIR:dir,LEW_HOST:'127.0.0.1',PORT:'0',LEW_CODEX_BIN:'missing-codex-test'}});
  const exited=once(child,'exit');let stderr='';child.stderr.on('data',data=>stderr+=data);
  try{
    const [out]=await Promise.race([once(child.stdout,'data'),exited.then(()=>{throw new Error('Server crashed before HTTP startup');})]);
    const url=out.toString().match(/http:\/\/[^\s]+/)[0];
    const home=await fetch(url,{signal:AbortSignal.timeout(2000)});assert.equal(home.status,200);
    const response=await fetch(url+'/api/state',{signal:AbortSignal.timeout(15000)});
    assert.equal(response.status,200);const data=await response.json();
    assert.equal(data.storage.configured,true);assert.equal(data.storage.ready,false);
    assert.match(data.storage.error,/Session pooler/);assert.deepEqual(data.projects,[]);
    assert.equal(JSON.stringify(data).includes(secret),false);assert.equal(stderr.includes(secret),false);
    const rejected=await fetch(url+'/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test',repo:'hemvall/lew'})});
    assert.equal(rejected.status,400);assert.match((await rejected.json()).error,/Supabase/);
    assert.equal((await fetch(url)).status,200);assert.equal(child.exitCode,null);
  }finally{child.kill();await exited;for(const socket of sockets)socket.destroy();await new Promise(resolve=>stalled.close(resolve));rmSync(dir,{recursive:true,force:true});}
});

test('malformed storage settings stay recoverable and never disclose their value',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'lew-invalid-'));
  const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,DATABASE_URL:'secret-invalid-url',LEW_ACCESS_TOKEN:'',LEW_DATA_DIR:dir,LEW_HOST:'127.0.0.1',PORT:'0',LEW_CODEX_BIN:'missing-codex-test'}});
  const exited=once(child,'exit');
  try{
    const [out]=await Promise.race([once(child.stdout,'data'),exited.then(()=>{throw new Error('Server crashed');})]);
    const url=out.toString().match(/http:\/\/[^\s]+/)[0], data=await (await fetch(url+'/api/state')).json();
    assert.equal(data.storage.ready,false);assert.match(data.storage.error,/Configuration Supabase invalide/);assert.equal(JSON.stringify(data).includes('secret-invalid-url'),false);
  }finally{child.kill();await exited;rmSync(dir,{recursive:true,force:true});}
});
