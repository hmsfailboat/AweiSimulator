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
  };
  AW.NPC_ORDER = ['hu', 'haji', 'wang', 'fang', 'cat', 'corey'];

  // 雇用：npc 好友度需達 bond，need(s) 其他條件；yearly 每年效果
  AW.STAFF = {
    chef: { npc: 'fang', bond: 60, salary: 1200000, yearly: { health: 4, mood: 2 },
      need: (s) => AW.Finance.hasHome(s) },
    guard: { npc: 'corey', bond: 60, salary: 1000000, yearly: { mood: 2 },
      need: (s) => !!(s.items && s.items.mansion) },
  };

  // 好友度：初始、每年下降（人緣 ≥ socialKeep 時下降較少）、揪團開黑增加量
  // 認識機率 = base × (meetBase + 人緣 / meetSocial) × (成年 adultMult) + 當年有相關行動 likeBonus
  AW.NPC_BOND = { start: 30, decay: 3, decaySocial: 1, socialKeep: 60, squad: 8,
    meetBase: 0.2, meetSocial: 80, adultMult: 0.3, likeBonus: 0.04, oldAge: 60,
    // 不打電動的朋友：當年有交際類行動時好友度 +social；「找胡投顧聊投資」+chat（再乘上人緣加成）
    social: 4, chat: 8 };
})(typeof window !== 'undefined' ? window : globalThis);
