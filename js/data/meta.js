/* 結局、成就、傳承升級（名稱、說明在 js/data/texts.js） */
(function (root) {
  'use strict';
  const AW = root.AW;

  // variant(s) 回傳文本版本，例 'ipo' → 使用 text_ipo
  AW.ENDINGS = {
    world_champ: { good: true },
    tech_boss: { good: true, variant: (s) => (s.eng.startup >= 5 ? 'ipo' : 'ceo') },
    worlds_legend: {},
    domestic_king: {},
    streamer: {},
    pro_retire: {},
    director: {},
    senior_eng: {},
    startup_fail: {},
    ordinary: {},
    happy_life: { good: true },
    fire: { good: true },
    burnout: {},
    bankrupt: {},
  };

  AW.ACHIEVEMENTS = [
    { id: 'first_life' },
    { id: 'prodigy', check: (s) => s.age < 10 && AW.BIRTH_STATS.some((k) => s.stats[k] >= 50) },
    { id: 'dual', check: (s) => s.age <= 18 && s.stats.fps >= 65 && s.stats.dota >= 65 },
    { id: 'scholar', check: (s) => s.stats.study >= 90 },
    { id: 'collapse', check: (s) => s.flags.collapsed >= 1 },
    { id: 'netcafe_king', check: (s) => (s.counters.netcafe || 0) >= 8 },
    { id: 'love', check: (s) => s.flags.girlfriend },
    { id: 'married', check: (s) => s.love && s.love.status === 'married' },
    { id: 'heartbreak', check: (s) => s.flags.brokeUp >= 1 },
    { id: 'pro', check: (s) => s.phase === 'esports' },
    { id: 'big_team', check: (s) => s.esports && s.esports.tier >= 4 },
    { id: 'domestic', check: (s) => s.esports && s.esports.domesticTitles >= 1 },
    { id: 'world', check: (s) => s.esports && s.esports.worldTitles >= 1 },
    { id: 'boss', check: (s) => s.ending && s.ending.id === 'tech_boss' },
    { id: 'ipo', check: (s) => s.eng && s.eng.startup >= 5 },
    { id: 'startup_fail', check: (s) => s.flags.bankrupt >= 1 },
    { id: 'rich', check: (s) => s.stats.money >= 10000000 },
    { id: 'shopaholic', check: (s) => (s.counters.spent || 0) >= 50000000 },
    { id: 'mansion', check: (s) => s.items && s.items.mansion },
    { id: 'big_win', check: (s) => s.flags.bigWin },
    { id: 'jackpot', check: (s) => s.flags.jackpot },
    { id: 'happy', check: (s) => s.ending && AW.Engine.lifeAvg(s).mood >= 85 },
    { id: 'iron_man', check: (s) => s.ending && !s.flags.collapsed && AW.Engine.lifeAvg(s).health >= 80 },
    { id: 'ordinary', check: (s) => s.ending && s.ending.id === 'ordinary' },
    // v1.2
    { id: 'friends_all', check: (s) => s.npcs && AW.NPC_ORDER.every((id) => s.npcs[id]) },
    { id: 'squad6', check: (s) => s.flags.squad6 },
    { id: 'rival_slayer', check: (s) => s.flags.rivalSlayer },
    { id: 'rival_friends', check: (s) => s.rival && s.rival.w + s.rival.l >= 15 },
    { id: 'office_top', check: (s) => (s.counters.officeTop || 0) >= 3 },
    { id: 'weiya', check: (s) => s.flags.weiya },
    { id: 'house', check: (s) => s.items && s.items.house },
    { id: 'chef', check: (s) => s.staff && s.staff.chef },
    { id: 'guard', check: (s) => s.staff && s.staff.guard },
    { id: 'taxpayer', check: (s) => s.fin && s.fin.taxTotal >= 10000000 },
    { id: 'in_debt', check: (s) => s.flags.debt },
    { id: 'hu_win', check: (s) => s.flags.huWin },
    { id: 'all_endings' },
  ];

  AW.UPGRADES = {
    talent: { max: 10, cost: (lv) => 2 + lv * 4 },
    memory: { max: 5, cost: (lv) => 5 + lv * 6 },
    rich: { max: 3, cost: (lv) => 3 + lv * 3 },
  };
})(typeof window !== 'undefined' ? window : globalThis);
