/* 工程師職涯：大學、求職、升遷、創業（每年的職場賽季在 office.js） */
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
    { name: '執行長', salary: 10000000, req: { leader: 78, social: 70 } },
  ];
  const PROMO_NEED = [2, 3, 4, 6, 8, 8];
  // 畢業求職時，KE 好友度達到這個值會幫你內推科技大廠
  const KE_REFERRAL = 50;
  const STARTUP = [
    { name: '車庫創業', icon: '🚗', bonus: 0 },
    { name: '種子輪', icon: '🌱', bonus: 500000 },
    { name: 'A 輪', icon: '🅰️', bonus: 1500000 },
    { name: 'B 輪', icon: '🅱️', bonus: 3000000 },
    { name: 'C 輪', icon: '📊', bonus: 6000000 },
    { name: 'IPO 上市', icon: '🔔', bonus: 50000000 },
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
      // KE 好友度夠高：內推台極半導體（科技大廠）
      const referral = score < 65 && AW.NPC.bond(s, 'ke') >= KE_REFERRAL;
      if (score >= 65 || referral) tiers.push(2);
      const options = tiers.reverse().map((t) => {
        const name = t === 2 && referral ? '台極半導體' : AW.pick(COMPANY_NAMES[t]);
        const c = COMPANY[t];
        return {
          label: `${c.icon} ${name}（${c.name}）${t === 2 && referral ? AW.tx('npc.ke', 'referral_tag') : ''}`,
          desc: `起薪 ${AW.fmtMoney(RANKS[0].salary * c.mult)}／年，升遷速度${c.speed < 1 ? '快' : c.speed > 1 ? '慢' : '普通'}`,
          apply: (st) => {
            st.eng.stage = 'job';
            st.eng.company = t;
            st.eng.companyName = name;
            st.eng.rank = 0;
            st.eng.promo = 0;
            AW.Office.makePeers(st);
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
        AW.Office.makePeers(s);
        AW.applyEffects(s, { mood: 6, money: Math.round(this.salary(s) * 0.15) });
        return { text: `跳槽到 ${e.companyName}（${COMPANY[e.company].name}），簽約金入袋！升遷點數重新累計。` };
      }
      e.companyName = AW.pick(COMPANY_NAMES[2].filter((n) => n !== e.companyName));
      e.promo += 1;
      AW.applyEffects(s, { mood: 6, money: Math.round(this.salary(s) * 0.2) });
      return { text: `跳槽到 ${e.companyName}，薪水大漲，升遷點數 +1。` };
    },

    startStartup(s) {
      const e = s.eng;
      AW.applyEffects(s, { money: -3000000, mood: 10 });
      e.stage = 'startup';
      e.startup = 0;
      e.runway = 3;
      e.startupName = AW.pick(STARTUP_NAMES);
      s.flags.founded = (s.flags.founded || 0) + 1;
      const sup = AW.Love.ventureSupport(s);
      e.runway += sup.runway;
      return { text: `成立「${e.startupName}」！投入 300 萬資金。${sup.text ? ' ' + sup.text : ''}`, deltas: { money: -3000000 } };
    },

    // 創業倒閉：回到職場，職級 -1
    closeStartup(s) {
      const e = s.eng;
      s.flags.bankrupt = (s.flags.bankrupt || 0) + 1;
      e.stage = 'job';
      e.rank = Math.max(1, e.rank - 1);
      e.company = AW.randInt(0, 1);
      e.companyName = AW.pick(COMPANY_NAMES[e.company]);
      e.promo = 0;
      AW.Office.makePeers(s);
      AW.applyEffects(s, { mood: -20 });
      AW.Engine.note(s, '💥', `${e.startupName} 資金燒光，宣告倒閉……回到職場，加入 ${e.companyName} 擔任${this.rankName(s)}。`);
    },

    yearEnd(s) {
      const e = s.eng;
      AW.Office.settle(s);
      if (e.stage === 'job') AW.Finance.earn(s, this.salary(s));
      if (e.stage === 'startup') AW.Finance.earn(s, 300000);
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
