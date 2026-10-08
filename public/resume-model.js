import {conversation} from './workspace-model.js';
const short=(value,max=1800)=>{const text=String(value||'').trim();return text.length>max?text.slice(0,max)+'…':text;};
export function workspaceResume(workspace,events,{pendingIds=[]}={}){
  const model=conversation(events,{pendingIds});
  const final=model.messages.filter(m=>m.type==='agentMessage'&&m.status==='completed'&&m.text).at(-1);
  const lastInstruction=events.filter(e=>e.kind==='user'&&e.data?.text).at(-1);
  const decisions=[];
  for(const event of events){
    if(event.kind==='approval'){
      const approval=model.messages.find(m=>m.type==='approval'&&String(m.requestId)===String(event.data.id));
      decisions.push({text:`${event.data.accepted===true?'Autorisé':event.data.accepted===false?'Refusé':'Décision enregistrée'}${approval?.command?' : '+short(approval.command,350):' : action de l’agent'}`,created:event.created||null});
    }
    if(event.kind==='delivery')decisions.push({text:short(event.data?.text||'Livraison enregistrée',350)+(event.data?.sha?' · '+event.data.sha.slice(0,8):''),created:event.created||null});
  }
  const error=model.messages.filter(m=>m.type==='error'&&m.text).at(-1);
  const liveApproval=model.messages.find(m=>m.type==='approval'&&!m.resolved);
  const blockers={failed:error?.text||'L’exécution a échoué. Consultez la conversation.',interrupted:'L’exécution a été interrompue. Son historique est conservé.',waiting:liveApproval?liveApproval.reason||liveApproval.command||'Votre autorisation est requise.':'La demande doit être actualisée avant toute décision.'};
  const nextActions={idle:'Donner votre prochaine instruction',running:'Suivre le travail de l’agent',waiting:liveApproval?'Autoriser ou refuser l’action':'Actualiser les autorisations',failed:'Examiner l’échec avant de réessayer',interrupted:'Relire le contexte et reprendre la conversation',completed:'Relire les changements et préparer la livraison'};
  return {objective:short(workspace.title,500),lastInstruction:short(lastInstruction?.data.text),latestResult:short(final?.text,2600),decisions:decisions.slice(-4),blocker:short(blockers[workspace.status],1000),nextAction:nextActions[workspace.status]||'Consulter la conversation',updatedAt:events.at(-1)?.created||null};
}
