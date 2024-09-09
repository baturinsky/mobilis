import { mapToList, colorFromRGB16String, RGBA } from "./worldgen";

export const scenario = {
    d: `=DEPOSITS
🏔️ ores
⬛ coal
🛢️ oil
💧 water
🗿 relic
=PLANTS
🌿 grass
🌲 taiga
🌳 forest
🌴 jungles
=WILDLIFE
🐏 ram
🐂 yak
🐎 mustang
🐪 camel
🐺 wolves
🐗 hogs
🐅 tigers
=RESOURCES
👖 fabric
🪵 wood
🍎 food
⛽ fuel
📙 book
=TOOLS
🛠️ tools
⛺ housing
🛷 wagons
🐴 horses
⚙️ engines
🗡️ weapons`,

    st: `Foraging;Walking;Sticks`,

    rr: `Foraging:1🍃>1🍎
Walking:>🏃1
Hunting:1🐾>1🍎1👖
Fishing:1🐠>3🍎
Sticks:1🍃>1🪵
Mining:1🛠️1🏔️>1🪨
Axes:1🍃1🛠️0.1🪨>3🪵
Writing:>1📙
Parchment:2👖>2📙
Wigwam:1🪵3👖>⛺
Paper:1🪵1🛠️>4📙
Printing:1🪵2🛠️>10📙
Archeology:1🗿1🛠️>30📙
Tools:1🪵>1🛠️
Metal Working:1🪵1🪨>1🛠️
Rifles:1⚙️1⛽1🪨>1🏹
Alloys:1⚙️1⛽1🪨>1⛺
Cars:1⚙️1⛽1🪨>1🛒
Hunting bows:3🐾1🏹>3🍎3👖
Bows:>1🏹
Traps:2🐾1🛠️>2🍎2👖
Animal Husbandry:10🌿>10🍎
Farms:3🌿>5🍎
Plantations:3🌿>3👖
Firewood:1🪵>1⛽
Coal:1⬛>5⛽
Drills:1⚙️⛽1⬛>10⛽
Oil:1⚙️1⛽1🛢️>20⛽
Greenhouse:1⛺1⛽>5🍎
Fishing Nets:1🛠️1🐠>5🍎
Whaling:1⚓1🛠️1🐋>10🍎
Dog Taming:0.05🥄0.2🦊0.2💗
Cat Taming:0.03🥄-0.2🗑️0.2💗
Pottery:-0.2🗑️
Conservation:-0.3🗑️
Cooking:-0.1🗑️0.5💗🍎
Mapmaking:0.25🔭
Astronomy:0.25🔭
Compass:0.25🔭
Optics:0.25🔭
Horse Herding:3🌿>1🐴
Carts:1🛷>2🏃
Horseback Riding:1🐴1🛷>4🏃
Cars:1⚙️1⛽1🛷>10🏃
Steam:1⚙️1⛽1🛷>10⚓
Sails:1👖1🛷>3⚓`,

    atc: "🐏,🐂,🐂,🐎,🐪,🐏,🐺,🐗,🐗,🐅",

    m: {

        '🐾': `🐏:1🍎3👖
🐂:3🍎1👖
🐎:2🍎1👖
🐪:1🍎1👖
🐺:1🍎1👖
🐗:4🍎1👖
🐅:1🍎2👖
`,
        '🍃': `🌿:2.5🍎0.5🪵1🌾
🌲:1🍎2🪵0.3🌾
🌳:2🍎1🪵0.5🌾
🌴:1.5🍎1.5🪵0.3🌾`
    }
}

export const DESERT = 1,
    GRASSLAND = 2,
    TUNDRA = 3,
    SAVANNA = 4,
    SHRUBLAND = 5,
    TAIGA = 6,
    TROPICAL_FOREST = 7,
    TEMPERATE_FOREST = 8,
    RAIN_FOREST = 9,
    SWAMP = 10,
    SNOW = 11,
    STEPPE = 12,
    CONIFEROUS_FOREST = 13,
    MOUNTAIN = 14,
    BEACH = 15,
    LAKE = 16,
    OCEAN = 17;

// -> temperature V humidity
export const biomeTable = [
    [TUNDRA, STEPPE, SAVANNA, DESERT],
    [TUNDRA, SHRUBLAND, GRASSLAND, SAVANNA],
    [SNOW, SHRUBLAND, GRASSLAND, TEMPERATE_FOREST],
    [SNOW, CONIFEROUS_FOREST, TEMPERATE_FOREST, TROPICAL_FOREST],
    [TAIGA, CONIFEROUS_FOREST, TROPICAL_FOREST, TROPICAL_FOREST],
    [TAIGA, CONIFEROUS_FOREST, TROPICAL_FOREST, RAIN_FOREST],
];


export const biomeColors = mapToList({
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
    [BEACH]: "ff0",
}).map(colorFromRGB16String) as RGBA[];


