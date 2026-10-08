import http from 'node:http';
import { configured, query, all, one, closeStorage } from './storage.mjs';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Codex } from './codex.mjs';
import { codexCommand } from './codex-command.mjs';
import { snapshot, commitSelected, publish, pullRequestStatus } from './delivery.mjs';
const exec = promisify(execFile), root = resolve(process.env.LEW_DATA_DIR || '.lew');
mkdirSync(root, { recursive: true });
if(configured) await query("UPDATE workspaces SET status='interrupted' WHERE status IN ('running','waiting')");
const workers = new Map(), locks = new Set(), approvals = new Map();
const event = async (id, kind, data) => query('INSERT INTO events(workspace_id,kind,data) VALUES(?,?,?)',id,kind,JSON.stringify(data));
async function workspace(id) { const w = await one('SELECT * FROM workspaces WHERE id=?', id); if (!w) throw new Error('Espace introuvable'); return w; }
async function status(id, value) { await query('UPDATE workspaces SET status=? WHERE id=?',value,id); }
async function git(cwd, args) { return (await exec('git', args, { cwd, timeout: 120000, maxBuffer: 2e6 })).stdout; }
async function github(repo, endpoint) {
  const r = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, { headers: { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`} : {}) }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`GitHub : HTTP ${r.status}`); return r.json();
}
async function worker(w) {
  if (workers.has(w.id)) return workers.get(w.id);
  let eventQueue=Promise.resolve();
  const c = new Codex(m => {
    const handle = async () => {
    await event(w.id,'codex',m);
    if (m.method === 'turn/completed') { for(const key of approvals.keys()) if(key.startsWith(w.id+':')) approvals.delete(key); }
    if (m.method === 'turn/completed') await status(w.id, m.params.turn.status === 'completed' ? 'completed' : m.params.turn.status === 'interrupted' ? 'interrupted' : 'failed');
    if (m.method === 'lew/workerError') {
      const current=await workspace(w.id);
      if(['running','waiting'].includes(current.status)) await status(w.id,'failed');
      if(workers.get(w.id)===c) workers.delete(w.id);
    }
    if (m.id !== undefined && m.method) {
      if (m.method === 'item/commandExecution/requestApproval' || m.method === 'item/fileChange/requestApproval') {
        approvals.set(`${w.id}:${m.id}`, m); await status(w.id,'waiting');
      } else c.send({id:m.id,error:{code:-32601,message:'Cette interaction n’est pas encore prise en charge par lew.'}});
    }
    };
    eventQueue=eventQueue.then(handle).catch(e => { console.error('Worker event persistence failed:', e.message); c.close(); });
  });
  try {
    await c.initialize();
    const thread = await c.request(w.thread_id ? 'thread/resume' : 'thread/start', {
      ...(w.thread_id ? {threadId:w.thread_id} : {}), cwd:w.cwd, approvalPolicy:'on-request', sandbox:'workspace-write'
    });
    await query('UPDATE workspaces SET thread_id=? WHERE id=?',thread.thread.id,w.id);
    workers.set(w.id,c); return c;
  } catch(e) { c.close(); throw new Error(`Codex indisponible : ${e.message}. Installez Codex et connectez votre compte sur le worker.`); }
}
async function body(req) { let s=''; for await (const part of req) { s += part; if(s.length>100000) throw new Error('Requête trop longue'); } return JSON.parse(s || '{}'); }
function text(value, max=200) { if(typeof value !== 'string' || !value.trim() || value.length>max) throw new Error('Champ invalide'); return value.trim(); }
let authClient, authPromise, authNotice = null, pendingLogin = null;
async function authWorker() {
  if(authClient && !authClient.dead) return authClient;
  if(authPromise) return authPromise;
  authPromise = (async()=>{
    const c=new Codex(m=>{
      if(m.method==='account/login/completed') {authNotice=m.params;pendingLogin=null;}
      if(m.method==='lew/workerError') authClient=null;
      if(m.id!==undefined && m.method) c.send({id:m.id,error:{code:-32601,message:'Interaction non prise en charge'}});
    });
    try {await c.initialize();authClient=c;return c;} catch(e){c.close();throw new Error('Codex non installé ou indisponible sur le worker.');}
  })();
  try {return await authPromise;} finally {authPromise=null;}
}
async function codexAvailable(){try{const command=codexCommand();await exec(command.file,[...command.args,'--version'],{timeout:5000});return true;}catch{return false;}}
async function api(req, path) {
  if(path==='/api/auth/status' && req.method==='GET') {
    try {const c=await authWorker(); const info=await c.request('account/read',{refreshToken:false});return {...info,available:true,notice:authNotice,pendingLogin};}
    catch(e){return {available:false,account:null,error:e.message};}
  }
  if(path==='/api/auth/login' && req.method==='POST') {
    if([...locks].length || (configured && (await all("SELECT id FROM workspaces WHERE status IN ('running','waiting')")).length)) throw new Error('Attendez la fin des exécutions avant de changer de compte.');
    if(locks.has('auth')) throw new Error('Connexion déjà en cours');
    const c=await authWorker(); if(pendingLogin) return pendingLogin;
    if(locks.has('auth')) throw new Error('Connexion déjà en cours');
    locks.add('auth');
    try {for(const instance of workers.values())instance.close();workers.clear();authNotice=null;pendingLogin=await c.request('account/login/start',{type:'chatgptDeviceCode'});return pendingLogin;} finally {locks.delete('auth');}
  }
  if(path==='/api/auth/cancel' && req.method==='POST') {
    if(pendingLogin){await (await authWorker()).request('account/login/cancel',{loginId:pendingLogin.loginId});pendingLogin=null;}return {ok:true};
  }
  if(path==='/api/auth/logout' && req.method==='POST') {
    if(configured && (await all("SELECT id FROM workspaces WHERE status IN ('running','waiting')")).length) throw new Error('Interrompez les tâches avant de vous déconnecter.');
    await (await authWorker()).request('account/logout');for(const c of workers.values())c.close();workers.clear();authNotice=null;return {ok:true};
  }
  if(req.method==='GET' && path==='/api/state') return {projects:configured ? await all('SELECT * FROM projects') : [],workspaces:configured ? await all('SELECT * FROM workspaces') : [],storage:{configured,provider:'supabase',project:'Linkedin-Prospection',schema:'lew'},worker: {available:await codexAvailable()}, authenticatedRemote:!!process.env.LEW_ACCESS_TOKEN};
  if(req.method==='POST' && path==='/api/projects') {
    const b=await body(req), id=randomUUID(), name=text(b.name), repo=text(b.repo);
    if(!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Utilisez owner/repo');
    await query('INSERT INTO projects VALUES(?,?,?,?)',id,name,repo,String(b.context||'').slice(0,10000)); return {id};
  }
  const contextMatch=path.match(/^\/api\/projects\/([^/]+)\/context$/);
  if(contextMatch&&req.method==='POST'){const b=await body(req);if(typeof b.context!=='string'||b.context.length>10000)throw new Error('Contexte trop long');await query('UPDATE projects SET context=? WHERE id=?',b.context,contextMatch[1]);return {ok:true};}
  const match=path.match(/^\/api\/projects\/([^/]+)\/github$/);
  if(match && req.method==='GET') {
    const p=await one('SELECT * FROM projects WHERE id=?',match[1]); if(!p) throw new Error('Projet introuvable');
    const [branches,prs]=await Promise.all([github(p.repo,'branches?per_page=100'),github(p.repo,'pulls?state=open&per_page=100')]);
    return {branches:branches.map(x=>({name:x.name})),prs:prs.map(x=>({number:x.number,title:x.title,url:x.html_url,branch:x.head.ref,draft:x.draft}))};
  }
  if(req.method==='POST' && path==='/api/workspaces') {
    const b=await body(req), p=await one('SELECT * FROM projects WHERE id=?',b.projectId); if(!p) throw new Error('Projet introuvable');
    const title=text(b.title), base=text(b.base||'main'); if(!/^[\w./-]+$/.test(base)||base.startsWith('-')||base.includes('..')) throw new Error('Branche invalide');
    if(locks.has(p.id)) throw new Error('Une préparation est déjà en cours sur ce repo'); locks.add(p.id);
    try {
      const id=randomUUID(), repoDir=join(root,'repos',p.id), cwd=join(root,'workspaces',id), branch=`lew/${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,45)}-${id.slice(0,6)}`;
      mkdirSync(join(root,'repos'),{recursive:true}); mkdirSync(join(root,'workspaces'),{recursive:true});
      if(!existsSync(repoDir)) await exec('git',['clone',`https://github.com/${p.repo}.git`,repoDir],{timeout:120000});
      await git(repoDir,['fetch','origin']); await git(repoDir,['worktree','add','-b',branch,cwd,`origin/${base}`]);
      await query('INSERT INTO workspaces VALUES(?,?,?,?,?,?,?)',id,p.id,title,branch,cwd,null,'idle');
      await event(id,'system',{text:'Espace de travail prêt. Branche isolée créée.'}); return {id};
    } finally {locks.delete(p.id);}
  }
  const m=path.match(/^\/api\/workspaces\/([^/]+)\/(events|diff|message|interrupt|approval|delivery|commit|publish|pr)$/);
  if(m) {
    const w=await workspace(m[1]), action=m[2];
    if(req.method==='GET'&&action==='delivery') return snapshot(w.cwd);
    if(req.method==='GET'&&action==='pr'){const p=await one('SELECT * FROM projects WHERE id=?',w.project_id);return pullRequestStatus(p.repo,w.branch);}
    if(req.method==='POST'&&['commit','publish'].includes(action)){
      if(locks.has(w.id)||['running','waiting'].includes(w.status))throw new Error('Interrompez ou terminez l’agent avant de livrer cette tâche.');
      locks.add(w.id);
      try{const b=await body(req);if(action==='commit'){const sha=await commitSelected(w.cwd,b,w.branch);await event(w.id,'delivery',{text:'Commit créé',sha});return {sha};}
        const p=await one('SELECT * FROM projects WHERE id=?',w.project_id);
        const result=await publish(w.cwd,p.repo,w.branch,b);await event(w.id,'delivery',{text:'Pull request publiée',...result});return result;
      }finally{locks.delete(w.id);}
    }
    if(req.method==='GET'&&action==='events') return await all('SELECT * FROM events WHERE workspace_id=? ORDER BY id',w.id);
    if(req.method==='GET'&&action==='diff') return {diff:await git(w.cwd,['diff','HEAD']),status:await git(w.cwd,['status','--short']),branch:await git(w.cwd,['branch','--show-current'])};
    if(req.method==='POST'&&action==='message') {
      const b=await body(req), message=text(b.message,20000);
      if(locks.has(w.id)||['running','waiting'].includes(w.status)) throw new Error('Cette tâche travaille déjà. Interrompez-la avant une nouvelle instruction.');
      locks.add(w.id);
      try {
        const auth=await (await authWorker()).request('account/read',{refreshToken:false});
        if(auth.requiresOpenaiAuth && !auth.account) throw new Error('Connectez votre compte Codex avant de lancer une tâche.');
        const c=await worker(w), fresh=await workspace(w.id), p=await one('SELECT * FROM projects WHERE id=?',w.project_id);
        await event(w.id,'user',{text:message}); await status(w.id,'running');
        const turn=await c.request('turn/start',{threadId:fresh.thread_id,input:[{type:'text',text:`Contexte du projet ${p.name}:\n${p.context}\n\nTâche: ${w.title}\nBranche: ${w.branch}\n\n${message}`}]});
        await event(w.id,'turn',{id:turn.turn.id}); return {ok:true};
      } catch(e) {workers.get(w.id)?.close();workers.delete(w.id);await status(w.id,'failed');await event(w.id,'error',{text:e.message});throw e;} finally {locks.delete(w.id);}
    }
    if(req.method==='POST'&&action==='interrupt') {
      const c=workers.get(w.id), turns=await all("SELECT data FROM events WHERE workspace_id=? AND kind='turn' ORDER BY id DESC LIMIT 1",w.id);
      if(!c||!turns.length) throw new Error('Aucune exécution active');
      await c.request('turn/interrupt',{threadId:w.thread_id,turnId:turns[0].data.id}); return {ok:true};
    }
    if(req.method==='POST'&&action==='approval') {
      const b=await body(req), key=`${w.id}:${b.id}`, a=approvals.get(key), c=workers.get(w.id); if(!a||!c) throw new Error('Validation expirée');
      approvals.delete(key);await status(w.id,'running');c.send({id:a.id,result:{decision:b.accept===true?'accept':'decline'}});await event(w.id,'approval',{id:a.id,accepted:b.accept===true});return {ok:true};
    }
  }
  throw new Error('Route inconnue');
}
const server=http.createServer(async(req,res)=>{
  if(!process.env.LEW_ACCESS_TOKEN && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host||'')){res.writeHead(403);return res.end();}
  const origin=req.headers.origin, expected=`http://${req.headers.host}`;
  const url=new URL(req.url,expected);
  if(req.method!=='GET' && origin && origin!==expected && origin!==`https://${req.headers.host}`) {res.writeHead(403);return res.end();}
  if(url.pathname.startsWith('/api/')) {
    if(process.env.LEW_ACCESS_TOKEN) {
      const supplied=Buffer.from(req.headers.authorization?.replace(/^Bearer /,'')||''), actual=Buffer.from(process.env.LEW_ACCESS_TOKEN);
      if(supplied.length!==actual.length||!timingSafeEqual(supplied,actual)){res.writeHead(401,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Connexion requise'}));}
    }
    try { const result=await api(req,url.pathname);res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result)); }
    catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}return;
  }
  const allowed={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/manifest.json':'manifest.json','/icon.svg':'icon.svg','/wallpaper.svg':'wallpaper.svg'};
  if(!allowed[url.pathname]) {res.writeHead(404);return res.end();}
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'");
  res.setHeader('Content-Type',url.pathname.endsWith('.js')?'text/javascript':url.pathname.endsWith('.css')?'text/css':url.pathname.endsWith('.svg')?'image/svg+xml':url.pathname.endsWith('.json')?'application/json':'text/html');
  res.end(readFileSync(new URL(`./public/${allowed[url.pathname]}`,import.meta.url)));
});
const host=process.env.LEW_HOST||'127.0.0.1';
if(host!=='127.0.0.1'&&host!=='localhost'&&!process.env.LEW_ACCESS_TOKEN) throw new Error('LEW_ACCESS_TOKEN est requis pour une écoute distante');
server.listen(Number(process.env.PORT||3000),host,()=>console.log(`lew · http://${host}:${server.address().port}`));
process.on('SIGTERM',()=>{authClient?.close();for(const c of workers.values())c.close();server.close(async()=>{await closeStorage();process.exit();});});
