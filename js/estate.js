/* 房地產：房市行情、自住房與豪宅的市值、收租物件（跟劉地主買）
 * s.estate = { idx 房價指數, trend 長期趨勢, last 今年漲跌, next 今年年末的漲跌, after 明年年末的漲跌（先擲好，劉地主泡茶時會透露）,
 *              hint: { cat 劉地主說的 up/flat/down, age 對應哪一歲年末 }, rentals: [{ uid, kind, price 買價, since 買入年齡 }], uid }
 * 自住房、豪宅仍是道具商店的裝備（s.items.house / mansion），estate 欄位是基準價
 * 文字在 js/data/texts.js 的 [estate]
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  // 房市：from 歲起每年漲跌 = drift + sd × 常態亂數，偏離長期趨勢（每年 +trend）越多，拉回越多（revert）
  const MARKET = { from: 18, drift: 0.02, trend: 0.02, sd: 0.07, revert: 0.12, min: -0.25, max: 0.3 };
  // 收租物件：base 基準價（× 房價指數）、yield 年租金占市值的比例、vacancy 空租機率、sell 賣掉時拿回市值的比例
  // bond 劉地主好友度門檻、loan 房貸 { down 頭期比例, rate 年利率, years 年數 }
  const KINDS = {
    suite: { base: 10000000, yield: 0.035, vacancy: 0.12, sell: 0.9, bond: 40, loan: { down: 0.3, rate: 0.025, years: 20 } },
    office: { base: 60000000, yield: 0.04, vacancy: 0.2, sell: 0.9, bond: 60, loan: { down: 0.4, rate: 0.025, years: 20 } },
  };
  const MAX_RENTALS = 5;
  const MIN_AGE = 20;

  // 劉地主：好友度門檻與效果
  AW.LIU = {
    rentBond: 30, rentMult: 0.85,          // 沒有自己的房子時，租劉地主的房子：生活費 × rentMult
    dealBond: 40, discount: 0.95,          // 買房（自住房、豪宅、收租物件）打 95 折
    // 代管：空租機率 ×、租金 +；賣房由他接手，多拿 sellBonus（要小於買房折扣，否則買了馬上賣就能套利）
    manageBond: 60, vacancyMult: 0.4, rentBonus: 0.1, sellBonus: 0.04,
    landBond: 70,                          // 合建案（events.js 的 liu_land）
    hintBase: 0.6, hintBond: 250,          // 泡茶時透露明年房市：準確率 = hintBase + 好友度 / hintBond
    hintUp: 0.04, hintDown: -0.01,         // 明年漲跌 ≥ hintUp 算「看漲」、≤ hintDown 算「看跌」
  };
  const L = AW.LIU;
  const bond = (s) => (AW.NPC ? AW.NPC.bond(s, 'liu') : 0);
  const round = (v) => Math.round(v / 10000) * 10000;

  const Estate = (AW.Estate = {
    MARKET, KINDS, MAX_RENTALS, MIN_AGE,

    init(s) {
      s.estate = Object.assign({ idx: 1, trend: 1, last: 0, next: null, after: null, hint: null, rentals: [], uid: 0 }, s.estate || {});
      return s.estate;
    },

    // ---------- 房市 ----------
    started(s) { return s.age >= MARKET.from; },
    rollNext(s) {
      const e = s.estate;
      const r = MARKET.drift + MARKET.sd * AW.randNormal() - MARKET.revert * Math.log(e.idx / e.trend);
      return AW.clamp(r, MARKET.min, MARKET.max);
    },
    // 市值、買價（劉地主好友度夠高打折）
    value(s, base) { return round(base * s.estate.idx); },
    buyPrice(s, base) { return round(this.value(s, base) * (bond(s) >= L.dealBond ? L.discount : 1)); },
    sellRatio(s, ratio) { return ratio + (bond(s) >= L.manageBond ? L.sellBonus : 0); },
    fmtPct(r) { return `${r >= 0 ? '+' : ''}${(r * 100).toFixed(1)}%`; },

    // 劉地主透露明年房市：up / down / flat（好友度越高越準）。今年年末的漲跌已經來不及反應，所以說的是明年
    hint(s) {
      const e = s.estate;
      if (e.after == null) e.after = this.rollNext(s);
      const cats = ['up', 'flat', 'down'];
      const truth = e.after >= L.hintUp ? 'up' : e.after <= L.hintDown ? 'down' : 'flat';
      const p = Math.min(0.95, L.hintBase + bond(s) / L.hintBond);
      const said = AW.chance(p) ? truth : AW.pick(cats.filter((c) => c !== truth));
      e.hint = { cat: said, age: s.age + 1 };
      return said;
    },

    // 賣房的人生紀錄（v 是拿回的錢，負的代表要補錢還清房貸）
    logSell(s, icon, name, v) {
      AW.Engine.addLog(s, icon, AW.tx('estate', v >= 0 ? 'log_sell' : 'log_sell_neg', s, { 物件: name, 金額: AW.fmtMoney(Math.abs(v)) }));
    },

    // ---------- 自住房、豪宅 ----------
    homeIds(s) { return ['house', 'mansion'].filter((id) => s.items && s.items[id]); },
    homeValue(s, id) { return this.value(s, AW.ITEM_MAP[id].estate); },
    homeName(s, id) { return AW.tx('estate', 'home_' + id, s); },
    // 賣掉拿回的錢：市值 × 比例 − 房貸剩餘本金（可能是負的，要補錢）
    homeSellValue(s, id) {
      const it = AW.ITEM_MAP[id];
      return Math.round(this.homeValue(s, id) * this.sellRatio(s, it.sell) - (it.loan ? AW.Finance.loanLeft(s, id) : 0));
    },
    // 理財畫面賣掉自己的房子
    sellHome(s, id) {
      if (!AW.Shop.open(s) || !AW.Shop.owned(s, id)) return false;
      const v = this.homeSellValue(s, id);
      if (v < 0 && s.stats.money < -v) return false;
      AW.Shop.sell(s, id);
      this.logSell(s, AW.ITEM_MAP[id].icon, this.homeName(s, id), v);
      AW.Save.save(s);
      return true;
    },

    // ---------- 收租物件 ----------
    loanId(r) { return 'estate:' + r.uid; },
    kindName(s, kind) { return AW.tx('estate', 'kind_' + kind, s); },
    rentalValue(s, r) { return this.value(s, KINDS[r.kind].base); },
    rentalSellValue(s, r) {
      return Math.round(this.rentalValue(s, r) * this.sellRatio(s, KINDS[r.kind].sell) - AW.Finance.loanLeft(s, this.loanId(r)));
    },
    rent(s, r) { return round(this.rentalValue(s, r) * KINDS[r.kind].yield * (1 + (bond(s) >= L.manageBond ? L.rentBonus : 0))); },
    vacancy(s, r) { return KINDS[r.kind].vacancy * (bond(s) >= L.manageBond ? L.vacancyMult : 1); },
    downPayment(s, kind) { const k = KINDS[kind]; return round(this.buyPrice(s, k.base) * k.loan.down); },
    // 收租物件的淨值（市值扣掉賣房成本與房貸），算進身家
    equity(s) { return (s.estate ? s.estate.rentals : []).reduce((a, r) => a + this.rentalSellValue(s, r), 0); },

    rentalState(s, kind) {
      const k = KINDS[kind];
      if (!k || !AW.NPC.met(s, 'liu')) return { ok: false, hidden: true };
      if (!AW.Shop.open(s) || !AW.Finance.canManage(s)) return { ok: false, reason: AW.tx('estate', 'need_open', s) };
      if (s.age < MIN_AGE) return { ok: false, reason: AW.tx('estate', 'need_age', s, { 年齡: MIN_AGE }) };
      if (bond(s) < k.bond) return { ok: false, reason: AW.tx('estate', 'need_bond', s, { 好友度: k.bond }) };
      if (s.estate.rentals.length >= MAX_RENTALS) return { ok: false, reason: AW.tx('estate', 'need_max', s, { 上限: MAX_RENTALS }) };
      const down = this.downPayment(s, kind);
      if (s.stats.money < down) return { ok: false, reason: `需要 ${AW.fmtMoney(down)}` };
      return { ok: true };
    },
    buyRental(s, kind) {
      if (!this.rentalState(s, kind).ok) return false;
      const k = KINDS[kind];
      const e = s.estate;
      const price = this.buyPrice(s, k.base);
      const down = this.downPayment(s, kind);
      const r = { uid: ++e.uid, kind, price, since: s.age };
      AW.applyEffects(s, { money: -down });
      s.counters.spent = (s.counters.spent || 0) + down;
      AW.Finance.addLoan(s, this.loanId(r), price - down, k.loan.rate, k.loan.years);
      e.rentals.push(r);
      AW.NPC.addBond(s, 'liu', 3);
      AW.Engine.addLog(s, '🏘️', AW.tx('estate', 'log_buy', s, { 物件: this.kindName(s, kind), 總價: AW.fmtMoney(price), 頭期: AW.fmtMoney(down) }));
      AW.Engine.checkAchievements(s);
      AW.Save.save(s);
      return true;
    },
    // 賣掉收租物件：拿回的錢先還清房貸（不夠的話要補）；force 是事件、結局時強制賣掉
    sellRental(s, uid, force) {
      const e = s.estate;
      const i = e.rentals.findIndex((r) => r.uid === uid);
      if (i < 0 || (!force && !AW.Shop.open(s))) return null;
      const r = e.rentals[i];
      const v = this.rentalSellValue(s, r);
      if (!force && v < 0 && s.stats.money < -v) return null;
      e.rentals.splice(i, 1);
      AW.Finance.dropLoans(s, this.loanId(r));
      this.logSell(s, '🏘️', this.kindName(s, r.kind), v);
      if (!force) AW.Save.save(s);
      return AW.applyEffects(s, { money: v });
    },
    sellAllRentals(s) {
      const d = {};
      for (const r of s.estate.rentals.slice()) AW.mergeDeltas(d, this.sellRental(s, r.uid, true) || {});
      return d;
    },

    // ---------- 年末（Finance.yearEnd 呼叫）：房市漲跌、收租；回傳租金收入 ----------
    yearEnd(s) {
      const e = s.estate;
      if (!this.started(s)) return 0;
      if (e.next == null) e.next = this.rollNext(s);
      if (e.after == null) e.after = this.rollNext(s);
      e.last = e.next;
      e.idx *= 1 + e.last;
      e.trend *= 1 + MARKET.trend;
      e.next = e.after;
      e.after = this.rollNext(s);
      if (e.hint && e.hint.age <= s.age) e.hint = null;
      let rent = 0;
      let vacant = 0;
      for (const r of e.rentals) {
        if (AW.chance(this.vacancy(s, r))) vacant += 1;
        else rent += this.rent(s, r);
      }
      // 有房子才記房市漲跌
      if (this.homeIds(s).length || e.rentals.length) {
        let text = AW.tx('estate', 'log_year', s, { 漲跌: this.fmtPct(e.last), 指數: e.idx.toFixed(2) });
        if (e.rentals.length) text += AW.tx('estate', 'log_rent', s, { 金額: AW.fmtMoney(rent) }) + (vacant ? AW.tx('estate', 'log_vacant', s, { 空租: vacant }) : '');
        AW.Engine.addLog(s, e.last >= 0 ? '🏘️' : '🏚️', text);
      }
      return rent;
    },

    // 結局：收租物件換成現金（算進遺產）
    liquidate(s) {
      if (s.estate && s.estate.rentals.length) this.sellAllRentals(s);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
