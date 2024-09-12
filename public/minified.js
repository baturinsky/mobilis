"use strict";(()=>{function $e(e,t){let r;switch(t){case 0:return r=[[0,-1],[1,0],[0,1],[-1,0]].map(([n,i])=>i*e+n),[r,r];case 4:return r=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]].map(([n,i])=>i*e+n),[r,r];case 1:return[[[0,-1],[1,0],[0,1],[-1,1],[-1,0],[-1,-1]],[[1,-1],[1,0],[1,1],[0,1],[-1,0],[0,-1]]].map(n=>n.map(([i,l])=>l*e+i));case 2:return r=[[1,-1],[2,0],[1,1],[-1,1],[-2,0],[-1,-1]].map(([n,i])=>i*e+n),[r,r];case 3:return r=[[0,-1],[1,0],[1,1],[0,1],[-1,0],[-1,-1]].map(([n,i])=>i*e+n),[r,r]}}function le(e,t,r){return e*(1-r)+t*r}function O(e,t,r){return r<e?e:r>t?t:r}function Pe(e){for(let t of[0,1,2])e[t]=O(0,255,e[t])}var j=6;function q(e,t){return((e[0]-t[0])**2+(e[1]-t[1])**2)**.5}function Ce(e,t,r){return[le(e[0],t[0],r),le(e[1],t[1],r)]}function T(){let e=Math.sin(j)*1e4;return j=(j+Math.E)%1e8,e-Math.floor(e)}function D([e,t],r=k.width){return~~e+~~t*r}function V(e){return e.getContext("2d")}function X(e,t){let r=document.createElement("canvas");r.width=e,r.height=t,r.style.width=`${r.width*devicePixelRatio}px`,r.style.height=`${r.height*devicePixelRatio}px`;let n=V(r);return{canvas:r,ctx:n}}function Z(e){let n=V(e).getImageData(0,0,e.width,e.height).data,i=new Float32Array(n.length/4);for(let l=0;l<n.length;l++)i[l]=n[l*4+3]/255;return i}function ot(e,t,r=5e3,n=100,i=.01,l=!0){let{canvas:a,ctx:s}=X(e,t);if(l){let m=s.createRadialGradient(0,0,0,0,0,1);m.addColorStop(0,`rgba(255, 255, 255, ${i})`),m.addColorStop(1,"rgba(255, 255, 255, 0)"),s.fillStyle=m}else s.fillStyle=`rgba(255, 255, 255, ${i})`;for(let m=0;m<r;m++){let d=[...Array(3)].map(()=>T()),[c,p]=[d[0]*e,d[1]*t],g=Math.pow(d[2],2)*n;s.save(),s.translate(c,p),s.rotate(T()*Math.PI),s.scale(g*(.5+T()),g*(.5+T())),s.beginPath(),s.arc(0,0,1,0,Math.PI*2),s.fill(),s.restore()}return a}function Fe(e,t){let{canvas:r,ctx:n}=X(e.width,e.height);return n.filter=t,n.drawImage(e,0,0),r}function Oe(e,t=.5,r=1e3){if(!e)debugger;let n=e.length,i=[...Array(r)].map(()=>e[Math.floor(T()*n)]);return i=i.sort(),i[Math.floor(t*i.length)]}function it(e,t=1e3){let r=e.length,n=[...Array(t)].map(()=>e[Math.floor(T()*r)]),i=0;for(let l of n)l>i&&(i=l);return e.map(l=>l/i)}var K=({width:e,height:t},r,n,i,l)=>Z(Fe(ot(e,t,n,Math.sqrt(e*e+t*t)*i,l),`blur(${r}px)`));function at(e){let{width:t,height:r,seed:n,noiseSmoothness:i,tectonicSmoothness:l,noiseFactor:a,crustFactor:s,tectonicFactor:m,pangaea:d}=e;j=n;let c=t*r;console.time("noise");let p=K(e,i,3e3,.15,.03),g=K(e,l,2e3,.15,.03),x=K(e,l,2e3,.15,.03);console.timeEnd("noise"),console.time("main");let f=Oe(g,.5),v=g.map((M,y)=>(.2/(Math.abs(f-M)+.1)-.95)*(x[y]-.2)*2),u=g.map((M,y)=>5+p[y]*a+g[y]*s+v[y]*m+-d*(Math.abs(y/c-.5)+Math.abs(y%t/t-.5)));console.timeEnd("main"),console.time("normalize");for(let M=4;M--;)for(let y=t;y<u.length;y++)for(let P of[-2,2,-t*2,t*2])u[y]+=((u[y+P]||0)-u[y])*.15;let b=it(u);return console.timeEnd("normalize"),{dryElevation:b,tectonic:v,p:e}}function se(e,t){console.time("generateMap"),t??=at(e);let r=lt(e,t);return console.timeEnd("generateMap"),r}function lt(e,t){let{width:r,height:n,averageTemperature:i,erosion:l,riversShown:a,randomiseHumidity:s,noiseSmoothness:m,seaRatio:d,flatness:c,noiseSeed:p,elevationCold:g}=e;j=p;let x=K(e,m,3e3,.15,.01),{dryElevation:f,tectonic:v}=t,u=r*n,b=Oe(f,d),M=f.map((w,C)=>w<b?-Math.pow(1-w/b,.35):Math.pow((w-b)*(.5+v[C]*.5)/(1-b),1+2*c)),y=M.map((w,C)=>Math.cos((Math.abs(.5-C/u)*4+.85)*Math.PI)/(w<0?1:1+5*w*w));console.time("windSmoothing"),y=Z(Fe(ee(y,r,w=>[0,0,0,127*(w+1)]),"blur(3px)")).map(w=>w*2-1),console.timeEnd("windSmoothing");let P=ut({width:r,height:n,elevation:M,tectonic:v,erosion:l,riversShown:a}),E=pt({width:r,elevation:M,wind:y,steps:400});s&&(E=E.map((w,C)=>Math.max(0,w+Math.sin(x[C]*50)/10-M[C]*.2)));let N=M.map((w,C)=>i+25-100*Math.abs(.5-C/u)/(.7+.6*E[C])-Math.max(0,w)*g),$={tectonic:v,dryElevation:f,elevation:M,noise:x,rivers:P,wind:y,temperature:N,humidity:E,p:e,poi:[]};return $.biome=st($),$.photo=mt($),$}function st(e){console.time("biome");let t=e.temperature.map((r,n)=>{if(e.elevation[n]<-0)return te;if(e.rivers[n])return z;let l=1+e.p.biomeScrambling*Math.sin(e.noise[n]*100),a=Ge[~~O(0,5,e.humidity[n]*4.5*l)][~~O(0,3,r*l/10+1)];return e.elevation[n]>.4&&(a=me),a});return console.timeEnd("biome"),t}function mt(e){let{humidity:t,elevation:r,temperature:n,tectonic:i,noise:l,rivers:a,biome:s}=e,{width:m,shading:d}=e.p,c=[...t],p=[...t],g;console.time("photo");let x;function f(v,u){if(v)for(let b of[0,1,2])x[b]=le(x[b],v[b],u)}return g=[...t].map((v,u)=>{let b=r[u];if(b<0)return[-(b**2)*1e3+100,-(b**2)*500+150,-(b**2)*300+150,255];{x=[n[u]*15-v*700,150-v*150,n[u]*8-v*500,255],Pe(x);let M=(b+i[u])*2-1;M>0&&f([64,0,0,255],Math.min(1.5,M**2));let y=(1+Math.sin((l[u]*3+i[u])*100))*(1+T());y=(Math.sin(l[u]*100)+.5)*y**2*.05,f([32,32,32],y),c[u]=0,a[u]&&(x=[0,100,150+50*a[u],255]);for(let P of[1,2,3])for(let E of[1,m,-1,-m,0])f(We[s[u+E*P]],.05);if(n[u]<0&&f([500,500,500],-n[u]*.03),Pe(x),d){let P=0;for(let N=-2;N<=2;N++)for(let $=-2;$<=2;$++)P+=r[u+N+m*$]*(Math.sign(N)+Math.sign($));let E=r[u+1+m]+r[u+m]+r[u+1]-b-r[u-m]-r[u-1]+P*.05;a[u]==0&&a[u+m]!=0&&(E-=.1),f([500,500,260],-E),p[u]=E}return x}}),console.timeEnd("photo"),g}function Ie(e,t,r=20){let n=e.length/t,i=ee(e,t,(s,m)=>[0,0,0,s<=0?100:0]),l=X(t,n),a=l.ctx;return a.beginPath(),a.lineWidth=t/8,a.rect(0,0,t,n),a.stroke(),a.filter=`blur(${r}px)`,a.filter="opacity(50%)",a.drawImage(i,0,0),{humidityImage:i,wetness:l.canvas}}function pt({width:e,elevation:t,wind:r,steps:n}){console.time("humidity");let i=t.length/e,l=Math.sqrt(e*e+i*i),{humidityImage:a,wetness:s}=Ie(t,e,10),m=l/10;for(let c=0;c<n;c++){let p=[c%100/100*e,c%10/10*i],g=r[D(p)],x=[p[0]+g*.3*e/8,p[1]+Math.abs(g)*.5*i/12];s.getContext("2d")?.drawImage(s,p[0],p[1],m,m,x[0],x[1],m,m)}V(a).filter="blur(30px)",V(a).drawImage(s,0,0,e,i,0,0,e,i);let d=Z(a);return console.timeEnd("humidity"),d}function ut({width:e,height:t,elevation:r,erosion:n,riversShown:i}){console.time("rivers");let{wetness:l}=Ie(r,e,100),a=Z(l),s=r.map((c,p)=>1-c-a[p]*.3),m=new Float32Array(e*t),d=$e(e,4)[0];for(let c=0;c<n+i;c++){let p=c*12345%r.length,g=[],x=1e3;for(;r[p]>-.1&&x-- >0;){c>n&&(m[p]+=1);let f=s[p],v=0,u=1e6;for(let b of d)s[p+b]<=u&&(v=p+b,u=s[v]);if(u<f){let b=(s[p]-u)*.01;for(let M of[0,0,-1,1,-e,e])r[p+M]-=b,s[p+M]-=b}else s[p]=u+.05;g.push(p),p=v}}for(let c in r)r[c]>-.2&&r[c]<0&&(r[c]=r[c]>-.1?.01:r[c]*2+.2),r[c]>0&&(r[c]*=1+T()*.1);return console.timeEnd("rivers"),m}function He(e){let t=[];for(let r in e)t[r]=e[r];return t}function Be(e){let t=parseInt(e,16);return[Math.floor(t/256)*16,Math.floor(t/16)%16*16,t%16*16,256]}function ee(e,t,r,n){let i=e.length/t,{canvas:l,ctx:a}=X(t,i),s=a.createImageData(t,i);if(!s.data||!e)debugger;for(let m=0;m<e.length;m++){let d=0,c=r?r(e[m],m)??0:[0,0,0,e[m]];s.data.set(c,m*4)}return a.putImageData(s,0,0),l}function Ne(e,t,r){let{canvas:n,ctx:i}=X(t,r);return i.drawImage(e,0,0,e.width,e.height,0,0,t,r),n}function ct(e,t,r,n){let i={};for(let l of n??Object.keys(e)){i[l]=new Float32Array(e[l].length);let a=e[l],s=t[l];for(let m in a)i[l][m]=a[m]*(1-r)+s[m]*r}return i}function De(e,t,r){console.time("blend");let n=ct(e,t,r,["dryElevation","tectonic"]);console.timeEnd("blend"),console.time("blendGen");let i=se({...e.p,averageTemperature:e.p.averageTemperature+Math.sin(r*6.3)*20},n);return console.timeEnd("blendGen"),i}var I={},h={popspd:.01,psz:1e3,blnd:13,pois:300,rspd:1,amrt:.01,rcst:[100,100,300,1e3,3e3],wpy:169,dm:.1,d:`=DEP
🏔️ ores
⬛ coal
🛢️ oil
💧 water
🗿 relic
=PLN
🌿 grass
🌲 taiga
🌳 forest
🌴 jungles
=ANM
🐏 ram
🐂 yak
🐎 mustang
🐪 camel
🐺 wolves
🐗 hogs
🐅 tigers
=RES
👖 fabric
🪵 wood
🍎 food
⛽ fuel
📙 book
=TLS
🛠️ tools
⛺ housing
🛷 wagons
🐴 horses
⚙️ engines
🏹 weapons
=BNS
💕 happiness bonus
🥄 food consumption
🔭 visibility range
🗑️ food spoilage
🎯 hunting bonus
🍲 food happiness
⚗️ research focus
=WLD
🐾 animals
🍃 plants
🌾 cropss
=MOV
🏃 walk
⚓ swim
=CAL
👹 goblin
☣️ taint
🌋 fracture
=MSC
💗 happiness
📅 week
👨‍👩‍👦‍👦 pop
🏋 weight
`,st:"Foraging;Walking;Sticks",aka:{"🌾":"🍎"},rr:`=Land travel method
0Walk:>1🏃
0Ride:1🐴1🛷>4🏃0🐎0🐪
0Drive:1⚙️1⛽1🛷>10🏃
=Sea travel method
0Swim:>0.1⚓
0Sail:0.1👖1🛷>3⚓
0Boat:1⚙️1⛽1🛷>10⚓
=Jobs
0Forage:1🍃>1🍎
0Pick Sticks:1🍃>1🪵
1Axe:1🍃1🛠️.1🪨>3🪵
2Herd:10🍃>10🌾!0🐂0🐏0🐗0🌿
2Farm:3🍃>5🌾0🌿
2Plantation:3🍃>3👖
0Hunt:1🐾>1🍎1👖!0🐾
1Bow:3🐾1🏹>3🍎3👖!0🐾0🏹
1Trap:2🐾1🛠️>2🍎2👖!0🐾0🛠️
0Fish:1🐠>3🍎!0🐠
1Fishing nets:1🛠️1🐠>5🍎!0🐠
3Whaling:1⚓1🛠️1🐋>10🍎!0🐋
1Tools:1🪵>1🛠️
1Sharp Sticks:1🪵>.3🏹
1Wheel:3🪵>1🛷
1Wigwam:1🪵3👖>1⛺
1Dig:1🛠️1🏔️>1🪨
3Mine:1⚙️1⛽1🏔️>10⛽
3Firewood:1🪵>1⛽
3Coal:1⚙️1⛽1⬛>10⛽
4Oil:1⚙️1⛽1🛢️>20⛽
1Write:>.1📙0👖0🪵
2Parchment:2👖>.2📙
3Paper:1🪵1🛠️>.4📙
4Print:1🪵2🛠️>1📙
4Archeology:1🗿1🛠️>3📙
1Horses:3🍃>1🐴!0🐎0🐪0🐴
2Metal Working:1🪵1🪨>3🛠️
4Rifles:1⚙️1⛽1🪨>3🏹
4Engines:3🛠️3🪨>1⚙️
3Alloys:1⚙️1⛽1🪨>3⛺
4Cars:1⚙️1⛽1🪨>1🛷
4Greenhouse:1⛺1⛽>5🍎
=Calamities
4Kill goblins:1🏹1👹>1📙
4Burn taint:1🛠️1⛽1☣️>1📙
4Close fracture:1⚙️1⛽1🌋>1📙
=Permanent bonuses
1Tame Dogs:.05🥄.2🎯.05💕0🐺
1Tame Cats:.03🥄-.2🗑️.05💕0🐅
1Pottery:-.2🗑️0🍎
2Conservation:-.3🗑️0🍎
0Cooking:-.1🗑️-.1🥄1🍲0🍎
1Mapmaking:.25🔭0🏃
2Astronomy:.25🔭0🏃
3Compass:.25🔭0🏃
4Optics:.25🔭0🏃
1Research Focus:1⚗️0📙`,atc:"🐏,🐂,🐂,🐎,🐪,🐏,🐺,🐗,🐗,🐅",m:{"🐾":`🐏:1🍎3👖
🐂:3🍎1👖
🐎:2🍎1👖
🐪:1🍎1👖
🐺:1🍎1👖
🐗:4🍎1👖
🐅:1🍎2👖
`,"🍃":`🌿:2.5🍎0.5🪵1🌾1🐴1👖
🌲:1🍎2🪵0.3🌾0.35🐴0.3👖
🌳:2🍎1🪵0.5🌾0.5🐴0.3👖
🌴:1.5🍎1.5🪵0.3🌾0.3🐴0.3👖`}},je=1,pe=2,ue=3,ce=4,de=5,fe=6,U=7,he=8,Xe=9,dt=10,be=11,ze=12,re=13,me=14,ft=15,z=16,te=17,Ge=[[ue,ze,ce,je],[ue,de,pe,ce],[be,de,pe,he],[be,re,he,U],[fe,re,U,U],[fe,re,U,Xe]],We=He({[je]:"fa0",[pe]:"4f4",[ce]:"ff8",[ue]:"cca",[de]:"ad4",[fe]:"064",[U]:"0a0",[he]:"060",[Xe]:"084",[dt]:"880",[be]:"fff",[ze]:"caa",[re]:"0a6",[me]:"884",[ft]:"ff0"}).map(Be);var Qe,H,xe={},G=[],W;function Q(e){return~~(e.size*h.psz*Math.sin(O(0,1,e.age)*3.14)-e.taken)}function _e(e,t,r){let n=[~~(T()*e.p.width),~~(T()*e.p.height)];for(let d of t)if(q(d.at,n)<10)return;let i=D(n),l=e.biome[i],a,s=1+T();if(l==z||l==te)a="🐠",l==z?s+=1:a="🐋";else{let d=e.noise[i+1e3]%.1;if(d<.01)a="🏔️";else if(d<.02)a=d%.01<.005?"⬛":"🛢️";else{let c=e.temperature[i]*.8+e.noise[i]*5+12,p=e.humidity[i]*10+e.noise[i]*5-5;d<.06?a=h.atc.split(",")[(p>0?5:0)+~~O(0,4,c/10)]:a=p<-.5?d%.01<.003&&c>0?"💧":"🗿":p<.2?"🌿":"🌲,🌲,🌳,🌳,🌴".split(",")[~~O(0,4,c/15)]}}let m={at:n,kind:a,size:s,taken:0,age:T(),temp:e.temperature[i],ageByWeek:.01};return t.push(m),m}function ht(e){let t=e.split(/([\d.-]+)/).filter(n=>n),r={};for(let n=0;n<t.length;n+=2)r[t[n+1]]=t[n];return r}var ye={};function Ue(e,t=!1){let r;return Object.fromEntries(e.split(`
`).map(n=>{if(n[0]=="=")return r=n.slice(1),null;let i=Number(n[0]),l={},[a,...s]=n.slice(i>=0?1:0).split(/[:>\!]/);if(r&&(ye[a]=r,r=void 0),!s)debugger;let[m,d,c]=s.map(ht).map((p,g)=>{let x=s.length<=2||g==2;for(let f in p){if(!I.BNS[f]&&x)if(h.aka[f])l[h.aka[f]]=1;else if(h.m[f])for(let v in xe[f])l[v]=1;else l[f]=1;p[f]==0&&delete p[f]}return p}).filter(p=>p);return t?[a,m]:[a,{from:m,to:d,t:n,name:a,cost:i,research:l}]}).filter(n=>n))}function Je(){let e;Qe=Object.fromEntries(h.d.split(`
`).map(t=>{if(t[0]=="=")e=t.slice(1),I[e]={};else{let[r,n]=t.split(" ");return I[e][r]=1,[r,n]}}).filter(t=>t));for(let t in h.m)xe[t]=Ue(h.m[t],!0);H=Ue(h.rr)}function Ke(e){let t={pop:100,store:Object.fromEntries(Object.keys(Qe).filter(r=>I.RES[r]||I.TLS[r]).map(r=>[r,0])),bonus:Object.fromEntries(Object.keys(I.BNS).map(r=>[r,0])),sel:{Walk:1,Swim:1},"🏃":"Walk","⚓":"Swim",date:0,seed:e,tech:{},research:{}};t.poi=[];for(let r in H)t.tech[r]=H[r].cost==0?1:0,t.research[r]=0;return t}function ve(){let e=o.store["🍎"]>0?0:-o.pop;for(let t in o.store){let n=o.store[t]**.75;e+=n}return e}function Ve(e){if(delete o.store[o.deposit],o.home){let t=ie(S,e,o.home);oe(t.w),delete t.w;for(let r in t)o.store[r]-=t[r]}o.home=e,o.deposit=e.kind,o.store[e.kind]=Q(e),Re()}function Me(e){ke(_(o.date)),console.time("populate");let t=h.pois-e.length;for(let r=0;r<t*4;r++)_e(S,e);bt(S,e),console.timeEnd("populate")}function bt(e,t){let r=new Set(t.map(i=>i.kind)),n=[];for(let i of r){let l=t.filter(a=>a.kind==i);for(let a of[...l])for(let s of[...l])o&&(o.home==a||o.home==s)||a!=s&&s.size&&a.size&&q(a.at,s.at)<40&&(a.size+=s.size,a.age=(a.age+s.age)/2,a.ageByWeek=(a.ageByWeek+s.ageByWeek)/2,s.size=0);n.push(...l.filter(a=>a.size))}return t.splice(0,1e9,...n)}function Y(e,t){let r=1e12;if(t!=null){let n=Object.values(e.to)[0];r=t/n}for(let n in e.from)r=Math.min(o.store[n]/e.from[n],r);return r}function gt({used:e,made:t}){for(let r in e)o.store[r]-=e[r],o.deposit==r&&o.home&&(o.home.taken+=e[r]);for(let r in t)o.store[r]=(o.store[r]||0)+t[r]}function xt(e){for(let t in{...e})e[t]||delete e[t];return e}function ge(e,t){let r={},n={};for(let i in e.from){let l=e.from[i]*t,a=I.TLS[i]?.1:1;r[i]=l*a}for(let i in e.to){let l=e.to[i]*t,a=h.aka[i]??i;n[a]=l}return{used:r,made:n}}function we(){let e=JSON.parse(JSON.stringify(H));for(let t of Object.values(e)){let r=Object.keys(h.m).find(n=>t.from[n]);if(r&&o.home){let n=xe[r][o.home.kind];if(n){for(let i in t.to)n[i]&&(t.to[i]=t.to[i]*n[i]);t.from[o.home.kind]=t.from[r],delete t.from[r]}}for(let n in t.to)o.tech[t.name]>0&&(t.to[n]*=1+.1*(o.tech[t.name]-1))}W=e}var yt=["⚓","🏃"];function qe(e){if(e){let t=W[e];for(let n of yt)if(t.to[n]){let i=o[n];delete o.sel[i],o.sel[t.name]=1,o[n]=t.name;return}let r=Y(t);if(r>0){r=Math.min(r,o.pop);let n=ge(t,r);gt(n),oe(r/o.pop)}}}function ne(){return~~(o.date*h.wpy)}function oe(e=1){let t=ne();for(o.date+=e/h.wpy;t<ne();)t++,vt();F(),window.save(0)}function vt(){let e=o.pop*(1+o.bonus["🥄"])*.1;o.store["🍎"]-=e,o.store["🍎"]<0&&(o.pop+=o.store["🍎"]*.1,o.store["🍎"]=0,B("<red>🍎Food shortage!</red>"));let t=h.popspd,r=O(-o.pop*t,o.pop*t,(ve()-o.pop)*t);console.log({dHappiness:r}),o.pop+=r;for(let n in o.store){let i=Object.values(W).filter(a=>a.research[n]),l=o.store[n]**.8/i.length*h.rspd;for(let a of i)Mt(a.name,l);n!=o.deposit&&(o.store[n]*=1-h.amrt)}for(let n of[...o.poi])if(n.age+=n.ageByWeek,(n.age>1||Q(n)<=0)&&o.home!=n){o.poi.splice(o.poi.indexOf(n),1);let i;do i=_e(S,o.poi,o.date);while(!i)}Me(o.poi)}function Mt(e,t){o.research[e]+=t;let r=Se(e);if(o.research[e]>r){o.tech[e]++,o.research[e]=0;let n=o.tech[e];B(n>1?`${e} advanced to level ${n}`:`${e} researched`)}}function Se(e){return h.rcst[H[e].cost]*2**o.tech[e]}function Ze(e){let t=W[e];return Y(t)>0}function Ae(e,t,r){if(!r)return[0,0];let n=q(t.at,r.at),i=0,l=0;for(let a=0;a<n;a++){let s=Ce(t.at,r.at,a/n),m=D(s);e.elevation[m]<0?i+=h.dm:l+=h.dm}return{"🏃":l,"⚓":i}}function Ye(e,t){return Object.fromEntries(Object.keys({...e,...t}).map(r=>[r,(e[r]||0)+(t[r]||0)]))}function Te(){let e=o.pop;for(let t in o.store)o.deposit!=t&&(e+=o.store[t]*.1);return e}function ie(e,t,r){let n=Te(),i=Ae(e,t,r),l=i["🏃"],a=i["⚓"],[s,m]=[H[o["🏃"]],H[o["⚓"]]];for(let f of[s,m])if(Y(f)<n)return{fail:1};l*=n,a*=n;let[d,c]=[Y(s,l),Y(m,a)],p=ge(s,d),g=ge(m,c),x=Ye(p.made,g.made);if(x["🏃"]>=l-.1&&x["⚓"]>=a-.1){let f=Ye(p.used,g.used);return f.w=(d+c)/o.pop,xt(f)}else return{fail:2}}var S;var R=[0,0],et,Le,A=1,J,o,Ee=[];function B(e){Ee.push(e)}var wt=["unknown","desert","grassland","tundra","savanna","shrubland","taiga","tropical forest","temperate forest","rain forest","swamp","snow","steppe","coniferous forest","mountain shrubland","beach","lake","ocean"],k={mapMode:7,seed:9,width:700,height:700,scale:1,noiseFactor:11.5,crustFactor:5.5,tectonicFactor:2.9,noiseSmoothness:1,tectonicSmoothness:8.5,pangaea:-1.5,seaRatio:.47,flatness:.09,randomiseHumidity:0,averageTemperature:19,erosion:1e4,riversShown:150,biomeScrambling:.24,terrainTypeColoring:0,discreteHeights:0,hillRatio:.12,mountainRatio:.04,gameMapRivers:15e3,gameMapScale:2,generatePhoto:1,squareGrid:0,generateTileMap:0,noiseSeed:1,elevationCold:53,shading:1};function St(){Je(),o=Ke(k.seed),Me(o.poi),rt(),F()}document.addEventListener("mousedown",e=>{qe(e.target.dataset.rec),F()});window.onload=St;Object.assign(window,{give:e=>{o.store[e]+=100,F()},foc:e=>{o.focus!=e&&(o.focus=e,oe())},save:e=>{if(e!=0&&!confirm(`Save to ${e}?`))return;let t=JSON.stringify({...o,home:o.poi.indexOf(o.home)},null,2);localStorage.setItem("temo"+e,t),B("Saved")},load:e=>{let t=localStorage.getItem("temo"+e);t&&(o=JSON.parse(t),o.home=o.poi[o.home],ke(_(o.date)),Re(),B("Loaded"))}});var tt={};var L;function At(e,t,r,n=1/4,i){L=ee(e,k.width,r,i);let a=Ne(L,L.width*n,L.height*n).getContext("2d");return a.font="14px Verdana",a.fillStyle="#fff",a.strokeText(t,5,15),a.fillText(t,4,14),main.appendChild(L),main.style.width=`${k.width*devicePixelRatio}px`,main.style.height=`${k.height*devicePixelRatio}px`,L=L,L}function Tt(e){let t=D(e);tooltip.style.left=`${Math.min(window.innerWidth-300,Le[0]+20)}`,tooltip.style.top=`${Math.min(window.innerHeight-300,Le[1]-40)}`,tooltip.style.display="grid",tooltip.innerHTML=Object.keys(S).map(r=>{let n=S[r][t];return`<div>${r}</div><div>${r=="photo"?n?.map(i=>~~i):r=="biome"?n+" "+wt[n]?.toUpperCase():~~(n*1e6)/1e6}</div>`}).join(""),J&&(tooltip.innerHTML+=`${J.kind} ${~~Q(J)}`)}document.onmousemove=e=>{let t=[e.movementX,e.movementY];Le=[e.screenX,e.screenY],e.target==L&&e.buttons&&(R[0]+=t[0]*devicePixelRatio,R[1]+=t[1]*devicePixelRatio,F());let r=e.target,n=r.tagName=="CANVAS",i=r.id;n||r.classList.contains("poi")?(et=[e.offsetX/r.width*k.width/devicePixelRatio,e.offsetY/r.height*k.height/devicePixelRatio],Tt(et)):tt[i]?tooltip.innerHTML=tt[i]:tooltip.style.display="none"};main.onwheel=e=>{let t=A;A+=(e.deltaY>0?-1:1)*1/8,A=A<0?0:A,console.log(A,R);let r=k.width/2;R[0]=(R[0]-r)*2**(A-t)+r,R[1]=(R[1]-r)*2**(A-t)+r,e.preventDefault(),e.stopPropagation(),F()};function Rt(e){let t=o.poi[e],r=Ae(S,t,o.home),n=ie(S,t,o.home);return`<div class=poi id=poi${e}>
${t.kind}<center style=color:rgb(${15*t.temp-400},50,${-20*t.temp+100})>${~~Q(t)}
${!o.home||t==o.home?"":`<br/>${ae(r)}<br/>${ae(n)}`}</center>
</div>`}function rt(){console.time("draw"),L&&main.removeChild(L),At(S.photo,"photo",e=>e,void 0,e=>Math.max(1,~~(S.elevation[e]*20)*2)),console.timeEnd("draw"),F()}window.poiOver=e=>{console.log(e)};function kt(e){return parseFloat(Number(e).toFixed(2))}function ae(e){return e?Object.keys(e).map(t=>`<num data-red='${o.store[t]<.1}'>${kt(e[t])}</num>${t}`).join(" "):""}function Re(){let e=k.width/2;o.home&&(R[0]=(-o.home.at[0]*2**A+e)*devicePixelRatio,R[1]=(-o.home.at[1]*2**A+e)*devicePixelRatio)}function F(){if(!o)return;we(),L.style.transform=`translate(${R[0]}px, ${R[1]}px) scale(${2**A})`;let e="";for(let l in o.poi)e+=Rt(l);ps.innerHTML=e;let t=k.width/2;for(let l in o.poi){let a=o.poi[l],s=document.querySelector(`#poi${l}`);if(s){let m=(a.size**.5*3+4)*2**A;s.style.left=`${a.at[0]*devicePixelRatio*2**A+R[0]-m/2}px`,s.style.top=`${a.at[1]*devicePixelRatio*2**A+R[1]-m/2}px`,s.style.fontSize=`${m}px`,s.dataset.cur=a==o.home,s.onmouseover=()=>{J=a},s.onmouseleave=()=>{J=void 0},s.onmousedown=()=>{if(o.home&&ie(S,a,o.home).fail){B("Unreachable");return}Ve(a),F()}}}we(),o.bonus["💗"]=ve();let r=[{"👨‍👩‍👦‍👦":o.pop,"🏋":Te(),"📅":ne(),...o.bonus},{...o.store}],n,i="";for(n=1;localStorage.getItem("temo"+n);n++)i+=`<button onmousedown=save(${n})>Save ${n}</button><button onmousedown=load(${n})>Load ${n}</button>`;i+=`<button onmousedown=save(${n})>Save ${n}</button>`,recdiv.innerHTML=r.map(l=>"<div class=res>"+Object.keys(l).map(a=>[a,~~l[a]]).map(a=>`<div onmousedown="give('${a[0]}')">${a.join("<br/>")}</div>`).join("")+"</div>").join("")+Object.values(W).map(l=>{let a=ae(l.to),s=ye[l.name],m=o.tech[l.name]>0;return(s?`<div>${s}</div>`:"")+`<button data-sel=${o.sel[l.name]} data-rec="${l.name}" data-use="${m&&Ze(l.name)}" >
${o.bonus["⚗️"]?`<div class=foc data-foc="${o.focus==l.name}" onmousedown=foc('${l.name}')>⚗️</div>`:""}
${m?"":"<div class=un>UNKNOWN</div>"}
${`<div class=r><div>${l.name} ${o.tech[l.name]||""}</div>
<div>${~~(Se(l.name)-o.research[l.name])}<span class=resl>⚗️↩${Object.keys(l.research).join("")}</span></div></div>
<span class=rec>${ae(l.from)}${a?"🡢 "+a:""}</span>`}
</button>`}).join("")+"<p class=log>"+Ee.slice(Ee.length-20).join(" ✦ ")+"</p>"+i+`<button data-fls=${o?.date==0&&Lt} onmousedown=load(0)>Load autosave</button>`}var Lt=!!localStorage.getItem("temo0");function ke(e){return S=e,rt(),S}function _(e=o.date){let t=~~e;if(t!=e&&(e=t+~~(e%1*h.blnd)/h.blnd),G[e])return G[e];if(t==e)return G[e]=se({...k,seed:o.seed+e}),G[e];console.time("blend");let[r,n]=[_(t),_(t+1)],i=De(r,n,e-t);return B("map updated"),G[e]=i,console.timeEnd("blend"),i}})();
