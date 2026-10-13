/* 隨機事件（標題、內文、選項文字在 js/data/texts.js 的 [event.代號]）
 * phase: student / esports / engineer / any
 * cond(s) 觸發條件；weight 權重（可為函式）；once 一生只發生一次
 * vars(s) 文本專用變數，例 { 紅包: '3 千' } → 文本寫 {紅包}
 * variant(s) 回傳文本版本，例 'high' → 使用 text_high
 * 「結果」(outcome) 格式：{ effects, year, next, flags, run }
 *   year: 本年度暫時旗標（例 noGame）；next: 下一年旗標；flags: 永久旗標
 * 無 choices 的事件本身就是一個 outcome。
 * choice: { cond, ...outcome } 或 { cond, roll: { chance, success, fail } }
 *   hideLocked: 條件不符時整個選項不顯示（預設是顯示成灰色）
 *   選項順序對應文本檔的 choice1、choice2…
 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const bestOf = (s) => s.stats[AW.resolveKey(s, 'best')];
  const startLove = (s) => AW.Love.start(s);
  const single = (s) => !AW.Love.active(s);
  const dating = (s) => AW.Love.active(s);

  AW.EVENTS = [
    // ======================= 學生時期 =======================
    { id: 'first_word', phase: 'student', once: true,
      cond: (s) => s.age >= 1 && s.age <= 2, weight: 40,
      choices: [
        { effects: { social: 3, mood: 3 } },
        { effects: { fps: 3, dota: 3, mood: 5 } },
        { effects: { social: 2, health: 2 } },
      ] },
    { id: 'fever', phase: 'student', cond: (s) => s.age < 12, weight: 6,
      effects: { health: -10, mood: -3 } },
    { id: 'grandma', phase: 'student', cond: (s) => s.age < 11, weight: 6,
      effects: { money: 2000, mood: 6, health: 3 } },
    { id: 'cny', phase: 'student', cond: (s) => s.age >= 3, weight: 7,
      vars: (s) => ({ 紅包: AW.fmtMoney(s.age * 1000) }),
      choices: [
        { effects: (s) => ({ money: s.age * 1000, study: 1 }) },
        { effects: (s) => ({ money: Math.round(s.age * 300), fps: 3, dota: 3, mood: 6 }) },
      ] },
    { id: 'hand_speed', phase: 'student', once: true,
      cond: (s) => s.age >= 3 && s.age <= 8 && s.stats.reflex >= 12, weight: 10,
      effects: { reflex: 5, mood: 5 } },
    { id: 'first_pc', phase: 'student', once: true,
      cond: (s) => s.age >= 6 && s.age <= 9, weight: 25,
      choices: [
        { effects: { fps: 4, dota: 3, mood: 10 } },
        { effects: { study: 5, mood: 3 } },
      ] },
    { id: 'confiscate', phase: 'student',
      cond: (s) => s.age >= 9 && s.stats.study < bestOf(s) - 12, weight: 12,
      choices: [
        { effects: { mood: -5, study: 3 }, year: { noGame: 1 } },
        { roll: { chance: 0.5,
          success: { effects: { best: 4, mood: 3, health: -3 } },
          fail: { effects: { mood: -15 }, year: { noGame: 1 } } } },
      ] },
    { id: 'exam_top', phase: 'student', cond: (s) => s.age >= 7 && s.stats.study >= 45, weight: 7,
      effects: { mood: 8, money: 1000, social: 2, study: 2 } },
    { id: 'exam_fail', phase: 'student', cond: (s) => s.age >= 7 && s.stats.study < 30, weight: 8,
      choices: [
        { effects: { study: 5, mood: -6 } },
        { effects: { mood: 3, study: -2 } },
      ] },
    { id: 'tease', phase: 'student', cond: (s) => s.age >= 8 && s.age <= 15, weight: 6,
      choices: [
        { roll: { chance: (s) => AW.clamp(bestOf(s) / 70, 0.1, 0.95),
          success: { effects: { social: 6, mood: 8, fame: 2 } },
          fail: { effects: { mood: -8 } } } },
        { effects: { mood: -3, study: 2 } },
      ] },
    { id: 'crush', phase: 'student', once: true, cond: (s) => s.age >= 13 && single(s), weight: 8,
      choices: [
        { roll: { chance: (s) => AW.clamp(0.15 + s.stats.social / 100, 0.1, 0.9),
          success: { effects: { mood: 20, social: 4 }, run: startLove },
          fail: { effects: { mood: -15 } } } },
        { roll: { chance: (s) => AW.clamp(bestOf(s) / 110, 0.1, 0.85),
          success: { effects: { mood: 15, best: 2, social: 3 }, run: startLove },
          fail: { effects: { mood: -8 } } } },
        { effects: { study: 2, mood: -3 } },
      ] },
    { id: 'lan_party', phase: 'student', cond: (s) => s.age >= 10, weight: 6,
      effects: { fps: 3, dota: 3, social: 4, mood: 6 } },
    { id: 'sports_day', phase: 'student', cond: (s) => s.age >= 6 && s.age <= 17, weight: 5,
      choices: [
        { effects: { health: 5, reflex: 3, social: 3 } },
        { effects: { best: 2, social: -2 } },
      ] },
    { id: 'pro_tv', phase: 'student', once: true,
      cond: (s) => s.age >= 8 && s.age <= 14, weight: 15,
      choices: [
        { effects: { best: 3, mood: 8 }, flags: { dream: 1 } },
        { effects: { study: 3 } },
      ] },
    { id: 'hacked', phase: 'student', cond: (s) => s.age >= 10, weight: 4,
      choices: [
        { effects: { best: 2, mood: -6 } },
        { effects: { study: 3, mood: -8 } },
      ] },
    { id: 'ranked_top', phase: 'student', once: true,
      cond: (s) => s.age >= 12 && bestOf(s) >= 50, weight: 14,
      effects: { fame: 10, mood: 10 }, flags: { scouted: 1 } },
    { id: 'typhoon', phase: 'student', cond: (s) => s.age >= 6, weight: 5,
      choices: [
        { effects: { best: 3, mood: 6 } },
        { effects: { study: 3 } },
      ] },
    { id: 'parents_fight', phase: 'student', cond: (s) => s.age >= 5, weight: 3,
      effects: { mood: -10 } },
    { id: 'camp', phase: 'student', cond: (s) => s.age >= 9 && s.age <= 15, weight: 7,
      choices: [
        { effects: { study: 4, reflex: 1 }, flags: { coder: 1 } },
        { cond: (s) => s.stats.money >= 5000, effects: { best: 5, reflex: 2, money: -5000 } },
        { effects: { health: 6, social: 4 } },
      ] },
    { id: 'olympiad', phase: 'student', cond: (s) => s.age >= 10 && s.stats.study >= 45, weight: 6,
      choices: [
        { roll: { chance: (s) => AW.clamp((s.stats.study - 30) / 60, 0.1, 0.9),
          success: { effects: { study: 5, mood: 10, fame: 2 }, flags: { award: 1 } },
          fail: { effects: { mood: -5, study: 2 } } } },
        { effects: { best: 2 } },
      ] },
    { id: 'myopia', phase: 'student', cond: (s) => s.age >= 8 && bestOf(s) >= 30, weight: 4,
      effects: { health: -5, reflex: -2 } },
    { id: 'new_game', phase: 'any', cond: (s) => s.age >= 8, weight: 4,
      choices: [
        { effects: { best: 3, health: -6, mood: 10 } },
        { effects: { study: 2, mood: -3 } },
      ] },
    { id: 'cousin', phase: 'student', once: true, cond: (s) => s.age >= 4 && s.age <= 10, weight: 10,
      effects: { fps: 3, dota: 3, reflex: 2 } },
    { id: 'legend', phase: 'student', once: true,
      cond: (s) => s.age >= 10 && bestOf(s) >= 45, weight: 10,
      effects: { social: 5, fame: 5, mood: 6 } },
    { id: 'wallet', phase: 'student', cond: (s) => s.age >= 6, weight: 3,
      choices: [
        { effects: { social: 3, mood: 5 } },
        { effects: { money: 3000, mood: -4 } },
      ] },
    { id: 'flu', phase: 'any', weight: 3,
      effects: { health: -12, mood: -4 } },
    { id: 'cat', phase: 'student', once: true, cond: (s) => s.age >= 4 && s.age <= 13, weight: 8,
      effects: { mood: 10, health: 2 } },
    { id: 'mock_exam', phase: 'student', cond: (s) => s.age >= 16 && s.age <= 17, weight: 12,
      variant: (s) => (s.stats.study >= 55 ? 'high' : 'low'),
      choices: [
        { effects: { study: 4, mood: -4 } },
        { effects: { mood: 3 } },
      ] },
    { id: 'scout', phase: 'student', once: true,
      cond: (s) => s.age >= 15 && bestOf(s) >= 55, weight: 12,
      effects: { fame: 5, mood: 8 }, flags: { scouted: 1 } },
    { id: 'netcafe_raid', phase: 'student', cond: (s) => s.age >= 12 && s.age <= 17, weight: 3,
      choices: [
        { roll: { chance: 0.5,
          success: { effects: { mood: 5, best: 1 } },
          fail: { effects: { mood: -10 }, year: { noGame: 1 } } } },
        { effects: { mood: -6, study: 2 }, year: { noGame: 1 } },
      ] },
    { id: 'game_dev_dream', phase: 'student', once: true,
      cond: (s) => s.age >= 11 && s.stats.study >= 35, weight: 6,
      effects: { study: 4, best: 1 }, flags: { coder: 1 } },

    // ======================= 電競職涯 =======================
    { id: 'fan_meet', phase: 'esports', cond: (s) => s.stats.fame >= 20, weight: 6,
      effects: { fame: 5, mood: 8 } },
    { id: 'toxic_mate', phase: 'esports', weight: 7,
      choices: [
        { effects: { teamwork: 6, mood: -3 } },
        { effects: { teamwork: -6, mood: 2 } },
        { effects: { teamwork: 2 } },
      ] },
    { id: 'cheat_accuse', phase: 'esports', cond: (s) => s.stats.fame >= 25, weight: 5,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.reflex / 90, 0.2, 0.95),
          success: { effects: { fame: 12, mood: 6 } },
          fail: { effects: { fame: -6, mood: -8 } } } },
        { effects: { fame: -3, mood: -6 } },
      ] },
    { id: 'sponsor', phase: 'esports', cond: (s) => s.stats.fame >= 35, weight: 5,
      effects: (s) => ({ money: 100000 + s.stats.fame * 8000, fame: 3 }) },
    { id: 'wrist', phase: 'esports', cond: (s) => s.age >= 20, weight: 5,
      choices: [
        { effects: { health: 5, main: -3, mood: -4 } },
        { effects: { health: -15, mood: -2 } },
      ] },
    { id: 'patch', phase: 'esports', weight: 6,
      choices: [
        { roll: { chance: (s) => AW.clamp((s.stats[AW.resolveKey(s, 'main')] + s.stats.study) / 140, 0.2, 0.9),
          success: { effects: { main: 5, teamwork: 2 } },
          fail: { effects: { main: -2, mood: -3 } } } },
        { effects: { main: -1, mood: 2 } },
      ] },
    { id: 'legend_coach', phase: 'esports', once: true, weight: 4,
      effects: { main: 5, teamwork: 3, mood: 5 } },
    { id: 'burnout_warn', phase: 'esports', cond: (s) => s.age >= 22, weight: 4,
      effects: { mood: -14 } },
    { id: 'rookie', phase: 'esports', cond: (s) => s.age >= 24, weight: 6,
      choices: [
        { effects: { main: 4, health: -6, mood: -3 } },
        { effects: { teamwork: 7, social: 3 } },
      ] },
    { id: 'mom_visit', phase: 'esports', weight: 4,
      effects: { mood: 12 } },
    { id: 'contract', phase: 'esports', cond: (s) => s.esports.tier >= 1, weight: 3,
      choices: [
        { effects: { money: -50000, mood: -3, teamwork: -2 } },
        { effects: { mood: -8 } },
      ] },
    { id: 'bootcamp', phase: 'esports', cond: (s) => s.esports.tier >= 2, weight: 5,
      effects: { main: 4, teamwork: 4, mood: -2 } },
    { id: 'viral_clip', phase: 'esports', weight: 5,
      effects: { fame: 10, mood: 6 } },
    { id: 'old_teammate', phase: 'esports', weight: 4,
      effects: { mood: 10, social: 3, health: -2 } },

    // ======================= 工程師職涯：大學 =======================
    { id: 'uni_mixer', phase: 'engineer', cond: (s) => s.eng.stage === 'uni' && single(s), weight: 6,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.social / 80, 0.15, 0.9),
          success: { effects: { social: 5, mood: 10 }, run: startLove },
          fail: { effects: { mood: -5 } } } },
        { effects: { health: 2 } },
      ] },
    { id: 'hackathon', phase: 'engineer', cond: (s) => s.eng.stage !== 'startup', weight: 6,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.tech / 80, 0.1, 0.9),
          success: { effects: { tech: 4, fame: 3, money: 100000, mood: 8 } },
          fail: { effects: { tech: 2, health: -5, mood: -3 } } } },
        { effects: { health: 3 } },
      ] },
    { id: 'finals_week', phase: 'engineer', cond: (s) => s.eng.stage === 'uni', weight: 8,
      effects: { study: 3, tech: 1, health: -6 } },
    { id: 'uni_esports', phase: 'engineer', cond: (s) => s.eng.stage === 'uni' && bestOf(s) >= 45, weight: 7,
      choices: [
        { effects: { social: 6, mood: 10, fame: 3 } },
        { effects: { study: 2 } },
      ] },
    { id: 'professor', phase: 'engineer', once: true, cond: (s) => s.eng.stage === 'uni' && s.stats.study >= 60, weight: 8,
      choices: [
        { effects: { tech: 6, study: 4, mood: -4 } },
        { effects: { mood: 3 } },
      ] },

    // ======================= 工程師職涯：上班 =======================
    { id: 'layoff', phase: 'engineer', cond: (s) => s.eng.stage === 'job', weight: 4,
      choices: [
        { effects: { mood: -6, health: -4 }, year: { perf: 2 } },
        { effects: { social: 3, mood: -3 } },
      ] },
    { id: 'prod_down', phase: 'engineer', cond: (s) => s.eng.stage === 'job', weight: 7,
      choices: [
        { effects: { tech: 3, health: -6 }, year: { perf: 2 } },
        { effects: { mood: 2 }, year: { perf: -2 } },
      ] },
    { id: 'headhunter', phase: 'engineer', cond: (s) => s.eng.stage === 'job' && s.eng.rank >= 1 && s.stats.tech >= 50,
      weight: (s) => (s.flags.openSource ? 12 : 6),
      variant: (s) => (s.eng.company < 2 ? 'up' : 'rival'),
      choices: [
        { run: (s) => AW.Engineer.jobHop(s) },
        { effects: { mood: 4 }, run: (s) => { s.eng.promo += 1; } },
      ] },
    { id: 'tech_debt', phase: 'engineer', cond: (s) => s.eng.stage === 'job', weight: 5,
      choices: [
        { effects: { tech: 5, health: -4 }, year: { perf: 1 } },
        { effects: { mood: -4 }, year: { perf: -1 } },
      ] },
    { id: 'ai_wave', phase: 'engineer', once: true, cond: (s) => s.eng.stage !== 'uni', weight: 8,
      choices: [
        { effects: { tech: 6, study: 3 } },
        { effects: { tech: -3, mood: 2 } },
      ] },
    { id: 'praise', phase: 'engineer', cond: (s) => s.eng.stage === 'job', weight: 4,
      effects: { mood: 10, social: 3 }, year: { perf: 2 } },
    { id: 'credit_steal', phase: 'engineer', cond: (s) => s.eng.stage === 'job', weight: 5,
      choices: [
        { effects: { leader: 4, social: -3 }, year: { perf: 1 } },
        { effects: { mood: -8, social: 2 } },
      ] },
    { id: 'conference', phase: 'engineer', cond: (s) => s.eng.stage !== 'uni' && s.stats.tech >= 65, weight: 5,
      effects: { social: 5, leader: 3, fame: 3, mood: 5 } },
    { id: 'old_friends', phase: 'engineer', cond: (s) => s.eng.stage !== 'uni', weight: 5,
      choices: [
        { effects: { mood: 14, health: -6, best: 2 } },
        { effects: { health: 4 } },
      ] },
    { id: 'stock_bonus', phase: 'engineer', cond: (s) => s.eng.stage === 'job' && s.eng.company >= 1 && s.eng.rank >= 2, weight: 5,
      effects: (s) => ({ money: Math.round(AW.Engineer.salary(s) * 0.4), mood: 8 }) },
    { id: 'health_check', phase: 'engineer', cond: (s) => s.age >= 32, weight: 5,
      choices: [
        { effects: { health: 12, money: -30000, mood: -2 } },
        { effects: { health: -5, mood: 2 } },
      ] },
    { id: 'idea', phase: 'engineer', once: true, cond: (s) => s.eng.stage === 'job' && s.stats.tech >= 55, weight: 4,
      effects: { mood: 6 }, flags: { startupIdea: 1 } },

    // ======================= 創業 =======================
    { id: 'angel', phase: 'engineer', cond: (s) => s.eng.stage === 'startup', weight: 7,
      effects: { mood: 8 }, year: { sp: 3 } },
    { id: 'cofounder_quit', phase: 'engineer', cond: (s) => s.eng.stage === 'startup', weight: 5,
      effects: { mood: -14, leader: 3 }, year: { sp: -3 } },
    { id: 'viral_app', phase: 'engineer', cond: (s) => s.eng.stage === 'startup', weight: 5,
      effects: { mood: 12, fame: 5 }, year: { sp: 4 } },
    { id: 'gamer_users', phase: 'engineer', cond: (s) => s.eng.stage === 'startup' && bestOf(s) >= 60, weight: 5,
      effects: { social: 4 }, year: { sp: 2 } },

    // ======================= 通用 =======================
    { id: 'receipt', phase: 'any', cond: (s) => s.age >= 6, weight: 3,
      effects: (s) => ({ money: s.age >= 18 ? 40000 : 2000, mood: 6 }) },
    { id: 'awei_myth', phase: 'any', cond: (s) => s.age >= 10, weight: 2,
      effects: { best: 3, reflex: 2, mood: 5 } },

    // ======================= 學生時期（續） =======================
    { id: 'bday_gift', phase: 'student', weight: 4, cond: (s) => s.age >= 6 && s.age <= 15,
      choices: [
        { cond: (s) => !(s.items && s.items.mouse), hideLocked: true, effects: { mood: 5 }, run: (s) => { s.items.mouse = 1; } },
        { effects: { study: 4, mood: 1 } },
        { effects: { money: 5000, mood: 3 } },
      ] },
    { id: 'school_cup', phase: 'student', once: true, weight: 10, cond: (s) => s.age >= 15 && bestOf(s) >= 45,
      choices: [
        { roll: { chance: (s) => AW.clamp((bestOf(s) - 30) / 50, 0.1, 0.9),
          success: { effects: { fame: 8, money: 30000, mood: 10 }, flags: { scouted: 1 } },
          fail: { effects: { mood: -5, best: 2 } } } },
        { effects: { study: 2 } },
      ] },
    { id: 'streamer_meet', phase: 'student', weight: 4, cond: (s) => s.age >= 10 && bestOf(s) >= 40,
      effects: { fame: 3, mood: 8, best: 1 } },
    { id: 'good_teacher', phase: 'student', weight: 4, cond: (s) => s.age >= 7,
      effects: { study: 5, mood: 6, social: 1 } },
    { id: 'broken_arm', phase: 'student', weight: 3, cond: (s) => s.age >= 8,
      effects: { health: -12, mood: -6 }, year: { noGame: 1 } },
    { id: 'phone_taken', phase: 'student', weight: 5, cond: (s) => s.age >= 10,
      choices: [
        { effects: { mood: -4, study: 1 } },
        { roll: { chance: 0.4,
          success: { effects: { mood: 3, social: 2 } },
          fail: { effects: { study: -2, mood: -8 } } } },
      ] },
    { id: 'family_money', phase: 'student', once: true, weight: 4, cond: (s) => s.age >= 8,
      choices: [
        { effects: { mood: -6, study: 2 }, year: { halfAllowance: 1 } },
        { cond: (s) => s.age >= 15, hideLocked: true, effects: { health: -6, social: 4, money: 8000 }, year: { halfAllowance: 1 } },
      ] },
    { id: 'excluded', phase: 'student', weight: 4, cond: (s) => s.age >= 9,
      choices: [
        { roll: { chance: (s) => AW.clamp(0.2 + s.stats.social / 80, 0.2, 0.9),
          success: { effects: { social: 5, mood: 3 } },
          fail: { effects: { mood: -8 } } } },
        { effects: { best: 2, mood: -5 } },
      ] },
    { id: 'lend_money', phase: 'student', weight: 4, cond: (s) => s.age >= 10 && s.stats.money >= 5000,
      choices: [
        { roll: { chance: 0.6,
          success: { effects: { social: 4, mood: 2 } },
          fail: { effects: { money: -5000, social: -1, mood: -4 } } } },
        { effects: { social: -2 } },
      ] },

    // ======================= 電競職涯（續） =======================
    { id: 'invitational', phase: 'esports', weight: 5, cond: (s) => s.esports.tier >= 2,
      effects: { fame: 6, money: 300000, mood: 6 } },
    { id: 'merch', phase: 'esports', weight: 4, cond: (s) => s.stats.fame >= 30,
      effects: (s) => ({ money: 50000 + s.stats.fame * 5000, fame: 2 }) },
    { id: 'comeback', phase: 'esports', weight: 5,
      effects: { teamwork: 6, mood: 6 } },
    { id: 'interview_gaffe', phase: 'esports', weight: 5, cond: (s) => s.stats.fame >= 15,
      choices: [
        { effects: { fame: -3, mood: -3 } },
        { roll: { chance: 0.4,
          success: { effects: { fame: 8, mood: 4 } },
          fail: { effects: { fame: -10, mood: -8 } } } },
      ] },
    { id: 'disconnect', phase: 'esports', weight: 4,
      effects: { mood: -8 }, year: { lag: 1 } },
    { id: 'doping_test', phase: 'esports', once: true, weight: 3, cond: (s) => s.stats.fame >= 20,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.health / 100, 0.3, 0.95),
          success: { effects: { fame: 5, mood: 5 } },
          fail: { effects: { money: -200000, fame: -8, mood: -10 } } } },
      ] },
    { id: 'team_broke', phase: 'esports', weight: 3, cond: (s) => s.esports.tier >= 1,
      choices: [
        { effects: (s) => ({ money: -Math.round(AW.Esports.TIERS[s.esports.tier].salary * 0.5), teamwork: 8, mood: -4 }) },
        { effects: { mood: -2 }, run: (s) => {
          const e = s.esports;
          e.team = AW.Esports.teamName(e.tier, e.team);
          s.stats.teamwork = Math.round(s.stats.teamwork * 0.7);
        } },
      ] },
    { id: 'match_fixing', phase: 'esports', once: true, weight: 3, cond: (s) => s.esports.tier >= 1,
      choices: [
        { effects: { fame: 5, mood: 5 } },
        { roll: { chance: 0.6,
          success: { effects: { money: 1000000, mood: -8 } },
          fail: { effects: { money: -300000, fame: -30, mood: -20 }, flags: { matchFix: 1 }, run: (s) => {
            const e = s.esports;
            e.tier = Math.max(0, e.tier - 2);
            e.team = AW.Esports.teamName(e.tier, e.team);
            s.stats.teamwork = Math.round(s.stats.teamwork * 0.5);
          } } } },
      ] },

    // ======================= 工程師職涯（續） =======================
    { id: 'open_source', phase: 'engineer', once: true, weight: 4, cond: (s) => s.eng.stage !== 'startup' && s.stats.tech >= 40,
      effects: { tech: 5, fame: 5, mood: 6 }, flags: { openSource: 1 } },
    { id: 'employee_award', phase: 'engineer', weight: 4, cond: (s) => s.eng.stage === 'job',
      effects: (s) => ({ mood: 10, money: Math.round(AW.Engineer.salary(s) * 0.1) }), year: { perf: 2 } },
    { id: 'good_boss', phase: 'engineer', weight: 4, cond: (s) => s.eng.stage === 'job',
      effects: { mood: 8, leader: 3 }, year: { perf: 1 } },
    { id: 'security_breach', phase: 'engineer', weight: 4, cond: (s) => s.eng.stage === 'job',
      choices: [
        { effects: { leader: 4, mood: -6 }, year: { perf: -1 } },
        { roll: { chance: (s) => AW.clamp(s.stats.social / 100, 0.2, 0.8),
          success: { effects: { mood: 2 } },
          fail: { effects: { social: -5, mood: -6 }, year: { perf: -3 } } } },
      ] },
    { id: 'eng_burnout', phase: 'engineer', weight: 4, cond: (s) => s.eng.stage !== 'uni' && s.age >= 27,
      choices: [
        { cond: (s) => s.stats.money >= 100000, effects: { money: -100000, health: 10, mood: 15 }, year: { perf: -1, sp: -1 } },
        { effects: { mood: -10, health: -4 } },
      ] },
    { id: 'acquisition', phase: 'engineer', once: true, weight: 3, cond: (s) => s.eng.stage === 'job' && s.eng.rank >= 1,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.tech / 90, 0.2, 0.9),
          success: { effects: { mood: 4 }, year: { perf: 3 } },
          fail: { effects: { mood: -8 }, run: (s) => { s.eng.promo = 0; } } } },
        { run: (s) => AW.Engineer.jobHop(s) },
      ] },
    { id: 'coach_offer', phase: 'engineer', once: true, weight: 3, cond: (s) => s.eng.stage === 'job' && bestOf(s) >= 50,
      choices: [
        { effects: { mood: 12, best: 3, money: 50000 }, year: { perf: -1 } },
        { effects: { mood: -2 } },
      ] },

    // ======================= 通用（續） =======================
    { id: 'scratch_card', phase: 'any', weight: 3, cond: (s) => s.age >= 18,
      effects: () => ({ money: AW.randInt(1, 10) * 10000, mood: 6 }) },
    { id: 'stray_dog', phase: 'any', once: true, weight: 4, cond: (s) => s.age >= 6,
      choices: [
        { effects: { mood: 10, health: 2 }, flags: { dog: 1 } },
        { effects: { mood: -2, social: 1 } },
      ] },
    { id: 'thank_letter', phase: 'any', weight: 3, cond: (s) => s.stats.fame >= 25 || (s.eng && s.eng.rank >= 3),
      effects: { mood: 12, social: 1 } },
    { id: 'accident', phase: 'any', weight: 3, cond: (s) => s.age >= 16,
      choices: [
        { effects: (s) => ({ health: -15, mood: -5, money: s.age >= 18 ? -50000 : 0 }) },
        { cond: dating, hideLocked: true, effects: (s) => ({ health: -10, love: 10, mood: 2, money: s.age >= 18 ? -50000 : 0 }) },
      ] },
    { id: 'scam', phase: 'any', weight: 4, cond: (s) => s.age >= 18 && s.stats.money >= 100000,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.study / 80, 0.2, 0.95),
          success: { effects: { mood: 3 } },
          fail: { effects: (s) => ({ money: -Math.round(s.stats.money * 0.1), mood: -12 }) } } },
        { effects: {} },
      ] },
    { id: 'family_ill', phase: 'any', weight: 2, cond: (s) => s.age >= 12,
      choices: [
        { effects: { mood: -4, social: 3 }, year: { busy: 1 } },
        { cond: (s) => s.age >= 18 && s.stats.money >= 200000, effects: { money: -200000, mood: -2 } },
        { cond: dating, hideLocked: true, effects: { love: 8, mood: -1 }, year: { busy: 1 } },
      ] },

    // ======================= 健康與心情 =======================
    { id: 'depression', phase: 'any', weight: 60, cond: (s) => s.age >= 10 && s.stats.mood < AW.TIER.bad,
      choices: [
        { cond: (s) => s.age < 18 || s.stats.money >= 30000, effects: (s) => ({ mood: 25, money: s.age < 18 ? 0 : -30000 }) },
        { cond: dating, hideLocked: true, effects: { mood: 20, love: 5 } },
        { effects: { mood: 5 }, year: { blue: 1 } },
      ] },

    // ======================= 感情 =======================
    { id: 'new_love', phase: 'any', weight: (s) => (s.love ? 4 : 6),
      cond: (s) => s.age >= 16 && single(s) && (!s.love || s.age - s.love.endAge >= 1),
      vars: (s) => ({ 地點: s.phase === 'esports' ? '粉絲見面會' : s.phase === 'student' ? '補習班'
        : s.eng.stage === 'uni' ? '通識課' : '朋友的婚禮' }),
      choices: [
        { roll: { chance: (s) => AW.clamp(0.2 + s.stats.social / 100, 0.15, 0.9),
          success: { effects: { mood: 12 }, run: startLove },
          fail: { effects: { mood: -8 } } } },
        { effects: { social: 2 } },
      ] },
    { id: 'love_first_date', phase: 'any', once: true, weight: 40,
      cond: (s) => dating(s) && s.love.status === 'dating',
      choices: [
        { effects: (s) => ({ love: 10, mood: 6, money: s.age < 18 ? -300 : -1000 }) },
        { roll: { chance: (s) => AW.clamp(bestOf(s) / 90, 0.2, 0.9),
          success: { effects: { love: 14, best: 1, mood: 8 } },
          fail: { effects: { love: -6, mood: -4 } } } },
        { effects: { love: 8, mood: 8, health: -1 } },
      ] },
    { id: 'love_birthday', phase: 'any', weight: 6, cond: dating,
      choices: [
        { cond: (s) => s.stats.money >= (s.age < 18 ? 2000 : 30000),
          effects: (s) => ({ love: 15, mood: 4, money: s.age < 18 ? -2000 : -30000 }) },
        { effects: { love: 8 } },
        { effects: { love: -10 } },
      ] },
    { id: 'love_jealous', phase: 'any', weight: 6, cond: (s) => dating(s) && bestOf(s) >= 35,
      choices: [
        { effects: { love: 10, mood: -2 } },
        { effects: { love: -12, best: 2 } },
        { roll: { chance: (s) => AW.clamp(0.3 + s.stats.social / 150, 0.2, 0.85),
          success: { effects: { love: 12, social: 2, mood: 6 } },
          fail: { effects: { love: -5 } } } },
      ] },
    { id: 'love_fight', phase: 'any', weight: 4, cond: dating,
      choices: [
        { effects: { love: 5, mood: -3 } },
        { effects: { love: -12, mood: -6 } },
      ] },
    { id: 'love_study', phase: 'student', weight: 5, cond: dating,
      choices: [
        { effects: { study: 4, love: 4 } },
        { effects: { love: 8, mood: 5 } },
      ] },
    { id: 'love_cheer', phase: 'esports', weight: 6, cond: dating,
      effects: { love: 6, mood: 10, teamwork: 1 } },
    { id: 'love_supper', phase: 'engineer', weight: 5, cond: (s) => dating(s) && s.eng.stage !== 'uni',
      effects: { love: 4, mood: 8, health: 3 } },
    { id: 'love_parents', phase: 'any', once: true, weight: 10,
      cond: (s) => dating(s) && s.age >= 20 && s.stats.love >= 50,
      choices: [
        { cond: (s) => s.stats.money >= 10000, effects: { love: 10, social: 3, money: -10000 } },
        { roll: { chance: (s) => AW.clamp(0.3 + s.stats.fame / 100, 0.2, 0.9),
          success: { effects: { love: 8, fame: 1, mood: 5 } },
          fail: { effects: { love: -8, mood: -5 } } } },
      ] },
    { id: 'love_propose', phase: 'any', weight: 25,
      cond: (s) => dating(s) && s.love.status === 'dating' && s.age >= 23 && s.stats.love >= 60,
      vars: (s) => ({ 交往年數: Math.max(1, s.age - s.love.since) }),
      choices: [
        { cond: (s) => s.stats.money >= 100000,
          roll: { chance: (s) => AW.clamp(s.stats.love / 100 + 0.1, 0.3, 0.97),
            success: { effects: { money: -100000, mood: 15, love: 10 }, run: (s) => AW.Love.engage(s) },
            fail: { effects: { mood: -12, love: -10 } } } },
        { effects: { love: -3 } },
      ] },
    { id: 'love_wedding', phase: 'any', weight: 1000, cond: (s) => dating(s) && s.love.status === 'engaged',
      choices: [
        { effects: { mood: 8 }, run: (s) => AW.Love.marry(s) },
        { cond: (s) => s.stats.money >= 300000, effects: { money: -300000, mood: 15, love: 10, social: 3 },
          run: (s) => AW.Love.marry(s) },
        { cond: (s) => s.stats.money >= 2000000, effects: { money: -2000000, mood: 20, love: 15, social: 5, fame: 5 },
          run: (s) => AW.Love.marry(s) },
      ] },
    { id: 'love_anniv', phase: 'any', weight: 5, cond: (s) => dating(s) && s.love.status === 'married',
      choices: [
        { cond: (s) => s.stats.money >= 200000, effects: { money: -200000, love: 15, mood: 12, health: 4 } },
        { effects: { love: 8, mood: 6 } },
        { effects: { love: -12, mood: -4 } },
      ] },
    { id: 'love_crisis', phase: 'any', weight: 80, cond: (s) => dating(s) && s.stats.love <= 25,
      choices: [
        { roll: { chance: (s) => AW.clamp(0.25 + s.stats.social / 120, 0.2, 0.85),
          success: { effects: { love: 25, mood: 4 } },
          fail: { effects: { mood: -15 }, run: (s) => AW.Love.breakup(s) } } },
        { effects: { mood: -10 }, run: (s) => AW.Love.breakup(s) },
      ] },

    // ======================= 賭博 =======================
    { id: 'gamble_paparazzi', phase: 'any', once: true, weight: 12,
      cond: (s) => (s.counters.gamblePlays || 0) >= 8 && s.stats.fame >= 15,
      choices: [
        { effects: { fame: -4, mood: -5, social: 2 } },
        { roll: { chance: 0.5,
          success: { effects: { mood: 2 } },
          fail: { effects: { fame: -12, mood: -10 } } } },
      ] },
    { id: 'gamble_addict', phase: 'any', once: true, weight: 20,
      cond: (s) => (s.counters.gamblePlays || 0) >= 20,
      choices: [
        { effects: { mood: 8, health: 5 }, flags: { noGamble: 1 } },
        { effects: { mood: -8, health: -4 } },
      ] },
  ];

  AW.EVENT_MAP = {};
  for (const e of AW.EVENTS) AW.EVENT_MAP[e.id] = e;
})(typeof window !== 'undefined' ? window : globalThis);
