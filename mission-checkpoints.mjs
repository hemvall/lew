import {PostgresSaver} from '@langchain/langgraph-checkpoint-postgres';
// Share the worker's TLS-verified pool. Checkpoints never enter the Data API.
export function checkpointProvider(poolProvider){
  let pending;
  return async()=>{
    pending||=(async()=>{
      const pool=await poolProvider();
      await pool.query('CREATE SCHEMA IF NOT EXISTS lew_graph');
      await pool.query('REVOKE ALL ON SCHEMA lew_graph FROM PUBLIC, anon, authenticated');
      const saver=new PostgresSaver(pool,undefined,{schema:'lew_graph'});
      await saver.setup();
      for(const table of ['checkpoint_migrations','checkpoints','checkpoint_blobs','checkpoint_writes']){
        await pool.query(`ALTER TABLE lew_graph.${table} ENABLE ROW LEVEL SECURITY`);
        await pool.query(`REVOKE ALL ON lew_graph.${table} FROM PUBLIC, anon, authenticated`);
      }
      return saver;
    })().catch(error=>{pending=null;throw error;});
    return pending;
  };
}
