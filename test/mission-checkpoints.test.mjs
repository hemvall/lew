import test from 'node:test';import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {checkpointProvider} from '../mission-checkpoints.mjs';
import {checkpointPool} from './helpers/checkpoint-pool.mjs';
import {StateGraph,Annotation,START,END} from '@langchain/langgraph';
test('production checkpoint provider creates private RLS tables and restores native graph state',async()=>{
 const db=new PGlite();
 try{
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
  const pool=checkpointPool(db),provider=checkpointProvider(async()=>pool),saver=await provider();
  assert.equal(await provider(),saver);
  const State=Annotation.Root({result:Annotation()});
  const build=cp=>new StateGraph(State).addNode('work',()=>({result:'durable'})).addEdge(START,'work').addEdge('work',END).compile({checkpointer:cp});
  const config={configurable:{thread_id:'test'},durability:'sync'};
  await build(saver).invoke({},config);
  const restored=await checkpointProvider(async()=>pool)();
  assert.equal((await build(restored).getState(config)).values.result,'durable');
  const tables=await db.query("SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace='lew_graph'::regnamespace AND relkind='r'");
  assert.equal(tables.rows.length,4);assert.ok(tables.rows.every(t=>t.relrowsecurity));
  const access=await db.query("SELECT has_schema_privilege('anon','lew_graph','USAGE') AS anon,has_schema_privilege('authenticated','lew_graph','USAGE') AS authenticated");
  assert.deepEqual(access.rows[0],{anon:false,authenticated:false});
 }finally{await db.close();}
});
