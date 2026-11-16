/* =====================================================================
   course-data-1.js — Course content PART 1
   DAY 0 (Basics) + PHASE 1 (Week 1: Market Microstructure & Structure)
   ---------------------------------------------------------------------
   Sirf data hai. course.js ke BAAD load hona chahiye (CourseEngine.candles
   helper use hota hai). Format ki tafseel course.js ke top par hai.
   Candle row = [close, upperWick, lowerWick]; har candle pichle close par
   open hoti hai. Tooltip mein candle number = index + 1.
   ===================================================================== */
(function () {
  'use strict';
  const K = window.CourseEngine.candles; // candle builder

  /* =================================================================
     DAY 0 — BASICS
     ================================================================= */
  window.COURSE.push({
    id: 'day0',
    order: 0,
    label: 'DAY 0',
    title: 'Basics: Trading ki Zabaan',
    subtitle: 'Pip, Lot, Leverage, Margin, Spread, Order types aur crypto ke Funding Fee / Liquidation — in ke baghair koi strategy kaam nahi karti.',
    gate: null, // Day 0 ka gate nahi; Phase 1 hamesha khula hai
    lessons: [
      /* ---------------- Day 0 · Lesson 1 ---------------- */
      {
        id: 'd0-1',
        day: 'Day 0',
        section: '0.1',
        title: 'Pip, Lot, Leverage aur Margin',
        concepts: ['Pip', 'Pipette', 'Lot', 'Leverage', 'Margin', 'Free Margin', 'Stop Out'],
        notes: [
          {
            h: 'Pip kya hai?',
            p: "**Pip** price ki sab se chhoti standard movement hai jis se hum profit ya loss naapte hain. Zyada tar forex pairs jaise EURUSD mein 1 pip = **0.0001** hota hai, yani chautha decimal. Agar EURUSD 1.0850 se 1.0870 par jaye to yeh 20 pips ki movement hai. JPY wale pairs jaise USDJPY mein 1 pip = **0.01** hota hai, yani doosra decimal. Bohot se brokers paanchwan decimal bhi dikhate hain jise **Pipette** (1/10 pip) kehte hain — isay pip samajh kar confuse na hona. Gold aur indices mein har broker ka 'point' alag hota hai, is liye trade se pehle contract specification zaroor check karo."
          },
          {
            h: 'Lot — aap ki position ka size',
            p: "**Lot** aap ki position ka size hai. 1 Standard Lot = 100,000 units, 1 Mini Lot (0.10) = 10,000 units aur 1 Micro Lot (0.01) = 1,000 units. EURUSD jaise USD-quoted pairs mein 1.00 lot par 1 pip taqreeban **$10**, 0.10 par **$1** aur 0.01 par **$0.10** ka hota hai. Iska matlab hai ke same 20 pips ka stop loss 1 lot par $200 aur 0.01 lot par sirf $2 ka nuqsaan hai. Professional trader pehle risk (dollars mein) tay karta hai, phir stop loss ke pips dekh kar lot size calculate karta hai — ulta nahi. Lot size hi woh cheez hai jo account ko bachati ya dubati hai."
          },
          {
            h: 'Leverage — dodhari talwar',
            p: "**Leverage** broker ka diya hua udhaar hai jo aap ko chhote capital se bari position kholne deta hai. 1:100 leverage ka matlab hai ke $1,000 ke saath aap $100,000 (1 standard lot) ki position khol sakte ho. Leverage profit ko bhi bara karta hai aur loss ko bhi. Yaad rakho: **leverage risk tay nahi karta — lot size aur stop loss risk tay karte hain.** Naya trader high leverage dekh kar zarurat se bari position le leta hai aur 30-40 pips ke normal pullback mein account khatam ho jata hai. Institutional soch mein leverage sirf capital efficiency ka tool hai, jua khelne ka nahi."
          },
          {
            h: 'Margin, Free Margin aur Stop Out',
            p: "**Margin** woh raqam hai jo broker aap ki position khuli rakhne ke liye collateral (girvi) ke taur par lock kar leta hai. Formula: **Required Margin = Position Size ÷ Leverage.** 1 lot EURUSD (taqreeban $108,500) par 1:100 leverage ho to taqreeban $1,085 margin lock hoga. Baqi paisa **Free Margin** kehlata hai. Jab loss barhne se Margin Level (Equity ÷ Margin) gir jata hai to pehle Margin Call aata hai aur phir broker **Stop Out** karke aap ki positions khud band kar deta hai. Is liye kabhi bhi account ka sara margin istemal mat karo — Free Margin aap ki saans hai."
          }
        ],
        keyPoints: [
          '1 pip = 0.0001 (JPY pairs mein 0.01). Paanchwan decimal = Pipette.',
          'USD-quoted pairs: 1.00 lot ≈ $10/pip, 0.10 ≈ $1/pip, 0.01 ≈ $0.10/pip.',
          '**Leverage risk tay nahi karta** — lot size + stop loss karte hain.',
          'Required Margin = Position Size ÷ Leverage. Free Margin khatam = Stop Out.'
        ],
        visual: {
          title: 'EURUSD: Entry se Target tak pips naapna',
          decimals: 4,
          candles: K(1.0800, [[1.0812], [1.0806], [1.0821], [1.0830], [1.0824], [1.0838], [1.0850], [1.0845], [1.0848]], 0.0003),
          annotations: [
            { type: 'hline', price: 1.0806, i1: 1, color: 'bull', label: 'Buy Entry 1.0806' },
            { type: 'hline', price: 1.0850, i1: 1, color: 'liq', label: 'Target 1.0850' },
            { type: 'line', from: [1, 1.0806], to: [6, 1.0850], color: 'info', label: '+44 pips', labelPos: 'below', dash: true }
          ],
          caption: 'Entry 1.0806 se Target 1.0850 tak **44 pips** hain. 1.00 lot par yeh taqreeban **$440**, 0.10 lot par **$44** aur 0.01 lot par **$4.40** banta hai. Same chart, alag lot = bilkul alag nateeja.',
          task: {
            prompt: 'Woh **pehli** candle click karo jis ne Target (1.0850) ko touch kiya.',
            answer: [6],
            explain: 'Candle #7 ne 1.0850 par close kiya — 44 pips ka move complete hua.',
            hint: 'Amber Target line dekho — kis candle ki body ya wick pehli dafa us tak pohnchi?'
          }
        },
        exercise: {
          title: 'Pip aur Lot calculation drill',
          steps: [
            'TradingView par EURUSD ka 15m chart kholo aur **Measure tool** (Shift + click-drag) se kisi bhi swing ki pips naapo.',
            'Farz karo account $1,000 hai aur risk 1% ($10) hai. Stop loss 20 pips ho to lot size kya hoga? (Hint: $10 ÷ 20 pips = $0.50 per pip = **0.05 lot**)',
            'Yahi calculation 10 pips aur 40 pips stop ke liye karo aur dekho ke lot size kaise badalta hai.',
            'Apne broker ki contract specification mein Gold (XAUUSD) ka contract size dekho aur likho ke $1 move par 0.01 lot ka kitna profit/loss hai.',
            'Neeche visualizer mein Replay chalao aur Target touch karne wali pehli candle click karo.'
          ],
          deliverable: 'Teen stop sizes (10 / 20 / 40 pips) ke lot sizes apni notebook mein ek table ki shakal mein likho.'
        }
      },

      /* ---------------- Day 0 · Lesson 2 ---------------- */
      {
        id: 'd0-2',
        day: 'Day 0',
        section: '0.2',
        title: 'Spread aur Order Types (Market, Limit, Stop)',
        concepts: ['Bid', 'Ask', 'Spread', 'Market Order', 'Limit Order', 'Stop Order', 'Slippage'],
        notes: [
          {
            h: 'Spread: Bid aur Ask ka farq',
            p: "Har market mein do prices hoti hain: **Bid** (jis par aap bech sakte ho) aur **Ask** (jis par aap khareed sakte ho). Ask hamesha Bid se thora upar hota hai aur dono ka farq **Spread** kehlata hai. Spread broker / liquidity provider ki fee ki tarah hai — trade khulte hi aap spread ke barabar minus mein hote ho. Buy trade Ask par khulti hai aur Bid par band hoti hai; Sell trade Bid par khulti hai aur Ask par band hoti hai. Charts aam taur par Bid price dikhate hain, is liye kabhi kabhi Sell ka stop loss chart par touch hue baghair hit ho jata hai — wajah Ask price hoti hai."
          },
          {
            h: 'Spread kab barhta hai?',
            p: "Spread fixed nahi hota. High-impact news (NFP, CPI, FOMC) ke waqt, raat ko rollover (taqreeban 5pm New York time) ke aas paas aur kam liquidity wale sessions mein spread kai guna barh jata hai. Exotic pairs aur kam traded crypto coins mein spread hamesha zyada hota hai. Scalper ke liye spread sab se bara dushman hai: agar target 5 pips hai aur spread 2 pips, to aap ki edge ka **40%** sirf spread kha gaya. Isi liye professional trader liquid sessions (London aur New York) mein trade karta hai aur news se pehle naye orders se bachta hai."
          },
          {
            h: 'Market Order: fill pakka, price pakki nahi',
            p: "**Market Order** ka matlab hai 'abhi isi waqt jo best price mile us par fill karo'. Is mein fill ki guarantee hai lekin price ki guarantee nahi. Tez market ya news ke waqt aap ko expected price se kharab price mil sakti hai — isay **Slippage** kehte hain. Market order tab theek hai jab entry ka waqt price se zyada aham ho, jaise confirmation candle close hone ke foran baad. Lekin har trade mein market order se ghuss jana aksar FOMO ki nishani hoti hai — plan ke baghair jaldi."
          },
          {
            h: 'Limit aur Stop Orders',
            p: "**Limit Order** behtar price par entry ke liye hai: **Buy Limit** current price se NEECHE aur **Sell Limit** UPAR lagta hai. Yeh tab fill hota hai jab price wapas aap ke zone tak aaye — Order Block ya FVG par entry ke liye yahi istemal hota hai. **Stop Order** momentum mein entry ke liye hai: **Buy Stop** current price se UPAR aur **Sell Stop** NEECHE lagta hai; price wahan pohnchte hi yeh market order ban jata hai. Aap ka Stop Loss bhi asal mein ek Stop Order hai. Yaad rakhne ka tareeqa: **Limit = sasta khareedo / mehenga becho, Stop = breakout ke saath chalo.**"
          }
        ],
        keyPoints: [
          'Buy = Ask par, Sell = Bid par. Farq = **Spread** (aap ki pehli cost).',
          'News, rollover aur kam liquidity mein spread barh jata hai.',
          'Market Order: fill pakka, price pakki nahi (Slippage).',
          'Buy Limit neeche / Sell Limit upar · Buy Stop upar / Sell Stop neeche.'
        ],
        visual: {
          title: 'Buy Limit vs Buy Stop',
          candles: K(100, [[100.6], [100.2], [99.4], [98.6, 0.3, 0.2], [98.5, 0.3, 0.6], [99.3], [100.1], [100.8], [101.6], [102.4], [103.1], [102.8]]),
          annotations: [
            { type: 'label', i: 0, at: 'high', text: 'Orders yahan lagaye (~100)', color: 'muted' },
            { type: 'hline', price: 98.0, i1: 0, color: 'bull', label: 'Buy Limit 98.0 (neeche)' },
            { type: 'hline', price: 102.0, i1: 0, color: 'liq', label: 'Buy Stop 102.0 (upar)' },
            { type: 'label', i: 4, at: 'low', text: 'Limit fill ✓', color: 'bull' },
            { type: 'label', i: 9, at: 'high', text: 'Stop trigger ✓', color: 'liq' }
          ],
          caption: 'Buy Limit pullback mein **sasti price** par fill hota hai; Buy Stop tab trigger hota hai jab price **momentum** ke saath level tor de. Note: Buy hamesha Ask par fill hota hai, is liye asal fill chart (Bid) se spread jitna upar hoga.',
          task: {
            prompt: 'Kis candle par **Buy Limit (98.0)** fill hua?',
            answer: [4],
            explain: 'Candle #5 ki lower wick 97.9 tak gayi aur 98.0 ka Buy Limit fill ho gaya — pullback mein sasti entry mili.',
            hint: 'Limit order current price se NEECHE tha — woh candle dhoondo jis ki wick green dashed line tak gayi.'
          }
        },
        exercise: {
          title: 'Spread aur pending orders ka live mushahida',
          steps: [
            'Apne platform (MT5 ya TradingView) par EURUSD aur kisi exotic pair (jaise USDTRY) ka spread note karo.',
            'Demo account par current price se 20 pips neeche **Buy Limit** aur 20 pips upar **Buy Stop** lagao — dono pending orders ka farq dekho.',
            'ForexFactory calendar se agli high-impact news ka waqt dhoondo aur us waqt spread ko live dekho (sirf observe karo, trade nahi).',
            'Neeche chart par woh candle dhoondo jahan Buy Limit fill hua.'
          ],
          deliverable: 'Normal waqt aur news waqt ka spread compare karke likho, aur bataao ke scalping par is ka kya asar hoga.'
        }
      },

      /* ---------------- Day 0 · Lesson 3 ---------------- */
      {
        id: 'd0-3',
        day: 'Day 0',
        section: '0.3',
        title: 'Crypto: Funding Fee aur Liquidation',
        concepts: ['Perpetual Futures', 'Funding Fee', 'Liquidation', 'Maintenance Margin', 'Isolated Margin', 'Cross Margin'],
        notes: [
          {
            h: 'Perpetual Futures kya hain?',
            p: "Crypto mein zyada tar leverage trading **Perpetual Futures (Perps)** par hoti hai. Yeh aise contracts hain jin ki koi expiry date nahi hoti, is liye aap position jitna marzi lamba khula rakh sakte ho. Lekin contract ki price ko asal spot price ke qareeb rakhne ke liye exchanges ek mechanism istemal karte hain jise **Funding Fee (Funding Rate)** kehte hain. Yeh fee exchange nahi leta balki longs aur shorts aapas mein ek doosre ko dete hain. Zyada tar exchanges par yeh har **8 ghante** baad lagti hai, lekin kuch pairs aur exchanges par 4 ya 1 ghante ka interval bhi hota hai."
          },
          {
            h: 'Funding Fee kaise kaam karti hai?',
            p: "Jab Funding Rate **positive** ho to longs, shorts ko pay karte hain — matlab buyers zyada aggressive hain aur perp price spot se upar hai. Jab rate **negative** ho to shorts, longs ko pay karte hain. Fee aap ki **poori position size** par lagti hai, sirf margin par nahi: $10,000 ki position par 0.01% funding = $1 har interval. Leverage ke saath kai din position rakhne par yeh chhoti fee bari raqam ban jati hai. Bohot zyada positive funding aksar is baat ka ishara hota hai ke market mein longs ki bheer hai — aur aisi bheer aksar liquidation ka shikar banti hai."
          },
          {
            h: 'Liquidation: jab exchange position chheen leta hai',
            p: "**Liquidation** woh lamha hai jab loss itna barh jaye ke aap ka margin **Maintenance Margin** se neeche chala jaye; tab exchange position zabardasti band kar deta hai aur lagaya hua margin taqreeban sara khatam ho jata hai. Mota andaza: **10x** leverage par price ka taqreeban 10% (maintenance margin ki wajah se thora kam) aap ke khilaf jana kaafi hai; **50x** par 2% se bhi kam. **Isolated Margin** mein sirf us trade ka margin risk par hota hai, jabke **Cross Margin** mein poora wallet balance. Naye trader ke liye Isolated hamesha behtar hai."
          },
          {
            h: 'Liquidation hunts aur sabaq',
            p: "Liquidation levels ke aas paas bohot saare stops aur forced orders jama hote hain — yani wahan **liquidity** hoti hai. Price aksar ek tez wick se in levels ko hit karta hai, positions liquidate hoti hain (jo khud market orders ban kar move ko aur tez karti hain — isay **liquidation cascade** kehte hain) aur phir price wapas aa jata hai. Neeche chart mein dekho: price baad mein entry se upar chala gaya magar 10x long wala trader pehle hi liquidate ho chuka tha. **Sabaq: sahi direction kaafi nahi.** Position size aur stop loss aisa ho ke liquidation se bohot pehle aap ka planned stop hit ho."
          }
        ],
        keyPoints: [
          'Perps ki expiry nahi; Funding Fee perp price ko spot ke qareeb rakhti hai.',
          'Positive funding = longs pay karte hain · Negative = shorts pay karte hain.',
          'Funding **poori position size** par lagti hai, sirf margin par nahi.',
          '10x ≈ ~10% ulti move se liquidation. Stop loss hamesha liquidation se pehle.'
        ],
        visual: {
          title: 'BTC 10x Long: Liquidation wick',
          decimals: 0,
          candles: K(60000, [[60400], [59800], [59100], [58500], [58900], [57900], [57600, 200, 3600], [58700], [59500], [60300], [60800]], 250),
          annotations: [
            { type: 'hline', price: 60000, i1: 0, color: 'bull', label: 'Long Entry 60,000 (10x)' },
            { type: 'hline', price: 54300, i1: 0, color: 'bear', label: 'Liquidation ≈ 54,300' },
            { type: 'label', i: 6, at: 'low', text: 'Liquidation wick 💥', color: 'bear' },
            { type: 'label', i: 10, at: 'high', text: 'Price wapas aaya, position nahi', color: 'muted' }
          ],
          caption: 'Sahi direction + ghalat size = phir bhi poora nuqsaan. Agar stop loss ~57,000 ke qareeb hota aur size chhota, to loss control mein rehta aur trader dobara entry le sakta tha.',
          task: {
            prompt: 'Woh candle click karo jis ne **10x long ko liquidate** kar diya.',
            answer: [6],
            explain: 'Candle #7 ki lambi wick 54,000 tak gayi — liquidation level (≈54,300) hit hua. Price baad mein entry se upar chala gaya, lekin 10x trader pehle hi bahar ho chuka tha.',
            hint: 'Crimson liquidation line ko dekho — kaun si wick us ke neeche gayi?'
          }
        },
        exercise: {
          title: 'Funding aur liquidation ka hisaab',
          steps: [
            'Binance / Bybit (ya CoinGlass) par BTCUSDT perpetual ka current **Funding Rate** aur agla funding time note karo.',
            'Hisaab lagao: $5,000 ki position, funding 0.01%, 3 din (9 intervals of 8h) — kitni fee banegi? (Jawab: $4.50)',
            'Exchange ke liquidation calculator mein entry 60,000 aur leverage 5x, 10x, 25x daal kar liquidation price likho.',
            'Neeche chart par woh candle dhoondo jis ne 10x long ko liquidate kiya.'
          ],
          deliverable: 'Teen leverage levels ka liquidation distance (%) ek table mein likho aur ek line mein apna nateeja likho.'
        }
      }
    ]
  });

  /* =================================================================
     PHASE 1 — WEEK 1: Market Microstructure & Structure Mastery
     ================================================================= */
  window.COURSE.push({
    id: 'phase1',
    order: 1,
    label: 'PHASE 1 · WEEK 1',
    title: 'Market Microstructure & Structure Mastery',
    subtitle: 'Market andar se kaise chalta hai, candles kya batati hain, structure kaise padhte hain — aur retail traders kahan phanste hain.',
    lessons: [
      /* ---------------- Day 1 · 1.1 ---------------- */
      {
        id: 'p1-d1',
        day: 'Day 1',
        section: '1.1',
        title: 'Auction Theory aur Institutional Slippage',
        concepts: ['Auction Theory', 'Balance', 'Imbalance', 'Institutional Slippage', 'Liquidity'],
        notes: [
          {
            h: 'Market ek Auction hai',
            p: "Market asal mein ek **do-tarfa nilaami (two-way auction)** hai jahan buyers aur sellers lagatar price par muttafiq hone ki koshish karte hain. Price ka kaam trade ko facilitate karna hai: jab tak dono taraf orders mil rahe hain, price ek 'fair' ilaqe mein ghoomta rehta hai. Price **upar jaata hai sellers dhoondne ke liye** aur **neeche jaata hai buyers dhoondne ke liye**. Jab kisi level par opposite side ke orders khatam ho jayen to price agle level ki taraf chala jata hai jahan naye orders mil saken. Is nazar se chart 'random lines' nahi balki liquidity ki talash ka naqsha hai."
          },
          {
            h: 'Balance vs Imbalance',
            p: "Auction ki do halatein hoti hain. **Balance (Range)** mein buyers aur sellers barabar hote hain, price ek value area mein upar neeche hota hai aur dono taraf orders jama hote rehte hain. **Imbalance** mein ek side bilkul haavi ho jati hai — bari bodies, chhoti wicks aur tez movement nazar aati hai, jaise koi bara player price ki parwah kiye baghair orders bhar raha ho. Imbalance ke baad market aksar naya balance banata hai. Professional trader ka sawal hamesha yeh hota hai: **'Market abhi balance mein hai ya imbalance mein, aur agla liquidity pool kahan hai?'**"
          },
          {
            h: 'Institutional Slippage',
            p: "Ek retail trader 0.10 lot ka order ek click mein ek hi price par fill kar leta hai, lekin ek bank ya fund ko shayad 5,000 lots chahiyen. Itna bara order ek price par fill nahi ho sakta kyun ke wahan itne opposite orders mojood hi nahi hote. Agar woh seedha market order maarein to price unke khilaf bhaagta jayega aur average fill price kharab hota jayega — isay **Institutional Slippage** kehte hain. Is liye bare players apne orders tukron mein bharte hain, aur aise ilaqon mein bharte hain jahan **opposite liquidity bohot zyada** ho."
          },
          {
            h: 'Itni liquidity kahan se aati hai?',
            p: "Jawab: **retail ke stop losses aur pending orders.** Equal highs ke upar sellers ke stops (jo buy orders hain) aur equal lows ke neeche buyers ke stops (jo sell orders hain) jama hote hain. Jab institution ko bari quantity mein khareedna ho to unhe sellers chahiyen — aur buyers ke stop losses hit hone par bilkul yahi sell orders bante hain. Isi liye price aksar obvious lows ko sweep karke ulta chalta hai. Aage chal kar Liquidity Sweep, Order Block aur FVG — sab isi buniyadi idea par khare hain."
          }
        ],
        keyPoints: [
          'Price ka kaam: buyers aur sellers ko milana (two-way auction).',
          '**Balance** = range / value area · **Imbalance** = trend / displacement.',
          'Bara order ek price par fill nahi hota → **Institutional Slippage**.',
          'Institutions ko liquidity chahiye — retail ke stops wahi liquidity hain.'
        ],
        visual: {
          title: 'Balance → Imbalance → Naya Balance',
          candles: K(100, [[101, 0.3, 0.3], [99.6, 0.4, 0.3], [100.8, 0.3, 0.4], [99.5], [100.9, 0.4, 0.3], [99.8, 0.3, 0.4], [100.6, 0.5, 0.3], [100.2],
            [103.6, 0.2, 0.1], [106.2, 0.3, 0.2], [105.5, 0.4, 0.3], [106.4], [105.6, 0.4, 0.3], [106.3], [105.8, 0.4, 0.3]]),
          annotations: [
            { type: 'zone', from: 99.2, to: 101.4, i1: 0, i2: 7, color: 'liq', label: 'Balance (fair value)' },
            { type: 'label', i: 9, at: 'high', text: 'Imbalance: aggressive buying', color: 'bull' },
            { type: 'zone', from: 105.2, to: 106.8, i1: 10, i2: 14, color: 'info', label: 'Naya Balance' }
          ],
          caption: 'Pehle 8 candles mein auction **balance** mein hai (dono taraf orders). Phir buyers haavi hote hain aur do bari bodies se **imbalance** banta hai. Upar jaa kar market naya balance banata hai jahan sellers dobara mil rahe hain.',
          task: {
            prompt: 'Woh **pehli candle** click karo jahan auction Balance se Imbalance mein gaya (displacement shuru hua).',
            answer: [8],
            explain: 'Candle #9 ne range ki upper boundary ko bari body se tor diya — buyers itne aggressive the ke range ke saare sellers khatam ho gaye.',
            hint: 'Amber range box se bahar nikalne wali pehli bari body dhoondo.'
          }
        },
        exercise: {
          title: 'Balance, Imbalance aur liquidity pools mark karo',
          steps: [
            'EURUSD ya BTCUSDT ka **1H** chart kholo aur pichle 5 din mein 2 Balance (range) areas rectangle se mark karo.',
            'Har balance ke baad aane wala **Imbalance** move (bari bodies wala leg) highlight karo.',
            'Har range ke upar aur neeche equal highs / equal lows dhoondo — yeh woh jagah hai jahan stops jama hain.',
            'Note karo: imbalance shuru hone se pehle kya price ne range ki kisi ek side ko sweep kiya tha?'
          ],
          deliverable: 'Screenshot par Balance, Imbalance aur liquidity pools label karke save karo.'
        }
      },

      /* ---------------- Day 2 · 1.1 ---------------- */
      {
        id: 'p1-d2',
        day: 'Day 2',
        section: '1.1',
        title: 'Candlestick Anatomy: Displacement Body vs Rejection Wick',
        concepts: ['OHLC', 'Body', 'Wick', 'Displacement', 'Rejection Wick', 'FVG'],
        notes: [
          {
            h: 'Candle ki anatomy',
            p: "Har candle chaar prices ki kahani hai: **Open, High, Low aur Close (OHLC)**. **Body** Open se Close tak ka hissa hai aur batati hai ke candle ke end tak kis side ne control rakha. **Wicks** (shadows) woh hissa hain jahan price gaya magar wahan tik nahi saka — yani wahan rejection hua. Emerald candle mein Close, Open se upar hota hai aur crimson mein neeche. Candle ka rang akela kuch nahi batata; asal maloomat **body aur wick ke tanasub (ratio)** aur candle ki **location** mein hoti hai."
          },
          {
            h: 'Displacement Body — institutional taaqat',
            p: "**Displacement** candle woh hai jis ki body bari ho (poori range ka taqreeban **70% ya zyada**), wicks chhoti hon aur close apne high ya low ke qareeb ho. Yeh saboot hai ke ek side ne bina ruke aggressive orders bhare — yani institutional imbalance. Displacement aksar apne peeche **Fair Value Gap (FVG)** chhorti hai aur structure tor deti hai. Jab kisi move ke peeche asli taaqat dekhni ho to poocho: 'Kya yahan displacement hua tha ya sirf dheere dheere chhoti candles?' Displacement ke baghair structure break kamzor samjha jata hai."
          },
          {
            h: 'Rejection Wick — inkaar ki nishani',
            p: "**Rejection wick** ek lambi shadow hai (aksar range ka 55-60% se zyada) jo dikhati hai ke price ek taraf gaya, wahan ke orders liye aur phir zor se wapas dhakel diya gaya. Lambi **lower wick**: sellers ne neeche dhakela magar buyers ne price wapas khareed liya. Lambi **upper wick**: buyers upar gaye magar sellers ne rad kar diya. Sab se taaqatwar rejection woh hai jo kisi liquidity pool (equal lows/highs ya pichla swing) ko **sweep** karke bane — yeh asal mein **Liquidity Sweep** ki nishani hai."
          },
          {
            h: 'Location shakal se zyada ahem hai',
            p: "Ek hi shakal ki candle ka matlab location ke saath badal jata hai. Range ke bilkul beech mein lambi wick aksar sirf noise hai, jabke ek obvious low ke neeche sweep karne wali lambi wick bohot ahem signal hai. Isi tarah bari displacement candle trend ke shuru mein taaqat hai, magar lambe move ke bilkul end par woh exhaustion bhi ho sakti hai. Is liye **kabhi akeli candle par trade mat lo** — pehle structure, phir liquidity, phir candle. Neeche chart par har candle par hover karke us ki Body % aur Wick % khud dekho."
          }
        ],
        keyPoints: [
          '**Body = control · Wick = rejection.**',
          'Displacement: body ≥ ~70% range, chhoti wicks, close extreme ke qareeb.',
          'Rejection wick sab se ahem tab hai jab woh liquidity sweep karke bane.',
          'Location > shakal. Akeli candle par kabhi trade nahi.'
        ],
        visual: {
          title: 'Rejection wick (sweep) → Displacement',
          candles: K(100, [[100.4], [99.5], [100.3], [99.7], [99.4, 0.3, 0.2], [99.8, 0.2, 1.4], [100.2], [103.3, 0.15, 0.1], [103.7, 0.4, 0.3], [103.1], [103.5, 1.8, 0.2], [102.7]]),
          annotations: [
            { type: 'hline', price: 99.2, i1: 1, i2: 6, color: 'liq', label: 'Equal lows (liquidity)' },
            { type: 'label', i: 5, at: 'low', text: 'Rejection wick (sweep)', color: 'liq' },
            { type: 'label', i: 7, at: 'high', text: 'Displacement body', color: 'bull' },
            { type: 'label', i: 10, at: 'high', text: 'Upper rejection', color: 'liq' }
          ],
          caption: 'Candle #6 ne equal lows ke neeche **sweep** kiya aur lambi lower wick chhori. Uske baad candle #8 ek saaf **Displacement** hai — bari body, na hone ke barabar wicks. Upar candle #11 ki lambi upper wick batati hai ke wahan sellers ne price rad kiya.',
          task: {
            prompt: '**Displacement** candle par click karo. (Hover karke Body % check kar sakte ho.)',
            answer: [7],
            explain: 'Candle #8: body range ka 90%+ hai, wicks na hone ke barabar aur close high ke qareeb — yeh institutional Displacement hai.',
            hint: 'Sab se bari body aur sab se chhoti wicks wali candle dhoondo.'
          }
        },
        exercise: {
          title: 'Displacement aur Rejection hunt',
          steps: [
            'GBPUSD ya ETHUSDT ka **15m** chart kholo aur pichle 2 din ki 5 Displacement candles mark karo.',
            'Har displacement ke peeche dekho: kya FVG bana? (Pehli candle ki wick aur teesri candle ki wick ke beech khali jagah.)',
            '5 Rejection wicks dhoondo aur check karo ke kitni kisi pichle high/low ko sweep karke bani thin.',
            'Neeche visualizer par Displacement candle par click karo.'
          ],
          deliverable: 'Har candle ke saath likho: kahan bani (location) aur us ke baad price ne kya kiya.'
        }
      },

      /* ---------------- Day 3 · 1.2 ---------------- */
      {
        id: 'p1-d3',
        day: 'Day 3',
        section: '1.2',
        title: '3 Market States: Bullish, Bearish aur Range',
        concepts: ['HH', 'HL', 'LH', 'LL', 'Range', 'Equilibrium', 'Premium / Discount'],
        notes: [
          {
            h: 'Bullish structure: HH aur HL',
            p: "Bullish market structure mein price **Higher Highs (HH)** aur **Higher Lows (HL)** banata hai. Har naya high pichle high se upar aur har pullback ka low pichle low se upar hota hai. Iska matlab hai ke buyers har dip par pehle se oonchi price par khareedne ko tayyar hain. Bullish structure mein hamari bias buy side ki hoti hai aur hum HL ke ilaqe (**discount**) mein entry dhoondte hain, top par chase nahi karte. Jab tak aakhri HL **body close** se nahi tootta, bullish structure qaim samjha jata hai."
          },
          {
            h: 'Bearish structure: LH aur LL',
            p: "Bearish structure bilkul ulta hai: **Lower Highs (LH)** aur **Lower Lows (LL)**. Har rally pichle high tak nahi pohanch pati aur har girawat naya low banati hai — sellers har oopar ki move ko bechne ke liye tayyar baithe hain. Is halat mein buy karna current ke khilaf tairne jaisa hai. Hamara kaam LH ke ilaqe (**premium**) mein sell setups dhoondna hai. Bearish structure tab tak qaim hai jab tak aakhri LH (jis ne naya LL banaya) body close se upar na toot jaye."
          },
          {
            h: 'Range: auction ka balance',
            p: "**Range** (consolidation) mein price na HH/HL banata hai na LH/LL; balke ek upper aur lower boundary ke darmiyan ghoomta rehta hai. Yeh auction ki Balance halat hai. Range ke upar **Buy-side Liquidity** (sellers ke stops) aur neeche **Sell-side Liquidity** (buyers ke stops) jama hoti hai. Range ke beech (**Equilibrium**, 50%) mein trade karna sab se kharab jagah hai kyun ke wahan risk:reward bekaar hota hai. Professional trader range ke kinaron par sweep ka intezar karta hai, ya range se displacement ke saath breakout ka."
          },
          {
            h: 'Market state kaise pehchanein?',
            p: "Pehle higher timeframe (4H / Daily) par wazeh swing highs aur lows mark karo — har chhoti candle ko swing mat samjho. Phir khud se poocho: **kya aakhri do highs aur do lows oonche ho rahe hain, neeche ho rahe hain, ya barabar?** Market state hi tay karti hai ke aap kaun sa setup dhoondoge. Sab se aam galti yeh hai ke trader range mein trend wale setups lagata hai ya trend mein range wali reversal trades — aur phir strategy ko qusoorwar thehrata hai. Pehle state, phir setup."
          }
        ],
        keyPoints: [
          'Bullish = HH + HL → discount (HL) mein buy dhoondo.',
          'Bearish = LH + LL → premium (LH) mein sell dhoondo.',
          'Range = boundaries ke beech; Equilibrium par trade nahi, kinaron par liquidity.',
          'Pehle market state, phir setup — ulta kabhi nahi.'
        ],
        visual: [
          {
            title: 'Bullish (HH / HL)',
            candles: K(100, [[101.5], [102.8], [102.0], [101.4], [102.9], [104.3], [103.5], [102.8], [104.6], [106.0]]),
            annotations: [
              { type: 'path', points: [[0, 99.7], [1, 103.1], [3, 101.1], [5, 104.6], [7, 102.5], [9, 106.3]], color: 'bull' },
              { type: 'label', i: 0, at: 'low', text: 'L', color: 'bull' },
              { type: 'label', i: 1, at: 'high', text: 'H', color: 'bull' },
              { type: 'label', i: 3, at: 'low', text: 'HL', color: 'bull' },
              { type: 'label', i: 5, at: 'high', text: 'HH', color: 'bull' },
              { type: 'label', i: 7, at: 'low', text: 'HL', color: 'bull' },
              { type: 'label', i: 9, at: 'high', text: 'HH', color: 'bull' }
            ],
            caption: 'Har high pichle se ooncha, har low pichle se ooncha — **buyers control mein hain**.',
            task: {
              prompt: 'Is bullish trend ka **sab se taaza HL** (Higher Low) click karo.',
              answer: [7],
              explain: 'Candle #8 ka low (102.5) pichle HL (101.1) se ooncha hai — buyers pehle se oonchi price par khareed rahe hain. Yahi discount entry ka ilaqa hai.',
              hint: 'Aakhri pullback ka sab se neecha point dhoondo.'
            }
          },
          {
            title: 'Bearish (LH / LL)',
            candles: K(106, [[104.5], [103.2], [104.0], [104.6], [103.1], [101.7], [102.5], [103.2], [101.4], [100.0]]),
            annotations: [
              { type: 'path', points: [[0, 106.3], [1, 102.9], [3, 104.9], [5, 101.4], [7, 103.5], [9, 99.7]], color: 'bear' },
              { type: 'label', i: 0, at: 'high', text: 'H', color: 'bear' },
              { type: 'label', i: 1, at: 'low', text: 'L', color: 'bear' },
              { type: 'label', i: 3, at: 'high', text: 'LH', color: 'bear' },
              { type: 'label', i: 5, at: 'low', text: 'LL', color: 'bear' },
              { type: 'label', i: 7, at: 'high', text: 'LH', color: 'bear' },
              { type: 'label', i: 9, at: 'low', text: 'LL', color: 'bear' }
            ],
            caption: 'Har rally pichle high se neeche ruk jati hai aur har girawat naya low banati hai — **sellers control mein hain**.',
            task: {
              prompt: 'Sab se taaza **LH** (Lower High) click karo — yahi premium sell area hai.',
              answer: [7],
              explain: 'Candle #8 ka high (103.5) pichle LH (104.9) se neeche hai — sellers har rally ko pehle se neeche bech rahe hain.',
              hint: 'Aakhri rally ka sab se ooncha point dhoondo.'
            }
          },
          {
            title: 'Range',
            candles: K(100, [[101.8], [102.6], [101.2], [99.8], [98.6], [99.9], [101.5], [102.5], [101.0], [99.4], [98.7], [100.3]]),
            annotations: [
              { type: 'hline', price: 102.9, i1: 0, color: 'liq', label: 'Range High — upar Buy-side Liquidity' },
              { type: 'hline', price: 98.3, i1: 0, color: 'liq', label: 'Range Low — neeche Sell-side Liquidity' },
              { type: 'hline', price: 100.6, i1: 0, color: 'muted', label: 'EQ 50% — no trade zone' }
            ],
            caption: 'Na HH/HL, na LH/LL — price do boundaries ke beech ghoom raha hai. Beech (EQ) mein trade nahi; kinaron par **sweep** ya bahar **displacement** ka intezar.'
          }
        ],
        exercise: {
          title: 'Teen charts, teen states',
          steps: [
            'Teen alag charts kholo (EURUSD 4H, BTCUSDT 4H, XAUUSD 1H) aur har ek ki market state likho: Bullish / Bearish / Range.',
            'Har chart par aakhri 2 swing highs aur 2 swing lows ko HH / HL / LH / LL label karo.',
            'Jo chart range mein hai us ki upper aur lower boundary aur **Equilibrium (50%)** line draw karo.',
            'Visualizer ke Bullish aur Bearish tabs ke tasks hal karo.'
          ],
          deliverable: 'Teeno charts ke screenshots par state ka naam aur swing labels likh kar save karo.'
        }
      },

      /* ---------------- Day 4 · 1.2 ---------------- */
      {
        id: 'p1-d4',
        day: 'Day 4',
        section: '1.2',
        title: 'Supply & Demand Zones vs Retail Support/Resistance',
        concepts: ['Support / Resistance', 'Demand Zone', 'Supply Zone', 'Fresh vs Mitigated', 'Unfilled Orders'],
        notes: [
          {
            h: 'Retail S/R line ki kamzori',
            p: "Retail books sikhati hain ke jahan price 2-3 baar ruka wahan ek horizontal line kheencho — yeh **Support ya Resistance** hai. Masla yeh hai ke yeh line har kisi ko nazar aati hai, aur har koi wahi karta hai: support par buy aur us ke thora neeche stop loss. Nateeja yeh ke us line ke neeche stop losses ka ek bara dher ban jata hai — yani **liquidity**. Jitni zyada baar level 'respect' hota hai, utni zyada wahan liquidity jama hoti hai aur utna hi woh sweep hone ke qareeb hota hai. Static line yeh nahi batati ke asli orders kahan hain."
          },
          {
            h: 'Demand Zone: displacement ka origin',
            p: "Supply aur Demand zones ek line nahi balki ek **ilaqa (zone)** hain — woh jagah jahan se price ne displacement ke saath taaqatwar move shuru kiya. **Demand Zone** aam taur par us aakhri base (ek ya chand chhoti candles) ka area hota hai jis ke foran baad bari bullish displacement aayi. Logic yeh hai ke itni tez move ka matlab hai ke wahan bare buy orders the, aur shayad sab fill nahi hue (**unfilled orders**). Jab price wapas us zone mein aata hai to woh baqi orders phir se activate ho sakte hain."
          },
          {
            h: 'Supply Zone aur zone ki quality',
            p: "**Supply Zone** isi ka ulta hai: woh base jahan se bari bearish displacement shuru hui. Zone ki quality yun parkho: (1) **Fresh** hai ya pehle test (**mitigate**) ho chuka — fresh zone zyada taaqatwar hai; (2) us se nikalne wali move kitni zordar thi aur kya structure toota; (3) kya zone ke saamne liquidity hai jo pehle sweep ho sake. Har zone kaam nahi karta — zone ek **area of interest** hai jahan aap confirmation (jaise lower timeframe CHoCH) dhoondte ho, andha limit order lagane ki jagah nahi."
          },
          {
            h: 'Asal farq: soch ka',
            p: "Retail S/R poochta hai **'price kahan ruka tha?'**, jabke Supply & Demand poochta hai **'bare orders kahan se aaye the aur liquidity kahan pari hai?'**. Neeche chart mein dekho: retail traders ne teen touches wali support line par buy kiya. Price ne line tori, sab ke stops hit hue, aur phir wohi price neeche wale Demand Zone (displacement ka origin) se zor se upar gaya. Jo line par buy kar raha tha woh nuqsaan mein nikla, jabke jo zone ka intezar kar raha tha usay behtareen entry mili."
          }
        ],
        keyPoints: [
          'Retail S/R line = sab ko nazar aati hai = us ke peeche stops = **liquidity**.',
          'Demand/Supply zone = bari displacement se pehle ka aakhri base area.',
          'Fresh zone > mitigated zone. Zone = area of interest, andhi entry nahi.',
          'Sawal badlo: "kahan ruka?" nahi, "orders kahan hain?"'
        ],
        visual: {
          title: 'Retail support toota, Demand Zone ne pakda',
          candles: K(96, [[96.4], [96.1], [99.4, 0.2, 0.1], [101.2], [100.3], [99.8], [100.9], [100.0, 0.3, 0.4], [101.0], [99.9, 0.3, 0.35], [98.4], [97.0, 0.3, 0.4], [98.8], [100.6], [102.0]]),
          annotations: [
            { type: 'zone', from: 95.7, to: 96.7, i1: 0, color: 'bull', label: 'Demand Zone (displacement origin)' },
            { type: 'label', i: 2, at: 'high', text: 'Displacement', color: 'bull' },
            { type: 'hline', price: 99.55, i1: 4, color: 'bear', label: 'Retail Support (3 touches)' },
            { type: 'label', i: 11, at: 'low', text: 'Zone tap ✓', color: 'bull' }
          ],
          caption: 'Retail traders ne 99.55 ki "mazboot" support par teen baar buy kiya. Candle #11 ne line tori aur un ke stops hit hue. Asal orders neeche **Demand Zone** mein the — candle #12 ne zone tap kiya aur price 102 tak gaya.',
          task: {
            prompt: 'Woh candle click karo jis ne **Demand Zone** ko tap kiya.',
            answer: [11],
            explain: 'Candle #12 ki wick zone (95.7–96.7) mein gayi. Retail support pehle hi toot chuka tha, magar asal institutional orders neeche zone mein the — yahan se price 102 tak gaya.',
            hint: 'Green zone ke andar jaane wali wick dhoondo.'
          }
        },
        exercise: {
          title: 'Line vs Zone comparison',
          steps: [
            'EURUSD ke **1H** chart par woh "support" line kheencho jise 3 baar touch kiya gaya ho.',
            'Usi chart par pichle displacement moves ka origin (aakhri base candles) dhoond kar Demand / Supply zones ke rectangles banao.',
            'Har zone ke saath likho: Fresh ya Mitigated? Displacement kitni strong thi? Kya structure toota?',
            'Dekho ke pichle 2 hafton mein price ne kitni baar retail line ko sweep karke zone se reaction diya.'
          ],
          deliverable: '3 zones aur 1 retail line ka screenshot, har zone par quality ka score (1-3) likh kar.'
        }
      },

      /* ---------------- Day 5 · 1.3 ---------------- */
      {
        id: 'p1-d5',
        day: 'Day 5',
        section: '1.3',
        title: 'BOS vs CHoCH aur Candle Body Close Rule',
        concepts: ['BOS', 'CHoCH', 'Body Close Rule', 'Liquidity Sweep', 'Continuation', 'Reversal'],
        notes: [
          {
            h: 'BOS — Break of Structure',
            p: "**Break of Structure (BOS)** trend ke rukh mein structure tootna hai — yani **continuation**. Bullish trend mein jab price pichla HH body close se upar tor de to woh bullish BOS hai; bearish trend mein jab pichla LL body close se neeche toote to bearish BOS. BOS batata hai ke trend abhi zinda hai aur institutional order flow usi taraf chal raha hai. BOS ke baad hum aam taur par pullback ka intezar karte hain taake discount (bullish) ya premium (bearish) mein entry mile — tootte hi chase nahi karte."
          },
          {
            h: 'CHoCH — Change of Character',
            p: "**Change of Character (CHoCH)** trend ke khilaf pehla structure break hai — **reversal ki pehli nishani**. Bullish trend mein jab price woh aakhri HL (jis ne pichla HH banaya tha) body close se neeche tor de to yeh bearish CHoCH hai. Bearish trend mein aakhri LH ka body close se upar tootna bullish CHoCH hai. CHoCH ka matlab foran poora reversal nahi; yeh warning hai ke character badal raha hai. Sab se taaqatwar CHoCH woh hai jo kisi **liquidity sweep ke baad displacement** ke saath aaye."
          },
          {
            h: 'Sakht usool: Candle Body Close Rule',
            p: "Is course ka sakht usool: **structure tab hi toota maana jayega jab candle ki BODY level ke paar close kare.** Agar sirf wick level ke paar gayi aur body wapas andar close hui, to yeh break nahi balki **Liquidity Sweep** hai — price ne stops liye aur wapas aa gaya. Retail traders wick break par breakout trade le lete hain aur phans jate hain. Body close rule aap ko in fake breakouts se bachata hai. Hamesha candle close hone ka intezar karo; chalti candle (jo abhi bani nahi) par faisla mat karo."
          },
          {
            h: 'Timeframe aur practical tareeqa',
            p: "Body close ka faisla **usi timeframe** par hota hai jis par aap structure padh rahe ho — 15m structure ke liye 15m candle close, 4H ke liye 4H close. Practical tareeqa: pichla swing high/low mark karo, horizontal line kheencho, aur candle close ka intezar karo. Close paar hua? Trend ke rukh mein ho to **BOS**, khilaf ho to **CHoCH**. Close andar raha? Isay **Sweep** likho aur dekho ke kya opposite side se displacement aata hai. Visualizer ke teeno tabs mein yahi farq hai — har tab mein Replay chala kar step by step dekho."
          }
        ],
        keyPoints: [
          '**BOS** = trend ke rukh mein break (continuation).',
          '**CHoCH** = trend ke khilaf pehla break (reversal warning).',
          '**Body close** paar = valid break · sirf wick paar = Liquidity Sweep.',
          'Faisla hamesha candle close hone ke baad, usi timeframe par.'
        ],
        visual: [
          {
            title: 'BOS (continuation)',
            candles: K(100, [[101.5], [102.8], [102.0], [101.4], [102.9], [104.3], [103.5], [102.8], [104.0], [105.2]]),
            annotations: [
              { type: 'label', i: 3, at: 'low', text: 'HL', color: 'bull' },
              { type: 'label', i: 4, at: 'high', text: 'Sirf wick — BOS nahi', color: 'liq' },
              { type: 'line', from: [1, 103.1], to: [5, 103.1], color: 'bull', label: 'BOS ✓', labelPos: 'below', dash: true },
              { type: 'label', i: 7, at: 'low', text: 'HL', color: 'bull' },
              { type: 'line', from: [5, 104.6], to: [9, 104.6], color: 'bull', label: 'BOS ✓', dash: true }
            ],
            caption: 'Candle #5 ki wick 103.1 ke upar gayi magar body neeche close hui — **valid nahi**. Candle #6 ki body upar close hui — **BOS confirm**. Trend continuation.',
            task: {
              prompt: 'Pehla **valid BOS** kis candle ne confirm kiya? (Yaad rakho: body close!)',
              answer: [5],
              explain: 'Candle #6 ki body 103.1 ke upar close hui — yeh valid BOS hai. Candle #5 ki sirf wick upar gayi thi, body neeche close hui, is liye woh BOS nahi tha.',
              hint: 'Candle #5 ki wick ne level touch kiya, magar body kahan close hui? Agli candle dekho.'
            }
          },
          {
            title: 'CHoCH (reversal warning)',
            candles: K(100, [[101.6], [103.0], [102.2], [101.6], [103.2], [104.6], [103.8], [102.9], [104.0], [104.5], [103.4], [102.0], [101.4], [102.1]]),
            annotations: [
              { type: 'path', points: [[0, 99.7], [1, 103.3], [3, 101.3], [5, 104.9], [7, 102.6], [9, 104.8], [11, 101.7]], color: 'muted' },
              { type: 'label', i: 3, at: 'low', text: 'HL', color: 'bull' },
              { type: 'label', i: 5, at: 'high', text: 'HH', color: 'bull' },
              { type: 'label', i: 7, at: 'low', text: 'Last HL', color: 'liq' },
              { type: 'label', i: 9, at: 'high', text: 'LH (fail)', color: 'bear' },
              { type: 'line', from: [7, 102.6], to: [11, 102.6], color: 'bear', label: 'CHoCH ✓', labelPos: 'below', dash: true }
            ],
            caption: 'Uptrend mein price naya HH nahi bana saka (**LH**), phir aakhri HL (102.6) ke neeche **body close** hua — yeh bearish **CHoCH** hai.',
            task: {
              prompt: 'Woh candle click karo jis ki **body close** ne CHoCH confirm kiya.',
              answer: [11],
              explain: 'Candle #12 ki body 102.6 (aakhri HL) ke neeche close hui — bullish trend mein pehla structure break: CHoCH. Dhyan do: pehle LH (#10) bana tha, yani buyers kamzor ho rahe the.',
              hint: 'Aakhri HL (102.6) ke neeche body close karne wali pehli candle dhoondo.'
            }
          },
          {
            title: 'Wick vs Body',
            candles: K(104, [[103.4], [102.8], [102.4], [103.0], [102.6], [102.5, 0.3, 1.0], [103.5], [104.2], [103.6], [102.6], [101.4], [100.8]]),
            annotations: [
              { type: 'hline', price: 102.1, i1: 2, color: 'liq', label: 'Key Low 102.1' },
              { type: 'label', i: 5, at: 'low', text: 'Wick neeche, body upar = Sweep', color: 'liq' },
              { type: 'label', i: 10, at: 'low', text: 'Body close neeche = Valid break', color: 'bear' }
            ],
            caption: 'Candle #6 ne level ke neeche **sirf wick** maari — stops liye aur wapas aa gaya (Sweep). Candle #11 ki **body** level ke neeche close hui — yeh asli break hai.',
            task: {
              prompt: 'Woh candle click karo jis ne 102.1 level ko **VALID** tareeqe se tora.',
              answer: [10],
              explain: 'Candle #11 ki body 101.4 par close hui — level ke saaf neeche. Candle #6 ki sirf wick neeche gayi thi aur body wapas upar close hui; woh Liquidity Sweep tha, break nahi.',
              hint: 'Wick kaafi nahi — body kahan close hui?'
            }
          }
        ],
        exercise: {
          title: 'BOS / CHoCH / Sweep labeling',
          steps: [
            'GBPUSD **15m** chart par pichle 3 din ke 3 BOS aur 1 CHoCH mark karo — har ek par label lagao.',
            'Har break ke liye check karo: body close paar thi ya sirf wick? Wick wale cases ko **"Sweep"** likho.',
            'Har CHoCH se pehle dekho ke kya koi liquidity sweep hua tha.',
            'Visualizer ke teeno tabs ke tasks hal karo.'
          ],
          deliverable: 'Ek list banao: har break ka time, type (BOS / CHoCH / Sweep) aur body close haan/nahi.'
        }
      },

      /* ---------------- Day 6 · 1.3 ---------------- */
      {
        id: 'p1-d6',
        day: 'Day 6',
        section: '1.3',
        title: 'Swing Structure vs Internal Structure',
        concepts: ['Swing Structure', 'Internal Structure', 'Internal CHoCH', 'Top-down Analysis', 'Fractal'],
        notes: [
          {
            h: 'Market fractal hai',
            p: "Market fractal hai — har bare move ke andar chhote moves hote hain. **Swing Structure** woh bara dhancha hai jo wazeh, bare swing highs aur lows se banta hai (jo aksar higher timeframe par bhi nazar aate hain). **Internal Structure** woh chhote highs aur lows hain jo ek swing leg ke andar, khaas taur par pullback ke dauran, bante hain. Agar aap dono ko mila doge to har chhoti wiggle aap ko 'reversal' lagegi aur aap trend ke khilaf trades lete rahoge. Pehla qadam: dono ko alag alag dekhna seekho."
          },
          {
            h: 'Pullback ke andar bearish internal structure',
            p: "Socho price ne 100 se 110 tak ek bara bullish swing banaya. Ab pullback mein 110 se 105 tak price chhote LH aur LL banata hai — yeh **internal bearish structure** hai. Naya trader yahan sell karta hai, lekin **swing structure abhi bhi bullish hai** kyun ke swing low (100) toota hi nahi. Yeh pullback asal mein bare players ke liye discount mein khareedne ka mauqa ho sakta hai. Internal structure ka bearish hona swing reversal nahi, sirf pullback ki shakal hai."
          },
          {
            h: 'Internal CHoCH = timing',
            p: "Asal khoobsurati yahan hai: jab pullback ke andar internal structure wapas bullish ho jaye — yani aakhri internal LH body close se toot jaye (**Internal CHoCH**) — aur yeh kisi Demand Zone ya discount area mein ho, to swing aur internal dono ek hi taraf ho jate hain. Yeh high-probability entry ka signal hai: **swing structure direction deta hai, internal structure timing deta hai.** Stop loss aksar internal low (naye swing HL) ke neeche aur target pichla swing high ya us ke upar ki liquidity hota hai."
          },
          {
            h: 'Saaf usool',
            p: "Yeh usool yaad rakho: (1) **Bias hamesha swing structure se lo.** (2) Internal structure sirf entry refine karne ke liye hai. (3) Internal CHoCH agar swing ke khilaf ho to us par trade nahi — sirf alert raho. (4) Swing CHoCH tab hi maano jab swing level (jaise is misaal mein naya Swing HL) body close se toote. Top-down approach yahi hai: **4H swing, 15m internal.** Neeche chart mein iLH / iLL labels internal structure dikhate hain aur Swing labels bara dhancha."
          }
        ],
        keyPoints: [
          'Swing = bara dhancha (direction) · Internal = andar ki wiggles (timing).',
          'Pullback mein internal bearish ≠ swing reversal.',
          'Swing ke rukh mein Internal CHoCH = high-probability entry area.',
          'Top-down: 4H swing bias → 15m internal entry.'
        ],
        visual: {
          title: 'Bullish swing ke andar internal pullback',
          height: 340,
          candles: K(100, [[101.8], [103.5], [105.6], [107.8], [109.6, 0.4, 0.3], [108.4], [108.9], [107.2], [106.0], [106.9], [105.6, 0.3, 0.4], [106.6], [107.6], [108.8], [110.6], [111.4]]),
          annotations: [
            { type: 'path', points: [[0, 99.7], [4, 110.0], [10, 105.2], [15, 111.7]], color: 'info' },
            { type: 'label', i: 0, at: 'low', text: 'Swing Low', color: 'info' },
            { type: 'label', i: 4, at: 'high', text: 'Swing High', color: 'info' },
            { type: 'label', i: 6, at: 'high', text: 'iLH', color: 'bear' },
            { type: 'label', i: 8, at: 'low', text: 'iLL', color: 'bear' },
            { type: 'label', i: 9, at: 'high', text: 'iLH', color: 'bear' },
            { type: 'label', i: 10, at: 'low', text: 'Swing HL', color: 'bull' },
            { type: 'line', from: [9, 107.2], to: [12, 107.2], color: 'bull', label: 'Internal CHoCH ↑', labelPos: 'below', dash: true },
            { type: 'line', from: [4, 110.0], to: [14, 110.0], color: 'info', label: 'Swing BOS ✓', dash: true }
          ],
          caption: 'Pullback (#6–#11) mein internal structure bearish tha (iLH / iLL), lekin swing bullish raha. Candle #13 ne aakhri iLH (107.2) ke upar body close kiya — **Internal CHoCH** — aur phir #15 ne Swing High tor kar **Swing BOS** diya.',
          task: {
            prompt: 'Pullback ke andar **Internal CHoCH** (bullish) confirm karne wali candle click karo.',
            answer: [12],
            explain: 'Candle #13 ki body aakhri internal LH (107.2) ke upar close hui. Swing pehle se bullish tha, ab internal bhi bullish ho gaya — dono align = high-probability entry area.',
            hint: 'Pullback ke aakhri iLH (107.2) ke upar body close dhoondo.'
          }
        },
        exercise: {
          title: 'Top-down: Swing 4H, Internal 15m',
          steps: [
            'BTCUSDT **4H** par aakhri bara bullish ya bearish swing leg mark karo (Swing High aur Swing Low).',
            'Usi leg ke pullback ko **15m** par kholo aur internal LH / LL (ya HH / HL) label karo.',
            'Pullback ke end par woh **Internal CHoCH** dhoondo jo swing direction mein ho.',
            'Visualizer mein Internal CHoCH confirm karne wali candle par click karo.'
          ],
          deliverable: 'Do screenshots (4H swing + 15m internal) aur ek line: "Swing bias ___, internal CHoCH ___ par".'
        }
      },

      /* ---------------- Day 7 · 1.4 ---------------- */
      {
        id: 'p1-d7',
        day: 'Day 7',
        section: '1.4',
        title: 'The 5 Retail Traps',
        concepts: ['Static Line Bounce', 'Lagging Indicators', 'Arbitrary Stop Loss', 'Equal-Low Double Bottom', 'Predictive Bias'],
        notes: [
          {
            h: 'Trap 1: Static Line Bounces',
            p: "Retail trader sochta hai ke jo line 3 baar chali woh chouthi baar bhi chalegi. Lekin har touch ke saath line ke peeche stops ka dher bara hota jata hai aur line **kamzor** hoti hai, mazboot nahi. Institutions ke liye yeh tayyar liquidity hai. Chart ke 'Static Line' tab mein dekho: teesri baar resistance par sell karne walon ke stop losses (jo buy orders hain) hi us displacement ka fuel bane jis ne line tor di. **Hal:** line ko liquidity samjho, aur us ke sweep ya displacement break ka intezar karo — andha bounce trade nahi."
          },
          {
            h: 'Trap 2: Lagging Indicators',
            p: "RSI, MACD aur moving average crossovers par andha bharosa doosra trap hai. Yeh sab price se hi calculate hote hain, is liye hamesha price ke **peeche** hote hain (lagging). Jab tak MACD cross deta hai, move ka bara hissa nikal chuka hota hai, aur 'overbought' RSI ke saath trend hafton chal sakta hai. Indicators haram nahi, lekin unhein faisla karne wala mat banao. **Price, structure aur liquidity leading information hain**; indicator zyada se zyada ek secondary confirmation hai."
          },
          {
            h: 'Trap 3: Arbitrary Stop Losses',
            p: "Be-wajah stop loss, jaise 'har trade mein 20 pips stop' ya bilkul obvious low ke 2 pips neeche — teesra trap hai. Fixed pip stop market structure ko nahi dekhta, aur obvious jagah wala stop wahi jagah hai jahan sab ke stops hain. **Stop loss us jagah hona chahiye jahan aap ka trade idea ghalat sabit ho** — jaise us swing low ke neeche jis ka tootna structure badal de, aur jo sweep hone wale ilaqe se bahar ho. Pehle stop ki logical jagah, phir lot size; kabhi ulta nahi."
          },
          {
            h: 'Trap 4: Equal-Low Double Bottom',
            p: "Retail ke liye do barabar lows 'mazboot double bottom' hain, aur sab un ke neeche stop laga kar buy karte hain. Institutional nazar se **equal lows = Sell-side Liquidity** — ek saaf nishana. Price aksar in lows ke thora neeche wick se sweep karta hai, stops hit karta hai, aur phir asli move deta hai. Agar sweep ke baad displacement aur bullish CHoCH aaye to woh asal buy setup hai; double bottom par pehle se buy karna trap hai. Equal highs par yahi kahani ulti chalti hai."
          },
          {
            h: 'Trap 5: Predictive Bias',
            p: "Sab se khatarnak trap: market ke confirm karne se pehle hi tay kar lena ke 'aaj to upar hi jayega'. Aisa trader har bullish candle ko saboot aur har bearish candle ko 'bas pullback hai' samajhta hai, aur loss mein position pakre rehta hai. Professional trader predict nahi karta, **react** karta hai: 'Agar price yeh liquidity le aur body close se structure tode, tab main entry dhoondunga.' **If-Then plan banao, opinion nahi.** Market ko aap ki raye se koi gharaz nahi."
          }
        ],
        keyPoints: [
          'Har touch line ko kamzor karta hai — line ke peeche liquidity hai.',
          'Indicators lagging hain; price + structure + liquidity leading hain.',
          'Stop wahan jahan idea ghalat sabit ho, fixed pips par nahi.',
          'Equal lows/highs = liquidity target, support/resistance nahi.',
          'Predict nahi, React: If-Then plan.'
        ],
        visual: [
          {
            title: 'Double Bottom Trap',
            candles: K(104, [[103.0], [101.8], [100.6, 0.3, 0.5], [101.6], [102.4], [101.3], [100.5, 0.3, 0.4], [101.2], [100.8], [100.6, 0.3, 1.3], [102.4, 0.2, 0.2], [103.6], [104.4]]),
            annotations: [
              { type: 'hline', price: 100.1, i1: 2, color: 'liq', label: 'Equal Lows = Sell-side Liquidity' },
              { type: 'label', i: 7, at: 'high', text: 'Retail: Double Bottom, BUY!', color: 'muted' },
              { type: 'label', i: 9, at: 'low', text: 'Stop hunt (Sweep)', color: 'bear' },
              { type: 'label', i: 10, at: 'high', text: 'Asli move ↑', color: 'bull' }
            ],
            caption: 'Retail ne do barabar lows dekh kar buy kiya aur stop neeche rakha. Candle #10 ne un stops ko **sweep** kiya, phir **displacement** ke saath asli move aaya.',
            task: {
              prompt: 'Woh candle click karo jis ne equal lows ke neeche **retail stops hunt** kiye.',
              answer: [9],
              explain: 'Candle #10 ne equal lows (100.1) ke neeche wick maari, retail buyers ke stop losses hit kiye, aur body wapas upar close hui. Iske baad displacement aayi — yeh asal institutional entry thi.',
              hint: 'Equal lows ke neeche jaane wali lambi wick dhoondo.'
            }
          },
          {
            title: 'Static Line Bounce Trap',
            candles: K(100, [[101.5], [102.6, 0.3, 0.3], [101.6], [100.9], [102.2], [102.5, 0.4, 0.3], [101.7], [102.0], [102.6, 0.3, 0.3], [104.4, 0.2, 0.1], [105.3], [104.9]]),
            annotations: [
              { type: 'hline', price: 102.9, i1: 1, color: 'bear', label: 'Static Resistance (3 touches)' },
              { type: 'label', i: 8, at: 'high', text: 'Retail: teesri baar SELL', color: 'muted' },
              { type: 'label', i: 9, at: 'high', text: 'Sellers ke stops = fuel', color: 'bull' }
            ],
            caption: 'Har touch par retail ne sell kiya aur stop line ke thora upar rakha. Teesre touch ke baad candle #10 ne **displacement** ke saath line tor di — un sab stops ne move ko fuel diya.',
            task: {
              prompt: 'Woh candle click karo jis ne resistance ke peeche jama stops ko fuel bana kar **line tor di**.',
              answer: [9],
              explain: 'Candle #10: bari displacement body ke saath line ke upar body close. Teesri baar sell karne walon ke stop losses (buy orders) is move ka fuel bane.',
              hint: 'Line ke upar body close karne wali pehli bari candle.'
            }
          }
        ],
        exercise: {
          title: 'Apni trading ka trap audit',
          steps: [
            'Apni pichli 10 trades (demo ya real) dekho aur har ek par likho ke 5 mein se koi trap tha ya nahi.',
            'Kisi bhi chart par 3 equal-lows ya equal-highs dhoondo aur dekho ke kitni baar woh sweep hue.',
            'Apne liye ek **If-Then plan** likho: "Agar ___ liquidity sweep ho aur ___ par body close CHoCH aaye, tab main ___ par entry dhoondunga, stop ___ par."',
            'Visualizer ke dono tabs ke tasks hal karo.'
          ],
          deliverable: 'Trap audit table (trade # / trap ka naam / sabaq) aur apna If-Then plan.'
        }
      }
    ],

    /* ---------------- MILESTONE GATE 1 ---------------- */
    gate: {
      id: 'gate1',
      title: 'Milestone Gate 1',
      passPct: 90,
      questions: [
        {
          q: 'Bullish trend mein **CHoCH** kab confirm hota hai?',
          options: [
            'Jab price naya HH banaye',
            'Jab aakhri HL ke neeche candle ki BODY close ho',
            'Jab RSI 70 se upar chala jaye',
            'Jab wick aakhri HL ke neeche jaye magar body upar close ho'
          ],
          answer: 1,
          explain: 'CHoCH = trend ke khilaf pehla structure break, aur break sirf body close se valid hai. Sirf wick neeche jana Liquidity Sweep hai.'
        },
        {
          q: 'Ek candle ki wick pichle swing high ke upar gayi lekin body neeche close hui. Yeh kya hai?',
          options: ['Bullish BOS', 'Liquidity Sweep', 'Bullish CHoCH', 'Displacement'],
          answer: 1,
          explain: 'Body Close Rule: sirf wick paar gayi to break nahi — price ne upar ke stops (buy-side liquidity) liye aur wapas aa gaya.'
        },
        {
          q: 'Institutional nazar se **equal lows** ke neeche kya hota hai?',
          options: ['Mazboot support', 'Sell-side Liquidity (buyers ke stop losses)', 'Supply Zone', 'Kuch khaas nahi'],
          answer: 1,
          explain: 'Equal lows ke neeche retail buyers ke stops jama hote hain — yeh sell orders institutions ko bari buy positions bharne ke liye liquidity dete hain.'
        },
        {
          q: '**Displacement** candle ki sahi pehchan kya hai?',
          options: [
            'Lambi wicks aur chhoti body',
            'Bari body (range ka ~70%+), chhoti wicks, close extreme ke qareeb',
            'Doji jis ka open aur close barabar ho',
            'Har green candle'
          ],
          answer: 1,
          explain: 'Displacement aggressive one-sided order flow dikhata hai: bari body, chhoti wicks, aur aksar peeche FVG chhorta hai.'
        },
        {
          q: '**Institutional Slippage** kyun hoti hai?',
          options: [
            'Broker jaan boojh kar dhoka deta hai',
            'Bara order ek price par itni opposite liquidity nahi paata, is liye price us ke khilaf chalta hai',
            'Kyun ke spread zero hota hai',
            'Kyun ke indicators lag karte hain'
          ],
          answer: 1,
          explain: 'Ek price par limited orders hote hain. Bara order poora bharne ke liye price ko kai levels se guzarna parta hai — average fill kharab hota hai.'
        },
        {
          q: 'EURUSD abhi 1.0850 par hai. Aap 1.0820 par khareedna chahte ho. Kaun sa order lagaoge?',
          options: ['Buy Stop', 'Buy Limit', 'Sell Limit', 'Market Buy'],
          answer: 1,
          explain: 'Current price se NEECHE behtar price par buy = Buy Limit. Buy Stop current price se upar lagta hai.'
        },
        {
          q: 'Bearish trend mein **BOS** ka kya matlab hai?',
          options: [
            'Pichla LL body close se neeche toot gaya — trend continuation',
            'Aakhri LH body close se upar toot gaya',
            'Market range mein chala gaya',
            'Reversal pakka ho gaya'
          ],
          answer: 0,
          explain: 'BOS trend ke rukh mein break hai. Bearish mein naya LL body close se = continuation. Aakhri LH ka upar tootna CHoCH hota.'
        },
        {
          q: 'Pullback ke andar internal LH aur LL ban rahe hain, magar swing low nahi toota. Swing bias kya hai?',
          options: ['Bearish — foran sell karo', 'Bullish — yeh sirf pullback hai', 'Range', 'Koi bias nahi'],
          answer: 1,
          explain: 'Bias swing structure se aata hai. Internal bearish structure sirf pullback ki shakal hai; swing low tootne tak swing bullish hai.'
        },
        {
          q: '**Demand Zone** ki behtar definition kaun si hai?',
          options: [
            'Jahan price teen baar ruka ho',
            'Bari bullish displacement se pehle ka aakhri base area',
            'Har round number (jaise 1.1000)',
            '200 moving average'
          ],
          answer: 1,
          explain: 'Demand zone displacement ka origin hai — wahan bare buy orders the, aur shayad kuch unfilled bhi hain.'
        },
        {
          q: '**Predictive Bias** trap se bachne ka sab se behtar tareeqa?',
          options: [
            'Chart par zyada indicators lagao',
            'If-Then plan: pehle se predict nahi, confirmation (sweep + body close) par react karo',
            'Bari lot lo taake conviction dikhe',
            'Har din kam az kam ek trade zaroor lo'
          ],
          answer: 1,
          explain: 'Professional trader react karta hai. "Agar X ho to Y" plan aap ko raye se shaadi karne se bachata hai.'
        }
      ]
    }
  });
})();
