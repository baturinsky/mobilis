"use strict";(()=>{function Me(e,r){let t;switch(r){case 0:return t=[[0,-1],[1,0],[0,1],[-1,0]].map(([n,o])=>o*e+n),[t,t];case 4:return t=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]].map(([n,o])=>o*e+n),[t,t];case 1:return[[[0,-1],[1,0],[0,1],[-1,1],[-1,0],[-1,-1]],[[1,-1],[1,0],[1,1],[0,1],[-1,0],[0,-1]]].map(n=>n.map(([o,i])=>i*e+o));case 2:return t=[[1,-1],[2,0],[1,1],[-1,1],[-2,0],[-1,-1]].map(([n,o])=>o*e+n),[t,t];case 3:return t=[[0,-1],[1,0],[1,1],[0,1],[-1,0],[-1,-1]].map(([n,o])=>o*e+n),[t,t]}}function te(e,r,t){return e*(1-t)+r*t}function H(e,r,t){return t<e?e:t>r?r:t}function ve(e){for(let r of[0,1,2])e[r]=H(0,255,e[r])}var D=6;function Q(e,r){return((e[0]-r[0])**2+(e[1]-r[1])**2)**.5}function Se(e,r,t){return[te(e[0],r[0],t),te(e[1],r[1],t)]}function w(){let e=Math.sin(D)*1e4;return D=(D+Math.E)%1e8,e-Math.floor(e)}function N([e,r],t=d.width){return~~e+~~r*t}function U(e){return e.getContext("2d")}function G(e,r){let t=document.createElement("canvas");t.width=e,t.height=r,t.style.width=`${t.width*devicePixelRatio}px`,t.style.height=`${t.height*devicePixelRatio}px`;let n=U(t);return{canvas:t,ctx:n}}function _(e){let n=U(e).getImageData(0,0,e.width,e.height).data,o=new Float32Array(n.length/4);for(let i=0;i<n.length;i++)o[i]=n[i*4+3]/255;return o}function et(e,r,t=5e3,n=100,o=.01,i=!0){let{canvas:a,ctx:l}=G(e,r);if(i){let m=l.createRadialGradient(0,0,0,0,0,1);m.addColorStop(0,`rgba(255, 255, 255, ${o})`),m.addColorStop(1,"rgba(255, 255, 255, 0)"),l.fillStyle=m}else l.fillStyle=`rgba(255, 255, 255, ${o})`;for(let m=0;m<t;m++){let f=[...Array(3)].map(()=>w()),[p,c]=[f[0]*e,f[1]*r],h=Math.pow(f[2],2)*n;l.save(),l.translate(p,c),l.rotate(w()*Math.PI),l.scale(h*(.5+w()),h*(.5+w())),l.beginPath(),l.arc(0,0,1,0,Math.PI*2),l.fill(),l.restore()}return a}function Te(e,r){let{canvas:t,ctx:n}=G(e.width,e.height);return n.filter=r,n.drawImage(e,0,0),t}function we(e,r=.5,t=1e3){if(!e)debugger;let n=e.length,o=[...Array(t)].map(()=>e[Math.floor(w()*n)]);return o=o.sort(),o[Math.floor(r*o.length)]}function tt(e,r=1e3){let t=e.length,n=[...Array(r)].map(()=>e[Math.floor(w()*t)]),o=0;for(let i of n)i>o&&(o=i);return e.map(i=>i/o)}var z=({width:e,height:r},t,n,o,i)=>_(Te(et(e,r,n,Math.sqrt(e*e+r*r)*o,i),`blur(${t}px)`));function rt(e){let{width:r,height:t,seed:n,noiseSmoothness:o,tectonicSmoothness:i,noiseFactor:a,crustFactor:l,tectonicFactor:m,pangaea:f}=e;D=n;let p=r*t;console.time("noise");let c=z(e,o,3e3,.15,.03),h=z(e,i,2e3,.15,.03),x=z(e,i,2e3,.15,.03);console.timeEnd("noise"),console.time("main");let y=we(h,.5),M=h.map((v,g)=>(.2/(Math.abs(y-v)+.1)-.95)*(x[g]-.2)*2),u=h.map((v,g)=>5+c[g]*a+h[g]*l+M[g]*m+-f*(Math.abs(g/p-.5)+Math.abs(g%r/r-.5)));console.timeEnd("main"),console.time("normalize");for(let v=4;v--;)for(let g=r;g<u.length;g++)for(let P of[-2,2,-r*2,r*2])u[g]+=((u[g+P]||0)-u[g])*.15;let b=tt(u);return console.timeEnd("normalize"),{dryElevation:b,tectonic:M,p:e}}function re(e,r){return r??=rt(e),nt(e,r)}function nt(e,r){let{width:t,height:n,averageTemperature:o,erosion:i,riversShown:a,randomiseHumidity:l,noiseSmoothness:m,seaRatio:f,flatness:p,noiseSeed:c,elevationCold:h}=e;D=c;let x=z(e,m,3e3,.15,.01),{dryElevation:y,tectonic:M}=r,u=t*n,b=we(y,f),v=y.map((S,$)=>S<b?-Math.pow(1-S/b,.35):Math.pow((S-b)*(.5+M[$]*.5)/(1-b),1+2*p)),g=v.map((S,$)=>Math.cos((Math.abs(.5-$/u)*4+.85)*Math.PI)/(S<0?1:1+5*S*S));console.time("windSmoothing"),g=_(Te(q(g,t,S=>[0,0,0,127*(S+1)]),"blur(3px)")).map(S=>S*2-1),console.timeEnd("windSmoothing");let P=lt({width:t,height:n,elevation:v,tectonic:M,erosion:i,riversShown:a}),E=at({width:t,elevation:v,wind:g,steps:400});l&&(E=E.map((S,$)=>Math.max(0,S+Math.sin(x[$]*50)/10-v[$]*.2)));let O=v.map((S,$)=>o+25-100*Math.abs(.5-$/u)/(.7+.6*E[$])-Math.max(0,S)*h),k={tectonic:M,dryElevation:y,elevation:v,noise:x,rivers:P,wind:g,temperature:O,humidity:E,p:e,poi:[]};return k.biome=ot(k),k.photo=it(k),k}function ot(e){console.time("biome");let r=e.temperature.map((t,n)=>{if(e.elevation[n]<-0)return J;if(e.rivers[n])return B;let i=1+e.p.biomeScrambling*Math.sin(e.noise[n]*100),a=ke[~~H(0,5,e.humidity[n]*4.5*i)][~~H(0,3,t*i/10+1)];return e.elevation[n]>.4&&(a=oe),a});return console.timeEnd("biome"),r}function it(e){let{humidity:r,elevation:t,temperature:n,tectonic:o,noise:i,rivers:a,biome:l}=e,{width:m,shading:f}=e.p,p=[...r],c=[...r],h;console.time("photo");let x;function y(M,u){if(M)for(let b of[0,1,2])x[b]=te(x[b],M[b],u)}return h=[...r].map((M,u)=>{let b=t[u];if(b<0)return[-(b**2)*1e3+100,-(b**2)*500+150,-(b**2)*300+150,255];{x=[n[u]*15-M*700,150-M*150,n[u]*8-M*500,255],ve(x);let v=(b+o[u])*2-1;v>0&&y([64,0,0,255],Math.min(1.5,v**2));let g=(1+Math.sin((i[u]*3+o[u])*100))*(1+w());g=(Math.sin(i[u]*100)+.5)*g**2*.05,y([32,32,32],g),p[u]=0,a[u]&&(x=[0,100,150+50*a[u],255]);for(let P of[1,2,3])for(let E of[1,m,-1,-m,0])y(Pe[l[u+E*P]],.05);if(n[u]<0&&y([500,500,500],-n[u]*.03),ve(x),f){let P=0;for(let O=-2;O<=2;O++)for(let k=-2;k<=2;k++)P+=t[u+O+m*k]*(Math.sign(O)+Math.sign(k));let E=t[u+1+m]+t[u+m]+t[u+1]-b-t[u-m]-t[u-1]+P*.05;a[u]==0&&a[u+m]!=0&&(E-=.1),y([500,500,260],-E),c[u]=E}return x}}),console.timeEnd("photo"),h}function Ae(e,r,t=20){let n=e.length/r,o=q(e,r,(l,m)=>[0,0,0,l<=0?100:0]),i=G(r,n),a=i.ctx;return a.beginPath(),a.lineWidth=r/8,a.rect(0,0,r,n),a.stroke(),a.filter=`blur(${t}px)`,a.filter="opacity(50%)",a.drawImage(o,0,0),{humidityImage:o,wetness:i.canvas}}function at({width:e,elevation:r,wind:t,steps:n}){console.time("humidity");let o=r.length/e,i=Math.sqrt(e*e+o*o),{humidityImage:a,wetness:l}=Ae(r,e,10),m=i/10;for(let p=0;p<n;p++){let c=[p%100/100*e,p%10/10*o],h=t[N(c)],x=[c[0]+h*.3*e/8,c[1]+Math.abs(h)*.5*o/12];l.getContext("2d")?.drawImage(l,c[0],c[1],m,m,x[0],x[1],m,m)}U(a).filter="blur(30px)",U(a).drawImage(l,0,0,e,o,0,0,e,o);let f=_(a);return console.timeEnd("humidity"),f}function lt({width:e,height:r,elevation:t,erosion:n,riversShown:o}){console.time("rivers");let{wetness:i}=Ae(t,e,100),a=_(i),l=t.map((p,c)=>1-p-a[c]*.3),m=new Float32Array(e*r),f=Me(e,4)[0];for(let p=0;p<n+o;p++){let c=p*12345%t.length,h=[],x=1e3;for(;t[c]>-.1&&x-- >0;){p>n&&(m[c]+=1);let y=l[c],M=0,u=1e6;for(let b of f)l[c+b]<=u&&(M=c+b,u=l[M]);if(u<y){let b=(l[c]-u)*.01;for(let v of[0,0,-1,1,-e,e])t[c+v]-=b,l[c+v]-=b}else l[c]=u+.05;h.push(c),c=M}}for(let p in t)t[p]>-.2&&t[p]<0&&(t[p]=t[p]>-.1?.01:t[p]*2+.2),t[p]>0&&(t[p]*=1+w()*.1);return console.timeEnd("rivers"),m}function Re(e){let r=[];for(let t in e)r[t]=e[t];return r}function Le(e){let r=parseInt(e,16);return[Math.floor(r/256)*16,Math.floor(r/16)%16*16,r%16*16,256]}function q(e,r,t,n){let o=e.length/r,{canvas:i,ctx:a}=G(r,o),l=a.createImageData(r,o);if(!l.data||!e)debugger;for(let m=0;m<e.length;m++){let f=0,p=t?t(e[m],m)??0:[0,0,0,e[m]];l.data.set(p,m*4)}return a.putImageData(l,0,0),i}function Ee(e,r,t){let{canvas:n,ctx:o}=G(r,t);return o.drawImage(e,0,0,e.width,e.height,0,0,r,t),n}function st(e,r,t,n){let o={};for(let i of n??Object.keys(e)){o[i]=new Float32Array(e[i].length);let a=e[i],l=r[i];for(let m in a)o[i][m]=a[m]*(1-t)+l[m]*t}return o}function ne(e,r,t){console.time("blend");let n=st(e,r,t,["dryElevation","tectonic"]);console.timeEnd("blend"),console.time("blendGen");let o=re({...e.p,averageTemperature:e.p.averageTemperature+Math.sin(t*6.3)*20},n);return console.timeEnd("blendGen"),o}var F={},A={wpy:169,dm:.1,d:`=DEP
🏔️ ores
⬛ coal
🛢️ oil
💧 water
🗿 relic
=PLNT
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
🥄 food consumption
🔭 visibility range
🗑️ food spoilage
🎯 hunting bonus
🍲 food happiness
💗 happiness
⚗️ research focus
=WLD
🐾 animals
🍃 plants
🌾 cropss
=MOV
🏃 walk
⚓ swim
=CALAMITY
👹 goblin
☣️ taint
🌋 fracture`,st:"Foraging;Walking;Sticks",aka:{"🌾":"🍎"},rr:`=Land travel method
0Walk:>1🏃
0Ride:1🐴1🛷>4🏃0🐎0🐪
0Drive:1⚙️1⛽1🛷>10🏃
=Sea travel method
0Swim:>0.1⚓
0Sail:0.1👖1🛷>3⚓
0Boat:1⚙️1⛽1🛷>10⚓
=Jobs
0Forage:1🍃>3🍎
0Pick Sticks:1🍃>1🪵
1Axe:1🍃1🛠️.1🪨>3🪵
2Herd:10🍃>10🌾0🐂0🐗
2Farm:3🍃>5🌾
2Plantation:3🍃>3👖
0Hunt:1🐾>3🍎1👖
1Bow:3🐾1🏹>10🍎3👖
1Trap:2🐾1🛠️>5🍎2👖
0Fish:1🐠>10🍎
1Fishing nets:1🛠️1🐠>15🍎
3Whaling:1⚓1🛠️1🐋>30🍎
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
1Horses:3🍃>1🐴0🐎0🐪
2Metal Working:1🪵1🪨>3🛠️
4Rifles:1⚙️1⛽1🪨>3🏹
4Engines:3🛠️3🪨>1⚙️
3Alloys:1⚙️1⛽1🪨>3⛺
4Cars:1⚙️1⛽1🪨>1🛷
4Greenhouse:1⛺1⛽>15🍎
=Calamities
4Kill goblins:1🏹1👹>1📙
4Burn taint:1🛠️1⛽1☣️>1📙
4Close fracture:1⚙️1⛽1🌋>1📙
=Permanent bonuses
1Tame Dogs:.05🥄.2🎯1💗0🐺
1Tame Cats:.03🥄-.2🗑️1💗0🐅
1Pottery:-.2🗑️0🍎
2Conservation:-.3🗑️0🍎
2Cooking:-.1🗑️.5🍲0🍎
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
🌴:1.5🍎1.5🪵0.3🌾0.3🐴0.3👖`}},$e=1,ie=2,ae=3,le=4,se=5,me=6,j=7,pe=8,Fe=9,mt=10,ue=11,Ce=12,K=13,oe=14,pt=15,B=16,J=17,ke=[[ae,Ce,le,$e],[ae,se,ie,le],[ue,se,ie,pe],[ue,K,pe,j],[me,K,j,j],[me,K,j,Fe]],Pe=Re({[$e]:"fa0",[ie]:"4f4",[le]:"ff8",[ae]:"cca",[se]:"ad4",[me]:"064",[j]:"0a0",[pe]:"060",[Fe]:"084",[mt]:"880",[ue]:"fff",[Ce]:"caa",[K]:"0a6",[oe]:"884",[pt]:"ff0"}).map(Le);var He,V,Ne={};function Z(e){return~~(e.size*1e3*Math.sin(e.age*3.14)-e.taken)}function ut(e,r){let t=N(r),n=e.biome[t],o,i=1+w();if(n==B||n==J)o="🐠",n==B?i+=1:o="🐋";else{let l=e.noise[t+1e3]%.1;if(l<.01)o="🏔️";else if(l<.02)o=l%.01<.005?"⬛":"🛢️";else{let m=e.temperature[t]*.8+e.noise[t]*5+12,f=e.humidity[t]*10+e.noise[t]*5-5;l<.06?o=A.atc.split(",")[(f>0?5:0)+~~H(0,4,m/10)]:o=f<-.5?l%.01<.003&&m>0?"💧":"🗿":f<.2?"🌿":"🌲,🌲,🌳,🌳,🌴".split(",")[~~H(0,4,m/15)]}}return{at:r,kind:o,size:i,taken:0,age:w(),temp:e.temperature[t]}}function ct(e){let r=e.split(/([\d.-]+)/).filter(n=>n),t={};for(let n=0;n<r.length;n+=2)t[r[n+1]]=r[n];return t}var de={};function Ie(e,r=!1){let t;return Object.fromEntries(e.split(`
`).map(n=>{if(n[0]=="=")return t=n.slice(1),null;let o=Number(n[0]),i={},[a,...l]=n.slice(o>=0?1:0).split(/[:>]/);if(t&&(de[a]=t,t=void 0),!l)debugger;let[m,f]=l.map(ct).map(p=>{for(let c in p)!F.BNS[c]&&!F.WLD[c]&&(i[c]=1),p[c]==0&&delete p[c];return p}).filter(p=>p);return r?[a,m]:[a,{from:m,to:f,t:n,name:a,cost:o,bonus:i}]}).filter(n=>n))}function De(){let e;He=Object.fromEntries(A.d.split(`
`).map(r=>{if(r[0]=="=")e=r.slice(1),F[e]={};else{let[t,n]=r.split(" ");return F[e][t]=1,[t,n]}}).filter(r=>r));for(let r in A.m)Ne[r]=Ie(A.m[r],!0);V=Ie(A.rr)}function Ge(e){return{pop:100,store:Object.fromEntries(Object.keys(He).filter(t=>F.RES[t]||F.TLS[t]).map(t=>[t,0])),bonus:Object.fromEntries(Object.keys(F.BNS).map(t=>[t,0])),sel:new Set(["Walk","Swim"]),"🏃":"Walk","⚓":"Swim",date:0,seed:e,maps:[]}}function Be(){let e=s.store.food>0?0:-10;for(let r in s.store){let n=(s.store[r]/100)**.8;e+=n}return e}function je(e){delete s.store[s.deposit],s.home=e,s.deposit=e.kind,s.store[e.kind]=Z(e)}function Xe(e){console.time("populate");let r=[];e:for(let o=1e3;o--;){let i=[~~(w()*e.p.width),~~(w()*e.p.height)];for(let l of r)if(Q(l.at,i)<10)continue e;let a=ut(e,i);r.push(a)}let t=new Set(r.map(o=>o.kind)),n=[];for(let o of t){let i=r.filter(a=>a.kind==o);for(let a of[...i])for(let l of[...i])a!=l&&l.size&&a.size&&Q(a.at,l.at)<40&&(a.size+=l.size,l.size=0);n.push(...i.filter(a=>a.size))}return console.timeEnd("populate"),n}function X(e,r){let t=1e12;if(r!=null){let n=Object.values(e.to)[0];t=r/n}for(let n in e.from)t=Math.min(s.store[n]/e.from[n],t);return t}function dt({used:e,made:r}){for(let t in e)s.store[t]-=e[t],s.deposit==t&&s.home&&(s.home.taken+=e[t]);for(let t in r)s.store[t]=(s.store[t]||0)+r[t]}function ft(e){for(let r in{...e})e[r]||delete e[r];return e}function ce(e,r){let t={},n={};for(let o in e.from){let i=e.from[o]*r,a=F.TLS[o]?.1:1;t[o]=i*a}for(let o in e.to){let i=e.to[o]*r,a=A.aka[o]??o;n[a]=i}return{used:t,made:n}}function We(){let e=JSON.parse(JSON.stringify(V));for(let r of Object.values(e)){let t=Object.keys(A.m).find(n=>r.from[n]);if(t&&s.home){let n=Ne[t][s.home.kind];if(n){for(let o in r.to)n[o]&&(r.to[o]=r.to[o]*n[o]);r.from[s.home.kind]=r.from[t],delete r.from[t]}}}s.cr=e}var bt=["⚓","🏃"];function Ye(e){if(e){let r=s.cr[e];for(let n of bt)if(r.to[n]){let o=s[n];s.sel.delete(o),s.sel.add(r.name),s[n]=r.name;return}let t=X(r);if(t>0){t=Math.min(t,s.pop);let n=ce(r,t);dt(n),gt(t/s.pop)}}}function gt(e){s.date+=e/A.wpy,C()}function ze(e){let r=s.cr[e];return X(r)>0}function fe(e,r,t){if(!t)return[0,0];let n=Q(r.at,t.at),o=0,i=0;for(let a=0;a<n;a++){let l=Se(r.at,t.at,a/n),m=N(l);e.elevation[m]<0?o+=A.dm:i+=A.dm}return{"🏃":i,"⚓":o}}function Oe(e,r){return Object.fromEntries(Object.keys({...e,...r}).map(t=>[t,(e[t]||0)+(r[t]||0)]))}function be(){let e=s.pop;for(let r in s.store)s.deposit!=r&&(e+=s.store[r]*.1);return e}function Ue(e,r,t){let n=be(),o=fe(e,r,t),i=o["🏃"],a=o["⚓"],[l,m]=[V[s["🏃"]],V[s["⚓"]]];for(let y of[l,m])if(X(y)<n)return{fail:1};i*=n,a*=n;let[f,p]=[X(l,i),X(m,a)],c=ce(l,f),h=ce(m,p),x=Oe(c.made,h.made);if(x["🏃"]>=i-.1&&x["⚓"]>=a-.1){let y=Oe(c.used,h.used);return y.w=(f+p)/s.pop,ft(y)}else return{fail:2}}var I,W=[],R=[0,0],Qe,ge,T=1,Y,s,ht=["unknown","desert","grassland","tundra","savanna","shrubland","taiga","tropical forest","temperate forest","rain forest","swamp","snow","steppe","coniferous forest","mountain shrubland","beach","lake","ocean"],_e=[["seed","number"],["noiseSeed","number"],["width","number"],["height","number"],["noiseSmoothness","range",{max:10,step:.5}],["tectonicSmoothness","range",{max:10,step:.5}],["noiseFactor","range",{min:-5,max:20,step:.5}],["crustFactor","range",{min:-5,max:20,step:.5}],["tectonicFactor","range",{min:-1,max:10,step:.1}],["pangaea","range",{min:-5,max:5}],["seaRatio","range",{tip:"Sea percentage"}],["flatness","range"],["randomiseHumidity","checkbox"],["averageTemperature","range",{min:-30,max:50,step:1}],["elevationCold","range",{min:0,max:300,step:1}],["erosion","range",{max:1e5}],["riversShown","range",{max:1e3}],["biomeScrambling","range"],["squareGrid","checkbox"],["gameMapScale","range",{min:0,max:4,step:1}],["gameMapRivers","range",{max:5e4,step:1e3}],["discreteHeights","range",{max:40,step:1}]],qe={mapMode:0,seed:1,width:640,height:640,scale:1,noiseFactor:10,crustFactor:6,tectonicFactor:3,noiseSmoothness:2,tectonicSmoothness:5,pangaea:0,seaRatio:.55,flatness:.5,randomiseHumidity:0,averageTemperature:15,erosion:5e4,riversShown:400,biomeScrambling:0,terrainTypeColoring:0,discreteHeights:0,hillRatio:.12,mountainRatio:.04,gameMapRivers:15e3,gameMapScale:2,generatePhoto:1,squareGrid:0,noiseSeed:0,elevationCold:0,shading:!0},d={};function xt(){if(De(),document.location.hash){d={};let e=document.location.hash.substr(1).split("&").map(r=>r.split("="));console.log(e);for(let r of e)d[r[0]]=r[1]=="false"?!1:r[1]=="true"?!0:Number(r[1]);console.log(d)}(!d||!d.width)&&(d=JSON.parse(localStorage.mapGenSettings)),(!d||!d.width)&&(d={...qe}),Je(),ye(),s=Ge(d.seed),I=xe(0,d),s.poi=Xe(I),Ke(),C()}document.addEventListener("mousedown",e=>{Ye(e.target.dataset.rec),C()});function ye(){for(let[e,r]of _e){if(r=="tip")continue;let t=document.getElementById(e);d[e]=t.type=="checkbox"?t.checked?1:0:Number(t.value);let n=document.getElementById(e+"_value");n&&(n.innerText=String(d[e]).substr(0,8))}yt()}window.onload=xt;window.applySettings=ye;document.body.addEventListener("mousedown",e=>{switch(e.target?.id){case"resetSettings":d={...qe},Je(),ye();return}});blendMaps.onchange=e=>{let r=Number(blendMaps.value);W.length>=2&&(I=ne(W[W.length-2],W[W.length-1],r),Ke())};var he={};function Je(){let e=document.getElementById("form");e.innerHTML="";for(let r of _e){let[t,n,o]=r;switch(o=o||{},he[t]=o.tip,n){case"tip":e.innerHTML+=`<div class="tip">${t}</div>`;break;case"checkbox":e.innerHTML+=`<div>${t}</div><input class="checkbox" type="checkbox" id="${t}" ${d[t]?"checked":""} />`;break;case"number":e.innerHTML+=`<div>${t}</div><input class="number" type="number" id="${t}" value="${d[t]}" />`;break;case"range":let i=o.min||0,a=o.max||1,l=o.step||(a-i)/100;e.innerHTML+=`<div>${t}</div><input class="range" type="range" id="${t}" min="${i}" max="${a}" step="${l}" value="${d[t]}"/>
        <div id="${t}_value"></div>
        `;break}}}function yt(){document.location.hash=Object.keys(d).map(e=>`${e}=${d[e]}`).join("&"),localStorage.mapGenSettings=JSON.stringify(d)}var L;function Mt(e,r,t,n=1/4,o){L=q(e,d.width,t,o);let a=Ee(L,L.width*n,L.height*n).getContext("2d");return a.font="14px Verdana",a.fillStyle="#fff",a.strokeText(r,5,15),a.fillText(r,4,14),main.appendChild(L),main.style.width=`${d.width*devicePixelRatio}px`,main.style.height=`${d.height*devicePixelRatio}px`,L=L,L}function vt(e){let r=N(e);tooltip.style.left=`${Math.min(window.innerWidth-300,ge[0]+20)}`,tooltip.style.top=`${Math.min(window.innerHeight-300,ge[1]-40)}`,tooltip.style.display="grid",tooltip.innerHTML=Object.keys(I).map(t=>{let n=I[t][r];return`<div>${t}</div><div>${t=="photo"?n?.map(o=>~~o):t=="biome"?n+" "+ht[n]?.toUpperCase():~~(n*1e6)/1e6}</div>`}).join(""),Y&&(tooltip.innerHTML+=`${Y.kind} ${~~Z(Y)}`)}document.onmousemove=e=>{let r=[e.movementX,e.movementY];ge=[e.screenX,e.screenY],e.target==L&&e.buttons&&(R[0]+=r[0]*devicePixelRatio,R[1]+=r[1]*devicePixelRatio,C());let t=e.target,n=t.tagName=="CANVAS",o=t.id;n||t.classList.contains("poi")?(Qe=[e.offsetX/t.width*d.width/devicePixelRatio,e.offsetY/t.height*d.height/devicePixelRatio],vt(Qe)):he[o]?tooltip.innerHTML=he[o]:tooltip.style.display="none"};main.onwheel=e=>{let r=T;T+=(e.deltaY>0?-1:1)*1/8,T=T<0?0:T,console.log(T,R);let t=d.width/2;R[0]=(R[0]-t)*2**(T-r)+t,R[1]=(R[1]-t)*2**(T-r)+t,e.preventDefault(),e.stopPropagation(),C()};function St(e){let r=s.poi[e],t=fe(I,r,s.home),n=Ue(I,r,s.home);return`<div class=poi id=poi${e}>
${r.kind}<center style=color:rgb(${15*r.temp-400},50,${-20*r.temp+100})>${~~Z(r)}
${!s.home||r==s.home?"":`<br/>${ee(t)}<br/>${ee(n)}`}</center>
</div>`}function Ke(){console.time("draw"),L&&main.removeChild(L),Mt(I.photo,"photo",e=>e,void 0,e=>Math.max(1,~~(I.elevation[e]*20)*2)),console.timeEnd("draw"),C()}window.poiOver=e=>{console.log(e)};function Ve(e){return parseFloat(Number(e).toFixed(2))}function ee(e){return e?Object.keys(e).map(r=>`${Ve(e[r])}${r}`).join(" "):""}function C(){if(!s)return;L.style.transform=`translate(${R[0]}px, ${R[1]}px) scale(${2**T})`;let e="";for(let n in s.poi)e+=St(n);ps.innerHTML=e;let r=d.width/2;for(let n in s.poi){let o=s.poi[n],i=document.querySelector(`#poi${n}`);if(i){let a=(o.size**.5*3+4)*2**T;i.style.left=`${o.at[0]*devicePixelRatio*2**T+R[0]-a/2}px`,i.style.top=`${o.at[1]*devicePixelRatio*2**T+R[1]-a/2}px`,i.style.fontSize=`${a}px`,i.dataset.cur=o==s.home,i.onmouseover=()=>{Y=o},i.onmouseleave=()=>{Y=void 0},i.onmousedown=()=>{je(o),C(),R[0]=(-o.at[0]*2**T+r)*devicePixelRatio,R[1]=(-o.at[1]*2**T+r)*devicePixelRatio}}}We(),s.bonus["💗"]=Be();let t={"👨‍👩‍👦‍👦":s.pop,"🏋":be(),"📅":Ve(s.date*A.wpy),...s.bonus,...s.store};recdiv.innerHTML="<div id=res>"+Object.keys(t).map(n=>[n,~~t[n]]).map(n=>`<span onmousedown="give('${n[0]}')">${n.join("<br/>")}</span>`).join("")+"</div>"+Object.values(s.cr).map(n=>{let o=ee(n.to),i=de[n.name],a=n.cost==0;return(i?`<div>${i}</div>`:"")+`<button data-sel=${s.sel.has(n.name)} data-rec="${n.name}" data-use="${a&&ze(n.name)}" >
${a?"":"<div class=un>UNKNOWN</div>"}
${`<div class=r><div>${n.name}</div><div>${n.cost}⚗️↩${Object.keys(n.bonus)}</div></div>
<span class=rec>${ee(n.from)}${o?"🡢 "+o:""}</span>`}
</button>`}).join("")}window.give=e=>{s.store[e]+=100,C()};function xe(e){let r=~~e;if(r!=e&&(e=r+~~(e%1*13)/13),s.maps[e])return s.maps[e];if(r==e)return s.maps[e]=re({...d,seed:s.seed+e}),s.maps[e];let[t,n]=[xe(r,d),xe(r+1,d)],o=ne(t,n,e-r);return console.timeEnd("generation total"),o}})();
