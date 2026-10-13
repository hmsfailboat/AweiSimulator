/* 阿維模擬器・遊戲文本（說明見下方 # 開頭的段落） */
AW.Text.load(String.raw`
# ================================================================
#  阿維模擬器・遊戲文本
#  改完存檔，重新整理網頁就會生效。
#
#  【格式】
#  [分類.代號]     一個區塊。代號對應程式裡的 id，請不要改。
#  欄位 = 內容     等號左邊是欄位名稱（不要改），右邊的文字可以隨意修改。
#  # 開頭的行      註解，遊戲會忽略。
#  \n              在文字中換行。
#  {變數}          顯示時會被替換，可用的變數見下方。
#
#  【注意】
#  ・內容不能出現反引號（鍵盤左上角、數字 1 左邊那個鍵），
#    也不能出現「$」緊接著「{」，否則整份文本會失效。
#  ・刪掉必要的欄位，畫面上會顯示「【缺少文本 …】」；
#    按 F12 打開瀏覽器主控台，可以看到缺少或格式錯誤的清單。
#  ・這裡只能改文字。新增事件／選項、調整數值，要改 js/data/ 裡的程式。
#
#  【欄位】
#  事件 event    icon 圖示｜title 標題｜text 內文｜result 結果（沒有選項的事件）
#                choice1 第 1 個選項｜result1 選了它之後的結果
#                擲骰選項（畫面上有 🎲）改用 success1 成功／fail1 失敗
#                text_xxx：同一事件依情況顯示不同版本的內文（版本名稱不要改）
#  行動 action   icon｜name 名稱｜desc 說明｜lock 鎖定時的提示｜msg_xxx 特殊結果訊息
#  天賦 trait、成就 achievement、傳承升級 upgrade、道具 item：icon｜name｜desc
#  結局 ending   icon｜name｜text（或 text_xxx 版本）
#
#  【通用變數】任何內文、選項、結果都能使用
#  {名字}    目前的名字（出道後是選手 ID）
#  {另一半}  交往對象的名字（沒有的話顯示「她」）
#  {年齡}
#  {戰隊} {國內冠軍} {世界冠軍}   電競職涯才有
#  {公司} {職級}                  工程師職涯才有
#  個別事件另有專屬變數，寫在該區塊的註解裡。
# ================================================================


# ============================================================
#  隨機事件
# ============================================================

# ---------- 學生時期 ----------

[event.first_word]
icon = 👶
title = 人生第一句話
text = 全家人圍著你，等你開口說第一句話……
choice1 = 「媽媽」
result1 = 媽媽感動到哭出來。
choice2 = 「GG」
result2 = 爸爸愣了三秒，然後笑到在地上打滾。遊戲天才的傳說從這裡開始。
choice3 = 「爸爸」
result3 = 爸爸決定把電腦讓給你玩（等你長大後）。

[event.fever]
icon = 🤒
title = 發高燒
text = 半夜燒到 39 度，全家人輪流守著你。

[event.grandma]
icon = 👵
title = 阿嬤來家裡
text = 阿嬤帶了一大袋水果和一個紅包：「乖孫，要吃飽喔！」

# 專屬變數：{紅包}
[event.cny]
icon = 🧧
title = 過年領紅包
text = 過年拿到 {紅包} 紅包！要怎麼處理？
choice1 = 存起來
result1 = 小豬撲滿越來越重了。
choice2 = 全部拿去買遊戲點數
result2 = 新造型、新英雄，爽！

[event.hand_speed]
icon = 🖐️
title = 驚人的手速
text = 玩打地鼠機台時，你把機器打到當機。老闆說這孩子的手速是天生的。

[event.first_pc]
icon = 🖥️
title = 家裡買了第一台電腦
text = 爸爸搬回一台嶄新的電腦，說是「給你查資料用的」。
choice1 = 當然是先灌遊戲
result1 = 「查資料」的資料夾裡全是遊戲。
choice2 = 真的拿來查資料
result2 = 你學會了打字和搜尋，爸媽很欣慰。

[event.confiscate]
icon = 😡
title = 爸媽沒收電腦
text = 成績單寄到家裡，爸媽臉色鐵青，當場拔掉電腦的電源線。
choice1 = 乖乖認錯
result1 = 今年沒辦法打電動了，只好讀書。
choice2 = 半夜偷玩
success2 = 神不知鬼不覺！手感還在。
fail2 = 被抓包了，電腦直接被鎖進櫃子。今年沒辦法打電動。

[event.exam_top]
icon = 🥇
title = 段考全班第一
text = 成績單上一排漂亮的數字，老師在全班面前誇獎你。

[event.exam_fail]
icon = 📉
title = 段考考砸了
text = 考卷上的紅字比黑字還多……
choice1 = 發憤圖強
result1 = 把錯題一題一題訂正完。
choice2 = 擺爛，反正還有下次
result2 = 人生總會有辦法的吧。

[event.tease]
icon = 😤
title = 被同學嘲笑太宅
text = 班上的風雲人物說你「只會打電動，是個邊緣人」。
choice1 = 約他 SOLO，用實力說話
success1 = 你 10:0 電爆他，隔天全班都想跟你組隊。
fail1 = 今天手感不好……被嘲笑得更兇了。
choice2 = 不理他
result2 = 你戴上耳機，世界安靜了。

[event.crush]
icon = 💌
title = 暗戀隔壁班的她
text = 每次經過隔壁班，心跳都會漏一拍。
choice1 = 鼓起勇氣告白
success1 = 她答應了！整個世界都在發光。
fail1 = 「你是個好人。」……今晚只想一個人靜靜。
choice2 = 約她一起打遊戲
success2 = 你 carry 全場，她說「你好帥」。
fail2 = 你太專注在遊戲，完全忘了跟她講話。
choice3 = 把心意寫在日記裡
result3 = 青春就是這樣吧。

[event.lan_party]
icon = 🔌
title = 同學家 LAN Party
text = 五個人、五台電腦、一整箱零食。

[event.sports_day]
icon = 🏃
title = 運動會
text = 班導拜託你報名大隊接力。
choice1 = 報名！
result1 = 起跑反應全場最快，大家都嚇到了。
choice2 = 躲在教室滑手機
result2 = 你在教室打完了三場排位。

[event.pro_tv]
icon = 📡
title = 第一次看職業比賽轉播
text = 螢幕上，選手在萬人歡呼中舉起冠軍獎盃。
choice1 = 「我以後也要站上那個舞台！」
result1 = 一顆種子在心裡發芽了。
choice2 = 「打電動能當飯吃喔？」
result2 = 你轉台去看科學節目。

[event.hacked]
icon = 🏴‍☠️
title = 帳號被盜
text = 辛苦練了好幾年的帳號被盜，裝備全部不見了。
choice1 = 從頭練一隻新的
result1 = 重練的過程反而讓你的基本功更扎實。
choice2 = 暫時不玩了
result2 = 你花了一個月走出陰霾。

[event.ranked_top]
icon = 📈
title = 天梯打進前 500 名
text = 你的 ID 第一次出現在伺服器排行榜上，私訊匣塞滿了邀請。
result = 有職業戰隊的經理加了你好友（試訓成功率提升）。

[event.typhoon]
icon = 🌀
title = 颱風假
text = 人事行政總處宣布明天停班停課！
choice1 = 窩在家打一整天
result1 = 外面風雨交加，你在家打得天昏地暗。
choice2 = 把作業寫完
result2 = 颱風天特別好專心。

[event.parents_fight]
icon = 🌧️
title = 爸媽吵架
text = 客廳傳來摔東西的聲音，你戴上耳機假裝沒聽到。

[event.camp]
icon = ⛺
title = 暑期營隊
text = 爸媽說暑假可以選一個營隊參加。
choice1 = 程式設計營
result1 = 你寫出了人生第一個小遊戲。（日後技術力加成）
choice2 = 電競訓練營（5,000 元）
result2 = 教練說你是他看過最有天分的學員。
choice3 = 籃球營
result3 = 曬黑了，也交到一群好朋友。

[event.olympiad]
icon = 🧮
title = 數學競賽
text = 老師推薦你代表學校參加數學競賽。
choice1 = 全力以赴
success1 = 拿下金牌！校門口掛了紅布條。
fail1 = 差一點點……但你學到很多。
choice2 = 婉拒，去打電動
result2 = 老師有點失望。

[event.myopia]
icon = 👓
title = 近視加深
text = 眼科醫生說你的度數又加深了，要你少盯螢幕。

[event.new_game]
icon = 🆕
title = 超級大作上市
text = 等了三年的大作終於上市了！
choice1 = 熬夜通關
result1 = 48 小時全成就，你是全台第一個。
choice2 = 先把正事做完
result2 = 自律是一種美德。

[event.cousin]
icon = 🧑‍🦱
title = 電競宅表哥
text = 過年時，表哥教你什麼叫「預瞄」和「補刀」。

[event.legend]
icon = 🔥
title = 「遊戲天才」名聲傳開
text = 全校都知道三年級有個打遊戲超猛的劉家維。

[event.wallet]
icon = 👛
title = 撿到錢包
text = 放學路上撿到一個鼓鼓的錢包。
choice1 = 交給警察
result1 = 失主送來感謝狀，你上了社區報。
choice2 = 偷偷收下
result2 = 多了 3,000 元，但晚上睡不太好。

[event.flu]
icon = 🤧
title = 流感大流行
text = 一場流感讓你躺了一個禮拜。

[event.cat]
icon = 🐈
title = 家裡養了一隻貓
text = 一隻橘貓跟著你回家，從此牠最喜歡睡在你的鍵盤上。

# text_high：學力 55 以上；text_low：未達 55
[event.mock_exam]
icon = 📋
title = 學測模擬考
text_high = 落點分析顯示你有機會上資工系！
text_low = 模擬考成績離資工系還有一段距離……
choice1 = 加把勁
result1 = 書桌上的燈亮到深夜。
choice2 = 順其自然
result2 = 船到橋頭自然直。

[event.scout]
icon = 🕵️
title = 業餘賽被球探注意
text = 一位職業戰隊的經理在比賽後遞給你一張名片：「18 歲來找我。」

[event.netcafe_raid]
icon = 🚨
title = 網咖臨檢
text = 正在網咖打到關鍵團戰，警察突然進來臨檢未成年……
choice1 = 躲進廁所
success1 = 驚險過關，回到座位上還贏了那場團戰。
fail1 = 被抓到，爸媽到警局領人。今年禁止打電動。
choice2 = 乖乖被帶走
result2 = 被罰寫悔過書，今年禁止打電動。

[event.game_dev_dream]
icon = 🧑‍💻
title = 修改遊戲檔案
text = 你發現改一行設定檔就能讓角色跑得飛快。程式好像很有趣？

# ---------- 電競職涯 ----------

[event.fan_meet]
icon = 🙌
title = 粉絲見面會
text = 現場排了好長的隊伍，有人舉著寫有你 ID 的燈牌。

[event.toxic_mate]
icon = 🤬
title = 隊友互噴
text = 訓練賽輸了之後，隊友在語音裡開始互相指責。
choice1 = 主動和解，擔起責任
result1 = 大家冷靜下來，隊伍反而更團結。
choice2 = 跟他對噴
result2 = 爽是爽了，但接下來一週沒人講話。
choice3 = 找教練處理
result3 = 教練開了一場長長的檢討會。

[event.cheat_accuse]
icon = 🕵️‍♂️
title = 被指控開外掛
text = 你的一個神級反應被剪成影片，標題寫著「這絕對是外掛」。
choice1 = 開手部視角直播自證
success1 = 直播中你連續爆頭十次，質疑聲變成了尖叫。
fail1 = 緊張到手抖，直播翻車了……
choice2 = 冷處理
result2 = 風波慢慢平息，但心裡很不是滋味。

[event.sponsor]
icon = 🤑
title = 贊助商找上門
text = 電競周邊品牌想推出你的聯名款滑鼠。

[event.wrist]
icon = 🩹
title = 手腕受傷
text = 長年的高強度訓練讓手腕發炎了，醫生建議休養。
choice1 = 乖乖休養
result1 = 手腕慢慢恢復，但手感退步了一些。
choice2 = 打止痛針硬上
result2 = 比賽沒受影響，但身體在抗議。

[event.patch]
icon = 🔄
title = 遊戲大改版
text = 新版本把整個 meta 翻了過來，大家都在重新摸索。
choice1 = 第一時間研究新版本
success1 = 你比所有人都早摸透新版本，練習賽連勝。
fail1 = 方向研究錯了，白忙一場。
choice2 = 堅持自己的風格
result2 = 風格是你的，但版本不是。

[event.legend_coach]
icon = 🧙
title = 傳奇教練指點
text = 退役的傳奇選手看完你的比賽，私下約你吃飯。

[event.burnout_warn]
icon = 😮‍💨
title = 職業倦怠
text = 某天醒來，你發現自己一點都不想打開遊戲。

[event.rookie]
icon = 🐣
title = 天才新人挑戰你的位置
text = 戰隊簽下了一個 17 歲的新人，數據漂亮得可怕。
choice1 = 加練，不能被追上
result1 = 你守住了先發位置。
choice2 = 把經驗傳承給他
result2 = 新人很崇拜你，隊伍氣氛超好。

[event.mom_visit]
icon = 👩
title = 媽媽來看比賽
text = 觀眾席上，媽媽舉著自己做的應援板，上面寫著「家維加油」。

[event.contract]
icon = 📄
title = 合約糾紛
text = 戰隊拖欠薪水，你考慮要不要找律師。
choice1 = 找律師
result1 = 花了錢，但拿回了該有的權益。
choice2 = 算了，以和為貴
result2 = 有點吃虧，但不想把事情鬧大。

[event.bootcamp]
icon = ✈️
title = 海外移地訓練
text = 戰隊安排去電競強國移地訓練一個月。

[event.viral_clip]
icon = 🎬
title = 神操作影片爆紅
text = 你的一波 1 打 4 被剪成短影片，播放數破百萬。

[event.old_teammate]
icon = 🍜
title = 老隊友約吃宵夜
text = 以前網咖開黑的兄弟約你出來吃鹹酥雞。

# ---------- 工程師職涯 ----------

[event.uni_mixer]
icon = 🎉
title = 系上聯誼
text = 資工系和外文系的聯誼，你被推去自我介紹。
choice1 = 展現幽默
success1 = 全場笑翻，你要到了 IG。
fail1 = 冷場了，空氣凝結了三秒。
choice2 = 默默吃東西
result2 = 食物很好吃。

[event.hackathon]
icon = ⚙️
title = 黑客松
text = 48 小時黑客松，獎金 10 萬。
choice1 = 報名參加
success1 = 拿下首獎！評審說你的作品可以直接上線。
fail1 = Demo 時程式當掉……
choice2 = 在家休息
result2 = 週末就是要休息。

[event.finals_week]
icon = 📖
title = 期末考週
text = 連續三天通宵，咖啡當水喝。

[event.uni_esports]
icon = 🏟️
title = 系際電競盃
text = 系學會求你代表資工系出賽。
choice1 = 出賽 carry 全場
result1 = 你一個人打穿全校，系上傳說又多了一則。
choice2 = 專心讀書
result2 = 學弟們很失望。

[event.professor]
icon = 👨‍🏫
title = 教授邀你進實驗室
text = 教授說你很有潛力，想讓你參與研究計畫。
choice1 = 進實驗室
result1 = 第一次掛名論文！
choice2 = 婉拒
result2 = 自由比較重要。

[event.layoff]
icon = 📦
title = 裁員潮
text = 公司宣布組織調整，隔壁座位一個個空了。
choice1 = 更努力證明自己
result1 = 你成了被留下來的核心成員。
choice2 = 開始準備履歷
result2 = 有備無患。

[event.prod_down]
icon = 🚒
title = 半夜線上服務掛了
text = 凌晨三點，手機狂響：服務全面中斷！
choice1 = 立刻上線救火
result1 = 20 分鐘內找到 root cause，老闆記住你了。
choice2 = 裝睡
result2 = 隔天的事後檢討會很尷尬。

# text_up：還能跳到更大的公司；text_rival：已經在大廠
[event.headhunter]
icon = 🎣
title = 獵頭挖角
text_up = 一家更大的公司開出更好的條件挖角你。
text_rival = 競爭對手開出高薪挖角你。
choice1 = 跳槽！
choice2 = 留下來，跟主管談加薪
result2 = 主管幫你爭取到升遷點數 +1。

[event.tech_debt]
icon = 🏚️
title = 技術債爆炸
text = 十年前的程式碼終於撐不住了，每改一行就壞三個地方。
choice1 = 主動重構
result1 = 程式碼煥然一新，同事都跑來感謝你。
choice2 = 先貼 OK 繃
result2 = 問題被延後了，但沒有消失。

[event.ai_wave]
icon = 🤖
title = AI 浪潮來襲
text = 新的 AI 工具讓整個產業天翻地覆。
choice1 = 擁抱 AI
result1 = 你的產出效率翻倍。
choice2 = 「這只是一時的炒作」
result2 = ……是這樣嗎？

[event.praise]
icon = 👏
title = 老闆在大會上點名表揚
text = 全公司大會上，老闆秀出你負責的專案成果。

[event.credit_steal]
icon = 🦊
title = 同事搶功
text = 你熬夜寫的功能，被同事在會議上說成是他的點子。
choice1 = 據理力爭
result1 = 你拿出 commit 紀錄，真相大白。
choice2 = 吞下去
result2 = 算了，做人留一線。

[event.conference]
icon = 🎙️
title = 受邀上台演講
text = 技術研討會邀請你分享經驗。

[event.old_friends]
icon = 🎮
title = 老同學約打電動
text = 高中的兄弟們說：「今晚上線，跟以前一樣！」
choice1 = 通宵開黑
result1 = 你的手感還是那麼兇，兄弟們直呼「阿維回來了」。
choice2 = 早點睡
result2 = 大人的世界。

[event.stock_bonus]
icon = 💹
title = 股票分紅
text = 公司股價大漲，員工分紅入帳！

[event.health_check]
icon = 🩺
title = 健康檢查滿江紅
text = 報告上一排紅字，醫生皺著眉頭看你。
choice1 = 開始運動（花 3 萬辦健身房）
result1 = 你成了每天晨跑的大叔。
choice2 = 假裝沒看到
result2 = ……

[event.idea]
icon = 💡
title = 洗澡時的靈光一閃
text = 你突然想到一個可以改變產業的點子！
result = （創業成功率提升）

[event.angel]
icon = 👼
title = 天使投資人有興趣
text = 一位知名天使投資人看了你的產品 demo。

[event.cofounder_quit]
icon = 🚪
title = 共同創辦人離開
text = 理念不合，共同創辦人帶著一半的工程師走了。

[event.viral_app]
icon = 🚀
title = 產品突然爆紅
text = 某個網紅推薦了你們的產品，伺服器差點被灌爆。

[event.gamer_users]
icon = 🕹️
title = 遊戲圈的人脈
text = 你當年的遊戲實力讓一群電競圈的朋友願意幫產品宣傳。

[event.receipt]
icon = 🧾
title = 發票中獎
text = 對發票時發現中了獎！

[event.awei_myth]
icon = 🌠
title = 阿維的直覺
text = 冥冥之中，你感覺到一股遊戲天才的靈感湧現。


# ============================================================
#  行動
# ============================================================

[action.crawl]
icon = 🐛
name = 到處爬來爬去
desc = 把整個客廳當成競技場。

[action.watch_dad]
icon = 📺
name = 看爸爸打電動
desc = 坐在爸爸腿上，眼睛盯著螢幕不放。

[action.blocks]
icon = 🧱
name = 玩積木
desc = 蓋出一座比自己還高的塔。

[action.story]
icon = 📖
name = 聽床邊故事
desc = 每晚都要聽三個故事才肯睡。

[action.neighbor]
icon = 🧒
name = 跟鄰居小孩玩
desc = 社區公園的孩子王。

[action.tablet]
icon = 📱
name = 偷玩媽媽的平板
desc = 兩歲就會自己解鎖螢幕。

[action.class]
icon = ✏️
name = 認真上課
desc = 坐第一排，筆記抄得比老師還整齊。

[action.workbook]
icon = 📝
name = 寫評量 / 刷題
desc = 一本接一本，寫到手痠。

[action.play_fps]
icon = 🎯
name = 練 FPS 槍法
desc = 爆頭線刻在 DNA 裡。

[action.play_dota]
icon = 🗡️
name = 打 DOTA
desc = 補刀、走位、看小地圖。
lock = 9 歲解鎖

[action.sports]
icon = 🏀
name = 打球運動
desc = 流汗也是一種電競訓練。

[action.friends]
icon = 🤗
name = 交朋友
desc = 下課十分鐘就能跟全班混熟。

[action.rest]
icon = 🛋️
name = 耍廢休息
desc = 什麼都不做，也是一種選擇。

[action.cram]
icon = 🏫
name = 去補習班
desc = 晚上十點的南陽街……不對，是補習街。

[action.netcafe]
icon = 🏪
name = 網咖開黑
desc = 泡麵、耳機、跟兄弟大吼。

[action.reflex_train]
icon = ⚡
name = 反應力特訓
desc = 音遊、點擊訓練、瞄準練習器輪著來。

[action.ranked_night]
icon = 🌙
name = 熬夜衝排位
desc = 「再一場就睡」——凌晨四點。

[action.exam_prep]
icon = 📚
name = 準備學測
desc = 書桌上堆滿了歷屆試題。

[action.amateur]
icon = 🏆
name = 參加業餘比賽
desc = 用實力讓大家記住你的 ID。（有機會奪冠拿獎金）
msg_win = 在業餘盃一路殺進冠軍！拿到獎金和一堆陌生人的追蹤。
msg_lose = 止步八強，但有人在聊天室刷「這人誰？好猛」。

[action.parttime]
icon = 🧋
name = 打工
desc = 在手搖飲店搖了一整個暑假。

[action.retake_class]
icon = 🏯
name = 重考班
desc = 一年只做一件事：考上。

[action.lockdown]
icon = 🔒
name = 網咖閉關
desc = 包台一整年，網咖老闆都認得你了。

[action.solo_grind]
icon = 🎮
name = 個人苦練
desc = 一天十二小時的天梯與練習模式。

[action.reflex_drill]
icon = ⚡
name = 反應特訓
desc = 用科學方法壓榨神經系統。

[action.scrim]
icon = 🤝
name = 戰隊合練
desc = 和隊友打訓練賽、對戰術、喊語音。

[action.review_vod]
icon = 🔍
name = 研究對手 VOD
desc = 把對手的每一場比賽拆成逐格分析。

[action.stream]
icon = 📺
name = 開台直播
desc = 「謝謝 XXX 的訂閱～」名氣越高收入越多。

[action.gym]
icon = 🏋️
name = 健身房
desc = 照顧身體，延緩反應力衰退。
msg = 規律運動讓反應力衰退減半。

[action.pro_rest]
icon = 🏖️
name = 休息放假
desc = 關掉 Discord，去海邊吹風。

[action.endorse]
icon = 💼
name = 接商業代言
desc = 電競椅、能量飲料、耳機，通通找上你。
lock = 名氣 40 解鎖

[action.uni_study]
icon = 📚
name = 認真讀書
desc = 資料結構、演算法、作業系統。

[action.uni_code]
icon = 💻
name = 寫程式做專題
desc = GitHub 綠格子一路排滿。

[action.uni_club]
icon = 🎪
name = 社團活動
desc = 當上電競社社長，帶學弟妹打校際盃。

[action.uni_intern]
icon = 🏢
name = 實習
desc = 提早見識業界，求職時大加分。
lock = 大三解鎖
msg = 履歷多了一筆實習經歷。

[action.uni_job]
icon = 🧋
name = 打工
desc = 家教、手搖飲、外送，什麼都做過。

[action.uni_game]
icon = 🎮
name = 打電動放鬆
desc = 天才的手感不能丟。

[action.uni_rest]
icon = 😴
name = 睡飽飽
desc = 早八？不存在的。

[action.code]
icon = ⌨️
name = 埋頭寫 code
desc = 一天解十張 ticket。

[action.learn]
icon = 🎓
name = 進修學習
desc = 線上課程、讀論文、考證照。

[action.mentor]
icon = 🧑‍🏫
name = 帶新人
desc = 把自己踩過的坑一個個標出來。
lock = 升上工程師後解鎖

[action.crossteam]
icon = 🔗
name = 跨部門協作
desc = 開會、對齊、再開會。

[action.networking]
icon = 🍻
name = 應酬交際
desc = 酒過三巡，大家都是兄弟。

[action.overtime]
icon = 🔥
name = 爆肝加班
desc = 辦公室的燈只剩你這盞。考績大幅提升。

[action.side_project]
icon = 🧪
name = 下班做 Side Project
desc = 有 25% 機會冒出創業點子。
msg = 💡 Side project 意外有人用！這可能是創業的種子（創業成功率提升）。

[action.invest]
icon = 📈
name = 投資理財
desc = 拿三成資產去投資，-20% ~ +40%。
lock = 需要 10 萬本金
msg_win = 投資小賺一筆！
msg_lose = 投資被套牢了……

[action.date]
icon = 💑
name = 約會
desc = 和{另一半}出去走走。不約會的話，好感度每年會下降。
lock = 需要有交往對象

[action.vacation]
icon = ✈️
name = 休假旅行
desc = 去日本吃拉麵，順便逛秋葉原。

[action.quit_startup]
icon = 🚀
name = 辭職創業！
desc = 投入 300 萬，開一間自己的公司。（今年其他行動仍會執行）
lock = 資深工程師 + 300 萬資金（一生最多 2 次）

[action.st_product]
icon = 🛠️
name = 打磨產品
desc = 一個按鈕改了二十個版本。

[action.st_pitch]
icon = 🎤
name = 找投資人路演
desc = 一週見十個 VC，講到嘴破。

[action.st_hire]
icon = 🧑‍🤝‍🧑
name = 招募核心團隊
desc = 用夢想和股票說服大神加入。

[action.st_crunch]
icon = 🔥
name = 全員衝刺
desc = 睡在公司，衝下一個里程碑。


# ============================================================
#  天賦
# ============================================================

[trait.gamer]
icon = 🕹️
name = 電競神童
desc = FPS / DOTA 成長 +25%

[trait.scholar]
icon = 📖
name = 書香世家
desc = 學力成長 +25%

[trait.reflex]
icon = ⚡
name = 神經反射
desc = 反應力成長 +25%，反應力衰退延後 2 年

[trait.iron]
icon = 🫀
name = 鋼鐵肝
desc = 健康消耗 -40%

[trait.sunny]
icon = 🌞
name = 樂天派
desc = 心情消耗 -40%

[trait.popular]
icon = 🌟
name = 人氣王
desc = 人緣成長 +30%，名氣獲得 +30%

[trait.netcafe]
icon = 🏪
name = 網咖少爺
desc = 家裡開網咖：網咖類行動免費，FPS / DOTA 初始 +5

[trait.rich]
icon = 💎
name = 富二代
desc = 初始金錢 +50 萬，零用錢 ×3

[trait.clutch]
icon = 💪
name = 大心臟
desc = 關鍵比賽勝率 +6%；考績評等更穩定

[trait.genius]
icon = 👑
name = 天才阿維
desc = 所有能力成長 +15%


# ============================================================
#  結局
# ============================================================

[ending.world_champ]
icon = 🏆
name = 世界冠軍
text = {名字} 在世界賽決賽舉起冠軍獎盃。彩帶從天而降，全場高喊他的 ID。那個從小被說「只會打電動」的孩子，證明了遊戲天才的名號不是浪得虛名。

# text_ipo：創業上市；text_ceo：升上執行長
[ending.tech_boss]
icon = 🏢
name = 科技公司大老闆
text_ipo = 劉家維創辦的公司正式掛牌上市，敲鐘的那一刻，他想起小時候拆開第一台電腦的那個下午。從工程師到大老闆，他把遊戲天才的腦袋用在了另一個戰場。
text_ceo = 劉家維被董事會任命為執行長，成為科技公司的大老闆。辦公室的抽屜裡，還放著一支學生時代的滑鼠。

[ending.worlds_legend]
icon = 🥈
name = 世界賽傳說
text = {名字} 曾在世界賽的舞台上與最強的對手交鋒，雖然最後沒能捧盃，但那幾場比賽至今仍被粉絲反覆重播。

[ending.domestic_king]
icon = 🥇
name = 國內霸主
text = {名字} 拿下了 {國內冠軍} 座國內聯賽冠軍，是一個時代的代名詞。世界冠軍的夢，就交給下一代吧。

[ending.streamer]
icon = 📺
name = 人氣實況主
text = 退役後的 {名字} 轉型全職實況主，每晚上萬人守在直播間，看他在天梯上屠殺現役選手。

[ending.pro_retire]
icon = 🎮
name = 職業選手
text = {名字} 結束了職業生涯。雖然沒有站上最高的舞台，但他確實把興趣變成了職業——這件事本身，就已經贏過很多人了。

[ending.director]
icon = 🧑‍💼
name = 技術總監
text = 劉家維以「{職級}」的身分退休。一路帶出無數優秀的工程師，業界提起他都會豎起大拇指。

[ending.senior_eng]
icon = 💻
name = 資深工程師
text = 劉家維以「{職級}」的身分退休。寫了一輩子的程式，下班後依然是網咖裡最兇的那個大叔。

[ending.startup_fail]
icon = 💸
name = 創業夢碎
text = 創業失敗後，劉家維再也沒能重回巔峰。但他總說：「至少我試過了。」

[ending.ordinary]
icon = 🛋️
name = 平凡的阿維
text = 兩次檢定都沒有通過，劉家維找了一份普通的工作，過著普通的生活。只有在週末的網咖裡，偶爾還能看見那雙天才的手。


# ============================================================
#  成就
# ============================================================

[achievement.first_life]
icon = 🔁
name = 第一次重生
desc = 完成任意一局

[achievement.prodigy]
icon = 🧒
name = 神童
desc = 10 歲前任一能力達到 50

[achievement.dual]
icon = ⚔️
name = 雙修大師
desc = 18 歲前 FPS 與 DOTA 皆達 65

[achievement.scholar]
icon = 🎓
name = 學霸
desc = 學力達到 90

[achievement.collapse]
icon = 🫠
name = 爆肝
desc = 健康歸零病倒

[achievement.netcafe_king]
icon = 🏪
name = 網咖之王
desc = 累計去網咖 8 次

[achievement.love]
icon = 💕
name = 青春戀愛
desc = 交到女朋友

[achievement.married]
icon = 💍
name = 執子之手
desc = 和另一半步入禮堂

[achievement.heartbreak]
icon = 💔
name = 分手快樂
desc = 經歷一次分手

[achievement.pro]
icon = 🎮
name = 夢想成真
desc = 成為職業選手

[achievement.big_team]
icon = 💎
name = 豪門之路
desc = 加入豪門戰隊

[achievement.domestic]
icon = 🥇
name = 國內霸主
desc = 奪得職業聯賽冠軍

[achievement.world]
icon = 🏆
name = 世界冠軍
desc = 奪得世界賽冠軍

[achievement.boss]
icon = 🏢
name = 大老闆
desc = 成為科技公司大老闆

[achievement.ipo]
icon = 🔔
name = 敲鐘
desc = 創業公司 IPO 上市

[achievement.startup_fail]
icon = 🥀
name = 失敗為成功之母
desc = 創業倒閉一次

[achievement.rich]
icon = 💰
name = 千萬富翁
desc = 金錢達到 1,000 萬

[achievement.shopaholic]
icon = 🛍️
name = 敗家子
desc = 在道具商店累計花費 5,000 萬

[achievement.mansion]
icon = 🏰
name = 人生勝利組
desc = 住進豪宅

[achievement.big_win]
icon = 🎰
name = 賭神
desc = 單次賭博淨賺 100 萬以上

[achievement.jackpot]
icon = 🎟️
name = 天選之人
desc = 彩券中頭獎

[achievement.ordinary]
icon = 🛋️
name = 平凡就是福
desc = 達成「平凡的阿維」結局

[achievement.all_endings]
icon = 📚
name = 阿維全知
desc = 收集所有結局


# ============================================================
#  傳承升級
# ============================================================

[upgrade.talent]
icon = 🧬
name = 天生好手
desc = 出生時初始點數 +1

[upgrade.memory]
icon = 🧠
name = 重生記憶
desc = 所有能力成長 +4%

[upgrade.rich]
icon = 👨‍👦
name = 富爸爸
desc = 出生時金錢 +10 萬


# ============================================================
#  更多隨機事件（v1.1）
# ============================================================

# ---------- 學生時期 ----------

[event.bday_gift]
icon = 🎁
title = 生日禮物
text = 生日快到了，爸媽問你今年想要什麼禮物。
choice1 = 電競滑鼠！
result1 = 拆開包裝的那一刻，你覺得自己的槍法已經變準了。（獲得裝備：電競滑鼠）
choice2 = 一套參考書
result2 = 爸媽感動到差點哭出來。
choice3 = 直接給紅包就好
result3 = 實際派。

[event.school_cup]
icon = 🏅
title = 全國高中電競聯賽
text = 學校第一次組隊參加全國高中電競聯賽，隊長拜託你一定要來。
choice1 = 披上校隊戰袍出征
success1 = 一路打進總決賽並奪冠！比賽直播被職業戰隊經理看到了。
fail1 = 八強止步，但你學到了比賽的節奏。
choice2 = 準備考試要緊
result2 = 你在電視上看著學弟們被淘汰。

[event.streamer_meet]
icon = 📺
title = 遇到知名實況主
text = 天梯排到一位知名實況主，你把他打爆了。他在直播裡說：「這小孩是誰？太猛了吧。」

[event.good_teacher]
icon = 👨‍🏫
title = 遇到好老師
text = 新來的導師不但不罵你打電動，還用遊戲來比喻數學。你第一次覺得上課很有趣。

[event.broken_arm]
icon = 🤕
title = 打球骨折
text = 打籃球時摔了一跤，右手打上石膏，三個月不能碰滑鼠。

[event.phone_taken]
icon = 📱
title = 手機被沒收
text = 上課偷玩手機遊戲，被老師當場抓包。
choice1 = 乖乖認錯
result1 = 寫完悔過書，手機一週後才拿回來。
choice2 = 「我在查上課的資料！」
success2 = 老師半信半疑，但還是放過你了。全班都覺得你很敢。
fail2 = 老師看了一眼螢幕上的遊戲畫面，記了你一支警告。

[event.family_money]
icon = 🏚️
title = 家裡經濟出狀況
text = 爸爸的公司裁員，家裡的氣氛變得很沉重。媽媽說今年的零用錢要減半了。
choice1 = 體諒爸媽，省吃儉用
result1 = 你突然覺得自己長大了一點。
choice2 = 去打工幫忙家裡
result2 = 第一次自己賺錢，才知道錢有多難賺。

[event.excluded]
icon = 😶
title = 被排擠
text = 班上的小團體出去玩都故意不揪你，聊天群組也突然安靜了。
choice1 = 主動找他們聊聊
success1 = 原來只是一場誤會，你們又和好了。
fail1 = 他們假裝沒聽到你說話。
choice2 = 戴上耳機打遊戲
result2 = 遊戲裡的隊友，至少不會已讀不回。

[event.lend_money]
icon = 💸
title = 同學借錢
text = 好朋友說家裡急需用錢，想跟你借 5,000 元。
choice1 = 借他
success1 = 他準時還錢，還請你喝了一杯珍奶。
fail1 = 他再也沒提起這件事……
choice2 = 委婉拒絕
result2 = 他說沒關係，但之後好像有點疏遠。

# ---------- 電競職涯 ----------

[event.invitational]
icon = 🌏
title = 國際邀請賽
text = 海外主辦單位邀請 {戰隊} 參加國際表演賽，機票、住宿全包。

[event.merch]
icon = 🧢
title = 推出個人周邊
text = 粉絲後援會幫你推出應援毛巾和公仔，上架三分鐘就賣光了。

[event.comeback]
icon = 🔥
title = 史詩級逆轉
text = 0:2 落後的情況下，你們連扳三局完成逆轉。賽後全隊抱在一起大哭。

[event.interview_gaffe]
icon = 🎤
title = 賽後失言
text = 賽後訪問時你隨口說了一句「對手很爛」，影片被斷章取義，留言區炸鍋了。
choice1 = 發文道歉
result1 = 風波漸漸平息，但有些粉絲還是不太高興。
choice2 = 「我說的是實話」
success2 = 粉絲力挺你的真性情，追蹤數不減反增。
fail2 = 越吵越大，連贊助商都打電話來關切。

[event.disconnect]
icon = 📶
title = 關鍵局斷線
text = 決勝局團戰打到一半，你的畫面突然凍結——斷線了。等你重新連上，比賽已經結束。
result = 這一幕成了你今年的心理陰影。（今年賽季戰力 -4）

[event.doping_test]
icon = 🧪
title = 藥檢疑雲
text = 聯盟突擊抽查藥檢。結果出爐前，網路上已經傳得沸沸揚揚。
choice1 = 配合檢驗，等待結果
success1 = 報告清清白白，你的形象反而更好了。
fail1 = 感冒藥的成分超標，被聯盟罰款 20 萬。

[event.team_broke]
icon = 🏦
title = 戰隊財務危機
text = {戰隊} 的老闆投資失利，薪水已經兩個月沒發了。
choice1 = 共體時艱，減薪留下來
result1 = 隊友們很感動，大家說要一起撐過去。
choice2 = 申請轉隊
result2 = 你帶著遺憾，加入了同級的另一支隊伍。

[event.match_fixing]
icon = 🎲
title = 假賽邀約
text = 一個陌生人私訊你：「下一場放水，給你 100 萬。」
choice1 = 拒絕並向聯盟檢舉
result1 = 聯盟公開表揚你的正直，粉絲更喜歡你了。
choice2 = 收下這筆錢
success2 = 沒有人發現。但你再也睡不好了。
fail2 = 東窗事發！你被禁賽、罰款，被迫降級到小戰隊從頭來過。

# ---------- 工程師職涯 ----------

[event.open_source]
icon = 🌟
title = 開源專案爆紅
text = 你週末寫的開源工具登上了 GitHub 熱門榜，星星數一夜破萬。
result = 獵頭開始注意到你了。（之後更容易被挖角）

[event.employee_award]
icon = 🏆
title = 年度最佳員工
text = 尾牙上，主持人念出了你的名字。你上台領了獎盃和一包厚厚的紅包。

[event.good_boss]
icon = 🧑‍🤝‍🧑
title = 遇到好主管
text = 新來的主管不搶功、願意扛責任，還會主動幫你爭取資源。

[event.security_breach]
icon = 🔓
title = 資安事件
text = 你負責的系統被駭客入侵，使用者資料外洩上了新聞。
choice1 = 站出來扛下責任
result1 = 你帶著團隊連夜修補漏洞，主管對你另眼相看。
choice2 = 說是別的部門的問題
success2 = 大家的注意力被轉移了，你安全下莊。
fail2 = 會議記錄寫得清清楚楚，你的信用破產了。

[event.eng_burnout]
icon = 😮‍💨
title = 職業倦怠
text = 每天早上醒來的第一個念頭是：「好不想上班。」
choice1 = 請一個月長假（10 萬）
result1 = 你去了一趟冰島，回來時整個人都亮了。
choice2 = 咬牙硬撐
result2 = 你成了辦公室裡眼神最空洞的那個人。

[event.acquisition]
icon = 🏢
title = 公司被併購
text = 公司被大集團併購，新老闆要重新評估每一個人。
choice1 = 拿出實力證明自己
success1 = 新老闆看完你的作品，當場說要重用你。
fail1 = 新老闆有自己的人馬，你的升遷進度歸零了。
choice2 = 趁機跳槽
result2 = 樹倒猢猻散，你先走一步。

[event.coach_offer]
icon = 📞
title = 前隊友的邀請
text = 當年網咖開黑的兄弟開了一間電競教室：「週末來當教練吧，學生都聽過你的名字。」
choice1 = 週末去兼差當教練
result1 = 看著學生們發光的眼睛，你好像看到了當年的自己。
choice2 = 婉拒，專心工作
result2 = 有點可惜，但大人的世界就是這樣。

# ---------- 通用 ----------

[event.scratch_card]
icon = 🎫
title = 刮刮樂中獎
text = 便利商店找零時順手買了一張刮刮樂，竟然中了！

[event.stray_dog]
icon = 🐶
title = 撿到流浪狗
text = 下雨天，一隻濕淋淋的小黑狗一路跟著你回家。
choice1 = 收養牠
result1 = 你幫牠取名叫「GG」。從此每天回家都有人搖尾巴迎接你。（每年健康、心情 +2）
choice2 = 送去收容所
result2 = 你偷偷去看過牠幾次，聽說牠被一戶好人家領養了。

[event.thank_letter]
icon = 💌
title = 一封感謝信
text = 你收到一封手寫信：「因為你，我開始相信自己也可以追夢。謝謝你。」

[event.accident]
icon = 🚑
title = 車禍
text = 騎車回家的路上被闖紅燈的車撞到，在醫院躺了好幾個禮拜。
choice1 = 好好休養
result1 = 傷勢慢慢好轉，但身體大不如前了。
choice2 = {另一半}每天來醫院照顧你
result2 = {另一半}每天帶著便當來病房，你們的感情更好了。

[event.scam]
icon = 📉
title = 投資詐騙
text = 一個自稱理財專員的人打來：「保證每月獲利 20%，只限今天！」
choice1 = 聽聽看是什麼機會
success1 = 你越聽越不對勁，直接報警。警察說你是今天唯一沒上當的人。
fail1 = 等你發現的時候，錢已經轉出去了……
choice2 = 直接掛電話
result2 = 天下沒有白吃的午餐。

[event.family_ill]
icon = 🏥
title = 家人生病
text = 媽媽突然住院了，醫生說需要有人長期照顧。
choice1 = 請假親自照顧
result1 = 你在病床邊陪了她好幾個月。媽媽說，有你在就安心了。
choice2 = 出錢請看護（20 萬）
result2 = 專業看護把媽媽照顧得很好，但你心裡還是有點愧疚。
choice3 = 和{另一半}輪流照顧
result3 = {另一半}比你還細心。媽媽偷偷跟你說：「這個要好好把握。」


# ============================================================
#  健康與心情
# ============================================================

[event.depression]
icon = 🌧️
title = 灰色的日子
text = 最近什麼都提不起勁，連最愛的遊戲都不想打開。早上醒來，只想一直躺著。
choice1 = 尋求專業協助（學生免費，成人 3 萬）
result1 = 諮商師聽你說了很久的話。走出診間時，天好像亮了一點。
choice2 = 讓{另一半}陪著你
result2 = {另一半}什麼都沒說，只是緊緊握著你的手。
choice3 = 一個人默默撐著
result3 = 你撐過來了，但這一年過得很辛苦。（今年行動數 -1）

# 狀態標籤：name 顯示在面板上，desc 是滑鼠移上去的說明
[status]
vigor_name = 💪 精力充沛
vigor_desc = 健康 70 以上：事件擲骰成功率 +5%
tired_name = 🥵 體力透支
tired_desc = 健康低於 40：能力成長 -15%、電競戰力 -3、工作／創業評分變差
frail_name = 🤒 病懨懨
frail_desc = 健康低於 20：每年有一半機率生病，下一年行動數 -1；連續 3 年健康低於 30 會得慢性病
happy_name = 😄 心情愉快
happy_desc = 心情 70 以上：能力成長 +10%
low_name = 😞 低潮
low_desc = 心情低於 40：能力成長 -15%、事件擲骰成功率 -5%、好感度下降加快
depressed_name = 🌧️ 憂鬱
depressed_desc = 心情低於 20：可能陷入憂鬱，需要找人幫忙
chronic_name = 🩺 慢性病
chronic_desc = 每年健康 -4。可以在道具商店接受治療
msg_chronic = 長年透支身體，醫生診斷出慢性病。（每年健康 -4，可在道具商店接受治療）
msg_frail = 身體太虛弱，三天兩頭就生病……下一年行動數 -1。
msg_warn = 醫生嚴肅地說：「再倒下一次，你的身體就真的撐不住了。」
msg_final = 第三次倒下了。醫生下了最後通牒——這將是你拚命的最後一年。
fire_button = 🏖️ 財富自由，提早退休
fire_confirm = 存款已經足夠過一輩子了。確定要提早退休、享受人生嗎？這一局將會結束。

[item.treatment]
icon = 🏥
name = 慢性病治療
desc = 治好慢性病，健康 +10

[achievement.happy]
icon = 😄
name = 快樂就好
desc = 一生平均心情 85 以上

[achievement.iron_man]
icon = 🦾
name = 鐵人
desc = 一生從未病倒，平均健康 80 以上

[ending.happy_life]
icon = 🌈
name = 平凡但幸福
text = {名字} 沒有站上世界的頂點，也沒有成為大老闆。但每天晚上，他都和{另一半}一起吃飯、散步，偶爾雙排兩場。很多人比他更成功——但他最常說的一句話是：「我很幸福。」

[ending.fire]
icon = 🏖️
name = 財富自由
text = {年齡} 歲那年，{名字} 看著帳戶裡的數字，決定提早退休。他搬到海邊，每天睡到自然醒，下午釣魚，晚上開台打遊戲——不為了贏，只為了好玩。

[ending.burnout]
icon = 🛏️
name = 燃燒殆盡
text = {名字} 第三次被送進急診室。醫生看著檢查報告沉默了很久：「再這樣下去，你會沒命的。」那天之後，他放下了一切。窗外的陽光很好，他這才發現，自己已經很久沒有好好看過天空了。


# ============================================================
#  感情事件
# ============================================================

# 專屬變數：{地點}
[event.new_love]
icon = 💘
title = 新的邂逅
text = 在{地點}認識了一個很聊得來的女生，你們聊到忘了時間。
choice1 = 鼓起勇氣約她出去
success1 = 她笑著說：「好啊，什麼時候？」
fail1 = 「我們還是當朋友就好。」
choice2 = 交換 IG 就好
result2 = 偶爾按個讚，也是一種緣分。

[event.love_first_date]
icon = 🎬
title = 第一次約會
text = 和{另一半}的第一次約會，要去哪裡呢？
choice1 = 看電影
result1 = 電影演到一半，你們在黑暗中偷偷牽了手。
choice2 = 去網咖雙排
success2 = 你 carry 全場，{另一半}看你的眼神都在發光。
fail2 = 你太投入，罵了隊友一整晚，{另一半}默默地先回家了。
choice3 = 逛夜市
result3 = 從大腸包小腸一路吃到雞蛋糕，笑得肚子好痛。

[event.love_birthday]
icon = 🎂
title = 她的生日
text = 下個禮拜就是{另一半}的生日了。
choice1 = 精心準備驚喜（要花一筆錢）
result1 = 蛋糕推出來的那一刻，{另一半}感動到說不出話。
choice2 = 親手做一張卡片
result2 = 卡片上的字雖然很醜，{另一半}還是把它收進了抽屜最深處。
choice3 = 傳一句「生日快樂」
result3 = 已讀，沒有回。

[event.love_jealous]
icon = 😤
title = 遊戲跟我哪個重要？
text = 你又打了一整晚的遊戲，{另一半}傳來訊息：「遊戲跟我，哪個重要？」
choice1 = 「當然是妳」，立刻關機
result1 = {另一半}說，下次可以陪你打一場。
choice2 = 「等我打完這場」
result2 = 這場你贏了，但好像輸掉了別的東西。
choice3 = 拉她一起來玩
success3 = {另一半}意外地很有天分，你們成了最強雙排。
fail3 = {另一半}被對面虐了十分鐘，氣到把耳機丟了。

[event.love_fight]
icon = 🌩️
title = 吵架
text = 為了一件小事，你和{另一半}大吵了一架。
choice1 = 先低頭道歉
result1 = 「對不起」三個字，比想像中容易說出口。
choice2 = 冷戰到底
result2 = 整整一個禮拜，你們誰都沒有說話。

[event.love_study]
icon = 📚
title = 圖書館約會
text = {另一半}約你去圖書館一起讀書。
choice1 = 認真讀書
result1 = 兩個人一起念書，效率意外地好。
choice2 = 偷看她讀書的樣子
result2 = 被抓包了，她紅著臉用課本打你。

[event.love_cheer]
icon = 📣
title = 觀眾席上的應援
text = 觀眾席上，{另一半}舉著寫有你 ID 的手燈，喊得比誰都大聲。

[event.love_supper]
icon = 🍜
title = 深夜的宵夜
text = 加班到深夜，{另一半}提著一碗熱騰騰的牛肉麵出現在公司樓下。

[event.love_parents]
icon = 🏡
title = 見家長
text = {另一半}說，她爸媽想見見你。
choice1 = 西裝筆挺、提著禮盒登門
result1 = 她爸爸拍拍你的肩膀：「年輕人，不錯。」
choice2 = 穿著平常的帽 T 就去
success2 = 她弟弟認出你：「你是那個……！」全家瞬間把你當成明星招待。
fail2 = 她爸爸皺著眉頭問：「打電動能當飯吃嗎？」

# 專屬變數：{交往年數}
[event.love_propose]
icon = 💍
title = 求婚
text = 和{另一半}交往 {交往年數} 年了。看著她的側臉，你想：就是她了。
choice1 = 買鑽戒求婚（10 萬）
success1 = {另一半}哭著說：「我願意！」
fail1 = 「我……還沒準備好。」戒指默默收回了口袋。
choice2 = 再等等
result2 = 時機還沒到吧。

[event.love_wedding]
icon = 💒
title = 婚禮
text = 婚期訂下來了！要辦一場什麼樣的婚禮？
choice1 = 公證登記就好
result1 = 簡單的一張紙，承諾一輩子。
choice2 = 溫馨的小婚禮（30 萬）
result2 = 只邀請最親近的人，媽媽哭得比誰都兇。
choice3 = 盛大婚禮（200 萬）
result3 = 婚禮辦得風風光光，連新聞都報導了。

[event.love_anniv]
icon = 🥂
title = 結婚紀念日
text = 今天是你和{另一半}的結婚紀念日。
choice1 = 出國旅行（20 萬）
result1 = 在京都的楓葉下，你們又拍了一次婚紗照。
choice2 = 在家煮一頓晚餐
result2 = 菜有點鹹，但{另一半}吃得很開心。
choice3 = 忙到忘記了
result3 = 回到家時，餐桌上的蠟燭已經燒完了。

[event.love_crisis]
icon = 💔
title = 我們需要談談
text = {另一半}看著你，很久很久才開口：「我們……是不是該好好談一談？」
choice1 = 「給我一次機會，我會改」
success1 = {另一半}沉默了很久，最後輕輕點了點頭。
fail1 = 「對不起，我已經決定了。」
choice2 = 好聚好散
result2 = 你們擁抱了最後一次。


# ============================================================
#  賭博事件
# ============================================================

[event.gamble_paparazzi]
icon = 📸
title = 被拍到出入賭場
text = 八卦雜誌刊出你在賭場一擲千金的照片，標題寫著「{名字} 沉迷賭博？」
choice1 = 公開道歉
result1 = 你在鏡頭前鞠躬，風波慢慢平息。
choice2 = 否認到底
success2 = 照片太模糊，大家很快就忘了這件事。
fail2 = 隔天又被爆出更多照片……

[event.gamble_addict]
icon = 🌀
title = 滿腦子都是下一把
text = 半夜睡不著，你腦中想的全是骰子和拉霸機的聲音。
choice1 = 參加戒賭團體（從此不再進賭場）
result1 = 走出賭場的那一刻，你覺得肩膀輕了好多。
choice2 = 「我只是運氣不好而已」
result2 = 黑眼圈越來越深了。


# ============================================================
#  感情系統訊息
# ============================================================

[love]
# 交往對象名字的候選清單，用頓號「、」分隔
names = 小雨、若晴、品妍、欣妤、子晴、芷涵、詩涵、語彤、宜蓁、雅婷、佳穎、思妤
start = 💕 你和{另一半}開始交往了！
engage = 💍 你和{另一半}訂婚了！
marry = 💒 你和{另一半}結婚了！
breakup = 💔 你和{另一半}分手了……
divorce = 💔 你和{另一半}離婚了……
status_dating = 交往中
status_engaged = 已訂婚
status_married = 已婚
ending_married = 💍 與{另一半}攜手走過 {年數} 年
ending_dating = 💕 與{另一半}交往中


# ============================================================
#  道具商店
# ============================================================

[item.mouse]
icon = 🖱️
name = 電競滑鼠
desc = FPS 成長 +10%

[item.keyboard]
icon = ⌨️
name = 機械鍵盤
desc = DOTA 成長 +10%

[item.notes]
icon = 📒
name = 名師講義全套
desc = 學力成長 +10%

[item.monitor]
icon = 🖥️
name = 240Hz 電競螢幕
desc = 反應力成長 +10%

[item.headset]
icon = 🎧
name = 降噪耳機
desc = 心情消耗 -15%

[item.chair]
icon = 💺
name = 人體工學電競椅
desc = 健康消耗 -15%

[item.laptop]
icon = 💻
name = 頂規筆電
desc = 技術力成長 +12%、學力成長 +5%

[item.suit]
icon = 👔
name = 訂製西裝
desc = 領導力、人緣成長 +10%

[item.car]
icon = 🏎️
name = 超跑
desc = 買下時名氣 +8、心情 +15；之後每年心情 +4

[item.mansion]
icon = 🏰
name = 豪宅
desc = 買下時心情 +20；之後每年心情 +6、健康 +4

[item.supplement]
icon = 💊
name = 營養補給品
desc = 健康 +8（每年限一次）

[item.newgame]
icon = 🎮
name = 新遊戲
desc = 心情 +8、遊戲能力 +1（每年限一次）

[item.counsel]
icon = 🛋️
name = 心理諮商
desc = 心情 +15（每年限一次）

[item.spa]
icon = 💆
name = 頂級 SPA
desc = 健康 +12、心情 +12（每年限一次）

[item.charm]
icon = 🍀
name = 幸運御守
desc = 下一次事件擲骰（🎲）成功率 +15%，自動使用（最多持有 3 個）

[item.tutor]
icon = 🧑‍🏫
name = 請家教
desc = 今年行動數 +1（每年限一次，要在選擇行動前購買）

[item.assistant]
icon = 🗂️
name = 私人助理
desc = 今年行動數 +1（每年限一次，要在選擇行動前購買）

[item.coach]
icon = 🧙
name = 私人教練課
desc = 主項目 +4、團隊默契 +2（每年限一次）

[item.career_coach]
icon = 🧭
name = 高階主管教練
desc = 領導力 +4、人緣 +2（每年限一次）

[item.flowers]
icon = 💐
name = 花束
desc = 送給{另一半}：好感度 +8

[item.bag]
icon = 👜
name = 名牌包
desc = 送給{另一半}：好感度 +20

[item.necklace]
icon = 💎
name = 鑽石項鍊
desc = 送給{另一半}：好感度 +35、心情 +5
`);
