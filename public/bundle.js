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
  function dist(a, b) {
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5;
  }
  function lerpXY(a, b, n) {
    return [lerp(a[0], b[0], n), lerp(a[1], b[1], n)];
  }
  function random() {
    let x = Math.sin(randomSeed) * 1e4;
    randomSeed = (randomSeed + Math.E) % 1e8;
    return x - Math.floor(x);
  }
  function coord2ind([x, y], width = settings.width) {
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
    console.time("generateMap");
    terrain ??= generateTerrain(params);
    let lm = generateAtmosphere(params, terrain);
    console.timeEnd("generateMap");
    return lm;
  }
  function generateAtmosphere(params, terrain) {
    let {
      width,
      height,
      averageTemperature,
      erosion,
      riversShown,
      randomiseHumidity,
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
    let layeredMap = {
      tectonic,
      dryElevation,
      elevation,
      noise,
      rivers,
      wind,
      temperature,
      humidity,
      p: params,
      poi: []
    };
    layeredMap.biome = generateBiome(layeredMap);
    layeredMap.photo = generatePhoto(layeredMap);
    return layeredMap;
  }
  function generateBiome(m2) {
    console.time("biome");
    let biome = m2.temperature.map((t, i) => {
      let e = m2.elevation[i];
      if (e < -0) return OCEAN;
      if (m2.rivers[i]) return LAKE;
      let scramble = 1 + m2.p.biomeScrambling * Math.sin(m2.noise[i] * 100);
      let b = biomeTable[~~clamp(0, 5, m2.humidity[i] * 4.5 * scramble)][~~clamp(0, 3, t * scramble / 10 + 1)];
      if (m2.elevation[i] > 0.4) b = MOUNTAIN;
      return b;
    });
    console.timeEnd("biome");
    return biome;
  }
  function generatePhoto(m2) {
    let { humidity, elevation, temperature, tectonic, noise, rivers, biome } = m2;
    let { width, shading } = m2.p;
    let folds = [...humidity], shades = [...humidity];
    let photo;
    console.time("photo");
    let rgba;
    function lerpTo(b, n) {
      if (!b)
        return;
      for (let i of [0, 1, 2])
        rgba[i] = lerp(rgba[i], b[i], n);
    }
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
    return photo;
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
      let windThere = wind[coord2ind(start)];
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
  function rescaleImage(source, width, height) {
    let { canvas, ctx } = createCanvasCtx(width, height);
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, width, height);
    return canvas;
  }
  function lerpMaps(a, b, n, fields) {
    let c = {};
    for (let k of fields ?? Object.keys(a)) {
      c[k] = new Float32Array(a[k].length);
      let aa = a[k], bb = b[k];
      for (let i in aa) {
        c[k][i] = aa[i] * (1 - n) + bb[i] * n;
      }
    }
    return c;
  }
  function blendFull(a, b, n) {
    console.time("blend");
    let terrain = lerpMaps(a, b, n, ["dryElevation", "tectonic"]);
    console.timeEnd("blend");
    console.time("blendGen");
    let averageTemperature = a.p.averageTemperature + Math.sin(n * Math.PI * 2) * 20;
    let m2 = generateMap({ ...a.p, averageTemperature }, terrain);
    console.timeEnd("blendGen");
    return m2;
  }

  // src/scenario.ts
  var categories = {};
  var scenario2 = {
    /**pop weight */
    pw: 0.5,
    /**storage item  weight */
    sw: 0.05,
    /**Local research multiplier */
    lrm: 0.1,
    /**age by week */
    abw: 0.02,
    /**research per book */
    rpb: 0.1,
    /**research per book for focused*/
    rpbf: 1,
    popspd: 0.01,
    /**POI deposit sizes */
    psz: 1e3,
    /**Blended maps per cycle */
    blnd: 13,
    /** Total pois */
    pois: 300,
    /**research speed */
    rspd: 1,
    /**res wasted per week */
    amrt: 3e-3,
    /**food waste mult*/
    famrt: 5,
    /**research per tier */
    rcst: [100, 100, 300, 1e3, 3e3],
    /**weeks per year */
    wpy: 169,
    /**Distance multiplier */
    dm: 0.1,
    d: `=DEP
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
🔭 Visibility range bonus|How much map you see (without cheating)
🗑️ Food spoilage speed
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
`,
    st: `Foraging;Walking;Sticks`,
    aka: { "🌾": "🍎" },
    rr: `=Land travel method
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
1Trap:2🐾2🛠️>2🍎2👖0.5🐴!0🐾0🛠️
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
1Science:1⚗️0📙`,
    /**animals per temperature and humidity */
    atc: "🐏,🐂,🐂,🐎,🐪,🐏,🐺,🐗,🐗,🐅",
    /**deposit size multipliers */
    sm: {
      "🐏": 0.3,
      "💧": 0.3,
      "🗿": 0.3
    },
    /**multipliers*/
    m: {
      "🐾": `🐏:1🍎3👖
🐂:3🍎1👖0🐴
🐎:2🍎1👖0.5🐴
🐪:1🍎1👖0.3🐴
🐺:1🍎1👖0🐴
🐗:4🍎1👖0🐴
🐅:1🍎2👖0🐴
`,
      "🍃": `🌿:2.5🍎0.5🪵1🌾1🐴1👖
🌲:1🍎2🪵0.3🌾0.35🐴0.3👖
🌳:2🍎1🪵0.5🌾0.5🐴0.3👖
🌴:1.5🍎1.5🪵0.3🌾0.3🐴0.3👖
💧:1🍎0.3🪵0.5🌾0.5🐴1👖`
    }
  };
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
  var LAKE = 16;
  var OCEAN = 17;
  var biomeTable = [
    [TUNDRA, STEPPE, SAVANNA, DESERT],
    [TUNDRA, SHRUBLAND, GRASSLAND, SAVANNA],
    [SNOW, SHRUBLAND, GRASSLAND, TEMPERATE_FOREST],
    [SNOW, CONIFEROUS_FOREST, TEMPERATE_FOREST, TROPICAL_FOREST],
    [TAIGA, CONIFEROUS_FOREST, TROPICAL_FOREST, TROPICAL_FOREST],
    [TAIGA, CONIFEROUS_FOREST, TROPICAL_FOREST, RAIN_FOREST]
  ];
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

  // src/game.ts
  var dict;
  var recipes;
  var mult = {};
  var mapsCache = [];
  var currentRecipes;
  function poiLeft(p) {
    return Math.max(0, ~~(p.size * scenario2.psz * Math.sin(clamp(0, 1, p.age) * 3.14) - p.taken));
  }
  function generatePoi(m2, pois, date) {
    let at = [~~(random() * m2.p.width), ~~(random() * m2.p.height)];
    let id = random();
    for (let op of pois) {
      if (dist(op.at, at) < 10) {
        return;
      }
    }
    let i = coord2ind(at);
    let biome = m2.biome[i];
    let kind, isCal = false;
    let size = 1 + random();
    if (biome == LAKE || biome == OCEAN) {
      kind = "🐠";
      if (biome == LAKE)
        size += 1;
      else
        kind = "🐋";
    } else {
      let cr = m2.noise[i + 500] % 0.1;
      let maxSpawn = game.date % 1 >= 12 / 13 || game.date % 13 >= 12;
      if (cr < (maxSpawn ? 0.01 : 1e-3) * game.date) {
        let cals = Object.keys(categories["CAL"]);
        kind = cals[~~(random() * cals.length)];
        isCal = true;
      } else {
        let r = m2.noise[i + 1e3] % 0.1;
        if (r < 0.01) {
          kind = "🏔️";
        } else if (r < 0.02) {
          kind = r % 0.01 < 5e-3 ? "⬛" : "🛢️";
        } else {
          let t = m2.temperature[i] * 0.8 + m2.noise[i] * 5 + 12;
          let h = m2.humidity[i] * 10 + m2.noise[i] * 5 - 5;
          if (r < 0.045) {
            kind = scenario2.atc.split(",")[(h > 0 ? 5 : 0) + ~~clamp(0, 4, t / 10)];
          } else {
            kind = h < -0.5 ? r % 0.01 < 3e-3 && t > 0 ? "💧" : "🗿" : h < 0.3 ? "🌿" : "🌲,🌲,🌳,🌳,🌴".split(",")[~~clamp(0, 4, t / 15)];
          }
        }
      }
      if (scenario2.sm[kind]) {
        size *= scenario2.sm[kind];
      }
    }
    let p = { id, at, kind, size, taken: 0, age: random(), temp: m2.temperature[i], ageByWeek: (random() + 0.5) * scenario2.abw * (isCal ? 10 : 1) };
    pois.push(p);
    return p;
  }
  function strToObj(s) {
    let a = s.split(/([\d.-]+)/).filter((v) => v);
    let c = {};
    for (let i = 0; i < a.length; i += 2)
      c[a[i + 1]] = a[i];
    return c;
  }
  var recipeGroupStartingWith = {};
  function parseRecipes(s, short = false) {
    let groupName;
    return Object.fromEntries(s.split("\n").map((v) => {
      if (v[0] == "=") {
        groupName = v.slice(1);
        return null;
      }
      let cost = Number(v[0]);
      let research2 = {};
      let [name, ...etc] = v.slice(cost >= 0 ? 1 : 0).split(/[:>\!]/);
      if (groupName) {
        recipeGroupStartingWith[name] = groupName;
        groupName = void 0;
      }
      if (!etc)
        debugger;
      let [from, to, tech] = etc.map(strToObj).map((a, i) => {
        let addToRes = etc.length <= 2 || i == 2;
        for (let k in a) {
          if (!categories.BNS[k] && addToRes) {
            if (scenario2.aka[k]) {
              research2[scenario2.aka[k]] = 1;
            } else if (scenario2.m[k]) {
              for (let o in mult[k]) {
                research2[o] = 1;
              }
            } else {
              research2[k] = 1;
            }
          }
          if (a[k] == 0) {
            delete a[k];
          }
        }
        return a;
      }).filter((v2) => v2);
      return short ? [name, from] : [name, { from, to, t: v, name, cost, research: research2, isBonus: !to }];
    }).filter((v) => v));
  }
  function parsePedia() {
    let category;
    dict = Object.fromEntries(scenario2.d.split("\n").map((v) => {
      if (v[0] == "=") {
        category = v.slice(1);
        categories[category] = {};
      } else {
        let [k, ...etc] = v.split(" ");
        categories[category][k] = 1;
        return [k, etc.join(" ")];
      }
    }).filter((a) => a));
    for (let m2 in scenario2.m) {
      mult[m2] = parseRecipes(scenario2.m[m2], true);
    }
    recipes = parseRecipes(scenario2.rr);
    console.log(dict);
  }
  function storeItems() {
    return Object.keys(dict).filter((k) => categories.RES[k] || categories.TLS[k]);
  }
  function initGame(seed) {
    let game2 = {
      pop: 100,
      store: Object.fromEntries(storeItems().map((k) => [k, 0])),
      bonus: Object.fromEntries(Object.keys(categories.BNS).map((k) => [k, 0])),
      sel: { Walk: 1, Swim: 1 },
      "🏃": "Walk",
      "⚓": "Swim",
      date: 0,
      seed,
      tech: {},
      research: {}
    };
    game2.poi = [];
    for (let k in recipes) {
      game2.tech[k] = recipes[k].cost == 0 ? 1 : 0;
      game2.research[k] = 0;
    }
    return game2;
  }
  function happiness() {
    let food = game.store["🍎"];
    let h = food > 0 ? 0 : -game.pop;
    for (let k in game.store) {
      let v = game.store[k];
      let b = v ** 0.75;
      if (k == "🍎")
        b = 2 * withBonus(h, "🍲");
      h += b;
    }
    h = withBonus(h, "💕");
    return h;
  }
  function withBonus(n, k) {
    return smartMult(game.bonus[k]) * n;
  }
  function travelToP(p) {
    delete game.store[game.deposit];
    let from = game.home;
    game.home = p;
    game.deposit = p.kind;
    game.store[p.kind] = poiLeft(p);
    if (from) {
      let tc = travelCost(m, p, from);
      let w = tc.w;
      delete tc.w;
      for (let k in tc)
        game.store[k] -= tc[k];
      advanceTimeByWeeks(w);
    }
    centerMap();
  }
  function populate(pois) {
    setMap(generateGameMap(game.date));
    console.time("populate");
    let missing = scenario2.pois - pois.length;
    for (let j = 0; j < missing * 4; j++) {
      generatePoi(m, pois);
    }
    compactPois(m, pois);
    if (game.home)
      game.store[game.home.kind] = poiLeft(game.home);
    console.timeEnd("populate");
  }
  function compactPois(m2, pois) {
    let allTypes = new Set(pois.map((p) => p.kind));
    let fp = [];
    for (let type of allTypes) {
      let thisType = pois.filter((p) => p.kind == type);
      for (let i of [...thisType]) {
        for (let j of [...thisType]) {
          if (game && (game.home == i || game.home == j))
            continue;
          if (i != j && j.size && i.size && dist(i.at, j.at) < 40) {
            i.size += j.size;
            i.age = (i.age + j.age) / 2;
            i.ageByWeek = (i.ageByWeek + j.ageByWeek) / 2;
            j.size = 0;
          }
        }
      }
      fp.push(...thisType.filter((a) => a.size));
    }
    return pois.splice(0, 1e9, ...fp);
  }
  function recipeMax(r, goal) {
    let max = 1e12;
    if (goal != null) {
      let to = Object.values(r.to)[0];
      max = goal / to;
    }
    for (let k in r.from) {
      max = Math.min(game.store[k] / r.from[k], max);
    }
    return max;
  }
  function recipeUse({ used, made }) {
    report(recipeToText(used) + "🡢" + recipeToText(made));
    for (let k in used) {
      if (game.deposit == k && game.home) {
        game.home.taken += used[k];
        game.store[k] = poiLeft(game.home);
      } else {
        game.store[k] -= used[k];
      }
    }
    for (let k in made) {
      game.store[k] = (game.store[k] || 0) + made[k];
    }
  }
  function trimObj(a) {
    for (let k in { ...a })
      if (!a[k])
        delete a[k];
    return a;
  }
  function recipeUsage(r, m2) {
    let used = {}, made = {};
    for (let k in r.from) {
      let v = r.from[k] * m2;
      let useMult = categories.TLS[k] ? 0.1 : 1;
      used[k] = v * useMult;
    }
    for (let k in r.to) {
      let v = r.to[k] * m2;
      let sk = scenario2.aka[k] ?? k;
      made[sk] = v;
    }
    return { used, made };
  }
  function setCurrentRecipes() {
    let rr = JSON.parse(JSON.stringify(recipes));
    for (let r of Object.values(rr)) {
      let special = Object.keys(scenario2.m).find((a) => r.from[a]);
      if (special && game.home) {
        let m2 = mult[special][game.home.kind];
        if (m2) {
          let mm = 1;
          if (special == "🐾") {
            mm = withBonus(1, "🎯");
          }
          for (let k in r.to) {
            if (m2[k]) {
              r.to[k] = r.to[k] * m2[k] * mm;
            }
          }
          r.from[game.home.kind] = r.from[special];
          delete r.from[special];
        }
      }
      for (let k in r.to) {
        let m2 = 1;
        if (game.tech[r.name] > 0)
          m2 *= 1 + 0.1 * (game.tech[r.name] - 1);
        r.to[k] *= m2;
      }
    }
    currentRecipes = rr;
  }
  var travelTypes = ["⚓", "🏃"];
  function tryToUse(rname) {
    if (!rname || !game.tech[rname])
      return;
    let r = currentRecipes[rname];
    if (!r.to) {
      return;
    }
    for (let travelType of travelTypes) {
      if (r.to[travelType]) {
        let tt2 = game[travelType];
        delete game.sel[tt2];
        game.sel[r.name] = 1;
        game[travelType] = r.name;
        return;
      }
    }
    let v = recipeMax(r);
    if (v > 0) {
      v = Math.min(v, game.pop);
      let usage = recipeUsage(r, v);
      recipeUse(usage);
      advanceTimeByWeeks(v / game.pop);
    }
  }
  function currentWeek() {
    return ~~(game.date * scenario2.wpy);
  }
  function advanceTimeByWeeks(weeks = 1) {
    let w = currentWeek();
    game.date += weeks / scenario2.wpy;
    while (w < currentWeek()) {
      w++;
      processWeek();
    }
    render();
    window["save"](0);
  }
  function processWeek() {
    let eaten = game.pop * (1 + game.bonus["🥄"]) * 0.1;
    game.store["🍎"] -= eaten;
    if (game.store["🍎"] < 0) {
      let d = game.store["🍎"] * 0.1;
      game.pop += d;
      game.store["🍎"] = 0;
      report(`<red>🍎hungry! ${fix(d)}👨‍👩‍👦‍👦</red>`);
    }
    let spd = scenario2.popspd;
    let dHappiness = clamp(-game.pop * spd, game.pop * spd, (happiness() - game.pop) * spd);
    console.log({ dHappiness });
    game.pop += dHappiness;
    for (let k in game.store) {
      let advancing = Object.values(currentRecipes).filter((r) => r.research[k]);
      let by = game.store[k] ** 0.8 / advancing.length * scenario2.rspd;
      if (k == game.deposit)
        by *= scenario2.lrm;
      for (let a of advancing) {
        research(a.name, by);
      }
      if (k != game.deposit) {
        let loss = scenario2.amrt;
        if (k == "🍎") {
          loss = scenario2.famrt * withBonus(loss, "🗑️");
        }
        game.store[k] *= 1 - loss;
      }
    }
    let bonus = game.bonus["⚗️"];
    let books = game.store["📙"] ** 0.9 * Math.max(1, bonus);
    for (let rn in recipes) {
      research(rn, books * scenario2.rpb);
    }
    if (game.focus) {
      research(game.focus, books * scenario2.rpbf * bonus);
    }
    for (let p of [...game.poi]) {
      p.age += p.ageByWeek;
      if ((p.age > 1 || poiLeft(p) <= 0) && game.home?.id != p.id) {
        game.poi.splice(game.poi.indexOf(p), 1);
        let np;
        do {
          np = generatePoi(m, game.poi, game.date);
        } while (!np);
      }
    }
    updateBonuses();
    populate(game.poi);
  }
  function updateBonuses() {
    for (let n in game.bonus) {
      game.bonus[n] = 0;
    }
    for (let r of Object.values(recipes)) {
      if (!r.to && game.tech[r.name] > 0) {
        for (let k in r.from) {
          game.bonus[k] += r.from[k] * (0.9 + 0.1 * game.tech[r.name]);
        }
      }
    }
  }
  function research(name, v) {
    game.research[name] += v;
    let tc = tierCost(name);
    if (game.research[name] > tc) {
      game.tech[name]++;
      game.research[name] = 0;
      let t = game.tech[name];
      report(t > 1 ? `${name} advanced to level ${t}` : `${name} researched`);
    }
  }
  function tierCost(name) {
    return scenario2.rcst[recipes[name].cost] * 2 ** game.tech[name];
  }
  function recipeUseable(rname) {
    let r = currentRecipes[rname];
    return recipeMax(r) > 0;
  }
  function travelSteps(m2, a, b) {
    if (!b)
      return [0, 0];
    let d = dist(a.at, b.at);
    let w = 0, l = 0;
    for (let i = 0; i < d; i++) {
      let at = lerpXY(a.at, b.at, i / d);
      let ind = coord2ind(at);
      if (m2.elevation[ind] < 0)
        w += scenario2.dm;
      else
        l += scenario2.dm;
    }
    return { "🏃": l, "⚓": w };
  }
  function sumObj(a, b) {
    return Object.fromEntries(Object.keys({ ...a, ...b }).map((k) => [k, (a[k] || 0) + (b[k] || 0)]));
  }
  function travelWeight() {
    let v = game.pop * scenario2.pw;
    for (let k in game.store) {
      if (game.deposit != k)
        v += game.store[k] * scenario2.sw;
    }
    return v;
  }
  function travelCost(m2, a, b) {
    let tw = travelWeight();
    let ts = travelSteps(m2, a, b);
    let landSteps = ts["🏃"], waterSteps = ts["⚓"];
    let [landRecipe, waterRecipe] = [recipes[game["🏃"]], recipes[game["⚓"]]];
    for (let r of [landRecipe, waterRecipe]) {
      if (recipeMax(r) < tw)
        return { fail: 1 };
    }
    landSteps *= tw;
    waterSteps *= tw;
    let [landTime, waterTime] = [recipeMax(landRecipe, landSteps), recipeMax(waterRecipe, waterSteps)];
    let landResources = recipeUsage(landRecipe, landTime), waterResources = recipeUsage(waterRecipe, waterTime);
    let sum = sumObj(landResources.made, waterResources.made);
    if (sum["🏃"] >= landSteps - 0.1 && sum["⚓"] >= waterSteps - 0.1) {
      let so = sumObj(landResources.used, waterResources.used);
      so.w = (landTime + waterTime) / game.pop;
      return trimObj(so);
    } else {
      return { fail: 2 };
    }
  }
  function smartMult(n) {
    return n > 0 ? 1 + n : 1 / (1 - n);
  }
  console.log("SM", smartMult(0.5));

  // src/prog.ts
  var m;
  var mapScroll = [0, 0];
  var mouseAt;
  var screenXY;
  var zoom = 1;
  var poiPointed;
  var game;
  var log = [];
  function report(t) {
    log.push(t);
  }
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
    "lake",
    "ocean"
  ];
  var settings = {
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
    "erosion": 1e4,
    "riversShown": 150,
    "biomeScrambling": 0.24,
    "terrainTypeColoring": 0,
    "discreteHeights": 0,
    "hillRatio": 0.12,
    "mountainRatio": 0.04,
    "gameMapRivers": 15e3,
    "gameMapScale": 2,
    "generatePhoto": 1,
    "squareGrid": 0,
    "generateTileMap": 0,
    "noiseSeed": 1,
    "elevationCold": 53,
    "shading": 1
  };
  function init() {
    parsePedia();
    game = initGame(settings.seed);
    updateBonuses();
    populate(game.poi);
    renderMap();
    render();
  }
  document.onkeydown = (k) => {
    function adv() {
      game.date += 1 / 13;
      setMap(generateGameMap(game.date));
      return new Promise((r) => setTimeout(r, 50));
    }
    if (k.shiftKey) {
      if (k.code == "KeyW") {
        game.poi = [];
        mapScroll[0] = 0;
        mapScroll[1] = 0;
        zoom = 0;
      }
      if (k.code == "KeyS") {
        adv();
      }
      if (k.code == "KeyA") {
        let loop = async () => {
          adv().then(loop);
        };
        loop();
      }
      renderMap();
    }
  };
  window.onload = init;
  Object.assign(window, {
    rec: (n) => {
      tryToUse(n);
      render();
    },
    give: (i) => {
      game.store[Object.keys(game.store)[i]] += 100;
      render();
    },
    foc: (a) => {
      if (game.focus != a) {
        game.focus = a;
        advanceTimeByWeeks();
      }
    },
    save: (n) => {
      if (n != 0) {
        if (!confirm(`Save to ${n}?`))
          return;
      }
      let s = JSON.stringify({ ...game, home: game.poi.indexOf(game.home), seed: settings.seed }, null, 2);
      localStorage.setItem("temo" + n, s);
      if (n != 0)
        report("Saved");
    },
    load: (n) => {
      let data = localStorage.getItem("temo" + n);
      if (data) {
        game = JSON.parse(data);
        if (game.seed != null)
          settings.seed = game.seed;
        game.home = game.poi[game.home];
        setMap(generateGameMap(game.date));
        centerMap();
        render();
        report("Loaded");
      }
    }
  });
  var tips = {};
  var mainCanvas;
  function showMap(data, title, fun, scale = 1 / 4, altitude) {
    mainCanvas = data2image(data, settings.width, fun, altitude);
    let img = rescaleImage(mainCanvas, mainCanvas.width * scale, mainCanvas.height * scale);
    let ctx = img.getContext("2d");
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
  function recipeToText(r, vertical) {
    if (r?.fail) {
      return r.fail == 1 ? "🏋🏻" : "🚳";
    }
    let txt = r ? Object.keys(r).map((k) => `<span data-red='${game.store[k] < 0.1}'>${fix(r[k])}</span>${tt(k)}`).join(vertical ? "<br/>" : " ") : "";
    return `<span class=rtt>${txt}</span>`;
  }
  function updateTooltip(mouseAt2, target) {
    let ind = coord2ind(mouseAt2);
    tooltip.style.left = `${Math.min(window.innerWidth - 300, screenXY[0] + 20)}`;
    tooltip.style.top = `${Math.min(window.innerHeight - 300, screenXY[1] + 20)}`;
    if (target && target.classList.contains("icon") && dict[target.innerHTML]) {
      tooltip.style.display = "flex";
      let t = (dict[target.innerHTML] || "").split("|");
      tooltip.innerHTML = `<h4>${t[0]}</h4>${t.slice(1).join("<br/>")}`;
    } else {
      tooltip.style.display = "grid";
      tooltip.innerHTML = Object.keys(m).map(
        (key) => {
          let v = m[key][ind];
          return `<div>${key}</div><div>${key == "photo" ? v?.map((n) => ~~n) : key == "biome" ? v + " " + biomeNames[v]?.toUpperCase() : ~~(v * 1e6) / 1e6}</div>`;
        }
      ).join("");
      if (poiPointed) {
        tooltip.style.display = "block";
        let kind = poiPointed.kind;
        let t = (dict[kind] || "").split("|");
        let tc = travelCost(m, poiPointed, game.home);
        recipeToText(tc, true);
        let ddd = poiPointed == game.home ? "" : `<p>${recipeToText(tc, true)} ${["", "Not enough transport for everyone", "Not enough resources for entire journey", " travel duration"][tc.fail ?? 3]}</p>`;
        tooltip.innerHTML = `
      <h4>${kind}${t[0]}</h4><p>${t.slice(1).join("<br/>")}</p>
      <p>Remaining:${~~poiLeft(poiPointed)}</p>${ddd}
      `;
      }
    }
  }
  document.onmousemove = (e) => {
    let move = [e.movementX, e.movementY];
    screenXY = [e.pageX, e.pageY];
    if (e.target == mainCanvas && e.buttons) {
      mapScroll[0] += move[0] * devicePixelRatio;
      mapScroll[1] += move[1] * devicePixelRatio;
      render();
    }
    let target = e.target;
    let isCanvas = target.tagName == "CANVAS";
    let id = target.id;
    if (isCanvas || target.classList.contains("icon") || target.classList.contains("poi")) {
      mouseAt = [
        e.offsetX / target.width * settings.width / devicePixelRatio,
        e.offsetY / target.height * settings.height / devicePixelRatio
      ];
      updateTooltip(mouseAt, e.target);
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
    e.preventDefault();
    e.stopPropagation();
    render();
  };
  function poiText(i) {
    let p = game.poi[i];
    let tc = travelCost(m, p, game.home);
    return `<div class=poi id=poi${i}>
<div class=pmain>${p.kind}<center>${~~poiLeft(p)}
</center></div>
<center style=margin:0.2rem >${!game.home || p == game.home ? "" : recipeToText(tc, true)}<center>
</div>`;
  }
  function renderMap() {
    console.time("draw");
    mainCanvas && main.removeChild(mainCanvas);
    showMap(m.photo, "photo", (v) => v, void 0, (i) => Math.max(1, ~~(m.elevation[i] * 20) * 2));
    console.timeEnd("draw");
    render();
  }
  window["poiOver"] = (e) => {
    console.log(e);
  };
  function fix(n) {
    return parseFloat(Number(n).toFixed(2));
  }
  function centerMap() {
    let half = settings.width / 2;
    if (game.home) {
      zoom = 2.25 / (1 + game.bonus["🔭"]);
      mapScroll[0] = (-game.home.at[0] * 2 ** zoom + half) * devicePixelRatio;
      mapScroll[1] = (-game.home.at[1] * 2 ** zoom + half) * devicePixelRatio;
    }
  }
  function render() {
    if (!game)
      return;
    setCurrentRecipes();
    mainCanvas.style.transform = `translate(${mapScroll[0]}px, ${mapScroll[1]}px) scale(${2 ** zoom})`;
    let s = "";
    for (let i2 in game.poi) {
      s += poiText(i2);
    }
    ps.innerHTML = s;
    let half = settings.width / 2;
    for (let i2 in game.poi) {
      let p = game.poi[i2];
      let d = document.querySelector(`#poi${i2}`);
      if (d) {
        let size = (p.size ** 0.5 * 3 + 4) * 2 ** zoom;
        d.style.left = `${p.at[0] * devicePixelRatio * 2 ** zoom + mapScroll[0] - size / 2}px`;
        d.style.top = `${p.at[1] * devicePixelRatio * 2 ** zoom + mapScroll[1] - size / 2}px`;
        d.style.fontSize = `${size}px`;
        d.dataset.cur = p == game.home;
        d.onmouseover = () => {
          poiPointed = p;
        };
        d.onmouseleave = () => {
          poiPointed = void 0;
        };
        d.onmousedown = () => {
          if (game.home) {
            let tc = travelCost(m, p, game.home);
            if (tc.fail) {
              report("Unreachable");
              return;
            }
          }
          travelToP(p);
          render();
        };
      }
    }
    setCurrentRecipes();
    let barCont = [{
      "👨‍👩‍👦‍👦": game.pop,
      "💗": happiness(),
      "🏋": travelWeight(),
      "📅": currentWeek(),
      ...game.bonus
    }, {
      ...game.store
    }];
    let i, svs = "";
    for (i = 1; localStorage.getItem("temo" + i); i++) {
      svs += `<button onmousedown=save(${i})>Save ${i}</button><button onmousedown=load(${i})>Load ${i}</button>`;
    }
    svs += `<button onmousedown=save(${i})>Save ${i}</button>`;
    let all = barCont.map((bc) => "<div class=res>" + Object.keys(bc).map((k) => [tt(k), bc[k] > 10 ? ~~bc[k] : fix(bc[k])]).map(
      (a, i2) => `<div onmousedown="give(${i2})">${a.join("<br/>")}</div>`
    ).join("") + "</div>").join("") + Object.values(currentRecipes).map((r) => {
      let to = recipeToText(r.to);
      let rg = recipeGroupStartingWith[r.name];
      let known = game.tech[r.name] > 0;
      let len = (r.from ? Object.keys(r.from).length : 0) + (r.to ? Object.keys(r.to).length : 0);
      let txt = (rg ? `<div>${rg}</div>` : "") + `<button data-sel=${game.sel[r.name]} data-rec onmousedown="rec('${r.name}')" data-use="${known && (recipeUseable(r.name) || recipes[r.name].isBonus)}" >
${game.bonus[`⚗️`] ? `<div class=foc data-foc="${game.focus == r.name}" onmousedown=foc('${r.name}')>⚗️</div>` : ""}
${!known ? `<div class=un>UNKNOWN</div>` : ""}
${`<div class=r><div>${r.name} ${game.tech[r.name] || ""}</div>
<div>${~~(tierCost(r.name) - game.research[r.name])}<span class=resl>⚗️↩${Object.keys(r.research).join("")}</span></div></div>
<span class=rec style="${len > 4 ? "font-size:80%" : ""}">${recipeToText(r.from)}${to ? "🡢 " + to : ""}</span>`}
</button>`;
      return txt;
    }).join("") + "<br/>" + svs + `<button data-fls=${game?.date == 0 && hasAuto} onmousedown=load(0)>Load autosave</button><p class=log>` + log.slice(log.length - 20).join(" ✦ ") + "</p>";
    console.log("<p class=log>" + log.slice(log.length - 20).join(" ✦ ") + "</p>");
    recdiv.innerHTML = all;
  }
  var hasAuto = !!localStorage.getItem("temo0");
  function setMap(nm) {
    m = nm;
    renderMap();
    return m;
  }
  function generateGameMap(date = game.date) {
    let before = ~~date;
    if (before != date)
      date = before + ~~(date % 1 * scenario2.blnd) / scenario2.blnd;
    if (mapsCache[date])
      return mapsCache[date];
    if (before == date) {
      mapsCache[date] = generateMap({ ...settings, seed: game.seed + date });
      return mapsCache[date];
    }
    console.time("blend");
    let [a, b] = [generateGameMap(before), generateGameMap(before + 1)];
    let blend = blendFull(a, b, date - before);
    report("map updated");
    mapsCache[date] = blend;
    console.timeEnd("blend");
    return blend;
  }
})();
