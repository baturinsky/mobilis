import { mapToList, colorFromRGB16String, RGBA } from "./worldgen";

export const categories = {} as any;

export const scenario = {
    /**Local research multiplier */
    lrm: 0.1,
    /**age by week */
    abw:0.02,
    /**research per book */
    rpb:0.1,
    /**research per book for focused*/
    rpbf:1,
    popspd:0.01,
    /**POI deposit sizes */
    psz: 1000,
    /**Blended maps per cycle */
    blnd:13,
    /** Total pois */
    pois:300,
    /**research speed */
    rspd:1,
    /**res wasted per week */
    amrt:0.003,
    /**research per tier */
    rcst: [100,100,300,1000,3000],
    /**weeks per year */
    wpy:169,
    /**Distance multiplier */
    dm: .1,
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
0Forage:1🍃>1🍎
0Pick Sticks:1🍃>1🪵
1Axe:1🍃1🛠️.1🪨>3🪵
2Herd:10🍃>10🌾!0🐂0🐏0🐗0🌿
2Farm:3🍃>5🌾0🌿
2Plantation:3🍃>3👖
0Hunt:1🐾>1🍎1👖!0🐾
1Bow:3🐾1🏹>3🍎3👖!0🐾0🏹
1Trap:2🐾2🛠️>2🍎2👖0.2🐴!0🐾0🛠️
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
    sm:{
        '🐏':0.3,
        '💧':0.3,
        '🗿':0.3
    },

    /**multipliers*/
    m: {
        '🐾': `🐏:1🍎3👖
🐂:3🍎1👖0🐴
🐎:2🍎1👖0.5🐴
🐪:1🍎1👖0.3🐴
🐺:1🍎1👖0🐴
🐗:4🍎1👖0🐴
🐅:1🍎2👖0🐴
`,
        '🍃': 
`🌿:2.5🍎0.5🪵1🌾1🐴1👖
🌲:1🍎2🪵0.3🌾0.35🐴0.3👖
🌳:2🍎1🪵0.5🌾0.5🐴0.3👖
🌴:1.5🍎1.5🪵0.3🌾0.3🐴0.3👖
💧:1🍎0.3🪵0.5🌾0.5🐴1👖`
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


