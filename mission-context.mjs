export function missionContext(workspace,missions){
  if(!workspace.mission_id)return null;
  const mission=missions.find(m=>m.id===workspace.mission_id);if(!mission)return {id:workspace.mission_id,available:false};
  const execution=(mission.executions||[]).find(x=>x.workspaceId===workspace.id),task=(mission.tasks||[]).find(t=>t.id===execution?.taskId);
  return {id:mission.id,available:true,objective:mission.objective,status:mission.status,role:execution?.role||workspace.agent_profile?.role||null,task:task?{title:task.title,stage:task.stage,status:task.status}:null};
}
