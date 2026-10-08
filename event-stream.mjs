// Cursor-based SSE replay: a reconnect only reads events after the last durable ID.
export function eventCursor(value='0'){if(!/^\d{1,19}$/.test(String(value))||BigInt(value)>9223372036854775807n)throw new Error('Curseur invalide.');return String(value);}
export function streamEvents(res,load,initial='0',{interval=750}={}){
  let cursor=eventCursor(initial),closed=false,timer;
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();
  const stop=()=>{closed=true;clearTimeout(timer);};res.once('close',stop);
  const tick=async()=>{
    try {
      const data=await load(cursor);if(closed)return;
      if(data.events.length)cursor=String(data.events.at(-1).id);
      if(!res.write(`data: ${JSON.stringify({...data,cursor})}\n\n`)){stop();res.end();return;}
    }catch(e){if(!closed){res.write(`event: error\ndata: ${JSON.stringify({error:e.message})}\n\n`);res.end();}stop();return;}
    if(!closed){timer=setTimeout(tick,interval);timer.unref();}
  };
  void tick();return stop;
}
