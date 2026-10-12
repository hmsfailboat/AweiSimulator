/* 工程師職涯：大學、求職、考績升遷、創業 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const COMPANY = [
    { name: '新創小公司', icon: '🏠', mult: 0.8, speed: 0.8 },
    { name: '中型軟體公司', icon: '🏬', mult: 1, speed: 1 },
    { name: '科技大廠', icon: '🏙️', mult: 1.5, speed: 1.25 },
  ];
  const COMPANY_NAMES = [
    ['阿貓科技', '小蝸牛軟體', '泡麵工作室', '車庫實驗室', '豆漿數位'],
    ['群星資訊', '藍海軟體', '聯合雲端', '島嶼數據', '晨曦科技'],
    ['宏奇電子', '巨鷹科技', 'Taipei Silicon', '台極半導體', 'Formosa Cloud'],
  ];
  const STARTUP_NAMES = ['AweiTech', 'GG Labs', 'Headshot AI', 'Last Hit 數位', 'Respawn 科技', 'One More Game 公司'];
  const RANKS = [
    { name: '初級工程師', salary: 600000, req: {} },
    { name: '工程師', salary: 900000, req: { tech: 45 } },
    { name: '資深工程師', salary: 1400000, req: { tech: 60 } },
    { name: '技術主管', salary: 2000000, req: { tech: 65, leader: 45 } },
    { name: '部門總監', salary: 3200000, req: { leader: 60, social: 50 } },
    { name: '副總裁', salary: 5000000, req: { leader: 72, social: 62 } },
    { name: '執行長', salary: 10000000, req: { leader: 80, social: 70 } },
  ];
  const PROMO_NEED = [2, 3, 4, 6, 8, 10];
  const STARTUP = [
    { name: '車庫創業', icon: '🚗', bonus: 0 },
    { name: '種子輪', icon: '🌱', bonus: 500000 },
    { name: 'A 輪', icon: '🅰️', bonus: 1500000 },
    { name: 'B 輪', icon: '🅱️', bonus: 3000000 },
    { name: 'C 輪', icon: '📊', bonus: 6000000 },
    { name: 'IPO 上市', icon: '🔔', bonus: 50000000 },
  ];
  const GRADES = [
    { g: 'S', min: 75, pts: 3 }, { g: 'A', min: 60, pts: 2 }, { g: 'B', min: 45, pts: 1 },
    { g: 'C', min: 30, pts: 0 }, { g: 'D', min: -999, pts: -1 },
  ];

  const Engineer = (AW.Engineer = {
    COMPANY, RANKS, STARTUP, PROMO_NEED,
    rankName(s) { return RANKS[s.eng.rank].name; },
    salary(s) { return Math.round(RANKS[s.eng.rank].salary * COMPANY[s.eng.company].mult); },
    promoNeed(s) { return Math.ceil(PROMO_NEED[Math.min(s.eng.rank, PROMO_NEED.length - 1)] * COMPANY[s.eng.company].speed); },
    missingReq(s, rank) {
      const r = RANKS[rank];
      if (!r) return ['已達最高職級'];
      const miss = Object.keys(r.req).filter((k) => s.stats[k] < r.req[k]).map((k) => `${AW.STATS[k].name} ${r.req[k]}`);
      if (rank === 6 && s.eng.company < 1) miss.push('公司規模需為中型以上');
      return miss;
    },

    start(s, topUni) {
      s.eng = { stage: 'uni', topUni, interns: 0, company: 0, companyName: '', rank: 0, promo: 0,
        startup: 0, startupName: '', runway: 0, bestRank: 0, lastGrade: null };
      s.stats.tech = Math.max(s.stats.tech, Math.round(s.stats.study * 0.4) + (s.flags.coder ? 6 : 0));
      s.stats.leader = Math.max(s.stats.leader, Math.round(s.stats.social * 0.3));
    },

    onNewYear(s) {
      if (s.eng.stage === 'uni' && s.age >= 22) {
        s.decision = this.jobOffers(s);
        s.step = 'decision';
      }
      return false;
    },

    jobOffers(s) {
      const score = s.stats.tech + s.stats.study * 0.3 + s.eng.interns * 8 + (s.eng.topUni ? 10 : 0) + s.stats.social * 0.1 + AW.randInt(-5, 5);
      const tiers = [0];
      if (score >= 45) tiers.push(1);
      if (score >= 65) tiers.push(2);
      const options = tiers.reverse().map((t) => {
        const name = AW.pick(COMPANY_NAMES[t]);
        const c = COMPANY[t];
        return {
          label: `${c.icon} ${name}（${c.name}）`,
          desc: `起薪 ${AW.fmtMoney(RANKS[0].salary * c.mult)}／年，升遷速度${c.speed < 1 ? '快' : c.speed > 1 ? '慢' : '普通'}`,
          apply: (st) => {
            st.eng.stage = 'job';
            st.eng.company = t;
            st.eng.companyName = name;
            st.eng.rank = 0;
            st.eng.promo = 0;
            return { text: `畢業了！加入 ${name} 成為初級工程師。` };
          },
        };
      });
      return { type: 'job', icon: '🎓', title: '畢業求職',
        text: `大學畢業了！履歷評分 ${Math.round(score)}，收到 ${options.length} 份工作邀約，選一間吧。`, options };
    },

    jobHop(s) {
      const e = s.eng;
      if (e.company < 2) {
        e.company += 1;
        e.companyName = AW.pick(COMPANY_NAMES[e.company]);
        e.promo = 0;
        AW.applyEffects(s, { mood: 6, money: Math.round(this.salary(s) * 0.15) });
        return { text: `跳槽到 ${e.companyName}（${COMPANY[e.company].name}），簽約金入袋！升遷點數重新累計。` };
      }
      e.companyName = AW.pick(COMPANY_NAMES[2].filter((n) => n !== e.companyName));
      e.promo += 1;
      AW.applyEffects(s, { mood: 6, money: Math.round(this.salary(s) * 0.2) });
      return { text: `跳槽到 ${e.companyName}，薪水大漲，升遷點數 +1。` };
    },

    review(s) {
      const e = s.eng;
      const st = s.stats;
      const rel = e.rank <= 2 ? st.tech
        : e.rank === 3 ? (st.tech + st.leader) / 2
        : st.leader * 0.5 + st.social * 0.3 + st.tech * 0.2;
      const steady = AW.traitOf(s).clutch ? 0.6 : 1;
      const score = rel - e.rank * 6 + s.yearPerf * 4 + (st.mood - 50) / 5 + AW.randInt(-12, 12) * steady;
      const grade = GRADES.find((g) => score >= g.min);
      e.promo = Math.max(0, e.promo + grade.pts);
      e.lastGrade = grade.g;
      const need = this.promoNeed(s);
      const miss = this.missingReq(s, e.rank + 1);
      let promoted = false;
      let board = null;
      if (e.rank === 5 && e.promo >= need && !miss.length) {
        // 執行長由董事會投票
        board = AW.chance(0.5);
        if (!board) {
          e.promo = Math.floor(e.promo / 2);
          AW.Engine.note(s, '🗳️', '董事會這次選擇了外部空降的執行長……再接再厲。');
        }
      }
      if (e.rank < 6 && e.promo >= need && !miss.length && board !== false) {
        e.rank += 1;
        e.promo = 0;
        e.bestRank = Math.max(e.bestRank, e.rank);
        s.milestones.promotions += 1;
        promoted = true;
        AW.applyEffects(s, { mood: 10 });
        if (e.rank === 6) s.pendingEnding = 'tech_boss';
      }
      const r = { grade: grade.g, score: Math.round(score), pts: grade.pts, promo: e.promo, need: this.promoNeed(s), promoted, board,
        rank: e.rank, miss: promoted ? this.missingReq(s, e.rank + 1) : miss };
      AW.Engine.note(s, promoted ? '🎉' : '📋', `年度考績 ${grade.g}${promoted ? `，升任「${this.rankName(s)}」！` : ''}`);
      return r;
    },

    startStartup(s) {
      const e = s.eng;
      AW.applyEffects(s, { money: -3000000, mood: 10 });
      e.stage = 'startup';
      e.startup = 0;
      e.runway = 3;
      e.startupName = AW.pick(STARTUP_NAMES);
      s.flags.founded = (s.flags.founded || 0) + 1;
      return { text: `成立「${e.startupName}」！投入 300 萬資金。`, deltas: { money: -3000000 } };
    },

    startupYear(s) {
      const e = s.eng;
      const st = s.stats;
      const score = 0.4 * st.tech + 0.35 * st.leader + 0.25 * st.social + s.yearSp * 3 + (s.flags.startupIdea ? 8 : 0)
        + AW.randInt(-15, 15) - e.startup * 7;
      let result;
      if (score >= 58) {
        e.startup += 1;
        e.runway = 3;
        const st2 = STARTUP[e.startup];
        AW.applyEffects(s, { money: st2.bonus, mood: 10, fame: 4 });
        result = 'up';
        AW.Engine.note(s, st2.icon, `${e.startupName} 成功進入「${st2.name}」！`);
        if (e.startup >= 5) s.pendingEnding = 'tech_boss';
      } else {
        e.runway -= score >= 38 ? 1 : 2;
        result = score >= 38 ? 'hold' : 'bad';
        AW.applyEffects(s, { mood: result === 'bad' ? -10 : -3 });
        if (e.runway <= 0) {
          result = 'bankrupt';
          s.flags.bankrupt = (s.flags.bankrupt || 0) + 1;
          e.stage = 'job';
          e.rank = Math.max(1, e.rank - 1);
          e.company = AW.randInt(0, 1);
          e.companyName = AW.pick(COMPANY_NAMES[e.company]);
          e.promo = 0;
          AW.applyEffects(s, { mood: -20 });
          AW.Engine.note(s, '💥', `${e.startupName} 資金燒光，宣告倒閉……回到職場，加入 ${e.companyName} 擔任${this.rankName(s)}。`);
        } else {
          AW.Engine.note(s, result === 'hold' ? '😐' : '📉', `${e.startupName} 今年${result === 'hold' ? '進展有限' : '遭遇挫折'}，資金跑道剩 ${e.runway} 年。`);
        }
      }
      return { startup: true, score: Math.round(score), result, stage: e.startup, runway: e.runway };
    },

    yearEnd(s) {
      const e = s.eng;
      if (e.stage === 'job') AW.applyEffects(s, { money: this.salary(s) });
      if (e.stage === 'startup') AW.applyEffects(s, { money: 300000 });
      if (!s.pendingEnding && s.age >= 55) {
        s.pendingEnding = this.endingFor(s);
        AW.Engine.note(s, '🌅', '55 歲，光榮退休。');
      }
    },

    canRetire(s) { return s.phase === 'engineer' && s.eng.stage !== 'uni' && s.age >= 45; },

    endingFor(s) {
      const e = s.eng;
      if (e.rank >= 6 || e.startup >= 5) return 'tech_boss';
      if (s.flags.bankrupt && e.rank < 4) return 'startup_fail';
      if (e.rank >= 3) return 'director';
      return 'senior_eng';
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
