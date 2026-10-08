import { existsSync } from 'node:fs';
import { dirname, join, isAbsolute } from 'node:path';
export function codexCommand(command=process.env.LEW_CODEX_BIN||'codex',platform=process.platform,pathEnv=process.env.PATH||''){
  if(platform!=='win32')return {file:command,args:[]};
  const paths=(isAbsolute(command)||command.includes('/')||command.includes('\\'))?[command]:pathEnv.split(';').filter(Boolean).flatMap(dir=>[join(dir,command+'.exe'),join(dir,command+'.cmd'),join(dir,command)]);
  for(const candidate of paths){if(!existsSync(candidate))continue;
    if(candidate.toLowerCase().endsWith('.cmd')){
      const script=join(dirname(candidate),'node_modules','@openai','codex','bin','codex.js');
      if(existsSync(script))return {file:process.execPath,args:[script]};
      continue;
    }
    if(candidate.toLowerCase().endsWith('.js'))return {file:process.execPath,args:[candidate]};
    return {file:candidate,args:[]};
  }
  throw new Error('Codex introuvable. Installez-le avec npm install -g @openai/codex ou renseignez LEW_CODEX_BIN avec le chemin de codex.exe.');
}
