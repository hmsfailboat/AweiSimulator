/* 遊戲引擎：狀態機、年度流程、成年檢定、存讀檔、Meta */
(function (root) {
  'use strict';
  const AW = root.AW;
  AW.Text.apply(); // 把 js/data/texts.js 的文字填進各資料
  const SAVE_KEY = 'awei.save.v1';
  const META_KEY = 'awei.meta.v1';
  const storage = (() => {
    try { return root.localStorage || null; } catch (e) { return null; }
  })();

  // ======================= Meta（跨局進度） =======================
  const Meta = (AW.Meta = {
    data: null,
    defaults() {
      return { legacy: 0, totalLegacy: 0, runs: 0, upgrades: { talent: 0, memory: 0, rich: 0 },
        traits: AW.STARTER_TRAITS.slice(), achievements: {}, endings: {}, best: {} };
    },
    load() {
      let d = null;
      try { d = storage && JSON.parse(storage.getItem(META_KEY)); } catch (e) { d = null; }
      const def = this.defaults();
      this.data = Object.assign(def, d || {});
      this.data.upgrades = Object.assign(def.upgrades, (d && d.upgrades) || {});
      return this.data;
    },
    save() {
      try { storage && storage.setItem(META_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
    },
    get() { return this.data || this.load(); },
    buyUpgrade(id) {
      const m = this.get();
      const up = AW.UPGRADES[id];
      const lv = m.upgrades[id] || 0;
      if (!up || lv >= up.max) return false;
      const c = up.cost(lv);
      if (m.legacy < c) return false;
      m.legacy -= c;
      m.upgrades[id] = lv + 1;
      this.save();
      return true;
    },
    unlockTrait(id) {
      const m = this.get();
      const t = AW.TRAITS[id];
      if (!t || m.traits.includes(id) || m.legacy < t.cost) return false;
      m.legacy -= t.cost;
      m.traits.push(id);
      this.save();
      return true;
    },
    reset() {
      this.data = this.defaults();
      this.save();
    },
  });

  // ======================= 存讀檔 =======================
  const Save = (AW.Save = {
    save(s) {
      s.rng = AW.rng.s;
      try { storage && storage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
    },
    load() {
      try {
        const s = storage && JSON.parse(storage.getItem(SAVE_KEY));
        if (!s || s.version !== 1 || s.phase === 'ended') return null;
        // 舊存檔相容：道具、感情系統
        s.items = s.items || {};
        s.life = s.life || { n: 0, health: 0, mood: 0 };
        if (s.love === undefined) s.love = null;
        if (!s.love && s.flags.girlfriend) { AW.Love.start(s); s.love.since = Math.max(13, s.age - 1); }
        // v1.2：金錢、朋友、職場
        Engine.initExtras(s);
        AW.rng.seed(s.rng);
        return s;
      } catch (e) { return null; }
    },
    clear() { try { storage && storage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } },
    has() { return !!this.load(); },
  });

  // ======================= 引擎 =======================
  const STAGES = {
    infant:  { name: '嬰幼兒', icon: '👶', slots: 1 },
    elem:    { name: '國小', icon: '🎒', slots: 2 },
    junior:  { name: '國中', icon: '🏫', slots: 2 },
    senior:  { name: '高中', icon: '🎓', slots: 2 },
    extra:   { name: '延長賽', icon: '⏳', slots: 2 },
    pro:     { name: '職業選手', icon: '🎮', slots: 2 },
    uni:     { name: '大學', icon: '🏛️', slots: 2 },
    job:     { name: '上班族', icon: '💼', slots: 2 },
    startup: { name: '創業家', icon: '🚀', slots: 2 },
  };

  const Engine = (AW.Engine = {
    STAGES,

    // ---------- 新局 ----------
    rollTraitChoices() {
      const m = Meta.get();
      return AW.shuffle(m.traits).slice(0, 3);
    },
    birthPoints() { return 10 + (Meta.get().upgrades.talent || 0); },

    newRun(opts) {
      const m = Meta.get();
      const seed = opts.seed || ((Date.now() ^ (Math.random() * 1e9)) >>> 0);
      AW.rng.seed(seed);
      const s = {
        version: 1, seed, rng: seed,
        age: 0, phase: 'student', step: 'event',
        displayName: '劉家維', proName: null,
        trait: opts.trait,
        memory: m.upgrades.memory || 0,
        stats: { fps: 0, dota: 0, reflex: 0, study: 0, social: 0, teamwork: 0, tech: 0, leader: 0,
          health: 80, mood: 80, love: 0, fame: 0, money: (m.upgrades.rich || 0) * 100000 },
        flags: {}, yearFlags: {}, nextYearFlags: {}, counters: {}, items: {}, love: null, life: { n: 0, health: 0, mood: 0 },
        seen: {}, log: [], pendingEvents: [], eventResult: null, yearActions: [], yearNotes: [],
        yearStart: null, decision: null, pendingEnding: null, season: null, review: null,
        esports: null, eng: null, milestones: { tierUps: 0, promotions: 0 }, ending: null,
      };
      this.initExtras(s);
      const alloc = opts.alloc || {};
      for (const k of AW.BIRTH_STATS) s.stats[k] = (alloc[k] || 0) * 3;
      const t = AW.TRAITS[s.trait] || {};
      if (t.start) for (const k of Object.keys(t.start)) s.stats[k] += t.start[k];
      this.addLog(s, '🍼', `劉家維誕生了！天賦：${t.icon || ''}${t.name || '無'}`);
      this.beginYear(s);
      return s;
    },

    // 補上 v1.2 新增的欄位（新局與舊存檔共用）
    initExtras(s) {
      AW.Finance.init(s);
      s.npcs = s.npcs || {};
      s.staff = s.staff || {};
      s.itemUse = s.itemUse || {};
      s.itemSince = s.itemSince || {};
      if (s.rival === undefined) s.rival = null;
      if (s.esports && !s.rival) AW.Esports.startRival(s);
      if (s.eng && s.eng.stage !== 'uni' && !s.eng.peers) AW.Office.makePeers(s);
    },

    // ---------- 階段 ----------
    stageKey(s) {
      if (s.phase === 'esports') return 'pro';
      if (s.phase === 'engineer') return s.eng.stage;
      if (s.age >= 18) return 'extra';
      if (s.age <= 5) return 'infant';
      if (s.age <= 11) return 'elem';
      if (s.age <= 14) return 'junior';
      return 'senior';
    },
    stage(s) {
      if (s.phase === 'student' && s.age >= 18 && !s.flags.extraYear) return { name: '畢業', icon: '🎓', slots: 2 };
      return STAGES[this.stageKey(s)];
    },
    slots(s) {
      let n = this.stage(s).slots;
      if (s.yearFlags.sick) n -= 1;
      if (s.yearFlags.burnout) n -= 1;
      if (s.yearFlags.busy) n -= 1;
      if (s.yearFlags.blue) n -= 1;
      n = Math.max(1, n);
      if (s.yearFlags.extraSlot) n += 1;
      return n;
    },
    title(s) {
      if (s.phase === 'esports') return `${AW.Esports.TIERS[s.esports.tier].name}・${s.esports.team}`;
      if (s.phase === 'engineer') {
        if (s.eng.stage === 'uni') return s.eng.topUni ? '頂大資工系' : '資工系學生';
        if (s.eng.stage === 'startup') return `${AW.Engineer.STARTUP[s.eng.startup].name}・${s.eng.startupName} 創辦人`;
        return `${AW.Engineer.COMPANY[s.eng.company].name}・${AW.Engineer.rankName(s)}`;
      }
      if (s.age >= 18 && !s.flags.extraYear) return '高中畢業生';
      return { infant: '小寶寶', elem: '國小生', junior: '國中生', senior: '高中生', extra: '重考生' }[this.stageKey(s)];
    },

    addLog(s, icon, text) {
      s.log.push({ age: s.age, icon, text });
      if (s.log.length > 300) s.log.shift();
    },
    note(s, icon, text) {
      s.yearNotes.push({ icon, text });
      this.addLog(s, icon, text);
    },

    // ---------- 年度流程 ----------
    beginYear(s) {
      s.yearFlags = s.nextYearFlags || {};
      s.nextYearFlags = {};
      s.yearActions = [];
      s.yearNotes = [];
      s.eventResult = null;
      s.season = null;
      s.review = null;
      s.yearStart = Object.assign({}, s.stats);
      AW.Finance.beginYear(s);
      s.pendingEvents = this.rollEvents(s);
      s.step = s.pendingEvents.length ? 'event' : 'action';
      this.checkAchievements(s);
      Save.save(s);
    },

    rollEvents(s) {
      const phase = s.phase === 'student' ? 'student' : s.phase;
      const guard = s.staff && s.staff.guard;
      const pool = AW.EVENTS.filter((e) =>
        (e.phase === phase || e.phase === 'any' || (Array.isArray(e.phase) && e.phase.includes(phase))) &&
        !(e.once && s.seen[e.id]) &&
        !(e.threat && guard) &&
        (!e.cond || e.cond(s)));
      const out = [];
      const count = s.age === 0 ? 0 : AW.chance(0.25) ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const cands = pool.filter((e) => !out.includes(e.id));
        const e = AW.weightedPick(cands, (x) => AW.val(x.weight, s) || 1);
        if (e) out.push(e.id);
      }
      return out;
    },

    currentEvent(s) { return AW.EVENT_MAP[s.pendingEvents[0]] || null; },

    eventText(s, e) { return AW.val(e.text, s); },

    visibleChoices(s, e) {
      return (e.choices || []).map((c, i) => ({ c, i, ok: !c.cond || c.cond(s) })).filter((x) => x.ok || !x.c.hideLocked);
    },

    /** 套用一個 outcome，回傳 { text, deltas } */
    applyOutcome(s, o) {
      const deltas = AW.applyEffects(s, o.effects);
      if (o.income) AW.mergeDeltas(deltas, AW.Finance.earn(s, AW.val(o.income, s)));
      if (o.year) for (const k of Object.keys(o.year)) s.yearFlags[k] = (s.yearFlags[k] || 0) + o.year[k];
      if (o.next) for (const k of Object.keys(o.next)) s.nextYearFlags[k] = (s.nextYearFlags[k] || 0) + o.next[k];
      if (o.flags) Object.assign(s.flags, o.flags);
      const bonds = AW.NPC.applyBonds(s, AW.val(o.bond, s));
      const r = (o.run && o.run(s)) || {};
      if (r.deltas) AW.mergeDeltas(deltas, r.deltas);
      if (r.bonds) bonds.push(...r.bonds);
      // 結果文字在 run 之後才取，才能用到 run 產生的變數（例：{另一半}）
      let text = AW.val(o.result, s) || '';
      if (r.text) text = text ? text + ' ' + r.text : r.text;
      return { text, deltas, bonds };
    },

    resolveEvent(s, idx) {
      const e = this.currentEvent(s);
      if (!e || s.eventResult) return null;
      s.seen[e.id] = 1;
      let res;
      let label = '';
      if (e.choices && e.choices.length) {
        const c = e.choices[idx];
        if (!c || (c.cond && !c.cond(s))) return null;
        label = AW.val(c.text, s);
        if (c.roll) {
          let p = AW.clamp(AW.val(c.roll.chance, s) + AW.rollMod(s), 0.02, 0.99);
          const charm = (s.items && s.items.charm) > 0;
          if (charm) { p = Math.min(0.99, p + AW.CHARM_BONUS); s.items.charm -= 1; }
          const ok = AW.chance(p);
          res = this.applyOutcome(s, ok ? c.roll.success : c.roll.fail);
          res.roll = { p, ok, charm };
        } else {
          res = this.applyOutcome(s, c);
        }
      } else {
        res = this.applyOutcome(s, e);
      }
      s.eventResult = res;
      this.addLog(s, e.icon, `${AW.val(e.title, s)}${label ? `：${label}` : ''}${res.text ? ' — ' + res.text : ''}`);
      Save.save(s);
      return res;
    },

    advanceEvent(s) {
      s.pendingEvents.shift();
      s.eventResult = null;
      if (!s.pendingEvents.length) s.step = 'action';
      this.checkVitals(s, true);
      Save.save(s);
    },

    // ---------- 行動 ----------
    actionState(s, a) {
      if (a.cond && !a.cond(s)) return { ok: false, reason: a.lockText || '尚未解鎖' };
      if (s.yearFlags.noGame && a.tags && a.tags.includes('game')) return { ok: false, reason: '今年被禁止打電動' };
      const cost = this.actionCost(s, a);
      if (cost && s.stats.money < cost) return { ok: false, reason: `需要 ${AW.fmtMoney(cost)}` };
      return { ok: true };
    },
    actionCost(s, a) {
      if (!a.cost) return 0;
      if (a.netcafe && AW.traitOf(s).freeNetcafe) return 0;
      return AW.val(a.cost, s);
    },
    availableActions(s) {
      const key = this.stageKey(s);
      return AW.ACTIONS.filter((a) => a.stages.includes(key) && !(a.hideLocked && a.cond && !a.cond(s)))
        .map((a) => Object.assign({ a }, this.actionState(s, a)));
    },

    commitActions(s, ids) {
      if (s.step !== 'action') return null;
      const n = this.slots(s);
      const list = ids.slice(0, n).map((id) => AW.ACTION_MAP[id]).filter((a) => a && this.actionState(s, a).ok);
      s.yearPerf = s.yearFlags.perf || 0;
      s.yearSp = s.yearFlags.sp || 0;
      const results = [];
      for (const a of list) {
        const cost = this.actionCost(s, a);
        const deltas = cost ? AW.applyEffects(s, { money: -cost }) : {};
        AW.mergeDeltas(deltas, AW.applyEffects(s, a.effects));
        if (a.income) AW.mergeDeltas(deltas, AW.Finance.earn(s, AW.val(a.income, s)));
        let text = '';
        let bonds = [];
        if (a.run) {
          const r = a.run(s) || {};
          if (r.deltas) AW.mergeDeltas(deltas, r.deltas);
          if (r.bonds) bonds = r.bonds;
          text = r.text || '';
        }
        if (a.perf) s.yearPerf += a.perf;
        if (a.sp) s.yearSp += a.sp;
        if (a.netcafe) s.counters.netcafe = (s.counters.netcafe || 0) + 1;
        s.counters[a.id] = (s.counters[a.id] || 0) + 1;
        results.push({ id: a.id, text, deltas, bonds });
        s.yearActions.push(a.id);
        this.addLog(s, a.icon, a.name + (text ? ' — ' + text : ''));
      }
      s.actionResults = results;

      // 賽季結果先算好，等動畫播完（seasonDone）才結算，避免劇透
      if (s.phase === 'esports') s.season = AW.Esports.runSeason(s);
      else if (s.phase === 'engineer' && s.eng.stage === 'job') s.season = AW.Office.runYear(s);
      else if (s.phase === 'engineer' && s.eng.stage === 'startup') s.season = AW.Office.runStartup(s);
      if (s.season) {
        s.step = 'season';
        Save.save(s);
        return results;
      }
      s.step = 'summary';
      this.yearEnd(s);
      Save.save(s);
      return results;
    },

    seasonDone(s) {
      if (s.step !== 'season') return;
      s.step = 'summary';
      this.yearEnd(s);
      Save.save(s);
    },

    // ---------- 年末結算 ----------
    yearEnd(s) {
      // 零用錢
      if (s.phase === 'student' && s.age >= 6) {
        const mult = (AW.traitOf(s).allowance || 1) * (s.yearFlags.halfAllowance ? 0.5 : 1);
        AW.applyEffects(s, { money: s.age * 500 * mult });
      }
      if (s.phase === 'esports') AW.Esports.yearEnd(s);
      if (s.phase === 'engineer') AW.Engineer.yearEnd(s);
      AW.Shop.yearEnd(s);
      AW.Finance.yearEnd(s);
      if (s.flags.dog) AW.applyEffects(s, { health: 2, mood: 2 });
      AW.Love.yearEnd(s);
      AW.NPC.yearEnd(s);
      this.healthYear(s);
      this.checkVitals(s, false);
      // 人生回顧：記錄每年的健康與心情
      s.life.n += 1;
      s.life.health += s.stats.health;
      s.life.mood += s.stats.mood;
      this.checkAchievements(s);
    },

    STRESS: { teen: 2, adult: 3 },
    // 年齡造成的健康衰退：[幾歲起, 每年扣多少]
    AGING: [[50, 3], [40, 2], [30, 1]],

    // 職位越高壓力越大
    jobStress(s) {
      if (s.phase === 'esports') return s.esports.tier >= 4 ? 1 : 0;
      if (s.phase === 'engineer') {
        if (s.eng.stage === 'startup') return 2;
        if (s.eng.stage === 'job') return s.eng.rank >= 5 ? 2 : s.eng.rank >= 3 ? 1 : 0;
      }
      return 0;
    },

    // 長期健康：生活壓力、年齡衰退、慢性病、體弱多病
    healthYear(s) {
      // 生活壓力：青少年與成人每年心情自然下降
      const stress = s.phase === 'student' ? (s.age >= 12 ? this.STRESS.teen : 0) : this.STRESS.adult + this.jobStress(s);
      if (stress) AW.applyEffects(s, { mood: -stress });
      const aging = this.AGING.find(([age]) => s.age >= age);
      if (aging) AW.applyEffects(s, { health: -aging[1] });
      if (s.flags.chronic) AW.applyEffects(s, { health: -4 });
      if (s.stats.health < 30) {
        s.counters.lowHealth = (s.counters.lowHealth || 0) + 1;
        if (s.counters.lowHealth >= 3 && !s.flags.chronic) {
          s.flags.chronic = 1;
          this.note(s, '🩺', AW.tx('status', 'msg_chronic', s));
        }
      } else s.counters.lowHealth = 0;
      if (s.stats.health > 0 && s.stats.health < AW.TIER.bad && !s.nextYearFlags.sick && AW.chance(0.5)) {
        s.nextYearFlags.sick = 1;
        this.note(s, '🤒', AW.tx('status', 'msg_frail', s));
      }
    },

    // 一生平均健康／心情與評等
    lifeAvg(s) {
      const l = s.life || { n: 0 };
      return l.n ? { health: l.health / l.n, mood: l.mood / l.n } : { health: s.stats.health, mood: s.stats.mood };
    },
    grade(v) { return v >= 80 ? 'S' : v >= 70 ? 'A' : v >= 60 ? 'B' : v >= 45 ? 'C' : 'D'; },

    // 財富自由：35～49 歲、心情好，身家達到「每年開銷 × 25」（4% 法則，最少 3000 萬），可以提早退休
    FIRE: { age: 35, maxAge: 49, min: 70000000, mult: 25 },
    fireTarget(s) { return Math.max(this.FIRE.min, AW.Finance.yearlySpend(s) * this.FIRE.mult); },
    canFire(s) {
      return s.phase !== 'student' && s.phase !== 'ended' && !s.pendingEnding && s.age >= this.FIRE.age && s.age <= this.FIRE.maxAge
        && AW.Finance.netWorth(s) >= this.fireTarget(s) && s.stats.mood >= AW.TIER.good && s.stats.money >= 0;
    },

    checkVitals(s, quiet) {
      if (s.stats.health <= 0) {
        s.flags.collapsed = (s.flags.collapsed || 0) + 1;
        s.stats.health = 35;
        s.nextYearFlags.sick = 1;
        const lost = AW.applyEffects(s, { best: -3, study: -2, mood: -10 }, { grow: false });
        this.note(s, '🚑', '身體撐不住，病倒住院了！下一年行動數 -1。');
        if (s.flags.collapsed === 2) this.note(s, '⚠️', AW.tx('status', 'msg_warn', s));
        if (s.flags.collapsed >= 3 && !s.pendingEnding) {
          s.pendingEnding = 'burnout';
          this.note(s, '🛏️', AW.tx('status', 'msg_final', s));
        }
        return lost;
      }
      if (s.stats.mood <= 0) {
        s.stats.mood = 35;
        s.nextYearFlags.burnout = 1;
        this.note(s, '🌫️', '心情跌到谷底，陷入倦怠……下一年行動數 -1。');
      }
      return null;
    },

    yearDiff(s) {
      const out = [];
      for (const k of Object.keys(AW.STATS)) {
        const d = (s.stats[k] || 0) - ((s.yearStart && s.yearStart[k]) || 0);
        if (d) out.push({ key: k, v: d });
      }
      return out;
    },

    canAdvance(s) { return s.step === 'summary' && !s.decision; },

    nextYear(s) {
      if (!this.canAdvance(s)) return;
      if (s.pendingEnding) return this.finish(s, s.pendingEnding);
      s.age += 1;
      if (s.phase === 'student') {
        if (s.age === 18 || (s.age === 19 && s.flags.extraYear)) {
          s.step = 'check';
          s.checkResult = null;
          s.milestones.adult = 1;
          this.addLog(s, '🎂', `${s.age} 歲，迎來成年檢定。`);
          Save.save(s);
          return;
        }
      } else if (s.phase === 'esports') {
        if (AW.Esports.onNewYear(s)) return;
      } else if (s.phase === 'engineer') {
        if (AW.Engineer.onNewYear(s)) return;
      }
      if (s.step === 'decision') { Save.save(s); return; }
      this.beginYear(s);
    },

    resolveDecision(s, idx) {
      const d = s.decision;
      if (!d) return null;
      const opt = d.options[idx];
      if (!opt) return null;
      const r = (opt.apply && opt.apply(s)) || {};
      s.decision = null;
      if (r.text) this.note(s, d.icon || '📌', r.text);
      if (s.step === 'decision') {
        if (s.pendingEnding) return this.finish(s, s.pendingEnding);
        this.beginYear(s);
      }
      Save.save(s);
      return r;
    },

    // ---------- 成年檢定 ----------
    checkInfo(s) {
      const bestKey = AW.resolveKey(s, 'best');
      const best = s.stats[bestKey];
      const proOk = best >= 60 && s.stats.reflex >= 42;
      const studyOk = s.stats.study >= 50;
      let chance = 0.3 + (best - 60) * 0.025 + (s.stats.reflex - 42) * 0.01 + s.stats.fame * 0.003;
      if (s.flags.scouted) chance += 0.1;
      chance = AW.clamp(chance, 0.1, 0.95);
      return { bestKey, best, proOk, studyOk, chance, topUni: s.stats.study >= 80, second: !!s.flags.extraYear };
    },

    doTryout(s) {
      const info = this.checkInfo(s);
      if (!info.proOk || s.checkResult) return null;
      const ok = AW.chance(info.chance);
      s.checkResult = { tryout: true, ok, chance: info.chance };
      this.addLog(s, ok ? '✅' : '❌', ok ? '戰隊試訓通過！' : '戰隊試訓沒有通過……');
      Save.save(s);
      return s.checkResult;
    },

    startEsports(s, name, game) {
      name = String(name || '').trim().slice(0, 12);
      if (!name) return false;
      s.proName = name;
      s.displayName = 'Aweiisa' + name;
      s.phase = 'esports';
      s.milestones.career = 1;
      AW.Esports.start(s, game);
      this.addLog(s, '🎮', `以「${s.displayName}」之名出道，加入 ${s.esports.team}！`);
      this.beginYear(s);
      return true;
    },

    startEngineer(s) {
      const info = this.checkInfo(s);
      s.phase = 'engineer';
      s.displayName = '劉家維';
      s.milestones.career = 1;
      AW.Engineer.start(s, info.topUni);
      this.addLog(s, '🏛️', info.topUni ? '考上頂尖大學資工系！' : '考上大學資工系。');
      this.beginYear(s);
    },

    startExtraYear(s) {
      s.flags.extraYear = 1;
      this.addLog(s, '⏳', '決定再拚一年！');
      this.beginYear(s);
    },

    // ---------- 結局 ----------
    PLAIN_ENDINGS: ['ordinary', 'pro_retire', 'senior_eng', 'startup_fail'],
    HAPPY_MOOD: 75,

    finish(s, endingId) {
      if (s.phase === 'ended') return s.ending;
      AW.Finance.liquidate(s);
      const life = this.lifeAvg(s);
      // 職涯普通，但一生快樂又成家 → 平凡但幸福
      if (this.PLAIN_ENDINGS.includes(endingId) && life.mood >= this.HAPPY_MOOD && s.love && s.love.status === 'married') endingId = 'happy_life';
      s.ending = { id: endingId, grades: { health: this.grade(life.health), mood: this.grade(life.mood) } };
      s.phase = 'ended';
      s.step = 'ended';
      const m = Meta.get();
      const ms = s.milestones;
      const parts = [];
      if (ms.adult) parts.push(['平安長大成人', 1]);
      if (ms.career) parts.push(['踏入職涯', 2]);
      if (ms.tierUps) parts.push([`戰隊晉升 ×${ms.tierUps}`, ms.tierUps]);
      if (ms.promotions) parts.push([`職場升遷 ×${ms.promotions}`, ms.promotions]);
      // 國內冠軍：第一座 2 點，之後每座 +1，最多 5 點
      if (s.esports && s.esports.domesticTitles) parts.push([`國內冠軍 ×${s.esports.domesticTitles}`, Math.min(5, 1 + s.esports.domesticTitles)]);
      if (s.esports && s.esports.bestWorlds >= 3) parts.push(['世界賽四強', 3]);
      if (endingId === 'world_champ') parts.push(['🏆 世界冠軍', 10]);
      if (endingId === 'tech_boss') parts.push(['🏢 科技公司大老闆', 10]);
      if (s.love && s.love.status === 'married') parts.push(['成家', 2]);
      if (s.stats.money >= 100000000) parts.push(['富可敵國', 2]);
      else if (s.stats.money >= 10000000) parts.push(['家財萬貫', 1]);
      const GP = { S: 2, A: 1 };
      if (GP[s.ending.grades.health]) parts.push([`健康評等 ${s.ending.grades.health}`, GP[s.ending.grades.health]]);
      if (GP[s.ending.grades.mood]) parts.push([`幸福度 ${s.ending.grades.mood}`, GP[s.ending.grades.mood]]);
      if (!m.endings[endingId]) parts.push(['新結局解鎖', 2]);
      if (endingId === 'ordinary') parts.push(['參加獎', 1]);
      const total = parts.reduce((a, p) => a + p[1], 0);
      m.endings[endingId] = (m.endings[endingId] || 0) + 1;
      m.runs += 1;
      m.legacy += total;
      m.totalLegacy += total;
      s.ending.legacy = total;
      s.ending.parts = parts;
      this.unlockAchievement(s, 'first_life');
      this.checkAchievements(s);
      if (Object.keys(AW.ENDINGS).every((k) => m.endings[k])) this.unlockAchievement(s, 'all_endings');
      Meta.save();
      Save.clear();
      this.addLog(s, AW.ENDINGS[endingId].icon, `結局：${AW.ENDINGS[endingId].name}`);
      return s.ending;
    },

    // ---------- 成就 ----------
    checkAchievements(s) {
      for (const a of AW.ACHIEVEMENTS) {
        if (a.check && a.check(s)) this.unlockAchievement(s, a.id);
      }
    },
    unlockAchievement(s, id) {
      const m = Meta.get();
      if (m.achievements[id]) return;
      m.achievements[id] = Date.now();
      m.legacy += 1;
      m.totalLegacy += 1;
      Meta.save();
      s.newAchievements = (s.newAchievements || []).concat(id);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
