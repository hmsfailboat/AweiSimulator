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
      doc.addEventListener('change', (ev) => {
        if (ev.target.id !== 'save-file' || !ev.target.files || !ev.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = () => {
          this.handlers['import-file'].call(this, String(reader.result || ''));
        };
        reader.onerror = () => this.toast('⚠️ 無法讀取這個檔案。', 'bad');
        reader.readAsText(ev.target.files[0]);
        ev.target.value = ''; // 讓同一個檔案可以再選一次
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
      let out = this.chips(AW.previewEffects(s, E.actionEffects(s, a)));
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

    modal(html, cls) {
      this.modalEl.innerHTML = `<div class="modal-box ${cls || ''}">${html}</div>`;
      this.modalEl.classList.remove('hidden');
    },
    // 更新已開啟的視窗內容（不重播開啟動畫）
    modalUpdate(html, cls) {
      const box = this.modalEl.querySelector('.modal-box');
      if (box && !this.modalEl.classList.contains('hidden')) box.innerHTML = html;
      else this.modal(html, cls);
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
          <button class="btn ghost" data-act="transfer">💾 匯出／匯入存檔（換裝置）</button>
          <button class="btn ghost" data-act="help">❓ 遊戲說明</button>
        </div>
        <p class="foot">已重生 ${m.runs} 次 · 致敬遊戲天才阿維 · v${AW.VERSION}</p>
      </div>`;
    },

    // 存檔檔案：遊戲中只能匯出，標題畫面才能匯入
    rTransfer(inGame) {
      const exp = `<section class="transfer-sec">
          <h4>📤 匯出 <small class="muted">在舊裝置上下載存檔檔案</small></h4>
          <div class="row"><button class="btn primary sm" data-act="export-save">⬇️ 下載存檔檔案</button></div>
        </section>`;
      const imp = inGame ? '<p class="muted small">要匯入存檔，請先回到標題畫面。</p>' : `<section class="transfer-sec">
          <h4>📥 匯入 <small class="muted">在新裝置上選擇存檔檔案</small></h4>
          <div class="row"><label class="btn sm">📂 選擇存檔檔案<input type="file" id="save-file" accept=".txt,text/plain" hidden></label></div>
          <p class="muted small">匯入會覆蓋這台裝置上的傳承點、天賦、成就，以及進行中的人生。</p>
        </section>`;
      return `<h3>💾 匯出／匯入存檔</h3>
        <p class="muted small">存檔檔案包含跨局進度（傳承點、天賦、升級、成就、結局）和進行中的人生，可以用來換裝置或備份。</p>
        ${exp}${imp}
        <div class="row end"><button class="btn ghost" data-act="close-modal">關閉</button></div>`;
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
      return { infant: '👶', elem: '🧒', junior: '👦', senior: '🧑', extra: '😤', pro: '😎', uni: '🧑‍🎓', job: '🧑‍💻', startup: '🧑‍💼',
        streamer: '🧑‍🎤', coach: '🧑‍🏫', biz: '🧑‍💼', chairman: '🤵', retired: '😌', elder: '👴' }[E.stageKey(s)];
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
        // DOTA 的個人戰力也看戰術
        skills = [this.bar(s, main, { cls: 'hl', label: `主項目・${AW.STATS[main].name}` }), this.bar(s, 'reflex'), this.bar(s, 'teamwork')]
          .concat(main === 'dota' ? [this.bar(s, 'tactics')] : [])
          .concat([this.bar(s, 'fame'), this.bar(s, 'social'), this.bar(s, other, { cls: 'dim' })]);
      } else if (s.phase === 'engineer') {
        skills = [this.bar(s, 'tech', { cls: 'hl' }), this.bar(s, 'leader'), this.bar(s, 'social'), this.bar(s, 'study'),
          this.bar(s, AW.resolveKey(s, 'best'), { cls: 'dim' })];
        if (s.stats.fame) skills.push(this.bar(s, 'fame', { cls: 'dim' }));
      } else if (s.phase === 'second') {
        const best = AW.resolveKey(s, 'best');
        const keys = {
          streamer: [['fame', 'hl'], ['social'], [best, 'dim']],
          coach: [['tactics', 'hl'], [s.esports ? s.esports.game : best], ['teamwork'], ['fame', 'dim']],
          biz: [['leader', 'hl'], ['social'], [AW.Second.THEMES[s.second.theme || 'consult'].stat]],
          chairman: [['leader', 'hl'], ['tech'], ['social']],
          retired: [['social'], ['study'], [best, 'dim']],
          elder: [['social'], ['study'], [best, 'dim']],
        }[E.stageKey(s)] || [['social']];
        skills = keys.map(([k, cls]) => this.bar(s, k, { cls }));
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
        ${this.rStatus(s)}
        ${this.rLoveBox(s)}
        ${this.rFamilyBox(s)}
        ${this.rFriendsBox(s)}
        ${this.rWishes(s)}
        <div class="money ${money < 0 ? 'debt' : ''}">💰 ${AW.fmtMoney(money)} ${money !== pm ? `<em class="${money > pm ? 'up' : 'down'}">${money > pm ? '+' : ''}${AW.fmtMoney(money - pm)}</em>` : ''}</div>
        ${this.rInvestLine(s)}
        ${this.rShopBtns(s)}
        <div class="trait-tag" title="${esc(t.desc || '')}">${t.icon || ''} 天賦：${esc(t.name || '無')}</div>`;
    },

    // 面板：投資市值與未實現損益、收租物件
    rInvestLine(s) {
      const F = AW.Finance;
      const v = F.invested(s);
      const pl = v - F.investCost(s);
      const n = s.estate ? s.estate.rentals.length : 0;
      return (v ? `<div class="muted small" data-act="finance">📈 投資市值 ${AW.fmtMoney(v)} <b class="${pl >= 0 ? 'ok' : 'bad'}">${esc(F.fmtPL(pl))}</b></div>` : '')
        + (n ? `<div class="muted small" data-act="finance">🏘️ 收租物件 ${n} 間・淨值 ${AW.fmtMoney(AW.Estate.equity(s))}</div>` : '');
    },

    rStatus(s) {
      const list = AW.statusList(s);
      if (!list.length) return '';
      const bad = { tired: 1, frail: 1, low: 1, depressed: 1, chronic: 1, cold: 1 };
      return `<div class="status-tags">${list.map((id) => `<span class="pill ${bad[id] ? 'bad' : 'ok'}" title="${esc(AW.tx('status', id + '_desc', s))}">${esc(AW.tx('status', id + '_name', s))}</span>`).join('')}</div>`;
    },

    rLoveBox(s) {
      if (!AW.Love.active(s)) return '';
      const flings = (s.flings || []).map((f) => `<div class="c-row small"><span>💌 ${esc(f.name)}</span><span class="muted">偷偷交往中・好感 ${Math.round(f.love)}</span></div>`).join('');
      const type = s.love.type ? `<span class="pill love-type" title="${esc(AW.tx('love', 'type_' + s.love.type + '_desc', s))}">${esc(AW.Love.typeName(s))}</span>` : '';
      return `<div class="love-box"><div class="c-row"><span>💕 ${esc(s.love.name)} ${type}</span><span class="muted">${esc(AW.Love.statusName(s))}</span></div>${this.bar(s, 'love')}${flings}</div>`;
    },
    // 子女與孫子
    rFamilyBox(s) {
      if (!s.kids || !s.kids.length) return '';
      const kids = s.kids.map((k) => `<span class="pill" title="${k.pro ? '職業選手' : k.married ? '已婚' : ''}">${k.pro ? '🎮' : '🧒'} ${esc(k.name)} ${AW.Family.age(s, k)} 歲</span>`).join('');
      return `<div class="family-box">${kids}${s.grandkids ? `<span class="pill">🧸 孫子 ×${s.grandkids}</span>` : ''}</div>`;
    },
    // 遺願清單
    rWishes(s) {
      if (!s.wishes || !s.wishes.length) return '';
      return `<details class="wishes"><summary>📝 遺願清單 ${s.wishes.filter((w) => w.done).length}/${s.wishes.length}</summary>${s.wishes.map((w) =>
        `<div class="c-row small ${w.done ? 'ok' : ''}"><span>${w.done ? '✅' : '⬜'} ${esc(AW.tx('wish.' + w.id, 'name', s))}</span><span class="muted">${esc(AW.tx('wish.' + w.id, 'desc', s))}</span></div>`).join('')}</details>`;
    },

    rShopBtns(s) {
      const open = AW.Shop.open(s);
      const cas = s.age >= AW.Casino.MIN_AGE && !s.flags.noGamble;
      const fin = AW.Finance.canManage(s);
      const friends = AW.NPC.metList(s).length;
      const charm = (s.items && s.items.charm) || 0;
      return `<div class="shop-btns">
        <button class="btn sm" data-act="item-shop" ${open ? '' : 'disabled'}>🛒 道具商店</button>
        <button class="btn sm" data-act="casino" ${open && cas ? '' : 'disabled'} title="${cas ? '' : (s.flags.noGamble ? '已戒賭' : '18 歲解鎖')}">🎰 賭場</button>
        <button class="btn sm" data-act="finance" ${open && fin ? '' : 'disabled'} title="${fin ? '' : '18 歲解鎖'}">💰 理財</button>
        <button class="btn sm" data-act="friends" ${friends ? '' : 'disabled'} title="${friends ? '' : '還沒有認識朋友'}">👥 朋友</button>
      </div>${charm ? `<div class="muted small">🍀 幸運御守 ×${charm}（下一次擲骰 +${Math.round(AW.CHARM_BONUS * 100)}%）</div>` : ''}`;
    },

    // 朋友：面板上的小頭像列，滑鼠移上去看好友度
    rFriendsBox(s) {
      const list = AW.NPC.metList(s);
      if (!list.length) return '';
      return `<div class="friends-box" data-act="friends">${list.map((id) => {
        const b = AW.NPC.bond(s, id);
        return `<span class="f-chip ${b >= 60 ? 'close' : b < 20 ? 'far' : ''}" title="${esc(AW.NPC.name(id))}：好友度 ${b}">${AW.NPC.icon(id)}<i style="width:${b}%"></i></span>`;
      }).join('')}</div>`;
    },
    bondChips(list) {
      return (list || []).filter((x) => x.v).map((x) =>
        `<span class="chip ${x.v > 0 ? 'up' : 'down'}" title="好友度">${AW.NPC.icon(x.id)}${esc(AW.NPC.name(x.id))} ${x.v > 0 ? '+' : ''}${x.v}</span>`).join('');
    },

    rCareerBox(s) {
      if (s.phase === 'esports') {
        const e = s.esports;
        const T = AW.Esports.TIERS[e.tier];
        return `<div class="career">
          <div class="c-row"><span>${T.icon} ${esc(e.team)}</span><span class="muted">${T.name}</span></div>
          <div class="c-row"><span>個人戰力 <b>${Math.round(AW.Esports.power(s))}</b></span><span>隊伍戰力 <b>${Math.round(AW.Esports.teamPower(s))}</b></span></div>
          <div class="c-row"><span>🥇 ×${e.domesticTitles}　🏆 ×${e.worldTitles}</span><span class="muted">世界賽最佳：${['—', '小組賽', '八強', '四強', '亞軍', '冠軍'][e.bestWorlds]}</span></div>
          ${e.game === 'dota'
            ? `<div class="c-row"><span>📋 本年版本：${esc(AW.Esports.metaText(s) || '—')}</span></div>`
            : `<div class="c-row"><span>💥 ACE ×${e.aces || 0}　🌟 MVP ×${e.mvps || 0}</span><span class="muted">${AW.Esports.retireAge(s)} 歲退役</span></div>`}
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
          <div class="c-row"><span>👔 ${Eg.rankName(s)}</span><span class="muted">${e.lastGrade ? `上次考績 ${e.lastGrade}${e.lastPlace ? `・同期第 ${e.lastPlace}` : ''}` : ''}</span></div>
          ${e.rank < 6 ? `<div class="c-row"><span>升遷點數</span><span>${e.promo} / ${need}</span></div>
          <div class="bar thin"><div class="fill k-leader" style="width:${Math.min(100, e.promo / need * 100)}%"></div></div>` : ''}
        </div>`;
      }
      if (s.phase === 'second') return this.rSecondBox(s);
      return '';
    },

    rSecondBox(s) {
      const g = s.second;
      const S = AW.Second;
      const turn = S.turnYears(s) > 1 ? `<div class="c-row muted small"><span>⏩ 每回合 ${S.turnYears(s)} 年</span><span>${s.age >= S.ELDER_AGE ? '每年 1 個行動' : ''}</span></div>` : '';
      if (!S.working(s)) {
        return `<div class="career"><div class="c-row"><span>${s.age >= S.ELDER_AGE ? '🧓 晚年生活' : '🎣 退休生活'}</span><span class="muted">${g.was ? `前${esc(AW.tx('second', 'job_' + g.was, s))}` : ''}</span></div>${turn}</div>`;
      }
      if (g.job === 'streamer') {
        return `<div class="career"><div class="c-row"><span>📺 訂閱 <b>${esc(S.fmtSubs(g.subs))}</b></span><span class="muted">${g.place ? `年度第 ${g.place}` : ''}</span></div>
          <div class="bar thin"><div class="fill k-fame" style="width:${Math.min(100, g.subs / 10000)}%"></div></div>
          <div class="c-row muted small"><span>目標：百萬訂閱</span><span>最高 ${esc(S.fmtSubs(g.peak || g.subs))}</span></div>${turn}</div>`;
      }
      if (g.job === 'coach') {
        const T = AW.Esports.TIERS[g.tier];
        return `<div class="career"><div class="c-row"><span>${T.icon} ${esc(g.team)}</span><span class="muted">${T.name}</span></div>
          <div class="c-row"><span>隊伍戰力 <b>${Math.round(S.coachPower(s))}</b></span><span>選手加成 ${g.bonus >= 0 ? '+' : ''}${g.bonus}</span></div>
          <div class="c-row"><span>🥇 ×${g.titles}　🏆 ×${g.worldTitles}</span><span class="muted">目標：冠軍教練</span></div>${turn}</div>`;
      }
      const chair = g.job === 'chairman';
      const ST = chair ? S.CHAIR_STAGES : S.BIZ_STAGES;
      const key = chair ? 'chair_stage_' : 'biz_stage_';
      const track = ST.map((x, i) => `<span class="${i < g.stage ? 'done' : i === g.stage ? 'cur' : ''}" title="${esc(AW.tx('second', key + i, s))}">${x.icon}</span>`).join('<i>›</i>');
      return `<div class="career"><div class="c-row"><span>${chair ? '👑' : '🏪'} ${esc(g.name)}</span><span class="muted">${esc(AW.tx('second', key + g.stage, s))}</span></div>
        <div class="track">${track}</div>
        ${chair ? `<div class="c-row"><span>董事會信任</span><span>${g.bad ? '⚠️ 不滿 ' + g.bad + '/' + S.VENTURE.oust : '👍 穩定'}</span></div>`
          : `<div class="c-row"><span>資金跑道 ${'🔋'.repeat(Math.max(0, g.runway))}${'🪫'.repeat(Math.max(0, S.VENTURE.runway - g.runway))}</span>${g.partner ? `<span class="muted">合夥：${esc(AW.NPC.name(g.partner))}</span>` : ''}</div>`}${turn}</div>`;
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

    // 這一年有沒有賽季動畫（電競賽季、職場賽季、創業之年）
    hasSeason(s) { return s.phase === 'esports' || (s.phase === 'engineer' && s.eng.stage !== 'uni') || AW.Second.hasSeason(s); },
    seasonLabel(s) {
      if (s.phase === 'esports') return '賽季';
      if (s.phase === 'engineer') return s.eng.stage === 'startup' ? '創業之年' : '職場賽季';
      return { streamer: '直播之年', coach: '教練賽季', biz: '經營之年', chairman: '董事會' }[s.second.job];
    },
    stepper(s) {
      const steps = s.phase === 'esports' ? ['事件', '訓練', '賽季', '結算']
        : this.hasSeason(s) ? ['事件', '行動', this.seasonLabel(s), '結算'] : ['事件', '行動', '結算'];
      const cur = { event: 0, action: 1, season: 2, summary: steps.length - 1 }[s.step];
      return `<div class="stepper">${steps.map((n, i) => `<span class="${i === cur ? 'cur' : i < cur ? 'done' : ''}">${n}</span>`).join('<i>›</i>')}</div>`;
    },

    rMain(s) {
      if (s.step === 'check') return this.rCheck(s);
      if (s.step === 'chapter') return this.rChapter(s);
      if (s.step === 'farewell') return this.rFarewell(s);
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
      if (f.busy) out.push('🏥 照顧家人：行動數 -1');
      if (f.blue) out.push('🌧️ 憂鬱：行動數 -1');
      if (f.lag) out.push('📶 網路陰影：賽季戰力 -4');
      if (f.halfAllowance) out.push('🏚️ 家裡手頭緊：零用錢減半');
      if (f.extraSlot) out.push('⏰ 今年行動數 +1');
      const debt = AW.Finance.statusText(s);
      if (debt) out.push(debt);
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
        const charm = (s.items && s.items.charm) > 0;
        if (e.choices && e.choices.length) {
          actions = `<div class="choices">${E.visibleChoices(s, e).map(({ c, i, ok }) =>
            `<button class="btn choice" data-act="choice" data-i="${i}" ${ok ? '' : 'disabled'}>${esc(AW.val(c.text, s))}${c.roll ? ` <small>🎲${charm ? '🍀' : ''}</small>` : ''}</button>`).join('')}</div>`;
        } else {
          actions = `<div class="choices"><button class="btn primary" data-act="choice" data-i="-1">好的</button></div>`;
        }
      } else {
        const roll = r.roll ? `<div class="roll ${r.roll.ok ? 'ok' : 'bad'}">🎲 成功率 ${Math.round(r.roll.p * 100)}%${r.roll.charm ? '（🍀 御守加成）' : ''} → ${r.roll.ok ? '成功！' : '失敗……'}</div>` : '';
        actions = `<div class="result">${roll}${r.text ? `<p>${esc(r.text)}</p>` : ''}<div class="chips-row">${(this.chips(r.deltas) + this.bondChips(r.bonds)) || '<span class="muted">（沒有數值變化）</span>'}</div></div>
          <div class="choices"><button class="btn primary" data-act="event-next">繼續 ▶</button></div>`;
      }
      return `<section class="card event pop">
        ${total > 1 ? `<div class="ev-count">今年還有 ${total - 1} 個事件</div>` : ''}
        <div class="ev-icon">${e.icon}</div>
        <h3>${esc(AW.val(e.title, s))}</h3>
        <p class="ev-text">${nl(E.eventText(s, e))}</p>
        ${actions}
      </section>`;
    },

    // ---------- 行動 ----------
    rActions(s) {
      const u = this.ui;
      u.selected = (u.selected || []).filter((id) => { const a = AW.ACTION_MAP[id]; return a && E.actionState(s, a).ok; });
      const n = E.slots(s);
      const fn = E.friendSlots(s);
      const list = E.availableActions(s);
      const card = ({ a, ok, reason }) => {
        const sel = u.selected.includes(a.id);
        return `<button class="action-card ${sel ? 'selected' : ''} ${ok ? '' : 'disabled'}" data-act="toggle" data-id="${a.id}" ${ok ? '' : 'disabled'}>
          <div class="ac-head"><span class="ac-icon">${a.icon}</span><span class="ac-name">${esc(a.name)}</span>${sel ? '<span class="ac-check">✓</span>' : ''}</div>
          <div class="ac-desc">${esc(AW.val(a.desc, s) || '')}</div>
          <div class="chips-row">${this.previewChips(s, a)}</div>
          ${ok ? '' : `<div class="ac-lock">🔒 ${esc(reason)}</div>`}
        </button>`;
      };
      // 一般行動、朋友時間（和朋友相處的行動另外選，不佔一般行動）
      const main = list.filter((x) => !x.a.npc);
      const friends = list.filter((x) => x.a.npc);
      const selMain = u.selected.filter((id) => !AW.ACTION_MAP[id].npc).length;
      const selFriend = u.selected.length - selMain;
      const agendaReady = !s.agenda || s.agenda.pick != null;
      const can = agendaReady && selMain >= Math.min(n, main.filter((x) => x.ok).length) && u.selected.length > 0;
      const label = s.phase === 'esports' ? '開始賽季 ▶' : this.hasSeason(s) ? '開始這一年的挑戰 ▶' : '結束這一年 ▶';
      const friendHtml = fn && friends.length ? `<h4 class="shop-h">👥 朋友時間 <span class="pill ${selFriend === fn ? 'ok' : ''}">${selFriend} / ${fn}</span></h4>
        <p class="muted small">和朋友相處不佔一般行動，每年可以另外選 ${fn} 個（不選也可以）。${E.FRIEND_EFFECT ? `好友度照常增加，能力與狀態的效果是平常的 ${Math.round(E.FRIEND_EFFECT * 100)}%（卡片上已經換算好）。` : '只會提升好友度，不會改變能力與狀態。'}</p>
        <div class="action-grid">${friends.map(card).join('')}</div>` : '';
      return `${this.rAgenda(s)}<section class="card">
        <h3>${s.phase === 'esports' ? '選擇本季的訓練重點' : '選擇今年要做的事'} <span class="pill ${selMain === n ? 'ok' : ''}">${selMain} / ${n}</span></h3>
        <p class="muted small">數值為基礎值，實際成長受天賦、年齡、心情與目前數值（越高越難練）影響。</p>
        <div class="action-grid">${main.map(card).join('')}</div>
        ${friendHtml}
        <div class="row end sticky-go"><button class="btn primary big" data-act="commit" ${can ? '' : 'disabled'}>${label}</button></div>
      </section>`;
    },

    // 年度議題（v2.1）：董事長、企業家在行動階段選擇今年的方針
    rAgenda(s) {
      if (!s.agenda) return '';
      const S = AW.Second;
      const id = s.agenda.id;
      const chip = (cls, text) => `<span class="chip ${cls}">${esc(text)}</span>`;
      const cards = S.agendaOptions(s).map(({ o, i, ok, cost, reason }) => {
        let chips = '';
        if (o.b) chips += chip(o.b > 0 ? 'up' : 'down', `經營實力 ${o.b > 0 ? '+' : ''}${o.b}`);
        if (o.up) chips += chip('info', `${o.up} 季達標就成長`);
        if (o.grow === false) chips += chip('info', '今年不擴張');
        if (o.div) chips += chip(o.div > 1 ? 'gold' : 'down', `分紅 ×${o.div}`);
        if (o.risk) chips += chip('down', `沒成長多燒 ${o.risk} 年資金`);
        if (o.vote) chips += chip('info', '🗳️ 需要表決');
        if (o.fame) chips += chip('info', `成長時名氣 +${o.fame}`);
        if (o.bond && s.second.partner) chips += chip(o.bond > 0 ? 'up' : 'down', `${AW.NPC.name(s.second.partner)} ${o.bond > 0 ? '+' : ''}${o.bond}`);
        chips += this.chips(AW.previewEffects(s, o.effects));
        if (cost) chips += this.chip('money', -cost);
        if (!chips) chips = chip('info', '照原本的步調');
        const sel = s.agenda.pick === i;
        return `<button class="action-card ${sel ? 'selected' : ''} ${ok ? '' : 'disabled'}" data-act="agenda" data-i="${i}" ${ok ? '' : 'disabled'}>
          <div class="ac-head"><span class="ac-name">${esc(S.agendaLabel(s, id, i))}</span>${o.def ? '<span class="pill">預設</span>' : ''}${sel ? '<span class="ac-check">✓</span>' : ''}</div>
          <div class="ac-desc">${esc(S.agendaText(s, id, 'desc' + (i + 1)))}</div>
          <div class="chips-row">${chips}</div>
          ${ok ? '' : `<div class="ac-lock">🔒 ${esc(reason)}</div>`}
        </button>`;
      }).join('');
      return `<section class="card">
        <h3>${esc(AW.tx('second', 'agenda_head_' + s.second.job, s))}：${esc(S.agendaText(s, id, 'name'))}</h3>
        <p>${esc(S.agendaText(s, id, 'text'))}</p>
        <p class="muted small">${esc(AW.tx('second', 'agenda_hint', s))}</p>
        <div class="action-grid">${cards}</div>
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
      let stop = false;
      for (const st of season.stages) {
        // 沒有比賽的階段（排行榜、尾牙）要等前面全部播完才出現
        if (stop || (left <= 0 && st.matches.length)) break;
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
          const res = m.vote ? `${w}:${l}${full ? (m.won ? ' 通過' : ' 落選') : ''}` : full ? `${w}:${l} ${m.won ? '勝' : '敗'}` : `${w}:${l}`;
          rows += `<div class="match ${full ? (m.won ? 'won' : 'lost') : 'live'} ${m.rival ? 'rival' : ''}">
            <span class="m-round">${esc(m.round || (m.bo === 1 ? 'BO1' : `BO${m.bo}`))}</span>
            <span class="m-opp">${m.rival ? '🔥 ' : ''}${m.vote ? '' : 'vs '}${esc(m.oppName)} ${m.vote ? '' : `<small>(${m.opp})</small>`}${m.tag ? ` <small class="m-tag">${esc(m.tag)}</small>` : ''}</span>
            <span class="m-prob" title="${m.vote ? '每席贊成機率' : '單局勝率'}">${Math.round(m.p * 100)}%</span>
            <span class="m-games">${shown.map((g) => (m.vote ? (g ? '✅' : '❌') : g ? '🟢' : '🔴')).join('')}</span>
            <span class="m-res">${res}</span>
          </div>`;
        }
        if (!stageDone) stop = true;
        const table = stageDone && st.table ? `<div class="peer-table">${st.table.map((r, i) =>
          `<div class="c-row ${r.me ? 'me' : ''}"><span>${i + 1}. ${esc(r.name)}</span><b>${esc(st.prefix || '')}${esc(r.v)}</b></div>`).join('')}</div>` : '';
        html += `<div class="stage"><div class="stage-name">${st.icon} ${esc(st.name)}</div>${rows}${table}
          ${stageDone ? `<div class="stage-note ${st.neutral ? '' : st.passed ? 'ok' : 'bad'}">${esc(st.note)}</div>` : ''}</div>`;
      }
      const title = season.title || `🎮 ${s.esports.team} 的賽季`;
      return `<section class="card season" id="season">
        <h3>${esc(title)} <span class="pill">${esc(season.pill || `隊伍戰力 ${season.T}`)}</span></h3>
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
        const bonds = this.bondChips(r.bonds);
        return `<div class="sum-act"><span>${a.icon} ${esc(a.name)}</span>${r.text ? `<small>${esc(r.text)}</small>` : ''}${bonds ? `<div class="chips-row">${bonds}</div>` : ''}</div>`;
      }).join('');
      const notes = s.yearNotes.map((n) => `<div class="note"><span>${n.icon}</span><span>${esc(n.text)}</span></div>`).join('');
      let review = '';
      const rv = s.review;
      if (rv && !rv.startup) {
        const pts = rv.pts + (rv.top ? 1 : 0);
        review = `<div class="review"><div class="grade g-${rv.grade}">${rv.grade}</div><div>
          <div><b>年度考績</b>${rv.kpi != null ? `・KPI ${rv.kpi}` : ''}${rv.place ? `・同期第 ${rv.place}` : ''}（升遷點數 ${pts >= 0 ? '+' : ''}${pts}）</div>
          ${rv.promoted ? `<div class="ok">🎉 升任「${esc(AW.Engineer.RANKS[rv.rank].name)}」！</div>` : ''}
          ${rv.rank < 6 ? `<div class="muted small">下一職級「${esc(AW.Engineer.RANKS[rv.rank + 1].name)}」：點數 ${rv.promo}/${rv.need}${rv.miss.length ? `，還需要 ${esc(rv.miss.join('、'))}` : '，能力已達標'}</div>` : ''}
        </div></div>`;
      } else if (rv && rv.startup) {
        const label = { up: '🚀 公司晉級！', hold: '😐 進展有限', bad: '📉 遭遇挫折', bankrupt: '💥 公司倒閉' }[rv.result];
        review = `<div class="review"><div class="grade ${rv.result === 'up' ? 'g-S' : rv.result === 'hold' ? 'g-B' : 'g-D'}">${AW.Engineer.STARTUP[rv.stage].icon}</div>
          <div><b>${label}</b><div class="muted small">${rv.W != null ? `季度目標達成 ${rv.W}／4（3 季以上可以募資；階段越後面越難）` : `創業評分 ${rv.score}`}</div></div></div>`;
      }
      const end = s.pendingEnding;
      const canRetire = !end && ((s.phase === 'esports' && AW.Esports.canRetire(s)) || (s.phase === 'engineer' && AW.Engineer.canRetire(s)));
      return `<section class="card summary pop">
        <h3>📋 ${s.age} 歲・年度結算</h3>
        ${acts ? `<div class="sum-acts">${acts}</div>` : ''}
        ${review}
        ${notes ? `<div class="notes">${notes}</div>` : ''}
        ${this.rLedger(s)}
        ${this.rCasinoStats(s, s.yearFlags, '今年賭場')}
        <div class="g-title">今年的變化</div>
        <div class="chips-row">${this.chips(diff) || '<span class="muted">平靜的一年。</span>'}</div>
        ${s.decision ? this.rDecision(s) : ''}
        <div class="row end wrap">
          ${E.canFire(s) ? `<button class="btn" data-act="fire">${esc(AW.tx('status', 'fire_button', s))}</button>` : ''}
          ${canRetire ? `<button class="btn ghost" data-act="retire">${s.phase === 'esports' ? '👋 宣布退役' : '🌅 提前退休'}</button>` : ''}
          ${s.phase === 'second' && !s.pendingDeath && !end ? `<button class="btn ghost" data-act="curtain">${esc(AW.tx('life', 'curtain_btn', s))}</button>` : ''}
          <button class="btn primary big" data-act="next-year" ${s.decision ? 'disabled' : ''}>${this.nextLabel(s)}</button>
        </div>
      </section>`;
    },

    // 賭場戰績：進場次數、贏、輸、淨額（src 是今年的 yearFlags 或一生的 counters）
    rCasinoStats(s, src, label) {
      const visits = src.casinoVisits || 0;
      if (!visits && !(src === s.counters && src.gamblePlays)) return '';
      const won = src.gambleWon || 0;
      const lost = src.gambleLost || 0;
      const net = won - lost;
      return `<div class="casino-stats"><span>🎰 ${esc(label)}</span>
        <span>進場 <b>${visits || '—'}</b> 次</span>
        <span>贏 <b class="ok">+${esc(AW.fmtMoney(won))}</b></span>
        <span>輸 <b class="bad">-${esc(AW.fmtMoney(lost))}</b></span>
        <span>淨 <b class="${net >= 0 ? 'ok' : 'bad'}">${net >= 0 ? '+' : ''}${esc(AW.fmtMoney(net))}</b></span></div>`;
    },

    // 年度收支表
    rLedger(s) {
      const y = s.fin && s.fin.year;
      if (!y) return '';
      const line = (label, v) => `<div class="c-row"><span>${esc(label)}</span><b class="${v >= 0 ? 'ok' : 'bad'}">${v >= 0 ? '+' : ''}${esc(AW.fmtMoney(v))}</b></div>`;
      let html = '';
      if (y.income) html += line(AW.tx('finance', 'line_income', s), y.income);
      for (const l of y.lines) html += line(AW.tx('finance', 'line_' + l.key, s), l.v);
      const net = y.income + y.lines.reduce((a, l) => a + l.v, 0);
      if (y.invest) html += `<div class="c-row muted small"><span>${esc(AW.tx('finance', 'line_invest', s))}（未贖回）</span><span>${y.invest >= 0 ? '+' : ''}${esc(AW.fmtMoney(y.invest))}</span></div>`;
      return `<details class="ledger" ${net < 0 ? 'open' : ''}><summary>💰 年度收支：<b class="${net >= 0 ? 'ok' : 'bad'}">${net >= 0 ? '+' : ''}${esc(AW.fmtMoney(net))}</b></summary>${html}</details>`;
    },

    nextLabel(s) {
      if (s.pendingDeath) return '🕯️ 最後的時光 ▶';
      if (s.pendingEnding) return '🎬 這一章的結局 ▶';
      const n = s.phase === 'second' ? AW.Second.turnYears(s) : 1;
      return n > 1 ? `迎接接下來的 ${n} 年 ▶` : '迎接下一年 ▶';
    },

    rDecision(s) {
      const d = s.decision;
      if (!d) return '';
      return `<div class="decision pop"><h4>${d.icon || '📌'} ${esc(d.title)}</h4><p>${nl(d.text)}</p>
        <div class="choices">${d.options.map((o, i) => `<button class="btn choice" data-act="decide" data-i="${i}" ${o.disabled ? 'disabled' : ''}>${esc(o.label)}${o.desc ? `<small>${esc(o.desc)}</small>` : ''}</button>`).join('')}</div></div>`;
    },

    // ---------- 章節完成（v2.0） ----------
    rChapter(s) {
      const id = s.chapterOffer;
      const end = AW.ENDINGS[id];
      const done = s.chapters.map((c) => `<span class="pill">${AW.ENDINGS[c.id].icon} ${esc(AW.ENDINGS[c.id].name)}・${c.age} 歲</span>`).join('');
      return `<div class="year-head"><h2>🎬 ${s.age} 歲・${esc(AW.tx('life', 'chapter_label', s))}</h2></div>
      <section class="card ending chapter ${end.good ? 'good' : ''} pop">
        <div class="end-icon">${end.icon}</div>
        <div class="end-label">章節</div>
        <h2>${esc(end.name)}</h2>
        <p class="end-text">${esc(AW.val(end.text, s))}</p>
        ${done ? `<div class="chips-row center">${done}</div>` : ''}
        <p class="muted">${esc(AW.tx('life', 'chapter_hint', s))}</p>
        <div class="choices">
          <button class="btn choice" data-act="end-here">${esc(AW.tx('life', 'btn_end', s))}<small>${esc(AW.tx('life', 'btn_end_desc', s))}</small></button>
          <button class="btn choice primary" data-act="continue-life">${esc(AW.tx('life', 'btn_continue', s))}<small>${esc(AW.tx('life', 'btn_continue_desc', s))}</small></button>
        </div>
      </section>`;
    },

    // ---------- 臨終（v2.0） ----------
    visitorLines(s, list) {
      return list.map((v) => {
        if (v.type === 'love') return `<div class="note"><span>💕</span><span>${esc(AW.tx('life', 'visit_love', s))}</span></div>`;
        if (v.type === 'kids') return `<div class="note"><span>👨‍👧</span><span>${esc(AW.tx('life', 'visit_kids', s))}</span></div>`;
        return `<div class="note"><span>${AW.NPC.icon(v.id)}</span><span><b>${esc(AW.NPC.name(v.id))}</b> 來看你了。</span></div>`;
      }).join('');
    },
    rFarewell(s) {
      const vs = (s.farewell && s.farewell.visitors) || [];
      return `<div class="year-head"><h2>🕯️ ${s.age} 歲・${esc(AW.tx('life', 'farewell_title', s))}</h2></div>
      <section class="card farewell pop">
        <p class="ev-text">${esc(AW.tx('life', vs.length ? 'farewell_text' : 'farewell_alone', s))}</p>
        <div class="notes">${this.visitorLines(s, vs)}</div>
        <h4>${esc(AW.tx('life', 'words_title', s))}</h4>
        <div class="choices">${[1, 2, 3].map((i) => `<button class="btn choice" data-act="last-words" data-i="${i - 1}">${esc(AW.tx('life', 'words' + i, s))}</button>`).join('')}</div>
      </section>`;
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
        <p class="muted small game-desc">${esc(AW.tx('esports', 'game_' + g, s))}</p>
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
      if (s.rival) career += `<div class="c-row"><span>🔥 對王選手</span><b>${s.rival.w} 勝 ${s.rival.l} 敗</b></div>`;
      const friends = AW.NPC.metList(s).map((id) => `<span class="chip info">${AW.NPC.icon(id)}${esc(AW.NPC.name(id))} ${AW.NPC.bond(s, id)}</span>`).join('');
      if (friends) career += `<h4>👥 朋友（好友度）</h4><div class="chips-row">${friends}</div>`;
      if (s.fin && s.fin.taxTotal) career += `<div class="c-row"><span>🧾 一生繳稅</span><b>${AW.fmtMoney(s.fin.taxTotal)}</b></div>`;
      career += this.rCasinoStats(s, s.counters, '一生賭場戰績');
      if (s.kids && s.kids.length) career += `<h4>👨‍👧 家人</h4><div class="chips-row">${s.kids.map((k) => `<span class="chip info">${k.pro ? '🎮' : '🧒'}${esc(k.name)}${k.pro ? '（職業選手）' : ''}</span>`).join('')}${s.grandkids ? `<span class="chip info">🧸孫子 ×${s.grandkids}</span>` : ''}</div>`;
      if (s.wishes && s.wishes.length) career += `<h4>📝 遺願清單 ${s.wishes.filter((w) => w.done).length}/${s.wishes.length}</h4><div class="chips-row">${s.wishes.map((w) =>
        `<span class="chip ${w.done ? 'up' : ''}">${w.done ? '✅' : '⬜'}${esc(AW.tx('wish.' + w.id, 'name', s))}</span>`).join('')}</div>`;
      const stats = ['fps', 'dota', 'reflex', 'study', 'social', 'tech', 'leader', 'teamwork', 'tactics', 'fame']
        .filter((k) => s.stats[k]).map((k) => `<span class="chip info">${AW.STATS[k].icon}${Math.round(s.stats[k])}</span>`).join('');
      return `${this.header()}
      <div class="page narrow">
        <section class="card ending ${end.good ? 'good' : ''} pop">
          <div class="end-icon">${end.icon}</div>
          <div class="end-label">${end.life ? '人生終章' : '結局'}</div>
          <h2>${esc(end.name)}</h2>
          <p class="end-text">${esc(AW.val(end.text, s))}</p>
          <div class="end-meta">${esc(s.displayName)} · ${s.dead ? `享年 ${s.age} 歲` : `${s.age} 歲，故事告一段落`}</div>
          ${s.chapters && s.chapters.length ? `<div class="chips-row center">${s.chapters.map((c) => `<span class="pill">${AW.ENDINGS[c.id].icon} ${esc(AW.ENDINGS[c.id].name)}・${c.age} 歲</span>`).join('')}</div>` : ''}
          ${s.ending.grades ? `<div class="end-grades"><span>❤️ 健康 <b class="g-${s.ending.grades.health}">${s.ending.grades.health}</b></span><span>😊 幸福度 <b class="g-${s.ending.grades.mood}">${s.ending.grades.mood}</b></span></div>` : ''}
          ${AW.Love.endingLine(s) ? `<div class="end-meta">${esc(AW.Love.endingLine(s))}</div>` : ''}
          <div class="chips-row center">${stats}<span class="chip gold">💰${AW.fmtMoney(s.stats.money)}</span></div>
        </section>
        ${s.dead ? this.rFuneral(s) : ''}
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

    // ======================= 道具商店 =======================
    rItemShop() {
      const s = this.S;
      const list = AW.Shop.list(s);
      const groupOf = (t) => (t === 'gear' || t === 'gift' ? t : 'use');
      const groups = [
        ['gear', '🧰 裝備', '永久持有，效果持續到結局'],
        ['use', '🧃 消耗品', '買了立刻生效，每種每年限一次'],
        ['gift', '🎁 禮物', `送給${s.love ? s.love.name : '另一半'}，每種每年限一次`],
      ];
      const html = groups.map(([g, title, hint]) => {
        const rows = list.filter((x) => groupOf(x.it.type) === g).map(({ it, ok, owned, reason }) => `
          <div class="shop-item ${owned ? 'owned' : ''}"><div class="si-icon">${it.icon}</div>
            <div class="si-body"><b>${esc(it.name)}</b><div class="muted small">${esc(AW.Text.fill(it.desc, s, it.vars && it.vars(s)))}</div>
              ${!ok && !owned && reason ? `<div class="ac-lock">🔒 ${esc(reason)}</div>` : ''}</div>
            ${owned ? '<span class="pill ok">已擁有</span>'
              : `<button class="btn sm ${ok ? 'primary' : ''}" data-act="buy-item" data-id="${it.id}" ${ok ? '' : 'disabled'}>${it.loan ? '頭期 ' : ''}${AW.fmtMoney(AW.Shop.cost(s, it))}</button>`}
          </div>`).join('');
        return rows ? `<h4 class="shop-h">${title} <small>${esc(hint)}</small></h4>${rows}` : '';
      }).join('');
      return `<h3>🛒 道具商店 <span class="pill gold">💰 ${AW.fmtMoney(s.stats.money)}</span></h3>${html}
        <div class="row end modal-foot"><button class="btn primary" data-act="close-modal">離開</button></div>`;
    },

    // ======================= 理財 =======================
    rFinance() {
      const s = this.S;
      const F = AW.Finance;
      const f = s.fin;
      const open = AW.Shop.open(s);
      const styles = F.STYLES.map((st, i) => `<button class="tab ${f.style === i ? 'on' : ''}" data-act="set-style" data-i="${i}" ${open ? '' : 'disabled'}>
        ${esc(AW.tx('finance', 'style_' + st.id, s))}<small>${esc(AW.tx('finance', 'style_' + st.id + '_desc', s))}</small></button>`).join('');
      const money = s.stats.money;
      const STEPS = [100000, 1000000, 10000000, 100000000, 1000000000];
      const amts = STEPS.filter((a) => a <= money);
      const inv = Object.keys(F.PRODUCTS).filter((id) => F.productOk(s, id) || f.inv[id]).map((id) => {
        const pos = F.position(s, id);
        const v = pos.v;
        const btns = F.productOk(s, id) && open ? amts.map((a) => `<button class="bet" data-act="invest" data-id="${id}" data-a="${a}">+${AW.fmtMoney(a)}</button>`).join('')
          + (money > 0 ? `<button class="bet all" data-act="invest" data-id="${id}" data-a="all">全部</button>` : '') : '';
        // 贖回：固定金額（小於市值才顯示）、一半、全部
        const sells = v && open ? '<span class="muted small">贖回</span>'
          + STEPS.filter((a) => a < v).map((a) => `<button class="bet sell" data-act="withdraw" data-id="${id}" data-a="${a}">-${AW.fmtMoney(a)}</button>`).join('')
          + (v >= 20000 && !STEPS.includes(Math.round(v / 2)) ? `<button class="bet sell" data-act="withdraw" data-id="${id}" data-a="${Math.round(v / 2)}">一半</button>` : '')
          + `<button class="bet sell all" data-act="withdraw" data-id="${id}" data-a="all">全部</button>` : '';
        return `<div class="shop-item"><div class="si-body"><b>${esc(AW.tx('finance', 'inv_' + id, s))}</b>
            <span class="muted small">${esc(AW.tx('finance', 'inv_' + id + '_desc', s))}</span>
            <div class="bets left">${btns}</div>
            ${sells ? `<div class="bets left">${sells}</div>` : ''}</div>
          <div class="inv-val"><b class="gold">${v ? AW.fmtMoney(v) : '—'}</b>
            ${v ? `<small class="muted">成本 ${AW.fmtMoney(pos.cost)}</small><small class="${pos.pl >= 0 ? 'ok' : 'bad'}">${esc(F.fmtPL(pos.pl, pos.pct))}</small>` : ''}</div></div>`;
      }).join('');
      // 保留的公司股份
      const holds = (s.holdings || []).map((h, i) => `<div class="shop-item"><div class="si-body"><b>📜 ${esc(h.name)}</b>
            <span class="muted small">${esc(AW.tx('second', 'shares_hold_desc', s, { 年齡: h.since }))}</span></div>
          <div class="inv-val"><b class="gold">${AW.fmtMoney(h.div)}／年</b>
            ${open ? `<button class="btn sm" data-act="sell-holding" data-i="${i}">賣掉（${AW.fmtMoney(AW.Second.holdingValue(h))}）</button>` : ''}</div></div>`).join('');
      const loans = f.loans.map((l) => `<div class="c-row"><span>${esc(AW.tx('finance', 'line_loan_' + F.loanKey(l), s))}</span><span>每年 ${AW.fmtMoney(l.pay)}・還剩 ${l.left} 年</span></div>`).join('');
      return `<h3>💰 理財 <span class="pill gold">💰 ${AW.fmtMoney(money)}</span>${f.taxTotal ? `<span class="pill">🧾 累計繳稅 ${AW.fmtMoney(f.taxTotal)}</span>` : ''}</h3>
        <h4 class="shop-h">🏠 生活水準 <small>${F.active(s) ? `今年生活費 ${AW.fmtMoney(F.livingCost(s))}` : '還沒出社會，暫時不用付'}</small></h4>
        <div class="tabs styles">${styles}</div>
        <p class="muted small">${esc(AW.tx('finance', 'style_hint', s))}</p>
        <h4 class="shop-h">📈 投資 <small>${esc(AW.tx('finance', 'inv_hint', s))}</small></h4>
        ${this.rInvestSummary(s)}
        ${inv}
        ${holds ? `<h4 class="shop-h">📜 公司股份 <small>${esc(AW.tx('second', 'shares_hint', s))}</small></h4>${holds}` : ''}
        ${this.rEstate(s)}
        ${loans ? `<h4 class="shop-h">🏦 貸款</h4>${loans}` : ''}
        ${E.canFire(s) || s.phase === 'ended' ? '' : (s.age >= 30 ? `<p class="muted small">🏖️ 財富自由目標：35～49 歲時身家 ${AW.fmtMoney(E.fireTarget(s))}（每年開銷 × 25，最少 ${AW.fmtMoney(E.FIRE.min)}），且心情 70 以上</p>` : '')}
        <div class="row end modal-foot"><button class="btn primary" data-act="close-modal">關閉</button></div>`;
    },

    // 房地產（v2.4）：房市、自住房與豪宅、收租物件（跟劉地主買）
    rEstate(s) {
      const ES = AW.Estate;
      const e = s.estate;
      const open = AW.Shop.open(s);
      const t = (key, v) => AW.tx('estate', key, s, v);
      const homes = ES.homeIds(s);
      const liu = AW.NPC.met(s, 'liu');
      if (!homes.length && !e.rentals.length && !liu) return '';
      // 賣掉：按一次變成「確定賣掉？」，再按一次才賣
      const sellBtn = (key, v) => {
        if (!open) return '';
        const sure = this.ui.sellKey === key;
        const short = v < 0 && s.stats.money < -v;
        const label = sure ? t('btn_confirm') : t(v >= 0 ? 'btn_sell' : 'btn_sell_neg', { 金額: AW.fmtMoney(Math.abs(v)) });
        return `<button class="btn sm ${sure ? 'danger' : ''}" data-act="sell-estate" data-key="${key}" ${short ? 'disabled' : ''}>${esc(label)}</button>`
          + (short ? `<span class="ac-lock">🔒 ${esc(t('need_cash', { 金額: AW.fmtMoney(-v) }))}</span>` : '');
      };
      const row = (name, desc, value, btn) => `<div class="shop-item"><div class="si-body"><b>${esc(name)}</b>
          <span class="muted small">${desc}</span></div>
        <div class="inv-val"><b class="gold">${AW.fmtMoney(value)}</b>${btn}</div></div>`;
      const homeRows = homes.map((id) => {
        const it = AW.ITEM_MAP[id];
        const loan = it.loan ? AW.Finance.loanLeft(s, id) : 0;
        return row(ES.homeName(s, id), loan ? esc(t('loan_desc', { 房貸: AW.fmtMoney(loan) })) : '', ES.homeValue(s, id), sellBtn('home:' + id, ES.homeSellValue(s, id)));
      }).join('');
      const rentRows = e.rentals.map((r) => {
        const loan = AW.Finance.loanLeft(s, ES.loanId(r));
        const desc = [t('own_desc', { 年齡: r.since, 買價: AW.fmtMoney(r.price) }),
          t('rent_desc', { 租金: AW.fmtMoney(ES.rent(s, r)), 空租: Math.round(ES.vacancy(s, r) * 100) + '%' })]
          .concat(loan ? [t('loan_desc', { 房貸: AW.fmtMoney(loan) })] : []).map(esc).join('<br>');
        return row(ES.kindName(s, r.kind), desc, ES.rentalValue(s, r), sellBtn('rent:' + r.uid, ES.rentalSellValue(s, r)));
      }).join('');
      // 跟劉地主買收租物件
      const buys = liu ? Object.keys(ES.KINDS).map((kind) => {
        const st = ES.rentalState(s, kind);
        return `<div class="shop-item"><div class="si-body"><b>${esc(ES.kindName(s, kind))}</b>
            <span class="muted small">${esc(t('kind_' + kind + '_desc'))}</span>
            ${st.ok ? '' : `<div class="ac-lock">🔒 ${esc(st.reason)}</div>`}</div>
          <div class="inv-val"><b class="gold">${AW.fmtMoney(ES.buyPrice(s, ES.KINDS[kind].base))}</b>
            <button class="btn sm ${st.ok ? 'primary' : ''}" data-act="buy-rental" data-kind="${kind}" ${st.ok ? '' : 'disabled'}>${esc(t('btn_buy', { 金額: AW.fmtMoney(ES.downPayment(s, kind)) }))}</button></div></div>`;
      }).join('') : `<p class="muted small">${esc(t('need_meet'))}</p>`;
      const market = ES.started(s) ? t('market', { 指數: e.idx.toFixed(2), 漲跌: ES.fmtPct(e.last) }) : t('market_wait');
      const hint = e.hint ? `<p class="small">${esc(t('liu_' + e.hint.cat))}</p>` : '';
      return `<h4 class="shop-h">${esc(t('title'))} <small>${esc(market)}</small></h4>
        <p class="muted small">${esc(t('hint'))}</p>${hint}
        ${homeRows}${rentRows}${buys}`;
    },

    // 投資總覽：市值、成本、未實現損益、已實現損益
    rInvestSummary(s) {
      const F = AW.Finance;
      const v = F.invested(s);
      const cost = F.investCost(s);
      const pl = v - cost;
      const real = s.fin.realized || 0;
      if (!v && !real) return '';
      return `<div class="invest-sum">
        <span>市值 <b class="gold">${AW.fmtMoney(v)}</b></span>
        <span>成本 <b>${AW.fmtMoney(cost)}</b></span>
        <span>未實現損益 <b class="${pl >= 0 ? 'ok' : 'bad'}">${esc(F.fmtPL(pl, cost ? pl / cost : null))}</b></span>
        <span>已實現損益 <b class="${real >= 0 ? 'ok' : 'bad'}">${esc(F.fmtPL(real))}</b></span></div>`;
    },

    // ======================= 朋友 =======================
    rFriends() {
      const s = this.S;
      const cards = AW.NPC.metList(s).map((id) => {
        const b = AW.NPC.bond(s, id);
        const hires = Object.keys(AW.STAFF).filter((job) => AW.STAFF[job].npc === id).map((job) => {
          const st = AW.NPC.hireState(s, job);
          if (st.hidden) return '';
          // 已經請了升級版（私人廚師、貼身保全），就不顯示較低階的雇用
          if (Object.keys(AW.STAFF).some((j) => AW.STAFF[j].replaces === job && s.staff && s.staff[j])) return '';
          const label = AW.tx('staff.' + job, 'btn', s);
          if (st.hired) return `<button class="btn sm danger" data-act="fire-staff" data-job="${job}">解除「${esc(AW.tx('staff.' + job, 'name', s))}」（年薪 ${AW.fmtMoney(AW.STAFF[job].salary)}）</button>`;
          return `<button class="btn sm ${st.ok ? 'primary' : ''}" data-act="hire" data-job="${job}" ${st.ok ? '' : 'disabled'}>${label}（年薪 ${AW.fmtMoney(AW.STAFF[job].salary)}）</button>${st.ok ? '' : `<span class="ac-lock">🔒 ${esc(st.reason)}</span>`}`;
        }).join('');
        return `<div class="npc-card"><div class="si-icon">${AW.NPC.icon(id)}</div><div class="si-body">
          <div class="c-row"><b>${esc(AW.NPC.name(id))}</b><span class="muted small">${esc(AW.tx('npc.' + id, 'job', s))}・${s.npcs[id].met} 歲認識</span></div>
          <div class="stat"><div class="stat-top"><span>好友度</span><b>${b}</b></div><div class="bar"><div class="fill k-social" style="width:${b}%"></div></div></div>
          <div class="muted small">${esc(AW.tx('npc.' + id, 'desc', s))}</div>
          ${hires ? `<div class="row wrap">${hires}</div>` : ''}</div></div>`;
      }).join('');
      const unmet = AW.NPC_ORDER.length - AW.NPC.metList(s).length;
      const rival = s.rival ? `<p class="muted small">🔥 宿敵王選手：${esc(s.rival.team)}（${AW.Esports.TIERS[s.rival.tier].name}），你的戰績 ${s.rival.w} 勝 ${s.rival.l} 敗</p>` : '';
      return `<h3>👥 朋友</h3>
        <p class="muted small">每年的「👥 朋友時間」可以另外選一個和朋友相處的行動，不佔一般行動。「🎮 揪團開黑」可以提升開黑朋友的好友度（胡投顧只加一半，主要靠「💹 找胡投顧聊投資」或交際類行動）；太久沒聯絡，好友度會慢慢下降（人緣 60 以上下降較慢）。${unmet ? `還有 ${unmet} 位朋友沒認識，人緣越高越容易遇到。` : ''}</p>
        ${rival}${cards}
        <div class="row end modal-foot"><button class="btn primary" data-act="close-modal">關閉</button></div>`;
    },

    // ======================= 賭場 =======================
    rCasino() {
      const s = this.S;
      const C = AW.Casino;
      const c = this.cas;
      const kind = C.kindOf(c.game);
      const st = C.state(s, kind);
      const money = s.stats.money;
      if (c.bet !== 'all' && c.bet > money) c.bet = C.BETS.filter((b) => b <= money).pop() || 1000;
      const tabs = [['dice', '🎲 骰寶'], ['slots', '🎰 拉霸'], ['lottery', '🎟️ 彩券']].map(([g, n]) =>
        `<button class="tab ${c.game === g ? 'on' : ''}" data-act="cas-game" data-g="${g}">${n}</button>`).join('');
      const dis = st.ok ? '' : 'disabled';
      const bets = c.game === 'lottery' ? '' : `<div class="bets">${C.BETS.filter((b) => b <= money).map((b) =>
        `<button class="bet ${c.bet === b ? 'on' : ''}" data-act="cas-bet" data-b="${b}">${AW.fmtMoney(b)}</button>`).join('')}
        ${money >= 1000 ? `<button class="bet all ${c.bet === 'all' ? 'on' : ''}" data-act="cas-bet" data-b="all">💥 梭哈</button>` : ''}</div>`;
      let body;
      if (c.game === 'dice') {
        body = `<p class="muted small">三顆骰子，總和 11～17 為「大」、4～10 為「小」，猜中賠 1 倍。三顆相同（豹子）莊家通殺。</p>${bets}
          <div class="choices"><button class="btn primary" data-act="cas-play" data-pick="big" ${dis}>押大</button>
          <button class="btn primary" data-act="cas-play" data-pick="small" ${dis}>押小</button></div>`;
      } else if (c.game === 'slots') {
        body = `<p class="muted small">7️⃣7️⃣7️⃣ 拿回 30 倍、任意三個相同 8 倍、兩個相同 1.5 倍。</p>${bets}
          <div class="choices"><button class="btn primary" data-act="cas-play" ${dis}>🎰 拉！</button></div>`;
      } else {
        const L = C.LOTTERY;
        body = `<p class="muted small">每張 ${AW.fmtMoney(L.price)}。${L.prizes.map((p) => `${p.name} ${AW.fmtMoney(p.win)}`).join('、')}。</p>
          <div class="choices"><button class="btn primary" data-act="cas-lotto" data-n="1" ${dis}>買 1 張</button>
          <button class="btn primary" data-act="cas-lotto" data-n="10" ${dis || (money < L.price * 10 ? 'disabled' : '')}>買 10 張</button></div>`;
      }
      let last = '';
      const r = c.last;
      if (r) {
        const show = r.dice ? `<div class="cas-show">${r.dice.map((d) => C.DICE[d - 1]).join('')}</div>`
          : r.reels ? `<div class="cas-show">${r.reels.join('')}</div>` : '';
        last = `<div class="cas-result ${r.net > 0 ? 'win' : r.net < 0 ? 'lose' : ''} pop">${show}
          <div><b>${esc(r.text)}</b></div>
          <div class="cas-net">${r.net > 0 ? `贏了 ${AW.fmtMoney(r.net)}！` : r.net < 0 ? `輸了 ${AW.fmtMoney(-r.net)}` : '不輸不贏'}</div></div>`;
      }
      return `<h3>🎰 賭場 <span class="pill gold">💰 ${AW.fmtMoney(money)}</span>
          <span class="pill" title="骰寶、拉霸合計">🎲🎰 今年剩 ${C.left(s, 'table')} 次</span>
          <span class="pill">🎟️ 彩券剩 ${C.left(s, 'lotto')} 次</span></h3>
        <div class="tabs">${tabs}</div>
        ${body}
        ${st.ok ? '' : `<p class="ac-lock center-text">🔒 ${esc(st.reason)}</p>`}
        ${last}
        <p class="muted small center-text">贏了心情變好，輸了心情變差；一次輸掉一半家產會很受打擊。</p>
        <div class="row end">${AW.Finance.canShark(s) && !s.flags.noGamble
          ? `<button class="btn danger sm" data-act="shark" title="${esc(AW.tx('finance', 'shark_desc', s))}">${esc(AW.tx('finance', 'shark_btn', s))}</button>` : ''}
          <button class="btn" data-act="close-modal">離開賭場</button></div>`;
    },

    // 告別式：出席的人、致詞、墓誌銘
    rFuneral(s) {
      const vs = (s.farewell && s.farewell.visitors) || [];
      const npcs = vs.filter((v) => v.type === 'npc').map((v) => {
        const b = AW.NPC.bond(s, v.id);
        return `<div class="eulogy"><span class="si-icon">${AW.NPC.icon(v.id)}</span><div><b>${esc(AW.NPC.name(v.id))}</b><p>「${esc(AW.tx('npc.' + v.id, b >= 70 ? 'eulogy_high' : 'eulogy', s))}」</p></div></div>`;
      }).join('');
      const fam = vs.filter((v) => v.type !== 'npc').length ? `<div class="notes">${this.visitorLines(s, vs.filter((v) => v.type !== 'npc'))}</div>` : '';
      return `<section class="card funeral">
        <h3>🕊️ ${esc(AW.tx('life', 'funeral_title', s))}</h3>
        ${fam}${npcs || (fam ? '' : `<p class="muted">${esc(AW.tx('life', 'funeral_none', s))}</p>`)}
        <div class="epitaph"><small>${esc(AW.tx('life', 'epitaph_title', s))}</small><div>${esc(s.displayName)}</div><p>${esc(AW.tx('life', 'epitaph' + ((s.lastWords || 0) + 1), s))}</p></div>
      </section>`;
    },

    // ======================= 圖鑑 =======================
    rGallery() {
      const m = AW.Meta.get();
      const card = (id) => {
        const e = AW.ENDINGS[id];
        const n = m.endings[id];
        return `<div class="gal ${n ? 'got' : ''}"><div class="gal-icon">${n ? e.icon : '❔'}</div><b>${n ? esc(e.name) : '？？？'}</b>${n ? `<small>達成 ${n} 次</small>` : ''}</div>`;
      };
      const ids = Object.keys(AW.ENDINGS);
      const chapters = ids.filter((id) => !AW.ENDINGS[id].life);
      const lives = ids.filter((id) => AW.ENDINGS[id].life);
      const got = (list) => list.filter((id) => m.endings[id]).length;
      const achs = AW.ACHIEVEMENTS.map((a) => {
        const got = m.achievements[a.id];
        return `<div class="gal ${got ? 'got' : ''}"><div class="gal-icon">${got ? a.icon : '🔒'}</div><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></div>`;
      }).join('');
      return `${this.header()}
      <div class="page">
        <h2>📖 結局與成就</h2>
        <section class="card"><h3>職涯章節 <span class="pill">${got(chapters)} / ${chapters.length}</span></h3><div class="gal-grid">${chapters.map(card).join('')}</div></section>
        <section class="card"><h3>人生終章 <span class="pill">${got(lives)} / ${lives.length}</span></h3><div class="gal-grid">${lives.map(card).join('')}</div></section>
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
            <li>🎮 <b>電競職涯</b>：以「Aweiisa＿＿」之名出道，目標是<b>世界冠軍</b>。宿敵王選手也會在賽場上等你。</li>
            <li>💻 <b>工程師職涯</b>：每年要拚季度專案、和同期比 KPI、通過升遷答辯，或是創業募資，目標是<b>科技公司大老闆</b>。</li>
            <li>❤️ <b>健康</b> ≥ 70 擲骰 +5%；低於 40 成長變慢、表現變差；長期過低會得慢性病；病倒 3 次這一局就結束了。30 歲後身體會慢慢變差。</li>
            <li>😊 <b>心情</b> ≥ 70 成長 +10%；低於 40 成長變慢、擲骰 -5%；太低可能陷入憂鬱。</li>
            <li>📉 健康和心情越接近滿值越難再往上補，要靠長期好好休息。</li>
            <li>💰 <b>理財</b>（18 歲起）：出社會後要繳所得稅、付生活費；可以選擇生活水準、投資、買房。存款變負數會開始負債，太久還不出來就會破產。</li>
            <li>🏘️ <b>房地產</b>：房價每年隨房市漲跌，房子可以在理財畫面賣掉。認識內湖的大地主劉地主之後，還可以跟他買收租物件，每年收租金。</li>
            <li>👥 <b>朋友</b>：人緣越高，越容易認識朋友。每年有一次「朋友時間」，可以另外選一個和朋友相處的行動（揪團開黑、去阿方家吃飯、陪劉地主泡茶……），不佔一般行動。好朋友會在關鍵時刻幫你一把。</li>
            <li>🏁 結局會依一生的平均健康與心情評等，評等高可多拿傳承點。35～49 歲時身家夠多、心情好，可以選擇「財富自由」提早退休。</li>
            <li>📈 能力越高越難練，FPS / DOTA 在 6～15 歲成長最快，反應力在 12 歲前成長最快。</li>
            <li>🛒 <b>道具商店</b>：用金錢買裝備（永久成長加成）、消耗品、額外行動數、幸運御守；有交往對象時還能買禮物。</li>
            <li>🎰 <b>賭場</b>（18 歲起）：骰寶和拉霸每年合計 10 次，彩券另外可以買 10 次。十賭九輸，小賭怡情。</li>
            <li>💕 <b>感情</b>：告白或邂逅成功後開始交往。不約會的話好感度每年下降，太低會分手；感情穩定可以求婚、結婚。</li>
            <li>🎬 <b>章節</b>：拿到世界冠軍、當上大老闆、退役或退休時，可以選擇「就此落幕」結算，或「繼續人生」進入第二幕。</li>
            <li>🛤️ <b>人生第二幕</b>：實況主（目標百萬訂閱）、電競教練（冠軍教練）、創業從商或董事長（商業大亨）、退休享福。董事長和企業家每年要決定一個經營方針（董事會議題）。還在工作時每回合 1 年（企業家、董事長可以做到 70 歲，其他工作 65 歲）；退休後 50 歲起每回合 2 年，65 歲後每回合 3 年、每年 1 個行動。</li>
            <li>🕯️ <b>晚年</b>：60 歲會寫下遺願清單；年紀越大、健康越差，越可能離開人世。最後的告別式上，好朋友們會來送你一程。</li>
            <li>👨‍👩‍👧 <b>家庭</b>：結婚後可能有孩子，常陪孩子打電動，他們長大也許會成為職業選手。人緣很高時可能同時交往……小心修羅場。</li>
            <li>🧬 每局結束獲得傳承點，可購買永久升級與天賦。結婚、累積財富也能多拿傳承點。</li>
          </ul>
          <p class="muted small">進度每年自動存檔在瀏覽器中。要換裝置或備份，請用標題畫面的「💾 匯出／匯入存檔」。</p>
          <div class="row end"><button class="btn primary" data-act="close-modal">了解！</button></div>`);
      },
      'close-modal'() { this.closeModal(); },

      // 道具商店
      'item-shop'() { if (AW.Shop.open(this.S)) this.modal(this.rItemShop(), 'wide'); },
      'buy-item'(d) {
        const r = AW.Shop.buy(this.S, d.id);
        if (!r) return;
        this.toast(`${r.it.icon} 購買「${esc(r.it.name)}」<div class="chips-row">${this.chips(r.deltas)}</div>`);
        this.render();
        this.modalUpdate(this.rItemShop(), 'wide');
      },

      // 理財
      finance() {
        if (!AW.Shop.open(this.S) || !AW.Finance.canManage(this.S)) return;
        this.ui.sellKey = null;
        this.modal(this.rFinance(), 'wide');
      },
      'set-style'(d) {
        if (!AW.Shop.open(this.S)) return;
        if (AW.Finance.setStyle(this.S, Number(d.i))) this.render();
        this.modalUpdate(this.rFinance(), 'wide');
      },
      invest(d) {
        if (!AW.Finance.invest(this.S, d.id, d.a === 'all' ? 'all' : Number(d.a))) return;
        this.render();
        this.modalUpdate(this.rFinance(), 'wide');
      },
      withdraw(d) {
        if (!AW.Finance.withdraw(this.S, d.id, d.a === 'all' ? 'all' : Number(d.a))) return;
        this.render();
        this.modalUpdate(this.rFinance(), 'wide');
      },
      'buy-rental'(d) {
        if (!AW.Estate.buyRental(this.S, d.kind)) return;
        this.ui.sellKey = null;
        this.render();
        this.modalUpdate(this.rFinance(), 'wide');
      },
      // 賣房：第一次按只會變成「確定賣掉？」
      'sell-estate'(d) {
        const s = this.S;
        if (this.ui.sellKey !== d.key) { this.ui.sellKey = d.key; this.modalUpdate(this.rFinance(), 'wide'); return; }
        this.ui.sellKey = null;
        const [type, id] = d.key.split(':');
        const ok = type === 'home' ? AW.Estate.sellHome(s, id) : !!AW.Estate.sellRental(s, Number(id));
        if (ok) this.render();
        this.modalUpdate(this.rFinance(), 'wide');
      },
      'sell-holding'(d) {
        if (!AW.Shop.open(this.S) || !AW.Second.sellHolding(this.S, Number(d.i))) return;
        this.render();
        this.modalUpdate(this.rFinance(), 'wide');
      },
      shark() {
        const r = AW.Finance.borrowShark(this.S);
        if (!r) return;
        this.toast(`🦈 ${esc(AW.tx('finance', 'shark_log', this.S))}`);
        this.render();
        this.modalUpdate(this.rCasino());
      },

      // 朋友
      friends() { if (AW.NPC.metList(this.S).length) this.modal(this.rFriends(), 'wide'); },
      hire(d) {
        if (!AW.NPC.hire(this.S, d.job)) return;
        this.render();
        this.modalUpdate(this.rFriends(), 'wide');
      },
      'fire-staff'(d) {
        if (!AW.NPC.fire(this.S, d.job)) return;
        this.render();
        this.modalUpdate(this.rFriends(), 'wide');
      },

      // 賭場
      casino() {
        if (!AW.Shop.open(this.S)) return;
        this.cas = { game: (this.cas && this.cas.game) || 'dice', bet: (this.cas && this.cas.bet) || 10000, last: null };
        AW.Casino.enter(this.S);
        this.modal(this.rCasino(), 'wide');
      },
      'cas-game'(d) { this.cas.game = d.g; this.cas.last = null; this.modalUpdate(this.rCasino()); },
      'cas-bet'(d) { this.cas.bet = d.b === 'all' ? 'all' : Number(d.b); this.modalUpdate(this.rCasino()); },
      'cas-play'(d) {
        const r = AW.Casino.play(this.S, this.cas.game, this.cas.bet, d.pick);
        if (!r) return;
        this.cas.last = r;
        this.render();
        this.modalUpdate(this.rCasino());
      },
      'cas-lotto'(d) {
        const r = AW.Casino.lottery(this.S, Number(d.n));
        if (!r) return;
        this.cas.last = r;
        this.render();
        this.modalUpdate(this.rCasino());
      },
      menu() {
        this.modal(`<h3>☰ 選單</h3><div class="menu-col">
          <button class="btn" data-act="help">❓ 遊戲說明</button>
          <button class="btn" data-act="transfer">💾 匯出存檔</button>
          <button class="btn" data-act="to-title">🏠 回到標題（進度已自動存檔）</button>
          <button class="btn danger" data-act="abandon">🗑️ 放棄這一局</button>
          <button class="btn ghost" data-act="close-modal">關閉</button></div>`);
      },

      // 存檔檔案
      transfer() { this.modal(this.rTransfer(this.screen === 'game'), 'wide'); },
      async 'export-save'() {
        if (this.S) AW.Save.save(this.S);
        let code;
        try { code = await AW.Save.exportCode(); } catch (e) { return this.toast('⚠️ 匯出失敗：這個瀏覽器無法讀取存檔。', 'bad'); }
        const d = new Date();
        const p2 = (n) => String(n).padStart(2, '0');
        const a = doc.createElement('a');
        a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
        a.download = `awei-save-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}.txt`;
        doc.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        this.toast('💾 已下載存檔檔案，把它傳到新裝置後用「匯入」讀取。');
      },
      // 由檔案選擇器讀進檔案內容後呼叫
      async 'import-file'(text) {
        let data;
        try { data = await AW.Save.parseCode(text); } catch (e) { return this.toast(`⚠️ ${esc(e.message)}`, 'bad'); }
        this.pendingCode = text;
        const sv = data.save;
        const life = sv ? `進行中的人生：${esc(sv.displayName || '劉家維')}，${sv.age} 歲` : '沒有進行中的人生';
        this.modal(`<h3>📥 確定要匯入嗎？</h3>
          <p>存檔內容：</p>
          <ul><li>🧬 傳承點 ${data.meta.legacy}</li><li>🔁 已重生 ${data.meta.runs || 0} 次</li>
          <li>📖 已達成結局 ${Object.keys(data.meta.endings || {}).length} 個</li><li>${life}</li></ul>
          <p class="muted">這台裝置上現有的進度會被覆蓋，無法復原。</p>
          <div class="row end"><button class="btn ghost" data-act="transfer">返回</button>
          <button class="btn danger" data-act="import-confirm">覆蓋並匯入</button></div>`);
      },
      async 'import-confirm'() {
        try { await AW.Save.importCode(this.pendingCode); } catch (e) { return this.toast(`⚠️ ${esc(e.message)}`, 'bad'); }
        this.pendingCode = null;
        this.S = null;
        this.closeModal();
        this.go('title');
        this.toast('✅ 匯入完成！歡迎回來。');
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
        const a = AW.ACTION_MAP[d.id];
        if (!a) return;
        // 一般行動和朋友時間各自計算名額，滿了就換掉最早選的那一個
        const n = a.npc ? E.friendSlots(this.S) : E.slots(this.S);
        if (!n) return;
        const same = (id) => !!AW.ACTION_MAP[id].npc === !!a.npc;
        u.selected = u.selected || [];
        const i = u.selected.indexOf(d.id);
        if (i >= 0) u.selected.splice(i, 1);
        else {
          const group = u.selected.filter(same);
          if (group.length >= n) u.selected.splice(u.selected.indexOf(group[0]), 1);
          u.selected.push(d.id);
        }
        this.render();
      },
      agenda(d) {
        if (AW.Second.pickAgenda(this.S, +d.i)) this.render();
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
        this.confirm(this.S.phase === 'esports' ? '確定要宣布退役嗎？職業生涯這一章將會結束。' : '確定要提前退休嗎？職涯這一章將會結束。', 'retire-confirm', '確定');
      },
      curtain() { this.confirm(AW.tx('life', 'curtain_confirm', this.S), 'curtain-confirm', '就此落幕'); },
      'curtain-confirm'() { this.closeModal(); E.curtain(this.S); this.afterEngine(); },
      'end-here'() { E.endHere(this.S); this.afterEngine(); },
      'continue-life'() { E.continueLife(this.S); this.ui = {}; this.afterEngine(); root.scrollTo && root.scrollTo({ top: 0, behavior: 'smooth' }); },
      'last-words'(d) { E.lastWords(this.S, Number(d.i)); this.afterEngine(); },
      fire() { this.confirm(AW.tx('status', 'fire_confirm', this.S), 'fire-confirm', '提早退休'); },
      'fire-confirm'() {
        this.closeModal();
        if (E.canFire(this.S)) E.offerChapter(this.S, 'fire');
        this.afterEngine();
      },
      'retire-confirm'() {
        this.closeModal();
        const s = this.S;
        E.offerChapter(s, s.phase === 'esports' ? AW.Esports.endingFor(s) : AW.Engineer.endingFor(s));
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
