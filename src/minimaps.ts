"use strict";

declare var main: HTMLCanvasElement, miniMaps: HTMLDivElement, tooltip: HTMLDivElement;

import { game } from "./prog";
import { data2image, rescaleImage, elevation2Image, generateMap, biomeNames, biomeColors, ShowMapF, LayeredMap, RGBA, Terrain, MapParams, biomeEmoji, biomeAnimal, XY, coord2ind, lerpRGBA } from "./worldgen";

const parameters: [string, string, { tip?: string, min?: number, max?: number, step?: number }?][] = [
  ["seed", "number"],
  ["noiseSeed", "number"],
  ["width", "number"],
  ["height", "number"],
  [
    "noiseSmoothness",
    "range",
    { max: 10, step: 0.5},
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
    { max: 100000},
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

let miniMapSize = 200;

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
};

let settings = {} as { [id: string]: number };

function init() {
  if (document.location.hash) {
    settings = {};
    let records = document.location.hash
      .substr(1)
      .split("&")
      .map((s) => s.split("="));
    console.log(records);
    for (let ss of records) {
      settings[ss[0]] =
        ss[1] == "false" ? false : ss[1] == "true" ? true : Number(ss[1]);
    }
    console.log(settings);
  }

  if (!settings || !settings.width)
    settings = JSON.parse(localStorage.mapGenSettings)
  if (!settings || !settings.width)
    settings = { ...defaultSettings };

  rebuildForm();
  applySettings();
}

window.onload = init;

console.log


window["resetSettings"] = () => {
}


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

  generate(settings);
}

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

function lerpMaps(a: LayeredMap, b: LayeredMap, n: number, fields?: string[]) {
  let c = {} as LayeredMap;
  for (let k of (fields ?? Object.keys(a))) {
    c[k] = new Float32Array(a[k].length);
    let aa = a[k], bb = b[k]
    if (k == "photo" || k == "biome") {
      for (let i in aa) {
        c[k][i] = lerpRGBA(aa[i], bb[i], n)
      }
    } else {
      for (let i in aa) {
        c[k][i] = aa[i] * (1 - n) + bb[i] * n;
      }
    }
  }
  return c
}

declare var blendMaps: HTMLInputElement;

blendMaps.onchange = (e => {
  let n = Number(blendMaps.value);
  if (mapList.length >= 2) {
    console.time("blend");
    let terrain = lerpMaps(mapList[mapList.length - 2], mapList[mapList.length - 1], n, ["dryElevation", "tectonic"]) as Terrain;
    console.timeEnd("blend");
    console.time("blendGen");
    let blend = generateMap(mapParams, terrain);
    console.timeEnd("blendGen");
    renderMap(blend);
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


let maps: HTMLCanvasElement[] = [], minis: HTMLCanvasElement[], mainCanvas: HTMLCanvasElement;

function showMap(data: Float32Array | RGBA[], title: string, fun: ShowMapF, scale = 1 / 4, altitude?: (i: number) => number) {
  let canvas = data2image(data, settings.width, fun, altitude);
  let mini = rescaleImage(canvas, canvas.width * scale, canvas.height * scale);
  let ctx = mini.getContext("2d") as CanvasRenderingContext2D;
  ctx.font = "14px Verdana";
  ctx.fillStyle = "#fff";
  ctx.strokeText(title, 5, 15);
  ctx.fillText(title, 4, 14);

  miniMaps.appendChild(mini);
  let id = maps.length;

  if (id == settings.mapMode) {
    main.appendChild(canvas);
    main.style.width = `${settings.width * devicePixelRatio}px`;
    main.style.height = `${settings.height * devicePixelRatio}px`;
    mainCanvas = canvas;
  }

  mini.id = "mini_" + id;
  maps.push(canvas);
  minis.push(mini);
  mini.onclick = () => {
    settings.mapMode = id;
    saveSettings();
    main.setHTMLUnsafe("");
    main.appendChild(canvas);
  };
  return canvas;
}


let m: LayeredMap;
let mapList: LayeredMap[] = []
let mapScroll = [0, 0];
let mouseAt: XY;
let screenXY;

function updateTooltip(mouseAt: XY) {
  let ind = coord2ind(mouseAt, settings.width);
  tooltip.style.left = `${Math.min(window.innerWidth - 300, screenXY[0] + 20)}`;
  tooltip.style.top = `${Math.min(window.innerHeight - 300, screenXY[1] - 40)}`;
  tooltip.style.display = "grid";
  tooltip.innerHTML = Object.keys(m)
    .map((key) => {
      let v = m[key][ind];
      return `<div>${key}</div><div>${key == "photo" ? v?.map(n => ~~n) :
        key == "biome" ? v + " " + biomeEmoji[v] + biomeAnimal[v] + biomeNames[v]?.toUpperCase() :
          ~~(v * 1e6) / 1e6}</div>`
    }
    )
    .join("");
}

document.onmousemove = (e) => {

  let move = [e.movementX, e.movementY]
  screenXY = [e.screenX, e.screenY];
  if (e.target == mainCanvas && e.buttons) {
    mapScroll[0] += move[0] * devicePixelRatio
    mapScroll[1] += move[1] * devicePixelRatio
    rescale()
  }
  let target = e.target as HTMLCanvasElement;

  let isCanvas = target.tagName == "CANVAS";
  let id = target.id;

  if (isCanvas) {
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

let zoom = 1;

main.onwheel = (e) => {
  let old = zoom;

  zoom += (e.deltaY > 0 ? -1 : 1) * 1 / 8;
  zoom = zoom < 0 ? 0 : zoom;
  console.log(zoom, mapScroll);

  //let oldcx = mapScroll[0] + 400 * 2 ** old
  //let newcx = mapScroll[1] + 400 * 2 ** zoom

  //let dcenter = mapScroll[0] + 400) * 2**old - (mapScroll[1] + 400) * 2**zoom;
  //let centerxold = mapScroll[0] + 400 * 2 ** old;

  mapScroll[0] = (mapScroll[0] - 400) * 2 ** (zoom - old) + 400;
  mapScroll[1] = (mapScroll[1] - 400) * 2 ** (zoom - old) + 400;


  e.preventDefault()
  e.stopPropagation()
  rescale()
}

function renderMap(m: LayeredMap) {
  let {
    elevation,
    dryElevation,
    tectonic,
    rivers,
    wind,
    temperature,
    humidity,
    biome
  } = m;


  console.time("draw");
  main.setHTMLUnsafe("");
  miniMaps.setHTMLUnsafe("");
  maps = [];
  minis = [];

  showMap(
    elevation,
    "elevation",
    elevation2Image({ elevation, rivers }, settings)
  );

  showMap(
    dryElevation,
    "dryElevation",
    elevation2Image({ elevation: elevation.map(v => v / 3 + 0.3), rivers: undefined }, settings)
  );


  showMap(tectonic, "tectonics", (v, i) => [0, 0, 0, v * 255]);

  showMap(temperature, "temperature", (v, i) => [
    v * 5 + 100,
    255 - Math.abs(v - 5) * 10,
    155 - v * 5,
    255,
  ]);

  showMap(wind, "wind", (v, i) => [v * 100, 0, -v * 100, 255]);

  showMap(humidity, "humidity", (v, i) =>
    rivers[i] && elevation[i] > 0
      ? [0, 0, 0, 255]
      : i % settings.width < 20
        ? [wind[i] * 100, 0, -wind[i] * 100, 255]
        : elevation[i] < 0
          ? [0, 0, 0, 255]
          : [300 - v * 1000, elevation[i] * 200 + 50, v * 350 - 150, 255]
  );

  showMap(biome, "biome", (v, i) =>
    elevation[i] < 0 || rivers[i] ? [0, 40, 80, 255] : biomeColors[v]
  );

  showMap(m.photo, "photo", v => v, undefined, i => Math.max(1, ~~(elevation[i] * 20) * 2));
  for (let p of m.poi) {
    let d = document.createElement("div");
    d.classList.add("poi");
    d.innerHTML = p.icon;
    p.div = d;
    main.appendChild(d);
  }

  console.timeEnd("draw");
  rescale();
}

let mapParams: MapParams;

function rescale() {
  //mainCanvas.style.transformOrigin = `${mapScroll[0]}px ${mapScroll[1]}px`
  mainCanvas.style.transform = `translate(${mapScroll[0]}px, ${mapScroll[1]}px) scale(${2 ** zoom})`
  for (let p of game.poi) {
    let d = p.div;
    if (d) {
      d.style.left = `${(p.at[0] * devicePixelRatio * (2 ** zoom) + mapScroll[0] - 8)}px`;
      d.style.top = `${(p.at[1] * devicePixelRatio * (2 ** zoom) + mapScroll[1] - 8)}px`;
      d.style.fontSize = `${p.size ** 0.5 * 8 * 2 ** zoom}px`
    }
  }

}

function generate(params) {
  mapParams = params;
  console.time("generation total");
  m = generateMap(params);
  mapList.push(m);

  renderMap(m);

  //if (params.generateTileMap)  generateTileMap(generatedMap);

  console.timeEnd("generation total");
}


