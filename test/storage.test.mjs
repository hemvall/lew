import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import pg from 'pg';

test('storage retries, coalesces probes, and never interrupts new runs after reconnection',async t=>{
  const originalPool=pg.Pool, originalUrl=process.env.DATABASE_URL;
  let now=10000, fail=true, client;
  t.mock.method(Date,'now',()=>now);
  class FakePool extends EventEmitter {
    calls=[];
    constructor(){super();client=this;}
    async query(sql,args){this.calls.push({sql,args});await Promise.resolve();if(fail)throw Object.assign(new Error('password must never leak'),{code:'ETIMEDOUT'});return {rows:[{id:'project'}]};}
    async end(){}
  }
  pg.Pool=FakePool;process.env.DATABASE_URL='postgresql://postgres:secret@localhost:5432/postgres';
  try{
    const storage=await import('../storage.mjs?recovery-test');
    await Promise.all([storage.initializeStorage(),storage.initializeStorage()]);
    assert.equal(client.calls.length,1);assert.equal(storage.storageState().ready,false);
    assert.equal(storage.storageState().error.includes('password'),false);
    fail=false;await storage.initializeStorage();assert.equal(client.calls.length,1);
    now+=5001;await Promise.all([storage.initializeStorage(),storage.initializeStorage()]);
    assert.equal(client.calls.length,2);assert.equal(storage.storageState().ready,true);
    assert.equal(storage.storageState().error,null);
    assert.deepEqual(await storage.all('SELECT * FROM projects WHERE id=?','project'),[{id:'project'}]);
    assert.equal(client.calls.at(-1).sql,'SELECT * FROM projects WHERE id=$1');
    assert.deepEqual(client.calls.at(-1).args,['project']);
    client.emit('error',new Error('idle socket failed'));assert.equal(storage.storageState().ready,false);
    now+=5001;await storage.initializeStorage();assert.equal(storage.storageState().ready,true);
    assert.equal(client.calls.at(-1).sql,'SELECT 1');
    assert.equal(client.calls.filter(c=>c.sql.startsWith('UPDATE workspaces')).length,2); // failed attempt, then first successful recovery only
    await storage.closeStorage();
  }finally{pg.Pool=originalPool;if(originalUrl===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=originalUrl;}
});
