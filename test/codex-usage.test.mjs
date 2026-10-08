import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeUsage,readUsage} from '../codex-usage.mjs';
test('multi-bucket quotas preserve unknown values, reset timestamps and authoritative reset count',()=>{
  const value=normalizeUsage({type:'chatgpt',planType:'plus',accessToken:'never-return'}, {rateLimitsByLimitId:{codex:{primary:{usedPercent:25,windowDurationMins:300,resetsAt:2000000000},secondary:{usedPercent:80,windowDurationMins:10080},credits:{hasCredits:true,unlimited:false,balance:'10'}},other:{primary:{usedPercent:0}}},rateLimitResetCredits:{availableCount:5,credits:[{id:'one',title:'Reset',expiresAt:2000000000}]}}, {summary:{lifetimeTokens:0,peakDailyTokens:null},dailyUsageBuckets:[{startDate:'2026-10-08',tokens:20}]},null);
  assert.equal(value.limits[0].primary.remainingPercent,75);assert.equal(value.limits[0].secondary.resetsAt,null);assert.equal(value.limits[1].primary.remainingPercent,100);assert.equal(value.resetCredits.availableCount,5);assert.equal(value.resetCredits.details.length,1);assert.equal(value.activity.summary.lifetimeTokens,0);assert.equal(value.activity.summary.peakDailyTokens,null);assert.equal(JSON.stringify(value).includes('never-return'),false);
});
test('legacy single-bucket responses do not invent missing reset credits or activity',()=>{
  const value=normalizeUsage({type:'chatgpt'}, {rateLimits:{primary:{usedPercent:120}}},null,null);assert.equal(value.limits[0].primary.remainingPercent,0);assert.equal(value.resetCredits,null);assert.equal(value.activity,null);assert.equal(value.account.planType,null);
});
test('unsupported methods produce partial account usage rather than hiding a connected account',async()=>{
  const value=await readUsage({request:async method=>{if(method==='account/read')return {account:{type:'chatgpt',planType:'plus'}};if(method==='account/rateLimits/read')return {rateLimits:{primary:{usedPercent:10}}};throw new Error('Unsupported method with internal secret');}});assert.equal(value.account.planType,'plus');assert.equal(value.limits[0].primary.usedPercent,10);assert.equal(value.errors.length,2);assert.equal(JSON.stringify(value).includes('internal secret'),false);
});
test('disconnected accounts do not request quotas or activity',async()=>{let calls=0;const value=await readUsage({request:async()=>{calls++;return {account:null};}});assert.equal(calls,1);assert.equal(value.account,null);assert.equal(value.limits.length,0);});
