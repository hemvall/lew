// Routine work stays inside the selected sandbox; network is available for builds/tests.
export const autonomyInstructions='Exécute directement les lectures, modifications et vérifications nécessaires à la tâche approuvée dans le sandbox. Ne demande pas une confirmation conversationnelle pour chaque commande. Utilise les demandes d’approbation du worker uniquement lorsqu’une permission supplémentaire est indispensable. Respecte les limites du profil et les instructions du dépôt.';
export function turnPermissions(cwd,config={}){
  if(config.sandbox==='read-only')return {};
  return {sandboxPolicy:{type:'workspaceWrite',writableRoots:[cwd],networkAccess:true}};
}
export function approvalDecision(request,accept,session=false){
  if(!accept)return 'decline';
  const choices=request.params?.availableDecisions;
  return session&&(!choices||choices.includes('acceptForSession'))?'acceptForSession':'accept';
}
export function pendingApprovals(approvals,workspaces){
  return [...approvals.entries()].map(([key,request])=>{
    const workspaceId=key.slice(0,key.indexOf(':')),w=workspaces.find(w=>w.id===workspaceId),p=request.params||{};
    return {key,workspaceId,requestId:request.id,title:w?.agent_profile?.name||w?.title||'Agent',projectId:w?.project_id,kind:request.method.includes('fileChange')?'files':'command',command:p.command||'',reason:p.reason||'',cwd:p.cwd||'',network:p.networkApprovalContext,grantRoot:p.grantRoot,changes:p.changes||{},canRemember:!p.availableDecisions||p.availableDecisions.includes('acceptForSession')};
  });
}
