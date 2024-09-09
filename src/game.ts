import { game, rescale } from "./prog";
import { LAKE, OCEAN, scenario } from "./scenario";
import { clamp, coord2ind, dist, LayeredMap, random, XY } from "./worldgen";

export type Recipe = { name: string, from: { [id: string]: number }, to: { [id: string]: number } }

export let dict: { [id: string]: { name: string, category: string } }, recipes: { [id: string]: Recipe }, mult = {};

export type Game = {
    store: { [id: string]: number }
    pop: number
    home: Poi | undefined
    cr: { [id: string]: Recipe }
    deposit: string
    poi: Poi[]
};

export type Poi = {
    at: XY
    kind: string
    div?: HTMLDivElement
    size: number
    taken: number
    temp: number
    age: number
}

export function poiLeft(p: Poi) {
    return ~~(p.size * 1000 * Math.sin(p.age * 3.14) - p.taken);
}

function generatePoi(m: LayeredMap, at: XY) {
    let i = coord2ind(at, m.p.width);
    let biome = m.biome[i]
    let kind: string;
    let size = 1 + random();
    if (biome == LAKE || biome == OCEAN) {
        kind = "🐠"
        if (biome == LAKE)
            size += 1;
        else
            kind = "🐋"
    } else {
        let r = m.noise[i + 1000] % 0.1;
        if (r < 0.01) {
            kind = "🏔️";
        } else if (r < 0.02) {
            kind = r % 0.01 < 0.005 ? "⬛" : "🛢️";
        } else {
            let t = m.temperature[i] * 0.8 + m.noise[i] * 5 + 12;
            let h = m.humidity[i] * 10 + m.noise[i] * 5 - 5;
            if (r < 0.06) {
                kind = scenario.atc.split(",")[(h > 0 ? 5 : 0) + ~~clamp(0, 4, t / 10)];
            } else {
                kind = h < -0.5 ? (r % 0.01 < 0.003 && t > 0 ? "💧" : "🗿") : h < 0.2 ? "🌿" : "🌲,🌲,🌳,🌳,🌴".split(",")[~~clamp(0, 4, t / 15)]
            }
        }
    }
    let p: Poi = { at, kind, size, taken: 0, age: random(), temp: m.temperature[i] };
    return p
}

function strToObj(s: string) {
    let a = s.split(/([\d.-]+)/).filter(v => v)
    let c = {};
    for (let i = 0; i < a.length; i += 2)
        c[a[i + 1]] = a[i];
    console.log(c);
    return c
}

function parseRecipes(s: string, short = false) {
    return Object.fromEntries(s.split("\n").map(v => {
        let [name, ...etc] = v.split(/[:>]/);
        if (!etc)
            debugger
        let [from, to] = etc.map(strToObj).filter(v => v)
        return short ? [name, from] : [name, { from, to, t: v, name }]
    })) as { [id: string]: Recipe }
}

export function parsePedia() {
    let category: string;
    dict = Object.fromEntries(scenario.d.split("\n").map(v => {
        if (v[0] == "=")
            category = v.slice(1);
        else {
            let [k, name] = v.split(" ")

            return [k, { name, category }]
        }
    }).filter(a => a) as any);
    for (let m in scenario.m) {
        mult[m] = parseRecipes(scenario.m[m], true);
    }
    recipes = parseRecipes(scenario.rr);
    console.log(dict);
    console.log(recipes);
    console.log(mult);
}



//console.log(recipes, dict);

export function initGame() {
    let game = {
        pop: 100,
        store: Object.fromEntries(Object.keys(dict).filter(k => ["RESOURCES", "TOOLS"].includes(dict[k].category)).map(k => [k, 0]))
    } as Game;
    return game
}

export function travelToP(p: Poi) {
    delete game.store[game.deposit];
    game.home = p;
    game.deposit = p.kind;
    game.store[p.kind] = poiLeft(p);
    rescale()
}

export function populate(m: LayeredMap) {
    console.time("populate")
    let pois: Poi[] = [];
    up: for (let j = 1000; j--;) {
        let at: XY = [~~(random() * m.p.width), ~~(random() * m.p.height)];
        for (let op of pois) {
            if (dist(op.at, at) < 10) {
                continue up;
            }
        }
        let p = generatePoi(m, at);
        pois.push(p)
    }

    let allTypes = new Set<string>(pois.map(p => p.kind));

    let fp: Poi[] = [];

    for (let type of allTypes) {
        let thisType = pois.filter(p => p.kind == type);
        for (let i of [...thisType]) {
            for (let j of [...thisType]) {
                if (i != j && j.size && i.size && dist(i.at, j.at) < 40) {
                    i.size += j.size;
                    j.size = 0;
                }
            }
        }
        fp.push(...thisType.filter(a => a.size));
    }

    console.timeEnd("populate")
    return fp
}

function recipeMax(r: Recipe, goal: number) {
    let max = 1e12;
    if (goal) {
        let to = Object.values(r.to)[0];
        max = goal / to;
    }
    for (let k in r.from) {
        max = Math.min(game.store[k] / r.from[k], max)
    }
}

function recipeUse(r: Recipe, m: number) {
    for (let k in r.from) {
        let v = r.from[k];
        let useMult = dict[k].category == "TOOLS" ? 0.1 : 1;
        game.store[k] -= v * m * useMult;
    }
    for (let k in r.to) {
        let v = r.from[k];
        game.store[k] = (game.store[k] || 0) + v * m;
    }
}

export function setLocalRecipes(){
    let rr: { [id: string]: Recipe } = JSON.parse(JSON.stringify(recipes));
    for (let r of Object.values(rr)) {
      let special = Object.keys(scenario.m).find(a => r.from[a])
      if (special && game.home) {
        let m = mult[special][game.home.kind];
        if (m) {
          for (let k in r.to) {
            if (m[k]) {
              r.to[k] = r.to[k] * m[k];
            }
          }
          r.from[game.home.kind] = r.from[special];
          delete r.from[special]
        }
      }
    }
    
    game.cr = rr;    
}

