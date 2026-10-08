import pg from 'pg';
import { readFileSync } from 'node:fs';
export const configured = !!process.env.DATABASE_URL;
// Use the Supabase session pooler URL and its downloaded CA certificate in production.
const connection = configured ? new URL(process.env.DATABASE_URL) : null;
// Explicit TLS settings below must not be overwritten by sslmode query parameters.
for(const key of ['sslmode','sslcert','sslkey','sslrootcert']) connection?.searchParams.delete(key);
const pool = configured ? new pg.Pool({
  connectionString: connection.toString(),
  ssl: { rejectUnauthorized: true, ...(process.env.SUPABASE_CA_FILE ? {ca:readFileSync(process.env.SUPABASE_CA_FILE,'utf8')} : {}) },
  max: 5, connectionTimeoutMillis: 10000,
  options: '-c search_path=lew,pg_catalog'
}) : null;
export async function query(sql, ...args) {
  if(!pool) throw new Error('Supabase à configurer : renseignez DATABASE_URL côté serveur.');
  let n=0; const statement=sql.replace(/\?/g,()=>`$${++n}`);
  return pool.query(statement,args);
}
export async function all(sql,...args) { return (await query(sql,...args)).rows; }
export async function one(sql,...args) { return (await all(sql,...args))[0]; }
export async function closeStorage() { await pool?.end(); }
