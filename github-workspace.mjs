import { github } from './delivery.mjs';
export function validRepo(repo){if(typeof repo!=='string'||! /^[\w.-]+\/[\w.-]+$/.test(repo))throw new Error('Repo GitHub invalide.');return repo;}
export function validPage(value){const page=Number(value||1);if(!Number.isInteger(page)||page<1||page>100)throw new Error('Page invalide.');return page;}
export function normalizeRepo(r){return {repo:r.full_name,name:r.name,description:r.description||'',private:!!r.private,archived:!!r.archived,defaultBranch:r.default_branch,updatedAt:r.updated_at,url:r.html_url};}
export async function listRepositories({page=1,owner=process.env.GITHUB_USER||'hemvall'}={},request=fetch){
  page=validPage(page);
  if(!/^[\w-]+$/.test(owner))throw new Error('Compte GitHub invalide.');
  const authenticated=!!process.env.GITHUB_TOKEN;
  const path=authenticated?`user/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=100&page=${page}`:`users/${owner}/repos?sort=updated&per_page=100&page=${page}`;
  const response=await request(`https://api.github.com/${path}`,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(authenticated?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`}:{})},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`GitHub : HTTP ${response.status}. ${authenticated?'Vérifiez les droits du token.':'Configurez GITHUB_TOKEN pour vos repos privés, ou vérifiez le compte public.'}`);
  const repos=await response.json();return {repos:repos.map(normalizeRepo),nextPage:repos.length===100?page+1:null,authenticated,owner:authenticated?null:owner};
}
async function pages(repo,path,request,max=30){
  const items=[];
  for(let page=1;page<=max;page++){const rows=await request(repo,`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`);items.push(...rows);if(rows.length<100)return {items,truncated:false};}
  return {items,truncated:true};
}
export async function readPullRequest(repo,number,request=github){
  validRepo(repo);if(!Number.isSafeInteger(number)||number<1)throw new Error('Numéro de PR invalide.');
  const p=await request(repo,`pulls/${number}`);
  const calls=[['files',()=>pages(repo,`pulls/${number}/files`,request)],['comments',()=>pages(repo,`issues/${number}/comments`,request,10)],['reviewComments',()=>pages(repo,`pulls/${number}/comments`,request,10)],['reviews',()=>pages(repo,`pulls/${number}/reviews`,request,10)],['checks',()=>request(repo,`commits/${p.head.sha}/check-runs?per_page=100`)],['statuses',()=>request(repo,`commits/${p.head.sha}/status?per_page=100`)]];
  const results=await Promise.allSettled(calls.map(([,call])=>call()));const data={},warnings=[];
  results.forEach((r,i)=>{const name=calls[i][0];if(r.status==='fulfilled')data[name]=r.value;else warnings.push({section:name,message:r.reason.message});});
  const {summarizeChecks}=await import('./delivery.mjs');const checks=summarizeChecks(data.checks||{},data.statuses||{});
  checks.incomplete=!data.checks||!data.statuses||(data.checks.total_count||0)>(data.checks.check_runs?.length||0);if(checks.incomplete&&checks.state!=='failure')checks.state='unknown';
  const comment=c=>({id:c.id,body:c.body||'',author:c.user?.login||'GitHub',createdAt:c.created_at||c.submitted_at,url:c.html_url,path:c.path,line:c.line||c.original_line,state:c.state});
  return {pr:{number:p.number,title:p.title,body:p.body||'',url:p.html_url,state:p.merged_at?'merged':p.state,draft:p.draft,head:p.head.ref,base:p.base.ref,sha:p.head.sha,author:p.user?.login,mergeable:p.mergeable,additions:p.additions,deletions:p.deletions,changedFiles:p.changed_files},checks,files:(data.files?.items||[]).map(f=>({path:f.filename,previousPath:f.previous_filename,status:f.status,additions:f.additions,deletions:f.deletions,patch:f.patch||null})),comments:[...(data.comments?.items||[]).map(c=>({...comment(c),type:'discussion'})),...(data.reviewComments?.items||[]).map(c=>({...comment(c),type:'inline'})),...(data.reviews?.items||[]).map(c=>({...comment(c),type:'review'}))].sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||'')),warnings,truncated:Object.fromEntries(['files','comments','reviewComments','reviews'].map(k=>[k,!!data[k]?.truncated]))};
}
export async function projectGithub(repo,request=github){
  validRepo(repo);const [metadata,branches,prs]=await Promise.all([request(repo,''),pages(repo,'branches',request,10),pages(repo,'pulls?state=open',request,10)]);
  return {defaultBranch:metadata.default_branch,branches:branches.items.map(x=>({name:x.name})),prs:prs.items.map(x=>({number:x.number,title:x.title,url:x.html_url,branch:x.head.ref,draft:x.draft})),truncated:branches.truncated||prs.truncated};
}
