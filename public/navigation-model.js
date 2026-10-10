const validId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(value);
const simple=new Set(['home','projects','chats','activity','review','agents','missions','studio']);
const chatViews=new Set(['chats','project','activity']);
const statuses=new Set(['idle','running','waiting','completed','interrupted','failed']);
function withFilters(route,params){
  if(!route||!chatViews.has(route.view))return route;
  const query=params.get('q'),status=params.get('status'),sort=params.get('sort');
  return {...route,...(query?{query:query.slice(0,500)}:{}),...(statuses.has(status)?{status}:{}),...(['oldest','title'].includes(sort)?{sort}:{})};
}
export function parseRoute(hash){
  try{
    const [path,...search]=String(hash||'').replace(/^#\/?/,'').split('?');
    const parts=path.split('/').map(decodeURIComponent),params=new URLSearchParams(search.join('?'));
    if(parts.length===1&&simple.has(parts[0]))return withFilters({view:parts[0]},params);
    if(parts.length===2&&validId(parts[1])){
      if(parts[0]==='projects')return withFilters({view:'project',projectId:parts[1]},params);
      if(parts[0]==='chats')return withFilters({view:'chats',projectId:parts[1]},params);
      if(parts[0]==='activity')return withFilters({view:'activity',projectId:parts[1]},params);
      if(parts[0]==='workspaces')return {view:'workspace',workspaceId:parts[1]};
      if(parts[0]==='missions')return {view:'missions',missionId:parts[1]};
    }
    if(parts.length===3&&parts[0]==='prs'&&validId(parts[1])&&/^[1-9]\d{0,8}$/.test(parts[2]))return {view:'pr',projectId:parts[1],prNumber:Number(parts[2])};
  }catch{}
  return null;
}
export function routeFor({view,projectId,workspaceId,missionId,prNumber,query,status,sort}){
  const params=new URLSearchParams();
  if(chatViews.has(view)){
    if(query)params.set('q',String(query).slice(0,500));
    if(statuses.has(status))params.set('status',status);
    if(['oldest','title'].includes(sort))params.set('sort',sort);
  }
  const suffix=params.size?'?'+params.toString():'';
  if(view==='project'&&validId(projectId))return `#/projects/${projectId}${suffix}`;
  if(view==='chats')return `#/chats${validId(projectId)?'/'+projectId:''}${suffix}`;
  if(view==='activity')return `#/activity${validId(projectId)?'/'+projectId:''}${suffix}`;
  if(view==='workspace'&&validId(workspaceId))return `#/workspaces/${workspaceId}`;
  if(view==='missions'&&validId(missionId))return `#/missions/${missionId}`;
  if(view==='pr'&&validId(projectId)&&Number.isInteger(prNumber)&&prNumber>0&&prNumber<1e9)return `#/prs/${projectId}/${prNumber}`;
  return `#/${simple.has(view)?view:'home'}${suffix}`;
}
