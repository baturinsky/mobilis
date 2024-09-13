"use strict";(()=>{function Oe(e,t){let o;switch(t){case 0:return o=[[0,-1],[1,0],[0,1],[-1,0]].map(([n,a])=>a*e+n),[o,o];case 4:return o=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]].map(([n,a])=>a*e+n),[o,o];case 1:return[[[0,-1],[1,0],[0,1],[-1,1],[-1,0],[-1,-1]],[[1,-1],[1,0],[1,1],[0,1],[-1,0],[0,-1]]].map(n=>n.map(([a,s])=>s*e+a));case 2:return o=[[1,-1],[2,0],[1,1],[-1,1],[-2,0],[-1,-1]].map(([n,a])=>a*e+n),[o,o];case 3:return o=[[0,-1],[1,0],[1,1],[0,1],[-1,0],[-1,-1]].map(([n,a])=>a*e+n),[o,o]}}function ue(e,t,o){return e*(1-o)+t*o}function B(e,t,o){return o<e?e:o>t?t:o}function Be(e){for(let t of[0,1,2])e[t]=B(0,255,e[t])}var U=6;function te(e,t){return((e[0]-t[0])**2+(e[1]-t[1])**2)**.5}function Ie(e,t,o){return[ue(e[0],t[0],o),ue(e[1],t[1],o)]}function w(){let e=Math.sin(U)*1e4;return U=(U+Math.E)%1e8,e-Math.floor(e)}function G([e,t],o=k.width){return~~e+~~t*o}function ee(e){return e.getContext("2d")}function K(e,t){let o=document.createElement("canvas");o.width=e,o.height=t,o.style.width=`${o.width*devicePixelRatio}px`,o.style.height=`${o.height*devicePixelRatio}px`;let n=ee(o);return{canvas:o,ctx:n}}function oe(e){let n=ee(e).getImageData(0,0,e.width,e.height).data,a=new Float32Array(n.length/4);for(let s=0;s<n.length;s++)a[s]=n[s*4+3]/255;return a}function pt(e,t,o=5e3,n=100,a=.01,s=!0){let{canvas:i,ctx:l}=K(e,t);if(s){let p=l.createRadialGradient(0,0,0,0,0,1);p.addColorStop(0,`rgba(255, 255, 255, ${a})`),p.addColorStop(1,"rgba(255, 255, 255, 0)"),l.fillStyle=p}else l.fillStyle=`rgba(255, 255, 255, ${a})`;for(let p=0;p<o;p++){let d=[...Array(3)].map(()=>w()),[u,c]=[d[0]*e,d[1]*t],b=Math.pow(d[2],2)*n;l.save(),l.translate(u,c),l.rotate(w()*Math.PI),l.scale(b*(.5+w()),b*(.5+w())),l.beginPath(),l.arc(0,0,1,0,Math.PI*2),l.fill(),l.restore()}return i}function We(e,t){let{canvas:o,ctx:n}=K(e.width,e.height);return n.filter=t,n.drawImage(e,0,0),o}function De(e,t=.5,o=1e3){if(!e)debugger;let n=e.length,a=[...Array(o)].map(()=>e[Math.floor(w()*n)]);return a=a.sort(),a[Math.floor(t*a.length)]}function ct(e,t=1e3){let o=e.length,n=[...Array(t)].map(()=>e[Math.floor(w()*o)]),a=0;for(let s of n)s>a&&(a=s);return e.map(s=>s/a)}var Z=({width:e,height:t},o,n,a,s)=>oe(We(pt(e,t,n,Math.sqrt(e*e+t*t)*a,s),`blur(${o}px)`));function mt(e){let{width:t,height:o,seed:n,noiseSmoothness:a,tectonicSmoothness:s,noiseFactor:i,crustFactor:l,tectonicFactor:p,pangaea:d}=e;U=n;let u=t*o;console.time("noise");let c=Z(e,a,3e3,.15,.03),b=Z(e,s,2e3,.15,.03),f=Z(e,s,2e3,.15,.03);console.timeEnd("noise"),console.time("main");let h=De(b,.5),y=b.map((M,v)=>(.2/(Math.abs(h-M)+.1)-.95)*(f[v]-.2)*2),m=b.map((M,v)=>5+c[v]*i+b[v]*l+y[v]*p+-d*(Math.abs(v/u-.5)+Math.abs(v%t/t-.5)));console.timeEnd("main"),console.time("normalize");for(let M=4;M--;)for(let v=t;v<m.length;v++)for(let F of[-2,2,-t*2,t*2])m[v]+=((m[v+F]||0)-m[v])*.15;let x=ct(m);return console.timeEnd("normalize"),{dryElevation:x,tectonic:y,p:e}}function de(e,t){console.time("generateMap"),t??=mt(e);let o=ut(e,t);return console.timeEnd("generateMap"),o}function ut(e,t){let{width:o,height:n,averageTemperature:a,erosion:s,riversShown:i,randomiseHumidity:l,noiseSmoothness:p,seaRatio:d,flatness:u,noiseSeed:c,elevationCold:b}=e;U=c;let f=Z(e,p,3e3,.15,.01),{dryElevation:h,tectonic:y}=t,m=o*n,x=De(h,d),M=h.map((S,H)=>S<x?-Math.pow(1-S/x,.35):Math.pow((S-x)*(.5+y[H]*.5)/(1-x),1+2*u)),v=M.map((S,H)=>Math.cos((Math.abs(.5-H/m)*4+.85)*Math.PI)/(S<0?1:1+5*S*S));console.time("windSmoothing"),v=oe(We(ne(v,o,S=>[0,0,0,127*(S+1)]),"blur(3px)")).map(S=>S*2-1),console.timeEnd("windSmoothing");let F=gt({width:o,height:n,elevation:M,tectonic:y,erosion:s,riversShown:i}),C=ht({width:o,elevation:M,wind:v,steps:400});l&&(C=C.map((S,H)=>Math.max(0,S+Math.sin(f[H]*50)/10-M[H]*.2)));let D=M.map((S,H)=>a+25-100*Math.abs(.5-H/m)/(.7+.6*C[H])-Math.max(0,S)*b),P={tectonic:y,dryElevation:h,elevation:M,noise:f,rivers:F,wind:v,temperature:D,humidity:C,p:e,poi:[]};return P.biome=dt(P),P.photo=ft(P),P}function dt(e){console.time("biome");let t=e.temperature.map((o,n)=>{if(e.elevation[n]<-0)return re;if(e.rivers[n])return Q;let s=1+e.p.biomeScrambling*Math.sin(e.noise[n]*100),i=ze[~~B(0,5,e.humidity[n]*4.5*s)][~~B(0,3,o*s/10+1)];return e.elevation[n]>.4&&(i=fe),i});return console.timeEnd("biome"),t}function ft(e){let{humidity:t,elevation:o,temperature:n,tectonic:a,noise:s,rivers:i,biome:l}=e,{width:p,shading:d}=e.p,u=[...t],c=[...t],b;console.time("photo");let f;function h(y,m){if(y)for(let x of[0,1,2])f[x]=ue(f[x],y[x],m)}return b=[...t].map((y,m)=>{let x=o[m];if(x<0)return[-(x**2)*1e3+100,-(x**2)*500+150,-(x**2)*300+150,255];{f=[n[m]*15-y*700,150-y*150,n[m]*8-y*500,255],Be(f);let M=(x+a[m])*2-1;M>0&&h([64,0,0,255],Math.min(1.5,M**2));let v=(1+Math.sin((s[m]*3+a[m])*100))*(1+w());v=(Math.sin(s[m]*100)+.5)*v**2*.05,h([32,32,32],v),u[m]=0,i[m]&&(f=[0,100,150+50*i[m],255]);for(let F of[1,2,3])for(let C of[1,p,-1,-p,0])h(Ue[l[m+C*F]],.05);if(n[m]<0&&h([500,500,500],-n[m]*.03),Be(f),d){let F=0;for(let D=-2;D<=2;D++)for(let P=-2;P<=2;P++)F+=o[m+D+p*P]*(Math.sign(D)+Math.sign(P));let C=o[m+1+p]+o[m+p]+o[m+1]-x-o[m-p]-o[m-1]+F*.05;i[m]==0&&i[m+p]!=0&&(C-=.1),h([500,500,260],-C),c[m]=C}return f}}),console.timeEnd("photo"),b}function Ge(e,t,o=20){let n=e.length/t,a=ne(e,t,(l,p)=>[0,0,0,l<=0?100:0]),s=K(t,n),i=s.ctx;return i.beginPath(),i.lineWidth=t/8,i.rect(0,0,t,n),i.stroke(),i.filter=`blur(${o}px)`,i.filter="opacity(50%)",i.drawImage(a,0,0),{humidityImage:a,wetness:s.canvas}}function ht({width:e,elevation:t,wind:o,steps:n}){console.time("humidity");let a=t.length/e,s=Math.sqrt(e*e+a*a),{humidityImage:i,wetness:l}=Ge(t,e,10),p=s/10;for(let u=0;u<n;u++){let c=[u%100/100*e,u%10/10*a],b=o[G(c)],f=[c[0]+b*.3*e/8,c[1]+Math.abs(b)*.5*a/12];l.getContext("2d")?.drawImage(l,c[0],c[1],p,p,f[0],f[1],p,p)}ee(i).filter="blur(30px)",ee(i).drawImage(l,0,0,e,a,0,0,e,a);let d=oe(i);return console.timeEnd("humidity"),d}function gt({width:e,height:t,elevation:o,erosion:n,riversShown:a}){console.time("rivers");let{wetness:s}=Ge(o,e,100),i=oe(s),l=o.map((u,c)=>1-u-i[c]*.3),p=new Float32Array(e*t),d=Oe(e,4)[0];for(let u=0;u<n+a;u++){let c=u*12345%o.length,b=[],f=1e3;for(;o[c]>-.1&&f-- >0;){u>n&&(p[c]+=1);let h=l[c],y=0,m=1e6;for(let x of d)l[c+x]<=m&&(y=c+x,m=l[y]);if(m<h){let x=(l[c]-m)*.01;for(let M of[0,0,-1,1,-e,e])o[c+M]-=x,l[c+M]-=x}else l[c]=m+.05;b.push(c),c=y}}for(let u in o)o[u]>-.2&&o[u]<0&&(o[u]=o[u]>-.1?.01:o[u]*2+.2),o[u]>0&&(o[u]*=1+w()*.1);return console.timeEnd("rivers"),p}function Ne(e){let t=[];for(let o in e)t[o]=e[o];return t}function je(e){let t=parseInt(e,16);return[Math.floor(t/256)*16,Math.floor(t/16)%16*16,t%16*16,256]}function ne(e,t,o,n){let a=e.length/t,{canvas:s,ctx:i}=K(t,a),l=i.createImageData(t,a);if(!l.data||!e)debugger;for(let p=0;p<e.length;p++){let d=0,u=o?o(e[p],p)??0:[0,0,0,e[p]];l.data.set(u,p*4)}return i.putImageData(l,0,0),s}function Xe(e,t,o){let{canvas:n,ctx:a}=K(t,o);return a.drawImage(e,0,0,e.width,e.height,0,0,t,o),n}function bt(e,t,o,n){let a={};for(let s of n??Object.keys(e)){a[s]=new Float32Array(e[s].length);let i=e[s],l=t[s];for(let p in i)a[s][p]=i[p]*(1-o)+l[p]*o}return a}function Ye(e,t,o){console.time("blend");let n=bt(e,t,o,["dryElevation","tectonic"]);console.timeEnd("blend"),console.time("blendGen");let a=e.p.averageTemperature+Math.sin(o*Math.PI*2)*20,s=de({...e.p,averageTemperature:a},n);return console.timeEnd("blendGen"),s}var O={},g={lrm:.1,abw:.02,rpb:.1,rpbf:1,popspd:.01,psz:1e3,blnd:13,pois:300,rspd:1,amrt:.01,rcst:[100,100,300,1e3,3e3],wpy:169,dm:.1,d:`=DEP
🏔️ Ores|Make metal of them
⬛ Coal|Simple fuel
🛢️ Oil|Advanced fuel
💧 Oasis|Small patch of arable land in the desert
🗿 Relic|Knowledge of civilization lost to Calamities
=PLN
🌿 Grasslans|Best for farming and herding
🌲 Taiga|Place for Woodcutting and gathering
🌳 Forest|Place for Woodcutting and gathering
🌴 Jungles|Place for Woodcutting and gathering
=ANM
🐏 ram
🐂 Yak|Can be domesticated (as cattle)
🐎 Mustang|Can be tamed
🐪 Camel|Can be tamed (as horses)
🐺 Wolves|Can be tamed (as dogs)
🐗 Hogs|Can be domesticated (as cattle)
🐅 Tigers|Can betamed (as cats)
🐠 Fish
🐋 Whale
=RES
👖 Fabric|To sew things or replace sails
🪵 Wood|The simples building materials
🍎 Food|Meat, fish,fruits and crops
⛽ Fuel|Coal, oil or even firewood
📙 Book|Have them to advance research
=TLS
🛠️ Tools|Crafting instruments
⛺ Housing|Things to live in
🛷 Wagons|Can be converted to travel on land or sea
🐴 Horses|Pull wagons
⚙️ Engines|Can be used on wagons or machines
🏹 Weapons|From bows to guns and armors
=BNS
💕 Happiness bonus|Increases all happiness
🥄 Food consumption|Change food eaten per pop
🔭 Visibility range|How much map you see (without cheating)
🗑️ Food spoilage|How fast food spoils
🍲 Food happiness|Bonus to happinsess from food reserves
🎯 Hunting bonus|Bonus for interacting with wild animals
⚗️ Research focus|Press ⚗️ on topic to keep researching it with 📙
=WLD
🐾 Animals|Can be hunted or caught
🍃 Plants|Can be harvested
🌾 Crops|Result of Farming. Converted to 🍎Food
=MOV
🏃 Walk|Movement speed on land
⚓ Swim|Movement speed on sea
=CAL
👹 Goblin|Appear often on 13th month and on 13th year
☣️ Taint|Appear often on 13th month and on 13th year
🌋 Fracture|Appear often on 13th month and on 13th year
=MSC
💗 Happiness|increases from having various stuff in stock, grows population
📅 Week|1/13 of a month, 1/169 of a year
👨‍👩‍👦‍👦 Pop|Do work, eat food
🏋 Weight|Slows you down. Each item in store weight 1/10 of pop
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
1Trap:2🐾1🛠️>2🍎2👖2🐴!0🐾0🛠️
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
1Cooking:-.1🗑️-.1🥄.5🍲0🍎
1Mapmaking:.2🔭0🏃
2Astronomy:.2🔭0🏃
3Compass:.2🔭0🏃
4Optics:.2🔭0🏃
1Science:1⚗️0📙`,atc:"🐏,🐂,🐂,🐎,🐪,🐏,🐺,🐗,🐗,🐅",sm:{"🐏":.3,"💧":.3,"🗿":.3},m:{"🐾":`🐏:1🍎3👖
🐂:3🍎1👖0🐴
🐎:2🍎1👖0.5🐴
🐪:1🍎1👖0.3🐴
🐺:1🍎1👖0🐴
🐗:4🍎1👖0🐴
🐅:1🍎2👖0🐴
`,"🍃":`🌿:2.5🍎0.5🪵1🌾1🐴1👖
🌲:1🍎2🪵0.3🌾0.35🐴0.3👖
🌳:2🍎1🪵0.5🌾0.5🐴0.3👖
🌴:1.5🍎1.5🪵0.3🌾0.3🐴0.3👖
💧:1🍎0.3🪵0.5🌾0.5🐴1👖`}},Ke=1,he=2,ge=3,be=4,ye=5,xe=6,J=7,ve=8,Qe=9,yt=10,Me=11,Je=12,ae=13,fe=14,xt=15,Q=16,re=17,ze=[[ge,Je,be,Ke],[ge,ye,he,be],[Me,ye,he,ve],[Me,ae,ve,J],[xe,ae,J,J],[xe,ae,J,Qe]],Ue=Ne({[Ke]:"fa0",[he]:"4f4",[be]:"ff8",[ge]:"cca",[ye]:"ad4",[xe]:"064",[J]:"0a0",[ve]:"060",[Qe]:"084",[yt]:"880",[Me]:"fff",[Je]:"caa",[ae]:"0a6",[fe]:"884",[xt]:"ff0"}).map(je);var N,E,Se={},X=[],Y;function W(e){return Math.max(0,~~(e.size*g.psz*Math.sin(B(0,1,e.age)*3.14)-e.taken))}function qe(e,t,o){let n=[~~(w()*e.p.width),~~(w()*e.p.height)],a=w();for(let c of t)if(te(c.at,n)<10)return;let s=G(n),i=e.biome[s],l,p=!1,d=1+w();if(i==Q||i==re)l="🐠",i==Q?d+=1:l="🐋";else{let c=e.noise[s+500]%.1,b=r.date%1>=12/13||r.date%13>=12;if(c<(b?.01:.001)*r.date){let f=Object.keys(O.CAL);l=f[~~(w()*f.length)],p=!0}else{let f=e.noise[s+1e3]%.1;if(f<.01)l="🏔️";else if(f<.02)l=f%.01<.005?"⬛":"🛢️";else{let h=e.temperature[s]*.8+e.noise[s]*5+12,y=e.humidity[s]*10+e.noise[s]*5-5;f<.06?l=g.atc.split(",")[(y>0?5:0)+~~B(0,4,h/10)]:l=y<-.5?f%.01<.003&&h>0?"💧":"🗿":y<.2?"🌿":"🌲,🌲,🌳,🌳,🌴".split(",")[~~B(0,4,h/15)]}}g.sm[l]&&(d*=g.sm[l])}let u={id:a,at:n,kind:l,size:d,taken:0,age:w(),temp:e.temperature[s],ageByWeek:(w()+.5)*g.abw*(p?10:1)};return t.push(u),u}function vt(e){let t=e.split(/([\d.-]+)/).filter(n=>n),o={};for(let n=0;n<t.length;n+=2)o[t[n+1]]=t[n];return o}var Ae={};function Ve(e,t=!1){let o;return Object.fromEntries(e.split(`
`).map(n=>{if(n[0]=="=")return o=n.slice(1),null;let a=Number(n[0]),s={},[i,...l]=n.slice(a>=0?1:0).split(/[:>\!]/);if(o&&(Ae[i]=o,o=void 0),!l)debugger;let[p,d,u]=l.map(vt).map((c,b)=>{let f=l.length<=2||b==2;for(let h in c){if(!O.BNS[h]&&f)if(g.aka[h])s[g.aka[h]]=1;else if(g.m[h])for(let y in Se[h])s[y]=1;else s[h]=1;c[h]==0&&delete c[h]}return c}).filter(c=>c);return t?[i,p]:[i,{from:p,to:d,t:n,name:i,cost:a,research:s,isBonus:!d}]}).filter(n=>n))}function Ze(){let e;N=Object.fromEntries(g.d.split(`
`).map(t=>{if(t[0]=="=")e=t.slice(1),O[e]={};else{let[o,...n]=t.split(" ");return O[e][o]=1,[o,n.join(" ")]}}).filter(t=>t));for(let t in g.m)Se[t]=Ve(g.m[t],!0);E=Ve(g.rr),console.log(N)}function et(e){let t={pop:100,store:Object.fromEntries(Object.keys(N).filter(o=>O.RES[o]||O.TLS[o]).map(o=>[o,0])),bonus:Object.fromEntries(Object.keys(O.BNS).map(o=>[o,0])),sel:{Walk:1,Swim:1},"🏃":"Walk","⚓":"Swim",date:0,seed:e,tech:{},research:{}};t.poi=[];for(let o in E)t.tech[o]=E[o].cost==0?1:0,t.research[o]=0;return t}function Re(){let t=r.store["🍎"]>0?0:-r.pop;for(let o in r.store){let a=r.store[o]**.75;o=="🍎"&&(a=2*ie(t,"🍲")),t+=a}return t=ie(t,"💕"),t}function ie(e,t){return rt(r.bonus[t])*e}function tt(e){if(delete r.store[r.deposit],r.home){let t=pe(R,e,r.home);le(t.w),delete t.w;for(let o in t)r.store[o]-=t[o]}r.home=e,r.deposit=e.kind,r.store[e.kind]=W(e),$e()}function ke(e){me(z(r.date)),console.time("populate");let t=g.pois-e.length;for(let o=0;o<t*4;o++)qe(R,e);Mt(R,e),r.home&&(r.store[r.home.kind]=W(r.home)),console.timeEnd("populate")}function Mt(e,t){let o=new Set(t.map(a=>a.kind)),n=[];for(let a of o){let s=t.filter(i=>i.kind==a);for(let i of[...s])for(let l of[...s])r&&(r.home==i||r.home==l)||i!=l&&l.size&&i.size&&te(i.at,l.at)<40&&(i.size+=l.size,i.age=(i.age+l.age)/2,i.ageByWeek=(i.ageByWeek+l.ageByWeek)/2,l.size=0);n.push(...s.filter(i=>i.size))}return t.splice(0,1e9,...n)}function V(e,t){let o=1e12;if(t!=null){let n=Object.values(e.to)[0];o=t/n}for(let n in e.from)o=Math.min(r.store[n]/e.from[n],o);return o}function wt({used:e,made:t}){I(j(e)+"🡢"+j(t));for(let o in e)r.deposit==o&&r.home?(r.home.taken+=e[o],r.store[o]=W(r.home)):r.store[o]-=e[o];for(let o in t)r.store[o]=(r.store[o]||0)+t[o]}function Tt(e){for(let t in{...e})e[t]||delete e[t];return e}function Te(e,t){let o={},n={};for(let a in e.from){let s=e.from[a]*t,i=O.TLS[a]?.1:1;o[a]=s*i}for(let a in e.to){let s=e.to[a]*t,i=g.aka[a]??a;n[i]=s}return{used:o,made:n}}function Le(){let e=JSON.parse(JSON.stringify(E));for(let t of Object.values(e)){let o=Object.keys(g.m).find(n=>t.from[n]);if(o&&r.home){let n=Se[o][r.home.kind];if(n){let a=1;o=="🐾"&&(a=ie(1,"🎯"));for(let s in t.to)n[s]&&(t.to[s]=t.to[s]*n[s]*a);t.from[r.home.kind]=t.from[o],delete t.from[o]}}for(let n in t.to){let a=1;r.tech[t.name]>0&&(a*=1+.1*(r.tech[t.name]-1)),t.to[n]*=a}}Y=e}var St=["⚓","🏃"];function ot(e){if(!e||!r.tech[e])return;let t=Y[e];if(!t.to)return;for(let n of St)if(t.to[n]){let a=r[n];delete r.sel[a],r.sel[t.name]=1,r[n]=t.name;return}let o=V(t);if(o>0){o=Math.min(o,r.pop);let n=Te(t,o);wt(n),le(o/r.pop)}}function se(){return~~(r.date*g.wpy)}function le(e=1){let t=se();for(r.date+=e/g.wpy;t<se();)t++,At();$(),window.save(0)}function At(){let e=r.pop*(1+r.bonus["🥄"])*.1;if(r.store["🍎"]-=e,r.store["🍎"]<0){let s=r.store["🍎"]*.1;r.pop+=s,r.store["🍎"]=0,I(`<red>🍎hungry! ${ce(s)}👨‍👩‍👦‍👦</red>`)}let t=g.popspd,o=B(-r.pop*t,r.pop*t,(Re()-r.pop)*t);console.log({dHappiness:o}),r.pop+=o;for(let s in r.store){let i=Object.values(Y).filter(p=>p.research[s]),l=r.store[s]**.8/i.length*g.rspd;s==r.deposit&&(l*=g.lrm);for(let p of i)we(p.name,l);if(s!=r.deposit){let p=g.amrt;s=="🍎"&&(p=2*ie(p,"🗑️")),r.store[s]*=1-p}}let n=r.bonus["⚗️"],a=r.store["📙"]**.9*Math.max(1,n);for(let s in E)we(s,a*g.rpb);r.focus&&we(r.focus,a*g.rpbf*n);for(let s of[...r.poi])if(s.age+=s.ageByWeek,(s.age>1||W(s)<=0)&&r.home!=s){r.poi.splice(r.poi.indexOf(s),1);let i;do i=qe(R,r.poi,r.date);while(!i)}Ee(),ke(r.poi)}function Ee(){for(let e in r.bonus)r.bonus[e]=0;for(let e of Object.values(E))if(!e.to&&r.tech[e.name]>0)for(let t in e.from)r.bonus[t]+=e.from[t]*(.9+.1*r.tech[e.name])}function we(e,t){r.research[e]+=t;let o=Ce(e);if(r.research[e]>o){r.tech[e]++,r.research[e]=0;let n=r.tech[e];I(n>1?`${e} advanced to level ${n}`:`${e} researched`)}}function Ce(e){return g.rcst[E[e].cost]*2**r.tech[e]}function nt(e){let t=Y[e];return V(t)>0}function Rt(e,t,o){if(!o)return[0,0];let n=te(t.at,o.at),a=0,s=0;for(let i=0;i<n;i++){let l=Ie(t.at,o.at,i/n),p=G(l);e.elevation[p]<0?a+=g.dm:s+=g.dm}return{"🏃":s,"⚓":a}}function _e(e,t){return Object.fromEntries(Object.keys({...e,...t}).map(o=>[o,(e[o]||0)+(t[o]||0)]))}function Pe(){let e=r.pop;for(let t in r.store)r.deposit!=t&&(e+=r.store[t]*.1);return e}function pe(e,t,o){let n=Pe(),a=Rt(e,t,o),s=a["🏃"],i=a["⚓"],[l,p]=[E[r["🏃"]],E[r["⚓"]]];for(let h of[l,p])if(V(h)<n)return{fail:1};s*=n,i*=n;let[d,u]=[V(l,s),V(p,i)],c=Te(l,d),b=Te(p,u),f=_e(c.made,b.made);if(f["🏃"]>=s-.1&&f["⚓"]>=i-.1){let h=_e(c.used,b.used);return h.w=(d+u)/r.pop,Tt(h)}else return{fail:2}}function rt(e){return e>0?1+e:1/(1-e)}console.log("SM",rt(.5));var R;var A=[0,0],at,Fe,T=1,q,r,_=[];function I(e){_.push(e)}var kt=["unknown","desert","grassland","tundra","savanna","shrubland","taiga","tropical forest","temperate forest","rain forest","swamp","snow","steppe","coniferous forest","mountain shrubland","beach","lake","ocean"],k={seed:7,width:700,height:700,scale:1,noiseFactor:11.5,crustFactor:5.5,tectonicFactor:2.9,noiseSmoothness:1,tectonicSmoothness:8.5,pangaea:0,seaRatio:.55,flatness:.09,randomiseHumidity:0,averageTemperature:19,erosion:1e4,riversShown:150,biomeScrambling:.24,terrainTypeColoring:0,discreteHeights:0,hillRatio:.12,mountainRatio:.04,gameMapRivers:15e3,gameMapScale:2,generatePhoto:1,squareGrid:0,generateTileMap:0,noiseSeed:1,elevationCold:53,shading:1};function Lt(){Ze(),r=et(k.seed),Ee(),ke(r.poi),He(),$()}document.onkeydown=e=>{function t(){return r.date+=1/13,me(z(r.date)),new Promise(o=>setTimeout(o,50))}if(e.shiftKey){if(e.code=="KeyW"&&(r.poi=[],A[0]=0,A[1]=0,T=0),e.code=="KeyS"&&t(),e.code=="KeyA"){let o=async()=>{t().then(o)};o()}He()}};window.onload=Lt;Object.assign(window,{rec:e=>{ot(e),$()},give:e=>{r.store[Object.keys(r.store)[e]]+=100,$()},foc:e=>{r.focus!=e&&(r.focus=e,le())},save:e=>{if(e!=0&&!confirm(`Save to ${e}?`))return;let t=JSON.stringify({...r,home:r.poi.indexOf(r.home)},null,2);localStorage.setItem("temo"+e,t),e!=0&&I("Saved")},load:e=>{let t=localStorage.getItem("temo"+e);t&&(r=JSON.parse(t),r.home=r.poi[r.home],me(z(r.date)),$e(),$(),I("Loaded"))}});var it={};var L;function Et(e,t,o,n=1/4,a){L=ne(e,k.width,o,a);let i=Xe(L,L.width*n,L.height*n).getContext("2d");return i.font="14px Verdana",i.fillStyle="#fff",i.strokeText(t,5,15),i.fillText(t,4,14),main.appendChild(L),main.style.width=`${k.width*devicePixelRatio}px`,main.style.height=`${k.height*devicePixelRatio}px`,L=L,L}function st(e){return`<span class=icon>${e}</span>`}function j(e,t){return e?.fail?"🚳":`<span>${e?Object.keys(e).map(n=>`<span data-red='${r.store[n]<.1}'>${ce(e[n])}</span>${st(n)}`).join(t?"<br/>":" "):""}</span>`}function Ct(e,t){let o=G(e);if(tooltip.style.left=`${Math.min(window.innerWidth-300,Fe[0]+20)}`,tooltip.style.top=`${Math.min(window.innerHeight-300,Fe[1]+20)}`,t&&t.classList.contains("icon")&&N[t.innerHTML]){tooltip.style.display="flex";let n=(N[t.innerHTML]||"").split("|");tooltip.innerHTML=`<h4>${n[0]}</h4>${n.slice(1).join("<br/>")}`}else tooltip.style.display="grid",tooltip.innerHTML=Object.keys(R).map(n=>{let a=R[n][o];return`<div>${n}</div><div>${n=="photo"?a?.map(s=>~~s):n=="biome"?a+" "+kt[a]?.toUpperCase():~~(a*1e6)/1e6}</div>`}).join(""),q&&(tooltip.innerHTML+=`${q.kind} ${~~W(q)}`)}document.onmousemove=e=>{let t=[e.movementX,e.movementY];Fe=[e.pageX,e.pageY],e.target==L&&e.buttons&&(A[0]+=t[0]*devicePixelRatio,A[1]+=t[1]*devicePixelRatio,$());let o=e.target,n=o.tagName=="CANVAS",a=o.id;n||o.classList.contains("poi")||o.classList.contains("icon")?(at=[e.offsetX/o.width*k.width/devicePixelRatio,e.offsetY/o.height*k.height/devicePixelRatio],Ct(at,e.target)):it[a]?tooltip.innerHTML=it[a]:tooltip.style.display="none"};main.onwheel=e=>{let t=T;T+=(e.deltaY>0?-1:1)*1/8,T=T<0?0:T,console.log(T,A);let o=k.width/2;A[0]=(A[0]-o)*2**(T-t)+o,A[1]=(A[1]-o)*2**(T-t)+o,e.preventDefault(),e.stopPropagation(),$()};function Pt(e){let t=r.poi[e],o=pe(R,t,r.home);return`<div class=poi id=poi${e}>
<div class=pmain>${t.kind}<center>${~~W(t)}
</center></div>
<center style=margin:0.2rem >${!r.home||t==r.home?"":j(o,!0)}<center>
</div>`}function He(){console.time("draw"),L&&main.removeChild(L),Et(R.photo,"photo",e=>e,void 0,e=>Math.max(1,~~(R.elevation[e]*20)*2)),console.timeEnd("draw"),$()}window.poiOver=e=>{console.log(e)};function ce(e){return parseFloat(Number(e).toFixed(2))}function $e(){let e=k.width/2;r.home&&(T=2.25/(1+r.bonus["🔭"]),A[0]=(-r.home.at[0]*2**T+e)*devicePixelRatio,A[1]=(-r.home.at[1]*2**T+e)*devicePixelRatio)}function $(){if(!r)return;Le(),L.style.transform=`translate(${A[0]}px, ${A[1]}px) scale(${2**T})`;let e="";for(let i in r.poi)e+=Pt(i);ps.innerHTML=e;let t=k.width/2;for(let i in r.poi){let l=r.poi[i],p=document.querySelector(`#poi${i}`);if(p){let d=(l.size**.5*3+4)*2**T;p.style.left=`${l.at[0]*devicePixelRatio*2**T+A[0]-d/2}px`,p.style.top=`${l.at[1]*devicePixelRatio*2**T+A[1]-d/2}px`,p.style.fontSize=`${d}px`,p.dataset.cur=l==r.home,p.onmouseover=()=>{q=l},p.onmouseleave=()=>{q=void 0},p.onmousedown=()=>{if(r.home&&pe(R,l,r.home).fail){I("Unreachable");return}tt(l),$()}}}Le();let o=[{"👨‍👩‍👦‍👦":r.pop,"💗":Re(),"🏋":Pe(),"📅":se(),...r.bonus},{...r.store}],n,a="";for(n=1;localStorage.getItem("temo"+n);n++)a+=`<button onmousedown=save(${n})>Save ${n}</button><button onmousedown=load(${n})>Load ${n}</button>`;a+=`<button onmousedown=save(${n})>Save ${n}</button>`;let s=o.map(i=>"<div class=res>"+Object.keys(i).map(l=>[st(l),i[l]>10?~~i[l]:ce(i[l])]).map((l,p)=>`<div onmousedown="give(${p})">${l.join("<br/>")}</div>`).join("")+"</div>").join("")+Object.values(Y).map(i=>{let l=j(i.to),p=Ae[i.name],d=r.tech[i.name]>0;return(p?`<div>${p}</div>`:"")+`<button data-sel=${r.sel[i.name]} data-rec onmousedown="rec('${i.name}')" data-use="${d&&(nt(i.name)||E[i.name].isBonus)}" >
${r.bonus["⚗️"]?`<div class=foc data-foc="${r.focus==i.name}" onmousedown=foc('${i.name}')>⚗️</div>`:""}
${d?"":"<div class=un>UNKNOWN</div>"}
${`<div class=r><div>${i.name} ${r.tech[i.name]||""}</div>
<div>${~~(Ce(i.name)-r.research[i.name])}<span class=resl>⚗️↩${Object.keys(i.research).join("")}</span></div></div>
<span class=rec>${j(i.from)}${l?"🡢 "+l:""}</span>`}
</button>`}).join("")+"<br/>"+a+`<button data-fls=${r?.date==0&&$t} onmousedown=load(0)>Load autosave</button><p class=log>`+_.slice(_.length-20).join(" ✦ ")+"</p>";console.log("<p class=log>"+_.slice(_.length-20).join(" ✦ ")+"</p>"),recdiv.innerHTML=s}var $t=!!localStorage.getItem("temo0");function me(e){return R=e,He(),R}function z(e=r.date){let t=~~e;if(t!=e&&(e=t+~~(e%1*g.blnd)/g.blnd),X[e])return X[e];if(t==e)return X[e]=de({...k,seed:r.seed+e}),X[e];console.time("blend");let[o,n]=[z(t),z(t+1)],a=Ye(o,n,e-t);return I("map updated"),X[e]=a,console.timeEnd("blend"),a}})();
