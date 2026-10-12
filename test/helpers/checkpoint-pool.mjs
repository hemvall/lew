// PGlite runs PostgreSQL locally; serialize its single session like a pg.Pool.
export function checkpointPool(db){
  let queue=Promise.resolve();
  const connect=async()=>{
    const previous=queue;let release;queue=new Promise(resolve=>release=resolve);await previous;
    return {query:(...args)=>db.query(...args),release};
  };
  return {connect,query:async(...args)=>{const client=await connect();try{return await client.query(...args);}finally{client.release();}}};
}
