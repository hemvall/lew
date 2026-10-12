import test from 'node:test';import assert from 'node:assert/strict';
import {resultFromEvents,resultFromThread} from '../mission-recovery.mjs';
import {MissionAdapter} from '../mission-adapter.mjs';
const completed={kind:'codex',data:{method:'turn/completed',params:{turn:{status:'completed'}}}};
const message={kind:'codex',data:{method:'item/completed',params:{item:{type:'agentMessage',text:'Result'}}}};
const command={kind:'codex',data:{method:'item/completed',params:{item:{type:'commandExecution',command:'npm test',exitCode:0}}}};
test('recovery requires completion evidence and preserves observed command exits',()=>{
 assert.equal(resultFromEvents([message,command]),null);
 const result=resultFromEvents([message,command,completed]);assert.equal(result.text,'Result');assert.equal(result.commands[0].exitCode,0);
 assert.equal(resultFromThread({turns:[{status:'inProgress',items:[message.data.params.item]}]}),null);
 assert.equal(resultFromThread({turns:[{status:'completed',items:[message.data.params.item,command.data.params.item]}]}).commands[0].exitCode,0);
 assert.equal(resultFromThread({turns:[{status:'completed'},{status:'completed'}]}),null);
});
test('recorded completion is recovered without starting or contacting Codex',async()=>{
 const adapter=new MissionAdapter({query:async()=>({rows:[message,command,completed]})});
 assert.equal((await adapter.recoverExecution({workspaceId:'w'})).text,'Result');
 assert.deepEqual(await adapter.recoverExecution({}),{notStarted:true});
});
