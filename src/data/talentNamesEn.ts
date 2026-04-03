/** WASM Japanese talent scaling name → English display name */
const TALENT_NAMES_EN: Record<string, string> = {
  // Common attack patterns
  "1段ダメージ": "1-Hit DMG",
  "2段ダメージ": "2-Hit DMG",
  "3段ダメージ": "3-Hit DMG",
  "4段ダメージ": "4-Hit DMG",
  "5段ダメージ": "5-Hit DMG",
  "3段ダメージ (×2)": "3-Hit DMG (x2)",
  "4段ダメージ (×2)": "4-Hit DMG (x2)",
  "6段ダメージ(1)": "6-Hit DMG (1)",
  "6段ダメージ(2)": "6-Hit DMG (2)",
  "1回のダメージ": "1-Hit DMG",
  "重撃ダメージ(1)": "Charged Attack DMG (1)",
  "重撃ダメージ(2)": "Charged Attack DMG (2)",
  "重撃ダメージボーナス": "Charged Attack DMG Bonus",
  "落下攻撃ダメージ": "Plunging Attack DMG",

  // Scaling variants
  "1段ダメージ・攻撃力": "1-Hit DMG (ATK)",
  "1段ダメージ・元素熟知": "1-Hit DMG (EM)",
  "2段ダメージ・攻撃力": "2-Hit DMG (ATK)",
  "2段ダメージ・元素熟知": "2-Hit DMG (EM)",
  "スキルダメージ・攻撃力": "Skill DMG (ATK)",
  "スキルダメージ・元素熟知": "Skill DMG (EM)",
  "スキルダメージ・防御力": "Skill DMG (DEF)",

  // Skill / Burst generic
  "スキルダメージ": "Skill DMG",
  "スキルDMG": "Skill DMG",
  "Skill DMG": "Skill DMG",
  "スキルダメージ (基礎)": "Skill DMG (Base)",
  "スキルダメージ (×5)": "Skill DMG (x5)",
  "スキルダメージ(1)": "Skill DMG (1)",
  "スキルダメージ(2)": "Skill DMG (2)",
  "スキルダメージ(x3)": "Skill DMG (x3)",
  "スキルダメージ(x5)": "Skill DMG (x5)",
  "スキルダメージ1": "Skill DMG 1",
  "スキルダメージ2": "Skill DMG 2",
  "爆発ダメージ": "Burst DMG",
  "元素爆発ダメージ": "Elemental Burst DMG",
  "バーストダメージ": "Burst DMG",
  "基礎ダメージ": "Base DMG",
  "合計ダメージ": "Total DMG",
  "継続ダメージ": "Continuous DMG",
  "継続攻撃ダメージ": "Continuous Attack DMG",
  "永続ダメージ": "Persistent DMG",
  "発動ダメージ": "Activation DMG",
  "召喚ダメージ": "Summon DMG",
  "協同攻撃ダメージ": "Coordinated Attack DMG",
  "追撃ダメージ": "Follow-up DMG",
  "単発ダメージ": "Single-Hit DMG",
  "初回ダメージ": "Initial DMG",
  "初撃ダメージ": "Initial Hit DMG",
  "共鳴ダメージ": "Resonance DMG",
  "領域ダメージ": "Domain DMG",
  "噴火ダメージ": "Eruption DMG",

  // Press/Hold variants
  "一回押しダメージ": "Press DMG",
  "1回押しダメージ": "Press DMG",
  "短押しダメージ": "Press DMG",
  "長押しダメージ": "Hold DMG",
  "長押し1段ダメージ": "Hold 1-Hit DMG",
  "長押し2段ダメージ": "Hold 2-Hit DMG",
  "長押しダメージ (0重)": "Hold DMG (0 Stacks)",
  "長押しダメージ (3重)": "Hold DMG (3 Stacks)",
  "Hold DMG・元素熟知": "Hold DMG (EM)",
  "Hold DMG・防御力": "Hold DMG (DEF)",
  "Press DMG・元素熟知": "Press DMG (EM)",
  "Press DMG・防御力": "Press DMG (DEF)",
  "近接スキルダメージ": "Melee Skill DMG",
  "遠距離スキルダメージ": "Ranged Skill DMG",
  "連続スキルダメージ": "Continuous Skill DMG",

  // Charged attack variants
  "一段チャージダメージ": "Charged Level 1 DMG",
  "二段チャージダメージ": "Charged Level 2 DMG",

  // Xiangling - Guoba / Pyronado
  "1段旋火輪ダメージ": "Pyronado 1-Hit DMG",
  "2段旋火輪ダメージ": "Pyronado 2-Hit DMG",
  "3段旋火輪ダメージ": "Pyronado 3-Hit DMG",
  "旋火輪ダメージ": "Pyronado DMG",
  "炎の援護ダメージ": "Flame Support DMG",

  // Raiden Shogun
  "夢想の一太刀基礎ダメージ": "Musou no Hitotachi Base DMG",
  "夢想一心1段ダメージ": "Musou Isshin 1-Hit DMG",
  "夢想一心2段ダメージ": "Musou Isshin 2-Hit DMG",
  "夢想一心3段ダメージ": "Musou Isshin 3-Hit DMG",
  "夢想一心4段ダメージ (1)": "Musou Isshin 4-Hit DMG (1)",
  "夢想一心4段ダメージ (2)": "Musou Isshin 4-Hit DMG (2)",
  "夢想一心5段ダメージ": "Musou Isshin 5-Hit DMG",
  "夢想一心重撃ダメージ (1)": "Musou Isshin Charged DMG (1)",
  "夢想一心重撃ダメージ (2)": "Musou Isshin Charged DMG (2)",

  // Hu Tao
  "血梅香ダメージ": "Blood Blossom DMG",
  "低HPスキルダメージ": "Low HP Skill DMG",

  // Nahida
  "滅浄三業ダメージ(攻撃力)": "Tri-Karma Purification DMG (ATK)",

  // Fischl
  "オズ攻撃ダメージ": "Oz Attack DMG",

  // Tartaglia / Childe
  "断流・斬ダメージ": "Riptide Slash DMG",
  "断流・爆ダメージ": "Riptide Blast DMG",

  // Yae Miko
  "殺生桜ダメージ・壱階": "Sesshou Sakura DMG Lv.1",
  "殺生桜ダメージ・弐階": "Sesshou Sakura DMG Lv.2",
  "殺生桜ダメージ・参階": "Sesshou Sakura DMG Lv.3",
  "殺生桜ダメージ・肆階": "Sesshou Sakura DMG Lv.4",
  "天狐雷霆ダメージ": "Tenko Thunderbolt DMG",

  // Kujou Sara
  "天狗の羽撃ダメージ": "Tengu Storm DMG",
  "天狗雷撃ダメージ": "Tengu Thunder DMG",
  "天狗雷球ダメージ": "Tengu Thunder Ball DMG",

  // Zhongli
  "岩柱ダメージ": "Stone Stele DMG",
  "岩晶崩破ダメージ": "Rock Crystal Blast DMG",

  // Venti
  "圧潰渦ダメージ": "Crushing Vortex DMG",
  "付加元素ダメージ": "Additional Elemental DMG",

  // Xingqiu
  "剣雨のダメージ": "Rain Sword DMG",
  "水沫剣ダメージ": "Waterlight Sword DMG",

  // Diluc
  "斬撃ダメージ": "Slash DMG",

  // Klee
  "ドッカン花火ダメージ": "Sparks 'n' Splash DMG",
  "ボンボン爆弾ダメージ": "Bouncing Bomb DMG",

  // Bennett
  "スラッシュダメージ (×5)": "Slash DMG (x5)",

  // Jean / Anemo general
  "旋風キック元素ダメージ": "Gale Blade Elemental DMG",
  "旋風キック短押しダメージ": "Gale Blade Press DMG",
  "旋風キック長押しダメージ": "Gale Blade Hold DMG",

  // Razor
  "狼魂ダメージ": "Soul Companion DMG",

  // Eula
  "光臨の剣基礎ダメージ": "Lightfall Sword Base DMG",
  "光臨の剣スタックダメージ": "Lightfall Sword Stack DMG",

  // Ganyu
  "蓮灯ダメージ": "Ice Lotus DMG",
  "氷嵐ダメージ": "Icicle DMG",
  "霜流矢ダメージ": "Frostflake Arrow DMG",
  "氷星の欠片ダメージ": "Ice Shard DMG",
  "氷星フレアダメージ": "Ice Star Flare DMG",
  "氷渦旋ダメージ": "Ice Vortex DMG",

  // Ayaka
  "氷柱ダメージ": "Icicle DMG",
  "氷槍継続ダメージ": "Ice Lance Continuous DMG",
  "霜降嵐ダメージ": "Frostflake Seki no To DMG",

  // Keqing
  "雷楔ダメージ": "Stiletto DMG",
  "連斬ダメージ": "Consecutive Slash DMG",
  "最後の一撃ダメージ": "Final Attack DMG",

  // Lisa
  "雷放電ダメージ": "Lightning Discharge DMG",

  // Beidou
  "放電ダメージ": "Lightning Discharge DMG",

  // Noelle
  "ダメージ増加 (DEF基準)": "DMG Increase (DEF)",
  "ATK追加 (DEF基準)": "ATK Bonus (DEF)",
  "回復量 (DEF基準)": "Healing (DEF)",

  // Xiao
  "フライングキック": "Flying Kick",

  // Sucrose
  "風風輪ダメージ": "Wind Spirit DMG",
  "風風輪元素ダメージ": "Wind Spirit Elemental DMG",

  // Barbara
  "治癒量": "Healing",
  "水滴ダメージ": "Water Drop DMG",

  // Kokomi
  "海月ダメージボーナス": "Jellyfish DMG Bonus",

  // Chongyun
  "氷星の欠片ダメージ": "Ice Shard DMG",

  // Diona
  "猫の爪ダメージ": "Cat's Claw DMG",
  "凍結爆弾ダメージ": "Frozen Bomb DMG",

  // Qiqi
  "儀式ダメージ": "Ritual DMG",

  // Gorou
  "宝石ダメージ (1個)": "Crystal DMG (1 Hit)",

  // Mona
  "泡影破裂ダメージ": "Bubble Burst DMG",

  // Kazuha
  "上突きダメージ": "Upward Slash DMG",

  // Cyno
  "刹那の花ダメージ": "Spirit Flower DMG",
  "暗闘1段ダメージ": "Pactsworn 1-Hit DMG",
  "暗闘2段ダメージ": "Pactsworn 2-Hit DMG",
  "暗闘3段ダメージ": "Pactsworn 3-Hit DMG",
  "暗闘龍ダメージ": "Pactsworn Dragon DMG",

  // Alhaitham
  "鎮静マークダメージ": "Mirror DMG",
  "集中マークダメージ": "Focus DMG",

  // Nilou
  "水月ダメージ": "Moon DMG",
  "開花ダメージ": "Bloom DMG",

  // Wanderer / Scaramouche
  "夢念衝撃波ダメージ": "Dream Shockwave DMG",

  // Furina
  "紳士のヒステリックダメージ": "Gentleman's Hysteric DMG",
  "騎士のシュヴァルマランダメージ": "Knight's Chevalmarín DMG",
  "マドモワゼルクラバレッタダメージ": "Mademoiselle Crabaletta DMG",

  // Neuvillette
  "正論ボーナス": "Justification Bonus",
  "波衝撃ダメージ": "Wave Impact DMG",
  "巨浪追加ダメージ": "Great Wave Additional DMG",

  // Navia
  "砲弾ダメージ": "Shell DMG",
  "結晶弾片ダメージ": "Crystal Shrapnel DMG",

  // Clorinde
  "夜巡りの一刺しダメージ": "Night Patrol Thrust DMG",
  "上拂スキルダメージ": "Upward Slash Skill DMG",

  // Emilie
  "Lv.1香液ダメージ": "Lv.1 Perfume DMG",
  "Lv.2香液ダメージ(x2)": "Lv.2 Perfume DMG (x2)",
  "Lv.3香液ダメージ": "Lv.3 Perfume DMG",
  "Lv4粉砕圧力ダメージ": "Lv.4 Crushing Pressure DMG",

  // Sigewinne
  "トニック弾ダメージ": "Tonic Shot DMG",
  "チルウォーター爆弾ダメージ": "Chillwater Bomb DMG",
  "トラブルシューター弾ダメージ": "Troubleshooter Shot DMG",
  "アフターサービス弾ダメージ": "After-Service Shot DMG",

  // Mualani
  "鯊鯊バイトダメージ": "Sharky Bite DMG",
  "波紋ダメージ": "Ripple DMG",
  "波乗りチャージ/層": "Wave Riding Charge/Stack",

  // Kinich
  "ループショットダメージ": "Loop Shot DMG",
  "スケールスパイカー砲ダメージ": "Scale Spiker Cannon DMG",

  // Kachina
  "ゴゴキ回転ダメージ": "Turbo Twirly DMG",
  "ゴゴキ突進ダメージ": "Turbo Charge DMG",

  // Xilonen
  "刃ローラー1段": "Blade Roller 1-Hit",
  "刃ローラー2段": "Blade Roller 2-Hit",
  "刃ローラー3段": "Blade Roller 3-Hit",

  // Chasca
  "マルチターゲット射撃ダメージ": "Multi-Target Shot DMG",
  "ヴィヴィッドショットダメージ": "Vivid Shot DMG",

  // Citlali
  "黒曜ツィツィミトルダメージ": "Obsidian Tzitzimitl DMG",
  "猫草豪雨ダメージ": "Cat Grass Downpour DMG",

  // Mavuika
  "炎情フライングキック": "Blazing Flying Kick",
  "炎情突進ダメージ": "Blazing Charge DMG",
  "炎硝矢ダメージ増加": "Flaming Arrow DMG Increase",
  "炎騎通常1段": "Blazing Ride 1-Hit",
  "炎騎通常2段": "Blazing Ride 2-Hit",
  "炎騎通常3段": "Blazing Ride 3-Hit",
  "炎騎通常4段": "Blazing Ride 4-Hit",
  "炎騎通常5段": "Blazing Ride 5-Hit",
  "ボルケーノカブラム": "Volcano Kaboom",

  // Ororon
  "暮の雷弾ダメージ": "Dusk Thunder DMG",

  // Wanderer (continued)
  "風威の虹玉ダメージ": "Wind Force Rainbow DMG",

  // Wriothesley
  "拳撃ダメージ": "Punch DMG",
  "強化パンチダメージ増加": "Enhanced Punch DMG Increase",

  // Lyney
  "ハットトリックダメージ": "Hat Trick DMG",
  "炎のダメージ": "Pyro DMG",

  // Lynette
  "突進ダメージ": "Rush DMG",
  "突進攻撃ダメージ": "Rush Attack DMG",
  "ウーシア泡沫ダメージ": "Ousia Bubble DMG",

  // Freminet
  "スパイクダメージ": "Spike DMG",
  "フロスティパフェダメージ": "Frosty Parfait DMG",

  // Chiori
  "袂飛び道具ダメージ": "Sleeve Projectile DMG",
  "袂自動攻撃ダメージ": "Sleeve Auto-Attack DMG",

  // Yelan
  "蔓纏い矢ダメージ": "Exquisite Throw DMG",
  "次段蔓纏い矢ダメージ": "Follow-up Exquisite Throw DMG",

  // Itto
  "最終スラッシュダメージ": "Final Slash DMG",
  "切り裂きダメージ": "Rending DMG",

  // Shenhe
  "寒病鬼ダメージ": "Spirit Summon DMG",

  // Yoimiya
  "琉金の炎爆発ダメージ": "Aurous Blaze Explosion DMG",

  // Thoma
  "炎の援護ダメージ": "Fiery Collapse DMG",
  "二次爆発ダメージ": "Secondary Explosion DMG",

  // Sayu
  "蹴りダメージ": "Kick DMG",
  "振り回しダメージ": "Whirl DMG",

  // Yaoyao
  "白玉大根ダメージ": "Radish DMG",
  "白玉大根(爆発)ダメージ": "Radish (Explosion) DMG",

  // Gaming
  "飛び蹴りダメージ": "Drop Kick DMG",
  "ボンボン爆弾ダメージ": "Bouncing Bomb DMG",

  // Xianyun
  "跳躍ダメージ": "Leap DMG",
  "流雲波1段ダメージ": "Cloud Wave 1-Hit DMG",
  "流雲波2段ダメージ": "Cloud Wave 2-Hit DMG",
  "流雲波3段ダメージ": "Cloud Wave 3-Hit DMG",

  // Kaveh
  "ムジムジだるまダメージ": "Mehrak DMG",

  // Dehya
  "不屈の炎ダメージ": "Indomitable Flame DMG",
  "灼熱の輪ダメージ": "Scorching Ring DMG",

  // Baizhu
  "生滅の花ダメージ": "Life-Death Flower DMG",

  // Kirara
  "ブービートラップダメージ": "Booby Trap DMG",
  "出入りダメージ": "Entry-Exit DMG",
  "飛散する水刃ダメージ": "Scattering Water Blade DMG",

  // Faruzan
  "スナップマークダメージ": "Pressurized Collapse DMG",

  // Collei
  "越祓草の輪ダメージ": "Floral Ring DMG",

  // Tighnari
  "玲瓏一擲ダメージ(×3)": "Wreath Arrow DMG (x3)",

  // Dori
  "コネクターダメージ": "Connector DMG",
  "ドラゴンブレスダメージ": "Dragon Breath DMG",

  // Sethos
  "流星ダメージ": "Meteor DMG",

  // Arlecchino
  "白炎1段ダメージ": "Crimson Moon 1-Hit DMG",
  "白炎2段ダメージ": "Crimson Moon 2-Hit DMG",
  "白炎3段ダメージ": "Crimson Moon 3-Hit DMG",
  "白炎変換ダメージ": "Crimson Moon Conversion DMG",
  "白炎龍ダメージ": "Crimson Moon Dragon DMG",
  "血償の勅令ダメージ": "Blood-Debt Directive DMG",

  // Wriothesley (continued)
  "過充填弾ダメージ": "Overcharged Shot DMG",

  // Charlotte
  "撮影ダメージ (短押し)": "Snapshot DMG (Press)",
  "撮影ダメージ (長押し)": "Snapshot DMG (Hold)",
  "カメラ継続ダメージ": "Camera Continuous DMG",

  // Chevreuse
  "エニグマスラストダメージ": "Enigma Thrust DMG",

  // Navia (continued)
  "流湧の刃ダメージ": "Surging Blade DMG",

  // Neuvillette (continued)
  "瞬水剣1段ダメージ": "Water Blade 1-Hit DMG",
  "瞬水剣2段ダメージ": "Water Blade 2-Hit DMG",
  "瞬水剣3段ダメージ": "Water Blade 3-Hit DMG",
  "滝ダメージ": "Waterfall DMG",

  // Electro-related
  "雷鳴交響ダメージ": "Thunder Symphony DMG",
  "雷鳴斬撃ダメージ": "Thunder Slash DMG",
  "ビルギッタ放電ダメージ": "Birgitta Discharge DMG",

  // Spirit-related
  "霊の弾ダメージ": "Spirit Bullet DMG",
  "霊息の棘ダメージ": "Spirit Thorn DMG",
  "霊息棘ダメージ": "Spirit Thorn DMG",
  "霊気棘ダメージ": "Spirit Spine DMG",
  "霊脈頭蓋ダメージ": "Ley Line Skull DMG",
  "霊駿突進1段ダメージ": "Spirit Steed Charge 1-Hit DMG",
  "霊駿突進2段ダメージ": "Spirit Steed Charge 2-Hit DMG",

  // Kokomi (continued)
  "バウンドバブルダメージ": "Bouncing Bubble DMG",

  // Miscellaneous combat actions
  "受撃時ダメージボーナス": "DMG Bonus on Hit",
  "通常攻撃ダメージボーナス": "Normal Attack DMG Bonus",
  "変格スタックボーナス": "Variant Stack Bonus",

  // Various character-specific
  "殯儀の秘儀ダメージ": "Funerary Rite DMG",
  "音波衝突ダメージ": "Sound Wave Collision DMG",
  "影狩シェルダメージ": "Shadow-Hunt Shell DMG",
  "輝く影狩シェルダメージ": "Shining Shadow-Hunt Shell DMG",
  "魂狩シェルダメージ": "Soul-Hunt Shell DMG",
  "輝く魂狩シェルダメージ": "Shining Soul-Hunt Shell DMG",
  "裂風シェルダメージ": "Wind-Cut Shell DMG",
  "永眠の讃歌ダメージ": "Eternal Rest Hymn DMG",
  "星光弾ダメージ": "Starlight Bullet DMG",
  "星枝ダメージ": "Star Branch DMG",
  "落雷ダメージ": "Lightning Strike DMG",
  "迅捷の追撃ダメージ": "Swift Pursuit DMG",
  "迅捷の追撃貫通ダメージ": "Swift Pursuit Penetration DMG",
  "サージングブレードダメージ": "Surging Blade DMG",
  "羽月環ダメージ": "Feather Moon Ring DMG",
  "ボグルキャットボックスダメージ": "Bogglecat Box DMG",
  "北方槍嵐ダメージ": "Northern Polearm Storm DMG",

  // Lunar/Moon phase related
  "月相転移1段ダメージ": "Lunar Phase Shift 1-Hit DMG",
  "月相転移2段ダメージ": "Lunar Phase Shift 2-Hit DMG",
  "月相転移3段ダメージ(x2)": "Lunar Phase Shift 3-Hit DMG (x2)",
  "月相転移4段ダメージ": "Lunar Phase Shift 4-Hit DMG",
  "月相転移4段追加ダメージ": "Lunar Phase Shift 4-Hit Additional DMG",
  "月相転移重撃ダメージ(x2)": "Lunar Phase Shift Charged DMG (x2)",
  "中盤月感電ダメージ": "Mid Lunar Electro-Charged DMG",
  "終盤月感電ダメージ": "Final Lunar Electro-Charged DMG",
  "月結晶化ダメージ増加": "Lunar Crystallize DMG Increase",
  "月開花ダメージ": "Lunar Bloom DMG",
  "月開花ダメージ増加": "Lunar Bloom DMG Increase",

  // Eula Variant
  "末途の一撃1段ダメージ": "End's Strike 1-Hit DMG",
  "末途の一撃2段ダメージ": "End's Strike 2-Hit DMG",
  "末途の一撃3段ダメージ": "End's Strike 3-Hit DMG",
  "末途の一撃4段ダメージ": "End's Strike 4-Hit DMG",
  "末途の一撃5段ダメージ": "End's Strike 5-Hit DMG",
  "末途の一撃重撃ダメージ": "End's Strike Charged DMG",

  // Frost/Ice
  "霜林聖域攻撃ダメージ・攻撃力": "Frost Forest Sanctuary DMG (ATK)",
  "霜林聖域攻撃ダメージ・元素熟知": "Frost Forest Sanctuary DMG (EM)",

  // Bloom/Plant
  "開花/超開花/烈開花ダメージ増加": "Bloom/Hyperbloom/Burgeon DMG Increase",

  // Nefer
  "幻影演舞1段(Nefer)・攻撃力": "Phantom Dance 1-Hit (Nefer) ATK",
  "幻影演舞1段(Nefer)・元素熟知": "Phantom Dance 1-Hit (Nefer) EM",
  "幻影演舞1段(分身)": "Phantom Dance 1-Hit (Clone)",
  "幻影演舞2段(Nefer)・攻撃力": "Phantom Dance 2-Hit (Nefer) ATK",
  "幻影演舞2段(Nefer)・元素熟知": "Phantom Dance 2-Hit (Nefer) EM",
  "幻影演舞2段(分身)": "Phantom Dance 2-Hit (Clone)",
  "幻影演舞3段(分身)": "Phantom Dance 3-Hit (Clone)",

  // S&D pattern
  "S&D 1段ダメージ": "S&D 1-Hit DMG",
  "S&D 2段ダメージA": "S&D 2-Hit DMG A",
  "S&D 2段ダメージB": "S&D 2-Hit DMG B",
  "S&D 3段ダメージA": "S&D 3-Hit DMG A",
  "S&D 3段ダメージB": "S&D 3-Hit DMG B",
  "S&D 4段ダメージA": "S&D 4-Hit DMG A",
  "S&D 4段ダメージB": "S&D 4-Hit DMG B",
  "S&D 5段ダメージA": "S&D 5-Hit DMG A",
  "S&D 5段ダメージB": "S&D 5-Hit DMG B",
  "S&D 重撃ダメージA": "S&D Charged DMG A",
  "S&D 重撃ダメージB": "S&D Charged DMG B",

  // Durin / newer characters
  "Azure Devour A (×2)": "Azure Devour A (x2)",
  "Azure Devour B (×2)": "Azure Devour B (x2)",
  "Four Winds' Ascension A": "Four Winds' Ascension A",
  "Four Winds' Ascension B": "Four Winds' Ascension B",
  "Gravity Interference: Lunar-Bloom DMG": "Gravity Interference: Lunar-Bloom DMG",
  "Gravity Interference: Lunar-Charged DMG": "Gravity Interference: Lunar-Charged DMG",
  "Gravity Interference: Lunar-Crystallize DMG": "Gravity Interference: Lunar-Crystallize DMG",
  "Gravity Ripple Continuous DMG": "Gravity Ripple Continuous DMG",

  // Yanfei
  "炎のダメージ": "Pyro DMG",

  // Misc
  "剣舞ステップ1ダメージ": "Sword Dance Step 1 DMG",
  "剣舞ステップ2ダメージ": "Sword Dance Step 2 DMG",
  "水の幻影ダメージ": "Water Phantom DMG",
};

export default TALENT_NAMES_EN;
