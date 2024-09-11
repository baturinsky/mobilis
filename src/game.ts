import { game, render } from "./prog";
import { categories, LAKE, OCEAN, scenario } from "./scenario";
import { clamp, coord2ind, dist, LayeredMap, lerp, lerpXY, random, XY } from "./worldgen";

export type Recipe = { name: string, from: { [id: string]: number }, to: { [id: string]: number }, cost: number, bonus: { [id: string]: number } }

export let dict: { [id: string]: { name: string, category: string } }, recipes: { [id: string]: Recipe }, mult = {};

export type Game = {
    store: { [id: string]: number }
    bonus: { [id: string]: number }
    pop: number
    home: Poi | undefined
    /**local recipes */
    cr: { [id: string]: Recipe }
    tech: { [id: string]: Recipe }
    /**local deposit icon */
    deposit: string
    /**selecte options */
    sel: Set<string>
    '🏃': string,
    '⚓': string,
    poi: Poi[]
    date: number
    seed: number
    maps: LayeredMap[]
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
    let i = coord2ind(at);
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
    return c
}

export let recipeGroupStartingWith = {};

function parseRecipes(s: string, short = false) {
    let groupName:string|undefined;
    return Object.fromEntries(s.split("\n").map(v => {
        if(v[0] == "="){
            groupName = v.slice(1);            
            return null as any;
        }

        let cost = Number(v[0]);

        let bonus = {}
        let [name, ...etc] = v.slice(cost >= 0 ? 1 : 0).split(/[:>]/);
        if(groupName){
            recipeGroupStartingWith[name] =  groupName;
            groupName = undefined;
        }
        if (!etc)
            debugger
        let [from, to] = etc.map(strToObj).map(a => {
            for (let k in a) {
                if(!categories.BNS[k] && !categories.WLD[k])
                    bonus[k] = 1;
                if (a[k] == 0) {
                    delete a[k]
                }
            }
            return a
        }).filter(v => v)
        return short ? [name, from] : [name, { from, to, t: v, name, cost, bonus }]
    }).filter(v => v)) as { [id: string]: Recipe }
}

export function parsePedia() {
    let category: string;
    dict = Object.fromEntries(scenario.d.split("\n").map(v => {
        if (v[0] == "=") {
            category = v.slice(1);
            categories[category] = {};
        } else {
            let [k, name] = v.split(" ")
            categories[category][k] = 1;
            return [k, name]
        }
    }).filter(a => a) as any);
    for (let m in scenario.m) {
        mult[m] = parseRecipes(scenario.m[m], true);
    }

    recipes = parseRecipes(scenario.rr);
    //console.log(dict);
    //console.log(recipes);
    //console.log(mult);
}



//console.log(recipes, dict);

export function initGame(seed: number) {
    let game = {
        pop: 100,
        store: Object.fromEntries(Object.keys(dict).filter(k => categories.RES[k] || categories.TLS[k]).map(k => [k, 0])),
        bonus: Object.fromEntries(Object.keys(categories.BNS).map(k => [k, 0])),
        sel: new Set(["Walk", "Swim"]),
        '🏃': "Walk",
        '⚓': "Swim",
        date: 0,
        seed,
        maps: [] as LayeredMap[],
    } as Game;
    return game    
}

export function happiness(){
    let h = game.store.food>0?0:-10;
    for(let k in game.store){
        let v = game.store[k];
        let b = (v/100)**0.8;
        h += b;
    }
    return h;
}


export function travelToP(p: Poi) {
    delete game.store[game.deposit];
    game.home = p;
    game.deposit = p.kind;
    game.store[p.kind] = poiLeft(p);
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

/**Maximum of what of this recipe can be made. If there is goal, then it will not try make more product (should be only one) than goal */
function recipeMax(r: Recipe, goal?: number) {
    let max = 1e12;
    if (goal != null) {
        let to = Object.values(r.to)[0];
        max = goal / to;
    }
    for (let k in r.from) {
        max = Math.min(game.store[k] / r.from[k], max)
    }
    return max
}

/**Apply recipe uage result */
function recipeUse({ used, made }) {
    for (let k in used) {
        game.store[k] -= used[k];
        if (game.deposit == k && game.home) {
            game.home.taken += used[k];
        }
    }
    for (let k in made) {
        game.store[k] = (game.store[k] || 0) + made[k];
    }
}

export function trimObj(a) {
    for (let k in { ...a })
        if (!a[k])
            delete a[k]
    return a
}

/**How many resources will be used and made, accounting for TOOLS multiplier */
function recipeUsage(r: Recipe, m: number) {
    let used = {}, made = {};
    for (let k in r.from) {
        let v = r.from[k] * m;
        let useMult = categories.TLS[k] ? 0.1 : 1;
        used[k] = v * useMult;
    }
    for (let k in r.to) {
        let v = r.to[k] * m;
        let sk = scenario.aka[k] ?? k;
        made[sk] = v
    }
    return { used, made }
}

export function setLocalRecipes() {
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

const travelTypes = ["⚓", "🏃"];

export function tryToUse(rname?: string) {
    if (rname) {
        let r = game.cr[rname];

        for (let travelType of travelTypes) {
            if (r.to[travelType]) {
                let tt = game[travelType];
                game.sel.delete(tt);
                game.sel.add(r.name)
                game[travelType] = r.name
                return
            }
        }

        let v = recipeMax(r)
        if (v > 0) {
            v = Math.min(v, game.pop);
            let usage = recipeUsage(r, v)
            recipeUse(usage);
            advanceTimeByWeeks(v / game.pop);
        }
    }
}

export function advanceTimeByWeeks(weeks:number){
    game.date += weeks / scenario.wpy;    
    render()
}

export function recipeUseable(rname: string){
    let r = game.cr[rname];
    return recipeMax(r)>0;
}

/**How many steps (weeks of foot travel) it takes to travel from a to w */
export function travelSteps(m: LayeredMap, a: Poi, b?: Poi) {
    if (!b)
        return [0, 0];
    let d = dist(a.at, b.at);
    let w = 0, l = 0;
    for (let i = 0; i < d; i++) {
        let at = lerpXY(a.at, b.at, i / d)
        let ind = coord2ind(at)
        if (m.elevation[ind] < 0)
            w += scenario.dm;
        else
            l += scenario.dm;
    }
    return { '🏃': l, '⚓': w } as { '🏃': number, '⚓': number };
}

function sumObj(a, b) {
    return Object.fromEntries(Object.keys({ ...a, ...b }).map(k => [k, (a[k] || 0) + (b[k] || 0)]));
}

export function travelWeight() {
    let v = game.pop;
    for (let k in game.store) {
        if (game.deposit != k)
            v += game.store[k] * 0.1;
    }
    return v;
}

/**Resources and time to travel */
export function travelCost(m: LayeredMap, a: Poi, b?: Poi) {
    let tw = travelWeight();
    let ts = travelSteps(m, a, b);
    let landSteps = ts['🏃'], waterSteps = ts['⚓'];
    let [landRecipe, waterRecipe] = [recipes[game['🏃']], recipes[game['⚓']]];
    for (let r of [landRecipe, waterRecipe]) {
        if (recipeMax(r) < tw)
            return { fail: 1 };
    }

    landSteps *= tw;
    waterSteps *= tw;

    //if(landSteps>0)        debugger

    let [landTime, waterTime] = [recipeMax(landRecipe, landSteps), recipeMax(waterRecipe, waterSteps)]
    let landResources = recipeUsage(landRecipe, landTime),
        waterResources = recipeUsage(waterRecipe, waterTime);
    let sum = sumObj(landResources.made, waterResources.made);
    if (sum['🏃'] >= landSteps - .1 && sum['⚓'] >= waterSteps - .1) {
        let so = sumObj(landResources.used, waterResources.used);
        so.w = (landTime + waterTime) / game.pop;
        return trimObj(so);
    } else {
        return { fail: 2 };
    }
}