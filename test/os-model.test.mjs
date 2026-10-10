import test from 'node:test';
import assert from 'node:assert/strict';
import {applications,applicationFor,clampWindow} from '../public/os-model.js';
test('work tools share one application and Product Lab remains independent',()=>{const views=applications.flatMap(a=>a.views);assert.equal(applications.length,2);assert.equal(new Set(views).size,views.length);for(const view of ['projects','project','chats','workspace','pr','missions','agents','activity','review'])assert.equal(applicationFor(view).id,'workspace');assert.equal(applicationFor('studio').name,'Product Lab');assert.equal(applicationFor('home'),undefined);});
test('dragging keeps window controls inside usable desktop bounds',()=>{assert.deepEqual(clampWindow(-300,-100,800,500,{width:1440,height:900}),{x:0,y:40});assert.deepEqual(clampWindow(2000,2000,800,500,{width:1440,height:900}),{x:640,y:310});assert.deepEqual(clampWindow(100,100,1200,900,{width:600,height:500}),{x:0,y:40});});
