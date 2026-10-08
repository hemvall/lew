import test from 'node:test';
import assert from 'node:assert/strict';
import {listRepositories,readPullRequest,projectGithub,validRepo,validPage} from '../github-workspace.mjs';
import {github} from '../delivery.mjs';
test('a repo selected from the picker loads import metadata without a trailing slash',async()=>{
  const original=globalThis.fetch,saved=process.env.GITHUB_TOKEN;process.env.GITHUB_TOKEN='import-test-token';
  const metadata={full_name:'hemvall/lew',name:'lew',private:true,default_branch:'main'},calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push(url);assert.equal(options.headers.Authorization,'Bearer import-test-token');
    if(url.startsWith('https://api.github.com/user/repos?'))return {ok:true,json:async()=>[metadata]};
    if(url==='https://api.github.com/repos/hemvall/lew')return {ok:true,json:async()=>metadata};
    if(url==='https://api.github.com/repos/hemvall/lew/pulls?state=open')return {ok:true,json:async()=>[]};
    return {ok:false,status:404};
  };
  try{const listed=await listRepositories();const imported=await github(listed.repos[0].repo,'');assert.equal(imported.full_name,'hemvall/lew');assert.equal((await github('hemvall/lew')).name,'lew');assert.deepEqual(await github('hemvall/lew','pulls?state=open'),[]);assert.ok(!calls.some(url=>url.endsWith('/lew/')));}
  finally{globalThis.fetch=original;if(saved===undefined)delete process.env.GITHUB_TOKEN;else process.env.GITHUB_TOKEN=saved;}
});
test('repository picker paginates authenticated repos and never returns its token',async()=>{
  const saved=process.env.GITHUB_TOKEN;process.env.GITHUB_TOKEN='secret-test-token';
  try{let requested;const result=await listRepositories({page:2},async(url,options)=>{requested=url;assert.equal(options.headers.Authorization,'Bearer secret-test-token');return {ok:true,json:async()=>Array.from({length:100},(_,i)=>({full_name:`org/repo-${i}`,name:`repo-${i}`,private:true,default_branch:'develop',description:null}))};});assert.match(requested,/user\/repos.*page=2/);assert.equal(result.nextPage,3);assert.equal(result.authenticated,true);assert.equal(result.repos[0].private,true);assert.equal(JSON.stringify(result).includes('secret-test-token'),false);}finally{if(saved===undefined)delete process.env.GITHUB_TOKEN;else process.env.GITHUB_TOKEN=saved;}
});
test('public repos work without token; invalid owners, pages and repo names cannot alter API routes',async()=>{
  const saved=process.env.GITHUB_TOKEN;delete process.env.GITHUB_TOKEN;
  try{const result=await listRepositories({owner:'hemvall'},async url=>{assert.match(url,/users\/hemvall\/repos/);return {ok:true,json:async()=>[]};});assert.equal(result.authenticated,false);assert.equal(result.nextPage,null);await assert.rejects(()=>listRepositories({owner:'../user'}));assert.throws(()=>validPage(-1));assert.throws(()=>validPage('1&admin=true'));assert.throws(()=>validRepo('hemvall/lew/../secret'));}finally{if(saved!==undefined)process.env.GITHUB_TOKEN=saved;}
});
test('PR review combines discussion, inline comments and reviews while showing incomplete checks',async()=>{
  const request=async(repo,path)=>{assert.equal(repo,'hemvall/lew');if(path==='pulls/5')return {number:5,title:'Review',head:{sha:'abc',ref:'feat'},base:{ref:'main'},user:{login:'dev'},state:'open',changed_files:101};if(path.startsWith('pulls/5/files'))return path.endsWith('page=1')?Array.from({length:100},(_,i)=>({filename:`file-${i}`,patch:'@@ -1 +1 @@\n-a\n+b',additions:1,deletions:1})): [{filename:'binary',status:'added'}];if(path.startsWith('issues/5/comments'))return [{id:1,body:'discussion',user:{login:'dev'},created_at:'2026-10-01'}];if(path.startsWith('pulls/5/comments'))return [{id:2,body:'inline',path:'a.js',line:4,user:{login:'reviewer'},created_at:'2026-10-02'}];if(path.startsWith('pulls/5/reviews'))return [{id:3,body:'approved',state:'APPROVED',user:{login:'reviewer'},created_at:'2026-10-03'}];if(path.includes('check-runs'))throw new Error('No checks permission');if(path.includes('/status'))return {statuses:[{context:'build',state:'success'}]};throw Error(path);};
  const result=await readPullRequest('hemvall/lew',5,request);assert.equal(result.files.length,101);assert.equal(result.files.at(-1).patch,null);assert.deepEqual(result.comments.map(c=>c.type),['discussion','inline','review']);assert.equal(result.checks.state,'unknown');assert.equal(result.warnings[0].section,'checks');assert.equal(result.truncated.files,false);
});
test('context reads the real default branch and paginates branch choices',async()=>{
  const result=await projectGithub('hemvall/lew',async(_,path)=>{if(path==='')return {default_branch:'develop'};if(path.startsWith('branches'))return path.endsWith('page=1')?Array.from({length:100},(_,i)=>({name:'branch-'+i})): [{name:'develop'}];return [];});assert.equal(result.defaultBranch,'develop');assert.equal(result.branches.length,101);
});
