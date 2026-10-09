/* Avatar Core/Web 0.1.0 © Stéphane Montlouis-Calixte · AGPL-3.0-only. See AVATAR-LICENSE.txt and repository THIRD_PARTY_NOTICES.md for source. */
var Oe=(r,s)=>()=>{try{return s||r((s={exports:{}}).exports,s),s.exports}catch(n){throw s=0,n}};var Ds=Oe(We=>{"use strict";Object.defineProperty(We,"__esModule",{value:!0});function Ss(r){let s=r.length,n=0,o=0,p;for(;o<s;)n++,p=r.charCodeAt(o++),p>=55296&&p<=56319&&o<s&&(p=r.charCodeAt(o),(p&64512)===56320&&o++);return n}We.default=Ss;Ss.code='require("ajv/dist/runtime/ucs2length").default'});var Ts=Oe(($t,Rs)=>{"use strict";Rs.exports=function r(s,n){if(s===n)return!0;if(s&&n&&typeof s=="object"&&typeof n=="object"){if(s.constructor!==n.constructor)return!1;var o,p,d;if(Array.isArray(s)){if(o=s.length,o!=n.length)return!1;for(p=o;p--!==0;)if(!r(s[p],n[p]))return!1;return!0}if(s.constructor===RegExp)return s.source===n.source&&s.flags===n.flags;if(s.valueOf!==Object.prototype.valueOf)return s.valueOf()===n.valueOf();if(s.toString!==Object.prototype.toString)return s.toString()===n.toString();if(d=Object.keys(s),o=d.length,o!==Object.keys(n).length)return!1;for(p=o;p--!==0;)if(!Object.prototype.hasOwnProperty.call(n,d[p]))return!1;for(p=o;p--!==0;){var e=d[p];if(!r(s[e],n[e]))return!1}return!0}return s!==s&&n!==n}});var _s=Oe(Xe=>{"use strict";Object.defineProperty(Xe,"__esModule",{value:!0});var zs=Ts();zs.code='require("ajv/dist/runtime/equal").default';Xe.default=zs});var is=["none","microSaccades","shake"],as=["none","slowDrift","shake"],ut=new Set(is),lt=new Set(as);var ns=r=>r*r*(3-2*r),ue=r=>{let s=Math.sin(r*127.1+311.7)*43758.5453;return(s-Math.floor(s))*2-1},rr=r=>r.headX*.71+r.headY*1.13+r.headZ*1.37,rs=17.29,Fe=(r,s,n,o)=>{let p=r/o,d=Math.floor(p),e=ns(p-d),a=ue(d*3+s+n);return a+(ue((d+1)*3+s+n)-a)*e},ts=(r,s,n)=>{let o=1100;if(r<=0)return 0;let p=Math.floor(r/o),d=(r-p*o)/140,e=ns(Math.min(d,1)),a=p===0?0:ue((p-1)*2+s+n);return a+(ue(p*2+s+n)-a)*e};var os=(r,s,n=1)=>{if(r.eyeMotion==="microSaccades")return{x:ts(s,0,rs)*1.5*n,y:ts(s,1,rs)*.9*n};if(r.eyeMotion==="shake"){let o=s/1e3;return{x:(Math.sin(o*47)+Math.sin(o*71)*.45)*1.2*n,y:(Math.sin(o*59)+Math.sin(o*83)*.4)*.8*n}}return{x:0,y:0}},ms=(r,s,n=1)=>{let o={...r},p=rr(r);if(r.bodyMotion==="slowDrift")o.headX+=Fe(s,0,p,2600)*.8*n,o.headY+=Fe(s,1,p,3300)*1.15*n,o.headZ+=Fe(s,2,p,4100)*.45*n;else if(r.bodyMotion==="shake"){let d=s/1e3;o.headX+=(Math.sin(d*31)+Math.sin(d*53)*.45)*1.15*n,o.headY+=(Math.sin(d*37)+Math.sin(d*61)*.4)*1.35*n,o.headZ+=Math.sin(d*43)*.7*n}return o},ps=(r,s,n=1)=>{let o=ms(r,s,n),p=os(r,s,n);return o.positionXLeft+=p.x,o.positionXRight+=p.x,o.positionYLeft+=p.y,o.positionYRight+=p.y,o};var hs={sphere:{type:"sphere",width:240,height:240,depth:240,roundness:1},mickey:{type:"mickey",width:220,height:210,depth:145,roundness:1},cursor:{type:"cursor",width:175,height:260,depth:145,roundness:0},cube:{type:"cube",width:245,height:245,depth:220,roundness:0},capsule:{type:"capsule",width:205,height:270,depth:205,roundness:1},cylinder:{type:"cylinder",width:235,height:250,depth:215,roundness:.45,morphRoundness:0},cone:{type:"cone",width:250,height:265,depth:225,roundness:0,morphRoundness:0,tipRoundness:.55,baseRoundness:.45},diamond:{type:"diamond",width:235,height:260,depth:215,roundness:0}};var le=(r,s)=>Math.sign(r)*Math.abs(r)**s,tr=(r,s,n,o,p,d,e)=>{let a=le(Math.cos(s),d);return[n/2*a*le(Math.sin(r),e),o/2*le(Math.sin(s),d),p/2*a*le(Math.cos(r),e)]},ir=(r,s,n)=>{let o=r.width/2,p=r.depth/2,d=Math.min(o,r.height/2),e=Math.max(0,(r.height-d*2)/2),a=e*2+Math.PI*d,u=(n+Math.PI/2)/Math.PI*a,t=o,i=0;if(u<Math.PI*d/2){let l=-Math.PI/2+u/d;t=o*Math.cos(l),i=-e+d*Math.sin(l)}else if(u<=Math.PI*d/2+e*2)i=-e+u-Math.PI*d/2;else{let l=(u-Math.PI*d/2-e*2)/d;t=o*Math.cos(l),i=e+d*Math.sin(l)}let m=o?p/o:1;return[t*Math.sin(s),i,t*m*Math.cos(s)]},Re=r=>Math.max(0,Math.min(2,r??0)),Te=r=>1+Re(r.roundness)/2,ar=.04,ze=r=>r.roundness<=0?1/0:2/(ar+Re(r.roundness)/2*.96),fs=(r,s,n,o)=>{let p=Math.cos(n)*Math.sin(s),d=Math.sin(n),e=Math.cos(n)*Math.cos(s),a=Number.isFinite(o)?(Math.abs(p)**o+Math.abs(d)**o+Math.abs(e)**o)**(1/o)||1:Math.max(Math.abs(p),Math.abs(d),Math.abs(e))||1;return[r.width/2*(p/a),r.height/2*(d/a),r.depth/2*(e/a)]},nr=(r,s,n)=>fs(r,s,n,Te(r)),or=(r,s,n)=>fs(r,s,n,ze(r)),mr=.24,pr=.2,dr=.22,ur=r=>Re(r.morphRoundness)/2,cs=(r,s,n)=>{let o=ur(r),p=Math.max(0,Math.min(1,s)),d=Math.sin(p*Math.PI),e=(1-Math.cos(p*Math.PI))/2;return{radiusScale:n.radiusScale+(d-n.radiusScale)*o,verticalProgress:n.verticalProgress+(e-n.verticalProgress)*o}},he=(r,s,n,o,p)=>{let d=1-p;return d**3*r+3*d*d*p*s+3*d*p*p*n+p**3*o},lr=r=>({tipFraction:(r.tipRoundness??0)*mr,baseFraction:(r.baseRoundness??0)*pr}),_e=(r,s)=>{let n=Math.max(0,Math.min(1,s)),o=r.roundness*dr;if(o<=0)return{radiusScale:1,verticalProgress:(Math.sin((n-.5)*Math.PI)+1)/2};if(n<o){let d=-Math.PI/2+n/o*(Math.PI/2);return{radiusScale:1-o+o*Math.cos(d),verticalProgress:(o+o*Math.sin(d))/2}}if(n>1-o){let d=(n-(1-o))/o*(Math.PI/2);return{radiusScale:1-o+o*Math.cos(d),verticalProgress:1-o/2+o*Math.sin(d)/2}}let p=(n-o)/(1-o*2);return{radiusScale:1,verticalProgress:o/2+p*(1-o)}},ys=(r,s)=>cs(r,s,_e(r,s)),Ee=(r,s,n)=>{let o=Math.max(0,Math.min(1,s)),p=0,d=1;for(let e=0;e<14;e+=1){let a=(p+d)/2;n(r,a).verticalProgress<o?p=a:d=a}return n(r,(p+d)/2).radiusScale},hr=(r,s)=>{let n=Math.max(0,Math.min(1,s)),{tipFraction:o,baseFraction:p}=lr(r);if(p>0&&n<p){let d=n/p;return{radiusScale:he(1-p,1,1-p/2,1-p,d),verticalProgress:he(0,0,p/2,p,d)}}if(o>0&&n>1-o){let d=(n-(1-o))/o;return{radiusScale:he(o,o/2,o/4,0,d),verticalProgress:he(1-o,1-o/2,1,1,d)}}return{radiusScale:1-n,verticalProgress:n}},bs=(r,s)=>cs(r,s,hr(r,s)),ae=r=>{let s=r.height*.36,n=r.height-s;return{coneApexY:-r.height/2,coneBaseY:-r.height/2+s,bodyHeight:n,bodyCenterY:r.height/2-n/2,bodyWidth:r.width*.54,bodyDepth:r.depth*.62}},D=(r,s,n)=>{let{width:o,height:p,depth:d}=r;switch(r.type){case"sphere":case"mickey":return tr(s,n,o,p,d,1,1);case"cube":return or(r,s,n);case"cylinder":{let e=ys(r,(n+Math.PI/2)/Math.PI);return[o/2*e.radiusScale*Math.sin(s),-p/2+p*e.verticalProgress,d/2*e.radiusScale*Math.cos(s)]}case"cursor":{let e=ae(r),a=(n+Math.PI/2)/Math.PI,u=_e({...r,width:e.bodyWidth,height:e.bodyHeight,depth:e.bodyDepth},a);return[e.bodyWidth/2*u.radiusScale*Math.sin(s),e.bodyCenterY-e.bodyHeight/2+e.bodyHeight*u.verticalProgress,e.bodyDepth/2*u.radiusScale*Math.cos(s)]}case"diamond":return nr(r,s,n);case"capsule":return ir(r,s,n);case"cone":{let e=bs(r,(n+Math.PI/2)/Math.PI);return[o/2*e.radiusScale*Math.sin(s),p/2-p*e.verticalProgress,d/2*e.radiusScale*Math.cos(s)]}}},ds=(r,s)=>[r[0]-s[0],r[1]-s[1],r[2]-s[2]],W=([r,s,n])=>{let o=Math.hypot(r,s,n)||1;return[r/o,s/o,n/o]},fr=(r,s,n)=>{let o=r.type==="cone"?-1:1;return W([o*(s[1]*n[2]-s[2]*n[1]),o*(s[2]*n[0]-s[0]*n[2]),o*(s[0]*n[1]-s[1]*n[0])])},cr=(r,s,n)=>{let o=5e-4;if(r.type==="cone"&&n>=Math.PI/2-o)return[0,-1,0];let p=D(r,s-o,n),d=D(r,s+o,n),e=D(r,s,Math.max(-Math.PI/2,n-o)),a=D(r,s,Math.min(Math.PI/2,n+o));return fr(r,ds(d,p),ds(a,e))},Se=(r,s)=>Math.sign(r)*Math.abs(r)**s,gs=(r,s,n)=>{let o=r.width/2||1,p=r.height/2||1,d=r.depth/2||1;return W([Se(s[0]/o,n-1)/o,Se(s[1]/p,n-1)/p,Se(s[2]/d,n-1)/d])},xs=(r,s)=>gs(r,s,Te(r)),Ps=(r,s)=>{let n=ze(r);if(Number.isFinite(n))return gs(r,s,n);let o=[s[0]/(r.width/2||1),s[1]/(r.height/2||1),s[2]/(r.depth/2||1)],p=o.reduce((d,e,a)=>Math.abs(e)>Math.abs(o[d])?a:d,0);return[p===0?Math.sign(o[0]):0,p===1?Math.sign(o[1]):0,p===2?Math.sign(o[2]):0]},us=(r,s,n,o,p)=>{let d=r.width/2||1,e=r.height/2||1,a=r.depth/2||1;if(!Number.isFinite(o)){let f=[Math.max(-d,Math.min(d,s)),Math.max(-e,Math.min(e,n)),a];return{point:f,normal:p(r,f)}}let u=Math.max(-1,Math.min(1,n/e)),t=Math.max(0,1-Math.abs(u)**o)**(1/o),i=Math.max(-d*t,Math.min(d*t,s)),m=i/d,l=Math.max(0,1-Math.abs(m)**o-Math.abs(u)**o)**(1/o),h=[i,u*e,a*l];return{point:h,normal:p(r,h)}},ls=(r,s,n,o,p,d=0)=>{let e=s-d,a=Math.max(0,1-(r/(n||1))**2-(e/(o||1))**2),u=p*Math.sqrt(a);return{point:[r,s,u],normal:W([r/(n*n||1),e/(o*o||1),u/(p*p||1)])}},De=(r,s,n,o,p)=>{let d=r.width/2||1,e=r.depth/2||1,a=Math.max(0,Math.min(1,.5+p*(n/r.height))),u=Ee(r,a,o),t=d*u,i=e*u,m=Math.max(-t,Math.min(t,s)),l=t>0?Math.max(0,1-(m/t)**2):0,h=i*Math.sqrt(l),f=1e-4,c=Math.max(0,a-f),y=Math.min(1,a+f),x=Ee(r,c,o),B=(Ee(r,y,o)-x)/(y-c||1),E=Math.max(Math.sqrt(l),1e-4),K=-(e/d)*m/(t*E||1),S=p*e*B/(r.height*E||1);return{point:[m,n,h],normal:W([-K,-S,1])}},ks=(r,s,n)=>{let o=r.width/2||1,p=r.height/2||1,d=r.depth/2||1;switch(r.type){case"sphere":case"mickey":return ls(s,n,o,p,d);case"cube":return us(r,s,n,ze(r),Ps);case"capsule":{let e=Math.min(o,p),a=Math.max(0,p-e);return ls(s,n,o,e,d,n<-a?-a:n>a?a:n)}case"cylinder":return De(r,s,n,ys,1);case"cursor":{let e=ae(r),a=De({...r,width:e.bodyWidth,height:e.bodyHeight,depth:e.bodyDepth},s,n-e.bodyCenterY,_e,1);return{point:[a.point[0],a.point[1]+e.bodyCenterY,a.point[2]],normal:a.normal}}case"cone":return De(r,s,n,bs,-1);case"diamond":return us(r,s,n,Te(r),xs)}};var $s=(r,s,n)=>{let o=D(r,s,n);if(r.type==="sphere"||r.type==="mickey"){let p=r.width/2||1,d=r.height/2||1,e=r.depth/2||1;return{point:o,normal:W([o[0]/(p*p),o[1]/(d*d),o[2]/(e*e)])}}return r.type==="cylinder"&&r.roundness<=0&&(r.morphRoundness??0)<=0?{point:o,normal:W([Math.sin(s)/(r.width/2||1),0,Math.cos(s)/(r.depth/2||1)])}:r.type==="diamond"?{point:o,normal:xs(r,o)}:r.type==="cube"?{point:o,normal:Ps(r,o)}:{point:o,normal:cr(r,s,n)}};var Le=16,bt=Object.keys(hs);var fe=620,Ms=14,js=["headX","headY","headZ","widthLeft","widthRight","heightLeft","heightRight","spacing","positionXLeft","positionXRight","positionYLeft","positionYRight","leftAngle","rightAngle","perspective"],Os=(r,s,n)=>Math.max(s,Math.min(n,r)),$=r=>r*Math.PI/180,Ve=([r,s,n,o])=>{let p=Math.hypot(r,s,n,o)||1;return[r/p,s/p,n/p,o/p]},Ce=([r,s,n,o],[p,d,e,a])=>Ve([r*p-s*d-n*e-o*a,r*d+s*p+n*a-o*e,r*e-s*a+n*p+o*d,r*a+s*e-n*d+o*p]),ce=([r,s,n],o)=>{let p=o/2,d=Math.sin(p);return Ve([Math.cos(p),r*d,s*d,n*d])},ge=(r,s,n)=>{let o=ce([1,0,0],r),p=ce([0,1,0],s);return Ce(Ce(ce([0,0,1],n),o),p)};var yr=(r,s)=>{let n=r;for(;n-s>180;)n-=360;for(;n-s<-180;)n+=360;return Os(n,-365,365)};var v=([r,s,n,o],[p,d,e])=>{let a=2*(n*e-o*d),u=2*(o*p-s*e),t=2*(s*d-n*p);return[p+r*a+(n*t-o*u),d+r*u+(o*a-s*t),e+r*t+(s*u-n*a)]},br=(r,s)=>{let n=r/2,o=s/2,p=Math.min(o,n),d=[],e=(u,t)=>{let i=Math.max(2,Math.ceil(Math.hypot(t[0]-u[0],t[1]-u[1])/1.5));for(let m=0;m<i;m+=1){let l=m/i;d.push([u[0]+(t[0]-u[0])*l,u[1]+(t[1]-u[1])*l])}},a=(u,t,i)=>{for(let m=0;m<Ms;m+=1){let l=i+m/Ms*(Math.PI/2);d.push([u+Math.cos(l)*p,t+Math.sin(l)*p])}};return e([-n+p,-o],[n-p,-o]),a(n-p,-o+p,-Math.PI/2),e([n,-o+p],[n,o-p]),a(n-p,o-p,0),e([n-p,o],[-n+p,o]),a(-n+p,o-p,Math.PI/2),e([-n,o-p],[-n,-o+p]),a(-n+p,-o+p,Math.PI),d},xe=(r,s)=>{let n=fe-r[2]*s,o=Math.abs(n)<1e-4?fe/1e-4:fe/n;return[r[0]*o,r[1]*o,r[2]]};var j=(r,s=!0)=>r.length?`M${r[0][0].toFixed(2)} ${r[0][1].toFixed(2)}${r.slice(1).map(n=>`L${n[0].toFixed(2)} ${n[1].toFixed(2)}`).join("")}${s?"Z":""}`:"",Y=r=>({expression:r,orientation:ge($(r.headX),$(r.headY),$(r.headZ))}),Ke=(r,s,n)=>{let o={...r.expression};return js.forEach(p=>{let d=s.expression[p];(p==="headX"||p==="headY"||p==="headZ"||p==="leftAngle"||p==="rightAngle")&&(d=yr(d,r.expression[p])),o[p]=r.expression[p]+(d-r.expression[p])*n}),{expression:o,orientation:Y(o).orientation}},gr=24,xr=25,Pr=73,Be=144,kr=33,$r=73,ye=new Map,vs=new Map,ws=new Map,Pe=r=>JSON.stringify([r.type,r.width,r.height,r.depth,r.roundness,r.morphRoundness,r.tipRoundness,r.baseRoundness]),ke=(r,s,n)=>(r.size>=gr&&r.delete(r.keys().next().value),r.set(s,n),n),Ns=(r,s,n)=>$s(r,s,n),Fs=(r,s)=>({point:xe(v(r.orientation,s.point),r.expression.perspective),normal:v(r.orientation,s.normal)}),Mr=(r,s)=>{let n=r/120,o=s/120;return[120*Math.cos(o)*Math.sin(n),120*Math.sin(o)]},vr=(r,s,n,o)=>{let[p,d]=Mr(n,o);return Fs(r,ks(s,p,d))},As=(r,s,n,o,p={x:0,y:0})=>{let d=r.expression,e=n<0?"Left":"Right",a=d[`width${e}`],u=5+(d[`height${e}`]-5)*o,t=n*d.spacing/2+d[`positionX${e}`]+p.x,i=d[`positionY${e}`]+p.y,m=$(n<0?d.leftAngle:d.rightAngle);return br(a,u).map(([l,h])=>{let f=l*Math.cos(m)-h*Math.sin(m),c=l*Math.sin(m)+h*Math.cos(m);return vr(r,s,t+f,i+c)})},wr=r=>{let s=[],n=[];return r.forEach(({point:o,normal:p})=>{p[2]>0?n.push(o):n.length&&(s.push(n),n=[])}),n.length&&s.push(n),s.filter(o=>o.length>1).map(o=>j(o,!1)).join("")},Nr=(r,s)=>{let n=Pe(s),o=ws.get(n);if(!o){let p=[-60,-30,0,30,60].map(e=>Array.from({length:73},(a,u)=>Ns(s,$(-180+u*5),$(e)))),d=Array.from({length:12},(e,a)=>-150+a*30).map(e=>Array.from({length:37},(a,u)=>Ns(s,$(e),$(-90+u*5))));o=ke(ws,n,[...p,...d])}return o.map(p=>wr(p.map(d=>Fs(r,d))))};var O=r=>{let s=[...r].sort((p,d)=>p[0]-d[0]||p[1]-d[1]),n=(p,d,e)=>(d[0]-p[0])*(e[1]-p[1])-(d[1]-p[1])*(e[0]-p[0]),o=p=>{let d=[];return p.forEach(e=>{for(;d.length>=2&&n(d.at(-2),d.at(-1),e)<=0;)d.pop();d.push(e)}),d};return[...o(s).slice(0,-1),...o(s.reverse()).slice(0,-1)]},U=r=>{if(r.length<3)return j(r);let s=n=>r[(n+r.length)%r.length];return`M${r[0][0].toFixed(2)} ${r[0][1].toFixed(2)}${r.map((n,o)=>{let p=s(o-1),d=s(o+1),e=s(o+2),a=[n[0]+(d[0]-p[0])/6,n[1]+(d[1]-p[1])/6,n[2]],u=[d[0]-(e[0]-n[0])/6,d[1]-(e[1]-n[1])/6,d[2]];return`C${a[0].toFixed(2)} ${a[1].toFixed(2)} ${u[0].toFixed(2)} ${u[1].toFixed(2)} ${d[0].toFixed(2)} ${d[1].toFixed(2)}`}).join("")}Z`},ne=(r,s=7)=>r.flatMap((n,o)=>{let p=r[(o+1)%r.length],d=Math.max(1,Math.ceil(Math.hypot(p[0]-n[0],p[1]-n[1])/s));return Array.from({length:d},(e,a)=>{let u=a/d;return[n[0]+(p[0]-n[0])*u,n[1]+(p[1]-n[1])*u,n[2]+(p[2]-n[2])*u]})}),Ar=r=>r.length?r.length===1?`${r[0][0].toFixed(2)} ${r[0][1].toFixed(2)}`:r.slice(0,-1).map((s,n)=>{let o=r[Math.max(0,n-1)],p=r[n+1],d=r[Math.min(r.length-1,n+2)],e=s[0]+(p[0]-o[0])/6,a=s[1]+(p[1]-o[1])/6,u=p[0]-(d[0]-s[0])/6,t=p[1]-(d[1]-s[1])/6;return`C${e.toFixed(2)} ${a.toFixed(2)} ${u.toFixed(2)} ${t.toFixed(2)} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`}).join(""):"",R=(r,s)=>xe(v(r.orientation,s),r.expression.perspective),X=(r,s,n)=>Array.from({length:145},(o,p)=>{let d=p/Be*Math.PI*2;return[r/2*Math.sin(d),n,s/2*Math.cos(d)]}),$e=(r,s)=>{let n=Pe(s),o=ye.get(n);return o||(o=Array.from({length:kr},(p,d)=>{let e=-Math.PI/2+d/32*Math.PI;return Array.from({length:$r},(a,u)=>{let t=-Math.PI+u/72*Math.PI*2;return D(s,t,e)})}).flat(),ke(ye,n,o)),U(ne(O(o.map(p=>R(r,p)))))},qr=(r,s)=>{if(s.roundness>0||(s.morphRoundness??0)>0)return $e(r,s);let n=s.height/2;return U(ne(O([...X(s.width,s.depth,-n),...X(s.width,s.depth,n)].map(o=>R(r,o)))))},Ir=(r,s)=>{let n=ae(s),o=n.bodyHeight/2;return U(ne(O([...X(n.bodyWidth,n.bodyDepth,n.bodyCenterY-o),...X(n.bodyWidth,n.bodyDepth,n.bodyCenterY+o)].map(p=>R(r,p)))))},jr=(r,s)=>{let n=ae(s),o=R(r,[0,n.coneApexY,0]);return U(ne(O([...X(s.width,s.depth,n.coneBaseY).map(p=>R(r,p)),o])))},Or=(r,s)=>{if((s.morphRoundness??0)>0||(s.tipRoundness??0)>0||(s.baseRoundness??0)>0)return $e(r,s);let n=R(r,[0,-s.height/2,0]),o=O([...X(s.width,s.depth,s.height/2).map(e=>R(r,e)),n]),p=o.findIndex(e=>Math.hypot(e[0]-n[0],e[1]-n[1])<.01);if(p<0)return U(o);let d=[...o.slice(p),...o.slice(0,p)].slice(1);return d.length<2?j(o):`M${n[0].toFixed(2)} ${n[1].toFixed(2)}L${d[0][0].toFixed(2)} ${d[0][1].toFixed(2)}${Ar(d)}L${n[0].toFixed(2)} ${n[1].toFixed(2)}Z`},Fr=(r,s)=>{if(s.roundness>0)return $e(r,s);let n=s.width/2,o=s.height/2,p=s.depth/2;return j(O([-1,1].flatMap(d=>[-1,1].flatMap(e=>[-1,1].map(a=>[d*n,e*o,a*p]))).map(d=>R(r,d))))},Er=(r,s)=>{if(s.roundness>0)return $e(r,s);let n=s.width/2,o=s.height/2,p=s.depth/2;return j(O([[-n,0,0],[n,0,0],[0,-o,0],[0,o,0],[0,0,-p],[0,0,p]].map(d=>R(r,d))))},qs=(r,s,n,o,p)=>{let d=n+p,e=Math.hypot(n-p,o*2),a=(d+e)/2,u=(d-e)/2;return a<=0||u<=0?null:{centerX:r,centerY:s,majorRadius:Math.sqrt(a),minorRadius:Math.sqrt(u),rotation:Math.atan2(o*2,n-p)/2}},Ye=({centerX:r,centerY:s,majorRadius:n,minorRadius:o,rotation:p})=>{let d=p*180/Math.PI,e=Math.cos(p)*n,a=Math.sin(p)*n,u=r+e,t=s+a,i=r-e,m=s-a;return`M${u.toFixed(2)} ${t.toFixed(2)}A${n.toFixed(2)} ${o.toFixed(2)} ${d.toFixed(2)} 0 1 ${i.toFixed(2)} ${m.toFixed(2)}A${n.toFixed(2)} ${o.toFixed(2)} ${d.toFixed(2)} 0 1 ${u.toFixed(2)} ${t.toFixed(2)}Z`},be=(r,s,n=[0,0,0])=>{let o=[v(r.orientation,[1,0,0]),v(r.orientation,[0,1,0]),v(r.orientation,[0,0,1])],p=v(r.orientation,n);if(Math.abs(r.expression.perspective)<1e-4){let A=o.reduce((k,w,M)=>k+w[0]*w[0]*s[M]*s[M],0),q=o.reduce((k,w,M)=>k+w[0]*w[1]*s[M]*s[M],0),C=o.reduce((k,w,M)=>k+w[1]*w[1]*s[M]*s[M],0);return qs(p[0],p[1],A,q,C)}let d=s.map(A=>1/(A*A)),e=Array.from({length:3},(A,q)=>Array.from({length:3},(C,k)=>o.reduce((w,M,re)=>w+M[q]*d[re]*M[k],0))),a=fe/r.expression.perspective,u=[-p[0],-p[1],a-p[2]],t=[e[0][0]*u[0]+e[0][1]*u[1]+e[0][2]*u[2],e[1][0]*u[0]+e[1][1]*u[1]+e[1][2]*u[2],e[2][0]*u[0]+e[2][1]*u[1]+e[2][2]*u[2]],i=u[0]*t[0]+u[1]*t[1]+u[2]*t[2]-1,m=[t[0],t[1],-a*t[2]],l=[[e[0][0],e[0][1],-a*e[0][2]],[e[1][0],e[1][1],-a*e[1][2]],[-a*e[2][0],-a*e[2][1],a*a*e[2][2]]],h=Array.from({length:3},(A,q)=>Array.from({length:3},(C,k)=>m[q]*m[k]-i*l[q][k])),f=h[0][0]*h[1][1]-h[0][1]*h[0][1];if(Math.abs(f)<1e-12)return null;let c=-(h[1][1]*h[0][2]-h[0][1]*h[1][2])/f,y=(h[0][1]*h[0][2]-h[0][0]*h[1][2])/f,x=-(h[2][2]+h[0][2]*c+h[1][2]*y);if(Math.abs(x)<1e-12)return null;let B=h[0][0]/x,E=h[0][1]/x,K=h[1][1]/x,S=B*K-E*E;return S<=0?null:qs(c,y,K/S,-E/S,B/S)},Sr=(r,s)=>{let n=be(r,[s.width/2,s.height/2,s.depth/2]),o=s.width===s.height&&s.height===s.depth;if(n&&o){let p=(n.majorRadius+n.minorRadius)/2;return Ye({centerX:0,centerY:0,majorRadius:p,minorRadius:p,rotation:0})}return n?Ye(n):null},Dr=(r,s)=>{if(s.type!=="mickey")return[];let n=Math.min(s.width,s.height)*.23,o=Math.min(n,s.depth*.29),p=s.width*.37,d=-s.height*.39,e=-s.depth*.12,a=[n,n,o];return[-1,1].map(u=>be(r,a,[u*p,d,e])).filter(u=>u!==null).map(Ye)},Rr=(r,s)=>s.type==="mickey"?Dr(r,s):s.type==="cursor"?[jr(r,s)]:[],Is=r=>Array.from({length:Be},(s,n)=>{let o=n/Be*Math.PI*2,p=Math.cos(o)*r.majorRadius,d=Math.sin(o)*r.minorRadius;return[r.centerX+p*Math.cos(r.rotation)-d*Math.sin(r.rotation),r.centerY+p*Math.sin(r.rotation)+d*Math.cos(r.rotation),0]}),Tr=r=>{if(r.length<3)return j(r);let s=r.map((e,a)=>{let u=r[(a+1)%r.length];return Math.hypot(u[0]-e[0],u[1]-e[1])}),n=[...s].sort((e,a)=>e-a),o=n[Math.floor(n.length/2)]||1,p=Math.max(8,o*3.5),d=s.map(e=>e>p);return`M${r[0][0].toFixed(2)} ${r[0][1].toFixed(2)}${r.map((e,a)=>{let u=(a+1)%r.length,t=r[u];if(d[a])return`L${t[0].toFixed(2)} ${t[1].toFixed(2)}`;let i=d[(a-1+r.length)%r.length]?e:r[(a-1+r.length)%r.length],m=d[u]?t:r[(a+2)%r.length],l=e[0]+(t[0]-i[0])/6,h=e[1]+(t[1]-i[1])/6,f=t[0]-(m[0]-e[0])/6,c=t[1]-(m[1]-e[1])/6;return`C${l.toFixed(2)} ${h.toFixed(2)} ${f.toFixed(2)} ${c.toFixed(2)} ${t[0].toFixed(2)} ${t[1].toFixed(2)}`}).join("")}Z`},zr=(r,s)=>{let n=s.width/2,o=Math.min(n,s.height/2),p=s.depth/2,d=Math.max(0,(s.height-o*2)/2),e=[n,o,p],a=be(r,e,[0,d,0]),u=be(r,e,[0,-d,0]);return!a||!u?null:Tr(O([...Is(a),...Is(u)]))},_r=(r,s)=>{if(s.type==="sphere"||s.type==="mickey"){let p=Sr(r,s);if(p)return p}if(s.type==="capsule"){let p=zr(r,s);if(p)return p}if(s.type==="cylinder")return qr(r,s);if(s.type==="cursor")return Ir(r,s);if(s.type==="cone")return Or(r,s);if(s.type==="cube")return Fr(r,s);if(s.type==="diamond")return Er(r,s);let n=Pe(s),o=ye.get(n);return o||(o=Array.from({length:xr},(p,d)=>{let e=-Math.PI/2+d/24*Math.PI;return Array.from({length:Pr},(a,u)=>{let t=-Math.PI+u/72*Math.PI*2;return D(s,t,e)})}).flat(),ke(ye,n,o)),j(O(o.map(p=>xe(v(r.orientation,p),r.expression.perspective))))},Lr=(r,s)=>{let n=Pe(s.surface),o=vs.get(n);o||(o=Array.from({length:17},(e,a)=>{let u=-Math.PI/2+a/16*Math.PI;return Array.from({length:49},(t,i)=>{let m=-Math.PI+i/48*Math.PI*2;return D(s.surface,m,u)})}).flat(),ke(vs,n,o));let p=ge($(s.rotation[0]),$(s.rotation[1]),$(s.rotation[2])),d=O(o.map(e=>{let a=v(p,e),u=[a[0]+s.position[0],a[1]+s.position[1],a[2]+s.position[2]];return xe(v(r.orientation,u),r.expression.perspective)}));return(s.surface.type==="cube"||s.surface.type==="diamond")&&s.surface.roundness<=0?j(d):U(ne(d))},Cr=.1,Br=(r,s)=>{let n=ge($(s.rotation[0]),$(s.rotation[1]),$(s.rotation[2])),o=[[1,0,0],[0,1,0],[0,0,1]].map(p=>v(r.orientation,v(n,p))[2]);return Math.hypot(o[0]*(s.surface.width/2),o[1]*(s.surface.height/2),o[2]*(s.surface.depth/2))},Yr=(r,s)=>{let n=s.map(o=>{let p=v(r.orientation,o.position)[2];return{id:o.id,path:Lr(r,o),depth:p,front:p>Br(r,o)*Cr}}).sort((o,p)=>o.depth-p.depth);return{backPaths:n.filter(o=>!o.front).map(o=>o.path),frontPaths:n.filter(o=>o.front).map(o=>o.path),backNodeIds:n.filter(o=>!o.front).map(o=>o.id),frontNodeIds:n.filter(o=>o.front).map(o=>o.id)}},Es=(r,s,n=1,o={})=>{let p=As(r,s,-1,n,o.eyeOffset),d=As(r,s,1,n,o.eyeOffset),e=p.map(i=>i.point),a=d.map(i=>i.point),u=Yr(r,o.bodyNodes??[]),t=Rr(r,s);return{backPaths:[...t,...u.backPaths],frontPaths:u.frontPaths,backNodeIds:[...t.map(()=>null),...u.backNodeIds],frontNodeIds:u.frontNodeIds,headPath:_r(r,s),leftPath:j(e),rightPath:j(a),leftVisible:p.reduce((i,m)=>i+m.normal[2],0)>0,rightVisible:d.reduce((i,m)=>i+m.normal[2],0)>0,wirePaths:o.includeWire===!1?[]:Nr(r,s)}};var Vr={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://avatars.bible-strong.app/schemas/avatar-definition-v1.json",title:"Bible Strong Avatar Definition v1",type:"object",additionalProperties:!1,required:["schema","schemaVersion","body","colors","expressions","expressionOrder","animations","animationOrder"],properties:{schema:{const:"bible-strong/avatar-definition"},schemaVersion:{const:1},name:{type:"string",maxLength:120},body:{$ref:"#/$defs/body"},colors:{$ref:"#/$defs/colors"},expressions:{type:"object",minProperties:1,maxProperties:128,required:["neutral"],propertyNames:{$ref:"#/$defs/semanticKey"},properties:{neutral:{$ref:"#/$defs/expression"}},additionalProperties:{$ref:"#/$defs/expression"}},expressionOrder:{type:"array",minItems:1,maxItems:128,uniqueItems:!0,items:{$ref:"#/$defs/semanticKey"}},animations:{type:"object",maxProperties:64,propertyNames:{$ref:"#/$defs/semanticKey"},additionalProperties:{$ref:"#/$defs/animation"}},animationOrder:{type:"array",maxItems:64,uniqueItems:!0,items:{$ref:"#/$defs/semanticKey"}},standardAnimationSet:{const:1,deprecated:!0}},$defs:{semanticKey:{type:"string",maxLength:64,pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},hexColor:{type:"string",pattern:"^#[0-9a-f]{6}$"},boundedNumber:{type:"number",minimum:-1e4,maximum:1e4},dimension:{type:"number",minimum:.001,maximum:1e4},roundness:{type:"number",minimum:0,maximum:1},surface:{type:"object",additionalProperties:!1,required:["type","width","height","depth","roundness"],properties:{type:{enum:["sphere","mickey","cursor","cube","capsule","cylinder","cone","diamond"]},width:{$ref:"#/$defs/dimension"},height:{$ref:"#/$defs/dimension"},depth:{$ref:"#/$defs/dimension"},roundness:{$ref:"#/$defs/roundness"},morphRoundness:{$ref:"#/$defs/roundness"},tipRoundness:{$ref:"#/$defs/roundness"},baseRoundness:{$ref:"#/$defs/roundness"}}},nodeSurface:{allOf:[{$ref:"#/$defs/surface"},{type:"object",properties:{type:{enum:["sphere","cube","capsule","cylinder","cone","diamond"]}}}]},position:{type:"array",minItems:3,maxItems:3,prefixItems:[{$ref:"#/$defs/boundedNumber"},{$ref:"#/$defs/boundedNumber"},{$ref:"#/$defs/boundedNumber"}]},rotation:{type:"array",minItems:3,maxItems:3,prefixItems:[{type:"number",minimum:-360,maximum:360},{type:"number",minimum:-360,maximum:360},{type:"number",minimum:-360,maximum:360}]},body:{type:"object",additionalProperties:!1,required:["primary","nodes"],properties:{primary:{$ref:"#/$defs/surface"},nodes:{type:"array",maxItems:16,items:{type:"object",additionalProperties:!1,required:["surface","position","rotation"],properties:{surface:{$ref:"#/$defs/nodeSurface"},position:{$ref:"#/$defs/position"},rotation:{$ref:"#/$defs/rotation"}}}}}},colors:{type:"object",additionalProperties:!1,required:["body","eyes"],properties:{body:{$ref:"#/$defs/hexColor"},eyes:{$ref:"#/$defs/hexColor"}}},eye:{type:"object",additionalProperties:!1,required:["width","height","x","y","angle"],properties:{width:{$ref:"#/$defs/boundedNumber"},height:{$ref:"#/$defs/boundedNumber"},x:{$ref:"#/$defs/boundedNumber"},y:{$ref:"#/$defs/boundedNumber"},angle:{$ref:"#/$defs/boundedNumber"}}},expression:{type:"object",additionalProperties:!1,required:["head","eyes","perspective","motion"],properties:{head:{type:"object",additionalProperties:!1,required:["x","y","z"],properties:{x:{$ref:"#/$defs/boundedNumber"},y:{$ref:"#/$defs/boundedNumber"},z:{$ref:"#/$defs/boundedNumber"}}},eyes:{type:"object",additionalProperties:!1,required:["left","right","spacing"],properties:{left:{$ref:"#/$defs/eye"},right:{$ref:"#/$defs/eye"},spacing:{$ref:"#/$defs/boundedNumber"}}},perspective:{type:"number",minimum:.1,maximum:10},motion:{type:"object",additionalProperties:!1,required:["eyes","body"],properties:{eyes:{enum:["none","microSaccades","shake"]},body:{enum:["none","slowDrift","shake"]}}},colors:{type:"object",additionalProperties:!1,minProperties:1,properties:{body:{$ref:"#/$defs/hexColor"},eyes:{$ref:"#/$defs/hexColor"}}}}},blink:{type:"object",additionalProperties:!1,required:["enabled","initialDelayMs","minIntervalMs","maxIntervalMs","durationMs"],properties:{enabled:{type:"boolean"},initialDelayMs:{type:"number",minimum:0,maximum:6e4},minIntervalMs:{type:"number",minimum:250,maximum:12e4},maxIntervalMs:{type:"number",minimum:250,maximum:12e4},durationMs:{type:"number",minimum:50,maximum:2e3}}},animation:{type:"object",additionalProperties:!1,required:["playbackMode","steps","blink"],properties:{playbackMode:{enum:["loop","once","pingPong"]},steps:{type:"array",minItems:1,maxItems:128,items:{type:"object",additionalProperties:!1,required:["expression","holdMs","transitionMs","transition"],properties:{expression:{$ref:"#/$defs/semanticKey"},holdMs:{type:"number",minimum:100,maximum:6e4},transitionMs:{type:"number",minimum:0,maximum:5e3},transition:{enum:["spring","smooth","snappy"]}}}},blink:{$ref:"#/$defs/blink"},metadata:{type:"object",additionalProperties:!1,minProperties:1,properties:{label:{type:"string",maxLength:120},description:{type:"string",maxLength:512},group:{type:"string",maxLength:64}}}}}}};var Kr=Object.prototype.hasOwnProperty,_=Ds().default,Ls=_s().default;var Wr={type:"object",additionalProperties:!1,required:["type","width","height","depth","roundness"],properties:{type:{enum:["sphere","mickey","cursor","cube","capsule","cylinder","cone","diamond"]},width:{$ref:"#/$defs/dimension"},height:{$ref:"#/$defs/dimension"},depth:{$ref:"#/$defs/dimension"},roundness:{$ref:"#/$defs/roundness"},morphRoundness:{$ref:"#/$defs/roundness"},tipRoundness:{$ref:"#/$defs/roundness"},baseRoundness:{$ref:"#/$defs/roundness"}}};function L(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=L.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.type===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"type"},message:"must have required property 'type'"};e===null?e=[t]:e.push(t),a++}if(r.width===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"width"},message:"must have required property 'width'"};e===null?e=[t]:e.push(t),a++}if(r.height===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"height"},message:"must have required property 'height'"};e===null?e=[t]:e.push(t),a++}if(r.depth===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"depth"},message:"must have required property 'depth'"};e===null?e=[t]:e.push(t),a++}if(r.roundness===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"roundness"},message:"must have required property 'roundness'"};e===null?e=[t]:e.push(t),a++}for(let t in r)if(!(t==="type"||t==="width"||t==="height"||t==="depth"||t==="roundness"||t==="morphRoundness"||t==="tipRoundness"||t==="baseRoundness")){let i={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:t},message:"must NOT have additional properties"};e===null?e=[i]:e.push(i),a++}if(r.type!==void 0){let t=r.type;if(!(t==="sphere"||t==="mickey"||t==="cursor"||t==="cube"||t==="capsule"||t==="cylinder"||t==="cone"||t==="diamond")){let i={instancePath:s+"/type",schemaPath:"#/properties/type/enum",keyword:"enum",params:{allowedValues:Wr.properties.type.enum},message:"must be equal to one of the allowed values"};e===null?e=[i]:e.push(i),a++}}if(r.width!==void 0){let t=r.width;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/width",schemaPath:"#/$defs/dimension/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<.001||isNaN(t)){let i={instancePath:s+"/width",schemaPath:"#/$defs/dimension/minimum",keyword:"minimum",params:{comparison:">=",limit:.001},message:"must be >= 0.001"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/width",schemaPath:"#/$defs/dimension/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.height!==void 0){let t=r.height;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/height",schemaPath:"#/$defs/dimension/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<.001||isNaN(t)){let i={instancePath:s+"/height",schemaPath:"#/$defs/dimension/minimum",keyword:"minimum",params:{comparison:">=",limit:.001},message:"must be >= 0.001"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/height",schemaPath:"#/$defs/dimension/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.depth!==void 0){let t=r.depth;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/depth",schemaPath:"#/$defs/dimension/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<.001||isNaN(t)){let i={instancePath:s+"/depth",schemaPath:"#/$defs/dimension/minimum",keyword:"minimum",params:{comparison:">=",limit:.001},message:"must be >= 0.001"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/depth",schemaPath:"#/$defs/dimension/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.roundness!==void 0){let t=r.roundness;if(typeof t=="number"&&isFinite(t)){if(t>1||isNaN(t)){let i={instancePath:s+"/roundness",schemaPath:"#/$defs/roundness/maximum",keyword:"maximum",params:{comparison:"<=",limit:1},message:"must be <= 1"};e===null?e=[i]:e.push(i),a++}if(t<0||isNaN(t)){let i={instancePath:s+"/roundness",schemaPath:"#/$defs/roundness/minimum",keyword:"minimum",params:{comparison:">=",limit:0},message:"must be >= 0"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/roundness",schemaPath:"#/$defs/roundness/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.morphRoundness!==void 0){let t=r.morphRoundness;if(typeof t=="number"&&isFinite(t)){if(t>1||isNaN(t)){let i={instancePath:s+"/morphRoundness",schemaPath:"#/$defs/roundness/maximum",keyword:"maximum",params:{comparison:"<=",limit:1},message:"must be <= 1"};e===null?e=[i]:e.push(i),a++}if(t<0||isNaN(t)){let i={instancePath:s+"/morphRoundness",schemaPath:"#/$defs/roundness/minimum",keyword:"minimum",params:{comparison:">=",limit:0},message:"must be >= 0"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/morphRoundness",schemaPath:"#/$defs/roundness/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.tipRoundness!==void 0){let t=r.tipRoundness;if(typeof t=="number"&&isFinite(t)){if(t>1||isNaN(t)){let i={instancePath:s+"/tipRoundness",schemaPath:"#/$defs/roundness/maximum",keyword:"maximum",params:{comparison:"<=",limit:1},message:"must be <= 1"};e===null?e=[i]:e.push(i),a++}if(t<0||isNaN(t)){let i={instancePath:s+"/tipRoundness",schemaPath:"#/$defs/roundness/minimum",keyword:"minimum",params:{comparison:">=",limit:0},message:"must be >= 0"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/tipRoundness",schemaPath:"#/$defs/roundness/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.baseRoundness!==void 0){let t=r.baseRoundness;if(typeof t=="number"&&isFinite(t)){if(t>1||isNaN(t)){let i={instancePath:s+"/baseRoundness",schemaPath:"#/$defs/roundness/maximum",keyword:"maximum",params:{comparison:"<=",limit:1},message:"must be <= 1"};e===null?e=[i]:e.push(i),a++}if(t<0||isNaN(t)){let i={instancePath:s+"/baseRoundness",schemaPath:"#/$defs/roundness/minimum",keyword:"minimum",params:{comparison:">=",limit:0},message:"must be >= 0"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/baseRoundness",schemaPath:"#/$defs/roundness/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return L.errors=e,a===0}L.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};var Xr={allOf:[{$ref:"#/$defs/surface"},{type:"object",properties:{type:{enum:["sphere","cube","capsule","cylinder","cone","diamond"]}}}]};function Z(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=Z.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),L(r,{instancePath:s,parentData:n,parentDataProperty:o,rootData:p,dynamicAnchors:d})||(e=e===null?L.errors:e.concat(L.errors),a=e.length),r&&typeof r=="object"&&!Array.isArray(r)){if(r.type!==void 0){let t=r.type;if(!(t==="sphere"||t==="cube"||t==="capsule"||t==="cylinder"||t==="cone"||t==="diamond")){let i={instancePath:s+"/type",schemaPath:"#/allOf/1/properties/type/enum",keyword:"enum",params:{allowedValues:Xr.allOf[1].properties.type.enum},message:"must be equal to one of the allowed values"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/allOf/1/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return Z.errors=e,a===0}Z.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};function H(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=H.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),Array.isArray(r)){if(r.length>3){let i={instancePath:s,schemaPath:"#/maxItems",keyword:"maxItems",params:{limit:3},message:"must NOT have more than 3 items"};e===null?e=[i]:e.push(i),a++}if(r.length<3){let i={instancePath:s,schemaPath:"#/minItems",keyword:"minItems",params:{limit:3},message:"must NOT have fewer than 3 items"};e===null?e=[i]:e.push(i),a++}let t=r.length;if(t>0){let i=r[0];if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/0",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/0",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/0",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t>1){let i=r[1];if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/1",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/1",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/1",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t>2){let i=r[2];if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/2",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/2",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/2",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"array"},message:"must be array"};e===null?e=[t]:e.push(t),a++}return H.errors=e,a===0}H.evaluated={items:3,dynamicProps:!1,dynamicItems:!1};function Q(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=Q.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.primary===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"primary"},message:"must have required property 'primary'"};e===null?e=[t]:e.push(t),a++}if(r.nodes===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"nodes"},message:"must have required property 'nodes'"};e===null?e=[t]:e.push(t),a++}for(let t in r)if(!(t==="primary"||t==="nodes")){let i={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:t},message:"must NOT have additional properties"};e===null?e=[i]:e.push(i),a++}if(r.primary!==void 0&&(L(r.primary,{instancePath:s+"/primary",parentData:r,parentDataProperty:"primary",rootData:p,dynamicAnchors:d})||(e=e===null?L.errors:e.concat(L.errors),a=e.length)),r.nodes!==void 0){let t=r.nodes;if(Array.isArray(t)){if(t.length>16){let m={instancePath:s+"/nodes",schemaPath:"#/properties/nodes/maxItems",keyword:"maxItems",params:{limit:16},message:"must NOT have more than 16 items"};e===null?e=[m]:e.push(m),a++}let i=t.length;for(let m=0;m<i;m++){let l=t[m];if(l&&typeof l=="object"&&!Array.isArray(l)){if(l.surface===void 0){let h={instancePath:s+"/nodes/"+m,schemaPath:"#/properties/nodes/items/required",keyword:"required",params:{missingProperty:"surface"},message:"must have required property 'surface'"};e===null?e=[h]:e.push(h),a++}if(l.position===void 0){let h={instancePath:s+"/nodes/"+m,schemaPath:"#/properties/nodes/items/required",keyword:"required",params:{missingProperty:"position"},message:"must have required property 'position'"};e===null?e=[h]:e.push(h),a++}if(l.rotation===void 0){let h={instancePath:s+"/nodes/"+m,schemaPath:"#/properties/nodes/items/required",keyword:"required",params:{missingProperty:"rotation"},message:"must have required property 'rotation'"};e===null?e=[h]:e.push(h),a++}for(let h in l)if(!(h==="surface"||h==="position"||h==="rotation")){let f={instancePath:s+"/nodes/"+m,schemaPath:"#/properties/nodes/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:h},message:"must NOT have additional properties"};e===null?e=[f]:e.push(f),a++}if(l.surface!==void 0&&(Z(l.surface,{instancePath:s+"/nodes/"+m+"/surface",parentData:l,parentDataProperty:"surface",rootData:p,dynamicAnchors:d})||(e=e===null?Z.errors:e.concat(Z.errors),a=e.length)),l.position!==void 0&&(H(l.position,{instancePath:s+"/nodes/"+m+"/position",parentData:l,parentDataProperty:"position",rootData:p,dynamicAnchors:d})||(e=e===null?H.errors:e.concat(H.errors),a=e.length)),l.rotation!==void 0){let h=l.rotation;if(Array.isArray(h)){if(h.length>3){let c={instancePath:s+"/nodes/"+m+"/rotation",schemaPath:"#/$defs/rotation/maxItems",keyword:"maxItems",params:{limit:3},message:"must NOT have more than 3 items"};e===null?e=[c]:e.push(c),a++}if(h.length<3){let c={instancePath:s+"/nodes/"+m+"/rotation",schemaPath:"#/$defs/rotation/minItems",keyword:"minItems",params:{limit:3},message:"must NOT have fewer than 3 items"};e===null?e=[c]:e.push(c),a++}let f=h.length;if(f>0){let c=h[0];if(typeof c=="number"&&isFinite(c)){if(c>360||isNaN(c)){let y={instancePath:s+"/nodes/"+m+"/rotation/0",schemaPath:"#/$defs/rotation/prefixItems/0/maximum",keyword:"maximum",params:{comparison:"<=",limit:360},message:"must be <= 360"};e===null?e=[y]:e.push(y),a++}if(c<-360||isNaN(c)){let y={instancePath:s+"/nodes/"+m+"/rotation/0",schemaPath:"#/$defs/rotation/prefixItems/0/minimum",keyword:"minimum",params:{comparison:">=",limit:-360},message:"must be >= -360"};e===null?e=[y]:e.push(y),a++}}else{let y={instancePath:s+"/nodes/"+m+"/rotation/0",schemaPath:"#/$defs/rotation/prefixItems/0/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[y]:e.push(y),a++}}if(f>1){let c=h[1];if(typeof c=="number"&&isFinite(c)){if(c>360||isNaN(c)){let y={instancePath:s+"/nodes/"+m+"/rotation/1",schemaPath:"#/$defs/rotation/prefixItems/1/maximum",keyword:"maximum",params:{comparison:"<=",limit:360},message:"must be <= 360"};e===null?e=[y]:e.push(y),a++}if(c<-360||isNaN(c)){let y={instancePath:s+"/nodes/"+m+"/rotation/1",schemaPath:"#/$defs/rotation/prefixItems/1/minimum",keyword:"minimum",params:{comparison:">=",limit:-360},message:"must be >= -360"};e===null?e=[y]:e.push(y),a++}}else{let y={instancePath:s+"/nodes/"+m+"/rotation/1",schemaPath:"#/$defs/rotation/prefixItems/1/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[y]:e.push(y),a++}}if(f>2){let c=h[2];if(typeof c=="number"&&isFinite(c)){if(c>360||isNaN(c)){let y={instancePath:s+"/nodes/"+m+"/rotation/2",schemaPath:"#/$defs/rotation/prefixItems/2/maximum",keyword:"maximum",params:{comparison:"<=",limit:360},message:"must be <= 360"};e===null?e=[y]:e.push(y),a++}if(c<-360||isNaN(c)){let y={instancePath:s+"/nodes/"+m+"/rotation/2",schemaPath:"#/$defs/rotation/prefixItems/2/minimum",keyword:"minimum",params:{comparison:">=",limit:-360},message:"must be >= -360"};e===null?e=[y]:e.push(y),a++}}else{let y={instancePath:s+"/nodes/"+m+"/rotation/2",schemaPath:"#/$defs/rotation/prefixItems/2/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[y]:e.push(y),a++}}}else{let f={instancePath:s+"/nodes/"+m+"/rotation",schemaPath:"#/$defs/rotation/type",keyword:"type",params:{type:"array"},message:"must be array"};e===null?e=[f]:e.push(f),a++}}}else{let h={instancePath:s+"/nodes/"+m,schemaPath:"#/properties/nodes/items/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[h]:e.push(h),a++}}}else{let i={instancePath:s+"/nodes",schemaPath:"#/properties/nodes/type",keyword:"type",params:{type:"array"},message:"must be array"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return Q.errors=e,a===0}Q.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};var Me=new RegExp("^#[0-9a-f]{6}$","u");function J(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=J.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.body===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"body"},message:"must have required property 'body'"};e===null?e=[t]:e.push(t),a++}if(r.eyes===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"eyes"},message:"must have required property 'eyes'"};e===null?e=[t]:e.push(t),a++}for(let t in r)if(!(t==="body"||t==="eyes")){let i={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:t},message:"must NOT have additional properties"};e===null?e=[i]:e.push(i),a++}if(r.body!==void 0){let t=r.body;if(typeof t=="string"){if(!Me.test(t)){let i={instancePath:s+"/body",schemaPath:"#/$defs/hexColor/pattern",keyword:"pattern",params:{pattern:"^#[0-9a-f]{6}$"},message:'must match pattern "^#[0-9a-f]{6}$"'};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/body",schemaPath:"#/$defs/hexColor/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[i]:e.push(i),a++}}if(r.eyes!==void 0){let t=r.eyes;if(typeof t=="string"){if(!Me.test(t)){let i={instancePath:s+"/eyes",schemaPath:"#/$defs/hexColor/pattern",keyword:"pattern",params:{pattern:"^#[0-9a-f]{6}$"},message:'must match pattern "^#[0-9a-f]{6}$"'};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/eyes",schemaPath:"#/$defs/hexColor/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return J.errors=e,a===0}J.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};var Cs={type:"object",additionalProperties:!1,required:["head","eyes","perspective","motion"],properties:{head:{type:"object",additionalProperties:!1,required:["x","y","z"],properties:{x:{$ref:"#/$defs/boundedNumber"},y:{$ref:"#/$defs/boundedNumber"},z:{$ref:"#/$defs/boundedNumber"}}},eyes:{type:"object",additionalProperties:!1,required:["left","right","spacing"],properties:{left:{$ref:"#/$defs/eye"},right:{$ref:"#/$defs/eye"},spacing:{$ref:"#/$defs/boundedNumber"}}},perspective:{type:"number",minimum:.1,maximum:10},motion:{type:"object",additionalProperties:!1,required:["eyes","body"],properties:{eyes:{enum:["none","microSaccades","shake"]},body:{enum:["none","slowDrift","shake"]}}},colors:{type:"object",additionalProperties:!1,minProperties:1,properties:{body:{$ref:"#/$defs/hexColor"},eyes:{$ref:"#/$defs/hexColor"}}}}};function T(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=T.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.width===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"width"},message:"must have required property 'width'"};e===null?e=[t]:e.push(t),a++}if(r.height===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"height"},message:"must have required property 'height'"};e===null?e=[t]:e.push(t),a++}if(r.x===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"x"},message:"must have required property 'x'"};e===null?e=[t]:e.push(t),a++}if(r.y===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"y"},message:"must have required property 'y'"};e===null?e=[t]:e.push(t),a++}if(r.angle===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"angle"},message:"must have required property 'angle'"};e===null?e=[t]:e.push(t),a++}for(let t in r)if(!(t==="width"||t==="height"||t==="x"||t==="y"||t==="angle")){let i={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:t},message:"must NOT have additional properties"};e===null?e=[i]:e.push(i),a++}if(r.width!==void 0){let t=r.width;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/width",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<-1e4||isNaN(t)){let i={instancePath:s+"/width",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/width",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.height!==void 0){let t=r.height;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/height",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<-1e4||isNaN(t)){let i={instancePath:s+"/height",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/height",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.x!==void 0){let t=r.x;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/x",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<-1e4||isNaN(t)){let i={instancePath:s+"/x",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/x",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.y!==void 0){let t=r.y;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/y",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<-1e4||isNaN(t)){let i={instancePath:s+"/y",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/y",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.angle!==void 0){let t=r.angle;if(typeof t=="number"&&isFinite(t)){if(t>1e4||isNaN(t)){let i={instancePath:s+"/angle",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[i]:e.push(i),a++}if(t<-1e4||isNaN(t)){let i={instancePath:s+"/angle",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/angle",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return T.errors=e,a===0}T.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};function z(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=z.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.head===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"head"},message:"must have required property 'head'"};e===null?e=[t]:e.push(t),a++}if(r.eyes===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"eyes"},message:"must have required property 'eyes'"};e===null?e=[t]:e.push(t),a++}if(r.perspective===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"perspective"},message:"must have required property 'perspective'"};e===null?e=[t]:e.push(t),a++}if(r.motion===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"motion"},message:"must have required property 'motion'"};e===null?e=[t]:e.push(t),a++}for(let t in r)if(!(t==="head"||t==="eyes"||t==="perspective"||t==="motion"||t==="colors")){let i={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:t},message:"must NOT have additional properties"};e===null?e=[i]:e.push(i),a++}if(r.head!==void 0){let t=r.head;if(t&&typeof t=="object"&&!Array.isArray(t)){if(t.x===void 0){let i={instancePath:s+"/head",schemaPath:"#/properties/head/required",keyword:"required",params:{missingProperty:"x"},message:"must have required property 'x'"};e===null?e=[i]:e.push(i),a++}if(t.y===void 0){let i={instancePath:s+"/head",schemaPath:"#/properties/head/required",keyword:"required",params:{missingProperty:"y"},message:"must have required property 'y'"};e===null?e=[i]:e.push(i),a++}if(t.z===void 0){let i={instancePath:s+"/head",schemaPath:"#/properties/head/required",keyword:"required",params:{missingProperty:"z"},message:"must have required property 'z'"};e===null?e=[i]:e.push(i),a++}for(let i in t)if(!(i==="x"||i==="y"||i==="z")){let m={instancePath:s+"/head",schemaPath:"#/properties/head/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:i},message:"must NOT have additional properties"};e===null?e=[m]:e.push(m),a++}if(t.x!==void 0){let i=t.x;if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/head/x",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/head/x",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/head/x",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t.y!==void 0){let i=t.y;if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/head/y",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/head/y",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/head/y",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t.z!==void 0){let i=t.z;if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/head/z",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/head/z",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/head/z",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}}else{let i={instancePath:s+"/head",schemaPath:"#/properties/head/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[i]:e.push(i),a++}}if(r.eyes!==void 0){let t=r.eyes;if(t&&typeof t=="object"&&!Array.isArray(t)){if(t.left===void 0){let i={instancePath:s+"/eyes",schemaPath:"#/properties/eyes/required",keyword:"required",params:{missingProperty:"left"},message:"must have required property 'left'"};e===null?e=[i]:e.push(i),a++}if(t.right===void 0){let i={instancePath:s+"/eyes",schemaPath:"#/properties/eyes/required",keyword:"required",params:{missingProperty:"right"},message:"must have required property 'right'"};e===null?e=[i]:e.push(i),a++}if(t.spacing===void 0){let i={instancePath:s+"/eyes",schemaPath:"#/properties/eyes/required",keyword:"required",params:{missingProperty:"spacing"},message:"must have required property 'spacing'"};e===null?e=[i]:e.push(i),a++}for(let i in t)if(!(i==="left"||i==="right"||i==="spacing")){let m={instancePath:s+"/eyes",schemaPath:"#/properties/eyes/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:i},message:"must NOT have additional properties"};e===null?e=[m]:e.push(m),a++}if(t.left!==void 0&&(T(t.left,{instancePath:s+"/eyes/left",parentData:t,parentDataProperty:"left",rootData:p,dynamicAnchors:d})||(e=e===null?T.errors:e.concat(T.errors),a=e.length)),t.right!==void 0&&(T(t.right,{instancePath:s+"/eyes/right",parentData:t,parentDataProperty:"right",rootData:p,dynamicAnchors:d})||(e=e===null?T.errors:e.concat(T.errors),a=e.length)),t.spacing!==void 0){let i=t.spacing;if(typeof i=="number"&&isFinite(i)){if(i>1e4||isNaN(i)){let m={instancePath:s+"/eyes/spacing",schemaPath:"#/$defs/boundedNumber/maximum",keyword:"maximum",params:{comparison:"<=",limit:1e4},message:"must be <= 10000"};e===null?e=[m]:e.push(m),a++}if(i<-1e4||isNaN(i)){let m={instancePath:s+"/eyes/spacing",schemaPath:"#/$defs/boundedNumber/minimum",keyword:"minimum",params:{comparison:">=",limit:-1e4},message:"must be >= -10000"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/eyes/spacing",schemaPath:"#/$defs/boundedNumber/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}}else{let i={instancePath:s+"/eyes",schemaPath:"#/properties/eyes/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[i]:e.push(i),a++}}if(r.perspective!==void 0){let t=r.perspective;if(typeof t=="number"&&isFinite(t)){if(t>10||isNaN(t)){let i={instancePath:s+"/perspective",schemaPath:"#/properties/perspective/maximum",keyword:"maximum",params:{comparison:"<=",limit:10},message:"must be <= 10"};e===null?e=[i]:e.push(i),a++}if(t<.1||isNaN(t)){let i={instancePath:s+"/perspective",schemaPath:"#/properties/perspective/minimum",keyword:"minimum",params:{comparison:">=",limit:.1},message:"must be >= 0.1"};e===null?e=[i]:e.push(i),a++}}else{let i={instancePath:s+"/perspective",schemaPath:"#/properties/perspective/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[i]:e.push(i),a++}}if(r.motion!==void 0){let t=r.motion;if(t&&typeof t=="object"&&!Array.isArray(t)){if(t.eyes===void 0){let i={instancePath:s+"/motion",schemaPath:"#/properties/motion/required",keyword:"required",params:{missingProperty:"eyes"},message:"must have required property 'eyes'"};e===null?e=[i]:e.push(i),a++}if(t.body===void 0){let i={instancePath:s+"/motion",schemaPath:"#/properties/motion/required",keyword:"required",params:{missingProperty:"body"},message:"must have required property 'body'"};e===null?e=[i]:e.push(i),a++}for(let i in t)if(!(i==="eyes"||i==="body")){let m={instancePath:s+"/motion",schemaPath:"#/properties/motion/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:i},message:"must NOT have additional properties"};e===null?e=[m]:e.push(m),a++}if(t.eyes!==void 0){let i=t.eyes;if(!(i==="none"||i==="microSaccades"||i==="shake")){let m={instancePath:s+"/motion/eyes",schemaPath:"#/properties/motion/properties/eyes/enum",keyword:"enum",params:{allowedValues:Cs.properties.motion.properties.eyes.enum},message:"must be equal to one of the allowed values"};e===null?e=[m]:e.push(m),a++}}if(t.body!==void 0){let i=t.body;if(!(i==="none"||i==="slowDrift"||i==="shake")){let m={instancePath:s+"/motion/body",schemaPath:"#/properties/motion/properties/body/enum",keyword:"enum",params:{allowedValues:Cs.properties.motion.properties.body.enum},message:"must be equal to one of the allowed values"};e===null?e=[m]:e.push(m),a++}}}else{let i={instancePath:s+"/motion",schemaPath:"#/properties/motion/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[i]:e.push(i),a++}}if(r.colors!==void 0){let t=r.colors;if(t&&typeof t=="object"&&!Array.isArray(t)){if(Object.keys(t).length<1){let i={instancePath:s+"/colors",schemaPath:"#/properties/colors/minProperties",keyword:"minProperties",params:{limit:1},message:"must NOT have fewer than 1 properties"};e===null?e=[i]:e.push(i),a++}for(let i in t)if(!(i==="body"||i==="eyes")){let m={instancePath:s+"/colors",schemaPath:"#/properties/colors/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:i},message:"must NOT have additional properties"};e===null?e=[m]:e.push(m),a++}if(t.body!==void 0){let i=t.body;if(typeof i=="string"){if(!Me.test(i)){let m={instancePath:s+"/colors/body",schemaPath:"#/$defs/hexColor/pattern",keyword:"pattern",params:{pattern:"^#[0-9a-f]{6}$"},message:'must match pattern "^#[0-9a-f]{6}$"'};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/colors/body",schemaPath:"#/$defs/hexColor/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[m]:e.push(m),a++}}if(t.eyes!==void 0){let i=t.eyes;if(typeof i=="string"){if(!Me.test(i)){let m={instancePath:s+"/colors/eyes",schemaPath:"#/$defs/hexColor/pattern",keyword:"pattern",params:{pattern:"^#[0-9a-f]{6}$"},message:'must match pattern "^#[0-9a-f]{6}$"'};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/colors/eyes",schemaPath:"#/$defs/hexColor/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[m]:e.push(m),a++}}}else{let i={instancePath:s+"/colors",schemaPath:"#/properties/colors/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return z.errors=e,a===0}z.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};var Bs={type:"object",additionalProperties:!1,required:["playbackMode","steps","blink"],properties:{playbackMode:{enum:["loop","once","pingPong"]},steps:{type:"array",minItems:1,maxItems:128,items:{type:"object",additionalProperties:!1,required:["expression","holdMs","transitionMs","transition"],properties:{expression:{$ref:"#/$defs/semanticKey"},holdMs:{type:"number",minimum:100,maximum:6e4},transitionMs:{type:"number",minimum:0,maximum:5e3},transition:{enum:["spring","smooth","snappy"]}}}},blink:{$ref:"#/$defs/blink"},metadata:{type:"object",additionalProperties:!1,minProperties:1,properties:{label:{type:"string",maxLength:120},description:{type:"string",maxLength:512},group:{type:"string",maxLength:64}}}}};var oe=new RegExp("^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$","u");function G(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=G.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.playbackMode===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"playbackMode"},message:"must have required property 'playbackMode'"};e===null?e=[t]:e.push(t),a++}if(r.steps===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"steps"},message:"must have required property 'steps'"};e===null?e=[t]:e.push(t),a++}if(r.blink===void 0){let t={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"blink"},message:"must have required property 'blink'"};e===null?e=[t]:e.push(t),a++}for(let t in r)if(!(t==="playbackMode"||t==="steps"||t==="blink"||t==="metadata")){let i={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:t},message:"must NOT have additional properties"};e===null?e=[i]:e.push(i),a++}if(r.playbackMode!==void 0){let t=r.playbackMode;if(!(t==="loop"||t==="once"||t==="pingPong")){let i={instancePath:s+"/playbackMode",schemaPath:"#/properties/playbackMode/enum",keyword:"enum",params:{allowedValues:Bs.properties.playbackMode.enum},message:"must be equal to one of the allowed values"};e===null?e=[i]:e.push(i),a++}}if(r.steps!==void 0){let t=r.steps;if(Array.isArray(t)){if(t.length>128){let m={instancePath:s+"/steps",schemaPath:"#/properties/steps/maxItems",keyword:"maxItems",params:{limit:128},message:"must NOT have more than 128 items"};e===null?e=[m]:e.push(m),a++}if(t.length<1){let m={instancePath:s+"/steps",schemaPath:"#/properties/steps/minItems",keyword:"minItems",params:{limit:1},message:"must NOT have fewer than 1 items"};e===null?e=[m]:e.push(m),a++}let i=t.length;for(let m=0;m<i;m++){let l=t[m];if(l&&typeof l=="object"&&!Array.isArray(l)){if(l.expression===void 0){let h={instancePath:s+"/steps/"+m,schemaPath:"#/properties/steps/items/required",keyword:"required",params:{missingProperty:"expression"},message:"must have required property 'expression'"};e===null?e=[h]:e.push(h),a++}if(l.holdMs===void 0){let h={instancePath:s+"/steps/"+m,schemaPath:"#/properties/steps/items/required",keyword:"required",params:{missingProperty:"holdMs"},message:"must have required property 'holdMs'"};e===null?e=[h]:e.push(h),a++}if(l.transitionMs===void 0){let h={instancePath:s+"/steps/"+m,schemaPath:"#/properties/steps/items/required",keyword:"required",params:{missingProperty:"transitionMs"},message:"must have required property 'transitionMs'"};e===null?e=[h]:e.push(h),a++}if(l.transition===void 0){let h={instancePath:s+"/steps/"+m,schemaPath:"#/properties/steps/items/required",keyword:"required",params:{missingProperty:"transition"},message:"must have required property 'transition'"};e===null?e=[h]:e.push(h),a++}for(let h in l)if(!(h==="expression"||h==="holdMs"||h==="transitionMs"||h==="transition")){let f={instancePath:s+"/steps/"+m,schemaPath:"#/properties/steps/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:h},message:"must NOT have additional properties"};e===null?e=[f]:e.push(f),a++}if(l.expression!==void 0){let h=l.expression;if(typeof h=="string"){if(_(h)>64){let f={instancePath:s+"/steps/"+m+"/expression",schemaPath:"#/$defs/semanticKey/maxLength",keyword:"maxLength",params:{limit:64},message:"must NOT have more than 64 characters"};e===null?e=[f]:e.push(f),a++}if(!oe.test(h)){let f={instancePath:s+"/steps/"+m+"/expression",schemaPath:"#/$defs/semanticKey/pattern",keyword:"pattern",params:{pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},message:'must match pattern "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"'};e===null?e=[f]:e.push(f),a++}}else{let f={instancePath:s+"/steps/"+m+"/expression",schemaPath:"#/$defs/semanticKey/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[f]:e.push(f),a++}}if(l.holdMs!==void 0){let h=l.holdMs;if(typeof h=="number"&&isFinite(h)){if(h>6e4||isNaN(h)){let f={instancePath:s+"/steps/"+m+"/holdMs",schemaPath:"#/properties/steps/items/properties/holdMs/maximum",keyword:"maximum",params:{comparison:"<=",limit:6e4},message:"must be <= 60000"};e===null?e=[f]:e.push(f),a++}if(h<100||isNaN(h)){let f={instancePath:s+"/steps/"+m+"/holdMs",schemaPath:"#/properties/steps/items/properties/holdMs/minimum",keyword:"minimum",params:{comparison:">=",limit:100},message:"must be >= 100"};e===null?e=[f]:e.push(f),a++}}else{let f={instancePath:s+"/steps/"+m+"/holdMs",schemaPath:"#/properties/steps/items/properties/holdMs/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[f]:e.push(f),a++}}if(l.transitionMs!==void 0){let h=l.transitionMs;if(typeof h=="number"&&isFinite(h)){if(h>5e3||isNaN(h)){let f={instancePath:s+"/steps/"+m+"/transitionMs",schemaPath:"#/properties/steps/items/properties/transitionMs/maximum",keyword:"maximum",params:{comparison:"<=",limit:5e3},message:"must be <= 5000"};e===null?e=[f]:e.push(f),a++}if(h<0||isNaN(h)){let f={instancePath:s+"/steps/"+m+"/transitionMs",schemaPath:"#/properties/steps/items/properties/transitionMs/minimum",keyword:"minimum",params:{comparison:">=",limit:0},message:"must be >= 0"};e===null?e=[f]:e.push(f),a++}}else{let f={instancePath:s+"/steps/"+m+"/transitionMs",schemaPath:"#/properties/steps/items/properties/transitionMs/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[f]:e.push(f),a++}}if(l.transition!==void 0){let h=l.transition;if(!(h==="spring"||h==="smooth"||h==="snappy")){let f={instancePath:s+"/steps/"+m+"/transition",schemaPath:"#/properties/steps/items/properties/transition/enum",keyword:"enum",params:{allowedValues:Bs.properties.steps.items.properties.transition.enum},message:"must be equal to one of the allowed values"};e===null?e=[f]:e.push(f),a++}}}else{let h={instancePath:s+"/steps/"+m,schemaPath:"#/properties/steps/items/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[h]:e.push(h),a++}}}else{let i={instancePath:s+"/steps",schemaPath:"#/properties/steps/type",keyword:"type",params:{type:"array"},message:"must be array"};e===null?e=[i]:e.push(i),a++}}if(r.blink!==void 0){let t=r.blink;if(t&&typeof t=="object"&&!Array.isArray(t)){if(t.enabled===void 0){let i={instancePath:s+"/blink",schemaPath:"#/$defs/blink/required",keyword:"required",params:{missingProperty:"enabled"},message:"must have required property 'enabled'"};e===null?e=[i]:e.push(i),a++}if(t.initialDelayMs===void 0){let i={instancePath:s+"/blink",schemaPath:"#/$defs/blink/required",keyword:"required",params:{missingProperty:"initialDelayMs"},message:"must have required property 'initialDelayMs'"};e===null?e=[i]:e.push(i),a++}if(t.minIntervalMs===void 0){let i={instancePath:s+"/blink",schemaPath:"#/$defs/blink/required",keyword:"required",params:{missingProperty:"minIntervalMs"},message:"must have required property 'minIntervalMs'"};e===null?e=[i]:e.push(i),a++}if(t.maxIntervalMs===void 0){let i={instancePath:s+"/blink",schemaPath:"#/$defs/blink/required",keyword:"required",params:{missingProperty:"maxIntervalMs"},message:"must have required property 'maxIntervalMs'"};e===null?e=[i]:e.push(i),a++}if(t.durationMs===void 0){let i={instancePath:s+"/blink",schemaPath:"#/$defs/blink/required",keyword:"required",params:{missingProperty:"durationMs"},message:"must have required property 'durationMs'"};e===null?e=[i]:e.push(i),a++}for(let i in t)if(!(i==="enabled"||i==="initialDelayMs"||i==="minIntervalMs"||i==="maxIntervalMs"||i==="durationMs")){let m={instancePath:s+"/blink",schemaPath:"#/$defs/blink/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:i},message:"must NOT have additional properties"};e===null?e=[m]:e.push(m),a++}if(t.enabled!==void 0&&typeof t.enabled!="boolean"){let i={instancePath:s+"/blink/enabled",schemaPath:"#/$defs/blink/properties/enabled/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"};e===null?e=[i]:e.push(i),a++}if(t.initialDelayMs!==void 0){let i=t.initialDelayMs;if(typeof i=="number"&&isFinite(i)){if(i>6e4||isNaN(i)){let m={instancePath:s+"/blink/initialDelayMs",schemaPath:"#/$defs/blink/properties/initialDelayMs/maximum",keyword:"maximum",params:{comparison:"<=",limit:6e4},message:"must be <= 60000"};e===null?e=[m]:e.push(m),a++}if(i<0||isNaN(i)){let m={instancePath:s+"/blink/initialDelayMs",schemaPath:"#/$defs/blink/properties/initialDelayMs/minimum",keyword:"minimum",params:{comparison:">=",limit:0},message:"must be >= 0"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/blink/initialDelayMs",schemaPath:"#/$defs/blink/properties/initialDelayMs/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t.minIntervalMs!==void 0){let i=t.minIntervalMs;if(typeof i=="number"&&isFinite(i)){if(i>12e4||isNaN(i)){let m={instancePath:s+"/blink/minIntervalMs",schemaPath:"#/$defs/blink/properties/minIntervalMs/maximum",keyword:"maximum",params:{comparison:"<=",limit:12e4},message:"must be <= 120000"};e===null?e=[m]:e.push(m),a++}if(i<250||isNaN(i)){let m={instancePath:s+"/blink/minIntervalMs",schemaPath:"#/$defs/blink/properties/minIntervalMs/minimum",keyword:"minimum",params:{comparison:">=",limit:250},message:"must be >= 250"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/blink/minIntervalMs",schemaPath:"#/$defs/blink/properties/minIntervalMs/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t.maxIntervalMs!==void 0){let i=t.maxIntervalMs;if(typeof i=="number"&&isFinite(i)){if(i>12e4||isNaN(i)){let m={instancePath:s+"/blink/maxIntervalMs",schemaPath:"#/$defs/blink/properties/maxIntervalMs/maximum",keyword:"maximum",params:{comparison:"<=",limit:12e4},message:"must be <= 120000"};e===null?e=[m]:e.push(m),a++}if(i<250||isNaN(i)){let m={instancePath:s+"/blink/maxIntervalMs",schemaPath:"#/$defs/blink/properties/maxIntervalMs/minimum",keyword:"minimum",params:{comparison:">=",limit:250},message:"must be >= 250"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/blink/maxIntervalMs",schemaPath:"#/$defs/blink/properties/maxIntervalMs/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}if(t.durationMs!==void 0){let i=t.durationMs;if(typeof i=="number"&&isFinite(i)){if(i>2e3||isNaN(i)){let m={instancePath:s+"/blink/durationMs",schemaPath:"#/$defs/blink/properties/durationMs/maximum",keyword:"maximum",params:{comparison:"<=",limit:2e3},message:"must be <= 2000"};e===null?e=[m]:e.push(m),a++}if(i<50||isNaN(i)){let m={instancePath:s+"/blink/durationMs",schemaPath:"#/$defs/blink/properties/durationMs/minimum",keyword:"minimum",params:{comparison:">=",limit:50},message:"must be >= 50"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/blink/durationMs",schemaPath:"#/$defs/blink/properties/durationMs/type",keyword:"type",params:{type:"number"},message:"must be number"};e===null?e=[m]:e.push(m),a++}}}else{let i={instancePath:s+"/blink",schemaPath:"#/$defs/blink/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[i]:e.push(i),a++}}if(r.metadata!==void 0){let t=r.metadata;if(t&&typeof t=="object"&&!Array.isArray(t)){if(Object.keys(t).length<1){let i={instancePath:s+"/metadata",schemaPath:"#/properties/metadata/minProperties",keyword:"minProperties",params:{limit:1},message:"must NOT have fewer than 1 properties"};e===null?e=[i]:e.push(i),a++}for(let i in t)if(!(i==="label"||i==="description"||i==="group")){let m={instancePath:s+"/metadata",schemaPath:"#/properties/metadata/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:i},message:"must NOT have additional properties"};e===null?e=[m]:e.push(m),a++}if(t.label!==void 0){let i=t.label;if(typeof i=="string"){if(_(i)>120){let m={instancePath:s+"/metadata/label",schemaPath:"#/properties/metadata/properties/label/maxLength",keyword:"maxLength",params:{limit:120},message:"must NOT have more than 120 characters"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/metadata/label",schemaPath:"#/properties/metadata/properties/label/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[m]:e.push(m),a++}}if(t.description!==void 0){let i=t.description;if(typeof i=="string"){if(_(i)>512){let m={instancePath:s+"/metadata/description",schemaPath:"#/properties/metadata/properties/description/maxLength",keyword:"maxLength",params:{limit:512},message:"must NOT have more than 512 characters"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/metadata/description",schemaPath:"#/properties/metadata/properties/description/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[m]:e.push(m),a++}}if(t.group!==void 0){let i=t.group;if(typeof i=="string"){if(_(i)>64){let m={instancePath:s+"/metadata/group",schemaPath:"#/properties/metadata/properties/group/maxLength",keyword:"maxLength",params:{limit:64},message:"must NOT have more than 64 characters"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s+"/metadata/group",schemaPath:"#/properties/metadata/properties/group/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[m]:e.push(m),a++}}}else{let i={instancePath:s+"/metadata",schemaPath:"#/properties/metadata/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[i]:e.push(i),a++}}}else{let t={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[t]:e.push(t),a++}return G.errors=e,a===0}G.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};function ve(r,{instancePath:s="",parentData:n,parentDataProperty:o,rootData:p=r,dynamicAnchors:d={}}={}){let e=null,a=0,u=ve.evaluated;if(u.dynamicProps&&(u.props=void 0),u.dynamicItems&&(u.items=void 0),r&&typeof r=="object"&&!Array.isArray(r)){if(r.schema===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"schema"},message:"must have required property 'schema'"};e===null?e=[m]:e.push(m),a++}if(r.schemaVersion===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"schemaVersion"},message:"must have required property 'schemaVersion'"};e===null?e=[m]:e.push(m),a++}if(r.body===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"body"},message:"must have required property 'body'"};e===null?e=[m]:e.push(m),a++}if(r.colors===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"colors"},message:"must have required property 'colors'"};e===null?e=[m]:e.push(m),a++}if(r.expressions===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"expressions"},message:"must have required property 'expressions'"};e===null?e=[m]:e.push(m),a++}if(r.expressionOrder===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"expressionOrder"},message:"must have required property 'expressionOrder'"};e===null?e=[m]:e.push(m),a++}if(r.animations===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"animations"},message:"must have required property 'animations'"};e===null?e=[m]:e.push(m),a++}if(r.animationOrder===void 0){let m={instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:"animationOrder"},message:"must have required property 'animationOrder'"};e===null?e=[m]:e.push(m),a++}for(let m in r)if(!Kr.call(Vr.properties,m)){let l={instancePath:s,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty:m},message:"must NOT have additional properties"};e===null?e=[l]:e.push(l),a++}if(r.schema!==void 0&&r.schema!=="bible-strong/avatar-definition"){let m={instancePath:s+"/schema",schemaPath:"#/properties/schema/const",keyword:"const",params:{allowedValue:"bible-strong/avatar-definition"},message:"must be equal to constant"};e===null?e=[m]:e.push(m),a++}if(r.schemaVersion!==void 0&&r.schemaVersion!==1){let m={instancePath:s+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue:1},message:"must be equal to constant"};e===null?e=[m]:e.push(m),a++}if(r.name!==void 0){let m=r.name;if(typeof m=="string"){if(_(m)>120){let l={instancePath:s+"/name",schemaPath:"#/properties/name/maxLength",keyword:"maxLength",params:{limit:120},message:"must NOT have more than 120 characters"};e===null?e=[l]:e.push(l),a++}}else{let l={instancePath:s+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[l]:e.push(l),a++}}if(r.body!==void 0&&(Q(r.body,{instancePath:s+"/body",parentData:r,parentDataProperty:"body",rootData:p,dynamicAnchors:d})||(e=e===null?Q.errors:e.concat(Q.errors),a=e.length)),r.colors!==void 0&&(J(r.colors,{instancePath:s+"/colors",parentData:r,parentDataProperty:"colors",rootData:p,dynamicAnchors:d})||(e=e===null?J.errors:e.concat(J.errors),a=e.length)),r.expressions!==void 0){let m=r.expressions;if(m&&typeof m=="object"&&!Array.isArray(m)){if(Object.keys(m).length>128){let l={instancePath:s+"/expressions",schemaPath:"#/properties/expressions/maxProperties",keyword:"maxProperties",params:{limit:128},message:"must NOT have more than 128 properties"};e===null?e=[l]:e.push(l),a++}if(Object.keys(m).length<1){let l={instancePath:s+"/expressions",schemaPath:"#/properties/expressions/minProperties",keyword:"minProperties",params:{limit:1},message:"must NOT have fewer than 1 properties"};e===null?e=[l]:e.push(l),a++}if(m.neutral===void 0){let l={instancePath:s+"/expressions",schemaPath:"#/properties/expressions/required",keyword:"required",params:{missingProperty:"neutral"},message:"must have required property 'neutral'"};e===null?e=[l]:e.push(l),a++}for(let l in m){let h=a;if(typeof l=="string"){if(_(l)>64){let f={instancePath:s+"/expressions",schemaPath:"#/$defs/semanticKey/maxLength",keyword:"maxLength",params:{limit:64},message:"must NOT have more than 64 characters",propertyName:l};e===null?e=[f]:e.push(f),a++}if(!oe.test(l)){let f={instancePath:s+"/expressions",schemaPath:"#/$defs/semanticKey/pattern",keyword:"pattern",params:{pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},message:'must match pattern "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"',propertyName:l};e===null?e=[f]:e.push(f),a++}}else{let f={instancePath:s+"/expressions",schemaPath:"#/$defs/semanticKey/type",keyword:"type",params:{type:"string"},message:"must be string",propertyName:l};e===null?e=[f]:e.push(f),a++}var t=h===a;if(!t){let f={instancePath:s+"/expressions",schemaPath:"#/properties/expressions/propertyNames",keyword:"propertyNames",params:{propertyName:l},message:"property name must be valid"};e===null?e=[f]:e.push(f),a++}}for(let l in m)l!=="neutral"&&(z(m[l],{instancePath:s+"/expressions/"+l.replace(/~/g,"~0").replace(/\//g,"~1"),parentData:m,parentDataProperty:l,rootData:p,dynamicAnchors:d})||(e=e===null?z.errors:e.concat(z.errors),a=e.length));m.neutral!==void 0&&(z(m.neutral,{instancePath:s+"/expressions/neutral",parentData:m,parentDataProperty:"neutral",rootData:p,dynamicAnchors:d})||(e=e===null?z.errors:e.concat(z.errors),a=e.length))}else{let l={instancePath:s+"/expressions",schemaPath:"#/properties/expressions/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[l]:e.push(l),a++}}if(r.expressionOrder!==void 0){let m=r.expressionOrder;if(Array.isArray(m)){if(m.length>128){let c={instancePath:s+"/expressionOrder",schemaPath:"#/properties/expressionOrder/maxItems",keyword:"maxItems",params:{limit:128},message:"must NOT have more than 128 items"};e===null?e=[c]:e.push(c),a++}if(m.length<1){let c={instancePath:s+"/expressionOrder",schemaPath:"#/properties/expressionOrder/minItems",keyword:"minItems",params:{limit:1},message:"must NOT have fewer than 1 items"};e===null?e=[c]:e.push(c),a++}let l=m.length;for(let c=0;c<l;c++){let y=m[c];if(typeof y=="string"){if(_(y)>64){let x={instancePath:s+"/expressionOrder/"+c,schemaPath:"#/$defs/semanticKey/maxLength",keyword:"maxLength",params:{limit:64},message:"must NOT have more than 64 characters"};e===null?e=[x]:e.push(x),a++}if(!oe.test(y)){let x={instancePath:s+"/expressionOrder/"+c,schemaPath:"#/$defs/semanticKey/pattern",keyword:"pattern",params:{pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},message:'must match pattern "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"'};e===null?e=[x]:e.push(x),a++}}else{let x={instancePath:s+"/expressionOrder/"+c,schemaPath:"#/$defs/semanticKey/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[x]:e.push(x),a++}}let h=m.length,f;if(h>1){e:for(;h--;)for(f=h;f--;)if(Ls(m[h],m[f])){let c={instancePath:s+"/expressionOrder",schemaPath:"#/properties/expressionOrder/uniqueItems",keyword:"uniqueItems",params:{i:h,j:f},message:"must NOT have duplicate items (items ## "+f+" and "+h+" are identical)"};e===null?e=[c]:e.push(c),a++;break e}}}else{let l={instancePath:s+"/expressionOrder",schemaPath:"#/properties/expressionOrder/type",keyword:"type",params:{type:"array"},message:"must be array"};e===null?e=[l]:e.push(l),a++}}if(r.animations!==void 0){let m=r.animations;if(m&&typeof m=="object"&&!Array.isArray(m)){if(Object.keys(m).length>64){let l={instancePath:s+"/animations",schemaPath:"#/properties/animations/maxProperties",keyword:"maxProperties",params:{limit:64},message:"must NOT have more than 64 properties"};e===null?e=[l]:e.push(l),a++}for(let l in m){let h=a;if(typeof l=="string"){if(_(l)>64){let f={instancePath:s+"/animations",schemaPath:"#/$defs/semanticKey/maxLength",keyword:"maxLength",params:{limit:64},message:"must NOT have more than 64 characters",propertyName:l};e===null?e=[f]:e.push(f),a++}if(!oe.test(l)){let f={instancePath:s+"/animations",schemaPath:"#/$defs/semanticKey/pattern",keyword:"pattern",params:{pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},message:'must match pattern "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"',propertyName:l};e===null?e=[f]:e.push(f),a++}}else{let f={instancePath:s+"/animations",schemaPath:"#/$defs/semanticKey/type",keyword:"type",params:{type:"string"},message:"must be string",propertyName:l};e===null?e=[f]:e.push(f),a++}var i=h===a;if(!i){let f={instancePath:s+"/animations",schemaPath:"#/properties/animations/propertyNames",keyword:"propertyNames",params:{propertyName:l},message:"property name must be valid"};e===null?e=[f]:e.push(f),a++}}for(let l in m)G(m[l],{instancePath:s+"/animations/"+l.replace(/~/g,"~0").replace(/\//g,"~1"),parentData:m,parentDataProperty:l,rootData:p,dynamicAnchors:d})||(e=e===null?G.errors:e.concat(G.errors),a=e.length)}else{let l={instancePath:s+"/animations",schemaPath:"#/properties/animations/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[l]:e.push(l),a++}}if(r.animationOrder!==void 0){let m=r.animationOrder;if(Array.isArray(m)){if(m.length>64){let c={instancePath:s+"/animationOrder",schemaPath:"#/properties/animationOrder/maxItems",keyword:"maxItems",params:{limit:64},message:"must NOT have more than 64 items"};e===null?e=[c]:e.push(c),a++}let l=m.length;for(let c=0;c<l;c++){let y=m[c];if(typeof y=="string"){if(_(y)>64){let x={instancePath:s+"/animationOrder/"+c,schemaPath:"#/$defs/semanticKey/maxLength",keyword:"maxLength",params:{limit:64},message:"must NOT have more than 64 characters"};e===null?e=[x]:e.push(x),a++}if(!oe.test(y)){let x={instancePath:s+"/animationOrder/"+c,schemaPath:"#/$defs/semanticKey/pattern",keyword:"pattern",params:{pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},message:'must match pattern "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"'};e===null?e=[x]:e.push(x),a++}}else{let x={instancePath:s+"/animationOrder/"+c,schemaPath:"#/$defs/semanticKey/type",keyword:"type",params:{type:"string"},message:"must be string"};e===null?e=[x]:e.push(x),a++}}let h=m.length,f;if(h>1){e:for(;h--;)for(f=h;f--;)if(Ls(m[h],m[f])){let c={instancePath:s+"/animationOrder",schemaPath:"#/properties/animationOrder/uniqueItems",keyword:"uniqueItems",params:{i:h,j:f},message:"must NOT have duplicate items (items ## "+f+" and "+h+" are identical)"};e===null?e=[c]:e.push(c),a++;break e}}}else{let l={instancePath:s+"/animationOrder",schemaPath:"#/properties/animationOrder/type",keyword:"type",params:{type:"array"},message:"must be array"};e===null?e=[l]:e.push(l),a++}}if(r.standardAnimationSet!==void 0&&r.standardAnimationSet!==1){let m={instancePath:s+"/standardAnimationSet",schemaPath:"#/properties/standardAnimationSet/const",keyword:"const",params:{allowedValue:1},message:"must be equal to constant"};e===null?e=[m]:e.push(m),a++}}else{let m={instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"};e===null?e=[m]:e.push(m),a++}return ve.errors=e,a===0}ve.evaluated={props:!0,dynamicProps:!1,dynamicItems:!1};var me=class{compile(){return ve}};var Ur={$schema:"https://json-schema.org/draft/2020-12/schema",$id:"https://avatars.bible-strong.app/schemas/avatar-definition-v1.json",title:"Bible Strong Avatar Definition v1",type:"object",additionalProperties:!1,required:["schema","schemaVersion","body","colors","expressions","expressionOrder","animations","animationOrder"],properties:{schema:{const:"bible-strong/avatar-definition"},schemaVersion:{const:1},name:{type:"string",maxLength:120},body:{$ref:"#/$defs/body"},colors:{$ref:"#/$defs/colors"},expressions:{type:"object",minProperties:1,maxProperties:128,required:["neutral"],propertyNames:{$ref:"#/$defs/semanticKey"},properties:{neutral:{$ref:"#/$defs/expression"}},additionalProperties:{$ref:"#/$defs/expression"}},expressionOrder:{type:"array",minItems:1,maxItems:128,uniqueItems:!0,items:{$ref:"#/$defs/semanticKey"}},animations:{type:"object",maxProperties:64,propertyNames:{$ref:"#/$defs/semanticKey"},additionalProperties:{$ref:"#/$defs/animation"}},animationOrder:{type:"array",maxItems:64,uniqueItems:!0,items:{$ref:"#/$defs/semanticKey"}},standardAnimationSet:{const:1,deprecated:!0}},$defs:{semanticKey:{type:"string",maxLength:64,pattern:"^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$"},hexColor:{type:"string",pattern:"^#[0-9a-f]{6}$"},boundedNumber:{type:"number",minimum:-1e4,maximum:1e4},dimension:{type:"number",minimum:.001,maximum:1e4},roundness:{type:"number",minimum:0,maximum:1},surface:{type:"object",additionalProperties:!1,required:["type","width","height","depth","roundness"],properties:{type:{enum:["sphere","mickey","cursor","cube","capsule","cylinder","cone","diamond"]},width:{$ref:"#/$defs/dimension"},height:{$ref:"#/$defs/dimension"},depth:{$ref:"#/$defs/dimension"},roundness:{$ref:"#/$defs/roundness"},morphRoundness:{$ref:"#/$defs/roundness"},tipRoundness:{$ref:"#/$defs/roundness"},baseRoundness:{$ref:"#/$defs/roundness"}}},nodeSurface:{allOf:[{$ref:"#/$defs/surface"},{type:"object",properties:{type:{enum:["sphere","cube","capsule","cylinder","cone","diamond"]}}}]},position:{type:"array",minItems:3,maxItems:3,prefixItems:[{$ref:"#/$defs/boundedNumber"},{$ref:"#/$defs/boundedNumber"},{$ref:"#/$defs/boundedNumber"}]},rotation:{type:"array",minItems:3,maxItems:3,prefixItems:[{type:"number",minimum:-360,maximum:360},{type:"number",minimum:-360,maximum:360},{type:"number",minimum:-360,maximum:360}]},body:{type:"object",additionalProperties:!1,required:["primary","nodes"],properties:{primary:{$ref:"#/$defs/surface"},nodes:{type:"array",maxItems:16,items:{type:"object",additionalProperties:!1,required:["surface","position","rotation"],properties:{surface:{$ref:"#/$defs/nodeSurface"},position:{$ref:"#/$defs/position"},rotation:{$ref:"#/$defs/rotation"}}}}}},colors:{type:"object",additionalProperties:!1,required:["body","eyes"],properties:{body:{$ref:"#/$defs/hexColor"},eyes:{$ref:"#/$defs/hexColor"}}},eye:{type:"object",additionalProperties:!1,required:["width","height","x","y","angle"],properties:{width:{$ref:"#/$defs/boundedNumber"},height:{$ref:"#/$defs/boundedNumber"},x:{$ref:"#/$defs/boundedNumber"},y:{$ref:"#/$defs/boundedNumber"},angle:{$ref:"#/$defs/boundedNumber"}}},expression:{type:"object",additionalProperties:!1,required:["head","eyes","perspective","motion"],properties:{head:{type:"object",additionalProperties:!1,required:["x","y","z"],properties:{x:{$ref:"#/$defs/boundedNumber"},y:{$ref:"#/$defs/boundedNumber"},z:{$ref:"#/$defs/boundedNumber"}}},eyes:{type:"object",additionalProperties:!1,required:["left","right","spacing"],properties:{left:{$ref:"#/$defs/eye"},right:{$ref:"#/$defs/eye"},spacing:{$ref:"#/$defs/boundedNumber"}}},perspective:{type:"number",minimum:.1,maximum:10},motion:{type:"object",additionalProperties:!1,required:["eyes","body"],properties:{eyes:{enum:["none","microSaccades","shake"]},body:{enum:["none","slowDrift","shake"]}}},colors:{type:"object",additionalProperties:!1,minProperties:1,properties:{body:{$ref:"#/$defs/hexColor"},eyes:{$ref:"#/$defs/hexColor"}}}}},blink:{type:"object",additionalProperties:!1,required:["enabled","initialDelayMs","minIntervalMs","maxIntervalMs","durationMs"],properties:{enabled:{type:"boolean"},initialDelayMs:{type:"number",minimum:0,maximum:6e4},minIntervalMs:{type:"number",minimum:250,maximum:12e4},maxIntervalMs:{type:"number",minimum:250,maximum:12e4},durationMs:{type:"number",minimum:50,maximum:2e3}}},animation:{type:"object",additionalProperties:!1,required:["playbackMode","steps","blink"],properties:{playbackMode:{enum:["loop","once","pingPong"]},steps:{type:"array",minItems:1,maxItems:128,items:{type:"object",additionalProperties:!1,required:["expression","holdMs","transitionMs","transition"],properties:{expression:{$ref:"#/$defs/semanticKey"},holdMs:{type:"number",minimum:100,maximum:6e4},transitionMs:{type:"number",minimum:0,maximum:5e3},transition:{enum:["spring","smooth","snappy"]}}}},blink:{$ref:"#/$defs/blink"},metadata:{type:"object",additionalProperties:!1,minProperties:1,properties:{label:{type:"string",maxLength:120},description:{type:"string",maxLength:512},group:{type:"string",maxLength:64}}}}}}};var Ys=new me({allErrors:!0,strict:!0}).compile(Ur),Ze=r=>r.replaceAll("~","~0").replaceAll("/","~1"),ee=(r,s)=>`${r}/${Ze(String(s))}`;var Zr=r=>{let s=r.propertyName;return s===void 0?r.keyword==="required"?ee(r.instancePath,String(r.params.missingProperty)):r.keyword==="additionalProperties"?ee(r.instancePath,String(r.params.additionalProperty)):r.keyword==="propertyNames"?ee(r.instancePath,String(r.params.propertyName)):r.instancePath:ee(r.instancePath,s)},Hr=r=>r.instancePath==="/schemaVersion"&&r.keyword==="const"?"unsupported_version":r.keyword,Qr=r=>(r??[]).map(s=>({path:Zr(s),code:Hr(s),message:s.message??"Invalid avatar definition"})),Jr=r=>{let s=[],n=new WeakSet,o=(p,d)=>{if(typeof p=="number"&&!Number.isFinite(p)){s.push({path:d,code:"non_finite_number",message:"Number must be finite"});return}if(!(typeof p!="object"||!p)){if(n.has(p)){s.push({path:d,code:"cyclic_value",message:"Avatar definition must not be cyclic"});return}if(n.add(p),!Array.isArray(p)){let e=Object.getPrototypeOf(p);if(e!==Object.prototype&&e!==null){s.push({path:d,code:"non_plain_object",message:"Expected a plain object"}),n.delete(p);return}}Object.entries(p).forEach(([e,a])=>o(a,ee(d,e))),n.delete(p)}};return o(r,""),s},Gr=r=>{let s=[],n=Object.keys(r.expressions),o=Object.keys(r.animations),p=(d,e,a)=>{let u=new Set(d),t=new Set(e);e.forEach(i=>{u.has(i)||s.push({path:a,code:"incomplete_order",message:`Order is missing key '${i}'`})}),d.forEach((i,m)=>{t.has(i)||s.push({path:ee(a,m),code:"unknown_order_key",message:`Unknown key '${i}'`})})};return p(r.expressionOrder,n,"/expressionOrder"),p(r.animationOrder,o,"/animationOrder"),r.expressionOrder[0]!=="neutral"&&s.push({path:"/expressionOrder/0",code:"neutral_not_first",message:"'neutral' must be the first expression-order entry"}),Object.entries(r.animations).forEach(([d,e])=>{e.blink.minIntervalMs>e.blink.maxIntervalMs&&s.push({path:`/animations/${Ze(d)}/blink/minIntervalMs`,code:"invalid_interval_range",message:"minIntervalMs must be less than or equal to maxIntervalMs"}),e.steps.forEach((a,u)=>{a.expression in r.expressions||s.push({path:`/animations/${Ze(d)}/steps/${u}/expression`,code:"unknown_expression",message:`Unknown expression '${a.expression}'`})})}),s},He=r=>{if(typeof r!="object"||!r)return r;let s=Array.isArray(r)?r.map(n=>He(n)):Object.fromEntries(Object.entries(r).map(([n,o])=>[n,He(o)]));return Object.freeze(s)},Xs=r=>{let s=Jr(r);if(s.length)return{ok:!1,errors:s};if(!Ys(r))return{ok:!1,errors:Qr(Ys.errors)};let n=Gr(r);return n.length?{ok:!1,errors:n}:{ok:!0,value:He(r)}};var we=(r,s)=>({id:r,semanticKey:r,headX:s.head.x,headY:s.head.y,headZ:s.head.z,widthLeft:s.eyes.left.width,widthRight:s.eyes.right.width,heightLeft:s.eyes.left.height,heightRight:s.eyes.right.height,spacing:s.eyes.spacing,positionXLeft:s.eyes.left.x,positionXRight:s.eyes.right.x,positionYLeft:s.eyes.left.y,positionYRight:s.eyes.right.y,leftAngle:s.eyes.left.angle,rightAngle:s.eyes.right.angle,perspective:s.perspective,eyeMotion:s.motion.eyes,bodyMotion:s.motion.body,...s.colors?.body?{bodyColor:s.colors.body}:{},...s.colors?.eyes?{eyeColor:s.colors.eyes}:{}}),et=r=>({primary:{...r.primary},nodes:r.nodes.map((s,n)=>({id:`runtime-node-${n}`,name:`Runtime node ${n+1}`,surface:{...s.surface},position:[...s.position],rotation:[...s.rotation]}))}),Us=(r,s,n={},o=1)=>{let p=et(r.body);return{geometry:Es(Y(s),p.primary,o,{bodyNodes:p.nodes}),colors:{body:n.body??s.bodyColor??r.colors.body,eyes:n.eyes??s.eyeColor??r.colors.eyes}}},Qe=(r,s="neutral")=>{let n=r.expressions[s];if(!n)throw Error(`Unknown expression '${s}'`);return Us(r,we(s,n),n.colors)},Je=(r,s)=>{let n=r.expressions[s];return n?{ok:!0,value:n}:{ok:!1,error:{code:"unknown_expression",key:s,message:`Unknown expression '${s}'`}}},pe=(r,s)=>{let n=r.animations[s];return n?{ok:!0,value:n}:{ok:!1,error:{code:"unknown_animation",key:s,message:`Unknown animation '${s}'`}}},V=()=>({activeExpression:"neutral",status:"stopped",stepIndex:0,direction:1,phase:"transition",phaseStartedAt:0,transitionFrom:"neutral"}),Zs=(r,s,n,o)=>{let p=pe(r,s);return p.ok?{ok:!0,value:{activeAnimation:s,activeExpression:p.value.steps[0]?.expression??"neutral",status:"playing",stepIndex:0,direction:1,phase:"transition",phaseStartedAt:n,transitionFrom:"neutral",...o?{transitionSnapshot:o}:{},blinkDueAt:n+p.value.blink.initialDelayMs}}:p},st=(r,s)=>{let n=r.steps.length-1;if(s.stepIndex<n&&s.direction===1)return{stepIndex:s.stepIndex+1,direction:s.direction,complete:!1};if(s.stepIndex>0&&s.direction===-1)return{stepIndex:s.stepIndex-1,direction:s.direction,complete:!1};if(r.playbackMode==="once")return{stepIndex:s.stepIndex,direction:s.direction,complete:!0};if(r.playbackMode==="pingPong"&&n>0){let o=s.direction===1?-1:1;return{stepIndex:s.stepIndex+o,direction:o,complete:!1}}return{stepIndex:0,direction:1,complete:!1}},Hs=(r,s,n,o)=>{if(s.directTransition){if(n<s.directTransition.startedAt+s.directTransition.durationMs)return{...s};let{directTransition:u,...t}=s;return{...t,status:"stopped"}}if(s.status!=="playing"||!s.activeAnimation)return{...s};let p=pe(r,s.activeAnimation);if(!p.ok||!p.value.steps.length)return{...V()};let d=p.value,e={...s};if(d.blink.enabled&&e.blinkDueAt!==void 0&&n>=e.blinkDueAt){let u=e.blinkDueAt,t=d.blink.minIntervalMs+Math.max(0,Math.min(1,o.random()))*(d.blink.maxIntervalMs-d.blink.minIntervalMs);e.blinkStartedAt=u,e.blinkDueAt=u+d.blink.durationMs+t}let a=d.steps.length*4+4;for(;a-- >0;){let u=d.steps[e.stepIndex],t=e.phase==="transition"?u.transitionMs:u.holdMs;if(n<e.phaseStartedAt+t)break;if(e.phaseStartedAt+=t,e.phase==="transition"){e.phase="hold",e.activeExpression=u.expression;continue}let i=st(d,e);if(i.complete){e.status="stopped",delete e.activeAnimation;break}e.stepIndex=i.stepIndex,e.direction=i.direction,e.phase="transition",e.transitionFrom=e.activeExpression,delete e.transitionSnapshot,e.activeExpression=d.steps[i.stepIndex].expression}return e},Qs=(r,s)=>r.status==="playing"?{...r,status:"paused",pausedAt:s}:{...r},Js=(r,s)=>{if(r.status!=="paused"||r.pausedAt===void 0)return{...r};let n=s-r.pausedAt;return{...r,status:"playing",phaseStartedAt:r.phaseStartedAt+n,...r.directTransition?{directTransition:{...r.directTransition,startedAt:r.directTransition.startedAt+n}}:{},...r.blinkDueAt===void 0?{}:{blinkDueAt:r.blinkDueAt+n},...r.blinkStartedAt===void 0?{}:{blinkStartedAt:r.blinkStartedAt+n},pausedAt:void 0}},Vs=(r,s)=>{let n=Math.max(0,Math.min(1,s));if(r==="smooth")return n*n*(3-2*n);if(r==="snappy")return 1-(1-n)**3;let o=1-Math.exp(-6)*Math.cos(8);return Math.max(0,Math.min(1,(1-Math.exp(-6*n)*Math.cos(8*n))/o))},Ue=(r,s)=>({body:s.colors?.body??r.colors.body,eyes:s.colors?.eyes??r.colors.eyes}),Ks=(r,s,n)=>{let o=e=>{let a=e.slice(1),u=a.length===3?[...a].map(t=>`${t}${t}`).join(""):a;return[0,2,4].map(t=>Number.parseInt(u.slice(t,t+2),16))},p=o(r),d=o(s);return p.some(Number.isNaN)||d.some(Number.isNaN)?n<1?r:s:`#${p.map((e,a)=>Math.round(e+(d[a]-e)*n)).map(e=>e.toString(16).padStart(2,"0")).join("")}`},Ws=(r,s,n)=>({body:Ks(r.body,s.body,n),eyes:Ks(r.eyes,s.eyes,n)}),rt=(r,s,n)=>{if(!r.blink.enabled||s.blinkStartedAt===void 0)return 1;let o=(n-s.blinkStartedAt)/r.blink.durationMs;return o<0||o>=1?1:Math.abs(o*2-1)},se=(r,s,n,o)=>{let p=s.status==="paused"&&s.pausedAt!==void 0?s.pausedAt:n,d=r.expressions[s.activeExpression];if(!d){let t=r.expressions.neutral;return{expression:we("neutral",t),colors:Ue(r,t),blink:1,sampledAt:p}}let e=we(s.activeExpression,d),a=Ue(r,d),u=1;if(s.directTransition&&!o.reduceMotion){let t=Vs(s.directTransition.transition,(p-s.directTransition.startedAt)/Math.max(s.directTransition.durationMs,1));e=Ke(Y(s.directTransition.from.expression),Y(e),t).expression,a=Ws(s.directTransition.from.colors,a,t)}else if(s.activeAnimation){let t=pe(r,s.activeAnimation);if(t.ok){let i=t.value.steps[s.stepIndex];if(s.phase==="transition"&&i&&!o.reduceMotion){let m=r.expressions[s.transitionFrom],l=s.transitionSnapshot?.expression??(m?we(s.transitionFrom,m):void 0),h=s.transitionSnapshot?.colors??(m?Ue(r,m):void 0);if(l&&h){let f=Math.max(i.transitionMs,1),c=Vs(i.transition,(p-s.phaseStartedAt)/f);e=Ke(Y(l),Y(e),c).expression,a=Ws(h,a,c)}}u=rt(t.value,s,p)}}return{expression:e,colors:a,blink:u,sampledAt:p}},Gs=(r,s,n,o)=>{let p=se(r,s,n,o);return Us(r,o.reduceMotion?p.expression:ps(p.expression,p.sampledAt),p.colors,p.blink)};var tt="http://www.w3.org/2000/svg",it=420,er=Le+2,at=0,sr=r=>typeof r=="number"?`${r}px`:r,nt=r=>{let s=r[0];return Error(s?`Invalid avatar definition${s.path?` at ${s.path}`:""}: ${s.message}`:"Invalid avatar definition.")},ot=r=>{let s=typeof r=="string"?document.querySelector(r):r;if(!s)throw Error(`Avatar target '${r}' was not found.`);return s},F=r=>document.createElementNS(tt,r),mt=r=>({...r.activeAnimation?{activeAnimation:r.activeAnimation}:{},activeExpression:r.activeExpression,status:r.status}),Ne=()=>({random:Math.random,reduceMotion:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1});function pt(r,{definition:s,defaultAnimation:n,defaultExpression:o,autoplay:p=!0,size:d=240,ariaLabel:e="Procedural avatar",className:a,onError:u,onAnimationEnd:t,onExpressionChange:i}){if(n!==void 0&&o!==void 0)throw Error("Choose either defaultAnimation or defaultExpression, not both.");let m=Xs(s);if(!m.ok)throw nt(m.errors);let l=m.value,h=ot(r),f=document.createElement("span");f.className=["bs-avatar",a??""].filter(Boolean).join(" "),f.style.display="inline-block",f.style.width=sr(d),f.style.height=sr(d),f.setAttribute("role","img"),f.setAttribute("aria-label",e);let c=F("svg");c.setAttribute("viewBox","-150 -150 300 300"),c.setAttribute("aria-hidden","true"),c.style.display="block",c.style.width="100%",c.style.height="100%";let y=F("defs"),x=F("clipPath"),B=`bs-avatar-web-${++at}`;x.id=B;let E=F("path");x.append(E),y.append(x),c.append(y);let K=Qe(l),S=Array.from({length:er},()=>F("path")),A=F("path"),q=F("g");q.setAttribute("clip-path",`url(#${B})`);let C=F("path"),k=F("path");q.append(C,k);let w=Array.from({length:er},()=>F("path"));c.append(...S,A,q,...w),f.append(c),h.append(f);let M=b=>{u?u(b):console.error(`[Avatar] ${b.message}`)},re=b=>{E.setAttribute("d",b.geometry.headPath),A.setAttribute("d",b.geometry.headPath),A.setAttribute("fill",b.colors.body),C.setAttribute("d",b.geometry.leftPath),C.setAttribute("fill",b.colors.eyes),C.setAttribute("opacity",b.geometry.leftVisible?"1":"0"),k.setAttribute("d",b.geometry.rightPath),k.setAttribute("fill",b.colors.eyes),k.setAttribute("opacity",b.geometry.rightVisible?"1":"0"),S.forEach((P,I)=>{P.setAttribute("d",b.geometry.backPaths[I]??""),P.setAttribute("fill",b.colors.body)}),w.forEach((P,I)=>{P.setAttribute("d",b.geometry.frontPaths[I]??""),P.setAttribute("fill",b.colors.body)})},g=V(),N=null,Ae=!1,qe,Ge,de,Ie=()=>{Ge!==g.activeExpression&&(Ge=g.activeExpression,i?.(g.activeExpression))},te=b=>{let P=Ne();de=se(l,g,b,P),re(Gs(l,g,b,P)),Ie()},es=b=>{if(N=null,Ae)return;let P=g.activeAnimation,I=g.status==="playing";g=Hs(l,g,b,{random:Math.random,reduceMotion:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1}),te(b),I&&g.status==="stopped"&&P&&(qe!==P&&t?.(P),qe=P),g.status==="playing"&&(N=requestAnimationFrame(es))},je=()=>{N===null&&!Ae&&(N=requestAnimationFrame(es))},ss={play(b){if(g.status==="paused"&&g.activeAnimation===b&&g.pausedAt!==void 0)return g=Js(g,performance.now()),je(),{ok:!0};let P=performance.now(),I=de??se(l,g,P,Ne()),ie=Zs(l,b,P,I);return ie.ok?(qe=void 0,g=ie.value,te(performance.now()),je(),{ok:!0}):{ok:!1,error:ie.error}},setExpression(b){let P=Je(l,b);if(!P.ok)return{ok:!1,error:P.error};let I=performance.now(),ie=de??se(l,g,I,Ne());return g={...V(),activeExpression:b,...g.activeExpression===b?{}:{status:"playing",directTransition:{from:ie,startedAt:I,durationMs:it,transition:"smooth"}}},te(performance.now()),g.status==="playing"&&je(),{ok:!0}},pause(){g.status==="playing"&&(g=Qs(g,performance.now()),N!==null&&cancelAnimationFrame(N),N=null)},stop(){g=V(),N!==null&&cancelAnimationFrame(N),N=null,re(Qe(l)),Ie()},getState(){return mt(g)},destroy(){Ae=!0,N!==null&&cancelAnimationFrame(N),N=null,f.remove()}};if(n!==void 0){let b=pe(l,n);b.ok?p?ss.play(n):(g={...V(),activeExpression:b.value.steps[0]?.expression??"neutral"},te(performance.now())):M(b.error)}else if(o!==void 0){let b=Je(l,o);b.ok?(g={...V(),activeExpression:o},te(performance.now())):M(b.error)}else re(K),de=se(l,g,performance.now(),Ne()),Ie();return ss}export{pt as createAvatar};

/* Bloub, Jérémy Perret, MIT; source: bloub-source, license: BLOUB-LICENSE.txt. */
const bloubModules={};
bloubModules["math.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1)=>v < lo ? lo : v > hi ? hi : v;
const lerp = (a, b, t)=>a + (b - a) * t;
const easings = {
    easeOutCubic: (t)=>1 - (1 - t) ** 3,
    easeInOutCubic: (t)=>t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
    easeOutQuint: (t)=>1 - (1 - t) ** 5
};
function loopNoise(t, period, seed = 0) {
    const p = t / period * TAU;
    return 0.55 * Math.sin(p + seed) + 0.3 * Math.sin(2 * p + seed * 1.7 + 1.1) + 0.15 * Math.sin(3 * p + seed * 2.3 + 2.4);
}
function createRng(seed) {
    let a = seed >>> 0;
    return ()=>{
        a = a + 0x6d2b79f5 >>> 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
const r2 = (v)=>Math.round(v * 100) / 100;

return {TAU,clamp,lerp,easings,loopNoise,createRng,r2};})();
bloubModules["decor.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { TAU, clamp, createRng, r2 }=bloubModules["math.js"];
function wheel(hue, s = 0.55, l = 0.62) {
    const h = (hue % 360 + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = l - c / 2;
    const [r, g, b] = h < 60 ? [
        c,
        x,
        0
    ] : h < 120 ? [
        x,
        c,
        0
    ] : h < 180 ? [
        0,
        c,
        x
    ] : h < 240 ? [
        0,
        x,
        c
    ] : h < 300 ? [
        x,
        0,
        c
    ] : [
        c,
        0,
        x
    ];
    const hex = (v)=>Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}
function arcRender(seed, t, scale, id, opacity = 1) {
    const spin = seed.phase + t * seed.speed * TAU;
    const cu = Math.cos(seed.tilt);
    const su = Math.sin(seed.tilt);
    const kz = Math.sqrt(Math.max(0, 1 - seed.k * seed.k));
    const N = 64;
    const span = seed.sweep * TAU;
    let front = '';
    let back = '';
    let prev = null;
    for(let i = 0; i <= N; i++){
        const th = spin + i / N * span;
        const ct = Math.cos(th);
        const st = Math.sin(th);
        const x = seed.a * (ct * cu + st * -su * seed.k) + seed.cx;
        const y = seed.a * (ct * su + st * cu * seed.k) + seed.cy;
        const z = seed.a * st * kz;
        const behind = z < 0;
        const sx = r2(x * scale);
        const sy = r2(y * scale);
        const cmd = behind !== prev ? 'M' : 'L';
        if (behind) back += `${cmd}${sx} ${sy}`;
        else front += `${cmd}${sx} ${sy}`;
        prev = behind;
    }
    const gx = Math.cos(seed.tilt) * seed.a * scale;
    const gy = Math.sin(seed.tilt) * seed.a * scale;
    return {
        id,
        front,
        back,
        width: seed.width * scale,
        opacity,
        grad: {
            x1: r2(seed.cx * scale - gx),
            y1: r2(seed.cy * scale - gy),
            x2: r2(seed.cx * scale + gx),
            y2: r2(seed.cy * scale + gy),
            stops: [
                wheel(seed.hue),
                wheel(seed.hue + seed.hueSpan * 0.5),
                wheel(seed.hue + seed.hueSpan)
            ]
        }
    };
}
const RING_RNG = createRng(0xa11ce);
const RINGS = Array.from({
    length: 6
}, (_, i)=>({
        a: 1.3 + RING_RNG() * 0.1,
        k: 0.05 + RING_RNG() * 0.4,
        tilt: i / 6 * Math.PI + RING_RNG() * 0.5,
        speed: 3 + RING_RNG() * 0.7,
        phase: RING_RNG() * TAU,
        sweep: 0.6 + RING_RNG() * 0.25,
        hue: i * 360 / 6 + RING_RNG() * 30,
        hueSpan: 60 + RING_RNG() * 60,
        width: 0.05 + RING_RNG() * 0.012,
        cx: 0,
        cy: 0.1
    }));
const SWOOSH = Array.from({
    length: 4
}, (_, i)=>({
        a: 0.78 + i * 0.2,
        k: 0.05 + i * 0.02,
        tilt: -0.62 + i * 0.05,
        speed: 0.3,
        phase: 0.06 * i,
        sweep: 0.4,
        hue: 95 + i * 62,
        hueSpan: 100,
        width: 0.05,
        cx: 0,
        cy: -0.12
    }));
const DOT_X = [
    -0.557,
    -0.013,
    0.532
];
const DOT_R = 0.165;
const DOT_PEAK = 1.25;
const P_RNG = createRng(0xbeef);
const PARTICLES = Array.from({
    length: 5
}, (_, i)=>({
        birth: i * 0.2,
        angle: P_RNG() * TAU,
        rho: 0.58 + P_RNG() * 0.18
    }));
function particles(t, scale) {
    const out = [];
    for (const p of PARTICLES){
        const u = t - p.birth;
        if (u < 0 || u > 0.62) continue;
        const rho = p.rho * Math.pow(0.75, u * 10);
        const a = p.angle + u * 100 * Math.PI / 180;
        out.push({
            x: Math.cos(a) * rho * scale,
            y: Math.sin(a) * rho * scale,
            r: (0.04 + 0.028 * clamp(u / 0.55)) * scale,
            depth: clamp(1 - rho / 0.8),
            opacity: clamp(u / 0.06) * clamp((0.62 - u) / 0.08)
        });
    }
    return out;
}
const COMET_RNG = createRng(0xc0e7);
const COMET_RIBBONS = Array.from({
    length: 4
}, (_, i)=>{
    const d = i - 1.5;
    return {
        a: 0.85 * (1 + d * 0.03),
        k: 0.15 / 0.85 * (1 + d * 0.16),
        tilt: 34 * Math.PI / 180 + d * 0.035,
        speed: 210 / 360,
        phase: -i * 0.045 + COMET_RNG() * 0.012,
        sweep: 0.34,
        hue: i * 85 + COMET_RNG() * 20,
        hueSpan: 80,
        width: 0.095,
        cx: 0,
        cy: 0
    };
});
const COMET_DOT = 0.129;
const NOTIF_BLUE = '#2496e8';
const NOTIF_ANGLE = -42;
const NOTIF_DIST = 1.003;
const NOTIF_R = 0.15;
const NOTIF_POP = 1.14;
const NOTIF_MARGIN = 0.054;

return {arcRender,RINGS,SWOOSH,DOT_X,DOT_R,DOT_PEAK,particles,COMET_RIBBONS,COMET_DOT,NOTIF_BLUE,NOTIF_ANGLE,NOTIF_DIST,NOTIF_R,NOTIF_POP,NOTIF_MARGIN};})();
bloubModules["face.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { clamp, createRng, loopNoise }=bloubModules["math.js"];
const EYE_SPLIT = 15.46;
const EYE_W = 0.186;
const EYE_H = 0.412;
const REST_GAZE = {
    yaw: 28.49,
    pitch: 28.62,
    roll: -13
};
const deg = (d)=>d * Math.PI / 180;
function spin(u, v, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
        [
            u[0] * c + v[0] * s,
            u[1] * c + v[1] * s,
            u[2] * c + v[2] * s
        ],
        [
            v[0] * c - u[0] * s,
            v[1] * c - u[1] * s,
            v[2] * c - u[2] * s
        ]
    ];
}
function eyePoses(gaze, scale, split = EYE_SPLIT) {
    let f = [
        0,
        0,
        1
    ];
    let right = [
        1,
        0,
        0
    ];
    let down = [
        0,
        1,
        0
    ];
    [f, right] = spin(f, right, deg(gaze.yaw));
    [down, f] = spin(down, f, deg(gaze.pitch));
    [right, down] = spin(right, down, deg(gaze.roll));
    const build = (side)=>{
        const [ef, er] = spin(f, right, deg(split * side));
        return {
            x: ef[0] * scale,
            y: ef[1] * scale,
            a: er[0],
            b: er[1],
            c: down[0],
            d: down[1],
            depth: ef[2]
        };
    };
    return [
        build(-1),
        build(1)
    ];
}
const BLINK_RNG = createRng(0x5eed);
const BLINKS = (()=>{
    const out = [];
    let t = 1.4;
    while(t < 900){
        out.push(t);
        t += 1.9 + BLINK_RNG() * 2.7;
        if (BLINK_RNG() < 0.18) {
            out.push(t);
            t += 0.24;
        }
    }
    return out;
})();
const BLINK_DUR = 0.18;
function blinkLid(t) {
    for(let i = 0; i < BLINKS.length; i++){
        const start = BLINKS[i];
        if (t < start) break;
        const k = (t - start) / BLINK_DUR;
        if (k >= 0 && k <= 1) {
            return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
        }
    }
    return 1;
}
function liveliness(t, opt = {}) {
    const { wander = 1, blink = true, float = true } = opt;
    return {
        dYaw: (loopNoise(t, 11.3, 0.4) * 5.5 + loopNoise(t, 3.7, 2.1) * 1.6) * wander,
        dPitch: (loopNoise(t, 9.1, 1.3) * 4.2 + loopNoise(t, 4.3, 0.7) * 1.3) * wander,
        dRoll: loopNoise(t, 13.7, 3.2) * 2.2 * wander,
        lid: blink ? blinkLid(t) : 1,
        driftX: float ? loopNoise(t, 7.9, 1.9) * 0.006 : 0,
        driftY: float ? loopNoise(t, 5.3, 0.3) * 0.007 : 0,
        breath: float ? 1 + Math.sin(t / 3.4 * Math.PI * 2) * 0.005 : 1
    };
}
function blinkScale(lid) {
    return 0.06 + 0.94 * clamp(lid);
}

return {EYE_SPLIT,EYE_W,EYE_H,REST_GAZE,eyePoses,liveliness,blinkScale};})();
bloubModules["expressions.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { EYE_H, EYE_SPLIT, EYE_W, REST_GAZE }=bloubModules["face.js"];
const { lerp }=bloubModules["math.js"];
const eye = (w, h, tilt = 0, open = 1)=>({
        w,
        h,
        tilt,
        open
    });
const pair = (w, h, tilt = 0, open = 1)=>[
        eye(w, h, tilt, open),
        eye(w, h, -tilt, open)
    ];
const EXPRESSIONS = [
    {
        id: 'neutre',
        gaze: {
            ...REST_GAZE
        },
        split: EYE_SPLIT,
        eyes: [
            eye(EYE_W, EYE_H),
            eye(EYE_W, EYE_H)
        ]
    },
    {
        id: 'attentif',
        gaze: {
            yaw: 4,
            pitch: 5,
            roll: -4
        },
        split: 16,
        eyes: pair(0.21, 0.44)
    },
    {
        id: 'surpris',
        gaze: {
            yaw: 3,
            pitch: -3,
            roll: 0
        },
        split: 19,
        eyes: pair(0.45, 0.47)
    },
    {
        id: 'excite',
        gaze: {
            yaw: 6,
            pitch: -14,
            roll: 0
        },
        split: 19.5,
        eyes: pair(0.4, 0.56, -10)
    },
    {
        id: 'heureux',
        gaze: {
            yaw: 5,
            pitch: 9,
            roll: 0
        },
        split: 17,
        eyes: pair(0.27, 0.17, 14)
    },
    {
        id: 'hilare',
        gaze: {
            yaw: 4,
            pitch: 14,
            roll: 0
        },
        split: 18,
        eyes: pair(0.34, 0.13, 20)
    },
    {
        id: 'colere',
        gaze: {
            yaw: 3,
            pitch: 7,
            roll: 0
        },
        split: 17,
        eyes: pair(0.34, 0.15, 30)
    },
    {
        id: 'triste',
        gaze: {
            yaw: 3,
            pitch: -13,
            roll: 0
        },
        split: 16,
        eyes: pair(0.22, 0.4, -28)
    },
    {
        id: 'effraye',
        gaze: {
            yaw: 2,
            pitch: -20,
            roll: 0
        },
        split: 20.5,
        eyes: pair(0.4, 0.6)
    },
    {
        id: 'mefiant',
        gaze: {
            yaw: 12,
            pitch: 6,
            roll: -6
        },
        split: 16,
        eyes: [
            eye(0.21, 0.4),
            eye(0.22, 0.15)
        ]
    },
    {
        id: 'confus',
        gaze: {
            yaw: -14,
            pitch: 3,
            roll: 8
        },
        split: 16.5,
        eyes: [
            eye(0.2, 0.44, -18),
            eye(0.28, 0.17, 14)
        ]
    },
    {
        id: 'curieux',
        gaze: {
            yaw: 16,
            pitch: -9,
            roll: -15
        },
        split: 16.5,
        eyes: [
            eye(0.24, 0.46, -8),
            eye(0.2, 0.38, -8)
        ]
    },
    {
        id: 'fier',
        gaze: {
            yaw: 5,
            pitch: 17,
            roll: 0
        },
        split: 17,
        eyes: pair(0.3, 0.15, 18)
    },
    {
        id: 'timide',
        gaze: {
            yaw: -19,
            pitch: -14,
            roll: -7
        },
        split: 14,
        eyes: pair(0.17, 0.3)
    },
    {
        id: 'blase',
        gaze: {
            yaw: -22,
            pitch: 2,
            roll: 0
        },
        split: 16,
        eyes: pair(0.3, 0.12)
    },
    {
        id: 'somnolent',
        gaze: {
            yaw: 6,
            pitch: -9,
            roll: -3
        },
        split: 16,
        eyes: pair(0.2, 0.42, 0, 0.42)
    }
];
const EXPRESSION_BY_ID = new Map(EXPRESSIONS.map((e)=>[
        e.id,
        e
    ]));
const DEFAULT_EXPRESSION = 'neutre';
const lerpEyeCfg = (a, b, t)=>({
        w: lerp(a.w, b.w, t),
        h: lerp(a.h, b.h, t),
        tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, t),
        open: lerp(a.open, b.open, t)
    });
function blendExpression(a, b, t) {
    return {
        id: b.id,
        gaze: {
            yaw: lerp(a.gaze.yaw, b.gaze.yaw, t),
            pitch: lerp(a.gaze.pitch, b.gaze.pitch, t),
            roll: lerp(a.gaze.roll, b.gaze.roll, t)
        },
        split: lerp(a.split, b.split, t),
        eyes: [
            lerpEyeCfg(a.eyes[0], b.eyes[0], t),
            lerpEyeCfg(a.eyes[1], b.eyes[1], t)
        ]
    };
}

return {EXPRESSIONS,EXPRESSION_BY_ID,DEFAULT_EXPRESSION,blendExpression};})();
bloubModules["profiles.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const PROFILE_SAMPLES = 64;
const PROFILES = {
    egg: [
        0.8369,
        0.8424,
        0.8497,
        0.8585,
        0.8674,
        0.8775,
        0.8878,
        0.8983,
        0.9089,
        0.9185,
        0.9288,
        0.9374,
        0.9445,
        0.9504,
        0.9543,
        0.9559,
        0.9555,
        0.9519,
        0.9466,
        0.9389,
        0.9302,
        0.9193,
        0.9085,
        0.8969,
        0.8852,
        0.8734,
        0.8625,
        0.8513,
        0.8411,
        0.8325,
        0.8243,
        0.8179,
        0.8137,
        0.8112,
        0.8102,
        0.8128,
        0.8178,
        0.8262,
        0.8374,
        0.8518,
        0.8702,
        0.8922,
        0.9169,
        0.9446,
        0.9741,
        1.0023,
        1.0267,
        1.0433,
        1.0481,
        1.0393,
        1.0216,
        0.9970,
        0.9697,
        0.9418,
        0.9169,
        0.8949,
        0.8760,
        0.8604,
        0.8490,
        0.8394,
        0.8337,
        0.8314,
        0.8305,
        0.8326
    ],
    hexagon: [
        0.9210,
        0.9282,
        0.9441,
        0.9706,
        0.9984,
        1.0059,
        0.9896,
        0.9562,
        0.9290,
        0.9124,
        0.9047,
        0.9058,
        0.9157,
        0.9349,
        0.9642,
        0.9873,
        0.9882,
        0.9665,
        0.9336,
        0.9105,
        0.8968,
        0.8918,
        0.8955,
        0.9080,
        0.9293,
        0.9611,
        0.9820,
        0.9812,
        0.9590,
        0.9282,
        0.9089,
        0.8978,
        0.8964,
        0.9026,
        0.9189,
        0.9439,
        0.9778,
        0.9990,
        0.9964,
        0.9713,
        0.9439,
        0.9274,
        0.9196,
        0.9206,
        0.9308,
        0.9502,
        0.9799,
        1.0121,
        1.0226,
        1.0071,
        0.9752,
        0.9510,
        0.9366,
        0.9316,
        0.9351,
        0.9485,
        0.9711,
        1.0026,
        1.0213,
        1.0155,
        0.9863,
        0.9547,
        0.9347,
        0.9232
    ],
    triangle: [
        0.7819,
        0.8211,
        0.8747,
        0.9440,
        1.0223,
        1.0960,
        1.1401,
        1.1340,
        1.0808,
        1.0047,
        0.9265,
        0.8603,
        0.8104,
        0.7730,
        0.7450,
        0.7273,
        0.7151,
        0.7118,
        0.7148,
        0.7245,
        0.7427,
        0.7680,
        0.8037,
        0.8518,
        0.9148,
        0.9876,
        1.0583,
        1.1073,
        1.1109,
        1.0667,
        0.9940,
        0.9164,
        0.8482,
        0.7948,
        0.7555,
        0.7261,
        0.7056,
        0.6925,
        0.6859,
        0.6869,
        0.6938,
        0.7084,
        0.7305,
        0.7615,
        0.8040,
        0.8595,
        0.9311,
        1.0092,
        1.0791,
        1.1171,
        1.1054,
        1.0501,
        0.9779,
        0.9050,
        0.8450,
        0.7990,
        0.7656,
        0.7413,
        0.7258,
        0.7160,
        0.7146,
        0.7204,
        0.7330,
        0.7528
    ]
};

return {PROFILE_SAMPLES,PROFILES};})();
bloubModules["shape.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { TAU, lerp, r2 }=bloubModules["math.js"];
const { PROFILES, PROFILE_SAMPLES }=bloubModules["profiles.js"];
const ANGLES = Array.from({
    length: PROFILE_SAMPLES
}, (_, i)=>i / PROFILE_SAMPLES * TAU);
const COS = ANGLES.map(Math.cos);
const SIN = ANGLES.map(Math.sin);
function silhouette(name, pose = {}) {
    return {
        radii: [
            ...PROFILES[name]
        ],
        rot: 0,
        cx: 0,
        cy: 0,
        sx: 1,
        sy: 1,
        ...pose
    };
}
function circle(radius, pose = {}) {
    return {
        radii: new Array(PROFILE_SAMPLES).fill(radius),
        rot: 0,
        cx: 0,
        cy: 0,
        sx: 1,
        sy: 1,
        ...pose
    };
}
function blend(a, b, t, out) {
    const dst = out ?? {
        radii: new Array(PROFILE_SAMPLES),
        rot: 0,
        cx: 0,
        cy: 0,
        sx: 1,
        sy: 1
    };
    for(let i = 0; i < PROFILE_SAMPLES; i++){
        dst.radii[i] = lerp(a.radii[i] ?? 1, b.radii[i] ?? 1, t);
    }
    let dRot = b.rot - a.rot;
    while(dRot > Math.PI)dRot -= TAU;
    while(dRot < -Math.PI)dRot += TAU;
    dst.rot = a.rot + dRot * t;
    dst.cx = lerp(a.cx, b.cx, t);
    dst.cy = lerp(a.cy, b.cy, t);
    dst.sx = lerp(a.sx, b.sx, t);
    dst.sy = lerp(a.sy, b.sy, t);
    return dst;
}
function toPoints(s, scale, out = []) {
    const cr = Math.cos(s.rot);
    const sr = Math.sin(s.rot);
    for(let i = 0; i < PROFILE_SAMPLES; i++){
        const r = s.radii[i] ?? 1;
        const x = r * (COS[i] ?? 0);
        const y = r * (SIN[i] ?? 0);
        const rx = x * cr - y * sr;
        const ry = x * sr + y * cr;
        const p = out[i] ?? {
            x: 0,
            y: 0
        };
        p.x = (rx * s.sx + s.cx) * scale;
        p.y = (ry * s.sy + s.cy) * scale;
        out[i] = p;
    }
    out.length = PROFILE_SAMPLES;
    return out;
}
function closedPath(pts, tension = 1 / 6) {
    const n = pts.length;
    if (n < 3) return '';
    const first = pts[0];
    let d = `M${r2(first.x)} ${r2(first.y)}`;
    for(let i = 0; i < n; i++){
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        const c1x = p1.x + (p2.x - p0.x) * tension;
        const c1y = p1.y + (p2.y - p0.y) * tension;
        const c2x = p2.x - (p3.x - p1.x) * tension;
        const c2y = p2.y - (p3.y - p1.y) * tension;
        d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2.x)} ${r2(p2.y)}`;
    }
    return `${d}Z`;
}
function profileFromPolygon(poly, cx, cy) {
    const radii = new Array(PROFILE_SAMPLES).fill(0);
    const n = poly.length;
    for(let k = 0; k < PROFILE_SAMPLES; k++){
        const dx = COS[k] ?? 0;
        const dy = SIN[k] ?? 0;
        let best = 0;
        for(let i = 0; i < n; i++){
            const a = poly[i];
            const b = poly[(i + 1) % n];
            const ex = b.x - a.x;
            const ey = b.y - a.y;
            const den = dx * ey - dy * ex;
            if (Math.abs(den) < 1e-9) continue;
            const px = a.x - cx;
            const py = a.y - cy;
            const t = (px * ey - py * ex) / den;
            const u = (px * dy - py * dx) / den;
            if (t > best && u >= 0 && u <= 1) best = t;
        }
        radii[k] = best;
    }
    return radii;
}
function hullOfCircles(x1, y1, r1, x2, y2, r2v, steps = 96) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1e-6;
    const base = Math.atan2(dy, dx);
    const spread = Math.acos(Math.max(-1, Math.min(1, (r1 - r2v) / dist)));
    const pts = [];
    for(let i = 0; i <= steps / 2; i++){
        const a = base + spread + (TAU - 2 * spread) * i / (steps / 2);
        pts.push({
            x: x1 + Math.cos(a) * r1,
            y: y1 + Math.sin(a) * r1
        });
    }
    for(let i = 0; i <= steps / 2; i++){
        const a = base - spread + 2 * spread * i / (steps / 2);
        pts.push({
            x: x2 + Math.cos(a) * r2v,
            y: y2 + Math.sin(a) * r2v
        });
    }
    return pts;
}
function radiusAtAngle(radii, angle) {
    const n = radii.length;
    const t = (angle / TAU % 1 + 1) % 1 * n;
    const i = Math.floor(t);
    return lerp(radii[i % n] ?? 1, radii[(i + 1) % n] ?? 1, t - i);
}
function superellipseProfile(n, sx = 1, sy = 1) {
    return ANGLES.map((_, i)=>{
        const c = Math.abs((COS[i] ?? 0) / sx) ** n;
        const s = Math.abs((SIN[i] ?? 0) / sy) ** n;
        return (c + s) ** (-1 / n);
    });
}
function unionOfCirclesProfile(circles) {
    const out = new Array(PROFILE_SAMPLES).fill(0);
    for(let i = 0; i < PROFILE_SAMPLES; i++){
        const dx = COS[i] ?? 0;
        const dy = SIN[i] ?? 0;
        let best = 0;
        for (const c of circles){
            const b = dx * c.x + dy * c.y;
            const disc = b * b - (c.x * c.x + c.y * c.y - c.r * c.r);
            if (disc < 0) continue;
            const t = b + Math.sqrt(disc);
            if (t > best) best = t;
        }
        out[i] = best;
    }
    return out;
}
function unionOfEllipsesProfile(ellipses) {
    const out = new Array(PROFILE_SAMPLES).fill(0);
    const locales = ellipses.map((e)=>{
        const p = -(e.rot ?? 0) * Math.PI / 180;
        return {
            ...e,
            cos: Math.cos(p),
            sin: Math.sin(p)
        };
    });
    for(let i = 0; i < PROFILE_SAMPLES; i++){
        const dx = COS[i] ?? 0;
        const dy = SIN[i] ?? 0;
        let best = 0;
        for (const e of locales){
            const ex = (dx * e.cos - dy * e.sin) / e.a;
            const ey = (dx * e.sin + dy * e.cos) / e.b;
            const fx = (e.x * e.cos - e.y * e.sin) / e.a;
            const fy = (e.x * e.sin + e.y * e.cos) / e.b;
            const qa = ex * ex + ey * ey;
            if (qa === 0) continue;
            const qb = ex * fx + ey * fy;
            const disc = qb * qb - qa * (fx * fx + fy * fy - 1);
            if (disc < 0) continue;
            const t = (qb + Math.sqrt(disc)) / qa;
            if (t > best) best = t;
        }
        out[i] = best;
    }
    return out;
}
function roundedPolygon(verts, rc, arcSteps = 10) {
    const n = verts.length;
    const out = [];
    const normal = (a, b)=>{
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        return Math.atan2(-dx / len, dy / len);
    };
    for(let i = 0; i < n; i++){
        const prev = verts[(i - 1 + n) % n];
        const cur = verts[i];
        const next = verts[(i + 1) % n];
        const a0 = normal(prev, cur);
        const a1 = normal(cur, next);
        let d = a1 - a0;
        while(d > Math.PI)d -= TAU;
        while(d < -Math.PI)d += TAU;
        for(let k = 0; k <= arcSteps; k++){
            const a = a0 + d * k / arcSteps;
            out.push({
                x: cur.x + Math.cos(a) * rc,
                y: cur.y + Math.sin(a) * rc
            });
        }
    }
    return out;
}
function regularPolygonProfile(sides, radius, rc, rotationDeg = 0) {
    const rot = rotationDeg * Math.PI / 180;
    const verts = Array.from({
        length: sides
    }, (_, i)=>{
        const a = rot + i / sides * TAU;
        return {
            x: Math.cos(a) * (radius - rc),
            y: Math.sin(a) * (radius - rc)
        };
    });
    return profileFromPolygon(roundedPolygon(verts, rc), 0, 0);
}
function polyPath(pts, scale = 1) {
    if (pts.length < 3) return '';
    let d = '';
    for(let i = 0; i < pts.length; i++){
        const p = pts[i];
        d += `${i === 0 ? 'M' : 'L'}${r2(p.x * scale)} ${r2(p.y * scale)}`;
    }
    return `${d}Z`;
}
function capsulePath(w, h) {
    const hw = Math.max(w, 0.01) / 2;
    const hh = Math.max(h, 0.01) / 2;
    const r = Math.min(hw, hh);
    return `M${r2(-hw)} ${r2(-hh + r)}` + `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw + r)} ${r2(-hh)}` + `L${r2(hw - r)} ${r2(-hh)}` + `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw)} ${r2(-hh + r)}` + `L${r2(hw)} ${r2(hh - r)}` + `A${r2(r)} ${r2(r)} 0 0 1 ${r2(hw - r)} ${r2(hh)}` + `L${r2(-hw + r)} ${r2(hh)}` + `A${r2(r)} ${r2(r)} 0 0 1 ${r2(-hw)} ${r2(hh - r)}Z`;
}

return {silhouette,circle,blend,toPoints,closedPath,profileFromPolygon,hullOfCircles,radiusAtAngle,superellipseProfile,unionOfCirclesProfile,unionOfEllipsesProfile,regularPolygonProfile,polyPath,capsulePath};})();
bloubModules["texture.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const DEGRADE = {
    cx: -0.331,
    cy: -0.397,
    rayon: 1.589,
    milieu: 0.523
};
const CLAIR = {
    teinte: 14.09,
    saturation: -13.79,
    lumiere: 15.88
};
const SOMBRE = {
    teinte: -14.58,
    saturation: 0,
    lumiere: -12.35
};
const JAUNE = 60;
const clamp01 = (v)=>Math.max(0, Math.min(100, v));
function litHex(valeur) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(valeur.trim());
    if (!m) return null;
    const c = m[1];
    const plein = c.length === 3 ? c.replace(/./g, (d)=>d + d) : c;
    const v = parseInt(plein, 16);
    return [
        v >> 16 & 255,
        v >> 8 & 255,
        v & 255
    ];
}
function estHex(valeur) {
    return litHex(valeur) !== null;
}
function normaliseHex(valeur) {
    const rvb = litHex(valeur);
    return rvb ? `#${rvb.map((x)=>x.toString(16).padStart(2, '0')).join('')}` : null;
}
function versTsl(hex) {
    const rvb = litHex(hex) ?? [
        0,
        0,
        0
    ];
    const [r, v, b] = rvb.map((x)=>x / 255);
    const max = Math.max(r, v, b);
    const min = Math.min(r, v, b);
    const l = (max + min) / 2;
    const d = max - min;
    if (d === 0) return [
        0,
        0,
        l * 100
    ];
    const s = d / (1 - Math.abs(2 * l - 1));
    let t;
    if (max === r) t = (v - b) / d % 6;
    else if (max === v) t = (b - r) / d + 2;
    else t = (r - v) / d + 4;
    return [
        (t * 60 % 360 + 360) % 360,
        s * 100,
        l * 100
    ];
}
function versHex(teinte, saturation, lumiere) {
    const t = (teinte % 360 + 360) % 360;
    const s = clamp01(saturation) / 100;
    const l = clamp01(lumiere) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(t / 60 % 2 - 1));
    const m = l - c / 2;
    const [r, v, b] = t < 60 ? [
        c,
        x,
        0
    ] : t < 120 ? [
        x,
        c,
        0
    ] : t < 180 ? [
        0,
        c,
        x
    ] : t < 240 ? [
        0,
        x,
        c
    ] : t < 300 ? [
        x,
        0,
        c
    ] : [
        c,
        0,
        x
    ];
    return `#${[
        r,
        v,
        b
    ].map((n)=>Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('')}`;
}
function versLeJaune(teinte) {
    const arc = (JAUNE - teinte + 540) % 360 - 180;
    return Math.sign(arc) || 1;
}
function degradeDuCorps(hex) {
    const [t, s, l] = versTsl(normaliseHex(hex) ?? '#000000');
    const sens = versLeJaune(t);
    return [
        {
            offset: 0,
            couleur: versHex(t + sens * CLAIR.teinte, s + CLAIR.saturation, l + CLAIR.lumiere)
        },
        {
            offset: DEGRADE.milieu,
            couleur: normaliseHex(hex) ?? '#000000'
        },
        {
            offset: 1,
            couleur: versHex(t + sens * SOMBRE.teinte, s + SOMBRE.saturation, l + SOMBRE.lumiere)
        }
    ];
}

return {DEGRADE,litHex,estHex,normaliseHex,versTsl,versHex,degradeDuCorps};})();
bloubModules["skins.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { PROFILE_SAMPLES }=bloubModules["profiles.js"];
const { estHex, normaliseHex }=bloubModules["texture.js"];
const { hullOfCircles, profileFromPolygon, regularPolygonProfile, superellipseProfile, unionOfCirclesProfile, unionOfEllipsesProfile }=bloubModules["shape.js"];
function normalize(radii, max = 1) {
    const peak = Math.max(...radii);
    if (peak <= 0) return radii;
    const k = max / peak;
    return radii.map((r)=>r * k);
}
const ANGLES = Array.from({
    length: PROFILE_SAMPLES
}, (_, i)=>i / PROFILE_SAMPLES * Math.PI * 2);
const pebble = normalize(ANGLES.map((a)=>1 + 0.075 * Math.cos(2 * a + 0.5) + 0.035 * Math.cos(3 * a + 2.1)), 1.02);
const cloud = normalize(unionOfCirclesProfile([
    {
        x: -0.44,
        y: 0.2,
        r: 0.54
    },
    {
        x: 0.46,
        y: 0.2,
        r: 0.5
    },
    {
        x: 0.02,
        y: 0.3,
        r: 0.6
    },
    {
        x: -0.24,
        y: -0.3,
        r: 0.48
    },
    {
        x: 0.3,
        y: -0.24,
        r: 0.44
    }
]), 1.02);
const droplet = normalize(profileFromPolygon(hullOfCircles(0, 0.28, 0.66, 0, -0.96, 0.05), 0, 0), 1.04);
const capsule = profileFromPolygon(hullOfCircles(-0.42, 0, 0.62, 0.42, 0, 0.62), 0, 0);
const UNITE_LABO = 120;
const bras = {
    a: 108.11015625 / 2 / UNITE_LABO,
    b: 81.6 / 2 / UNITE_LABO
};
const zh = normalize(unionOfEllipsesProfile([
    {
        x: 0,
        y: 0,
        a: 1,
        b: 1
    },
    {
        x: -103.30437876033604 / UNITE_LABO,
        y: 30.4449714479682 / UNITE_LABO,
        ...bras,
        rot: -14.843359375
    },
    {
        x: 98.15429266544173 / UNITE_LABO,
        y: 32.55003025735345 / UNITE_LABO,
        ...bras,
        rot: 15.175
    }
]), 1.15);
const SHAPES = [
    {
        id: 'cercle',
        radii: new Array(PROFILE_SAMPLES).fill(1)
    },
    {
        id: 'galet',
        radii: pebble
    },
    {
        id: 'squircle',
        radii: normalize(superellipseProfile(4.2), 1.15)
    },
    {
        id: 'capsule',
        radii: capsule
    },
    {
        id: 'triangle',
        radii: regularPolygonProfile(3, 1.12, 0.34, -90)
    },
    {
        id: 'hexagone',
        radii: regularPolygonProfile(6, 1.04, 0.26, 0)
    },
    {
        id: 'nuage',
        radii: cloud
    },
    {
        id: 'goutte',
        radii: droplet
    },
    {
        id: 'zh',
        radii: zh
    }
];
const SHAPE_BY_ID = new Map(SHAPES.map((s)=>[
        s.id,
        s
    ]));
const DEFAULT_SHAPE = 'cercle';
const COLORS = [
    {
        id: 'encre',
        hex: '#0a0a0c'
    },
    {
        id: 'brun',
        hex: '#8b5e3c'
    },
    {
        id: 'rouge',
        hex: '#e8483f'
    },
    {
        id: 'orange',
        hex: '#f08a24'
    },
    {
        id: 'mandarine',
        hex: '#ff8b00'
    },
    {
        id: 'ambre',
        hex: '#f0b429'
    },
    {
        id: 'vert',
        hex: '#3ecf8e'
    },
    {
        id: 'turquoise',
        hex: '#2fbfa0'
    },
    {
        id: 'bleu',
        hex: '#3b93f0'
    },
    {
        id: 'violet',
        hex: '#8b5cf6'
    },
    {
        id: 'rose',
        hex: '#e152b0'
    },
    {
        id: 'gris',
        hex: '#a3a3a3'
    },
    {
        id: 'creme',
        hex: '#f1efe9'
    }
];
const COLOR_BY_ID = new Map(COLORS.map((c)=>[
        c.id,
        c
    ]));
const DEFAULT_COLOR = 'encre';
function resoudreCouleur(valeur) {
    if (!valeur) return COLOR_BY_ID.get(DEFAULT_COLOR).hex;
    const connue = COLOR_BY_ID.get(valeur);
    if (connue) return connue.hex;
    return normaliseHex(valeur) ?? COLOR_BY_ID.get(DEFAULT_COLOR).hex;
}
function estCouleurValide(valeur) {
    return COLOR_BY_ID.has(valeur) || estHex(valeur);
}
function mixHex(from, to, t) {
    const parse = (h)=>{
        const v = parseInt(h.slice(1), 16);
        return [
            v >> 16 & 255,
            v >> 8 & 255,
            v & 255
        ];
    };
    const a = parse(from);
    const b = parse(to);
    const c = a.map((x, i)=>Math.round(x + (b[i] - x) * t));
    return `#${c.map((x)=>x.toString(16).padStart(2, '0')).join('')}`;
}

return {SHAPES,SHAPE_BY_ID,DEFAULT_SHAPE,COLORS,COLOR_BY_ID,DEFAULT_COLOR,resoudreCouleur,estCouleurValide,mixHex};})();
bloubModules["states.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { COMET_DOT, COMET_RIBBONS, DOT_PEAK, DOT_R, DOT_X, NOTIF_ANGLE, NOTIF_DIST, NOTIF_MARGIN, NOTIF_POP, NOTIF_R, RINGS, SWOOSH, particles }=bloubModules["decor.js"];
const { EYE_H, EYE_SPLIT, EYE_W, REST_GAZE }=bloubModules["face.js"];
const { TAU, clamp, easings }=bloubModules["math.js"];
const { circle, hullOfCircles, polyPath, profileFromPolygon, silhouette }=bloubModules["shape.js"];
const pair = (w, h)=>[
        {
            w,
            h,
            open: 1
        },
        {
            w,
            h,
            open: 1
        }
    ];
function base(over = {}) {
    return {
        sil: circle(1),
        offX: 0,
        offY: 0,
        gaze: {
            ...REST_GAZE
        },
        split: EYE_SPLIT,
        eyes: pair(EYE_W, EYE_H),
        eyeAlpha: 1,
        bodyAlpha: 1,
        dots: [],
        arcs: [],
        notif: null,
        dotsBehind: false,
        ...over
    };
}
const BAR_UPRIGHT_CY = -0.1875;
const BAR_UPRIGHT = profileFromPolygon(hullOfCircles(0, -0.505, 0.132, 0, 0.13, 0.075), 0, BAR_UPRIGHT_CY);
const BAR_ITALIC = profileFromPolygon(hullOfCircles(0, -0.2535, 0.1345, 0, 0.2535, 0.1345), 0, 0);
const barUpright = (pose = {})=>({
        radii: [
            ...BAR_UPRIGHT
        ],
        rot: 0,
        cx: 0,
        cy: BAR_UPRIGHT_CY,
        sx: 1,
        sy: 1,
        ...pose
    });
const barItalic = (pose = {})=>({
        radii: [
            ...BAR_ITALIC
        ],
        rot: 0,
        cx: 0,
        cy: 0,
        sx: 1,
        sy: 1,
        ...pose
    });
const TEAR = polyPath(hullOfCircles(0, 0, 0.118, 0, 0.172, 0.012));
const TRI_ORBIT = 0.213;
function spinningTriangle(rot) {
    return silhouette('triangle', {
        rot,
        cx: -TRI_ORBIT * Math.sin(rot),
        cy: TRI_ORBIT * Math.cos(rot)
    });
}
function dotPulse(t, index) {
    const p = ((t - index * 0.5) / 1.5 % 1 + 1) % 1;
    const k = p < 0.5 ? 0.5 - 0.5 * Math.cos(p * TAU) : 0;
    return clamp(k * 2);
}
const STATES = [
    {
        id: 'idle',
        duration: 2.4,
        morph: 0.45,
        blinkIn: false,
        baseFace: true,
        baseBody: true,
        pose: ()=>base()
    },
    {
        id: 'thinking',
        duration: 2.6,
        morph: 0.4,
        baseFace: false,
        baseBody: false,
        blinkIn: true,
        pose: (t)=>{
            const mid = dotPulse(t, 1);
            const emerge = 0.3 + 0.7 * easings.easeOutCubic(clamp(t / 0.3));
            return base({
                sil: circle(DOT_R * (1 + (DOT_PEAK - 1) * mid), {
                    cx: DOT_X[1]
                }),
                eyeAlpha: 0,
                dots: [
                    0,
                    2
                ].map((i)=>{
                    const k = dotPulse(t, i);
                    return {
                        x: DOT_X[i] * emerge,
                        y: 0,
                        r: DOT_R * (1 + (DOT_PEAK - 1) * k),
                        opacity: 0.55 + 0.45 * k
                    };
                })
            });
        }
    },
    {
        id: 'wink',
        duration: 1.6,
        morph: 0.3,
        blinkIn: true,
        baseFace: false,
        baseBody: true,
        pose: ()=>base({
                gaze: {
                    yaw: -5.37,
                    pitch: 4.55,
                    roll: 6.7
                },
                split: 16.25,
                eyes: [
                    {
                        w: 0.236,
                        h: 0.464,
                        open: 1
                    },
                    {
                        w: 0.447,
                        h: 0.089,
                        open: 1
                    }
                ]
            })
    },
    {
        id: 'wide',
        duration: 1.8,
        morph: 0.55,
        blinkIn: true,
        baseFace: false,
        baseBody: true,
        pose: ()=>base({
                gaze: {
                    yaw: 6.92,
                    pitch: -21.96,
                    roll: 11.6
                },
                split: 18.43,
                eyes: pair(0.356, 0.875)
            })
    },
    {
        id: 'alert',
        duration: 2.4,
        minDuration: 2,
        morph: 0.45,
        baseFace: false,
        baseBody: false,
        blinkIn: false,
        pose: (t)=>{
            const p = clamp(t / 1.5);
            const travel = easings.easeInOutCubic(p) * 0.82 - 0.087;
            const back = t > 1.6 ? clamp((t - 1.6) / 0.4) : 0;
            const x = travel * (1 - back) + 0.1 * back;
            const buzz = Math.sin(t * 2.5 * TAU) * 0.005;
            const tilt = 17.7 * Math.PI / 180;
            return base({
                sil: barItalic({
                    rot: tilt,
                    cx: x,
                    cy: -0.325 - buzz
                }),
                eyeAlpha: 0,
                dots: [
                    {
                        x: x - Math.sin(tilt) * 0.58,
                        y: -0.325 + Math.cos(tilt) * 0.58 + buzz * 2.8,
                        r: 0.118,
                        d: TEAR,
                        rot: tilt * 180 / Math.PI,
                        opacity: 1
                    }
                ]
            });
        }
    },
    {
        id: 'notify',
        duration: 2.2,
        morph: 0.5,
        blinkIn: true,
        baseFace: false,
        baseBody: true,
        pose: (t)=>{
            const p = clamp(t / 0.45);
            const pop = 1 + (NOTIF_POP - 1) * Math.sin(p * Math.PI) * (1 - p * 0.35);
            const r = NOTIF_R * (p < 1 ? pop : 1);
            const a = NOTIF_ANGLE * Math.PI / 180;
            return base({
                gaze: {
                    yaw: -21.94,
                    pitch: -5.82,
                    roll: -12.2
                },
                split: 18.89,
                eyes: pair(0.505, 0.498),
                notif: {
                    x: Math.cos(a) * NOTIF_DIST,
                    y: Math.sin(a) * NOTIF_DIST,
                    r,
                    notch: r + NOTIF_MARGIN
                }
            });
        }
    },
    {
        id: 'exclaim',
        duration: 2,
        morph: 0.45,
        baseFace: false,
        baseBody: false,
        blinkIn: false,
        pose: ()=>base({
                sil: barUpright(),
                eyeAlpha: 0,
                dots: [
                    {
                        x: -0.012,
                        y: 0.526,
                        r: 0.113,
                        opacity: 1
                    }
                ]
            })
    },
    {
        id: 'sleep',
        duration: 2.4,
        morph: 0.5,
        baseFace: false,
        baseBody: false,
        blinkIn: false,
        pose: (t)=>base({
                sil: circle(0.1585, {
                    cy: 0.11 + Math.sin(t * (TAU / 0.6)) * 0.19
                }),
                eyeAlpha: 0
            })
    },
    {
        id: 'egg',
        duration: 1.8,
        morph: 0.4,
        baseFace: false,
        baseBody: false,
        blinkIn: true,
        pose: ()=>base({
                sil: silhouette('egg'),
                gaze: {
                    yaw: 19.97,
                    pitch: 26.01,
                    roll: -17.1
                },
                split: 11.07,
                eyes: pair(0.164, 0.385)
            })
    },
    {
        id: 'hexagon',
        duration: 1.6,
        morph: 0.4,
        baseFace: false,
        baseBody: false,
        blinkIn: true,
        pose: ()=>base({
                sil: silhouette('hexagon'),
                gaze: {
                    yaw: 23.11,
                    pitch: 24.42,
                    roll: -13.3
                },
                split: 13.37,
                eyes: pair(0.177, 0.411)
            })
    },
    {
        id: 'play',
        duration: 2,
        morph: 0.5,
        baseFace: false,
        baseBody: false,
        blinkIn: true,
        pose: (t)=>{
            const fade = clamp(t / 0.35) * clamp((2.2 - t) / 0.5);
            return base({
                sil: spinningTriangle(0),
                gaze: {
                    yaw: 12,
                    pitch: -8,
                    roll: -6
                },
                split: 15,
                eyes: pair(0.18, 0.34),
                arcs: SWOOSH.map((s, i)=>({
                        id: `sw${i}`,
                        seed: {
                            ...s,
                            cx: 0.45 - t * 0.42
                        },
                        t,
                        opacity: fade
                    }))
            });
        }
    },
    {
        id: 'orbit',
        duration: 3.4,
        minDuration: 2.5,
        morph: 0.6,
        baseFace: false,
        baseBody: false,
        blinkIn: false,
        pose: (t)=>{
            const ramp = easings.easeInOutCubic(clamp(t / 0.35));
            const rot = -TAU * 1.25 * t * ramp;
            const back = easings.easeInOutCubic(clamp((t - 1.6) / 0.9));
            const tri = spinningTriangle(rot);
            const ball = circle(1, {
                rot
            });
            const sil = {
                radii: tri.radii.map((r, i)=>r + (ball.radii[i] - r) * back),
                rot,
                cx: tri.cx * (1 - back),
                cy: tri.cy * (1 - back),
                sx: 1,
                sy: 1
            };
            const fade = clamp(t / 0.8) * clamp((3.6 - t) / 0.9);
            return base({
                sil,
                gaze: {
                    yaw: REST_GAZE.yaw + Math.sin(t * 6.5) * 65 * (1 - back),
                    pitch: -4 + back * 32,
                    roll: -13
                },
                eyes: pair(0.18, 0.34 + back * 0.07),
                arcs: RINGS.map((s, i)=>({
                        id: `rg${i}`,
                        seed: s,
                        t,
                        opacity: fade * clamp((t - i * 0.13) / 0.3)
                    }))
            });
        }
    },
    {
        id: 'swirl',
        duration: 1.3,
        minDuration: 1.3,
        morph: 0.3,
        baseFace: true,
        baseBody: true,
        blinkIn: true,
        pose: (t)=>base({
                arcs: RINGS.slice(0, 3).map((s, i)=>({
                        id: `sw${i}`,
                        seed: s,
                        t,
                        opacity: clamp((t - i * 0.06) / 0.14) * clamp((1.22 - t) / 0.34)
                    }))
            })
    },
    {
        id: 'burst',
        duration: 2.6,
        minDuration: 2.4,
        morph: 0.4,
        baseFace: false,
        baseBody: false,
        blinkIn: false,
        pose: (t)=>{
            const collapse = 1 - 0.834 * easings.easeOutQuint(clamp(t / 0.7));
            const regrow = easings.easeOutQuint(clamp((t - 1.7) / 0.7));
            return base({
                sil: circle(collapse + (1 - collapse) * regrow),
                eyeAlpha: clamp((t - 1.85) / 0.4),
                dots: particles(t, 1),
                dotsBehind: true
            });
        }
    },
    {
        id: 'comet',
        duration: 2.4,
        minDuration: 2.4,
        morph: 0.45,
        baseFace: false,
        baseBody: false,
        blinkIn: false,
        pose: (t)=>{
            const collapse = 1 - (1 - COMET_DOT) * easings.easeOutQuint(clamp(t / 0.55));
            const regrow = easings.easeOutQuint(clamp((t - 1.85) / 0.6));
            const fade = clamp((t - 0.15) / 0.25) * clamp((1.95 - t) / 0.3);
            return base({
                sil: circle(collapse + (1 - collapse) * regrow, {
                    cy: Math.sin(clamp(t / 1.7) * Math.PI) * 0.035
                }),
                eyeAlpha: clamp((t - 2) / 0.35),
                arcs: COMET_RIBBONS.map((s, i)=>({
                        id: `cm${i}`,
                        seed: s,
                        t,
                        opacity: fade
                    }))
            });
        }
    }
];
const STATE_BY_ID = new Map(STATES.map((s)=>[
        s.id,
        s
    ]));
const POSES = {
    idle: 1,
    thinking: 1.1,
    wink: 0.8,
    wide: 0.8,
    alert: 0.75,
    notify: 0.9,
    exclaim: 0.8,
    sleep: 0.45,
    egg: 0.8,
    hexagon: 0.8,
    play: 0.9,
    orbit: 1.2,
    swirl: 0.5,
    burst: 0.45,
    comet: 1.15
};
const SEQUENCE = [
    'idle',
    'thinking',
    'wink',
    'wide',
    'alert',
    'notify',
    'exclaim',
    'sleep',
    'egg',
    'hexagon',
    'play',
    'orbit',
    'burst',
    'comet'
];

return {STATES,STATE_BY_ID,POSES,SEQUENCE};})();
bloubModules["eyefit.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { EXPRESSIONS }=bloubModules["expressions.js"];
const { eyePoses }=bloubModules["face.js"];
const { radiusAtAngle, toPoints }=bloubModules["shape.js"];
const { SHAPES }=bloubModules["skins.js"];
const { STATES }=bloubModules["states.js"];
const R = 100;
const DERIVE_YAW = 5.5 + 1.6;
const DERIVE_PITCH = 4.2 + 1.3;
const DERIVE_X = 0.006;
const DERIVE_Y = 0.007;
function empreintes(visage, sil, radii) {
    const out = [];
    const poses = eyePoses(visage.gaze, R, visage.split);
    for(let i = 0; i < 2; i++){
        const e = poses[i];
        if (e.depth <= 0.02) continue;
        const cfg = visage.eyes[i];
        const phi = (cfg.tilt ?? 0) * Math.PI / 180;
        const cp = Math.cos(phi);
        const sp = Math.sin(phi);
        const ax = e.a * cp + e.c * sp;
        const ay = e.b * cp + e.d * sp;
        const cx = -e.a * sp + e.c * cp;
        const cy = -e.b * sp + e.d * cp;
        const hw = Math.max(cfg.w * R, 0.01) / 2;
        const hh = Math.max(cfg.h * R, 0.01) / 2;
        const r = Math.min(hw, hh);
        const long = hh > hw;
        const demi = long ? hh - r : hw - r;
        const fit = radiusAtAngle(radii, Math.atan2(e.y, e.x) - sil.rot);
        out.push({
            x: e.x * fit,
            y: e.y * fit,
            ax: (long ? cx : ax) * demi,
            ay: (long ? cy : ay) * demi,
            r,
            m: [
                ax,
                ay,
                cx,
                cy
            ]
        });
    }
    return out;
}
function approche(pts, x0, y0, x1, y1) {
    const sx = x1 - x0;
    const sy = y1 - y0;
    const len2 = sx * sx + sy * sy;
    let best = Infinity;
    let vx = 0;
    let vy = 0;
    for(let i = 0; i < pts.length; i++){
        const p = pts[i];
        let t = len2 > 0 ? ((p.x - x0) * sx + (p.y - y0) * sy) / len2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = x0 + t * sx - p.x;
        const ey = y0 + t * sy - p.y;
        const d2 = ex * ex + ey * ey;
        if (d2 < best) {
            best = d2;
            vx = ex;
            vy = ey;
        }
    }
    const d = Math.sqrt(best);
    return {
        d,
        ux: d > 1e-9 ? vx / d : 0,
        uy: d > 1e-9 ? vy / d : 0
    };
}
const FLOTTEMENT = Math.hypot(DERIVE_X, DERIVE_Y) * R;
function pire(pts, emps, tx, ty) {
    let marge = Infinity;
    let ux = 0;
    let uy = 0;
    for (const e of emps){
        const x = e.x + tx;
        const y = e.y + ty;
        const a = approche(pts, x - e.ax, y - e.ay, x + e.ax, y + e.ay);
        const [m0, m1, m2, m3] = e.m;
        const rayon = e.r * Math.hypot(m0 * a.ux + m1 * a.uy, m2 * a.ux + m3 * a.uy) + FLOTTEMENT;
        if (a.d - rayon < marge) {
            marge = a.d - rayon;
            ux = a.ux;
            uy = a.uy;
        }
    }
    return {
        marge,
        ux,
        uy
    };
}
const DIRECTIONS = 12;
const DICHOTOMIE = 8;
function resous(epreuves) {
    if (!epreuves.length) return {
        x: 0,
        y: 0
    };
    const marge = (tx, ty)=>{
        let m = Infinity;
        for (const ep of epreuves)m = Math.min(m, pire(ep.contour, ep.empreintes, tx, ty).marge);
        return m;
    };
    let requis = Infinity;
    for (const ep of epreuves){
        requis = Math.min(requis, pire(ep.calContour, ep.reference, 0, 0).marge);
    }
    let mx = 0;
    let my = 0;
    const emps = epreuves[0].empreintes;
    for (const e of emps){
        mx -= e.x / emps.length;
        my -= e.y / emps.length;
    }
    const course = Math.max(0.35 * R, Math.hypot(mx, my) * 1.25);
    requis = Math.min(requis, marge(mx, my));
    const depart = marge(0, 0);
    if (depart >= requis && depart >= 0) return {
        x: 0,
        y: 0
    };
    const cible = Math.max(requis, 0);
    let meilleurX = 0;
    let meilleurY = 0;
    let meilleureNorme = Infinity;
    let secoursX = 0;
    let secoursY = 0;
    let secours = depart;
    for(let d = 0; d < DIRECTIONS; d++){
        const a = d / DIRECTIONS * Math.PI * 2;
        const ux = Math.cos(a);
        const uy = Math.sin(a);
        if (marge(ux * course, uy * course) < cible) {
            for (const k of [
                0.3,
                0.6,
                1
            ]){
                const m = marge(ux * course * k, uy * course * k);
                if (m > secours) {
                    secours = m;
                    secoursX = ux * course * k;
                    secoursY = uy * course * k;
                }
            }
            continue;
        }
        let bas = 0;
        let haut = course;
        for(let i = 0; i < DICHOTOMIE; i++){
            const mid = (bas + haut) / 2;
            if (marge(ux * mid, uy * mid) >= cible) haut = mid;
            else bas = mid;
        }
        if (haut < meilleureNorme) {
            meilleureNorme = haut;
            meilleurX = ux * haut;
            meilleurY = uy * haut;
        }
    }
    const x = meilleureNorme === Infinity ? secoursX : meilleurX;
    const y = meilleureNorme === Infinity ? secoursY : meilleurY;
    return {
        x: +(x / R).toFixed(6),
        y: +(y / R).toFixed(6)
    };
}
function visageDe(def, pose, expr) {
    if (def.baseFace && expr) return {
        gaze: expr.gaze,
        split: expr.split,
        eyes: expr.eyes
    };
    return {
        gaze: pose.gaze,
        split: pose.split,
        eyes: pose.eyes
    };
}
function dates(def) {
    const signature = (p)=>JSON.stringify([
            p.gaze,
            p.split,
            p.eyes,
            p.sil.rot,
            p.sil.cx,
            p.sil.cy,
            p.sil.sx,
            p.sil.sy
        ]);
    if (signature(def.pose(0)) === signature(def.pose(def.duration))) return [
        0
    ];
    const n = 3;
    return Array.from({
        length: n
    }, (_, i)=>i / (n - 1) * def.duration);
}
function decalagePour(def, radii, expr) {
    const epreuves = [];
    for (const t of dates(def)){
        const pose = def.pose(t);
        const contour = toPoints({
            ...pose.sil,
            radii
        }, R);
        const calContour = toPoints(pose.sil, R);
        const v = visageDe(def, pose, expr);
        const coins = [];
        for (const dy of [
            -DERIVE_YAW,
            DERIVE_YAW
        ]){
            for (const dp of [
                -DERIVE_PITCH,
                DERIVE_PITCH
            ]){
                coins.push({
                    ...v,
                    gaze: {
                        yaw: v.gaze.yaw + dy,
                        pitch: v.gaze.pitch + dp,
                        roll: v.gaze.roll
                    }
                });
            }
        }
        for (const c of coins){
            epreuves.push({
                empreintes: empreintes(c, pose.sil, radii),
                reference: empreintes(c, pose.sil, pose.sil.radii),
                contour,
                calContour
            });
        }
    }
    return resous(epreuves);
}
const NUL = {
    x: 0,
    y: 0
};
const clef = (state, expr)=>`${state}|${expr ?? ''}`;
function batir() {
    return new Map(SHAPES.map((forme)=>{
        const par = new Map();
        for (const def of STATES){
            if (!def.baseBody) continue;
            const expressions = def.baseFace ? [
                null,
                ...EXPRESSIONS
            ] : [
                null
            ];
            for (const expr of expressions){
                par.set(clef(def.id, expr?.id ?? null), decalagePour(def, forme.radii, expr));
            }
        }
        return [
            forme.radii,
            par
        ];
    }));
}
const DECALAGES = batir();
function decalageDesYeux(radii, state, expr) {
    if (!radii) return NUL;
    const par = DECALAGES.get(radii);
    if (!par) return NUL;
    return par.get(clef(state, expr)) ?? par.get(clef(state, null)) ?? NUL;
}
const POUR_TESTS = {
    batir
};

return {decalageDesYeux,POUR_TESTS};})();
bloubModules["engine.js"]=(()=>{/* Bloub, Jérémy Perret, MIT. See ../BLOUB-LICENSE.txt. */
const { arcRender }=bloubModules["decor.js"];
const { blendExpression }=bloubModules["expressions.js"];
const { decalageDesYeux }=bloubModules["eyefit.js"];
const { blinkScale, eyePoses, liveliness }=bloubModules["face.js"];
const { clamp, easings, lerp, r2 }=bloubModules["math.js"];
const { blend, capsulePath, closedPath, radiusAtAngle, toPoints }=bloubModules["shape.js"];
const { STATE_BY_ID }=bloubModules["states.js"];
const NO_LOOK = {
    yaw: 0,
    pitch: 0,
    mix: 0,
    spin: 0,
    wander: 1
};
const lerpLook = (a, b, t)=>({
        yaw: lerp(a.yaw, b.yaw, t),
        pitch: lerp(a.pitch, b.pitch, t),
        mix: lerp(a.mix, b.mix, t),
        spin: lerp(a.spin, b.spin, t),
        wander: lerp(a.wander, b.wander, t)
    });
const lerpEye = (a, b, t)=>({
        w: lerp(a.w, b.w, t),
        h: lerp(a.h, b.h, t),
        open: lerp(a.open, b.open, t),
        tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, t)
    });
function blendPose(a, b, t) {
    const out = 1 - t;
    return {
        sil: blend(a.sil, b.sil, t),
        offX: lerp(a.offX, b.offX, t),
        offY: lerp(a.offY, b.offY, t),
        gaze: {
            yaw: lerp(a.gaze.yaw, b.gaze.yaw, t),
            pitch: lerp(a.gaze.pitch, b.gaze.pitch, t),
            roll: lerp(a.gaze.roll, b.gaze.roll, t)
        },
        split: lerp(a.split, b.split, t),
        eyes: [
            lerpEye(a.eyes[0], b.eyes[0], t),
            lerpEye(a.eyes[1], b.eyes[1], t)
        ],
        eyeAlpha: lerp(a.eyeAlpha, b.eyeAlpha, t),
        bodyAlpha: lerp(a.bodyAlpha, b.bodyAlpha, t),
        dots: [
            ...a.dots.map((d)=>({
                    ...d,
                    opacity: d.opacity * out
                })),
            ...b.dots.map((d)=>({
                    ...d,
                    opacity: d.opacity * t
                }))
        ],
        arcs: [
            ...a.arcs.map((r)=>({
                    ...r,
                    id: `a${r.id}`,
                    opacity: r.opacity * out
                })),
            ...b.arcs.map((r)=>({
                    ...r,
                    id: `b${r.id}`,
                    opacity: r.opacity * t
                }))
        ],
        notif: t < 0.5 ? a.notif : b.notif,
        dotsBehind: t < 0.5 ? a.dotsBehind : b.dotsBehind
    };
}
class BotEngine {
    scale;
    cur;
    prev = null;
    departFige = null;
    tCur = 0;
    tPrev = 0;
    blinkAt = -10;
    pts = [];
    shape = null;
    shapePrev = null;
    shapeAt = -10;
    expr = null;
    exprPrev = null;
    exprAt = -10;
    look = NO_LOOK;
    lookPrev = NO_LOOK;
    lookAt = -10;
    lookMorph = 0.24;
    static SHAPE_MORPH = 0.45;
    static LOOK_MORPH = 0.24;
    constructor(scale = 100, initial = 'idle', shape = null, expression = null){
        this.scale = scale;
        this.cur = initial;
        this.shape = shape;
        this.expr = expression;
    }
    setExpression(expression, now = 0) {
        if (expression === this.expr) return;
        this.exprPrev = this.expr;
        this.expr = expression;
        this.exprAt = now;
    }
    exprAtTime(now) {
        const to = this.expr;
        const from = this.exprPrev;
        if (!to || !from) return to;
        const k = (now - this.exprAt) / BotEngine.SHAPE_MORPH;
        if (k >= 1) return to;
        return blendExpression(from, to, easings.easeOutQuint(clamp(k)));
    }
    setShape(radii, now = 0) {
        if (radii === this.shape) return;
        this.shapePrev = this.shape;
        this.shape = radii;
        this.shapeAt = now;
    }
    shapeAtTime(now) {
        const to = this.shape;
        const from = this.shapePrev;
        if (!to || !from) return to;
        const k = (now - this.shapeAt) / BotEngine.SHAPE_MORPH;
        if (k >= 1) return to;
        const t = easings.easeOutQuint(clamp(k));
        return to.map((r, i)=>lerp(from[i] ?? r, r, t));
    }
    setLook(look, now, morph = BotEngine.LOOK_MORPH) {
        if (look && !Number.isFinite(look.yaw + look.pitch + look.mix + look.spin + look.wander)) {
            return;
        }
        this.lookPrev = this.lookAtTime(now);
        this.look = look ?? NO_LOOK;
        this.lookAt = now;
        this.lookMorph = morph;
    }
    lookAtTime(now) {
        const k = (now - this.lookAt) / this.lookMorph;
        if (k >= 1) return this.look;
        return lerpLook(this.lookPrev, this.look, easings.easeOutQuint(clamp(k)));
    }
    posed(def, t, shape, expr) {
        let pose = def.pose(t);
        if (def.baseBody && shape) {
            pose = {
                ...pose,
                sil: {
                    ...pose.sil,
                    radii: shape
                }
            };
        }
        if (def.baseFace && expr) {
            pose = {
                ...pose,
                gaze: expr.gaze,
                split: expr.split,
                eyes: expr.eyes
            };
        }
        return pose;
    }
    decalageAtTime(now, state) {
        const surAxe = (debut, duree, a, b)=>{
            if (a === b) return b;
            const k = (now - debut) / duree;
            if (k >= 1) return b;
            const t = easings.easeOutQuint(clamp(k));
            return {
                x: lerp(a.x, b.x, t),
                y: lerp(a.y, b.y, t)
            };
        };
        const parForme = (radii)=>surAxe(this.exprAt, BotEngine.SHAPE_MORPH, decalageDesYeux(radii, state, this.exprPrev?.id ?? null), decalageDesYeux(radii, state, this.expr?.id ?? null));
        return surAxe(this.shapeAt, BotEngine.SHAPE_MORPH, parForme(this.shapePrev), parForme(this.shape));
    }
    get state() {
        return this.cur;
    }
    reset(id, now) {
        this.cur = id;
        this.prev = null;
        this.departFige = null;
        this.tCur = now;
        this.tPrev = now;
        this.blinkAt = -10;
    }
    origine(now, shape, expr) {
        if (this.departFige) return this.departFige;
        if (!this.prev) return null;
        const prevDef = STATE_BY_ID.get(this.prev);
        return this.posed(prevDef, Math.max(0, now - this.tPrev), shape, expr);
    }
    poseComposee(now) {
        const def = STATE_BY_ID.get(this.cur);
        const shape = this.shapeAtTime(now);
        const expr = this.exprAtTime(now);
        const pose = this.posed(def, Math.max(0, now - this.tCur), shape, expr);
        const since = now - this.tCur;
        if (since >= def.morph) return pose;
        const origine = this.origine(now, shape, expr);
        if (!origine) return pose;
        return blendPose(origine, pose, easings.easeOutQuint(clamp(since / def.morph)));
    }
    setState(id, now) {
        if (id === this.cur) return;
        const morph = STATE_BY_ID.get(this.cur).morph;
        const enPleinFondu = this.prev !== null && now - this.tCur < morph;
        this.departFige = enPleinFondu ? this.poseComposee(now) : null;
        this.prev = this.cur;
        this.tPrev = this.tCur;
        this.cur = id;
        this.tCur = now;
        if (STATE_BY_ID.get(id)?.blinkIn) this.blinkAt = now;
    }
    sample(now) {
        const R = this.scale;
        const def = STATE_BY_ID.get(this.cur);
        const shape = this.shapeAtTime(now);
        const expr = this.exprAtTime(now);
        let pose = this.posed(def, Math.max(0, now - this.tCur), shape, expr);
        let decalage = this.decalageAtTime(now, this.cur);
        const since = now - this.tCur;
        const origine = since < def.morph ? this.origine(now, shape, expr) : null;
        if (origine) {
            const ratio = easings.easeOutQuint(clamp(since / def.morph));
            pose = blendPose(origine, pose, ratio);
            const quitte = this.prev;
            if (quitte) {
                const avant = this.decalageAtTime(now, quitte);
                decalage = {
                    x: lerp(avant.x, decalage.x, ratio),
                    y: lerp(avant.y, decalage.y, ratio)
                };
            }
        }
        const alive = pose.eyeAlpha > 0.01;
        const look = this.lookAtTime(now);
        const life = liveliness(now, {
            wander: alive ? look.wander : 0,
            blink: alive
        });
        const gaze = {
            yaw: lerp(pose.gaze.yaw, look.yaw, look.mix) + life.dYaw - look.spin,
            pitch: lerp(pose.gaze.pitch, look.pitch, look.mix) + life.dPitch,
            roll: pose.gaze.roll + life.dRoll
        };
        const forced = clamp((now - this.blinkAt) / 0.2);
        const forcedLid = forced < 1 ? Math.abs(forced * 2 - 1) : 1;
        const lid = Math.min(life.lid, forcedLid);
        const offX = pose.offX + life.driftX;
        const offY = pose.offY + life.driftY;
        const sil = {
            ...pose.sil,
            cx: pose.sil.cx + offX,
            cy: pose.sil.cy + offY,
            sy: pose.sil.sy * life.breath
        };
        const bodyPath = closedPath(toPoints(sil, R, this.pts));
        const bodyRadius = (x, y)=>radiusAtAngle(pose.sil.radii, Math.atan2(y, x) - pose.sil.rot);
        const eyes = [];
        if (pose.eyeAlpha > 0.01) {
            const poses = eyePoses(gaze, R, pose.split);
            for(let i = 0; i < 2; i++){
                const e = poses[i];
                if (e.depth <= 0.02) continue;
                const cfg = pose.eyes[i];
                const fit = bodyRadius(e.x, e.y);
                const phi = (cfg.tilt ?? 0) * Math.PI / 180;
                const cp = Math.cos(phi);
                const sp = Math.sin(phi);
                const ax = e.a * cp + e.c * sp;
                const ay = e.b * cp + e.d * sp;
                const cx2 = -e.a * sp + e.c * cp;
                const cy2 = -e.b * sp + e.d * cp;
                const k = blinkScale(Math.min(lid, cfg.open));
                eyes.push({
                    d: capsulePath(cfg.w * R, cfg.h * R),
                    matrix: `matrix(${r2(ax)},${r2(ay * k)},${r2(cx2)},${r2(cy2 * k)},${r2(e.x * fit + (offX + decalage.x) * R)},${r2(e.y * fit + (offY + decalage.y) * R)})`,
                    alpha: pose.eyeAlpha * clamp(e.depth / 0.12)
                });
            }
        }
        const dots = pose.dots.filter((p)=>p.opacity > 0.01 && p.r > 0.0005).map((p)=>({
                ...p,
                x: (p.x + offX) * R,
                y: (p.y + offY) * R,
                r: p.r * R
            }));
        const nFit = pose.notif ? bodyRadius(pose.notif.x, pose.notif.y) : 1;
        const nx = pose.notif ? (pose.notif.x * nFit + offX) * R : 0;
        const ny = pose.notif ? (pose.notif.y * nFit + offY) * R : 0;
        const notif = pose.notif ? {
            x: nx,
            y: ny,
            r: pose.notif.r * R
        } : null;
        const notch = pose.notif ? {
            x: nx,
            y: ny,
            r: pose.notif.notch * R
        } : null;
        return {
            bodyPath,
            bodyAlpha: pose.bodyAlpha,
            eyes,
            dots,
            dotsBehind: pose.dotsBehind,
            arcs: pose.arcs.filter((a)=>a.opacity > 0.01).map((a)=>arcRender(a.seed, a.t, R, a.id, a.opacity)),
            notif,
            notch
        };
    }
}

return {BotEngine};})();
const {BotEngine}=bloubModules["engine.js"],{SHAPE_BY_ID}=bloubModules["skins.js"];
let serial=0;
export function bloubState(state,role){return state==='completed'?'sleep':state==='idle'?'notify':state==='awaiting_approval'?'alert':state==='error'||state==='blocked'?'exclaim':role==='orchestrator'?'thinking':role==='reviewer'?'swirl':'orbit';}
export function createBloubAvatar(node,{definition,size,ariaLabel,role,state}){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),id='bloub-'+ ++serial,color=/^#[0-9a-f]{6}$/i.test(definition.colors?.body)?definition.colors.body:'#8b5cf6',shape={developer:'squircle',orchestrator:'cercle',reviewer:'galet',validation:'hexagone'}[role]||'nuage';
 svg.setAttribute('viewBox','-170 -170 340 340');svg.setAttribute('width',size);svg.setAttribute('height',size);svg.setAttribute('role','img');svg.setAttribute('aria-label',ariaLabel||'Agent');svg.innerHTML=`<defs><radialGradient id="${id}" cx="30%" cy="20%" r="85%"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="${color}"/><stop offset="1" stop-color="#252839"/></radialGradient></defs><g class="bloub-frame"></g>`;node.append(svg);if(state==='completed'){const z=document.createElement('span');z.className='avatar-zzz';z.setAttribute('aria-hidden','true');z.textContent='z z Z';node.append(z);}
 const group=svg.querySelector('.bloub-frame'),engine=new BotEngine(100,bloubState(state,role),SHAPE_BY_ID.get(shape)?.radii||null);let raf=0,start=performance.now(),activeAnimation='',playing=false,last=0;
 function paint(time){const f=engine.sample(time),arcs=front=>f.arcs.map(a=>`<path d="${front?a.front:a.back}" fill="none" stroke="${color}" stroke-width="${a.width}" opacity="${a.opacity}"/>`).join(''),dots=f.dots.map(d=>d.d?`<path d="${d.d}" fill="${d.color||color}" opacity="${d.opacity}"/>`:`<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${d.color||color}" opacity="${d.opacity}"/>`).join('');group.innerHTML=arcs(false)+(f.dotsBehind?dots:'')+`<path d="${f.bodyPath}" fill="url(#${id})" opacity="${f.bodyAlpha}"/>`+f.eyes.map(e=>`<path d="${e.d}" transform="${e.matrix}" fill="#131521" opacity="${e.alpha}"/>`).join('')+(f.dotsBehind?'':dots)+arcs(true)+(f.notif?`<circle cx="${f.notif.x}" cy="${f.notif.y}" r="${f.notif.r}" fill="#efbe65"/>`:'');}
 function tick(now){if(!playing)return;if(now-last>40){paint((now-start)/1000);last=now;}raf=requestAnimationFrame(tick);}paint(0);
 return {play(key){activeAnimation=key;if(!playing){playing=true;raf=requestAnimationFrame(tick);}return {ok:true};},pause(){playing=false;cancelAnimationFrame(raf);},getState(){return {status:playing?'playing':'paused',activeAnimation};},setExpression(){},destroy(){playing=false;cancelAnimationFrame(raf);svg.remove();node.querySelector('.avatar-zzz')?.remove();}};
}
