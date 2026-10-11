import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMissionTitle,summarizeMissionTitle } from '../mission-titles.mjs';
import { missionTitle } from '../public/workspace-model.js';
import { validatePlan,planSchema } from '../mission-model.mjs';

test('display titles remain compact while the complete objective is preserved',()=>{
  const mission={objective:'Une très longue demande '.repeat(20),plan:{tasks:[{title:'Créer une équipe adaptable avec des agents spécialisés'}]}};
  assert.equal(missionTitle(mission),'Créer une équipe adaptable avec des agents spécialisés');
  assert.equal(missionTitle({...mission,title:'Adapter les agents sans imposer une équipe fixe'}),'Adapter les agents sans imposer une équipe fixe');
  assert.equal(cleanMissionTitle('x'.repeat(97)),null);assert.equal(cleanMissionTitle('  Titre\n court  '),'Titre court');
  assert.equal(mission.objective.length>96,true);
});

test('legacy plans remain valid and new plans request a bounded LLM title',()=>{
  const plan={summary:'Plan',tasks:[{id:'code',title:'Code',instructions:'Implement',expectedResult:'Pass',dependsOn:[]}]};
  assert.deepEqual(validatePlan(plan),plan);assert.equal(planSchema.required.includes('title'),true);
  assert.throws(()=>validatePlan({...plan,title:'x'.repeat(97)}));
});

test('existing native thread names avoid any extra inference turn',async()=>{
  const calls=[];let closed=false;
  const title=await summarizeMissionTitle({objective:'Long objective'},{threadId:'native',createClient:()=>({initialize:async()=>{},request:async(method,params)=>{calls.push([method,params]);return {thread:{name:'Adapter les agents sans imposer une équipe fixe'}};},close:()=>closed=true})});
  assert.equal(title,'Adapter les agents sans imposer une équipe fixe');assert.deepEqual(calls,[['thread/read',{threadId:'native',includeTurns:false}]]);assert.equal(closed,true);
});

test('missing native names generate one isolated structured summary containing the constraint',async()=>{
  const calls=[];let closed=false;
  const title=await summarizeMissionTitle({objective:'Créer automatiquement des spécialistes',criteria:'Ne pas imposer quatre rôles fixes'},{threadId:'native',createClient:onEvent=>({
    initialize:async()=>{},close:()=>closed=true,
    request:async(method,params)=>{calls.push([method,params]);
      if(method==='thread/read')return {thread:{name:null}};
      if(method==='model/list')return {data:[{model:'gpt-test-mini',supportedReasoningEfforts:[{reasoningEffort:'low'}]}]};
      if(method==='thread/start')return {thread:{id:'summary'}};
      if(method==='turn/start'){onEvent({method:'item/completed',params:{threadId:'summary',item:{type:'agentMessage',text:JSON.stringify({title:'Créer des spécialistes sans imposer quatre rôles fixes'})}}});onEvent({method:'turn/completed',params:{threadId:'summary',turn:{status:'completed'}}});return {turn:{id:'done'}};}
    }
  })});
  assert.equal(title,'Créer des spécialistes sans imposer quatre rôles fixes');assert.equal(closed,true);
  const start=calls.find(([method])=>method==='thread/start')[1];assert.equal(start.ephemeral,true);assert.equal(start.sandbox,'read-only');assert.equal(start.approvalPolicy,'never');
  const turn=calls.find(([method])=>method==='turn/start')[1];assert.match(turn.input[0].text,/Ne pas imposer quatre rôles fixes/);assert.equal(turn.effort,'low');assert.equal(calls.filter(([method])=>method==='turn/start').length,1);
});
