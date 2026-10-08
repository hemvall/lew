import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { defaults,importAvatar } from './agents.mjs';
const stableId=role=>{const s=createHash('sha256').update('lew:builtin-avatar:'+role).digest('hex');return `${s.slice(0,8)}-${s.slice(8,12)}-4${s.slice(13,16)}-8${s.slice(17,20)}-${s.slice(20,32)}`;};
export const defaultMapping={idle:{kind:'animation',key:'idle'},running:{kind:'animation',key:'working'},awaiting_approval:{kind:'animation',key:'listening'},blocked:{kind:'animation',key:'confused'},completed:{kind:'animation',key:'celebrate'},error:{kind:'animation',key:'sad'}};
const names={orchestrator:'Atlas',developer:'Nova',reviewer:'Iris',validation:'Pulse'};
const descriptions={orchestrator:'Transforme votre objectif en un plan clair.',developer:'Implémente les changements dans une branche isolée.',reviewer:'Relit le code et demande les corrections utiles.',validation:'Exécute les vérifications avant la livraison.'};
export const builtinAvatars=defaults.map(p=>({id:stableId(p.role),...importAvatar(readFileSync(new URL(`./public/avatars/${p.role}.avatar.json`,import.meta.url),'utf8'),names[p.role])}));
export const builtinProfiles=defaults.map(p=>({...p,id:'builtin-'+p.role,template_key:p.role,name:names[p.role],description:descriptions[p.role],avatar_id:stableId(p.role),mapping:{...defaultMapping,running:{kind:'animation',key:p.role==='orchestrator'?'thinking':p.role==='reviewer'?'searching':p.role==='validation'?'listening':'working'}},config:{...p.config,avatarDefaultHandled:true}}));
export function routeProfiles(agents,overrides={}){
  const profiles={};for(const role of ['orchestrator','developer','reviewer','validation']){
    const eligible=agents.filter(p=>p.active&&p.role===role).sort((a,b)=>Number(b.template_key===role)-Number(a.template_key===role)||String(a.name).localeCompare(String(b.name))||String(a.id).localeCompare(String(b.id)));
    const selected=overrides[role]?eligible.find(p=>p.id===overrides[role]):eligible[0];if(!selected)throw new Error(`Aucun agent actif pour le rôle ${role}. Activez un profil dans Agents.`);profiles[role]=selected;
  }return profiles;
}
