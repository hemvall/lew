import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Codex } from './codex.mjs';
import { snapshot,commitSelected,publish } from './delivery.mjs';
const exec=promisify(execFile);
const git=async(cwd,args)=>(await exec('git',args,{cwd,timeout:120000,maxBuffer:2e6})).stdout.trim();
export class MissionAdapter {
  constructor({root,query,event,workers,approvals}){Object.assign(this,{root,query,event,workers,approvals});this.preparing=new Set();}
  repo(m){return join(this.root,'repos',m.projectId);}
  async prepare(m){const repo=this.repo(m);if(this.preparing.has(repo))throw new Error('Préparation du repo déjà en cours. Réessayez la mission.');this.preparing.add(repo);try{await mkdir(join(this.root,'repos'),{recursive:true});await mkdir(join(this.root,'workspaces'),{recursive:true});if(!existsSync(repo))await exec('git',['clone',`https://github.com/${m.project.repo}.git`,repo],{timeout:120000});await git(repo,['fetch','origin']);return repo;}finally{this.preparing.delete(repo);}}
  async base(m){const repo=await this.prepare(m);m.baseHead=await git(repo,['rev-parse',`origin/${m.base}^{commit}`]);return this.isolate(m,{id:'plan'},'orchestrator',m.baseHead);}
  async baseHead(m){return m.baseHead||await git(this.repo(m),['rev-parse',`origin/${m.base}^{commit}`]);}
  async development(m,task,base){if(task.workspace&&existsSync(task.workspace.cwd))return task.workspace;const id=randomUUID(),cwd=join(this.root,'workspaces',id),branch=`lew/mission-${m.id.slice(0,6)}-${task.id}`;await git(this.repo(m),['worktree','add','-b',branch,cwd,base]);return {cwd,branch};}
  async isolate(m,task,role,head){const cwd=join(this.root,'workspaces',randomUUID());await git(this.repo(m),['worktree','add','--detach',cwd,head]);return {cwd,branch:''};}
  async workspace(m,role,task,context){const id=randomUUID(),w={id,project_id:m.projectId,title:`${m.profiles[role].name} · ${task?.title||'Plan de mission'}`,branch:context.branch||'',cwd:context.cwd,thread_id:null,status:'idle'};await this.query('INSERT INTO workspaces(id,project_id,title,branch,cwd,thread_id,status) VALUES(?,?,?,?,?,?,?)',w.id,w.project_id,w.title,w.branch,w.cwd,null,'idle');return w;}
  async snapshot(context){return snapshot(context.cwd);}
  async commit(context,task){const s=await snapshot(context.cwd);if(s.files.length)await commitSelected(context.cwd,{files:s.files.map(p=>p.path),fingerprint:s.fingerprint,message:task.title},context.branch);const result=await snapshot(context.cwd);if(result.files.length)throw new Error('Le développeur a laissé des changements non livrés.');return {...result,diff:(await git(context.cwd,['diff',task.gitBase,'HEAD'])).slice(0,100000),changedFiles:(await git(context.cwd,['diff','--name-only',task.gitBase,'HEAD'])).split('\n').filter(Boolean)};}
  async publish(m){const task=m.tasks.at(-1);if(!task?.result||!task.workspace)throw new Error('Livraison absente.');const current=await snapshot(task.workspace.cwd);if(current.head!==task.result.head||current.fingerprint!==task.result.fingerprint)throw new Error('Les fichiers ont changé. Revue et validation invalidées.');return publish(task.workspace.cwd,m.project.repo,task.workspace.branch,{title:m.objective.slice(0,200),body:`Mission Lew\n\n${m.criteria}\n\n${task.result.summary}\n\nValidation : ${task.validation?.summary||''}`,base:m.base,draft:true,head:task.result.head});}
  async interrupt(id){const c=this.workers.get(id);if(c?.missionTurn)await c.request('turn/interrupt',c.missionTurn);}
  async execute(w,profile,prompt,outputSchema,deadline,canRun=async()=>true){
    let c,resolveDone,rejectDone,timer,finished=false,queue=Promise.resolve();const commands=[];let text='';
    const done=new Promise((resolve,reject)=>{resolveDone=resolve;rejectDone=reject;});done.catch(()=>{});
    const finish=(error)=>{if(finished)return;finished=true;clearTimeout(timer);for(const key of this.approvals.keys())if(key.startsWith(w.id+':'))this.approvals.delete(key);error?rejectDone(error):resolveDone({text,commands});};
    c=new Codex(m=>{if(finished)return;queue=queue.then(async()=>{
      await this.event(w.id,'codex',m);
      if(m.method==='item/agentMessage/delta')text+=m.params.delta||'';
      if(m.method==='item/completed'){const item=m.params.item;if(item?.type==='agentMessage')text=item.text||text;if(item?.type==='commandExecution')commands.push({command:item.command,exitCode:item.exitCode,output:String(item.aggregatedOutput||'').slice(-12000)});}
      if(m.method==='serverRequest/resolved')this.approvals.delete(`${w.id}:${m.params.requestId}`);
      if(m.id!==undefined&&m.method){if(['item/commandExecution/requestApproval','item/fileChange/requestApproval'].includes(m.method)){this.approvals.set(`${w.id}:${m.id}`,m);await this.query("UPDATE workspaces SET status='waiting' WHERE id=?",w.id);}else c.send({id:m.id,error:{code:-32601,message:'Interaction non prise en charge'}});}
      if(m.method==='turn/completed'){await this.query('UPDATE workspaces SET status=? WHERE id=?',m.params.turn.status==='completed'?'completed':m.params.turn.status==='interrupted'?'interrupted':'failed',w.id);finish(m.params.turn.status==='completed'?null:new Error('Exécution Codex '+m.params.turn.status));}
      if(m.method==='lew/workerError')finish(new Error('Le worker Codex a été interrompu.'));
    }).catch(e=>finish(e));});
    this.workers.set(w.id,c);
    try{await c.initialize();const thread=await c.request('thread/start',{cwd:w.cwd,sandbox:profile.config.sandbox,approvalPolicy:profile.config.approvalPolicy,...(profile.config.model?{model:profile.config.model}:{})});w.thread_id=thread.thread.id;await this.query("UPDATE workspaces SET thread_id=?,status='running' WHERE id=?",w.thread_id,w.id);await this.event(w.id,'user',{text:prompt});if(!await canRun()){const error=new Error('Mission suspendue avant le lancement de la commande.');error.code='MISSION_STOPPED';throw error;}const turn=await c.request('turn/start',{threadId:w.thread_id,input:[{type:'text',text:prompt}],outputSchema,...(profile.config.effort?{effort:profile.config.effort}:{})});c.missionTurn={threadId:w.thread_id,turnId:turn.turn.id};if(!await canRun())await c.request('turn/interrupt',c.missionTurn);await this.event(w.id,'turn',{id:turn.turn.id});timer=setTimeout(()=>{finish(new Error('Durée maximale de mission atteinte.'));c.close();},Math.max(1,deadline-Date.now()));return await done;}
    catch(e){await this.query("UPDATE workspaces SET status='failed' WHERE id=? AND status IN ('idle','running','waiting')",w.id);throw e;}
    finally{clearTimeout(timer);finished=true;c.close();this.workers.delete(w.id);for(const key of this.approvals.keys())if(key.startsWith(w.id+':'))this.approvals.delete(key);}
  }
}
