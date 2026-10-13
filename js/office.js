/* 工程師職場聯賽：季度專案、同期排行榜、升遷答辯、董事會投票、尾牙；創業季度與募資路演
 * 和電競賽季一樣，結果在選完行動時先算好（s.season），動畫播完後 settle() 才套用，避免劇透。
 * 專案名稱、同事名字、突發狀況等文字在 js/data/texts.js 的 [office]
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const GRADES = [
    { g: 'S', min: 10, pts: 3 }, { g: 'A', min: 8, pts: 2 }, { g: 'B', min: 5, pts: 1 },
    { g: 'C', min: 3, pts: 0 }, { g: 'D', min: -999, pts: -1 },
  ];
  const PROJECT = { base: 55, spread: 6, k: 14 };
  // 突發狀況：d = 專案難度變化
  const INCIDENTS = [
    { id: 'oncall', d: 4 }, { id: 'scope', d: 5 }, { id: 'boss', d: 3 }, { id: 'sick', d: 4 },
    { id: 'helper', d: -5 }, { id: 'ai', d: -4 },
  ];
  const INCIDENT_CHANCE = 0.3;
  const DEFENSE = { base: 30, step: 6, k: 6 };
  const BOARD = { seats: 7, base: 0.45, maxQ: 0.6, huBond: 70 };
  const WEIYA = [{ id: 'grand', p: 0.03, cash: 200000, mood: 10 }, { id: 'second', p: 0.12, cash: 50000, mood: 5 }, { id: 'small', p: 1, cash: 0, mood: 2 }];
  const STARTUP = { base: 50, k: 8, vcBase: 40, vcStep: 5, vcK: 7, vcs: 3 };

  const Office = (AW.Office = {
    GRADES, INCIDENTS,

    // ---------- 同期同事 ----------
    makePeers(s) {
      const names = AW.shuffle(AW.txList('office', 'peers'));
      s.eng.peers = names.slice(0, 3).map((name) => ({ name, skill: AW.randInt(50, 70) }));
      s.eng.tops = 0;
    },

    // 考績用的能力：資淺看技術、主管看技術＋領導、高層看領導＋人緣
    relStat(s) {
      const e = s.eng;
      const st = s.stats;
      return e.rank <= 2 ? st.tech
        : e.rank === 3 ? (st.tech + st.leader) / 2
        : st.leader * 0.5 + st.social * 0.3 + st.tech * 0.2;
    },
    power(s) {
      const st = s.stats;
      return this.relStat(s) - s.eng.rank * 6 + (s.yearPerf || 0) * 4 + (st.mood - 50) / 8 - (st.health < AW.TIER.low ? 4 : 0);
    },

    // ---------- 上班族的一年 ----------
    runYear(s) {
      const e = s.eng;
      if (!e.peers || !e.peers.length) this.makePeers(s);
      const X = this.power(s);
      const clutch = AW.traitOf(s).clutch ? 0.04 : 0;
      const projects = AW.shuffle(AW.txList('office', 'projects')).slice(0, 4);
      const matches = [];
      let kpi = 0;
      for (let q = 0; q < 4; q++) {
        let D = PROJECT.base + AW.randInt(-PROJECT.spread, PROJECT.spread);
        let tag = null;
        if (AW.chance(INCIDENT_CHANCE)) {
          const inc = AW.pick(INCIDENTS);
          D += inc.d;
          tag = AW.tx('office', 'inc_' + inc.id, s);
        }
        const p = AW.clamp(AW.logistic(X - D, PROJECT.k) + clutch, 0.04, 0.96);
        const m = AW.playSeries(p, 3);
        Object.assign(m, { round: `Q${q + 1}`, oppName: projects[q] || '專案', opp: Math.round(D), tag });
        kpi += m.w + (m.won ? 1 : 0);
        matches.push(m);
      }
      const grade = GRADES.find((g) => kpi >= g.min);
      const stages = [{ name: AW.tx('office', 'stage_projects', s), icon: '🗂️', matches, passed: grade.pts >= 1,
        note: AW.tx('office', 'note_kpi', s, { KPI: kpi, 考績: grade.g }) }];

      // 同期排行榜
      const table = e.peers.map((p) => ({ name: p.name, v: AW.clamp(Math.round(7 + (p.skill - 60) / 3 + AW.randInt(-3, 3)), 0, 12) }));
      table.push({ name: s.displayName, v: kpi, me: true });
      table.sort((a, b) => b.v - a.v || (a.me ? -1 : b.me ? 1 : 0));
      const place = table.findIndex((r) => r.me) + 1;
      const top = place === 1;
      stages.push({ name: AW.tx('office', 'stage_peers', s), icon: '📊', matches: [], table, prefix: 'KPI ', passed: top,
        note: AW.tx('office', top ? 'note_top' : 'note_place', s, { 名次: place }) });

      // 升遷：點數與能力都達標 → 答辯（升 CEO 改為董事會投票）
      const E = AW.Engineer;
      const promo = Math.max(0, e.promo + grade.pts + (top ? 1 : 0));
      const need = E.promoNeed(s);
      const miss = E.missingReq(s, e.rank + 1);
      let promoted = false;
      let tried = false;
      if (e.rank < 6 && promo >= need && !miss.length) {
        tried = true;
        if (e.rank === 5) {
          const m = this.boardVote(s);
          promoted = m.won;
          stages.push({ name: AW.tx('office', 'stage_board', s), icon: '🗳️', matches: [m], passed: m.won,
            note: AW.tx('office', m.won ? 'note_board_ok' : 'note_board_fail', s, { 贊成: m.w, 反對: m.l }) });
        } else {
          const def = this.defense(s, e.rank + 1);
          promoted = def.passed;
          stages.push(def);
        }
      }

      // 尾牙
      const r = AW.rand();
      let acc = 0;
      const prize = WEIYA.find((w) => (acc += w.p) > r) || WEIYA[WEIYA.length - 1];
      const cash = prize.cash * (e.company + 1);
      stages.push({ name: AW.tx('office', 'stage_weiya', s), icon: '🧧', matches: [], passed: prize.id !== 'small', neutral: prize.id === 'small',
        note: AW.tx('office', 'weiya_' + prize.id, s, { 獎金: AW.fmtMoney(cash), 獎品: AW.pick(AW.txList('office', 'weiya_items')) }) });

      return {
        kind: 'office', title: AW.tx('office', 'title', s), pill: `職場戰力 ${Math.round(X)}`, stages,
        result: { kpi, grade: grade.g, pts: grade.pts, top, place, promo, tried, promoted, prize: prize.id, cash, mood: prize.mood },
      };
    },

    // 升遷答辯：三關各一局，過兩關才升遷
    defense(s, target) {
      const rel = this.relStat(s);
      const st = s.stats;
      const D = DEFENSE.base + target * DEFENSE.step;
      const clutch = AW.traitOf(s).clutch || 0;
      const rounds = [
        ['def_tech', rel + (s.yearPerf || 0) * 2],
        ['def_boss', rel + (st.social - 50) / 5],
        ['def_exec', rel + (st.mood - 50) / 5],
      ];
      let w = 0;
      const matches = [];
      for (const [key, v] of rounds) {
        const p = AW.clamp(AW.logistic(v - D, DEFENSE.k) + clutch, 0.05, 0.97);
        const m = AW.playSeries(p, 1);
        Object.assign(m, { round: AW.tx('office', key, s), oppName: AW.tx('office', key + '_opp', s), opp: D });
        if (m.won) w++;
        matches.push(m);
        if (w >= 2 || matches.length - w >= 2) break;
      }
      const passed = w >= 2;
      return { name: AW.tx('office', 'stage_defense', s, { 職位: AW.Engineer.RANKS[target].name }), icon: '🎤', matches, passed,
        note: AW.tx('office', passed ? 'note_def_ok' : 'note_def_fail', s, { 職位: AW.Engineer.RANKS[target].name }) };
    },

    // 董事會投票：7 席逐票開出，過半當選；胡投顧好友度高時必投贊成
    boardVote(s) {
      const st = s.stats;
      const q = AW.clamp(BOARD.base + (st.leader - 78) / 60 + (st.social - 70) / 80, 0.25, BOARD.maxQ);
      const hu = AW.NPC.bond(s, 'hu') >= BOARD.huBond;
      const games = [];
      for (let i = 0; i < BOARD.seats; i++) games.push(hu && i === 0 ? true : AW.chance(q));
      const w = games.filter(Boolean).length;
      return { vote: true, round: AW.tx('office', 'board_round', s), oppName: AW.tx('office', hu ? 'board_opp_hu' : 'board_opp', s),
        opp: BOARD.seats, p: q, bo: BOARD.seats, games, w, l: BOARD.seats - w, won: w > BOARD.seats / 2 };
    },

    // ---------- 創業的一年 ----------
    runStartup(s) {
      const e = s.eng;
      const st = s.stats;
      const B = 0.4 * st.tech + 0.35 * st.leader + 0.25 * st.social + (s.yearSp || 0) * 3 + (s.flags.startupIdea ? 8 : 0)
        - e.startup * 7 - (st.health < AW.TIER.low ? 4 : 0);
      const goals = AW.shuffle(AW.txList('office', 'goals')).slice(0, 4);
      const market = STARTUP.base + e.startup * 7;
      const p = AW.clamp(AW.logistic(B - STARTUP.base, STARTUP.k), 0.03, 0.97);
      const matches = goals.map((g, i) => Object.assign(AW.playSeries(p, 1), { round: `Q${i + 1}`, oppName: g, opp: market }));
      const W = matches.filter((m) => m.won).length;
      const stages = [{ name: AW.tx('office', 'stage_quarters', s), icon: '📈', matches, passed: W >= 3,
        note: AW.tx('office', W >= 3 ? 'note_q_up' : W >= 1 ? 'note_q_hold' : 'note_q_bad', s, { 達標: W }) }];
      let result = W >= 3 ? 'up' : W >= 1 ? 'hold' : 'bad';
      if (result === 'up') {
        // 募資路演：拿到一份投資意向書即可
        const next = AW.Engineer.STARTUP[e.startup + 1];
        const vD = STARTUP.vcBase + e.startup * STARTUP.vcStep;
        const vp = AW.clamp(AW.logistic((st.social + st.leader) / 2 + st.fame / 4 - vD, STARTUP.vcK), 0.2, 0.95);
        const vcs = AW.shuffle(AW.txList('office', 'vcs')).slice(0, STARTUP.vcs);
        const ms = [];
        for (const v of vcs) {
          const m = Object.assign(AW.playSeries(vp, 1), { round: AW.tx('office', 'vc_round', s), oppName: v, opp: Math.round(vD) });
          ms.push(m);
          if (m.won) break;
        }
        const ok = ms.some((m) => m.won);
        if (!ok) result = 'hold';
        stages.push({ name: AW.tx('office', 'stage_roadshow', s, { 階段: next.name }), icon: '🎤', matches: ms, passed: ok,
          note: AW.tx('office', ok ? 'note_vc_ok' : 'note_vc_fail', s, { 階段: next.name }) });
      }
      return { kind: 'startup', title: AW.tx('office', 'title_startup', s), pill: `團隊實力 ${Math.round(B + e.startup * 7)}`, stages,
        result: { result, W, score: Math.round(B) } };
    },

    // ---------- 動畫播完後套用 ----------
    settle(s) {
      const season = s.season;
      if (!season) return;
      if (season.kind === 'office') this.settleJob(s, season.result);
      else if (season.kind === 'startup') this.settleStartup(s, season.result);
    },

    settleJob(s, r) {
      const e = s.eng;
      const E = AW.Engineer;
      e.promo = r.promo;
      e.lastGrade = r.grade;
      e.lastPlace = r.place;
      if (r.top) { e.tops = (e.tops || 0) + 1; s.counters.officeTop = (s.counters.officeTop || 0) + 1; s.flags.peerBeat = 0; }
      else s.flags.peerBeat = 1;
      for (const p of e.peers) p.skill += 1;
      // 答辯失敗點數減半；董事會落選點數歸零
      if (r.tried && !r.promoted) {
        e.promo = e.rank === 5 ? 0 : Math.floor(e.promo / 2);
        AW.Engine.note(s, e.rank === 5 ? '🗳️' : '🎤', AW.tx('office', e.rank === 5 ? 'msg_board_fail' : 'msg_def_fail', s));
      }
      if (r.promoted) {
        e.rank += 1;
        e.promo = 0;
        e.bestRank = Math.max(e.bestRank, e.rank);
        s.milestones.promotions += 1;
        AW.applyEffects(s, { mood: 10 });
        if (e.rank === 6) s.pendingEnding = 'tech_boss';
      }
      if (r.cash || r.mood) AW.applyEffects(s, { money: r.cash, mood: r.mood });
      if (r.prize === 'grand') s.flags.weiya = 1;
      s.review = { grade: r.grade, kpi: r.kpi, pts: r.pts, top: r.top, place: r.place, promo: e.promo, need: E.promoNeed(s),
        promoted: r.promoted, rank: e.rank, miss: E.missingReq(s, e.rank + 1) };
      AW.Engine.note(s, r.promoted ? '🎉' : '📋', `年度考績 ${r.grade}${r.top ? '（同期第一）' : ''}${r.promoted ? `，升任「${E.rankName(s)}」！` : ''}`);
    },

    settleStartup(s, r) {
      const e = s.eng;
      const E = AW.Engineer;
      let result = r.result;
      if (result === 'up') {
        e.startup += 1;
        e.runway = 3;
        const st2 = E.STARTUP[e.startup];
        AW.applyEffects(s, { money: st2.bonus, mood: 10, fame: 4 });
        AW.Engine.note(s, st2.icon, `${e.startupName} 成功進入「${st2.name}」！`);
        if (e.startup >= 5) s.pendingEnding = 'tech_boss';
      } else {
        e.runway -= result === 'hold' ? 1 : 2;
        AW.applyEffects(s, { mood: result === 'bad' ? -10 : -3 });
        if (e.runway <= 0) {
          result = 'bankrupt';
          E.closeStartup(s);
        } else {
          AW.Engine.note(s, result === 'hold' ? '😐' : '📉', `${e.startupName} 今年${result === 'hold' ? '進展有限' : '遭遇挫折'}，資金跑道剩 ${e.runway} 年。`);
        }
      }
      s.review = { startup: true, score: r.score, W: r.W, result, stage: e.startup, runway: e.runway };
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
