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
title = 自己的第一台電腦
text = 爸爸搬回一台嶄新的電腦放進你的房間，說是「給你查資料用的」。
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
text = 全校都知道{年級}有個打遊戲超猛的劉家維。

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
text_pc = 一隻橘貓跟著你回家，從此牠最喜歡睡在你的鍵盤上。
text_nopc = 一隻橘貓跟著你回家，從此牠最喜歡睡在你的書包上。

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

# ---------- 學生時期（v2.1 追加） ----------

[event.zhuazhou]
icon = 🎁
title = 抓周
text = 一歲生日，全家人在地上擺滿了東西：電競滑鼠、書、麥克風、金幣、小皮球，還有爸爸的手機。大家屏息看著你爬過去……
choice1 = 🖱️ 抓起電競滑鼠
result1 = 你一把抓住滑鼠，還按了兩下左鍵。爸爸激動地說：「我就知道！」
choice2 = 📚 抓起書
result2 = 你抱著書不放，媽媽笑得合不攏嘴：「以後是讀書的料！」
choice3 = 🎤 抓起麥克風
result3 = 你對著麥克風「啊——」了好久，全家笑翻。以後一定很會講話。
choice4 = 💰 抓起金幣
result4 = 你把金幣緊緊握在手裡，阿嬤說：「這孩子以後會賺大錢。」
choice5 = 🏀 抓起小皮球
result5 = 你抱著皮球滾來滾去，一刻都停不下來。
choice6 = 📱 抓走爸爸的手機
result6 = 你直接爬過所有東西，拿走了爸爸的手機——還自己解鎖了。全家沉默了三秒。

[event.first_steps]
icon = 👣
title = 學走路
text = 你扶著沙發站了起來，搖搖晃晃地準備踏出人生的第一步。媽媽在一邊張開雙手，爸爸的電腦在另一邊。
choice1 = 走向媽媽
result1 = 你撲進媽媽懷裡，她抱著你轉了好幾圈。
choice2 = 走向電腦
result2 = 你一路走到電腦前面，拍了拍鍵盤。爸爸默默錄下了這一幕。

[event.vaccine]
icon = 💉
title = 打預防針
text = 護士阿姨拿著針筒走過來，你看著那根針，嘴巴開始扁了。
choice1 = 咬牙不哭
result1 = 你忍住了！護士阿姨給了你一張超人貼紙。
choice2 = 放聲大哭
result2 = 你的哭聲響徹整間診所，連隔壁的小朋友都被你嚇哭了。

[event.dad_save]
icon = 🔌
title = 按下電源鍵
text = 爸爸打了三個小時的魔王，終於只剩最後一管血。你搖搖晃晃地走過去，伸手按下了那顆會發光的按鈕——電源鍵。
result = 畫面一黑。爸爸愣了五秒，然後抱起你大笑：「這孩子手真快！」

[event.kindergarten]
icon = 🎒
title = 第一天上幼兒園
text = 媽媽牽著你走到幼兒園門口，裡面有好多不認識的小朋友。
choice1 = 抱住媽媽的腿大哭
result1 = 你哭了整整一個上午，下午才終於肯放手。
choice2 = 主動找同學玩積木
result2 = 放學的時候，你已經有三個好朋友了。
choice3 = 一個人坐在角落看繪本
result3 = 老師說你是全班最安靜、最專心的小朋友。

[event.hide_seek]
icon = 🙈
title = 躲貓貓
text = 你躲進衣櫃裡等大家來找，等著等著，就睡著了。
result = 全家找了你一個小時，差點要報警。最後是爸爸聽到衣櫃裡的打呼聲。

[event.claw_machine]
icon = 🧸
title = 夜市的娃娃機
text = 逛夜市的時候，你在娃娃機前面走不動了。爸爸塞給你一個十元硬幣。
choice1 = 挑戰娃娃機
success1 = 一次就夾到了！老闆的臉都綠了。
fail1 = 爪子一鬆，娃娃又掉了回去。你難過得說不出話。
choice2 = 不玩了，買雞蛋糕
result2 = 熱騰騰的雞蛋糕，其實也很不錯。

[event.talent_show]
icon = 🎭
title = 幼兒園才藝表演
text = 幼兒園的才藝表演，每個小朋友都要上台。
choice1 = 上台唱歌
success1 = 你唱得超大聲，台下的家長全都在拍手。
fail1 = 唱到一半忘詞了，你站在台上哭了出來。
choice2 = 表演打地鼠（手速挑戰）
result2 = 你的手快到大家都看不清楚，老師說從沒看過這麼快的小朋友。
choice3 = 躲在布幕後面
result3 = 你從布幕縫隙偷看了整場表演。

[event.first_day]
icon = 🏫
title = 小一新生
text = 國小開學第一天，你背著新書包走進教室。
choice1 = 坐第一排認真聽
result1 = 老師問問題，你第一個舉手。
choice2 = 跟隔壁同學交換卡牌
result2 = 下課鐘一響，你們已經是好朋友了。

[event.piano]
icon = 🎹
title = 被逼學鋼琴
text = 媽媽幫你報名了鋼琴課：「學音樂對手指很好！」
choice1 = 乖乖練琴
result1 = 練了一整年，手指的靈活度大增。只是每天練琴真的好無聊。
choice2 = 裝病翹課
success2 = 演技完美，媽媽完全沒發現。
fail2 = 被媽媽識破了，還被罰多練一個小時。

[event.school_trip]
icon = 🚌
title = 校外教學
text = 全班坐遊覽車去動物園校外教學。
choice1 = 跟同學一起看動物
result1 = 你們在長頸鹿前面拍了一堆搞笑照片。
choice2 = 在遊覽車上打掌機
result2 = 你破了一個新紀錄，但完全不記得看了哪些動物。

[event.summer_homework]
icon = 📓
title = 暑假作業
text = 開學前三天，你打開書包，發現暑假作業一個字都還沒寫。
choice1 = 熬夜狂趕
result1 = 三天三夜，終於寫完了。黑眼圈也出來了。
choice2 = （其實你每天都寫了一點）
result2 = 你是全班唯一一個從容交作業的人。
choice3 = 借同學的來「參考」
success3 = 老師沒發現，你逃過一劫。
fail3 = 你連同學寫錯的地方都抄了，老師把你們兩個一起叫去辦公室。

[event.class_leader]
icon = 🙋
title = 選班長
text = 新學期要選班長，同學們推你出來參選。
choice1 = 參選
success1 = 你高票當選！第一次知道被大家信任的感覺。
fail1 = 只差兩票……你難過了好幾天。
choice2 = 提名別人
result2 = 你幫好朋友拉票，他當選後一直很感謝你。

[event.bully_help]
icon = 🛡️
title = 同學被欺負
text = 下課時，你看到幾個高年級的學生圍著班上一個瘦小的同學。
choice1 = 挺身而出
success1 = 你擋在同學前面，那幾個人摸摸鼻子走了。他從此成了你最好的朋友。
fail1 = 你被推倒在地上，手肘都擦破皮了。但同學一直跟你說謝謝。
choice2 = 去找老師
result2 = 老師及時趕到，事情順利解決了。

[event.science_fair]
icon = 🔬
title = 科展
text = 學校要辦科展，每個人都要交一個作品。
choice1 = 做一台反應速度測試器
result1 = 全班排隊來測試，你的紀錄沒有人打得破。
choice2 = 做火山爆發實驗
result2 = 小蘇打加醋，火山噴發的那一刻全班都在尖叫。

[event.school_club]
icon = 🎪
title = 社團招生
text = 國中的社團博覽會，學長姐們拚命在發傳單。
choice1 = 加入電競社
result1 = 學長看完你打一場，直接把隊長的位置讓給你。
choice2 = 加入程式設計社
result2 = 你寫出了第一個小遊戲，發現寫程式跟打遊戲一樣有趣。（日後技術力加成）
choice3 = 加入熱舞社
result3 = 跳得不太好，但交到了一群好朋友，體力也變好了。

[event.voice_crack]
icon = 🗣️
title = 變聲期
text = 上台報告到一半，你的聲音突然破音了。全班安靜了一秒，然後爆笑。
choice1 = 跟著大家一起笑
result1 = 你自己也笑了出來，報告反而變得很輕鬆。
choice2 = 從此不敢上台說話
result2 = 那一整個學期，你都沒有再舉過手。

[event.cram_school]
icon = ✏️
title = 補習班
text = 爸媽幫你報名了補習班，每天放學還要再上三個小時的課。
choice1 = 認真上課
result1 = 成績進步了，但每天都好累。
choice2 = 下課直衝網咖
result2 = 補習班的作業在網咖寫完了……大概吧。

[event.school_festival]
icon = 🎡
title = 園遊會
text = 學校的園遊會，班上決定擺一個攤位。
choice1 = 擺電競體驗攤位
result1 = 你在攤位上一打五，排隊的人繞了操場一圈。
choice2 = 負責顧收銀
result2 = 收支記得清清楚楚，班導還分了你一點零用錢。

[event.online_friend]
icon = 💬
title = 網友見面
text = 遊戲裡認識很久的隊友約你出來見面，就約在車站前的速食店。
choice1 = 去見面
success1 = 他跟遊戲裡一樣好笑，你們聊了一整個下午。
fail1 = 對方跟照片上完全不一樣，還一直想推銷你買東西……你找藉口跑了。
choice2 = 還是不要好了
result2 = 你們繼續在遊戲裡當隊友，這樣也不錯。

[event.part_time]
icon = 🍔
title = 第一份打工
text = 暑假到了，你決定去打工賺點零用錢。
choice1 = 速食店
result1 = 站了一整個暑假，腳好痠，但第一次領薪水的感覺很棒。
choice2 = 網咖櫃台
result2 = 顧櫃台的空檔就能打遊戲，簡直是夢幻工作。
choice3 = 不打工，專心讀書
result3 = 你把整個暑假都獻給了講義和考古題。

[event.grad_trip]
icon = 🏖️
title = 畢業旅行
text = 高中最後一年，全班要去墾丁畢業旅行。
choice1 = 跟全班一起去
result1 = 你們在沙灘上玩到半夜，那是高中最難忘的一晚。
choice2 = 留在家裡衝排位
result2 = 牌位上去了，但看到大家的照片時，你有一點點後悔。

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
desc = 把對手的每一場比賽拆成逐格分析。DOTA 選手還能提升戰術。

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

[action.date]
icon = 💑
name = 約會
desc = 和{另一半}出去走走。不約會的話，好感度每年會下降。成年後阿方好友度 30 以上，會在他的餐廳約會，好感度多 +5。
lock = 需要有交往對象
msg_fang = 阿方幫你們留了靠窗的位子，還多送一道甜點。{另一半}說這是她吃過最好吃的餐廳。

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

[achievement.centi_billionaire]
icon = 🤑
name = 百億富翁
desc = 身家（現金加上投資）達到 100 億

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

[event.dog_farewell]
icon = 🌈
title = GG 的最後一程
text = 陪了你十四年的 GG 越來越常趴著睡覺。今天早上，牠在你腳邊安靜地閉上了眼睛。
result = 你把牠最喜歡的球放在牠身邊。謝謝你，一直在門口等我回家。

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
choice3 = 截圖傳給高原
result3 = 高原秒回：「兄弟，这是典型的诈骗话术，千万别转钱！」還順便傳了一份防詐騙懶人包給你。

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
passion_name = 💞 熱戀
passion_desc = 好感度 80 以上：能力成長 +5%、事件擲骰成功率 +5%
cold_name = 🥶 感情冷淡
cold_desc = 好感度低於 30：每年心情 -3，太低可能分手
msg_chronic = 長年透支身體，醫生診斷出慢性病。（每年健康 -4，可在道具商店接受治療）
msg_frail = 身體太虛弱，三天兩頭就生病……下一年行動數 -1。
msg_warn = 醫生嚴肅地說：「再倒下一次，你的身體就真的撐不住了。」
msg_final = 第三次倒下了。醫生下了最後通牒——這將是你拚命的最後一年。
fire_button = 🏖️ 財富自由，提早退休
fire_confirm = 存款已經足夠過一輩子了。確定要提早退休、享受人生嗎？職涯這一章將會結束。

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
choice3 = 在阿方的餐廳求婚（10 萬）
success3 = 阿方把整間餐廳佈置成花海，甜點端上來時戒指就在盤子中間。{另一半}哭著說：「我願意！」廚房裡傳來阿方的歡呼聲。
fail3 = 「我……還沒準備好。」阿方默默把甜點收回廚房，拍了拍你的肩膀。

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
choice4 = 請阿方外燴（15 萬）
result4 = 阿方親自掌廚，賓客吃到忘了拍照。阿方說：「你們的婚宴，我怎麼可能收全價。」

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
start = 💕 你和{另一半}開始交往了！（{類型}）

# 另一半的類型：name 顯示名稱｜desc 說明（滑鼠移到面板上的類型標籤會顯示）
type_gamer_name = 🎮 電競迷
type_gamer_desc = 一起打電動也算約會；好感度 50 以上，選手時期在場邊應援，戰力 +2。整年都沒打電動她會不開心。
type_scholar_name = 📚 學霸
type_scholar_desc = 好感度 50 以上，學力、技術力成長 +10%。一年打電動超過一次她會唸你。
type_career_name = 💼 職場女強人
type_career_desc = 婚後每年貢獻 80 萬家庭收入，買房分擔一半頭期款，創業時資金跑道多 1 年。工作很忙，好感度掉得比較快。
type_sporty_name = 🏃 運動系
type_sporty_desc = 一起運動也算約會；好感度 50 以上，每年因年齡下降的健康 -1。整年都沒運動她會不開心。
type_rich_name = 💎 富家千金
type_rich_desc = 結婚時娘家送 500 萬，婚後買房頭期款由娘家出。出社會後生活水準不能是「小資」，不然她會很不開心。
type_jealous_name = 😤 吃醋王
type_jealous_desc = 感情好時心情加分特別多；但好感度掉得快、常常吃醋，同時交往也更容易被抓包。

# 另一半的要求沒做到時的提示
need_gamer = {另一半}抱怨：「你今年都沒陪我打電動！」
need_scholar = {另一半}嘆氣：「你可不可以少打一點電動……」
need_sporty = {另一半}說：「你一整年都沒運動，這樣不行喔。」
need_rich = {另一半}皺眉：「我們真的要過得這麼省嗎？」

msg_dowry = 娘家送了 {金額} 當作結婚禮金！
msg_split = 離婚協議：財產分走 {金額}。
msg_house = {另一半}幫忙出了 {金額} 頭期款。
msg_support = {另一半}全力支持你創業，資金跑道 +{年數} 年。
msg_oppose = {另一半}不贊成你辭職創業，感情出現了裂痕……
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
desc = 領導力、人緣成長 +6%

[item.car]
icon = 🏎️
name = 超跑
desc = 買下時名氣 +8、心情 +15；之後每年心情 +4，但新鮮感每年減半。每年保養費 40 萬

[item.mansion]
icon = 🏰
name = 豪宅
desc = 總價 {總價}（隨房市漲跌）。免房租、生活費 -40%；買下時心情 +20，之後每年心情 +6，但新鮮感每年減半。每年管理費 60 萬。可以在「💰 理財」賣掉

[item.supplement]
icon = 💊
name = 營養補給品
desc = 健康 +5（每年限一次）。連續每年吃，效果會越來越差

[item.newgame]
icon = 🎮
name = 新遊戲
desc = 心情 +8、遊戲能力 +1（每年限一次）

[item.counsel]
icon = 🛋️
name = 心理諮商
desc = 心情低於 40 時才能預約：心情 +12（每年限一次）

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
desc = 今年行動數 +1（每年限一次，要在選擇行動前購買）。價格是去年收入的 3 成，最少 50 萬

[item.coach]
icon = 🧙
name = 私人教練課
desc = 主項目 +4、團隊默契 +2（每年限一次）。連續每年上課效果遞減

[item.career_coach]
icon = 🧭
name = 高階主管教練
desc = 領導力 +3、人緣 +1（每年限一次）。價格隨收入提高，連續每年上課效果遞減

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


# ============================================================
#  朋友 NPC（v1.2）
#  name 暱稱｜job 職業｜desc 介紹
#  intro 學生時期認識的訊息｜intro_adult 成年後認識的訊息
#  hire_need 雇用條件不足時的提示｜hire_log／fire_log 雇用／解雇的紀錄
# ============================================================

[npc.hu]
squad_teen = 連胡投顧都難得放下財經雜誌上線了：「我只打一場喔。」
squad_adult = 連胡投顧都難得收盤後上線了：「我只打一場喔。」
squad_old = 連胡投顧都戴著老花眼鏡上線了：「我只打一場喔。」
icon = 💹
name = 胡投顧
job = 投資達人
desc = 擅長操作台美股，家財萬貫。偶爾會陪大家開黑（揪團開黑時好友度只加一半），主要還是要靠「找胡投顧聊投資」或交朋友、社團、應酬等交際活動維持感情。好友度越高明牌越準；60 以上可以代操投資、在你負債時伸出援手；70 以上會在董事會投你一票。
intro = 高中社團認識一個午休時間在算殖利率的怪同學，大家都叫他「胡投顧」。他說：「錢要放對地方，才會自己長大。」
intro_adult = 朋友的聚會上，一個戴著金錶的人遞來名片：「我姓胡，大家都叫我胡投顧。有興趣聊聊台積電嗎？」

[npc.haji]
squad_teen = 哈基咩已經上線
squad_adult = 哈基咩已經上線
squad_old = 哈基咩的麥克風還沒調好
icon = 🏛️
name = 哈基咩
job = 市政府公務員
desc = 在市政府上班，正在努力繳房貸。一起打遊戲的好夥伴，打得不太好，常被你噴，但兩人感情很好。
intro = 網咖隔壁座位的小胖子一直送頭，被你罵了兩句，居然笑著說：「再一場！」——他就是後來大家口中的哈基咩。
intro_adult = 朋友揪團開黑，多了一個打得很爛、但怎麼噴都不會生氣的傢伙。大家都叫他哈基咩，聽說在市政府上班。

[npc.wang]
squad_teen = 王選手在暖槍
squad_adult = 王選手在暖槍
squad_old = 王選手嘴裡說手已經不行了
icon = 🎯
name = 王選手
job = 電腦硬體公司工程師
desc = FPS 造詣極高的開黑夥伴，也是你一輩子的勁敵。如果你成為職業選手，他也會出道，在賽場上和你一決高下。
intro = FPS 排位一直被同一個 ID 爆頭，加了好友才發現他就住在隔壁學區。王選手——從那天起，你們比了一輩子。
intro_adult = 一場 FPS 野團，對面有個傢伙槍法準得離譜。賽後他加了你好友：「我是王選手，下次再打。」
intro_pro = 出道記者會上，一個同期新人走過來：「久仰，我是王選手。賽場上見。」

[npc.fang]
squad_teen = 阿方帶了一大袋飯糰
squad_adult = 阿方帶了宵夜
squad_old = 阿方燉了一鍋雞湯
icon = 🍳
name = 阿方
job = 高級餐廳廚師
desc = 在高級餐廳當廚師的開黑夥伴，手藝一流，是你的健康靠山。可以在朋友時間「去阿方家吃飯」；好友度 40 以上可以訂「營養便當」，有了自己的房子、好友度 60 以上可以請他當私人廚師（有阿方的健康餐，比較不會得慢性病，健康上限也掉得比較慢）。當職業選手時，好友度 50 以上會來當戰隊營養師。成年後約會、求婚、辦婚禮都可以找他。
intro = 網咖開黑時，有個同學總會帶自己做的飯糰來分大家吃。他叫阿方，夢想是當廚師。
intro_adult = 朋友帶來一個新隊友，開黑前先端出一桌菜。他叫阿方，在高級餐廳當廚師。

[npc.cat]
squad_teen = 長長貓剛幫家裡收完店
squad_adult = 長長貓剛收店
squad_old = 長長貓把早餐店交給兒子顧了
icon = 🐱
name = 長長貓
job = 早餐店老闆
desc = 開早餐店的開黑夥伴，空閒時會幫別人代練遊戲。代練雖然快，但被抓到可就麻煩了。
intro = 早餐店老闆的兒子，邊煎蛋邊用一隻手打排位。大家叫他長長貓，聽說有在幫人代練。
intro_adult = 常去的早餐店老闆認出你：「你也有在玩喔？晚上一起排！」他叫長長貓。

[npc.corey]
squad_teen = Corey 剛練完球
squad_adult = Corey 下班了
squad_old = Corey 說他已經熱身完了
icon = 🛡️
name = Corey
job = 保全
desc = 武力值很高的保全，也是開黑夥伴，打輔助細心得不得了，朋友時間可以「跟 Corey 雙排」。名氣 40 以上、好友度 40 以上可以請他當活動保鑣，擋掉粉絲失控、狗仔、跟蹤狂；有了豪宅、好友度 60 以上可以請他當貼身保全，連闖空門、勒索、討債都擋得住。沒請他的時候，好友度 40 以上遇到麻煩也可以找他幫忙。
intro = 網咖有人找你麻煩，一個高大的同學擋在你前面。對方看了他一眼就走了。他叫 Corey，打遊戲倒是很溫柔。
intro_adult = 朋友介紹一個新隊友，身材壯得像衣櫃，打輔助卻細心得不得了。他叫 Corey，是保全。


# ============================================================
#  朋友事件（v1.2）
# ============================================================

[event.npc_intro]
icon = 🤝
title = 網咖的新朋友
text = 今天去網咖，旁邊坐了一個看起來很好相處的傢伙……

[event.npc_squad_night]
icon = 🎮
title = 開黑之夜
# 專屬變數：{開黑名單}（依年紀描述每位已經認識的朋友，文字在各朋友的 squad_teen／squad_adult／squad_old）
text = 群組突然炸開：「今晚全員到齊！」{開黑名單}
result = 一路打到天亮。有人送頭、有人 Carry、有人在語音裡笑到岔氣——不管幾歲，這群人湊在一起就是青春。

[event.npc_hu_save]
icon = 💹
title = 胡投顧的理財課
text = 胡投顧把手機上的帳戶給你看：「零用錢存下來買 ETF，十年後你會感謝我。」
choice1 = 跟著存
result1 = 你開了人生第一個證券戶。胡投顧欣慰地點頭。
choice2 = 錢就是拿來花的
result2 = 胡投顧搖搖頭：「你會後悔的。」

# 專屬變數：{金額}
[event.npc_hu_tip]
icon = 📈
title = 胡投顧的明牌
text = 胡投顧壓低聲音：「這檔下個月要噴，我自己押了一大筆。你要跟嗎？」（投入 {金額}）
choice1 = 跟了！
success1 = 一個月後股價翻漲，你和胡投顧在群組裡狂刷貼圖。
fail1 = 股價一路往下，胡投顧傳來：「長期投資，長期投資……」
choice2 = 謝謝，我不跟
result2 = 胡投顧聳聳肩：「好吧，有錢不賺。」

[event.npc_hu_dinner]
icon = 🥩
title = 胡投顧請吃飯
text = 胡投顧又賺了一筆，包下整間牛排館請大家吃飯。
result = 吃得很撐，順便聽了一整晚的總體經濟分析。

[event.npc_haji_feed]
icon = 💀
title = 哈基咩又送頭了
text = 決勝局，哈基咩第五次衝進敵人堆裡。語音裡傳來他的聲音：「我以為他們沒看到我……」
choice1 = 開噴
result1 = 「哈基咩你在衝三小！」罵完神清氣爽。哈基咩：「好啦好啦下一場會好好打。」
choice2 = 一個人 Carry 他
result2 = 你打出一波 1 打 5，哈基咩在語音裡大喊：「這就是我大腿！」
choice3 = 乾脆跟他一起送
result3 = 兩個人一起衝進去，笑到停不下來。輸了，但很快樂。

[event.npc_haji_mortgage]
icon = 🏠
title = 哈基咩的房貸
text = 哈基咩難得沒開麥，私訊你：「這個月房貸有點繳不出來……可以先借我 30 萬嗎？」
choice1 = 借他 30 萬
result1 = 「兄弟，我一定會還！」哈基咩說了三次謝謝。
choice2 = 婉拒
result2 = 「沒事沒事，我再想辦法。」那晚他沒有上線。

[event.npc_haji_repay]
icon = 💰
title = 哈基咩還錢了
text = 哈基咩把一個信封放在桌上：「30 萬，一毛不少。今天這頓我請！」
result = 你們點了一桌熱炒，喝到半夜。

[event.npc_haji_city]
icon = 🎪
title = 市政府的電競嘉年華
text = 哈基咩說他負責承辦今年的市府電競嘉年華，要你一定要來。
choice1 = 去捧場
result1 = 現場人山人海，哈基咩穿著主辦單位背心忙進忙出，看到你就用力揮手。
choice2 = 在家打排位就好
result2 = 嘉年華再熱鬧，也比不上上分的快樂。

[event.npc_wang_rank]
icon = 🎯
title = 段考後的排位對決
text = 段考一結束，王選手就傳訊息：「看誰先上鑽石，輸的請飲料。」
choice1 = 熬夜衝分
success1 = 你搶先上了鑽石，截圖傳給王選手：「珍奶微糖去冰，謝謝。」
fail1 = 王選手先上了。你熬了一整夜，最後還是得請他喝飲料。
choice2 = 直接認輸請他喝飲料
result2 = 王選手笑著說：「下次再比。」

[event.npc_wang_school]
icon = 🏫
title = 校際賽對決
text = 全國高中聯賽決賽，對面隊伍的王牌是——王選手。
choice1 = 正面對決
success1 = 最後一回合，你一槍爆頭。王選手摘下耳機，對你比了個大拇指。台下有職業隊的球探。
fail1 = 王選手打出神仙操作。賽後他拍拍你的肩：「明年再來。」
choice2 = 這次先讓給他
result2 = 你選擇專心準備考試。王選手：「你跑去讀書了？」

[event.npc_wang_gear]
icon = 🖥️
title = 王選手的員工價
text = 王選手在電腦硬體公司上班：「我們公司的電競周邊，員工價打三折，要不要？」
choice1 = 電競螢幕（8,000 元）
result1 = 拿到最新的電競螢幕，反應力訓練事半功倍。
choice2 = 機械鍵盤（3,000 元）
result2 = 拿到頂級機械鍵盤，DOTA 手感大升級。
choice3 = 不用啦
result3 = 「好吧，有需要再跟我說。」

[event.npc_fang_supper]
icon = 🍜
title = 阿方的宵夜
text = 半夜十二點，阿方傳來：「剛下班，煮了一鍋牛肉麵，要不要來吃？」
result = 熱騰騰的牛肉麵下肚，整個人都活過來了。

[event.npc_fang_restaurant]
icon = 🍽️
title = 阿方要開餐廳
text = 阿方存夠了錢，準備開一間自己的餐廳：「還差 100 萬，要不要一起當股東？」
choice1 = 投資 100 萬
success1 = 餐廳開幕後天天客滿，一年就回本，還分了 100 萬紅利。
fail1 = 遇上房東漲租，餐廳撐不到一年就收了。阿方難過地向你道歉。
choice2 = 開幕時去捧場就好
result2 = 你訂了一個大花籃，吃了一頓好料。

[event.npc_cat_breakfast]
icon = 🥪
title = 長長貓的早餐
text = 經過長長貓的早餐店，他探頭出來：「老樣子？今天請你！」
result = 蛋餅加奶茶，元氣滿滿的一天。

# 專屬變數：{代練費}
[event.npc_cat_boost]
icon = 🐱
title = 長長貓的代練服務
text = 長長貓小聲說：「最近牌位卡住了吧？{代練費}，三天幫你上一個大段。」
choice1 = 拜託了
success1 = 三天後牌位直接跳了一大段，大家都說你變強了。
fail1 = 被系統抓到代練，帳號被封鎖，還上了論壇的黑名單……
choice2 = 自己的分自己打
result2 = 長長貓：「有骨氣！」

[event.npc_cat_help]
icon = 🍳
title = 早餐店人手不足
text = 長長貓的店員請假，他一個人忙不過來：「明天早上可以來幫忙嗎？」
choice1 = 五點起床去幫忙
result1 = 煎了兩百個蛋，手臂很痠，但長長貓請你吃了一整個月的早餐。
choice2 = 起不來
result2 = 「好啦，沒關係。」

[event.npc_corey_netcafe]
icon = 🛡️
title = 網咖被嗆
text = 隔壁桌輸不起，站起來指著你罵。
choice1 = 看向 Corey
result1 = Corey 慢慢站起來，對方就安靜地坐回去了。
choice2 = 用實力嗆回去
success1 =
success2 = 你在下一場把他打成 0 比 13，全網咖都在看。
fail2 = 對方惱羞成怒推了你一把，你撞到桌角……

[event.npc_corey_stalker]
icon = 👀
title = 跟蹤狂
text = 最近總覺得有人在跟蹤你，信箱裡還出現了奇怪的信。
choice1 = 找 Corey 幫忙
result1 = Corey 在你家樓下站了一個禮拜，那個人再也沒出現過。
choice2 = 報警處理
result2 = 警察做了筆錄，但你還是好幾個月睡不好。
choice3 = 自己處理
success3 = 你當面跟對方說清楚，對方道歉離開了。
fail3 = 對方情緒失控，你受了傷……

[event.robbery]
icon = 🦹
title = 闖空門
text = 回到家，發現門鎖被撬開了，保險箱空空如也……
result = 損失慘重。早知道就請個保全了。


# ============================================================
#  宿敵王選手（v1.2）
#  專屬變數：{宿敵戰隊} 王選手目前的戰隊；{宿敵戰績} 你對王選手的戰績
# ============================================================

[rival]
season_title = 🎮 {戰隊} 的賽季
debut = 同一年，王選手也加入了 {宿敵戰隊}。你的宿敵出道了。
debut_dota = 王選手居然也轉戰 DOTA，加入了 {宿敵戰隊}：「你在哪，我就在哪。」
transfer = 王選手轉會到 {宿敵戰隊}。
final_win = 決賽擊敗王選手！他走過來擁抱你：「這次算你贏。」（對戰成績 {宿敵戰績}）
final_lose = 決賽輸給了王選手……他舉起獎盃時看向了你。（對戰成績 {宿敵戰績}）

[event.rival_trash]
icon = 🔥
title = 賽前嗆聲
text = 記者訪問王選手對你的看法，他笑著說：「他啊？我閉著眼睛都能打。」（目前對戰成績 {宿敵戰績}）
choice1 = 在直播上嗆回去
result1 = 「叫他練好再來。」影片一天破百萬觀看，粉絲們熱血沸騰。
choice2 = 不回應，專心練習
result2 = 你把怒氣全部帶進了訓練室。

[event.rival_hug]
icon = 🫂
title = 宿敵的擁抱
text = 比賽結束後，王選手在後台等你。（目前對戰成績 {宿敵戰績}）
result = 「從認識到現在，能跟你當對手，真的很爽。」你們像當年一樣，一起去吃了宵夜。


# ============================================================
#  職場聯賽（v1.2）
#  清單用頓號「、」分隔
# ============================================================

[office]
title = 🏢 {公司} 的年度職場賽季
title_startup = 🚀 {公司} 的創業之年
projects = 支付系統重構、會員系統上雲、推薦演算法優化、App 大改版、資料庫搬家、年度大促銷、AI 客服導入、後台效能優化、老系統除錯、資安稽核、雙十一壓力測試、跨國專案、行動支付串接、報表自動化、微服務拆分
peers = 卷王 Kevin、馬屁精 Jason、天才新人 Amy、加班狂 Leo、簡報大師 Vivian、斜槓 Eric、開會王 Tina、摸魚仙人 Ben
goals = 用戶成長、月營收目標、產品上線、團隊擴編、海外市場、用戶留存、付費轉換、App 排行榜
vcs = 紅杉影子資本、台北天使俱樂部、巨鷹創投、矽島基金、Formosa Ventures、未來之星加速器
weiya_items = iPhone、Switch、電競椅、氣炸鍋、無線吸塵器、PS5
inc_oncall = 🔥 半夜 on-call
inc_scope = 📝 需求又改了
inc_boss = 👔 主管換人
inc_sick = 🤧 隊友請病假
inc_helper = 🦸 神隊友支援
inc_ai = 🤖 AI 幫大忙
stage_projects = 季度專案
stage_peers = 同期 KPI 排行
stage_defense = 升遷答辯：{職位}
stage_board = 董事會投票：執行長
stage_weiya = 尾牙抽獎
stage_quarters = 季度成長目標
stage_roadshow = 募資路演：{階段}
note_kpi = KPI {KPI}／12，年度考績 {考績}
note_top = 🥇 同期第一！升遷點數 +1
note_place = 同期第 {名次} 名
def_tech = 技術面試
def_tech_opp = 資深架構師
def_boss = 主管面談
def_boss_opp = 部門主管
def_exec = 高層簡報
def_exec_opp = 高層主管們
note_def_ok = 🎉 答辯通過，升任「{職位}」！
note_def_fail = 答辯沒有通過……升遷點數減半。
board_round = 董事
board_opp = 7 席董事
board_opp_hu = 7 席董事（胡投顧是股東之一）
note_board_ok = 🎉 贊成 {贊成} 票、反對 {反對} 票，當選執行長！
note_board_fail = 贊成 {贊成} 票、反對 {反對} 票，董事會選擇了外部空降的人選。
weiya_grand = 🎉 抽中頭獎！{獎金}，全場尖叫！
weiya_second = 🎁 抽中二獎：{獎品}（{獎金}）
weiya_small = 抽到參加獎：一包衛生紙。明年再來。
note_q_up = {達標}／4 季達標，準備募資！
note_q_hold = {達標}／4 季達標，進展有限。
note_q_bad = 一季都沒達標……
vc_round = 創投
note_vc_ok = 🤝 拿到投資意向書，成功進入「{階段}」！
note_vc_fail = 沒有創投願意投資，募資失敗……
msg_def_fail = 升遷答辯沒有通過，升遷點數減半。
msg_board_fail = 董事會這次選擇了外部空降的執行長……再接再厲。

# 專屬變數：{同事}
[event.office_peer]
icon = 😤
title = 同期升官了
text = 公告欄上貼出了升遷名單，{同事} 的名字排在第一個。
choice1 = 大方恭喜他
result1 = {同事} 請大家喝飲料，你也拿了一杯。人脈比面子重要。
choice2 = 明年一定要贏回來
result2 = 你默默把工作排得更滿。


# ============================================================
#  理財（v1.2）
# ============================================================

[finance]
style_frugal = 🍜 小資
style_frugal_desc = 每年 12 萬，心情 -1
style_comfy = 🏠 舒適
style_comfy_desc = 每年 36 萬
style_lux = 🥂 奢華
style_lux_desc = 每年 150 萬，心情 +3
style_royal = 👑 頂級
style_royal_desc = 每年 600 萬，心情 +5
style_hint = 出社會後每年要付生活費。職業選手住戰隊宿舍，費用減半；有自己的房子不用付房租，費用 -40%；還沒買房的話，跟劉地主租房子（好友度 30 以上）有友情價，費用 -15%。降低生活水準後，2 年內每年心情 -4（由奢入儉難）。
inv_deposit = 🏦 定存
inv_deposit_desc = 年報酬 1.5%，穩穩的
inv_etf = 📊 指數 ETF
inv_etf_desc = 平均年報酬 7%，偶爾會跌
inv_stock = 📈 個股
inv_stock_desc = 平均年報酬 8%，大起大落
inv_crypto = 🪙 加密貨幣
inv_crypto_desc = 平均年報酬 12%，可能一年腰斬
inv_hu = 💹 胡投顧代操
inv_hu_desc = 平均年報酬 12%，風險適中（胡投顧好友度 60 以上）
inv_tsmc = 🏭 台積電股票
inv_tsmc_desc = 平均年報酬 10%，護國神山（KE 好友度 50 以上）
inv_hint = 投資的錢每年結算時漲跌，可以隨時贖回部分或全部。結局時會自動換成現金。
# 人生紀錄：同一年投入或贖回同一檔只記一筆，金額累加。變數 {金額} {商品} {成本} {損益}
log_invest = 今年投入 {金額} 到「{商品}」（成本合計 {成本}）
log_withdraw = 今年贖回「{商品}」{金額}，實現損益 {損益}
line_income = 職涯收入
line_tax = 所得稅
line_living = 生活費
line_upkeep = 維護費
line_staff_bento = 阿方的營養便當
line_staff_chef = 私廚阿方
line_staff_bodyguard = 活動保鑣 Corey
line_staff_guard = 保全 Corey
line_loan_house = 房貸
line_loan_shark = 地下錢莊
line_loan_estate = 收租物件房貸
line_rent = 租金收入
line_interest = 負債利息
line_partner = 另一半的收入
line_dividend = 公司股利
line_invest = 投資損益
shark_btn = 🦈 地下錢莊借 50 萬
shark_desc = 借 50 萬，之後 3 年每年要還 30 萬
shark_log = 向地下錢莊借了 50 萬……
msg_auto_sell = 現金不夠，自動贖回投資 {金額} 補足（實現損益 {損益}）。
msg_debt = 負債中！利息 15%、生活壓力更大。（已連續 {年數} 年，{上限} 年就會破產）
msg_bankrupt = 債務越滾越大，再也還不出來了……只能宣告破產。
debt_status = 💳 負債中（{年數}/{上限} 年）

[event.debt_collect]
icon = ☎️
title = 催收電話
text = 銀行的催收電話一天打來八次。帳戶已經是負數了，得想想辦法……
choice1 = 賣掉超跑
result1 = 看著超跑被開走，心在淌血。
choice2 = 賣掉房子
result2 = 賣房還清房貸，又搬回了租屋處。
choice3 = 賣掉豪宅
result3 = 豪宅易主。那些派對的回憶，就留在那裡吧。
choice4 = 賣掉收租物件
result4 = 收租物件一間一間易主，包租公的夢只好先暫停了。
choice5 = 向胡投顧借錢
result5 = 胡投顧二話不說幫你還清了：「慢慢還，不急。」但你知道，這份人情很重。
choice6 = 找哈基咩問更生
result6 = 哈基咩在市政府上班，幫你查好了更生程序。債務砍半，但名聲受了點影響。
choice7 = 硬撐下去
result7 = 你把電話設成靜音，但壓力一點也沒有變小。

[ending.bankrupt]
icon = 💸
name = 破產
text = 法院的裁定書寄來那天，{名字} 坐在空蕩蕩的租屋處裡。存款、信用、那些曾經揮霍的日子，全都沒了。手機響起，是開黑群組：「今晚打嗎？」他愣了很久，回了一個字：「打。」


# ============================================================
#  其他（v1.2）
# ============================================================

[action.squad]
icon = 🎮
name = 揪團開黑
desc = 和開黑的朋友們一起打遊戲，所有開黑朋友好友度上升（人緣越高漲越多）。胡投顧、KE 偶爾也會來陪玩，好友度只加一半、三成。

[item.house]
icon = 🏡
name = 買房
desc = 總價 {總價}（隨房市漲跌），先付頭期款 2 成，其餘 20 年房貸。免房租、生活費 -40%，買下時心情 +10。結婚後另一半會幫忙出頭期款。可以在「💰 理財」賣掉

[achievement.friends_all]
icon = 🤝
name = 朋友滿天下
desc = 認識所有朋友

[achievement.squad6]
icon = 🎮
name = 六人開黑
desc = 和至少 5 位開黑朋友一起打到天亮

[achievement.rival_slayer]
icon = 🔥
name = 宿敵終結者
desc = 在聯賽決賽擊敗王選手

[achievement.rival_friends]
icon = 🫂
name = 亦敵亦友
desc = 和王選手在賽場上交手 15 次

[achievement.office_top]
icon = 👑
name = 卷王之王
desc = 拿到 3 次同期第一

[achievement.weiya]
icon = 🧧
name = 尾牙頭獎
desc = 在尾牙抽中頭獎

[achievement.house]
icon = 🏡
name = 有殼族
desc = 買下自己的房子（豪宅也算）

[achievement.chef]
icon = 🍳
name = 私人廚師
desc = 請阿方當私人廚師

[achievement.guard]
icon = 🛡️
name = 貼身保全
desc = 請 Corey 當貼身保全

[achievement.taxpayer]
icon = 🧾
name = 納稅大戶
desc = 一生繳稅超過 1,000 萬

[achievement.in_debt]
icon = 💳
name = 負債人生
desc = 存款變成負數

[achievement.hu_win]
icon = 💹
name = 明牌之神
desc = 跟胡投顧的明牌大賺一筆


# ============================================================
#  人生第二幕（v2.0）
#  清單用頓號「、」分隔
# ============================================================

[second]
job_streamer = 實況主
job_coach = 電競教練
job_biz = 企業家
job_chairman = 董事長
job_retired = 退休生活
job_elder = 晚年生活
decision_title = 人生的下一步
decision_chapter = 一個章節結束了，但人生還很長。接下來想做什麼？
decision_switch = 想換個跑道嗎？
decision_ousted = 被董事會趕下台了。要東山再起，還是就此退休？
decision_closed = 公司收掉了。接下來呢？
opt_defend = 🎮 繼續職業生涯，挑戰衛冕
opt_defend_desc = 拿過一次世界冠軍，還想再拿第二座、第三座（王朝）
msg_defend = 冠軍只是開始。下個賽季，目標是衛冕！
opt_chairman = 👑 擔任董事長
opt_chairman_desc = 帶領公司成為跨國企業、產業龍頭，甚至科技帝國（可以做到 70 歲）
opt_coach = 📋 轉任電競教練
opt_coach_desc = 用戰術帶領新秀，目標是成為冠軍教練
opt_streamer = 📺 成為全職實況主
opt_streamer_desc = 起始訂閱 {訂閱}，目標百萬訂閱
opt_biz = 🏪 創業從商：{主題}
opt_biz_desc = 投入 {資金} 開店，目標是掛牌上市（可以做到 70 歲）
opt_biz_poor = 需要 {資金} 創業資金
opt_comeback = 🔥 東山再起：{主題}
opt_comeback_desc = 用賣掉股份的錢重新出發
opt_retire = 🎣 退休享福
opt_retire_desc = 旅行、釣魚、和老朋友開黑，好好享受人生
opt_stay = 還是維持現狀
theme_academy = 電競學院
theme_cafe = 網咖連鎖
theme_consult = 科技顧問公司
theme_restaurant = 和阿方合開電競主題餐廳
theme_breakfast = 和長長貓開電競早餐連鎖
theme_security = 和 Corey 合開電競賽事保全公司
names_academy = Aweiisa 電競學院、天才電競學院、GG 學院
names_cafe = 爆頭網咖、Respawn 網咖、阿維電競館
names_consult = 阿維科技顧問、Last Hit 顧問、雲端阿維
names_restaurant = 阿方的電競廚房、Headshot 牛排館、GG 小館
names_breakfast = 長長貓電競早餐、排位前的蛋餅、晨間開黑
names_security = 鐵壁保全、Corey 護衛、坦克保全、輔助位安全顧問
start_streamer = 📺 開始全職實況！第一天開台就湧進大批觀眾。
start_coach = 📋 成為 {戰隊} 的總教練！
start_biz = 🏪 「{公司}」開幕了！（{主題}）
start_chairman = 👑 從執行長升任 {公司} 董事長。
start_retired = 🎣 正式退休，開始享受人生。
# 離開自己的公司時處理股份（v2.3）。變數：{公司} {金額} 一次賣掉拿到的錢、{分紅} 保留股份每年的股利
shares_title = 公司的股份
shares_text = 離開「{公司}」之後，手上的股份要怎麼處理？
shares_text_heir = 「{公司}」交棒給接班人了，交接很順利。手上的股份要怎麼處理？
shares_sell = 💰 一次賣掉
shares_sell_desc = 馬上入帳 {金額}
shares_keep = 📜 保留股份
shares_keep_desc = 每年領約 {分紅} 股利，會隨公司表現漲跌（約 8 年回本），之後也可以在理財畫面賣掉
msg_shares_sell = 賣掉「{公司}」的股份，入帳 {金額}。
msg_shares_keep = 保留「{公司}」的股份，以後每年都能領股利。
msg_shares_sell_later = 賣掉手上「{公司}」的股份，入帳 {金額}。
shares_hint = 每年領股利，隨公司表現漲跌；賣掉的價格是目前股利的 5 倍
# 變數：{年齡} 開始持有的年齡
shares_hold_desc = {年齡} 歲離開公司時保留的股份
msg_elder = {年齡} 歲了，正式退休，進入人生的晚年。（之後每回合 3 年，每年 1 個行動）
msg_switch = 決定轉換跑道，年度結算時選擇新的人生方向。
title_stream = 📺 {名字} 的直播之年
stage_stream = 季度觀看挑戰
note_stream = {達標}／4 季達標，訂閱 {訂閱}（{變化}）
stage_gala = 平台年度盛典
note_gala_top = 👑 年度實況主！
note_gala = 年度排名第 {名次}
streamers = 魯肉飯 TV、阿嬤打電動、熬夜王小明、Neko 喵喵、鐵板燒 Gaming、芒果冰實況、大胖說遊戲、夜貓實況台、阿肥電玩、小企鵝 Live
stream_goals = 新遊戲首播、24 小時馬拉松、抖內破紀錄、觀眾挑戰賽、跨年直播、聯動企劃、精華剪輯爆紅、新人輔導計畫
msg_stream = 訂閱 {訂閱}（{變化}），年度盛典第 {名次} 名
title_coach = 📋 {戰隊} 的教練賽季
msg_coach = 執教 {戰隊}：{戰績}
msg_coach_up = 帶隊奪冠，被 {戰隊}（{等級}）挖角！
msg_coach_down = 戰績太差被解雇……轉任 {戰隊}（{等級}）總教練。
title_biz = 🏪 {公司} 的經營之年
title_chair = 👑 {公司} 的董事會年度
stage_biz = 季度營運目標
stage_chair = 季度營運目標
biz_goals = 展店計畫、會員成長、網路行銷、新品上市、展店選址、員工訓練、成本控制、品牌聯名
chair_goals = 海外市場、新產品線、股價表現、AI 布局、併購整合、法說會、供應鏈、ESG 評比
note_venture_up = {達標}／4 季達標，公司成長了！
note_venture_hold = {達標}／4 季達標（成長需要 {門檻} 季），營運持平。
note_venture_steady = {達標}／4 季達標，穩健經營，獲利亮眼。
note_venture_bad = 一季都沒達標……
biz_stage_0 = 第一家店
biz_stage_1 = 第二家分店
biz_stage_2 = 連鎖品牌
biz_stage_3 = 全台連鎖
biz_stage_4 = 海外展店
biz_stage_5 = 掛牌上市
chair_stage_0 = 上市公司
chair_stage_1 = 跨國企業
chair_stage_2 = 產業龍頭
chair_stage_3 = 科技帝國
msg_venture_up = 「{公司}」成長為「{階段}」！
msg_venture_steady = 「{公司}」今年穩紮穩打，獲利亮眼，大家都很安心。
msg_ousted = 董事會對你的表現忍無可忍，投票把你趕下台，離開了一手打造的「{公司}」……
msg_closed = 「{公司}」撐不下去，收掉了。
msg_venture_shrink = 資金燒完了……「{公司}」收掉了幾個據點，退回「{階段}」重新整頓。
# 年度議題（v2.1）
agenda_head_chairman = 🗳️ 今年的董事會議題
agenda_head_biz = 🧭 今年的經營方針
agenda_hint = 方針會影響今年的經營實力、成長門檻和分紅。標示「需要表決」的提案，董事會否決時會改走預設方針。
stage_vote = 董事會表決：{議題}
note_vote_ok = {贊成}：{反對}，提案通過！執行「{方針}」。
note_vote_fail = {贊成}：{反對}，「{方針}」被否決了……改走預設方針。
stage_plan = （{方針}）
msg_agenda = 年度議題「{議題}」：{方針}。
msg_agenda_fail = 年度議題「{議題}」：提案被董事會否決，改為「{方針}」。

# ============================================================
#  年度議題（v2.1）：董事長、企業家每年一個議題，選擇今年的方針
#  name 議題名稱｜text 說明｜opt1… 方針｜desc1… 方針說明（數值會自動顯示在下方）
#  [agenda.partner] 可以用 {合夥人}
# ============================================================

[agenda.overseas]
name = 海外擴張
text = 董事會提出：公司是時候走向國際了。
opt1 = 同時進軍歐美日三大市場
desc1 = 高風險高報酬，成功的話名聲大漲。
opt2 = 先打一個市場
desc2 = 照原本的步調前進。
opt3 = 守住本業
desc3 = 今年不擴張，專心把錢賺進來。

[agenda.ai_bet]
name = AI 大浪潮
text = 全世界都在搶 AI 人才，董事會在等你表態。
opt1 = 砸重本成立 AI 研究院
desc1 = 燒錢，但做起來就是護城河。
opt2 = 小規模試水溫
desc2 = 先組一個小團隊看看。
opt3 = 不跟風，把錢分給股東
desc3 = 泡沫總有破的一天。

[agenda.layoff]
name = 景氣寒冬
text = 景氣急凍，訂單掉了三成。財務長建議裁員。
opt1 = 大裁員
desc1 = 帳面漂亮，但員工和輿論不會放過你。
opt2 = 高層帶頭減薪
desc2 = 大家一起撐過去。
opt3 = 一個都不裁
desc3 = 今年會很辛苦，但員工會記得你。

[agenda.payout]
name = 股東會
text = 股東會上，大股東要求提高配息。
opt1 = 大方配息
desc1 = 股東開心，但能投資的錢變少了。
opt2 = 維持往年水準
desc2 = 不多也不少。
opt3 = 保留資金再投資
desc3 = 今年少拿一點，換明年的成長。

[agenda.merger]
name = 併購對手
text = 競爭對手經營不善，投資銀行問你有沒有興趣買下它。
opt1 = 發動併購
desc1 = 吃下對手，2 季達標就能成長。
opt2 = 不碰
desc2 = 專心做自己的事。

[agenda.pace]
name = 展店速度
text = 生意越來越好，要加快腳步嗎？
opt1 = 一口氣擴張好幾個據點
desc1 = 2 季達標就成長，但失敗會多燒一年資金。
opt2 = 穩紮穩打
desc2 = 照原本的步調前進。
opt3 = 先求獲利
desc3 = 今年不擴張，把每一家都顧好。

[agenda.marketing]
name = 行銷預算
text = 行銷公司拿著企劃書找上門。
opt1 = 大打廣告
desc1 = 公車、捷運、網紅業配全包。
opt2 = 經營口碑
desc2 = 把每一位客人顧好，讓他們幫你宣傳。
opt3 = 把錢省下來
desc3 = 好東西自己會說話。

[agenda.pricing]
name = 定價策略
text = 成本又漲了，價格要不要跟著調整？
opt1 = 低價搶市
desc1 = 薄利多銷，先把客人搶過來。
opt2 = 維持原價
desc2 = 自己吸收一點。
opt3 = 走高端路線
desc3 = 客人變少，但每一位都更有價值。

[agenda.staff]
name = 員工待遇
text = 員工私下抱怨工作太累、薪水太少。
opt1 = 全員加薪
desc1 = 士氣大振。
opt2 = 維持現狀
desc2 = 大家再撐一下。
opt3 = 壓低人事成本
desc3 = 帳面好看，但氣氛很差。

[agenda.partner]
name = 和合夥人的分歧
text = {合夥人}和你對公司的方向意見不同，兩個人在辦公室吵了一下午。
opt1 = 聽{合夥人}的
desc1 = 他比你更懂這一行。
opt2 = 各退一步
desc2 = 找出兩個人都能接受的做法。
opt3 = 照自己的想法
desc3 = 你才是老闆。

# ============================================================
#  章節、臨終、人生終章（v2.0）
# ============================================================

[life]
chapter_label = 章節完成
chapter_hint = 這個章節的成就已經記錄下來。要就此落幕，還是繼續人生？
btn_end = 🎬 就此落幕
btn_end_desc = 以這個章節作為結局，結算傳承點
btn_continue = ▶ 繼續人生
btn_continue_desc = 章節成就先記下來，繼續過下去，最後一起結算
msg_chapter_again = 「{章節}」已經達成過了，人生繼續向前。
curtain_btn = 🎬 就此落幕
curtain_confirm = 要讓這一生在這裡落幕嗎？會以目前的人生做結算。
msg_dying = 身體越來越虛弱，醫生說，該讓家人朋友來看看了……
msg_wishes = 60 歲了。你在筆記本上寫下了一份遺願清單。
msg_wish_done = 完成遺願：「{願望}」
farewell_title = 最後的時光
farewell_text = 病房的窗外下著小雨。{名字} 躺在床上，看著來探望的人們。
farewell_alone = 病房裡很安靜，只有護理師偶爾進來看看。
visit_love = {另一半}握著你的手，一句話也沒說。
visit_kids = 孩子們都趕回來了，{孩子}紅著眼眶。
words_title = 最後想說的話
words1 = 「這輩子，玩得很盡興。」
words2 = 「謝謝你們陪我走到這裡。」
words3 = 「GG，下一局再來。」
epitaph1 = 這輩子，玩得很盡興。
epitaph2 = 謝謝你們陪我走到這裡。
epitaph3 = GG，下一局再來。
funeral_title = 告別式
funeral_none = 告別式很簡單，來的人不多。
epitaph_title = 墓誌銘

# 遺願清單
[wish.travel]
name = 環遊世界
desc = 60 歲後去旅行 3 次

[wish.rival_match]
name = 和王選手再打一場
desc = 兩個老頭子，最後一場 1v1

[wish.kid_wedding]
name = 看孩子結婚
desc = 親眼看著孩子步入禮堂

[wish.charity]
name = 回饋社會
desc = 一生捐款超過 3000 萬

[wish.reunion]
name = 老友聚會
desc = 和四位以上的開黑老朋友再聚一次

[wish.memoir]
name = 寫回憶錄
desc = 把這一生寫下來

[wish.grandkid]
name = 抱孫子
desc = 有一個孫子

[wish.big_fish]
name = 釣到大魚
desc = 釣魚時釣到一條大魚

[wish.eighty_five]
name = 長命百歲
desc = 活到 85 歲

# 朋友的告別式致詞：eulogy（好友度 40 以上）、eulogy_high（70 以上）
[npc.hu]
eulogy = 他的錢，我幫他顧得很好。可惜這一次，沒辦法再幫他多賺一點了。
eulogy_high = 認識他幾十年，我看過很多漲跌。他是我這輩子最好的一筆投資。

[npc.haji]
eulogy = 打遊戲的時候他老是噴我，但每次我出事，第一個打來的都是他。
eulogy_high = 兄弟，從網咖認識到現在，你噴了我一輩子。下一局，換我 Carry 你。

[npc.wang]
eulogy = 我們比了大半輩子，我的對手只有他一個。
eulogy_high = 這一生我們交手了無數次。最後一場，算你贏。賽場上見，老朋友。

[npc.fang]
eulogy = 他最愛我煮的牛肉麵。今天，我也煮了一鍋。
eulogy_high = 這幾十年來，每次我煮飯給他吃，他都說好吃。今天這一碗，我煮給你。

[npc.cat]
eulogy = 他欠我的早餐錢，我就不跟他算了。
eulogy_high = 每天早上的蛋餅加奶茶，我還是會幫你做一份。

[npc.corey]
eulogy = 我保護過很多人，他是唯一一個會拉我一起開黑的人。
eulogy_high = 這一次，我沒能擋在你前面。好好休息，剩下的交給我。

[family]
kid_names = 小宇、小晴、小恩、小安、小樂、小澄、小禾、小森、小橙、小悠
born = 👶 {名字}出生了！
kid_pro = {名字}在戰隊試訓中脫穎而出，成為職業選手！虎父無犬子！
grandkid = 👶 {名字}生了孩子！你現在有 {孫子} 個孫子了。

# ============================================================
#  v2.0 行動
# ============================================================

[action.hu_chat]
icon = 💹
name = 找胡投顧聊投資
desc = 請胡投顧喝咖啡、聽他分析盤勢。胡投顧好友度上升（人緣越高漲越多）。
msg = 胡投顧講了兩個小時的總體經濟，你只聽懂一半，但他講得很開心。

[action.date_fling]
icon = 💌
name = 偷偷約會
desc = 和{新歡}約會，好感度 +15。小心被發現……

[action.family_time]
icon = 👨‍👧
name = 陪伴家人
desc = 陪另一半和孩子。常陪孩子打電動，他們長大後也許會成為職業選手。

[action.sm_live]
icon = 🔴
name = 開台直播
desc = 長時間開台，增加訂閱與收入。

[action.sm_video]
icon = 🎬
name = 企劃影片
desc = 精心製作企劃影片，訂閱成長最多，但很累。

[action.sm_collab]
icon = 🎮
name = 找朋友聯動
desc = 找開黑朋友一起直播，觀眾最愛看你們互噴。
msg = 和{朋友}一起開台，聊天室刷爆了。

[action.sm_sponsor]
icon = 💼
name = 接業配
desc = 收入很多，但觀眾會覺得你商業化了。

[action.co_tactics]
icon = 🧠
name = 研究戰術
desc = 熬夜看比賽錄影、研究新戰術。

[action.co_train]
icon = 🏋️
name = 帶新秀特訓
desc = 隊伍實力 +3（每年會慢慢下降）。
msg = 新秀們進步神速。

[action.co_scout]
icon = 🔍
name = 挖角明星選手
desc = 花錢簽下好手，隊伍實力 +5。
msg = 簽下了一位明星選手！

[action.co_mental]
icon = 💬
name = 心理建設
desc = 和選手們聊聊，穩定軍心。

[action.bz_store]
icon = 🏪
name = 巡店展店
desc = 親自巡視、規劃展店。

[action.bz_market]
icon = 📣
name = 行銷宣傳
desc = 砸錢打廣告。

[action.bz_hire]
icon = 🤝
name = 招兵買馬
desc = 找到好的經理人。

[action.bz_crunch]
icon = 🔥
name = 親力親為
desc = 什麼都自己來，營運大幅提升，但身心俱疲。

[action.ch_strategy]
icon = 📊
name = 策略會議
desc = 和經營團隊擬定方向。

[action.ch_rnd]
icon = 🧪
name = 投資研發
desc = 投入 1000 萬研發新技術。

[action.ch_team]
icon = 🏆
name = 收購電競戰隊
desc = 花 2 億買下一支電競戰隊，從選手變成老闆。
msg = 你成為了電競戰隊的老闆！選手們都叫你「阿維老闆」。

[action.switch_job]
icon = 🛤️
name = 轉換跑道
desc = 年度結算時重新選擇第二幕的工作（實況主、教練、創業、退休）。

[action.travel]
icon = ✈️
name = 出國旅行
desc = 去看看沒看過的風景。

[action.fishing]
icon = 🎣
name = 釣魚
desc = 坐在海邊，什麼都不想。
msg_big = 釣到一條超大的魚！

[action.elder_squad]
icon = 👴
name = 老人開黑團
desc = 和老朋友們一起打遊戲，手速慢了，嘴砲沒變。

[action.charity]
icon = 💝
name = 做公益
desc = 捐出一成存款（最少 100 萬）。
msg = 捐出 {金額}，收到好多感謝卡。

[action.walk]
icon = 🚶
name = 散步健身
desc = 每天走一萬步。

[action.memoir]
icon = 📖
name = 寫回憶錄
desc = 把這一生的故事寫下來。

[action.checkup]
icon = 🩺
name = 全身健康檢查
desc = 健康 +8，今年比較不容易出意外。
msg = 醫生說你保養得很好。

# ============================================================
#  v2.0 事件
# ============================================================

[event.love_tempt]
icon = 💘
title = 危險的邂逅
text = 有人向你告白了。你明明已經有{另一半}了……
choice1 = 偷偷交往
success1 = 你開始了危險的雙重生活。
fail1 = 對方知道你有對象，轉身就走了。
choice2 = 婉拒，我有{另一半}了
result2 = 回家後，你抱了{另一半}一下。

[event.love_shura]
icon = 🌋
title = 修羅場
text = {另一半}拿著你的手機，螢幕上是{新歡}傳來的訊息。空氣凝結了。
choice1 = 坦白一切，誠心道歉
success1 = {另一半}哭了很久，最後選擇原諒你。你和其他人斷得一乾二淨。
fail1 = 「我們結束了。」所有人都離開了你。
choice2 = 選擇{另一半}
result2 = 你和其他人斷了聯絡。{另一半}原諒了你，但心裡有了裂痕。
choice3 = 選擇{新歡}
result3 = 你和{另一半}分開了，和{新歡}正式在一起。
choice4 = 全部放手
result4 = 一個人坐在空蕩蕩的房間裡，你知道這是自己造成的。

[event.baby]
icon = 🍼
title = 新生命
text = {另一半}輕聲問你：「我們要不要生個孩子？」
choice1 = 好！
result1 =
choice2 = 再等等
result2 = 「好吧，等你準備好。」

[event.kid_first_game]
icon = 🕹️
title = 孩子的第一場遊戲
text = 孩子拿起你的滑鼠，眼睛發亮：「爸爸，教我玩！」
choice1 = 手把手教他 FPS
result1 = 才玩一下午，他就打出了一次爆頭。你彷彿看到了小時候的自己。
choice2 = 讓他自由發展
result2 = 他跑去玩積木了。也好。

[event.kid_rebel]
icon = 😤
title = 叛逆期
text = 孩子摔門大喊：「你根本不懂我！」
choice1 = 好好談一談
success1 = 聊到半夜，你們終於打開心結。他說：「其實我很崇拜你。」
fail1 = 越談越僵，他把自己關在房間裡。
choice2 = 沒收電腦
result2 = 你想起了自己小時候，和爸媽為了打電動吵架的那些日子。

[event.kid_college]
icon = 🎓
title = 孩子上大學了
text_couple = 送孩子去大學宿舍，回程的車上，你和{另一半}都沒說話。
text_single = 送孩子去大學宿舍，回程的車上，你一個人開著車，副駕駛座空蕩蕩的。
result = 學費、生活費花了 20 萬，但心裡很驕傲。

# 專屬變數：{新人}
[event.kid_wedding]
icon = 💒
title = 孩子的婚禮
text = {新人}要結婚了！
choice1 = 包個大紅包（100 萬）
result1 = 你在婚禮上致詞，講到一半哽咽了。
choice2 = 簡單祝福
result2 = 看著{新人}牽起另一半的手，你覺得這一生值得了。

[event.midlife_crisis]
icon = 🌀
title = 中年危機
text = 某天早上照鏡子，你發現自己有白頭髮了。人生，就這樣了嗎？
choice1 = 買一台超跑（800 萬）
result1 = 油門踩下去的那一刻，你覺得自己又 25 歲了。
choice2 = 重拾遊戲，再戰排位
result2 = 手感還在！一路從白銀打回了鑽石。
choice3 = 報名老將復出賽
success3 = 老將復出，一路打進決賽！直播觀看數破紀錄，大家都說「老兵不死」。
fail3 = 第一輪就被小朋友打爆了……腰也閃到了。

[event.hall_of_fame]
icon = 🏛️
title = 電競名人堂
text = 你接到一通電話：你被選入台灣電競名人堂。
result = 典禮上，台下坐滿了當年的隊友和粉絲。

[event.farewell_match]
icon = 🎤
title = 退役告別賽
text = 退役告別賽，對手是——王選手。台下坐滿了觀眾。
choice1 = 全力一戰
success1 = 最後一局，你打出了生涯最漂亮的操作。王選手笑著和你擁抱。
fail1 = 王選手沒有放水。賽後他說：「這是對你最大的尊重。」
choice2 = 這場就交給回憶
result2 = 你們把比賽打成一場表演賽，全場笑聲不斷。

[event.stream_flame]
icon = 🔥
title = 直播炎上
text = 直播時說錯一句話，被剪成短影片瘋傳，留言區一片罵聲。
choice1 = 開台道歉
result1 = 你誠懇道歉，風波慢慢平息。
choice2 = 硬拗到底
success2 = 你用幽默化解了危機，反而圈了一波粉。
fail2 = 越描越黑，大量觀眾退訂……

[event.stream_donate]
icon = 💸
title = 抖內大戶
text = 一位神秘觀眾一口氣抖內了 50 萬，留言：「謝謝你陪我度過最難熬的日子。」
result = 你在鏡頭前愣了好久。

[event.stream_wang]
icon = 🎯
title = 和王選手連線
text = 王選手開直播打到一半，突然傳訊息給你：「上來連線，觀眾想看我們對決！」
result = 兩位老對手連線打娛樂賽，聊天室被洗版，觀看人數衝上平台第一。

[event.coach_rookie]
icon = 🌟
title = 天才新秀
text = 試訓時，一個 16 歲的新秀打出了驚人的數據。你好像看到了當年的自己。
choice1 = 重點培養
result1 = 你把自己的經驗全部傳授給他。
choice2 = 先觀察一陣子
result2 = 不急，好的選手需要時間。

[event.coach_rival]
icon = 🔥
title = 教練的較勁
text = 王選手執教的隊伍放話：「這季的冠軍是我們的。」（對戰成績 {宿敵戰績}）
choice1 = 在記者會上回嗆
result1 = 「叫他先贏過我再說。」記者們都笑了。
choice2 = 默默研究他的戰術
result2 = 你熬夜看了他所有的比賽。

# 專屬變數：{合夥人}
[event.biz_partner]
icon = 🤝
title = 合夥人的點子
text = {合夥人}半夜打電話來：「我想到一個新菜單，一定會爆紅！」
result = 新品推出後大受好評，店裡排起了長長的隊伍。

[event.biz_crisis]
icon = ⚠️
title = 經營危機
text = 店裡被客訴上了新聞，網路上一片負評。
choice1 = 暫停營業，徹底整頓
result1 = 少賺了一些，但口碑保住了。
choice2 = 正面回應，繼續營業
success2 = 你親自道歉、改善流程，反而贏得了顧客的信任。
fail2 = 回應得不好，負評越滾越大……

[event.hostile_takeover]
icon = 🦈
title = 惡意併購
text = 有財團在市場上大量收購公司股票，想要奪走經營權。
choice1 = 正面迎戰
success1 = 你聯合老股東成功擊退財團（胡投顧也出了不少力）。
fail1 = 雖然守住了經營權，但公司元氣大傷。
choice2 = 花錢和解（2000 萬）
result2 = 花錢消災，至少公司保住了。

[event.own_team]
icon = 🏆
title = 你的戰隊
text = 你收購的電競戰隊打進了世界賽，你坐在觀眾席最前排。
result = 選手們賽後衝過來和你擁抱：「老闆，謝謝你！」

# ---------- 第二幕：職業專屬事件（v2.1） ----------
# 董事長

# 專屬變數：{金額}
[event.ch_acquire]
icon = 🛒
title = 併購提案
text = 一家做 AI 晶片的新創公司正在找買家，開價 {金額}。技術長說：「錯過這次，五年後我們會後悔。」
choice1 = 買下來（{金額}）
result1 = 合約簽好了。明年才是真正的考驗：怎麼把兩家公司變成一家。
choice2 = 放棄
result2 = 你把併購案擱下了。聽說後來被對手買走……

[event.ch_acquire_done]
icon = 🧩
title = 併購整合
text = 去年買下的新創公司，工程師文化和總部格格不入，已經有人遞辭呈了。
choice1 = 親自坐鎮整合
success1 = 你每週都去新創的辦公室和工程師吃便當。一年後，新產品線大賣，併購金額賺回兩倍。
fail1 = 你累壞了，核心工程師還是集體出走，只剩一個空殼。
choice2 = 交給專業經理人
success2 = 專業經理人處理得井井有條，新產品線順利上市。
fail2 = 經理人和新創團隊處不來，整合卡了一整年。

[event.ch_scandal]
icon = 📰
title = 財報疑雲
text = 財經週刊刊出一篇報導，質疑公司的財報「太漂亮了」。
choice1 = 公開說明，請會計師徹查
result1 = 查帳結果沒有問題，但股價還是跌了一陣子。
choice2 = 壓下來，不回應
success2 = 新聞熱度很快就過了。
fail2 = 越不回應越像心虛，股價重挫，董事會對你很不滿。

# 專屬變數：{接班的孩子}
[event.ch_successor]
icon = 🪑
title = 接班人
text = 董事會問你：「董事長，是時候想想接班人了吧？」
choice1 = 培養內部的年輕主管
result1 = 你開始帶著年輕主管出席每一場重要會議。退休時公司可以順利交接，股份更值錢。
choice2 = 讓{接班的孩子}接班
result2 = {接班的孩子}有點緊張，但眼神很堅定：「我會努力的。」退休時公司可以順利交接，股份更值錢。
choice3 = 我還能再拚
result3 = 「接班？我還沒打算退休呢！」

[event.ch_keynote]
icon = 🎤
title = 年度發表會
text = 年度新品發表會，全球直播。行銷部問你要不要親自上台。
choice1 = 親自上台
success1 = 你的開場白被剪成短影片瘋傳，新產品預購秒殺。
fail1 = 上台後簡報當機，你在台上尷尬了整整三分鐘……
choice2 = 交給執行長
result2 = 執行長表現得很穩，你坐在台下鼓掌。

[event.ch_hu_advice]
icon = 💹
title = 胡投顧的建議
text = 胡投顧約你喝咖啡：「你們公司現在股價被低估，要不要考慮庫藏股？」
choice1 = 照他說的做
result1 = 公司宣布買回庫藏股，市場信心大增。
choice2 = 謝了，我有自己的規劃
result2 = 胡投顧聳聳肩：「好吧，你是老闆。」

[event.ch_alma_mater]
icon = 🏫
title = 母校的邀請
text = 母校邀請你回去演講。台下的學弟妹眼睛都在發光。
choice1 = 捐 1000 萬蓋電競教室
result1 = 新教室門口掛著你的名字。學弟妹說，以後也要成為像你一樣的人。
choice2 = 只演講
result2 = 演講結束，排隊要簽名的學生排到了走廊外面。

[event.ch_antitrust]
icon = ⚖️
title = 反壟斷調查
text = 公司太大了，公平會決定展開反壟斷調查。
choice1 = 配合調查，主動和解（3000 萬）
result1 = 繳了罰款，公司收斂了一些擴張計畫。
choice2 = 強硬抗辯
success2 = 律師團打贏了官司，公司聲勢更上一層樓。
fail2 = 敗訴了！重罰 1 億，媒體連續報導了好幾週。

# 專屬變數：{金額}
[event.ch_poach]
icon = 🎣
title = 技術長被挖角
text = 對手開出天價，想挖走跟你打拚多年的技術長。
choice1 = 開更高的價碼留人（{金額}）
result1 = 技術長留下來了：「其實我本來就不想走。」
choice2 = 讓他走，從內部升遷
result2 = 你親自挑了新的技術長，交接期有點混亂。

# 企業家
[event.biz_location]
icon = 📍
title = 展店選址
text = 「{公司}」要開新據點了。房仲帶你看了兩個地點。
choice1 = 租下車站前的黃金店面（200 萬）
result1 = 位置真的好，開幕第一天就大排長龍。
choice2 = 巷弄裡的小店面
result2 = 租金便宜，慢慢經營出一群熟客。

[event.biz_influencer]
icon = 📸
title = 網紅上門
text = 一位百萬網紅走進「{公司}」，拿起手機開始拍。
choice1 = 親自招待
success1 = 他的影片爆紅，隔天門口排了一整條街。
fail1 = 他在影片裡說「普普通通，不推」，負評湧進來……
choice2 = 一視同仁就好
result2 = 你照常工作。網紅拍完就走了。

[event.biz_copycat]
icon = 🦜
title = 對手抄襲
text = 對面開了一家跟「{公司}」幾乎一模一樣的店，連招牌的字體都很像。
choice1 = 打價格戰（100 萬）
result1 = 你砸錢辦促銷，客人暫時留住了。
choice2 = 做出差異化
success2 = 你推出對手學不來的新服務，客人說：「還是原版的好。」
fail2 = 新服務沒什麼人買單……
choice3 = 不理他
result3 = 你決定不浪費力氣，但還是流失了一些客人。

[event.biz_manager]
icon = 🧑‍💼
title = 店長要離職
text = 從開幕就跟著你的店長說，別家開了更好的條件給他。
choice1 = 加薪留人（50 萬）
result1 = 店長笑著說：「其實我只是想聽你說一句需要我。」
choice2 = 讓他走，自己顧店
result2 = 你每天第一個到、最後一個走，累到不行，但也更懂這家店了。

[event.biz_vc]
icon = 💼
title = 創投找上門
text = 一家創投看上「{公司}」，想要投資入股。
choice1 = 接受投資
result1 = 資金到位，資金跑道多了 2 年。但創投說：「明年我們要看到成長。」
choice2 = 婉拒，自己慢慢來
result2 = 「這是我的店，我想照自己的步調走。」

[event.biz_vc_push]
icon = 📈
title = 投資人的壓力
text = 創投在董事會上拍桌：「說好的擴張呢？今年一定要加速！」
choice1 = 照他們說的全力衝刺
result1 = 你每天睡不到五小時，但成長數字很漂亮。
choice2 = 頂住壓力
result2 = 你堅持照自己的步調，創投很不高興，資金跑道少了 1 年。

[event.biz_regular]
icon = ☕
title = 老顧客
text = 一位老先生每週三都會來「{公司}」，今天他帶著孫子一起來：「這就是我跟你說的那家店。」
result = 你多送了他們一份點心。開店的意義，大概就是這樣吧。

[event.biz_friends]
icon = 🎉
title = 朋友來捧場
text = 開黑的老朋友們一起來「{公司}」，還在社群上幫你宣傳。
result = 「老闆，記得打折喔！」大家笑成一團。

[event.biz_franchise]
icon = 🏷️
title = 加盟邀約
text = 好幾個人想加盟「{公司}」。開放加盟可以快速展店，但品質不好控制。
choice1 = 開放加盟
success1 = 加盟店一家接一家開，品牌知名度大增。
fail1 = 有一家加盟店出包上了新聞，整個品牌一起挨罵……
choice2 = 堅持直營
result2 = 「我要確保每一家都是我想要的樣子。」

# 實況主
[event.stream_viral]
icon = 🚀
title = 精華影片爆紅
text = 粉絲剪的一段精華影片在各大平台瘋傳，播放數破千萬。
result = 新觀眾一波一波湧進你的頻道。

# 專屬變數：{金額}
[event.stream_brand]
icon = 🧃
title = 大品牌業配
text = 一個飲料品牌開價 {金額}，希望你在直播中喝他們的新口味。
choice1 = 接了
result1 = 你在鏡頭前喝了一口：「嗯……很有特色。」聊天室刷了一排「業配」。
choice2 = 婉拒
result2 = 觀眾知道後紛紛留言：「良心實況主！」

[event.stream_burnout]
icon = 🫠
title = 直播倦怠
text = 每天開台八小時，連續好幾個月沒休息。今天打開直播軟體，突然什麼都不想做。
choice1 = 休息一個月
result1 = 你出國走走，回來後狀態好多了。有些觀眾跑掉了，但你不在意。
choice2 = 硬撐下去
result2 = 你繼續開台，但觀眾也感覺得到你的疲憊。

[event.stream_troll]
icon = 👺
title = 黑粉
text = 一個黑粉每天在聊天室洗版罵人，最近還開始騷擾你的家人。
choice1 = 提告
success1 = 法院判他道歉賠償。觀眾都站在你這邊。
fail1 = 官司打了好久，律師費花了不少，最後只換到一句不痛不癢的道歉。
choice2 = 無視他
result2 = 你關掉聊天室，深呼吸。但心裡還是很不舒服。

# 專屬變數：{金額}
[event.stream_platform]
icon = 📡
title = 平台挖角
text = 新的直播平台開價 {金額} 簽約金，要你獨家跳槽。
choice1 = 跳槽
result1 = 簽約金入帳！不過有些觀眾不想換平台，訂閱掉了一些。
choice2 = 留下來
result2 = 你在直播上宣布不跳槽，觀眾感動到洗了一整排「一生推」。

[event.stream_rookie]
icon = 🐣
title = 新人實況主
text = 一個剛開台的新人私訊你：「我是看你的直播長大的，可以帶帶我嗎？」
choice1 = 帶他一起直播
result1 = 你們的聯動直播意外好笑，雙方的觀眾都增加了。
choice2 = 沒空
result2 = 你已讀了那則訊息，但沒有回。

[event.stream_cast]
icon = 🎙️
title = 世界賽賽評
text = 主辦單位邀請你擔任今年世界賽的賽評。
result = 你的解說又專業又好笑，賽後大家都在討論你的金句。

[event.stream_charity]
icon = 🎗️
title = 慈善直播
text = 颱風重創南部，觀眾問你要不要辦一場慈善直播。
choice1 = 馬上辦
result1 = 12 小時的直播募到了上千萬善款，你也全數捐了出去。
choice2 = 下次再說
result2 = 你想了想，還是照原本的排程開台。

# 教練
[event.coach_rookie_star]
icon = 💫
title = 新秀長大了
text = 當年你重點培養的新秀，現在是聯賽最耀眼的明星。豪門戰隊開出天價想挖走他。
choice1 = 放他去更大的舞台
result1 = 轉會費入帳。他離開前對你深深鞠躬：「教練，謝謝你。」
choice2 = 開出更好的條件留下他（150 萬）
result2 = 他選擇留下：「我還想跟教練一起拿冠軍。」

[event.coach_fixing]
icon = 🕵️
title = 打假賽疑雲
text = 網路上流傳一段影片，懷疑你的主力選手打假賽。
choice1 = 立刻停賽開除
result1 = 你的果斷獲得聯盟肯定，但隊伍戰力大減。
choice2 = 相信他，內部調查
success2 = 調查結果證明他是清白的。他更拚命地為你打球。
fail2 = 他真的打了假賽……你也被批評識人不明。

[event.coach_conflict]
icon = 💢
title = 隊內不合
text = 兩名主力選手在訓練室大吵，誰也不讓誰。
choice1 = 開會調解
success1 = 你讓他們把話說開，兩人反而變成最好的搭檔。
fail1 = 越吵越兇，隊內氣氛降到冰點。
choice2 = 換掉其中一人
result2 = 你重新調整陣容，戰術也跟著修正。

[event.coach_patch]
icon = 🔧
title = 版本大改
text = 遊戲推出大型改版，原本的戰術一夕之間全部過時。
choice1 = 熬夜研究新版本
result1 = 你看了上百場比賽，整理出一套新戰術。
choice2 = 沿用舊戰術，出奇制勝
success2 = 對手都在練新套路，你的老戰術反而打得他們措手不及！
fail2 = 舊戰術被新版本完全克制，連輸好幾場……

# 專屬變數：{金額}
[event.coach_bootcamp]
icon = ✈️
title = 海外移地訓練
text = 韓國的頂尖戰隊願意讓你們去移地訓練一個月。
choice1 = 去！（{金額}）
result1 = 一個月的高強度練習賽，選手們進步很多。
choice2 = 在家練就好
result2 = 你們照原本的計畫訓練。

[event.coach_old_mate]
icon = 🤝
title = 老隊友來應徵
text = 當年一起打職業的老隊友來應徵助理教練：「我想再跟你一起拚一次。」
choice1 = 錄用他
result1 = 默契還在。他在場邊幫你看出了好多你沒注意到的細節。
choice2 = 婉拒
result2 = 你們約好下次一起吃飯，但兩個人都知道不會有下次了。

[event.coach_critic]
icon = 🗯️
title = 被酸了
text = 論壇上有人發文：「選手時期很強，當教練就不行了吧？」
choice1 = 開直播回嗆
result1 = 你的回應很好笑，反而圈了一波粉。
choice2 = 用成績說話
result2 = 你把那篇文章印出來，貼在訓練室的牆上。

[event.coach_analyst]
icon = 📊
title = 數據分析師
text = 一位數據分析師推銷他的 AI 戰術分析系統。
choice1 = 引進系統（200 萬）
result1 = 數據幫你找出了對手的習慣和破綻。
choice2 = 相信自己的直覺
result2 = 「我當選手的時候，可沒有這種東西。」

# 退休（65 歲前）
[event.retire_bored]
icon = 🥱
title = 閒得發慌
text = 退休的第一個月很爽，第二個月開始覺得每天都一樣。
choice1 = 去社區大學學新東西
result1 = 你報名了攝影課和日文課，每天都很充實。
choice2 = 去當志工
result2 = 你在社區的兒少中心教小朋友打電動，大家都叫你阿維老師。
choice3 = 每天打電動
result3 = 終於可以從早打到晚了！只是腰有點痠。

[event.retire_reunion]
icon = 🍻
title = 同學會
text = 國中同學會，大家都老了，但聊起當年還是一樣幼稚。
result = 班長拿出畢業紀念冊，大家笑到流眼淚。

[event.retire_recognized]
icon = 👀
title = 被認出來了
text = 在網咖門口，一群年輕人盯著你看：「欸……你是不是那個……！」
result = 你幫他們簽了名，還跟他們打了一場。寶刀未老！

[event.retire_offer]
icon = 📞
title = 回鍋的邀請
text = 以前的同事打電話來：「你退休太早了吧？這邊很需要你，要不要回來幫忙？」
choice1 = 考慮看看
result1 = 你開始認真思考接下來的人生。（年度結算時可以選擇新的工作）
choice2 = 婉拒
result2 = 「謝謝，但我現在很享受生活。」

# 專屬變數：{朋友}
[event.old_friend_visit]
icon = ☕
title = 老朋友來訪
text = {朋友}提著水果來看你：「好久不見，最近好嗎？」
result = 你們聊起了以前在網咖開黑的日子，笑到停不下來。

[event.elder_fall]
icon = 🩹
title = 跌倒了
text = 洗澡時不小心滑了一跤。
result = 骨頭沒斷，但得休養好一陣子。

[event.elder_hospital]
icon = 🏥
title = 住院
text = 身體出了狀況，醫生建議住院治療。
choice1 = 好好治療（100 萬）
result1 = 住了一個月，出院時精神好多了。
choice2 = 回家休養
result2 = 你不想待在醫院，回家慢慢養。

[event.elder_grandkids]
icon = 🧸
title = 孫子來玩
text = 孫子跑進來：「爺爺！教我打電動！」
result = 你把手把交給他們，看著他們在螢幕前大叫，笑得合不攏嘴。

[event.charity_thanks]
icon = 💌
title = 一封感謝信
text = 你資助的學生寄來一封信：「我考上大學了，謝謝您。」
result = 你把信收進抽屜，和那些獎盃放在一起。

[event.wish_reunion]
icon = 🍻
title = 老友聚會
text = 群組裡有人說：「好久沒聚了，這週末一起吃飯吧！」老朋友們全都到齊了。
# result_haji：有認識哈基咩；result_normal：沒有認識哈基咩
result_haji = 哈基咩還是打得很爛，你還是會噴他。有些東西，一輩子都不會變。
result_normal = 大家聊起當年在網咖開黑的糗事，笑到停不下來。有些東西，一輩子都不會變。

[event.wish_wang]
icon = 🎯
title = 最後一場 1v1
text = 王選手提著鍵盤來你家：「我們都老了。來，最後一場。」
choice1 = 全力以赴
success1 = 你贏了。王選手大笑：「好啦，這一輩子算你贏。」
fail1 = 你輸了。王選手拍拍你的肩：「這一輩子，能跟你當對手真好。」
choice2 = 一起打電腦就好
result2 = 你們沒有打 1v1，而是一起組隊，像年輕時一樣。

# ============================================================
#  v2.0 結局
#  人生終章有兩個版本：text_dead（過世）、text_alive（在第二幕自己落幕）
# ============================================================

[ending.champ_coach]
icon = 📋
name = 冠軍教練
text = 從選手到教練，{名字} 再一次站上世界的頂點。這一次，捧起獎盃的是他帶出來的孩子們。他在場邊笑著，比當年自己奪冠時還要開心。

[ending.mega_streamer]
icon = 📺
name = 百萬訂閱實況主
text = 訂閱數突破一百萬的那一刻，聊天室被洗版了整整十分鐘。{名字} 對著鏡頭說：「謝謝大家，我們明天同一時間見。」

[ending.tycoon]
icon = 💼
name = 商業大亨
text_ipo = 敲鐘的那一刻，{名字} 想起了當年在網咖打排位的自己。誰想得到，那個只會打電動的孩子，有一天會成為商業大亨。
text_empire = 「{公司}」成了橫跨各國的科技帝國。{名字} 站在總部頂樓往下看，想起了當年在網咖打排位的自己。誰想得到，那個只會打電動的孩子，有一天會成為商業大亨。

[ending.peaceful]
icon = 🌅
name = 安詳離世
text_dead = {年齡} 歲，{名字} 在睡夢中安詳地離開了。他的一生有輸有贏，有笑有淚，就像一場打得很盡興的遊戲。
text_alive = {年齡} 歲的 {名字} 坐在搖椅上，看著夕陽。這一生有輸有贏，有笑有淚，他覺得已經夠了。

[ending.family]
icon = 👨‍👩‍👧
name = 兒孫滿堂
text_dead = {名字} 走的那天，病房裡擠滿了家人。孫子們不知道發生了什麼事，只記得爺爺總是會陪他們打電動。
text_alive = 過年的時候，{名字} 家裡擠滿了兒孫。孫子們圍著他：「爺爺，再教我們一招！」

[ending.legend]
icon = 👑
name = 傳奇人生
text_dead = {年齡} 歲，傳奇落幕。{名字} 的名字被寫進了歷史——在賽場上，在商場上，也在每一個朋友的心裡。
text_alive = {名字} 的一生，被寫成了書、拍成了電影。有人問他成功的祕訣，他笑著說：「就是一直玩下去而已。」

[ending.centenarian]
icon = 🎂
name = 百歲人瑞
text_dead = 一百歲生日過後不久，{名字} 安詳地離開了。他是全台灣年紀最大的玩家，直到最後都還在打排位。
text_alive = 一百歲生日那天，{名字} 吹熄蠟燭，許的願望是：「再打一場。」

[ending.lonely]
icon = 🥀
name = 孤獨終老
text_dead = {名字} 走的時候，身邊沒有人。整理遺物時，人們找到一張泛黃的照片——一群少年在網咖裡笑得很開心。
text_alive = 偌大的房子裡只有 {名字} 一個人。他打開電腦，好友清單裡的名字都是灰色的。

# ============================================================
#  v2.0 成就
# ============================================================

[achievement.second_act]
icon = 🛤️
name = 人生第二幕
desc = 完成一個章節後選擇繼續人生

[achievement.dynasty]
icon = 👑
name = 王朝
desc = 拿下 3 座世界冠軍

[achievement.champ_coach]
icon = 📋
name = 冠軍教練
desc = 以教練身分拿下世界冠軍

[achievement.top_streamer]
icon = 📺
name = 年度實況主
desc = 在平台年度盛典拿下第一

[achievement.tycoon]
icon = 💼
name = 商業大亨
desc = 創業掛牌上市，或把公司打造成科技帝國

[achievement.double_crown]
icon = 🏆
name = 雙冠人生
desc = 同一生拿下世界冠軍，又成為大老闆或商業大亨

[achievement.comeback]
icon = 🔥
name = 東山再起
desc = 被董事會趕下台後，重新創業成為商業大亨

[achievement.hall_of_fame]
icon = 🏛️
name = 名人堂
desc = 入選電競名人堂

[achievement.old_soldier]
icon = 🎖️
name = 老兵不死
desc = 中年報名老將復出賽並打進決賽

[achievement.team_owner]
icon = 🏟️
name = 戰隊老闆
desc = 收購一支電競戰隊

[achievement.time_master]
icon = ⏰
name = 時間管理大師
desc = 同時和三個人交往

[achievement.shura]
icon = 🌋
name = 修羅場
desc = 同時交往被抓包

[achievement.prodigal]
icon = 💍
name = 浪子回頭
desc = 經歷過修羅場，最後還是結了婚

[achievement.parent]
icon = 🍼
name = 當爸爸了
desc = 有了第一個孩子

[achievement.tiger_son]
icon = 🐯
name = 虎父無犬子
desc = 孩子成為職業選手

[achievement.grandparent]
icon = 🧸
name = 含飴弄孫
desc = 抱到孫子

[achievement.philanthropist]
icon = 💝
name = 慈善家
desc = 一生捐款超過 3000 萬

[achievement.wishes_all]
icon = 📝
name = 了無遺憾
desc = 完成遺願清單上的所有願望

[achievement.centenarian]
icon = 🎂
name = 百歲人瑞
desc = 活到 100 歲

[achievement.life_winner]
icon = 🌟
name = 人生贏家
desc = 達成「傳奇人生」結局

# ---------- v2.0 其他 ----------
[rival]
msg_defend = 👑 衛冕成功！又一座世界冠軍入袋！

[love]
fling_start = 💌 你和{新歡}偷偷交往了……
fling_leave = {新歡}受不了你總是忽冷忽熱，離開了。

# ---------- v2.0：王選手、交往 ----------

# 專屬變數：{賭金}
[event.wang_casino]
icon = 🎲
title = 王選手的邀約
text = 王選手傳來訊息：「走啦，今天手感超好，帶你去贏一把！」你知道他上個月才輸掉半個月薪水……（賭金 {賭金}）
choice1 = 一起梭哈
success1 = 王選手押什麼你就跟什麼，竟然真的贏了！他得意地說：「我就說今天手感很好。」
fail1 = 王選手說「再一把就翻本」說了十次，你們兩個都輸到脫褲。
choice2 = 陪他去，但自己不賭
result2 = 你在旁邊看他大呼小叫了一整晚。
lend = 散場時他抓著你：「借我 5 萬，下禮拜還你。」你嘆了口氣，還是借了。
choice3 = 拒絕他
result3 = 「沒義氣！」王選手一個人去了。

[event.love_paparazzi]
icon = 📸
title = 狗仔拍到約會
text = 你和{另一半}約會的照片被登上了八卦版：「電競新星 {名字} 熱戀中！」
choice1 = 大方公開戀情
result1 = 粉絲們一片祝福，{另一半}也很開心你願意公開。
choice2 = 否認到底
success2 = 新聞很快就被其他八卦蓋過去了。
fail2 = {另一半}看到你在記者會上否認，難過了好幾天……

# ---------- v2.0：朋友事件（追加） ----------

[event.wang_broke]
icon = 💸
title = 王選手又輸光了
text = 半夜兩點，王選手打來：「兄弟……我又輸光了，房租繳不出來，可以先借我 20 萬嗎？」
choice1 = 借他 20 萬
result1 = 「我發誓這是最後一次！」——你已經聽他說過很多次了。
choice2 = 拒絕
result2 = 「好啦，我再想辦法。」他的聲音聽起來很失落。
choice3 = 勸他戒賭
success3 = 你們聊到天亮。王選手終於點頭：「好，我戒。這次是真的。」
fail3 = 「我只是運氣不好而已！」他掛了電話。

[event.wang_repay]
icon = 💰
title = 王選手的那筆錢
text = 三年前借給王選手的 20 萬……
msg_pay = 王選手把錢拿來了，還多請你吃了一頓燒肉：「說好的，一毛不少！」
msg_nopay = 王選手每次都說「下個月」。你決定，這筆錢就當作沒借過吧。

[event.haji_mortgage_done]
icon = 🍾
title = 哈基咩繳完房貸了
text_normal = 哈基咩在群組裡傳了一張照片：銀行的清償證明。「三十年！老子終於繳完了！今晚我請客！」
text_lent = 哈基咩在群組裡傳了一張清償證明，然後私訊你：「當年要不是你借我那 30 萬，這間房子早就沒了。今晚我請客，你坐主位。」
result = 大家喝到半夜，哈基咩一直說「我是有房子的人了」，說了二十幾次。

[event.haji_promotion]
icon = 🏛️
title = 哈基咩升官了
text = 哈基咩升上科長了！他請大家去吃熱炒，臉上的笑容藏都藏不住。
choice1 = 「科長還是一樣送頭吧？」
result1 = 全桌笑翻。哈基咩：「上班是科長，打電動還是你的小弟啦。」
choice2 = 舉杯真心恭喜他
result2 = 哈基咩眼眶有點紅：「謝啦，兄弟。」

[event.fang_tv]
icon = 🍽️
title = 阿方上美食節目
text = 阿方受邀參加電視上的廚藝大賽，緊張到前一晚睡不著，傳訊息問你會不會來。
choice1 = 去現場幫他加油
result1 = 你在台下舉著「阿方必勝」的牌子，阿方看到後笑了出來，最後拿下了第二名。
choice2 = 在家開直播幫他宣傳
result2 = 你的觀眾湧進節目的留言區刷「阿方加油」，節目組都嚇到了。

[event.fang_star]
icon = ⭐
title = 阿方的餐廳摘星了
text = 你當年投資的那間餐廳，拿到了美食評鑑的星級肯定！阿方打電話來，聲音都在發抖。
result = 股東分紅 200 萬入帳。阿方邀你坐在主桌，親自為你做了一整套菜。

[event.cat_busted]
icon = 🚨
title = 代練被抓包
text = 長長貓的代練帳號被官方抓到，客戶名單在網路上流傳——你的名字也在上面。
choice1 = 站出來幫他澄清
result1 = 你公開說明是自己找他代練的，網友罵了你幾天，但長長貓說他這輩子都會記得。
choice2 = 撇清關係
result2 = 你說自己帳號被盜。長長貓已讀不回了好一陣子。

[event.cat_branch]
icon = 🥪
title = 長長貓開分店
text = 長長貓的早餐店生意好到排隊，他準備開第二家分店：「要不要一起當股東？100 萬就好。」
choice1 = 入股 100 萬
success1 = 分店也天天排隊，一年後你拿回了 200 萬！
fail1 = 分店開在不好的地段，撐了一年就收了。長長貓很過意不去。
choice2 = 去幫他剪綵
result2 = 你穿著西裝去剪綵，長長貓穿著圍裙站在旁邊，畫面很好笑，但大家都很開心。

[event.corey_hero]
icon = 🦸
title = Corey 見義勇為
text = 新聞快報：一名男子在捷運上當場制伏扒手——畫面裡的人，正是 Corey。
result = 記者問他平常喜歡做什麼，Corey 說：「跟朋友打電動。」群組裡大家笑成一團，一起替他驕傲。

# 專屬變數：{朋友}
[event.friend_wedding]
icon = 💒
title = 朋友的婚禮
text = {朋友}要結婚了！他拜託你當伴郎，還要上台致詞。
choice1 = 上台致詞
success1 = 你講了你們一起開黑的糗事，全場笑翻又感動，新娘都哭了。
fail1 = 你太緊張，把新娘的名字唸錯了……全場大笑，{朋友}笑到差點站不住。
choice2 = 包個大紅包（6.6 萬）
result2 = {朋友}看到紅包袋的厚度，愣了一下，然後用力抱住你。

# 專屬變數：{金額}
[event.hu_crash]
icon = 📉
title = 胡投顧的股災
text = 股市一天狂跌，胡投顧罕見地在群組裡沉默了一整天。後來他私訊你：「這次我也虧了不少。」
choice1 = 約他出來喝一杯
result1 = 胡投顧講了一晚上的總經和人生，最後說：「謝謝你，還好有你這個朋友。」
choice2 = 趁低點加碼（{金額}）
success2 = 你在最低點進場，半年後大漲，胡投顧都說你是天才。
fail2 = 低點下面還有更低點……你和胡投顧一起看著帳戶發呆。

# ============================================================
#  FPS 與 DOTA 的差異（v2.3）
#  game_fps／game_dota：出道選主攻項目時的說明
#  meta_xxx：DOTA 每年的版本；ace_tag：賽季畫面上 ACE 的標籤
#  專屬變數：msg_ace {次數} {生涯}；msg_mvp {獎金}
# ============================================================

[esports]
game_fps = 🎯 FPS：個人明星的舞台。\n・個人戰力很吃反應力，爆冷門比較常見\n・贏下系列賽時有機會打出 💥 ACE（名氣 +2），例行賽打得夠好能拿 🌟 年度 MVP（年薪 +30%）\n・名氣成長 ×1.25，轉會邀約比較多\n・早熟早退：25 歲起反應力衰退，31 歲退役\n・專屬行動「瞄準特訓」
game_dota = 🗡️ DOTA：團隊與戰術的遊戲。\n・個人戰力看戰術和團隊默契，強隊比較不會翻車\n・每年有不同的 📋 版本，契合度影響隊伍戰力（-2～+3）\n・世界賽獎池是 FPS 的 2.5 倍\n・大器晚成：28 歲起反應力才衰退，34 歲退役\n・專屬行動「BP 研究」
meta_push = 推進版本
meta_late = 後期大核版本
meta_fight = 團戰版本
meta_gank = 遊走抓人版本
meta_split = 帶線分推版本
ace_tag = 💥 ACE
msg_ace = 今年打出 {次數} 次 ACE！精華影片在網路上瘋傳。（生涯 {生涯} 次）
msg_mvp = 🌟 獲選年度 MVP！戰隊加發 {獎金} 獎金。
msg_retire_fps = {年齡} 歲，手速和反應已經跟不上新人了。是時候退役了。
msg_retire_dota = {年齡} 歲，打了大半輩子的 DOTA，是時候把位置交給年輕人了。

[action.aim_train]
icon = 🎯
name = 瞄準特訓
desc = FPS 專屬。每天兩小時打靶、練壓槍，今年打出 ACE 的機率提高。
msg = 一萬發子彈之後，準星好像自己會找頭。

[action.draft_study]
icon = 📋
name = BP 研究
desc = DOTA 專屬。研究版本強勢英雄和禁選策略，今年的版本契合度至少 +3。
msg = 你把這個版本摸透了：{版本}。

[achievement.ace_king]
icon = 💥
name = ACE 之王
desc = FPS 職業生涯打出 10 次 ACE

[achievement.late_bloomer]
icon = 🌳
name = 大器晚成
desc = 以 DOTA 選手的身分，在 30 歲以後拿下世界冠軍

[event.fps_clutch]
icon = 💥
title = 殘局 1 打 5
text = 隊友全倒，只剩你一個人面對五個敵人。你深吸一口氣……五槍，五個爆頭。
choice1 = 賽後發文：「我一個人就夠了」
result1 = 貼文被轉了十萬次，但隊友們看起來不太開心。
choice2 = 「是隊友幫我拖了時間」
result2 = 隊友們搭著你的肩膀，整隊的氣氛好得不得了。

[event.fps_awp]
icon = 🔭
title = 改打狙擊位
text = 教練把你叫進辦公室：「隊上的狙擊手退役了，你的反應最好，要不要試試看？」
choice1 = 拿起狙擊槍
result1 = 一開始很不習慣，但第一次開鏡秒人的時候，你知道你找到自己的位置了。（之後打出 ACE 的機率提高）
choice2 = 我還是想打步槍
result2 = 教練有點失望，只好找別人頂替。

[event.fps_new_title]
icon = 🆕
title = 新的 FPS 大作
text = 一款新的 FPS 遊戲橫空出世，戰隊決定成立分部，問你要不要轉項目，簽約金 100 萬。
choice1 = 轉項目，搶先卡位
result1 = 新遊戲的手感要重新練，但你是第一批職業選手，粉絲一路跟著你過去。
choice2 = 留在原本的遊戲
result2 = 「這款遊戲我還沒打夠。」隊友們都很高興你留下來。

[event.fps_cheater]
icon = 🕵️
title = 排位遇到外掛
text = 直播排位時，對面一個人隔著牆一路鎖頭。聊天室炸開：「外掛啦！」
choice1 = 錄影檢舉
result1 = 官方隔天就封了那個帳號，還在公告裡感謝你。
choice2 = 開直播嘲諷他
success2 = 你用一把手槍電爆了開外掛的人，聊天室刷了一整排的「神」。
fail2 = 你被外掛電了一整場，剪輯被做成迷因到處流傳……

[event.dota_patch]
icon = 🔧
title = 大改版
text = 新版本上線，改動清單長達四十頁，你最熟的三隻英雄全部被削弱。
choice1 = 連夜研究新英雄
result1 = 你把四十頁的改動看完，還找出兩個沒人發現的強勢組合。（今年版本契合度 +3）
choice2 = 堅持招牌英雄
result2 = 被削弱也是招牌，但對手好像都知道你要選什麼了。（今年版本契合度 -2）

[event.dota_ban]
icon = 🚫
title = 招牌英雄被禁光
text = 對手的禁選階段，把你最拿手的英雄全部禁掉。解說：「這是在針對 {名字} 啊！」
choice1 = 拿出秘密武器
success1 = 你選了一隻沒人看過的冷門英雄，打得對手完全不知道怎麼應對。全場起立鼓掌。
fail1 = 秘密武器還是太冷門了……你被打得抬不起頭。
choice2 = 改去打輔助，讓隊友發揮
result2 = 你默默插眼、買信使、幫隊友擋技能。隊友賽後說：「今天的 MVP 是你。」

[event.dota_marathon]
icon = ⏱️
title = 九十分鐘的馬拉松
text = 一場比賽打了九十分鐘，雙方的基地都只剩一座塔。最後一波團戰，你們贏了。
result = 走下舞台時腿都軟了，但這場比賽被稱為年度最佳。

[event.dota_courier]
icon = 🐴
title = 信使送頭
text = 關鍵時刻，隊友的信使載著你的神器，一路走進了敵人的野區……
choice1 = 在語音裡大罵
result1 = 罵完心情好多了，隊友整場都不敢講話。
choice2 = 笑著說「沒事，再買一隻」
result2 = 隊友鬆了一口氣，後來你們把這件事當成隊上的經典笑話。


# ============================================================
#  新朋友：KE、高原、發哥（v2.3）
#  高原是中國人，講話都用簡體字
# ============================================================

[npc.ke]
squad_teen = KE 在旁邊用格鬥搖桿練連段，偶爾被拉來湊數
squad_adult = KE 剛從晶圓廠下班，被拉來湊數
squad_old = KE 說他還是比較想打格鬥
icon = 🕹️
name = KE
job = 台積電工程師
desc = 在台積電上班的工程師，格鬥遊戲高手，連招按鍵精準到每一格畫面。朋友時間可以「找 KE 打格鬥」提升好友度（揪團開黑時好友度只加三成）。好友度 50 以上可以投資「台積電股票」，畢業求職時還會幫你內推科技大廠。
intro = 遊樂場的格鬥機台前圍了一圈人，有個戴眼鏡的少年連贏了三十場。他叫 KE，說話時一直在講「這招有三格破綻」。
intro_adult = 朋友的聚會上，有個看起來很疲倦的工程師，一聊到格鬥遊戲眼睛就亮了起來：「我是 KE，在台積電上班。要不要來一場？」
referral_tag = 🕹️ KE 內推
eulogy = 他打格鬥的反應很快，可惜人生沒有接關鍵。
eulogy_high = 你說過我在晶圓廠待太久，要記得出來曬太陽。今天的太陽很大，我出來了。

[npc.gao]
squad_teen = 高原的加速器終於連上了
squad_adult = 高原刚下班，说「兄弟们我来了」
squad_old = 高原说他退休了，终于不用再值班了
icon = 🚔
name = 高原
job = 中國的公安
desc = 在中國當公安的 FPS 開黑夥伴，講話都是簡體字，個性很有趣。常常因為加速器斷線或臨時要出任務消失，但說好一起打的局從來沒有放過鳥。好友度 40 以上，遇到詐騙時可以找他求救。
intro = FPS 排位排到一個講話很有趣的隊友，打贏時大喊「牛啊兄弟！」。他叫高原，說自己在對岸，加了好友後每天都約你打。
intro_adult = FPS 野團遇到一個槍法很穩的隊友，語音裡傳來：「兄弟，你这枪法可以啊，加个好友？我叫高原，在单位上班。」後來才知道他的「單位」是公安局。
eulogy = 我们隔着海打了一辈子游戏，他是我最好的兄弟。
eulogy_high = 兄弟，我终于批下来了，可以来看你了。可是你怎么不等等我……下一局，我还给你架枪。

[npc.fa]
squad_teen = 發哥邊畫圖邊上線
squad_adult = 發哥剛交完稿
squad_old = 發哥戴著老花眼鏡上線
icon = 🎨
name = 發哥
job = 專業繪師
desc = 人緣超好的專業繪師，也是 FPS 開黑夥伴。認識的人多到數不清，好友度 40 以上會常常幫你介紹新朋友。好友度 30 以上可以付錢「請發哥宣傳」，70 以上打對折。
intro = 班上那個總是在課本上畫畫的同學，下課時身邊永遠圍著一群人。大家都叫他發哥，打 FPS 也有一手。
intro_adult = 朋友的朋友的朋友……好像大家都認識一個叫發哥的繪師。某天他直接加你好友：「聽說你很會打 FPS？我們缺一個。」
eulogy = 我畫過很多人，他是最難畫的一個，因為他永遠在笑。
eulogy_high = 我幫他畫了最後一張圖。畫裡的他還是坐在電腦前，戴著耳機，跟我們一起開黑。

[action.ke_fight]
icon = 🕹️
name = 找 KE 打格鬥
desc = 跟 KE 對打格鬥遊戲，KE 好友度上升（人緣越高漲越多）。
msg = KE 一邊打一邊解說每一招的破綻格數。你輸了二十場，但好像真的變快了。

[action.fa_promo]
icon = 🎨
name = 請發哥宣傳
desc = 付 30 萬請發哥畫宣傳圖、在社群幫你推廣，名氣上升（好友度 70 以上打對折）。實況主的訂閱、創業的衝刺點數另有加成。
msg = 發哥畫的宣傳圖被瘋狂轉發，大家都在問這是誰。
msg_streamer = 發哥畫的頻道主視覺一上線，訂閱數一路往上衝。
msg_biz = 發哥畫的品牌形象圖在社群爆紅，客人一波一波上門。

[event.ke_arcade]
icon = 🕹️
title = 遊樂場的對決
text = KE 在格鬥機台前向你招手：「來，三戰兩勝。」
choice1 = 接受挑戰
success1 = 最後一局，你用一招 KE 沒看過的連段逆轉。KE 愣了很久，然後說：「再來。」
fail1 = KE 全程都沒有被你打到一下……「你的出招前搖太長了。」
choice2 = 請他教你看畫面格數
result2 = KE 講了一個下午，你第一次知道一秒有六十格。

[event.ke_fab_call]
icon = 🏭
title = 晶圓廠來電
text = 約好今晚一起打，KE 卻傳來訊息：「機台當了，要回廠裡一趟……」
choice1 = 送宵夜去竹科給他
result1 = KE 穿著無塵衣跑出來拿宵夜，感動到差點哭出來。
choice2 = 抱怨他又放鳥
result2 = KE 回了一個「抱歉」，之後好幾天都沒上線。

[event.ke_overwork]
icon = 😵
title = KE 爆肝了
text = KE 連續加班一個月，整個人瘦了一圈：「等這批貨出完就好了……」
choice1 = 拉他去運動
result1 = 你們每週一起去打球，KE 的黑眼圈終於淡了一點。
choice2 = 叫他保重
result2 = KE 說：「股票還沒拿完，再撐一下。」

[event.ke_evo]
icon = 🏆
title = 一起去格鬥大賽
text = KE 拿到日本格鬥大賽的報名資格：「要不要一起去？機票住宿大概 6 萬。」
choice1 = 一起去！
success1 = 你們兩個都打進了正賽，KE 還打進前十六強。在異國的賽場上，你們抱在一起大叫。
fail1 = 你第一輪就被淘汰了，但跟 KE 在日本吃了一整週的拉麵，值得。
choice2 = 這次先不去
result2 = KE 一個人去了，回來時送你一個鑰匙圈。

[event.ke_homewear]
icon = 🩲
title = KE 的居家戰袍
text = 約好去 KE 家打格鬥。門一開，KE 穿著一件灰色 T 恤和貼身黑色三角褲，一臉理所當然：「進來啊，鞋子脫門口。」
choice1 = 「你的褲子呢？」
result1 = KE 推了推眼鏡：「這是我的居家戰袍，穿這套出招快三格。」接著連贏你十場，你開始懷疑他是對的。
choice2 = 假裝沒看到，直接開打
result2 = 你努力盯著螢幕，打出這輩子最專注的一晚。KE 賽後點點頭：「你今天的反應不錯。」
choice3 = 回家在開黑群組爆料
success3 = 群組瞬間炸開，有人連夜畫成貼圖。KE 不但沒生氣，還把貼圖設成頭貼：「傳奇戰袍，懂？」
fail3 = KE 已讀了很久，最後只回：「那是我家。」之後好幾天都沒上線。

[event.ke_arizona]
icon = ✈️
title = KE 要去美國廠
text = KE 被公司派去美國亞利桑那廠，一去就是三年：「那邊的網路打格鬥延遲很高吧……」
choice1 = 幫他辦送別會
result1 = 大家都來了，KE 喝得滿臉通紅：「三年後我一定回來。」
choice2 = 在群組祝他一路順風
result2 = KE 回了一個貼圖，隔天就上飛機了。

[event.ke_return]
icon = 🛬
title = KE 回來了
text = 三年過去，KE 拖著兩個大行李箱出現在你家門口：「我回來了！帶了一堆美國的零食。」
result = 他的第一句話是：「這邊的網路好快，來打一場吧。」

[event.gao_vpn]
icon = 📶
title = 加速器又斷了
text = 開局前，高原的頭像又變成灰色。三分鐘後他重新上線：「等一下，我这边加速器又断了……兄弟们稍等，马上好。」
choice1 = 大家一起等他
result1 = 高原連線成功：「感谢兄弟们！这局我必须 Carry！」然後他真的 Carry 了。
choice2 = 先開了，下一場再找他
result2 = 高原傳來：「不讲武德啊你们……」

[event.gao_slang]
icon = 🗣️
title = 用語大不同
text = 高原在語音裡大喊：「兄弟，你这波操作太 6 了！回头我把视频发你，这质量绝了！」大家為了「視頻」還是「影片」吵了半小時。
choice1 = 認真教他台灣用語
result1 = 高原學會了「超派」和「很頂」，但堅持「视频」比較好聽。
choice2 = 乾脆跟他學
result2 = 你開始說「牛啊」「绝了」，連哈基咩都被傳染了。

[event.gao_duty]
icon = 🚔
title = 有任務，先撤了
text = 打到一半，高原突然說：「有任务，先撤了！」隔天他才傳來：「昨晚端了一个外挂工作室，以后排位干净点了。」
result = 排位裡的外掛好像真的變少了。你決定以後叫他「高警官」。

[event.gao_hongbao]
icon = 🧧
title = 高原的微信紅包
text = 過年時高原在群組裡發了一個微信紅包：「新年快乐！兄弟们抢红包！」可是你們都沒有微信支付，誰也打不開……
choice1 = 教他用台灣的轉帳
result1 = 研究了一個晚上，最後大家決定：下次見面請吃飯就好。
choice2 = 也回他一個紅包（888 元）
result2 = 高原收到後大喊：「兄弟太客气了！888，发发发！」

[event.gao_visit]
icon = 🗼
title = 終於能見面了
text = 高原興奮地傳訊息：「单位批了！我能出去玩了！咱们约东京见面吧？」
choice1 = 飛去東京見他（5 萬）
result1 = 認識這麼多年，第一次見到本人。你們在秋葉原的網咖並肩打了一整晚，高原說：「比视频里帅多了。」
choice2 = 視訊就好
result2 = 高原有點失望：「行吧，那下次。」

[event.gao_worlds]
icon = 📺
title = 對岸的應援
text = 世界賽前，高原傳來一張照片：他在宿舍裡用手機看你的比賽。「我支持你啊兄弟，但别告诉我同事。」
result = 你把照片設成手機桌布，上場前看了一眼。

[event.fa_portrait]
icon = 🖼️
title = 發哥的畫
text_normal = 發哥傳來一張圖：Q 版的你戴著耳機，頭上冒著「GG」。「隨手畫的，送你當頭貼。」
text_pro = 發哥幫你畫了一張帥氣的形象圖，粉絲們搶著拿去當桌布，戰隊還做成了周邊。
result = 你盯著那張圖看了很久，覺得自己好像真的很帥。

[event.fa_party]
icon = 🎉
title = 發哥的聚會
text = 發哥在群組喊：「今晚我家，介紹幾個朋友給你們認識！」到場一看，客廳擠了二十個人，每個人都說自己是發哥最好的朋友。

[event.fa_deadline]
icon = ⏰
title = 發哥趕稿中
text = 發哥三天沒睡，開黑時一邊畫圖一邊打：「明天要交五張圖，我只畫完兩張……」
choice1 = 陪他熬夜、幫他買咖啡
result1 = 天亮時發哥交稿成功，在稿件角落偷偷畫了一個小小的你。
choice2 = 叫他先去睡
result2 = 發哥說：「你說得對。」然後繼續畫到天亮。

[event.fa_con]
icon = 📚
title = 同人場
text = 發哥在同人場擺攤：「人手不夠，要不要來幫忙顧攤？分你一萬。」
choice1 = 幫忙顧攤
result1 = 攤位前排了三小時的隊，畫冊全部賣光。你認識了一堆發哥的粉絲。
choice2 = 去逛逛就好
result2 = 你買了一大袋本子，發哥還多送你一張簽名板。

[event.fa_ai]
icon = 🤖
title = AI 繪圖風暴
text = AI 繪圖越來越厲害，發哥的案子少了一半。他在群組裡說：「是不是該轉行了……」
choice1 = 買下他的原畫（10 萬）
result1 = 發哥收到錢時說不出話來，最後只說了一句：「謝謝你，我會繼續畫下去。」
choice2 = 勸他把 AI 當成助手
success2 = 發哥半信半疑地試了一下，草稿速度變成三倍，接案量反而增加了。
fail2 = 發哥沉默了很久：「連你也覺得我會被取代嗎？」之後好一陣子都不太理你。
# ============================================================
#  雇用朋友（v2.3）
#  name 名稱｜btn 雇用按鈕｜need 條件不足時的提示｜hire_log／fire_log 雇用／解雇的紀錄
# ============================================================

[staff.bento]
name = 營養便當
btn = 🍱 訂阿方的營養便當
need = 18 歲以上，而且還沒請阿方當私人廚師
hire_log = 每天中午都會收到阿方做的營養便當，飯盒上還貼著「多吃青菜」的便條。
fire_log = 不再訂阿方的營養便當了，但朋友還是朋友。

[staff.chef]
name = 私人廚師
btn = 🍳 請他當私人廚師
need = 需要有自己的房子或豪宅
hire_log = 請阿方擔任私人廚師，每天都吃得健康又美味。
fire_log = 和阿方結束了雇傭關係，但朋友還是朋友。

[staff.bodyguard]
name = 活動保鑣
btn = 🕶️ 請他當活動保鑣
need = 名氣需要 40 以上，而且還沒請他當貼身保全
hire_log = 請 Corey 擔任活動保鑣。出門的時候，身後多了一個衣櫃般的身影。
fire_log = 和 Corey 結束了活動保鑣的合約，但朋友還是朋友。

[staff.guard]
name = 貼身保全
btn = 🛡️ 請他當貼身保全
need = 需要有豪宅
hire_log = 請 Corey 擔任貼身保全。有他在，什麼都不用怕。
fire_log = 和 Corey 結束了雇傭關係，但朋友還是朋友。

[action.fang_meal]
icon = 🍲
name = 去阿方家吃飯
desc = 阿方煮一桌好菜給你吃，阿方好友度上升（人緣越高漲越多）。
msg = 阿方一邊幫你添飯一邊唸：「你最近是不是都吃泡麵？」

[action.corey_duo]
icon = 🛡️
name = 跟 Corey 雙排
desc = Corey 打輔助細心得不得了，跟他雙排打得特別舒服。Corey 好友度上升（人緣越高漲越多）。
msg = Corey 全程貼在你身邊幫你擋傷害，你第一次知道被保護是什麼感覺。

[event.fang_nutritionist]
icon = 🥗
title = 戰隊營養師
text = 戰隊經理在煩惱：「隊上每個人都吃外送，體檢報告一片紅字……你有認識靠譜的廚師嗎？」
choice1 = 推薦阿方
result1 = 阿方接下戰隊營養師的工作，每天準時送來三餐。隊友們說這是加入戰隊以來吃得最好的一年。（職業選手期間健康消耗減少，健康偏低時戰力也不太會掉）
choice2 = 外送也不錯啊
result2 = 經理嘆了一口氣，繼續打開外送 App。

[event.fan_frenzy]
icon = 📸
title = 粉絲失控
text = 活動結束後，上百個粉絲把出口擠得水洩不通，有人開始推擠。
choice1 = 留下來簽到最後一個
success1 = 你簽了三個小時，手都快斷了，但每個粉絲都開開心心地回家。
fail1 = 人潮一擁而上，你被擠倒在地，手腕扭傷了……
choice2 = 從後門離開
result2 = 你平安離開，但網路上開始有人說你耍大牌。
choice3 = 打給 Corey
result3 = Corey 十分鐘就趕到，張開雙臂把人潮隔開：「排隊，一個一個來。」大家居然真的乖乖排好了。

[event.paparazzi]
icon = 🕵️
title = 狗仔騷擾
text = 連續一週，家門口都停著同一台車。今天的八卦雜誌封面，是你穿著拖鞋去買早餐的照片。
choice1 = 大方面對鏡頭
success1 = 你主動跟狗仔打招呼，還請他們喝咖啡。報導變成「私下超親切」，名聲反而變好了。
fail1 = 你被拍到臭臉，報導寫得很難聽，連{另一半}都被抓出來討論……
choice2 = 躲在家裡不出門
result2 = 整整一個月不敢出門，悶到快發瘋。
choice3 = 請 Corey 處理
result3 = Corey 走到車窗旁敲了兩下。隔天開始，那台車再也沒出現過。

# 專屬變數：{金額}
[event.extortion]
icon = ✉️
title = 勒索信
text = 信箱裡出現一封沒有署名的信：「準備 {金額}，不然你家人就小心一點。」
choice1 = 乖乖付錢
result1 = 錢匯出去之後，對方就沒有再聯絡了。但你好幾個月都睡不好。
choice2 = 報警處理
success2 = 警方循線抓到了勒索的人，新聞還報導了你的勇敢。
fail2 = 對方察覺你報警，變本加厲地騷擾，最後你付出了兩倍的代價……
choice3 = 找 Corey 商量
result3 = Corey 在你家住了兩個禮拜，順便查出寄信的人。對方被警察帶走時，Corey 只說了一句：「以後別來了。」

[event.shark_thugs]
icon = 🦈
title = 討債的人上門
text = 地下錢莊派了兩個人來敲門：「時間到了喔，大老闆。」
choice1 = 一次還清
result1 = 把剩下的錢全部還清，對方笑著說：「早這樣就好了嘛。」
choice2 = 求他們再寬限一下
result2 = 對方「提醒」了你一下……你在床上躺了好幾天。
choice3 = 打給 Corey
result3 = Corey 出現在門口時，兩個討債的人互看一眼：「那……我們每個月寄帳單就好。」

[event.corey_company]
icon = 🛡️
title = Corey 的保全公司
text = Corey 存夠了錢，想開一間專做電競賽事的保全公司：「還差 100 萬，要不要入股？」
choice1 = 入股 100 萬
success1 = 公司接下好幾場世界賽的保全工作，一年就回本，還多分了 100 萬紅利。（之後創業從商可以和 Corey 合開保全公司）
fail1 = 第一年接不到案子，Corey 只好把你的錢先拿去付員工薪水。他很不好意思地說會慢慢還。（之後創業從商可以和 Corey 合開保全公司）
choice2 = 開幕時去捧場
result2 = 你送了一個大花籃，Corey 開心得像個孩子。（之後創業從商可以和 Corey 合開保全公司）

# ============================================================
#  新朋友：劉地主、房地產（v2.4）
#  劉地主跟你同年、同姓劉，是住在內湖的大地主
# ============================================================

[npc.liu]
icon = 🏘️
name = 劉地主
job = 內湖大地主
desc = 住在內湖的大地主，家裡的地多到自己也數不清，每個月最期待收租日。不打電動，要靠「陪劉地主泡茶」或交朋友、社團、應酬、旅行維持感情。好友度 30 以上，還沒買房時可以用友情價租他的房子（生活費 -15%）；40 以上買房打 95 折，也可以跟他買收租物件；60 以上幫你代管物件（比較少空租、租金 +10%），賣房時由他接手（多拿 4%）；70 以上會找你一起投資合建案。泡茶時他會透露明年房市的走向，好友度越高越準。
intro = 高中隔壁班有個穿拖鞋、戴金項鍊的同學，聽說家裡在內湖有好幾甲地，大家都叫他劉地主。他知道你也姓劉，用力拍你的肩膀：「五百年前是一家啦！」
intro_adult = 朋友的聚會上，一個穿汗衫、拖鞋的人默默結了全桌的帳。旁邊的人小聲說：「他是劉地主，內湖那一帶的地都是他家的。」他知道你也姓劉，笑著說：「五百年前是一家啦！」
eulogy = 他每次來泡茶都說要買房，我都叫他不要急。現在想想，該早點把最好的那間留給他。
eulogy_high = 五百年前是一家，這輩子也是一家人。茶我泡好了，你的那杯，我會一直幫你留著。

[action.liu_tea]
icon = 🍵
name = 陪劉地主泡茶
desc = 到劉地主家喝高山茶、聊房市，劉地主好友度上升（人緣越高漲越多）。18 歲起，他會透露明年房市的走向（好友度越高越準）。
msg = 劉地主泡了一壺凍頂烏龍，跟你講了一下午他家的地有多大。
msg_up = 劉地主喝了一口茶：「明年房市看漲，要買要快。」
msg_flat = 劉地主慢慢倒茶：「明年應該差不多啦，慢慢看。」
msg_down = 劉地主皺起眉頭：「明年恐怕會跌，先別急著買。」

[event.liu_rent_day]
icon = 🛵
title = 收租日
text = 劉地主穿著汗衫、騎著老機車停在你面前：「今天收租，要不要一起來？順便教你看房子。」
choice1 = 跳上機車後座
result1 = 劉地主收了一整條街的房租，每一戶都跟他很熟。你學到一件事：當房東，要先會聊天。
choice2 = 說你今天很忙
result2 = 劉地主揮揮手騎走了，背影看起來有點寂寞。

[event.liu_temple]
icon = 🛕
title = 土地公生日
text = 農曆二月初二，劉地主每年都會去土地公廟拜拜，今年他邀你一起去。
choice1 = 一起去拜拜
result1 = 劉地主拜得特別久：「保佑房客都準時繳租。」拜完還請你吃了一碗麵線。
choice2 = 添 6000 元香油錢
result2 = 劉地主看到你的名字出現在廟裡的芳名錄上，笑得合不攏嘴：「有心喔！」

[event.liu_flood]
icon = 🌀
title = 颱風天
text = 颱風帶來豪雨，內湖低窪的地方淹水了。劉地主打電話來：「我有幾間房子一樓進水，有人可以來幫忙嗎……」
choice1 = 冒雨去幫忙堆沙包
result1 = 你們全身濕透地堆了一整晚的沙包。天亮時，劉地主遞給你一杯熱茶：「這份情，我記住了。」
choice2 = 傳訊息關心
result2 = 劉地主回了一張「謝謝」的貼圖，聽起來忙翻了。

[event.liu_inherit]
icon = 📜
title = 劉地主繼承家業
text = 劉地主的爸爸終於把內湖的地交給了他。劉地主在家門口辦了五十桌流水席：「從今天起，我是真正的地主了！」
choice1 = 去吃辦桌
result1 = 你吃到撐著回家。劉地主喝得滿臉通紅，一桌一桌敬酒，敬到你這桌時待得特別久。
choice2 = 包 3 萬 6 的紅包
result2 = 劉地主打開紅包愣了一下：「三萬六，六六大順！你真的很懂。」

[event.liu_matchmaking]
icon = 💐
title = 劉媽媽的相親
text = 劉地主的媽媽一聽說你還單身，馬上說要幫你介紹：「我們隔壁那戶的女兒很乖喔，要不要見個面？」
choice1 = 去相親
success1 = 你們在劉地主家的客廳喝茶，越聊越投機。劉媽媽在旁邊笑得比誰都開心。
fail1 = 對方很客氣，但整場都在看手機。劉媽媽說：「沒關係，我還有很多人選！」
choice2 = 婉拒
result2 = 劉媽媽有點失望，劉地主在旁邊幫你打圓場。

# 專屬變數：{租金}（一間物件一年的租金）
[event.liu_tenant]
icon = 🧾
title = 房客欠租
text = 你的收租物件，房客已經半年沒繳房租了，打電話也不接。再這樣下去，今年 {租金} 的租金就要飛了。
choice1 = 請劉地主出面
result1 = 劉地主提著一盒鳳梨酥上門，聊了半小時，房客隔天就把房租補齊了。「當房東，要先會做人。」
choice2 = 自己上門催討
success2 = 你好聲好氣地談了一個晚上，房客答應分期補繳。
fail2 = 房客連夜搬走，只留下一屋子垃圾和沒繳的房租。
choice3 = 算了，當作空租
result3 = 你換了門鎖，重新貼出招租廣告。

# 專屬變數：{同意} 直接簽約的補償金、{談判} 劉地主幫你談的補償金（都是自住房市值的比例）
[event.liu_renewal]
icon = 🏗️
title = 都更
text = 你住的老公寓被劃進都更範圍，建商帶著厚厚一疊文件上門：「簽了就能換新大樓，還有補償金。」
choice1 = 直接簽約（補償 {同意}）
result1 = 你搬進了新大樓，還拿到一筆補償金。
choice2 = 當最後一戶釘子戶
success2 = 你撐到了最後，建商只好開出更好的條件。
fail2 = 你上了新聞，被鄰居罵到不敢出門，最後還是簽了，補償金也少了一大截。
choice3 = 請劉地主幫你談（補償 {談判}）
result3 = 劉地主跟建商老闆是老朋友，喝了一泡茶就談妥了：「價錢我幫你喊到最好了。」

# 專屬變數：{金額} 投資金額、{年數} 幾年後回收
[event.liu_land]
icon = 🏞️
title = 合建案
text = 劉地主攤開一張內湖的地圖：「我這塊地要跟建商合建，還缺一點資金。投 {金額}，{年數} 年後蓋好，賣房子的錢分你一份。要不要一起？」
choice1 = 投資 {金額}
result1 = 劉地主緊緊握著你的手：「好兄弟，五百年前果然是一家。」
choice2 = 婉拒
result2 = 劉地主點點頭：「沒關係，下次有好康再找你。」

# 專屬變數：{金額} 拿回的錢
[event.liu_land_done]
icon = 🏙️
title = 合建案完工
text = 當年和劉地主一起投資的合建案蓋好了……
msg_ok = 新大樓一開賣就完售，你分到 {金額}！劉地主說：「我就說吧，內湖的地不會讓人失望。」
msg_bad = 遇上房市冷清，房子賣得不太好，最後只拿回 {金額}。劉地主一直跟你道歉。

[achievement.landlord]
icon = 🏘️
name = 包租公
desc = 同時擁有 3 間收租物件

[achievement.land_deal]
icon = 🏙️
name = 合建致富
desc = 和劉地主一起投資的合建案大賺一筆

# 房地產（理財畫面）。變數見各行說明
[estate]
title = 🏘️ 房地產
hint = 房價每年隨房市漲跌（18 歲起），長期大約每年 +2%，但有景氣循環。自住房、豪宅在道具商店購買，收租物件要跟劉地主買。賣房要付仲介費和稅：自住房、收租物件拿回市值的 9 成，豪宅 8 成（劉地主好友度 60 以上由他接手，多拿 4%）。
# {指數} 房價指數、{漲跌} 今年的漲跌
market = 房價指數 {指數}（今年 {漲跌}）
market_wait = 房市 18 歲起才會開始變動
liu_up = 🍵 劉地主說：「明年房市看漲，要買要快。」
liu_flat = 🍵 劉地主說：「明年應該差不多啦，慢慢看。」
liu_down = 🍵 劉地主說：「明年恐怕會跌，先別急著買。」
home_house = 🏡 自住房
home_mansion = 🏰 豪宅
kind_suite = 🏢 內湖套房
kind_suite_desc = 租金每年約市值的 3.5%，偶爾會空租。頭期 3 成，其餘 20 年房貸（劉地主好友度 40 以上）
kind_office = 🏬 內科辦公室
kind_office_desc = 租金每年約市值的 4%，比較容易空租。頭期 4 成，其餘 20 年房貸（劉地主好友度 60 以上）
# {年齡} 買入年齡、{買價}、{租金} 每年租金、{空租} 空租機率、{房貸} 剩餘房貸
own_desc = {年齡} 歲買入・買價 {買價}
rent_desc = 租金約 {租金}／年・空租機率 {空租}
loan_desc = 房貸還剩 {房貸}
need_meet = 認識劉地主之後，可以跟他買收租物件。
need_open = 現在不能買賣
need_age = {年齡} 歲才能買
need_bond = 劉地主好友度需要 {好友度}
need_max = 最多持有 {上限} 間收租物件
need_cash = 還清房貸要補 {金額}
btn_buy = 買下（頭期 {金額}）
btn_sell = 賣掉（拿回 {金額}）
btn_sell_neg = 賣掉（要補 {金額}）
btn_confirm = 確定賣掉？
# 人生紀錄：{物件} {總價} {頭期} {金額} {漲跌} {指數} {空租}
log_buy = 跟劉地主買下「{物件}」（總價 {總價}，頭期 {頭期}）
log_sell = 賣掉「{物件}」，拿回 {金額}
log_sell_neg = 賣掉「{物件}」，還清房貸後倒貼 {金額}
log_year = 房市 {漲跌}（房價指數 {指數}）
log_rent = ，收租 {金額}
log_vacant = （{空租} 間空租）
`);
