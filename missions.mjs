import { randomUUID } from 'node:crypto';
import { validatePlan,limits,parseResult,planSchema,resultSchema,recoverMission,transition,reviewValid } from './mission-model.mjs';
import { agentPrompt } from './agents.mjs';
export class MissionEngine {
  constructor(store,adapter){this.store=store;this.adapter=adapter;this.running=new Map();this.controls=new Set();this.recovered=false;this.queue=Promise.resolve();}
  async recover(){if(this.recovery)return this.recovery;this.recovery=this.performRecovery().catch(e=>{this.recovery=null;throw e;});return this.recovery;}
  async performRecovery(){if(this.recovered)return;for(const row of await this.store.list()){const next=recoverMission(row);if(next.status!==row.status){await this.store.save(next);await this.store.event(next.id,'recovery',{text:'Exécution interrompue par le redémarrage. Reprise explicite requise.'});}}this.recovered=true;}
  async create(input,project,profiles){
    const objective=String(input.objective||'').trim(),criteria=String(input.criteria||'').trim();if(!objective||objective.length>12000||!criteria||criteria.length>12000)throw new Error('Objectif et critères de réussite requis.');
    const base=String(input.base||'main');if(!/^[\w./-]+$/.test(base)||base.startsWith('-')||base.includes('..'))throw new Error('Branche de départ invalide.');
    for(const role of ['orchestrator','developer','reviewer','validation'])if(!profiles[role]?.active||profiles[role].role!==role)throw new Error('Sélectionnez un profil actif pour chaque rôle.');
    if(!profiles.developer.config.allowCommit)throw new Error('Le développeur doit être autorisé à créer les commits de la mission.');
    const m={id:randomUUID(),projectId:project.id,project:structuredClone(project),objective,criteria,base,profiles:structuredClone(profiles),limits:limits(input.limits),status:'planning',tasks:[],executions:[],startedAt:Date.now(),plan:null,activeWorkspace:null,error:null};
    await this.store.save(m);await this.store.event(m.id,'created',{text:objective});this.launch(m.id,true);return m;
  }
  launch(id,planning=false){if(this.running.has(id))return;const job=this.queue.then(()=>this.run(id,planning)).catch(async e=>{const m=await this.store.get(id);if(!['cancelled','interrupted','interrupting'].includes(m.status)){m.status='blocked';m.error=e.message;for(const task of m.tasks)if(task.status==='running')task.status='interrupted';await this.store.save(m);await this.store.event(id,'error',{text:e.message});}}).finally(()=>this.running.delete(id));this.running.set(id,job);this.queue=job.catch(()=>{});}
  async execute(m,role,task,cwd,handoff,schema){
    if(Date.now()>m.startedAt+m.limits.durationMinutes*60000)throw new Error('Durée maximale de mission atteinte.');
    const profile=m.profiles[role],ex={id:randomUUID(),role,taskId:task?.id||null,profile:structuredClone(profile),status:'running',startedAt:Date.now()};m.executions.push(ex);await this.store.save(m);
    const w=await this.adapter.workspace(m,role,task,cwd);ex.workspaceId=w.id;m.activeWorkspace=w.id;await this.store.save(m);await this.store.execution(m.id,w,ex);await this.store.event(m.id,'execution',{role,workspaceId:w.id,text:`${profile.name} : ${task?.title||'planification'}`});
    try{const output=await this.adapter.execute(w,profile,agentPrompt(profile,m.project,m.objective+'\nCritères : '+m.criteria,task?.instructions||'Proposer un plan séquentiel de tâches de développement. Chaque tâche après la première dépend de la précédente. Aucun travail avant approbation humaine.',handoff),schema,m.startedAt+m.limits.durationMinutes*60000);ex.status='completed';ex.result=output;ex.finishedAt=Date.now();return output;}
    catch(e){ex.status='error';ex.error=e.message;throw e;}
    finally{m.activeWorkspace=null;await this.store.save(m);}
  }
  async boundary(m){const fresh=await this.store.get(m.id);m.status=fresh.status;m.version=fresh.version;if(['cancelled','interrupting','interrupted'].includes(m.status)){if(m.status==='interrupting'){m.status='interrupted';await this.store.save(m);}return false;}if(m.status==='paused')return false;return true;}
  async run(id,planning){
    const m=await this.store.get(id);
    if(['cancelled','interrupted','interrupting'].includes(m.status))return;
    if(planning){const cwd=await this.adapter.base(m);const output=await this.execute(m,'orchestrator',null,cwd,null,planSchema);if(!await this.boundary(m))return;let plan;try{plan=JSON.parse(output.text);}catch{throw new Error('Plan JSON absent.');}m.plan=validatePlan(plan);m.status='awaiting_plan';await this.store.save(m);await this.store.event(id,'plan',{text:'Plan proposé. Votre approbation est nécessaire.'});return;}
    for(const task of m.tasks){
      if(task.status==='completed')continue;if(!await this.boundary(m))return;
      if(task.status!=='running'){
        if(task.attempts>=m.limits.attempts)throw new Error(`Nombre maximal de tentatives atteint : ${task.title}.`);
        task.attempts=(task.attempts||0)+1;
      }
      if(task.dependsOn.some(d=>m.tasks.find(t=>t.id===d)?.status!=='completed'))throw new Error('Dépendance non terminée.');
      const parent=m.tasks.find(t=>t.id===task.dependsOn[0]);const base=parent?.result?.head||m.baseHead;if(!base)throw new Error('Révision Git de départ absente.');
      task.status='running';await this.store.save(m);
      const dev=await this.adapter.development(m,task,base);task.workspace=dev;task.gitBase=base;await this.store.save(m);
      let verified=false;
      for(let round=task.round||0;round<=m.limits.correctionRounds;round++){
        if(!await this.boundary(m))return;task.round=round;
        if(!['review','validation'].includes(task.stage)){
          const output=await this.execute(m,'developer',task,dev,task.handoff||parent?.result||null,resultSchema);const result=parseResult(output.text);
          if(result.verdict==='blocked')throw new Error(result.summary);
          const revision=await this.adapter.commit(dev,task);task.result={...result,...revision,base,commands:output.commands};task.stage='review';await this.store.save(m);
        }
        if(!await this.boundary(m))return;
        const revision=task.result;
        if(task.stage==='review'){
          const reviewCwd=await this.adapter.isolate(m,task,'reviewer',revision.head);
          const review=parseResult((await this.execute(m,'reviewer',task,reviewCwd,task.result,resultSchema)).text);
          if(!reviewValid(revision,await this.adapter.snapshot(dev)))throw new Error('La révision a changé pendant la revue. Revue invalidée.');
          const reviewed=await this.adapter.snapshot(reviewCwd);if(reviewed.head!==revision.head||reviewed.files.length)throw new Error('Le relecteur a modifié sa révision isolée. Revue invalidée.');
          task.review={...review,head:revision.head,fingerprint:revision.fingerprint};
          if(review.verdict!=='pass'){task.handoff={...task.result,review};task.stage='development';task.round=round+1;await this.store.save(m);continue;}
          task.stage='validation';await this.store.save(m);
        }
        if(!await this.boundary(m))return;
        const validationCwd=await this.adapter.isolate(m,task,'validation',revision.head);
        const validationOutput=await this.execute(m,'validation',task,validationCwd,{...task.result,review:task.review},resultSchema),validation=parseResult(validationOutput.text);
        if(!reviewValid(revision,await this.adapter.snapshot(dev)))throw new Error('La révision a changé pendant la validation. Revue invalidée.');
        const validationState=await this.adapter.snapshot(validationCwd);
        if(validationState.head!==revision.head||validationState.files.length)throw new Error('La validation a modifié sa révision isolée.');
        task.validation={...validation,head:revision.head,commands:validationOutput.commands};await this.store.save(m);
        if(validation.verdict==='pass'&&validationOutput.commands.length&&validationOutput.commands.every(c=>c.exitCode===0)){verified=true;break;}
        task.handoff={...task.result,validation,commands:validationOutput.commands};task.stage='development';task.round=round+1;await this.store.save(m);
      }
      if(!verified)throw new Error('Validation non obtenue dans la limite de corrections.');
      task.status='completed';task.stage='completed';await this.store.save(m);await this.store.event(id,'task_completed',{taskId:task.id,head:task.result.head,text:task.title});
    }
    if(!await this.boundary(m))return;m.status='ready';m.error=null;await this.store.save(m);await this.store.event(id,'ready',{text:'Revue et validation terminées. La PR attend votre décision.'});
  }
  async approve(id,plan){if(this.controls.has(id))throw new Error('Action déjà en cours.');this.controls.add(id);try{const m=await this.store.get(id);if(m.status!=='awaiting_plan')throw new Error('Plan non disponible pour approbation.');m.plan=validatePlan(plan);m.tasks=m.plan.tasks.map(t=>({...t,status:'pending',attempts:0,round:0}));m.baseHead=await this.adapter.baseHead(m);m.startedAt=Date.now();m.status='running';await this.store.save(m);await this.store.event(id,'plan_approved',{plan:m.plan,baseHead:m.baseHead});this.launch(id);return m;}finally{this.controls.delete(id);}}
  async control(id,action){if(this.controls.has(id))throw new Error('Action déjà en cours.');this.controls.add(id);try{if(action==='resume'&&this.running.has(id))throw new Error('Attendez la fin de l’exécution active avant de reprendre.');const m=await this.store.get(id);m.status=transition(m.status,action);await this.store.save(m);await this.store.event(id,action,{text:action});if(['interrupt','cancel'].includes(action)&&m.activeWorkspace)await this.adapter.interrupt(m.activeWorkspace);else if(action==='interrupt'){m.status='interrupted';await this.store.save(m);}if(action==='resume'){for(const t of m.tasks){if(t.status==='interrupted'||(t.status==='running'&&m.executions.at(-1)?.status==='error')){t.status='pending';}if(m.error?.includes('invalidée')){t.stage='development';t.review=null;t.validation=null;}}m.error=null;await this.store.save(m);this.launch(id,m.plan===null);}return m;}finally{this.controls.delete(id);}}
}
