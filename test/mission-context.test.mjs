import test from 'node:test';import assert from 'node:assert/strict';import {missionContext} from '../mission-context.mjs';
test('conversation context identifies its own mission, execution role and current task stage',()=>{
  const missions=[{id:'m',objective:'Fix navigation',status:'running',executions:[{workspaceId:'w',taskId:'t',role:'reviewer'},{workspaceId:'other',taskId:'other',role:'developer'}],tasks:[{id:'t',title:'Deep links',stage:'review',status:'running'}]}];
  assert.deepEqual(missionContext({id:'w',mission_id:'m'},missions),{id:'m',available:true,objective:'Fix navigation',status:'running',role:'reviewer',task:{title:'Deep links',stage:'review',status:'running'}});
  assert.equal(missionContext({id:'standalone'},missions),null);assert.deepEqual(missionContext({id:'w',mission_id:'missing'},missions),{id:'missing',available:false});
});
