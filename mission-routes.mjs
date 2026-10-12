import {workerPreflight,requireWorkerReady} from './worker-preflight.mjs';
import { builtinAvatars,builtinProfiles,routeProfiles } from './agent-catalog.mjs';
import { legacyInstructions } from './agent-instructions.mjs';
import { randomUUID } from 'node:crypto';
import { defaults,validateProfile,importAvatar,validateMapping } from './agents.mjs';
import { MissionEngine } from './missions.mjs';
import { MissionAdapter } from './mission-adapter.mjs';
import { summarizeMissionTitle,cleanMissionTitle } from './mission-titles.mjs';
export function missionRoutes(deps){
  const {query,all,one,body,authWorker,storageState}=deps;
  const store={
    async list(){return (await all('SELECT data FROM lew.missions ORDER BY created DESC')).map(r=>r.data);},
    async get(id){const r=await one('SELECT data FROM lew.missions WHERE id=?',id);if(!r)throw new Error('Mission introuvable.');return r.data;},
    async save(m){const version=m.version||0;const r=await one(`INSERT INTO lew.missions(id,project_id,status,data) VALUES(?,?,?,?::jsonb) ON CONFLICT(id) DO UPDATE SET status=CASE WHEN COALESCE((missions.data->>'version')::int,0)=? THEN excluded.status ELSE missions.status END, data=excluded.data || CASE WHEN NOT jsonb_exists(excluded.data,'title') AND jsonb_exists(missions.data,'title') THEN jsonb_build_object('title',missions.data->'title') ELSE '{}'::jsonb END || jsonb_build_object('status',CASE WHEN COALESCE((missions.data->>'version')::int,0)=? THEN excluded.status ELSE missions.status END,'version',COALESCE((missions.data->>'version')::int,0)+1),updated=now() RETURNING data`,m.id,m.projectId,m.status,JSON.stringify({...m,version:version+1}),version,version);m.status=r.data.status;m.version=r.data.version;},
    event(id,kind,data){return query('INSERT INTO lew.mission_events(mission_id,kind,data) VALUES(?,?,?)',id,kind,JSON.stringify(data));},
    execution(id,w,data){return query('INSERT INTO lew.mission_executions(id,mission_id,workspace_id,data) VALUES(?,?,?,?)',data.id,id,w.id,JSON.stringify(data));}
  };
  const adapter=new MissionAdapter(deps),engine=new MissionEngine(store,adapter);
  const titleRequests=new Map();
  let seedPromise;
  async function ready(){await engine.recover();if(!seedPromise)seedPromise=(async()=>{
    for(const a of builtinAvatars)await query('INSERT INTO lew.avatars(id,name,definition) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET definition=excluded.definition',a.id,a.name,JSON.stringify(a.definition));
    for(const p of builtinProfiles){await query('INSERT INTO lew.agents(id,template_key,name,description,role,instructions,config,mapping,avatar_id) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(template_key) DO NOTHING',randomUUID(),p.role,p.name,p.description,p.role,p.instructions,JSON.stringify(p.config),JSON.stringify(p.mapping),p.avatar_id);
      await query("UPDATE lew.agents SET avatar_id=COALESCE(avatar_id,?),mapping=CASE WHEN mapping='{}'::jsonb THEN ?::jsonb ELSE mapping END,config=config || '{\"avatarDefaultHandled\":true}'::jsonb WHERE template_key=? AND NOT COALESCE((config->>'avatarDefaultHandled')::boolean,false)",p.avatar_id,JSON.stringify(p.mapping),p.role);
      await query('UPDATE lew.agents SET instructions=?,updated=now() WHERE template_key=? AND instructions=?',p.instructions,p.role,legacyInstructions[p.role]);
      if(p.role==='validation')await query("UPDATE lew.agents SET mapping=jsonb_set(mapping,'{running}',?::jsonb),updated=now() WHERE template_key=? AND avatar_id=? AND mapping->'running'=?::jsonb",JSON.stringify(p.mapping.running),p.role,p.avatar_id,JSON.stringify({kind:'animation',key:'working'}));
    }
  })().catch(e=>{seedPromise=null;throw e;});await seedPromise;}
  async function models(){try{let data=[],cursor;do{const page=await (await authWorker()).request('model/list',{limit:100,includeHidden:false,...(cursor?{cursor}:{})});data.push(...page.data);cursor=page.nextCursor;}while(cursor&&data.length<500);return data;}catch{return [];}}
  return {engine,async route(req,path){
    if(!/^\/api\/(agents|avatars|missions|models)(\/|$)/.test(path))return null;
    if(path==='/api/models'&&req.method==='GET')return {models:await models()};
    if(path==='/api/agents'&&req.method==='GET'&&storageState&&!storageState().ready)return {agents:builtinProfiles,avatars:builtinAvatars,persisted:false,storage:storageState()};
    if(path==='/api/missions/preflight'&&req.method==='GET')return (deps.workerPreflight||workerPreflight)();
    if(path==='/api/missions'&&req.method==='POST')await requireWorkerReady(deps.workerPreflight||workerPreflight);
    await ready();
    if(path==='/api/agents'&&req.method==='GET')return {agents:await all('SELECT * FROM lew.agents ORDER BY name'),avatars:await all('SELECT * FROM lew.avatars ORDER BY created'),persisted:true};
    if(path==='/api/avatars'&&req.method==='POST'){const b=await body(req),avatar=importAvatar(b.source,b.name),id=randomUUID();await query('INSERT INTO lew.avatars(id,name,definition) VALUES(?,?,?)',id,avatar.name,JSON.stringify(avatar.definition));return {id,...avatar};}
    const agent=path.match(/^\/api\/agents(?:\/([^/]+))?$/);
    if(agent&&req.method==='POST'){const b=await body(req),p=validateProfile(b,await models()),id=agent[1]||randomUUID();if(p.avatar_id){const a=await one('SELECT * FROM lew.avatars WHERE id=?',p.avatar_id);if(!a)throw new Error('Avatar introuvable.');validateMapping(p,a);}else if(Object.keys(p.mapping).length)throw new Error('Sélectionnez un avatar pour les associations.');if(agent[1]&&!await one('SELECT id FROM lew.agents WHERE id=?',id))throw new Error('Profil introuvable.');await query('INSERT INTO lew.agents(id,name,description,role,instructions,config,mapping,avatar_id,active) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,role=excluded.role,instructions=excluded.instructions,config=excluded.config,mapping=excluded.mapping,avatar_id=excluded.avatar_id,active=excluded.active,updated=now()',id,p.name,p.description,p.role,p.instructions,JSON.stringify(p.config),JSON.stringify(p.mapping),p.avatar_id,p.active);return {id};}
    if(path==='/api/missions/route'&&req.method==='GET')return {profiles:routeProfiles(await all('SELECT * FROM lew.agents WHERE active=true'))};
    if(path==='/api/missions'&&req.method==='GET')return {missions:await store.list()};
    if(path==='/api/missions'&&req.method==='POST'){const b=await body(req),project=await one('SELECT * FROM lew.projects WHERE id=?',b.projectId);if(!project)throw new Error('Projet introuvable.');const profiles=routeProfiles(await all('SELECT * FROM lew.agents WHERE active=true'),b.profiles||{});for(const p of Object.values(profiles))if(p.avatar_id)p.avatar=await one('SELECT * FROM lew.avatars WHERE id=?',p.avatar_id);const account=await (await authWorker()).request('account/read',{refreshToken:false});if(account.requiresOpenaiAuth&&!account.account)throw new Error('Connectez Codex avant de lancer la mission.');return engine.create({...b,criteria:b.criteria||'Objectif implémenté, contraintes du projet respectées, revue sans défaut bloquant et vérifications pertinentes réussies.'},project,profiles);}
    const titleRoute=path.match(/^\/api\/missions\/([^/]+)\/title$/);
    if(titleRoute&&req.method==='POST'){
      const id=titleRoute[1];
      if(!titleRequests.has(id))titleRequests.set(id,(async()=>{
        const m=await store.get(id),existing=cleanMissionTitle(m.title);
        if(existing)return {title:existing};
        const planner=m.executions.find(x=>x.role==='orchestrator'),workspace=planner?.workspaceId?await one('SELECT thread_id FROM lew.workspaces WHERE id=?',planner.workspaceId):null;
        const title=await summarizeMissionTitle(m,{threadId:workspace?.thread_id});
        const saved=await one("UPDATE lew.missions SET data=jsonb_set(data,'{title}',to_jsonb(?::text),true),updated=now() WHERE id=? AND COALESCE(data->>'title','')='' RETURNING data",title,id);
        return {title:saved?.data.title||(await store.get(id)).title};
      })().finally(()=>titleRequests.delete(id)));
      return titleRequests.get(id);
    }
    const mission=path.match(/^\/api\/missions\/([^/]+)(?:\/(approve|pause|resume|interrupt|cancel|publish))?$/);
    if(mission){if(req.method==='GET'&&!mission[2]){const m=await store.get(mission[1]);return {mission:m,events:await all('SELECT * FROM lew.mission_events WHERE mission_id=? ORDER BY id',m.id),executions:await all('SELECT e.*,w.status AS workspace_status FROM lew.mission_executions e JOIN lew.workspaces w ON w.id=e.workspace_id WHERE mission_id=? ORDER BY e.created',m.id)};}if(req.method==='POST'&&mission[2]==='publish'){const m=await store.get(mission[1]);if(!['ready','published'].includes(m.status))throw new Error('Mission non validée.');const pr=await adapter.publish(m);m.pr=pr;m.status='published';await store.save(m);await store.event(m.id,'published',pr);return pr;}if(req.method==='POST'&&mission[2])return mission[2]==='approve'?engine.approve(mission[1],(await body(req)).plan):engine.control(mission[1],mission[2]);}
    throw new Error('Route mission inconnue.');
  }};
}
