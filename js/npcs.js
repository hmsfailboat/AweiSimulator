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
    // 會一起開黑的人：開黑朋友 + 偶爾陪玩的胡投顧
    squadMembers(s) { return this.metList(s).filter((id) => AW.NPCS[id].gamer || AW.NPCS[id].squad); },
    squadMult(id) { const d = AW.NPCS[id]; return d.gamer ? 1 : d.squad || 0; },
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

    // 揪團開黑：所有開黑朋友好友度上升，人緣越高漲越多（胡投顧只加一半）
    squad(s) {
      const mult = 1 + s.stats.social / 200;
      const out = [];
      for (const id of this.squadMembers(s)) {
        const d = this.addBond(s, id, B().squad * mult * this.squadMult(id));
        if (d) out.push({ id, v: d });
      }
      return out;
    },

    // 年末：好友度自然下降、依人緣擲骰認識新朋友（每年最多一位）
    yearEnd(s) {
      // 雇用條件不再成立（例如名氣掉到 40 以下，活動保鑣就不幹了）
      this.checkStaff(s);
      // 人緣高、或上了年紀（老朋友不會輕易斷了聯絡），好友度下降較慢
      const keep = s.stats.social >= B().socialKeep || s.age >= B().oldAge;
      for (const id of this.metList(s)) {
        const d = AW.NPCS[id];
        // 不打電動的朋友（胡投顧）：這一年有交際類行動，好友度反而上升
        if (!d.gamer && s.yearActions.some((a) => d.likes.includes(a))) { this.addBond(s, id, B().social); continue; }
        // 有揪團開黑的那一年，一起開黑的朋友好友度不會下降
        if (s.yearActions.includes('squad') && (d.gamer || d.squad)) continue;
        this.addBond(s, id, -(keep ? B().decaySocial : B().decay));
      }
      // 人緣越高越容易認識；出社會後比較難交到新朋友
      // 發哥人緣好，會幫你介紹朋友
      const mult = (B().meetBase + s.stats.social / B().meetSocial) * (s.age >= 18 ? B().adultMult : 1)
        * (this.bond(s, 'fa') >= B().faIntro ? B().faMeet : 1);
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
      if (!st.need(s)) return { ok: false, reason: AW.tx('staff.' + job, 'need') };
      return { ok: true };
    },
    hire(s, job) {
      if (!this.hireState(s, job).ok) return false;
      const st = AW.STAFF[job];
      s.staff = s.staff || {};
      // 升級：私人廚師取代營養便當、貼身保全取代活動保鑣
      if (st.replaces) delete s.staff[st.replaces];
      s.staff[job] = 1;
      this.addBond(s, st.npc, 10);
      AW.Engine.addLog(s, this.icon(st.npc), AW.tx('staff.' + job, 'hire_log', s));
      AW.Engine.checkAchievements(s);
      AW.Save.save(s);
      return true;
    },
    fire(s, job) {
      if (!s.staff || !s.staff[job]) return false;
      delete s.staff[job];
      AW.Engine.addLog(s, this.icon(AW.STAFF[job].npc), AW.tx('staff.' + job, 'fire_log', s));
      AW.Save.save(s);
      return true;
    },
    // 威脅事件會不會被保全擋掉（threat: true 視為居家威脅）
    guarded(s, threat) {
      const jobs = AW.THREAT_GUARDS[threat === true ? 'home' : threat] || [];
      return jobs.some((job) => s.staff && s.staff[job]);
    },
    // 阿方的健康餐：私人廚師或營養便當的效果設定（沒有的話是 null）
    mealPlan(s) {
      const M = AW.FANG_CARE.meal;
      return !s.staff ? null : s.staff.chef ? M.chef : s.staff.bento ? M.bento : null;
    },
    // 戰隊營養師：職業選手時期，阿方好友度夠高
    nutritionist(s) { return s.phase === 'esports' && !!s.flags.fangNutri && this.bond(s, 'fang') >= AW.FANG_CARE.nutriBond; },
    // 健康消耗減免（core.js 的 applyEffects）
    drainBonus(s, key) { return key === 'health' && this.nutritionist(s) ? AW.FANG_CARE.nutriDrain : 0; },
    // 雇用條件不再成立（例如賣掉房子）時自動解雇
    checkStaff(s) {
      for (const job of Object.keys(s.staff || {})) if (!AW.STAFF[job].need(s)) this.fire(s, job);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
