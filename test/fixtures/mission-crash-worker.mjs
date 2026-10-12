import {PGlite} from '@electric-sql/pglite';
import {PostgresSaver} from '@langchain/langgraph-checkpoint-postgres';
import {checkpointPool} from '../helpers/checkpoint-pool.mjs';
import {MissionEngine} from '../../missions.mjs';
import {MissionAdapter} from '../../mission-adapter.mjs';
import {defaults} from '../../agents.mjs';
import {git,publish} from '../../delivery.mjs';
import {mkdir,readFile,writeFile,rename,appendFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile),[root,phase,crashPoint]=process.argv.slice(2),file=join(root,'mission.json');
const db=new PGlite(join(root,'postgres')),checkpointer=new PostgresSaver(checkpointPool(db),undefined,{schema:'lew_graph'});await checkpointer.setup();
const read=async()=>JSON.parse(await readFile(file,'utf8'));
const store={get:read,list:async()=>{try{return [await read()];}catch{return [];}},save:async m=>{await writeFile(file+'.tmp',JSON.stringify(m));await rename(file+'.tmp',file);},event:async()=>{},execution:async()=>{}};
const adapter=new MissionAdapter({root});
const crash=async()=>{await db.close();process.send({crashReady:true});await new Promise(()=>{});};
adapter.recoverExecution=async ex=>JSON.parse(await readFile(join(root,`receipt-${ex.workspaceId}.json`),'utf8'));
if(phase==='start'&&crashPoint==='prepare'){const development=adapter.development.bind(adapter);adapter.development=async(...args)=>{await development(...args);await crash();};}
const repo=join(root,'repos','p'),remote=join(root,'remote');
if(phase==='start'){
 await mkdir(repo,{recursive:true});await mkdir(join(root,'workspaces'),{recursive:true});await mkdir(remote);
 await git(repo,['init','-b','main']);await git(repo,['config','user.name','Lew test']);await git(repo,['config','user.email','lew@example.test']);await writeFile(join(repo,'README.md'),'Fixture\n');await git(repo,['add','.']);await git(repo,['commit','-m','chore: initialize fixture']);await git(remote,['init','--bare']);await git(repo,['remote','add','origin',remote]);await git(repo,['push','origin','main']);
}
adapter.baseHead=async()=> (await git(repo,['rev-parse','main'])).trim();
adapter.workspace=async(m,role,task,ctx)=>({id:randomUUID(),...ctx});
const plan={summary:'Add a tested module',tasks:[{id:'code',title:'feat: add sum',instructions:'Implement sum',expectedResult:'Tests pass',dependsOn:[]}]};
adapter.execute=async(w,profile)=>{
 await appendFile(join(root,'calls.log'),profile.role+'\n');
 if(profile.role==='orchestrator')return {text:JSON.stringify(plan),commands:[]};
 if(profile.role==='developer')await writeFile(join(w.cwd,'sum.test.cjs'),"const assert=require('node:assert/strict');require('node:test')('sum',()=>assert.equal(2+2,4));\n");
 const commands=[];
 if(profile.role==='validation'){const {stdout}=await exec(process.execPath,['--test','sum.test.cjs'],{cwd:w.cwd});commands.push({command:'node --test sum.test.cjs',exitCode:0,output:stdout});}
 const output={text:JSON.stringify({summary:'Implemented and checked',verdict:'pass',findings:[],tests:[],unresolved:[]}),commands};
 if(phase==='start'&&crashPoint==='result'&&profile.role==='developer'){await writeFile(join(root,`receipt-${w.id}.json`),JSON.stringify(output));await crash();}
 return output;
};
if(phase==='start'&&crashPoint==='commit'){
 const commit=adapter.commit.bind(adapter);
 adapter.commit=async(...args)=>{await commit(...args);await crash();};
}
const engine=new MissionEngine(store,adapter,{checkpointer});
if(phase==='start'){
 const m=await engine.create({objective:'Add sum',criteria:'Pass tests'},{id:'p',repo:'fixture/repo'},Object.fromEntries(defaults.map(p=>[p.role,p])));
 await engine.running.get(m.id);await engine.approve(m.id,plan);await engine.running.get(m.id);
}else{
 const m=await read();await engine.recover();await engine.control(m.id,'resume');await engine.running.get(m.id);
 const ready=await read();if(ready.status!=='ready')throw new Error(ready.error||ready.status);
 let requests=0,pr;
 adapter.publish=async mission=>{const task=mission.tasks[0];return publish(task.workspace.cwd,'fixture/repo',task.workspace.branch,{title:'feat: add sum',body:'Validated',base:'main',head:task.result.head},async(_,path)=>{if(path.startsWith('pulls?'))return pr?[pr]:[];requests++;pr={number:1,html_url:'https://example.test/pr/1'};return pr;});};
 await engine.publish(m.id);await engine.publish(m.id);
 const checkpoints=await db.query('SELECT count(*)::int AS count FROM lew_graph.checkpoints');
 const commits=(await git(ready.tasks[0].workspace.cwd,['rev-list','--count','main..HEAD'])).trim();
 await db.close();process.send({status:(await read()).status,requests,commits,checkpoints:checkpoints.rows[0].count});
}
