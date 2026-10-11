const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(text,depth=0){
  if(depth>3)return escape(text);
  const tokens=/`([^`\n]+)`|\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  let html='',offset=0;
  for(const m of text.matchAll(tokens)){html+=escape(text.slice(offset,m.index));offset=m.index+m[0].length;
    if(m[1])html+='<code>'+escape(m[1])+'</code>';
    else if(m[2]){let url;try{const parsed=new URL(m[3]);if(['http:','https:'].includes(parsed.protocol))url=parsed.href;}catch{}html+=url?`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${inline(m[2],depth+1)}</a>`:escape(m[0]);}
    else html+=m[4]?'<strong>'+inline(m[4],depth+1)+'</strong>':'<em>'+inline(m[5],depth+1)+'</em>';
  }
  return html+escape(text.slice(offset));
}
// Deliberately small Markdown subset. Raw HTML and image embeds remain literal text.
export function markdown(value){
  const lines=String(value||'').replace(/\r\n?/g,'\n').split('\n');let html='',paragraph=[],list=null,code=null;
  const flush=()=>{if(paragraph.length){html+='<p>'+paragraph.map(x=>inline(x)).join('<br>')+'</p>';paragraph=[];}if(list){html+='</'+list+'>';list=null;}};
  for(const line of lines){
    if(code!==null){if(/^\s*```\s*$/.test(line)){html+='<pre><code>'+escape(code.join('\n'))+'</code></pre>';code=null;}else code.push(line);continue;}
    if(/^\s*```/.test(line)){flush();code=[];continue;}
    if(!line.trim()){flush();continue;}
    const heading=line.match(/^(#{1,6})\s+(.+)$/),bullet=line.match(/^\s*(?:([-*+])|\d+\.)\s+(.+)$/),quote=line.match(/^>\s?(.*)$/);
    if(heading){flush();const n=heading[1].length;html+=`<h${n}>${inline(heading[2])}</h${n}>`;}
    else if(bullet){const kind=bullet[1]?'ul':'ol';if(list!==kind){flush();html+='<'+kind+'>';list=kind;}html+='<li>'+inline(bullet[2])+'</li>';}
    else if(quote){flush();html+='<blockquote>'+inline(quote[1])+'</blockquote>';}
    else{if(list)flush();paragraph.push(line);}
  }
  if(code!==null)html+='<pre><code>'+escape(code.join('\n'))+'</code></pre>';flush();return html;
}
