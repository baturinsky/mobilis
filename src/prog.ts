"use strict";

import { SQUARE, AXIAL, rescaleCoordinates, createNeighborDeltas, distanceBetweenCells, SQUARE8, shortestPath, Layout } from "./geometry";
import { context2d, drawTerrain, ISPATH } from "./hexdraw";
import { data2image, rescaleImage, elevation2Image, generatePrettyRivers, randomSeed, generateMap, biomeNames, random, spread, setSeed, biomeColors, Numbers, ShowMapF, LayeredMap, RGBA, Terrain, MapParams } from "./worldgen";

let mouseOffset = [0, 0];

const parameters: [string, string, { tip?: string, min?: number, max?: number, step?: number }?][] = [
  ["seed", "number", { tip: "Seed for teectonics." }],
  ["noiseSeed", "number", { tip: "Seed for other." }],
  ["width", "number", { tip: "Map width in pixels" }],
  ["height", "number", { tip: "Map height in pixels" }],
  [
    "noiseSmoothness",
    "range",
    { max: 10, step: 0.5, tip: "Smootheness of the elevation noise" },
  ],
  [
    "tectonicSmoothness",
    "range",
    {
      max: 10,
      step: 0.5,
      tip:
        "Smootheness of the noise that is used for tectonic plates simulation",
    },
  ],
  [
    "noiseFactor",
    "range",
    {
      min: -5,
      max: 20,
      step: 0.5,
      tip: "Weight of the 'general purpose' elevation noise",
    },
  ],
  [
    "crustFactor",
    "range",
    {
      min: -5,
      max: 20,
      step: 0.5,
      tip:
        "Weight of the 'tectonic plates' noise. Increase to have more mountains on the edge on continents, reduce to have them inside.",
    },
  ],
  [
    "tectonicFactor",
    "range",
    {
      min: -1,
      max: 10,
      step: 0.1,
      tip: "Amount of mountains and island chains and such",
    },
  ],
  [
    "pangaea",
    "range",
    {
      min: -5,
      max: 5,
      tip:
        "Increasing this will make land gravitate the centre of the map, and vice versa",
    },
  ],
  ["seaRatio", "range", { tip: "Sea percentage" }],
  [
    "flatness",
    "range",
    { tip: "Initial flatness of the non-mountain areas" },
  ],
  ["randomiseHumidity", "checkbox"],
  ["averageTemperature", "range", { min: -30, max: 50, step: 1 }],
  ["elevationCold", "range", { min: 0, max: 300, step: 1 }],
  [
    "erosion",
    "range",
    { max: 100000, tip: "How long water-caused erosion will be simulated" },
  ],
  [
    "riversShown",
    "range",
    {
      max: 1000,
      tip:
        "Amount of rivers and lakes shown on elevation, humidity and biome maps",
    },
  ],
  ["biomeScrambling", "range", { tip: "Adds randomness to biomes" }],
  ["SET gameMapScale TO NOT 0 IF YOU WANT A GAME MAP", "tip"],
  ["squareGrid", "checkbox"],
  ["gameMapScale", "range", { min: 0, max: 4, step: 1 }],
  [
    "gameMapRivers",
    "range",
    {
      max: 50000,
      step: 1000,
      tip: "How many rivers will there be on the low-res (hex) map",
    },
  ],
  ["Graphical repesenation settings", "tip"],
  ["generatePhoto", "checkbox"],
  ["discreteHeights", "range", { max: 40, step: 1 }],
  ["terrainTypeColoring", "checkbox"],
  ["generateTileMap", "checkbox"]
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
  randomiseHumidity: false,
  averageTemperature: 15,
  erosion: 50000,
  riversShown: 400,
  biomeScrambling: 0,
  terrainTypeColoring: false,
  discreteHeights: 0,
  hillRatio: 0.12,
  mountainRatio: 0.04,
  gameMapRivers: 15000,
  gameMapScale: 2,
  generatePhoto: true,
  squareGrid: false,
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
    let element = document.getElementById(id);
    settings[id] =
      element.type == "checkbox" ? element.checked : Number(element.value);
    let id_value = document.getElementById(id + "_value");
    if (id_value) id_value.innerText = String(settings[id]).substr(0, 8);
  }

  saveSettings();

  generate(settings);
}

window.applySettings = applySettings;

document.body.addEventListener("mousedown", e => {
  switch (e.target?.id) {
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
  console.time("blend");
  let n = Number(blendMaps.value);
  if (mapList.length >= 2) {
    let terrain = lerpMaps(mapList[mapList.length - 2], mapList[mapList.length - 1], n, ["dryElevation", "tectonic"]) as Terrain;
    let blend = generateMap(mapParams, terrain);
    renderMap(blend);
  }
  console.timeEnd("blend");
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


let maps: HTMLCanvasElement[] = [],
  miniMaps: HTMLCanvasElement[] = [];

function showMap(data: Float32Array | RGBA[], title: string, fun: ShowMapF, scale = 1 / 4, altitude?: (i: number) => number) {
  let image = data2image(data, settings.width, fun, altitude);
  let mini = rescaleImage(image, image.width * scale, image.height * scale);
  let ctx = context2d(mini);
  ctx.font = "14px Verdana";
  ctx.fillStyle = "#fff";
  ctx.strokeText(title, 5, 15);
  ctx.fillText(title, 4, 14);

  document.getElementById("minimaps")?.appendChild(mini);
  let id = maps.length;

  if (id == settings.mapMode)
    document.getElementById("map")?.appendChild(image);

  mini.id = "mini_" + id;
  maps.push(image);
  miniMaps.push(mini);
  mini.onclick = () => {
    settings.mapMode = id;
    saveSettings();
    document.getElementById("map")?.setHTMLUnsafe("");
    document.getElementById("map")?.appendChild(image);
  };
}

let generatedMap: LayeredMap;
let mapList: LayeredMap[] = []

document.onmousemove = (e) => {
  let mouseOffset = [e.offsetX, e.offsetY];
  let target = e.target as HTMLCanvasElement;
  let tooltip = document.getElementById("tooltip") as HTMLElement;
  tooltip.style.left = `${Math.min(window.innerWidth - 300, e.screenX + 20)}`;
  tooltip.style.top = `${Math.min(window.innerHeight - 200, e.screenY - 40)}`;

  let isCanvas = target.tagName == "CANVAS";
  let id = target.id;
  tooltip.style.display = isCanvas ? "grid" : tips[id] ? "block" : "none";

  if (isCanvas) {
    let localX = (e.offsetX / target.width) * settings.width;
    let localY = (e.offsetY / target.height) * settings.height;
    let ind = Math.floor(localX) + Math.floor(localY) * settings.width;
    tooltip.innerHTML = Object.keys(generatedMap)
      .map((key) => {
        let v = generatedMap[key][ind];
        return `<div>${key}</div><div>${key == "photo" ? v.map(n => ~~n) : key == "biome" ? biomeNames[v].toUpperCase() : ~~(v*1e6)/1e6}</div>`
      }
      )
      .join("");
  } else if (tips[id]) {
    tooltip.innerHTML = tips[id];
  }
};


function renderMap(generatedMap: LayeredMap) {
  let {
    elevation,
    tectonic,
    rivers,
    wind,
    temperature,
    humidity,
    biome,
    photo,
  } = generatedMap;


  console.time("draw");
  document.getElementById("map")?.setHTMLUnsafe("");
  document.getElementById("minimaps")?.setHTMLUnsafe("");
  maps = [];
  miniMaps = [];

  showMap(
    elevation,
    "elevation",
    elevation2Image({ elevation, rivers }, settings)
    //(v,i) => v>0?[v * 400, 250 - v*150, (v - elevation[i-12*settings.width])*500, 255]:[0,0,100+v*200,255]
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

  if (settings.generatePhoto) {
    showMap(photo, "photo", (v, i) => v, undefined, i => Math.max(1, ~~(elevation[i] * 20) * 2));
  }

  console.timeEnd("draw");

}

let mapParams: MapParams;

function generate(params) {
  mapParams = params;
  console.time("generation total");
  generatedMap = generateMap(params);
  mapList.push(generatedMap);

  renderMap(generatedMap);

  //if (params.generateTileMap)  generateTileMap(generatedMap);

  console.timeEnd("generation total");
}

function generateTileMap(m: LayeredMap) {
  console.time("gamemap");

  let layout: Layout = settings.squareGrid ? SQUARE : AXIAL;

  let gameCanvas = document.getElementById("gameMap") as HTMLCanvasElement;

  if (settings.gameMapScale) {
    let rescale = rescaleCoordinates(
      settings.height,
      settings.width,
      32 / settings.gameMapScale,
      layout
    );

    let hexCoords = rescale.indices;
    let { columns } = rescale;
    let neighborDeltas = createNeighborDeltas(columns, layout);

    console.log(rescale);

    gameCanvas.width = settings.width * settings.gameMapScale + 32;
    gameCanvas.height = settings.height * settings.gameMapScale;

    gameCanvas.style.display = "block";
    gameCanvas.style.width = `${gameCanvas.width}px;`
    gameCanvas.style.height = `${gameCanvas.height}px;`;

    setSeed(settings.seed);

    let { riverDepth, flowsTo } = generatePrettyRivers(
      hexCoords.map((i) => m.elevation[i]),
      hexCoords.map((i) => Math.max(m.humidity[i], m.elevation[i])),
      settings.gameMapRivers,
      neighborDeltas,
      columns
    );

    const WATER = 1,
      ROAD = 2,
      BRIDGE = 3,
      HILLROAD = 4,
      DESERT = 5,
      GRASS = 6,
      SNOW = 7,
      RIVER = 8,
      DIRT = 9,
      STEPPE = 10,
      RIVERDELTA = 11,
      HILL = 30,
      CITY = 31,
      DIRTHILL = 32,
      MOUNTAIN = 33,
      FOREST = 34,
      LIGHTFOREST = 35,
      GRASS1 = 36,
      SNOWHILL = 37,
      DESERTHILL = 38,
      HILLFOREST = 39;

    let tilesetHex = {
      tilesSize: 32,
      connected: [
        [WATER, 0, 0],
        [ROAD, 1, 0],
        [DESERT, 1, 3],
        [DIRT, 2, 0],
        [GRASS, 4, 0],
        [BRIDGE, 5, 0],
        [SNOW, 5, 3],
        [HILLROAD, 6, 0],
        [RIVER, 6, 3],
        [RIVERDELTA, 7, 3],
      ],
      single: [
        [HILL, 3, 1],
        [CITY, 5, 6],
        [DIRTHILL, 3, 5],
        [SNOWHILL, 3, 6],
        [DESERTHILL, 3, 7],
        [MOUNTAIN, 4, 4],
        [FOREST, 3, 3],
        [LIGHTFOREST, 4, 6],
        [HILLFOREST, 4, 7],
        [STEPPE, 7, 1],
        [GRASS1, 4, 3],
      ],
      grouped: [
        [RIVER, RIVERDELTA],
        [ROAD, BRIDGE, HILLROAD],
      ],
      tilesheet: document.getElementById("hexSheet"),
    };

    let tilesetSquare = {
      tilesSize: 32,
      connected: [
        [WATER, 0, 7],
        [ROAD, 0, 3, ISPATH],
        [BRIDGE, 0, 3, ISPATH],
        [DESERT, 8, 0],
        [RIVERDELTA, 8, 3],
        [RIVER, 8, 6],
        [SNOW, 2, 7],
        [GRASS, 4, 7],
      ],
      single: [
        [HILL, 3, 0],
        [DIRTHILL, 3, 1],
        [SNOWHILL, 3, 2],
        [DESERTHILL, 3, 3],
        [CITY, 5, 6],
        [MOUNTAIN, 4, 4],
        [FOREST, 3, 3],
        [LIGHTFOREST, 4, 6],
        [HILLFOREST, 4, 7],
        [STEPPE, 7, 1],
        [GRASS1, 4, 3],
      ],
      grouped: [
        [RIVER, RIVERDELTA],
        [ROAD, BRIDGE, HILLROAD],
      ],
      tilesheet: document.getElementById("squareSheet"),
    };

    type Cell = {
      /** 0 , SNOW or DESERT */
      cover: number;
      /** 0, HILL or MOUNTAIN*/
      highlands: number;
      /** 0, WATER or RIVER*/
      water: number;
      /** if river, next cells it flows to. otherwise, 0*/
      river: number;
      /** 0 or FOREST*/
      vegetation: number;
      /** 0 or ROAD*/
      road: number;
      /** 0 or CITY*/
      building: number;
      empty: boolean
    }

    let gameMap = hexCoords.map((i, hexi) => {
      let c = {} as Cell;

      let [e, h, t] = [m.elevation[i], m.humidity[i], m.temperature[i]];

      if (h == 0) {
        return { empty: true };
      }

      c.cover = 0;
      if (t < random() * 0.2 - 0.1) c.cover = SNOW;
      else if (h < 0.25 && t > 20) c.cover = DESERT;

      let water = e < 0;

      c.highlands = 0;
      if (!water && m.tectonic[i] + e > 1.3 + spread(0.8)) {
        if (e > 0.6 + spread(0.2)) c.highlands = MOUNTAIN;
        else c.highlands = HILL;
      }

      let river = riverDepth[hexi] > 3;

      if (
        h > 0.6 + spread(0.4) &&
        !water &&
        !river &&
        c.highlands != MOUNTAIN
      ) {
        c.vegetation = LIGHTFOREST;
      }

      if (!c.cover && !c.vegetation && h > 0.4) c.cover = GRASS;

      if (water) c.water = river ? RIVERDELTA : WATER;

      if (river) c.river = flowsTo[hexi];

      return c;
    }) as Cell[];

    let cities: number[] = [];
    gameMap.forEach((c: Cell, i: number) => {
      let quality =
        10 +
        (c.empty ? -10000 : 0) +
        (c.water ? -1000 : 0) +
        (c.river ? 10 : 0) +
        (c.highlands == MOUNTAIN ? -1000 : 0) +
        (c.highlands == HILL ? -10 : 0) +
        (c.highlands == DESERT ? -10 : 0);
      let row = Math.floor(i / columns);
      for (let delta of neighborDeltas[row % 2]) {
        let neighbor = gameMap[i + delta];
        quality +=
          (c.river ? 10 : 0) +
          (c.water ? 50 : 0) +
          (c.water == RIVERDELTA ? 50 : 0) +
          (c.cover == 0 ? 10 : 0);
      }
      if (quality / 400 > random()) {
        for (let other of cities) {
          if (distanceBetweenCells(other, i, columns, layout) < 5) return;
        }
        c.building = CITY;
        c.road = ROAD;
        c.vegetation = 0;
        cities.push(i);
      }
    });

    console.time("roads");
    let pathfindingDeltas = layout == SQUARE ? createNeighborDeltas(columns, SQUARE8) : neighborDeltas;
    for (let start of cities) {
      let end = cities[Math.floor(random() * cities.length)];
      let path = shortestPath(
        gameMap,
        start,
        end,
        columns,
        pathfindingDeltas,
        (c) =>
          !c || c.empty
            ? 1000000
            : c.road
              ? 5
              : c.water
                ? 500
                : c.river
                  ? 100
                  : c.highlands == MOUNTAIN
                    ? 2000
                    : c.highlands
                      ? 100
                      : 30
      );
      if (path)
        for (let c of path) {
          gameMap[c].road = ROAD;
          if (gameMap[c].vegetation == FOREST)
            gameMap[c].vegetation = LIGHTFOREST;
        }
    }
    console.timeEnd("roads");

    let tiles = gameMap.map((c) => {
      let sprites = [GRASS1];

      if (c.cover) sprites.push(c.cover);

      if (c.highlands == HILL) {
        if (!c.road)
          sprites.push(
            c.cover == DESERT ? DIRTHILL : c.cover == SNOW ? SNOWHILL : HILL
          );
      } else if (c.highlands == MOUNTAIN) {
        sprites.push(MOUNTAIN);
      }

      if (c.river) sprites.push(RIVER);

      if (c.water) {
        if (c.water == RIVERDELTA) {
          sprites.push(WATER);
        }
        sprites.push(c.water);
      }

      if (c.road)
        sprites.push(
          c.river || c.water ? BRIDGE : c.highlands ? HILLROAD : ROAD
        );

      if (c.vegetation == LIGHTFOREST)
        sprites.push(c.highlands && !c.road ? HILLFOREST : LIGHTFOREST);

      if (c.vegetation == FOREST) sprites.push(FOREST);

      if (c.vegetation == FOREST) sprites.push(FOREST);

      if (c.building) sprites.push(c.building);

      return sprites;
    });

    drawTerrain(
      gameCanvas.getContext("2d"),
      tiles,
      { [RIVER]: flowsTo },
      columns,
      layout == SQUARE ? tilesetSquare : tilesetHex,
      layout
    );
  } else {
    gameCanvas.style.display = `none`;
  }

  console.timeEnd("gamemap");
}
function lerpRGBA(arg0: any, arg1: any, n: number): any {
  throw new Error("Function not implemented.");
}

