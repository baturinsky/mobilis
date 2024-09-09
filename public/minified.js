"use strict";(()=>{function se(e,n){let t;switch(n){case 0:return t=[[0,-1],[1,0],[0,1],[-1,0]].map(([r,o])=>o*e+r),[t,t];case 4:return t=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]].map(([r,o])=>o*e+r),[t,t];case 1:return[[[0,-1],[1,0],[0,1],[-1,1],[-1,0],[-1,-1]],[[1,-1],[1,0],[1,1],[0,1],[-1,0],[0,-1]]].map(r=>r.map(([o,a])=>a*e+o));case 2:return t=[[1,-1],[2,0],[1,1],[-1,1],[-2,0],[-1,-1]].map(([r,o])=>o*e+r),[t,t];case 3:return t=[[0,-1],[1,0],[1,1],[0,1],[-1,0],[-1,-1]].map(([r,o])=>o*e+r),[t,t]}}var G={d:`=DEPOSITS
🏔️ ores
⬛ coal
🛢️ oil
💧 water
🗿 relic
=PLANTS
🌿 grass
🌲 taiga
🌳 forest
🌴 jungles
=WILDLIFE
🐏 ram
🐂 yak
🐎 mustang
🐪 camel
🐺 wolves
🐗 hogs
🐅 tigers
=RESOURCES
👖 fabric
🪵 wood
🍎 food
⛽ fuel
📙 book
=TOOLS
🛠️ tools
⛺ housing
🛷 wagons
🐴 horses
⚙️ engines
🗡️ weapons`,st:"Foraging;Walking;Sticks",rr:`Foraging:1🍃>1🍎
Walking:>🏃1
Hunting:1🐾>1🍎1👖
Sticks:1🍃>1🪵
Mining:1🛠️1🏔️>1🪨
Axes:1🍃1🛠️0.1🪨>3🪵
Writing:>1📙
Parchment:2👖>2📙
Wigwam:1🪵3👖>⛺
Paper:1🪵1🛠️>4📙
Printing:1🪵2🛠️>10📙
Archeology:1🗿1🛠️>30📙
Tools:1🪵>1🛠️
Metal Working:1🪵1🪨>1🛠️
Rifles:1⚙️1⛽1🪨>1🏹
Alloys:1⚙️1⛽1🪨>1⛺
Cars:1⚙️1⛽1🪨>1🛒
Hunting bows:3🐾1🏹>3🍎3👖
Bows:>1🏹
Traps:2🐾1🛠️>2🍎2👖
Animal Husbandry:10🌿>10🍎
Farms:3🌿>5🍎
Plantations:3🌿>3👖
Firewood:1🪵>1⛽
Coal:1⬛>5⛽
Drills:1⚙️⛽1⬛>10⛽
Oil:1⚙️1⛽1🛢️>20⛽
Greenhouse:1⛺1⛽>5🍎
Fishing Nets:1🛠️1🐠>5🍎
Whaling:1⚓1🛠️1🐋>10🍎
Dog Taming:0.05🥄0.2🦊0.2💗
Cat Taming:0.03🥄-0.2🗑️0.2💗
Pottery:-0.2🗑️
Conservation:-0.3🗑️
Cooking:-0.1🗑️0.5💗🍎
Mapmaking:0.25🔭
Astronomy:0.25🔭
Compass:0.25🔭
Optics:0.25🔭
Horse Herding:3🌿>1🐴
Carts:1🛷>2🏃
Horseback Riding:1🐴1🛷>4🏃
Cars:1⚙️1⛽1🛷>10🏃
Steam:1⚙️1⛽1🛷>10⚓
Sails:1👖1🛷>3⚓`,atc:"🐏,🐂,🐂,🐎,🐪,🐏,🐺,🐗,🐗,🐅","🐾":`🐏:1🍎3👖
🐂:3🍎1👖
🐎:2🍎1👖
🐪:1🍎1👖
🐺:1🍎1👖
🐗:4🍎1👖
🐅:1🍎2👖
🐠:3🍎`,"🍃":`🌿:2.5🍎0.5🪵1🌾
🌲:1🍎2🪵0.3🌾
🌳:2🍎1🪵0.5🌾
🌴:1.5🍎1.5🪵0.3🌾`},me=1,_=2,q=3,J=4,V=5,K=6,$=7,Z=8,pe=9,$e=10,ee=11,ce=12,N=13,te=14,Ce=15,B=16,ne=17,ue=[[q,ce,J,me],[q,V,_,J],[ee,V,_,Z],[ee,N,Z,$],[K,N,$,$],[K,N,$,pe]],de=fe({[me]:"fa0",[_]:"4f4",[J]:"ff8",[q]:"cca",[V]:"ad4",[K]:"064",[$]:"0a0",[Z]:"060",[pe]:"084",[$e]:"880",[ee]:"fff",[ce]:"caa",[N]:"0a6",[te]:"884",[Ce]:"ff0"}).map(ge);be();function ke(e,n,t){return e*(1-t)+n*t}function H(e,n,t){return t<e?e:t>n?n:t}function he(e){for(let n of[0,1,2])e[n]=H(0,255,e[n])}var C=6;function Oe(e,n){return((e[0]-n[0])**2+(e[1]-n[1])**2)**.5}function T(){let e=Math.sin(C)*1e4;return C=(C+Math.E)%1e8,e-Math.floor(e)}function U([e,n],t){return~~e+~~n*t}function z(e){return e.getContext("2d")}function O(e,n){let t=document.createElement("canvas");t.width=e,t.height=n,t.style.width=`${t.width*devicePixelRatio}px`,t.style.height=`${t.height*devicePixelRatio}px`;let r=z(t);return{canvas:t,ctx:r}}function W(e){let r=z(e).getImageData(0,0,e.width,e.height).data,o=new Float32Array(r.length/4);for(let a=0;a<r.length;a++)o[a]=r[a*4+3]/255;return o}function De(e,n,t=5e3,r=100,o=.01,a=!0){let{canvas:l,ctx:i}=O(e,n);if(a){let s=i.createRadialGradient(0,0,0,0,0,1);s.addColorStop(0,`rgba(255, 255, 255, ${o})`),s.addColorStop(1,"rgba(255, 255, 255, 0)"),i.fillStyle=s}else i.fillStyle=`rgba(255, 255, 255, ${o})`;for(let s=0;s<t;s++){let g=[...Array(3)].map(()=>T()),[p,c]=[g[0]*e,g[1]*n],b=Math.pow(g[2],2)*r;i.save(),i.translate(p,c),i.rotate(T()*Math.PI),i.scale(b*(.5+T()),b*(.5+T())),i.beginPath(),i.arc(0,0,1,0,Math.PI*2),i.fill(),i.restore()}return l}function Me(e,n){let{canvas:t,ctx:r}=O(e.width,e.height);return r.filter=n,r.drawImage(e,0,0),t}function ye(e,n=.5,t=1e3){if(!e)debugger;let r=e.length,o=[...Array(t)].map(()=>e[Math.floor(T()*r)]);return o=o.sort(),o[Math.floor(n*o.length)]}function Ne(e,n=1e3){let t=e.length,r=[...Array(n)].map(()=>e[Math.floor(T()*t)]),o=0;for(let a of r)a>o&&(o=a);return e.map(a=>a/o)}var X=({width:e,height:n},t,r,o,a)=>W(Me(De(e,n,r,Math.sqrt(e*e+n*n)*o,a),`blur(${t}px)`));function Ge(e){let{width:n,height:t,seed:r,noiseSmoothness:o,tectonicSmoothness:a,noiseFactor:l,crustFactor:i,tectonicFactor:s,pangaea:g}=e;C=r;let p=n*t;console.time("noise");let c=X(e,o,3e3,.15,.03),b=X(e,a,2e3,.15,.03),h=X(e,a,2e3,.15,.03);console.timeEnd("noise"),console.time("main");let v=ye(b,.5),x=b.map((M,f)=>(.2/(Math.abs(v-M)+.1)-.95)*(h[f]-.2)*2),m=b.map((M,f)=>5+c[f]*l+b[f]*i+x[f]*s+-g*(Math.abs(f/p-.5)+Math.abs(f%n/n-.5)));console.timeEnd("main"),console.time("normalize");for(let M=4;M--;)for(let f=n;f<m.length;f++)for(let E of[-2,2,-n*2,n*2])m[f]+=((m[f+E]||0)-m[f])*.15;let d=Ne(m);return console.timeEnd("normalize"),{dryElevation:d,tectonic:x,p:e}}function re(e,n){return n??=Ge(e),Be(e,n)}function Be(e,n){let{width:t,height:r,averageTemperature:o,erosion:a,riversShown:l,randomiseHumidity:i,noiseSmoothness:s,seaRatio:g,flatness:p,noiseSeed:c,elevationCold:b}=e;C=c;let h=X(e,s,3e3,.15,.01),{dryElevation:v,tectonic:x}=n,m=t*r,d=ye(v,g),M=v.map((y,L)=>y<d?-Math.pow(1-y/d,.35):Math.pow((y-d)*(.5+x[L]*.5)/(1-d),1+2*p)),f=M.map((y,L)=>Math.cos((Math.abs(.5-L/m)*4+.85)*Math.PI)/(y<0?1:1+5*y*y));console.time("windSmoothing"),f=W(Me(Y(f,t,y=>[0,0,0,127*(y+1)]),"blur(3px)")).map(y=>y*2-1),console.timeEnd("windSmoothing");let E=Ue({width:t,height:r,elevation:M,tectonic:x,erosion:a,riversShown:l}),w=je({width:t,elevation:M,wind:f,steps:400});i&&(w=w.map((y,L)=>Math.max(0,y+Math.sin(h[L]*50)/10-M[L]*.2)));let P=M.map((y,L)=>o+25-100*Math.abs(.5-L/m)/(.7+.6*w[L])-Math.max(0,y)*b),A={tectonic:x,dryElevation:v,elevation:M,noise:h,rivers:E,wind:f,temperature:P,humidity:w,p:e,poi:[]};return A.biome=Xe(A),A.photo=ze(A),Ye(A),A}function Xe(e){console.time("biome");let n=e.temperature.map((t,r)=>{if(e.elevation[r]<-0)return ne;if(e.rivers[r])return B;let a=1+e.p.biomeScrambling*Math.sin(e.noise[r]*100),l=ue[~~H(0,5,e.humidity[r]*4.5*a)][~~H(0,3,t*a/10+1)];return e.elevation[r]>.4&&(l=te),l});return console.timeEnd("biome"),n}function ze(e){let{humidity:n,elevation:t,temperature:r,tectonic:o,noise:a,rivers:l,biome:i}=e,{width:s,shading:g}=e.p,p=[...n],c=[...n],b;console.time("photo");let h;function v(x,m){if(x)for(let d of[0,1,2])h[d]=ke(h[d],x[d],m)}return b=[...n].map((x,m)=>{let d=t[m];if(d<0)return[-(d**2)*1e3+100,-(d**2)*500+150,-(d**2)*300+150,255];{h=[r[m]*15-x*700,150-x*150,r[m]*8-x*500,255],he(h);let M=(d+o[m])*2-1;M>0&&v([64,0,0,255],Math.min(1.5,M**2));let f=(1+Math.sin((a[m]*3+o[m])*100))*(1+T());f=(Math.sin(a[m]*100)+.5)*f**2*.05,v([32,32,32],f),p[m]=0,l[m]&&(h=[0,100,150+50*l[m],255]);for(let E of[1,2,3])for(let w of[1,s,-1,-s,0])v(de[i[m+w*E]],.05);if(r[m]<0&&v([500,500,500],-r[m]*.03),he(h),g){let E=0;for(let P=-2;P<=2;P++)for(let A=-2;A<=2;A++)E+=t[m+P+s*A]*(Math.sign(P)+Math.sign(A));let w=t[m+1+s]+t[m+s]+t[m+1]-d-t[m-s]-t[m-1]+E*.05;l[m]==0&&l[m+s]!=0&&(w-=.1),v([500,500,260],-w),c[m]=w}return h}}),console.timeEnd("photo"),b}function ve(e,n,t=20){let r=e.length/n,o=Y(e,n,(i,s)=>[0,0,0,i<=0?100:0]),a=O(n,r),l=a.ctx;return l.beginPath(),l.lineWidth=n/8,l.rect(0,0,n,r),l.stroke(),l.filter=`blur(${t}px)`,l.filter="opacity(50%)",l.drawImage(o,0,0),{humidityImage:o,wetness:a.canvas}}function je({width:e,elevation:n,wind:t,steps:r}){console.time("humidity");let o=n.length/e,a=Math.sqrt(e*e+o*o),{humidityImage:l,wetness:i}=ve(n,e,10),s=a/10;for(let p=0;p<r;p++){let c=[p%100/100*e,p%10/10*o],b=t[U(c,e)],h=[c[0]+b*.3*e/8,c[1]+Math.abs(b)*.5*o/12];i.getContext("2d")?.drawImage(i,c[0],c[1],s,s,h[0],h[1],s,s)}z(l).filter="blur(30px)",z(l).drawImage(i,0,0,e,o,0,0,e,o);let g=W(l);return console.timeEnd("humidity"),g}function Ue({width:e,height:n,elevation:t,erosion:r,riversShown:o}){console.time("rivers");let{wetness:a}=ve(t,e,100),l=W(a),i=t.map((p,c)=>1-p-l[c]*.3),s=new Float32Array(e*n),g=se(e,4)[0];for(let p=0;p<r+o;p++){let c=p*12345%t.length,b=[],h=1e3;for(;t[c]>-.1&&h-- >0;){p>r&&(s[c]+=1);let v=i[c],x=0,m=1e6;for(let d of g)i[c+d]<=m&&(x=c+d,m=i[x]);if(m<v){let d=(i[c]-m)*.01;for(let M of[0,0,-1,1,-e,e])t[c+M]-=d,i[c+M]-=d}else i[c]=m+.05;b.push(c),c=x}}for(let p in t)t[p]>-.2&&t[p]<0&&(t[p]=t[p]>-.1?.01:t[p]*2+.2),t[p]>0&&(t[p]*=1+T()*.1);return console.timeEnd("rivers"),s}function fe(e){let n=[];for(let t in e)n[t]=e[t];return n}function ge(e){let n=parseInt(e,16);return[Math.floor(n/256)*16,Math.floor(n/16)%16*16,n%16*16,256]}function Y(e,n,t,r){let o=e.length/n,{canvas:a,ctx:l}=O(n,o),i=l.createImageData(n,o);if(!i.data||!e)debugger;for(let s=0;s<e.length;s++){let g=0,p=t?t(e[s],s)??0:[0,0,0,e[s]];i.data.set(p,s*4)}return l.putImageData(i,0,0),a}function Se(e,n,t){let{canvas:r,ctx:o}=O(n,t);return o.drawImage(e,0,0,e.width,e.height,0,0,n,t),r}function We(e,n){let t=U(n,e.p.width),r=e.biome[t],o,a=1+T();if(r==B||r==ne)o="🐠",r==B?a+=1:o="🐋";else{let i=e.noise[t+1e3]%.1;if(i<.01)o="🏔️";else if(i<.02)o=i%.01<.005?"⬛":"🛢️";else{let s=e.temperature[t]*.8+e.noise[t]*5+12,g=e.humidity[t]*10+e.noise[t]*5-5;i<.06?o=G.atc.split(",")[(g>0?5:0)+~~H(0,4,s/10)]:o=g<-.5?i%.01<.003&&s>0?"💧":"🗿":g<.2?"🌿":"🌲,🌲,🌳,🌳,🌴".split(",")[~~H(0,4,s/15)]}}return{at:n,kind:o,size:a,left:a*1e3,t:e.temperature[t]}}function Ye(e){let n=[];for(let o=1e3;o--;){let a=[~~(T()*e.p.width),~~(T()*e.p.height)],l=We(e,a);n.push(l)}let t=new Set(n.map(o=>o.kind)),r=[];for(let o of t){let a=n.filter(l=>l.kind==o);for(let l of[...a])for(let i of[...a])l!=i&&i.size&&l.size&&Oe(l.at,i.at)<40&&(l.size+=i.size,i.size=0);r.push(...a.filter(l=>l.size))}e.poi=r}function Qe(e,n,t,r){let o={};for(let a of r??Object.keys(e)){o[a]=new Float32Array(e[a].length);let l=e[a],i=n[a];for(let s in l)o[a][s]=l[s]*(1-t)+i[s]*t}return o}function Ae(e,n,t){console.time("blend");let r=Qe(e,n,t,["dryElevation","tectonic"]);console.timeEnd("blend"),console.time("blendGen");let o=re({...e.p,averageTemperature:e.p.averageTemperature+Math.sin(t*6.3)*20},r);return console.timeEnd("blendGen"),o}function _e(e){let n=e.split(/([\d.-]+)/).filter(r=>r),t={};for(let r=0;r<n.length;r+=2)t[n[r+1]]=n[r];return console.log(t),t}function qe(e){return Object.fromEntries(e.split(`
`).map(n=>{let[t,...r]=n.split(/[:>]/);if(!r)debugger;let[o,a]=r.map(_e).filter(l=>l);return[t,{from:o,to:a,t:n,name:t}]}))}var xe,j,k,Te=10;function be(){let e;k={},xe=Object.fromEntries(G.d.split(`
`).map(n=>{if(n[0]=="=")e=n.slice(1);else{let[t,r]=n.split(" ");return(e=="RESOURCES"||e=="TOOLS")&&(k[t]=0),[t,{name:r,category:e}]}}).filter(n=>n)),j=qe(G.rr),console.log(xe),console.log(j)}var ie,F,I=[],R=[0,0],Re,oe,Je=["unknown","desert","grassland","tundra","savanna","shrubland","taiga","tropical forest","temperate forest","rain forest","swamp","snow","steppe","coniferous forest","mountain shrubland","beach","lake","ocean"],Ee=[["seed","number"],["noiseSeed","number"],["width","number"],["height","number"],["noiseSmoothness","range",{max:10,step:.5}],["tectonicSmoothness","range",{max:10,step:.5}],["noiseFactor","range",{min:-5,max:20,step:.5}],["crustFactor","range",{min:-5,max:20,step:.5}],["tectonicFactor","range",{min:-1,max:10,step:.1}],["pangaea","range",{min:-5,max:5}],["seaRatio","range",{tip:"Sea percentage"}],["flatness","range"],["randomiseHumidity","checkbox"],["averageTemperature","range",{min:-30,max:50,step:1}],["elevationCold","range",{min:0,max:300,step:1}],["erosion","range",{max:1e5}],["riversShown","range",{max:1e3}],["biomeScrambling","range"],["squareGrid","checkbox"],["gameMapScale","range",{min:0,max:4,step:1}],["gameMapRivers","range",{max:5e4,step:1e3}],["discreteHeights","range",{max:40,step:1}]],Le={mapMode:0,seed:1,width:640,height:640,scale:1,noiseFactor:10,crustFactor:6,tectonicFactor:3,noiseSmoothness:2,tectonicSmoothness:5,pangaea:0,seaRatio:.55,flatness:.5,randomiseHumidity:0,averageTemperature:15,erosion:5e4,riversShown:400,biomeScrambling:0,terrainTypeColoring:0,discreteHeights:0,hillRatio:.12,mountainRatio:.04,gameMapRivers:15e3,gameMapScale:2,generatePhoto:1,squareGrid:0},u={};function Ve(){if(document.location.hash){u={};let e=document.location.hash.substr(1).split("&").map(n=>n.split("="));console.log(e);for(let n of e)u[n[0]]=n[1]=="false"?!1:n[1]=="true"?!0:Number(n[1]);console.log(u)}(!u||!u.width)&&(u=JSON.parse(localStorage.mapGenSettings)),(!u||!u.width)&&(u={...Le}),Fe(),le()}window.onload=Ve;window.resetSettings=()=>{};function le(){for(let[e,n]of Ee){if(n=="tip")continue;let t=document.getElementById(e);u[e]=t.type=="checkbox"?t.checked?1:0:Number(t.value);let r=document.getElementById(e+"_value");r&&(r.innerText=String(u[e]).substr(0,8))}Ke(),tt(u)}window.applySettings=le;document.body.addEventListener("mousedown",e=>{switch(e.target?.id){case"resetSettings":u={...Le},Fe(),le();return}});blendMaps.onchange=e=>{let n=Number(blendMaps.value);I.length>=2&&(F=Ae(I[I.length-2],I[I.length-1],n),Ie())};var ae={};function Fe(){let e=document.getElementById("form");e.innerHTML="";for(let n of Ee){let[t,r,o]=n;switch(o=o||{},ae[t]=o.tip,r){case"tip":e.innerHTML+=`<div class="tip">${t}</div>`;break;case"checkbox":e.innerHTML+=`<div>${t}</div><input class="checkbox" type="checkbox" id="${t}" ${u[t]?"checked":""} />`;break;case"number":e.innerHTML+=`<div>${t}</div><input class="number" type="number" id="${t}" value="${u[t]}" />`;break;case"range":let a=o.min||0,l=o.max||1,i=o.step||(l-a)/100;e.innerHTML+=`<div>${t}</div><input class="range" type="range" id="${t}" min="${a}" max="${l}" step="${i}" value="${u[t]}"/>
        <div id="${t}_value"></div>
        `;break}}}function Ke(){document.location.hash=Object.keys(u).map(e=>`${e}=${u[e]}`).join("&"),localStorage.mapGenSettings=JSON.stringify(u)}function Ze(e,n,t,r=1/4,o){let a=Y(e,u.width,t,o),i=Se(a,a.width*r,a.height*r).getContext("2d");return i.font="14px Verdana",i.fillStyle="#fff",i.strokeText(n,5,15),i.fillText(n,4,14),main.appendChild(a),main.style.width=`${u.width*devicePixelRatio}px`,main.style.height=`${u.height*devicePixelRatio}px`,ie=a,a}function et(e){let n=U(e,u.width);tooltip.style.left=`${Math.min(window.innerWidth-300,oe[0]+20)}`,tooltip.style.top=`${Math.min(window.innerHeight-300,oe[1]-40)}`,tooltip.style.display="grid",tooltip.innerHTML=Object.keys(F).map(t=>{let r=F[t][n];return`<div>${t}</div><div>${t=="photo"?r?.map(o=>~~o):t=="biome"?r+" "+Je[r]?.toUpperCase():~~(r*1e6)/1e6}</div>`}).join(""),D&&(tooltip.innerHTML+=`${D.kind} ${~~D.left}`)}document.onmousemove=e=>{let n=[e.movementX,e.movementY];oe=[e.screenX,e.screenY],e.target==ie&&e.buttons&&(R[0]+=n[0]*devicePixelRatio,R[1]+=n[1]*devicePixelRatio,Q());let t=e.target,r=t.tagName=="CANVAS",o=t.id;r||t.classList.contains("poi")?(Re=[e.offsetX/t.width*u.width/devicePixelRatio,e.offsetY/t.height*u.height/devicePixelRatio],et(Re)):ae[o]?tooltip.innerHTML=ae[o]:tooltip.style.display="none"};var S=1;main.onwheel=e=>{let n=S;S+=(e.deltaY>0?-1:1)*1/8,S=S<0?0:S,console.log(S,R),R[0]=(R[0]-400)*2**(S-n)+400,R[1]=(R[1]-400)*2**(S-n)+400,e.preventDefault(),e.stopPropagation(),Q()};var D,Pe;function Ie(){console.time("draw"),main.setHTMLUnsafe(""),Ze(F.photo,"photo",e=>e,void 0,e=>Math.max(1,~~(F.elevation[e]*20)*2));for(let e of F.poi){let n=document.createElement("div");n.classList.add("poi"),n.innerHTML=`${e.kind}<center style=color:rgb(${15*e.t-400},50,${-20*e.t+100})>${~~e.left}</center>`,e.div=n,n.onmouseover=()=>{D=e},n.onmouseleave=()=>{D=void 0},n.onclick=()=>{Pe=e,Q()},main.appendChild(n)}console.timeEnd("draw"),Q()}function we(e){return e?Object.keys(e).map(n=>`${e[n]==1?"":e[n]}${n}`).join("+"):""}function Q(){ie.style.transform=`translate(${R[0]}px, ${R[1]}px) scale(${2**S})`;for(let n of F.poi){let t=n.div;if(t){let r=(n.size**.5*3+4)*2**S;t.style.left=`${n.at[0]*devicePixelRatio*2**S+R[0]-r/2}px`,t.style.top=`${n.at[1]*devicePixelRatio*2**S+R[1]-r/2}px`,t.style.fontSize=`${r}px`,t.dataset.cur=n==Pe?"1":""}}let e=JSON.parse(JSON.stringify(j));for(let n of Object.values(e))if(["🐾","🍃"].find(r=>n.from[r]))debugger;recdiv.innerHTML="👨‍👩‍👦‍👦"+Te+"|"+Object.keys(k).map(n=>`${n}${k[n]}`).join("|")+"<br/>"+Object.values(e).map(n=>`<button>${`${n.name} ${we(n.from)}➨${we(n.to)}`}</button>`).join("")}function tt(e){console.time("generation total"),F=re(e),I.push(F),Ie(),console.timeEnd("generation total")}})();
