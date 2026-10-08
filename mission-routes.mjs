import { randomUUID } from 'node:crypto';
import { defaults,validateProfile,importAvatar,validateMapping } from './agents.mjs';
import { MissionEngine } from './missions.mjs';
import { MissionAdapter } from './mission-adapter.mjs';
export function missionRoutes(deps){
  const {query,all,one,body,authWorker}=deps;
  const store={
    async list(){return (await all('SELECT data FROM missions ORDER BY created DESC')).map(r=>r.data);},
    async get(id){const r=await one('SELECT data FROM missions WHERE id=?',id);if(!r)throw new Error('Mission introuvable.');return r.data;},
    async save(m){const version=m.version||0;const r=await one(`INSERT INTO missions(id,project_id,status,data) VALUES(?,?,?,?::jsonb) ON CONFLICT(id) DO UPDATE SET status=CASE WHEN COALESCE((missions.data->>'version')::int,0)=? THEN excluded.status ELSE missions.status END, data=excluded.data || jsonb_build_object('status',CASE WHEN COALESCE((missions.data->>'version')::int,0)=? THEN excluded.status ELSE missions.status END,'version',COALESCE((missions.data->>'version')::int,0)+1),updated=now() RETURNING data`,m.id,m.projectId,m.status,JSON.stringify({...m,version:version+1}),version,version);m.status=r.data.status;m.version=r.data.version;},
    event(id,kind,data){return query('INSERT INTO mission_events(mission_id,kind,data) VALUES(?,?,?)',id,kind,JSON.stringify(data));},
    execution(id,w,data){return query('INSERT INTO mission_executions(id,mission_id,workspace_id,data) VALUES(?,?,?,?)',data.id,id,w.id,JSON.stringify(data));}
  };
  const adapter=new MissionAdapter(deps),engine=new MissionEngine(store,adapter);
  let seedPromise;
  async function ready(){await engine.recover();if(!seedPromise)seedPromise=(async()=>{for(const p of defaults)await query('INSERT INTO agents(id,template_key,name,description,role,instructions,config,mapping) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(template_key) DO NOTHING',randomUUID(),p.role,p.name,p.description,p.role,p.instructions,JSON.stringify(p.config),'{}');})().catch(e=>{seedPromise=null;throw e;});await seedPromise;}
  async function models(){try{let data=[],cursor;do{const page=await (await authWorker()).request('model/list',{limit:100,includeHidden:false,...(cursor?{cursor}:{})});data.push(...page.data);cursor=page.nextCursor;}while(cursor&&data.length<500);return data;}catch{return [];}}
  return {engine,async route(req,path){
    if(!/^\/api\/(agents|avatars|missions|models)(\/|$)/.test(path))return null;
    if(path==='/api/models'&&req.method==='GET')return {models:await models()};
    await ready();
    if(path==='/api/agents'&&req.method==='GET')return {agents:await all('SELECT * FROM agents ORDER BY name'),avatars:await all('SELECT * FROM avatars ORDER BY created')};
    if(path==='/api/avatars'&&req.method==='POST'){const b=await body(req),avatar=importAvatar(b.source,b.name),id=randomUUID();await query('INSERT INTO avatars(id,name,definition) VALUES(?,?,?)',id,avatar.name,JSON.stringify(avatar.definition));return {id,...avatar};}
    const agent=path.match(/^\/api\/agents(?:\/([^/]+))?$/);
    if(agent&&req.method==='POST'){const b=await body(req),p=validateProfile(b,await models()),id=agent[1]||randomUUID();if(p.avatar_id){const a=await one('SELECT * FROM avatars WHERE id=?',p.avatar_id);if(!a)throw new Error('Avatar introuvable.');validateMapping(p,a);}else if(Object.keys(p.mapping).length)throw new Error('Sélectionnez un avatar pour les associations.');if(agent[1]&&!await one('SELECT id FROM agents WHERE id=?',id))throw new Error('Profil introuvable.');await query('INSERT INTO agents(id,name,description,role,instructions,config,mapping,avatar_id,active) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,role=excluded.role,instructions=excluded.instructions,config=excluded.config,mapping=excluded.mapping,avatar_id=excluded.avatar_id,active=excluded.active,updated=now()',id,p.name,p.description,p.role,p.instructions,JSON.stringify(p.config),JSON.stringify(p.mapping),p.avatar_id,p.active);return {id};}
    if(path==='/api/missions'&&req.method==='GET')return {missions:await store.list()};
    if(path==='/api/missions'&&req.method==='POST'){const b=await body(req),project=await one('SELECT * FROM projects WHERE id=?',b.projectId);if(!project)throw new Error('Projet introuvable.');const profiles={};for(const role of ['orchestrator','developer','reviewer','validation']){const p=await one('SELECT * FROM agents WHERE id=?',b.profiles?.[role]);if(p?.avatar_id)p.avatar=await one('SELECT * FROM avatars WHERE id=?',p.avatar_id);profiles[role]=p;}const account=await (await authWorker()).request('account/read',{refreshToken:false});if(account.requiresOpenaiAuth&&!account.account)throw new Error('Connectez Codex avant de lancer la mission.');return engine.create(b,project,profiles);}
    const mission=path.match(/^\/api\/missions\/([^/]+)(?:\/(approve|pause|resume|interrupt|cancel|publish))?$/);
    if(mission){if(req.method==='GET'&&!mission[2]){const m=await store.get(mission[1]);return {mission:m,events:await all('SELECT * FROM mission_events WHERE mission_id=? ORDER BY id',m.id),executions:await all('SELECT e.*,w.status AS workspace_status FROM mission_executions e JOIN workspaces w ON w.id=e.workspace_id WHERE mission_id=? ORDER BY e.created',m.id)};}if(req.method==='POST'&&mission[2]==='publish'){const m=await store.get(mission[1]);if(!['ready','published'].includes(m.status))throw new Error('Mission non validée.');const pr=await adapter.publish(m);m.pr=pr;m.status='published';await store.save(m);await store.event(m.id,'published',pr);return pr;}if(req.method==='POST'&&mission[2])return mission[2]==='approve'?engine.approve(mission[1],(await body(req)).plan):engine.control(mission[1],mission[2]);}
    throw new Error('Route mission inconnue.');
  }};
}
