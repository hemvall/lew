import test from 'node:test';
import assert from 'node:assert/strict';
import {turnPermissions,approvalDecision,pendingApprovals} from '../approval-policy.mjs';
test('routine execution enables project network without expanding file permissions or read-only agents',()=>{
  assert.deepEqual(turnPermissions('/repo'),{sandboxPolicy:{type:'workspaceWrite',writableRoots:['/repo'],networkAccess:true}});
  assert.deepEqual(turnPermissions('/repo',{sandbox:'read-only'}),{});
});
test('session approvals respect available protocol decisions and never turn refusal into consent',()=>{
  assert.equal(approvalDecision({params:{}},true,true),'acceptForSession');
  assert.equal(approvalDecision({params:{availableDecisions:['accept','decline']}},true,true),'accept');
  assert.equal(approvalDecision({params:{}},false,true),'decline');
  assert.equal(approvalDecision({params:{}},true,false),'accept');
});
test('notification identities retain nonnumeric request IDs and only expose necessary request fields',()=>{
  const requests=new Map([['w:request:1',{id:'request:1',method:'item/commandExecution/requestApproval',params:{command:'npm test',reason:'Needs access',availableDecisions:['accept','decline'],secret:'not exposed'}}]]);
  const [item]=pendingApprovals(requests,[{id:'w',project_id:'p',title:'Task',agent_profile:{name:'Pulse'}}]);
  assert.equal(item.requestId,'request:1');assert.equal(item.workspaceId,'w');assert.equal(item.title,'Pulse');assert.equal(item.canRemember,false);assert.equal(item.secret,undefined);
  requests.clear();assert.deepEqual(pendingApprovals(requests,[]),[]);
});
