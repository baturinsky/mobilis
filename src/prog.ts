"use strict";

import { initGame, mult, Poi, poiLeft, Recipe, recipes, Game, parsePedia, populate, travelToP, setCurrentRecipes, tryToUse, travelSteps, travelCost, travelWeight, recipeUseable, happiness, recipeGroupStartingWith, advanceTimeByWeeks, currentWeek, currentRecipes, tierCost, mapsCache, updateBonuses, dict } from "./game";
import { categories, scenario } from "./scenario";
import {
  data2image, rescaleImage, generateMap, ShowMapF, LayeredMap, RGBA,
  XY, coord2ind, blendFull,
  MapParams
} from "./worldgen";

declare var main: HTMLCanvasElement, tooltip: HTMLDivElement, recdiv: HTMLDivElement, ps: HTMLDivElement;
declare var blendMaps: HTMLInputElement;

export let m: LayeredMap;
let mapList: LayeredMap[] = []
let mapScroll = [0, 0];
let mouseAt: XY;
let screenXY;
let zoom = 1;

let poiPointed: Poi | undefined;

export let game: Game;


let log: string[] = [];

export function report(t: string) {
  log.push(t)
}

const biomeNames = [
  "unknown",
  "desert",
  "grassland",
  "tundra",
  "savanna",
  "shrubland",
  "taiga",
  "tropical forest",
  "temperate forest",
  "rain forest",
  "swamp",
  "snow",
  "steppe",
  "coniferous forest",
  "mountain shrubland",
  "beach",
  "lake",
  "ocean"
];

export let settings = {
  "seed": 1,
  "width": 700,
  "height": 700,
  "scale": 1,
  "noiseFactor": 11.5,
  "crustFactor": 5.5,
  "tectonicFactor": 2.9,
  "noiseSmoothness": 1,
  "tectonicSmoothness": 8.5,
  "pangaea": 0,
  "seaRatio": 0.55,
  "flatness": 0.09,
  "randomiseHumidity": 0,
  "averageTemperature": 19,
  "erosion": 10000,
  "riversShown": 150,
  "biomeScrambling": 0.24,
  "terrainTypeColoring": 0,
  "discreteHeights": 0,
  "hillRatio": 0.12,
  "mountainRatio": 0.04,
  "gameMapRivers": 15000,
  "gameMapScale": 2,
  "generatePhoto": 1,
  "squareGrid": 0,
  "generateTileMap": 0,
  "noiseSeed": 1,
  "elevationCold": 53,
  "shading": 1
} as MapParams;

function init() {
  parsePedia()

  game = initGame(settings.seed);
  updateBonuses();
  populate(game.poi)
  renderMap();
  render();
}

/*document.addEventListener("mousedown", e => {
  tryToUse((e.target as HTMLButtonElement).dataset.rec);
  render();
});*/


document.onkeydown = k => {
  function adv() {
    game.date += 1 / 13;
    setMap(generateGameMap(game.date));
    return new Promise(r => setTimeout(r, 50))
  }

  if (k.shiftKey) {
    if (k.code == "KeyW") {
      game.poi = [];
      mapScroll[0] = 0;
      mapScroll[1] = 0;
      zoom = 0;
    }
    if (k.code == "KeyS") {
      adv()
    }
    if (k.code == "KeyA") {
      let loop = async () => { adv().then(loop) }
      loop();
    }

    renderMap();
  }
}

window.onload = init;

Object.assign(window, {
  rec: n => {
    tryToUse(n);
    render()
  },
  give: i => {
    game.store[Object.keys(game.store)[i]] += 100;
    render()
  },
  foc: a => {
    if (game.focus != a) {
      game.focus = a;
      advanceTimeByWeeks()
    }
  },
  save: n => {
    if (n != 0)
      if (!confirm(`Save to ${n}?`))
        return;
    let s = JSON.stringify({ ...game, home: game.poi.indexOf(game.home as any), seed: settings.seed }, null, 2)
    localStorage.setItem("temo" + n, s)
    if (n != 0)
      report("Saved")
  },
  load: n => {
    let data = localStorage.getItem("temo" + n);
    if (data) {
      game = JSON.parse(data)
      if (game.seed != null)
        settings.seed = game.seed;
      game.home = game.poi[game.home as any];
      setMap(generateGameMap(game.date));
      centerMap()
      render()
      report("Loaded")
    }
  },
})



let tips = {};

function rebuildForm() {
  let form = document.getElementById("form") as HTMLFormElement;
  form.innerHTML = "";

  for (let param of parameters) {
    let [id, type, also] = param;
    also = also || {};
    tips[id] = also.tip;
    switch (type) {
      case "tip":
        form.innerHTML += `<div class="tip">${id}</div>`;
        break;
      case "checkbox":
        form.innerHTML += `<div>${id}</div><input class="checkbox" type="checkbox" id="${id}" ${settings[id] ? "checked" : ""
          } />`;
        break;
      case "number":
        form.innerHTML += `<div>${id}</div><input class="number" type="number" id="${id}" value="${settings[id]}" />`;
        break;
      case "range":
        let min = also.min || 0;
        let max = also.max || 1;
        let step = also.step || (max - min) / 100;
        form.innerHTML += `<div>${id}</div><input class="range" type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${settings[id]}"/>
        <div id="${id}_value"></div>
        `;
        break;
    }
  }
}


let mainCanvas: HTMLCanvasElement;

function showMap(data: Float32Array | RGBA[], title: string, fun: ShowMapF, scale = 1 / 4, altitude?: (i: number) => number) {
  mainCanvas = data2image(data, settings.width, fun, altitude);
  let img = rescaleImage(mainCanvas, mainCanvas.width * scale, mainCanvas.height * scale);
  let ctx = img.getContext("2d") as CanvasRenderingContext2D;
  ctx.font = "14px Verdana";
  ctx.fillStyle = "#fff";
  ctx.strokeText(title, 5, 15);
  ctx.fillText(title, 4, 14);

  main.appendChild(mainCanvas);
  main.style.width = `${settings.width * devicePixelRatio}px`;
  main.style.height = `${settings.height * devicePixelRatio}px`;
  mainCanvas = mainCanvas;

  return mainCanvas;
}

function tt(k) {
  return `<span class=icon>${k}</span>`;
}

export function recipeToText(r, vertical?) {
  if (r?.fail) {
    return r.fail == 1 ? "🏋🏻" : "🚳"
  }
  let txt = r ? Object.keys(r).map(k => `<span data-red='${game.store[k] < 0.1}'>${fix(r[k])}</span>${tt(k)}`).join(vertical ? "<br/>" : " ") : ""
  return `<span class=rtt>${txt}</span>`;
}


function updateTooltip(mouseAt: XY, target: HTMLElement) {
  let ind = coord2ind(mouseAt);
  tooltip.style.left = `${Math.min(window.innerWidth - 300, screenXY[0] + 20)}`;
  tooltip.style.top = `${Math.min(window.innerHeight - 300, screenXY[1] + 20)}`;

  if (target && target.classList.contains("icon") && dict[target.innerHTML]) {
    tooltip.style.display = "flex";
    let t = (dict[target.innerHTML] || "").split("|");
    tooltip.innerHTML = `<h4>${t[0]}</h4>${t.slice(1).join("<br/>")}`
  } else {

    tooltip.style.display = "grid";
    tooltip.innerHTML = Object.keys(m)
      .map((key) => {
        let v = m[key][ind];
        return `<div>${key}</div><div>${key == "photo" ? v?.map(n => ~~n) :
          key == "biome" ? v + " " + biomeNames[v]?.toUpperCase() :
            ~~(v * 1e6) / 1e6}</div>`
      }
      )
      .join("");
    if (poiPointed) {


      tooltip.style.display = "block";
      let kind = poiPointed.kind;
      let t = (dict[kind] || "").split("|");
      let tc = travelCost(m, poiPointed, game.home)
      recipeToText(tc, true)
      let ddd = poiPointed == game.home ? "" : `<p>${recipeToText(tc, true)} ${["", "Not enough transport for everyone", "Not enough resources for entire journey", " travel duration"][tc.fail ?? 3]}</p>`;
      tooltip.innerHTML = `
      <h4>${kind}${t[0]}</h4><p>${t.slice(1).join("<br/>")}</p>
      <p>Remaining:${~~poiLeft(poiPointed)}</p>${ddd}
      `;
    }
  }
}

document.onmousemove = (e) => {

  let move = [e.movementX, e.movementY]
  screenXY = [e.pageX, e.pageY];
  if (e.target == mainCanvas && e.buttons) {
    mapScroll[0] += move[0] * devicePixelRatio
    mapScroll[1] += move[1] * devicePixelRatio
    render()
  }
  let target = e.target as HTMLCanvasElement;

  let isCanvas = target.tagName == "CANVAS";
  let id = target.id;

  if (isCanvas || target.classList.contains('icon') || target.classList.contains('poi')) {
    //console.log(target?.dataset?.tip);
    mouseAt = [
      (e.offsetX / target.width) * settings.width / devicePixelRatio,
      (e.offsetY / target.height) * settings.height / devicePixelRatio
    ];
    updateTooltip(mouseAt, e.target as HTMLElement)
  } else if (tips[id]) {
    tooltip.innerHTML = tips[id];
  } else {
    tooltip.style.display = "none";
  }
};


main.onwheel = (e) => {
  let old = zoom;

  zoom += (e.deltaY > 0 ? -1 : 1) * 1 / 8;
  zoom = zoom < 0 ? 0 : zoom;
  console.log(zoom, mapScroll);
  let half = settings.width / 2;

  mapScroll[0] = (mapScroll[0] - half) * 2 ** (zoom - old) + half;
  mapScroll[1] = (mapScroll[1] - half) * 2 ** (zoom - old) + half;

  e.preventDefault()
  e.stopPropagation()
  render()
}

function poiText(i: number) {
  let p = game.poi[i];
  //let ts = travelSteps(m, p, game.home)
  let tc = travelCost(m, p, game.home)
  //let style = `style=color:rgb(${15 * p.temp - 400},50,${-20 * p.temp + 100})`;
  return `<div class=poi id=poi${i}>
<div class=pmain>${p.kind}<center>${~~poiLeft(p)}
</center></div>
<center style=margin:0.2rem >${!game.home || p == game.home ? "" : recipeToText(tc, true)}<center>
</div>`
}

function renderMap() {

  console.time("draw");
  mainCanvas && main.removeChild(mainCanvas);

  showMap(m.photo, "photo", (v) => v as any, undefined, i => Math.max(1, ~~(m.elevation[i] * 20) * 2));

  console.timeEnd("draw");
  render();
}

window["poiOver"] = e => {
  console.log(e);
}


export function fix(n) {
  return parseFloat(Number(n).toFixed(2))
}

export function centerMap() {
  let half = settings.width / 2;
  if (game.home) {
    zoom = 2.25 / (1 + game.bonus['🔭']);
    mapScroll[0] = (- game.home.at[0] * 2 ** zoom + half) * devicePixelRatio
    mapScroll[1] = (- game.home.at[1] * 2 ** zoom + half) * devicePixelRatio
  }
}

export function render() {
  if (!game)
    return;

  setCurrentRecipes();

  //mainCanvas.style.transformOrigin = `${mapScroll[0]}px ${mapScroll[1]}px`
  mainCanvas.style.transform = `translate(${mapScroll[0]}px, ${mapScroll[1]}px) scale(${2 ** zoom})`

  let s = ""
  for (let i in game.poi) {
    s += poiText(i as any as number);
  }

  ps.innerHTML = s;
  let half = settings.width / 2;

  for (let i in game.poi) {
    let p = game.poi[i];
    let d = document.querySelector(`#poi${i}`) as HTMLDivElement;
    if (d) {
      let size = ((p.size ** 0.5) * 3 + 4) * 2 ** zoom;
      d.style.left = `${(p.at[0] * devicePixelRatio * (2 ** zoom) + mapScroll[0] - size / 2)}px`;
      d.style.top = `${(p.at[1] * devicePixelRatio * (2 ** zoom) + mapScroll[1] - size / 2)}px`;
      d.style.fontSize = `${size}px`
      d.dataset.cur = p == game.home;
      d.onmouseover = () => {
        poiPointed = p;
      };
      d.onmouseleave = () => { poiPointed = undefined; };
      d.onmousedown = () => {
        if (game.home) {
          let tc = travelCost(m, p, game.home)
          if (tc.fail) {
            report("Unreachable")
            return
          }
        }

        travelToP(p)
        render()
      }
    }
  }

  setCurrentRecipes()
  //game.bonus["💗"] = happiness();


  let barCont = [{
    '👨‍👩‍👦‍👦': game.pop, '💗': happiness(), '🏋': travelWeight(), '📅': currentWeek(),
    ...game.bonus
  }, {
    ...game.store
  }]

  let i, svs = '';
  for (i = 1; localStorage.getItem("temo" + i); i++) {
    svs += `<button onmousedown=save(${i})>Save ${i}</button><button onmousedown=load(${i})>Load ${i}</button>`
  }
  svs += `<button onmousedown=save(${i})>Save ${i}</button>`


  let all =
    barCont.map(bc => "<div class=res>" + Object.keys(bc).map(k => ([tt(k), bc[k] > 10 ? ~~bc[k] : fix(bc[k])])).map((a, i) =>
      `<div onmousedown="give(${i})">${a.join("<br/>")}</div>`
    ).join("") + "</div>").join("") +
    Object.values(currentRecipes).map(r => {
      let to = recipeToText(r.to);
      let rg = recipeGroupStartingWith[r.name];
      let known = game.tech[r.name] > 0;

      let len = (r.from ? Object.keys(r.from).length : 0) + (r.to ? Object.keys(r.to).length : 0);

      let txt = (rg ? `<div>${rg}</div>` : "") +
        `<button data-sel=${game.sel[r.name]} data-rec onmousedown="rec('${r.name}')" data-use="${known && (recipeUseable(r.name) || recipes[r.name].isBonus)}" >
${(game.bonus[`⚗️`]) ? `<div class=foc data-foc="${game.focus == r.name}" onmousedown=foc('${r.name}')>⚗️</div>` : ''}
${!known ? `<div class=un>UNKNOWN</div>` : ''}
${`<div class=r><div>${r.name} ${game.tech[r.name] || ''}</div>
<div>${~~(tierCost(r.name) - game.research[r.name])}<span class=resl>⚗️↩${Object.keys(r.research).join('')}</span></div></div>
<span class=rec style="${len > 4 ? 'font-size:80%' : ''}">${recipeToText(r.from)}${to ? '🡢 ' + to : ''}</span>`}
</button>`
      return txt
    }).join("")
    + "<br/>" + svs + `<button data-fls=${game?.date == 0 && hasAuto} onmousedown=load(0)>Load autosave</button>`
    + "<p class=log>" + log.slice(log.length - 20).join(" ✦ ") + "</p>"
    ;

  console.log("<p class=log>" + log.slice(log.length - 20).join(" ✦ ") + "</p>");
  recdiv.innerHTML = all;
}

let hasAuto = !!localStorage.getItem("temo0")


export function setMap(nm: LayeredMap) {
  m = nm;
  renderMap();
  return m
}

export function generateGameMap(date: number = game.date) {
  let before = ~~date;
  if (before != date)
    date = before + ~~((date % 1) * scenario.blnd) / scenario.blnd;
  if (mapsCache[date])
    return mapsCache[date];
  if (before == date) {
    mapsCache[date] = generateMap({ ...settings, seed: game.seed + date });
    return mapsCache[date]
  }
  console.time("blend");
  let [a, b] = [generateGameMap(before), generateGameMap(before + 1)];
  let blend = blendFull(a, b, date - before);
  report("map updated")
  mapsCache[date] = blend;
  console.timeEnd("blend");
  return blend;
}

const guide = `
== GUIDE ==

Use recipe buttons on the right to gather and craft resources. 
You can use both your own resources and resources in the location your are in.
Recipes with 🐾 and 🍃can work differently  with different resources.
Use map on the left to travel between locations. Each location has a stock of one type resources to use in recipes.

You can choose the method of movement on land and sea (two top rows of the buttons). 
Default ones are free except the time, other costs fuel and needs transport. 
You should have enough transport for each pop, and enough fuel to reach the destination.

"Tool" type resources (🛠️ tools,⛺ housing,🛷 wagons,🐴 horses,⚙️ engines and 🏹 weapons)
are expended only at 10% of listed at recipe rate (for amortization). 
But you need to have enough of them for each pop to work at 100% effect.

This planet is always in motion, resources apear and disappear. 
Except for "Calamities" - 👹 goblin, ☣️ taint and🌋 fracture are semipermanent and you will need to remove them,
or there will be no place for other resources on the map.

Most of the actions are locked until researched. 
You gradually research them by just having resources shown in top right of the button in store (or in location).
Having 📙 resource advances all research, bust especially the one with Research Focus ⚗️ selected.
Recipes can be researched past the unlocking, granting production bonuses.

Food 🍎 is used at rate of one per pop. If you don't have enough, you will lose pop fast.

Each resources in stock increases pop 💗 happiness. Bigger happiness lead to increase of the population.

Each resource have weight which increases transportation cost and time. 
1% of resources are used up each week. 
`

//console.log(guide);