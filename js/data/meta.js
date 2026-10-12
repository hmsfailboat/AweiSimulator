/* 結局、成就、傳承升級 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const pn = (s) => s.displayName;

  AW.ENDINGS = {
    world_champ: { name: '世界冠軍', icon: '🏆', good: true,
      text: (s) => `${pn(s)} 在世界賽決賽舉起冠軍獎盃。彩帶從天而降，全場高喊他的 ID。那個從小被說「只會打電動」的孩子，證明了遊戲天才的名號不是浪得虛名。` },
    tech_boss: { name: '科技公司大老闆', icon: '🏢', good: true,
      text: (s) => s.eng.startup >= 5
        ? `劉家維創辦的公司正式掛牌上市，敲鐘的那一刻，他想起小時候拆開第一台電腦的那個下午。從工程師到大老闆，他把遊戲天才的腦袋用在了另一個戰場。`
        : `劉家維被董事會任命為執行長，成為科技公司的大老闆。辦公室的抽屜裡，還放著一支學生時代的滑鼠。` },
    worlds_legend: { name: '世界賽傳說', icon: '🥈',
      text: (s) => `${pn(s)} 曾在世界賽的舞台上與最強的對手交鋒，雖然最後沒能捧盃，但那幾場比賽至今仍被粉絲反覆重播。` },
    domestic_king: { name: '國內霸主', icon: '🥇',
      text: (s) => `${pn(s)} 拿下了 ${s.esports.domesticTitles} 座國內聯賽冠軍，是一個時代的代名詞。世界冠軍的夢，就交給下一代吧。` },
    streamer: { name: '人氣實況主', icon: '📺',
      text: (s) => `退役後的 ${pn(s)} 轉型全職實況主，每晚上萬人守在直播間，看他在天梯上屠殺現役選手。` },
    pro_retire: { name: '職業選手', icon: '🎮',
      text: (s) => `${pn(s)} 結束了職業生涯。雖然沒有站上最高的舞台，但他確實把興趣變成了職業——這件事本身，就已經贏過很多人了。` },
    director: { name: '技術總監', icon: '🧑‍💼',
      text: (s) => `劉家維以「${AW.Engineer.rankName(s)}」的身分退休。一路帶出無數優秀的工程師，業界提起他都會豎起大拇指。` },
    senior_eng: { name: '資深工程師', icon: '💻',
      text: (s) => `劉家維以「${AW.Engineer.rankName(s)}」的身分退休。寫了一輩子的程式，下班後依然是網咖裡最兇的那個大叔。` },
    startup_fail: { name: '創業夢碎', icon: '💸',
      text: () => `創業失敗後，劉家維再也沒能重回巔峰。但他總說：「至少我試過了。」` },
    ordinary: { name: '平凡的阿維', icon: '🛋️',
      text: () => `兩次檢定都沒有通過，劉家維找了一份普通的工作，過著普通的生活。只有在週末的網咖裡，偶爾還能看見那雙天才的手。` },
  };

  AW.ACHIEVEMENTS = [
    { id: 'first_life', name: '第一次重生', icon: '🔁', desc: '完成任意一局' },
    { id: 'prodigy', name: '神童', icon: '🧒', desc: '10 歲前任一能力達到 50',
      check: (s) => s.age < 10 && AW.BIRTH_STATS.some((k) => s.stats[k] >= 50) },
    { id: 'dual', name: '雙修大師', icon: '⚔️', desc: '18 歲前 FPS 與 DOTA 皆達 65',
      check: (s) => s.age <= 18 && s.stats.fps >= 65 && s.stats.dota >= 65 },
    { id: 'scholar', name: '學霸', icon: '🎓', desc: '學力達到 90', check: (s) => s.stats.study >= 90 },
    { id: 'collapse', name: '爆肝', icon: '🫠', desc: '健康歸零病倒', check: (s) => s.flags.collapsed >= 1 },
    { id: 'netcafe_king', name: '網咖之王', icon: '🏪', desc: '累計去網咖 8 次', check: (s) => (s.counters.netcafe || 0) >= 8 },
    { id: 'love', name: '青春戀愛', icon: '💕', desc: '交到女朋友', check: (s) => s.flags.girlfriend },
    { id: 'pro', name: '夢想成真', icon: '🎮', desc: '成為職業選手', check: (s) => s.phase === 'esports' },
    { id: 'big_team', name: '豪門之路', icon: '💎', desc: '加入豪門戰隊', check: (s) => s.esports && s.esports.tier >= 4 },
    { id: 'domestic', name: '國內霸主', icon: '🥇', desc: '奪得職業聯賽冠軍', check: (s) => s.esports && s.esports.domesticTitles >= 1 },
    { id: 'world', name: '世界冠軍', icon: '🏆', desc: '奪得世界賽冠軍', check: (s) => s.esports && s.esports.worldTitles >= 1 },
    { id: 'boss', name: '大老闆', icon: '🏢', desc: '成為科技公司大老闆', check: (s) => s.ending && s.ending.id === 'tech_boss' },
    { id: 'ipo', name: '敲鐘', icon: '🔔', desc: '創業公司 IPO 上市', check: (s) => s.eng && s.eng.startup >= 5 },
    { id: 'startup_fail', name: '失敗為成功之母', icon: '🥀', desc: '創業倒閉一次', check: (s) => s.flags.bankrupt >= 1 },
    { id: 'rich', name: '千萬富翁', icon: '💰', desc: '金錢達到 1,000 萬', check: (s) => s.stats.money >= 10000000 },
    { id: 'ordinary', name: '平凡就是福', icon: '🛋️', desc: '達成「平凡的阿維」結局', check: (s) => s.ending && s.ending.id === 'ordinary' },
    { id: 'all_endings', name: '阿維全知', icon: '📚', desc: '收集所有結局' },
  ];

  AW.UPGRADES = {
    talent: { name: '天生好手', icon: '🧬', desc: '出生時初始點數 +1', max: 10, cost: (lv) => 2 + lv * 2 },
    memory: { name: '重生記憶', icon: '🧠', desc: '所有能力成長 +4%', max: 5, cost: (lv) => 3 + lv * 2 },
    rich: { name: '富爸爸', icon: '👨‍👦', desc: '出生時金錢 +10 萬', max: 3, cost: (lv) => 2 + lv * 2 },
  };
})(typeof window !== 'undefined' ? window : globalThis);
