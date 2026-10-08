const validId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(value);
const simple=new Set(['home','projects','activity','review','agents','missions']);
export function parseRoute(hash){
  try{
    const parts=String(hash||'').replace(/^#\/?/,'').split('/').map(decodeURIComponent);
    if(parts.length===1&&simple.has(parts[0]))return {view:parts[0]};
    if(parts.length===2&&validId(parts[1])){
      if(parts[0]==='projects')return {view:'project',projectId:parts[1]};
      if(parts[0]==='workspaces')return {view:'workspace',workspaceId:parts[1]};
      if(parts[0]==='missions')return {view:'missions',missionId:parts[1]};
    }
    if(parts.length===3&&parts[0]==='prs'&&validId(parts[1])&&/^[1-9]\d{0,8}$/.test(parts[2]))return {view:'pr',projectId:parts[1],prNumber:Number(parts[2])};
  }catch{}
  return null;
}
export function routeFor({view,projectId,workspaceId,missionId,prNumber}){
  if(view==='project'&&validId(projectId))return `#/projects/${projectId}`;
  if(view==='workspace'&&validId(workspaceId))return `#/workspaces/${workspaceId}`;
  if(view==='missions'&&validId(missionId))return `#/missions/${missionId}`;
  if(view==='pr'&&validId(projectId)&&Number.isInteger(prNumber)&&prNumber>0&&prNumber<1e9)return `#/prs/${projectId}/${prNumber}`;
  return `#/${simple.has(view)?view:'home'}`;
}
