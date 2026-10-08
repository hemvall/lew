import test from 'node:test';import assert from 'node:assert/strict';
import { validatePlan,limits,transition,recoverMission,reviewValid } from '../mission-model.mjs';
import { importAvatar,validateProfile,defaults } from '../agents.mjs';
import { MissionEngine } from '../missions.mjs';
const plan={summary:'Plan',tasks:[{id:'code',title:'Code',instructions:'Implement',expectedResult:'Tests pass',dependsOn:[]}]};
const result=verdict=>JSON.stringify({summary:'Done',verdict,findings:[],tests:['node --test'],unresolved:[]});
test('plans reject cycles, unknown dependencies, duplicate IDs and implicit Git bases',()=>{assert.deepEqual(validatePlan(plan),plan);for(const p of [{...plan,tasks:[{...plan.tasks[0],dependsOn:['code']}]},{...plan,tasks:[plan.tasks[0],{...plan.tasks[0],id:'test',dependsOn:[]}]},{...plan,tasks:[plan.tasks[0],plan.tasks[0]]}])assert.throws(()=>validatePlan(p));});
test('limits, transitions and restart recovery preserve completed work',()=>{assert.throws(()=>limits({concurrency:2}));assert.throws(()=>limits({attempts:0}));assert.equal(transition('running','pause'),'paused');assert.throws(()=>transition('ready','resume'));assert.deepEqual(recoverMission({status:'running',tasks:[{status:'completed'},{status:'running'}]}),{status:'interrupted',activeWorkspace:null,tasks:[{status:'completed'},{status:'interrupted'}]});assert.equal(reviewValid({head:'a',fingerprint:'b'},{head:'a',fingerprint:'changed'}),false);});
test('avatar imports reject malformed, duplicate, oversized and unsupported definitions',()=>{for(const text of ['{}','{"schemaVersion":1,"schemaVersion":2}', 'x'.repeat(262145),'{"schemaVersion":500}'])assert.throws(()=>importAvatar(text,'Avatar'));});
test('profile sandbox and model choices are enforced',()=>{assert.throws(()=>validateProfile({...defaults[0],config:{...defaults[0].config,sandbox:'workspace-write'}}));assert.throws(()=>validateProfile({...defaults[1],config:{...defaults[1].config,model:'invented'}}));assert.equal(validateProfile(defaults[1]).config.sandbox,'workspace-write');});
function harness(overrides={}){let current;const events=[],calls=[];const store={get:async()=>structuredClone(current),list:async()=>current?[structuredClone(current)]:[],save:async m=>{const next=structuredClone(m);if(current&&(current.version||0)!==(m.version||0))next.status=current.status;next.version=(current?.version||0)+1;current=next;m.status=next.status;m.version=next.version;},event:async(...v)=>events.push(v),execution:async()=>{}};let count=0;const adapter={base:async()=>({cwd:'base'}),baseHead:async()=> 'base',workspace:async()=>({id:'w'+count++}),development:async()=>({cwd:'dev'}),isolate:async(m,t,r,h)=>({cwd:r,head:h}),snapshot:async ctx=>({head:'sha',fingerprint:'fingerprint',files:[]}),commit:async()=>({head:'sha',fingerprint:'fingerprint',files:[],changedFiles:['a.js']}),interrupt:async()=>{},execute:async(w,p,prompt,schema)=>{calls.push(p.role);return {text:p.role==='orchestrator'?JSON.stringify(plan):result('pass'),commands:p.role==='validation'?[{command:'node --test',exitCode:0}]:[]};},...overrides};const engine=new MissionEngine(store,adapter);const profiles=Object.fromEntries(defaults.map(p=>[p.role,structuredClone(p)]));return {engine,store,adapter,calls,profiles,get:()=>current,events};}
async function finish(h){await h.engine.running.get(h.get().id);}
test('real orchestration stops at plan approval, snapshots profiles, then verifies exact revision',async()=>{const h=harness();const m=await h.engine.create({objective:'Build',criteria:'Pass'}, {id:'p',name:'Project'},h.profiles);h.profiles.developer.instructions='CHANGED';await finish(h);assert.equal(h.get().status,'awaiting_plan');assert.deepEqual(h.calls,['orchestrator']);assert.notEqual(h.get().profiles.developer.instructions,'CHANGED');await h.engine.approve(m.id,plan);await finish(h);assert.equal(h.get().status,'ready');assert.deepEqual(h.calls,['orchestrator','developer','reviewer','validation']);assert.equal(h.get().tasks[0].validation.head,'sha');});
test('changed Git revisions invalidate review and never reach delivery',async()=>{const h=harness({snapshot:async()=>({head:'different',fingerprint:'fingerprint',files:[]})});const m=await h.engine.create({objective:'Build',criteria:'Pass'},{id:'p'},h.profiles);await finish(h);await h.engine.approve(m.id,plan);await finish(h);assert.equal(h.get().status,'blocked');assert.match(h.get().error,/invalidée/);assert.equal(h.calls.includes('validation'),false);});
test('correction limit stops a reviewer loop',async()=>{const h=harness();h.adapter.execute=async(w,p)=>{h.calls.push(p.role);return {text:p.role==='orchestrator'?JSON.stringify(plan):result(p.role==='reviewer'?'changes_required':'pass'),commands:[]};};const m=await h.engine.create({objective:'Build',criteria:'Pass',limits:{correctionRounds:1}},{id:'p'},h.profiles);await finish(h);await h.engine.approve(m.id,plan);await finish(h);assert.equal(h.get().status,'blocked');assert.equal(h.calls.filter(x=>x==='developer').length,2);});
test('validation requires observed successful tool commands, not a claimed pass',async()=>{const h=harness();h.adapter.execute=async(w,p)=>({text:p.role==='orchestrator'?JSON.stringify(plan):result('pass'),commands:[]});const m=await h.engine.create({objective:'Build',criteria:'Pass',limits:{correctionRounds:0}},{id:'p'},h.profiles);await finish(h);await h.engine.approve(m.id,plan);await finish(h);assert.equal(h.get().status,'blocked');});
test('pause checkpoints an active developer and resumes at review without repeating commands',async()=>{const h=harness();let release,started;const startedPromise=new Promise(r=>started=r);const normal=h.adapter.execute;h.adapter.execute=async(w,p,...args)=>{if(p.role==='developer'){started();await new Promise(r=>release=r);}return normal(w,p,...args);};const m=await h.engine.create({objective:'Build',criteria:'Pass'},{id:'p'},h.profiles);await finish(h);await h.engine.approve(m.id,plan);await startedPromise;await h.engine.control(m.id,'pause');release();await finish(h);assert.equal(h.get().status,'paused');assert.equal(h.get().tasks[0].stage,'review');assert.deepEqual(h.calls,['orchestrator','developer']);await h.engine.control(m.id,'resume');await finish(h);assert.equal(h.get().status,'ready');assert.equal(h.calls.filter(r=>r==='developer').length,1);});

for(const role of ['orchestrator','developer','reviewer','validation']){
  test(`interrupt during ${role} settles and resumes from its checkpoint`,async()=>{
    const h=harness();let rejectTurn,started,interrupted=false;
    const startedPromise=new Promise(resolve=>started=resolve),normal=h.adapter.execute;
    h.adapter.execute=async(w,p,...args)=>{
      if(p.role===role&&!interrupted){interrupted=true;h.calls.push(p.role);started();return new Promise((resolve,reject)=>rejectTurn=reject);}
      return normal(w,p,...args);
    };
    // Also cover generic worker errors racing with a human interruption.
    h.adapter.interrupt=async()=>rejectTurn(new Error('Exécution Codex interrupted'));
    const m=await h.engine.create({objective:'Build',criteria:'Pass'},{id:'p'},h.profiles);
    if(role!=='orchestrator'){await finish(h);await h.engine.approve(m.id,plan);}
    await startedPromise;await h.engine.control(m.id,'interrupt');await finish(h);
    assert.equal(h.get().status,'interrupted');assert.equal(h.get().activeWorkspace,null);
    if(role!=='orchestrator')assert.equal(h.get().tasks[0].status,'interrupted');
    await h.engine.control(m.id,'resume');await finish(h);
    assert.equal(h.get().status,role==='orchestrator'?'awaiting_plan':'ready');
    if(['reviewer','validation'].includes(role))assert.equal(h.calls.filter(r=>r==='developer').length,1);
    if(role==='validation')assert.equal(h.calls.filter(r=>r==='reviewer').length,1);
  });
}

test('interrupting the individual agent conversation also leaves a resumable mission',async()=>{
  const h=harness(),normal=h.adapter.execute;let stopOnce=true;
  h.adapter.execute=async(w,p,...args)=>{if(p.role==='developer'&&stopOnce){stopOnce=false;const error=new Error('Exécution Codex interrupted');error.code='MISSION_STOPPED';throw error;}return normal(w,p,...args);};
  const m=await h.engine.create({objective:'Build',criteria:'Pass'},{id:'p'},h.profiles);
  await finish(h);await h.engine.approve(m.id,plan);await finish(h);
  assert.equal(h.get().status,'interrupted');assert.equal(h.get().tasks[0].status,'interrupted');
  await h.engine.control(m.id,'resume');await finish(h);assert.equal(h.get().status,'ready');
});

test('a fresh retry runs after exhausted corrections without replaying completed tasks',async()=>{
  const h=harness(),twoTasks={...plan,tasks:[plan.tasks[0],{...plan.tasks[0],id:'next',title:'Next',dependsOn:['code']}]};
  let rejectReview=true;
  h.adapter.execute=async(w,p)=>{
    h.calls.push(p.role);
    return {text:p.role==='orchestrator'?JSON.stringify(twoTasks):result(p.role==='reviewer'&&h.get().tasks[0].status==='completed'&&rejectReview?'changes_required':'pass'),commands:p.role==='validation'?[{command:'node --test',exitCode:0}]:[]};
  };
  const m=await h.engine.create({objective:'Build',criteria:'Pass',limits:{correctionRounds:0}},{id:'p'},h.profiles);
  await finish(h);await h.engine.approve(m.id,twoTasks);await finish(h);
  assert.equal(h.get().status,'blocked');assert.equal(h.get().tasks[1].round,1);
  const completed=structuredClone(h.get().tasks[0]),before=h.calls.length;rejectReview=false;
  await h.engine.control(m.id,'resume');await finish(h);
  assert.equal(h.get().status,'ready');assert.equal(h.get().tasks[1].attempts,2);
  assert.deepEqual(h.get().tasks[0],completed);assert.deepEqual(h.calls.slice(before),['developer','reviewer','validation']);
});

test('attempt and duration limits reject resume without consuming work or changing state',async()=>{
  const h=harness();h.adapter.execute=async(w,p)=>({text:p.role==='orchestrator'?JSON.stringify(plan):result('blocked'),commands:[]});
  const m=await h.engine.create({objective:'Build',criteria:'Pass',limits:{attempts:1}},{id:'p'},h.profiles);
  await finish(h);await h.engine.approve(m.id,plan);await finish(h);
  const blocked=structuredClone(h.get());
  await assert.rejects(h.engine.control(m.id,'resume'),/Nombre maximal de tentatives/);
  assert.deepEqual(h.get(),blocked);assert.equal(h.engine.running.size,0);
  const expired=await h.store.get(m.id);expired.startedAt=Date.now()-61*60000;await h.store.save(expired);
  const checkpoint=structuredClone(h.get());
  await assert.rejects(h.engine.control(m.id,'resume'),/Durée maximale/);assert.deepEqual(h.get(),checkpoint);
});

test('a failed interrupt request restores the active mission state',async()=>{
  const h=harness();let release,started;
  const startedPromise=new Promise(resolve=>started=resolve),normal=h.adapter.execute;
  h.adapter.execute=async(w,p,...args)=>{if(p.role==='developer'){started();await new Promise(resolve=>release=resolve);}return normal(w,p,...args);};
  h.adapter.interrupt=async()=>{throw new Error('Worker unavailable');};
  const m=await h.engine.create({objective:'Build',criteria:'Pass'},{id:'p'},h.profiles);
  await finish(h);await h.engine.approve(m.id,plan);await startedPromise;
  await assert.rejects(h.engine.control(m.id,'interrupt'),/Worker unavailable/);
  assert.equal(h.get().status,'running');release();await finish(h);assert.equal(h.get().status,'ready');
});
