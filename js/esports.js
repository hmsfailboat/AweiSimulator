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
    major: { name: '職業聯賽', league: 66, playoffs: [70, 74, 78], fameMult: 1 },
  };
  const WORLDS = { groups: [74, 76, 78], ko: [{ name: '八強賽', opp: 80, bo: 3 }, { name: '四強賽', opp: 83, bo: 5 }, { name: '總決賽', opp: 85, bo: 5 }] };

  const Esports = (AW.Esports = {
    TIERS,
    teamName(tier, exclude) {
      const pool = TEAM_NAMES[tier].filter((n) => n !== exclude);
      return AW.pick(pool);
    },

    start(s, game) {
      if (game !== 'fps' && game !== 'dota') game = AW.resolveKey(s, 'best');
      const tier = s.stats[game] >= 72 || s.flags.scouted ? 1 : 0;
      s.esports = { game, tier, team: this.teamName(tier), seasons: 0, domesticTitles: 0, minorTitles: 0,
        worldTitles: 0, bestWorlds: 0, history: [], maxTier: tier };
      s.stats.teamwork = Math.max(s.stats.teamwork, Math.round(s.stats.social * 0.5));
    },

    mainStat(s) { return s.stats[s.esports.game]; },
    power(s) {
      const st = s.stats;
      return 0.5 * this.mainStat(s) + 0.25 * st.reflex + 0.15 * st.teamwork + 0.1 * st.mood;
    },
    teamPower(s) { return 0.45 * this.power(s) + 0.55 * TIERS[s.esports.tier].mates; },
    winProb(T, opp, bonus) { return AW.clamp(1 / (1 + Math.exp(-(T - opp) / 6)) + (bonus || 0), 0.02, 0.98); },

    series(T, opp, bo, bonus, oppName) {
      const p = this.winProb(T, opp + AW.randInt(-2, 2), bonus);
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

    runSeason(s) {
      const e = s.esports;
      const tier = TIERS[e.tier];
      const lg = LEAGUES[tier.league];
      const T = this.teamPower(s);
      const clutch = AW.traitOf(s).clutch || 0;
      const season = { T: Math.round(T), league: tier.league, stages: [], leagueWins: 0, summary: [], worldsReach: 0,
        playoffWins: 0, champion: false, finalist: false };

      // 聯賽
      const opps = AW.shuffle(DOMESTIC_OPP).slice(0, 7);
      const lgMatches = opps.map((n) => this.series(T, lg.league + AW.randInt(-7, 7), 1, 0, n));
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
      for (let i = 0; i < 3 && alive; i++) {
        const m = this.series(T, lg.playoffs[i], i === 2 ? 5 : 3, clutch, poOpps[i]);
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
      const groups = WORLDS.groups.map((o, i) => this.series(T, o, 1, clutch, wOpps[i]));
      const gw = groups.filter((m) => m.won).length;
      season.worldsReach = 1;
      season.stages.push({ name: '世界賽・小組賽', icon: '🌍', matches: groups, passed: gw >= 2,
        note: gw >= 2 ? `${gw} 勝 ${3 - gw} 敗，小組出線！` : `${gw} 勝 ${3 - gw} 敗，小組賽淘汰。` });
      if (gw < 2) { season.summary.push('世界賽小組賽'); return season; }
      const ko = [];
      for (let i = 0; i < WORLDS.ko.length; i++) {
        const r = WORLDS.ko[i];
        const m = this.series(T, r.opp, r.bo, clutch, wOpps[3 + i]);
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

      // 名氣、獎金
      let fame = season.leagueWins * lg.fameMult + season.playoffWins * 2 * lg.fameMult;
      let prize = 0;
      if (season.champion) {
        if (tier.league === 'major') { e.domesticTitles += 1; fame += 12; prize += 1000000; }
        else { e.minorTitles += 1; fame += 6; prize += 200000; }
      }
      if (season.worldsReach) {
        fame += 6 + (season.worldsReach - 1) * 5;
        prize += [0, 300000, 1000000, 3000000, 6000000, 15000000][season.worldsReach];
        e.bestWorlds = Math.max(e.bestWorlds, season.worldsReach);
      }
      if (season.worldChampion) { e.worldTitles += 1; fame += 25; }
      if (!season.leagueWins) fame -= 3;
      AW.applyEffects(s, { fame: Math.round(fame), money: prize + tier.salary });
      if (season.leagueWins <= 2) AW.applyEffects(s, { mood: -6 });
      if (season.champion) AW.applyEffects(s, { mood: 12, teamwork: 3 });
      e.history.push({ age: s.age, team: e.team, tier: e.tier, summary: season.summary.join(' → ') });
      AW.Engine.note(s, season.worldChampion ? '🏆' : season.champion ? '🥇' : '📊',
        `${e.team}：${season.summary.join(' → ')}（獎金+年薪 ${AW.fmtMoney(prize + tier.salary)}）`);

      // 老化
      this.aging(s);

      if (season.worldChampion) { s.pendingEnding = 'world_champ'; return; }
      if (s.age >= 32) {
        s.pendingEnding = this.endingFor(s);
        AW.Engine.note(s, '👋', '32 歲，是時候退役了。');
        return;
      }
      this.offseason(s, season);
    },

    aging(s) {
      const start = 26 + (AW.traitOf(s).reflexDelay || 0);
      if (s.age >= start) {
        let d = AW.randInt(2, 4);
        if (s.yearFlags.gym) d = Math.ceil(d / 2);
        AW.applyEffects(s, { reflex: -d });
        AW.Engine.note(s, '⏳', `年紀漸長，反應力 -${d}${s.yearFlags.gym ? '（健身減緩）' : ''}`);
      }
      if (s.age >= 29) AW.applyEffects(s, { main: -AW.randInt(1, 2) });
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
        let c = 0.1 + (P - TIERS[t].req) * 0.06 + s.stats.fame * 0.004 + (season.champion ? 0.25 : 0) - (t - e.tier - 1) * 0.3;
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
