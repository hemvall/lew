import {turnPermissions,approvalDecision,pendingApprovals,autonomyInstructions} from './approval-policy.mjs';
import { missionRoutes } from './mission-routes.mjs';
import { missionContext } from './mission-context.mjs';
import { attentionItems } from './public/attention-model.js';
import http from 'node:http';
import { selectRoute } from './model-routing.mjs';
import { configured, query, all, one, closeStorage, initializeStorage, storageState } from './storage.mjs';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Codex } from './codex.mjs';
import { codexCommand } from './codex-command.mjs';
import { snapshot, commitSelected, publish, pullRequestStatus, github as repoRequest } from './delivery.mjs';
import { readUsage } from './codex-usage.mjs';
import { streamEvents, eventCursor } from './event-stream.mjs';
import { listRepositories, readPullRequest, normalizeRepo, validRepo, projectGithub } from './github-workspace.mjs';
const exec = promisify(execFile), root = resolve(process.env.LEW_DATA_DIR || '.lew');
mkdirSync(root, { recursive: true });

const workers = new Map(), locks = new Set(), approvals = new Map(), streams=new Set();
const event = async (id, kind, data) => query('INSERT INTO lew.events(workspace_id,kind,data) VALUES(?,?,?)',id,kind,JSON.stringify(data));
async function workspace(id) { const w = await one('SELECT * FROM lew.workspaces WHERE id=?', id); if (!w) throw new Error('Espace introuvable'); return w; }
async function status(id, value) { await query('UPDATE lew.workspaces SET status=? WHERE id=?',value,id); }
async function git(cwd, args) { return (await exec('git', args, { cwd, timeout: 120000, maxBuffer: 2e6 })).stdout; }
async function worker(w) {
  if (workers.has(w.id)) return workers.get(w.id);
  let eventQueue=Promise.resolve();
  const c = new Codex(m => {
    const handle = async () => {
    await event(w.id,'codex',m);
    if(m.method==='serverRequest/resolved')approvals.delete(`${w.id}:${m.params.requestId}`);
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
    await query('UPDATE lew.workspaces SET thread_id=? WHERE id=?',thread.thread.id,w.id);
    c.workspaceThread=thread.thread.id;workers.set(w.id,c); return c;
  } catch(e) { c.close(); throw new Error(`Codex indisponible : ${e.message}. Installez Codex et connectez votre compte sur le worker.`); }
}
async function body(req) { let s=''; for await (const part of req) { s += part; if(Buffer.byteLength(s)>600000) throw new Error('Requête trop longue'); } return JSON.parse(s || '{}'); }
function text(value, max=200) { if(typeof value !== 'string' || !value.trim() || value.length>max) throw new Error('Champ invalide'); return value.trim(); }
let usageCache=null,usagePromise;
let authClient, authPromise, authNotice = null, pendingLogin = null;
async function authWorker() {
  if(authClient && !authClient.dead) return authClient;
  if(authPromise) return authPromise;
  authPromise = (async()=>{
    const c=new Codex(m=>{
      if(['account/updated','account/rateLimits/updated','account/login/completed'].includes(m.method))usageCache=null;
      if(m.method==='account/login/completed') {authNotice=m.params;pendingLogin=null;}
      if(m.method==='lew/workerError') authClient=null;
      if(m.id!==undefined && m.method) c.send({id:m.id,error:{code:-32601,message:'Interaction non prise en charge'}});
    });
    try {await c.initialize();authClient=c;return c;} catch(e){c.close();throw new Error('Codex non installé ou indisponible sur le worker.');}
  })();
  try {return await authPromise;} finally {authPromise=null;}
}
const missions=missionRoutes({root,query,all,one,body,authWorker,event,workers,approvals,storageState});
async function codexAvailable(){try{const command=codexCommand();await exec(command.file,[...command.args,'--version'],{timeout:5000});return true;}catch{return false;}}
async function api(req, path, params=new URLSearchParams()) {
  const missionResult=await missions.route(req,path);if(missionResult!==null)return missionResult;
  if(path==='/api/auth/usage'&&req.method==='GET'){
    if(params.get('refresh')!=='1'&&usageCache&&Date.now()-usageCache.at<45000)return usageCache.data;
    if(!usagePromise)usagePromise=(async()=>{
      let data;try{data=await readUsage(await authWorker());}catch{data={available:false,account:null,limits:[],errors:[{section:'account',message:'Codex est indisponible sur ce PC.'}],updatedAt:new Date().toISOString()};}
      usageCache={at:Date.now(),data};return data;
    })().finally(()=>{usagePromise=null;});
    return usagePromise;
  }
  if(path==='/api/auth/status' && req.method==='GET') {
    try {const c=await authWorker(); const info=await c.request('account/read',{refreshToken:false});return {...info,available:true,notice:authNotice,pendingLogin};}
    catch(e){return {available:false,account:null,error:e.message};}
  }
  if(path==='/api/auth/login' && req.method==='POST') {
    if([...locks].length || (configured && (await all("SELECT id FROM lew.workspaces WHERE status IN ('running','waiting')")).length)) throw new Error('Attendez la fin des exécutions avant de changer de compte.');
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
    if(configured && (await all("SELECT id FROM lew.workspaces WHERE status IN ('running','waiting')")).length) throw new Error('Interrompez les tâches avant de vous déconnecter.');
    await (await authWorker()).request('account/logout');usageCache=null;for(const c of workers.values())c.close();workers.clear();authNotice=null;return {ok:true};
  }
  if(req.method==='GET' && path==='/api/state') {
    await initializeStorage();
    let projects=[],workspaces=[],attention={items:[],complete:false},catalog={projectsComplete:false,workspacesComplete:false,complete:false};
    if(storageState().ready) {
      const results=await Promise.allSettled([
        all('SELECT * FROM lew.projects'),
        // Both probes use events(workspace_id,id), including a backward scan for the latest event.
        all(`SELECT w.*,e.data->'profile' AS agent_profile,e.mission_id,
          (SELECT created FROM lew.events WHERE workspace_id=w.id ORDER BY id ASC LIMIT 1) AS created,
          (SELECT created FROM lew.events WHERE workspace_id=w.id ORDER BY id DESC LIMIT 1) AS updated
          FROM lew.workspaces w LEFT JOIN lew.mission_executions e ON e.workspace_id=w.id`),
        all('SELECT data FROM lew.missions ORDER BY created DESC')
      ]);
      if(results[0].status==='fulfilled')projects=results[0].value;
      if(results[1].status==='fulfilled')workspaces=results[1].value;
      catalog={projectsComplete:results[0].status==='fulfilled',workspacesComplete:results[1].status==='fulfilled',complete:results.slice(0,2).every(r=>r.status==='fulfilled')};
      const missionList=results[2].status==='fulfilled'?results[2].value.map(r=>r.data):[];
      workspaces=workspaces.map(w=>({...w,mission_context:missionContext(w,missionList)}));
      attention={items:attentionItems({projects,workspaces,missions:missionList,pendingWorkspaceIds:[...approvals.keys()].map(key=>key.slice(0,key.indexOf(':')))}),complete:results.every(r=>r.status==='fulfilled')};
      if(!attention.complete)attention.error='Certaines décisions n’ont pas pu être chargées. Réessayez l’actualisation.';
    }
    return {projects,workspaces,attention,catalog,pendingApprovals:pendingApprovals(approvals,workspaces),storage:storageState(),worker:{available:await codexAvailable()},authenticatedRemote:!!process.env.LEW_ACCESS_TOKEN};
  }
  if(req.method==='GET'&&path==='/api/github/repos')return listRepositories({page:params.get('page')||1,owner:params.get('owner')||process.env.GITHUB_USER||'hemvall'});
  if(req.method==='POST'&&path==='/api/github/import'){
    const b=await body(req),repo=validRepo(b.repo),key=`import:${repo.toLowerCase()}`;
    if(locks.has(key))throw new Error('Import déjà en cours.');locks.add(key);
    try {
      const existing=await one('SELECT id FROM lew.projects WHERE lower(repo)=lower(?)',repo);if(existing)return {...existing,existing:true};
      const r=normalizeRepo(await repoRequest(repo,''));if(r.archived)throw new Error('Ce repo est archivé.');
      const id=randomUUID();await query('INSERT INTO lew.projects(id,name,repo,context,last_opened) VALUES(?,?,?,?,now())',id,r.name,r.repo,'');return {id};
    }finally{locks.delete(key);}
  }
  const preference=path.match(/^\/api\/projects\/([^/]+)\/(favorite|visit)$/);
  if(preference&&req.method==='POST'){
    if(preference[2]==='favorite'){const b=await body(req);if(typeof b.favorite!=='boolean')throw new Error('Favori invalide.');await query('UPDATE lew.projects SET favorite=? WHERE id=?',b.favorite,preference[1]);}
    else await query('UPDATE lew.projects SET last_opened=now() WHERE id=?',preference[1]);return {ok:true};
  }
  const review=path.match(/^\/api\/projects\/([^/]+)\/prs\/(\d+)$/);
  if(review&&req.method==='GET'){const p=await one('SELECT * FROM lew.projects WHERE id=?',review[1]);if(!p)throw new Error('Projet introuvable');return readPullRequest(p.repo,Number(review[2]));}
  if(req.method==='POST' && path==='/api/projects') {
    const b=await body(req), id=randomUUID(), name=text(b.name), repo=text(b.repo);
    if(!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Utilisez owner/repo');
    await query('INSERT INTO lew.projects(id,name,repo,context) VALUES(?,?,?,?)',id,name,repo,String(b.context||'').slice(0,10000)); return {id};
  }
  const contextMatch=path.match(/^\/api\/projects\/([^/]+)\/context$/);
  if(contextMatch&&req.method==='POST'){const b=await body(req);if(typeof b.context!=='string'||b.context.length>10000)throw new Error('Contexte trop long');await query('UPDATE lew.projects SET context=? WHERE id=?',b.context,contextMatch[1]);return {ok:true};}
  const match=path.match(/^\/api\/projects\/([^/]+)\/github$/);
  if(match && req.method==='GET') {
    const p=await one('SELECT * FROM lew.projects WHERE id=?',match[1]); if(!p) throw new Error('Projet introuvable');
    return projectGithub(p.repo);
  }
  if(req.method==='POST' && path==='/api/workspaces') {
    const b=await body(req), p=await one('SELECT * FROM lew.projects WHERE id=?',b.projectId); if(!p) throw new Error('Projet introuvable');
    const title=text(b.title), base=text(b.base||'main'); if(!/^[\w./-]+$/.test(base)||base.startsWith('-')||base.includes('..')) throw new Error('Branche invalide');
    if(locks.has(p.id)) throw new Error('Une préparation est déjà en cours sur ce repo'); locks.add(p.id);
    try {
      const id=randomUUID(), repoDir=join(root,'repos',p.id), cwd=join(root,'workspaces',id), branch=`lew/${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,45)}-${id.slice(0,6)}`;
      mkdirSync(join(root,'repos'),{recursive:true}); mkdirSync(join(root,'workspaces'),{recursive:true});
      if(!existsSync(repoDir)) await exec('git',['clone',`https://github.com/${p.repo}.git`,repoDir],{timeout:120000});
      await git(repoDir,['fetch','origin']); await git(repoDir,['worktree','add','-b',branch,cwd,`origin/${base}`]);
      await query('INSERT INTO lew.workspaces VALUES(?,?,?,?,?,?,?)',id,p.id,title,branch,cwd,null,'idle');
      await event(id,'system',{text:'Espace de travail prêt. Branche isolée créée.'}); return {id};
    } finally {locks.delete(p.id);}
  }
  const m=path.match(/^\/api\/workspaces\/([^/]+)\/(events|diff|message|interrupt|approval|delivery|commit|publish|pr)$/);
  if(m) {
    const w=await workspace(m[1]), action=m[2];
    const managed=await one('SELECT m.data FROM lew.mission_executions e JOIN lew.missions m ON m.id=e.mission_id WHERE e.workspace_id=?',w.id);
    if(managed&&req.method==='POST'&&['message','commit','publish'].includes(action))throw new Error('Cet espace appartient à une mission. Utilisez les actions de la mission.');
    if(req.method==='GET'&&action==='delivery') return snapshot(w.cwd);
    if(req.method==='GET'&&action==='pr'){const p=await one('SELECT * FROM lew.projects WHERE id=?',w.project_id);return pullRequestStatus(p.repo,w.branch);}
    if(req.method==='POST'&&['commit','publish'].includes(action)){
      if(locks.has(w.id)||['running','waiting'].includes(w.status))throw new Error('Interrompez ou terminez l’agent avant de livrer cette tâche.');
      locks.add(w.id);
      try{const b=await body(req);if(action==='commit'){const sha=await commitSelected(w.cwd,b,w.branch);await event(w.id,'delivery',{text:'Commit créé',sha});return {sha};}
        const p=await one('SELECT * FROM lew.projects WHERE id=?',w.project_id);
        const result=await publish(w.cwd,p.repo,w.branch,b);await event(w.id,'delivery',{text:'Pull request publiée',...result});return result;
      }finally{locks.delete(w.id);}
    }
    if(req.method==='GET'&&action==='events') return {events:await all('SELECT * FROM lew.events WHERE workspace_id=? ORDER BY id',w.id),pendingIds:[...approvals.keys()].filter(k=>k.startsWith(w.id+':')).map(k=>k.slice(w.id.length+1))};
    if(req.method==='GET'&&action==='diff') return {...await snapshot(w.cwd),status:await git(w.cwd,['status','--short'])};
    if(req.method==='POST'&&action==='message') {
      const b=await body(req), message=text(b.message,20000);
      if(locks.has(w.id)||['running','waiting'].includes(w.status)) throw new Error('Cette tâche travaille déjà. Interrompez-la avant une nouvelle instruction.');
      locks.add(w.id);
      try {
        if((await git(w.cwd,['branch','--show-current'])).trim()!==w.branch)throw new Error('La branche de cet espace a changé sur le PC. Rétablissez la branche attendue avant de lancer Codex.');
        const auth=await (await authWorker()).request('account/read',{refreshToken:false});
        if(auth.requiresOpenaiAuth && !auth.account) throw new Error('Connectez votre compte Codex avant de lancer une tâche.');
        const c=await worker(w), fresh=await workspace(w.id), p=await one('SELECT * FROM lew.projects WHERE id=?',w.project_id);
        const catalog=await c.request('model/list',{limit:100});
        const routing=selectRoute(catalog.data||catalog.models||[],message);
        await event(w.id,'routing',routing);
        await event(w.id,'user',{text:message}); await status(w.id,'running');
        const turn=await c.request('turn/start',{threadId:fresh.thread_id,...turnPermissions(w.cwd),model:routing.model,effort:routing.effort,input:[{type:'text',text:`${autonomyInstructions}\n\nContexte du projet ${p.name}:\n${p.context}\n\nTâche: ${w.title}\nBranche: ${w.branch}\n\n${message}`}]});
        await event(w.id,'turn',{id:turn.turn.id}); return {ok:true};
      } catch(e) {workers.get(w.id)?.close();workers.delete(w.id);await status(w.id,'failed');await event(w.id,'error',{text:e.message});throw e;} finally {locks.delete(w.id);}
    }
    if(req.method==='POST'&&action==='interrupt') {
      const c=workers.get(w.id), turns=await all("SELECT data FROM lew.events WHERE workspace_id=? AND kind='turn' ORDER BY id DESC LIMIT 1",w.id);
      if(!c||!turns.length) throw new Error('Aucune exécution active');
      await c.request('turn/interrupt',{threadId:w.thread_id,turnId:turns[0].data.id}); return {ok:true};
    }
    if(req.method==='POST'&&action==='approval') {
      const b=await body(req), key=`${w.id}:${b.id}`, a=approvals.get(key), c=workers.get(w.id); if(!a||!c) throw new Error('Validation expirée');
      const decision=approvalDecision(a,b.accept===true,b.session===true);c.send({id:a.id,result:{decision}});approvals.delete(key);if(![...approvals.keys()].some(k=>k.startsWith(w.id+':')))await status(w.id,'running');await event(w.id,'approval',{id:a.id,accepted:b.accept===true,session:decision==='acceptForSession'});return {ok:true};
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
    try {
      const stream=url.pathname.match(/^\/api\/workspaces\/([^/]+)\/stream$/);
      if(stream&&req.method==='GET'){
        const w=await workspace(stream[1]),cursor=eventCursor(url.searchParams.get('after')||'0');
        streams.add(res);res.once('close',()=>streams.delete(res));
        streamEvents(res,async after=>({events:await all('SELECT * FROM lew.events WHERE workspace_id=? AND id>? ORDER BY id LIMIT 500',w.id,after),pendingIds:[...approvals.keys()].filter(k=>k.startsWith(w.id+':')).map(k=>k.slice(w.id.length+1))}),cursor);return;
      }
      const result=await api(req,url.pathname,url.searchParams);res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(result)); }
    catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}return;
  }
  const allowed={'/':'index.html','/app.js':'app.js','/icons.js':'icons.js','/workspace-model.js':'workspace-model.js','/style.css':'style.css','/manifest.json':'manifest.json','/icon.svg':'icon.svg','/wallpaper.svg':'wallpaper.svg','/mission-ui.js':'mission-ui.js','/avatar-view.js':'avatar-view.js','/vendor/avatar-runtime.js':'vendor/avatar-runtime.js','/vendor/AVATAR-LICENSE.txt':'vendor/AVATAR-LICENSE.txt','/vendor/AJV-LICENSE.txt':'vendor/AJV-LICENSE.txt','/fonts/InterVariable.woff2':'fonts/InterVariable.woff2','/fonts/INTER-LICENSE.txt':'fonts/INTER-LICENSE.txt'};
  allowed['/attention-model.js']='attention-model.js';
  allowed['/studio-ui.js']='studio-ui.js';
  allowed['/studio-visuals.js']='studio-visuals.js';
  allowed['/studio-model.js']='studio-model.js';
  allowed['/studio.css']='studio.css';
  allowed['/os-model.js']='os-model.js';
  allowed['/os-windows.js']='os-windows.js';
  allowed['/os-windows.css']='os-windows.css';
  for(const name of ['draft-store','navigation-model','resume-model','markdown','verification-model'])allowed[`/${name}.js`]=`${name}.js`;
  if(!allowed[url.pathname]) {res.writeHead(404);return res.end();}
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'");
  res.setHeader('Content-Type',url.pathname.endsWith('.woff2')?'font/woff2':url.pathname.endsWith('.txt')?'text/plain':url.pathname.endsWith('.js')?'text/javascript':url.pathname.endsWith('.css')?'text/css':url.pathname.endsWith('.svg')?'image/svg+xml':url.pathname.endsWith('.json')?'application/json':'text/html');
  res.end(readFileSync(new URL(`./public/${allowed[url.pathname]}`,import.meta.url)));
});
const host=process.env.LEW_HOST||'127.0.0.1';
if(host!=='127.0.0.1'&&host!=='localhost'&&!process.env.LEW_ACCESS_TOKEN) throw new Error('LEW_ACCESS_TOKEN est requis pour une écoute distante');
server.listen(Number(process.env.PORT||3000),host,()=>{console.log(`lew · http://${host}:${server.address().port}`);initializeStorage().then(s=>{if(s.error)console.warn(s.error);});});
process.on('SIGTERM',()=>{for(const res of streams)res.end();authClient?.close();for(const c of workers.values())c.close();server.close(async()=>{await closeStorage();process.exit();});});
