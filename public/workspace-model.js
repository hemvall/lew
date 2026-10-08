// Normalize durable app-server events without depending on the DOM.
export function conversation(events,{pendingIds=[]}={}){
  const messages=[],items=new Map(),requests=new Map(),pending=new Set(pendingIds.map(String));let plan=[],diff='';
  const item=(id,type='agentMessage')=>{const key=String(id||'unknown');if(!items.has(key)){const value={id:key,type,text:'',output:'',status:'inProgress'};items.set(key,value);messages.push(value);}return items.get(key);};
  for(const e of events){
    const d=e.data||{};
    if(['user','system','error','delivery'].includes(e.kind)){messages.push({id:`event-${e.id}`,type:e.kind,text:d.text||'',url:d.url});continue;}
    if(e.kind==='approval'){const r=requests.get(String(d.id));if(r){r.resolved=true;r.accepted=d.accepted;}continue;}
    if(e.kind!=='codex')continue;
    const m=d,p=m.params||{};
    if(['item/started','item/completed'].includes(m.method)&&p.item){const v=p.item,current=item(v.id,v.type);Object.assign(current,v);current.status=v.status||(m.method==='item/completed'?'completed':'inProgress');if(v.type==='agentMessage'||v.type==='plan')current.text=v.text||current.text;if(v.aggregatedOutput!==undefined)current.output=v.aggregatedOutput;}
    if(m.method==='item/agentMessage/delta')item(p.itemId).text+=p.delta||'';
    if(m.method==='item/commandExecution/outputDelta')item(p.itemId,'commandExecution').output+=p.delta||'';
    if(m.method==='turn/plan/updated')plan=p.plan||[];
    if(m.method==='turn/diff/updated')diff=p.diff||'';
    if(m.method==='error'||m.method==='lew/workerError')messages.push({id:`error-${e.id}`,type:'error',text:p.error?.message||p.message||'Codex a rencontré une erreur.'});
    if(m.method==='turn/completed'&&p.turn?.status==='failed')messages.push({id:`failed-${e.id}`,type:'error',text:p.turn.error?.message||'Cette exécution a échoué.'});
    if(m.method==='serverRequest/resolved'){const r=requests.get(String(p.requestId));if(r)r.resolved=true;}
    if(m.id!==undefined&&['item/commandExecution/requestApproval','item/fileChange/requestApproval'].includes(m.method)){
      const r={id:`approval-${e.id}`,requestId:m.id,type:'approval',itemId:p.itemId,command:p.command,cwd:p.cwd,reason:p.reason,network:p.networkApprovalContext,grantRoot:p.grantRoot,resolved:false};requests.set(String(m.id),r);messages.push(r);
    }
  }
  for(const r of requests.values()){r.resolved=r.resolved||!pending.has(String(r.requestId));r.changes=items.get(String(r.itemId))?.changes||[];}
  return {messages:messages.filter(m=>m.type!=='reasoning'),plan,diff};
}
export function diffLines(patch){
  let old=null,next=null;return String(patch||'').split('\n').map(text=>{
    const h=text.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if(h){old=Number(h[1]);next=Number(h[2]);return {kind:'hunk',text,old:null,next:null};}
    if(old===null||text.startsWith('diff ')||text.startsWith('index ')||text.startsWith('--- ')||text.startsWith('+++ ')||text.startsWith('\\'))return {kind:'meta',text,old:null,next:null};
    if(text.startsWith('+'))return {kind:'add',text,old:null,next:next++};
    if(text.startsWith('-'))return {kind:'remove',text,old:old++,next:null};
    return {kind:'context',text,old:old++,next:next++};
  });
}
export function sortedProjects(projects){return [...projects].sort((a,b)=>Number(!!b.favorite)-Number(!!a.favorite)||(b.last_opened||'').localeCompare(a.last_opened||'')||a.name.localeCompare(b.name));}
