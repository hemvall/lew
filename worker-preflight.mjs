import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {codexCommand} from './codex-command.mjs';
const exec=promisify(execFile);
export function workerFailure(tool,error){
  const label=tool==='git'?'Git':'Codex';
  if(['EPERM','EACCES'].includes(error?.code))return label+' : le serveur ne peut pas démarrer ce programme. Relancez Lew depuis un terminal autorisé sur le worker (permissions).';
  if(error?.code==='ENOENT')return label+' est introuvable sur le worker. Installez-le et relancez Lew pour actualiser le PATH.';
  if(error?.killed||error?.code==='ETIMEDOUT')return label+' ne répond pas. Vérifiez le worker puis réessayez.';
  return label+' ne démarre pas. Vérifiez son installation et les permissions du worker, puis réessayez.';
}
export async function workerPreflight({execute=exec,resolveCodex=codexCommand}={}){
  const checks=await Promise.all(['git','codex'].map(async tool=>{
    try{
      let command={file:'git',args:[]};
      if(tool==='codex'){
        try{command=resolveCodex();}catch{const error=new Error();error.code='ENOENT';throw error;}
      }
      await execute(command.file,[...command.args,'--version'],{timeout:5000,maxBuffer:65536,windowsHide:true});
      return {tool,ready:true,message:(tool==='git'?'Git':'Codex')+' est disponible.'};
    }catch(error){return {tool,ready:false,message:workerFailure(tool,error)};}
  }));
  return {ready:checks.every(check=>check.ready),checks};
}
export async function requireWorkerReady(check=workerPreflight){
  const result=await check();
  if(!result.ready)throw new Error(result.checks.filter(c=>!c.ready).map(c=>c.message).join(' '));
  return result;
}
