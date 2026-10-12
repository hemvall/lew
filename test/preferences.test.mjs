import test from 'node:test';
import assert from 'node:assert/strict';
import {readPreferences,normalizePreferences,preferenceDefaults} from '../public/preferences.js';
test('appearance preferences migrate the existing theme without losing defaults',()=>{
 const storage={getItem:key=>key==='lew-theme'?'light':null};
 assert.deepEqual(readPreferences(storage),{...preferenceDefaults,theme:'light'});
});
test('corrupt or blocked storage falls back to usable defaults',()=>{
 assert.deepEqual(readPreferences({getItem:()=>'{broken'}),preferenceDefaults);
 assert.deepEqual(readPreferences({getItem:()=>{throw Error('blocked');}}),preferenceDefaults);
});
test('saved preferences preserve accessibility choices and reject invalid values',()=>{
 const saved={theme:'dark',accent:'green',sound:false,motion:false,transparency:false,density:'compact',wallpaper:'ocean'};
 assert.deepEqual(readPreferences({getItem:()=>JSON.stringify(saved)}),saved);
 assert.deepEqual(normalizePreferences({theme:'invalid',accent:'url(x)',motion:'false',extra:true}),preferenceDefaults);
});
test('system appearance and saved changes propagate to an already open frame',async()=>{
 const {initPreferences}=await import('../public/preferences.js');
 const originals=Object.fromEntries(['document','window','localStorage','matchMedia'].map(key=>[key,globalThis[key]]));
 const listeners={},classes=new Set(),root={dataset:{},classList:{toggle(name,on){on?classes.add(name):classes.delete(name);}}};
 let stored=JSON.stringify({...preferenceDefaults,theme:'system'}),onSystemChange;
 const system={matches:false,addEventListener(_,fn){onSystemChange=fn;}};
 globalThis.localStorage={getItem:()=>stored};globalThis.window={addEventListener:(name,fn)=>listeners[name]=fn};
 globalThis.document={documentElement:root,getAnimations:()=>[],querySelector:()=>null,addEventListener(){}};
 globalThis.matchMedia=query=>query.includes('color-scheme')?system:{matches:false};
 try{
  initPreferences({modal(){},toast(){}});assert.equal(classes.has('dark'),false);
  system.matches=true;onSystemChange();assert.equal(classes.has('dark'),true);
  stored=JSON.stringify({...preferenceDefaults,theme:'light',motion:false,sound:false,accent:'green'});
  listeners.storage({key:'lew-preferences'});assert.equal(classes.has('dark'),false);assert.equal(root.dataset.motion,'reduced');assert.equal(root.dataset.sound,'off');assert.equal(root.dataset.accent,'green');
 }finally{for(const [key,value] of Object.entries(originals)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
