/* 無頭平衡模擬：node tools/sim.js [局數]
 * 以數種策略自動遊玩，輸出成年檢定與職涯結果分佈。
 * node tools/sim.js --meta [輪數]：從零開始連續重生，有傳承點就買，統計幾局能全部解鎖。
 * SIM_HOOK=除錯腳本.js node tools/sim.js：載入除錯腳本，可替換或監看任何函式。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const FILES = ['js/core.js', 'js/text.js', 'js/data/texts.js', 'js/data/traits.js', 'js/data/actions.js', 'js/data/events.js',
  'js/data/items.js', 'js/data/npcs.js', 'js/data/meta.js', 'js/engine.js', 'js/love.js', 'js/shop.js', 'js/finance.js',
  'js/npcs.js', 'js/office.js', 'js/esports.js', 'js/engineer.js'];
const ctx = { console, Math, Date, JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const AW = ctx.AW;
if (AW.Text.missing.length || AW.Text.warnings.length) {
  console.log('⚠️ 文本問題：\n' + AW.Text.missing.concat(AW.Text.warnings).join('\n'));
  process.exitCode = 1;
}
// 遊玩中才取用的文本（AW.tx），缺少的話在最後列出
const missingAtLoad = AW.Text.missing.length;
process.on('exit', () => {
  const miss = [...new Set(AW.Text.missing.slice(missingAtLoad))];
  if (miss.length) { console.log('\n⚠️ 遊玩中缺少的文本：\n' + miss.join('\n')); process.exitCode = 1; }
});
const E = AW.Engine;
// 除錯用：SIM_HOOK=檔案路徑，該檔案匯出 (AW) => { 結束時要執行的函式 }
const hookDone = process.env.SIM_HOOK ? require(path.resolve(process.env.SIM_HOOK))(AW) : null;
if (hookDone) process.on('exit', hookDone);
AW.Meta.data = AW.Meta.defaults();
AW.Meta.save = () => {};

const META = process.argv.includes('--meta');
const N = +process.argv.filter((a) => !a.startsWith('--'))[2] || (META ? 200 : 2000);
const R = Math.random;

function pickActions(s, prefs, grind) {
  const avail = E.availableActions(s).filter((x) => x.ok).map((x) => x.a.id);
  const n = E.slots(s);
  const out = [];
  const st = s.stats;
  const need = [];
  if (!grind && st.health < 45) need.push('rest', 'pro_rest', 'uni_rest', 'vacation', 'gym', 'sports');
  if (!grind && st.mood < 50) need.push('rest', 'pro_rest', 'uni_game', 'vacation', 'friends');
  if (AW.Love.active(s) && st.love < 50) need.push('date');
  for (const id of need.concat(prefs(s))) {
    if (out.length >= n) break;
    if (avail.includes(id) && !out.includes(id)) out.push(id);
  }
  while (out.length < n && avail.length > out.length) {
    const id = avail[Math.floor(R() * avail.length)];
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

const STRATS = {
  gamer: {
    trait: 'gamer', alloc: { fps: 5, reflex: 5 },
    student: (s) => s.age < 6 ? ['watch_dad', 'tablet', 'crawl']
      : (s.age % 3 === 0 ? ['reflex_train', 'play_fps'] : ['play_fps', 'ranked_night', 'reflex_train', 'sports']),
    wantPro: true,
  },
  scholar: {
    trait: 'scholar', alloc: { study: 5, social: 5 },
    student: (s) => s.age < 6 ? ['story', 'blocks'] : ['class', 'exam_prep', 'cram', 'workbook', 'friends'],
    wantPro: false,
  },
  balanced: {
    trait: 'genius', alloc: { fps: 4, reflex: 3, study: 3 },
    student: (s) => s.age < 6 ? ['watch_dad', 'blocks'] : (s.age % 2 ? ['play_fps', 'class'] : ['reflex_train', 'exam_prep', 'cram', 'class']),
    wantPro: true,
  },
  grinder: {
    trait: 'gamer', alloc: { fps: 5, reflex: 5 }, grind: true,
    student: (s) => s.age < 6 ? ['watch_dad', 'tablet'] : ['ranked_night', 'play_fps', 'reflex_train'],
    wantPro: true,
  },
  random: { trait: 'sunny', alloc: { fps: 2, dota: 2, reflex: 2, study: 2, social: 2 }, student: () => [], wantPro: true },
  // 有錢就花：每年買消耗品、買得起就買裝備、升級生活水準、一半存款買 ETF
  shopper: {
    trait: 'scholar', alloc: { study: 5, social: 5 }, shop: true,
    student: (s) => s.age < 6 ? ['story', 'blocks'] : ['class', 'exam_prep', 'cram', 'friends', 'squad'],
    wantPro: false,
  },
};

// 道具與理財：shopper 策略在每年的事件、結算時呼叫
function shopAll(s) {
  for (const { it, ok } of AW.Shop.list(s)) {
    if (!ok || it.type === 'charm' || it.type === 'gift') continue;
    const p = AW.Shop.cost(s, it);
    if (it.type === 'gear' ? s.stats.money >= p * 3 : s.stats.money >= p * 5) AW.Shop.buy(s, it.id);
  }
  const F = AW.Finance;
  if (F.canManage(s) && F.active(s)) {
    const want = F.STYLES.map((x, i) => i).filter((i) => s.stats.money >= F.STYLES[i].cost * 20).pop();
    if (want != null && want > s.fin.style) F.setStyle(s, want);
    if (s.stats.money > 2000000) F.invest(s, 'etf', Math.round(s.stats.money * 0.5));
  }
}

const proPrefs = (s) => {
  const st = s.stats;
  const p = [];
  if (st[s.esports.game] < 92) p.push('solo_grind');
  if (st.teamwork < 75) p.push('scrim');
  if (st.reflex < 75) p.push('reflex_drill');
  if (s.age >= 26) p.unshift('gym');
  p.push('review_vod', 'stream');
  return p;
};
const engPrefs = (s) => {
  const st = s.stats;
  const e = s.eng;
  if (e.stage === 'uni') return s.age >= 20 ? ['uni_intern', 'uni_code'] : ['uni_code', 'uni_study', 'uni_club'];
  if (e.stage === 'startup') return ['st_product', 'st_hire', 'st_pitch'];
  if (s.useStartup && e.rank >= 2) return ['quit_startup', 'code', 'mentor'];
  if (e.rank <= 2) return st.tech < 70 ? ['code', 'learn', 'mentor'] : ['mentor', 'code', 'crossteam'];
  return st.leader < 85 ? ['mentor', 'networking', 'crossteam'] : ['networking', 'crossteam', 'code'];
};

function playRun(strat, opts) {
  const st = STRATS[strat];
  const s = E.newRun({ trait: st.trait, alloc: st.alloc, seed: (R() * 4294967295) >>> 0 });
  s.useStartup = opts.startup;
  s.simStrat = strat;
  const res = { strat, grades: {}, rankAge: {} };
  let guard = 0;
  while (s.phase !== 'ended' && guard++ < 500) {
    if (st.shop && (s.step === 'event' || s.step === 'action')) shopAll(s);
    if (s.step === 'event') {
      const e = E.currentEvent(s);
      const ch = E.visibleChoices(s, e).filter((x) => x.ok);
      E.resolveEvent(s, ch.length ? ch[Math.floor(R() * ch.length)].i : -1);
      E.advanceEvent(s);
    } else if (s.step === 'action') {
      const prefs = s.phase === 'student' ? st.student : s.phase === 'esports' ? proPrefs : engPrefs;
      E.commitActions(s, pickActions(s, prefs, st.grind));
    } else if (s.step === 'season') {
      E.seasonDone(s);
    } else if (s.step === 'summary') {
      if (E.canFire(s)) res.fire = 1;
      if (s.review && s.review.grade) res.grades[s.review.grade] = (res.grades[s.review.grade] || 0) + 1;
      if (s.eng && s.eng.rank && res.rankAge[s.eng.rank] == null) res.rankAge[s.eng.rank] = s.age;
      if (s.decision) E.resolveDecision(s, 0);
      else E.nextYear(s);
    } else if (s.step === 'decision') {
      E.resolveDecision(s, 0);
    } else if (s.step === 'check') {
      const info = E.checkInfo(s);
      if (s.age === 18) { res.best18 = info.best; res.reflex18 = s.stats.reflex; res.study18 = s.stats.study; res.proOk = info.proOk; res.studyOk = info.studyOk; }
      let done = false;
      if (info.proOk && (st.wantPro || !info.studyOk)) {
        const r = E.doTryout(s);
        if (r.ok) { E.startEsports(s, 'sim', info.bestKey); res.path = 'esports'; done = true; }
      }
      if (!done && info.studyOk) { E.startEngineer(s); res.path = 'engineer'; done = true; }
      if (!done) {
        if (!info.second) E.startExtraYear(s);
        else { E.finish(s, 'ordinary'); res.path = 'ordinary'; }
      }
    } else break;
  }
  res.ending = s.ending && s.ending.id;
  res.age = s.age;
  res.legacy = s.ending && s.ending.legacy;
  if (s.esports) { res.tier = s.esports.maxTier; res.bestWorlds = s.esports.bestWorlds; res.dom = s.esports.domesticTitles; }
  if (s.eng) { res.rank = s.eng.bestRank; res.startup = s.eng.startup; res.bankrupt = s.flags.bankrupt || 0; }
  res.collapsed = s.flags.collapsed || 0;
  res.dated = s.flags.girlfriend ? 1 : 0;
  res.gh = s.ending && s.ending.grades && s.ending.grades.health;
  res.gm = s.ending && s.ending.grades && s.ending.grades.mood;
  res.chronic = s.flags.chronic ? 1 : 0;
  res.married = s.love && s.love.status === 'married' ? 1 : 0;
  res.brokeUp = s.flags.brokeUp ? 1 : 0;
  res.money = s.stats.money;
  res.tax = s.fin.taxTotal;
  res.debt = s.flags.debt ? 1 : 0;
  res.npcs = Object.keys(s.npcs).length;
  if (s.rival) res.h2h = s.rival.w + s.rival.l;
  return res;
}

function pct(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : '-'; }
function avg(arr, k) { const v = arr.filter((r) => r[k] != null); return v.length ? (v.reduce((a, r) => a + r[k], 0) / v.length).toFixed(1) : '-'; }

// 有傳承點就買：先買最便宜的
function spendLegacy() {
  const M = AW.Meta;
  for (;;) {
    const m = M.get();
    const opts = [];
    for (const id of Object.keys(AW.UPGRADES)) {
      const lv = m.upgrades[id] || 0;
      if (lv < AW.UPGRADES[id].max) opts.push({ c: AW.UPGRADES[id].cost(lv), buy: () => M.buyUpgrade(id) });
    }
    for (const id of Object.keys(AW.TRAITS)) if (!m.traits.includes(id)) opts.push({ c: AW.TRAITS[id].cost, buy: () => M.unlockTrait(id) });
    if (!opts.length) return true;
    opts.sort((a, b) => a.c - b.c);
    if (m.legacy < opts[0].c) return false;
    opts[0].buy();
  }
}

function totalCost() {
  let c = 0;
  for (const u of Object.values(AW.UPGRADES)) for (let lv = 0; lv < u.max; lv++) c += u.cost(lv);
  for (const t of Object.values(AW.TRAITS)) c += t.cost;
  return c;
}

if (META) {
  const order = ['gamer', 'scholar', 'balanced', 'random'];
  const done = [];
  const firstBuy = [];
  const per = [];
  const achPts = [];
  for (let k = 0; k < N; k++) {
    AW.Meta.data = AW.Meta.defaults();
    let first = null;
    let runs = 0;
    while (runs < 300) {
      const before = AW.Meta.data.legacy;
      const ach = Object.keys(AW.Meta.data.achievements).length;
      const r = playRun(order[runs % order.length], { startup: runs % 8 === 5 });
      runs++;
      per.push(AW.Meta.data.legacy - before);
      achPts.push(Object.keys(AW.Meta.data.achievements).length - ach);
      const spent = AW.Meta.data.totalLegacy;
      const all = spendLegacy();
      if (first == null && AW.Meta.data.legacy < spent) first = runs;
      if (all) break;
    }
    done.push(runs);
    firstBuy.push(first);
  }
  done.sort((a, b) => a - b);
  const q = (p) => done[Math.floor(p * (done.length - 1))];
  const mean = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log(`=== 連續重生 ${N} 輪（策略輪流：${order.join('/')}）===`);
  console.log(`全部解鎖總花費 ${totalCost()} 傳承點`);
  console.log(`全部解鎖所需局數：中位數 ${q(0.5)}（最快 ${done[0]}、25% ${q(0.25)}、75% ${q(0.75)}、最慢 ${done[done.length - 1]}）`);
  console.log(`每局平均傳承點 ${mean(per)}（其中成就 ${mean(achPts)}）；第一次能買東西在第 ${mean(firstBuy)} 局`);
  process.exit();
}

for (const strat of Object.keys(STRATS)) {
  for (const startup of strat === 'scholar' ? [false, true] : [false]) {
    const runs = [];
    for (let i = 0; i < N; i++) runs.push(playRun(strat, { startup }));
    const by = (f) => runs.filter(f).length;
    const endings = {};
    for (const r of runs) endings[r.ending] = (endings[r.ending] || 0) + 1;
    const es = runs.filter((r) => r.path === 'esports');
    const en = runs.filter((r) => r.path === 'engineer');
    console.log(`\n=== ${strat}${startup ? ' (+創業)' : ''}  n=${N} ===`);
    console.log(`18歲 主遊戲 ${avg(runs, 'best18')} 反應 ${avg(runs, 'reflex18')} 學力 ${avg(runs, 'study18')}`);
    console.log(`職業門檻 ${pct(by((r) => r.proOk), N)}  升學門檻 ${pct(by((r) => r.studyOk), N)}  雙失敗 ${pct(by((r) => !r.proOk && !r.studyOk), N)}`);
    console.log(`路線：電競 ${pct(es.length, N)} 工程師 ${pct(en.length, N)} 平凡 ${pct(by((r) => r.path === 'ordinary'), N)}`);
    if (es.length) console.log(`  電競：世界冠軍 ${pct(es.filter((r) => r.ending === 'world_champ').length, es.length)}  曾進世界賽 ${pct(es.filter((r) => r.bestWorlds > 0).length, es.length)}  國內冠軍 ${pct(es.filter((r) => r.dom > 0).length, es.length)}  最高Tier ${avg(es, 'tier')}  結束年齡 ${avg(es, 'age')}`);
    if (en.length) {
      const g = {};
      for (const r of en) for (const k of Object.keys(r.grades)) g[k] = (g[k] || 0) + r.grades[k];
      const gt = Object.values(g).reduce((a, b) => a + b, 0);
      const ages = [1, 2, 3, 4, 5, 6].map((k) => {
        const v = en.filter((r) => r.rankAge[k] != null);
        return `${k}:${v.length ? (v.reduce((a, r) => a + r.rankAge[k], 0) / v.length).toFixed(0) : '-'}歲(${pct(v.length, en.length)})`;
      }).join(' ');
      console.log(`  考績 ${['S', 'A', 'B', 'C', 'D'].map((k) => k + ':' + pct(g[k] || 0, gt)).join(' ')}｜升到各職級的平均年齡 ${ages}`);
    }
    if (en.length) console.log(`  工程：大老闆 ${pct(en.filter((r) => r.ending === 'tech_boss').length, en.length)}  最高職級 ${avg(en, 'rank')}  倒閉 ${pct(en.filter((r) => r.bankrupt).length, en.length)}  結束年齡 ${avg(en, 'age')}`);
    console.log(`  感情：交往過 ${pct(by((r) => r.dated), N)}  分手過 ${pct(by((r) => r.brokeUp), N)}  結局時已婚 ${pct(by((r) => r.married), N)}`);
    const dist = (k) => ['S', 'A', 'B', 'C', 'D'].map((g) => g + ':' + pct(by((r) => r[k] === g), N)).join(' ');
    console.log(`  健康評等 ${dist('gh')}｜幸福度 ${dist('gm')}｜慢性病 ${pct(by((r) => r.chronic), N)}｜曾可財富自由 ${pct(by((r) => r.fire), N)}`);
    console.log(`  病倒率 ${pct(by((r) => r.collapsed), N)}  平均傳承點 ${avg(runs, 'legacy')}`);
    const mid = (k) => { const v = runs.map((r) => r[k]).sort((a, b) => a - b); return AW.fmtMoney(v[Math.floor(v.length / 2)]); };
    console.log(`  金錢：結局存款中位數 ${mid('money')}  繳稅中位數 ${mid('tax')}  負債過 ${pct(by((r) => r.debt), N)}  破產 ${pct(by((r) => r.ending === 'bankrupt'), N)}｜朋友平均 ${avg(runs, 'npcs')} 人${es.length ? `  與王選手交手 ${avg(es, 'h2h')} 次` : ''}`);
    console.log('  結局', JSON.stringify(endings));
  }
}
