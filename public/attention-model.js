// One action list drives the inbox and every attention count.
export function attentionItems({projects=[],workspaces=[],missions=[],pendingWorkspaceIds}={}){
  const projectNames=new Map(projects.map(p=>[p.id,p.name]));
  const owners=new Map();
  for(const m of missions)for(const execution of m.executions||[])if(execution.workspaceId)owners.set(execution.workspaceId,m.id);
  const pending=pendingWorkspaceIds===undefined?null:new Set(pendingWorkspaceIds);
  const items=[];
  for(const w of workspaces){
    const missionId=w.mission_id||owners.get(w.id),kind={waiting:'approval',failed:'blocked',interrupted:'resume'}[w.status];
    if(!kind||(missionId&&w.status!=='waiting')||(w.status==='waiting'&&pending&&!pending.has(w.id)))continue;
    items.push({id:`workspace:${w.id}`,kind,target:'workspace',workspaceId:w.id,missionId:missionId||null,projectId:w.project_id,projectName:projectNames.get(w.project_id)||'Projet',title:w.title,branch:w.branch||'',action:{waiting:'Autoriser ou refuser',failed:'Examiner l’échec',interrupted:'Reprendre la conversation'}[w.status],detail:{waiting:'L’agent attend votre autorisation.',failed:'Consultez le résultat avant de réessayer.',interrupted:'Le travail a été interrompu. Décidez de la suite.'}[w.status]});
  }
  for(const m of missions){
    const decision={
      awaiting_plan:['plan','Approuver le plan','Relisez le plan avant de lancer le développement.'],
      ready:['delivery','Relire et publier la PR','La revue et les vérifications sont terminées.'],
      blocked:['blocked','Résoudre le blocage',m.error||'Consultez les résultats avant de reprendre.'],
      interrupted:['resume','Reprendre la mission','Les étapes terminées sont conservées.'],
      paused:['resume','Reprendre la mission','La mission est en pause.']
    }[m.status];
    if(!decision||(m.status==='paused'&&m.activeWorkspace))continue;
    items.push({id:`mission:${m.id}`,kind:decision[0],target:'mission',missionId:m.id,projectId:m.projectId,projectName:projectNames.get(m.projectId)||m.project?.name||'Projet',title:m.objective,branch:m.base||'',action:decision[1],detail:decision[2]});
  }
  const order={approval:0,plan:1,blocked:2,resume:3,delivery:4};
  return items.sort((a,b)=>order[a.kind]-order[b.kind]||a.id.localeCompare(b.id));
}

export function filterAttention(items,query='',kind='all'){
  const needle=query.trim().toLocaleLowerCase();
  return items.filter(item=>(kind==='all'||item.kind===kind)&&[item.title,item.projectName,item.branch,item.action,item.detail].join(' ').toLocaleLowerCase().includes(needle));
}
