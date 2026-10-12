/* 天賦 */
(function (root) {
  'use strict';
  const AW = root.AW;

  AW.TRAITS = {
    gamer: {
      name: '電競神童', icon: '🕹️', cost: 0,
      desc: 'FPS / DOTA 成長 +25%',
      growth: { game: 0.25 },
    },
    scholar: {
      name: '書香世家', icon: '📖', cost: 0,
      desc: '學力成長 +25%',
      growth: { study: 0.25, tech: 0.15 },
    },
    reflex: {
      name: '神經反射', icon: '⚡', cost: 0,
      desc: '反應力成長 +25%，反應力衰退延後 2 年',
      growth: { reflex: 0.25 },
      reflexDelay: 2,
    },
    iron: {
      name: '鋼鐵肝', icon: '🫀', cost: 0,
      desc: '健康消耗 -40%',
      drain: { health: 0.4 },
    },
    sunny: {
      name: '樂天派', icon: '🌞', cost: 0,
      desc: '心情消耗 -40%',
      drain: { mood: 0.4 },
    },
    popular: {
      name: '人氣王', icon: '🌟', cost: 3,
      desc: '人緣成長 +30%，名氣獲得 +30%',
      growth: { social: 0.3, fame: 0.3, leader: 0.1 },
    },
    netcafe: {
      name: '網咖少爺', icon: '🏪', cost: 4,
      desc: '家裡開網咖：網咖類行動免費，FPS / DOTA 初始 +5',
      start: { fps: 5, dota: 5 },
      freeNetcafe: true,
    },
    rich: {
      name: '富二代', icon: '💎', cost: 4,
      desc: '初始金錢 +50 萬，零用錢 ×3',
      start: { money: 500000 },
      allowance: 3,
    },
    clutch: {
      name: '大心臟', icon: '💪', cost: 5,
      desc: '關鍵比賽勝率 +6%；考績評等更穩定',
      clutch: 0.06,
    },
    genius: {
      name: '天才阿維', icon: '👑', cost: 8,
      desc: '所有能力成長 +15%',
      growth: { all: 0.15 },
    },
  };

  AW.STARTER_TRAITS = ['gamer', 'scholar', 'reflex', 'iron', 'sunny'];
})(typeof window !== 'undefined' ? window : globalThis);
