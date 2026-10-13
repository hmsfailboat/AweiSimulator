/* 天賦（名稱、說明在 js/data/texts.js 的 [trait.代號]） */
(function (root) {
  'use strict';
  const AW = root.AW;

  AW.TRAITS = {
    gamer: { cost: 0, growth: { game: 0.25 } },
    scholar: { cost: 0, growth: { study: 0.25, tech: 0.15 } },
    reflex: { cost: 0, growth: { reflex: 0.25 }, reflexDelay: 2 },
    iron: { cost: 0, drain: { health: 0.4 } },
    sunny: { cost: 0, drain: { mood: 0.4 } },
    popular: { cost: 7, growth: { social: 0.3, fame: 0.3, leader: 0.1 } },
    netcafe: { cost: 10, start: { fps: 5, dota: 5 }, freeNetcafe: true },
    rich: { cost: 10, start: { money: 500000 }, allowance: 3 },
    clutch: { cost: 14, clutch: 0.06 },
    genius: { cost: 30, growth: { all: 0.15 } },
  };

  AW.STARTER_TRAITS = ['gamer', 'scholar', 'reflex', 'iron', 'sunny'];
})(typeof window !== 'undefined' ? window : globalThis);
