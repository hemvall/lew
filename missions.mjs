import { StateGraph, Annotation, START, END, MemorySaver } from '@langchain/langgraph';
import { randomUUID } from 'node:crypto';
import { validatePlan,limits,parseResult,planSchema,resultSchema,recoverMission,transition,reviewValid } from './mission-model.mjs';
import { agentPrompt } from './agents.mjs';
export class MissionEngine {
  constructor(store,adapter,{checkpointer}={}){this.checkpointer=checkpointer||new MemorySaver();this.store=store;this.adapter=adapter;this.running=new Map();this.controls=new Set();this.recovered=false;this.queue=Promise.resolve();}
  async recover(){if(this.recovery)return this.recovery;this.recovery=this.performRecovery().catch(e=>{this.recovery=null;throw e;});return this.recovery;}
  async performRecovery(){if(this.recovered)return;for(const row of await this.store.list()){const next=recoverMission(row);if(next.status!==row.status){next.recoveryPending=true;for(const ex of next.executions||[])if(row.executions?.find(e=>e.id===ex.id)?.status==='running')ex.recoveryPending=true;}if(next.status!==row.status){await this.store.save(next);await this.store.event(next.id,'recovery',{text:'Exécution interrompue par le redémarrage. Reprise explicite requise.'});}}this.recovered=true;}
  async create(input,project,profiles){
    const objective=String(input.objective||'').trim(),criteria=String(input.criteria||'').trim();if(!objective||objective.length>12000||!criteria||criteria.length>12000)throw new Error('Objectif et critères de réussite requis.');
    const base=String(input.base||'main');if(!/^[\w./-]+$/.test(base)||base.startsWith('-')||base.includes('..'))throw new Error('Branche de départ invalide.');
    for(const role of ['orchestrator','developer','reviewer','validation'])if(!profiles[role]?.active||profiles[role].role!==role)throw new Error('Sélectionnez un profil actif pour chaque rôle.');
    if(!profiles.developer.config.allowCommit)throw new Error('Le développeur doit être autorisé à créer les commits de la mission.');
    const m={id:randomUUID(),projectId:project.id,project:structuredClone(project),objective,criteria,base,profiles:structuredClone(profiles),limits:limits(input.limits),status:'planning',tasks:[],executions:[],startedAt:Date.now(),plan:null,activeWorkspace:null,error:null};
    await this.store.save(m);await this.store.event(m.id,'created',{text:objective});this.launch(m.id,true);return m;
  }
  launch(id,planning=false){
    if(this.running.has(id))return;
    const job=this.queue.then(()=>this.run(id,planning)).catch(async e=>{
      const m=await this.store.get(id);
      if(['interrupting','interrupted'].includes(m.status)||(e.code==='MISSION_STOPPED'&&['running','planning'].includes(m.status))){
        m.status='interrupted';m.activeWorkspace=null;
        for(const task of m.tasks)if(task.status==='running')task.status='interrupted';
        await this.store.save(m);return;
      }
      if(e.code==='MISSION_STOPPED'||['cancelled','interrupted'].includes(m.status))return;
      m.status='blocked';m.error=e.message;
      for(const task of m.tasks)if(task.status==='running')task.status='interrupted';
      await this.store.save(m);await this.store.event(id,'error',{text:e.message});
    }).finally(()=>this.running.delete(id));
    this.running.set(id,job);this.queue=job.catch(()=>{});
  }
  async execute(m,role,task,cwd,handoff,schema){
    const deadline=(m.executionStartedAt??m.startedAt)+m.limits.durationMinutes*60000;
    if(Date.now()>deadline)throw new Error('Durée maximale de mission atteinte.');
    const key=[task?.id||'plan',role,task?.attempts||0,task?.round||0].join(':');
    const previous=m.executions.findLast(e=>e.operationKey===key||(e.recoveryPending&&e.role===role&&e.taskId===(task?.id||null)));
    if(previous?.status==='completed'&&previous.result)return previous.result;
    if(previous?.recoveryPending){
      const recovered=await this.adapter.recoverExecution(previous);
      if(!recovered)throw new Error('Résultat Codex incertain : vérifiez la conversation avant de créer une nouvelle tentative. Aucune commande relancée.');
      previous.recoveryPending=false;m.recoveryPending=m.executions.some(e=>e.recoveryPending);
      if(!recovered.notStarted){previous.result=recovered;previous.status='completed';await this.store.save(m);return recovered;}
      previous.status='interrupted';await this.store.save(m);
    }
    const profile=m.profiles[role],ex={operationKey:key,id:randomUUID(),role,taskId:task?.id||null,profile:structuredClone(profile),status:'running',startedAt:Date.now()};m.executions.push(ex);await this.store.save(m);
    try{const w=await this.adapter.workspace(m,role,task,cwd);ex.workspaceId=w.id;m.activeWorkspace=w.id;await this.store.save(m);await this.store.execution(m.id,w,ex);await this.store.event(m.id,'execution',{role,workspaceId:w.id,text:`${profile.name} : ${task?.title||'planification'}`});
    const output=await this.adapter.execute(w,profile,agentPrompt(profile,m.project,m.objective+'\nCritères : '+m.criteria,task?.instructions||'Proposer un plan séquentiel de tâches de développement. Chaque tâche après la première dépend de la précédente. Aucun travail avant approbation humaine.',handoff),schema,deadline,async()=>{const fresh=await this.store.get(m.id);return ['running','planning'].includes(fresh.status);});ex.status='completed';ex.result=output;ex.finishedAt=Date.now();await this.store.save(m);return output;}
    catch(e){ex.status=e.code==='MISSION_STOPPED'?'interrupted':'error';ex.error=e.message;if(e.code!=='MISSION_STOPPED'&&this.adapter.recoverExecution){ex.recoveryPending=true;m.recoveryPending=true;}throw e;}
    finally{m.activeWorkspace=null;await this.store.save(m);}
  }
  async boundary(m){const fresh=await this.store.get(m.id);m.status=fresh.status;m.version=fresh.version;if(['cancelled','interrupting','interrupted'].includes(m.status)){if(m.status==='interrupting'){m.status='interrupted';await this.store.save(m);}return false;}if(m.status==='paused')return false;return true;}
  async run(id,planning){
    let m=await this.store.get(id);
    if(['cancelled','interrupted','interrupting'].includes(m.status))return;
    const State=Annotation.Root({cursor:Annotation(),mission:Annotation()});
    let task=m.tasks.find(t=>t.status!=='completed');
    const route=async()=>{
      if(!await this.boundary(m))return END;
      if(m.status==='awaiting_plan'||m.status==='ready'||m.status==='published')return END;
      if(!m.plan)return 'plan';
      task=m.tasks.find(t=>t.status!=='completed');
      if(!task)return 'complete';
      if((task.round||0)>m.limits.correctionRounds)throw new Error('Validation non obtenue dans la limite de corrections.');
      if(task.status!=='running'||!task.workspace)return 'prepare';
      return ['review','validation'].includes(task.stage)?task.stage:'development';
    };
    // A node may have saved its effect before the process lost its checkpoint.
    // Re-read the durable mission and skip that completed node on replay.
    const node=fn=>async()=>{
      m=await this.store.get(id);task=m.tasks.find(t=>t.status!=='completed');
      if(!await this.boundary(m))return {cursor:id,mission:structuredClone(m)};
      await fn();return {cursor:id,mission:structuredClone(m)};
    };
    const builder=new StateGraph(State);
    const add=(name,fn)=>{builder.addNode(name,node(async()=>{if(await route()===name)await fn();}));return builder;};
    add('plan',async()=>{
let plan;
        const previous=m.executions.findLast(ex=>ex.role==='orchestrator'&&ex.status==='completed'&&ex.result?.text);
        if(previous){try{plan=validatePlan(JSON.parse(previous.result.text));}catch{}}
        if(!plan){const cwd=await this.adapter.base(m);const output=await this.execute(m,'orchestrator',null,cwd,null,planSchema);if(!await this.boundary(m))return;try{plan=JSON.parse(output.text);}catch{throw new Error('Plan JSON absent.');}plan=validatePlan(plan);}
        if(!await this.boundary(m))return;m.plan=plan;if(m.plan.title)m.title=m.plan.title;m.status='awaiting_plan';await this.store.save(m);await this.store.event(id,'plan',{text:'Plan proposé. Votre approbation est nécessaire.'});
        return {};
      });
    add('prepare',async()=>{
        if(task.status!=='running'){
          if(task.attempts>=m.limits.attempts)throw new Error(`Nombre maximal de tentatives atteint : ${task.title}.`);
          task.attempts=(task.attempts||0)+1;
        }
        if(task.dependsOn.some(d=>m.tasks.find(t=>t.id===d)?.status!=='completed'))throw new Error('Dépendance non terminée.');
        const parent=m.tasks.find(t=>t.id===task.dependsOn[0]);
        const base=parent?.result?.head||m.baseHead;
        if(!base)throw new Error('Révision Git de départ absente.');
        task.status='running';await this.store.save(m);
        const dev=await this.adapter.development(m,task,base);
        task.workspace=dev;task.gitBase=base;await this.store.save(m);
        return {};
      });
    add('development',async()=>{
        const dev=task.workspace,base=task.gitBase,parent=m.tasks.find(t=>t.id===task.dependsOn[0]);
          const output=await this.execute(m,'developer',task,dev,task.handoff||parent?.result||null,resultSchema);const result=parseResult(output.text);
          if(result.verdict==='blocked')throw new Error(result.summary);
          const revision=await this.adapter.commit(dev,task);task.result={...result,...revision,base,commands:output.commands};task.stage='review';await this.store.save(m);

        return {};
      });
    add('review',async()=>{
        const dev=task.workspace,revision=task.result,round=task.round||0;
        await (async()=>{
          const reviewCwd=await this.adapter.isolate(m,task,'reviewer',revision.head);
          const review=parseResult((await this.execute(m,'reviewer',task,reviewCwd,task.result,resultSchema)).text);
          if(!reviewValid(revision,await this.adapter.snapshot(dev)))throw new Error('La révision a changé pendant la revue. Revue invalidée.');
          const reviewed=await this.adapter.snapshot(reviewCwd);if(reviewed.head!==revision.head||reviewed.files.length)throw new Error('Le relecteur a modifié sa révision isolée. Revue invalidée.');
          task.review={...review,head:revision.head,fingerprint:revision.fingerprint};
          if(review.verdict!=='pass'){task.handoff={...task.result,review};task.stage='development';task.round=round+1;await this.store.save(m);return;}
          task.stage='validation';await this.store.save(m);

        })();
        return {};
      });
    add('validation',async()=>{
        const dev=task.workspace,revision=task.result,round=task.round||0;
        await (async()=>{
        const validationCwd=await this.adapter.isolate(m,task,'validation',revision.head);
        const validationOutput=await this.execute(m,'validation',task,validationCwd,{...task.result,review:task.review},resultSchema),validation=parseResult(validationOutput.text);
        if(!reviewValid(revision,await this.adapter.snapshot(dev)))throw new Error('La révision a changé pendant la validation. Revue invalidée.');
        const validationState=await this.adapter.snapshot(validationCwd);
        if(validationState.head!==revision.head||validationState.files.length)throw new Error('La validation a modifié sa révision isolée.');
        task.validation={...validation,head:revision.head,commands:validationOutput.commands};await this.store.save(m);
        if(validation.verdict==='pass'&&validationOutput.commands.length&&validationOutput.commands.every(c=>c.exitCode===0)){task.status='completed';task.stage='completed';await this.store.save(m);await this.store.event(id,'task_completed',{taskId:task.id,head:task.result.head,text:task.title});return;}
        task.handoff={...task.result,validation,commands:validationOutput.commands};task.stage='development';task.round=round+1;await this.store.save(m);

        })();
        return {};
      });
    add('complete',async()=>{
        m.status='ready';m.error=null;await this.store.save(m);
        await this.store.event(id,'ready',{text:'Revue et validation terminées. La PR attend votre décision.'});
        return {};
      });
    builder.addConditionalEdges(START,route);
    for(const name of ['plan','prepare','development','review','validation','complete'])builder.addConditionalEdges(name,route);
    const checkpointer=typeof this.checkpointer==='function'?await this.checkpointer():this.checkpointer;
    const graph=builder.compile({checkpointer});
    const config={configurable:{thread_id:id},recursionLimit:1000,durability:'sync'};
    const previous=await graph.getState(config);
    await graph.invoke(previous.next?.length?null:{cursor:id,mission:structuredClone(m)},config);
  }
  async approve(id,plan){if(this.controls.has(id))throw new Error('Action déjà en cours.');this.controls.add(id);try{const m=await this.store.get(id);if(m.status!=='awaiting_plan')throw new Error('Plan non disponible pour approbation.');m.plan=validatePlan(plan);m.tasks=m.plan.tasks.map(t=>({...t,status:'pending',attempts:0,round:0}));m.baseHead=await this.adapter.baseHead(m);m.startedAt=Date.now();m.status='running';await this.store.save(m);await this.store.event(id,'plan_approved',{plan:m.plan,baseHead:m.baseHead});const active=this.running.get(id);if(active)active.then(()=>this.launch(id),()=>this.launch(id));else this.launch(id);return m;}finally{this.controls.delete(id);}}
  async publish(id){
    if(this.controls.has(id))throw new Error('Publication déjà en cours.');
    this.controls.add(id);
    try{
      const m=await this.store.get(id);
      if(m.status==='published'&&m.pr)return m.pr;
      if(!['ready','published'].includes(m.status))throw new Error('Mission non validée.');
      m.publication={status:'started',head:m.tasks.at(-1)?.result?.head};await this.store.save(m);
      const pr=await this.adapter.publish(m);m.pr=pr;m.status='published';m.publication.status='completed';await this.store.save(m);
      await this.store.event(id,'published',pr);return pr;
    }finally{this.controls.delete(id);}
  }
  async control(id,action){
    if(this.controls.has(id))throw new Error('Action déjà en cours.');
    this.controls.add(id);
    try{
      if(action==='resume'&&this.running.has(id))throw new Error('Attendez la fin de l’exécution active avant de reprendre.');
      let m=await this.store.get(id);const previous=m.status,next=transition(m.status,action);
      if(action==='resume'){
        for(const t of m.tasks){
          if(t.status==='completed')continue;
          if(t.status==='interrupted'||(t.status==='running'&&['error','interrupted'].includes(m.executions.at(-1)?.status)))t.status=m.recoveryPending?'running':'pending';
          // A fresh attempt gets its correction rounds; completed tasks stay checkpointed.
          if(t.status==='pending')t.round=0;
          if(m.error?.includes('invalidée')){t.stage='development';t.review=null;t.validation=null;}
        }
        const task=m.tasks.find(t=>t.status!=='completed');
        if(task&&task.status!=='running'&&(task.attempts||0)>=m.limits.attempts)throw new Error(`Nombre maximal de tentatives atteint : ${task.title}. Créez une nouvelle mission pour poursuivre.`);
        m.recoveryPending=m.executions.some(e=>e.recoveryPending);
        // Explicit resume grants a fresh execution window without discarding checkpoints.
        m.executionStartedAt=Date.now();m.error=null;
      }
      m.status=next;if(action!=='resume'&&this.store.controlState)m=await this.store.controlState(id,previous,next);else await this.store.save(m);
      if(['interrupt','cancel'].includes(action)&&m.activeWorkspace){
        try{await this.adapter.interrupt(m.activeWorkspace);}
        catch(e){if(action==='interrupt'){const fresh=await this.store.get(id);if(fresh.status==='interrupting'&&fresh.activeWorkspace){fresh.status=previous;await this.store.save(fresh);}}throw e;}
      }else if(action==='interrupt'){m.status='interrupted';await this.store.save(m);}
      await this.store.event(id,action,{text:action});
      if(action==='resume')this.launch(id,m.plan===null);
      return m;
    }finally{this.controls.delete(id);}
  }
}
