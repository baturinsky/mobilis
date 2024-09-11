"use strict";

import { createNeighborDeltas, SQUARE8 } from "./geometry";
import { settings } from "./prog";
import { biomeColors, biomeTable, LAKE, MOUNTAIN, OCEAN, scenario } from "./scenario";


/*biomeAnimal = " ,🐪,🐂,🦌,🦒,🦊,🐺,🐆,🐗,🐘,🐊,🐐,🐎,🦌,🐏,🦀,🐠,🐋,".split(","),*/
/*biomeEmoji = " ,🌵,🌻,❄️,🌿,🍂,🌲,🌴,🌳,🌴,🌱,⛄,🌾,🌲,⛰️,🏖️,🏞️,🌊".split(","),*/

//console.log(biomeEmoji, biomeEmoji.map(a => a.length));


export type RGBA = [number, number, number, number]
export type ShowMapF = (value: number, index: number) => RGBA

export function lerp(a: number, b: number, n: number) {
    return a * (1 - n) + b * n;
}

export function clamp(a: number, b: number, n: number) {
    return n < a ? a : n > b ? b : n;
}

export function lerpRGBA(a: RGBA, b: RGBA, n: number): RGBA {
    if (!b)
        return [0, 0, 0, 0];
    return [0, 1, 2, 3].map(i => lerp(a[i], b[i], n)) as RGBA;
}

export function clampRGBA(rgba) {
    for (let c of [0, 1, 2])
        rgba[c] = clamp(0, 255, rgba[c]);
}


export let randomSeed = 6;
export function setSeed(n: number) {
    randomSeed = n
}

export type XY = [number, number];
export type Numbers = number[] | Float32Array;

export function dist(a: XY, b: XY) {
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5;
}

export function lerpXY(a: XY, b: XY, n:number) {
    return [lerp(a[0],b[0],n), lerp(a[1],b[1],n)] as XY
}

export function random() {
    let x = Math.sin(randomSeed) * 10000;
    randomSeed = (randomSeed + Math.E) % 1e8;
    return x - Math.floor(x);
}

export function spread(range: number) {
    return range * (random() - 0.5);
}

export function coord2ind([x, y]: XY, width: number = settings.width) {
    return ~~(x) + (~~y) * width;
}

export function context2d(canvas: HTMLCanvasElement) {
    return canvas.getContext("2d") as CanvasRenderingContext2D;
}

/** Creates canvas of the required size and returns it and it's 2d context. */
export function createCanvasCtx(width: number, height: number) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${canvas.width * devicePixelRatio}px`;
    canvas.style.height = `${canvas.height * devicePixelRatio}px`;
    let ctx = context2d(canvas);
    return { canvas, ctx };
}

/** Returns alpha channel of the image as numbers in 0-255 range. */
export function image2alpha(canvas: HTMLCanvasElement) {
    let ctx = context2d(canvas);
    let idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = idata.data;
    let values = new Float32Array(data.length / 4);
    for (let i = 0; i < data.length; i++) values[i] = data[i * 4 + 3] / 255;

    return values;
}

/** Gradient noise generated by throwing ellipses at the plane. */
export function gradientNoise(
    width: number,
    height: number,
    points = 5000,
    radius = 100,
    alpha = 0.01,
    gradientCircles = true
) {
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
        let points = [...Array(3)].map(() => random());

        let [x, y] = [points[0] * width, points[1] * height];
        let r = Math.pow(points[2], 2) * radius;

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

/** Monte-Carlo approximation of the quantile */
function approximateQuantile(values: Numbers, level = 0.5, picks = 1000) {
    if (!values)
        debugger;
    let l = values.length;
    let picked = [...Array(picks)].map(() => values[Math.floor(random() * l)]);
    picked = picked.sort();
    return picked[Math.floor(level * picked.length)];
}

export interface Arr {
    length: number;
    map: Function
}

function normalizeValues<T extends Arr>(values: T, picks = 1000): T {
    let l = values.length;
    let picked = [...Array(picks)].map(() => values[Math.floor(random() * l)]);
    let max = 0;
    for (let v of picked) if (v > max) max = v;
    return values.map(v => v / max);
}

export type MapParams = {
    width: number
    height: number
    seed: number
    noiseSeed: number
    elevationCold: number
    seaRatio: number
    flatness: number
    noiseSmoothness: number
    tectonicSmoothness: number
    noiseFactor: number
    crustFactor: number
    tectonicFactor: number
    averageTemperature: number
    biomeScrambling: number
    pangaea: number
    erosion: number
    riversShown: number
    randomiseHumidity: number
}


export type Terrain = { dryElevation: Float32Array, tectonic: Float32Array, p: MapParams };

export type LayeredMap = Terrain & {

    elevation: Float32Array
    noise: Float32Array
    rivers: Float32Array
    wind: Float32Array
    temperature: Float32Array
    humidity: Float32Array
    biome: Float32Array
    photo: RGBA[]
}

const gen = ({ width, height }, smoothness: number, points, radius, alpha) =>
    image2alpha(addFilter(gradientNoise(width, height, points,
        Math.sqrt(width * width + height * height) * radius, alpha),
        `blur(${smoothness}px)`))


export function generateTerrain(params: MapParams) {
    let {
        width,
        height,
        seed,
        noiseSmoothness,
        tectonicSmoothness,
        noiseFactor,
        crustFactor,
        tectonicFactor,
        pangaea,
    } = params;

    randomSeed = seed;

    const mapSize = width * height;

    console.time("noise");

    let noise = gen(params, noiseSmoothness, 3000, 0.15, 0.03);

    let crust = gen(params, tectonicSmoothness, 2000, 0.15, 0.03);

    let tectonicMul = gen(params, tectonicSmoothness, 2000, 0.15, 0.03);

    console.timeEnd("noise");

    console.time("main");

    let tectonicMedian = approximateQuantile(crust, 0.5);

    let tectonic = crust.map(
        (v, i) => {
            let t = (0.2 / (Math.abs(tectonicMedian - v) + 0.1) - 0.95) * (tectonicMul[i] - 0.2) * 2
            /*let fold = t * (1 + Math.sin((t ** 2))) ;
            fold = 2 * (noise[i] ** 2 - 0.2) * fold ** 2
            t += fold;*/
            return t;
        }
    );

    let elevationFloats = crust.map(
        (_, i) =>
            5 +
            noise[i] * noiseFactor +
            crust[i] * crustFactor +
            tectonic[i] * tectonicFactor +
            -pangaea * (Math.abs(i / mapSize - 0.5) + Math.abs((i % width) / width - 0.5))
    );


    console.timeEnd("main");

    console.time("normalize");


    for (let pass = 4; pass--;) {
        for (let i = width; i < elevationFloats.length; i++) {
            for (let n of [-2, 2, -width * 2, width * 2]) {
                elevationFloats[i] += ((elevationFloats[i + n] || 0) - elevationFloats[i]) * 0.15;
            }
        }
    }

    let dryElevation = normalizeValues(elevationFloats);

    console.timeEnd("normalize");

    return { dryElevation, tectonic, p: params } as Terrain;
}

export function generateMap(params: MapParams, terrain?: Terrain): LayeredMap {
    terrain ??= generateTerrain(params);
    let lm = generateAtmosphere(params, terrain);
    return lm;
}

function generateAtmosphere(params: MapParams, terrain: Terrain) {
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

    randomSeed = noiseSeed

    let noise = gen(params, noiseSmoothness, 3000, 0.15, 0.01);

    let { dryElevation, tectonic } = terrain;
    const mapSize = width * height;

    let seaLevel = approximateQuantile(dryElevation, seaRatio);

    let elevation = dryElevation.map((v, i) =>
        v < seaLevel
            ? -Math.pow(1 - v / seaLevel, 0.35)
            : Math.pow(
                ((v - seaLevel) * (0.5 + tectonic[i] * 0.5)) / (1 - seaLevel),
                1 + 2 * flatness
            )
    );


    //let noise = gen(params, noiseSmoothness, 3000, 0.15, 0.01);

    let wind = elevation.map(
        (h, i) =>
            Math.cos((Math.abs(0.5 - i / mapSize) * 4 + 0.85) * Math.PI) /
            (h < 0 ? 1 : 1 + 5 * h * h)
    );

    console.time("windSmoothing");
    wind = image2alpha(
        addFilter(
            data2image(wind, width, v => [0, 0, 0, 127 * (v + 1)]),
            "blur(3px)"
        )
    ).map(v => v * 2 - 1);
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
        humidity = humidity.map((v, i) =>
            Math.max(0, v + Math.sin(noise[i] * 50) / 10 - elevation[i] * 0.2)
        );
    }

    let temperature = elevation.map(
        (e, i) =>
            averageTemperature +
            25 -
            (100 * Math.abs(0.5 - i / mapSize)) / (0.7 + 0.6 * humidity[i]) -
            Math.max(0, e) * elevationCold
    );

    //humidity = humidity.map((w, i) => w * (1 + Math.atan(-temperature[i] / 100)));

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
    } as any as LayeredMap;

    layeredMap.biome = generateBiome(layeredMap)
    layeredMap.photo = generatePhoto(layeredMap)

    return layeredMap;
}

function generateBiome(m: LayeredMap) {
    console.time("biome");
    let biome = m.temperature.map((t, i) => {
        let e = m.elevation[i];

        if (e < -0) return OCEAN;
        if (m.rivers[i]) return LAKE;

        let scramble = (1 + m.p.biomeScrambling * Math.sin(m.noise[i] * 100));

        let b =
            biomeTable[~~clamp(0, 5, m.humidity[i] * 4.5 * scramble)]
            [~~clamp(0, 3, t * scramble / 10 + 1)]
        if (m.elevation[i] > 0.4) b = MOUNTAIN;
        return b;
    });
    console.timeEnd("biome");

    return biome;
}

function generatePhoto(m: LayeredMap) {
    let { humidity, elevation, temperature, tectonic, noise, rivers, biome } = m;
    let { width, shading } = m.p;
    let folds = [...humidity], shades = [...humidity];

    /**@type {number[][]} */
    let photo;
    console.time("photo");

    let rgba: RGBA;

    function lerpTo(b: number[], n: number) {
        if (!b)
            return;
        for (let i of [0, 1, 2])
            rgba[i] = lerp(rgba[i], b[i], n);
    }

    photo = [...humidity].map((hum, i) => {
        let ele = elevation[i];
        if (ele < 0) {
            //return [0, (1 + ele * 2) * 55 + 30, (1 + ele * 2) * 155 + 50, 255];
            return [- (ele ** 2) * 1000 + 100, -(ele ** 2) * 500 + 150, -(ele ** 2) * 300 + 150, 255];
        } else {
            rgba = [
                temperature[i] * 15 - hum * 700,
                150 - hum * 150,
                temperature[i] * 8 - hum * 500,
                255,
            ] as RGBA;

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

            //console.log([...rgba]);
            for (let r of [1, 2, 3])
                for (let d of [1, width, -1, -width, 0]) {
                    lerpTo(biomeColors[biome[i + d * r]], 0.05);
                }

            if (temperature[i] < 0) {
                lerpTo([500, 500, 500], -temperature[i] * 0.03);
            }

            clampRGBA(rgba);

            /**Shading */
            if (shading) {
                let s = 0;
                for (let dx = -2; dx <= 2; dx++)
                    for (let dy = -2; dy <= 2; dy++) {
                        s += elevation[i + dx + width * dy] * (Math.sign(dx) + Math.sign(dy));
                    }
                let shade = (
                    elevation[i + 1 + width] +
                    elevation[i + width] +
                    elevation[i + 1]
                    - ele
                    - elevation[i - width] -
                    elevation[i - 1]) + s * 0.05;

                if (rivers[i] == 0 && (rivers[i + width] != 0))
                    shade -= .1;

                lerpTo([500, 500, 260], -shade)
                shades[i] = shade
            }

            return rgba;
        }
    });
    console.timeEnd("photo");
    return photo
}


function htow(elevation: Float32Array, width: number, blur = 20) {
    let height = elevation.length / width;
    let humidityImage = data2image(elevation, width, (v: number, i) => [
        0,
        0,
        0,
        v <= 0 ? 100 : 0,
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
        let start: XY = [(i % 100 / 100) * width, (i % 10 / 10) * height];
        let windThere = wind[coord2ind(start)];
        let end = [
            start[0] + (windThere * 0.3 * width) / 8,
            start[1] + (Math.abs(windThere) * 0.5 * height) / 12,
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

type RiversParams = { width: number, height: number, elevation: Float32Array, tectonic: Float32Array, erosion: number, riversShown: number };

function generateRiversAndErosion({
    width,
    height,
    elevation,
    erosion,
    riversShown,
}: RiversParams) {

    console.time("rivers");

    let { wetness } = htow(elevation, width, 100)
    let wi = image2alpha(wetness);

    let e = elevation.map((v, i) => 1 - v - wi[i] * 0.3);

    let rivers = new Float32Array(width * height);

    let neighbors = createNeighborDeltas(width, SQUARE8)[0];

    for (
        let streamIndex = 0;
        streamIndex < erosion + riversShown;
        streamIndex++
    ) {
        let current = streamIndex * 12345 % elevation.length;
        let path: number[] = []

        //if (e[current] < random()) continue;

        //if (humidity && humidity[current] < random()) continue;

        let limit = 1000;

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
        if (elevation[i] > -0.2 && elevation[i] < 0) { elevation[i] = (elevation[i] > -0.1) ? 0.01 : elevation[i] * 2 + 0.2 }
        if (elevation[i] > 0)
            elevation[i] *= 1 + random() * 0.1
    }

    console.timeEnd("rivers");

    return rivers;
}

export function mapToList(m) {
    let l = [];
    for (let k in m) {
        l[k] = m[k];
    }
    return l;
}

export function colorFromRGBString(color) {
    let n = parseInt(color, 16);
    return [Math.floor(n / 65536), Math.floor(n / 256) % 256, n % 256, 256];
}

export function colorFromRGB16String(color) {
    let n = parseInt(color, 16);
    let c = [Math.floor(n / 256) * 16, Math.floor(n / 16) % 16 * 16, n % 16 * 16, 256];
    return c;
}


/**
 * Convert data to image according to callback function
 * @param {any[]} values
 * @param {number} width
 * @param {(v:number, i:number) => [number,number,number,number]} converter
 * @returns {HTMLCanvasElement}
 */

export function data2image<T>(values: any, width: number, converter?: (v: any, i: number) => RGBA, altitudes?: (number) => number) {
    let height = values.length / width;
    let { canvas, ctx } = createCanvasCtx(width, height);
    let idata = ctx.createImageData(width, height);
    if (!idata.data || !values)
        debugger;
    for (let i = 0; i < values.length; i++) {
        let h: number = 0;
        let v: RGBA = converter ? (converter(values[i] as T, i) ?? 0) : [0, 0, 0, values[i]] as RGBA;
        idata.data.set(v, i * 4);
    }
    ctx.putImageData(idata, 0, 0);
    return canvas;
}

/**
 * Returns elevation image with higher elevation being brighter
 */
export function elevation2Image(
    { elevation, rivers }, any
) {
    rivers ??= [];
    return ((v: number, i) => {
        let level = elevation[i];

        if (v > 0) {
            return [250 - level * 300, 200 - level * 300, rivers[i] * 100, 255];
        } else {
            return [0, level * 60 + 60, level * 80 + 100, 255];
        }
    }) as ShowMapF;
}

/**
 * Returns canvas rescaled to the new size
 * @param {HTMLCanvasElement} source
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement}
 */
export function rescaleImage(source, width, height) {
    let { canvas, ctx } = createCanvasCtx(width, height);
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, width, height);
    return canvas;
}

/** Returns canvas that is a fragment of the source canvas */
export function subImage(image: HTMLCanvasElement, left: number, top: number, width: number, height: number) {
    let { canvas, ctx } = createCanvasCtx(width, height);
    ctx.drawImage(image, left, top, width, height, 0, 0, width, height);
    return canvas;
}






export function lerpMaps(a: LayeredMap, b: LayeredMap, n: number, fields?: string[]) {
    let c = {} as LayeredMap;
    for (let k of (fields ?? Object.keys(a))) {
        c[k] = new Float32Array(a[k].length);
        let aa = a[k], bb = b[k]
        for (let i in aa) {
            c[k][i] = aa[i] * (1 - n) + bb[i] * n;
        }
    }
    return c
}

export function blendFull(a: LayeredMap, b: LayeredMap, n: number) {
    console.time("blend");
    let terrain = lerpMaps(a, b, n, ["dryElevation", "tectonic"]) as Terrain;
    console.timeEnd("blend");
    console.time("blendGen");
    let m = generateMap({ ...a.p, averageTemperature: a.p.averageTemperature + Math.sin(n * 6.3) * 20 }, terrain);
    console.timeEnd("blendGen");
    return m;
}

export function blendFast(a: LayeredMap, b: LayeredMap, n: number) {
    console.time("blend");
    let blend = lerpMaps(a, b, n, ["elevation", "temperature", "humidity", "tectonic", "noise"]) as Terrain;
    let m = { ...a, ...blend };
    generateBiome(m);
    generatePhoto(m);
    console.timeEnd("blend");
    return m;
}

