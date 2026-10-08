import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults,agentPrompt } from '../agents.mjs';
import { roleInstructions,legacyInstructions } from '../agent-instructions.mjs';
test('execution receives substantive role contracts, project constraints and evidence requirements',()=>{
  for(const p of defaults){assert.equal(p.instructions,roleInstructions[p.role]);assert.notEqual(p.instructions,legacyInstructions[p.role]);const prompt=agentPrompt(p,{context:'Use npm only.'},'Build login','Implement session validation',{head:'abc123',review:{findings:['Session expires incorrectly']}});for(const text of [roleInstructions[p.role],'Use npm only.','Build login','Implement session validation','abc123','Session expires incorrectly'])assert.ok(prompt.includes(text));assert.ok(p.instructions.includes('Ne publie, ne pousse et ne fusionne rien'));assert.ok(p.instructions.includes('schéma'));}
});
