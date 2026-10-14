/* 金錢：所得稅、生活水準、貸款、雇員薪水、投資、負債與破產
 * s.fin = { style, down, income, year, taxTotal, debtYears, inv: { 商品: 市值 }, cost: { 商品: 投入成本 }, realized: 已實現損益, loans: [{ id, left, pay }] }
 * 名稱與說明文字在 js/data/texts.js 的 [finance]
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  // 生活水準：每年花費、心情
  const STYLES = [
    { id: 'frugal', cost: 120000, mood: -1 },
    { id: 'comfy', cost: 360000, mood: 0 },
    { id: 'lux', cost: 1500000, mood: 3 },
    { id: 'royal', cost: 6000000, mood: 5 },
  ];
  // 簡化綜所稅：扣除額後依級距累進
  const TAX = { deduct: 420000, brackets: [[590000, 0.05], [1330000, 0.12], [2660000, 0.2], [4980000, 0.3], [Infinity, 0.4]] };
  // 投資商品：每年報酬率 = mean + sd × 常態亂數（最多虧 90%）
  const PRODUCTS = {
    deposit: { mean: 0.015, sd: 0 },
    etf: { mean: 0.07, sd: 0.15 },
    stock: { mean: 0.08, sd: 0.35 },
    crypto: { mean: 0.12, sd: 0.75 },
    hu: { mean: 0.12, sd: 0.22, need: (s) => AW.NPC.bond(s, 'hu') >= 60 },
  };
  const DEBT = { rate: 0.15, years: 3, minLimit: 5000000, incomeMult: 5, stress: 4 };
  const DOWN_YEARS = 2;
  const DOWN_MOOD = -4;
  const SHARK = { cash: 500000, pay: 300000, years: 3, max: 2 };

  const Finance = (AW.Finance = {
    STYLES, PRODUCTS, TAX, DEBT, SHARK,

    init(s) {
      s.fin = Object.assign({ style: 1, down: 0, income: 0, lastIncome: 0, year: null, taxTotal: 0, debtYears: 0, inv: {}, cost: {}, realized: 0, loans: [] }, s.fin || {});
      // 舊存檔沒有成本紀錄：以目前市值當作成本
      for (const id of Object.keys(s.fin.inv)) if (s.fin.cost[id] == null) s.fin.cost[id] = s.fin.inv[id];
      return s.fin;
    },

    // 出社會後才有生活費、稅金（大學生由家裡支付）
    active(s) {
      if (s.age < 18) return false;
      if (s.phase === 'esports' || s.phase === 'second') return true;
      return s.phase === 'engineer' && s.eng.stage !== 'uni';
    },
    canManage(s) { return s.age >= 18 && s.phase !== 'ended'; },

    // 職涯收入：入帳並計入年度所得
    earn(s, amount) {
      amount = Math.round(amount);
      if (!amount) return {};
      s.fin.income += amount;
      return AW.applyEffects(s, { money: amount });
    },

    tax(income) {
      let left = Math.max(0, income - TAX.deduct);
      let prev = 0;
      let t = 0;
      for (const [top, rate] of TAX.brackets) {
        const part = Math.min(left, top - prev);
        if (part <= 0) break;
        t += part * rate;
        left -= part;
        prev = top;
      }
      return Math.round(t);
    },

    hasHome(s) { return !!(s.items && (s.items.house || s.items.mansion)); },
    livingCost(s) {
      let c = STYLES[s.fin.style].cost;
      if (s.phase === 'esports') c *= 0.5; // 戰隊宿舍
      if (this.hasHome(s)) c *= 0.6;        // 不用付房租
      c += AW.Family.upkeep(s);              // 孩子的養育費
      return Math.round(c);
    },

    setStyle(s, i) {
      i = AW.clamp(Math.round(i), 0, STYLES.length - 1);
      const f = s.fin;
      if (i === f.style) return false;
      if (i < f.style) f.down = DOWN_YEARS;
      f.style = i;
      AW.Engine.addLog(s, '🏠', `生活水準改為「${AW.tx('finance', 'style_' + STYLES[i].id, s)}」`);
      AW.Save.save(s);
      return true;
    },

    // ---------- 貸款 ----------
    annuity(principal, rate, years) {
      if (!rate) return Math.round(principal / years);
      const k = Math.pow(1 + rate, years);
      return Math.round(principal * rate * k / (k - 1));
    },
    addLoan(s, id, principal, rate, years) {
      const pay = this.annuity(principal, rate, years);
      s.fin.loans.push({ id, left: years, pay, rate });
      return pay;
    },
    // 剩餘本金（提前還清要付的錢）
    loanLeft(s, id) {
      return Math.round(s.fin.loans.filter((l) => l.id === id).reduce((a, l) =>
        a + (l.rate ? l.pay * (1 - Math.pow(1 + l.rate, -l.left)) / l.rate : l.pay * l.left), 0));
    },
    dropLoans(s, id) { s.fin.loans = s.fin.loans.filter((l) => l.id !== id); },
    sharks(s) { return s.fin.loans.filter((l) => l.id === 'shark').length; },
    canShark(s) { return this.canManage(s) && this.sharks(s) < SHARK.max && AW.Shop.open(s); },
    borrowShark(s) {
      if (!this.canShark(s)) return null;
      s.fin.loans.push({ id: 'shark', left: SHARK.years, pay: SHARK.pay });
      const d = AW.applyEffects(s, { money: SHARK.cash });
      AW.Engine.addLog(s, '🦈', AW.tx('finance', 'shark_log', s));
      AW.Save.save(s);
      return d;
    },

    // ---------- 投資 ----------
    productOk(s, id) { const p = PRODUCTS[id]; return !!p && (!p.need || p.need(s)); },
    invested(s) { return Object.values(s.fin.inv).reduce((a, v) => a + v, 0); },
    investCost(s) { return Object.keys(s.fin.inv).reduce((a, id) => a + (s.fin.cost[id] || 0), 0); },
    netWorth(s) { return s.stats.money + this.invested(s); },
    // 單一商品的未實現損益 { v 市值, cost 成本, pl 損益, pct 報酬率 }
    position(s, id) {
      const v = s.fin.inv[id] || 0;
      const cost = s.fin.cost[id] || 0;
      return { v, cost, pl: v - cost, pct: cost ? (v - cost) / cost : 0 };
    },
    fmtPL(pl, pct) {
      return `${pl >= 0 ? '+' : '-'}${AW.fmtMoney(Math.abs(pl))}${pct != null ? `（${pct >= 0 ? '+' : ''}${(pct * 100).toFixed(1)}%）` : ''}`;
    },
    // 賣出一部分（依比例扣掉成本），回傳 { cash 拿回的錢, pl 實現損益 }
    sell(s, id, amount) {
      const f = s.fin;
      const v = f.inv[id] || 0;
      amount = Math.min(v, Math.max(0, Math.round(amount)));
      if (!amount) return { cash: 0, pl: 0 };
      const costPart = Math.round((f.cost[id] || 0) * amount / v);
      f.inv[id] = v - amount;
      f.cost[id] = (f.cost[id] || 0) - costPart;
      if (!f.inv[id]) { delete f.inv[id]; delete f.cost[id]; }
      const pl = amount - costPart;
      f.realized = (f.realized || 0) + pl;
      return { cash: amount, pl, pct: costPart ? pl / costPart : 0 };
    },
    invest(s, id, amount) {
      if (!this.canManage(s) || !AW.Shop.open(s) || !this.productOk(s, id)) return false;
      amount = amount === 'all' ? s.stats.money : Math.round(amount);
      if (amount <= 0 || amount > s.stats.money) return false;
      AW.applyEffects(s, { money: -amount });
      s.fin.inv[id] = (s.fin.inv[id] || 0) + amount;
      s.fin.cost[id] = (s.fin.cost[id] || 0) + amount;
      AW.Engine.addLog(s, '📈', `投入 ${AW.fmtMoney(amount)} 到「${AW.tx('finance', 'inv_' + id, s)}」（成本合計 ${AW.fmtMoney(s.fin.cost[id])}）`);
      AW.Save.save(s);
      return true;
    },
    withdraw(s, id) {
      const v = s.fin.inv[id] || 0;
      if (!v || !AW.Shop.open(s)) return false;
      const r = this.sell(s, id, v);
      AW.applyEffects(s, { money: r.cash });
      AW.Engine.addLog(s, r.pl >= 0 ? '💵' : '💸', `贖回「${AW.tx('finance', 'inv_' + id, s)}」${AW.fmtMoney(r.cash)}，實現損益 ${this.fmtPL(r.pl, r.pct)}`);
      AW.Save.save(s);
      return true;
    },
    liquidate(s) {
      let cash = 0;
      let pl = 0;
      for (const id of Object.keys(s.fin.inv)) { const r = this.sell(s, id, s.fin.inv[id]); cash += r.cash; pl += r.pl; }
      if (cash) {
        AW.applyEffects(s, { money: cash });
        AW.Engine.addLog(s, '💵', `投資全部換成現金 ${AW.fmtMoney(cash)}，實現損益 ${this.fmtPL(pl)}`);
      }
      s.fin.inv = {};
      s.fin.cost = {};
    },
    // 離婚：每項投資分走 frac（市值與成本按比例）
    splitShare(s, frac) {
      let out = 0;
      for (const id of Object.keys(s.fin.inv)) {
        const v = Math.round(s.fin.inv[id] * frac);
        s.fin.inv[id] -= v;
        s.fin.cost[id] = Math.round((s.fin.cost[id] || 0) * (1 - frac));
        out += v;
      }
      return out;
    },

    beginYear(s) { s.fin.income = 0; s.fin.year = null; },

    // ---------- 年末結算 ----------
    yearEnd(s) {
      const f = s.fin;
      const y = { income: f.income, lines: [], invest: 0 };
      const pay = (key, v, extra) => {
        v = Math.round(v);
        if (!v) return;
        AW.applyEffects(s, { money: -v });
        y.lines.push(Object.assign({ key, v: -v }, extra || {}));
      };

      // 投資損益（不分出社會與否），每項商品記在人生紀錄
      const parts = [];
      for (const id of Object.keys(f.inv)) {
        const p = PRODUCTS[id];
        if (!p) continue;
        const r = Math.max(-0.9, p.mean + p.sd * AW.randNormal());
        const g = Math.round(f.inv[id] * r);
        f.inv[id] += g;
        y.invest += g;
        const pos = this.position(s, id);
        parts.push(`${AW.tx('finance', 'inv_' + id, s)} ${g >= 0 ? '+' : '-'}${AW.fmtMoney(Math.abs(g))}（${r >= 0 ? '+' : ''}${(r * 100).toFixed(1)}%，累計 ${this.fmtPL(pos.pl, pos.pct)}）`);
      }
      if (parts.length) AW.Engine.addLog(s, y.invest >= 0 ? '📈' : '📉', `投資年度損益 ${y.invest >= 0 ? '+' : '-'}${AW.fmtMoney(Math.abs(y.invest))}：${parts.join('、')}`);
      if (y.invest >= 5000000) s.flags.bigInvest = 1;

      if (this.active(s)) {
        const tax = this.tax(f.income);
        if (tax) { pay('tax', tax); f.taxTotal += tax; }
        pay('living', this.livingCost(s));
        // 婚後雙薪
        const partner = AW.Love.partnerIncome(s);
        if (partner) { AW.applyEffects(s, { money: partner }); y.lines.push({ key: 'partner', v: partner }); }
        let mood = STYLES[f.style].mood;
        if (f.down > 0) { mood += DOWN_MOOD; f.down -= 1; }
        if (mood) AW.applyEffects(s, { mood });
      }
      // 裝備維護費
      let upkeep = 0;
      for (const id of Object.keys(s.items || {})) {
        const it = AW.ITEM_MAP[id];
        if (it && it.type === 'gear' && it.upkeep) upkeep += it.upkeep;
      }
      pay('upkeep', upkeep);
      // 雇員
      for (const id of Object.keys(s.staff || {})) {
        const st = AW.STAFF[id];
        if (!st) continue;
        pay('staff_' + id, st.salary);
        AW.applyEffects(s, st.yearly);
      }
      // 貸款
      for (const l of f.loans) {
        pay('loan_' + l.id, l.pay);
        l.left -= 1;
      }
      f.loans = f.loans.filter((l) => l.left > 0);

      // 現金不夠時，自動贖回投資補足（先賣報酬最穩的）
      if (s.stats.money < 0 && this.invested(s)) {
        let need = -s.stats.money;
        let sold = 0;
        let pl = 0;
        for (const id of Object.keys(PRODUCTS)) {
          const v = f.inv[id] || 0;
          if (!v || need <= 0) continue;
          const r = this.sell(s, id, Math.min(v, need));
          need -= r.cash;
          sold += r.cash;
          pl += r.pl;
        }
        AW.applyEffects(s, { money: sold });
        AW.Engine.note(s, '💵', AW.tx('finance', 'msg_auto_sell', s, { 金額: AW.fmtMoney(sold), 損益: this.fmtPL(pl) }));
      }
      // 負債：利息、壓力、破產
      if (s.stats.money < 0) {
        pay('interest', -s.stats.money * DEBT.rate);
        AW.applyEffects(s, { mood: -DEBT.stress });
        f.debtYears += 1;
        s.flags.debt = 1;
        const limit = Math.max(DEBT.minLimit, f.income * DEBT.incomeMult);
        if (!s.pendingEnding && (f.debtYears >= DEBT.years || -s.stats.money > limit)) {
          s.pendingEnding = 'bankrupt';
          AW.Engine.note(s, '💸', AW.tx('finance', 'msg_bankrupt', s));
        } else if (!s.pendingEnding) {
          AW.Engine.note(s, '💳', AW.tx('finance', 'msg_debt', s, { 年數: f.debtYears, 上限: DEBT.years }));
        }
      } else f.debtYears = 0;

      f.lastIncome = f.income;
      f.year = y.lines.length || y.income || y.invest ? y : null;
    },

    // 每年固定開銷（生活費、維護費、雇員、貸款），用來判斷財富自由
    yearlySpend(s) {
      let v = STYLES[s.fin.style].cost * (this.hasHome(s) ? 0.6 : 1) + AW.Family.upkeep(s);
      for (const id of Object.keys(s.items || {})) { const it = AW.ITEM_MAP[id]; if (it && it.upkeep) v += it.upkeep; }
      for (const id of Object.keys(s.staff || {})) v += AW.STAFF[id].salary;
      for (const l of s.fin.loans) v += l.pay;
      return v;
    },

    statusText(s) {
      if (s.stats.money >= 0) return '';
      return AW.tx('finance', 'debt_status', s, { 年數: s.fin.debtYears, 上限: DEBT.years });
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
