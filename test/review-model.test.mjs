import test from 'node:test';
import assert from 'node:assert/strict';
import {markdown} from '../public/markdown.js';
import {verificationEvidence,publicationBody} from '../public/verification-model.js';
test('Markdown renders readable structure and escapes code and raw HTML',()=>{
  const html=markdown('# Result\n\n**Ready** and `a < b`\n\n- First\n- Second\n\n```js\n<script>alert(1)</script>\n```');
  assert.match(html,/<h1>Result<\/h1>/);assert.match(html,/<strong>Ready<\/strong>/);assert.match(html,/<ul><li>First<\/li><li>Second<\/li><\/ul>/);assert.match(html,/&lt;script&gt;/);assert.equal(html.includes('<script>'),false);
  assert.equal(markdown('<img src=x onerror=alert(1)>').includes('<img'),false);
});
test('Markdown links reject script, encoded schemes and attribute injection',()=>{
  for(const value of ['[x](javascript:alert)','[x](data:text/html,x)','[x](javascript&#58;alert)','[x](%6aavascript:alert)'])assert.equal(markdown(value).includes('<a '),false);
  const html=markdown('[Docs](https://example.com/?q="bad")');assert.match(html,/rel="noopener noreferrer"/);assert.equal(html.includes('q="bad"'),false);
});
const command=(id,exitCode,status='completed')=>({id,kind:'codex',data:{method:'item/completed',params:{item:{id,type:'commandExecution',command:'npm test',exitCode,status}}}});
test('verification uses observed exit codes from the latest execution only',()=>{
  const events=[{kind:'user'},command('old',0),{kind:'user'},command('current',1,'failed'),command('unknown',null),{kind:'codex',data:{method:'item/completed',params:{item:{id:'claim',type:'agentMessage',text:'All tests passed'}}}}];
  const evidence=verificationEvidence(events);assert.deepEqual(evidence.map(x=>x.state),['failure','unknown']);assert.equal(evidence.length,2);
  const body=publicationBody('Objective','Claimed result',evidence);assert.match(body,/échec, code 1/);assert.match(body,/résultat non confirmé/);assert.match(body,/fichiers ont changé/);
});
