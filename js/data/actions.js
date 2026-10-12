/* 行動：每年從中選擇 N 個
 * stages: infant(0-5) elem(6-11) junior(12-14) senior(15-17) extra(延長賽)
 *         pro(電競) uni(大學) job(上班) startup(創業)
 * tags: game → 被「禁止打電動」時不可選
 * perf: 工程師年度績效加成；sp: 創業衝刺點數
 * run(s): 特殊效果，回傳 { text, deltas }
 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const STUDENT = ['elem', 'junior', 'senior'];
  const TEEN = ['junior', 'senior'];

  AW.ACTIONS = [
    // ---------------- 嬰幼兒 ----------------
    { id: 'crawl', name: '到處爬來爬去', icon: '🐛', stages: ['infant'],
      effects: { health: 6, reflex: 3, mood: 3 }, desc: '把整個客廳當成競技場。' },
    { id: 'watch_dad', name: '看爸爸打電動', icon: '📺', stages: ['infant'], tags: ['game'],
      effects: { fps: 3, dota: 3, reflex: 1, mood: 3 }, desc: '坐在爸爸腿上，眼睛盯著螢幕不放。' },
    { id: 'blocks', name: '玩積木', icon: '🧱', stages: ['infant'],
      effects: { study: 4, reflex: 2 }, desc: '蓋出一座比自己還高的塔。' },
    { id: 'story', name: '聽床邊故事', icon: '📖', stages: ['infant'],
      effects: { study: 5, mood: 4 }, desc: '每晚都要聽三個故事才肯睡。' },
    { id: 'neighbor', name: '跟鄰居小孩玩', icon: '🧒', stages: ['infant'],
      effects: { social: 5, mood: 4, health: 2 }, desc: '社區公園的孩子王。' },
    { id: 'tablet', name: '偷玩媽媽的平板', icon: '📱', stages: ['infant'], tags: ['game'],
      effects: { reflex: 4, fps: 2, health: -2 }, desc: '兩歲就會自己解鎖螢幕。' },

    // ---------------- 學生共通 ----------------
    { id: 'class', name: '認真上課', icon: '✏️', stages: STUDENT.concat('extra'),
      effects: { study: 6, mood: -2 }, desc: '坐第一排，筆記抄得比老師還整齊。' },
    { id: 'workbook', name: '寫評量 / 刷題', icon: '📝', stages: STUDENT,
      effects: { study: 7, mood: -5, health: -1 }, desc: '一本接一本，寫到手痠。' },
    { id: 'play_fps', name: '練 FPS 槍法', icon: '🎯', stages: STUDENT.concat('extra'), tags: ['game'],
      effects: { fps: 6, reflex: 2, mood: 4, health: -1 }, desc: '爆頭線刻在 DNA 裡。' },
    { id: 'play_dota', name: '打 DOTA', icon: '🗡️', stages: STUDENT.concat('extra'), tags: ['game'],
      cond: (s) => s.age >= 9, lockText: '9 歲解鎖',
      effects: { dota: 6, social: 1, mood: 4, health: -1 }, desc: '補刀、走位、看小地圖。' },
    { id: 'sports', name: '打球運動', icon: '🏀', stages: STUDENT,
      effects: { health: 7, reflex: 3, social: 2 }, desc: '流汗也是一種電競訓練。' },
    { id: 'friends', name: '交朋友', icon: '🤗', stages: STUDENT,
      effects: { social: 6, mood: 5 }, desc: '下課十分鐘就能跟全班混熟。' },
    { id: 'rest', name: '耍廢休息', icon: '🛋️', stages: STUDENT.concat('extra'),
      effects: { health: 8, mood: 10 }, desc: '什麼都不做，也是一種選擇。' },

    // ---------------- 國高中 ----------------
    { id: 'cram', name: '去補習班', icon: '🏫', stages: TEEN,
      effects: { study: 9, mood: -7, health: -2 }, desc: '晚上十點的南陽街……不對，是補習街。' },
    { id: 'netcafe', name: '網咖開黑', icon: '🏪', stages: TEEN.concat('extra'), tags: ['game'], cost: 3000, netcafe: true,
      effects: { fps: 4, dota: 4, social: 4, mood: 6, health: -2 }, desc: '泡麵、耳機、跟兄弟大吼。' },
    { id: 'reflex_train', name: '反應力特訓', icon: '⚡', stages: TEEN.concat('extra'),
      effects: { reflex: 6, mood: -1 }, desc: '音遊、點擊訓練、瞄準練習器輪著來。' },
    { id: 'ranked_night', name: '熬夜衝排位', icon: '🌙', stages: TEEN.concat('extra'), tags: ['game'],
      effects: { best: 8, reflex: 2, health: -8, mood: 2 }, desc: '「再一場就睡」——凌晨四點。' },

    // ---------------- 高中 ----------------
    { id: 'exam_prep', name: '準備學測', icon: '📚', stages: ['senior', 'extra'],
      effects: { study: 10, mood: -7, health: -3 }, desc: '書桌上堆滿了歷屆試題。' },
    { id: 'amateur', name: '參加業餘比賽', icon: '🏆', stages: ['senior', 'extra'], tags: ['game'],
      effects: { best: 5, reflex: 2, mood: 2 },
      run(s) {
        const best = AW.resolveKey(s, 'best');
        const p = AW.clamp((s.stats[best] - 25) / 60, 0.05, 0.9);
        if (AW.chance(p)) {
          const d = AW.applyEffects(s, { fame: 8, money: 20000, mood: 6 });
          s.flags.amateurWins = (s.flags.amateurWins || 0) + 1;
          return { text: '在業餘盃一路殺進冠軍！拿到獎金和一堆陌生人的追蹤。', deltas: d };
        }
        const d = AW.applyEffects(s, { fame: 2, mood: -3 });
        return { text: '止步八強，但有人在聊天室刷「這人誰？好猛」。', deltas: d };
      },
      desc: '用實力讓大家記住你的 ID。（有機會奪冠拿獎金）' },
    { id: 'parttime', name: '打工', icon: '🧋', stages: ['senior', 'extra'],
      effects: { money: 30000, social: 2, health: -3, mood: -2 }, desc: '在手搖飲店搖了一整個暑假。' },

    // ---------------- 延長賽專屬 ----------------
    { id: 'retake_class', name: '重考班', icon: '🏯', stages: ['extra'],
      effects: { study: 14, mood: -10, health: -4 }, desc: '一年只做一件事：考上。' },
    { id: 'lockdown', name: '網咖閉關', icon: '🔒', stages: ['extra'], tags: ['game'], cost: 10000, netcafe: true,
      effects: { best: 12, reflex: 3, health: -6, mood: -3 }, desc: '包台一整年，網咖老闆都認得你了。' },

    // ---------------- 電競職業 ----------------
    { id: 'solo_grind', name: '個人苦練', icon: '🎮', stages: ['pro'],
      effects: { main: 7, mood: -3, health: -3 }, desc: '一天十二小時的天梯與練習模式。' },
    { id: 'reflex_drill', name: '反應特訓', icon: '⚡', stages: ['pro'],
      effects: { reflex: 6, mood: -2 }, desc: '用科學方法壓榨神經系統。' },
    { id: 'scrim', name: '戰隊合練', icon: '🤝', stages: ['pro'],
      effects: { teamwork: 8, main: 2, mood: -1 }, desc: '和隊友打訓練賽、對戰術、喊語音。' },
    { id: 'review_vod', name: '研究對手 VOD', icon: '🔍', stages: ['pro'],
      effects: { main: 4, teamwork: 4, mood: -2 }, desc: '把對手的每一場比賽拆成逐格分析。' },
    { id: 'stream', name: '開台直播', icon: '📺', stages: ['pro'],
      effects: (s) => ({ fame: 6, money: 30000 + s.stats.fame * 3000, mood: 3, main: 1 }),
      desc: '「謝謝 XXX 的訂閱～」名氣越高收入越多。' },
    { id: 'gym', name: '健身房', icon: '🏋️', stages: ['pro', 'job', 'startup'],
      effects: { health: 12, mood: 2 },
      run(s) { s.yearFlags.gym = 1; return { text: '規律運動讓反應力衰退減半。', deltas: {} }; },
      desc: '照顧身體，延緩反應力衰退。' },
    { id: 'pro_rest', name: '休息放假', icon: '🏖️', stages: ['pro'],
      effects: { health: 10, mood: 15 }, desc: '關掉 Discord，去海邊吹風。' },
    { id: 'endorse', name: '接商業代言', icon: '💼', stages: ['pro'],
      cond: (s) => s.stats.fame >= 40, lockText: '名氣 40 解鎖',
      effects: (s) => ({ money: s.stats.fame * 15000, fame: 3, mood: -2, main: -1 }),
      desc: '電競椅、能量飲料、耳機，通通找上你。' },

    // ---------------- 大學 ----------------
    { id: 'uni_study', name: '認真讀書', icon: '📚', stages: ['uni'],
      effects: { study: 6, tech: 4, mood: -3 }, desc: '資料結構、演算法、作業系統。' },
    { id: 'uni_code', name: '寫程式做專題', icon: '💻', stages: ['uni'],
      effects: { tech: 8, mood: -1, health: -2 }, desc: 'GitHub 綠格子一路排滿。' },
    { id: 'uni_club', name: '社團活動', icon: '🎪', stages: ['uni'],
      effects: { social: 6, leader: 4, mood: 5 }, desc: '當上電競社社長，帶學弟妹打校際盃。' },
    { id: 'uni_intern', name: '實習', icon: '🏢', stages: ['uni'], cond: (s) => s.age >= 20, lockText: '大三解鎖',
      effects: { tech: 6, social: 2, money: 80000, mood: -2 },
      run(s) { s.eng.interns = (s.eng.interns || 0) + 1; return { text: '履歷多了一筆實習經歷。', deltas: {} }; },
      desc: '提早見識業界，求職時大加分。' },
    { id: 'uni_job', name: '打工', icon: '🧋', stages: ['uni'],
      effects: { money: 60000, social: 2, health: -3 }, desc: '家教、手搖飲、外送，什麼都做過。' },
    { id: 'uni_game', name: '打電動放鬆', icon: '🎮', stages: ['uni', 'job'],
      effects: { mood: 12, best: 2 }, desc: '天才的手感不能丟。' },
    { id: 'uni_rest', name: '睡飽飽', icon: '😴', stages: ['uni'],
      effects: { health: 10, mood: 8 }, desc: '早八？不存在的。' },

    // ---------------- 上班 ----------------
    { id: 'code', name: '埋頭寫 code', icon: '⌨️', stages: ['job'], perf: 2,
      effects: { tech: 5, health: -3, mood: -1 }, desc: '一天解十張 ticket。' },
    { id: 'learn', name: '進修學習', icon: '🎓', stages: ['job', 'startup'], cost: 30000,
      effects: { tech: 5, study: 3, mood: -2 }, desc: '線上課程、讀論文、考證照。' },
    { id: 'mentor', name: '帶新人', icon: '🧑‍🏫', stages: ['job'], perf: 1,
      cond: (s) => s.eng.rank >= 1, lockText: '升上工程師後解鎖',
      effects: { leader: 6, social: 2, mood: -1 }, desc: '把自己踩過的坑一個個標出來。' },
    { id: 'crossteam', name: '跨部門協作', icon: '🔗', stages: ['job'], perf: 1,
      effects: { social: 5, leader: 3, mood: -2 }, desc: '開會、對齊、再開會。' },
    { id: 'networking', name: '應酬交際', icon: '🍻', stages: ['job', 'startup'], cost: 20000,
      effects: { social: 7, leader: 2, health: -5 }, desc: '酒過三巡，大家都是兄弟。' },
    { id: 'overtime', name: '爆肝加班', icon: '🔥', stages: ['job'], perf: 4,
      effects: { tech: 2, health: -12, mood: -8 }, desc: '辦公室的燈只剩你這盞。考績大幅提升。' },
    { id: 'side_project', name: '下班做 Side Project', icon: '🧪', stages: ['job'],
      effects: { tech: 4, mood: 2, health: -3 },
      run(s) {
        if (AW.chance(0.25) && !s.flags.startupIdea) {
          s.flags.startupIdea = 1;
          return { text: '💡 Side project 意外有人用！這可能是創業的種子（創業成功率提升）。', deltas: {} };
        }
        return { text: '', deltas: {} };
      },
      desc: '有 25% 機會冒出創業點子。' },
    { id: 'invest', name: '投資理財', icon: '📈', stages: ['job'],
      cond: (s) => s.stats.money >= 100000, lockText: '需要 10 萬本金',
      run(s) {
        const base = Math.min(s.stats.money * 0.3, 5000000);
        const r = AW.rand() * 0.6 - 0.2; // -20% ~ +40%
        const d = AW.applyEffects(s, { money: Math.round(base * r), mood: r > 0 ? 4 : -4 });
        return { text: r > 0 ? '投資小賺一筆！' : '投資被套牢了……', deltas: d };
      },
      desc: '拿三成資產去投資，-20% ~ +40%。' },
    { id: 'vacation', name: '休假旅行', icon: '✈️', stages: ['job', 'startup'], cost: 50000,
      effects: { health: 14, mood: 15 }, desc: '去日本吃拉麵，順便逛秋葉原。' },
    { id: 'quit_startup', name: '辭職創業！', icon: '🚀', stages: ['job'],
      cond: (s) => s.eng.rank >= 2 && s.stats.money >= 3000000 && (s.flags.founded || 0) < 2, lockText: '資深工程師 + 300 萬資金（一生最多 2 次）',
      run(s) { return AW.Engineer.startStartup(s); },
      desc: '投入 300 萬，開一間自己的公司。（今年其他行動仍會執行）' },

    // ---------------- 創業 ----------------
    { id: 'st_product', name: '打磨產品', icon: '🛠️', stages: ['startup'], sp: 2,
      effects: { tech: 5, health: -4 }, desc: '一個按鈕改了二十個版本。' },
    { id: 'st_pitch', name: '找投資人路演', icon: '🎤', stages: ['startup'], sp: 2,
      effects: { social: 5, leader: 2, mood: -3 }, desc: '一週見十個 VC，講到嘴破。' },
    { id: 'st_hire', name: '招募核心團隊', icon: '🧑‍🤝‍🧑', stages: ['startup'], sp: 2,
      effects: { leader: 6, social: 2 }, desc: '用夢想和股票說服大神加入。' },
    { id: 'st_crunch', name: '全員衝刺', icon: '🔥', stages: ['startup'], sp: 4,
      effects: { tech: 2, leader: 2, health: -14, mood: -10 }, desc: '睡在公司，衝下一個里程碑。' },
  ];

  AW.ACTION_MAP = {};
  for (const a of AW.ACTIONS) AW.ACTION_MAP[a.id] = a;
})(typeof window !== 'undefined' ? window : globalThis);
