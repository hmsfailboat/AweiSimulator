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
| `js/data/texts.js` | **所有遊戲文字**（事件、選項、行動、成就、結局、天賦、道具） |
| `js/data/` | 天賦、行動、隨機事件、道具、朋友 NPC、結局／成就的數值與條件 |
| `js/text.js` | 文本解析，把 texts.js 的文字填進資料 |
| `js/engine.js` | 年度流程、成年檢定、存讀檔、傳承 |
| `js/esports.js` / `js/engineer.js` | 兩條職涯（電競含宿敵王選手） |
| `js/office.js` | 工程師的職場聯賽：季度專案、同期排行、升遷答辯、董事會投票、創業募資 |
| `js/finance.js` | 所得稅、生活水準、投資、貸款、負債與破產 |
| `js/estate.js` | 房地產：房市漲跌、自住房與豪宅的市值、收租物件（劉地主） |
| `js/npcs.js` | 朋友：認識、好友度、雇用 |
| `js/second.js` | 人生第二幕（實況主、教練、創業、董事長、退休）、晚年、遺願清單、人生終章 |
| `js/family.js` | 子女、孫子 |
| `js/love.js` | 感情：交往、求婚、結婚、分手、同時交往 |
| `js/shop.js` | 道具商店、賭場 |
| `js/ui.js` | 畫面 |
| `tools/sim.js` | 平衡模擬：`node tools/sim.js 1000`；`node tools/sim.js --meta` 統計幾局能全部解鎖傳承商店 |
| `docs/PLAN.md` / `docs/PLAN-v2.md` | 實作企劃（v1.0／v1.2 之後） |
| `docs/ENDINGS.md` | **結局與成就一覽**：達成條件、傳承點（`tools/sim.js` 會檢查有沒有漏列） |

## 修改遊戲文字
所有事件、選項、成就等文字都集中在 [`js/data/texts.js`](js/data/texts.js)，用簡單的「欄位 = 內容」格式撰寫，改完存檔、重新整理網頁就會生效。檔案開頭有完整的格式說明。

改完可以執行 `node tools/sim.js 100` 檢查：缺少或格式錯誤的文本會列在最前面。

## 版本紀錄
見 [CHANGELOG.md](CHANGELOG.md)。

## 更新網站
修改後 `git commit` 並 `git push`，GitHub Pages 會在一兩分鐘內自動更新。
