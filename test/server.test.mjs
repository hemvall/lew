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
