export function approvalNotifications({api,openWorkspace,document:doc=document}){
  const host=doc.createElement('section');host.className='approval-notifications';host.setAttribute('aria-label','Autorisations des agents');doc.body.append(host);
  const cards=new Map(),dismissed=new Set(),seen=new Set();let audio,pendingSound=false;
  const reopen=doc.createElement('button');reopen.className='approval-reopen';reopen.hidden=true;host.append(reopen);
  const make=(tag,className,text)=>{const el=doc.createElement(tag);el.className=className;if(text)el.textContent=text;return el;};
  function chime(){
    if(!audio||audio.state!=='running'){pendingSound=true;return;}
    pendingSound=false;
    for(const [frequency,delay] of [[660,0],[880,.12]]){const tone=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+delay;tone.type='sine';tone.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.055,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.35);tone.connect(gain);gain.connect(audio.destination);tone.start(start);tone.stop(start+.36);}
  }
  async function unlock(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio||=new Audio();await audio.resume();if(pendingSound)chime();}catch{}}
  doc.addEventListener('pointerdown',unlock);doc.addEventListener('keydown',unlock);
  function remove(key){const card=cards.get(key);if(!card)return;cards.delete(key);if(matchMedia('(prefers-reduced-motion:reduce)').matches){card.remove();return;}card.classList.add('leaving');setTimeout(()=>card.remove(),180);}
  function counter(items){const count=items.filter(item=>dismissed.has(item.key)).length;reopen.hidden=!count;reopen.textContent=`${count} autorisation${count>1?'s':''} en attente`;} 
  let current=[];
  reopen.onclick=()=>{dismissed.clear();update(current);};
  function update(items){
    current=items||[];const active=new Set(current.map(item=>item.key));for(const key of cards.keys())if(!active.has(key))remove(key);for(const key of dismissed)if(!active.has(key))dismissed.delete(key);
    let ring=false;
    for(const item of current){
      if(!seen.has(item.key)){seen.add(item.key);ring=true;}
      if(cards.has(item.key)||dismissed.has(item.key))continue;
      const card=make('article','approval-notification');card.setAttribute('role','status');
      const top=make('div','approval-notification-top'),mark=make('span','approval-notification-mark','!'),identity=make('div','approval-notification-identity');identity.append(make('strong','',item.title),make('small','','Votre autorisation est requise'));
      const close=make('button','approval-notification-close','×');close.setAttribute('aria-label','Masquer la notification sans répondre');close.title='Masquer sans répondre';close.onclick=()=>{dismissed.add(item.key);remove(item.key);counter(current);};top.append(mark,identity,close);card.append(top);
      card.append(make('p','approval-notification-reason',item.reason||(item.kind==='files'?'L’agent demande un accès supplémentaire aux fichiers.':'L’agent demande une permission supplémentaire.')));
      const details=make('details','approval-notification-details'),summary=make('summary','','Voir l’action');details.append(summary);
      if(item.command)details.append(make('pre','',item.command));
      if(item.cwd)details.append(make('p','','Dossier : '+item.cwd));
      if(item.network)details.append(make('p','','Réseau : '+(item.network.host||'')));
      if(item.grantRoot)details.append(make('p','','Accès : '+item.grantRoot));
      for(const path of Object.keys(item.changes||{}))details.append(make('p','',path));
      card.append(details);
      let remember;
      if(item.canRemember){const label=make('label','approval-notification-remember');remember=make('input','');remember.type='checkbox';remember.checked=true;label.append(remember,doc.createTextNode('Mémoriser pour cette session'));card.append(label);}
      const bottom=make('div','approval-notification-bottom'),open=make('button','approval-notification-open','Ouvrir la conversation'),actions=make('div','approval-notification-actions');open.onclick=()=>openWorkspace(item);bottom.append(open,actions);
      const error=make('p','approval-notification-error');error.setAttribute('role','alert');error.hidden=true;
      for(const [accept,symbol,label] of [[false,'×','Refuser'],[true,'✓','Autoriser']]){
        const button=make('button',accept?'approve':'decline',symbol);button.setAttribute('aria-label',label);button.title=label;
        button.onclick=async()=>{actions.querySelectorAll('button').forEach(b=>b.disabled=true);error.hidden=true;try{await api(`workspaces/${encodeURIComponent(item.workspaceId)}/approval`,'POST',{id:item.requestId,accept,session:accept&&!!remember?.checked});dismissed.add(item.key);remove(item.key);counter(current.filter(x=>x.key!==item.key));}catch(e){error.textContent=e.message;error.hidden=false;actions.querySelectorAll('button').forEach(b=>b.disabled=false);}};actions.append(button);
      }
      card.append(bottom,error);cards.set(item.key,card);host.insertBefore(card,reopen);
    }
    counter(current);if(ring)chime();
  }
  return {update};
}
