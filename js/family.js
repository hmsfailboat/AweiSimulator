/* 家庭（v2.0）：子女、孫子
 * s.kids = [{ name, born: 出生時阿維的年齡, married, pro, games }]；s.grandkids = 孫子數
 * 名字、訊息在 js/data/texts.js 的 [family]
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const KIDS = { max: 3, cost: 150000, costUntil: 22, proAge: 18, proBase: 0.08, proPerGame: 0.05, grandAge: 28, grandChance: 0.25, grandMax: 6 };

  const Family = (AW.Family = {
    KIDS,
    age(s, k) { return s.age - k.born; },
    canHaveKid(s) {
      return AW.Love.active(s) && s.love.status === 'married' && s.age >= 24 && s.age <= 45 && s.kids.length < KIDS.max
        && (!s.kids.length || s.age - s.kids[s.kids.length - 1].born >= 2);
    },
    addKid(s) {
      const used = s.kids.map((k) => k.name);
      const pool = AW.txList('family', 'kid_names').filter((n) => !used.includes(n));
      const name = AW.pick(pool.length ? pool : ['小寶']);
      s.kids.push({ name, born: s.age, married: false, pro: false, games: 0 });
      AW.Engine.checkAchievements(s);
      return { text: AW.tx('family', 'born', s, { 名字: name }) };
    },
    // 還沒獨立的孩子，每年的養育費
    upkeep(s) { return s.kids.filter((k) => this.age(s, k) < KIDS.costUntil).length * KIDS.cost; },
    // 陪孩子打電動：長大後比較可能成為職業選手
    playWithKids(s) {
      for (const k of s.kids) if (this.age(s, k) >= 5 && this.age(s, k) < 18) k.games += 1;
    },
    yearEnd(s) {
      for (const k of s.kids) {
        const a = this.age(s, k);
        if (a === KIDS.proAge && !k.proRolled) {
          k.proRolled = true;
          if (AW.chance(KIDS.proBase + KIDS.proPerGame * k.games)) {
            k.pro = true;
            s.flags.tigerSon = 1;
            AW.Engine.note(s, '🎮', AW.tx('family', 'kid_pro', s, { 名字: k.name }));
          }
        }
        if (k.married && a >= KIDS.grandAge && s.grandkids < KIDS.grandMax && AW.chance(KIDS.grandChance)) {
          s.grandkids += 1;
          AW.applyEffects(s, { mood: 8 });
          AW.Engine.note(s, '👶', AW.tx('family', 'grandkid', s, { 名字: k.name, 孫子: s.grandkids }));
        }
      }
    },
    // 可以結婚的孩子（事件用）
    marriageable(s) { return s.kids.find((k) => !k.married && this.age(s, k) >= 26) || null; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
