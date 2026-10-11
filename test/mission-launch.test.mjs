import test from 'node:test';
import assert from 'node:assert/strict';
import {demoProduct} from '../public/studio-model.js';
import {missionBrief} from '../public/studio-model.js';

test('Product Lab checkout opens and remains editable while network requests are pending',async()=>{
  const previous={document:globalThis.document,matchMedia:globalThis.matchMedia,IntersectionObserver:globalThis.IntersectionObserver};
  const element=()=>({value:'',textContent:'',disabled:false,addEventListener(){}});
  const nodes=new Map(),form={isConnected:true,objective:element(),criteria:element(),projectId:element(),base:element(),querySelector:selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);},querySelectorAll:()=>[]};
  const root={isConnected:true,innerHTML:''};let html,opened=false;
  globalThis.matchMedia=()=>({matches:true,addEventListener(){}});
  globalThis.document={addEventListener(){},querySelector:()=>form};
  globalThis.IntersectionObserver=class{disconnect(){}};
  const requests=[];
  try{
    const {missionUI,stopMissionUI}=await import('../public/mission-ui.js');
    const pending=missionUI({root,projects:[],launchBrief:missionBrief(demoProduct()),escape:String,toast(){},modal(title,body){opened=true;html=body;},api:path=>new Promise(resolve=>requests.push({path,resolve}))},'missions');
    assert.equal(opened,true,'modal must appear without waiting for any API response');
    assert.match(form.objective.value,/Créer un assistant interne/);
    assert.doesNotMatch(form.objective.value,/^#/m);
    assert.equal((html.match(/<details><summary>/g)||[]).length,6);
    assert.equal(form.querySelector('.primary').disabled,true);
    assert.deepEqual(requests.map(r=>r.path).sort(),['agents','missions/route','state']);
    root.isConnected=false;form.isConnected=false;
    for(const request of requests)request.resolve(request.path==='agents'?{agents:[],avatars:[]}:request.path==='state'?{projects:[]}:{profiles:{}});
    await pending;stopMissionUI();
  }finally{Object.assign(globalThis,previous);}
});
