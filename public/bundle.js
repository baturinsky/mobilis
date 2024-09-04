"use strict";
(() => {
  // src/geometry.ts
  var SQUARE = 0;
  var ODDR = 1;
  var WIDTH2 = 2;
  var AXIAL = 3;
  var SQUARE8 = 4;
  function createNeighborDeltas(columns, layout) {
    let r;
    switch (layout) {
      case SQUARE:
        r = [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0]
        ].map(([dx, dy]) => dy * columns + dx);
        return [r, r];
      case SQUARE8:
        r = [
          [0, -1],
          [1, -1],
          [1, 0],
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [-1, -1]
        ].map(([dx, dy]) => dy * columns + dx);
        return [r, r];
      case ODDR:
        return [
          [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1]
          ],
          [
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 0],
            [0, -1]
          ]
        ].map((n) => n.map(([dx, dy]) => dy * columns + dx));
      case WIDTH2:
        r = [
          [1, -1],
          [2, 0],
          [1, 1],
          [-1, 1],
          [-2, 0],
          [-1, -1]
        ].map(([dx, dy]) => dy * columns + dx);
        return [r, r];
      case AXIAL:
        r = [
          [0, -1],
          [1, 0],
          [1, 1],
          [0, 1],
          [-1, 0],
          [-1, -1]
        ].map(([dx, dy]) => dy * columns + dx);
        return [r, r];
    }
  }

  // src/worldgen.ts
  function lerp(a, b, n) {
    return a * (1 - n) + b * n;
  }
  function clamp(a, b, n) {
    return n < a ? a : n > b ? b : n;
  }
  function clampRGBA(rgba) {
    for (let c of [0, 1, 2])
      rgba[c] = clamp(0, 255, rgba[c]);
  }
  var randomSeed = 6;
  function random() {
    let x = Math.sin(randomSeed) * 1e4;
    randomSeed = (randomSeed + Math.E) % 1e8;
    return x - Math.floor(x);
  }
  function coord2ind([x, y], width) {
    return ~~x + ~~y * width;
  }
  function context2d(canvas) {
    return canvas.getContext("2d");
  }
  function createCanvasCtx(width, height) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${canvas.width * devicePixelRatio}px`;
    canvas.style.height = `${canvas.height * devicePixelRatio}px`;
    let ctx = context2d(canvas);
    return { canvas, ctx };
  }
  function image2alpha(canvas) {
    let ctx = context2d(canvas);
    let idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = idata.data;
    let values = new Float32Array(data.length / 4);
    for (let i = 0; i < data.length; i++) values[i] = data[i * 4 + 3] / 255;
    return values;
  }
  function gradientNoise(width, height, points = 5e3, radius = 100, alpha = 0.01, gradientCircles = true) {
    let { canvas, ctx } = createCanvasCtx(width, height);
    if (gradientCircles) {
      let g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      g.addColorStop(1, `rgba(255, 255, 255, 0)`);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    }
    for (let i = 0; i < points; i++) {
      let points2 = [...Array(3)].map(() => random());
      let [x, y] = [points2[0] * width, points2[1] * height];
      let r = Math.pow(points2[2], 2) * radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(random() * Math.PI);
      ctx.scale(r * (0.5 + random()), r * (0.5 + random()));
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return canvas;
  }
  function addFilter(srcCanvas, filter) {
    let { canvas, ctx } = createCanvasCtx(srcCanvas.width, srcCanvas.height);
    ctx.filter = filter;
    ctx.drawImage(srcCanvas, 0, 0);
    return canvas;
  }
  function approximateQuantile(values, level = 0.5, picks = 1e3) {
    if (!values)
      debugger;
    let l = values.length;
    let picked = [...Array(picks)].map(() => values[Math.floor(random() * l)]);
    picked = picked.sort();
    return picked[Math.floor(level * picked.length)];
  }
  function normalizeValues(values, picks = 1e3) {
    let l = values.length;
    let picked = [...Array(picks)].map(() => values[Math.floor(random() * l)]);
    let max = 0;
    for (let v of picked) if (v > max) max = v;
    return values.map((v) => v / max);
  }
  var gen = ({ width, height }, smoothness, points, radius, alpha) => image2alpha(addFilter(
    gradientNoise(
      width,
      height,
      points,
      Math.sqrt(width * width + height * height) * radius,
      alpha
    ),
    `blur(${smoothness}px)`
  ));
  function generateTerrain(params) {
    let {
      width,
      height,
      seed,
      noiseSmoothness,
      tectonicSmoothness,
      noiseFactor,
      crustFactor,
      tectonicFactor,
      pangaea
    } = params;
    randomSeed = seed;
    const mapSize = width * height;
    console.time("noise");
    let noise = gen(params, noiseSmoothness, 3e3, 0.15, 0.03);
    let crust = gen(params, tectonicSmoothness, 2e3, 0.15, 0.03);
    let tectonicMul = gen(params, tectonicSmoothness, 2e3, 0.15, 0.03);
    console.timeEnd("noise");
    console.time("main");
    let tectonicMedian = approximateQuantile(crust, 0.5);
    let tectonic = crust.map(
      (v, i) => {
        let t = (0.2 / (Math.abs(tectonicMedian - v) + 0.1) - 0.95) * (tectonicMul[i] - 0.2) * 2;
        return t;
      }
    );
    let elevationFloats = crust.map(
      (_, i) => 5 + noise[i] * noiseFactor + crust[i] * crustFactor + tectonic[i] * tectonicFactor + -pangaea * (Math.abs(i / mapSize - 0.5) + Math.abs(i % width / width - 0.5))
    );
    console.timeEnd("main");
    console.time("normalize");
    for (let pass = 4; pass--; ) {
      for (let i = width; i < elevationFloats.length; i++) {
        for (let n of [-2, 2, -width * 2, width * 2]) {
          elevationFloats[i] += ((elevationFloats[i + n] || 0) - elevationFloats[i]) * 0.15;
        }
      }
    }
    let dryElevation = normalizeValues(elevationFloats);
    console.timeEnd("normalize");
    return { dryElevation, tectonic, p: params };
  }
  function generateMap(params, terrain) {
    terrain ??= generateTerrain(params);
    let lm = generateAtmosphere(params, terrain);
    return lm;
  }
  function generateAtmosphere(params, terrain) {
    let {
      width,
      height,
      averageTemperature,
      biomeScrambling,
      erosion,
      riversShown,
      randomiseHumidity,
      generatePhoto,
      shading,
      noiseSmoothness,
      seaRatio,
      flatness,
      noiseSeed,
      elevationCold
    } = params;
    randomSeed = noiseSeed;
    let noise = gen(params, noiseSmoothness, 3e3, 0.15, 0.01);
    let { dryElevation, tectonic } = terrain;
    const mapSize = width * height;
    let seaLevel = approximateQuantile(dryElevation, seaRatio);
    let elevation = dryElevation.map(
      (v, i) => v < seaLevel ? -Math.pow(1 - v / seaLevel, 0.35) : Math.pow(
        (v - seaLevel) * (0.5 + tectonic[i] * 0.5) / (1 - seaLevel),
        1 + 2 * flatness
      )
    );
    let wind = elevation.map(
      (h, i) => Math.cos((Math.abs(0.5 - i / mapSize) * 4 + 0.85) * Math.PI) / (h < 0 ? 1 : 1 + 5 * h * h)
    );
    console.time("windSmoothing");
    wind = image2alpha(
      addFilter(
        data2image(wind, width, (v) => [0, 0, 0, 127 * (v + 1)]),
        "blur(3px)"
      )
    ).map((v) => v * 2 - 1);
    console.timeEnd("windSmoothing");
    let rivers = generateRiversAndErosion({
      width,
      height,
      elevation,
      tectonic,
      erosion,
      riversShown
    });
    let humidity = generateHumidity({ width, elevation, wind, steps: 400 });
    if (randomiseHumidity) {
      humidity = humidity.map(
        (v, i) => Math.max(0, v + Math.sin(noise[i] * 50) / 10 - elevation[i] * 0.2)
      );
    }
    let temperature = elevation.map(
      (e, i) => averageTemperature + 25 - 100 * Math.abs(0.5 - i / mapSize) / (0.7 + 0.6 * humidity[i]) - Math.max(0, e) * elevationCold
    );
    console.time("biome");
    let biome = temperature.map((t, i) => {
      let e = elevation[i];
      if (e < -0.4)
        return OCEAN;
      if (e < -0)
        return COAST;
      let scramble = 1 + biomeScrambling * Math.sin(noise[i] * 100);
      let b = biomeTable[~~clamp(0, 5, humidity[i] * 4.5 * scramble)][~~clamp(0, 3, t * scramble / 10 + 1)];
      if (b == TUNDRA && elevation[i] > 0.5) b = MOUNTAIN;
      return b;
    });
    console.timeEnd("biome");
    let folds = [...humidity], shades = [...humidity];
    let photo;
    if (generatePhoto) {
      let lerpTo = function(b, n) {
        if (!b)
          return;
        for (let i of [0, 1, 2])
          rgba[i] = lerp(rgba[i], b[i], n);
      };
      console.time("photo");
      let rgba;
      photo = [...humidity].map((hum, i) => {
        let ele = elevation[i];
        if (ele < 0) {
          return [-(ele ** 2) * 1e3 + 100, -(ele ** 2) * 500 + 150, -(ele ** 2) * 300 + 150, 255];
        } else {
          rgba = [
            temperature[i] * 15 - hum * 700,
            150 - hum * 150,
            temperature[i] * 8 - hum * 500,
            255
          ];
          clampRGBA(rgba);
          let et = (ele + tectonic[i]) * 2 - 1;
          if (et > 0) {
            lerpTo([64, 0, 0, 255], Math.min(1.5, et ** 2));
          }
          let fold = (1 + Math.sin((noise[i] * 3 + tectonic[i]) * 100)) * (1 + random());
          fold = (Math.sin(noise[i] * 100) + 0.5) * fold ** 2 * 0.05;
          lerpTo([32, 32, 32], fold);
          folds[i] = 0;
          if (rivers[i]) {
            rgba = [0, 100, 150 + 50 * rivers[i], 255];
          }
          for (let r of [1, 2, 3])
            for (let d of [1, width, -1, -width, 0]) {
              lerpTo(biomeColors[biome[i + d * r]], 0.05);
            }
          if (temperature[i] < 0) {
            lerpTo([500, 500, 500], -temperature[i] * 0.03);
          }
          clampRGBA(rgba);
          if (shading) {
            let s = 0;
            for (let dx = -2; dx <= 2; dx++)
              for (let dy = -2; dy <= 2; dy++) {
                s += elevation[i + dx + width * dy] * (Math.sign(dx) + Math.sign(dy));
              }
            let shade = elevation[i + 1 + width] + elevation[i + width] + elevation[i + 1] - ele - elevation[i - width] - elevation[i - 1] + s * 0.05;
            if (rivers[i] == 0 && rivers[i + width] != 0)
              shade -= 0.1;
            lerpTo([500, 500, 260], -shade);
            shades[i] = shade;
          }
          return rgba;
        }
      });
      console.timeEnd("photo");
    }
    let layeredMap = {
      tectonic,
      dryElevation,
      elevation,
      noise,
      rivers,
      wind,
      temperature,
      humidity,
      biome,
      folds,
      photo,
      shades,
      p: params,
      poi: []
    };
    populate(layeredMap);
    return layeredMap;
  }
  function htow(elevation, width, blur = 20) {
    let height = elevation.length / width;
    let humidityImage = data2image(elevation, width, (v, i) => [
      0,
      0,
      0,
      v <= 0 ? 100 : 0
    ]);
    let wetness = createCanvasCtx(width, height);
    let wc = wetness.ctx;
    wc.beginPath();
    wc.lineWidth = width / 8;
    wc.rect(0, 0, width, height);
    wc.stroke();
    wc.filter = `blur(${blur}px)`;
    wc.filter = "opacity(50%)";
    wc.drawImage(humidityImage, 0, 0);
    return { humidityImage, wetness: wetness.canvas };
  }
  function generateHumidity({ width, elevation, wind, steps }) {
    console.time("humidity");
    let height = elevation.length / width;
    const mapDiagonal = Math.sqrt(width * width + height * height);
    let { humidityImage, wetness } = htow(elevation, width, 10);
    const spotSize = mapDiagonal / 10;
    for (let i = 0; i < steps; i++) {
      let start = [i % 100 / 100 * width, i % 10 / 10 * height];
      let windThere = wind[coord2ind(start, width)];
      let end = [
        start[0] + windThere * 0.3 * width / 8,
        start[1] + Math.abs(windThere) * 0.5 * height / 12
      ];
      wetness.getContext("2d")?.drawImage(
        wetness,
        start[0],
        start[1],
        spotSize,
        spotSize,
        end[0],
        end[1],
        spotSize,
        spotSize
      );
    }
    context2d(humidityImage).filter = "blur(30px)";
    context2d(humidityImage).drawImage(
      wetness,
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height
    );
    let humidity = image2alpha(humidityImage);
    console.timeEnd("humidity");
    return humidity;
  }
  function generateRiversAndErosion({
    width,
    height,
    elevation,
    erosion,
    riversShown
  }) {
    console.time("rivers");
    let { wetness } = htow(elevation, width, 100);
    let wi = image2alpha(wetness);
    let e = elevation.map((v, i) => 1 - v - wi[i] * 0.3);
    let rivers = new Float32Array(width * height);
    let neighbors = createNeighborDeltas(width, SQUARE8)[0];
    for (let streamIndex = 0; streamIndex < erosion + riversShown; streamIndex++) {
      let current = streamIndex * 12345 % elevation.length;
      let path = [];
      let limit = 1e3;
      while (elevation[current] > -0.1 && limit-- > 0) {
        if (streamIndex > erosion) {
          rivers[current] += 1;
        }
        let currentElevation = e[current];
        let lowestNeighbor = 0, lowestNeighborElevation = 1e6;
        for (let neighborDelta of neighbors) {
          if (e[current + neighborDelta] <= lowestNeighborElevation) {
            lowestNeighbor = current + neighborDelta;
            lowestNeighborElevation = e[lowestNeighbor];
          }
        }
        if (lowestNeighborElevation < currentElevation) {
          let red = (e[current] - lowestNeighborElevation) * 0.01;
          for (let d of [0, 0, -1, 1, -width, width]) {
            elevation[current + d] -= red;
            e[current + d] -= red;
          }
        } else {
          e[current] = lowestNeighborElevation + 0.05;
        }
        path.push(current);
        current = lowestNeighbor;
      }
    }
    for (let i in elevation) {
      if (elevation[i] > -0.2 && elevation[i] < 0) {
        elevation[i] = elevation[i] > -0.1 ? 0.01 : elevation[i] * 2 + 0.2;
      }
      if (elevation[i] > 0)
        elevation[i] *= 1 + random() * 0.1;
    }
    console.timeEnd("rivers");
    return rivers;
  }
  function mapToList(m2) {
    let l = [];
    for (let k in m2) {
      l[k] = m2[k];
    }
    return l;
  }
  function colorFromRGB16String(color) {
    let n = parseInt(color, 16);
    let c = [Math.floor(n / 256) * 16, Math.floor(n / 16) % 16 * 16, n % 16 * 16, 256];
    return c;
  }
  var DESERT = 1;
  var GRASSLAND = 2;
  var TUNDRA = 3;
  var SAVANNA = 4;
  var SHRUBLAND = 5;
  var TAIGA = 6;
  var TROPICAL_FOREST = 7;
  var TEMPERATE_FOREST = 8;
  var RAIN_FOREST = 9;
  var SWAMP = 10;
  var SNOW = 11;
  var STEPPE = 12;
  var CONIFEROUS_FOREST = 13;
  var MOUNTAIN = 14;
  var BEACH = 15;
  var COAST = 16;
  var OCEAN = 17;
  var biomeTable = [
    [TUNDRA, STEPPE, SAVANNA, DESERT],
    [TUNDRA, SHRUBLAND, GRASSLAND, SAVANNA],
    [SNOW, SHRUBLAND, GRASSLAND, TEMPERATE_FOREST],
    [SNOW, CONIFEROUS_FOREST, TEMPERATE_FOREST, TROPICAL_FOREST],
    [TAIGA, CONIFEROUS_FOREST, TROPICAL_FOREST, TROPICAL_FOREST],
    [TAIGA, CONIFEROUS_FOREST, TROPICAL_FOREST, RAIN_FOREST]
  ];
  var biomeNames = [
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
    "coast",
    "ocean"
  ];
  var biomeAnimal = " ,\u{1F42A},\u{1F402},\u{1F43B}\u200D\u2744\uFE0F,\u{1F992},\u{1F98A},\u{1F43A},\u{1F406},\u{1F98C},\u{1F418},\u{1F40A},\u{1F43E},\u{1F40E},\u{1F98C},\u{1F40F},\u{1F980},\u{1F420},\u{1F40B},".split(",");
  var biomeEmoji = " ,\u{1F335},\u{1F33B},\u2744\uFE0F,\u{1F33F},\u{1F342},\u{1F332},\u{1F334},\u{1F333},\u{1F334},\u{1F331},\u26C4,\u{1F33E},\u{1F332},\u26F0\uFE0F,\u{1F3D6}\uFE0F,\u{1F3DE}\uFE0F,\u{1F30A}".split(",");
  console.log(biomeEmoji, biomeEmoji.map((a) => a.length));
  var biomeColors = mapToList({
    [DESERT]: "fa0",
    [GRASSLAND]: "4f4",
    [SAVANNA]: "ff8",
    [TUNDRA]: "cca",
    [SHRUBLAND]: "ad4",
    [TAIGA]: "064",
    [TROPICAL_FOREST]: "0a0",
    [TEMPERATE_FOREST]: "060",
    [RAIN_FOREST]: "084",
    [SWAMP]: "880",
    [SNOW]: "fff",
    [STEPPE]: "caa",
    [CONIFEROUS_FOREST]: "0a6",
    [MOUNTAIN]: "884",
    [BEACH]: "ff0"
  }).map(colorFromRGB16String);
  function data2image(values, width, converter, altitudes) {
    let height = values.length / width;
    let { canvas, ctx } = createCanvasCtx(width, height);
    let idata = ctx.createImageData(width, height);
    if (!idata.data || !values)
      debugger;
    for (let i = 0; i < values.length; i++) {
      let h = 0;
      let v = converter ? converter(values[i], i) ?? 0 : [0, 0, 0, values[i]];
      idata.data.set(v, i * 4);
    }
    ctx.putImageData(idata, 0, 0);
    return canvas;
  }
  function elevation2Image({ elevation, rivers }, any) {
    rivers ??= [];
    return (v, i) => {
      let level = elevation[i];
      if (v > 0) {
        return [250 - level * 300, 200 - level * 300, rivers[i] * 100, 255];
      } else {
        return [0, level * 60 + 60, level * 80 + 100, 255];
      }
    };
  }
  function rescaleImage(source, width, height) {
    let { canvas, ctx } = createCanvasCtx(width, height);
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, width, height);
    return canvas;
  }
  function populate(m2) {
    m2.poi = [];
    for (let i = 400; i--; ) {
      let at = [~~(random() * m2.p.width), ~~(random() * m2.p.height)];
      let ind = coord2ind(at, m2.p.width);
      let biome = m2.biome[ind];
      let icon = i % 2 ? biomeAnimal[biome] : biomeEmoji[biome];
      let p = { at, icon };
      m2.poi.push(p);
    }
    console.log(m2.poi);
  }

  // src/prog.ts
  var parameters = [
    ["seed", "number", { tip: "Seed for tectonics." }],
    ["noiseSeed", "number", { tip: "Seed for other." }],
    ["width", "number", { tip: "Map width in pixels" }],
    ["height", "number", { tip: "Map height in pixels" }],
    [
      "noiseSmoothness",
      "range",
      { max: 10, step: 0.5, tip: "Smootheness of the elevation noise" }
    ],
    [
      "tectonicSmoothness",
      "range",
      {
        max: 10,
        step: 0.5,
        tip: "Smootheness of the noise that is used for tectonic plates simulation"
      }
    ],
    [
      "noiseFactor",
      "range",
      {
        min: -5,
        max: 20,
        step: 0.5,
        tip: "Weight of the 'general purpose' elevation noise"
      }
    ],
    [
      "crustFactor",
      "range",
      {
        min: -5,
        max: 20,
        step: 0.5,
        tip: "Weight of the 'tectonic plates' noise. Increase to have more mountains on the edge on continents, reduce to have them inside."
      }
    ],
    [
      "tectonicFactor",
      "range",
      {
        min: -1,
        max: 10,
        step: 0.1,
        tip: "Amount of mountains and island chains and such"
      }
    ],
    [
      "pangaea",
      "range",
      {
        min: -5,
        max: 5,
        tip: "Increasing this will make land gravitate the centre of the map, and vice versa"
      }
    ],
    ["seaRatio", "range", { tip: "Sea percentage" }],
    [
      "flatness",
      "range",
      { tip: "Initial flatness of the non-mountain areas" }
    ],
    ["randomiseHumidity", "checkbox"],
    ["averageTemperature", "range", { min: -30, max: 50, step: 1 }],
    ["elevationCold", "range", { min: 0, max: 300, step: 1 }],
    [
      "erosion",
      "range",
      { max: 1e5, tip: "How long water-caused erosion will be simulated" }
    ],
    [
      "riversShown",
      "range",
      {
        max: 1e3,
        tip: "Amount of rivers and lakes shown on elevation, humidity and biome maps"
      }
    ],
    ["biomeScrambling", "range", { tip: "Adds randomness to biomes" }],
    ["SET gameMapScale TO NOT 0 IF YOU WANT A GAME MAP", "tip"],
    ["squareGrid", "checkbox"],
    ["gameMapScale", "range", { min: 0, max: 4, step: 1 }],
    [
      "gameMapRivers",
      "range",
      {
        max: 5e4,
        step: 1e3,
        tip: "How many rivers will there be on the low-res (hex) map"
      }
    ],
    ["Graphical repesenation settings", "tip"],
    ["generatePhoto", "checkbox"],
    ["discreteHeights", "range", { max: 40, step: 1 }],
    ["terrainTypeColoring", "checkbox"],
    ["shading", "checkbox"],
    ["generateTileMap", "checkbox"]
  ];
  var defaultSettings = {
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
    erosion: 5e4,
    riversShown: 400,
    biomeScrambling: 0,
    terrainTypeColoring: 0,
    discreteHeights: 0,
    hillRatio: 0.12,
    mountainRatio: 0.04,
    gameMapRivers: 15e3,
    gameMapScale: 2,
    generatePhoto: 1,
    squareGrid: 0
  };
  var settings = {};
  function init() {
    if (document.location.hash) {
      settings = {};
      let records = document.location.hash.substr(1).split("&").map((s) => s.split("="));
      console.log(records);
      for (let ss of records) {
        settings[ss[0]] = ss[1] == "false" ? false : ss[1] == "true" ? true : Number(ss[1]);
      }
      console.log(settings);
    }
    if (!settings || !settings.width)
      settings = JSON.parse(localStorage.mapGenSettings);
    if (!settings || !settings.width)
      settings = { ...defaultSettings };
    rebuildForm();
    applySettings();
  }
  window.onload = init;
  window["resetSettings"] = () => {
  };
  function applySettings() {
    for (let [id, type] of parameters) {
      if (type == "tip") continue;
      let element = document.getElementById(id);
      settings[id] = element.type == "checkbox" ? element.checked ? 1 : 0 : Number(element.value);
      let id_value = document.getElementById(id + "_value");
      if (id_value) id_value.innerText = String(settings[id]).substr(0, 8);
    }
    saveSettings();
    generate(settings);
  }
  window["applySettings"] = applySettings;
  document.body.addEventListener("mousedown", (e) => {
    switch (e.target?.id) {
      case "resetSettings":
        settings = { ...defaultSettings };
        rebuildForm();
        applySettings();
        return;
    }
  });
  function lerpMaps(a, b, n, fields) {
    let c = {};
    for (let k of fields ?? Object.keys(a)) {
      c[k] = new Float32Array(a[k].length);
      let aa = a[k], bb = b[k];
      if (k == "photo" || k == "biome") {
        for (let i in aa) {
          c[k][i] = lerpRGBA(aa[i], bb[i], n);
        }
      } else {
        for (let i in aa) {
          c[k][i] = aa[i] * (1 - n) + bb[i] * n;
        }
      }
    }
    return c;
  }
  blendMaps.onchange = (e) => {
    let n = Number(blendMaps.value);
    if (mapList.length >= 2) {
      console.time("blend");
      let terrain = lerpMaps(mapList[mapList.length - 2], mapList[mapList.length - 1], n, ["dryElevation", "tectonic"]);
      console.timeEnd("blend");
      console.time("blendGen");
      let blend = generateMap(mapParams, terrain);
      console.timeEnd("blendGen");
      renderMap(blend);
    }
  };
  var tips = {};
  function rebuildForm() {
    let form = document.getElementById("form");
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
          form.innerHTML += `<div>${id}</div><input class="checkbox" type="checkbox" id="${id}" ${settings[id] ? "checked" : ""} />`;
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
    document.location.hash = Object.keys(settings).map((k) => `${k}=${settings[k]}`).join("&");
    localStorage.mapGenSettings = JSON.stringify(settings);
  }
  var maps = [];
  var minis;
  var mainCanvas;
  function showMap(data, title, fun, scale = 1 / 4, altitude) {
    let canvas = data2image(data, settings.width, fun, altitude);
    let mini = rescaleImage(canvas, canvas.width * scale, canvas.height * scale);
    let ctx = mini.getContext("2d");
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
  var m;
  var mapList = [];
  var mapScroll = [0, 0];
  var mouseAt;
  document.onmousemove = (e) => {
    let move = [e.movementX, e.movementY];
    if (e.target == mainCanvas && e.buttons) {
      mapScroll[0] += move[0] * devicePixelRatio;
      mapScroll[1] += move[1] * devicePixelRatio;
      rescale();
    }
    let target = e.target;
    let tooltip = document.getElementById("tooltip");
    tooltip.style.left = `${Math.min(window.innerWidth - 300, e.screenX + 20)}`;
    tooltip.style.top = `${Math.min(window.innerHeight - 200, e.screenY - 40)}`;
    let isCanvas = target.tagName == "CANVAS";
    let id = target.id;
    tooltip.style.display = isCanvas ? "grid" : tips[id] ? "block" : "none";
    if (isCanvas) {
      mouseAt = [
        e.offsetX / target.width * settings.width,
        e.offsetY / target.height * settings.height
      ];
      let ind = coord2ind(mouseAt, settings.width);
      tooltip.innerHTML = Object.keys(m).map(
        (key) => {
          let v = m[key][ind];
          return `<div>${key}</div><div>${key == "photo" ? v?.map((n) => ~~n) : key == "biome" ? v + " " + biomeEmoji[v] + biomeAnimal[v] + biomeNames[v]?.toUpperCase() : ~~(v * 1e6) / 1e6}</div>`;
        }
      ).join("");
    } else if (tips[id]) {
      tooltip.innerHTML = tips[id];
    }
  };
  var zoom = 1;
  main.onwheel = (e) => {
    let old = zoom;
    zoom += (e.deltaY > 0 ? -1 : 1) * 1 / 8;
    zoom = zoom < 0 ? 0 : zoom;
    console.log(zoom, mapScroll);
    mapScroll[0] = (mapScroll[0] - 400) * 2 ** (zoom - old) + 400;
    mapScroll[1] = (mapScroll[1] - 400) * 2 ** (zoom - old) + 400;
    e.preventDefault();
    e.stopPropagation();
    rescale();
  };
  function renderMap(m2) {
    let {
      elevation,
      dryElevation,
      tectonic,
      rivers,
      wind,
      temperature,
      humidity,
      biome
    } = m2;
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
      elevation2Image({ elevation: elevation.map((v) => v / 3 + 0.3), rivers: void 0 }, settings)
    );
    showMap(tectonic, "tectonics", (v, i) => [0, 0, 0, v * 255]);
    showMap(temperature, "temperature", (v, i) => [
      v * 5 + 100,
      255 - Math.abs(v - 5) * 10,
      155 - v * 5,
      255
    ]);
    showMap(wind, "wind", (v, i) => [v * 100, 0, -v * 100, 255]);
    showMap(
      humidity,
      "humidity",
      (v, i) => rivers[i] && elevation[i] > 0 ? [0, 0, 0, 255] : i % settings.width < 20 ? [wind[i] * 100, 0, -wind[i] * 100, 255] : elevation[i] < 0 ? [0, 0, 0, 255] : [300 - v * 1e3, elevation[i] * 200 + 50, v * 350 - 150, 255]
    );
    showMap(
      biome,
      "biome",
      (v, i) => elevation[i] < 0 || rivers[i] ? [0, 40, 80, 255] : biomeColors[v]
    );
    if (settings.generatePhoto) {
      showMap(m2.photo, "photo", (v) => v, void 0, (i) => Math.max(1, ~~(elevation[i] * 20) * 2));
      for (let p of m2.poi) {
        let d = document.createElement("div");
        d.classList.add("poi");
        d.innerHTML = p.icon;
        p.div = d;
        main.appendChild(d);
      }
    }
    console.timeEnd("draw");
    rescale();
  }
  var mapParams;
  function rescale() {
    mainCanvas.style.transform = `translate(${mapScroll[0]}px, ${mapScroll[1]}px) scale(${2 ** zoom})`;
    for (let p of m.poi) {
      let d = p.div;
      if (d) {
        d.style.left = `${p.at[0] * 2 ** zoom + mapScroll[0] - 8}px`;
        d.style.top = `${p.at[1] * 2 ** zoom + mapScroll[1] - 8}px`;
      }
    }
  }
  function generate(params) {
    mapParams = params;
    console.time("generation total");
    m = generateMap(params);
    mapList.push(m);
    renderMap(m);
    console.timeEnd("generation total");
  }
  function lerpRGBA(arg0, arg1, n) {
    throw new Error("Function not implemented.");
  }
})();
