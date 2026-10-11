import {conversation} from './workspace-model.js';
export function verificationEvidence(events=[]){
  // Restrict evidence to the latest human instruction/turn; old successes cannot mask a retry.
  let start=0;for(let i=0;i<events.length;i++)if(events[i].kind==='user'||events[i].kind==='turn'||events[i].data?.method==='turn/started')start=i;
  return conversation(events.slice(start)).messages.filter(m=>m.type==='commandExecution'&&m.command).map(m=>({command:m.command,exitCode:Number.isInteger(m.exitCode)?m.exitCode:null,state:m.status==='completed'&&m.exitCode===0?'success':m.status==='failed'||(Number.isInteger(m.exitCode)&&m.exitCode!==0)?'failure':'unknown'}));
}
export function publicationBody(title,summary,commands){
  const evidence=commands.length?commands.map(c=>`- ${c.command.replace(/[\r\n]+/g,' ')} — ${c.state==='success'?'terminée, code 0':c.state==='failure'?'échec, code '+(c.exitCode??'inconnu'):'résultat non confirmé'}`).join('\n'):'Aucune commande avec résultat observé dans la dernière exécution.';
  return `## Objectif\n${title}\n\n## Résultat rapporté\n${summary||'À préciser après revue des changements.'}\n\n## Commandes observées\n${evidence}\n\nCes résultats proviennent de la dernière exécution enregistrée. Vérifier leur pertinence et relancer les contrôles si les fichiers ont changé depuis.`;
}
