/* 畫面渲染與互動 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const E = AW.Engine;
  const doc = root.document;

  const esc = (str) => String(str == null ? '' : str).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl = (str) => esc(str).replace(/\n/g, '<br>');

  const UI = (AW.UI = {
    S: null,
    screen: 'title',
    ui: {},
    prevStats: null,
    timers: [],

    init() {
      AW.Meta.load();
      this.app = doc.getElementById('app');
      this.modalEl = doc.getElementById('modal');
      this.toastEl = doc.getElementById('toasts');
      doc.addEventListener('click', (ev) => {
        const t = ev.target.closest('[data-act]');
        if (!t || t.disabled || t.classList.contains('disabled')) return;
        const fn = this.handlers[t.dataset.act];
        if (fn) { ev.preventDefault(); fn.call(this, t.dataset, t); }
      });
      doc.addEventListener('input', (ev) => {
        if (ev.target.id === 'pro-name') {
          const p = doc.getElementById('name-preview');
          const v = ev.target.value.trim();
          if (p) p.textContent = 'Aweiisa' + (v || '＿＿＿');
          const btn = doc.getElementById('confirm-name');
          if (btn) btn.disabled = !v;
        }
      });
      doc.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && ev.target.id === 'pro-name') this.handlers['confirm-name'].call(this);
        if (ev.key === 'Escape') this.closeModal();
      });
      this.render();
    },

    // ======================= 共用 =======================
    clearTimers() { this.timers.forEach((t) => clearTimeout(t)); this.timers = []; },
    later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },

    statVal(k, v) { return k === 'money' ? AW.fmtMoney(v) : Math.round(v); },
    chip(key, v, cls) {
      const d = AW.STATS[key];
      if (!d) return '';
      const sign = v > 0 ? '+' : '';
      const val = key === 'money' ? sign + AW.fmtMoney(v).replace(' 元', '') : sign + Math.round(v);
      return `<span class="chip ${cls || (v > 0 ? (key === 'money' ? 'gold' : 'up') : 'down')}" title="${esc(d.name)}">${d.icon}${esc(val)}</span>`;
    },
    chips(list) {
      if (!list) return '';
      if (!Array.isArray(list)) list = Object.keys(list).map((k) => ({ key: k, v: list[k] }));
      return list.filter((x) => x.v).map((x) => this.chip(x.key, x.v)).join('');
    },
    previewChips(s, a) {
      let out = this.chips(AW.previewEffects(s, a.effects));
      const cost = E.actionCost(s, a);
      if (cost) out += this.chip('money', -cost);
      if (a.perf) out += `<span class="chip info">📈績效+${a.perf}</span>`;
      if (a.sp) out += `<span class="chip info">🚀衝刺+${a.sp}</span>`;
      if (a.run && !a.effects) out += '<span class="chip info">🎲 特殊</span>';
      return out;
    },

    toast(html, cls) {
      const el = doc.createElement('div');
      el.className = 'toast ' + (cls || '');
      el.innerHTML = html;
      this.toastEl.appendChild(el);
      setTimeout(() => el.classList.add('out'), 3200);
      setTimeout(() => el.remove(), 3700);
    },
    flushAchievements() {
      const s = this.S;
      if (!s || !s.newAchievements || !s.newAchievements.length) return;
      for (const id of s.newAchievements) {
        const a = AW.ACHIEVEMENTS.find((x) => x.id === id);
        if (a) this.toast(`<b>🏅 成就解鎖：${a.icon} ${esc(a.name)}</b><br><small>${esc(a.desc)}　傳承點 +1</small>`, 'ach');
      }
      s.newAchievements = [];
    },

    modal(html) {
      this.modalEl.innerHTML = `<div class="modal-box">${html}</div>`;
      this.modalEl.classList.remove('hidden');
    },
    closeModal() { this.modalEl.classList.add('hidden'); this.modalEl.innerHTML = ''; },
    confirm(text, act, label) {
      this.modal(`<p>${nl(text)}</p><div class="row end"><button class="btn ghost" data-act="close-modal">取消</button>
        <button class="btn danger" data-act="${act}">${esc(label || '確定')}</button></div>`);
    },

    go(screen) { this.clearTimers(); this.screen = screen; this.ui = {}; this.render(); root.scrollTo && root.scrollTo(0, 0); },

    // ======================= 主渲染 =======================
    render() {
      const fn = { title: this.rTitle, birth: this.rBirth, game: this.rGame, ending: this.rEnding, shop: this.rShop, gallery: this.rGallery }[this.screen];
      this.app.innerHTML = fn.call(this);
      // 進度條動畫：從舊值滑到新值
      const fills = this.app.querySelectorAll('[data-w]');
      if (fills.length) requestAnimationFrame(() => requestAnimationFrame(() => fills.forEach((el) => { el.style.width = el.dataset.w + '%'; })));
      if (this.screen === 'game' && this.S) this.prevStats = Object.assign({}, this.S.stats);
      this.flushAchievements();
      if (this.afterRender) { const f = this.afterRender; this.afterRender = null; f(); }
    },

    header(extra) {
      const m = AW.Meta.get();
      return `<header class="top">
        <div class="brand" data-act="${this.screen === 'game' ? 'menu' : 'to-title'}">🎮 阿維模擬器</div>
        <div class="top-right">${extra || ''}<span class="pill" title="傳承點">🧬 ${m.legacy}</span>
        ${this.screen === 'game' ? '<button class="btn icon" data-act="menu" title="選單">☰</button>' : ''}</div>
      </header>`;
    },

    // ======================= 標題 =======================
    rTitle() {
      const m = AW.Meta.get();
      const has = AW.Save.has();
      const endingsGot = Object.keys(m.endings).length;
      return `<div class="title-screen">
        <div class="logo">🎮</div>
        <h1>阿維模擬器</h1>
        <p class="tagline">養成一位遊戲天才的人生<br><small>電競世界冠軍？還是科技公司大老闆？</small></p>
        <div class="menu-col">
          ${has ? '<button class="btn primary big" data-act="continue">▶ 繼續人生</button>' : ''}
          <button class="btn ${has ? '' : 'primary'} big" data-act="new">👶 開始新人生</button>
          <button class="btn big" data-act="shop">🏛️ 傳承商店 <span class="pill">🧬 ${m.legacy}</span></button>
          <button class="btn big" data-act="gallery">📖 結局與成就 <span class="pill">${endingsGot}/${Object.keys(AW.ENDINGS).length}</span></button>
          <button class="btn ghost" data-act="help">❓ 遊戲說明</button>
        </div>
        <p class="foot">已重生 ${m.runs} 次 · 致敬遊戲天才阿維</p>
      </div>`;
    },

    // ======================= 出生設定 =======================
    rBirth() {
      const u = this.ui;
      if (!u.traits) { u.traits = E.rollTraitChoices(); u.alloc = {}; u.trait = null; }
      const total = E.birthPoints();
      const used = Object.values(u.alloc).reduce((a, b) => a + b, 0);
      const left = total - used;
      const traitCards = u.traits.map((id) => {
        const t = AW.TRAITS[id];
        return `<button class="trait-card ${u.trait === id ? 'selected' : ''}" data-act="pick-trait" data-id="${id}">
          <div class="t-icon">${t.icon}</div><div class="t-name">${esc(t.name)}</div><div class="t-desc">${esc(t.desc)}</div></button>`;
      }).join('');
      const rows = AW.BIRTH_STATS.map((k) => {
        const d = AW.STATS[k];
        const v = u.alloc[k] || 0;
        const bonus = (AW.TRAITS[u.trait] && AW.TRAITS[u.trait].start && AW.TRAITS[u.trait].start[k]) || 0;
        const val = v * 3 + bonus;
        return `<div class="alloc-row">
          <span class="a-name">${d.icon} ${esc(d.name)}</span>
          <button class="btn icon sm" data-act="alloc" data-key="${k}" data-d="-1" ${v <= 0 ? 'disabled' : ''}>－</button>
          <span class="pips">${'<i class="on"></i>'.repeat(v)}${'<i></i>'.repeat(5 - v)}</span>
          <button class="btn icon sm" data-act="alloc" data-key="${k}" data-d="1" ${v >= 5 || left <= 0 ? 'disabled' : ''}>＋</button>
          <span class="a-val">${val}</span>
        </div>`;
      }).join('');
      return `${this.header()}
      <div class="page narrow">
        <h2>👶 劉家維即將誕生</h2>
        <section class="card">
          <h3>① 選擇天賦 <small>（從已解鎖的天賦中抽出 3 個）</small></h3>
          <div class="trait-grid">${traitCards}</div>
        </section>
        <section class="card">
          <h3>② 分配初始點數 <span class="pill ${left ? 'warn' : 'ok'}">剩餘 ${left} / ${total}</span></h3>
          <p class="muted">每點 +3，單項最多 5 點。</p>
          <div class="alloc">${rows}</div>
          <div class="row"><button class="btn ghost sm" data-act="alloc-random">🎲 隨機分配</button>
          <button class="btn ghost sm" data-act="alloc-reset">↺ 重設</button></div>
        </section>
        <div class="row end">
          <button class="btn ghost" data-act="to-title">返回</button>
          <button class="btn primary big" data-act="born" ${u.trait ? '' : 'disabled'}>${u.trait ? (left ? `👶 誕生！（${left} 點未分配）` : '👶 誕生！') : '請先選擇天賦'}</button>
        </div>
      </div>`;
    },

    // ======================= 遊戲主畫面 =======================
    rGame() {
      const s = this.S;
      return `${this.header()}
      <div class="layout">
        <aside class="panel">${this.rPanel(s)}</aside>
        <main class="main">${this.rMain(s)}</main>
        <aside class="log">${this.rLog(s)}</aside>
      </div>`;
    },

    avatar(s) {
      if (s.phase === 'student' && s.age >= 18 && !s.flags.extraYear) return '🧑‍🎓';
      return { infant: '👶', elem: '🧒', junior: '👦', senior: '🧑', extra: '😤', pro: '😎', uni: '🧑‍🎓', job: '🧑‍💻', startup: '🧑‍💼' }[E.stageKey(s)];
    },

    bar(s, k, opts) {
      const d = AW.STATS[k];
      const v = Math.round(s.stats[k]);
      const prev = this.prevStats ? Math.round(this.prevStats[k]) : v;
      const diff = v - prev;
      const cls = (opts && opts.cls) || '';
      const label = (opts && opts.label) || d.name;
      return `<div class="stat ${cls} ${d.kind}">
        <div class="stat-top"><span>${d.icon} ${esc(label)}</span>
          <b>${v}${diff ? `<em class="${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '+' : ''}${diff}</em>` : ''}</b></div>
        <div class="bar"><div class="fill k-${k}" style="width:${prev}%" data-w="${v}"></div></div>
      </div>`;
    },

    rPanel(s) {
      const st = E.stage(s);
      let skills;
      if (s.phase === 'esports') {
        const main = s.esports.game;
        const other = main === 'fps' ? 'dota' : 'fps';
        skills = [this.bar(s, main, { cls: 'hl', label: `主項目・${AW.STATS[main].name}` }), this.bar(s, 'reflex'), this.bar(s, 'teamwork'),
          this.bar(s, 'fame'), this.bar(s, 'social'), this.bar(s, other, { cls: 'dim' })];
      } else if (s.phase === 'engineer') {
        skills = [this.bar(s, 'tech', { cls: 'hl' }), this.bar(s, 'leader'), this.bar(s, 'social'), this.bar(s, 'study'),
          this.bar(s, AW.resolveKey(s, 'best'), { cls: 'dim' })];
        if (s.stats.fame) skills.push(this.bar(s, 'fame', { cls: 'dim' }));
      } else {
        skills = AW.BIRTH_STATS.map((k) => this.bar(s, k));
      }
      const t = AW.traitOf(s);
      const money = s.stats.money;
      const pm = this.prevStats ? this.prevStats.money : money;
      return `<div class="who">
          <div class="avatar">${this.avatar(s)}</div>
          <div><div class="name">${esc(s.displayName)}</div>
          <div class="sub">${s.age} 歲 · ${st.icon} ${esc(E.title(s) || st.name)}</div></div>
        </div>
        ${this.rCareerBox(s)}
        <div class="group skills"><div class="g-title">能力</div>${skills.join('')}</div>
        <div class="group conds"><div class="g-title">狀態</div>${this.bar(s, 'health')}${this.bar(s, 'mood')}</div>
        <div class="money">💰 ${AW.fmtMoney(money)} ${money !== pm ? `<em class="${money > pm ? 'up' : 'down'}">${money > pm ? '+' : ''}${AW.fmtMoney(money - pm)}</em>` : ''}</div>
        <div class="trait-tag" title="${esc(t.desc || '')}">${t.icon || ''} 天賦：${esc(t.name || '無')}</div>`;
    },

    rCareerBox(s) {
      if (s.phase === 'esports') {
        const e = s.esports;
        const T = AW.Esports.TIERS[e.tier];
        return `<div class="career">
          <div class="c-row"><span>${T.icon} ${esc(e.team)}</span><span class="muted">${T.name}</span></div>
          <div class="c-row"><span>個人戰力 <b>${Math.round(AW.Esports.power(s))}</b></span><span>隊伍戰力 <b>${Math.round(AW.Esports.teamPower(s))}</b></span></div>
          <div class="c-row"><span>🥇 ×${e.domesticTitles}　🏆 ×${e.worldTitles}</span><span class="muted">世界賽最佳：${['—', '小組賽', '八強', '四強', '亞軍', '冠軍'][e.bestWorlds]}</span></div>
        </div>`;
      }
      if (s.phase === 'engineer') {
        const e = s.eng;
        const Eg = AW.Engineer;
        if (e.stage === 'uni') return `<div class="career"><div class="c-row"><span>🏛️ ${e.topUni ? '頂尖大學' : '大學'}資工系</span><span class="muted">${s.age >= 22 ? '畢業' : `大${s.age - 17}`}</span></div>
          <div class="c-row"><span>實習經歷 ${e.interns} 次</span><span class="muted">22 歲畢業求職</span></div></div>`;
        if (e.stage === 'startup') {
          const track = Eg.STARTUP.map((x, i) => `<span class="${i < e.startup ? 'done' : i === e.startup ? 'cur' : ''}" title="${x.name}">${x.icon}</span>`).join('<i>›</i>');
          return `<div class="career"><div class="c-row"><span>🚀 ${esc(e.startupName)}</span><span class="muted">${Eg.STARTUP[e.startup].name}</span></div>
            <div class="track">${track}</div>
            <div class="c-row"><span>資金跑道 ${'🔋'.repeat(Math.max(0, e.runway))}${'🪫'.repeat(Math.max(0, 3 - e.runway))}</span></div></div>`;
        }
        const need = Eg.promoNeed(s);
        return `<div class="career">
          <div class="c-row"><span>${Eg.COMPANY[e.company].icon} ${esc(e.companyName)}</span><span class="muted">${Eg.COMPANY[e.company].name}</span></div>
          <div class="c-row"><span>👔 ${Eg.rankName(s)}</span><span class="muted">${e.lastGrade ? `上次考績 ${e.lastGrade}` : ''}</span></div>
          ${e.rank < 6 ? `<div class="c-row"><span>升遷點數</span><span>${e.promo} / ${need}</span></div>
          <div class="bar thin"><div class="fill k-leader" style="width:${Math.min(100, e.promo / need * 100)}%"></div></div>` : ''}
        </div>`;
      }
      return '';
    },

    rLog(s) {
      const items = s.log.slice(-80).reverse();
      let lastAge = null;
      let html = '';
      for (const it of items) {
        if (it.age !== lastAge) { html += `<div class="log-age">${it.age} 歲</div>`; lastAge = it.age; }
        html += `<div class="log-item"><span>${it.icon}</span><span>${esc(it.text)}</span></div>`;
      }
      return `<details open class="log-box"><summary>📜 人生紀錄</summary><div class="log-list">${html}</div></details>`;
    },

    stepper(s) {
      const steps = s.phase === 'esports' ? ['事件', '訓練', '賽季', '結算'] : ['事件', '行動', '結算'];
      const cur = { event: 0, action: 1, season: 2, summary: steps.length - 1 }[s.step];
      return `<div class="stepper">${steps.map((n, i) => `<span class="${i === cur ? 'cur' : i < cur ? 'done' : ''}">${n}</span>`).join('<i>›</i>')}</div>`;
    },

    rMain(s) {
      if (s.step === 'check') return this.rCheck(s);
      if (s.step === 'decision') return `<div class="year-head"><h2>📅 ${s.age} 歲</h2></div>${this.rDecision(s)}`;
      let body = '';
      if (s.step === 'event') body = this.rEvent(s);
      else if (s.step === 'action') body = this.rActions(s);
      else if (s.step === 'season') body = this.rSeason(s);
      else if (s.step === 'summary') body = this.rSummary(s);
      return `<div class="year-head"><h2>📅 ${s.age} 歲${s.age === 0 ? '・誕生的那一年' : ''}</h2>${this.stepper(s)}</div>${this.rFlags(s)}${body}`;
    },

    rFlags(s) {
      const f = s.yearFlags;
      const out = [];
      if (f.noGame) out.push('🚫 今年被禁止打電動');
      if (f.sick) out.push('🤒 病後休養：行動數 -1');
      if (f.burnout) out.push('🌫️ 倦怠中：行動數 -1');
      return out.length ? `<div class="flags">${out.map((x) => `<span class="pill warn">${x}</span>`).join('')}</div>` : '';
    },

    // ---------- 事件 ----------
    rEvent(s) {
      const e = E.currentEvent(s);
      if (!e) return '';
      const total = s.pendingEvents.length;
      const r = s.eventResult;
      let actions;
      if (!r) {
        if (e.choices && e.choices.length) {
          actions = `<div class="choices">${E.visibleChoices(s, e).map(({ c, i, ok }) =>
            `<button class="btn choice" data-act="choice" data-i="${i}" ${ok ? '' : 'disabled'}>${esc(c.text)}${c.roll ? ' <small>🎲</small>' : ''}</button>`).join('')}</div>`;
        } else {
          actions = `<div class="choices"><button class="btn primary" data-act="choice" data-i="-1">好的</button></div>`;
        }
      } else {
        const roll = r.roll ? `<div class="roll ${r.roll.ok ? 'ok' : 'bad'}">🎲 成功率 ${Math.round(r.roll.p * 100)}% → ${r.roll.ok ? '成功！' : '失敗……'}</div>` : '';
        actions = `<div class="result">${roll}${r.text ? `<p>${esc(r.text)}</p>` : ''}<div class="chips-row">${this.chips(r.deltas) || '<span class="muted">（沒有數值變化）</span>'}</div></div>
          <div class="choices"><button class="btn primary" data-act="event-next">繼續 ▶</button></div>`;
      }
      return `<section class="card event pop">
        ${total > 1 ? `<div class="ev-count">今年還有 ${total - 1} 個事件</div>` : ''}
        <div class="ev-icon">${e.icon}</div>
        <h3>${esc(e.title)}</h3>
        <p class="ev-text">${nl(E.eventText(s, e))}</p>
        ${actions}
      </section>`;
    },

    // ---------- 行動 ----------
    rActions(s) {
      const u = this.ui;
      u.selected = (u.selected || []).filter((id) => { const a = AW.ACTION_MAP[id]; return a && E.actionState(s, a).ok; });
      const n = E.slots(s);
      const list = E.availableActions(s);
      const cards = list.map(({ a, ok, reason }) => {
        const sel = u.selected.includes(a.id);
        return `<button class="action-card ${sel ? 'selected' : ''} ${ok ? '' : 'disabled'}" data-act="toggle" data-id="${a.id}" ${ok ? '' : 'disabled'}>
          <div class="ac-head"><span class="ac-icon">${a.icon}</span><span class="ac-name">${esc(a.name)}</span>${sel ? '<span class="ac-check">✓</span>' : ''}</div>
          <div class="ac-desc">${esc(a.desc || '')}</div>
          <div class="chips-row">${this.previewChips(s, a)}</div>
          ${ok ? '' : `<div class="ac-lock">🔒 ${esc(reason)}</div>`}
        </button>`;
      }).join('');
      const can = u.selected.length >= Math.min(n, list.filter((x) => x.ok).length) && u.selected.length > 0;
      const label = s.phase === 'esports' ? '開始賽季 ▶' : '結束這一年 ▶';
      return `<section class="card">
        <h3>${s.phase === 'esports' ? '選擇本季的訓練重點' : '選擇今年要做的事'} <span class="pill ${u.selected.length === n ? 'ok' : ''}">${u.selected.length} / ${n}</span></h3>
        <p class="muted small">數值為基礎值，實際成長受天賦、年齡、心情與目前數值（越高越難練）影響。</p>
        <div class="action-grid">${cards}</div>
        <div class="row end sticky-go"><button class="btn primary big" data-act="commit" ${can ? '' : 'disabled'}>${label}</button></div>
      </section>`;
    },

    // ---------- 賽季 ----------
    seasonGames(season) {
      let n = 0;
      for (const st of season.stages) for (const m of st.matches) n += m.games.length;
      return n;
    },
    startSeasonAnim() {
      const s = this.S;
      const total = this.seasonGames(s.season);
      this.ui.cursor = 0;
      const tick = () => {
        if (this.screen !== 'game' || !this.S || this.S.step !== 'season') return;
        this.ui.cursor += 1;
        this.updateSeason();
        if (this.ui.cursor < total) this.later(tick, 170);
      };
      this.later(tick, 400);
    },
    updateSeason() {
      const el = doc.getElementById('season');
      if (el) el.outerHTML = this.rSeasonInner(this.S);
      const box = doc.getElementById('season');
      if (box) { const last = box.querySelector('.match.live') || box.querySelector('.stage:last-child'); if (last && last.scrollIntoView && this.ui.cursor > 3) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    },
    rSeason(s) {
      if (this.ui.cursor == null) { this.ui.cursor = 0; this.afterRender = () => this.startSeasonAnim(); }
      return this.rSeasonInner(s);
    },
    rSeasonInner(s) {
      const season = s.season;
      const total = this.seasonGames(season);
      let left = this.ui.cursor == null ? total : this.ui.cursor;
      const done = left >= total;
      let html = '';
      for (const st of season.stages) {
        if (left <= 0) break;
        let rows = '';
        let stageDone = true;
        for (const m of st.matches) {
          if (left <= 0) { stageDone = false; break; }
          const shown = m.games.slice(0, left);
          left -= shown.length;
          const full = shown.length === m.games.length;
          if (!full) stageDone = false;
          const w = shown.filter(Boolean).length;
          const l = shown.length - w;
          rows += `<div class="match ${full ? (m.won ? 'won' : 'lost') : 'live'}">
            <span class="m-round">${esc(m.round || (m.bo === 1 ? 'BO1' : `BO${m.bo}`))}</span>
            <span class="m-opp">vs ${esc(m.oppName)} <small>(${m.opp})</small></span>
            <span class="m-prob" title="單局勝率">${Math.round(m.p * 100)}%</span>
            <span class="m-games">${shown.map((g) => (g ? '🟢' : '🔴')).join('')}</span>
            <span class="m-res">${full ? `${w}:${l} ${m.won ? '勝' : '敗'}` : `${w}:${l}`}</span>
          </div>`;
        }
        html += `<div class="stage"><div class="stage-name">${st.icon} ${esc(st.name)}</div>${rows}
          ${stageDone ? `<div class="stage-note ${st.passed ? 'ok' : 'bad'}">${esc(st.note)}</div>` : ''}</div>`;
      }
      return `<section class="card season" id="season">
        <h3>🎮 ${esc(s.esports.team)} 的賽季 <span class="pill">隊伍戰力 ${season.T}</span></h3>
        ${html}
        <div class="row end">${done
          ? '<button class="btn primary big" data-act="season-done">查看年度結算 ▶</button>'
          : '<button class="btn ghost" data-act="season-skip">⏩ 跳過動畫</button>'}</div>
      </section>`;
    },

    // ---------- 結算 ----------
    rSummary(s) {
      const diff = E.yearDiff(s);
      const acts = (s.actionResults || []).map((r) => {
        const a = AW.ACTION_MAP[r.id];
        return `<div class="sum-act"><span>${a.icon} ${esc(a.name)}</span>${r.text ? `<small>${esc(r.text)}</small>` : ''}</div>`;
      }).join('');
      const notes = s.yearNotes.map((n) => `<div class="note"><span>${n.icon}</span><span>${esc(n.text)}</span></div>`).join('');
      let review = '';
      const rv = s.review;
      if (rv && !rv.startup) {
        review = `<div class="review"><div class="grade g-${rv.grade}">${rv.grade}</div><div>
          <div><b>年度考績</b>（升遷點數 ${rv.pts >= 0 ? '+' : ''}${rv.pts}）</div>
          ${rv.promoted ? `<div class="ok">🎉 升任「${esc(AW.Engineer.RANKS[rv.rank].name)}」！</div>` : ''}
          ${rv.rank < 6 ? `<div class="muted small">下一職級「${esc(AW.Engineer.RANKS[rv.rank + 1].name)}」：點數 ${rv.promo}/${rv.need}${rv.miss.length ? `，還需要 ${esc(rv.miss.join('、'))}` : '，能力已達標'}</div>` : ''}
        </div></div>`;
      } else if (rv && rv.startup) {
        const label = { up: '🚀 公司晉級！', hold: '😐 進展有限', bad: '📉 遭遇挫折', bankrupt: '💥 公司倒閉' }[rv.result];
        review = `<div class="review"><div class="grade ${rv.result === 'up' ? 'g-S' : rv.result === 'hold' ? 'g-B' : 'g-D'}">${AW.Engineer.STARTUP[rv.stage].icon}</div>
          <div><b>${label}</b><div class="muted small">創業評分 ${rv.score}（≥ 58 晉級；階段越後面越難）</div></div></div>`;
      }
      const end = s.pendingEnding;
      const canRetire = !end && ((s.phase === 'esports' && AW.Esports.canRetire(s)) || (s.phase === 'engineer' && AW.Engineer.canRetire(s)));
      return `<section class="card summary pop">
        <h3>📋 ${s.age} 歲・年度結算</h3>
        ${acts ? `<div class="sum-acts">${acts}</div>` : ''}
        ${review}
        ${notes ? `<div class="notes">${notes}</div>` : ''}
        <div class="g-title">今年的變化</div>
        <div class="chips-row">${this.chips(diff) || '<span class="muted">平靜的一年。</span>'}</div>
        ${s.decision ? this.rDecision(s) : ''}
        <div class="row end">
          ${canRetire ? `<button class="btn ghost" data-act="retire">${s.phase === 'esports' ? '👋 宣布退役' : '🌅 提前退休'}</button>` : ''}
          <button class="btn primary big" data-act="next-year" ${s.decision ? 'disabled' : ''}>${end ? '🎬 迎接結局 ▶' : '迎接下一年 ▶'}</button>
        </div>
      </section>`;
    },

    rDecision(s) {
      const d = s.decision;
      if (!d) return '';
      return `<div class="decision pop"><h4>${d.icon || '📌'} ${esc(d.title)}</h4><p>${nl(d.text)}</p>
        <div class="choices">${d.options.map((o, i) => `<button class="btn choice" data-act="decide" data-i="${i}">${esc(o.label)}${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</button>`).join('')}</div></div>`;
    },

    // ---------- 成年檢定 ----------
    rCheck(s) {
      const info = E.checkInfo(s);
      const u = this.ui;
      const cr = s.checkResult;
      if (u.naming) return this.rNaming(s, info);
      const meter = (label, icon, v, need, extra) => `<div class="meter">
        <div class="stat-top"><span>${icon} ${label}</span><b class="${v >= need ? 'ok' : 'bad'}">${Math.round(v)} / ${need} ${v >= need ? '✔' : '✘'}</b></div>
        <div class="bar"><div class="fill ${v >= need ? 'k-ok' : 'k-bad'}" style="width:${v}%"></div><i class="mark" style="left:${need}%"></i>${extra || ''}</div></div>`;
      let tryout = '';
      if (cr && cr.tryout) {
        const shown = u.rollShown || !u.rollAnim;
        const roll = u.roll != null ? u.roll : (cr.ok ? cr.chance / 2 : (1 + cr.chance) / 2);
        tryout = `<div class="tryout">
          <div class="stat-top"><span>🎲 試訓判定</span><b>成功率 ${Math.round(cr.chance * 100)}%</b></div>
          <div class="roll-bar"><div class="zone" style="width:${cr.chance * 100}%"></div>
            <i class="needle" style="left:${u.rollAnim && !u.rollShown ? 0 : roll * 100}%" data-left="${roll * 100}"></i></div>
          ${shown ? `<div class="roll-res ${cr.ok ? 'ok' : 'bad'}">${cr.ok ? '✅ 試訓通過！戰隊經理向你伸出了手。' : '❌ 試訓沒有通過……'}</div>` : '<div class="muted">判定中……</div>'}
        </div>`;
      }
      let btns = [];
      const settled = !cr || !u.rollAnim || u.rollShown;
      if (settled) {
        if (cr && cr.ok) btns.push('<button class="btn primary big" data-act="go-naming">🎮 成為職業選手 ▶</button>');
        else {
          if (!cr && info.proOk) btns.push(`<button class="btn primary big" data-act="tryout">🎮 參加戰隊試訓（成功率 ${Math.round(info.chance * 100)}%）</button>`);
          if (info.studyOk) btns.push(`<button class="btn ${!cr && info.proOk ? '' : 'primary'} big" data-act="go-uni">📚 ${info.topUni ? '進入頂尖大學' : '去讀大學'}資工系</button>`);
          if ((cr || !info.proOk) && !info.studyOk) {
            if (!info.second) btns.push('<button class="btn primary big" data-act="go-extra">⏳ 再拚一年（延長賽）</button>');
            else btns.push('<button class="btn big" data-act="go-ordinary">😔 接受平凡的人生</button>');
          }
        }
      }
      let verdict;
      if (info.proOk && info.studyOk) verdict = '兩個門檻都達標了！要賭一把職業夢，還是穩穩去讀大學？（試訓失敗會自動去讀大學）';
      else if (info.proOk) verdict = '遊戲實力達標！去戰隊試訓吧。（失敗的話……）';
      else if (info.studyOk) verdict = '學力達標，可以考上資工系。職業選手的夢……就先放在心裡吧。';
      else verdict = info.second ? '這是最後一次機會了……' : '兩個門檻都沒有達標。要再拚一年嗎？';
      return `<div class="year-head"><h2>🎂 ${s.age} 歲・成年檢定${info.second ? '（延長賽）' : ''}</h2></div>
      <section class="card check pop">
        <div class="check-grid">
          <div class="check-col ${info.proOk ? 'pass' : ''}">
            <h4>🎮 職業門檻 ${info.proOk ? '<span class="pill ok">達標</span>' : '<span class="pill bad">未達標</span>'}</h4>
            ${meter(`主遊戲（${AW.GAME_NAMES[info.bestKey]}）`, AW.STATS[info.bestKey].icon, info.best, 60)}
            ${meter('反應力', '⚡', s.stats.reflex, 42)}
            ${s.flags.scouted ? '<div class="muted small">🕵️ 有球探推薦：試訓成功率 +10%</div>' : ''}
          </div>
          <div class="check-col ${info.studyOk ? 'pass' : ''}">
            <h4>📚 升學門檻 ${info.studyOk ? '<span class="pill ok">達標</span>' : '<span class="pill bad">未達標</span>'}</h4>
            ${meter('學力', '📚', s.stats.study, 50)}
            <div class="muted small">學力 ≥ 80 可進入頂尖大學（職涯起點更好）</div>
          </div>
        </div>
        <p class="verdict">${esc(verdict)}</p>
        ${tryout}
        <div class="row end wrap">${btns.join('')}</div>
      </section>`;
    },

    rNaming(s, info) {
      const g = this.ui.game || info.bestKey;
      const opt = (k) => `<button class="game-opt ${g === k ? 'selected' : ''}" data-act="set-game" data-g="${k}">
        <span class="g-icon">${AW.STATS[k].icon}</span><span>${AW.GAME_NAMES[k]}</span><b>${Math.round(s.stats[k])}</b></button>`;
      return `<div class="year-head"><h2>🎮 職業選手登錄</h2></div>
      <section class="card naming pop">
        <h3>選手 ID</h3>
        <p class="muted">職業選手 ID 以「Aweiisa」為前綴。</p>
        <div class="name-input"><span class="prefix">Aweiisa</span><input id="pro-name" maxlength="12" autocomplete="off" placeholder="輸入名字，例：dog" value="${esc(this.ui.nameDraft || '')}"></div>
        <div class="name-preview">顯示名稱：<b id="name-preview">Aweiisa${esc(this.ui.nameDraft || '＿＿＿')}</b></div>
        <h3>主攻項目</h3>
        <div class="game-opts">${opt('fps')}${opt('dota')}</div>
        <div class="row end"><button class="btn primary big" id="confirm-name" data-act="confirm-name" ${this.ui.nameDraft ? '' : 'disabled'}>✍️ 簽下合約 ▶</button></div>
      </section>`;
    },

    // ======================= 結局 =======================
    rEnding() {
      const s = this.S;
      const end = AW.ENDINGS[s.ending.id];
      const parts = s.ending.parts.map(([n, v]) => `<div class="c-row"><span>${esc(n)}</span><b>+${v}</b></div>`).join('');
      let career = '';
      if (s.esports) {
        career = `<h4>🎮 職業生涯</h4><div class="history">${s.esports.history.map((h) =>
          `<div class="c-row"><span>${h.age} 歲・${esc(h.team)}</span><span class="muted">${esc(h.summary)}</span></div>`).join('')}</div>`;
      } else if (s.eng && s.eng.stage !== 'uni') {
        career = `<h4>💼 職涯</h4><div class="c-row"><span>最高職級</span><b>${esc(AW.Engineer.RANKS[Math.max(s.eng.bestRank, s.eng.rank)].name)}</b></div>
          ${s.flags.founded ? `<div class="c-row"><span>創業</span><b>${esc(s.eng.startupName)}・${AW.Engineer.STARTUP[s.eng.startup].name}</b></div>` : ''}`;
      }
      const stats = ['fps', 'dota', 'reflex', 'study', 'social', 'tech', 'leader', 'teamwork', 'fame']
        .filter((k) => s.stats[k]).map((k) => `<span class="chip info">${AW.STATS[k].icon}${Math.round(s.stats[k])}</span>`).join('');
      return `${this.header()}
      <div class="page narrow">
        <section class="card ending ${end.good ? 'good' : ''} pop">
          <div class="end-icon">${end.icon}</div>
          <div class="end-label">結局</div>
          <h2>${esc(end.name)}</h2>
          <p class="end-text">${esc(end.text(s))}</p>
          <div class="end-meta">${esc(s.displayName)} · ${s.age} 歲，故事告一段落</div>
          <div class="chips-row center">${stats}<span class="chip gold">💰${AW.fmtMoney(s.stats.money)}</span></div>
        </section>
        <section class="card">
          ${career}
          <h4>🧬 傳承點結算</h4>${parts}
          <div class="c-row total"><span>合計</span><b>+${s.ending.legacy}</b></div>
          <p class="muted small">傳承點可在傳承商店購買永久升級，或解鎖新天賦。</p>
        </section>
        <div class="row end wrap">
          <button class="btn" data-act="gallery">📖 圖鑑</button>
          <button class="btn" data-act="shop">🏛️ 傳承商店</button>
          <button class="btn primary big" data-act="new">🔁 重生</button>
        </div>
      </div>`;
    },

    // ======================= 傳承商店 =======================
    rShop() {
      const m = AW.Meta.get();
      const ups = Object.keys(AW.UPGRADES).map((id) => {
        const u = AW.UPGRADES[id];
        const lv = m.upgrades[id] || 0;
        const max = lv >= u.max;
        const c = max ? 0 : u.cost(lv);
        return `<div class="shop-item"><div class="si-icon">${u.icon}</div>
          <div class="si-body"><b>${esc(u.name)}</b> <span class="muted">Lv.${lv}/${u.max}</span><div class="muted small">${esc(u.desc)}</div></div>
          <button class="btn ${!max && m.legacy >= c ? 'primary' : ''}" data-act="buy" data-id="${id}" ${max || m.legacy < c ? 'disabled' : ''}>${max ? '已滿級' : `🧬 ${c}`}</button></div>`;
      }).join('');
      const traits = Object.keys(AW.TRAITS).map((id) => {
        const t = AW.TRAITS[id];
        const got = m.traits.includes(id);
        return `<div class="shop-item ${got ? 'owned' : ''}"><div class="si-icon">${t.icon}</div>
          <div class="si-body"><b>${esc(t.name)}</b><div class="muted small">${esc(t.desc)}</div></div>
          ${got ? '<span class="pill ok">已解鎖</span>' : `<button class="btn ${m.legacy >= t.cost ? 'primary' : ''}" data-act="unlock" data-id="${id}" ${m.legacy < t.cost ? 'disabled' : ''}>🧬 ${t.cost}</button>`}</div>`;
      }).join('');
      return `${this.header()}
      <div class="page narrow">
        <h2>🏛️ 傳承商店 <span class="pill">🧬 ${m.legacy}</span></h2>
        <p class="muted">每一次人生都會留下些什麼。用傳承點讓下一個阿維更強。</p>
        <section class="card"><h3>永久升級</h3>${ups}</section>
        <section class="card"><h3>天賦解鎖</h3>${traits}</section>
        <div class="row end"><button class="btn" data-act="back">返回</button></div>
      </div>`;
    },

    // ======================= 圖鑑 =======================
    rGallery() {
      const m = AW.Meta.get();
      const ends = Object.keys(AW.ENDINGS).map((id) => {
        const e = AW.ENDINGS[id];
        const n = m.endings[id];
        return `<div class="gal ${n ? 'got' : ''}"><div class="gal-icon">${n ? e.icon : '❔'}</div><b>${n ? esc(e.name) : '？？？'}</b>${n ? `<small>達成 ${n} 次</small>` : ''}</div>`;
      }).join('');
      const achs = AW.ACHIEVEMENTS.map((a) => {
        const got = m.achievements[a.id];
        return `<div class="gal ${got ? 'got' : ''}"><div class="gal-icon">${got ? a.icon : '🔒'}</div><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></div>`;
      }).join('');
      return `${this.header()}
      <div class="page">
        <h2>📖 結局與成就</h2>
        <section class="card"><h3>結局 <span class="pill">${Object.keys(m.endings).length} / ${Object.keys(AW.ENDINGS).length}</span></h3><div class="gal-grid">${ends}</div></section>
        <section class="card"><h3>成就 <span class="pill">${Object.keys(m.achievements).length} / ${AW.ACHIEVEMENTS.length}</span></h3><div class="gal-grid">${achs}</div></section>
        <div class="row end"><button class="btn" data-act="back">返回</button></div>
      </div>`;
    },

    // ======================= 互動 =======================
    afterEngine() {
      if (this.S && this.S.phase === 'ended') { this.go('ending'); return; }
      this.render();
    },

    handlers: {
      'to-title'() { this.closeModal(); this.go('title'); },
      back() { this.go(this.S && this.S.phase === 'ended' ? 'ending' : 'title'); },
      continue() { const s = AW.Save.load(); if (s) { this.S = s; this.prevStats = null; this.go('game'); } },
      new() {
        if (AW.Save.has() && this.screen === 'title') {
          this.confirm('開始新人生會覆蓋目前進行中的這一局，確定嗎？', 'new-confirm', '開始新人生');
          return;
        }
        this.handlers['new-confirm'].call(this);
      },
      'new-confirm'() { this.closeModal(); AW.Save.clear(); this.S = null; this.go('birth'); },
      shop() { this.go('shop'); },
      gallery() { this.go('gallery'); },
      help() {
        this.modal(`<h3>❓ 遊戲說明</h3>
          <p>從 0 歲開始養成阿維（劉家維）。每一年會遇到隨機事件，並選擇要做的事來提升能力。</p>
          <ul>
            <li>🎂 <b>18 歲成年檢定</b>：遊戲能力（FPS 或 DOTA ≥ 60）與反應力（≥ 42）達標可參加戰隊試訓；學力 ≥ 50 可讀資工系。</li>
            <li>🎮 <b>電競職涯</b>：以「Aweiisa＿＿」之名出道，目標是<b>世界冠軍</b>。</li>
            <li>💻 <b>工程師職涯</b>：從初級工程師一路升遷或創業，目標是<b>科技公司大老闆</b>。</li>
            <li>❤️ 健康或 😊 心情歸零會讓下一年行動數 -1；心情 ≥ 70 時成長 +10%。</li>
            <li>📈 能力越高越難練，FPS / DOTA 在 6～15 歲成長最快，反應力在 12 歲前成長最快。</li>
            <li>🧬 每局結束獲得傳承點，可購買永久升級與天賦。</li>
          </ul>
          <p class="muted small">進度每年自動存檔在瀏覽器中。</p>
          <div class="row end"><button class="btn primary" data-act="close-modal">了解！</button></div>`);
      },
      'close-modal'() { this.closeModal(); },
      menu() {
        this.modal(`<h3>☰ 選單</h3><div class="menu-col">
          <button class="btn" data-act="help">❓ 遊戲說明</button>
          <button class="btn" data-act="to-title">🏠 回到標題（進度已自動存檔）</button>
          <button class="btn danger" data-act="abandon">🗑️ 放棄這一局</button>
          <button class="btn ghost" data-act="close-modal">關閉</button></div>`);
      },
      abandon() { this.confirm('確定要放棄這一局嗎？這一局不會獲得傳承點。', 'abandon-confirm', '放棄'); },
      'abandon-confirm'() { AW.Save.clear(); this.S = null; this.closeModal(); this.go('title'); },

      // 出生
      'pick-trait'(d) { this.ui.trait = d.id; this.render(); },
      alloc(d) {
        const u = this.ui;
        const total = E.birthPoints();
        const used = Object.values(u.alloc).reduce((a, b) => a + b, 0);
        const cur = u.alloc[d.key] || 0;
        const nv = cur + Number(d.d);
        if (nv < 0 || nv > 5 || (Number(d.d) > 0 && used >= total)) return;
        u.alloc[d.key] = nv;
        this.render();
      },
      'alloc-random'() {
        const u = this.ui;
        u.alloc = {};
        let left = E.birthPoints();
        let guard = 0;
        while (left > 0 && guard++ < 200) {
          const k = AW.BIRTH_STATS[Math.floor(Math.random() * AW.BIRTH_STATS.length)];
          if ((u.alloc[k] || 0) < 5) { u.alloc[k] = (u.alloc[k] || 0) + 1; left--; }
        }
        this.render();
      },
      'alloc-reset'() { this.ui.alloc = {}; this.render(); },
      born() {
        if (!this.ui.trait) return;
        this.S = E.newRun({ trait: this.ui.trait, alloc: this.ui.alloc });
        this.prevStats = null;
        this.go('game');
      },

      // 事件
      choice(d) { E.resolveEvent(this.S, Number(d.i)); this.render(); },
      'event-next'() { E.advanceEvent(this.S); this.render(); },

      // 行動
      toggle(d) {
        const u = this.ui;
        const n = E.slots(this.S);
        u.selected = u.selected || [];
        const i = u.selected.indexOf(d.id);
        if (i >= 0) u.selected.splice(i, 1);
        else {
          if (u.selected.length >= n) u.selected.shift();
          u.selected.push(d.id);
        }
        this.render();
      },
      commit() {
        E.commitActions(this.S, this.ui.selected || []);
        this.ui = {};
        this.render();
        root.scrollTo && root.scrollTo({ top: 0, behavior: 'smooth' });
      },
      'season-skip'() { this.clearTimers(); this.ui.cursor = this.seasonGames(this.S.season); this.updateSeason(); },
      'season-done'() { this.clearTimers(); E.seasonDone(this.S); this.ui = {}; this.render(); },

      // 結算
      'next-year'() {
        E.nextYear(this.S);
        this.ui = {};
        this.afterEngine();
        root.scrollTo && root.scrollTo({ top: 0, behavior: 'smooth' });
      },
      decide(d) { E.resolveDecision(this.S, Number(d.i)); this.afterEngine(); },
      retire() {
        this.confirm(this.S.phase === 'esports' ? '確定要宣布退役嗎？這一局將會結束。' : '確定要提前退休嗎？這一局將會結束。', 'retire-confirm', '確定');
      },
      'retire-confirm'() {
        this.closeModal();
        const s = this.S;
        E.finish(s, s.phase === 'esports' ? AW.Esports.endingFor(s) : AW.Engineer.endingFor(s));
        this.afterEngine();
      },

      // 成年檢定
      tryout() {
        const r = E.doTryout(this.S);
        if (!r) return;
        const u = this.ui;
        u.rollAnim = true;
        u.rollShown = false;
        u.roll = r.ok ? Math.random() * r.chance * 0.95 : r.chance + (1 - r.chance) * (0.05 + Math.random() * 0.9);
        this.render();
        this.later(() => {
          const n = doc.querySelector('.needle');
          if (n) n.style.left = n.dataset.left + '%';
        }, 60);
        this.later(() => { u.rollShown = true; this.render(); }, 1700);
      },
      'go-naming'() { this.ui.naming = true; this.ui.game = E.checkInfo(this.S).bestKey; this.render(); },
      'set-game'(d) {
        const inp = doc.getElementById('pro-name');
        if (inp) this.ui.nameDraft = inp.value.trim();
        this.ui.game = d.g;
        this.render();
      },
      'confirm-name'() {
        const inp = doc.getElementById('pro-name');
        const name = inp ? inp.value.trim() : '';
        if (!name) return;
        E.startEsports(this.S, name, this.ui.game || E.checkInfo(this.S).bestKey);
        this.ui = {};
        this.render();
        this.toast(`🎉 <b>${esc(this.S.displayName)}</b> 正式出道！`, 'ach');
      },
      'go-uni'() { E.startEngineer(this.S); this.ui = {}; this.render(); },
      'go-extra'() { E.startExtraYear(this.S); this.ui = {}; this.render(); },
      'go-ordinary'() { E.finish(this.S, 'ordinary'); this.afterEngine(); },

      // 商店
      buy(d) { if (AW.Meta.buyUpgrade(d.id)) this.toast('✅ 升級成功！'); this.render(); },
      unlock(d) { if (AW.Meta.unlockTrait(d.id)) this.toast(`✅ 解鎖天賦：${AW.TRAITS[d.id].icon} ${AW.TRAITS[d.id].name}`); this.render(); },
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
