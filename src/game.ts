import { centerMap, fix, game, generateGameMap, m, render, report, setMap, settings } from "./prog";
import { categories, LAKE, OCEAN, scenario } from "./scenario";
import { clamp, coord2ind, dist, LayeredMap, lerp, lerpXY, random, XY } from "./worldgen";

export type Recipe = {
    name: string,
    from: { [id: string]: number },
    to: { [id: string]: number },
    cost: number,
    research: { [id: string]: number }
}

export let dict: { [id: string]: { name: string, category: string } }, recipes: { [id: string]: Recipe }, mult = {};

export type Game = {
    store: { [id: string]: number }
    bonus: { [id: string]: number }
    pop: number
    home: Poi | undefined
    tech: { [id: string]: number }
    research: { [id: string]: number }
    /**local deposit icon */
    deposit: string
    /**selecte options */
    sel: any
    '🏃': string,
    '⚓': string,
    poi: Poi[]
    date: number
    seed: number
    focus: string
};

export let mapsCache: LayeredMap[] = []

export type Poi = {
    at: XY
    kind: string
    div?: HTMLDivElement
    size: number
    taken: number
    temp: number
    age: number
    ageByWeek: number
}

/**local recipes */
export let currentRecipes: { [id: string]: Recipe }


export function poiLeft(p: Poi) {
    return Math.max(0, ~~(p.size * scenario.psz * Math.sin(clamp(0, 1, p.age) * 3.14) - p.taken));
}

function generatePoi(m: LayeredMap, pois: Poi[], date?: number) {
    let at: XY = [~~(random() * m.p.width), ~~(random() * m.p.height)];
    for (let op of pois) {
        if (dist(op.at, at) < 10) {
            return
        }
    }

    let i = coord2ind(at);
    let biome = m.biome[i]
    let kind: string, isCal = false;

    let size = 1 + random();
    if (biome == LAKE || biome == OCEAN) {
        kind = "🐠"
        if (biome == LAKE)
            size += 1;
        else
            kind = "🐋"
    } else {
        let cr = m.noise[i + 500] % 0.1;
        let maxSpawn = (game.date%1 >= 12/13) || (game.date%13>=12)
        if (cr < (maxSpawn?0.01:0.001)*game.date) {
            let cals = Object.keys(categories["CAL"]);
            kind = cals[~~(random()*cals.length)];
            isCal = true;
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
    }
    let p: Poi = { at, kind, size, taken: 0, age: random(), temp: m.temperature[i], ageByWeek: (random() + 0.5) * scenario.abw * (isCal?10:1) };
    pois.push(p)
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
    let groupName: string | undefined;
    return Object.fromEntries(s.split("\n").map(v => {
        if (v[0] == "=") {
            groupName = v.slice(1);
            return null as any;
        }

        let cost = Number(v[0]);

        let research = {}
        let [name, ...etc] = v.slice(cost >= 0 ? 1 : 0).split(/[:>\!]/);
        if (groupName) {
            recipeGroupStartingWith[name] = groupName;
            groupName = undefined;
        }
        if (!etc)
            debugger


        let [from, to, tech] = etc.map(strToObj).map((a, i) => {
            let addToRes = etc.length <= 2 || i == 2;
            for (let k in a) {
                if (!categories.BNS[k] && addToRes) {
                    if (scenario.aka[k]) {
                        research[scenario.aka[k]] = 1;
                    } else if (scenario.m[k]) {
                        for (let o in mult[k]) {
                            research[o] = 1;
                        }
                    } else {
                        research[k] = 1;
                    }
                } if (a[k] == 0) {
                    delete a[k]
                }
            }
            return a
        }).filter(v => v)

        return short ? [name, from] : [name, { from, to, t: v, name, cost, research } as Recipe]
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
        sel: { Walk: 1, Swim: 1 },
        '🏃': "Walk",
        '⚓': "Swim",
        date: 0,
        seed,
        tech: {},
        research: {}
    } as any as Game;
    game.poi = []
    game.date = 0.99;
    //game.bonus['⚗️'] = 1;

    for (let k in recipes) {
        game.tech[k] = recipes[k].cost == 0 ? 1 : 0;
        game.research[k] = 0;
    }

    return game
}

export function happiness() {
    let food = game.store['🍎'];
    let h = food > 0 ? 0 : -game.pop
    for (let k in game.store) {
        let v = game.store[k]
        let b = v ** 0.75
        if (k == '🍎')
            b = withBonus(h, '🍲')
        h += b
    }
    h = withBonus(h, '💕')
    return h;
}

function withBonus(n: number, k: string) {
    return smartMult(game.bonus[k]) * n;
}


export function travelToP(p: Poi) {
    delete game.store[game.deposit];
    if (game.home) {
        let tc = travelCost(m, p, game.home)
        advanceTimeByWeeks(tc.w)
        delete tc.w;
        for (let k in tc)
            game.store[k] -= tc[k];
    }
    game.home = p;
    game.deposit = p.kind;
    game.store[p.kind] = poiLeft(p);
    centerMap()
}

export function populate(pois: Poi[]) {
    setMap(generateGameMap(game.date));
    console.time("populate")
    let missing = scenario.pois - pois.length;
    for (let j = 0; j < missing * 4; j++) {
        generatePoi(m, pois);
    }
    compactPois(m, pois)
    console.timeEnd("populate")
}

export function compactPois(m: LayeredMap, pois: Poi[]) {
    let allTypes = new Set<string>(pois.map(p => p.kind));

    let fp: Poi[] = [];

    for (let type of allTypes) {
        let thisType = pois.filter(p => p.kind == type);
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
        fp.push(...thisType.filter(a => a.size));
    }

    return pois.splice(0, 1e9, ...fp)
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
    report(recipeToText(used) + "🡢" + recipeToText(made))
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

export function setCurrentRecipes() {
    let rr: { [id: string]: Recipe } = JSON.parse(JSON.stringify(recipes));
    for (let r of Object.values(rr)) {
        let special = Object.keys(scenario.m).find(a => r.from[a])
        if (special && game.home) {
            let m = mult[special][game.home.kind];
            if (m) {
                let mm = 1
                if (special == '🐾') {
                    mm = withBonus(1, '🎯');
                }


                for (let k in r.to) {
                    if (m[k]) {
                        r.to[k] = r.to[k] * m[k] * mm;
                    }
                }
                r.from[game.home.kind] = r.from[special];
                delete r.from[special]
            }
        }
        for (let k in r.to) {
            let m = 1;
            if (game.tech[r.name] > 0)
                m *= 1 + 0.1 * (game.tech[r.name] - 1)
            r.to[k] *= m;
        }
    }

    currentRecipes = rr;
}

const travelTypes = ["⚓", "🏃"];

export function tryToUse(rname?: string) {
    if (rname) {
        let r = currentRecipes[rname];
        if (!r.to) {
            //game.sel[rname] = game.sel[rname]?undefined:1;
            return
        }


        for (let travelType of travelTypes) {
            if (r.to[travelType]) {
                let tt = game[travelType];
                delete game.sel[tt];
                game.sel[r.name] = 1
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

export function currentWeek() {
    return ~~(game.date * scenario.wpy)
}

export function advanceTimeByWeeks(weeks = 1) {
    let w = currentWeek();
    game.date += weeks / scenario.wpy;
    while (w < currentWeek()) {
        w++;
        processWeek();
    }
    render()
    window["save"](0)
}

function processWeek() {
    let eaten = game.pop * (1 + game.bonus['🥄']) * 0.1;
    game.store['🍎'] -= eaten;
    if (game.store['🍎'] < 0) {
        let d = game.store['🍎'] * 0.1
        game.pop += d;
        game.store['🍎'] = 0;
        report(`<red>🍎hungry! ${fix(d)}👨‍👩‍👦‍👦</red>`)
    }

    let spd = scenario.popspd;
    let dHappiness = clamp(-game.pop * spd, game.pop * spd, (happiness() - game.pop) * spd);
    console.log({ dHappiness });
    game.pop += dHappiness;

    for (let k in game.store) {
        let advancing = Object.values(currentRecipes).filter(r => r.research[k]);
        let by = game.store[k] ** 0.8 / advancing.length * scenario.rspd;
        for (let a of advancing) {
            research(a.name, by)
        }
        if (k != game.deposit) {
            game.store[k] *= (1 - scenario.amrt);
        }
    }

    let bonus = game.bonus['⚗️'];
    let books = game.store['📙'] ** 0.9 * Math.max(1, bonus);

    for (let rn in recipes) {
        research(rn, books * scenario.rpb)
    }

    if (game.focus) {
        research(game.focus, books * scenario.rpbf * bonus)
    }

    for (let p of [...game.poi]) {
        p.age += p.ageByWeek;
        if ((p.age > 1 || poiLeft(p) <= 0) && game.home != p) {
            game.poi.splice(game.poi.indexOf(p), 1);
            let np: Poi | undefined;
            do {
                np = generatePoi(m, game.poi, game.date);
            } while (!np)
        }
    }

    updateBonuses();

    populate(game.poi)
}

export function updateBonuses() {
    for (let n in game.bonus) {
        game.bonus[n] = 0;
    }
    for (let r of Object.values(recipes)) {
        if (!r.to && game.tech[r.name] > 0) {
            for (let k in r.from) {
                game.bonus[k] += r.from[k] * (0.9 + 0.1 * game.tech[r.name])
            }
        }
    }
}

function research(name: string, v: number) {
    game.research[name] += v;
    let tc = tierCost(name)
    if (game.research[name] > tc) {
        game.tech[name]++;
        game.research[name] = 0;
        let t = game.tech[name];
        report(t > 1 ? `${name} advanced to level ${t}` : `${name} researched`)
    }
}

export function tierCost(name: string) {
    return scenario.rcst[recipes[name].cost] * 2 ** (game.tech[name])
}

export function recipeUseable(rname: string) {
    let r = currentRecipes[rname];
    return recipeMax(r) > 0;
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

function smartMult(n: number) {
    return n > 0 ? 1 + n : 1 / (1 - n)
}

console.log("SM", smartMult(0.5));

export function recipeToText(r, vertical?) {
    if (r?.fail) {
        return "too<br/>far"
    }
    let txt = r ? Object.keys(r).map(k => `<num data-red='${game.store[k] < 0.1}'>${fix(r[k])}</num>${k}`).join(vertical ? "<br/>" : " ") : ""
    return txt;
}

