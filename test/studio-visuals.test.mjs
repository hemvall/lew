import test from 'node:test';
import assert from 'node:assert/strict';
import {visualSummary,typePicker,solutionTypes} from '../public/studio-visuals.js';
import {newProduct,demoProduct} from '../public/studio-model.js';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
test('visual overview is concise while complete decisions remain readable',()=>{const p=demoProduct();p.values.input='<script>unsafe</script>';const html=visualSummary(p,escape);assert.match(html,/&lt;script&gt;/);assert.equal(html.includes('<script>'),false);assert.equal((html.match(/class="lab-diagram-card"/g)||[]).length,4);assert.match(html,/Consulter toutes/);assert.match(html,/Documents fictifs/);assert.match(visualSummary(newProduct(),escape),/À préciser/);});
test('type chooser exposes all supported choices and one selected state',()=>{const p=newProduct();const html=typePicker(p,escape);assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);for(const [name,,description] of solutionTypes){assert.ok(html.includes(escape(name)));assert.ok(html.includes(escape(description)));}});
