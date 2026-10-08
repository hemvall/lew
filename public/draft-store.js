export function createDraftStore(getStorage){
  const memory=new Map(),saved=new Map();
  const key=id=>`lew-draft:${id}`;
  return {
    get(id){
      if(memory.has(id))return memory.get(id);
      try{
        const entry=JSON.parse(getStorage().getItem(key(id))||'null');
        if(entry?.version===1&&typeof entry.text==='string'&&entry.text.length<=20000){memory.set(id,entry.text);saved.set(id,true);return entry.text;}
      }catch{}
      return '';
    },
    set(id,value){
      const text=String(value||'');if(memory.get(id)===text&&saved.get(id)===true)return true;memory.set(id,text);
      try{
        if(text.length>20000)throw new Error('Draft too long');
        if(text)getStorage().setItem(key(id),JSON.stringify({version:1,text,updatedAt:Date.now()}));
        else getStorage().removeItem(key(id));
        saved.set(id,true);return true;
      }catch{saved.set(id,false);return false;}
    },
    delete(id){return this.set(id,'');},
    persisted(id){return saved.get(id)===true;}
  };
}
