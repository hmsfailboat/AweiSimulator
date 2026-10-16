/* 行動：每年從中選擇 N 個
 * stages: infant(0-5) elem(6-11) junior(12-14) senior(15-17) extra(延長賽)
 *         pro(電競) uni(大學) job(上班) startup(創業)
 *         第二幕：streamer(實況主) coach(教練) biz(創業從商) chairman(董事長) retired(退休) elder(65 歲後)
 * tags: game → 被「禁止打電動」時不可選；hideLocked: 條件不符時直接隱藏（不顯示鎖頭）
 * perf: 工程師年度績效加成；sp: 創業衝刺點數
 * cost: 金錢花費（數字或 (s) => 數字）；income: 職涯收入（會計入所得稅）
 * run(s): 特殊效果，回傳 { text, deltas }
 * 名稱、說明等文字在 js/data/texts.js 的 [action.代號]
 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const STUDENT = ['elem', 'junior', 'senior'];
  const TEEN = ['junior', 'senior'];
  const JOBS2 = ['streamer', 'coach', 'biz', 'chairman'];
  const SECOND = JOBS2.concat('retired');
  const WORK = ['pro', 'job', 'startup'].concat(SECOND);
  const LOVE = TEEN.concat('extra', 'pro', 'uni', 'job', 'startup', 'elder', SECOND);
  const OLD = ['retired', 'elder'];
  const hasKids = (s) => s.kids.length > 0;
  const isGame = (s, g) => !!s.esports && s.esports.game === g;

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
      effects: (s) => (isGame(s, 'dota') ? { teamwork: 8, main: 2, tactics: 2, mood: -1 } : { teamwork: 8, main: 2, mood: -1 }) },
    { id: 'review_vod', stages: ['pro'],
      effects: (s) => (isGame(s, 'dota') ? { main: 3, teamwork: 3, tactics: 3, mood: -2 } : { main: 4, teamwork: 4, mood: -2 }) },
    // FPS 專屬：今年 ACE 機率提高
    { id: 'aim_train', stages: ['pro'], cond: (s) => isGame(s, 'fps'), hideLocked: true,
      effects: { main: 5, reflex: 3, mood: -3, health: -2 },
      run(s) { s.yearFlags.aim = 1; return { text: AW.tx('action.aim_train', 'msg', s) }; } },
    // DOTA 專屬：今年的版本契合度至少 +3
    { id: 'draft_study', stages: ['pro'], cond: (s) => isGame(s, 'dota'), hideLocked: true,
      effects: { tactics: 6, main: 2, mood: -2 },
      run(s) { AW.Esports.readMeta(s); return { text: AW.tx('action.draft_study', 'msg', s, { 版本: AW.Esports.metaText(s) }) }; } },
    { id: 'stream', stages: ['pro'], income: (s) => 30000 + s.stats.fame * 3000,
      effects: { fame: 6, mood: 3, main: 1 } },
    { id: 'gym', stages: WORK,
      effects: { health: 12, mood: 2 },
      run(s) { s.yearFlags.gym = 1; return { text: AW.tx('action.gym', 'msg', s), deltas: {} }; } },
    { id: 'pro_rest', stages: ['pro', 'streamer', 'coach'],
      effects: { health: 10, mood: 15 } },
    { id: 'endorse', stages: ['pro'],
      cond: (s) => s.stats.fame >= 40, income: (s) => s.stats.fame * 15000,
      effects: { fame: 3, mood: -2, main: -1 } },

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
    { id: 'networking', stages: ['job', 'startup', 'biz', 'chairman'], cost: 20000,
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
    { id: 'vacation', stages: ['job', 'startup'].concat(JOBS2), cost: 50000,
      effects: { health: 14, mood: 15 } },
    { id: 'quit_startup', stages: ['job'],
      cond: (s) => s.eng.rank >= 2 && s.stats.money >= 3000000 && (s.flags.founded || 0) < 2,
      run(s) { return AW.Engineer.startStartup(s); } },

    // ---------------- 朋友（認識開黑朋友後） ----------------
    { id: 'squad', stages: ['elem', 'junior', 'senior', 'extra', 'pro', 'uni', 'job', 'startup'].concat(SECOND), tags: ['game'],
      cond: (s) => AW.NPC.squadMembers(s).length > 0, hideLocked: true,
      effects: { mood: 8, best: 2, social: 2, health: -2 },
      run(s) { return { text: '', deltas: {}, bonds: AW.NPC.squad(s) }; } },

    // ---------------- 感情（有交往對象時） ----------------
    { id: 'date', stages: LOVE, cond: (s) => AW.Love.active(s), hideLocked: true,
      cost: (s) => (s.age < 18 ? 500 : s.age < 23 ? 3000 : 10000),
      effects: { love: 15, mood: 8, social: 2 },
      // 成年後去阿方的餐廳約會：好感度多加一點
      run(s) {
        const C = AW.FANG_CARE;
        if (s.age < 18 || AW.NPC.bond(s, 'fang') < C.dateBond) return { text: '' };
        const v = AW.NPC.addBond(s, 'fang', 2);
        return { text: AW.tx('action.date', 'msg_fang', s), deltas: AW.applyEffects(s, { love: C.dateLove }), bonds: v ? [{ id: 'fang', v }] : [] };
      } },

    // ---------------- 朋友：胡投顧 ----------------
    { id: 'hu_chat', stages: ['extra', 'pro', 'uni', 'job', 'startup'].concat(SECOND, 'elder'), hideLocked: true,
      cond: (s) => s.age >= 18 && AW.NPC.met(s, 'hu'),
      effects: { mood: 3, study: 1, social: 1 },
      run(s) {
        const v = AW.NPC.addBond(s, 'hu', AW.NPC_BOND.chat * (1 + s.stats.social / 200));
        return { text: AW.tx('action.hu_chat', 'msg', s), bonds: v ? [{ id: 'hu', v }] : [] };
      } },

    // ---------------- 朋友：阿方、Corey（v2.3） ----------------
    { id: 'fang_meal', stages: TEEN.concat('extra', 'pro', 'uni', 'job', 'startup', SECOND, 'elder'), hideLocked: true,
      cond: (s) => AW.NPC.met(s, 'fang'),
      effects: { health: 8, mood: 5 },
      run(s) {
        const v = AW.NPC.addBond(s, 'fang', AW.NPC_BOND.chat * (1 + s.stats.social / 200));
        return { text: AW.tx('action.fang_meal', 'msg', s), bonds: v ? [{ id: 'fang', v }] : [] };
      } },
    // Corey 打輔助很細心：跟他雙排練默契
    { id: 'corey_duo', stages: TEEN.concat('extra', 'pro', 'uni', 'job', 'startup', SECOND, 'elder'), tags: ['game'], hideLocked: true,
      cond: (s) => AW.NPC.met(s, 'corey'),
      effects: { main: 3, teamwork: 5, mood: 4, health: -1 },
      run(s) {
        const v = AW.NPC.addBond(s, 'corey', AW.NPC_BOND.chat * (1 + s.stats.social / 200));
        return { text: AW.tx('action.corey_duo', 'msg', s), bonds: v ? [{ id: 'corey', v }] : [] };
      } },

    // ---------------- 朋友：KE、發哥（v2.3） ----------------
    { id: 'ke_fight', stages: TEEN.concat('extra', 'pro', 'uni', 'job', 'startup', SECOND, 'elder'), tags: ['game'], hideLocked: true,
      cond: (s) => AW.NPC.met(s, 'ke'),
      effects: { reflex: 4, mood: 5, health: -1 },
      run(s) {
        const v = AW.NPC.addBond(s, 'ke', AW.NPC_BOND.chat * (1 + s.stats.social / 200));
        return { text: AW.tx('action.ke_fight', 'msg', s), bonds: v ? [{ id: 'ke', v }] : [] };
      } },
    // 請發哥宣傳：名氣上升；實況主訂閱、創業衝刺點數另有加成
    { id: 'fa_promo', stages: ['pro', 'startup', 'streamer', 'coach', 'biz'], hideLocked: true,
      cond: (s) => AW.NPC.met(s, 'fa') && AW.NPC.bond(s, 'fa') >= AW.NPC_BOND.promoBond,
      cost: (s) => AW.NPC_BOND.promoCost / (AW.NPC.bond(s, 'fa') >= AW.NPC_BOND.promoFriend ? 2 : 1),
      effects: { fame: 6, mood: 2 },
      run(s) {
        const v = AW.NPC.addBond(s, 'fa', 3);
        const stage = AW.Engine.stageKey(s);
        let key = 'msg';
        if (stage === 'streamer') { s.second.subs = Math.round(s.second.subs * 1.08); key = 'msg_streamer'; }
        if (stage === 'startup' || stage === 'biz') { s.yearSp += 2; key = 'msg_biz'; }
        return { text: AW.tx('action.fa_promo', key, s), bonds: v ? [{ id: 'fa', v }] : [] };
      } },

    // ---------------- 感情、家庭（v2.0） ----------------
    { id: 'date_fling', stages: LOVE, cond: (s) => s.flings.length > 0, hideLocked: true,
      cost: (s) => (s.age < 23 ? 3000 : 10000) * s.flings.length,
      effects: { mood: 6, health: -2 }, run: (s) => AW.Love.dateFlings(s) },
    { id: 'family_time', stages: WORK.concat('elder'), cond: hasKids, hideLocked: true,
      effects: { mood: 8, love: 6, health: 2 }, run(s) { AW.Family.playWithKids(s); return { text: '' }; } },

    // ---------------- 實況主（v2.0） ----------------
    { id: 'sm_live', stages: ['streamer'], sp: 2, income: (s) => s.second.subs * 0.3,
      effects: { fame: 2, mood: -2, health: -2 } },
    { id: 'sm_video', stages: ['streamer'], sp: 3,
      effects: { fame: 3, mood: -4, health: -3 } },
    { id: 'sm_collab', stages: ['streamer'], sp: 2, cond: (s) => AW.NPC.gamers(s).length > 0, hideLocked: true,
      effects: { mood: 6, social: 2 },
      run(s) {
        const id = AW.pick(AW.NPC.gamers(s));
        return { text: AW.tx('action.sm_collab', 'msg', s, { 朋友: AW.NPC.name(id) }), bonds: [{ id, v: AW.NPC.addBond(s, id, 8) }] };
      } },
    { id: 'sm_sponsor', stages: ['streamer'], sp: -1, income: (s) => s.stats.fame * 20000,
      effects: { fame: -1, mood: -2 } },

    // ---------------- 電競教練（v2.0） ----------------
    { id: 'co_tactics', stages: ['coach'], effects: { tactics: 6, mood: -2 } },
    { id: 'co_train', stages: ['coach'], effects: { teamwork: 2, health: -2 },
      run(s) { s.second.bonus += 3; return { text: AW.tx('action.co_train', 'msg', s) }; } },
    { id: 'co_scout', stages: ['coach'], cost: (s) => 1000000 * (s.second.tier + 1),
      run(s) { s.second.bonus += 5; return { text: AW.tx('action.co_scout', 'msg', s) }; } },
    { id: 'co_mental', stages: ['coach'], effects: { mood: 8, social: 2 },
      run(s) { s.second.bonus += 1; return { text: '' }; } },

    // ---------------- 創業從商（v2.0） ----------------
    { id: 'bz_store', stages: ['biz'], sp: 2, effects: { leader: 2, health: -4 } },
    { id: 'bz_market', stages: ['biz'], sp: 2, cost: 300000, effects: { social: 4, fame: 2, mood: -2 } },
    { id: 'bz_hire', stages: ['biz', 'chairman'], sp: 2, effects: { leader: 5, social: 2 } },
    { id: 'bz_crunch', stages: ['biz', 'chairman'], sp: 4, effects: { health: -12, mood: -8 } },

    // ---------------- 董事長（v2.0） ----------------
    { id: 'ch_strategy', stages: ['chairman'], sp: 2, effects: { leader: 3, mood: -2 } },
    { id: 'ch_rnd', stages: ['chairman'], sp: 3, cost: 10000000, effects: { tech: 3 } },
    { id: 'ch_team', stages: ['chairman'], cost: 200000000, cond: (s) => !s.flags.ownTeam, hideLocked: true,
      effects: { fame: 10, mood: 15 }, run(s) { s.flags.ownTeam = 1; return { text: AW.tx('action.ch_team', 'msg', s) }; } },

    // ---------------- 退休、晚年（v2.0） ----------------
    { id: 'switch_job', stages: SECOND, cond: (s) => s.age < AW.Second.ELDER_AGE || AW.Second.working(s),
      run: (s) => AW.Second.switchJob(s) },
    { id: 'travel', stages: OLD, cost: 500000, effects: { mood: 14, health: 2 },
      run(s) { if (s.age >= 60) s.counters.travelOld = (s.counters.travelOld || 0) + 1; return { text: '' }; } },
    { id: 'fishing', stages: OLD, effects: { mood: 8, health: 3 },
      run(s) {
        if (AW.chance(0.15)) { s.flags.bigFish = 1; return { text: AW.tx('action.fishing', 'msg_big', s) }; }
        return { text: '' };
      } },
    { id: 'elder_squad', stages: OLD, tags: ['game'], cond: (s) => AW.NPC.squadMembers(s).length > 0, hideLocked: true,
      effects: { mood: 10, best: 1 }, run(s) { return { text: '', deltas: {}, bonds: AW.NPC.squad(s) }; } },
    { id: 'charity', stages: OLD.concat('biz', 'chairman'), cond: (s) => s.stats.money >= 1000000,
      run(s) {
        const amt = Math.max(1000000, Math.round(s.stats.money * 0.1 / 10000) * 10000);
        s.counters.donated = (s.counters.donated || 0) + amt;
        const d = AW.applyEffects(s, { money: -amt, fame: 3, mood: 6 });
        return { text: AW.tx('action.charity', 'msg', s, { 金額: AW.fmtMoney(amt) }), deltas: d };
      } },
    { id: 'walk', stages: OLD, effects: { health: 7, mood: 3 } },
    { id: 'memoir', stages: OLD, effects: { mood: 6, study: 2 },
      run(s) { s.counters.memoir = (s.counters.memoir || 0) + 1; return { text: '' }; } },
    { id: 'checkup', stages: OLD.concat(JOBS2), cost: 200000, effects: { health: 8 }, hideLocked: true,
      cond: (s) => s.age >= 50 || !AW.Second.working(s),
      run(s) { s.yearFlags.checkup = 1; return { text: AW.tx('action.checkup', 'msg', s) }; } },

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
