/* 道具商店（名稱、說明在 js/data/texts.js 的 [item.代號]）
 * type: gear  永久裝備，一局只能買一次；growth 成長加成、drain 消耗減免、
 *             effects 購買當下的效果、yearly 每年結算時的效果
 *       use   消耗品，買了立刻生效（effects），每年限買一次
 *       gift  送給交往對象的禮物，每年限買一次
 *       slot  今年行動數 +1，每年限一次，要在選擇行動前購買
 *       charm 幸運御守：下一次擲骰成功率 +15%，最多持有 3 個
 * need(s): 不符合就不顯示；lock(s): 回傳文字時顯示為鎖定（例如還不需要）；cure: 購買後移除的旗標（例 chronic 慢性病）
 * upkeep: 每年維護費；adapt: 享樂適應，yearly 效果每年減半；loan: 房貸 { down 頭期比例, rate 年利率, years 年數 }
 * tolerance: 連續每年購買，效果乘上 tolerance 的次方；sell: 變賣時拿回原價的比例
 * price: 價格（數字或 (s) => 數字）；minAge / maxAge：年齡限制；stages：限定階段；tags: game → 被禁止打電動時不能買
 * estate: 房地產的基準價，價格與變賣價隨房市漲跌（js/estate.js），sell 是扣掉仲介費、稅之後拿回市值的比例
 * vars(s): 說明文字的專屬變數
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  AW.CHARM_BONUS = 0.15;
  // 房子的說明：{總價} 目前的價格（劉地主好友度夠高時已打折）
  const estateVars = (s, base) => ({ 總價: AW.fmtMoney(AW.Estate.buyPrice(s, base)) });

  AW.ITEMS = [
    // ---------------- 裝備 ----------------
    { id: 'mouse', type: 'gear', price: 8000, minAge: 6, growth: { fps: 0.1 } },
    { id: 'keyboard', type: 'gear', price: 8000, minAge: 9, growth: { dota: 0.1 } },
    { id: 'notes', type: 'gear', price: 6000, minAge: 6, maxAge: 22, growth: { study: 0.1 } },
    { id: 'monitor', type: 'gear', price: 25000, minAge: 8, growth: { reflex: 0.1 } },
    { id: 'headset', type: 'gear', price: 15000, minAge: 8, drain: { mood: 0.15 } },
    { id: 'chair', type: 'gear', price: 30000, minAge: 10, drain: { health: 0.15 } },
    { id: 'laptop', type: 'gear', price: 60000, minAge: 15, growth: { tech: 0.12, study: 0.05 } },
    { id: 'suit', type: 'gear', price: 120000, minAge: 18, growth: { leader: 0.06, social: 0.06 } },
    { id: 'house', type: 'gear', estate: 15000000, price: (s) => AW.Estate.buyPrice(s, 15000000), minAge: 22,
      loan: { down: 0.2, rate: 0.022, years: 20 }, sell: 0.9, effects: { mood: 10 }, vars: (s) => estateVars(s, 15000000) },
    { id: 'car', type: 'gear', price: 8000000, minAge: 20, upkeep: 400000, adapt: true, sell: 0.5,
      effects: { fame: 8, mood: 15 }, yearly: { mood: 4 } },
    { id: 'mansion', type: 'gear', estate: 30000000, price: (s) => AW.Estate.buyPrice(s, 30000000), minAge: 25, upkeep: 600000, adapt: true,
      sell: 0.8, effects: { mood: 20 }, yearly: { mood: 6 }, vars: (s) => estateVars(s, 30000000) },

    // ---------------- 消耗品 ----------------
    { id: 'supplement', type: 'use', price: 2000, tolerance: 0.6, effects: { health: 5 } },
    { id: 'newgame', type: 'use', price: 1500, minAge: 6, tags: ['game'], effects: { mood: 8, best: 1 } },
    { id: 'counsel', type: 'use', price: 8000, minAge: 10, effects: { mood: 12 },
      lock: (s) => (s.stats.mood >= AW.TIER.low ? '心情低於 40 時才能預約' : '') },
    { id: 'charm', type: 'charm', price: 1000, minAge: 3 },
    { id: 'treatment', type: 'use', price: (s) => (s.age < 18 ? 20000 : 300000), need: (s) => s.flags.chronic,
      cure: 'chronic', effects: { health: 10 } },
    { id: 'tutor', type: 'slot', price: 50000, minAge: 6, maxAge: 17 },
    // 私人助理：價格隨去年收入提高（年收的 3 成，最少 50 萬）
    { id: 'assistant', type: 'slot', price: (s) => Math.max(500000, Math.round(s.fin.lastIncome * 0.3 / 10000) * 10000), minAge: 18 },
    { id: 'coach', type: 'use', price: 300000, stages: ['pro'], tolerance: 0.6, effects: { main: 4, teamwork: 2 } },
    { id: 'career_coach', type: 'use', price: (s) => Math.max(400000, Math.round(s.fin.lastIncome * 0.15 / 10000) * 10000), stages: ['job', 'startup'],
      tolerance: 0.6, effects: { leader: 3, social: 1 } },

    // ---------------- 禮物 ----------------
    { id: 'flowers', type: 'gift', price: 2000, effects: { love: 8, mood: 2 } },
    { id: 'bag', type: 'gift', price: 150000, minAge: 18, effects: { love: 20 } },
    { id: 'necklace', type: 'gift', price: 1000000, minAge: 20, effects: { love: 35, mood: 5 } },
  ];

  AW.ITEM_MAP = {};
  for (const it of AW.ITEMS) AW.ITEM_MAP[it.id] = it;
})(typeof window !== 'undefined' ? window : globalThis);
