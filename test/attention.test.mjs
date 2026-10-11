import test from 'node:test';
import assert from 'node:assert/strict';
import { attentionItems,filterAttention } from '../public/attention-model.js';

const projects=[{id:'p',name:'Lew'}];
const workspace=(id,status,extra={})=>({id,status,project_id:'p',title:`Task ${id}`,branch:`lew/${id}`,...extra});
const mission=(id,status,extra={})=>({id,status,projectId:'p',objective:`Mission ${id}`,base:'main',executions:[],...extra});

test('one inbox includes approvals, mission decisions, failures and resumable work',()=>{
  const items=attentionItems({projects,workspaces:[workspace('approval','waiting'),workspace('failed','failed'),workspace('interrupted','interrupted'),workspace('done','completed')],missions:[mission('plan','awaiting_plan'),mission('ready','ready'),mission('blocked','blocked',{error:'Tests failed'}),mission('interrupted','interrupted'),mission('paused','paused'),mission('active','running'),mission('shipped','published'),mission('cancelled','cancelled')]});
  assert.equal(items.length,8);
  assert.deepEqual(items.map(i=>i.kind),['approval','plan','blocked','blocked','resume','resume','resume','delivery']);
  assert.ok(items.every(i=>i.projectName==='Lew'&&i.action&&i.detail));
  assert.equal(items.find(i=>i.id==='mission:blocked').detail,'Tests failed');
  assert.equal(items.find(i=>i.id==='mission:plan').target,'mission');
  assert.equal(items.find(i=>i.id==='workspace:approval').workspaceId,'approval');
});

test('historical agent failures never duplicate their mission decision or outlive recovery',()=>{
  const workspaces=[workspace('old','failed'),workspace('interrupted','interrupted'),workspace('current','waiting')];
  const executions=workspaces.map(w=>({workspaceId:w.id}));
  let items=attentionItems({projects,workspaces,missions:[mission('m','blocked',{executions})],pendingWorkspaceIds:['current']});
  assert.deepEqual(items.map(i=>i.id),['workspace:current','mission:m']);
  assert.equal(items[0].missionId,'m');
  items=attentionItems({projects,workspaces:workspaces.slice(0,2),missions:[mission('m','ready',{executions})]});
  assert.deepEqual(items.map(i=>i.id),['mission:m']);
  // Ownership remains known when only a partial mission listing is available.
  assert.deepEqual(attentionItems({workspaces:[workspace('old','failed',{mission_id:'m'})]}),[]);
});

test('only live approvals count, and pausing an active agent waits for its checkpoint',()=>{
  assert.deepEqual(attentionItems({workspaces:[workspace('expired','waiting')],pendingWorkspaceIds:[]}),[]);
  assert.deepEqual(attentionItems({missions:[mission('pausing','paused',{activeWorkspace:'active'})]}),[]);
  assert.equal(attentionItems({missions:[mission('paused','paused',{activeWorkspace:null})]}).length,1);
});

test('attention filters search the action and project as well as title and branch',()=>{
  const items=attentionItems({projects,workspaces:[workspace('approve','waiting')],missions:[mission('plan','awaiting_plan'),mission('ready','ready')]});
  assert.equal(filterAttention(items,' LEW ').length,3);
  assert.deepEqual(filterAttention(items,'approuver').map(i=>i.id),['mission:plan']);
  assert.deepEqual(filterAttention(items,'main','delivery').map(i=>i.id),['mission:ready']);
  assert.deepEqual(filterAttention(items,'absent'),[]);
});
