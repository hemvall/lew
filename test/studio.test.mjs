import test from 'node:test';
import assert from 'node:assert/strict';
import {stages,newProduct,demoProduct,completion,productBrief,readProducts} from '../public/studio-model.js';
test('demonstration covers all stages and uses an independent editable document',()=>{const a=demoProduct(),b=demoProduct();assert.equal(completion(a),100);assert.notEqual(a.id,b.id);a.values.problem='Edited';assert.notEqual(a.values.problem,b.values.problem);assert.match(productBrief(b),/Documents fictifs/);});
import {parseRoute,routeFor} from '../public/navigation-model.js';
test('studio route survives reload',()=>assert.deepEqual(parseRoute(routeFor({view:'studio'})),{view:'studio'}));
test('brief contains every design decision and marks missing answers',()=>{const p=newProduct();assert.equal(completion(p),0);assert.match(productBrief(p),/À définir/);for(const s of stages)for(const [id] of s.fields)p.values[id]='Décision '+id;assert.equal(completion(p),100);assert.match(productBrief(p),/Décision guardrails/);assert.match(productBrief(p),/Décision release/);});
test('damaged local storage does not prevent opening studio',()=>{assert.deepEqual(readProducts({getItem:()=>'{broken'}),[]);assert.deepEqual(readProducts({getItem:()=>JSON.stringify([null,{id:'bad'},newProduct()])}).length,1);});
