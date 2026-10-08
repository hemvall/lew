import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { readFile, lstat, readlink } from 'node:fs/promises';
import { join } from 'node:path';
const exec=promisify(execFile);
export async function git(cwd,args){return (await exec('git',args,{cwd,timeout:120000,maxBuffer:8e6})).stdout;}
export async function github(repo,path='',options={}){
  if(options.method && options.method!=='GET' && !process.env.GITHUB_TOKEN) throw new Error('Configurez GITHUB_TOKEN côté worker pour créer une PR.');
  const result=await fetch(`https://api.github.com/repos/${repo}${path?'/'+path:''}`,{method:options.method||'GET',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(process.env.GITHUB_TOKEN?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`} :{}),...(options.body?{'Content-Type':'application/json'}:{})},body:options.body?JSON.stringify(options.body):undefined,signal:AbortSignal.timeout(20000)});
  if(!result.ok)throw new Error(`GitHub : HTTP ${result.status}. Vérifiez les droits du token sur ce repo.`);
  return result.json();
}
export async function snapshot(cwd){
  const [tracked,untracked,head,branch,diff]=await Promise.all([git(cwd,['diff','--name-only','HEAD','-z']),git(cwd,['ls-files','--others','--exclude-standard','-z']),git(cwd,['rev-parse','HEAD']),git(cwd,['branch','--show-current']),git(cwd,['diff','HEAD'])]);
  const paths=[...new Set((tracked+untracked).split('\0').filter(Boolean))].sort();
  const hash=createHash('sha256').update(head).update(branch);const files=[];
  for(const path of paths){hash.update('\0'+path+'\0');let state='modified',size=0;
    try{const info=await lstat(join(cwd,path));size=info.size;hash.update(String(info.mode));
      if(info.isSymbolicLink())hash.update(await readlink(join(cwd,path)));else if(info.isFile())hash.update(await readFile(join(cwd,path)));else hash.update('directory');
    }catch(e){if(e.code!=='ENOENT')throw e;state='deleted';hash.update('deleted');}
    files.push({path,state:untracked.split('\0').includes(path)?'new':state,size,selectable:!/(^|\/)\.env($|\.(?!example$))/.test(path)});
  }
  return {fingerprint:hash.digest('hex'),head:head.trim(),branch:branch.trim(),diff,files};
}
export async function commitSelected(cwd,{fingerprint,files,message},expectedBranch){
  const current=await snapshot(cwd);
  if(current.branch!==expectedBranch)throw new Error('La branche de cet espace a changé. Actualisez avant de livrer.');
  if(current.fingerprint!==fingerprint)throw new Error('Les fichiers ont changé depuis votre revue. Actualisez les changements.');
  const allowed=new Set(current.files.filter(f=>f.selectable).map(f=>f.path));
  if(!Array.isArray(files)||!files.length||files.some(p=>typeof p!=='string'||!allowed.has(p)))throw new Error('Sélection de fichiers invalide.');
  if(typeof message!=='string'||!message.trim()||message.length>500)throw new Error('Message de commit requis (500 caractères maximum).');
  await git(cwd,['add','--',...files]);
  await git(cwd,['commit','--only','-m',message.trim(),'--',...files]);
  return (await git(cwd,['rev-parse','HEAD'])).trim();
}
export function summarizeChecks(checks,status){
  const items=[...(checks.check_runs||[]).map(c=>({name:c.name,state:c.status==='completed'?c.conclusion:c.status,url:c.html_url})),...(status.statuses||[]).map(c=>({name:c.context,state:c.state,url:c.target_url}))];
  return {state:!items.length?'none':items.some(c=>['failure','error','cancelled','timed_out','action_required','startup_failure','stale'].includes(c.state))?'failure':items.every(c=>['success','neutral','skipped'].includes(c.state))?'success':'pending',items};
}
export async function pullRequestStatus(repo,branch,request=github){
  const prs=await request(repo,`pulls?state=all&head=${encodeURIComponent(repo.split('/')[0]+':'+branch)}&per_page=100`);
  const pr=prs.find(p=>p.state==='open')||prs[0];if(!pr)return {pr:null,checks:{state:'none',items:[]}};
  const results=await Promise.allSettled([request(repo,`commits/${pr.head.sha}/check-runs?per_page=100`),request(repo,`commits/${pr.head.sha}/status`)]);
  const checks=summarizeChecks(results[0].status==='fulfilled'?results[0].value:{},results[1].status==='fulfilled'?results[1].value:{});
  const incomplete=results.some(r=>r.status==='rejected');
  if(incomplete&&checks.state!=='failure')checks.state='unknown';
  return {pr:{number:pr.number,title:pr.title,url:pr.html_url,state:pr.merged_at?'merged':pr.state,draft:pr.draft,sha:pr.head.sha,base:pr.base.ref},checks:{...checks,incomplete}};
}
export async function publish(cwd,repo,branch,{title,body,base='main',draft=true,head},request=github){
  if(request===github&&!process.env.GITHUB_TOKEN)throw new Error('Configurez GITHUB_TOKEN sur le worker avant de publier.');
  if(head && (await git(cwd,['rev-parse','HEAD'])).trim()!==head)throw new Error('Les commits ont changé. Actualisez avant de publier.');
  if((await git(cwd,['branch','--show-current'])).trim()!==branch)throw new Error('La branche de travail a changé.');
  if(typeof title!=='string'||!title.trim()||title.length>200||typeof body!=='string'||body.length>30000)throw new Error('Titre ou description invalide.');
  if(!/^[\w./-]+$/.test(base)||base.startsWith('-')||base.includes('..')||base===branch)throw new Error('Branche cible invalide.');
  // Non-forced pushes fail cleanly if another machine has advanced the branch.
  await git(cwd,['push','--set-upstream','origin',`HEAD:refs/heads/${branch}`]);
  const existing=await request(repo,`pulls?state=open&head=${encodeURIComponent(repo.split('/')[0]+':'+branch)}`);
  if(existing.length)return {number:existing[0].number,url:existing[0].html_url,existing:true};
  const pr=await request(repo,'pulls',{method:'POST',body:{title:title.trim(),body,head:branch,base,draft:!!draft}});
  return {number:pr.number,url:pr.html_url,existing:false};
}
