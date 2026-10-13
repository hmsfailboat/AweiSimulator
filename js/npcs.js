/* 朋友 NPC：認識、好友度、雇用
 * s.npcs = { 代號: { met: 認識時年齡, bond: 好友度 } }；s.staff = { chef: 1, guard: 1 }
 */
(function (root) {
  'use strict';
  const AW = root.AW;
  const B = () => AW.NPC_BOND;

  const NPC = (AW.NPC = {
    def(id) { return AW.NPCS[id]; },
    name(id) { return AW.tx('npc.' + id, 'name'); },
    icon(id) { return AW.Text.get('npc.' + id, 'icon') || '🙂'; },
    label(id) { return `${this.icon(id)} ${this.name(id)}`; },
    met(s, id) { return !!(s.npcs && s.npcs[id]); },
    bond(s, id) { return this.met(s, id) ? s.npcs[id].bond : 0; },
    metList(s) { return AW.NPC_ORDER.filter((id) => this.met(s, id)); },
    gamers(s) { return this.metList(s).filter((id) => AW.NPCS[id].gamer); },
    unmet(s, gamerOnly) { return AW.NPC_ORDER.filter((id) => !this.met(s, id) && (!gamerOnly || AW.NPCS[id].gamer)); },

    meet(s, id, key) {
      if (this.met(s, id)) return '';
      s.npcs[id] = { met: s.age, bond: B().start };
      const text = AW.tx('npc.' + id, key || (s.age >= 18 ? 'intro_adult' : 'intro'), s);
      AW.Engine.checkAchievements(s);
      return text;
    },

    // 改變好友度，回傳實際變化
    addBond(s, id, v) {
      if (!this.met(s, id) || !v) return 0;
      const n = s.npcs[id];
      const before = n.bond;
      n.bond = AW.clamp(Math.round(n.bond + v), 0, 100);
      return n.bond - before;
    },
    // 套用 { 代號: 變化 }，回傳 [{ id, v }]
    applyBonds(s, bonds) {
      const out = [];
      for (const id of Object.keys(bonds || {})) {
        const d = this.addBond(s, id, AW.val(bonds[id], s));
        if (d) out.push({ id, v: d });
      }
      return out;
    },

    // 揪團開黑：所有開黑朋友好友度上升，人緣越高漲越多
    squad(s) {
      const mult = 1 + s.stats.social / 200;
      const out = [];
      for (const id of this.gamers(s)) {
        const d = this.addBond(s, id, B().squad * mult);
        if (d) out.push({ id, v: d });
      }
      return out;
    },

    // 年末：好友度自然下降、依人緣擲骰認識新朋友（每年最多一位）
    yearEnd(s) {
      const keep = s.stats.social >= B().socialKeep;
      for (const id of this.metList(s)) {
        if (s.yearActions.includes('squad') && AW.NPCS[id].gamer) continue;
        this.addBond(s, id, -(keep ? B().decaySocial : B().decay));
      }
      // 人緣越高越容易認識；出社會後比較難交到新朋友
      const mult = (B().meetBase + s.stats.social / B().meetSocial) * (s.age >= 18 ? B().adultMult : 1);
      for (const id of AW.shuffle(this.unmet(s))) {
        const d = AW.NPCS[id];
        if (s.age < d.minAge) continue;
        let p = d.base * mult;
        if (s.yearActions.some((a) => d.likes.includes(a))) p += B().likeBonus;
        if (AW.chance(p)) {
          AW.Engine.note(s, this.icon(id), this.meet(s, id));
          break;
        }
      }
    },

    // ---------- 雇用 ----------
    hireState(s, job) {
      const st = AW.STAFF[job];
      if (!st) return { ok: false, hidden: true };
      if (s.staff && s.staff[job]) return { ok: false, hired: true };
      if (!this.met(s, st.npc)) return { ok: false, hidden: true };
      if (!AW.Shop.open(s)) return { ok: false, reason: '現在不能處理' };
      if (this.bond(s, st.npc) < st.bond) return { ok: false, reason: `好友度需要 ${st.bond}` };
      if (!st.need(s)) return { ok: false, reason: AW.tx('npc.' + st.npc, 'hire_need') };
      return { ok: true };
    },
    hire(s, job) {
      if (!this.hireState(s, job).ok) return false;
      s.staff = s.staff || {};
      s.staff[job] = 1;
      this.addBond(s, AW.STAFF[job].npc, 10);
      AW.Engine.addLog(s, this.icon(AW.STAFF[job].npc), AW.tx('npc.' + AW.STAFF[job].npc, 'hire_log', s));
      AW.Engine.checkAchievements(s);
      AW.Save.save(s);
      return true;
    },
    fire(s, job) {
      if (!s.staff || !s.staff[job]) return false;
      delete s.staff[job];
      AW.Engine.addLog(s, this.icon(AW.STAFF[job].npc), AW.tx('npc.' + AW.STAFF[job].npc, 'fire_log', s));
      AW.Save.save(s);
      return true;
    },
    // 雇用條件不再成立（例如賣掉房子）時自動解雇
    checkStaff(s) {
      for (const job of Object.keys(s.staff || {})) if (!AW.STAFF[job].need(s)) this.fire(s, job);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
