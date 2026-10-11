import test from 'node:test';import assert from 'node:assert/strict';import {BotEngine} from '../public/vendor/bloub-engine.js';import {bloubState} from '../public/bloub-avatar.js';
test('Bloub distinguishes sleeping, ready, working and approval states',()=>{assert.equal(bloubState('completed','developer'),'sleep');assert.equal(bloubState('idle','developer'),'notify');assert.equal(bloubState('running','developer'),'orbit');assert.equal(bloubState('awaiting_approval','developer'),'alert');for(const state of ['idle','running','completed','awaiting_approval','error']){const engine=new BotEngine(100,bloubState(state,'developer'));for(const t of [0,.5,2,10]){const f=engine.sample(t);assert.ok(f.bodyPath);assert.ok(f.eyes.every(e=>!e.matrix.includes('NaN')));}}});

// Exercise the artifact imported by avatar-view after the CI rebuild.
import {createBloubAvatar as bundledAvatar,bloubState as bundledState,createAvatar} from '../public/vendor/avatar-runtime.js';
test('browser bundle preserves both avatar APIs and Bloub state mappings',()=>{
  assert.equal(typeof createAvatar,'function');
  assert.equal(typeof bundledAvatar,'function');
  for(const role of ['developer','orchestrator','reviewer','validation'])
    for(const state of ['idle','running','completed','awaiting_approval','error','blocked'])
      assert.equal(bundledState(state,role),bloubState(state,role));
});
