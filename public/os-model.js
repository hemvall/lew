export const applications = [
  {id:'workspace',name:'Lew · Travail',description:'Chats, missions et suivi dans un seul espace',view:'chats',icon:'chats',views:['projects','project','chats','workspace','pr','missions','agents','activity','review']},
  {id:'studio',name:'Product Lab',description:'Concevoir vos produits IA',view:'studio',icon:'lab',views:['studio']}
];
export const applicationFor=view=>applications.find(app=>app.views.includes(view));
export function clampWindow(x,y,width,height,viewport){return {x:Math.max(0,Math.min(x,Math.max(0,viewport.width-width))),y:Math.max(40,Math.min(y,Math.max(40,viewport.height-90-height)))};}
