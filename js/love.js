/* 感情：交往、好感度、求婚、結婚、分手；同時交往、另一半的個性（v2.0）
 * s.love = { name, type, status: dating/engaged/married/ex, since, marriedAt, endAge, exes: [] }
 * 好感度存在 s.stats.love（0～100）
 * s.flings = [{ name, love, since }]：同時交往的其他對象（被抓包會上演修羅場）
 * 類型名稱、說明在 js/data/texts.js 的 [love] type_代號_name／type_代號_desc
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  // 同時交往：人緣門檻、最多幾位、每年好感下降、被抓包機率（基礎 + 每位 + 已婚）
  const FLING = { social: 75, max: 2, decay: 8, catchBase: 0.05, catchEach: 0.15, catchMarried: 0.1 };
  // 好感度層級：熱戀（成長、擲骰加成）、穩定（每年心情加分）、冷淡（每年心情扣分）
  const TIERS = { passion: 80, steady: 50, cold: 30, passionGrowth: 0.05, passionRoll: 0.05, steadyMood: 4, marriedMood: 6, coldMood: -3 };
  // 打電動、運動類行動（電競迷、運動系另一半用來判斷）
  const PLAY_ACTS = ['solo_grind', 'scrim', 'review_vod', 'stream', 'uni_game', 'sm_live', 'sm_video', 'sm_collab', 'co_tactics'];
  const EXERCISE_ACTS = ['sports', 'gym', 'walk', 'crawl'];

  // 另一半的類型
  // dateActs: 這些行動也算約會；need(s): 沒做到每年好感度 -needPenalty；decay: 每年額外下降
  // income: 婚後每年貢獻的家庭收入；houseShare: 婚後買房頭期款由另一半負擔的比例；dowry: 結婚時娘家給的錢
  // ventureRunway: 創業時額外多的資金跑道；growth: 好感度 50 以上的成長加成；power: 好感度 50 以上的電競戰力加成
  const TYPES = {
    gamer: { dateActs: 'play', need: (s) => isPlaying(s), needPenalty: 3, income: 300000, houseShare: 0.3, power: 2 },
    scholar: { need: (s) => countPlay(s) < 2, needPenalty: 4, income: 300000, houseShare: 0.3, growth: { study: 0.1, tech: 0.1 } },
    career: { decay: 2, income: 800000, houseShare: 0.5, ventureRunway: 1 },
    sporty: { dateActs: 'exercise', need: (s) => s.yearActions.some((a) => EXERCISE_ACTS.includes(a)), needPenalty: 2, income: 300000, houseShare: 0.3, healthCare: 1 },
    rich: { need: (s) => !s.fin || s.fin.style >= 1 || AW.Finance.active(s) === false, needPenalty: 6, income: 0, houseShare: 1, dowry: 5000000 },
    jealous: { decay: 3, income: 300000, houseShare: 0.3, moodBonus: 4, catchBonus: 0.15, jealousEvents: 3 },
  };

  function isGameAct(id) {
    const a = AW.ACTION_MAP[id];
    return !!a && ((a.tags && a.tags.includes('game')) || PLAY_ACTS.includes(id));
  }
  function countPlay(s) { return s.yearActions.filter(isGameAct).length; }
  function isPlaying(s) { return countPlay(s) > 0; }

  const Love = (AW.Love = {
    ACTIVE: ['dating', 'engaged', 'married'],
    FLING, TIERS, TYPES,

    active(s) { return !!(s && s.love && this.ACTIVE.includes(s.love.status)); },
    married(s) { return this.active(s) && s.love.status === 'married'; },
    statusName(s) { return AW.tx('love', 'status_' + s.love.status, s); },
    // 目前另一半的類型設定（沒交往時是空物件）
    type(s) { return (this.active(s) && TYPES[s.love.type]) || {}; },
    typeName(s) { return this.active(s) && s.love.type ? AW.tx('love', 'type_' + s.love.type + '_name', s) : ''; },
    pickType() { return AW.pick(Object.keys(TYPES)); },
    // 好感度層級：passion / steady / cold / 空字串
    tier(s) {
      if (!this.active(s)) return '';
      const v = s.stats.love;
      return v >= TIERS.passion ? 'passion' : v >= TIERS.steady ? 'steady' : v < TIERS.cold ? 'cold' : '';
    },

    // 沒用過的名字（前任、現任、新歡都排除）
    freshName(s) {
      const used = ((s.love && s.love.exes) || []).concat(s.love && this.active(s) ? [s.love.name] : [], (s.flings || []).map((f) => f.name));
      const names = AW.txList('love', 'names');
      const pool = names.filter((n) => !used.includes(n));
      return AW.pick(pool.length ? pool : names.length ? names : ['她']);
    },

    start(s) {
      if (this.active(s)) return {};
      const exes = (s.love && s.love.exes) || [];
      const names = AW.txList('love', 'names');
      const pool = names.filter((n) => !exes.includes(n) && !(s.flings || []).some((f) => f.name === n));
      const name = AW.pick(pool.length ? pool : names.length ? names : ['她']);
      s.love = { name, type: this.pickType(), status: 'dating', since: s.age, exes };
      s.stats.love = 50;
      s.flags.girlfriend = 1;
      return { text: AW.tx('love', 'start', s, { 類型: this.typeName(s) }), deltas: { love: 50 } };
    },

    engage(s) {
      if (!this.active(s)) return {};
      s.love.status = 'engaged';
      return { text: AW.tx('love', 'engage', s) };
    },

    marry(s) {
      if (!this.active(s)) return {};
      s.love.status = 'married';
      s.love.marriedAt = s.age;
      let text = AW.tx('love', 'marry', s);
      const dowry = this.type(s).dowry;
      if (dowry) {
        AW.applyEffects(s, { money: dowry });
        text += ' ' + AW.tx('love', 'msg_dowry', s, { 金額: AW.fmtMoney(dowry) });
      }
      return { text };
    },

    breakup(s) {
      if (!this.active(s)) return {};
      const married = s.love.status === 'married';
      let text = AW.tx('love', married ? 'divorce' : 'breakup', s);
      const lost = s.stats.love;
      const deltas = lost ? { love: -lost } : {};
      // 離婚：財產分一半（現金與投資）
      if (married) {
        const half = Math.max(0, Math.round(s.stats.money / 2));
        let inv = 0;
        for (const id of Object.keys((s.fin && s.fin.inv) || {})) { const v = Math.round(s.fin.inv[id] / 2); s.fin.inv[id] -= v; inv += v; }
        if (half) AW.mergeDeltas(deltas, AW.applyEffects(s, { money: -half }));
        if (half + inv) text += ' ' + AW.tx('love', 'msg_split', s, { 金額: AW.fmtMoney(half + inv) });
      }
      s.love.exes = (s.love.exes || []).concat(s.love.name);
      s.love.status = 'ex';
      s.love.endAge = s.age;
      s.stats.love = 0;
      s.flags.brokeUp = (s.flags.brokeUp || 0) + 1;
      return { text, deltas };
    },

    // 這一年算不算有約會（電競迷：打電動也算；運動系：運動也算）
    dated(s) {
      if (s.yearActions.includes('date')) return true;
      const t = this.type(s);
      if (t.dateActs === 'play') return isPlaying(s);
      if (t.dateActs === 'exercise') return s.yearActions.some((a) => EXERCISE_ACTS.includes(a));
      return false;
    },

    // 年末：沒約會的話好感度下降；依類型有額外的要求；依好感度層級影響心情
    yearEnd(s) {
      if (!this.active(s)) return;
      const married = s.love.status === 'married';
      const t = this.type(s);
      const dated = this.dated(s);
      const low = s.stats.mood < AW.TIER.low ? 3 : 0;
      // 老夫老妻感情比較穩定
      const decay = married && s.age >= 50 ? -1 : dated ? (married ? -1 : -2) : (married ? -4 : -6);
      const unmet = t.need && !t.need(s);
      if (unmet) AW.Engine.note(s, '💢', AW.tx('love', 'need_' + s.love.type, s));
      const extra = (t.decay || 0) + (unmet ? t.needPenalty : 0);
      AW.applyEffects(s, { love: decay - low - extra });
      const tier = this.tier(s);
      if (tier === 'passion' || tier === 'steady') AW.applyEffects(s, { mood: (married ? TIERS.marriedMood : TIERS.steadyMood) + (t.moodBonus || 0) });
      else if (tier === 'cold') AW.applyEffects(s, { mood: TIERS.coldMood });
      this.flingYear(s);
    },

    // ---------- 其他系統查詢用 ----------
    // 成長加成：熱戀 +5%；學霸另一半（好感度 50 以上）學力、技術力 +10%
    growthBonus(s, key) {
      if (!this.active(s)) return 0;
      let v = this.tier(s) === 'passion' ? TIERS.passionGrowth : 0;
      const g = this.type(s).growth;
      if (g && g[key] && s.stats.love >= TIERS.steady) v += g[key];
      return v;
    },
    rollBonus(s) { return this.tier(s) === 'passion' ? TIERS.passionRoll : 0; },
    // 電競：電競迷另一半在場邊應援；好感度 70 以上，關鍵賽另一半到場
    esportsPower(s) { return this.active(s) && s.stats.love >= TIERS.steady ? this.type(s).power || 0 : 0; },
    cheerClutch(s) { return this.active(s) && s.stats.love >= 70 ? 0.03 : 0; },
    // 運動系另一半：每年的年齡健康衰退 -1
    healthCare(s) { return this.active(s) && s.stats.love >= TIERS.steady ? this.type(s).healthCare || 0 : 0; },
    // 婚後的家庭收入
    partnerIncome(s) { return this.married(s) ? this.type(s).income || 0 : 0; },
    // 婚後買房：另一半負擔的頭期款比例
    houseShare(s) { return this.married(s) || (this.active(s) && s.love.status === 'engaged') ? this.type(s).houseShare || 0 : 0; },
    // 辭職創業：另一半支持（好感度 60 以上）資金跑道 +1（女強人再 +1），反對的話好感度 -10
    ventureSupport(s) {
      if (!this.active(s)) return { runway: 0 };
      if (s.stats.love >= 60) {
        const runway = 1 + (this.type(s).ventureRunway || 0);
        return { runway, text: AW.tx('love', 'msg_support', s, { 年數: runway }) };
      }
      AW.applyEffects(s, { love: -10 });
      return { runway: 0, text: AW.tx('love', 'msg_oppose', s) };
    },

    // ---------- 同時交往（v2.0） ----------
    canTempt(s) { return this.active(s) && s.stats.social >= FLING.social && s.flings.length < FLING.max; },
    addFling(s) {
      const name = this.freshName(s);
      s.flings.push({ name, love: 50, since: s.age });
      s.flags.flinged = 1;
      if (s.flings.length >= 2) s.flags.timeMaster = 1;
      return { text: AW.tx('love', 'fling_start', s) };
    },
    flingYear(s) {
      if (!s.flings.length) return;
      if (!this.active(s)) { s.flings = []; return; }
      const dated = s.yearActions.includes('date_fling');
      for (const f of s.flings) f.love -= dated ? 0 : FLING.decay;
      const gone = s.flings.filter((f) => f.love <= 0);
      for (const f of gone) AW.Engine.note(s, '💨', AW.tx('love', 'fling_leave', s, { 新歡: f.name }));
      s.flings = s.flings.filter((f) => f.love > 0);
      const p = FLING.catchBase + FLING.catchEach * s.flings.length + (s.love.status === 'married' ? FLING.catchMarried : 0)
        + s.stats.fame / 400 + (this.type(s).catchBonus || 0);
      if (s.flings.length && AW.chance(p)) s.flags.shuraPending = 1;
    },
    // 修羅場的結局
    shuraEnd(s, how) {
      s.flags.shura = 1;
      s.flags.shuraPending = 0;
      const flings = s.flings;
      s.flings = [];
      if (how === 'keep') { AW.applyEffects(s, { love: -25 }); return {}; }
      if (how === 'swap' && flings.length) {
        const f = flings[flings.length - 1];
        const r = this.breakup(s);
        s.love = { name: f.name, type: this.pickType(), status: 'dating', since: f.since, exes: s.love.exes };
        s.stats.love = Math.max(30, f.love);
        return { text: r.text, deltas: r.deltas };
      }
      return this.breakup(s);
    },
    dateFlings(s) {
      for (const f of s.flings) f.love = Math.min(100, f.love + 15);
      return { text: '' };
    },

    // 結局畫面用的一行描述
    endingLine(s) {
      if (!this.active(s)) return '';
      if (s.love.status === 'married') return AW.tx('love', 'ending_married', s, { 年數: Math.max(1, s.age - s.love.marriedAt) });
      return AW.tx('love', 'ending_dating', s);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
