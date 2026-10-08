import pg from 'pg';
import { readFileSync } from 'node:fs';
export const configured = !!process.env.DATABASE_URL;
let pool, configurationError, ready=false, recovered=false, pending, retryAt=0, error=null;
function explain(e) {
  if(e?.code==='28P01') return 'Supabase : identifiants refusés. Vérifiez le mot de passe PostgreSQL dans DATABASE_URL.';
  if(e?.code==='42P01'||e?.code==='3F000') return 'Supabase : le schéma lew ou ses tables sont absents. Appliquez supabase/schema.sql.';
  if(/CERT|TLS|SSL/.test(e?.code||'')||/certificate/i.test(e?.message||'')) return 'Supabase : certificat TLS non reconnu. Configurez SUPABASE_CA_FILE avec le certificat du dashboard.';
  return 'Supabase inaccessible. Vérifiez DATABASE_URL (Connect → Session pooler, port 5432), le réseau et que le projet est actif. Lew réessaie automatiquement.';
}
try {
  if(configured) {
    const connection=new URL(process.env.DATABASE_URL);
    if(!['postgres:','postgresql:'].includes(connection.protocol)) throw new Error('Invalid protocol');
    for(const key of ['sslmode','sslcert','sslkey','sslrootcert']) connection.searchParams.delete(key);
    pool=new pg.Pool({connectionString:connection.toString(),ssl:{rejectUnauthorized:true,...(process.env.SUPABASE_CA_FILE?{ca:readFileSync(process.env.SUPABASE_CA_FILE,'utf8')}: {})},max:5,connectionTimeoutMillis:10000,query_timeout:15000,options:'-c search_path=lew,pg_catalog'});
    // Idle socket errors must not terminate the HTTP server.
    pool.on('error',e=>{ready=false;error=explain(e);retryAt=Date.now()+5000;});
  }
} catch {configurationError='Configuration Supabase invalide. Vérifiez DATABASE_URL et le chemin SUPABASE_CA_FILE dans .env, puis relancez lew.';}
export function storageState(){return {configured,ready,error:configurationError||error,provider:'supabase',project:'Lew',schema:'lew'};}
export async function initializeStorage() {
  if(!pool||ready||Date.now()<retryAt) return storageState();
  if(pending) return pending;
  pending=(async()=>{
    try {
      // Recover previous runs only once per server lifetime, before accepting work.
      await pool.query(recovered?'SELECT 1':"UPDATE workspaces SET status='interrupted' WHERE status IN ('running','waiting')");
      recovered=true;ready=true;error=null;
    } catch(e) {ready=false;error=explain(e);retryAt=Date.now()+5000;}
    return storageState();
  })();
  try{return await pending;}finally{pending=null;}
}
export async function query(sql,...args) {
  await initializeStorage();
  if(!ready) throw new Error(storageState().error||'Supabase à configurer : renseignez DATABASE_URL côté serveur.');
  let n=0;const statement=sql.replace(/\?/g,()=>`$${++n}`);
  try{return await pool.query(statement,args);}catch(e){ready=false;error=explain(e);retryAt=Date.now()+5000;throw new Error(error);}
}
export async function all(sql,...args){return (await query(sql,...args)).rows;}
export async function one(sql,...args){return (await all(sql,...args))[0];}
export async function closeStorage(){await pool?.end();}
