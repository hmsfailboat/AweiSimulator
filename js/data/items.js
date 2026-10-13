/* 道具商店（名稱、說明在 js/data/texts.js 的 [item.代號]）
 * type: gear  永久裝備，一局只能買一次；growth 成長加成、drain 消耗減免、
 *             effects 購買當下的效果、yearly 每年結算時的效果
 *       use   消耗品，買了立刻生效（effects），每年限買一次
 *       gift  送給交往對象的禮物，每年限買一次
 *       slot  今年行動數 +1，每年限一次，要在選擇行動前購買
 *       charm 幸運御守：下一次擲骰成功率 +15%，最多持有 3 個
 * need(s): 不符合就不顯示；cure: 購買後移除的旗標（例 chronic 慢性病）
 * price: 價格（數字或 (s) => 數字）；minAge / maxAge：年齡限制；stages：限定階段；tags: game → 被禁止打電動時不能買
 */
(function (root) {
  'use strict';
  const AW = root.AW;

  AW.CHARM_BONUS = 0.15;

  AW.ITEMS = [
    // ---------------- 裝備 ----------------
    { id: 'mouse', type: 'gear', price: 8000, minAge: 6, growth: { fps: 0.1 } },
    { id: 'keyboard', type: 'gear', price: 8000, minAge: 9, growth: { dota: 0.1 } },
    { id: 'notes', type: 'gear', price: 6000, minAge: 6, maxAge: 22, growth: { study: 0.1 } },
    { id: 'monitor', type: 'gear', price: 25000, minAge: 8, growth: { reflex: 0.1 } },
    { id: 'headset', type: 'gear', price: 15000, minAge: 8, drain: { mood: 0.15 } },
    { id: 'chair', type: 'gear', price: 30000, minAge: 10, drain: { health: 0.15 } },
    { id: 'laptop', type: 'gear', price: 60000, minAge: 15, growth: { tech: 0.12, study: 0.05 } },
    { id: 'suit', type: 'gear', price: 120000, minAge: 18, growth: { leader: 0.1, social: 0.1 } },
    { id: 'car', type: 'gear', price: 8000000, minAge: 20, effects: { fame: 8, mood: 15 }, yearly: { mood: 4 } },
    { id: 'mansion', type: 'gear', price: 30000000, minAge: 25, effects: { mood: 20 }, yearly: { mood: 6, health: 4 } },

    // ---------------- 消耗品 ----------------
    { id: 'supplement', type: 'use', price: 2000, effects: { health: 8 } },
    { id: 'newgame', type: 'use', price: 1500, minAge: 6, tags: ['game'], effects: { mood: 8, best: 1 } },
    { id: 'counsel', type: 'use', price: 8000, minAge: 10, effects: { mood: 15 } },
    { id: 'spa', type: 'use', price: 30000, minAge: 18, effects: { health: 12, mood: 12 } },
    { id: 'charm', type: 'charm', price: 1000, minAge: 3 },
    { id: 'treatment', type: 'use', price: (s) => (s.age < 18 ? 20000 : 300000), need: (s) => s.flags.chronic,
      cure: 'chronic', effects: { health: 10 } },
    { id: 'tutor', type: 'slot', price: 50000, minAge: 6, maxAge: 17 },
    { id: 'assistant', type: 'slot', price: 500000, minAge: 18 },
    { id: 'coach', type: 'use', price: 300000, stages: ['pro'], effects: { main: 4, teamwork: 2 } },
    { id: 'career_coach', type: 'use', price: 400000, stages: ['job', 'startup'], effects: { leader: 4, social: 2 } },

    // ---------------- 禮物 ----------------
    { id: 'flowers', type: 'gift', price: 2000, effects: { love: 8, mood: 2 } },
    { id: 'bag', type: 'gift', price: 150000, minAge: 18, effects: { love: 20 } },
    { id: 'necklace', type: 'gift', price: 1000000, minAge: 20, effects: { love: 35, mood: 5 } },
  ];

  AW.ITEM_MAP = {};
  for (const it of AW.ITEMS) AW.ITEM_MAP[it.id] = it;
})(typeof window !== 'undefined' ? window : globalThis);
