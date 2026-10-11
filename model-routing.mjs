// Choose only models and reasoning levels advertised by this worker.
export function selectRoute(models,text,config={}) {
  const complex=/architecture|migration|sécurité|security|refonte complète|race condition|concurrence|data loss/i.test(text);
  const candidates=models.filter(m=>!m.hidden);
  const selected=config.model?candidates.find(m=>m.model===config.model):
    candidates.find(m=>!complex&&/luna|mini/.test(m.model))||candidates.find(m=>/sol|codex/.test(m.model)&&!/astra|terra/.test(m.model))||candidates.find(m=>/luna|mini/.test(m.model))||candidates.find(m=>m.isDefault)||candidates[0];
  if(!selected)throw new Error('Aucun modèle disponible pour cette tâche.');
  const supported=(selected.supportedReasoningEfforts||[]).map(x=>x.reasoningEffort);
  const desired=config.effort||(complex?'medium':'low');
  if(config.effort&&!supported.includes(config.effort))throw new Error('Effort indisponible pour le modèle sélectionné.');
  const effort=supported.includes(desired)?desired:supported.find(x=>['minimal','low','medium','high'].includes(x));
  if(!effort)throw new Error('Ce modèle ne propose aucun effort adapté.');
  return {model:selected.model,effort,automatic:!config.model,reason:config.model?'Profil choisi':complex?'Tâche complexe · effort modéré':'Mode économe par défaut'};
}
