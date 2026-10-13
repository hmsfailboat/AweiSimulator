/* 人生第二幕（v2.0）：實況主、電競教練、創業從商、董事長、退休、晚年；遺願清單、臨終與人生終章
 * s.second = { job, since, ...各職業的資料 }
 * 文字在 js/data/texts.js 的 [second]、[life]、[wish.代號]
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const ELDER_AGE = 65;
  const COACH_SALARY = [300000, 600000, 1200000, 2500000, 5000000];
  // 創業從商：每個階段的年度分紅、晉級獎金
  const BIZ_STAGES = [
    { icon: '🏪', dividend: 200000, bonus: 0 },
    { icon: '🏬', dividend: 600000, bonus: 1000000 },
    { icon: '🔗', dividend: 1500000, bonus: 3000000 },
    { icon: '🇹🇼', dividend: 4000000, bonus: 8000000 },
    { icon: '🌏', dividend: 10000000, bonus: 20000000 },
    { icon: '🔔', dividend: 30000000, bonus: 100000000 },
  ];
  const CHAIR_STAGES = [
    { icon: '🏢', dividend: 10000000, bonus: 0 },
    { icon: '🌐', dividend: 25000000, bonus: 50000000 },
    { icon: '🏆', dividend: 50000000, bonus: 100000000 },
    { icon: '🌌', dividend: 100000000, bonus: 300000000 },
  ];
  // 創業主題：stat = 主要看哪個能力；partner = 合夥的朋友
  const THEMES = {
    academy: { stat: 'fame' }, cafe: { stat: 'fame' }, consult: { stat: 'tech' },
    restaurant: { stat: 'social', partner: 'fang' }, breakfast: { stat: 'social', partner: 'cat' },
  };
  const STREAM = { startFame: 5000, startSocial: 1000, churn: 0.85, perWin: 0.12, flat: 8000, goal: 1000000, income: 1.5, base: 29, perDigit: 8 };
  // 教練：隊伍戰力 = tactics × 戰術 + roster ×（隊友實力 + 加成）- penalty；加成上限、每年衰退；奪冠後被挖角的機率
  const COACH = { tactics: 0.4, roster: 0.6, penalty: 2, bonusMax: 8, bonusMin: -5, bonusDecay: 2, promote: 0.5 };
  const PENSION = 300000;
  // 經營評分：董事長 -chairBase - 階段 × chairStep；創業 - 階段 × bizStep；合夥朋友好友度 50 以上加 partner
  const VENTURE = { chairBase: 27, chairStep: 12, bizStep: 12, partner: 6 };
  const BIZ_COST = 3000000;
  const WISH_AGE = 60;
  const WISH_COUNT = 5;

  // 遺願清單：cond 能不能出現；check 完成條件（也可以由事件直接完成）
  const WISHES = {
    travel: { check: (s) => (s.counters.travelOld || 0) >= 3 },
    rival_match: { cond: (s) => AW.NPC.met(s, 'wang') },
    kid_wedding: { cond: (s) => s.kids.length > 0, check: (s) => s.kids.some((k) => k.married) },
    charity: { check: (s) => (s.counters.donated || 0) >= 30000000 },
    reunion: { cond: (s) => AW.NPC.gamers(s).length >= 4 },
    memoir: { check: (s) => (s.counters.memoir || 0) >= 1 },
    grandkid: { cond: (s) => s.kids.length > 0, check: (s) => s.grandkids >= 1 },
    big_fish: { check: (s) => !!s.flags.bigFish },
    eighty_five: { check: (s) => s.age >= 85 },
  };

  const Second = (AW.Second = {
    ELDER_AGE, BIZ_STAGES, CHAIR_STAGES, THEMES, WISHES, COACH_SALARY,

    stageKey(s) { return s.age >= ELDER_AGE ? 'elder' : s.second.job; },
    // 50 歲後一回合 2 年、65 歲後 3 年
    turnYears(s) { return s.age >= ELDER_AGE ? 3 : s.age >= 50 ? 2 : 1; },
    jobName(s) { return AW.tx('second', 'job_' + this.stageKey(s), s); },
    title(s) {
      const g = s.second;
      if (s.age >= ELDER_AGE) return this.jobName(s);
      if (g.job === 'coach') return `${AW.Esports.TIERS[g.tier].name}・${g.team} 總教練`;
      if (g.job === 'biz') return `${g.name} 創辦人`;
      if (g.job === 'chairman') return `${g.name} 董事長`;
      return this.jobName(s);
    },
    hasSeason(s) { return s.phase === 'second' && s.age < ELDER_AGE && ['streamer', 'coach', 'biz', 'chairman'].includes(s.second.job); },

    // ---------- 選擇第二幕 ----------
    // reason：剛完成的章節代號，或 'switch'（轉換跑道）、'ousted'（被趕下台）、'closed'（公司收掉）
    decision(s, reason) {
      const tx = (k, extra) => AW.tx('second', k, s, extra);
      const opts = [];
      // 只有「轉換跑道」時才排除目前的工作（公司收掉、被趕下台時一定可以選退休）
      const cur = reason === 'switch' && s.phase === 'second' ? s.second.job : null;
      if (reason === 'world_champ' && s.phase === 'esports' && s.age < 32) {
        opts.push({ label: tx('opt_defend'), desc: tx('opt_defend_desc'), apply: () => ({ text: tx('msg_defend') }) });
      }
      if (reason === 'tech_boss') {
        opts.push({ label: tx('opt_chairman'), desc: tx('opt_chairman_desc'), apply: (st) => this.start(st, 'chairman') });
      }
      if (s.esports && cur !== 'coach' && s.age < ELDER_AGE) {
        opts.push({ label: tx('opt_coach'), desc: tx('opt_coach_desc'), apply: (st) => this.start(st, 'coach') });
      }
      if ((s.esports || s.stats.fame >= 15) && cur !== 'streamer' && s.age < ELDER_AGE) {
        opts.push({ label: tx('opt_streamer'), desc: tx('opt_streamer_desc', { 訂閱: this.fmtSubs(this.startSubs(s)) }), apply: (st) => this.start(st, 'streamer') });
      }
      if (s.age < 60 && cur !== 'biz' && cur !== 'chairman') {
        const theme = this.pickTheme(s);
        const free = reason === 'ousted';
        const ok = free || s.stats.money >= BIZ_COST;
        opts.push({ label: tx(free ? 'opt_comeback' : 'opt_biz', { 主題: tx('theme_' + theme) }),
          desc: ok ? tx(free ? 'opt_comeback_desc' : 'opt_biz_desc', { 資金: AW.fmtMoney(BIZ_COST) }) : tx('opt_biz_poor', { 資金: AW.fmtMoney(BIZ_COST) }),
          disabled: !ok, apply: (st) => this.start(st, 'biz', { theme, free }) });
      }
      if (cur !== 'retired') opts.push({ label: tx('opt_retire'), desc: tx('opt_retire_desc'), apply: (st) => this.start(st, 'retired') });
      if (reason === 'switch') opts.push({ label: tx('opt_stay'), apply: () => ({}) });
      return { type: 'second', icon: '🛤️', title: tx('decision_title'), text: tx('decision_' + (['switch', 'ousted', 'closed'].includes(reason) ? reason : 'chapter')), options: opts.filter((o) => !o.disabled).concat(opts.filter((o) => o.disabled)) };
    },

    pickTheme(s) {
      const partners = ['fang', 'cat'].filter((id) => AW.NPC.bond(s, id) >= 50).sort((a, b) => AW.NPC.bond(s, b) - AW.NPC.bond(s, a));
      if (partners.length) return partners[0] === 'fang' ? 'restaurant' : 'breakfast';
      if (s.esports) return s.stats.fame >= 50 ? 'academy' : 'cafe';
      return 'consult';
    },
    startSubs(s) { return Math.round(s.stats.fame * STREAM.startFame + s.stats.social * STREAM.startSocial + 1000); },
    fmtSubs(n) { return n >= 10000 ? AW.fmtMoney(n).replace(' 元', '') + ' 人' : n + ' 人'; },

    start(s, job, opt) {
      opt = opt || {};
      const prev = s.phase === 'second' ? s.second : null;
      s.phase = 'second';
      const g = { job, since: s.age };
      if (job === 'streamer') {
        g.subs = this.startSubs(s);
        g.peak = g.subs;
        const names = AW.shuffle(AW.txList('second', 'streamers')).slice(0, 5);
        const sizes = [1200000, 700000, 400000, 200000, 80000];
        g.others = names.map((name, i) => ({ name, subs: Math.round(sizes[i] * (0.8 + AW.rand() * 0.4)) }));
      } else if (job === 'coach') {
        const main = s.esports ? s.stats[s.esports.game] : s.stats[AW.resolveKey(s, 'best')];
        s.stats.tactics = Math.max(s.stats.tactics || 0, Math.round(0.4 * main + 0.3 * s.stats.teamwork + 0.3 * s.stats.study));
        g.tier = AW.clamp((s.esports ? s.esports.maxTier : 1) - 1, 0, 3);
        g.team = AW.Esports.teamName(g.tier);
        g.bonus = 0;
        g.titles = 0;
        g.worldTitles = 0;
        if (s.rival) s.rival.coach = AW.randInt(62, 80);
      } else if (job === 'biz') {
        if (!opt.free) AW.applyEffects(s, { money: -BIZ_COST });
        g.theme = opt.theme || this.pickTheme(s);
        g.partner = THEMES[g.theme].partner || null;
        g.stage = 0;
        g.runway = 3;
        g.name = AW.pick(AW.txList('second', 'names_' + g.theme));
        s.stats.leader = Math.max(s.stats.leader, Math.round(s.stats.social * 0.3 + s.stats.teamwork * 0.2));
        s.flags.bizStarts = (s.flags.bizStarts || 0) + 1;
        g.support = AW.Love.ventureSupport(s);
        g.runway += g.support.runway;
      } else if (job === 'chairman') {
        g.stage = 0;
        g.bad = 0;
        g.name = s.eng ? (s.eng.startup >= 5 ? s.eng.startupName : s.eng.companyName) : '阿維集團';
      }
      s.second = g;
      if (prev && prev.job === 'streamer') g.oldSubs = prev.subs;
      s.displayName = s.proName && (job === 'streamer' || job === 'coach') ? 'Aweiisa' + s.proName : '劉家維';
      let text = AW.tx('second', 'start_' + job, s, { 公司: g.name || '', 戰隊: g.team || '', 主題: g.theme ? AW.tx('second', 'theme_' + g.theme, s) : '' });
      if (g.support && g.support.text) { text += ' ' + g.support.text; delete g.support; }
      this.ensureWishes(s);
      return { text };
    },

    onNewYear(s) {
      const g = s.second;
      // 65 歲：所有工作告一段落，進入晚年
      if (s.age >= ELDER_AGE && g.job !== 'retired') {
        if (g.job === 'biz' || g.job === 'chairman') {
          const v = this.companyValue(s);
          if (v) AW.applyEffects(s, { money: v });
          AW.Engine.note(s, '🤝', AW.tx('second', 'msg_sell', s, { 公司: g.name, 金額: AW.fmtMoney(v) }));
        }
        AW.Engine.note(s, '🧓', AW.tx('second', 'msg_elder', s));
        s.second = { job: 'retired', since: s.age, was: g.job };
      }
      this.ensureWishes(s);
    },

    // 退休或 65 歲時把公司股份賣掉
    companyValue(s) {
      const g = s.second;
      if (g.job === 'biz') return BIZ_STAGES[g.stage].dividend * 5;
      if (g.job === 'chairman') return CHAIR_STAGES[g.stage].dividend * 5;
      return 0;
    },

    // ---------- 每年的挑戰（有動畫） ----------
    runYear(s) {
      const job = s.second.job;
      if (job === 'streamer') return this.runStream(s);
      if (job === 'coach') return this.runCoach(s);
      if (job === 'biz' || job === 'chairman') return this.runVenture(s);
      return null;
    },

    runStream(s) {
      const g = s.second;
      const st = s.stats;
      const best = s.stats[AW.resolveKey(s, 'best')];
      const P = 0.45 * st.fame + 0.25 * st.social + 0.15 * st.mood + 0.15 * best + (s.yearSp || 0) * 3 - (st.health < AW.TIER.low ? 4 : 0);
      const D = STREAM.base + STREAM.perDigit * Math.log10(Math.max(10, g.subs));
      const p = AW.clamp(AW.logistic(P - D, 8), 0.05, 0.95);
      const goals = AW.shuffle(AW.txList('second', 'stream_goals')).slice(0, 4);
      const matches = goals.map((name, i) => Object.assign(AW.playSeries(p, 1), { round: `Q${i + 1}`, oppName: name, opp: Math.round(D) }));
      const W = matches.filter((m) => m.won).length;
      const subs = Math.round(g.subs * (STREAM.churn + STREAM.perWin * W) + W * STREAM.flat);
      const others = g.others.map((o) => ({ name: o.name, subs: Math.round(o.subs * (0.95 + AW.rand() * 0.15)) }));
      const table = others.map((o) => ({ name: o.name, v: this.fmtSubs(o.subs), n: o.subs }));
      table.push({ name: s.displayName, v: this.fmtSubs(subs), n: subs, me: true });
      table.sort((a, b) => b.n - a.n);
      const place = table.findIndex((r) => r.me) + 1;
      const stages = [
        { name: AW.tx('second', 'stage_stream', s), icon: '📺', matches, passed: W >= 2,
          note: AW.tx('second', 'note_stream', s, { 達標: W, 訂閱: this.fmtSubs(subs), 變化: (subs >= g.subs ? '+' : '') + this.fmtSubs(subs - g.subs) }) },
        { name: AW.tx('second', 'stage_gala', s), icon: '🏆', matches: [], table, passed: place === 1,
          note: AW.tx('second', place === 1 ? 'note_gala_top' : 'note_gala', s, { 名次: place }) },
      ];
      return { kind: 'stream', title: AW.tx('second', 'title_stream', s), pill: `人氣 ${Math.round(P)}`, stages,
        result: { W, subs, others, place } };
    },

    coachPower(s) {
      const g = s.second;
      g.bonus = AW.clamp(g.bonus, COACH.bonusMin, COACH.bonusMax);
      return COACH.tactics * s.stats.tactics + COACH.roster * (AW.Esports.TIERS[g.tier].mates + g.bonus) - COACH.penalty;
    },
    runCoach(s) {
      const g = s.second;
      const season = AW.Esports.runSeason(s, { tier: g.tier, team: g.team, T: this.coachPower(s), coach: true });
      season.kind = 'coach';
      season.title = AW.tx('second', 'title_coach', s, { 戰隊: g.team });
      season.pill = `隊伍戰力 ${season.T}`;
      return season;
    },

    // 創業從商與董事長共用：4 季目標
    runVenture(s) {
      const g = s.second;
      const st = s.stats;
      const chair = g.job === 'chairman';
      let B;
      if (chair) B = 0.4 * st.tech + 0.35 * st.leader + 0.25 * st.social + (s.yearSp || 0) * 3 - VENTURE.chairBase - g.stage * VENTURE.chairStep;
      else B = 0.3 * st.social + 0.3 * st.leader + 0.4 * st[THEMES[g.theme].stat] + (s.yearSp || 0) * 3
        + (g.partner && AW.NPC.bond(s, g.partner) >= 50 ? VENTURE.partner : 0) - g.stage * VENTURE.bizStep;
      B -= st.health < AW.TIER.low ? 4 : 0;
      const p = AW.clamp(AW.logistic(B - 50, 8), 0.03, 0.97);
      const goals = AW.shuffle(AW.txList('second', chair ? 'chair_goals' : 'biz_goals')).slice(0, 4);
      const matches = goals.map((name, i) => Object.assign(AW.playSeries(p, 1), { round: `Q${i + 1}`, oppName: name, opp: 50 }));
      const W = matches.filter((m) => m.won).length;
      const result = W >= 3 ? 'up' : W >= 1 ? 'hold' : 'bad';
      const stages = [{ name: AW.tx('second', chair ? 'stage_chair' : 'stage_biz', s), icon: chair ? '📊' : '📈', matches, passed: W >= 3,
        note: AW.tx('second', 'note_venture_' + result, s, { 達標: W }) }];
      return { kind: 'venture', title: AW.tx('second', chair ? 'title_chair' : 'title_biz', s, { 公司: g.name }),
        pill: `經營實力 ${Math.round(B)}`, stages, result: { W, result } };
    },

    // ---------- 年末結算 ----------
    yearEnd(s) {
      const g = s.second;
      const season = s.season;
      if (g.job === 'streamer' && season) this.settleStream(s, season.result);
      else if (g.job === 'coach' && season) this.settleCoach(s, season);
      else if ((g.job === 'biz' || g.job === 'chairman') && season) this.settleVenture(s, season.result);
      if (g.job === 'retired' && s.age >= ELDER_AGE) AW.applyEffects(s, { money: PENSION });
    },

    // 快轉的年份：只有被動收入與自然變化
    silentYear(s) {
      const g = s.second;
      if (g.job === 'streamer') {
        g.subs = Math.round(g.subs * 0.97);
        AW.Finance.earn(s, g.subs * STREAM.income);
      } else if (g.job === 'coach') {
        AW.Finance.earn(s, COACH_SALARY[g.tier]);
      } else if (g.job === 'biz') {
        AW.Finance.earn(s, BIZ_STAGES[g.stage].dividend);
      } else if (g.job === 'chairman') {
        AW.Finance.earn(s, CHAIR_STAGES[g.stage].dividend);
      } else if (g.job === 'retired' && s.age >= ELDER_AGE) {
        AW.applyEffects(s, { money: PENSION });
      }
    },

    settleStream(s, r) {
      const g = s.second;
      const before = g.subs;
      g.subs = r.subs;
      g.others = r.others;
      g.peak = Math.max(g.peak || 0, g.subs);
      g.place = r.place;
      AW.applyEffects(s, { fame: r.W - 1, mood: r.W >= 3 ? 6 : r.W === 0 ? -6 : 0 });
      AW.Finance.earn(s, g.subs * STREAM.income);
      if (r.place === 1) { s.flags.topStreamer = 1; AW.applyEffects(s, { fame: 5 }); }
      AW.Engine.note(s, '📺', AW.tx('second', 'msg_stream', s, { 訂閱: this.fmtSubs(g.subs), 變化: (g.subs >= before ? '+' : '') + this.fmtSubs(g.subs - before), 名次: r.place }));
      if (g.subs >= STREAM.goal && !AW.Engine.hasChapter(s, 'mega_streamer') && !s.pendingEnding) s.pendingEnding = 'mega_streamer';
    },

    settleCoach(s, season) {
      const g = s.second;
      const T = AW.Esports.TIERS;
      g.bonus = AW.clamp(g.bonus - COACH.bonusDecay, COACH.bonusMin, COACH.bonusMax);
      let fame = season.leagueWins * 0.5 + season.playoffWins;
      if (season.champion) { g.titles += 1; fame += 6; AW.applyEffects(s, { mood: 10 }); }
      if (season.worldChampion) { g.worldTitles += 1; fame += 15; }
      AW.applyEffects(s, { fame: Math.round(fame) });
      AW.Finance.earn(s, COACH_SALARY[g.tier] + (season.champion ? COACH_SALARY[g.tier] : 0));
      AW.Esports.rivalResults(s, season, true);
      AW.Engine.note(s, season.worldChampion ? '🏆' : season.champion ? '🥇' : '📋', AW.tx('second', 'msg_coach', s, { 戰隊: g.team, 戰績: season.summary.join(' → ') }));
      if (season.worldChampion && !AW.Engine.hasChapter(s, 'champ_coach') && !s.pendingEnding) { s.pendingEnding = 'champ_coach'; return; }
      // 拿冠軍會被更強的戰隊挖角；戰績太差會被解雇，只能去弱一點的隊伍
      if (season.champion && g.tier < 4 && AW.chance(COACH.promote)) {
        g.tier += 1;
        g.team = AW.Esports.teamName(g.tier, g.team);
        AW.Engine.note(s, '✍️', AW.tx('second', 'msg_coach_up', s, { 戰隊: g.team, 等級: T[g.tier].name }));
      } else if (season.leagueWins <= 2 && g.tier > 0) {
        g.tier -= 1;
        g.team = AW.Esports.teamName(g.tier, g.team);
        AW.applyEffects(s, { mood: -8 });
        AW.Engine.note(s, '📉', AW.tx('second', 'msg_coach_down', s, { 戰隊: g.team, 等級: T[g.tier].name }));
      }
    },

    settleVenture(s, r) {
      const g = s.second;
      const chair = g.job === 'chairman';
      const ST = chair ? CHAIR_STAGES : BIZ_STAGES;
      const name = (i) => AW.tx('second', (chair ? 'chair_stage_' : 'biz_stage_') + i, s);
      if (r.result === 'up' && g.stage < ST.length - 1) {
        g.stage += 1;
        g.runway = 3;
        g.bad = 0;
        AW.applyEffects(s, { money: ST[g.stage].bonus, mood: 10, fame: 4 });
        AW.Engine.note(s, ST[g.stage].icon, AW.tx('second', 'msg_venture_up', s, { 公司: g.name, 階段: name(g.stage) }));
        if (g.stage === ST.length - 1 && !AW.Engine.hasChapter(s, 'tycoon') && !s.pendingEnding) {
          if (s.flags.ousted) s.flags.comeback = 1;
          s.pendingEnding = 'tycoon';
        }
      } else if (r.result !== 'up') {
        AW.applyEffects(s, { mood: r.result === 'bad' ? -8 : -2 });
        if (chair) {
          g.bad = r.W <= 1 ? (g.bad || 0) + 1 : 0;
          if (g.bad >= 2) return this.ousted(s);
        } else {
          g.runway -= r.result === 'hold' ? 1 : 2;
          if (g.runway <= 0) return this.closeBiz(s);
        }
      }
      AW.Finance.earn(s, ST[g.stage].dividend);
    },

    ousted(s) {
      const g = s.second;
      s.flags.ousted = 1;
      AW.applyEffects(s, { mood: -20, fame: -5, money: this.companyValue(s) });
      AW.Engine.note(s, '🪑', AW.tx('second', 'msg_ousted', s, { 公司: g.name }));
      s.second = { job: 'retired', since: s.age, was: 'chairman' };
      s.decision = this.decision(s, 'ousted');
    },
    closeBiz(s) {
      const g = s.second;
      s.flags.bizFail = (s.flags.bizFail || 0) + 1;
      AW.applyEffects(s, { mood: -15 });
      AW.Engine.note(s, '💥', AW.tx('second', 'msg_closed', s, { 公司: g.name }));
      s.second = { job: 'retired', since: s.age, was: 'biz' };
      s.decision = this.decision(s, 'closed');
    },

    // 轉換跑道（行動）：年度結算時選新的工作
    switchJob(s) {
      s.decision = this.decision(s, 'switch');
      return { text: AW.tx('second', 'msg_switch', s) };
    },

    // ---------- 遺願清單 ----------
    ensureWishes(s) {
      if (s.wishes || s.age < WISH_AGE) return;
      const pool = Object.keys(WISHES).filter((id) => !WISHES[id].cond || WISHES[id].cond(s));
      s.wishes = AW.shuffle(pool).slice(0, WISH_COUNT).map((id) => ({ id, done: false }));
      AW.Engine.note(s, '📝', AW.tx('life', 'msg_wishes', s));
    },
    hasWish(s, id) { return !!(s.wishes && s.wishes.some((w) => w.id === id && !w.done)); },
    completeWish(s, id) {
      const w = s.wishes && s.wishes.find((x) => x.id === id && !x.done);
      if (!w) return false;
      w.done = true;
      w.age = s.age;
      AW.applyEffects(s, { mood: 10 });
      AW.Engine.note(s, '✅', AW.tx('life', 'msg_wish_done', s, { 願望: AW.tx('wish.' + id, 'name', s) }));
      if (s.wishes.every((x) => x.done)) s.flags.allWishes = 1;
      return true;
    },
    checkWishes(s) {
      this.ensureWishes(s);
      for (const w of s.wishes || []) if (!w.done && WISHES[w.id].check && WISHES[w.id].check(s)) this.completeWish(s, w.id);
    },

    // ---------- 臨終與人生終章 ----------
    visitors(s) {
      const out = [];
      if (AW.Love.active(s)) out.push({ type: 'love' });
      if (s.kids.length) out.push({ type: 'kids' });
      AW.NPC.metList(s).filter((id) => AW.NPC.bond(s, id) >= 40).sort((a, b) => AW.NPC.bond(s, b) - AW.NPC.bond(s, a))
        .forEach((id) => out.push({ type: 'npc', id }));
      return out;
    },
    BIG_CHAPTERS: ['world_champ', 'tech_boss', 'champ_coach', 'mega_streamer', 'tycoon'],
    lifeEnding(s) {
      if (s.age >= 100) return 'centenarian';
      const big = new Set(s.chapters.map((c) => c.id).filter((id) => this.BIG_CHAPTERS.includes(id)));
      if (big.size >= 2) return 'legend';
      if (s.love && s.love.status === 'married' && AW.Love.active(s) && s.kids.length >= 2 && s.grandkids >= 1) return 'family';
      const friends = AW.NPC.metList(s).some((id) => AW.NPC.bond(s, id) >= 20);
      if (!AW.Love.active(s) && !s.kids.length && !friends) return 'lonely';
      return 'peaceful';
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
