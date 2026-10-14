/* 結局、成就、傳承升級（名稱、說明在 js/data/texts.js） */
(function (root) {
  'use strict';
  const AW = root.AW;

  // variant(s) 回傳文本版本，例 'ipo' → 使用 text_ipo
  // life: true → 人生終章（過世或在第二幕落幕時的結局）；其他是職涯章節，可以選擇「繼續人生」
  const alive = (s) => (s.dead ? 'dead' : 'alive');
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
    // 第二幕的章節（v2.0）
    champ_coach: { good: true },
    mega_streamer: { good: true },
    // 創業從商：掛牌上市（敲鐘）；董事長：科技帝國
    tycoon: { good: true, variant: (s) => (s.second && s.second.job === 'chairman' ? 'empire' : 'ipo') },
    // 人生終章（v2.0）
    peaceful: { life: true, variant: alive },
    family: { life: true, good: true, variant: alive },
    legend: { life: true, good: true, variant: alive },
    centenarian: { life: true, good: true, variant: alive },
    lonely: { life: true, variant: alive },
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
    // v2.0
    { id: 'second_act', check: (s) => s.chapters && s.chapters.length >= 1 },
    { id: 'dynasty', check: (s) => s.esports && s.esports.worldTitles >= 3 },
    { id: 'champ_coach', check: (s) => s.second && s.second.worldTitles >= 1 },
    { id: 'top_streamer', check: (s) => s.flags.topStreamer },
    { id: 'tycoon', check: (s) => s.chapters && s.chapters.some((c) => c.id === 'tycoon') },
    { id: 'double_crown', check: (s) => s.chapters && s.chapters.some((c) => c.id === 'world_champ') && s.chapters.some((c) => c.id === 'tech_boss' || c.id === 'tycoon') },
    { id: 'comeback', check: (s) => s.flags.comeback },
    { id: 'hall_of_fame', check: (s) => s.flags.hallOfFame },
    { id: 'old_soldier', check: (s) => s.flags.oldSoldier },
    { id: 'team_owner', check: (s) => s.flags.ownTeam },
    { id: 'time_master', check: (s) => s.flags.timeMaster },
    { id: 'shura', check: (s) => s.flags.shura },
    { id: 'prodigal', check: (s) => s.flags.shura && s.love && s.love.status === 'married' },
    { id: 'parent', check: (s) => s.kids && s.kids.length >= 1 },
    { id: 'tiger_son', check: (s) => s.flags.tigerSon },
    { id: 'grandparent', check: (s) => s.grandkids >= 1 },
    { id: 'philanthropist', check: (s) => (s.counters.donated || 0) >= 30000000 },
    { id: 'wishes_all', check: (s) => s.flags.allWishes },
    { id: 'centenarian', check: (s) => s.ending && s.ending.id === 'centenarian' },
    { id: 'life_winner', check: (s) => s.ending && s.ending.id === 'legend' },
    // v2.1
    { id: 'centi_billionaire', check: (s) => s.fin && AW.Finance.netWorth(s) >= 10000000000 },
    { id: 'all_endings' },
  ];

  AW.UPGRADES = {
    talent: { max: 10, cost: (lv) => 3 + lv * 5 },
    memory: { max: 5, cost: (lv) => 6 + lv * 7 },
    rich: { max: 3, cost: (lv) => 4 + lv * 3 },
  };
})(typeof window !== 'undefined' ? window : globalThis);
