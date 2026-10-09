// Normalize durable app-server events without depending on the DOM.
export function conversation(events,{pendingIds=[]}={}){
  const messages=[],items=new Map(),requests=new Map(),pending=new Set(pendingIds.map(String)),runs=[],usageByTurn=new Map(),totals=new Map(),starts=new Map();let plan=[],diff='';
  const usageOf=turn=>{const u=turn?.usage||turn?.tokenUsage||turn?.metrics||{};const input=u.input_tokens??u.inputTokens??u.prompt_tokens??u.promptTokens??null,output=u.output_tokens??u.outputTokens??u.completion_tokens??u.completionTokens??null,total=u.total_tokens??u.totalTokens??(Number.isFinite(input)&&Number.isFinite(output)?input+output:null);return {input,output,total};};
  const item=(id,type='agentMessage')=>{const key=String(id||'unknown');if(!items.has(key)){const value={id:key,type,text:'',output:'',status:'inProgress'};items.set(key,value);messages.push(value);}return items.get(key);};
  for(const e of events){
    const d=e.data||{};
    if(['user','system','error','delivery'].includes(e.kind)){messages.push({id:`event-${e.id}`,type:e.kind,text:d.text||'',url:d.url});continue;}
    if(e.kind==='approval'){const r=requests.get(String(d.id));if(r){r.resolved=true;r.accepted=d.accepted;}continue;}
    if(e.kind!=='codex')continue;
    const m=d,p=m.params||{};
    if(m.method==='turn/started')starts.set(p.turn?.id,e.created);
    if(m.method==='thread/tokenUsage/updated'){
      const total=p.tokenUsage?.total,previous=totals.get(p.threadId)||{};
      if(total){const key=p.turnId,u=usageByTurn.get(key)||{input:0,output:0,total:0,cached:0,reasoning:0};for(const [field,wire] of [['input','inputTokens'],['output','outputTokens'],['total','totalTokens'],['cached','cachedInputTokens'],['reasoning','reasoningOutputTokens']])u[field]+=Math.max(0,(total[wire]||0)-(previous[wire]||0));usageByTurn.set(key,u);totals.set(p.threadId,total);}
    }
    if(['item/started','item/completed'].includes(m.method)&&p.item){const v=p.item,current=item(v.id,v.type);Object.assign(current,v);current.status=v.status||(m.method==='item/completed'?'completed':'inProgress');if(v.type==='agentMessage'||v.type==='plan')current.text=v.text||current.text;if(v.aggregatedOutput!==undefined)current.output=v.aggregatedOutput;}
    if(m.method==='item/agentMessage/delta')item(p.itemId).text+=p.delta||'';
    if(m.method==='item/commandExecution/outputDelta')item(p.itemId,'commandExecution').output+=p.delta||'';
    if(m.method==='turn/plan/updated')plan=p.plan||[];
    if(m.method==='turn/diff/updated')diff=p.diff||'';
    if(m.method==='error'||m.method==='lew/workerError')messages.push({id:`error-${e.id}`,type:'error',text:p.error?.message||p.message||'Codex a rencontré une erreur.'});
    if(m.method==='turn/completed'){
      const usage=usageByTurn.get(p.turn?.id)||usageOf(p.turn),start=starts.get(p.turn?.id)||events.find(x=>x.kind==='turn'&&String(x.data?.id)===String(p.turn?.id))?.created||null;
      if(!runs.some(r=>r.id===p.turn?.id))runs.push({id:p.turn?.id||e.id,...(p.threadId?{threadId:p.threadId}:{}),status:p.turn?.status||'unknown',startedAt:start,finishedAt:e.created||null,durationMs:p.turn?.durationMs??(start&&e.created?Math.max(0,new Date(e.created)-new Date(start)):null),...usage});
      if(p.turn?.status==='failed')messages.push({id:`failed-${e.id}`,type:'error',text:p.turn.error?.message||'Cette exécution a échoué.'});
    }
    if(m.method==='serverRequest/resolved'){const r=requests.get(String(p.requestId));if(r)r.resolved=true;}
    if(m.id!==undefined&&['item/commandExecution/requestApproval','item/fileChange/requestApproval'].includes(m.method)){
      const r={id:`approval-${e.id}`,requestId:m.id,type:'approval',itemId:p.itemId,command:p.command,cwd:p.cwd,reason:p.reason,network:p.networkApprovalContext,grantRoot:p.grantRoot,resolved:false};requests.set(String(m.id),r);messages.push(r);
    }
  }
  for(const r of requests.values()){r.resolved=r.resolved||!pending.has(String(r.requestId));r.changes=items.get(String(r.itemId))?.changes||[];}
  const visible=[],errors=new Map();for(const m of messages){if(m.type==='reasoning')continue;if(m.type==='user')errors.clear();if(m.type==='error'){const previous=errors.get(m.text);if(previous){previous.occurrences=(previous.occurrences||1)+1;continue;}errors.set(m.text,m);}visible.push(m);}
  return {messages:visible,plan,diff,runs};
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

export function planKey(m){let hash=2166136261;for(const c of JSON.stringify(m.plan||{}))hash=Math.imul(hash^c.charCodeAt(0),16777619);return `${m.id}:${hash>>>0}`;}
export function pendingPlans(missions){return missions.filter(m=>m.status==='awaiting_plan'&&m.plan);}
export function watchMissionPlans({api,open}){
  let busy=false,audio,pendingSound=false;const seen=new Set();try{for(const k of JSON.parse(sessionStorage.getItem('lew-plan-notifications')||'[]'))seen.add(k);}catch{}
  function chime(){if(!audio||audio.state!=='running'){pendingSound=true;return;}pendingSound=false;for(const [i,f] of [660,880].entries()){const oscillator=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime+i*.15;oscillator.frequency.value=f;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.08,time+.02);gain.gain.exponentialRampToValueAtTime(.001,time+.25);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(time);oscillator.stop(time+.28);}}
  document.addEventListener('pointerdown',()=>{try{audio||=new (window.AudioContext||window.webkitAudioContext)();void audio.resume().then(()=>{if(pendingSound)chime();});}catch{}},{passive:true});
  const popup=document.createElement('div');popup.className='mission-notification';popup.setAttribute('role','status');popup.setAttribute('aria-live','polite');popup.hidden=true;document.body.append(popup);
  async function check(){if(busy)return;busy=true;try{const result=await api('missions');const plans=pendingPlans(result.missions||[]);document.querySelectorAll('button[data-view="missions"]').forEach(button=>{let badge=button.querySelector('.mission-alert-count');if(!badge){badge=document.createElement('span');badge.className='mission-alert-count';button.append(badge);}badge.hidden=!plans.length;badge.textContent=plans.length;button.setAttribute('aria-label',plans.length?`Missions · ${plans.length} plan(s) à valider`:'Missions');});
    const fresh=plans.filter(m=>!seen.has(planKey(m)));if(!plans.length){popup.hidden=true;pendingSound=false;}if(fresh.length){for(const m of fresh)seen.add(planKey(m));try{sessionStorage.setItem('lew-plan-notifications',JSON.stringify([...seen].slice(-100)));}catch{}const m=fresh[0];popup.replaceChildren();const title=document.createElement('strong');title.textContent=fresh.length>1?`${fresh.length} plans attendent votre validation`:'Votre plan est prêt à être validé';const text=document.createElement('p');text.textContent=m.objective;const review=document.createElement('button');review.className='primary';review.textContent='Relire le plan';review.onclick=()=>{popup.hidden=true;open(m.id);};const close=document.createElement('button');close.className='notification-close';close.setAttribute('aria-label','Fermer la notification');close.textContent='×';close.onclick=()=>popup.hidden=true;popup.append(title,text,review,close);popup.hidden=false;chime();}
  }catch{}finally{busy=false;}}
  void check();setInterval(check,10000);
}

// Prepare audio during the click; play feedback only after the server accepts.
export function prepareApprovalFeedback(){
  let audio;try{audio=new (window.AudioContext||window.webkitAudioContext)();void audio.resume();}catch{}
  return ()=>{
    const feedback=document.createElement('div');feedback.className='approval-feedback';feedback.setAttribute('role','status');const check=document.createElement('span');check.textContent='✓';const label=document.createElement('strong');label.textContent='Plan approuvé · Mission démarrée';feedback.append(check,label);document.body.append(feedback);setTimeout(()=>feedback.remove(),1800);
    if(audio){try{for(const [i,frequency] of [523.25,659.25,783.99].entries()){const oscillator=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime+i*.09;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.055,time+.015);gain.gain.exponentialRampToValueAtTime(.001,time+.35);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(time);oscillator.stop(time+.38);}setTimeout(()=>void audio.close(),1000);}catch{void audio.close();}}
  };
}
