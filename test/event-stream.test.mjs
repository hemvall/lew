import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {eventCursor,streamEvents} from '../event-stream.mjs';
test('stream cursors reject SQL fragments and preserve bigint precision',()=>{assert.equal(eventCursor('9007199254740993'),'9007199254740993');assert.throws(()=>eventCursor('-1'));assert.throws(()=>eventCursor('0 OR 1=1'));assert.throws(()=>eventCursor('9223372036854775808'));});
test('SSE replays from durable cursor, advances without duplicates, and releases disconnected clients',async()=>{
  const afters=[];let stopped;
  const server=createServer((req,res)=>{stopped=streamEvents(res,async after=>{afters.push(after);return {events:[{id:String(BigInt(after)+1n),kind:'user',data:{text:'hello'}}],pendingIds:[]};},'9007199254740993',{interval:10});});server.listen(0,'127.0.0.1');await once(server,'listening');
  try{const response=await fetch(`http://127.0.0.1:${server.address().port}`);assert.match(response.headers.get('content-type'),/text\/event-stream/);const reader=response.body.getReader();let buffer='';while(buffer.split('\n\n').length<3){const chunk=await reader.read();buffer+=Buffer.from(chunk.value).toString();}const frames=buffer.trim().split('\n\n').map(f=>JSON.parse(f.slice(6)));assert.equal(frames[0].cursor,'9007199254740994');assert.equal(frames[1].cursor,'9007199254740995');assert.equal(afters[1],'9007199254740994');await reader.cancel();stopped();}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
