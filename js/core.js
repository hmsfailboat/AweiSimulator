/* 阿維模擬器 — 核心：命名空間、隨機數、數值定義、效果套用 */
(function (root) {
  'use strict';
  const AW = (root.AW = root.AW || {});

  // ---------- 隨機數（mulberry32，可存檔重現） ----------
  AW.rng = {
    s: 1,
    seed(n) { this.s = (n >>> 0) || 1; },
    next() {
      let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
  AW.rand = () => AW.rng.next();
  AW.randInt = (a, b) => a + Math.floor(AW.rand() * (b - a + 1));
  AW.chance = (p) => AW.rand() < p;
  AW.pick = (arr) => arr[Math.floor(AW.rand() * arr.length)];
  AW.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  AW.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(AW.rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  AW.weightedPick = (items, weightOf) => {
    const total = items.reduce((sum, it) => sum + weightOf(it), 0);
    if (total <= 0) return null;
    let r = AW.rand() * total;
    for (const it of items) {
      r -= weightOf(it);
      if (r < 0) return it;
    }
    return items[items.length - 1];
  };
  // 可能是函式的值：fn(state) 或常數
  AW.val = (v, s, ...args) => (typeof v === 'function' ? v(s, ...args) : v);

  // ---------- 數值定義 ----------
  // kind: skill = 0~100 會成長；cond = 0~100 狀態；res = 資源
  AW.STATS = {
    fps:      { name: 'FPS 遊戲能力', short: 'FPS',  icon: '🎯', kind: 'skill' },
    dota:     { name: 'DOTA 遊戲能力', short: 'DOTA', icon: '🗡️', kind: 'skill' },
    reflex:   { name: '反應力',        short: '反應', icon: '⚡', kind: 'skill' },
    study:    { name: '學力',          short: '學力', icon: '📚', kind: 'skill' },
    social:   { name: '人緣',          short: '人緣', icon: '💬', kind: 'skill' },
    teamwork: { name: '團隊默契',      short: '默契', icon: '🤝', kind: 'skill' },
    tech:     { name: '技術力',        short: '技術', icon: '💻', kind: 'skill' },
    leader:   { name: '領導力',        short: '領導', icon: '👔', kind: 'skill' },
    health:   { name: '健康',          short: '健康', icon: '❤️', kind: 'cond' },
    mood:     { name: '心情',          short: '心情', icon: '😊', kind: 'cond' },
    fame:     { name: '名氣',          short: '名氣', icon: '⭐', kind: 'skill' },
    money:    { name: '金錢',          short: '金錢', icon: '💰', kind: 'res' },
  };
  AW.BIRTH_STATS = ['fps', 'dota', 'reflex', 'study', 'social'];
  AW.GAME_NAMES = { fps: 'FPS', dota: 'DOTA' };

  AW.fmtMoney = (n) => {
    const sign = n < 0 ? '-' : '';
    n = Math.abs(Math.round(n));
    if (n >= 100000000) return sign + (n / 100000000).toFixed(n >= 1e9 ? 1 : 2).replace(/\.?0+$/, '') + ' 億';
    if (n >= 10000) return sign + (n / 10000).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '') + ' 萬';
    return sign + n.toLocaleString('en-US') + ' 元';
  };

  // 'best' = 目前較高的遊戲能力；'main' = 電競主項目
  AW.resolveKey = (s, key) => {
    if (key === 'best') return s.stats.fps >= s.stats.dota ? 'fps' : 'dota';
    if (key === 'main') return (s.esports && s.esports.game) || (s.stats.fps >= s.stats.dota ? 'fps' : 'dota');
    return key;
  };

  AW.traitOf = (s) => (AW.TRAITS && AW.TRAITS[s.trait]) || {};

  AW.growthMult = (s, key) => {
    let m = 1;
    const g = AW.traitOf(s).growth || {};
    if (g[key]) m *= 1 + g[key];
    if (g.all && key !== 'fame') m *= 1 + g.all;
    if (g.game && (key === 'fps' || key === 'dota')) m *= 1 + g.game;
    m *= 1 + 0.04 * (s.memory || 0);
    if (key === 'reflex' && s.age < 12) m *= 1.3;
    if ((key === 'fps' || key === 'dota') && s.age >= 6 && s.age <= 15) m *= 1.15;
    if (key !== 'fame') {
      if (s.stats.mood >= 70) m *= 1.1;
      else if (s.stats.mood < 30) m *= 0.85;
    }
    return m;
  };

  AW.DIM = { cap: 120, pow: 1.8 };
  AW.diminish = (v) => Math.pow(Math.max(0.02, 1 - v / AW.DIM.cap), AW.DIM.pow);
  // 隨機進位：保留期望值，又能讓高數值時偶爾 +1
  AW.sround = (x) => { const f = Math.floor(x); return f + (AW.rand() < x - f ? 1 : 0); };

  /**
   * 套用效果。eff: { key: number }，key 可為 best/main。
   * 回傳實際變化 { key: delta }（已解析 key）。
   */
  AW.applyEffects = (s, eff, opts) => {
    const grow = !opts || opts.grow !== false;
    const out = {};
    if (!eff) return out;
    eff = AW.val(eff, s);
    const trait = AW.traitOf(s);
    for (const rawKey of Object.keys(eff)) {
      let v = AW.val(eff[rawKey], s);
      if (!v) continue;
      const key = AW.resolveKey(s, rawKey);
      const def = AW.STATS[key];
      if (!def) continue;
      const cur = s.stats[key] || 0;
      if (def.kind === 'res') {
        s.stats[key] = Math.round(cur + v);
      } else if (def.kind === 'cond') {
        if (v < 0 && trait.drain && trait.drain[key]) v *= 1 - trait.drain[key];
        v = Math.round(v);
        s.stats[key] = AW.clamp(cur + v, 0, 100);
      } else {
        if (v > 0 && grow) {
          v = AW.sround(v * AW.growthMult(s, key) * AW.diminish(cur));
        } else {
          v = Math.round(v);
        }
        s.stats[key] = AW.clamp(cur + v, 0, 100);
      }
      const d = s.stats[key] - cur;
      if (d) out[key] = (out[key] || 0) + d;
    }
    return out;
  };

  AW.mergeDeltas = (a, b) => {
    for (const k of Object.keys(b)) a[k] = (a[k] || 0) + b[k];
    for (const k of Object.keys(a)) if (!a[k]) delete a[k];
    return a;
  };

  // 預覽用：把效果物件轉成 [{key, v}]（未經加成）
  AW.previewEffects = (s, eff) => {
    eff = AW.val(eff, s);
    if (!eff) return [];
    return Object.keys(eff)
      .map((k) => ({ key: AW.resolveKey(s, k), v: AW.val(eff[k], s) }))
      .filter((x) => x.v && AW.STATS[x.key]);
  };
})(typeof window !== 'undefined' ? window : globalThis);
