/* 感情：交往、好感度、求婚、結婚、分手
 * s.love = { name, status: dating/engaged/married/ex, since, marriedAt, endAge, exes: [] }
 * 好感度存在 s.stats.love（0～100）
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const Love = (AW.Love = {
    ACTIVE: ['dating', 'engaged', 'married'],

    active(s) { return !!(s && s.love && this.ACTIVE.includes(s.love.status)); },
    statusName(s) { return AW.tx('love', 'status_' + s.love.status, s); },

    start(s) {
      if (this.active(s)) return {};
      const exes = (s.love && s.love.exes) || [];
      const names = AW.txList('love', 'names');
      const pool = names.filter((n) => !exes.includes(n));
      const name = AW.pick(pool.length ? pool : names.length ? names : ['她']);
      s.love = { name, status: 'dating', since: s.age, exes };
      s.stats.love = 50;
      s.flags.girlfriend = 1;
      return { text: AW.tx('love', 'start', s), deltas: { love: 50 } };
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
      return { text: AW.tx('love', 'marry', s) };
    },

    breakup(s) {
      if (!this.active(s)) return {};
      const text = AW.tx('love', s.love.status === 'married' ? 'divorce' : 'breakup', s);
      const lost = s.stats.love;
      s.love.exes = (s.love.exes || []).concat(s.love.name);
      s.love.status = 'ex';
      s.love.endAge = s.age;
      s.stats.love = 0;
      s.flags.brokeUp = (s.flags.brokeUp || 0) + 1;
      return { text, deltas: lost ? { love: -lost } : {} };
    },

    // 年末：沒約會的話好感度下降；感情好的話心情加分
    yearEnd(s) {
      if (!this.active(s)) return;
      const married = s.love.status === 'married';
      const dated = s.yearActions.includes('date');
      const low = s.stats.mood < AW.TIER.low ? 3 : 0;
      AW.applyEffects(s, { love: (dated ? (married ? -1 : -2) : (married ? -4 : -6)) - low });
      if (s.stats.love >= 60) AW.applyEffects(s, { mood: married ? 6 : 4 });
    },

    // 結局畫面用的一行描述
    endingLine(s) {
      if (!this.active(s)) return '';
      if (s.love.status === 'married') return AW.tx('love', 'ending_married', s, { 年數: Math.max(1, s.age - s.love.marriedAt) });
      return AW.tx('love', 'ending_dating', s);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
