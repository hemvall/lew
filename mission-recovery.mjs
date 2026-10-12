// Reuse only terminal evidence. A partial assistant response is never a result.
export function resultFromEvents(events){
  const receipt=events.findLast(e=>e.kind==='mission_result');
  if(receipt)return receipt.data;
  const messages=events.filter(e=>e.kind==='codex').map(e=>e.data);
  if(!messages.some(m=>m.method==='turn/completed'&&m.params?.turn?.status==='completed'))return null;
  let text='';const commands=[];
  for(const m of messages){
    if(m.method==='item/agentMessage/delta')text+=m.params.delta||'';
    if(m.method==='item/completed'){
      const item=m.params.item;
      if(item?.type==='agentMessage')text=item.text||text;
      if(item?.type==='commandExecution')commands.push({command:item.command,exitCode:item.exitCode,output:String(item.aggregatedOutput||'').slice(-12000)});
    }
  }
  return text?{text,commands}:null;
}
export function resultFromThread(thread){
  // Every mission execution owns a fresh thread. Never reuse a different turn.
  if(thread?.turns?.length!==1||thread.turns[0].status!=='completed')return null;
  const items=thread.turns[0].items||[],text=items.filter(i=>i.type==='agentMessage').at(-1)?.text;
  if(!text)return null;
  return {text,commands:items.filter(i=>i.type==='commandExecution').map(i=>({command:i.command,exitCode:i.exitCode,output:String(i.aggregatedOutput||'').slice(-12000)}))};
}
