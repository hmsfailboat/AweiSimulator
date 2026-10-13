/* 道具商店與賭場 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const fail = (reason, hidden) => ({ ok: false, reason, hidden: !!hidden });

  // ======================= 道具商店 =======================
  const Shop = (AW.Shop = {
    TYPE_ORDER: ['gear', 'use', 'slot', 'charm', 'gift'],

    // 只有在年度事件、行動、結算時能逛商店
    open(s) { return !!s && s.phase !== 'ended' && ['event', 'action', 'summary'].includes(s.step); },
    items(s) { return s.items || (s.items = {}); },
    owned(s, id) { return !!this.items(s)[id]; },
    price(s, it) { return AW.val(it.price, s); },
    // 實際要付的錢（房子只付頭期款）
    cost(s, it) { const p = this.price(s, it); return it.loan ? Math.round(p * it.loan.down) : p; },

    state(s, it) {
      if (it.stages && !it.stages.includes(AW.Engine.stageKey(s))) return fail('', true);
      if (it.maxAge != null && s.age > it.maxAge) return fail('', true);
      if (it.type === 'gift' && !AW.Love.active(s)) return fail('', true);
      if (it.need && !it.need(s)) return fail('', true);
      if (it.minAge && s.age < it.minAge - 3) return fail('', true); // 太久以後才能買的先不顯示
      if (it.type === 'gear' && this.owned(s, it.id)) return { ok: false, owned: true, reason: '已擁有' };
      if (it.minAge && s.age < it.minAge) return fail(`${it.minAge} 歲解鎖`);
      if (it.tags && it.tags.includes('game') && s.yearFlags.noGame) return fail('今年被禁止打電動');
      if (it.type === 'charm' && (this.items(s).charm || 0) >= 3) return fail('最多持有 3 個');
      if (it.type === 'slot') {
        if (s.yearFlags.extraSlot) return fail('今年已經用過了');
        if (s.step === 'summary') return fail('今年的行動已經結束');
      }
      if ((it.type === 'use' || it.type === 'gift') && s.yearFlags['buy_' + it.id]) return fail('今年已經買過了');
      const lock = it.lock && it.lock(s);
      if (lock) return fail(lock);
      const p = this.cost(s, it);
      if (s.stats.money < p) return fail(`需要 ${AW.fmtMoney(p)}`);
      return { ok: true };
    },

    list(s) {
      return AW.ITEMS.map((it) => Object.assign({ it }, this.state(s, it))).filter((x) => !x.hidden);
    },

    buy(s, id) {
      const it = AW.ITEM_MAP[id];
      if (!it || !this.open(s) || !this.state(s, it).ok) return null;
      const p = this.cost(s, it);
      const deltas = AW.applyEffects(s, { money: -p });
      s.counters.spent = (s.counters.spent || 0) + p;
      if (it.loan) AW.Finance.addLoan(s, it.id, this.price(s, it) - p, it.loan.rate, it.loan.years);
      const items = this.items(s);
      if (it.type === 'gear') { items[it.id] = 1; s.itemSince[it.id] = s.age; }
      else if (it.type === 'charm') items.charm = (items.charm || 0) + 1;
      else if (it.type === 'slot') s.yearFlags.extraSlot = 1;
      else s.yearFlags['buy_' + it.id] = 1;
      if (it.cure) { delete s.flags[it.cure]; s.counters.lowHealth = 0; }
      if (it.effects) AW.mergeDeltas(deltas, AW.applyEffects(s, this.scaled(it.effects, this.tolerance(s, it))));
      AW.Engine.addLog(s, it.icon, `購買「${it.name}」（${AW.fmtMoney(p)}）`);
      AW.Engine.checkVitals(s, true);
      AW.Engine.checkAchievements(s);
      AW.Save.save(s);
      return { it, deltas };
    },

    // 裝備加成：sum(growth[key]) / sum(drain[key])
    bonus(s, field, key) {
      let v = 0;
      if (!s.items) return v;
      for (const id of Object.keys(s.items)) {
        const it = AW.ITEM_MAP[id];
        if (it && it.type === 'gear' && it[field] && it[field][key]) v += it[field][key];
      }
      return v;
    },

    // 耐受性：連續每年購買，效果遞減
    tolerance(s, it) {
      if (!it.tolerance) return 1;
      const last = s.itemUse[it.id];
      const n = last && last.age === s.age - 1 ? last.n + 1 : 0;
      s.itemUse[it.id] = { age: s.age, n };
      return Math.pow(it.tolerance, n);
    },
    scaled(eff, k) {
      if (k === 1) return eff;
      const out = {};
      for (const key of Object.keys(eff)) out[key] = eff[key] * k;
      return out;
    },
    // 享樂適應：每年效果減半，太小就沒感覺了
    adaptMult(s, it) {
      if (!it.adapt) return 1;
      const since = s.itemSince[it.id] != null ? s.itemSince[it.id] : s.age;
      const k = Math.pow(0.5, Math.max(0, s.age - since));
      return k < 0.2 ? 0 : k;
    },

    // 變賣：拿回部分價錢，房子要先還清房貸
    sellValue(s, id) {
      const it = AW.ITEM_MAP[id];
      if (!it || !it.sell || !this.owned(s, id)) return 0;
      return Math.round(this.price(s, it) * it.sell - (it.loan ? AW.Finance.loanLeft(s, id) : 0));
    },
    sell(s, id) {
      const it = AW.ITEM_MAP[id];
      if (!it || !this.owned(s, id)) return {};
      const v = this.sellValue(s, id);
      delete this.items(s)[id];
      if (it.loan) AW.Finance.dropLoans(s, id);
      AW.NPC.checkStaff(s);
      return AW.applyEffects(s, { money: v });
    },

    yearEnd(s) {
      for (const id of Object.keys(s.items || {})) {
        const it = AW.ITEM_MAP[id];
        if (!it || it.type !== 'gear' || !it.yearly) continue;
        const k = this.adaptMult(s, it);
        if (k) AW.applyEffects(s, this.scaled(it.yearly, k));
      }
    },
  });

  // ======================= 賭場 =======================
  const SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'];
  const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  const LOTTERY = { price: 1000, prizes: [
    { p: 1 / 50000, win: 20000000, name: '頭獎' },
    { p: 1 / 2000, win: 200000, name: '二獎' },
    { p: 1 / 200, win: 10000, name: '三獎' },
    { p: 1 / 10, win: 1000, name: '普獎' },
  ] };

  const Casino = (AW.Casino = {
    MIN_AGE: 18,
    MAX_PLAYS: 10,
    BETS: [1000, 10000, 100000, 1000000, 10000000],
    SYMBOLS, DICE, LOTTERY,

    plays(s) { return s.yearFlags.gamble || 0; },
    state(s) {
      if (!Shop.open(s)) return fail('現在不能去賭場');
      if (s.age < this.MIN_AGE) return fail(`${this.MIN_AGE} 歲才能進賭場`);
      if (s.flags.noGamble) return fail('你已經戒賭了');
      if (this.plays(s) >= this.MAX_PLAYS) return fail('今年玩夠了，保全請你明年再來');
      if (s.stats.money < 1000) return fail('身上的錢不夠下注');
      return { ok: true };
    },

    // game: dice（pick: big/small）、slots；bet: 金額或 'all'
    play(s, game, bet, pick) {
      if (!this.state(s).ok) return null;
      const money = s.stats.money;
      bet = bet === 'all' ? money : Math.round(Number(bet) || 0);
      if (bet < 1000 || bet > money) return null;
      let r;
      if (game === 'dice') {
        if (pick !== 'big' && pick !== 'small') return null;
        const dice = [AW.randInt(1, 6), AW.randInt(1, 6), AW.randInt(1, 6)];
        const sum = dice[0] + dice[1] + dice[2];
        const triple = dice[0] === dice[1] && dice[1] === dice[2];
        const big = sum >= 11;
        const won = !triple && (pick === 'big') === big;
        r = { game, pick, dice, sum, triple, big, net: won ? bet : -bet,
          label: `骰寶押${pick === 'big' ? '大' : '小'}`,
          text: triple ? `豹子 ${sum} 點，莊家通殺！` : `${sum} 點・${big ? '大' : '小'}` };
      } else if (game === 'slots') {
        const reels = [AW.randInt(0, 5), AW.randInt(0, 5), AW.randInt(0, 5)];
        const [a, b, c] = reels;
        let mult = 0;
        if (a === b && b === c) mult = a === 5 ? 30 : 8;
        else if (a === b || b === c || a === c) mult = 1.5;
        r = { game, reels: reels.map((i) => SYMBOLS[i]), mult, net: Math.round(bet * mult) - bet, label: '拉霸機',
          text: mult === 30 ? '7️⃣7️⃣7️⃣ 超級大獎！×30' : mult === 8 ? '三個相同！×8' : mult ? '兩個相同 ×1.5' : '什麼都沒中' };
      } else return null;
      r.bet = bet;
      return this.settle(s, r, money);
    },

    lottery(s, n) {
      n = n === 10 ? 10 : 1;
      const cost = LOTTERY.price * n;
      if (!this.state(s).ok || s.stats.money < cost) return null;
      const money = s.stats.money;
      let win = 0;
      const hits = {};
      for (let i = 0; i < n; i++) {
        const x = AW.rand();
        let acc = 0;
        for (const pz of LOTTERY.prizes) {
          acc += pz.p;
          if (x < acc) { win += pz.win; hits[pz.name] = (hits[pz.name] || 0) + 1; break; }
        }
      }
      if (hits['頭獎']) s.flags.jackpot = 1;
      const names = Object.keys(hits).map((k) => `${k}${hits[k] > 1 ? ` ×${hits[k]}` : ''}`);
      return this.settle(s, { game: 'lottery', bet: cost, tickets: n, net: win - cost, label: `彩券 ${n} 張`,
        text: names.length ? `中了 ${names.join('、')}，共 ${AW.fmtMoney(win)}！` : '一張都沒中……', jackpot: !!hits['頭獎'] }, money);
    },

    settle(s, r, before) {
      s.yearFlags.gamble = this.plays(s) + 1;
      s.counters.gamblePlays = (s.counters.gamblePlays || 0) + 1;
      s.counters.gambleNet = (s.counters.gambleNet || 0) + r.net;
      let mood = r.net > 0 ? 4 : r.net < 0 ? -3 : 0;
      if (r.net < 0 && -r.net >= before / 2 && -r.net >= 50000) mood = -12;
      r.deltas = AW.applyEffects(s, { money: r.net, mood });
      if (r.net >= 1000000) s.flags.bigWin = 1;
      AW.Engine.addLog(s, r.net > 0 ? '🤑' : '🎰', `${r.label}（${AW.fmtMoney(r.bet)}）— ${r.text}${r.net ? `（${r.net > 0 ? '+' : ''}${AW.fmtMoney(r.net)}）` : ''}`);
      AW.Engine.checkVitals(s, true);
      AW.Engine.checkAchievements(s);
      AW.Save.save(s);
      return r;
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
