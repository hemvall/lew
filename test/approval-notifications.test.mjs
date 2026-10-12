import test from 'node:test';import assert from 'node:assert/strict';
import {approvalNotifications} from '../public/approval-notifications.js';
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.classList={add(){}};}
  append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
  setAttribute(key,value){this.attributes[key]=value;}
  insertBefore(child,before){child.parent=this;this.children.splice(this.children.indexOf(before),0,child);}
  remove(){this.parent.children=this.parent.children.filter(x=>x!==this);}
  querySelectorAll(tag){return this.children.flatMap(child=>[...(child.tag===tag?[child]:[]),...(child.querySelectorAll?.(tag)||[])]);}
}
test('approval cards persist across polling, dismiss without declining, reopen and resolve original IDs',async()=>{
  const old=globalThis.matchMedia;globalThis.matchMedia=()=>({matches:true});
  const doc={body:new Element('body'),createElement:tag=>new Element(tag),createTextNode:text=>({text}),addEventListener(){}};
  const calls=[],opened=[],center=approvalNotifications({document:doc,api:async(...args)=>calls.push(args),openWorkspace:item=>opened.push(item)});
  const item={key:'w:id:1',workspaceId:'w',requestId:'id:1',title:'Pulse',command:'npm test',kind:'command',canRemember:true};
  try{
    center.update([item]);const host=doc.body.children[0],card=host.children[0];center.update([item]);assert.equal(host.children[0],card);
    card.querySelectorAll('button').find(b=>b.className==='approval-notification-close').onclick();assert.equal(calls.length,0);assert.equal(host.children.length,1);assert.equal(host.children[0].hidden,false);
    center.update([item]);assert.equal(host.children.length,1);host.children[0].onclick();assert.equal(host.children.length,2);
    const reopened=host.children[0];reopened.querySelectorAll('button').find(b=>b.className==='approval-notification-open').onclick();assert.equal(opened[0].requestId,'id:1');
    await reopened.querySelectorAll('button').find(b=>b.className==='approve').onclick();assert.deepEqual(calls[0],['workspaces/w/approval','POST',{id:'id:1',accept:true,session:true}]);
    center.update([]);assert.equal(host.children.length,1);assert.equal(host.children[0].hidden,true);
    center.update([{...item,key:'w:id:2',requestId:'id:2'}]);await host.children[0].querySelectorAll('button').find(b=>b.className==='decline').onclick();assert.deepEqual(calls[1][2],{id:'id:2',accept:false,session:false});
  }finally{globalThis.matchMedia=old;}
});
