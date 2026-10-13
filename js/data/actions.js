/* 行動：每年從中選擇 N 個
 * stages: infant(0-5) elem(6-11) junior(12-14) senior(15-17) extra(延長賽)
 *         pro(電競) uni(大學) job(上班) startup(創業)
 * tags: game → 被「禁止打電動」時不可選；hideLocked: 條件不符時直接隱藏（不顯示鎖頭）
 * perf: 工程師年度績效加成；sp: 創業衝刺點數
 * cost: 金錢花費（數字或 (s) => 數字）
 * run(s): 特殊效果，回傳 { text, deltas }
 * 名稱、說明等文字在 js/data/texts.js 的 [action.代號]
 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const STUDENT = ['elem', 'junior', 'senior'];
  const TEEN = ['junior', 'senior'];
  const LOVE = TEEN.concat('extra', 'pro', 'uni', 'job', 'startup');

  AW.ACTIONS = [
    // ---------------- 嬰幼兒 ----------------
    { id: 'crawl', stages: ['infant'],
      effects: { health: 6, reflex: 3, mood: 3 } },
    { id: 'watch_dad', stages: ['infant'], tags: ['game'],
      effects: { fps: 3, dota: 3, reflex: 1, mood: 3 } },
    { id: 'blocks', stages: ['infant'],
      effects: { study: 4, reflex: 2 } },
    { id: 'story', stages: ['infant'],
      effects: { study: 5, mood: 4 } },
    { id: 'neighbor', stages: ['infant'],
      effects: { social: 5, mood: 4, health: 2 } },
    { id: 'tablet', stages: ['infant'], tags: ['game'],
      effects: { reflex: 4, fps: 2, health: -2 } },

    // ---------------- 學生共通 ----------------
    { id: 'class', stages: STUDENT.concat('extra'),
      effects: { study: 6, mood: -2 } },
    { id: 'workbook', stages: STUDENT,
      effects: { study: 7, mood: -5, health: -1 } },
    { id: 'play_fps', stages: STUDENT.concat('extra'), tags: ['game'],
      effects: { fps: 6, reflex: 2, mood: 4, health: -1 } },
    { id: 'play_dota', stages: STUDENT.concat('extra'), tags: ['game'],
      cond: (s) => s.age >= 9,
      effects: { dota: 6, social: 1, mood: 4, health: -1 } },
    { id: 'sports', stages: STUDENT,
      effects: { health: 7, reflex: 3, social: 2 } },
    { id: 'friends', stages: STUDENT,
      effects: { social: 6, mood: 5 } },
    { id: 'rest', stages: STUDENT.concat('extra'),
      effects: { health: 8, mood: 10 } },

    // ---------------- 國高中 ----------------
    { id: 'cram', stages: TEEN,
      effects: { study: 9, mood: -7, health: -2 } },
    { id: 'netcafe', stages: TEEN.concat('extra'), tags: ['game'], cost: 3000, netcafe: true,
      effects: { fps: 4, dota: 4, social: 4, mood: 6, health: -2 } },
    { id: 'reflex_train', stages: TEEN.concat('extra'),
      effects: { reflex: 6, mood: -1 } },
    { id: 'ranked_night', stages: TEEN.concat('extra'), tags: ['game'],
      effects: { best: 8, reflex: 2, health: -8, mood: 2 } },

    // ---------------- 高中 ----------------
    { id: 'exam_prep', stages: ['senior', 'extra'],
      effects: { study: 10, mood: -7, health: -3 } },
    { id: 'amateur', stages: ['senior', 'extra'], tags: ['game'],
      effects: { best: 5, reflex: 2, mood: 2 },
      run(s) {
        const best = AW.resolveKey(s, 'best');
        const p = AW.clamp((s.stats[best] - 25) / 60, 0.05, 0.9);
        if (AW.chance(p)) {
          const d = AW.applyEffects(s, { fame: 8, money: 20000, mood: 6 });
          s.flags.amateurWins = (s.flags.amateurWins || 0) + 1;
          return { text: AW.tx('action.amateur', 'msg_win', s), deltas: d };
        }
        const d = AW.applyEffects(s, { fame: 2, mood: -3 });
        return { text: AW.tx('action.amateur', 'msg_lose', s), deltas: d };
      } },
    { id: 'parttime', stages: ['senior', 'extra'],
      effects: { money: 30000, social: 2, health: -3, mood: -2 } },

    // ---------------- 延長賽專屬 ----------------
    { id: 'retake_class', stages: ['extra'],
      effects: { study: 14, mood: -10, health: -4 } },
    { id: 'lockdown', stages: ['extra'], tags: ['game'], cost: 10000, netcafe: true,
      effects: { best: 12, reflex: 3, health: -6, mood: -3 } },

    // ---------------- 電競職業 ----------------
    { id: 'solo_grind', stages: ['pro'],
      effects: { main: 7, mood: -3, health: -3 } },
    { id: 'reflex_drill', stages: ['pro'],
      effects: { reflex: 6, mood: -2 } },
    { id: 'scrim', stages: ['pro'],
      effects: { teamwork: 8, main: 2, mood: -1 } },
    { id: 'review_vod', stages: ['pro'],
      effects: { main: 4, teamwork: 4, mood: -2 } },
    { id: 'stream', stages: ['pro'],
      effects: (s) => ({ fame: 6, money: 30000 + s.stats.fame * 3000, mood: 3, main: 1 }) },
    { id: 'gym', stages: ['pro', 'job', 'startup'],
      effects: { health: 12, mood: 2 },
      run(s) { s.yearFlags.gym = 1; return { text: AW.tx('action.gym', 'msg', s), deltas: {} }; } },
    { id: 'pro_rest', stages: ['pro'],
      effects: { health: 10, mood: 15 } },
    { id: 'endorse', stages: ['pro'],
      cond: (s) => s.stats.fame >= 40,
      effects: (s) => ({ money: s.stats.fame * 15000, fame: 3, mood: -2, main: -1 }) },

    // ---------------- 大學 ----------------
    { id: 'uni_study', stages: ['uni'],
      effects: { study: 6, tech: 4, mood: -3 } },
    { id: 'uni_code', stages: ['uni'],
      effects: { tech: 8, mood: -1, health: -2 } },
    { id: 'uni_club', stages: ['uni'],
      effects: { social: 6, leader: 4, mood: 5 } },
    { id: 'uni_intern', stages: ['uni'], cond: (s) => s.age >= 20,
      effects: { tech: 6, social: 2, money: 80000, mood: -2 },
      run(s) { s.eng.interns = (s.eng.interns || 0) + 1; return { text: AW.tx('action.uni_intern', 'msg', s), deltas: {} }; } },
    { id: 'uni_job', stages: ['uni'],
      effects: { money: 60000, social: 2, health: -3 } },
    { id: 'uni_game', stages: ['uni', 'job'],
      effects: { mood: 12, best: 2 } },
    { id: 'uni_rest', stages: ['uni'],
      effects: { health: 10, mood: 8 } },

    // ---------------- 上班 ----------------
    { id: 'code', stages: ['job'], perf: 2,
      effects: { tech: 5, health: -3, mood: -1 } },
    { id: 'learn', stages: ['job', 'startup'], cost: 30000,
      effects: { tech: 5, study: 3, mood: -2 } },
    { id: 'mentor', stages: ['job'], perf: 1,
      cond: (s) => s.eng.rank >= 1,
      effects: { leader: 6, social: 2, mood: -1 } },
    { id: 'crossteam', stages: ['job'], perf: 1,
      effects: { social: 5, leader: 3, mood: -2 } },
    { id: 'networking', stages: ['job', 'startup'], cost: 20000,
      effects: { social: 7, leader: 2, health: -5 } },
    { id: 'overtime', stages: ['job'], perf: 4,
      effects: { tech: 2, health: -12, mood: -8 } },
    { id: 'side_project', stages: ['job'],
      effects: { tech: 4, mood: 2, health: -3 },
      run(s) {
        if (AW.chance(0.25) && !s.flags.startupIdea) {
          s.flags.startupIdea = 1;
          return { text: AW.tx('action.side_project', 'msg', s), deltas: {} };
        }
        return { text: '', deltas: {} };
      } },
    { id: 'invest', stages: ['pro', 'job'],
      cond: (s) => s.stats.money >= 100000,
      run(s) {
        const base = Math.min(s.stats.money * 0.3, 5000000);
        const r = AW.rand() * 0.6 - 0.2; // -20% ~ +40%
        const d = AW.applyEffects(s, { money: Math.round(base * r), mood: r > 0 ? 4 : -4 });
        return { text: AW.tx('action.invest', r > 0 ? 'msg_win' : 'msg_lose', s), deltas: d };
      } },
    { id: 'vacation', stages: ['job', 'startup'], cost: 50000,
      effects: { health: 14, mood: 15 } },
    { id: 'quit_startup', stages: ['job'],
      cond: (s) => s.eng.rank >= 2 && s.stats.money >= 3000000 && (s.flags.founded || 0) < 2,
      run(s) { return AW.Engineer.startStartup(s); } },

    // ---------------- 感情（有交往對象時） ----------------
    { id: 'date', stages: LOVE, cond: (s) => AW.Love.active(s), hideLocked: true,
      cost: (s) => (s.age < 18 ? 500 : s.age < 23 ? 3000 : 10000),
      effects: { love: 15, mood: 8, social: 2 } },

    // ---------------- 創業 ----------------
    { id: 'st_product', stages: ['startup'], sp: 2,
      effects: { tech: 5, health: -4 } },
    { id: 'st_pitch', stages: ['startup'], sp: 2,
      effects: { social: 5, leader: 2, mood: -3 } },
    { id: 'st_hire', stages: ['startup'], sp: 2,
      effects: { leader: 6, social: 2 } },
    { id: 'st_crunch', stages: ['startup'], sp: 4,
      effects: { tech: 2, leader: 2, health: -14, mood: -10 } },
  ];

  AW.ACTION_MAP = {};
  for (const a of AW.ACTIONS) AW.ACTION_MAP[a.id] = a;
})(typeof window !== 'undefined' ? window : globalThis);
