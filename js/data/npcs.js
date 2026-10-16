/* 朋友 NPC（暱稱、介紹等文字在 js/data/texts.js 的 [npc.代號]）
 * gamer: 一起開黑的朋友（「揪團開黑」會提升好友度）
 * squad: 不是開黑朋友，但也會一起開黑；揪團開黑時好友度只加這個比例（胡投顧 0.5）
 * minAge: 幾歲起可能認識；base: 每年認識的基礎機率（再乘上人緣）
 * likes: 當年做了這些行動，認識機率更高
 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const GAME_ACTS = ['play_fps', 'play_dota', 'netcafe', 'friends', 'ranked_night', 'amateur', 'lockdown', 'uni_game', 'uni_club', 'squad'];

  AW.NPCS = {
    hu: { gamer: false, squad: 0.5, minAge: 15, base: 0.06, likes: ['friends', 'uni_club', 'networking', 'parttime'] },
    haji: { gamer: true, minAge: 9, base: 0.11, likes: GAME_ACTS },
    wang: { gamer: true, minAge: 9, base: 0.11, likes: ['play_fps', 'netcafe', 'ranked_night', 'amateur', 'lockdown', 'squad'] },
    fang: { gamer: true, minAge: 9, base: 0.09, likes: GAME_ACTS },
    cat: { gamer: true, minAge: 9, base: 0.09, likes: GAME_ACTS },
    corey: { gamer: true, minAge: 9, base: 0.09, likes: GAME_ACTS.concat('sports') },
    // v2.3
    ke: { gamer: false, squad: 0.3, minAge: 12, base: 0.07, likes: ['ke_fight', 'netcafe', 'reflex_train', 'reflex_drill', 'uni_code', 'code'] },
    gao: { gamer: true, minAge: 14, base: 0.08, likes: ['play_fps', 'ranked_night', 'lockdown', 'squad'] },
    fa: { gamer: true, minAge: 12, base: 0.12, likes: GAME_ACTS.concat('friends', 'uni_club', 'networking') },
  };
  AW.NPC_ORDER = ['hu', 'haji', 'wang', 'fang', 'cat', 'corey', 'ke', 'gao', 'fa'];

  // 雇用：npc 好友度需達 bond，need(s) 其他條件；yearly 每年效果；replaces 雇用後取代的較低階雇用
  // 按鈕、條件不足的提示、雇用／解雇紀錄在 texts.js 的 [staff.代號]
  // 阿方：營養便當 → 私人廚師（兩者都算「阿方的健康餐」）；Corey：活動保鑣（擋外出時的威脅）→ 貼身保全（全部都擋）
  AW.STAFF = {
    bento: { npc: 'fang', bond: 40, salary: 300000, yearly: { health: 1 },
      need: (s) => s.age >= 18 && !(s.staff && s.staff.chef) },
    chef: { npc: 'fang', bond: 60, salary: 1200000, yearly: { health: 4, mood: 2 }, replaces: 'bento',
      need: (s) => AW.Finance.hasHome(s) },
    bodyguard: { npc: 'corey', bond: 40, salary: 400000, yearly: { mood: 1 },
      need: (s) => s.stats.fame >= 40 && !(s.staff && s.staff.guard) },
    guard: { npc: 'corey', bond: 60, salary: 1000000, yearly: { mood: 2 }, replaces: 'bodyguard',
      need: (s) => !!(s.items && s.items.mansion) },
  };
  // 威脅事件（events.js 的 threat）：public 外出時（活動保鑣、貼身保全都擋）；home 居家（只有貼身保全擋）
  AW.THREAT_GUARDS = { public: ['bodyguard', 'guard'], home: ['guard'] };

  // 阿方的健康餐：慢性病要連續 chronicYears 年健康偏低才會得到（原本 3 年）、慢性病每年扣的健康 × chronicDrain、
  // 健康上限每 capStep 歲 -1（原本 2 歲）。營養便當效果較弱，私人廚師效果完整
  // 戰隊營養師（職業選手）：健康消耗減免 nutriDrain、健康偏低時的戰力懲罰改為 nutriPenalty（原本 3）
  AW.FANG_CARE = { meal: { bento: { chronicYears: 4, chronicDrain: 1, capStep: 2 }, chef: { chronicYears: 5, chronicDrain: 0.5, capStep: 2.5 } },
    nutriBond: 50, nutriDrain: 0.3, nutriPenalty: 1,
    // 在阿方的餐廳約會、求婚、婚宴：好友度門檻、約會額外好感、求婚成功率加成
    dateBond: 30, dateLove: 5, proposeBond: 40, proposeBonus: 0.15 };

  // 好友度：初始、每年下降（人緣 ≥ socialKeep 時下降較少）、揪團開黑增加量
  // 認識機率 = base × (meetBase + 人緣 / meetSocial) × (成年 adultMult) + 當年有相關行動 likeBonus
  // 發哥：好友度 ≥ faIntro 時，認識新朋友的機率 × faMeet（他會幫你介紹）
  // 請發哥宣傳：好友度 ≥ promoBond 才能請；費用 promoCost，好友度 ≥ promoFriend 打對折
  AW.NPC_BOND = { faIntro: 40, faMeet: 1.5, promoBond: 30, promoCost: 300000, promoFriend: 70,
    start: 30, decay: 3, decaySocial: 1, socialKeep: 60, squad: 8,
    meetBase: 0.2, meetSocial: 80, adultMult: 0.3, likeBonus: 0.04, oldAge: 60,
    // 不打電動的朋友：當年有交際類行動時好友度 +social；「找胡投顧聊投資」+chat（再乘上人緣加成）
    social: 4, chat: 8 };
})(typeof window !== 'undefined' ? window : globalThis);
