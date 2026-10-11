import test from 'node:test';import assert from 'node:assert/strict';import { mkdtemp,writeFile,mkdir,rm } from 'node:fs/promises';import { tmpdir } from 'node:os';import { join } from 'node:path';import { git,snapshot } from '../delivery.mjs';import { MissionAdapter } from '../mission-adapter.mjs';
test('mission fetches the selected branch even when the clone tracks only another branch',async()=>{
  const root=await mkdtemp(join(tmpdir(),'lew-mission-fetch-'));
  try{
    const remote=join(root,'remote'),repo=join(root,'repos','p');await mkdir(remote);await mkdir(join(root,'repos'));
    await git(remote,['init','-b','main']);await git(remote,['config','user.name','Lew test']);await git(remote,['config','user.email','lew@example.test']);await writeFile(join(remote,'a.txt'),'main');await git(remote,['add','.']);await git(remote,['commit','-m','initial']);
    const main=(await git(remote,['rev-parse','HEAD'])).trim();await git(remote,['checkout','-b','release']);await writeFile(join(remote,'a.txt'),'release');await git(remote,['commit','-am','release']);const release=(await git(remote,['rev-parse','HEAD'])).trim();
    await git(root,['clone','--single-branch','--branch','release',remote,repo]);await assert.rejects(git(repo,['rev-parse','--verify','origin/main']));
    const adapter=new MissionAdapter({root}),mission={id:'fetch123',projectId:'p',project:{repo:'test/example'},base:'main'};
    const plan=await adapter.base(mission);assert.equal(mission.baseHead,main);assert.equal((await snapshot(plan.cwd)).head,main);
    assert.equal(await adapter.baseHead({...mission,base:'release',baseHead:null}),release);
    assert.equal(await adapter.baseHead({...mission,base:'missing'}),main,'approved commit must remain pinned');
    await assert.rejects(adapter.baseHead({...mission,base:'missing',baseHead:null}),/La branche « missing » n’existe pas/);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('an empty remote gets an isolated local base without publishing or staging files',async()=>{
  const root=await mkdtemp(join(tmpdir(),'lew-empty-mission-'));
  try{
    const remote=join(root,'remote.git'),repo=join(root,'repos','p');await mkdir(remote);await mkdir(join(root,'repos'));await git(remote,['init','--bare','-b','main']);await git(root,['clone',remote,repo]);
    const adapter=new MissionAdapter({root}),mission={id:'empty123',projectId:'p',project:{repo:'test/empty'},base:'main'};
    const context=await adapter.base(mission);const initial=await snapshot(context.cwd);assert.equal(initial.head,mission.baseHead);assert.deepEqual(initial.files,[]);assert.equal((await git(repo,['ls-remote','origin'])).trim(),'');
    assert.equal(await adapter.baseHead({...mission,baseHead:null}),mission.baseHead,'local bootstrap is stable on retry');
    const development=await adapter.development(mission,{id:'first'},mission.baseHead);await writeFile(join(development.cwd,'README.md'),'First product file');assert.equal((await snapshot(development.cwd)).files.length,1);assert.equal((await git(repo,['ls-remote','origin'])).trim(),'');
  }finally{await rm(root,{recursive:true,force:true});}
});
test('mission worktrees use exact parent commits and validation changes cannot affect development',async()=>{const root=await mkdtemp(join(tmpdir(),'lew-mission-'));try{await mkdir(join(root,'repos','p'),{recursive:true});await mkdir(join(root,'workspaces'));const repo=join(root,'repos','p');await git(repo,['init']);await git(repo,['config','user.name','Lew test']);await git(repo,['config','user.email','lew@example.test']);await writeFile(join(repo,'a.txt'),'initial');await git(repo,['add','.']);await git(repo,['commit','-m','initial']);const base=(await git(repo,['rev-parse','HEAD'])).trim(),m={id:'m123456',projectId:'p'},task={id:'one',title:'Implement',gitBase:base};const a=new MissionAdapter({root});const dev=await a.development(m,task,base);await writeFile(join(dev.cwd,'a.txt'),'changed');const result=await a.commit(dev,task);assert.notEqual(result.head,base);assert.deepEqual(result.changedFiles,['a.txt']);assert.match(result.diff,/changed/);const validation=await a.isolate(m,task,'validation',result.head);assert.equal((await snapshot(validation.cwd)).head,result.head);await writeFile(join(validation.cwd,'a.txt'),'validation mutation');assert.equal((await snapshot(dev.cwd)).fingerprint,result.fingerprint);assert.equal((await snapshot(validation.cwd)).files.length,1);const dependent=await a.development(m,{id:'two'},result.head);assert.equal((await snapshot(dependent.cwd)).head,result.head);}finally{await rm(root,{recursive:true,force:true});}});
