# 🎮 阿維模擬器

養成一位遊戲天才的人生：從 0 歲開始培養阿維（劉家維），18 歲迎來成年檢定——
成為電競選手 **Aweiisa＿＿** 拚世界冠軍，或成為工程師拚**科技公司大老闆**。

▶ **線上遊玩：** https://hmsfailboat.github.io/AweiSimulator/

## 本機遊玩
純 HTML / CSS / JavaScript，無需安裝。直接用瀏覽器開啟 `index.html` 即可。進度存在瀏覽器的 localStorage。

## 專案結構
| 路徑 | 內容 |
|---|---|
| `index.html` | 入口 |
| `css/style.css` | 樣式 |
| `js/core.js` | 隨機數、數值定義、效果套用 |
| `js/data/` | 天賦、行動、隨機事件、結局／成就（新增內容主要改這裡） |
| `js/engine.js` | 年度流程、成年檢定、存讀檔、傳承 |
| `js/esports.js` / `js/engineer.js` | 兩條職涯 |
| `js/ui.js` | 畫面 |
| `tools/sim.js` | 平衡模擬：`node tools/sim.js 1000` |
| `docs/PLAN.md` | 實作企劃 |

## 更新網站
修改後 `git commit` 並 `git push`，GitHub Pages 會在一兩分鐘內自動更新。
