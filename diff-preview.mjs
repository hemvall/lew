import {readFile,lstat,readlink} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
const limit=256*1024,totalLimit=1024*1024;
export async function diffPreviews(cwd,files,git){
  let budget=totalLimit;const result=[];
  for(const file of files){const preview={...file,patch:'',previewReason:''},path=resolve(cwd,file.path);
    if(!file.selectable){preview.previewReason='Contenu masqué : fichier de configuration sensible.';result.push(preview);continue;}
    if(!path.startsWith(resolve(cwd)+sep))throw Error('Chemin de fichier invalide.');
    if(budget<=0){preview.previewReason='Limite totale de prévisualisation atteinte.';result.push(preview);continue;}
    try{const info=await lstat(path);
      if(info.isSymbolicLink()){preview.previewReason='Lien symbolique vers '+await readlink(path);result.push(preview);continue;}
      if(!info.isFile()){preview.previewReason='Aperçu indisponible pour ce type de fichier.';result.push(preview);continue;}
      if(info.size>limit||info.size>budget){preview.previewReason='Fichier trop volumineux pour la prévisualisation.';result.push(preview);continue;}
      const bytes=await readFile(path);budget-=bytes.length;
      if(bytes.includes(0)){preview.previewReason='Fichier binaire : aperçu textuel indisponible.';result.push(preview);continue;}
      let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{preview.previewReason='Encodage non UTF-8 : aperçu textuel indisponible.';result.push(preview);continue;}
      if(file.state==='new'){const lines=text.replace(/\r\n/g,'\n').split('\n');if(lines.at(-1)==='')lines.pop();preview.patch=`--- /dev/null\n+++ b/${file.path}\n@@ -0,0 +1,${lines.length} @@\n`+lines.map(l=>'+'+l).join('\n')+(text.endsWith('\n')?'':'\n\\ No newline at end of file');}
    }catch(error){if(error.code!=='ENOENT')throw error;}
    if(file.state!=='new')preview.patch=await git(cwd,['--literal-pathspecs','diff','--no-ext-diff','--no-textconv','HEAD','--',file.path]);
    if(preview.patch.length>limit){preview.patch=preview.patch.slice(0,limit);preview.previewReason='Diff tronqué : consultez le fichier complet avant de livrer.';}
    if(preview.patch.length>budget){preview.patch=preview.patch.slice(0,Math.max(0,budget));preview.previewReason='Limite totale de prévisualisation atteinte : diff tronqué.';}
    budget-=preview.patch.length;
    result.push(preview);
  }
  return result;
}
