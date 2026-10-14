/* 隨機事件（標題、內文、選項文字在 js/data/texts.js 的 [event.代號]）
 * phase: student / esports / engineer / any
 * cond(s) 觸發條件；weight 權重（可為函式）；once 一生只發生一次
 * vars(s) 文本專用變數，例 { 紅包: '3 千' } → 文本寫 {紅包}
 * variant(s) 回傳文本版本，例 'high' → 使用 text_high
 * 「結果」(outcome) 格式：{ effects, income, bond, year, next, flags, run }
 *   income: 職涯收入（計入所得稅）；bond: 朋友好友度變化，例 { haji: 5 }
 *   year: 本年度暫時旗標（例 noGame）；next: 下一年旗標；flags: 永久旗標
 * phase: student / esports / engineer / second（第二幕與晚年）/ any，也可以是陣列，例 ['student', 'esports']
 * threat: true → 雇用保全後不會發生；bond 也可以是 (s) => ({ 代號: 變化 })
 * force: true → 條件成立時一定發生（連續事件的後續，例：併購案隔年的整合）
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
  const met = (id) => (s) => AW.NPC.met(s, id);
  const bond = (s, id) => AW.NPC.bond(s, id);
  const adult = (s) => s.age >= 18;
  const hasDebt = (s) => s.stats.money < 0;
  // 第二幕：正在做某個工作（還沒到退休年齡）
  const job = (id) => (s) => s.second.job === id && AW.Second.working(s);
  // 併購案金額、業配與平台簽約金、可以接班的孩子
  const dealCost = (s) => 20000000 * (s.second.stage + 1);
  const brandFee = (s) => AW.clamp(Math.round(s.second.subs * 2 / 10000) * 10000, 300000, 8000000);
  const platformFee = (s) => AW.clamp(Math.round(s.second.subs * 5 / 10000) * 10000, 2000000, 20000000);
  const heirKid = (s) => s.kids.find((k) => AW.Family.age(s, k) >= 22);
  // 朋友的婚禮：今年結婚的朋友（每位朋友一次）
  const weddingFriend = (s) => {
    if (s.yearFlags.wedFriend !== undefined) return s.yearFlags.wedFriend;
    const pool = AW.NPC_ORDER.filter((id) => AW.NPC.met(s, id) && !s.npcs[id].wed);
    return (s.yearFlags.wedFriend = pool.length ? AW.pick(pool) : null);
  };
  // 胡投顧的股災：趁低點加碼的金額（現金的兩成，最多 500 萬）
  const dipAmount = (s) => s.yearFlags.dipAmount
    || (s.yearFlags.dipAmount = Math.min(5000000, Math.round(Math.max(0, s.stats.money) * 0.2 / 10000) * 10000));
  // 王選手帶你去賭場：賭金是現金的一成（1 萬～300 萬）
  // （第一次算出來就記在今年，避免結果出來後內文的金額跟著變）
  const wangBet = (s) => s.yearFlags.wangBet
    || (s.yearFlags.wangBet = AW.clamp(Math.round(Math.max(0, s.stats.money) * 0.1 / 10000) * 10000, 10000, 3000000));
  // 胡投顧的明牌：投入現金的兩成（最多 1000 萬）
  // 目前的年級，例：國小四年級、國中二年級
  const gradeName = (s) => s.age <= 11 ? `國小${'一二三四五六'[AW.clamp(s.age - 6, 0, 5)]}年級`
    : s.age <= 14 ? `國中${'一二三'[s.age - 12]}年級` : s.age <= 17 ? `高中${'一二三'[s.age - 15]}年級` : '重考班';
  // 開黑之夜：依年紀描述每位朋友在做什麼（只列出已經認識的朋友）
  const squadLines = (s) => {
    const tier = s.age < 18 ? 'teen' : s.age >= 65 ? 'old' : 'adult';
    const list = AW.NPC.gamers(s).map((id) => AW.tx('npc.' + id, 'squad_' + tier, s)).join('、');
    return AW.NPC.met(s, 'hu') ? list + '——' + AW.tx('npc.hu', 'squad_' + tier, s) : list + '。';
  };
  // 狗狗陪伴的年數
  const DOG_YEARS = 14;
  const tipAmount = (s) => Math.min(10000000, Math.round(Math.max(0, s.stats.money) * 0.2 / 10000) * 10000);

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
      cond: (s) => s.age >= 8 && s.age <= 14 && !s.flags.scouted, weight: 15,
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
      cond: (s) => s.age >= 10 && s.age <= 17 && bestOf(s) >= 45, weight: 10, vars: (s) => ({ 年級: gradeName(s) }),
      effects: { social: 5, fame: 5, mood: 6 } },
    { id: 'wallet', phase: 'student', cond: (s) => s.age >= 6, weight: 3,
      choices: [
        { effects: { social: 3, mood: 5 } },
        { effects: { money: 3000, mood: -4 } },
      ] },
    { id: 'flu', phase: 'any', weight: 3,
      effects: { health: -12, mood: -4 } },
    { id: 'cat', phase: 'student', once: true, cond: (s) => s.age >= 4 && s.age <= 13, weight: 8,
      variant: (s) => (s.seen.first_pc ? 'pc' : 'nopc'),
      effects: { mood: 10, health: 2 } },
    { id: 'mock_exam', phase: 'student', cond: (s) => s.age >= 16 && s.age <= 17, weight: 12,
      variant: (s) => (s.stats.study >= 55 ? 'high' : 'low'),
      choices: [
        { effects: { study: 4, mood: -4 } },
        { effects: { mood: 3 } },
      ] },
    { id: 'scout', phase: 'student', once: true,
      cond: (s) => s.age >= 15 && s.age <= 17 && bestOf(s) >= 55, weight: 12,
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

    // ======================= 學生時期（v2.1 追加） =======================
    // 抓周：1 歲一定會發生
    { id: 'zhuazhou', phase: 'student', once: true, force: true, cond: (s) => s.age === 1,
      choices: [
        { effects: { fps: 3, dota: 3, reflex: 2, mood: 3 } },
        { effects: { study: 5, mood: 2 } },
        { effects: { social: 4, fame: 1, mood: 2 } },
        { effects: { money: 3000, mood: 3 } },
        { effects: { health: 5, reflex: 2 } },
        { effects: { reflex: 3, mood: 5, health: -1 } },
      ] },
    // 嬰幼兒
    { id: 'first_steps', phase: 'student', once: true, weight: 20, cond: (s) => s.age >= 1 && s.age <= 2,
      choices: [
        { effects: { health: 3, mood: 3 } },
        { effects: { reflex: 2, fps: 1, dota: 1, mood: 2 } },
      ] },
    { id: 'vaccine', phase: 'student', weight: 5, cond: (s) => s.age >= 1 && s.age <= 5,
      choices: [
        { effects: { social: 2, mood: -1 } },
        { effects: { mood: -3 } },
      ] },
    { id: 'dad_save', phase: 'student', once: true, weight: 8, cond: (s) => s.age >= 2 && s.age <= 5,
      effects: { reflex: 2, mood: 5 } },
    { id: 'kindergarten', phase: 'student', once: true, weight: 20, cond: (s) => s.age >= 3 && s.age <= 4,
      choices: [
        { effects: { mood: -3, social: 1 } },
        { effects: { social: 5, mood: 3 } },
        { effects: { study: 4 } },
      ] },
    { id: 'hide_seek', phase: 'student', weight: 5, cond: (s) => s.age >= 3 && s.age <= 6,
      effects: { mood: 6, health: 2 } },
    { id: 'claw_machine', phase: 'student', weight: 5, cond: (s) => s.age >= 3 && s.age <= 7,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.reflex / 40, 0.15, 0.8),
          success: { effects: { reflex: 2, mood: 8 } },
          fail: { effects: { mood: -3 } } } },
        { effects: { mood: 4, health: 1 } },
      ] },
    { id: 'talent_show', phase: 'student', once: true, weight: 8, cond: (s) => s.age >= 4 && s.age <= 6,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.social / 40, 0.2, 0.85),
          success: { effects: { social: 4, fame: 1, mood: 6 } },
          fail: { effects: { mood: -4 } } } },
        { effects: { reflex: 3, mood: 3 } },
        { effects: { study: 1, mood: -1 } },
      ] },
    // 國小
    { id: 'first_day', phase: 'student', once: true, weight: 30, cond: (s) => s.age === 6,
      choices: [
        { effects: { study: 4 } },
        { effects: { social: 4, mood: 3 } },
      ] },
    { id: 'piano', phase: 'student', once: true, weight: 6, cond: (s) => s.age >= 6 && s.age <= 10,
      choices: [
        { effects: { reflex: 3, study: 1, mood: -4 } },
        { roll: { chance: 0.5,
          success: { effects: { mood: 5 } },
          fail: { effects: { mood: -6, study: 1 } } } },
      ] },
    { id: 'school_trip', phase: 'student', weight: 5, cond: (s) => s.age >= 7 && s.age <= 11,
      choices: [
        { effects: { social: 4, mood: 6 } },
        { effects: { best: 2, mood: 3, social: -1 } },
      ] },
    { id: 'summer_homework', phase: 'student', weight: 5, cond: (s) => s.age >= 7 && s.age <= 14,
      choices: [
        { effects: { study: 2, mood: -4, health: -2 } },
        { effects: { study: 4, mood: -1 } },
        { roll: { chance: 0.5,
          success: { effects: { mood: 3 } },
          fail: { effects: { mood: -6, social: -1 } } } },
      ] },
    { id: 'class_leader', phase: 'student', once: true, weight: 6, cond: (s) => s.age >= 8 && s.age <= 11,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.social / 60, 0.15, 0.85),
          success: { effects: { social: 5, study: 1, mood: 6 } },
          fail: { effects: { mood: -4 } } } },
        { effects: { social: 2 } },
      ] },
    { id: 'bully_help', phase: 'student', weight: 4, cond: (s) => s.age >= 8 && s.age <= 13,
      choices: [
        { roll: { chance: (s) => AW.clamp(0.3 + s.stats.social / 150, 0.3, 0.85),
          success: { effects: { social: 6, mood: 5 } },
          fail: { effects: { health: -5, mood: -3, social: 2 } } } },
        { effects: { social: 2 } },
      ] },
    { id: 'science_fair', phase: 'student', once: true, weight: 6, cond: (s) => s.age >= 9 && s.age <= 11,
      choices: [
        { effects: { study: 3, reflex: 3, mood: 3 } },
        { effects: { study: 3, mood: 2 } },
      ] },
    // 國中
    { id: 'school_club', phase: 'student', once: true, weight: 15, cond: (s) => s.age >= 12 && s.age <= 13,
      choices: [
        { effects: { best: 3, social: 3 } },
        { effects: { study: 3 }, flags: { coder: 1 } },
        { effects: { social: 4, health: 3 } },
      ] },
    { id: 'voice_crack', phase: 'student', once: true, weight: 6, cond: (s) => s.age >= 12 && s.age <= 14,
      choices: [
        { effects: { social: 3, mood: 2 } },
        { effects: { mood: -5 } },
      ] },
    { id: 'cram_school', phase: 'student', weight: 6, cond: (s) => s.age >= 12 && s.age <= 17,
      choices: [
        { effects: { study: 5, mood: -4 } },
        { effects: { best: 3, mood: 3, study: -1 } },
      ] },
    { id: 'school_festival', phase: 'student', weight: 5, cond: (s) => s.age >= 12 && s.age <= 17,
      choices: [
        { effects: { fame: 2, social: 3, best: 1 } },
        { effects: { money: 2000, study: 1 } },
      ] },
    { id: 'online_friend', phase: 'student', once: true, weight: 5, cond: (s) => s.age >= 13 && s.age <= 17,
      choices: [
        { roll: { chance: 0.6,
          success: { effects: { social: 4, mood: 6 } },
          fail: { effects: { mood: -6 } } } },
        { effects: { study: 1 } },
      ] },
    // 高中
    { id: 'part_time', phase: 'student', once: true, weight: 8, cond: (s) => s.age >= 16 && s.age <= 17,
      choices: [
        { effects: { money: 20000, health: -3, social: 3 } },
        { effects: { money: 15000, best: 2 } },
        { effects: { study: 3 } },
      ] },
    { id: 'grad_trip', phase: 'student', once: true, weight: 20, cond: (s) => s.age === 17,
      choices: [
        { effects: { mood: 10, social: 3 } },
        { effects: { best: 3, mood: 2 } },
      ] },

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
      income: (s) => 100000 + s.stats.fame * 8000, effects: { fame: 3 } },
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
      income: (s) => AW.Engineer.salary(s) * 0.4, effects: { mood: 8 } },
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
    { id: 'school_cup', phase: 'student', once: true, weight: 10, cond: (s) => s.age >= 15 && s.age <= 17 && bestOf(s) >= 45 && !s.seen.npc_wang_school,
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
      income: 300000, effects: { fame: 6, mood: 6 } },
    { id: 'merch', phase: 'esports', weight: 4, cond: (s) => s.stats.fame >= 30,
      income: (s) => 50000 + s.stats.fame * 5000, effects: { fame: 2 } },
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
      income: (s) => AW.Engineer.salary(s) * 0.1, effects: { mood: 10 }, year: { perf: 2 } },
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
        { effects: { mood: 10, health: 2 }, flags: { dog: 1 }, run: (s) => { s.flags.dogAge = s.age; } },
        { effects: { mood: -2, social: 1 } },
      ] },
    { id: 'dog_farewell', phase: 'any', once: true, force: true,
      cond: (s) => s.flags.dog && s.flags.dogAge != null && s.age - s.flags.dogAge >= DOG_YEARS,
      effects: { mood: -12 }, run: (s) => { s.flags.dog = 0; } },
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
    { id: 'family_ill', phase: 'any', weight: 2, cond: (s) => s.age >= 12 && s.age < 60,
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
        : s.eng && s.eng.stage === 'uni' ? '通識課' : '朋友的婚禮' }),
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
    { id: 'love_jealous', phase: 'any', weight: (s) => 6 * (AW.Love.type(s).jealousEvents || 1), cond: (s) => dating(s) && bestOf(s) >= 35,
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

    // ======================= 朋友 NPC（v1.2） =======================
    { id: 'npc_intro', phase: 'student', weight: (s) => s.stats.social / 20,
      cond: (s) => s.age >= 9 && s.stats.social >= 25 && AW.NPC.unmet(s, true).length > 0,
      run: (s) => ({ text: AW.NPC.meet(s, AW.pick(AW.NPC.unmet(s, true))) }) },
    { id: 'npc_squad_night', phase: 'any', weight: 8,
      cond: (s) => s.age >= 14 && AW.NPC.gamers(s).filter((id) => bond(s, id) >= 50).length >= 4,
      vars: (s) => ({ 開黑名單: squadLines(s) }),
      effects: { mood: 15, best: 2, health: -3 },
      run: (s) => {
        if (AW.NPC.gamers(s).length >= 5) s.flags.squad6 = 1;
        return { bonds: AW.NPC.squadMembers(s).map((id) => ({ id, v: AW.NPC.addBond(s, id, 5 * AW.NPC.squadMult(id)) })).filter((x) => x.v) };
      } },

    // 胡投顧
    { id: 'npc_hu_save', phase: 'student', once: true, weight: 10, cond: (s) => s.age >= 15 && met('hu')(s),
      choices: [
        { effects: { study: 2, money: 2000 }, bond: { hu: 6 }, flags: { huSaver: 1 } },
        { effects: { mood: 2 }, bond: { hu: -2 } },
      ] },
    { id: 'npc_hu_tip', phase: 'any', weight: 6,
      cond: (s) => adult(s) && met('hu')(s) && bond(s, 'hu') >= 20 && s.stats.money >= 200000,
      vars: (s) => ({ 金額: AW.fmtMoney(tipAmount(s)) }),
      choices: [
        { roll: { chance: (s) => AW.clamp(0.4 + bond(s, 'hu') / 200, 0.4, 0.85),
          success: { effects: (s) => ({ money: Math.round(tipAmount(s) * 0.8), mood: 8 }), bond: { hu: 5 }, flags: { huWin: 1 } },
          fail: { effects: (s) => ({ money: -Math.round(tipAmount(s) * 0.5), mood: -8 }), bond: { hu: 2 } } } },
        { bond: { hu: -2 } },
      ] },
    { id: 'npc_hu_dinner', phase: 'any', weight: 4, cond: (s) => s.age >= 22 && met('hu')(s),
      effects: { mood: 6, social: 2, health: -2 }, bond: { hu: 5 } },

    // 哈基咩
    { id: 'npc_haji_feed', phase: 'any', weight: 7, cond: (s) => s.age >= 10 && s.age < 45 && met('haji')(s),
      choices: [
        { effects: { mood: 6 }, bond: { haji: -1 } },
        { effects: { best: 2, mood: -2 }, bond: { haji: 6 } },
        { effects: { mood: 8, best: -1 }, bond: { haji: 4 } },
      ] },
    { id: 'npc_haji_mortgage', phase: 'any', once: true, weight: 6,
      cond: (s) => s.age >= 26 && s.age < 48 && !s.seen.haji_mortgage_done && met('haji')(s) && bond(s, 'haji') >= 40 && s.stats.money >= 300000,
      choices: [
        { effects: { money: -300000, mood: 2 }, bond: { haji: 15 }, run: (s) => { s.npcs.haji.owe = 300000; s.npcs.haji.oweAt = s.age; s.npcs.haji.lent = 1; } },
        { bond: { haji: -8 } },
      ] },
    { id: 'npc_haji_repay', phase: 'any', once: true, weight: 200,
      cond: (s) => met('haji')(s) && s.npcs.haji.owe && s.age - s.npcs.haji.oweAt >= 3,
      effects: { money: 300000, mood: 8 }, bond: { haji: 5 }, run: (s) => { s.npcs.haji.owe = 0; } },
    { id: 'npc_haji_city', phase: 'any', weight: 4, cond: (s) => s.age >= 22 && met('haji')(s),
      choices: [
        { effects: (s) => ({ mood: 6, social: 3, fame: s.phase === 'esports' ? 4 : 0 }), bond: { haji: 3 } },
        { effects: { best: 2 } },
      ] },

    // 王選手
    { id: 'npc_wang_rank', phase: 'student', weight: 7, cond: (s) => s.age >= 10 && met('wang')(s),
      choices: [
        { roll: { chance: (s) => AW.clamp(bestOf(s) / 80, 0.2, 0.85),
          success: { effects: { best: 4, mood: 6 }, bond: { wang: 3 } },
          fail: { effects: { health: -4, mood: -4, best: 1 }, bond: { wang: 2 } } } },
        { effects: { social: 2, money: -100 }, bond: { wang: 5 } },
      ] },
    { id: 'npc_wang_school', phase: 'student', once: true, weight: 9,
      cond: (s) => s.age >= 15 && s.age <= 17 && met('wang')(s) && bestOf(s) >= 40,
      choices: [
        { roll: { chance: (s) => AW.clamp((bestOf(s) - 20) / 60, 0.15, 0.85),
          success: { effects: { fame: 6, best: 3, mood: 8 }, bond: { wang: 4 }, flags: { scouted: 1 } },
          fail: { effects: { best: 2, mood: -5 }, bond: { wang: 4 } } } },
        { effects: { study: 2 }, bond: { wang: -2 } },
      ] },
    { id: 'npc_wang_gear', phase: 'engineer', once: true, weight: 5,
      cond: (s) => s.age >= 22 && met('wang')(s) && s.eng.stage !== 'uni',
      choices: [
        { cond: (s) => !s.items.monitor && s.stats.money >= 8000, effects: { money: -8000, mood: 4 }, bond: { wang: 3 },
          run: (s) => { s.items.monitor = 1; } },
        { cond: (s) => !s.items.keyboard && s.stats.money >= 3000, effects: { money: -3000, mood: 3 }, bond: { wang: 3 },
          run: (s) => { s.items.keyboard = 1; } },
        { effects: { mood: 1 }, bond: { wang: -1 } },
      ] },

    { id: 'wang_casino', phase: 'any', weight: 3,
      cond: (s) => adult(s) && met('wang')(s) && !s.flags.noGamble && !s.flags.wangQuit && s.stats.money >= 50000,
      vars: (s) => ({ 賭金: AW.fmtMoney(wangBet(s)) }),
      choices: [
        { roll: { chance: 0.4,
          success: { effects: { mood: 8 }, bond: { wang: 4 }, run: (s) => AW.Casino.record(s, wangBet(s)) },
          fail: { effects: { mood: -8 }, bond: { wang: 2 }, run: (s) => AW.Casino.record(s, -wangBet(s)) } } },
        { effects: { mood: 3 }, bond: { wang: 5 }, run: (s) => {
          if (!AW.chance(0.5)) return {};
          return { text: AW.tx('event.wang_casino', 'lend', s), deltas: AW.applyEffects(s, { money: -50000 }) };
        } },
        { bond: { wang: -3 } },
      ] },

    // 阿方
    { id: 'npc_fang_supper', phase: 'any', weight: 6, cond: (s) => s.age >= 16 && met('fang')(s),
      effects: { health: 5, mood: 6 }, bond: { fang: 4 } },
    { id: 'npc_fang_restaurant', phase: 'any', once: true, weight: 6,
      cond: (s) => s.age >= 28 && met('fang')(s) && bond(s, 'fang') >= 25 && s.stats.money >= 1000000,
      choices: [
        { roll: { chance: 0.6,
          success: { effects: { money: 1000000, mood: 8 }, bond: { fang: 10 }, flags: { fangInvest: 1 } },
          fail: { effects: { money: -1000000, mood: -6 }, bond: { fang: 5 } } } },
        { effects: { money: -5000, mood: 4 }, bond: { fang: 4 } },
      ] },

    // 長長貓
    { id: 'npc_cat_breakfast', phase: 'any', weight: 6, cond: (s) => s.age >= 10 && met('cat')(s),
      effects: { health: 3, mood: 4 }, bond: { cat: 4 } },
    { id: 'npc_cat_boost', phase: ['student', 'esports'], weight: 5, cond: (s) => s.age >= 12 && met('cat')(s),
      vars: (s) => ({ 代練費: AW.fmtMoney(s.phase === 'esports' ? 100000 : 3000) }),
      choices: [
        { cond: (s) => s.stats.money >= (s.phase === 'esports' ? 100000 : 3000),
          roll: { chance: 0.7,
            success: { effects: (s) => ({ fame: 6, mood: 4, money: s.phase === 'esports' ? -100000 : -3000 }), bond: { cat: 3 }, flags: { usedBoost: 1 } },
            fail: { effects: (s) => ({ fame: s.phase === 'esports' ? -15 : -8, mood: -10, money: s.phase === 'esports' ? -100000 : -3000 }),
              year: { noGame: 1 }, flags: { usedBoost: 1 } } } },
        { effects: { best: 1 } },
      ] },
    { id: 'npc_cat_help', phase: 'any', weight: 4, cond: (s) => adult(s) && met('cat')(s),
      choices: [
        { effects: { health: -3, social: 3, mood: 3 }, bond: { cat: 8 } },
        { bond: { cat: -3 } },
      ] },

    // Corey
    { id: 'npc_corey_netcafe', phase: 'student', weight: 5, cond: (s) => s.age >= 12 && met('corey')(s),
      choices: [
        { cond: (s) => bond(s, 'corey') >= 30, effects: { mood: 6, social: 2 }, bond: { corey: 4 } },
        { roll: { chance: (s) => AW.clamp(bestOf(s) / 80, 0.2, 0.85),
          success: { effects: { fame: 2, mood: 6 } },
          fail: { effects: { health: -6, mood: -6 } } } },
      ] },
    { id: 'npc_corey_stalker', phase: 'any', weight: 5, threat: true, cond: (s) => adult(s) && s.stats.fame >= 35,
      choices: [
        { cond: (s) => met('corey')(s) && bond(s, 'corey') >= 40, hideLocked: true, effects: { mood: 2 }, bond: { corey: 6 } },
        { effects: { mood: -8 } },
        { roll: { chance: 0.5,
          success: { effects: { mood: 2 } },
          fail: { effects: { health: -10, mood: -10 } } } },
      ] },
    { id: 'robbery', phase: 'any', weight: 4, threat: true,
      cond: (s) => s.age >= 25 && (s.stats.money >= 5000000 || (s.items && s.items.mansion)),
      effects: (s) => ({ money: -Math.min(5000000, Math.round(Math.max(0, s.stats.money) * 0.03)), mood: -10 }) },

    // 感情：狗仔拍到約會（v2.0）
    { id: 'love_paparazzi', phase: 'esports', weight: 5, cond: (s) => dating(s) && s.stats.fame >= 30,
      choices: [
        { effects: { fame: 4, love: 8, mood: 3 } },
        { roll: { chance: 0.5,
          success: { effects: { mood: 2 } },
          fail: { effects: { love: -12, fame: -3 } } } },
      ] },

    // ======================= 朋友事件（v2.0 追加） =======================
    // 1. 王選手又輸光了：借錢 → 3 年後還錢事件
    { id: 'wang_broke', phase: 'any', weight: 3,
      cond: (s) => adult(s) && met('wang')(s) && s.seen.wang_casino && !s.flags.wangQuit && !s.npcs.wang.owe && s.stats.money >= 200000,
      choices: [
        { effects: { money: -200000 }, bond: { wang: 12 }, run: (s) => { s.npcs.wang.owe = 200000; s.npcs.wang.oweAt = s.age; } },
        { bond: { wang: -5 } },
        { roll: { chance: (s) => AW.clamp(0.2 + s.stats.social / 150, 0.2, 0.8),
          success: { effects: { mood: 5 }, bond: { wang: 8 }, flags: { wangQuit: 1 } },
          fail: { effects: { mood: -2 }, bond: { wang: -2 } } } },
      ] },
    { id: 'wang_repay', phase: 'any', weight: 200, cond: (s) => met('wang')(s) && s.npcs.wang.owe && s.age - s.npcs.wang.oweAt >= 3,
      run: (s) => {
        const owe = s.npcs.wang.owe;
        s.npcs.wang.owe = 0;
        if (AW.chance(0.5)) return { text: AW.tx('event.wang_repay', 'msg_pay', s), deltas: AW.applyEffects(s, { money: owe, mood: 6 }) };
        return { text: AW.tx('event.wang_repay', 'msg_nopay', s), deltas: AW.applyEffects(s, { mood: -3 }) };
      } },
    // 2. 哈基咩繳完房貸了（借過他錢的話他會特別感謝你）
    { id: 'haji_mortgage_done', phase: 'any', once: true, weight: 15, cond: (s) => s.age >= 48 && s.age <= 56 && met('haji')(s),
      variant: (s) => (s.npcs.haji.lent ? 'lent' : 'normal'),
      effects: { mood: 8 }, bond: (s) => ({ haji: s.npcs.haji.lent ? 10 : 5 }) },
    // 3. 哈基咩升官了
    { id: 'haji_promotion', phase: 'any', once: true, weight: 6, cond: (s) => s.age >= 30 && met('haji')(s),
      choices: [
        { effects: { mood: 6 }, bond: { haji: 2 } },
        { effects: { social: 2, mood: 3 }, bond: { haji: 6 } },
      ] },
    // 4. 阿方上美食節目
    { id: 'fang_tv', phase: 'any', once: true, weight: 6, cond: (s) => s.age >= 30 && met('fang')(s) && bond(s, 'fang') >= 20,
      choices: [
        { effects: { mood: 6 }, bond: { fang: 8 } },
        { effects: (s) => ({ fame: s.phase === 'second' && s.second.job === 'streamer' ? 5 : 3 }), bond: { fang: 5 },
          run: (s) => { if (s.phase === 'second' && s.second.job === 'streamer') s.second.subs = Math.round(s.second.subs * 1.03); } },
      ] },
    // 5. 阿方的餐廳摘星（投資成功過才會發生）
    { id: 'fang_star', phase: 'any', once: true, weight: 20, cond: (s) => s.flags.fangInvest && s.age >= 32 && met('fang')(s),
      effects: { money: 2000000, mood: 10 }, bond: { fang: 8 } },
    // 6. 長長貓的代練被抓包（用過代練才會發生）
    { id: 'cat_busted', phase: 'any', once: true, weight: 10, cond: (s) => s.flags.usedBoost && s.age >= 16 && met('cat')(s),
      choices: [
        { effects: { fame: -4, mood: -2 }, bond: { cat: 10 } },
        { effects: { mood: -3 }, bond: { cat: -10 } },
      ] },
    // 7. 長長貓開分店
    { id: 'cat_branch', phase: 'any', once: true, weight: 6, cond: (s) => s.age >= 35 && met('cat')(s),
      choices: [
        { cond: (s) => s.stats.money >= 1000000,
          roll: { chance: 0.55,
            success: { effects: { money: 1000000, mood: 8 }, bond: { cat: 8 } },
            fail: { effects: { money: -1000000, mood: -5 }, bond: { cat: 4 } } } },
        { effects: { mood: 4, fame: 1 }, bond: { cat: 8 } },
      ] },
    // 8. Corey 見義勇為
    { id: 'corey_hero', phase: 'any', once: true, weight: 5, cond: (s) => s.age >= 16 && met('corey')(s),
      effects: { mood: 6 }, run: (s) => ({ bonds: AW.NPC.metList(s).map((id) => ({ id, v: AW.NPC.addBond(s, id, id === 'corey' ? 5 : 2) })).filter((x) => x.v) }) },
    // 9. 朋友的婚禮（每位朋友一次，當伴郎）
    { id: 'friend_wedding', phase: 'any', weight: 5, cond: (s) => s.age >= 25 && s.age <= 40 && !!weddingFriend(s),
      vars: (s) => ({ 朋友: AW.NPC.name(weddingFriend(s) || 'haji') }),
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.social / 100, 0.25, 0.9),
          success: { effects: { social: 3, fame: 2, mood: 6 }, bond: (s) => ({ [weddingFriend(s)]: 6 }), run: (s) => { s.npcs[weddingFriend(s)].wed = 1; } },
          fail: { effects: { mood: 4 }, bond: (s) => ({ [weddingFriend(s)]: 3 }), run: (s) => { s.npcs[weddingFriend(s)].wed = 1; } } } },
        { cond: (s) => s.stats.money >= 66000, effects: { money: -66000, mood: 4 }, bond: (s) => ({ [weddingFriend(s)]: 10 }),
          run: (s) => { s.npcs[weddingFriend(s)].wed = 1; } },
      ] },
    // 11. 胡投顧的股災
    { id: 'hu_crash', phase: 'any', weight: 4, cond: (s) => s.age >= 25 && met('hu')(s) && bond(s, 'hu') >= 40,
      vars: (s) => ({ 金額: AW.fmtMoney(dipAmount(s)) }),
      choices: [
        { effects: { mood: -2 }, bond: { hu: 10 } },
        { cond: (s) => s.stats.money >= 1000000,
          roll: { chance: 0.55,
            success: { effects: (s) => ({ money: dipAmount(s), mood: 8 }), bond: { hu: 4 } },
            fail: { effects: (s) => ({ money: -Math.round(dipAmount(s) / 2), mood: -6 }) } } },
      ] },

    // ======================= 宿敵王選手（v1.2） =======================
    { id: 'rival_trash', phase: 'esports', weight: 6, cond: (s) => !!s.rival,
      vars: (s) => AW.Esports.rivalVars(s),
      choices: [
        { effects: { fame: 5, mood: 3 }, bond: { wang: -4 } },
        { effects: { teamwork: 3 }, bond: { wang: 2 } },
      ] },
    { id: 'rival_hug', phase: 'esports', weight: 4, cond: (s) => s.rival && s.rival.w + s.rival.l >= 2,
      vars: (s) => AW.Esports.rivalVars(s),
      effects: { mood: 6, teamwork: 2 }, bond: { wang: 10 } },

    // ======================= 職場（v1.2） =======================
    { id: 'office_peer', phase: 'engineer', weight: 6, cond: (s) => s.eng.stage === 'job' && s.flags.peerBeat,
      vars: (s) => ({ 同事: AW.pick(s.eng.peers).name }),
      choices: [
        { effects: { social: 3, mood: -2 } },
        { effects: { tech: 2, mood: -4 }, year: { perf: 1 } },
      ] },

    // ======================= 負債（v1.2） =======================
    { id: 'debt_collect', phase: 'any', weight: 80, cond: hasDebt,
      choices: [
        { cond: (s) => s.items.car, hideLocked: true, effects: { mood: -6 }, run: (s) => ({ deltas: AW.Shop.sell(s, 'car') }) },
        { cond: (s) => s.items.house, hideLocked: true, effects: { mood: -8 }, run: (s) => ({ deltas: AW.Shop.sell(s, 'house') }) },
        { cond: (s) => s.items.mansion, hideLocked: true, effects: { mood: -10 }, run: (s) => ({ deltas: AW.Shop.sell(s, 'mansion') }) },
        { cond: (s) => bond(s, 'hu') >= 60, hideLocked: true, effects: (s) => ({ money: -s.stats.money, mood: 2 }), bond: { hu: -15 } },
        { cond: (s) => bond(s, 'haji') >= 50 && !s.flags.renewal, hideLocked: true,
          effects: (s) => ({ money: -Math.round(s.stats.money / 2), mood: -5, fame: -5 }), bond: { haji: 5 },
          flags: { renewal: 1 }, run: (s) => { s.fin.debtYears = 0; } },
        { effects: { mood: -8 } },
      ] },

    // ======================= 感情：同時交往（v2.0） =======================
    { id: 'love_tempt', phase: 'any', weight: 5, cond: (s) => s.age >= 18 && s.age <= 55 && AW.Love.canTempt(s),
      choices: [
        { roll: { chance: (s) => AW.clamp(0.3 + s.stats.social / 200, 0.3, 0.85),
          success: { effects: { mood: 10 }, run: (s) => AW.Love.addFling(s) },
          fail: { effects: { mood: -5, social: -2 } } } },
        { effects: { love: 5 } },
      ] },
    { id: 'love_shura', phase: 'any', weight: 1000, cond: (s) => s.flags.shuraPending && s.flings.length > 0 && AW.Love.active(s),
      choices: [
        { roll: { chance: (s) => AW.clamp(0.25 + s.stats.social / 300, 0.25, 0.6),
          success: { effects: { mood: -8 }, run: (s) => AW.Love.shuraEnd(s, 'keep') },
          fail: { effects: { mood: -20, fame: -3 }, run: (s) => AW.Love.shuraEnd(s, 'all') } } },
        { effects: { mood: -10 }, run: (s) => AW.Love.shuraEnd(s, 'keep') },
        { effects: { mood: -6 }, run: (s) => AW.Love.shuraEnd(s, 'swap') },
        { effects: { mood: -15 }, run: (s) => AW.Love.shuraEnd(s, 'all') },
      ] },

    // ======================= 家庭（v2.0） =======================
    { id: 'baby', phase: 'any', weight: 40, cond: (s) => AW.Family.canHaveKid(s),
      choices: [
        { effects: { mood: 15, love: 10 }, run: (s) => AW.Family.addKid(s) },
        { effects: { love: -3 } },
      ] },
    { id: 'kid_first_game', phase: 'any', once: true, weight: 15, cond: (s) => s.kids.some((k) => AW.Family.age(s, k) >= 6 && AW.Family.age(s, k) <= 10),
      choices: [
        { effects: { mood: 8 }, run: (s) => { s.kids.forEach((k) => { k.games += 2; }); } },
        { effects: { mood: 4, love: 3 } },
      ] },
    { id: 'kid_rebel', phase: 'any', once: true, weight: 10, cond: (s) => s.kids.some((k) => AW.Family.age(s, k) >= 13 && AW.Family.age(s, k) <= 17),
      choices: [
        { roll: { chance: (s) => AW.clamp(0.3 + s.stats.social / 120, 0.3, 0.9),
          success: { effects: { mood: 8, love: 4 } },
          fail: { effects: { mood: -6 } } } },
        { effects: { mood: -4 } },
      ] },
    { id: 'kid_college', phase: 'any', once: true, weight: 15, cond: (s) => s.kids.some((k) => AW.Family.age(s, k) === 18),
      variant: (s) => (AW.Love.active(s) ? 'couple' : 'single'),
      effects: { mood: 10, money: -200000 } },
    { id: 'kid_wedding', phase: 'any', weight: 25, cond: (s) => !!AW.Family.marriageable(s),
      vars: (s) => ({ 新人: (AW.Family.marriageable(s) || {}).name || '' }),
      choices: [
        { cond: (s) => s.stats.money >= 1000000, effects: { money: -1000000, mood: 15, social: 2 },
          run: (s) => { AW.Family.marriageable(s).married = true; } },
        { effects: { mood: 10 }, run: (s) => { AW.Family.marriageable(s).married = true; } },
      ] },

    // ======================= 中年（v2.0） =======================
    { id: 'midlife_crisis', phase: 'any', once: true, weight: 8, cond: (s) => s.age >= 40 && s.age <= 50,
      choices: [
        { cond: (s) => s.stats.money >= 8000000 && !s.items.car, hideLocked: true, effects: { money: -8000000, mood: 15, fame: 4 },
          run: (s) => { s.items.car = 1; s.itemSince.car = s.age; } },
        { effects: { best: 5, mood: 10, health: -3 } },
        { roll: { chance: (s) => AW.clamp(s.stats[AW.resolveKey(s, 'best')] / 110, 0.05, 0.8),
          success: { effects: { fame: 15, mood: 15 }, flags: { oldSoldier: 1 } },
          fail: { effects: { mood: -6, health: -5 } } } },
      ] },

    // ======================= 第二幕：退役與傳奇（v2.0） =======================
    { id: 'hall_of_fame', phase: 'second', once: true, weight: 30,
      cond: (s) => s.esports && (s.esports.worldTitles >= 1 || s.esports.domesticTitles >= 3),
      effects: { fame: 10, mood: 12 }, flags: { hallOfFame: 1 } },
    { id: 'farewell_match', phase: 'second', once: true, weight: 50,
      cond: (s) => s.rival && s.esports && s.second.since === s.age && s.age < 40,
      choices: [
        { roll: { chance: 0.5,
          success: { effects: { mood: 12, fame: 5 }, bond: { wang: 10 } },
          fail: { effects: { mood: 5, fame: 3 }, bond: { wang: 10 } } } },
        { effects: { mood: 8 }, bond: { wang: 15 } },
      ] },

    // 實況主
    { id: 'stream_flame', phase: 'second', weight: 6, cond: job('streamer'),
      choices: [
        { effects: { fame: -3, mood: -5 } },
        { roll: { chance: 0.4,
          success: { effects: { fame: 5, mood: 3 } },
          fail: { effects: { fame: -12, mood: -8 }, run: (s) => { s.second.subs = Math.round(s.second.subs * 0.85); } } } },
      ] },
    { id: 'stream_donate', phase: 'second', weight: 5, cond: job('streamer'),
      income: 500000, effects: { mood: 8 } },
    // 12. 王選手開直播找你連線（實況主的話訂閱數也會增加）
    { id: 'stream_wang', phase: 'any', weight: 4, cond: (s) => s.age >= 30 && AW.NPC.met(s, 'wang') && AW.NPC.bond(s, 'wang') >= 30,
      effects: { mood: 8, fame: 3 }, bond: { wang: 8 },
      run: (s) => { if (s.phase === 'second' && s.second.job === 'streamer') s.second.subs = Math.round(s.second.subs * 1.05); } },

    // 教練
    { id: 'coach_rookie', phase: 'second', weight: 6, cond: job('coach'),
      choices: [
        { effects: { mood: -2, tactics: 2 }, run: (s) => { s.second.bonus += 4; if (!s.second.rookie) s.second.rookie = s.age; } },
        { effects: { mood: 2 } },
      ] },
    { id: 'coach_rival', phase: 'second', weight: 5, cond: (s) => job('coach')(s) && !!s.rival,
      vars: (s) => AW.Esports.rivalVars(s),
      choices: [
        { effects: { fame: 4, mood: 3 }, bond: { wang: -3 } },
        { effects: { tactics: 3 }, bond: { wang: 3 } },
      ] },

    // 創業從商、董事長
    { id: 'biz_partner', phase: 'second', weight: 6, cond: (s) => job('biz')(s) && !!s.second.partner,
      vars: (s) => ({ 合夥人: AW.NPC.name(s.second.partner) }),
      effects: { mood: 6, social: 2 }, year: { sp: 2 }, bond: (s) => ({ [s.second.partner]: 6 }) },
    { id: 'biz_crisis', phase: 'second', weight: 5, cond: job('biz'),
      choices: [
        { effects: { mood: -4 }, year: { sp: -2 } },
        { roll: { chance: (s) => AW.clamp(s.stats.leader / 100, 0.2, 0.8),
          success: { effects: { fame: 3 }, year: { sp: 2 } },
          fail: { effects: { fame: -8, mood: -8 }, year: { sp: -4 } } } },
      ] },
    { id: 'hostile_takeover', phase: 'second', weight: 5, cond: job('chairman'),
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.leader / 110 + (AW.NPC.bond(s, 'hu') >= 60 ? 0.15 : 0), 0.2, 0.9),
          success: { effects: { fame: 5, mood: 8 }, year: { sp: 3 } },
          fail: { effects: { mood: -10 }, year: { sp: -4 } } } },
        { effects: { mood: -3, money: -20000000 } },
      ] },
    { id: 'own_team', phase: 'second', weight: 6, cond: (s) => s.flags.ownTeam,
      effects: { fame: 4, mood: 8 } },

    // ======================= 第二幕：職業專屬事件（v2.1） =======================
    // 董事長：併購案（隔年整合）
    { id: 'ch_acquire', phase: 'second', weight: 8, cond: (s) => job('chairman')(s) && !s.second.deal,
      vars: (s) => ({ 金額: AW.fmtMoney(dealCost(s)) }),
      choices: [
        { cond: (s) => s.stats.money >= dealCost(s), effects: (s) => ({ money: -dealCost(s), mood: 3 }), run: (s) => { s.second.deal = s.age; } },
        { effects: { mood: -1 } },
      ] },
    { id: 'ch_acquire_done', phase: 'second', force: true, cond: (s) => job('chairman')(s) && s.second.deal && s.age > s.second.deal,
      choices: [
        { roll: { chance: (s) => AW.clamp((s.stats.leader + s.stats.tech) / 200 + 0.1, 0.3, 0.9),
          success: { effects: (s) => ({ money: dealCost(s) * 2, fame: 5, mood: 10, health: -6 }), year: { sp: 4 }, run: (s) => { s.second.deal = 0; } },
          fail: { effects: { fame: -4, mood: -10, health: -6 }, year: { sp: -3 }, run: (s) => { s.second.deal = 0; } } } },
        { roll: { chance: (s) => AW.clamp((s.stats.leader + s.stats.tech) / 250, 0.2, 0.75),
          success: { effects: (s) => ({ money: dealCost(s) * 2, mood: 8 }), year: { sp: 3 }, run: (s) => { s.second.deal = 0; } },
          fail: { effects: { mood: -8 }, year: { sp: -2 }, run: (s) => { s.second.deal = 0; } } } },
      ] },
    { id: 'ch_scandal', phase: 'second', weight: 7, cond: job('chairman'),
      choices: [
        { effects: { fame: -3, mood: -4 }, year: { sp: -1 } },
        { roll: { chance: 0.5,
          success: { effects: { mood: 2 } },
          fail: { effects: { fame: -12, mood: -10 }, run: (s) => { s.second.bad = (s.second.bad || 0) + 1; } } } },
      ] },
    { id: 'ch_successor', phase: 'second', once: true, weight: 13, cond: (s) => job('chairman')(s) && s.age >= 58,
      vars: (s) => ({ 接班的孩子: (heirKid(s) || {}).name || '' }),
      choices: [
        { effects: { leader: 3, mood: 4 }, run: (s) => { s.second.heir = 1; } },
        { cond: (s) => !!heirKid(s), hideLocked: true, effects: { mood: 10, love: 4 }, run: (s) => { s.second.heir = 1; } },
        { effects: { mood: 3, health: -3 } },
      ] },
    { id: 'ch_keynote', phase: 'second', weight: 7, cond: job('chairman'),
      choices: [
        { roll: { chance: (s) => AW.clamp((s.stats.social + s.stats.fame) / 160, 0.25, 0.85),
          success: { effects: { fame: 6, mood: 6 }, year: { sp: 2 } },
          fail: { effects: { fame: -4, mood: -5 } } } },
        { effects: { mood: 2 } },
      ] },
    { id: 'ch_hu_advice', phase: 'second', weight: 6, cond: (s) => job('chairman')(s) && met('hu')(s) && bond(s, 'hu') >= 40,
      choices: [
        { year: { sp: 2 }, bond: { hu: 5 } },
        { effects: { leader: 1 }, bond: { hu: -2 } },
      ] },
    { id: 'ch_alma_mater', phase: 'second', once: true, weight: 5, cond: job('chairman'),
      choices: [
        { cond: (s) => s.stats.money >= 10000000, effects: { money: -10000000, fame: 5, mood: 8 },
          run: (s) => { s.counters.donated = (s.counters.donated || 0) + 10000000; } },
        { effects: { fame: 2, mood: 5 } },
      ] },
    { id: 'ch_antitrust', phase: 'second', weight: 6, cond: (s) => job('chairman')(s) && s.second.stage >= 2,
      choices: [
        { effects: { money: -30000000, mood: -3 }, year: { sp: -1 } },
        { roll: { chance: (s) => AW.clamp(s.stats.leader / 110, 0.2, 0.8),
          success: { effects: { fame: 3, mood: 5 } },
          fail: { effects: { money: -100000000, fame: -8, mood: -10 } } } },
      ] },
    { id: 'ch_poach', phase: 'second', weight: 6, cond: job('chairman'),
      vars: (s) => ({ 金額: AW.fmtMoney(5000000 * (s.second.stage + 1)) }),
      choices: [
        { cond: (s) => s.stats.money >= 5000000 * (s.second.stage + 1), effects: (s) => ({ money: -5000000 * (s.second.stage + 1) }), year: { sp: 1 } },
        { effects: { leader: 3, mood: -2 }, year: { sp: -2 } },
      ] },

    // 企業家：創投入股（隔年要求擴張）
    { id: 'biz_location', phase: 'second', weight: 7, cond: job('biz'),
      choices: [
        { cond: (s) => s.stats.money >= 2000000, effects: { money: -2000000 }, year: { sp: 3 } },
        { year: { sp: 1 } },
      ] },
    { id: 'biz_influencer', phase: 'second', weight: 7, cond: job('biz'),
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.social / 100 + 0.1, 0.25, 0.85),
          success: { effects: { fame: 4, mood: 5 }, year: { sp: 2 } },
          fail: { effects: { fame: -4, mood: -5 }, year: { sp: -2 } } } },
        { effects: { mood: 2 } },
      ] },
    { id: 'biz_copycat', phase: 'second', weight: 6, cond: job('biz'),
      choices: [
        { cond: (s) => s.stats.money >= 1000000, effects: { money: -1000000, mood: -3 }, year: { sp: 1 } },
        { roll: { chance: (s) => AW.clamp(s.stats[AW.Second.THEMES[s.second.theme].stat] / 100, 0.2, 0.85),
          success: { effects: { fame: 2, mood: 6 }, year: { sp: 3 } },
          fail: { effects: { mood: -4 }, year: { sp: -1 } } } },
        { effects: { mood: 2 }, year: { sp: -1 } },
      ] },
    { id: 'biz_manager', phase: 'second', weight: 6, cond: (s) => job('biz')(s) && s.age - s.second.since >= 1,
      choices: [
        { cond: (s) => s.stats.money >= 500000, effects: { money: -500000 }, year: { sp: 1 } },
        { effects: { health: -6, leader: 3 } },
      ] },
    { id: 'biz_vc', phase: 'second', weight: 6, cond: (s) => job('biz')(s) && s.second.stage >= 1 && !s.second.vc,
      choices: [
        { effects: { mood: 5 }, run: (s) => { s.second.vc = s.age; s.second.runway += 2; } },
        { effects: { leader: 2 }, run: (s) => { s.second.vc = -1; } },
      ] },
    { id: 'biz_vc_push', phase: 'second', force: true, cond: (s) => job('biz')(s) && s.second.vc > 0 && s.age > s.second.vc,
      choices: [
        { effects: { health: -8, mood: -5 }, year: { sp: 3 }, run: (s) => { s.second.vc = -1; } },
        { effects: { mood: 2 }, year: { sp: -2 }, run: (s) => { s.second.vc = -1; s.second.runway -= 1; } },
      ] },
    { id: 'biz_regular', phase: 'second', weight: 5, cond: (s) => job('biz')(s) && s.age - s.second.since >= 2,
      effects: { mood: 8, social: 2 } },
    { id: 'biz_friends', phase: 'second', weight: 6, cond: (s) => job('biz')(s) && AW.NPC.gamers(s).length > 0,
      effects: { mood: 6 }, year: { sp: 1 },
      run: (s) => ({ bonds: AW.NPC.squadMembers(s).map((id) => ({ id, v: AW.NPC.addBond(s, id, 3) })).filter((x) => x.v) }) },
    { id: 'biz_franchise', phase: 'second', weight: 6, cond: (s) => job('biz')(s) && s.second.stage >= 2,
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.leader / 100, 0.25, 0.85),
          success: { effects: { money: 3000000, mood: 6 }, year: { sp: 3 } },
          fail: { effects: { fame: -6, mood: -6 }, year: { sp: -2 } } } },
        { effects: { fame: 2 } },
      ] },

    // 實況主
    { id: 'stream_viral', phase: 'second', weight: 7, cond: job('streamer'),
      effects: { fame: 3, mood: 6 }, run: (s) => { s.second.subs = Math.round(s.second.subs * 1.08); } },
    { id: 'stream_brand', phase: 'second', weight: 7, cond: job('streamer'),
      vars: (s) => ({ 金額: AW.fmtMoney(brandFee(s)) }),
      choices: [
        { income: (s) => brandFee(s), effects: { fame: -1, mood: -1 } },
        { effects: { fame: 2, mood: 2 } },
      ] },
    { id: 'stream_burnout', phase: 'second', weight: 6, cond: job('streamer'),
      choices: [
        { effects: { mood: 10, health: 6 }, run: (s) => { s.second.subs = Math.round(s.second.subs * 0.94); } },
        { effects: { mood: -8, health: -5 } },
      ] },
    { id: 'stream_troll', phase: 'second', weight: 6, cond: job('streamer'),
      choices: [
        { roll: { chance: 0.6,
          success: { effects: { mood: 6, fame: 2 } },
          fail: { effects: { mood: -6, money: -300000 } } } },
        { effects: { mood: -4 } },
      ] },
    { id: 'stream_platform', phase: 'second', weight: 5, cond: (s) => job('streamer')(s) && !s.second.moved,
      vars: (s) => ({ 金額: AW.fmtMoney(platformFee(s)) }),
      choices: [
        { income: (s) => platformFee(s), effects: { mood: 4 }, run: (s) => { s.second.moved = 1; s.second.subs = Math.round(s.second.subs * 0.85); } },
        { effects: { mood: 3 }, run: (s) => { s.second.moved = 1; s.second.subs = Math.round(s.second.subs * 1.03); } },
      ] },
    { id: 'stream_rookie', phase: 'second', weight: 6, cond: job('streamer'),
      choices: [
        { effects: { social: 3, mood: 4 }, run: (s) => { s.second.subs = Math.round(s.second.subs * 1.03); } },
        { effects: { mood: -1 } },
      ] },
    { id: 'stream_cast', phase: 'second', weight: 6, cond: (s) => job('streamer')(s) && (!!s.esports || s.stats.fame >= 40),
      effects: { fame: 5, mood: 6 }, run: (s) => { s.second.subs = Math.round(s.second.subs * 1.04); } },
    { id: 'stream_charity', phase: 'second', weight: 5, cond: job('streamer'),
      choices: [
        { effects: { fame: 4, mood: 8 }, run: (s) => { s.second.subs = Math.round(s.second.subs * 1.02); } },
        { effects: { mood: -1 } },
      ] },

    // 教練：天才新秀長大了（重點培養 2 年後）
    { id: 'coach_rookie_star', phase: 'second', force: true,
      cond: (s) => job('coach')(s) && s.second.rookie > 0 && s.age - s.second.rookie >= 2,
      choices: [
        { effects: { money: 3000000, mood: 4 }, run: (s) => { s.second.rookie = -1; s.second.bonus -= 3; } },
        { cond: (s) => s.stats.money >= 1500000, effects: { money: -1500000, mood: 6 }, run: (s) => { s.second.rookie = -1; s.second.bonus += 4; } },
      ] },
    { id: 'coach_fixing', phase: 'second', weight: 5, cond: job('coach'),
      choices: [
        { effects: { fame: 2, mood: -3 }, run: (s) => { s.second.bonus -= 3; } },
        { roll: { chance: 0.6,
          success: { effects: { mood: 6 }, run: (s) => { s.second.bonus += 3; } },
          fail: { effects: { fame: -10, mood: -10 } } } },
      ] },
    { id: 'coach_conflict', phase: 'second', weight: 6, cond: job('coach'),
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats.social / 100 + 0.1, 0.25, 0.85),
          success: { effects: { mood: 4 }, run: (s) => { s.second.bonus += 3; } },
          fail: { effects: { mood: -4 }, run: (s) => { s.second.bonus -= 3; } } } },
        { effects: { tactics: 2 }, run: (s) => { s.second.bonus -= 1; } },
      ] },
    { id: 'coach_patch', phase: 'second', weight: 7, cond: job('coach'),
      choices: [
        { effects: { tactics: 4, health: -3, mood: -2 } },
        { roll: { chance: 0.4,
          success: { effects: { mood: 6 }, run: (s) => { s.second.bonus += 3; } },
          fail: { effects: { mood: -4 }, run: (s) => { s.second.bonus -= 4; } } } },
      ] },
    { id: 'coach_bootcamp', phase: 'second', weight: 6, cond: job('coach'),
      vars: (s) => ({ 金額: AW.fmtMoney(1000000 * (s.second.tier + 1)) }),
      choices: [
        { cond: (s) => s.stats.money >= 1000000 * (s.second.tier + 1), effects: (s) => ({ money: -1000000 * (s.second.tier + 1), mood: 3 }),
          run: (s) => { s.second.bonus += 4; } },
        { effects: { mood: 1 } },
      ] },
    { id: 'coach_old_mate', phase: 'second', once: true, weight: 5, cond: (s) => job('coach')(s) && !!s.esports,
      choices: [
        { effects: { tactics: 3, mood: 6 } },
        { effects: { mood: -1 } },
      ] },
    { id: 'coach_critic', phase: 'second', weight: 6, cond: job('coach'),
      choices: [
        { effects: { fame: 2, mood: 2 } },
        { effects: { tactics: 2, mood: -2 } },
      ] },
    { id: 'coach_analyst', phase: 'second', weight: 5, cond: job('coach'),
      choices: [
        { cond: (s) => s.stats.money >= 2000000, effects: { money: -2000000, tactics: 4 } },
        { effects: { mood: 2 } },
      ] },

    // 退休（65 歲前）
    { id: 'retire_bored', phase: 'second', weight: 8, cond: (s) => s.second.job === 'retired' && s.age < 65,
      choices: [
        { effects: { study: 5, mood: 5 } },
        { effects: { social: 4, mood: 6, fame: 1 } },
        { effects: { best: 3, mood: 4, health: -2 } },
      ] },
    { id: 'retire_reunion', phase: 'second', weight: 5, cond: (s) => s.second.job === 'retired' && s.age >= 45 && s.age < 65,
      effects: { mood: 8, social: 2 } },
    { id: 'retire_recognized', phase: 'second', weight: 5, cond: (s) => s.second.job === 'retired' && s.age < 65 && s.stats.fame >= 30,
      effects: { mood: 6 } },
    { id: 'retire_offer', phase: 'second', weight: 5, cond: (s) => s.second.job === 'retired' && s.age < 60,
      choices: [
        { run: (s) => { s.decision = AW.Second.decision(s, 'switch'); } },
        { effects: { mood: 2 } },
      ] },

    // ======================= 晚年（v2.0） =======================
    { id: 'old_friend_visit', phase: 'second', weight: 6, cond: (s) => s.age >= 55 && AW.NPC.metList(s).length > 0,
      vars: (s) => ({ 朋友: AW.NPC.name(AW.NPC.metList(s).sort((a, b) => AW.NPC.bond(s, b) - AW.NPC.bond(s, a))[0]) }),
      effects: { mood: 8 }, run: (s) => {
        const id = AW.NPC.metList(s).sort((a, b) => AW.NPC.bond(s, b) - AW.NPC.bond(s, a))[0];
        return { bonds: [{ id, v: AW.NPC.addBond(s, id, 5) }] };
      } },
    { id: 'elder_fall', phase: 'second', weight: 6, cond: (s) => s.age >= 65, effects: { health: -12, mood: -4 } },
    { id: 'elder_hospital', phase: 'second', weight: 8, cond: (s) => s.age >= 70 && s.stats.health < 40,
      choices: [
        { cond: (s) => s.stats.money >= 1000000, effects: { money: -1000000, health: 15, mood: -2 } },
        { effects: { health: 5, mood: -4 } },
      ] },
    { id: 'elder_grandkids', phase: 'second', weight: 6, cond: (s) => s.age >= 60 && s.grandkids >= 1,
      effects: { mood: 12, best: 1 } },
    { id: 'charity_thanks', phase: 'second', weight: 4, cond: (s) => (s.counters.donated || 0) >= 10000000,
      effects: { mood: 10, fame: 2 } },
    // 結果文字：有認識哈基咩才會噴他（result_haji），否則用 result_normal
    { id: 'wish_reunion', phase: 'second', weight: 30,
      cond: (s) => AW.Second.hasWish(s, 'reunion') && AW.NPC.gamers(s).filter((id) => AW.NPC.bond(s, id) >= 40).length >= 4,
      effects: { mood: 15 }, run: (s) => {
        AW.Second.completeWish(s, 'reunion');
        return { text: AW.tx('event.wish_reunion', met('haji')(s) ? 'result_haji' : 'result_normal', s),
          bonds: AW.NPC.squadMembers(s).map((id) => ({ id, v: AW.NPC.addBond(s, id, 5) })).filter((x) => x.v) };
      } },
    { id: 'wish_wang', phase: 'second', weight: 30, cond: (s) => AW.Second.hasWish(s, 'rival_match'),
      choices: [
        { roll: { chance: (s) => AW.clamp(s.stats[AW.resolveKey(s, 'best')] / 100, 0.2, 0.8),
          success: { effects: { mood: 15 }, bond: { wang: 10 }, run: (s) => { AW.Second.completeWish(s, 'rival_match'); } },
          fail: { effects: { mood: 10 }, bond: { wang: 10 }, run: (s) => { AW.Second.completeWish(s, 'rival_match'); } } } },
        { effects: { mood: 12 }, bond: { wang: 12 }, run: (s) => { AW.Second.completeWish(s, 'rival_match'); } },
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
