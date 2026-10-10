import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSearch,chatTimestamp,filterChats,projectChatCounts} from '../public/workspace-model.js';

const projects=[{id:'web',name:'Équipe web',repo:'atelier/site'},{id:'api',name:'API',repo:'atelier/service'}];
const chats=[
  {id:'a',project_id:'web',title:'Réparer la connexion',branch:'fix/login',status:'failed',updated:'2026-10-08T09:00:00Z'},
  {id:'b',project_id:'api',title:'Connexion au service',branch:'fix/auth',status:'failed',updated:'2026-10-09T09:00:00Z'},
  {id:'c',project_id:'web',title:'Connexion mobile',branch:'feat/mobile',status:'running',created:'2026-10-10T09:00:00Z'}
];
const ids=items=>items.map(item=>item.id);

test('search normalizes accents, decomposed characters, case and whitespace',()=>{
  assert.equal(normalizeSearch('  ÉQUIPE\n  re\u0301parer\t '),'equipe reparer');
  assert.equal(normalizeSearch(null),'');
  assert.deepEqual(ids(filterChats(chats,projects,{query:'  REPARER equipe SITE login '})),['a']);
  assert.deepEqual(ids(filterChats(chats,projects,{query:'connexion mobile equipe'})),['c']);
  assert.deepEqual(filterChats(chats,projects,{query:'connexion equipe service'}),[]);
});

test('project, exact status and search filters combine without leaking other projects',()=>{
  assert.deepEqual(ids(filterChats(chats,projects,{projectId:'web',status:'failed',query:'connexion'})),['a']);
  assert.deepEqual(ids(filterChats(chats,projects,{projectId:'web'})),['c','a']);
  assert.deepEqual(filterChats(chats,projects,{status:'fail'}),[]);
  assert.deepEqual(filterChats(chats,projects,{projectId:'missing'}),[]);
});

test('unknown projects and partial records remain searchable and countable',()=>{
  const orphan={id:'orphan',project_id:'deleted',title:'Reprendre la migration',status:'idle'};
  const partial={id:'partial'};
  assert.deepEqual(filterChats([orphan,partial],projects,{query:'migration',projectId:'deleted'}),[orphan]);
  assert.deepEqual(ids(filterChats([partial,orphan],projects)),['orphan','partial']);
  assert.deepEqual([...projectChatCounts([...chats,orphan,partial,{project_id:null}])],[['web',2],['api',1],['deleted',1]]);
  assert.deepEqual([...projectChatCounts([])],[]);
});

test('timestamps prefer valid updates then creation and preserve an explicit zero',()=>{
  assert.equal(chatTimestamp({updated_at:'2026-10-09',updated:'2026-10-08',created_at:'2026-10-07'}),Date.parse('2026-10-09'));
  assert.equal(chatTimestamp({updated_at:'invalid',updated:'2026-10-08',created:'2026-10-07'}),Date.parse('2026-10-08'));
  assert.equal(chatTimestamp({updated_at:'invalid',updated:Infinity,created_at:'2026-10-07',created:'2026-10-06'}),Date.parse('2026-10-07'));
  assert.equal(chatTimestamp({updated:'   ',created_at:null,created:'2026-10-06'}),Date.parse('2026-10-06'));
  assert.equal(chatTimestamp({updated:0,created:'2026-10-06'}),0);
  assert.equal(chatTimestamp({created:new Date('2026-10-06')}),Date.parse('2026-10-06'));
  assert.equal(chatTimestamp({updated:false,created:'invalid'}),0);
  assert.equal(chatTimestamp({}),0);
});

test('recent and oldest sort use creation fallback with deterministic ties',()=>{
  const list=[...chats,{id:'z',created:'2026-10-08T09:00:00Z'},{id:'undated'}];
  assert.deepEqual(ids(filterChats(list,projects)),['c','b','a','z','undated']);
  assert.deepEqual(ids(filterChats(list,projects,{sort:'oldest'})),['undated','a','z','b','c']);
  assert.deepEqual(ids(filterChats([...list].reverse(),projects)),['c','b','a','z','undated']);
});

test('French title sorting handles accents and numbers without mutating inputs',()=>{
  const list=Object.freeze([
    Object.freeze({id:'z',title:'Écran 10'}),Object.freeze({id:'a',title:'ecran 2'}),Object.freeze({id:'b',title:'Écran 2'}),Object.freeze({id:'c',title:'Accueil'})
  ]);
  const frozenProjects=Object.freeze(projects.map(project=>Object.freeze({...project})));
  const result=filterChats(list,frozenProjects,{sort:'title'});
  assert.deepEqual(ids(result),['c','a','b','z']);
  assert.deepEqual(ids(list),['z','a','b','c']);
  assert.equal(result[0],list[3]);
});
