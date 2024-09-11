"use strict";

import { initGame, mult, Poi, poiLeft, Recipe, recipes, Game, parsePedia, populate, travelToP, setLocalRecipes, tryToUse, travelSteps, travelCost, travelWeight, recipeUseable, happiness, recipeGroupStartingWith } from "./game";
import { scenario } from "./scenario";
import {
  data2image, rescaleImage, generateMap, ShowMapF, LayeredMap, RGBA,
  XY, coord2ind, blendFull,
  MapParams
} from "./worldgen";

declare var main: HTMLCanvasElement, tooltip: HTMLDivElement, recdiv: HTMLDivElement, ps: HTMLDivElement;
declare var blendMaps: HTMLInputElement;

let m: LayeredMap;
let mapList: LayeredMap[] = []
let mapScroll = [0, 0];
let mouseAt: XY;
let screenXY;
let zoom = 1;

let poiPointed: Poi | undefined;

export let game: Game;

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

const parameters: [string, string, { tip?: string, min?: number, max?: number, step?: number }?][] = [
  ["seed", "number"],
  ["noiseSeed", "number"],
  ["width", "number"],
  ["height", "number"],
  [
    "noiseSmoothness",
    "range",
    { max: 10, step: 0.5 },
  ],
  [
    "tectonicSmoothness",
    "range",
    {
      max: 10,
      step: 0.5
    },
  ],
  [
    "noiseFactor",
    "range",
    {
      min: -5,
      max: 20,
      step: 0.5
    },
  ],
  [
    "crustFactor",
    "range",
    {
      min: -5,
      max: 20,
      step: 0.5
    },
  ],
  [
    "tectonicFactor",
    "range",
    {
      min: -1,
      max: 10,
      step: 0.1
    },
  ],
  [
    "pangaea",
    "range",
    {
      min: -5,
      max: 5
    },
  ],
  ["seaRatio", "range", { tip: "Sea percentage" }],
  [
    "flatness",
    "range"
  ],
  ["randomiseHumidity", "checkbox"],
  ["averageTemperature", "range", { min: -30, max: 50, step: 1 }],
  ["elevationCold", "range", { min: 0, max: 300, step: 1 }],
  [
    "erosion",
    "range",
    { max: 100000 },
  ],
  [
    "riversShown",
    "range",
    {
      max: 1000
    },
  ],
  ["biomeScrambling", "range"],
  ["squareGrid", "checkbox"],
  ["gameMapScale", "range", { min: 0, max: 4, step: 1 }],
  [
    "gameMapRivers",
    "range",
    {
      max: 50000,
      step: 1000
    },
  ],
  ["discreteHeights", "range", { max: 40, step: 1 }],
];

let defaultSettings = {
  mapMode: 0,
  seed: 1,
  width: 640,
  height: 640,
  scale: 1,
  noiseFactor: 10,
  crustFactor: 6,
  tectonicFactor: 3,
  noiseSmoothness: 2,
  tectonicSmoothness: 5,
  pangaea: 0,
  seaRatio: 0.55,
  flatness: 0.5,
  randomiseHumidity: 0,
  averageTemperature: 15,
  erosion: 50000,
  riversShown: 400,
  biomeScrambling: 0,
  terrainTypeColoring: 0,
  discreteHeights: 0,
  hillRatio: 0.12,
  mountainRatio: 0.04,
  gameMapRivers: 15000,
  gameMapScale: 2,
  generatePhoto: 1,
  squareGrid: 0,
  noiseSeed: 0,
  elevationCold: 0,
  shading: true
} as MapParams;

export let settings = {} as MapParams;

function init() {
  parsePedia()

  if (document.location.hash) {
    settings = {} as MapParams;
    let records = document.location.hash
      .substr(1)
      .split("&")
      .map((s) => s.split("="));
    console.log(records);
    for (let ss of records) {
      settings[ss[0]] =
        (ss[1] == "false" ? false : ss[1] == "true" ? true : Number(ss[1])) as any;
    }
    console.log(settings);
  }

  if (!settings || !settings.width)
    settings = JSON.parse(localStorage.mapGenSettings)
  if (!settings || !settings.width)
    settings = { ...defaultSettings };

  rebuildForm();

  applySettings();
  game = initGame(settings.seed);
  m = generateGameMap(0, settings);
  game.poi = populate(m)
  renderMap();
  render();
}

document.addEventListener("mousedown", e => {
  tryToUse((e.target as HTMLButtonElement).dataset.rec);
  render();
});


function applySettings() {
  for (let [id, type] of parameters) {
    if (type == "tip") continue;
    let element = document.getElementById(id) as HTMLInputElement;
    settings[id] =
      element.type == "checkbox" ? element.checked ? 1 : 0 : Number(element.value);
    let id_value = document.getElementById(id + "_value");
    if (id_value) id_value.innerText = String(settings[id]).substr(0, 8);
  }

  saveSettings();

  //generate(settings);
}

window.onload = init;
window["applySettings"] = applySettings;

document.body.addEventListener("mousedown", e => {
  switch ((e.target as HTMLElement)?.id) {
    case "resetSettings":
      settings = { ...defaultSettings };
      rebuildForm();
      applySettings();
      return
  }
})



blendMaps.onchange = (e => {
  let n = Number(blendMaps.value);
  if (mapList.length >= 2) {
    m = blendFull(mapList[mapList.length - 2], mapList[mapList.length - 1], n);
    //let blend = blendFast(mapList[mapList.length - 2], mapList[mapList.length - 1], n);    
    renderMap();
  }
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

function saveSettings() {
  document.location.hash = Object.keys(settings)
    .map((k) => `${k}=${settings[k]}`)
    .join("&");

  localStorage.mapGenSettings = JSON.stringify(settings);
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



function updateTooltip(mouseAt: XY) {
  let ind = coord2ind(mouseAt);
  tooltip.style.left = `${Math.min(window.innerWidth - 300, screenXY[0] + 20)}`;
  tooltip.style.top = `${Math.min(window.innerHeight - 300, screenXY[1] - 40)}`;
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
    tooltip.innerHTML += `${poiPointed.kind} ${~~poiLeft(poiPointed)}`;
  }
}

document.onmousemove = (e) => {

  let move = [e.movementX, e.movementY]
  screenXY = [e.screenX, e.screenY];
  if (e.target == mainCanvas && e.buttons) {
    mapScroll[0] += move[0] * devicePixelRatio
    mapScroll[1] += move[1] * devicePixelRatio
    render()
  }
  let target = e.target as HTMLCanvasElement;

  let isCanvas = target.tagName == "CANVAS";
  let id = target.id;

  if (isCanvas || target.classList.contains("poi")) {
    mouseAt = [
      (e.offsetX / target.width) * settings.width / devicePixelRatio,
      (e.offsetY / target.height) * settings.height / devicePixelRatio
    ];
    updateTooltip(mouseAt)
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
  let ts = travelSteps(m, p, game.home)
  let tc = travelCost(m, p, game.home)
  return `<div class=poi id=poi${i}>
${p.kind}<center style=color:rgb(${15 * p.temp - 400},50,${-20 * p.temp + 100})>${~~poiLeft(p)}
${!game.home || p==game.home?"":`<br/>${recipeToText(ts)}<br/>${recipeToText(tc)}`}</center>
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

function recipeToText(r) {
  return r ? Object.keys(r).map(k => `${fix(r[k])}${k}`).join(" ") : ""
}

export function render() {
  if (!game)
    return;

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
      d.onmouseover = () => { poiPointed = p; };
      d.onmouseleave = () => { poiPointed = undefined; };
      d.onmousedown = () => {
        travelToP(p)
        render()
        mapScroll[0] = (- p.at[0] * 2 ** zoom + half) * devicePixelRatio
        mapScroll[1] = (- p.at[1] * 2 ** zoom + half) * devicePixelRatio
      }
    }
  }

  setLocalRecipes()
  game.bonus["💗"] = happiness();

  let barCont = {'👨‍👩‍👦‍👦':game.pop, '🏋':travelWeight(), '📅': fix(game.date * scenario.wpy), 
    ...game.bonus,
    ...game.store}

  recdiv.innerHTML =
    "<div id=res>" +
    Object.keys(barCont).map(k => ([k,~~barCont[k]])).map(a => 
      `<span onmousedown="give('${a[0]}')">${a.join("<br/>")}</span>`
    ).join("") + "</div>" +
    Object.values(game.cr).map(r => {
      let to = recipeToText(r.to);
      let rg = recipeGroupStartingWith[r.name];
      let known = r.cost == 0;
      return (rg?`<div>${rg}</div>`:"")+
`<button data-sel=${game.sel.has(r.name)} data-rec="${r.name}" data-use="${known && recipeUseable(r.name)}" >
<div class=rb>⚗️</div> 
${!known?`<div class=un>UNKNOWN</div>`:''}
${`<div class=r><div>${r.name}</div><div>${r.cost}⚗️↩${Object.keys(r.bonus)}</div></div>
<span class=rec>${recipeToText(r.from)}${to ? '🡢 ' + to : ''}</span>`}
</button>`}).join("");
}

window["give"] = a=>{
  game.store[a] += 100;
  render()
}

function generate(params) {
  console.time("generation total");
  m = generateMap(params);
  mapList.push(m);

  renderMap();

  console.timeEnd("generation total");
}

export function generateGameMap(date: number) {
  let before = ~~date;
  if (before != date)
    date = before + ~~((date % 1) * 13) / 13;
  if (game.maps[date])
    return game.maps[date];
  if (before == date) {
    game.maps[date] = generateMap({ ...settings, seed: game.seed + date });
    return game.maps[date]
  }
  let [a, b] = [generateGameMap(before, settings), generateGameMap(before + 1, settings)];
  let blend = blendFull(a, b, date - before);
  console.timeEnd("generation total");
  return blend;
}

