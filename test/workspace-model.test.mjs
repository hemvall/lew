import test from 'node:test';
import assert from 'node:assert/strict';
import {conversation,diffLines,sortedProjects} from '../public/workspace-model.js';
const codex=(id,method,params,requestId)=>({id,kind:'codex',data:{method,params,...(requestId===undefined?{}:{id:requestId})}});
test('final agent text is authoritative and command output remains attached to the right item',()=>{
  const events=[codex(1,'item/started',{item:{id:'a',type:'agentMessage'}}),codex(2,'item/agentMessage/delta',{itemId:'a',delta:'Partial'}),codex(3,'item/started',{item:{id:'cmd',type:'commandExecution',command:'npm test',cwd:'/repo'}}),codex(4,'item/commandExecution/outputDelta',{itemId:'cmd',delta:'15 tests passed'}),codex(5,'item/completed',{item:{id:'cmd',type:'commandExecution',status:'completed',exitCode:0,aggregatedOutput:'15 tests passed'}}),codex(6,'item/completed',{item:{id:'a',type:'agentMessage',text:'Final answer'}})];
  const m=conversation(events).messages;assert.equal(m.length,2);assert.equal(m[0].text,'Final answer');assert.equal(m[1].output,'15 tests passed');assert.equal(m[1].exitCode,0);
});
test('approval cards only enable live requests, including non-numeric protocol IDs',()=>{
  const events=[codex(1,'item/commandExecution/requestApproval',{itemId:'cmd',command:'npm test'},'old'),codex(2,'item/fileChange/requestApproval',{itemId:'files',reason:'Edit'},'active'),codex(3,'item/started',{item:{id:'files',type:'fileChange',changes:[{path:'a.js',diff:'+code'}]}})];
  const model=conversation(events,{pendingIds:['active']});assert.equal(model.messages[0].resolved,true);assert.equal(model.messages[1].resolved,false);assert.equal(model.messages[1].changes[0].path,'a.js');
  events.push(codex(4,'serverRequest/resolved',{requestId:'active'}));assert.equal(conversation(events,{pendingIds:['active']}).messages[1].resolved,true);
});
test('plan updates and turn diffs follow the newest event while raw reasoning is excluded',()=>{
  const model=conversation([codex(1,'item/started',{item:{id:'r',type:'reasoning',content:['private']}}),codex(2,'turn/plan/updated',{plan:[{step:'Test',status:'inProgress'}]}),codex(3,'turn/plan/updated',{plan:[{step:'Test',status:'completed'}]}),codex(4,'turn/diff/updated',{diff:'final diff'})]);assert.equal(model.messages.length,0);assert.equal(model.plan[0].status,'completed');assert.equal(model.diff,'final diff');
});
test('unified diffs preserve old and new line numbering over multiple hunks',()=>{
  const lines=diffLines('@@ -4,2 +4,2 @@\n old\n-removed\n+added\n@@ -20,0 +21,1 @@\n+new');assert.deepEqual(lines.map(x=>[x.kind,x.old,x.next]),[['hunk',null,null],['context',4,4],['remove',5,null],['add',null,5],['hunk',null,null],['add',null,21]]);
});
test('project ranking prioritizes favorites then last-opened without changing source order',()=>{
  const list=[{id:'a',name:'A',last_opened:'2026-10-08'},{id:'b',name:'B',favorite:true},{id:'c',name:'C',last_opened:'2026-10-09'}];assert.deepEqual(sortedProjects(list).map(p=>p.id),['b','c','a']);assert.deepEqual(list.map(p=>p.id),['a','b','c']);
});
