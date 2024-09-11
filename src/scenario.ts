import { mapToList, colorFromRGB16String, RGBA } from "./worldgen";

export const categories = {} as any;

export const scenario = {
    rcst: [0,100,300,1000,3000],
    wpy:169,
    /**Distance multiplier */
    dm: .1,
    d: `=DEP
🏔️ ores
⬛ coal
🛢️ oil
💧 water
🗿 relic
=PLNT
🌿 grass
🌲 taiga
🌳 forest
🌴 jungles
=ANM
🐏 ram
🐂 yak
🐎 mustang
🐪 camel
🐺 wolves
🐗 hogs
🐅 tigers
=RES
👖 fabric
🪵 wood
🍎 food
⛽ fuel
📙 book
=TLS
🛠️ tools
⛺ housing
🛷 wagons
🐴 horses
⚙️ engines
🏹 weapons
=BNS
🥄 food consumption
🔭 visibility range
🗑️ food spoilage
🎯 hunting bonus
🍲 food happiness
💗 happiness
⚗️ research focus
=WLD
🐾 animals
🍃 plants
🌾 cropss
=MOV
🏃 walk
⚓ swim
=CALAMITY
👹 goblin
☣️ taint
🌋 fracture`,



    st: `Foraging;Walking;Sticks`,

    aka: { '🌾': '🍎' },


    rr:
        `=Land travel method
0Walk:>1🏃
0Ride:1🐴1🛷>4🏃0🐎0🐪
0Drive:1⚙️1⛽1🛷>10🏃
=Sea travel method
0Swim:>0.1⚓
0Sail:0.1👖1🛷>3⚓
0Boat:1⚙️1⛽1🛷>10⚓
=Jobs
0Forage:1🍃>3🍎
0Pick Sticks:1🍃>1🪵
1Axe:1🍃1🛠️.1🪨>3🪵
2Herd:10🍃>10🌾0🐂0🐗
2Farm:3🍃>5🌾
2Plantation:3🍃>3👖
0Hunt:1🐾>3🍎1👖
1Bow:3🐾1🏹>10🍎3👖
1Trap:2🐾1🛠️>5🍎2👖
0Fish:1🐠>10🍎
1Fishing nets:1🛠️1🐠>15🍎
3Whaling:1⚓1🛠️1🐋>30🍎
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
1Horses:3🍃>1🐴0🐎0🐪
2Metal Working:1🪵1🪨>3🛠️
4Rifles:1⚙️1⛽1🪨>3🏹
4Engines:3🛠️3🪨>1⚙️
3Alloys:1⚙️1⛽1🪨>3⛺
4Cars:1⚙️1⛽1🪨>1🛷
4Greenhouse:1⛺1⛽>15🍎
=Calamities
4Kill goblins:1🏹1👹>1📙
4Burn taint:1🛠️1⛽1☣️>1📙
4Close fracture:1⚙️1⛽1🌋>1📙
=Permanent bonuses
1Tame Dogs:.05🥄.2🎯1💗0🐺
1Tame Cats:.03🥄-.2🗑️1💗0🐅
1Pottery:-.2🗑️0🍎
2Conservation:-.3🗑️0🍎
2Cooking:-.1🗑️.5🍲0🍎
1Mapmaking:.25🔭0🏃
2Astronomy:.25🔭0🏃
3Compass:.25🔭0🏃
4Optics:.25🔭0🏃
1Research Focus:1⚗️0📙`,

    /**animals per temperature and humidity */
    atc: "🐏,🐂,🐂,🐎,🐪,🐏,🐺,🐗,🐗,🐅",

    /**multipliers*/
    m: {
        '🐾': `🐏:1🍎3👖
🐂:3🍎1👖
🐎:2🍎1👖
🐪:1🍎1👖
🐺:1🍎1👖
🐗:4🍎1👖
🐅:1🍎2👖
`,
        '🍃': `🌿:2.5🍎0.5🪵1🌾1🐴1👖
🌲:1🍎2🪵0.3🌾0.35🐴0.3👖
🌳:2🍎1🪵0.5🌾0.5🐴0.3👖
🌴:1.5🍎1.5🪵0.3🌾0.3🐴0.3👖`
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


