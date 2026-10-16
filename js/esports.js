/* 電競選手職涯：戰隊、賽季模擬、轉會、退役 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const TIERS = [
    { name: '業餘戰隊',   icon: '🥉', mates: 46, league: 'minor', salary: 100000,  req: 0 },
    { name: '次級聯賽隊', icon: '🥈', mates: 56, league: 'minor', salary: 300000,  req: 48 },
    { name: '職業聯賽隊', icon: '🥇', mates: 67, league: 'major', salary: 800000,  req: 58 },
    { name: '強隊',       icon: '💠', mates: 77, league: 'major', salary: 2000000, req: 67 },
    { name: '豪門戰隊',   icon: '💎', mates: 86, league: 'major', salary: 5000000, req: 75 },
  ];
  const TEAM_NAMES = [
    ['網咖之光', '巷口電競', '板橋小飛俠', '新莊夜貓子', '鹹酥雞戰隊', '珍奶突擊隊'],
    ['台南風神', '高雄海港', '新竹強風', '基隆雨神', '桃園機場快線', '宜蘭三星蔥'],
    ['Formosa Dragons', '台北閃電狼蛛', 'Taichung Thunder', 'Neon Tigers', 'Jade Emperors'],
    ['Phoenix Rising', 'Taipei Titans', 'Black Bears', 'Crimson Owls'],
    ['Royal Legion', 'Apex Kings', 'Celestial Gaming'],
  ];
  const DOMESTIC_OPP = ['夜市之王', '地瓜電競', 'Kaohsiung Krakens', '北投溫泉隊', 'Mango Esports', '鳳梨酥戰隊',
    'Taoyuan Typhoon', '九份迷霧', 'Island Kings', 'Hsinchu Hackers', 'Alishan Express', '101 Gaming'];
  const WORLD_OPP = ['KR Storm（韓）', 'CN Pandas（中）', 'EU Vikings（歐）', 'NA Eagles（美）', 'BR Samba（巴西）',
    'JP Ronin（日）', 'SEA Cobras（東南亞）', 'CIS Bears（獨國協）', 'VN Lotus（越）'];

  const LEAGUES = {
    minor: { name: '次級聯賽', league: 46, playoffs: [52, 56, 60], fameMult: 0.5 },
    major: { name: '職業聯賽', league: 66, playoffs: [69, 73, 77], fameMult: 1 },
  };
  // 宿敵王選手：能力成長、戰隊等級門檻、季後賽遇到的機率
  const RIVAL = { growUntil: 26, declineFrom: 29, tierSkill: [58, 68, 78, 85], meetPlayoff: 0.6, slayFinals: 1, friendsH2H: 8 };
  const WORLDS = { groups: [73, 75, 77], ko: [{ name: '八強賽', opp: 78, bo: 3 }, { name: '四強賽', opp: 81, bo: 5 }, { name: '總決賽', opp: 83, bo: 5 }] };
  const WORLD_PRIZE = [0, 300000, 1000000, 3000000, 6000000, 15000000];

  // 兩種遊戲的差異（說明文字在 texts.js 的 [esports]）
  // w: 個人戰力權重；k: 勝率曲線（越大越容易爆冷）；retire: 強制退役年齡
  // reflexFrom／mainFrom: 反應力、主遊戲能力開始衰退的年齡；fame: 名氣倍率；worlds: 世界賽獎金倍率；transfer: 轉會邀約機率加成
  // FPS：個人明星、早熟早退，贏下系列賽有機會打出 ACE；DOTA：團隊與戰術、大器晚成，每年有版本、世界賽獎池大
  const GAMES = {
    fps: { w: { main: 0.5, reflex: 0.35, teamwork: 0.1, tactics: 0, mood: 0.05 }, k: 7, retire: 31,
      reflexFrom: 25, mainFrom: 28, fame: 1.25, worlds: 1, transfer: 0.05 },
    dota: { w: { main: 0.5, reflex: 0.1, teamwork: 0.15, tactics: 0.15, mood: 0.1 }, k: 5, retire: 34,
      reflexFrom: 28, mainFrom: 31, fame: 1, worlds: 2.5, transfer: 0 },
  };
  // FPS 的 ACE：BO3 以上的系列賽每贏一場擲一次；反應力越高、練了「瞄準特訓」、打狙擊位機率越高
  const ACE = { base: 0.08, reflex: 0.004, aim: 0.08, awper: 0.06, max: 0.45, fame: 2 };
  // FPS 年度 MVP：例行賽至少 wins 勝、個人戰力比隊友實力高 gap 以上；年薪多 bonus
  const MVP = { wins: 6, gap: 6, fame: 6, bonus: 0.3 };
  // DOTA 的版本：每年隨機一個，契合度 min～max；練「BP 研究」至少 +draft
  const METAS = ['push', 'late', 'fight', 'gank', 'split'];
  const META = { min: -2, max: 2, draft: 3 };

  const Esports = (AW.Esports = {
    TIERS, GAMES,
    game(s) { return GAMES[(s.esports && s.esports.game) || 'fps']; },
    retireAge(s) { return this.game(s).retire; },
    teamName(tier, exclude) {
      const pool = TEAM_NAMES[tier].filter((n) => n !== exclude);
      return AW.pick(pool);
    },

    start(s, game) {
      if (game !== 'fps' && game !== 'dota') game = AW.resolveKey(s, 'best');
      const tier = s.stats[game] >= 72 || s.flags.scouted ? 1 : 0;
      s.esports = { game, tier, team: this.teamName(tier), seasons: 0, domesticTitles: 0, minorTitles: 0,
        worldTitles: 0, bestWorlds: 0, history: [], maxTier: tier, aces: 0, mvps: 0 };
      s.stats.teamwork = Math.max(s.stats.teamwork, Math.round(s.stats.social * 0.5));
      this.startTactics(s);
      s.fin.style = 0; // 新秀薪水低，先過小資生活
      this.startRival(s);
    },

    // DOTA 吃戰術：遊戲理解、學力、人緣好的人一出道就比較會看局勢
    startTactics(s) {
      if (s.esports.game !== 'dota') return;
      s.stats.tactics = Math.max(s.stats.tactics || 0, Math.round(s.stats.dota * 0.45 + s.stats.study * 0.3 + s.stats.social * 0.15));
    },
    // v2.2 以前的存檔：補上 ACE、MVP 次數；DOTA 選手補上戰術
    migrate(s) {
      if (!s.esports || s.esports.aces != null) return;
      s.esports.aces = 0;
      s.esports.mvps = 0;
      if (s.phase === 'esports') this.startTactics(s);
    },

    // ---------- 宿敵：王選手 ----------
    // 阿維出道同年，王選手也出道，主項目跟阿維相同（阿維選 DOTA，他也轉 DOTA）
    startRival(s) {
      const e = s.esports;
      const skill = AW.clamp(s.stats[e.game] + AW.randInt(-6, 4), 50, 95);
      const tier = AW.clamp(e.tier + AW.randInt(0, 1), 0, 4);
      s.rival = { skill, tier, team: this.teamName(tier, e.team), w: 0, l: 0, game: e.game };
      const text = AW.NPC.met(s, 'wang') ? '' : AW.NPC.meet(s, 'wang', 'intro_pro');
      AW.Engine.addLog(s, '🔥', (text ? text + ' ' : '') + AW.tx('rival', e.game === 'dota' ? 'debut_dota' : 'debut', s, this.rivalVars(s)));
    },
    rivalVars(s) {
      const r = s.rival;
      return r ? { 宿敵戰隊: r.team, 宿敵戰績: `${r.w} 勝 ${r.l} 敗` } : {};
    },
    // 阿維當教練時，王選手也轉任教練（coach = 教練實力）
    rivalCoaching(s) { return s.phase === 'second' && s.rival && s.rival.coach != null; },
    rivalTeamPower(s) {
      const r = s.rival;
      const own = this.rivalCoaching(s) ? r.coach : 0.8 * r.skill + 10;
      return 0.45 * own + 0.55 * TIERS[r.tier].mates;
    },
    rivalName(s) { return `${s.rival.team}（${AW.NPC.name('wang')}${this.rivalCoaching(s) ? '執教' : ''}）`; },
    rivalYear(s, myTeam) {
      const r = s.rival;
      if (!r) return;
      const key = this.rivalCoaching(s) ? 'coach' : 'skill';
      if (key === 'coach') r.coach += AW.randInt(0, 2);
      else if (s.age < RIVAL.growUntil) r.skill += AW.sround(AW.randInt(1, 4) * AW.diminish(r.skill));
      else if (s.age >= RIVAL.declineFrom) r.skill -= AW.randInt(1, 2);
      r[key] = AW.clamp(r[key], 40, 99);
      const target = RIVAL.tierSkill.filter((v) => r[key] >= v).length;
      const nt = r.tier + Math.sign(target - r.tier);
      if (nt !== r.tier && (nt < r.tier || AW.chance(0.6))) {
        r.tier = nt;
        r.team = this.teamName(nt, myTeam);
        AW.Engine.note(s, '🔥', AW.tx('rival', 'transfer', s, this.rivalVars(s)));
      } else if (r.team === myTeam) {
        r.team = this.teamName(r.tier, myTeam);
      }
    },

    mainStat(s) { return s.stats[s.esports.game]; },
    power(s) {
      const st = s.stats;
      const w = this.game(s).w;
      return w.main * this.mainStat(s) + w.reflex * st.reflex + w.teamwork * st.teamwork + w.tactics * st.tactics + w.mood * st.mood
        - (s.yearFlags.lag ? 4 : 0) - (st.health < AW.TIER.low ? (AW.NPC.nutritionist(s) ? AW.FANG_CARE.nutriPenalty : 3) : 0)
        + AW.Love.esportsPower(s);
    },
    teamPower(s) { return 0.45 * this.power(s) + 0.55 * TIERS[s.esports.tier].mates + (s.yearFlags.metaFit || 0); },
    winProb(T, opp, bonus, k) { return AW.clamp(1 / (1 + Math.exp(-(T - opp) / (k || 6))) + (bonus || 0), 0.02, 0.98); },

    // DOTA：今年的版本與契合度（每年開始時決定，記在 yearFlags）
    rollMeta(s) {
      if (!s.esports || s.esports.game !== 'dota' || s.yearFlags.meta) return;
      s.yearFlags.meta = AW.pick(METAS);
      s.yearFlags.metaFit = AW.randInt(META.min, META.max);
      // 去年先研究過新版本（事件「大改版」）
      if (s.yearFlags.metaRead) s.yearFlags.metaFit = Math.max(s.yearFlags.metaFit, META.draft);
    },
    metaText(s) {
      const f = s.yearFlags;
      if (!f.meta) return '';
      return AW.tx('esports', 'meta_' + f.meta, s) + `（${f.metaFit >= 0 ? '+' : ''}${f.metaFit}）`;
    },
    // 「BP 研究」：版本契合度至少 +META.draft
    readMeta(s) {
      this.rollMeta(s);
      s.yearFlags.metaFit = Math.max(s.yearFlags.metaFit || 0, META.draft);
    },
    aceChance(s) {
      return AW.clamp(ACE.base + (s.stats.reflex - 50) * ACE.reflex + (s.yearFlags.aim ? ACE.aim : 0) + (s.flags.awper ? ACE.awper : 0), 0.02, ACE.max);
    },

    series(T, opp, bo, bonus, oppName, k) {
      const p = this.winProb(T, opp + AW.randInt(-2, 2), bonus, k);
      const need = Math.ceil(bo / 2);
      const games = [];
      let w = 0, l = 0;
      while (w < need && l < need) {
        const g = AW.chance(p);
        games.push(g);
        if (g) w++; else l++;
      }
      return { oppName, opp, bo, p, games, w, l, won: w >= need };
    },

    // o：教練模式等覆寫 { tier, team, T, coach }
    runSeason(s, o) {
      const e = o || { tier: s.esports.tier, team: s.esports.team, T: this.teamPower(s) };
      const tier = TIERS[e.tier];
      const lg = LEAGUES[tier.league];
      const T = e.T;
      const k = this.game(s).k;
      // 選手本人上場時（教練模式不算），FPS 贏下 BO3 以上的系列賽有機會打出 ACE
      const aceP = !o && s.esports.game === 'fps' ? this.aceChance(s) : 0;
      const series = (T2, opp, bo, bonus, name) => {
        const m = this.series(T2, opp, bo, bonus, name, k);
        if (aceP && m.won && bo > 1 && AW.chance(aceP)) { m.tag = AW.tx('esports', 'ace_tag', s); m.ace = 1; }
        return m;
      };
      // 大心臟天賦；好感度 70 以上，另一半會到季後賽、世界賽現場應援
      const clutch = (AW.traitOf(s).clutch || 0) + AW.Love.cheerClutch(s);
      const meta = this.metaText(s);
      const season = { kind: 'esports', title: AW.tx('rival', 'season_title', s), pill: `隊伍戰力 ${Math.round(T)}${meta ? '・' + meta : ''}`,
        T: Math.round(T), league: tier.league, stages: [], leagueWins: 0, summary: [], worldsReach: 0,
        playoffWins: 0, champion: false, finalist: false };

      // 聯賽
      const opps = AW.shuffle(DOMESTIC_OPP).slice(0, 7);
      const lgMatches = opps.map((n) => series(T, lg.league + AW.randInt(-7, 7), 1, 0, n));
      // 宿敵在同一級聯賽：例行賽一定會碰到，季後賽也可能碰頭
      const rival = s.rival && TIERS[s.rival.tier].league === tier.league && s.rival.team !== e.team ? s.rival : null;
      const R = rival ? this.rivalTeamPower(s) : 0;
      if (rival) {
        const i = AW.randInt(0, 6);
        lgMatches[i] = Object.assign(series(T, Math.round(R), 1, 0, this.rivalName(s)), { rival: true });
      }
      season.leagueWins = lgMatches.filter((m) => m.won).length;
      const lgPass = season.leagueWins >= 4;
      season.stages.push({ name: `${lg.name}・例行賽`, icon: '📅', matches: lgMatches, passed: lgPass,
        note: `${season.leagueWins} 勝 ${7 - season.leagueWins} 敗${lgPass ? '，晉級季後賽！' : '，無緣季後賽。'}` });
      season.summary.push(`例行賽 ${season.leagueWins}-${7 - season.leagueWins}`);
      if (!lgPass) return season;

      // 季後賽
      const poOpps = AW.shuffle(DOMESTIC_OPP.filter((n) => !opps.slice(0, 2).includes(n)));
      const poMatches = [];
      const roundNames = ['八強', '四強', '決賽'];
      let alive = true;
      // 宿敵實力越強，越晚碰頭
      const rivalRound = !rival || !AW.chance(RIVAL.meetPlayoff) ? -1 : R >= lg.playoffs[2] - 2 ? 2 : R >= lg.playoffs[1] - 2 ? 1 : 0;
      for (let i = 0; i < 3 && alive; i++) {
        const isRival = i === rivalRound;
        const opp = isRival ? Math.max(Math.round(R), lg.playoffs[i] - 4) : lg.playoffs[i];
        const m = series(T, opp, i === 2 ? 5 : 3, clutch, isRival ? this.rivalName(s) : poOpps[i]);
        if (isRival) m.rival = true;
        m.round = roundNames[i];
        poMatches.push(m);
        if (m.won) season.playoffWins++;
        else alive = false;
        if (i === 2) { season.champion = m.won; season.finalist = true; }
      }
      season.stages.push({ name: `${lg.name}・季後賽`, icon: '🔥', matches: poMatches, passed: season.champion,
        note: season.champion ? `🏆 ${lg.name}冠軍！` : `止步${poMatches[poMatches.length - 1].round}。` });
      season.summary.push(season.champion ? `${lg.name}冠軍` : `季後賽${poMatches[poMatches.length - 1].round}`);

      // 世界賽：職業聯賽冠軍、亞軍晉級
      if (tier.league !== 'major' || !season.finalist) return season;
      const wOpps = AW.shuffle(WORLD_OPP);
      const groups = WORLDS.groups.map((opp, i) => series(T, opp, 1, clutch, wOpps[i]));
      const gw = groups.filter((m) => m.won).length;
      season.worldsReach = 1;
      season.stages.push({ name: '世界賽・小組賽', icon: '🌍', matches: groups, passed: gw >= 2,
        note: gw >= 2 ? `${gw} 勝 ${3 - gw} 敗，小組出線！` : `${gw} 勝 ${3 - gw} 敗，小組賽淘汰。` });
      if (gw < 2) { season.summary.push('世界賽小組賽'); return season; }
      const ko = [];
      for (let i = 0; i < WORLDS.ko.length; i++) {
        const r = WORLDS.ko[i];
        const m = series(T, r.opp, r.bo, clutch, wOpps[3 + i]);
        m.round = r.name;
        ko.push(m);
        season.worldsReach = 2 + i + (m.won ? 1 : 0);
        if (!m.won) break;
      }
      const won = season.worldsReach >= 5;
      season.worldChampion = won;
      season.stages.push({ name: '世界賽・淘汰賽', icon: '🏟️', matches: ko, passed: won,
        note: won ? '🏆🏆🏆 世界冠軍！！！' : `止步${ko[ko.length - 1].round}。` });
      season.summary.push(won ? '世界冠軍' : `世界賽${['', '小組賽', '八強', '四強', '亞軍'][season.worldsReach]}`);
      return season;
    },

    yearEnd(s) {
      const e = s.esports;
      const season = s.season;
      const tier = TIERS[e.tier];
      const lg = LEAGUES[tier.league];
      e.seasons += 1;

      const G = this.game(s);
      // 名氣、獎金
      let fame = season.leagueWins * lg.fameMult + season.playoffWins * 2 * lg.fameMult;
      let prize = 0;
      let salary = tier.salary;
      if (season.champion) {
        if (tier.league === 'major') { e.domesticTitles += 1; fame += 12; prize += 1000000; }
        else { e.minorTitles += 1; fame += 6; prize += 200000; }
      }
      if (season.worldsReach) {
        fame += 6 + (season.worldsReach - 1) * 5;
        prize += Math.round(WORLD_PRIZE[season.worldsReach] * G.worlds);
        e.bestWorlds = Math.max(e.bestWorlds, season.worldsReach);
      }
      if (season.worldChampion) {
        e.worldTitles += 1;
        fame += 25;
        if (e.game === 'dota' && s.age >= 30) s.flags.lateBloomer = 1;
      }
      if (!season.leagueWins) fame -= 3;
      // FPS：ACE、年度 MVP
      const aces = season.stages.reduce((n, st) => n + st.matches.filter((m) => m.ace).length, 0);
      if (aces) {
        e.aces = (e.aces || 0) + aces;
        fame += aces * ACE.fame;
        AW.Engine.note(s, '💥', AW.tx('esports', 'msg_ace', s, { 次數: aces, 生涯: e.aces }));
      }
      if (e.game === 'fps' && season.leagueWins >= MVP.wins && this.power(s) - tier.mates >= MVP.gap) {
        e.mvps = (e.mvps || 0) + 1;
        fame += MVP.fame;
        salary = Math.round(salary * (1 + MVP.bonus));
        AW.Engine.note(s, '🌟', AW.tx('esports', 'msg_mvp', s, { 獎金: AW.fmtMoney(salary - tier.salary) }));
      }
      if (fame > 0) fame *= G.fame;
      AW.applyEffects(s, { fame: Math.round(fame) });
      AW.Finance.earn(s, prize + salary);
      this.rivalResults(s, season);
      if (season.leagueWins <= 2) AW.applyEffects(s, { mood: -6 });
      if (season.champion) AW.applyEffects(s, { mood: 12, teamwork: 3 });
      e.history.push({ age: s.age, team: e.team, tier: e.tier, summary: season.summary.join(' → ') });
      AW.Engine.note(s, season.worldChampion ? '🏆' : season.champion ? '🥇' : '📊',
        `${e.team}：${season.summary.join(' → ')}（獎金+年薪 ${AW.fmtMoney(prize + salary)}）`);

      // 老化
      this.aging(s);

      if (season.worldChampion) {
        // 第一座世界冠軍是一個章節；繼續打的話挑戰衛冕（王朝）
        if (!AW.Engine.hasChapter(s, 'world_champ')) { s.pendingEnding = 'world_champ'; return; }
        AW.Engine.note(s, '👑', AW.tx('rival', 'msg_defend', s));
      }
      if (s.age >= G.retire) {
        s.pendingEnding = this.endingFor(s);
        AW.Engine.note(s, '👋', AW.tx('esports', 'msg_retire_' + e.game, s, { 年齡: s.age }));
        return;
      }
      this.offseason(s, season);
    },

    // 記錄與宿敵的對戰成績
    rivalResults(s, season, coach) {
      const r = s.rival;
      if (!r) return;
      for (const st of season.stages) for (const m of st.matches) {
        if (!m.rival) continue;
        if (m.won) r.w += 1; else r.l += 1;
        if (m.round === '決賽') {
          if (m.won) { s.flags.rivalSlayer = 1; AW.Engine.note(s, '🔥', AW.tx('rival', 'final_win', s, this.rivalVars(s))); }
          else AW.Engine.note(s, '💢', AW.tx('rival', 'final_lose', s, this.rivalVars(s)));
        }
      }
      this.rivalYear(s, coach ? s.second.team : s.esports.team);
    },

    aging(s) {
      const G = this.game(s);
      const start = G.reflexFrom + (AW.traitOf(s).reflexDelay || 0);
      if (s.age >= start) {
        let d = AW.randInt(2, 4);
        if (s.yearFlags.gym) d = Math.ceil(d / 2);
        AW.applyEffects(s, { reflex: -d });
        AW.Engine.note(s, '⏳', `年紀漸長，反應力 -${d}${s.yearFlags.gym ? '（健身減緩）' : ''}`);
      }
      if (s.age >= G.mainFrom) AW.applyEffects(s, { main: -AW.randInt(1, 2) });
    },

    offseason(s, season) {
      const e = s.esports;
      const P = this.power(s);
      // 不續約
      if (e.tier >= 1 && P < TIERS[e.tier].req - 6 && season.leagueWins <= 3) {
        const old = e.team;
        e.tier -= 1;
        e.team = this.teamName(e.tier, old);
        s.stats.teamwork = Math.round(s.stats.teamwork * 0.7);
        AW.applyEffects(s, { mood: -10, fame: -3 });
        AW.Engine.note(s, '📉', `${old} 沒有續約……轉投 ${e.team}（${TIERS[e.tier].name}）。`);
        return;
      }
      // 轉會邀約
      let offer = -1;
      for (let t = 4; t > e.tier; t--) {
        let c = 0.1 + this.game(s).transfer + (P - TIERS[t].req) * 0.06 + s.stats.fame * 0.004 + (season.champion ? 0.25 : 0) - (t - e.tier - 1) * 0.3;
        if (season.champion && TIERS[e.tier].league === 'minor' && t === 2) c = 1;
        if (AW.chance(AW.clamp(c, 0, 0.95))) { offer = t; break; }
      }
      if (offer < 0) return;
      const name = this.teamName(offer, e.team);
      const T = TIERS[offer];
      s.decision = {
        type: 'transfer', icon: '✍️', title: '轉會邀約',
        text: `${T.icon} ${T.name}「${name}」想簽下你！年薪 ${AW.fmtMoney(T.salary)}，隊友實力 ${T.mates}。\n換隊後團隊默契會下降（需要重新磨合）。`,
        options: [
          { label: `✍️ 加盟 ${name}`, apply: (st) => {
            st.esports.tier = offer;
            st.esports.team = name;
            st.esports.maxTier = Math.max(st.esports.maxTier, offer);
            st.milestones.tierUps += 1;
            st.stats.teamwork = Math.round(st.stats.teamwork * 0.7);
            AW.applyEffects(st, { mood: 8, fame: 3 });
            AW.Engine.checkAchievements(st);
            return { text: `加盟 ${name}（${T.name}）！` };
          } },
          { label: '🏠 留在原隊', apply: (st) => {
            AW.applyEffects(st, { teamwork: 3, mood: 3 });
            return { text: `婉拒 ${name}，選擇與 ${st.esports.team} 一起奮戰。` };
          } },
        ],
      };
    },

    onNewYear() { return false; },

    canRetire(s) { return s.phase === 'esports' && s.age >= 28; },

    endingFor(s) {
      const e = s.esports;
      if (e.worldTitles) return 'world_champ';
      if (e.bestWorlds >= 3) return 'worlds_legend';
      if (e.domesticTitles) return 'domestic_king';
      if (s.stats.fame >= 80) return 'streamer';
      return 'pro_retire';
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
