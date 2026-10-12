import {icon} from './icons.js';
export const preferenceDefaults=Object.freeze({theme:'system',accent:'blue',wallpaper:'original',density:'comfortable',motion:true,transparency:true,sound:true});
const choices={theme:['system','light','dark'],accent:['blue','purple','green','orange','pink'],wallpaper:['original','ocean','dusk','graphite'],density:['comfortable','compact']};
export function normalizePreferences(value){
  const result={...preferenceDefaults};
  if(!value||typeof value!=='object')return result;
  for(const [key,values] of Object.entries(choices))if(values.includes(value[key]))result[key]=value[key];
  for(const key of ['motion','transparency','sound'])if(typeof value[key]==='boolean')result[key]=value[key];
  return result;
}
export function readPreferences(storage){
  try{const raw=storage.getItem('lew-preferences');if(raw)return normalizePreferences(JSON.parse(raw));const legacy=storage.getItem('lew-theme');return normalizePreferences(legacy?{theme:legacy}:null);}catch{return {...preferenceDefaults};}
}
export function motionReduced(){return document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;}
export function initPreferences({modal,toast}){
  let preferences=readPreferences(localStorage);
  const system=matchMedia('(prefers-color-scheme: dark)');
  function apply(){
    const root=document.documentElement;
    root.classList.toggle('dark',preferences.theme==='dark'||preferences.theme==='system'&&system.matches);
    for(const key of ['accent','wallpaper','density'])root.dataset[key]=preferences[key];
    root.dataset.motion=preferences.motion?'full':'reduced';root.dataset.transparency=preferences.transparency?'full':'reduced';root.dataset.sound=preferences.sound?'on':'off';
    if(motionReduced())document.getAnimations().forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});
  }
  function save(){apply();try{localStorage.setItem('lew-preferences',JSON.stringify(preferences));}catch{toast('Réglages appliqués, mais leur enregistrement est indisponible dans ce navigateur.');}}
  system.addEventListener('change',apply);
  window.addEventListener('storage',event=>{if(event.key==='lew-preferences'||event.key===null){preferences=readPreferences(localStorage);apply();if(document.querySelector('.appearance-settings'))open();}});
  function open(){
    const select=(key,label,options)=>`<label class="settings-row"><span>${label}</span><select data-preference="${key}">${options.map(([value,text])=>`<option value="${value}" ${preferences[key]===value?'selected':''}>${text}</option>`).join('')}</select></label>`;
    const toggle=(key,label,description)=>`<label class="settings-row"><span>${label}<small>${description}</small></span><input class="settings-switch" type="checkbox" role="switch" data-preference="${key}" ${preferences[key]?'checked':''}></label>`;
    modal('Réglages',`<div class="appearance-settings"><p class="settings-caption">Votre espace, à votre façon. Les changements s’appliquent immédiatement.</p><section class="settings-group"><h3>${icon('appearance')} Apparence</h3>${select('theme','Thème',[['system','Automatique'],['light','Clair'],['dark','Sombre']])}<fieldset class="settings-row accent-choices"><legend>Couleur d’accent</legend><div>${[['blue','Bleu'],['purple','Violet'],['green','Vert'],['orange','Orange'],['pink','Rose']].map(([value,label])=>`<label class="accent-swatch" data-color="${value}" title="${label}"><input type="radio" name="accent" data-preference="accent" value="${value}" aria-label="${label}" ${preferences.accent===value?'checked':''}><span>${icon('check')}</span></label>`).join('')}</div></fieldset>${select('wallpaper','Fond du bureau',[['original','Lew'],['ocean','Océan'],['dusk','Crépuscule'],['graphite','Graphite']])}${select('density','Espacement',[['comfortable','Confortable'],['compact','Compact']])}</section><section class="settings-group"><h3>${icon('accessibility')} Confort</h3>${toggle('motion','Animations','Respecte aussi la préférence de votre système.')}${toggle('transparency','Transparence','Désactivez-la pour des surfaces plus lisibles.')}${toggle('sound','Son des autorisations','Les notifications restent visibles même sans son.')}</section><div class="settings-footer"><button class="secondary" id="reset-preferences">Rétablir les réglages</button><span>Enregistrés sur ce navigateur</span></div></div>`);
    document.querySelectorAll('[data-preference]').forEach(input=>input.addEventListener('change',()=>{preferences=normalizePreferences({...preferences,[input.dataset.preference]:input.type==='checkbox'?input.checked:input.value});save();}));
    document.querySelector('#reset-preferences').onclick=()=>{preferences={...preferenceDefaults};save();open();};
  }
  document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key===','&&!event.altKey){event.preventDefault();open();}});
  apply();return {open};
}
