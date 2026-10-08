import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraftStore} from '../public/draft-store.js';
import {parseRoute,routeFor} from '../public/navigation-model.js';
import {workspaceResume} from '../public/resume-model.js';
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};

test('drafts survive a fresh session, remain separate and clear only when requested',()=>{
  const persisted=storage(),first=createDraftStore(()=>persisted);
  assert.equal(first.set('a','Keep this draft'),true);first.set('b','Other branch');
  const reopened=createDraftStore(()=>persisted);
  assert.equal(reopened.get('a'),'Keep this draft');assert.equal(reopened.get('b'),'Other branch');
  reopened.delete('a');assert.equal(createDraftStore(()=>persisted).get('a'),'');
  assert.equal(createDraftStore(()=>persisted).get('b'),'Other branch');
});
test('unavailable or corrupt browser storage preserves an in-memory draft without claiming it was saved',()=>{
  const drafts=createDraftStore(()=>{throw new Error('Storage unavailable');});
  assert.equal(drafts.set('a','Unsaved'),false);assert.equal(drafts.get('a'),'Unsaved');assert.equal(drafts.persisted('a'),false);
  const persisted=storage();persisted.setItem('lew-draft:a','{broken');assert.equal(createDraftStore(()=>persisted).get('a'),'');
});
test('direct routes round-trip conversations, missions, projects and PRs',()=>{
  for(const route of [{view:'workspace',workspaceId:'w-1'},{view:'missions',missionId:'m-2'},{view:'project',projectId:'p-3'},{view:'pr',projectId:'p-3',prNumber:42},{view:'review'}])assert.deepEqual(parseRoute(routeFor(route)),route);
  for(const invalid of ['#/workspaces/%2F..','#/missions/%ZZ','#/prs/project/-1','#/workspaces/a/extra','#/unknown'])assert.equal(parseRoute(invalid),null);
});
test('resume context uses completed agent results and durable human decisions',()=>{
  const events=[{id:'1',kind:'user',data:{text:'Fix navigation'},created:'2026-10-09T00:00:00Z'},{id:'2',kind:'codex',data:{id:'approval',method:'item/commandExecution/requestApproval',params:{command:'npm test'}}},{id:'3',kind:'approval',data:{id:'approval',accepted:true}},{id:'4',kind:'codex',data:{method:'item/completed',params:{item:{id:'result',type:'agentMessage',text:'Navigation fixed.'}}}},{id:'5',kind:'codex',data:{method:'item/agentMessage/delta',params:{itemId:'new',delta:'Unfinished response'}}}];
  const summary=workspaceResume({title:'Navigation',status:'completed'},events);
  assert.equal(summary.objective,'Navigation');assert.equal(summary.latestResult,'Navigation fixed.');assert.equal(summary.lastInstruction,'Fix navigation');
  assert.equal(summary.decisions[0].text,'Autorisé : npm test');assert.match(summary.nextAction,/livraison/);
});
test('resume context distinguishes live approvals, expired approvals and actual failures',()=>{
  const events=[{id:'1',kind:'codex',data:{id:'r',method:'item/commandExecution/requestApproval',params:{command:'npm test'}}}];
  assert.equal(workspaceResume({status:'waiting'},events,{pendingIds:['r']}).blocker,'npm test');
  assert.match(workspaceResume({status:'waiting'},events).nextAction,/Actualiser/);
  assert.equal(workspaceResume({status:'failed'},[{id:'2',kind:'error',data:{text:'Tests failed'}}]).blocker,'Tests failed');
});
test('mission-owned conversations point recovery back to the mission',()=>{
  const result=workspaceResume({title:'Agent review',status:'interrupted',mission_id:'m',mission_context:{objective:'Improve navigation'}},[]);
  assert.equal(result.objective,'Improve navigation');assert.match(result.nextAction,/mission/);
});
