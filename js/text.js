/* 文本系統：解析 js/data/texts.js，把文字填回各資料物件
 * 文本格式：[分類.代號] 開區塊，「鍵 = 內容」一行一個，# 開頭為註解，\n 換行，{變數} 代入
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  const Text = (AW.Text = {
    data: {},
    missing: [],
    warnings: [],

    load(src) {
      let sec = null;
      String(src).split(/\r?\n/).forEach((raw, i) => {
        const line = raw.trim();
        if (!line || line[0] === '#') return;
        const m = line.match(/^\[(.+)\]$/);
        if (m) { sec = m[1].trim(); this.data[sec] = this.data[sec] || {}; return; }
        const eq = line.indexOf('=');
        if (!sec || eq < 0) { this.warnings.push(`第 ${i + 1} 行看不懂：${line}`); return; }
        this.data[sec][line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/\\n/g, '\n');
      });
    },

    get(sec, key) { return this.data[sec] && this.data[sec][key]; },

    // 通用變數：任何文本都能用
    vars(s) {
      if (!s) return {};
      const v = { 名字: s.displayName, 年齡: s.age, 另一半: (s.love && s.love.name) || '她',
        新歡: s.flings && s.flings.length ? s.flings[s.flings.length - 1].name : '她' };
      if (s.kids && s.kids.length) Object.assign(v, { 孩子: s.kids[0].name, 最小的孩子: s.kids[s.kids.length - 1].name });
      if (s.esports) Object.assign(v, { 戰隊: s.esports.team, 國內冠軍: s.esports.domesticTitles, 世界冠軍: s.esports.worldTitles });
      if (s.eng) Object.assign(v, { 公司: s.eng.stage === 'startup' ? s.eng.startupName : s.eng.companyName,
        職級: AW.Engineer ? AW.Engineer.rankName(s) : '' });
      // 第二幕：企業家、董事長的公司
      if (s.phase === 'second' && s.second && s.second.name) v.公司 = s.second.name;
      return v;
    },

    fill(str, s, extra) {
      if (str == null || str.indexOf('{') < 0) return str;
      const v = Object.assign(this.vars(s), extra || {});
      return str.replace(/\{([^{}]+)\}/g, (all, k) => (v[k] != null ? v[k] : all));
    },

    miss(sec, key) {
      this.missing.push(`${sec} → ${key}`);
      return `【缺少文本 ${sec}.${key}】`;
    },

    /**
     * 取出一段文本並轉成「字串或 (s) => 字串」。
     * localVars(s) 提供區域變數；variant(s) 決定版本（key_版本）。
     */
    entry(sec, key, opt) {
      opt = opt || {};
      if (opt.variant) {
        const has = Object.keys(this.data[sec] || {}).some((k) => k.startsWith(key + '_'));
        if (!has && this.get(sec, key) == null) return this.miss(sec, key + '_…');
        return (s) => {
          const raw = this.get(sec, `${key}_${opt.variant(s)}`);
          return this.fill(raw != null ? raw : this.get(sec, key) || '', s, opt.vars && opt.vars(s));
        };
      }
      const raw = this.get(sec, key);
      if (raw == null) return opt.required ? this.miss(sec, key) : undefined;
      if (raw.indexOf('{') < 0) return raw;
      return (s) => this.fill(raw, s, opt.vars && opt.vars(s));
    },

    // 名稱類文字（不支援變數）
    basic(obj, sec, keys) {
      for (const k of keys) {
        const req = k[0] !== '?';
        const key = req ? k : k.slice(1);
        const v = this.get(sec, key);
        if (v != null) obj[key === 'lock' ? 'lockText' : key] = v;
        else if (req) obj[key] = this.miss(sec, key);
      }
    },

    apply() {
      for (const e of AW.EVENTS) {
        const sec = 'event.' + e.id;
        const o = { vars: e.vars };
        this.basic(e, sec, ['icon', 'title']);
        e.text = this.entry(sec, 'text', Object.assign({ required: true, variant: e.variant }, o));
        if (e.choices && e.choices.length) {
          e.choices.forEach((c, i) => {
            const n = i + 1;
            c.text = this.entry(sec, 'choice' + n, { required: true, vars: e.vars });
            if (c.roll) {
              c.roll.success.result = this.entry(sec, 'success' + n, o);
              c.roll.fail.result = this.entry(sec, 'fail' + n, o);
            } else c.result = this.entry(sec, 'result' + n, o);
          });
        } else e.result = this.entry(sec, 'result', o);
      }
      for (const a of AW.ACTIONS) {
        const sec = 'action.' + a.id;
        this.basic(a, sec, ['icon', 'name', '?lock']);
        a.desc = this.entry(sec, 'desc', { required: true });
      }
      for (const id of Object.keys(AW.TRAITS)) this.basic(AW.TRAITS[id], 'trait.' + id, ['icon', 'name', 'desc']);
      for (const id of Object.keys(AW.UPGRADES)) this.basic(AW.UPGRADES[id], 'upgrade.' + id, ['icon', 'name', 'desc']);
      for (const a of AW.ACHIEVEMENTS) this.basic(a, 'achievement.' + a.id, ['icon', 'name', 'desc']);
      for (const it of AW.ITEMS) this.basic(it, 'item.' + it.id, ['icon', 'name', 'desc']);
      for (const id of Object.keys(AW.ENDINGS)) {
        const e = AW.ENDINGS[id];
        this.basic(e, 'ending.' + id, ['icon', 'name']);
        e.text = this.entry('ending.' + id, 'text', { required: true, variant: e.variant });
      }
      if (this.missing.length && root.console) root.console.warn('[阿維模擬器] 文本缺少：\n' + this.missing.join('\n'));
      if (this.warnings.length && root.console) root.console.warn('[阿維模擬器] 文本格式問題：\n' + this.warnings.join('\n'));
    },
  });

  /** 程式中取用文本：AW.tx('action.gym', 'msg', s, { 額外變數 }) */
  AW.tx = (sec, key, s, extra) => {
    const raw = Text.get(sec, key);
    return raw == null ? Text.miss(sec, key) : Text.fill(raw, s, extra);
  };
  /** 文本清單（用 、或 , 分隔） */
  AW.txList = (sec, key) => String(Text.get(sec, key) || '').split(/[、,，]/).map((x) => x.trim()).filter(Boolean);
})(typeof window !== 'undefined' ? window : globalThis);
