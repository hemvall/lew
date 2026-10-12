import {webURL} from './web-widgets.js';
import {applications,applicationFor,clampWindow} from './os-model.js';
import {routeFor,parseRoute} from './navigation-model.js';
import {icon} from './icons.js';
export const embeddedApplication=new URLSearchParams(location.search).get('app');
const windows=new Map();let layer=20;
function hideWindow(win,close=false){
  const finish=()=>{if(close){win.element.remove();windows.delete(win.app.id);}else win.element.hidden=true;syncDock();};
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){finish();return;}
  win.element.getAnimations().forEach(a=>a.cancel());
  const animation=win.element.animate([{opacity:1,transform:'none'},{opacity:0,transform:close?'translateY(8px) scale(.97)':'translateY(28px) scale(.94)'}],{duration:190,easing:'cubic-bezier(.4,0,1,1)'});animation.onfinish=finish;
}
export function openApplication(route){
  const web=route.webWidget;const app=web?{id:'web-'+web.id,name:web.name,icon:'projects',view:'web'}:applicationFor(route.view);if(!app)return;
  if(embeddedApplication){parent.postMessage({type:'lew-open-app',route},location.origin);return;}
  let win=windows.get(app.id);
  if(web&&win&&(win.route.webWidget.url!==web.url||win.app.name!==web.name)){win.element.remove();windows.delete(app.id);win=null;}
  if(!win){
    const element=document.createElement('section');element.className='os-window';element.dataset.appWindow=app.id;element.setAttribute('aria-label',app.name+' — fenêtre');
    const titlebar=document.createElement('div');titlebar.className='os-titlebar';
    const controls=document.createElement('div');controls.className='os-controls';
    for(const [action,label] of [['close','Fermer'],['minimize','Réduire'],['maximize','Agrandir']]){const button=document.createElement('button');button.dataset.action=action;button.setAttribute('aria-label',label+' '+app.name);button.title=label;button.innerHTML=`<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${action==='close'?'<path d="m5 5 6 6m0-6-6 6"/>':action==='minimize'?'<path d="M4 8h8"/>':'<path class="os-expand-symbol" d="M4 4h5L4 9Zm8 8H7l5-5Z"/><path class="os-restore-symbol" d="M7 7H3l4-4Zm2 2h4l-4 4Z"/>'}</svg>`;controls.append(button);}
    const title=document.createElement('strong');title.textContent=app.name;const mark=document.createElement('span');mark.className='os-app-mark';mark.innerHTML=icon(app.icon);titlebar.append(controls,mark,title);
    const frame=document.createElement('iframe');frame.title=app.name;frame.src=web?webURL(web.url):'/?app='+app.id+(route.launchProjectId?'&launchProjectId='+encodeURIComponent(route.launchProjectId):'')+routeFor(route);if(!web)frame.allow='clipboard-write';else{frame.setAttribute('sandbox','allow-scripts allow-forms allow-same-origin allow-popups');frame.referrerPolicy='no-referrer';}
    if(route.launchBrief)frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'lew-route',route},location.origin),{once:true});
    element.append(titlebar);if(web){const bar=document.createElement('div');bar.className='os-web-toolbar';const address=document.createElement('span');address.textContent=new URL(web.url).hostname;const link=document.createElement('a');link.href=webURL(web.url);link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ouvrir dans un onglet ↗';link.title='Utilisez cet accès si le site bloque l’affichage dans Lew';bar.append(address,link);element.append(bar);}element.append(frame);document.body.append(element);win={element,frame,route,app};windows.set(app.id,win);
    const offset=(windows.size-1)*24;element.style.left=(28+offset)+'px';element.style.top=(58+offset)+'px';
    const focus=()=>{element.style.zIndex=++layer;document.querySelectorAll('.os-window').forEach(w=>w.classList.toggle('focused',w===element));};
    element.addEventListener('pointerdown',focus);frame.addEventListener('load',()=>{try{frame.contentWindow.addEventListener('focus',focus);}catch{}});
    controls.querySelector('[data-action=close]').onclick=()=>hideWindow(win,true);
    controls.querySelector('[data-action=minimize]').onclick=()=>hideWindow(win);
    const maximize=()=>{element.classList.toggle('maximized');controls.querySelector('[data-action=maximize]').setAttribute('aria-label',(element.classList.contains('maximized')?'Restaurer ':'Agrandir ')+app.name);syncDock();};
    controls.querySelector('[data-action=maximize]').onclick=maximize;titlebar.ondblclick=event=>{if(!event.target.closest('button'))maximize();};
    titlebar.onpointerdown=event=>{
      if(event.target.closest('button')||element.classList.contains('maximized')||matchMedia('(max-width:800px)').matches)return;
      const rect=element.getBoundingClientRect(),startX=event.clientX,startY=event.clientY;titlebar.setPointerCapture(event.pointerId);element.classList.add('dragging');
      titlebar.onpointermove=move=>{const pos=clampWindow(rect.x+move.clientX-startX,rect.y+move.clientY-startY,rect.width,rect.height,{width:innerWidth,height:innerHeight});element.style.left=pos.x+'px';element.style.top=pos.y+'px';};
      const end=()=>{element.classList.remove('dragging');titlebar.onpointermove=null;titlebar.onpointerup=null;titlebar.onlostpointercapture=null;};titlebar.onpointerup=end;titlebar.onlostpointercapture=end;
    };
  }else if(!web&&!(route.view===app.view&&!route.projectId&&!route.workspaceId&&!route.missionId&&!route.prNumber&&!route.query&&!route.launchProjectId&&!route.launchBrief)&&(route.launchBrief||route.launchProjectId||routeFor(win.route)!==routeFor(route))){
    win.frame.contentWindow.postMessage({type:'lew-route',route},location.origin);win.route=route;
  }
  if([...windows.values()].some(w=>w!==win&&!w.element.hidden&&w.element.classList.contains('maximized'))){win.element.classList.add('maximized');win.element.querySelector('[data-action=maximize]').setAttribute('aria-label','Restaurer '+app.name);}
  win.element.getAnimations().forEach(a=>a.cancel());
  const wasHidden=win.element.hidden;win.element.hidden=false;if(wasHidden&&!matchMedia('(prefers-reduced-motion:reduce)').matches)win.element.animate([{opacity:0,transform:'translateY(14px) scale(.97)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
  win.element.style.zIndex=++layer;document.querySelectorAll('.os-window').forEach(w=>w.classList.toggle('focused',w===win.element));syncDock();
}
export function showDesktop(){windows.forEach(w=>w.element.hidden=true);syncDock();}
export function syncDock(){document.body.classList.toggle('os-fullscreen',[...windows.values()].some(w=>!w.element.hidden&&w.element.classList.contains('maximized')));document.querySelectorAll('.desktop-dock [data-view]').forEach(button=>{const app=applicationFor(button.dataset.view),win=app&&windows.get(app.id);button.classList.toggle('is-open',!!win);button.classList.toggle('selected',!!win&&!win.element.hidden);});}
export function initApplications(onRoute){
  document.body.classList.toggle('embedded-app',!!embeddedApplication);if(embeddedApplication)document.body.dataset.application=embeddedApplication;
  if(!embeddedApplication){
    const zone=document.createElement('div');zone.className='os-dock-zone';zone.setAttribute('aria-hidden','true');document.body.append(zone);
    const restore=document.createElement('button');restore.className='dock-item dock-restore';restore.setAttribute('aria-label','Revenir à la fenêtre réduite');restore.title='Revenir à la fenêtre réduite';restore.innerHTML=icon('projects');
    restore.onclick=()=>{const win=[...windows.values()].find(w=>!w.element.hidden&&w.element.classList.contains('focused')&&w.element.classList.contains('maximized'))||[...windows.values()].find(w=>!w.element.hidden&&w.element.classList.contains('maximized'));if(!win)return;win.element.classList.remove('maximized');win.element.querySelector('[data-action=maximize]').setAttribute('aria-label','Agrandir '+win.app.name);syncDock();};
    document.querySelector('.desktop-dock').append(restore);
  }
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||!event.data?.route||!parseRoute(routeFor(event.data.route)))return;
    if(embeddedApplication&&event.source===parent&&event.data.type==='lew-route')onRoute(event.data.route);
    if(!embeddedApplication){const source=[...windows.values()].find(w=>w.frame.contentWindow===event.source);if(!source)return;if(event.data.type==='lew-open-app')openApplication(event.data.route);if(event.data.type==='lew-app-route')source.route=event.data.route;}
  });
}
export function notifyApplicationRoute(route){if(embeddedApplication)parent.postMessage({type:'lew-app-route',route},location.origin);}
export function appLauncher(){return `<section class="os-launcher"><div class="desktop-heading"><h1>Vos applications.</h1><p>Un espace pour chaque façon de travailler.</p></div><div class="os-apps">${applications.map(app=>`<button data-view="${app.view}" class="os-app-tile"><span class="os-tile-icon os-icon-${app.id}">${icon(app.icon)}</span><strong>${app.name}</strong><small>${app.description}</small></button>`).join('')}</div></section>`;}

export function openWebWidget(widget){const url=webURL(widget.url);if(new URL(url).origin===location.origin)throw new Error('Choisissez un site externe au bureau Lew.');openApplication({view:'web',webWidget:{...widget,url}});}
