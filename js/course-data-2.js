

/* =====================================================================
   course-data-2.js — Course content PART 2
   PHASE 2 (Week 2: Liquidity & Institutional Footprints)
   PHASE 3 (Week 3: Multi-Timeframe & Entry/Exit)
   PHASE 4 (Week 4: Risk Math & Psychology)
   + GATE LAB module (practical gate requirements)
   ---------------------------------------------------------------------
   course.js aur course-data-1.js ke BAAD load hona chahiye.
   Candle row = [close, upperWick, lowerWick]; har candle pichle close par
   open hoti hai. Tooltip mein candle number = index + 1.

   PRACTICAL GATES (course.js ka quiz-gate is file se guard hota hai):
     gate2: Store "setups"   -> kam az kam 20 VALID setups
            setup = { id, ts, date, symbol, tf, dir:'long'|'short',
                      sweep, choch, fvg, ob, pd (booleans), note }
            valid = sweep && choch && (fvg || ob)
     gate3: Store "backtest" -> kam az kam 50 trades, Expectancy >= +0.35R
            trade = { r: Number }  (R-multiple, partial exits ka weighted total)
     gate4: Store "demo"     -> kam az kam 20 trades, Rule Compliance >= 90%
            trade = { rules: { <DEMO_RULES key>: true|false } }
                    (ya { compliance: 0-100 } ya { compliant: true|false })
   Store value array ho sakti hai ya { trades: [...] }.
   Jab tak practical poora na ho, #/course/gate/<id> -> #/gatelab/<id>.
   Doosre modules ke liye: window.GateLab.{ DEMO_RULES, requirement(gid), isValidSetup }
   ===================================================================== */
(function () {
  'use strict';
  const K = window.CourseEngine.candles; // candle builder

  /* =================================================================
     PHASE 2 — WEEK 2: Liquidity & Institutional Footprints
     ================================================================= */
  window.COURSE.push({
    id: 'phase2',
    order: 2,
    label: 'PHASE 2 · WEEK 2',
    title: 'Liquidity & Institutional Footprints',
    subtitle: 'Stops kahan jama hain, institutions apne orders kahan chhorte hain (Order Block, Breaker, FVG), aur sasti vs mehngi price ka farq (Premium / Discount).',
    lessons: [
      /* ---------------- Day 8 · 2.1 ---------------- */
      {
        id: 'p2-d8',
        day: 'Day 8',
        section: '2.1',
        title: 'Buy-side aur Sell-side Liquidity (BSL / SSL)',
        concepts: ['Buy-side Liquidity (BSL)', 'Sell-side Liquidity (SSL)', 'Swing High', 'Swing Low', 'Equal Highs', 'Equal Lows', 'Liquidity Pool'],
        notes: [
          {
            h: 'Liquidity asal mein kya hai?',
            p: "Trading mein **Liquidity** ka matlab hai kisi price level par pare hue **orders ka dher**. Bara player jab khareedna chahta hai to use bohot saare sellers chahiyen, aur jab bechna chahta hai to bohot saare buyers. Yeh orders sab se zyada wahan milte hain jahan retail traders ne apne **Stop Loss** aur pending orders rakhe hote hain. Har stop loss asal mein ek market order hai jo trigger hone ka intezar kar raha hai. Is liye chart par obvious highs aur lows sirf lines nahi — yeh **liquidity pools** hain, yani institutions ke liye tayyar khana."
          },
          {
            h: 'BSL: Swing Highs aur Equal Highs ke upar',
            p: "**Buy-side Liquidity (BSL)** har swing high ke upar jama hoti hai. Wajah: jo log short (sell) hain unke Stop Loss high ke thora upar hote hain, aur short ka stop loss trigger hone par **buy order** banta hai. Saath hi breakout traders high ke upar **Buy Stop** lagate hain — woh bhi buy orders hain. Jab do ya zyada highs taqreeban ek hi level par hon (**Equal Highs**), to wahan stops ka dher aur bhi bara hota hai kyun ke har koi use 'mazboot resistance' samajhta hai. Bara seller isi BSL ko istemal karke apni bari sell position bharta hai."
          },
          {
            h: 'SSL: Swing Lows aur Equal Lows ke neeche',
            p: "**Sell-side Liquidity (SSL)** har swing low ke neeche hoti hai. Long (buy) walon ke Stop Loss low ke neeche hote hain, aur buy ka stop loss trigger hone par **sell order** banta hai. Breakdown traders bhi low ke neeche **Sell Stop** lagate hain. **Equal Lows** ya 'double bottom' ke neeche sab se moti SSL hoti hai. Jab institution ko bari quantity mein khareedna ho to use sellers chahiyen — aur SSL hit hone par bilkul yahi sell orders bazaar mein aate hain. Is liye price aksar obvious lows ke neeche wick maar kar upar palat jata hai."
          },
          {
            h: 'Draw on Liquidity: price kahan ja raha hai?',
            p: "Price hamesha kisi na kisi liquidity pool ki taraf chalta hai — isay **Draw on Liquidity** kehte hain. Chart kholte hi pehla sawal yeh hona chahiye: 'Sab se qareebi aur sab se saaf BSL kahan hai, aur SSL kahan hai?' Jo pool zyada obvious ho (equal highs/lows, purane daily/weekly highs/lows, session highs/lows) woh zyada mazboot magnet hota hai. Liquidity lene ke baad price aksar ya to palat jata hai (reversal) ya agle pool ki taraf chalta hai (continuation). **Pehle liquidity mark karo, phir setup dhoondo** — yeh is phase ka buniyadi usool hai."
          }
        ],
        keyPoints: [
          '**BSL** = highs ke upar (shorts ke stops + buy stops) → buy orders.',
          '**SSL** = lows ke neeche (longs ke stops + sell stops) → sell orders.',
          'Equal Highs / Equal Lows = sab se moti liquidity, support/resistance nahi.',
          'Price hamesha agle **liquidity pool** ki taraf chalta hai (Draw on Liquidity).',
          'Har chart par pehle BSL aur SSL mark karo, phir entry socho.'
        ],
        visual: {
          title: 'Range ke dono taraf liquidity pools',
          candles: K(101.5, [[102.6, 0.4, 0.3], [101.8], [100.6, 0.3, 0.4], [101.5], [102.7, 0.3, 0.3], [101.6, 0.2, 0.3], [100.7, 0.3, 0.5], [101.4],
            [100.8, 0.3, 1.2], [102.4, 0.2, 0.2], [103.5, 0.4, 0.2], [103.2]]),
          annotations: [
            { type: 'hline', price: 103.0, i1: 0, color: 'liq', label: 'BSL: Equal Highs (buy stops)' },
            { type: 'hline', price: 100.2, i1: 2, color: 'liq', label: 'SSL: Equal Lows (sell stops)' },
            { type: 'label', i: 8, at: 'low', text: 'SSL sweep', color: 'bear' },
            { type: 'label', i: 10, at: 'high', text: 'BSL taken', color: 'bull' }
          ],
          caption: 'Range ke upar **Equal Highs (103.0)** par BSL aur neeche **Equal Lows (100.2)** par SSL jama hai. Candle #9 ne pehle SSL saaf ki (longs ke stops hit), phir price ulta chal kar BSL tak gaya. Dono pools liquidity ke magnet the.',
          task: {
            prompt: 'Woh candle click karo jis ne **Sell-side Liquidity** (equal lows ke neeche ke stops) sweep ki.',
            answer: [8],
            explain: 'Candle #9 ki wick 99.6 tak gayi — equal lows (100.2) ke neeche jama longs ke stop losses hit hue, aur body wapas range ke andar close hui. Yeh classic SSL sweep hai.',
            hint: 'Amber "SSL" line ke neeche jaane wali lambi lower wick dhoondo.'
          }
        },
        exercise: {
          title: 'Liquidity map banao',
          steps: [
            'EURUSD ya BTCUSDT ka **4H** chart kholo aur pichle 2 hafte ke saare obvious swing highs aur swing lows mark karo.',
            'Jahan do ya zyada highs/lows taqreeban barabar hon, unhein **Equal Highs (BSL)** / **Equal Lows (SSL)** likh kar alag rang do.',
            'Pichle din ka high/low (PDH/PDL) aur pichle hafte ka high/low (PWH/PWL) bhi mark karo — yeh bhi bare liquidity pools hain.',
            'Dekho ke pichle 10 dinon mein kitne pools sweep hue aur sweep ke baad price ne kya kiya (reverse ya continue).',
            'Visualizer mein Replay chalao aur SSL sweep wali candle click karo.'
          ],
          deliverable: 'Ek screenshot jis par kam az kam 3 BSL aur 3 SSL pools label hon, aur ek line: "Agla Draw on Liquidity ___ hai kyun ke ___".'
        }
      },

      /* ---------------- Day 9 · 2.1 ---------------- */
      {
        id: 'p2-d9',
        day: 'Day 9',
        section: '2.1',
        title: 'Stop-Hunts aur Inducement',
        concepts: ['Stop Hunt', 'Liquidity Sweep', 'Rejection', 'Inducement (IDM)', 'Trap', 'Smart Money'],
        notes: [
          {
            h: 'Stop-Hunt kya hai?',
            p: "**Stop-Hunt** (ya Liquidity Sweep) woh move hai jis mein price kisi obvious high ya low ke paar jaata hai, wahan pare stop losses trigger karta hai, aur phir tezi se wapas aa jata hai. Retail ko lagta hai ke 'broker ne mera stop hunt kiya', lekin asal mein yeh liquidity ka khel hai: bare player ko apna order bharne ke liye opposite orders chahiye the, aur stops ne woh orders de diye. Sweep ki pehchan: **wick level ke paar, body wapas andar close**. Agar body bhi paar close ho jaye to woh sweep nahi balki asli break ho sakta hai."
          },
          {
            h: 'Sweep ke baad confirmation zaroori hai',
            p: "Har wick wala sweep reversal nahi hota. Professional trader sweep dekh kar foran entry nahi leta; woh **confirmation** ka intezar karta hai. Confirmation ka matlab: sweep ke baad ulti taraf **Displacement** (bari body wali tez candles) aaye aur woh short-term structure tor de (**CHoCH**). Sirf wick dekh kar trade karna adha kaam hai — aisa ho sakta hai ke price thora ruk kar phir usi taraf chala jaye. Formula yaad rakho: **Sweep + Displacement + CHoCH = setup ka dhancha**. Baqi sab (OB, FVG) entry ki jagah tay karte hain."
          },
          {
            h: 'Inducement (IDM): chhota jaal, bara nishana',
            p: "**Inducement** ek chhoti, obvious liquidity hai jo asli zone se **pehle** banti hai aur traders ko waqt se pehle entry par 'uksaati' hai. Misaal: bullish move ke baad pullback mein ek chhota internal low banta hai. Retail use 'support' samajh kar wahan buy karta hai aur stop us ke neeche rakhta hai. Price phir us chhote low ko sweep karta hai (retail ke stops = liquidity), aur us ke neeche pare **asli Order Block** tak jaa kar palat jata hai. Jo zone inducement ke **neeche** (bullish) ya **upar** (bearish) ho, woh zyada qabil-e-bharosa hota hai."
          },
          {
            h: 'Trap se kaise bachein?',
            p: "Pehla usool: agar aap ke zone se pehle koi obvious chhota high/low pada hai, to samjho ke price pehle use lega — is liye **aap ka zone inducement ke baad wala hona chahiye**. Doosra: kabhi bhi apna stop obvious equal lows/highs ke bilkul paas mat rakho, kyun ke wahi sab ka stop hai. Teesra: sweep hone ke baad turant market order mat maaro; displacement aur CHoCH ka intezar karo. Chautha: agar price ne inducement nahi liya aur seedha chala gaya, to use jaane do — **missed trade nuqsaan nahi hai**. Sabr hi smart money ki asal edge hai."
          }
        ],
        keyPoints: [
          'Sweep = **wick paar, body andar**. Body paar = asli break.',
          'Sweep akela kaafi nahi — **Displacement + CHoCH** se confirm karo.',
          '**Inducement** = asli zone se pehle ka chhota jaal (retail ki early entry).',
          'Behtar zone woh hai jo inducement ke **baad** aaye.',
          'Missed trade nuqsaan nahi; jaldbazi wali entry nuqsaan hai.'
        ],
        visual: [
          {
            title: 'Stop Hunt (Equal Highs)',
            candles: K(100, [[101.0], [101.8], [101.2], [102.2], [103.0, 0.3, 0.3], [102.3], [102.8], [103.1, 1.1, 0.2], [101.4, 0.2, 0.2], [100.5], [100.9]]),
            annotations: [
              { type: 'hline', price: 103.3, i1: 4, color: 'liq', label: 'Equal Highs = BSL' },
              { type: 'label', i: 7, at: 'high', text: 'Stop Hunt ↑ phir reject', color: 'bear' },
              { type: 'label', i: 8, at: 'low', text: 'Displacement ↓', color: 'bear' }
            ],
            caption: 'Candle #8 ne equal highs (103.3) ke upar wick maar kar shorts ke stops aur breakout buyers ke orders liye, lekin body neeche close hui. Agli candle ki **bearish displacement** ne confirm kiya ke yeh hunt tha, breakout nahi.',
            task: {
              prompt: 'Woh candle click karo jis ne equal highs ke upar **buy stops hunt** kiye.',
              answer: [7],
              explain: 'Candle #8 ki upper wick 104.2 tak gayi (BSL ke upar) aur body 103.1 par wapas neeche close hui — bechne wale bare player ko yahan buyers mil gaye.',
              hint: 'Equal highs ke upar jaane wali lambi upper wick dhoondo jis ki body neeche close hui.'
            }
          },
          {
            title: 'Inducement → Asli OB',
            candles: K(100, [[99.4, 0.3, 0.3], [101.4, 0.2, 0.2], [103.0, 0.2, 0.2], [102.4], [101.6], [102.3, 0.3, 0.3], [101.9], [100.8, 0.3, 0.3], [99.9, 0.3, 0.6], [101.5, 0.2, 0.2], [103.4, 0.2, 0.2], [104.2]]),
            annotations: [
              { type: 'zone', from: 99.1, to: 100.3, i1: 0, color: 'bull', label: 'Bullish OB (asli zone)' },
              { type: 'hline', price: 101.3, i1: 4, i2: 7, color: 'liq', label: 'Inducement' },
              { type: 'label', i: 7, at: 'low', text: 'IDM sweep', color: 'liq' },
              { type: 'label', i: 8, at: 'low', text: 'OB tap ✓', color: 'bull' }
            ],
            caption: 'Pullback mein 101.3 par chhota low (Inducement) bana. Retail ne wahan buy kiya. Candle #8 ne yeh low saaf kiya, phir price **asli Bullish OB** (99.1–100.3) tak aaya aur wahan se rally shuru hui.',
            task: {
              prompt: 'Woh candle click karo jis ne **Inducement** (101.3 wala chhota low) sweep kiya.',
              answer: [7],
              explain: 'Candle #8 ne 101.3 ke neeche wick maari — early buyers ke stops hit hue. Isi liquidity ke baad price asli OB tak pohncha.',
              hint: 'Amber "Inducement" line ke neeche pehli dafa jaane wali candle.'
            }
          }
        ],
        exercise: {
          title: 'Stop-hunt aur inducement journal',
          steps: [
            '15M chart par pichle 5 din mein **5 liquidity sweeps** dhoondo (wick paar, body andar).',
            'Har sweep ke baad check karo: kya 1-3 candles mein ulti **Displacement + CHoCH** aayi? Haan/Nahi likho.',
            'Kisi bhi trend mein ek pullback chuno aur us ke andar ka **Inducement** (chhota internal high/low) mark karo.',
            'Dekho ke price ne pehle inducement liya aur phir kahan palta (OB / FVG / demand).',
            'Visualizer ke dono tabs ke tasks hal karo.'
          ],
          deliverable: 'Table: Sweep # / level / confirmation (Haan-Nahi) / nateeja. Kam az kam 5 rows.'
        }
      },

      /* ---------------- Day 10 · 2.2 ---------------- */
      {
        id: 'p2-d10',
        day: 'Day 10',
        section: '2.2',
        title: 'Bullish aur Bearish Order Blocks',
        concepts: ['Order Block', 'Bullish OB', 'Bearish OB', 'Mitigation', 'Mean Threshold', 'Displacement'],
        notes: [
          {
            h: 'Order Block kya hai?',
            p: "**Order Block (OB)** woh aakhri ulti candle hai jo ek tez **Displacement** move se bilkul pehle bani ho. Institution apna bara order ek dafa mein nahi bhar sakta, is liye woh kuch orders us candle ke ilaqe mein bharta hai aur baqi orders wahan pending reh jate hain. Jab price baad mein wapas us zone par aata hai to bache hue orders phir se active hote hain aur price ko dhakka milta hai. Is liye OB ko 'institutional footprint' kehte hain — bare player ke qadmon ka nishan."
          },
          {
            h: 'Bullish OB aur Bearish OB',
            p: "**Bullish OB** = tez upar wali move (displacement) se pehle ki **aakhri bearish (red) candle**. Price wapas is zone mein aaye to hum buy dhoondte hain. **Bearish OB** = tez neeche wali move se pehle ki **aakhri bullish (green) candle**; price wapas aaye to sell dhoondte hain. Zone ko aam taur par candle ke **open se low** (bullish) ya **open se high** (bearish) tak mark karte hain. Zone ka 50% hissa **Mean Threshold** kehlata hai — mazboot OB par price aksar is se aage nahi jata, aur body close is ke paar ho to OB kamzor samjho."
          },
          {
            h: 'Har ulti candle OB nahi hoti — validity checklist',
            p: "Valid OB ke liye yeh sharten dekho: (1) OB ne pehle koi **liquidity sweep** ki ho, (2) us ke baad **Displacement** aaye, (3) displacement ne **structure tora ho** (BOS ya CHoCH, body close ke saath), (4) displacement ne peeche **FVG** chhora ho, aur (5) OB abhi tak **unmitigated** ho, yani price wapas us tak nahi aaya. Jitni zyada sharten poori hon, OB utna mazboot. Jo OB structure nahi torta, woh sirf ek aam candle hai. Range ke beech mein bane OB bhi kamzor hote hain — asli OB swing ke extreme par banta hai."
          },
          {
            h: 'OB par trade kaise plan karein?',
            p: "Jab valid OB mil jaye to us ke ilaqe mein **Limit Order** ka plan banao, market order se peecha mat karo. Bullish OB mein entry zone ke top ya Mean Threshold par, aur **Stop Loss OB ke low (ya sweep wick) ke neeche** thore buffer ke saath. Agar OB aur FVG ek doosre ko overlap karein to woh behtareen entry ilaqa hai. Yaad rakho, OB pehli dafa touch par sab se mazboot hota hai; har agla touch use kamzor karta hai. Aur sab se aham: OB hamesha **HTF bias** ke rukh mein trade karo — trend ke khilaf OB aksar toot jata hai."
          }
        ],
        keyPoints: [
          'Bullish OB = displacement up se pehle ki **aakhri red candle**.',
          'Bearish OB = displacement down se pehle ki **aakhri green candle**.',
          'Valid OB: Sweep → Displacement → Structure break → FVG → Unmitigated.',
          '**Mean Threshold (50%)** ke paar body close = OB kamzor.',
          'Pehla touch sab se mazboot; SL OB/sweep ke bahar.'
        ],
        visual: [
          {
            title: 'Bullish Order Block',
            candles: K(104, [[103.2], [103.7], [102.6], [102.0], [102.5], [101.6], [101.0, 0.3, 0.6], [102.4, 0.2, 0.2], [103.4, 0.2, 0.2], [102.9], [101.9, 0.3, 0.5], [103.0, 0.2, 0.2], [104.3]]),
            annotations: [
              { type: 'zone', from: 100.4, to: 101.6, i1: 6, color: 'bull', label: 'Bullish OB' },
              { type: 'hline', price: 102.8, i1: 4, i2: 8, color: 'info', label: 'LH (CHoCH level)' },
              { type: 'label', i: 8, at: 'high', text: 'CHoCH ✓', color: 'bull' },
              { type: 'label', i: 10, at: 'low', text: 'OB retest', color: 'bull' }
            ],
            caption: 'Candle #7 (aakhri red candle) ne low sweep kiya, phir candles #8-#9 ki **displacement** ne 102.8 ka LH body close se tora (CHoCH) aur FVG chhora. Price wapas OB zone mein aaya aur wahan se naya high bana.',
            task: {
              prompt: '**Bullish Order Block** wali candle click karo.',
              answer: [6],
              explain: 'Candle #7 displacement se pehle ki aakhri bearish candle hai, us ne liquidity bhi sweep ki aur us ke baad structure toota — textbook Bullish OB.',
              hint: 'Bari green candles se bilkul pehle wali aakhri RED candle dhoondo.'
            }
          },
          {
            title: 'Bearish Order Block',
            candles: K(100, [[100.8], [100.3], [101.4], [102.0], [101.5], [102.4], [103.0, 0.6, 0.3], [101.6, 0.2, 0.2], [100.6, 0.2, 0.2], [101.1], [102.1, 0.5, 0.3], [101.0, 0.2, 0.2], [99.8]]),
            annotations: [
              { type: 'zone', from: 102.4, to: 103.6, i1: 6, color: 'bear', label: 'Bearish OB' },
              { type: 'hline', price: 101.2, i1: 4, i2: 8, color: 'info', label: 'HL (CHoCH level)' },
              { type: 'label', i: 8, at: 'low', text: 'CHoCH ✓', color: 'bear' },
              { type: 'label', i: 10, at: 'high', text: 'OB retest', color: 'bear' }
            ],
            caption: 'Candle #7 (aakhri green candle) ne high sweep kiya, phir bearish displacement ne 101.2 ka HL tor diya. Price wapas OB (102.4–103.6) mein aaya, sellers ke bache hue orders active hue aur naya low bana.',
            task: {
              prompt: '**Bearish Order Block** wali candle click karo.',
              answer: [6],
              explain: 'Candle #7 bari red displacement se pehle ki aakhri bullish candle hai — sweep + displacement + CHoCH, teeno sharten poori.',
              hint: 'Tez neeche wali move se bilkul pehle ki aakhri GREEN candle.'
            }
          }
        ],
        exercise: {
          title: 'OB validity scorecard',
          steps: [
            '1H chart par **5 Bullish** aur **5 Bearish** OBs mark karo.',
            'Har OB ko 5 sharton par score do: Sweep / Displacement / Structure break / FVG / Unmitigated (har ek = 1 point).',
            'Dekho ke 4-5 score wale OBs ne 1-2 score walon ke muqable mein kaisa react kiya.',
            'Har OB par Mean Threshold (50%) line lagao aur note karo ke price ne us ko respect kiya ya nahi.',
            'Visualizer ke dono tabs mein OB candle dhoondo.'
          ],
          deliverable: '10 OBs ki table: Type / Score (0-5) / Respect hua ya toota.'
        }
      },

      /* ---------------- Day 11 · 2.2 ---------------- */
      {
        id: 'p2-d11',
        day: 'Day 11',
        section: '2.2',
        title: 'Breaker Blocks',
        concepts: ['Breaker Block', 'Failed Order Block', 'Polarity Flip', 'Mitigation Block', 'Liquidity Sweep'],
        notes: [
          {
            h: 'Breaker Block kya hai?',
            p: "**Breaker Block** ek aisa Order Block hai jo **fail ho gaya** — price ne use body close se tor diya — aur ab woh ulta kirdar ada karta hai. Misaal: ek bearish OB (aakhri green candle) se price neeche gaya, lekin phir price wapas aa kar us OB ke upar body close kar gaya. Ab woh purana sell zone **support** ban jata hai aur price wapas aane par wahan se buy setup milta hai. Isay polarity flip bhi keh sakte ho. Breaker isliye kaam karta hai kyun ke jo log us zone mein phanse the (ghalat side par) woh breakeven par nikalna chahte hain, aur institutions wahan apni nayi position add karte hain."
          },
          {
            h: 'Bullish Breaker ka pattern',
            p: "Bullish Breaker ki tarteeb: (1) price ek swing low banata hai, (2) phir ek swing high, (3) phir **naya lower low** banata hai jo pehle low ki **SSL sweep** karta hai, (4) phir tez displacement se us swing high ke **upar body close** karta hai. Swing high se pehle wali aakhri up-candle(s) ka zone ab **Bullish Breaker** hai. Price jab wapas is zone mein aaye to buy dhoondo, SL breaker ke neeche ya sweep low ke neeche. **Bearish Breaker** bilkul ulta: higher high se BSL sweep, phir swing low ke neeche body close, aur purana demand zone ab resistance."
          },
          {
            h: 'Breaker vs Mitigation Block',
            p: "Dono mein farq sirf ek cheez ka hai: **liquidity sweep**. Agar structure tootne se pehle price ne pichla low/high sweep kiya (naya LL ya HH banaya), to zone **Breaker** hai — yeh zyada mazboot hai kyun ke liquidity le li gayi. Agar price ne naya extreme nahi banaya (failure swing — sirf higher low ya lower high), to us zone ko **Mitigation Block** kehte hain, jo kamzor hota hai. Simple yaad rakho: **Sweep + Break = Breaker**, **Break baghair sweep = Mitigation**."
          },
          {
            h: 'Breaker ko kab trade karein?',
            p: "Breaker sab se achha tab kaam karta hai jab woh **HTF bias** ke saath ho aur structure break ke saath saaf displacement aur FVG bhi ho. Entry breaker zone ke andar Limit Order se karo, aur agar breaker ke andar ya paas FVG ho to dono ke overlap par. Agar price breaker ke andar body close karke us ke doosri taraf nikal jaye, to setup khatam — zid mat karo. Breaker naye traders ke liye thora advanced hai, is liye pehle chart par 20 misalein dhoondo, phir demo par trade karo."
          }
        ],
        keyPoints: [
          'Breaker = **fail hua OB** jo ab ulti taraf kaam karta hai.',
          'Bullish Breaker: Low → High → **Lower Low (sweep)** → High ke upar body close.',
          '**Sweep + Break = Breaker** · Break baghair sweep = Mitigation Block.',
          'Entry: wapsi par breaker zone mein Limit; SL zone/sweep ke bahar.',
          'Price breaker ke paar body close kare = setup cancel.'
        ],
        visual: {
          title: 'Bullish Breaker Block',
          candles: K(102, [[101.0], [100.4, 0.3, 0.4], [101.3], [102.0, 0.3, 0.3], [101.0, 0.2, 0.2], [99.9, 0.2, 0.6], [100.9, 0.2, 0.3], [102.8, 0.2, 0.2], [103.5], [102.6, 0.3, 0.6], [103.9, 0.2, 0.2], [104.8]]),
          annotations: [
            { type: 'zone', from: 101.3, to: 102.3, i1: 3, color: 'bull', label: 'Bullish Breaker' },
            { type: 'hline', price: 100.0, i1: 1, i2: 5, color: 'liq', label: 'SSL' },
            { type: 'label', i: 5, at: 'low', text: 'Sweep (LL)', color: 'liq' },
            { type: 'label', i: 7, at: 'high', text: 'Break above high', color: 'bull' },
            { type: 'label', i: 9, at: 'low', text: 'Breaker retest', color: 'bull' }
          ],
          caption: 'Candle #4 se price neeche gaya, candle #6 ne 100.0 ka low **sweep** karke Lower Low banaya, phir candle #8 ne 102.3 ke swing high ke upar **body close** kiya. Purana sell zone (candle #4) ab **Bullish Breaker** hai — candle #10 ne wahan retest karke support liya.',
          task: {
            prompt: 'Woh candle click karo jis ne swing high (102.3) ke upar **body close** karke Breaker confirm kiya.',
            answer: [7],
            explain: 'Candle #8 ki body 102.8 par close hui — swing high toota. Kyun ke is se pehle SSL sweep ho chuki thi, yeh Breaker hai (Mitigation nahi).',
            hint: 'Sweep ke baad woh pehli bari green candle jis ki body green zone ke upar close hui.'
          }
        },
        exercise: {
          title: 'Breaker vs Mitigation pehchan',
          steps: [
            '4H ya 1H chart par **5 Breakers** dhoondo (sweep + break) aur **3 Mitigation Blocks** (break baghair sweep).',
            'Har ek par likho: liquidity sweep hui ya nahi, displacement aur FVG the ya nahi.',
            'Dekho ke wapsi par kaun se zones zyada respect hue — Breakers ya Mitigation Blocks.',
            'Visualizer mein Replay chalao aur breaker confirm karne wali candle click karo.'
          ],
          deliverable: '8 zones ki list (Breaker / Mitigation, sweep haan/nahi, nateeja) aur ek line ka nateeja: kaun sa zyada reliable laga.'
        }
      },

      /* ---------------- Day 12 · 2.3 ---------------- */
      {
        id: 'p2-d12',
        day: 'Day 12',
        section: '2.3',
        title: 'Fair Value Gap (3-Candle FVG)',
        concepts: ['Fair Value Gap (FVG)', 'Bullish FVG', 'Bearish FVG', 'Imbalance', 'Consequent Encroachment (CE)'],
        notes: [
          {
            h: 'FVG kya hai?',
            p: "**Fair Value Gap (FVG)** teen candles ka pattern hai jo batata hai ke price itni tezi se chala ke ek taraf ke orders theek se bhar hi nahi sake. Beech wali (doosri) candle bohot bari displacement candle hoti hai, aur pehli candle ki wick aur teesri candle ki wick ke darmiyan ek **khaali jagah** reh jati hai. Is ilaqe mein sirf ek taraf (buyers ya sellers) ne trade kiya — isay **Imbalance** bhi kehte hain. Market ko 'efficient' rehna pasand hai, is liye price aksar baad mein wapas aa kar is gap ko bharta hai."
          },
          {
            h: 'Bullish aur Bearish FVG kaise naapein',
            p: "**Bullish FVG**: candle 1 ka **High** aur candle 3 ka **Low** — agar candle 3 ka low, candle 1 ke high se upar hai to darmiyan ka ilaqa Bullish FVG hai. Yeh support ki tarah kaam karta hai aur wahan buy dhoondte hain. **Bearish FVG**: candle 1 ka **Low** aur candle 3 ka **High** — agar candle 3 ka high, candle 1 ke low se neeche hai to darmiyan ka ilaqa Bearish FVG hai; yeh resistance hai. Yaad rakho, wicks se naapte hain, bodies se nahi. Agar wicks overlap karein to FVG nahi bana."
          },
          {
            h: 'Consequent Encroachment (CE) — 50% line',
            p: "FVG ka beech (50%) **Consequent Encroachment (CE)** kehlata hai. Mazboot FVG mein price aksar CE tak ya us se thora aage aa kar palat jata hai. Agar price **CE ke paar body close** kar de (bullish FVG mein CE ke neeche), to FVG kamzor ho raha hai. Entry ke liye do aam tareeqe hain: FVG ke kinare (top of bullish FVG) par aggressive Limit, ya CE par conservative Limit jis ka RR behtar hota hai lekin fill hone ka chance kam. Dono mein SL FVG banane wali move ke shuru (sweep low) ke bahar hota hai."
          },
          {
            h: 'Kaun sa FVG kaam ka hai?',
            p: "Har FVG trade karne ke qabil nahi. Behtareen FVG woh hai jo: (1) **liquidity sweep ke baad** bani displacement mein ho, (2) us displacement ne **structure tora ho** (CHoCH/BOS), (3) **HTF bias** ke rukh mein ho, aur (4) dealing range ke sahi hisse (bullish ke liye Discount) mein ho. Bohot chhote FVG (spread jitne) ya choppy range ke andar bane FVG aksar shor (noise) hote hain. Agar FVG kisi Order Block ke saath overlap kare to confluence aur mazboot ho jata hai."
          }
        ],
        keyPoints: [
          'FVG = 3 candles; beech wali bari displacement candle.',
          'Bullish FVG: candle 1 **High** → candle 3 **Low** (gap). Bearish: candle 1 **Low** → candle 3 **High**.',
          'Wicks se naapo; wicks overlap = FVG nahi.',
          '**CE (50%)** ke paar body close = FVG kamzor.',
          'Sab se achha FVG: Sweep → Displacement + CHoCH → HTF bias ke saath.'
        ],
        visual: [
          {
            title: 'Bullish FVG',
            candles: K(100, [[100.4, 0.3, 0.3], [100.2], [100.6, 0.2, 0.3], [102.4, 0.2, 0.1], [102.9, 0.3, 0.3], [103.3], [102.5], [101.8, 0.3, 0.4], [103.0, 0.2, 0.2], [104.0]]),
            annotations: [
              { type: 'zone', from: 100.8, to: 102.1, i1: 2, color: 'bull', label: 'Bullish FVG' },
              { type: 'hline', price: 101.45, i1: 2, color: 'info', label: 'CE 50%' },
              { type: 'label', i: 3, at: 'high', text: 'Displacement', color: 'bull' },
              { type: 'label', i: 7, at: 'low', text: 'Rebalance ✓', color: 'bull' }
            ],
            caption: 'Candle #3 ka high **100.8** aur candle #5 ka low **102.1** — darmiyan ka gap Bullish FVG hai. Candle #4 ki displacement ne yeh imbalance chhora. Candle #8 ne wapas aa kar **CE (101.45)** tak gap bhara aur price upar chala gaya.',
            task: {
              prompt: 'Woh **beech wali (displacement) candle** click karo jis ne FVG banaya.',
              answer: [3],
              explain: 'Candle #4 ki bari body ne itni tezi se move kiya ke candle #3 ke high aur candle #5 ke low ke darmiyan gap reh gaya.',
              hint: 'Green FVG box ke bilkul beech mein khari sab se bari green candle.'
            }
          },
          {
            title: 'Bearish FVG',
            candles: K(104, [[103.6], [103.8], [103.4, 0.3, 0.2], [101.6, 0.1, 0.2], [101.1, 0.3, 0.3], [100.7], [101.5], [102.3, 0.4, 0.3], [101.0, 0.2, 0.2], [100.0]]),
            annotations: [
              { type: 'zone', from: 101.9, to: 103.2, i1: 2, color: 'bear', label: 'Bearish FVG' },
              { type: 'hline', price: 102.55, i1: 2, color: 'info', label: 'CE 50%' },
              { type: 'label', i: 3, at: 'low', text: 'Displacement', color: 'bear' },
              { type: 'label', i: 7, at: 'high', text: 'Rebalance', color: 'bear' }
            ],
            caption: 'Candle #3 ka low **103.2** aur candle #5 ka high **101.9** — darmiyan Bearish FVG. Candle #8 ne gap mein aa kar CE (102.55) ke paas rejection di aur sellers phir haavi ho gaye.',
            task: {
              prompt: 'Woh candle click karo jo FVG ko **rebalance** karne wapas gap ke andar aayi.',
              answer: [7],
              explain: 'Candle #8 ki wick 102.7 tak gayi — FVG ke andar aur CE ke thora paar — phir agli candle se neeche ki move shuru hui.',
              hint: 'Neeche jaane ke baad jo candle red box ke andar wapas pohnchi.'
            }
          }
        ],
        exercise: {
          title: 'FVG hunt',
          steps: [
            '15M chart par **10 FVGs** mark karo (5 bullish, 5 bearish) — candle 1 aur candle 3 ki wicks se box banao.',
            'Har FVG par CE (50%) line lagao.',
            'Note karo: kitne FVGs bhare gaye, kitne CE tak respect hue, kitne poori tarah toot gaye.',
            'Dekho ke jo FVG **sweep + CHoCH** ke baad bane, woh baqi FVGs se behtar chale ya nahi.',
            'Visualizer ke dono tabs hal karo.'
          ],
          deliverable: '10 FVGs ki table: Type / Sweep ke baad? (Haan-Nahi) / CE respect? / Nateeja.'
        }
      },

      /* ---------------- Day 13 · 2.3 ---------------- */
      {
        id: 'p2-d13',
        day: 'Day 13',
        section: '2.3',
        title: 'Price Rebalancing aur FVG Failure (Inversion)',
        concepts: ['Rebalancing', 'Efficient Price Delivery', 'Partial Fill', 'Inversion FVG (IFVG)', 'Displacement'],
        notes: [
          {
            h: 'Price wapas kyun aata hai? (Rebalancing)',
            p: "Jab displacement mein FVG banta hai to us ilaqe mein sirf ek taraf ke orders bhare gaye — doosri taraf ke log trade hi nahi kar sake. Market ka kaam dono taraf ko trade ka mauqa dena hai, is liye price aksar wapas aa kar is **inefficiency** ko bharta hai. Isi ko **Rebalancing** kehte hain. Saath hi, jis institution ne displacement mein order bhara, woh wapsi par apne baqi orders add karta hai — is liye FVG par price ko dobara dhakka milta hai. Rebalance ke baad price apne asli rukh (draw on liquidity) ki taraf chalna shuru karta hai."
          },
          {
            h: 'Rebalance ke darje: kinara, CE, poora',
            p: "Har FVG poora nahi bharta. Kabhi price sirf FVG ke **kinare** ko chhoo kar chala jata hai (aggressive market), kabhi **CE (50%)** tak aata hai (sab se aam), aur kabhi **poora gap** bhar deta hai. Jitni tez aur saaf displacement ho, utna kam rebalance hota hai. Is liye ek hi entry level par zid mat karo — kai traders FVG ke kinare par chhota aur CE par bara hissa Limit mein rakhte hain. Lekin har haal mein **SL ek hi structural jagah** par hona chahiye."
          },
          {
            h: 'FVG kab fail hota hai? — Inversion FVG',
            p: "Agar price FVG mein aa kar palatne ki bajaye us ke **doosri taraf body close** kar de, to FVG fail ho gaya. Misaal: bullish FVG ke neeche body close — iska matlab buyers ab control mein nahi. Aisa fail hua FVG aksar ulta kirdar ada karta hai: purana bullish FVG ab **resistance** ban jata hai. Isay **Inversion FVG (IFVG)** kehte hain. Price wapas us tak aaye to wahan sell setup mil sakta hai. Yeh bilkul Breaker jaisi soch hai — fail hua zone apni polarity badal leta hai."
          },
          {
            h: 'Practical rules',
            p: "Pehla: FVG ko andha support/resistance mat samjho; **HTF bias** aur liquidity ke saath dekho. Doosra: agar price FVG ki taraf aate hue bohot tez displacement ke saath aa raha hai (momentum ulta), to Limit order ka risk barh jata hai — wahan confirmation ka intezar behtar hai. Teesra: body close FVG ke paar = setup cancel, pending order hata do. Chautha: har FVG ke liye pehle se likho 'kahan entry, kahan SL, kab cancel' — **plan ke baghair FVG sirf ek dabba hai**."
          }
        ],
        keyPoints: [
          'Rebalancing = price wapas aa kar inefficiency (FVG) bharta hai.',
          'Rebalance ke darje: kinara → **CE** → poora gap.',
          'FVG ke paar **body close** = fail → aksar **Inversion FVG** (polarity flip).',
          'Tez ulta momentum = Limit ka risk zyada; confirmation dekho.',
          'Har FVG ka plan: entry / SL / cancel rule pehle se.'
        ],
        visual: [
          {
            title: 'Rebalance phir Continuation',
            candles: K(100, [[99.6], [100.1, 0.3, 0.3], [102.6, 0.2, 0.1], [103.4, 0.3, 0.2], [104.0], [103.2], [102.3, 0.3, 0.3], [101.8, 0.3, 0.4], [103.1, 0.2, 0.2], [104.6], [105.3]]),
            annotations: [
              { type: 'zone', from: 100.4, to: 102.4, i1: 1, color: 'bull', label: 'Bullish FVG' },
              { type: 'hline', price: 101.4, i1: 1, color: 'info', label: 'CE 101.4' },
              { type: 'label', i: 7, at: 'low', text: 'CE touch', color: 'bull' }
            ],
            caption: 'Candle #3 ki displacement ne 100.4–102.4 ka FVG chhora. Price wapas aaya, candle #8 ne exact **CE (101.4)** chhua — gap ka aadha hissa rebalance hua — aur phir naya high bana.',
            task: {
              prompt: 'Woh candle click karo jis ne FVG ka **CE (50%)** chhua.',
              answer: [7],
              explain: 'Candle #8 ki lower wick 101.4 tak gayi — bilkul CE. Body CE ke upar close hui, yani FVG ne respect kiya.',
              hint: 'Blue CE line ko chhoone wali candle dhoondo.'
            }
          },
          {
            title: 'Inversion FVG (Fail)',
            candles: K(100, [[100.5, 0.3, 0.3], [102.2, 0.2, 0.1], [102.6, 0.3, 0.3], [102.1], [101.2, 0.3, 0.3], [100.1, 0.2, 0.2], [99.6], [100.5, 0.4, 0.3], [99.4, 0.2, 0.2], [98.6]]),
            annotations: [
              { type: 'zone', from: 100.8, to: 101.9, i1: 0, color: 'liq', label: 'FVG → IFVG' },
              { type: 'label', i: 5, at: 'low', text: 'Body close neeche = fail', color: 'bear' },
              { type: 'label', i: 7, at: 'high', text: 'IFVG resistance', color: 'bear' }
            ],
            caption: 'Bullish FVG (100.8–101.9) bana lekin candle #6 ne us ke **neeche body close** kar diya — buyers fail. Ab yahi zone **Inversion FVG** hai: candle #8 ne neeche se aa kar is ko chhua aur rejection mili.',
            task: {
              prompt: 'Woh candle click karo jis ne FVG ke neeche **body close** karke use invalidate kiya.',
              answer: [5],
              explain: 'Candle #6 ki body 100.1 par close hui — FVG ke low (100.8) se neeche. Bullish idea khatam, zone ab resistance (IFVG).',
              hint: 'Amber box ke neeche pehli dafa BODY close karne wali candle.'
            }
          }
        ],
        exercise: {
          title: 'Rebalance statistics',
          steps: [
            'Kisi ek pair ke 1H chart par pichle mahine ke **15 FVGs** dhoondo.',
            'Har ek ko categorize karo: kinara touch / CE tak / poora fill / fail (IFVG).',
            'Fail hone wale FVGs mein dekho: kya baad mein woh IFVG ban kar resistance/support bane?',
            'Apne results se faisla karo ke tumhare pair par CE entry behtar hai ya kinara entry.',
            'Visualizer ke dono tabs hal karo.'
          ],
          deliverable: 'Percentage summary: ___% kinara, ___% CE, ___% poora fill, ___% fail.'
        }
      },

      /* ---------------- Day 14 · 2.3 ---------------- */
      {
        id: 'p2-d14',
        day: 'Day 14',
        section: '2.3',
        title: 'Premium vs Discount (50% Equilibrium)',
        concepts: ['Dealing Range', 'Premium', 'Discount', 'Equilibrium (50%)', 'Confluence', 'Valid Setup'],
        notes: [
          {
            h: 'Dealing Range kya hai?',
            p: "**Dealing Range** woh range hai jis ke andar price abhi kaam kar raha hai — ek saaf swing low se ek saaf swing high tak (ya ulta). Aam taur par yeh range woh leg hai jis ne aakhri structure tora, yani sweep wala low se displacement wala high tak. Is range par Fibonacci lagao: **0% aur 100%** range ke kinare hain aur **50%** beech hai, jise **Equilibrium** kehte hain. Yeh simple sa tool batata hai ke price abhi 'sasta' hai ya 'mehenga' — bilkul jaise bazaar mein sale aur full price."
          },
          {
            h: 'Premium aur Discount',
            p: "Equilibrium ke **upar** ka hissa **Premium** hai (mehenga) aur **neeche** ka hissa **Discount** (sasta). Institutional usool seedha hai: **Buy sirf Discount mein, Sell sirf Premium mein.** Agar bias bullish hai to hum price ke Discount mein aane ka intezar karte hain aur wahan OB/FVG dhoondte hain. Agar bias bearish hai to Premium mein OB/FVG par sell dhoondte hain. Premium mein buy karna matlab mehenga khareedna — RR kharab aur stop bara. Bohot se naye traders bilkul yahi ghalti karte hain: tez move dekh kar top par khareed lete hain."
          },
          {
            h: 'Confluence: sab ek jagah',
            p: "Sab se mazboot entry tab hoti hai jab kai cheezein ek hi ilaqe mein mil jayen — isay **Confluence** kehte hain. Misaal bullish: Discount ke andar ek Bullish OB, us ke saath overlap karta hua FVG, aur woh zone sweep ke baad bana ho. Jitni zyada wajahen ek jagah, utna kam andaza aur zyada probability. Lekin confluence ka matlab 20 indicators jama karna nahi; **4 cheezein kaafi hain: Liquidity Sweep, CHoCH, entry zone (FVG/OB), aur sahi Premium/Discount**."
          },
          {
            h: 'Valid Setup — Gate 2 ka formula',
            p: "Is poore phase ka khulasa ek formula hai: **Valid Setup = Liquidity Sweep + CHoCH (body close, displacement ke saath) + FVG ya Order Block**, aur entry sahi Premium/Discount mein. Gate 2 ke liye aap ko **20 aise valid setups** charts par dhoond kar Gate Lab ke Setup Logger mein record karne hain. Yeh trading nahi, **pattern recognition ki training** hai. Jab aap 20 setups khud dhoond lete ho to aankh khud ba khud sahi aur ghalat setup mein farq karna seekh jati hai. Jaldi mat karo — ek ghalat setup log karna khud ko dhoka dena hai."
          }
        ],
        keyPoints: [
          'Dealing Range = sweep low → displacement high (ya ulta). 50% = **Equilibrium**.',
          'Equilibrium ke upar **Premium** (sell), neeche **Discount** (buy).',
          'Premium mein buy = mehenga khareedna; RR kharab.',
          '**Valid Setup = Sweep + CHoCH + FVG/OB** (sahi P/D mein).',
          'Gate 2: 20 valid setups Gate Lab mein log karo.'
        ],
        visual: {
          title: 'Dealing Range: Premium / Discount',
          candles: K(103, [[101.8, 0.3, 0.3], [100.6, 0.3, 0.6], [102.8, 0.2, 0.2], [105.6, 0.2, 0.2], [108.0, 0.3, 0.6], [109.4, 0.4, 0.3], [109.0, 0.6, 0.3], [107.6], [106.2], [105.0, 0.3, 0.3], [104.2, 0.3, 0.5], [106.4, 0.2, 0.2], [108.8], [110.8, 0.3, 0.3]]),
          annotations: [
            { type: 'zone', from: 105, to: 110, i1: 6, color: 'bear', label: 'Premium (sell zone)' },
            { type: 'zone', from: 100, to: 105, i1: 6, color: 'bull', label: 'Discount (buy zone)' },
            { type: 'zone', from: 103.0, to: 105.0, i1: 2, i2: 11, color: 'info', label: 'FVG' },
            { type: 'hline', price: 105, i1: 1, color: 'liq', label: 'Equilibrium 50%' }
          ],
          caption: 'Dealing range **100 → 110**, Equilibrium **105**. Displacement ne Discount ke andar **FVG (103–105)** chhora. Pullback mein price Equilibrium ke neeche (Discount) aaya, FVG mein rebalance hua aur range ke high (110) ki BSL tak gaya.',
          task: {
            prompt: 'Woh candle click karo jis ne price ko **pehli dafa Discount** mein dakhil kiya (Equilibrium 105 ke neeche).',
            answer: [9],
            explain: 'Candle #10 ki low 104.7 — pehli dafa 105 ke neeche. Ab price sasta hai aur FVG ke andar hai: bullish entry ka ilaqa.',
            hint: 'Pullback mein woh pehli candle jis ki wick amber 50% line ke neeche gayi.'
          }
        },
        exercise: {
          title: 'Pehle 5 valid setups log karo',
          steps: [
            '4H par bias tay karo, phir 15M par aakhri swing low → swing high (ya ulta) par Fibonacci lagao aur 50% line mark karo.',
            'Dekho ke aap ka FVG/OB Discount (bullish) ya Premium (bearish) mein hai ya nahi.',
            'Charts par aise setups dhoondo jahan **Sweep + CHoCH + FVG/OB** teeno mojood hon.',
            'Sidebar se **🏁 Gate Lab** kholo aur pehle 5 setups Setup Logger mein record karo.',
            'Visualizer mein Discount mein pehli entry wali candle click karo.'
          ],
          deliverable: 'Gate Lab mein kam az kam 5 valid setups (baqi 15 is hafte mukammal karo — Gate 2 ke liye 20 chahiyen).'
        }
      }
    ],

    /* ---------------- MILESTONE GATE 2 ---------------- */
    gate: {
      id: 'gate2',
      title: 'Milestone Gate 2',
      passPct: 90,
      questions: [
        {
          q: '**Buy-side Liquidity (BSL)** kahan jama hoti hai?',
          options: ['Swing lows ke neeche', 'Swing highs / Equal Highs ke upar', 'Har candle ke beech', 'Sirf moving average par'],
          answer: 1,
          explain: 'Shorts ke stop losses aur breakout buy stops highs ke upar hote hain — yeh sab buy orders hain, yani BSL.'
        },
        {
          q: 'Ek candle ki wick equal lows ke neeche gayi aur body wapas upar close hui. Yeh kya hai?',
          options: ['Bearish BOS', 'Sell-side Liquidity Sweep', 'Bearish Order Block', 'Inversion FVG'],
          answer: 1,
          explain: 'Wick paar + body andar = sweep. Equal lows ke neeche SSL thi jo le li gayi.'
        },
        {
          q: '**Inducement (IDM)** ka sab se behtar matlab?',
          options: [
            'HTF ka bara liquidity pool',
            'Asli zone se pehle ka chhota obvious high/low jo early traders ko phansata hai',
            'Ek indicator signal',
            'Breakeven par stop lagana'
          ],
          answer: 1,
          explain: 'Inducement chhoti liquidity hai — retail wahan early entry leta hai, price us ko sweep karke asli OB/FVG tak jata hai.'
        },
        {
          q: '**Bullish Order Block** kaun si candle hai?',
          options: [
            'Displacement up se pehle ki aakhri bearish candle',
            'Displacement up ki sab se bari green candle',
            'Kisi bhi range ki pehli candle',
            'Displacement down se pehle ki aakhri green candle'
          ],
          answer: 0,
          explain: 'Bullish OB = tez upar wali move se bilkul pehle ki aakhri red candle. Aakhri option Bearish OB ki definition hai.'
        },
        {
          q: '**Breaker Block** aur Mitigation Block mein asal farq kya hai?',
          options: ['Candle ka rang', 'Breaker se pehle liquidity sweep (naya HH/LL) hoti hai', 'Timeframe', 'Koi farq nahi'],
          answer: 1,
          explain: 'Sweep + Break = Breaker. Break baghair sweep (failure swing) = Mitigation Block, jo kamzor hota hai.'
        },
        {
          q: '**Bullish FVG** kaise naapte hain?',
          options: [
            'Candle 1 ke Low se candle 3 ke High tak',
            'Candle 1 ke High se candle 3 ke Low tak (agar gap ho)',
            'Candle 2 ki body',
            'Candle 1 ke close se candle 3 ke open tak'
          ],
          answer: 1,
          explain: 'Bullish FVG: candle 3 ka low candle 1 ke high se upar ho to darmiyan ka gap FVG hai. Wicks se naapo.'
        },
        {
          q: 'Price bullish FVG mein aaya aur us ke **neeche body close** kar gaya. Ab kya?',
          options: [
            'Aur buy add karo',
            'FVG fail; yeh Inversion FVG ban kar resistance ho sakta hai',
            'Kuch farq nahi parta',
            'SL hata do'
          ],
          answer: 1,
          explain: 'Body close paar = fail. Fail hua bullish FVG aksar polarity badal kar IFVG (resistance) ban jata hai.'
        },
        {
          q: 'Dealing range 100 se 110 hai aur bias bullish hai. Buy kahan dhoondni chahiye?',
          options: ['107 ke upar (Premium)', '105 ke neeche (Discount)', 'Sirf 110 breakout par', 'Kahin bhi'],
          answer: 1,
          explain: 'Equilibrium 105 hai. Bullish bias mein buy sirf Discount (50% ke neeche) mein.'
        },
        {
          q: 'Gate 2 ke mutabiq **Valid Setup** kya hai?',
          options: [
            'RSI oversold + double bottom',
            'Liquidity Sweep + CHoCH + FVG ya Order Block',
            'Sirf FVG',
            'Moving average crossover'
          ],
          answer: 1,
          explain: 'Teeno hisse zaroori hain: liquidity li gayi, structure palta (CHoCH), aur entry ka zone (FVG/OB) mojood hai.'
        },
        {
          q: 'FVG ka **Consequent Encroachment (CE)** kya hai?',
          options: ['FVG ka 50% (beech)', 'FVG ka top', 'Stop loss level', 'TP3'],
          answer: 0,
          explain: 'CE = FVG ka midpoint. Mazboot FVG par price aksar CE tak aa kar palat jata hai.'
        }
      ]
    }
  });

  /* =================================================================
     PHASE 3 — WEEK 3: Multi-Timeframe & Entry/Exit
     ================================================================= */
  window.COURSE.push({
    id: 'phase3',
    order: 3,
    label: 'PHASE 3 · WEEK 3',
    title: 'Multi-Timeframe & Entry/Exit',
    subtitle: 'Top-Down analysis, Sessions & Killzones, AMD, OTE par Limit entry, structural Stop Loss aur 3-Stage Exit — phir 50 trades ka honest backtest.',
    lessons: [
      /* ---------------- Day 15 · 3.1 ---------------- */
      {
        id: 'p3-d15',
        day: 'Day 15',
        section: '3.1',
        title: 'Top-Down Analysis: HTF Bias se LTF Entry tak',
        concepts: ['Top-Down Analysis', 'HTF Bias', 'Daily / 4H', '1H / 15M Sweep', '5M / 1M Entry', 'Protected Low'],
        notes: [
          {
            h: 'Top-Down kyun?',
            p: "Har timeframe ek alag kahani sunata hai. 1M chart par bearish lagne wala move 4H par sirf ek chhota sa pullback ho sakta hai. Agar aap sirf chhote timeframe dekhoge to har doosri candle par raye badlegi aur aap bare trend ke khilaf trade karoge. **Top-Down Analysis** ka matlab hai upar se neeche aana: pehle bara timeframe (HTF) rukh batata hai, beech wala timeframe setup ki jagah, aur chhota timeframe (LTF) exact entry. Is tarah aap ka chhota sa stop bari move ke rukh mein hota hai — yahi high RR ka raaz hai."
          },
          {
            h: 'Step 1 — Daily / 4H: Bias',
            p: "Daily aur 4H par sirf teen sawal: (1) Swing structure kya hai — HH/HL (bullish) ya LH/LL (bearish)? (2) **Protected Low/High** kahan hai — woh swing jis ke tootne se bias badal jayega? (3) Agla **Draw on Liquidity** kahan hai — upar ki BSL ya neeche ki SSL? Agar structure bullish hai aur price Discount mein hai to bias **Long**. Agar tasveer saaf nahi (range ke beech, mixed structure) to us din **trade nahi** — no bias, no trade. Yeh faisla din mein ek dafa hota hai, har candle par nahi."
          },
          {
            h: 'Step 2 — 1H / 15M: Sweep ka intezar',
            p: "Bias milne ke baad 1H/15M par woh liquidity dhoondo jo bias ke **khilaf** pari hai. Bullish bias mein hum chahte hain ke price pehle neeche ki koi SSL (equal lows, Asian low, pichla 15M low) sweep kare — kyun ke wahi sell orders institutions ko buy bharne dete hain. Sweep HTF ke POI (OB / FVG / Discount) ke andar ho to aur bhi achha. Is step mein **kuch nahi karna, sirf intezar** — alert lagao aur screen se door raho. Sweep nahi hua to setup nahi."
          },
          {
            h: 'Step 3 — 5M / 1M: Displacement + CHoCH + Entry',
            p: "Sweep ke baad LTF (5M ya 1M) par dekho: kya bias ke rukh mein **Displacement** aayi jis ne aakhri LTF swing ko body close se tora (**CHoCH**)? Agar haan, to us displacement ne jo FVG ya OB chhora, wahan **Limit Order** lagao. SL sweep wick ke bahar, aur targets HTF liquidity par. Is tarah aap ka SL chhota (LTF) aur target bara (HTF) hota hai: 1:3 se 1:5 RR aam baat ban jati hai. Yaad rakho flow: **HTF Bias → MTF Sweep → LTF Displacement + CHoCH → Entry.**"
          }
        ],
        keyPoints: [
          '**Daily/4H** = Bias (structure, protected swing, draw on liquidity).',
          '**1H/15M** = bias ke khilaf liquidity ka **Sweep** (sirf intezar).',
          '**5M/1M** = Displacement + CHoCH → FVG/OB par Limit entry.',
          'Bias saaf nahi = trade nahi.',
          'Chhota SL (LTF) + bara target (HTF) = high RR.'
        ],
        visual: [
          {
            title: '4H: Bias Bullish',
            candles: K(100, [[102], [101.2], [103.4], [102.4], [104.8], [103.6], [106.2], [105.0], [104.2], [104.6]]),
            annotations: [
              { type: 'path', points: [[1, 100.9], [2, 103.7], [3, 102.1], [4, 105.1], [5, 103.3], [6, 106.5]], color: 'bull' },
              { type: 'label', i: 4, at: 'high', text: 'HH', color: 'bull' },
              { type: 'label', i: 6, at: 'high', text: 'HH', color: 'bull' },
              { type: 'hline', price: 103.3, i1: 5, color: 'bull', label: 'Protected HL' }
            ],
            caption: '4H par HH/HL structure — **bias bullish**. Jab tak price 103.3 ka Protected HL body close se nahi torta, hum sirf **buys** dhoondenge. Price abhi pullback mein hai — ab 15M par neeche ki liquidity ka sweep chahiye.',
            task: {
              prompt: 'Is 4H chart ka **aakhri confirmed Higher High** click karo.',
              answer: [6],
              explain: 'Candle #7 ka high 106.5 aakhri HH hai. Us ke baad pullback chal raha hai — yahi woh pullback hai jis mein LTF par buy setup dhoondenge.',
              hint: 'Zigzag line ka sab se upar wala point.'
            }
          },
          {
            title: '15M: SSL Sweep',
            candles: K(105, [[104.6], [105.0], [104.6, 0.3, 0.3], [104.9], [104.5, 0.3, 0.2], [104.6, 0.3, 1.0], [105.4, 0.2, 0.2], [105.9]]),
            annotations: [
              { type: 'hline', price: 104.3, i1: 0, color: 'liq', label: 'SSL (equal lows)' },
              { type: 'label', i: 5, at: 'low', text: 'SSL Sweep', color: 'liq' }
            ],
            caption: '4H pullback ke andar 15M par **104.3** par equal lows bane. Candle #6 ne in ke neeche wick maar kar SSL le li aur body wapas range mein close hui. Ab 1M par displacement aur CHoCH dekhenge.',
            task: {
              prompt: 'Woh candle click karo jis ne 15M ki **SSL sweep** ki.',
              answer: [5],
              explain: 'Candle #6 ki wick 103.5 tak gayi aur body 104.6 par close hui — sweep complete. Bias (bullish) ke khilaf liquidity le li gayi.',
              hint: 'Amber line ke neeche lambi wick.'
            }
          },
          {
            title: '1M: CHoCH + Entry',
            decimals: 2,
            candles: K(104.40, [[104.10], [104.25], [103.90], [103.70, 0.05, 0.20], [103.85], [104.40, 0.03, 0.03], [104.55], [104.30], [104.10, 0.05, 0.08], [104.50], [104.80], [105.00]], 0.05),
            annotations: [
              { type: 'hline', price: 104.30, i1: 1, i2: 5, color: 'info', label: 'LH (CHoCH level)' },
              { type: 'label', i: 3, at: 'low', text: 'Sweep', color: 'liq' },
              { type: 'label', i: 5, at: 'high', text: 'CHoCH ✓', color: 'bull' },
              { type: 'zone', from: 103.90, to: 104.35, i1: 4, color: 'bull', label: 'FVG (Limit Entry)' },
              { type: 'hline', price: 103.45, i1: 3, color: 'bear', label: 'SL (sweep ke neeche)' }
            ],
            caption: 'Sweep (candle #4) ke baad candle #6 ki **displacement** ne 104.30 ka LH body close se tora — **CHoCH**. Is ne 103.90–104.35 ka FVG chhora; candle #9 par Limit fill hua. SL sweep low ke neeche 103.45 par.',
            task: {
              prompt: 'Woh **displacement candle** click karo jis ne CHoCH confirm kiya.',
              answer: [5],
              explain: 'Candle #6 ki bari body 104.40 par close hui — 104.30 ka LH toota. Yahi LTF confirmation hai jis ke baad FVG par entry banti hai.',
              hint: 'Blue LH line ke upar body close karne wali pehli bari green candle.'
            }
          }
        ],
        exercise: {
          title: 'Teen timeframe ka plan',
          steps: [
            'Ek pair chuno. **Daily aur 4H** par structure, Protected swing aur draw on liquidity likho → Bias: Long / Short / No trade.',
            '**1H/15M** par bias ke khilaf pari liquidity (equal lows/highs, session high/low) mark karo aur wahan alert lagao.',
            'Pichle hafte ki koi aisi misaal dhoondo jahan sweep hua, aur **5M/1M** par displacement + CHoCH + FVG mark karo.',
            'Entry, SL aur HTF target likh kar RR calculate karo.',
            'Visualizer ke teeno tabs (4H → 15M → 1M) ke tasks hal karo.'
          ],
          deliverable: 'Teen screenshots (HTF / MTF / LTF) aur ek line: "Bias ___, sweep ___, entry ___, SL ___, target ___, RR ___".'
        }
      },

      /* ---------------- Day 16 · 3.1 ---------------- */
      {
        id: 'p3-d16',
        day: 'Day 16',
        section: '3.1',
        title: 'Sessions, Killzones aur AMD (Power of 3)',
        concepts: ['Asian Range', 'London Open Killzone', 'New York Open Killzone', 'AMD', 'Power of 3', 'Judas Swing'],
        notes: [
          {
            h: 'Waqt bhi ek filter hai',
            p: "Market 24 ghante khula hai, lekin institutional volume har waqt nahi hota. Bare players zyada tar **London** aur **New York** ke khulne ke waqt active hote hain — inhi waqton ko **Killzones** kehte hain. Killzone ke bahar price aksar sust aur choppy hota hai, spread zyada hota hai, aur setups fail zyada hote hain. Is liye professional trader sirf chart nahi, **ghari bhi dekhta hai**: sahi setup + sahi waqt = behtar probability. Neeche waqt **New York time** mein hain; Pakistan (PKT) mein sardiyon mein +10 ghante, aur US daylight saving (March–November) mein +9 ghante."
          },
          {
            h: 'Asian Range, London Open, New York Open',
            p: "**Asian Range** (taqreeban 20:00–00:00 NY = sardiyon mein 06:00–10:00 PKT): kam volume, price ek tang range banata hai — is range ke high aur low par dono taraf liquidity jama hoti hai. **London Open Killzone** (taqreeban 02:00–05:00 NY = 12:00–15:00 PKT): aksar Asian range ki ek taraf sweep hoti hai aur din ka asli rukh shuru hota hai. **New York Open Killzone** (taqreeban 07:00–10:00 NY = 17:00–20:00 PKT): sab se zyada volume, US news (8:30 NY) bhi isi waqt, aur London move ka continuation ya reversal. Har broker/source ke waqt thore alag hote hain — apne charts par session indicator lagao."
          },
          {
            h: 'AMD: Accumulation, Manipulation, Distribution',
            p: "**AMD** din ki kahani teen hisson mein batata hai. **Accumulation**: Asian session mein price range mein rehta hai aur dono taraf orders jama hote hain. **Manipulation**: London open par price aksar asli rukh ke **ulat** jhoota move deta hai (isay **Judas Swing** kehte hain) aur Asian high ya low ki liquidity le leta hai. **Distribution**: phir asli move shuru hota hai aur NY session mein extend hota hai. Bullish din mein Judas swing neeche hota hai (Asian low sweep), bearish din mein upar (Asian high sweep)."
          },
          {
            h: 'Power of 3 — daily candle ki shakal',
            p: "**Power of 3 (PO3)** AMD ko ek daily candle mein dekhna hai. Bullish din: candle **open** hoti hai, pehle neeche jati hai (manipulation — yahi lower wick banti hai), phir upar jaa kar high ke qareeb close hoti hai. Iska matlab: bullish bias wale din, **open se neeche** ka ilaqa buy ke liye Discount hai, aur open se upar buy karna aksar late hota hai. Bearish din mein ulta. Practical rule: **HTF bias + Killzone + Asian range ki sweep** — yeh teen mil jayen to setup ki probability kaafi barh jati hai."
          }
        ],
        keyPoints: [
          'Waqt filter hai: setups sirf **Killzones** mein.',
          'Asian Range ~20:00–00:00 NY · London Open ~02:00–05:00 NY · NY Open ~07:00–10:00 NY.',
          'PKT = NY + 10 ghante (sardi) / + 9 (US daylight saving).',
          '**AMD**: Asian = Accumulation, London = Manipulation (Judas Swing), NY = Distribution.',
          '**PO3**: bullish din mein open ke neeche manipulation, phir expansion upar.'
        ],
        visual: {
          title: 'Ek bullish din ka AMD',
          candles: K(100, [[100.3], [100.0], [100.4], [100.1], [100.3], [100.2], [99.9, 0.2, 0.1], [99.4, 0.2, 0.6], [100.2], [101.0], [100.7], [101.8], [102.6], [102.3], [103.0]], 0.2),
          annotations: [
            { type: 'zone', from: 99.8, to: 100.6, i1: 0, i2: 5, color: 'info', label: 'Asian Range (A)' },
            { type: 'label', i: 7, at: 'low', text: 'London: Judas Swing (M)', color: 'liq' },
            { type: 'label', i: 12, at: 'high', text: 'NY: Distribution (D)', color: 'bull' }
          ],
          caption: 'Candles #1-#6: **Asian Range** (99.8–100.6) — accumulation. London open par price neeche gaya aur candle #8 ne Asian low ki SSL sweep ki (**Judas Swing / Manipulation**). Phir range ke upar break aur NY session mein **Distribution** — din ka asli bullish move.',
          task: {
            prompt: 'Woh candle click karo jis ne **Asian low sweep** karke Manipulation complete ki.',
            answer: [7],
            explain: 'Candle #8 ki wick 98.8 tak gayi — Asian range ke low (99.8) ke kaafi neeche. Yeh Judas swing tha; asli rukh upar tha.',
            hint: 'Blue Asian box ke neeche sab se lambi wick.'
          }
        },
        exercise: {
          title: 'Session map aur AMD journal',
          steps: [
            'TradingView par session indicator lagao aur Asian, London aur New York sessions alag rang mein dikhao (apna PKT waqt likho).',
            'Pichle 10 trading dinon ke liye Asian range ka high aur low mark karo.',
            'Har din note karo: London ne Asian ki kaun si side sweep ki (high / low / koi nahi), aur din ka close kis taraf hua.',
            'Ginti karo ke kitne dinon mein AMD pattern saaf nazar aaya.',
            'Visualizer mein Judas swing wali candle click karo.'
          ],
          deliverable: '10 dinon ki table: Asian H/L / London ne kya sweep kiya / Din ka rukh / AMD saaf tha? (Haan-Nahi).'
        }
      },

      /* ---------------- Day 17 · 3.2 ---------------- */
      {
        id: 'p3-d17',
        day: 'Day 17',
        section: '3.2',
        title: 'Limit Orders: FVG aur Fibonacci OTE (61.8% – 79%)',
        concepts: ['Limit Order', 'Fibonacci', 'OTE (Optimal Trade Entry)', '61.8%', '70.5% Sweet Spot', '79%', 'Confluence'],
        notes: [
          {
            h: 'Limit Order kyun, Market Order kyun nahi?',
            p: "Displacement ke baad price aksar wapas aata hai (rebalance). Jo trader displacement candle ke upar market order se ghusta hai, woh sab se mehngi price par khareedta hai aur us ka SL bohot door hota hai. Jo trader **Limit Order** pullback zone mein pehle se lagata hai, use sasti price, chhota SL aur do guna RR milta hai. Limit order ka ek aur faida: yeh **jazbaat ko bahar** rakhta hai — plan pehle bana, order laga, phir chart se door. Nuqsaan sirf itna hai ke kabhi price zone tak nahi aata aur trade miss ho jata hai — aur yeh bilkul theek hai."
          },
          {
            h: 'Fibonacci OTE kaise lagate hain?',
            p: "**OTE (Optimal Trade Entry)** Fibonacci retracement ka **61.8% se 79%** wala ilaqa hai. Bullish setup mein Fib ko **sweep wale low se displacement wale high** tak kheencho — retracement high se neeche ki taraf naapte hain. Misaal: low **100**, high **110**, range = 10. To **61.8%** retracement = 110 − 6.18 = **103.82**, **70.5%** = 110 − 7.05 = **102.95**, aur **79%** = 110 − 7.9 = **102.10**. Bearish setup mein ulta: high se low tak kheencho, aur OTE upar wale hisse mein hoga. OTE hamesha Discount (bullish) ya Premium (bearish) ke andar hota hai."
          },
          {
            h: '70.5% — sweet spot',
            p: "OTE ke andar **70.5%** level ko 'sweet spot' kaha jata hai — yeh 61.8% aur 79% ka taqreeban beech hai aur yahan entry ka RR aur fill hone ka chance dono balanced hote hain. 61.8% par fill zyada hota hai magar RR kam; 79% par RR sab se achha magar aksar fill nahi hota. Bohot se traders apni position ko do hisson mein lagate hain (jaise 61.8% aur 70.5%), lekin **SL dono ka ek hi** hota hai. Agar price 79% se bhi aage nikal kar sweep low ke qareeb body close kare, to setup kamzor hai."
          },
          {
            h: 'FVG + OTE = A+ confluence',
            p: "Sab se behtareen Limit entry woh hai jahan **FVG aur OTE overlap** karein — matlab displacement ka chhora hua gap 61.8%–79% ke andar ho. Agar wahan Order Block bhi ho to aur achha. Entry plan aise likho: 'Buy Limit = FVG ke andar jo level OTE (ideally 70.5%) ke qareeb ho; SL = sweep low ke neeche; cancel = agar price pehle TP1 tak chala jaye ya kisi body close se FVG toot jaye.' Agar FVG OTE se bahar ho to dono mein se FVG ko tarjeeh do, lekin RR dobara calculate karo."
          }
        ],
        keyPoints: [
          'Limit = sasti entry, chhota SL, behtar RR, kam jazbaat.',
          'Bullish Fib: **sweep low → displacement high**. OTE = 61.8%–79% retracement.',
          'Misaal 100→110: 61.8% = **103.82**, 70.5% = **102.95**, 79% = **102.10**.',
          '**70.5% = sweet spot** (RR aur fill ka balance).',
          'Best: **FVG + OTE overlap**. Miss hua trade = theek hai.'
        ],
        visual: {
          title: 'OTE Limit fill (70.5%)',
          decimals: 2,
          candles: K(102, [[101.0, 0.3, 0.3], [100.4, 0.2, 0.4], [102.6, 0.2, 0.2], [105.2, 0.2, 0.2], [107.8, 0.2, 0.2], [109.6, 0.4, 0.3], [108.4], [106.8], [105.0], [103.6, 0.3, 0.7], [105.4, 0.2, 0.2], [107.6], [110.6, 0.3, 0.3]]),
          annotations: [
            { type: 'line', from: [1, 100.0], to: [5, 110.0], color: 'info', label: 'Fib: Low → High', dash: true },
            { type: 'zone', from: 102.10, to: 103.82, i1: 5, color: 'liq', label: 'OTE 61.8%–79%' },
            { type: 'hline', price: 102.95, i1: 5, color: 'bull', label: 'Sweet spot 70.5%' },
            { type: 'label', i: 9, at: 'low', text: 'Limit fill ✓', color: 'bull' }
          ],
          caption: 'Sweep low **100.00** se displacement high **110.00** tak Fib. OTE zone **102.10–103.82**, sweet spot **102.95**. Candle #10 ki wick 102.90 tak aayi — Buy Limit 102.95 fill hua — aur price naye high (BSL) tak gaya.',
          task: {
            prompt: 'Woh candle click karo jis par **70.5% Buy Limit** fill hua.',
            answer: [9],
            explain: 'Candle #10 ki low 102.90 — 102.95 ke sweet spot ko chhua. Body OTE ke upar close hui; displacement ka rukh barqarar raha.',
            hint: 'Green 70.5% line ko pehli dafa chhoone wali candle.'
          }
        },
        exercise: {
          title: 'OTE drill',
          steps: [
            'TradingView Fib tool ki settings mein levels **0, 0.5, 0.618, 0.705, 0.79, 1** rakho (baqi band).',
            '15M chart par 5 displacement legs dhoondo jo sweep ke baad bani hon; har ek par Fib low → high (bullish) ya high → low (bearish) kheencho.',
            'Har leg ke liye likho: 61.8 / 70.5 / 79 ki prices, aur kya price OTE tak wapas aaya.',
            'Dekho ke kitni legs mein FVG aur OTE overlap kar rahe the.',
            'Visualizer mein 70.5% fill wali candle click karo.'
          ],
          deliverable: '5 legs ki table: Low / High / 61.8 / 70.5 / 79 / OTE touch hua? / FVG overlap?'
        }
      },

      /* ---------------- Day 18 · 3.2 ---------------- */
      {
        id: 'p3-d18',
        day: 'Day 18',
        section: '3.2',
        title: 'Structural Stop-Loss: Sweep Wick ke Bahar',
        concepts: ['Structural Stop Loss', 'Invalidation', 'Sweep Wick', 'Buffer', 'Spread', 'Risk-Reward'],
        notes: [
          {
            h: 'Stop Loss ka asal kaam',
            p: "Stop Loss sirf 'nuqsaan rokne' ka tool nahi; yeh woh jagah hai jahan aap ka **trade idea ghalat sabit** ho jata hai — isay **Invalidation** kehte hain. Agar aap ne sweep ke baad long liya, to idea yeh hai ke 'liquidity le li gayi, ab price upar jayega'. Agar price wapas sweep ke low ke bhi neeche chala jaye, to idea khatam. Is liye **structural SL sweep wick ke bahar** hota hai — na ke koi fixed 10 ya 20 pips. Pehle SL ki logical jagah, phir us ke hisaab se lot size; kabhi ulta nahi."
          },
          {
            h: 'Buffer: spread aur shor ke liye jagah',
            p: "SL ko bilkul wick ke kinare par mat rakho. Sweep wick ke paar ek chhota **buffer** do jo kam az kam **spread** aur thora sa normal shor (noise) cover kare. Misaal: bearish setup mein sweep wick ka high **102.5** hai — SL **102.7** par rakho. Yaad rakho, Sell trade **Ask** par band hoti hai, aur chart aam taur par Bid dikhata hai — is liye sell ka SL spread ki wajah se chart touch ke baghair bhi hit ho sakta hai. News ya kam liquidity mein spread phailta hai, is liye buffer bhi soch samajh kar do."
          },
          {
            h: 'Galat SL ki teen aam shaklen',
            p: "**Pehli**: sweep wick ke **andar** SL — yani usi jagah jahan pehle liquidity li gayi; price dobara wahan aa sakta hai aur aap bila wajah nikal jaoge. **Doosri**: fixed pips SL jo structure ko nahi dekhta — kabhi bohot tight (shor mein hit), kabhi bohot door (RR barbaad). **Teesri**: trade lene ke baad SL ko **door karna** taake hit na ho — yeh sab se khatarnak aadat hai jo ek chhote loss ko account ke bare zakhm mein badal deti hai. SL sirf ek hi taraf jata hai: **profit ki taraf (breakeven / trail)**, kabhi peeche nahi."
          },
          {
            h: 'RR calculate karna',
            p: "Entry aur SL tay hone ke baad **Risk = |Entry − SL|**. Target ka faasla risk se divide karo to **RR** milta hai. Misaal: Sell entry **100.5**, SL **102.7** → risk **2.2**. TP1 (1:2) = 100.5 − 4.4 = **96.1**. Agar qareebi logical target (liquidity) 1:2 tak bhi nahi pohanchta, to **trade skip** karo — SL ko chhota karke RR 'banana' structure se ladna hai. Structural SL bara ho to lot size chhota karo, taake dollar risk wahi 1% rahe (Phase 4 mein position sizing poori seekhoge)."
          }
        ],
        keyPoints: [
          'SL = **Invalidation** — jahan idea ghalat sabit ho.',
          'Structural SL **sweep wick ke bahar** + buffer (spread + shor).',
          'Sell ka SL Ask par hit hota hai; news mein spread phailta hai.',
          'SL kabhi door mat karo — sirf profit ki taraf jata hai.',
          'Logical target 1:2 tak na ho = trade skip.'
        ],
        visual: {
          title: 'Bearish setup: Structural SL',
          candles: K(100, [[100.8], [100.4], [101.4], [101.0, 0.3, 0.3], [101.5, 1.0, 0.2], [100.2, 0.1, 0.2], [99.6, 0.2, 0.3], [100.2, 0.5, 0.2], [99.2, 0.2, 0.2], [98.4], [97.6], [97.9]]),
          annotations: [
            { type: 'hline', price: 101.7, i1: 0, i2: 4, color: 'liq', label: 'BSL' },
            { type: 'label', i: 4, at: 'high', text: 'Sweep wick 102.5', color: 'liq' },
            { type: 'zone', from: 100.4, to: 100.8, i1: 4, color: 'bear', label: 'FVG: Sell Limit' },
            { type: 'hline', price: 102.7, i1: 4, color: 'bear', label: 'Structural SL 102.7' }
          ],
          caption: 'Candle #5 ne equal highs (101.7) ke upar **102.5** tak sweep kiya, phir displacement ne neeche FVG (100.4–100.8) chhora. Sell Limit FVG mein candle #8 par fill hua. SL sweep wick ke **bahar 102.7** par — price wahan tak wapas nahi aaya.',
          task: {
            prompt: 'Woh candle click karo jis ki **wick SL ki jagah tay** karti hai.',
            answer: [4],
            explain: 'Candle #5 ki sweep wick (102.5) idea ki invalidation hai — price is ke upar gaya to sellers ka plan fail. Is liye SL 102.7 (wick + buffer).',
            hint: 'BSL ke upar sab se lambi upper wick wali candle.'
          }
        },
        exercise: {
          title: 'SL audit',
          steps: [
            'Apni pichli 10 trades (ya Phase 2 ke logged setups) dekho aur har ek ka SL check karo: structural tha, fixed pips tha, ya wick ke andar?',
            'Har setup ke liye dobara structural SL nikalo: sweep wick + buffer (apne broker ka spread check karo).',
            'Naye SL ke saath risk aur RR dobara calculate karo.',
            'Note karo kitni trades ka SL sahi hota to woh bach jatin, aur kitni ka RR 1:2 se kam hota (skip).',
            'Visualizer mein SL tay karne wali candle click karo.'
          ],
          deliverable: 'Table: Trade # / purana SL / structural SL / naya RR / skip? (Haan-Nahi).'
        }
      },

      /* ---------------- Day 19 · 3.3 ---------------- */
      {
        id: 'p3-d19',
        day: 'Day 19',
        section: '3.3',
        title: '3-Stage Exit Plan (33% / 33% / 34%)',
        concepts: ['Partial Take Profit', 'TP1 1:2', 'Breakeven', 'TP2 Internal Structure', 'TP3 HTF Liquidity', 'Runner'],
        notes: [
          {
            h: 'Exit, entry se zyada aham kyun?',
            p: "Bohot se traders achhi entry lete hain lekin profit wapas de dete hain — kabhi jaldi nikal kar, kabhi lalach mein ruk kar. Exit ka plan **trade lene se pehle** likha hona chahiye, taake chart dekhte waqt jazbaat faisla na karein. **3-Stage Exit** ek simple framework hai: position ke teen hisse, teen alag targets. Is se do faide hote hain: pehle hisse se profit pakka ho jata hai (psychological sukoon), aur aakhri hissa (runner) bari move ka faida utha sakta hai. Yeh 'sab ya kuch nahi' wali soch ka ilaaj hai."
          },
          {
            h: 'TP1: 1:2 par 33% + Breakeven',
            p: "**TP1** risk ke do gune (1:2) par hai. Yahan position ka **33%** band karo aur baqi ka SL **Breakeven (entry)** par le aao. Misaal: Buy entry **100**, SL **99** (1R = 1.0). TP1 = **102**. Yahan 33% band karne se **+0.66R** pakka ho gaya, aur ab baqi 67% position free trade hai — worst case zero par band hogi. Note: BE par SL lane se kabhi kabhi price BE chhoo kar target tak chala jata hai; yeh is plan ki qeemat hai, magar peace of mind aur capital protection us se zyada qeemti hain."
          },
          {
            h: 'TP2: Internal Structure par 33%',
            p: "**TP2** qareebi **internal structure** par hai — jaise pichla internal swing high (bullish trade mein), opposing FVG / OB, ya woh LH jahan se pichli down move shuru hui thi. Yahan doosra **33%** band karo. Misaal jari: TP2 = **103.5** (3.5R) → 33% × 3.5 = **+1.155R**. Ab tak total **+1.815R** lock ho chuka hai. TP2 ka maqsad hai ke runner ke liye 'mauka' kharidna bina pichla profit khatre mein dale."
          },
          {
            h: 'TP3: HTF Liquidity par 34% Runner',
            p: "Aakhri **34%** hissa **runner** hai jo **HTF liquidity** (jaise 4H/Daily equal highs, pichle din/hafte ka high) tak chalta hai. Misaal jari: TP3 = **106** (6R) → 34% × 6 = **+2.04R**. Teeno targets hit hon to total = 0.66 + 1.155 + 2.04 = **+3.855R**. Agar TP1 ke baad price BE par wapas aa jaye to bhi **+0.66R**. Backtest aur journal mein hamesha yahi **weighted total R** likho — sirf 'win/loss' nahi. Runner ka SL chahein to naye 15M HL ke neeche trail kar sakte ho, lekin plan pehle se likha ho."
          }
        ],
        keyPoints: [
          '**TP1 = 1:2** → 33% band + SL **Breakeven**.',
          '**TP2 = Internal Structure** → 33% band.',
          '**TP3 = HTF Liquidity** → 34% runner.',
          'Misaal (1R = 1): 0.66R + 1.155R + 2.04R = **+3.855R**; TP1 ke baad BE = +0.66R.',
          'Journal/backtest mein **weighted total R** likho.'
        ],
        visual: {
          title: '3-Stage Exit ladder',
          candles: K(100.6, [[100.2], [99.6, 0.2, 0.3], [100.8], [100.3, 0.2, 0.3], [101.4], [102.2], [101.6], [102.9], [103.7], [103.0], [104.4], [105.3], [106.2]], 0.2),
          annotations: [
            { type: 'hline', price: 100.0, i1: 3, color: 'info', label: 'Entry 100.0' },
            { type: 'hline', price: 99.0, i1: 1, color: 'bear', label: 'SL 99.0 (−1R)' },
            { type: 'hline', price: 102.0, i1: 3, color: 'bull', label: 'TP1 1:2 → 33% + BE' },
            { type: 'hline', price: 103.5, i1: 3, color: 'bull', label: 'TP2 Internal → 33%' },
            { type: 'hline', price: 106.0, i1: 3, color: 'liq', label: 'TP3 HTF Liquidity → 34%' }
          ],
          caption: 'Entry **100.0** (Limit fill candle #4), SL **99.0**. Candle #6 par **TP1 (102)** — 33% band, SL breakeven. Candle #9 par **TP2 (103.5)** — 33% band. Candle #13 par runner **TP3 (106)** tak pohncha. Total **+3.855R**.',
          task: {
            prompt: 'Woh candle click karo jis par **TP1 hit** hua aur SL breakeven par shift hona chahiye tha.',
            answer: [5],
            explain: 'Candle #6 ka high 102.4 — TP1 (102.0) hit. Yahan 33% band karke baqi position ka SL 100.0 (entry) par.',
            hint: 'Pehli candle jis ki wick green TP1 line (102) tak pohnchi.'
          }
        },
        exercise: {
          title: 'Exit math practice',
          steps: [
            'Farz karo entry 1.0850, SL 1.0820 (30 pips = 1R). TP1 (1:2), TP2 = 1.0950, TP3 = 1.1030 — har target ka R aur weighted R nikalo.',
            'Teen manzarnaame likho: (a) sirf TP1 phir BE, (b) TP1 + TP2 phir BE, (c) teeno targets — har ek ka total R.',
            'Apne Phase 2 ke 5 logged setups par TP2 (internal structure) aur TP3 (HTF liquidity) mark karo.',
            'Visualizer mein TP1 wali candle click karo.'
          ],
          deliverable: 'Teeno manzarnaamon ka total R (do decimal tak) aur 5 setups ke TP2/TP3 levels.'
        }
      },

      /* ---------------- Day 20 · 3.3 ---------------- */
      {
        id: 'p3-d20',
        day: 'Day 20',
        section: '3.3',
        title: 'Targets Chunna: Internal Structure vs HTF Liquidity',
        concepts: ['Internal Structure', 'Opposing FVG / OB', 'HTF Liquidity', 'PDH / PDL', 'Trailing Stop', 'Runner Management'],
        notes: [
          {
            h: 'Target bhi liquidity hai',
            p: "Jis tarah entry liquidity sweep ke baad hoti hai, usi tarah **target bhi liquidity par** hota hai. Price wahan jata hai jahan orders hain — is liye TP woh jagah honi chahiye jahan opposite traders ke stops ya pending orders pare hon. Random 'gol number' ya 'jitna profit chahiye' target nahi hota. Bullish trade mein upar ki BSL (highs, equal highs) aur bearish trade mein neeche ki SSL (lows, equal lows) aap ke targets hain. Target ki logic likh kar rakho: 'TP yahan kyun hai?'"
          },
          {
            h: 'TP2 ke liye Internal Structure kaise dhoondein',
            p: "Internal structure woh chhote swings hain jo pichli move ke andar bane. Bullish trade mein TP2 ke liye dekho: (1) pichli down move ka **aakhri internal LH** — wahan se sellers ne move shuru kiya tha aur wahan BSL hai, (2) koi **opposing FVG ya Bearish OB** jo raste mein ho, (3) LTF par session high (jaise Asian high ya London high). Inmein se jo pehle aaye aur saaf ho, woh TP2. Agar TP2 bohot qareeb (1:2 se pehle) ho, to TP1 aur TP2 ek saath ho sakte hain — plan flexible rakho magar likha hua."
          },
          {
            h: 'TP3 ke liye HTF Liquidity',
            p: "Runner ka target HTF par dekho: **4H/Daily equal highs/lows**, **Previous Day High/Low (PDH/PDL)**, **Previous Week High/Low**, ya woh HTF swing jo aap ne Day 15 ke 'Draw on Liquidity' mein mark kiya tha. Yeh bare magnets hain jahan aksar din ka ya hafte ka move khatam hota hai. Agar HTF target RR mein bohot door (jaise 1:15) ho aur raste mein HTF FVG/OB ho, to runner ka target us HTF zone se thora pehle rakho. Bara target theek hai, magar **wahan pohnchne ka raasta saaf** hona chahiye."
          },
          {
            h: 'Runner ko kaise manage karein',
            p: "TP2 ke baad runner ka SL breakeven par hai. Do tareeqe hain: **(1) Fixed**: SL BE par hi rahe aur runner ya to TP3 hit kare ya BE par band ho — simple aur backtest mein aasaan. **(2) Structural trail**: har naye LTF (15M) Higher Low banne ke baad SL us ke neeche le jao — zyada profit lock hota hai magar jaldi nikalne ka chance bhi. Jo bhi chuno, **backtest aur live mein ek hi** rakho. Sab se bari ghalti: chart dekh kar beech mein mann marzi se runner band kar dena — is se aap ka backtest aur asli results kabhi match nahi karenge."
          }
        ],
        keyPoints: [
          'Target = **liquidity** (BSL/SSL), random number nahi.',
          'TP2: aakhri internal LH/HL, opposing FVG/OB, session high/low.',
          'TP3: 4H/Daily equal highs/lows, **PDH/PDL**, weekly high/low.',
          'Runner: Fixed BE ya structural trail — dono mein se **ek** rule.',
          'Beech mein mann marzi exit = backtest aur live ka farq.'
        ],
        visual: {
          title: 'TP2 Internal vs TP3 HTF',
          candles: K(102, [[104.0, 0.4, 0.3], [103.0, 0.4, 0.3], [101.6, 0.3, 0.3], [102.4, 0.3, 0.3], [100.8, 0.3, 0.3], [99.6, 0.3, 0.7], [100.9, 0.2, 0.2], [100.3, 0.2, 0.3], [101.8, 0.2, 0.2], [102.6, 0.3, 0.2], [102.1, 0.2, 0.2], [103.3, 0.2, 0.2], [104.6, 0.3, 0.2], [104.2]]),
          annotations: [
            { type: 'hline', price: 104.4, i1: 0, color: 'liq', label: 'HTF Equal Highs = TP3' },
            { type: 'hline', price: 102.7, i1: 3, color: 'bull', label: 'Internal LH = TP2' },
            { type: 'label', i: 5, at: 'low', text: 'SSL Sweep', color: 'liq' },
            { type: 'hline', price: 100.0, i1: 7, color: 'info', label: 'Entry 100.0' }
          ],
          caption: 'Sweep (candle #6) ke baad long entry **100.0**. Raste mein pehla target down move ka **internal LH (102.7)** — TP2, candle #10 par hit. Runner ka target HTF **Equal Highs (104.4)** ki BSL — candle #13 ne woh liquidity le li.',
          task: {
            prompt: 'Woh candle click karo jis ne **HTF BSL (TP3)** le kar runner band karwaya.',
            answer: [12],
            explain: 'Candle #13 ka high 104.9 — equal highs (104.4) ke upar. HTF liquidity li gayi, runner ka kaam poora.',
            hint: 'Upar wali amber line ko chhoone wali candle.'
          }
        },
        exercise: {
          title: 'Target mapping',
          steps: [
            'Apne Phase 2 ke 10 logged setups kholo.',
            'Har setup par TP2 (internal structure) aur TP3 (HTF liquidity: PDH/PDL, 4H equal highs/lows) mark karo, aur har target ki wajah ek line mein likho.',
            'Dono targets ka RR nikalo. Jin setups mein TP2 1:2 se pehle tha, unhein alag note karo.',
            'Runner rule chuno (Fixed BE ya Structural trail) aur apne trading plan mein likh do.',
            'Visualizer mein TP3 wali candle click karo.'
          ],
          deliverable: '10 setups ki target sheet + aap ka chuna hua runner rule (ek line).'
        }
      },

      /* ---------------- Day 21 · 3.3 ---------------- */
      {
        id: 'p3-d21',
        day: 'Day 21',
        section: '3.3',
        title: 'Backtesting Protocol aur Gate 3 (50 Trades, +0.35R)',
        concepts: ['Backtesting', 'Bar Replay', 'Hindsight Bias', 'R-Multiple', 'Expectancy', 'Sample Size'],
        notes: [
          {
            h: 'Backtest kyun zaroori hai?',
            p: "Ab tak aap ne model seekha: HTF bias, sweep, CHoCH, FVG/OTE entry, structural SL aur 3-stage exit. Lekin yeh model **aap ke haath mein** kaam karta hai ya nahi — yeh sirf data batayega, raye nahi. **Backtesting** ka matlab hai purane charts par apne rules ke mutabiq trades 'lena' aur nateeja record karna. Is se teen cheezein milti hain: (1) model ki **Expectancy** ka andaza, (2) losing streaks ka andaza (taake live mein ghabrahat na ho), aur (3) setup pehchanne ki speed. Bina backtest ke live trading andhera hai."
          },
          {
            h: 'Honest backtest ke usool',
            p: "**Bar Replay** (TradingView) istemal karo taake mustaqbil ki candles nazar na aayen — warna **Hindsight Bias** aap ke results ko jhoota achha bana dega. Har trade se pehle checklist poori karo; agar ek bhi rule miss ho to trade mat lo, chahe baad mein woh jeet jata. Entry, SL aur targets **pehle se** mark karo, phir replay aage chalao. Loss ko 'yeh to ghalat setup tha' keh kar delete mat karo — agar rules ke mutabiq tha to woh data hai. Ek hi pair aur ek hi session se shuru karo taake results saaf hon."
          },
          {
            h: 'Har trade mein kya record karna hai',
            p: "Har trade ke liye likho: date, pair, session, direction, entry, SL, TP1/TP2/TP3, aur sab se aham — **R result** (3-stage exit ka weighted total). Misaal: sirf SL = **−1R**; TP1 phir BE = **+0.66R**; TP1 + TP2 phir BE = **+1.815R**; sab targets = jo bhi weighted total bana. Saath mein screenshot (before / after) aur ek line ka sabaq. **Expectancy = tamam R results ka average.** Misaal: 50 trades ka total +20R ho to Expectancy = 20 ÷ 50 = **+0.40R** per trade."
          },
          {
            h: 'Gate 3: 50 trades, Expectancy ≥ +0.35R',
            p: "Gate 3 tab pass hota hai jab Store mein **kam az kam 50 backtest trades** hon aur un ki **Expectancy +0.35R ya zyada** ho. 50 isliye ke 10-15 trades mein luck ka asar bohot zyada hota hai; 50 se kam az kam ek moti tasveer banti hai. +0.35R ka matlab: har trade par average 0.35 guna risk ka munafa — fees aur spread ke baad bhi model zinda rahe. Agar Expectancy kam aaye to **rules mat badlo beech mein**; pehle 50 poore karo, phir dekho kahan ghalti hai (entry, SL ya exit) aur agla batch naye rule ke saath karo."
          }
        ],
        keyPoints: [
          'Backtest = rules ka data; raye nahi.',
          '**Bar Replay** istemal karo — hindsight bias se bacho.',
          'Har trade ka **weighted R** likho (−1R, +0.66R, +1.815R ...).',
          '**Expectancy = average R**. 50 trades, total +20R → +0.40R.',
          'Gate 3: **50 trades + Expectancy ≥ +0.35R**.'
        ],
        visual: {
          title: 'Replay: rules ke mutabiq loss bhi data hai',
          candles: K(102, [[101.2], [101.6], [100.6, 0.3, 0.3], [100.2, 0.3, 0.8], [100.5, 0.2, 0.2], [102.2, 0.1, 0.1], [102.5, 0.2, 0.2], [101.5, 0.2, 0.3], [101.8, 0.2, 0.2], [100.6, 0.2, 0.2], [99.4, 0.2, 0.4], [98.8]]),
          annotations: [
            { type: 'label', i: 3, at: 'low', text: 'Sweep', color: 'liq' },
            { type: 'label', i: 5, at: 'high', text: 'CHoCH', color: 'bull' },
            { type: 'zone', from: 100.7, to: 102.0, i1: 4, color: 'bull', label: 'FVG' },
            { type: 'hline', price: 101.4, i1: 7, color: 'info', label: 'Entry 101.4' },
            { type: 'hline', price: 99.2, i1: 3, color: 'bear', label: 'SL 99.2' }
          ],
          caption: 'Sweep → CHoCH → FVG entry (101.4) — sab rules poore. Phir bhi candle #11 ne SL (99.2) hit kar diya. Backtest mein yeh trade **−1R** likha jayega. Isay delete karna apne aap ko dhoka dena hai — Expectancy jeet aur haar dono se banti hai.',
          task: {
            prompt: 'Woh candle click karo jis par **SL hit** hua (−1R record karna hai).',
            answer: [10],
            explain: 'Candle #11 ki low 99.0 — SL 99.2 hit. Setup valid tha, nateeja loss. Journal mein −1R, aur sabaq: "valid setup bhi fail hota hai".',
            hint: 'Red SL line (99.2) ke neeche jaane wali pehli candle.'
          }
        },
        exercise: {
          title: 'Backtest shuru karo',
          steps: [
            'TradingView par apna pair aur 15M chart kholo, **Bar Replay** ko 2-3 mahine peeche le jao.',
            'Ek spreadsheet ya journal banao: Date / Session / Dir / Entry / SL / TP1 / TP2 / TP3 / **R result** / Screenshot / Sabaq.',
            'Rules ke mutabiq pehli **10 trades** record karo — har trade ka weighted R nikalo.',
            '10 trades ke baad Expectancy (average R) nikalo, lekin abhi koi rule mat badlo.',
            'Visualizer mein SL hit wali candle click karo.'
          ],
          deliverable: 'Pehli 10 backtest trades ki list aur un ka average R. (Gate 3 ke liye 50 trades aur +0.35R chahiye — trades backtest/journal module se Store "backtest" mein jayengi.)'
        }
      }
    ],

    /* ---------------- MILESTONE GATE 3 ---------------- */
    gate: {
      id: 'gate3',
      title: 'Milestone Gate 3',
      passPct: 90,
      questions: [
        {
          q: 'Top-Down flow ki sahi tarteeb kya hai?',
          options: [
            '1M entry → 15M sweep → 4H bias',
            'Daily/4H Bias → 1H/15M Sweep → 5M/1M Displacement + CHoCH + Entry',
            'Sirf 1M chart kaafi hai',
            '4H entry → 1M bias'
          ],
          answer: 1,
          explain: 'HTF rukh batata hai, MTF liquidity sweep ki jagah, aur LTF exact entry.'
        },
        {
          q: 'London Open Killzone par aksar kya hota hai?',
          options: [
            'Market band hota hai',
            'Asian Range ki ek side sweep (Judas Swing) aur din ka asli rukh shuru',
            'Hamesha range',
            'Sirf crypto chalta hai'
          ],
          answer: 1,
          explain: 'AMD mein London = Manipulation: Asian high/low ki liquidity li jati hai, phir asli move.'
        },
        {
          q: '**AMD** ka matlab kya hai?',
          options: [
            'Average Market Direction',
            'Accumulation → Manipulation → Distribution',
            'Ask, Mid, Demand',
            'Asian, Midday, Daily'
          ],
          answer: 1,
          explain: 'Asian = Accumulation, London = Manipulation (Judas Swing), NY = Distribution (asli move).'
        },
        {
          q: 'Swing low 100 aur swing high 110 hai (bullish). **70.5%** OTE level kya hoga?',
          options: ['107.05', '102.95', '105.00', '103.82'],
          answer: 1,
          explain: '110 − (10 × 0.705) = 102.95. 103.82 = 61.8% hai.'
        },
        {
          q: 'OTE zone kaun sa hai?',
          options: ['23.6% – 38.2%', '50% – 61.8%', '61.8% – 79%', '100% – 161.8%'],
          answer: 2,
          explain: 'Optimal Trade Entry = 61.8% se 79% retracement; 70.5% sweet spot.'
        },
        {
          q: 'Bearish setup mein sweep wick ka high 102.5 hai. Structural SL kahan?',
          options: ['102.3 (wick ke andar)', '102.7 (wick ke upar + buffer)', 'Entry se fixed 10 pips', 'SL ki zarurat nahi'],
          answer: 1,
          explain: 'SL invalidation ke bahar: sweep wick + spread/shor ka buffer.'
        },
        {
          q: 'TP1 (1:2) hit hone par 3-Stage plan kya kehta hai?',
          options: [
            'Poori position band',
            '33% band + baqi ka SL Breakeven par',
            'Position double karo',
            'SL ko aur neeche le jao'
          ],
          answer: 1,
          explain: 'TP1 par 33% profit lock aur SL entry par — baqi trade free ho jati hai.'
        },
        {
          q: 'Entry 100, SL 99. TP1 = 102 (33%), TP2 = 103.5 (33%), TP3 = 106 (34%). Teeno hit hon to total R?',
          options: ['+6R', '+3.855R', '+2R', '+1.5R'],
          answer: 1,
          explain: '0.33×2 + 0.33×3.5 + 0.34×6 = 0.66 + 1.155 + 2.04 = 3.855R.'
        },
        {
          q: '50 backtest trades ka total +20R hai. Expectancy?',
          options: ['+20R', '+0.40R', '+2.5R', '+0.04R'],
          answer: 1,
          explain: 'Expectancy = average R = 20 ÷ 50 = +0.40R per trade — Gate 3 (≥ +0.35R) ke liye kaafi.'
        },
        {
          q: 'Backtest mein ek valid setup ne SL hit kiya. Kya karna chahiye?',
          options: [
            'Delete kar do, yeh to ghalat setup tha',
            '−1R record karo — yeh data hai',
            'SL ko door karke dobara dekho',
            'Rule badal do'
          ],
          answer: 1,
          explain: 'Rules ke mutabiq loss bhi Expectancy ka hissa hai. Delete karna hindsight bias hai.'
        }
      ]
    }
  });

  /* =================================================================
     PHASE 4 — WEEK 4: Risk Math & Psychology
     ================================================================= */
  window.COURSE.push({
    id: 'phase4',
    order: 4,
    label: 'PHASE 4 · WEEK 4',
    title: 'Risk Math & Psychology',
    subtitle: '1% risk, position size, Expectancy, Heat aur Drawdown ka hisaab — phir Mark Douglas ki soch, Anti-FOMO, Circuit Breaker, News filter aur 20 demo trades.',
    lessons: [
      /* ---------------- Day 22 · 4.1 ---------------- */
      {
        id: 'p4-d22',
        day: 'Day 22',
        section: '4.1',
        title: '1% Risk Rule aur Position Size',
        concepts: ['1% Risk Rule', 'Dollar Risk', 'Position Size', '|Entry − SL|', 'Lot Size', 'Units'],
        notes: [
          {
            h: '1% Risk Rule',
            p: "Professional trader ka pehla sawal 'kitna kamaunga?' nahi, balki **'ghalat hua to kitna gawaunga?'** hota hai. **1% Risk Rule**: kisi bhi ek trade mein account ka zyada se zyada **1%** risk. $10,000 account par yeh **$100** hai. Iska faida: 10 lagatar losses ke baad bhi account taqreeban **9.6%** neeche hoga (kyun ke har loss baqi balance ka 1% hai), jo wapas aa sakta hai. Agar har trade par 5% risk ho to wahi 10 losses account ko taqreeban **40%** neeche le jate hain — aur wahan se wapsi bohot mushkil hai. Naye trader ke liye 0.5%–1% behtareen hai."
          },
          {
            h: 'Formula: Position Size = Dollar Risk ÷ |Entry − SL|',
            p: "Position size ka formula seedha hai: **Position Size = Dollar Risk ÷ |Entry − SL|**. Yahan |Entry − SL| ka matlab hai entry aur stop ka faasla (hamesha positive). Misaal EURUSD: account $10,000, risk 1% = **$100**, entry **1.0850**, SL **1.0820** → faasla **0.0030** (30 pips). Position = 100 ÷ 0.0030 = **33,333 units** ≈ **0.33 lot** (1 lot = 100,000 units). Check: 0.33 lot par 1 pip ≈ $3.30, aur 30 pips × $3.30 ≈ $100 ✓. Pehle SL, phir size — yahi tarteeb hai."
          },
          {
            h: 'Crypto aur Gold ki misaal',
            p: "**BTC**: risk $100, entry **60,000**, SL **59,400** → faasla 600. Position = 100 ÷ 600 = **0.1667 BTC** (notional taqreeban $10,000). Dhyan do: leverage sirf margin kam karta hai, risk wahi $100 hai. **Gold (XAUUSD)**: risk $100, entry **2,400**, SL **2,392** → faasla $8. Position = 100 ÷ 8 = **12.5 oz**; agar broker ka 1 lot = 100 oz ho to yeh **0.125 lot** (0.12 ya 0.13 round). Har instrument ka contract size broker ki specification se check karo — formula wahi rehta hai, sirf units badalte hain."
          },
          {
            h: 'Aam ghaltiyan',
            p: "**Pehli**: lot size fixed rakhna (jaise 'main hamesha 0.10 lot leta hoon') — is se har trade ka risk alag hota hai kyun ke SL ka faasla har dafa alag hai. **Doosri**: SL ko chhota karna taake 'bara lot' le sako — SL structure se aata hai, lalach se nahi. **Teesri**: rounding mein upar jaana; hamesha **neeche round** karo taake risk 1% se zyada na ho. **Chauthi**: spread aur commission ko bhool jana — tight SL par yeh bohot bara hissa ban jate hain (agle lesson mein). Har trade se pehle calculator (Tools module) se size nikalo, andaze se nahi."
          }
        ],
        keyPoints: [
          'Har trade par max **1%** risk ($10,000 → $100).',
          '**Position Size = Dollar Risk ÷ |Entry − SL|**.',
          'EURUSD 1.0850 / 1.0820, $100 risk → 33,333 units ≈ **0.33 lot**.',
          'BTC 60,000 / 59,400, $100 → **0.1667 BTC**. Leverage risk nahi badalta.',
          'Hamesha **neeche round** karo; fixed lot size = ghalat risk.'
        ],
        visual: {
          title: 'EURUSD: |Entry − SL| = 30 pips',
          decimals: 4,
          candles: K(1.0880, [[1.0868], [1.0856], [1.0840, 0.0004, 0.0010], [1.0862, 0.0003, 0.0003], [1.0874], [1.0852, 0.0004, 0.0003], [1.0880], [1.0905], [1.0912]], 0.0004),
          annotations: [
            { type: 'hline', price: 1.0850, i1: 4, color: 'info', label: 'Entry 1.0850' },
            { type: 'hline', price: 1.0820, i1: 2, color: 'bear', label: 'SL 1.0820' },
            { type: 'line', from: [7, 1.0850], to: [7, 1.0820], color: 'liq', label: '30 pips', dash: true }
          ],
          caption: 'Sweep low 1.0830 ke neeche SL **1.0820**, pullback mein Buy Limit **1.0850**. Faasla **0.0030**. $10,000 account, 1% risk = $100 → 100 ÷ 0.0030 = **33,333 units ≈ 0.33 lot**. SL hit hota to nuqsaan sirf $100.',
          task: {
            prompt: 'Displacement ke baad pullback mein woh candle click karo jis par **Buy Limit 1.0850** fill hua.',
            answer: [5],
            explain: 'Candle #6 ki low 1.0849 — Limit 1.0850 fill. SL 1.0820 tak 30 pips, is liye size 0.33 lot.',
            hint: 'Candle #5 ke baad neeche aane wali woh candle jis ki wick blue Entry line ko chhooti hai.'
          }
        },
        exercise: {
          title: 'Position size drill',
          steps: [
            'Apne account size ke saath 1% dollar risk likho.',
            'EURUSD ke liye teen SL faaslon (15, 30, 50 pips) ka position size nikalo (units aur lots dono).',
            'BTC ke liye entry 60,000 aur SL 59,700 / 59,400 / 58,800 ka size nikalo.',
            'Gold ke liye apne broker ka contract size check karo aur entry 2,400, SL 2,392 ka lot size nikalo.',
            'Visualizer mein entry fill wali candle click karo.'
          ],
          deliverable: 'Position size table (instrument / SL faasla / units / lots) — sab 1% risk par.'
        }
      },

      /* ---------------- Day 23 · 4.1 ---------------- */
      {
        id: 'p4-d23',
        day: 'Day 23',
        section: '4.1',
        title: 'Expectancy aur Fees / Spread ka Asar',
        concepts: ['Expectancy', 'Win Rate (W)', 'Reward:Risk (R)', 'Breakeven Win Rate', 'Spread', 'Commission', 'Cost in R'],
        notes: [
          {
            h: 'Expectancy ka formula',
            p: "**Expectancy** batati hai ke har trade par average kitna R kamaoge. Formula: **E = (W × R) − ((1 − W) × 1)**, jahan **W** = win rate (decimal mein) aur **R** = average jeet ka reward (risk ke gune mein); loss hamesha −1R maana gaya hai. Misaal: W = 40%, R = 2 → E = 0.8 − 0.6 = **+0.20R**. Matlab 100 trades mein taqreeban +20R. Agar har trade ka risk $100 ho to yeh taqreeban **$2,000** banta hai. Yaad rakho: **Expectancy positive ho to hi trading business hai**, warna jua."
          },
          {
            h: 'Win rate akela kuch nahi batata',
            p: "Teen misalein: (a) W = **60%**, R = **0.8** → 0.48 − 0.40 = **+0.08R** (zyada jeet, kam faida). (b) W = **45%**, R = **2** → 0.90 − 0.55 = **+0.35R** (Gate 3 ka level). (c) W = **35%**, R = **3** → 1.05 − 0.65 = **+0.40R** (aadhe se kam jeet, phir bhi behtareen). **Breakeven Win Rate = 1 ÷ (1 + R)**: R = 2 par 33.3%, R = 3 par 25%. Is liye high RR model mein bohot saare losses normal hain. Jo trader sirf win rate ke peeche bhaagta hai woh aksar chhote profits aur bare losses ka shikar hota hai."
          },
          {
            h: 'Fees aur Spread: Expectancy ka chhupa dushman',
            p: "Har trade ki cost (spread + commission + slippage) ko **R mein** badlo: **Cost in R = trade ki cost ($) ÷ dollar risk**. Yeh cost jeet se bhi kat ti hai aur loss mein bhi judti hai, is liye **E(net) ≈ E − Cost in R**. Misaal: W = 45%, R = 2 (E = +0.35R). 10 pip SL par total cost 1.2 pips = **0.12R** → jeet = 1.88R, loss = −1.12R → E = 0.45 × 1.88 − 0.55 × 1.12 = **+0.23R**. Yani ek tihaai edge sirf cost kha gayi."
          },
          {
            h: 'Tight SL ka jaal',
            p: "Wahi 1.2 pip cost **30 pip SL** par sirf **0.04R** hai, lekin **5 pip SL** par **0.24R**! Is liye bohot tight SL wale scalping models paper par shandaar lagte hain magar live mein cost aur shor (noise) un ki Expectancy kha jate hain. Rules: (1) backtest mein bhi har trade se cost minus karo, (2) kam spread wale waqt (Killzones) aur liquid instruments trade karo, (3) agar cost 0.1R se zyada ho to SL bohot tight hai ya instrument mehenga hai. **Gate 3 ki +0.35R requirement isi liye hai** — taake cost ke baad bhi edge bache."
          }
        ],
        keyPoints: [
          '**E = (W × R) − ((1 − W) × 1)**.',
          'W 40% / R 2 → +0.20R · W 45% / R 2 → **+0.35R** · W 35% / R 3 → +0.40R.',
          '**Breakeven Win Rate = 1 ÷ (1 + R)**.',
          '**Cost in R = cost ($) ÷ dollar risk**; E(net) ≈ E − Cost in R.',
          'Tight SL par cost ka R bohot barh jata hai (5 pips SL: 1.2 pip = 0.24R).'
        ],
        visual: {
          title: 'Tight SL vs Structural SL',
          decimals: 4,
          candles: K(1.0860, [[1.0856], [1.0850], [1.0853, 0.0003, 0.0010], [1.0866], [1.0880], [1.0874], [1.0895], [1.0910]], 0.0003),
          annotations: [
            { type: 'label', i: 1, price: 1.0850, text: 'Entry 1.0850', color: 'info' },
            { type: 'hline', price: 1.0845, i1: 1, i2: 3, color: 'bear', label: 'Tight SL 5 pips' },
            { type: 'hline', price: 1.0820, i1: 1, color: 'bear', label: 'Structural SL 30 pips' }
          ],
          caption: 'Same entry, do alag SL. **5 pip SL** par 1.2 pip cost = **0.24R**, aur candle #3 ke normal shor ne use hit bhi kar diya. **30 pip structural SL** par wahi cost sirf **0.04R** — aur trade target tak gaya.',
          task: {
            prompt: 'Woh candle click karo jis ke normal shor (noise) ne **Tight SL** hit kar diya.',
            answer: [2],
            explain: 'Candle #3 ki wick 1.0840 tak gayi — 1.0845 ka tight SL hit, jabke structural SL (1.0820) mehfooz raha aur price upar chala gaya.',
            hint: 'Entry ke baad pehli lambi lower wick.'
          }
        },
        exercise: {
          title: 'Apni Expectancy nikalo',
          steps: [
            'Phase 3 ki apni backtest trades se W (win rate) aur average jeet ka R nikalo.',
            'Formula se E nikalo, aur saath mein seedha average R bhi — dono ka muqabla karo.',
            'Apne broker ka spread + commission likho aur apne average SL (pips) ke hisaab se **Cost in R** nikalo.',
            'E(net) = E − Cost in R calculate karo. Kya yeh ab bhi +0.35R ke qareeb hai?',
            'Visualizer mein tight SL hit karne wali candle click karo.'
          ],
          deliverable: 'Teen numbers: E (gross), Cost in R, E (net) — aur ek line: "Mera model cost ke baad zinda hai / nahi".'
        }
      },

      /* ---------------- Day 24 · 4.1 ---------------- */
      {
        id: 'p4-d24',
        day: 'Day 24',
        section: '4.1',
        title: 'Portfolio Heat Cap aur Drawdown Recovery',
        concepts: ['Portfolio Heat', 'Heat Cap 5-6%', 'Correlation', 'Drawdown', 'Recovery %', 'Losing Streak'],
        notes: [
          {
            h: 'Portfolio Heat kya hai?',
            p: "**Portfolio Heat** = is waqt khuli tamam trades ka **kul risk** (agar sab ke SL hit ho jayen to account ka kitna % jayega). Agar aap ke paas 4 trades hain aur har ek par 1% risk hai to heat **4%** hai. **Heat Cap** rule: kul heat kabhi **5–6%** se upar nahi. Iska matlab ek waqt mein zyada se zyada 5–6 full-risk trades. Jo trade breakeven par aa chuki hai us ka risk zero hai, is liye woh heat mein nahi ginti. Yeh rule aap ko us din se bachata hai jab ek hi news sab trades ko ek saath maar de."
          },
          {
            h: 'Correlation: ek hi bet do dafa',
            p: "EURUSD long aur GBPUSD long — kaghaz par do trades, asal mein taqreeban **ek hi bet** (dono USD ke khilaf). Agar USD mazboot hua to dono ek saath SL hit karengi. Isi tarah BTC aur ETH long, ya Gold long aur USD short aksar saath chalte hain. Rule: **correlated trades ka risk jama karke dekho**. Agar teen correlated trades hain to inhein ek bari trade samjho aur kul risk 1.5–2% se zyada mat hone do. Diversification ka matlab zyada trades nahi, **alag alag wajahon** wali trades hai."
          },
          {
            h: 'Drawdown Recovery ka zalim hisaab',
            p: "**Drawdown** = peak equity se giraawat. Masla yeh hai ke wapsi giraawat se zyada mushkil hai: **10%** loss ke baad wapas aane ke liye **11.1%** chahiye, **20%** ke baad **25%**, **25%** ke baad **33.3%**, aur **50%** ke baad poora **100%**. Formula: **Recovery % = DD ÷ (1 − DD)**. Matlab $10,000 se $5,000 par aa gaye to account double karna parega sirf wapas $10,000 tak pohanchne ke liye. Isi liye pro trader ka pehla kaam profit nahi, **capital bachana** hai."
          },
          {
            h: 'Losing streaks aur risk kam karna',
            p: "Achhe model mein bhi losing streak aati hai. W = 45% par kisi bhi 5 trades ki series ke saare loss hone ka chance taqreeban **5%** hai (0.55⁵) — yani saal bhar mein yeh zaroor hoga. 1% risk par 5 losses ≈ 4.9% DD; 5% risk par ≈ 22.6%. Professional rule: **Drawdown 5% ho jaye to risk aadha (0.5%)** aur 10% par trading rok kar review. Jab equity naye peak par aaye tab risk wapas normal. Yeh 'bura waqt' mein kam aur 'achha waqt' mein normal khelne ka tareeqa hai."
          }
        ],
        keyPoints: [
          '**Heat** = khuli trades ka kul risk. Cap: **5–6%**.',
          'Correlated trades (EURUSD + GBPUSD long) = ek hi bet; risk jama karo.',
          'Recovery: **10% → 11.1%**, 20% → 25%, **25% → 33.3%**, **50% → 100%**.',
          '**Recovery % = DD ÷ (1 − DD)**.',
          'DD 5% par risk aadha; 10% par ruk kar review.'
        ],
        visual: {
          title: 'Equity curve: −25% ke baad +33.3%',
          decimals: 0,
          candles: K(10000, [[10100], [9950], [9700], [9300], [9450], [8800], [8200], [7500, 80, 0], [7900, 80, 0], [8600], [8400], [9200], [9800], [10000]], 80),
          annotations: [
            { type: 'hline', price: 10000, i1: 0, color: 'bull', label: 'Start $10,000' },
            { type: 'hline', price: 7500, i1: 7, color: 'bear', label: '−25% = $7,500' },
            { type: 'line', from: [7, 7500], to: [13, 10000], color: 'liq', label: '+33.3% chahiye', labelPos: 'below', dash: true }
          ],
          caption: 'Yeh account ki **equity curve** hai (candles ki shakal mein). $10,000 se $7,500 tak **25% drawdown** aaya. Wapas $10,000 tak aane ke liye $2,500 ka munafa chahiye jo $7,500 ka **33.3%** hai — giraawat se zyada.',
          task: {
            prompt: 'Woh candle click karo jis par equity **max drawdown ($7,500)** par close hui.',
            answer: [7],
            explain: 'Candle #8 ka close $7,500 — peak se 25% neeche. Yahan se recovery ke liye +33.3% chahiye.',
            hint: 'Red −25% line par close hone wali candle.'
          }
        },
        exercise: {
          title: 'Risk dashboard banao',
          steps: [
            'Drawdown recovery table khud banao: 5%, 10%, 15%, 20%, 25%, 30%, 40%, 50% — formula DD ÷ (1 − DD).',
            'Apne trading plan mein likho: max heat ___%, correlated trades ka max kul risk ___%.',
            'Likho ke DD 5% aur 10% par aap kya karoge (risk aadha / trading band / review).',
            'Farz karo aap ke paas EURUSD long, GBPUSD long aur XAUUSD long hain (1% each) — kul asli risk ka andaza likho.',
            'Visualizer mein max drawdown wali candle click karo.'
          ],
          deliverable: 'Recovery table + aap ke 3 risk rules (heat cap, correlation cap, drawdown rule).'
        }
      },

      /* ---------------- Day 25 · 4.2 ---------------- */
      {
        id: 'p4-d25',
        day: 'Day 25',
        section: '4.2',
        title: 'Mark Douglas ki 5 Fundamental Truths',
        concepts: ['Trading in the Zone', 'Probabilistic Thinking', 'Edge', 'Random Distribution', 'Every Moment is Unique'],
        notes: [
          {
            h: 'Truth 1 aur 2: Kuch bhi ho sakta hai — aur jaanna zaroori nahi',
            p: "Mark Douglas ne apni kitab **Trading in the Zone** mein 5 buniyadi sachaiyan likhi hain. **1. Anything can happen (kuch bhi ho sakta hai).** Market mein koi bhi aisa trader ho sakta hai jo aap ke setup ke khilaf bara order daal de — chart par sab perfect hone ke bawajood. **2. You don't need to know what is going to happen next in order to make money.** Paisa kamane ke liye agli trade ka nateeja jaanna zaroori nahi; zaroori hai ke aap ka model **bohot saari trades** mein positive Expectancy de. Casino ko yeh nahi pata hota ke agla hand kaun jeetega — phir bhi woh har saal kamata hai."
          },
          {
            h: 'Truth 3: Jeet aur haar ki random tarteeb',
            p: "**3. There is a random distribution between wins and losses for any given set of variables that define an edge.** Agar aap ka model 100 trades mein 45 jeetta hai, to yeh nahi pata ke kaun si 45. Ho sakta hai pehli 7 trades sab loss hon aur phir 5 jeet lagatar aayen. Isi liye ek trade ka nateeja aap ki 'qabliyat' ka faisla nahi karta. Jo trader 3 losses ke baad rules badal deta hai, woh kabhi apne edge ka asal nateeja dekh hi nahi pata. **Edge sirf sample size mein zahir hota hai** — isi liye Gate 3 mein 50 trades hain."
          },
          {
            h: 'Truth 4 aur 5: Edge sirf probability hai, har lamha naya hai',
            p: "**4. An edge is nothing more than an indication of a higher probability of one thing happening over another.** Sweep + CHoCH + FVG ka matlab 'pakki jeet' nahi, sirf **thori zyada probability** hai. **5. Every moment in the market is unique.** Aaj ka setup kal jaisa dikhta hai, lekin market mein log aur orders har dafa alag hain. Pichli trade ka dukh ya khushi agli trade mein mat le jao. Jab yeh baat dil mein baith jaye to loss **'business ka kharcha'** ban jata hai, zaati shikast nahi."
          },
          {
            h: 'In sachaiyon ko amal mein lana',
            p: "Practical tareeqa: (1) Har trade se pehle khud se kaho 'yeh trade loss bhi ho sakti hai, aur yeh theek hai' — aur risk utna hi lo jitna sach mein gawane ke liye tayyar ho. (2) Apni trades ko **20 trades ke batch** mein dekho, akeli trade mein nahi. (3) Journal mein nateeje ki bajaye **rule-following** ko grade do. (4) Loss ke baad 'agli trade mein wapas le loonga' wali soch se bacho — har trade azaad hai. Yeh soch hi Anti-FOMO aur Circuit Breaker rules ki buniyad hai."
          }
        ],
        keyPoints: [
          '1. **Anything can happen.**',
          '2. Agle nateeje ko jaane baghair bhi paisa kamaya ja sakta hai.',
          '3. Edge ke andar jeet/haar ki **random distribution** hai.',
          '4. **Edge = sirf zyada probability**, guarantee nahi.',
          '5. **Har lamha unique** hai — pichli trade agli par asar na dale.'
        ],
        visual: {
          title: 'Same setup, alag nateeja',
          candles: K(102, [[101.0], [100.4, 0.3, 0.7], [102.0, 0.2, 0.2], [101.4, 0.2, 0.3], [100.4, 0.2, 0.2], [99.2, 0.2, 0.3], [98.6, 0.3, 0.6], [100.2, 0.2, 0.2], [99.6, 0.2, 0.3], [101.2], [102.6], [103.8], [104.6]]),
          annotations: [
            { type: 'label', i: 1, at: 'low', text: 'Setup #1: Sweep', color: 'liq' },
            { type: 'label', i: 5, at: 'high', text: 'Setup #1: SL (−1R)', color: 'bear' },
            { type: 'label', i: 6, at: 'low', text: 'Setup #2: Sweep', color: 'liq' },
            { type: 'label', i: 12, at: 'high', text: 'Setup #2: +3R', color: 'bull' }
          ],
          caption: 'Setup #1 (sweep + displacement + entry) bilkul valid tha — phir bhi candle #6 ne SL hit kar diya (**anything can happen**). Agla bilkul waisa hi Setup #2 **+3R** de gaya. Dono trades same rules se li gayin; farq sirf random distribution ka hai.',
          task: {
            prompt: 'Woh candle click karo jis ne **Setup #1 ka SL** hit kiya.',
            answer: [5],
            explain: 'Candle #6 ki low 98.9 — Setup #1 ka SL (sweep low 99.7 ke neeche, ~99.5) hit. Valid setup, phir bhi loss: Truth #1 aur #3.',
            hint: 'Setup #1 ke baad sweep low ke neeche body close karne wali pehli candle.'
          }
        },
        exercise: {
          title: '5 Truths ko apnao',
          steps: [
            'Paanchon truths apne haath se ek card par likho aur trading screen ke paas rakho.',
            'Apni pichli 20 trades (backtest ya demo) dekho aur sab se lambi losing aur winning streak dhoondo.',
            'Likho ke streak ke dauran aap ne kya mehsoos kiya aur kya koi rule toota.',
            'Agle 20 trades ke liye ek "batch mindset" likho: "Main 20 trades ke baad hi apne model ka faisla karunga."',
            'Visualizer mein Setup #1 ka SL hit karne wali candle click karo.'
          ],
          deliverable: '5 Truths card ki photo + streak analysis (ek paragraph).'
        }
      },

      /* ---------------- Day 26 · 4.2 ---------------- */
      {
        id: 'p4-d26',
        day: 'Day 26',
        section: '4.2',
        title: 'Anti-FOMO Rules aur Daily 2-Loss Circuit Breaker',
        concepts: ['FOMO', 'Chasing', 'Revenge Trading', 'Overtrading', 'Circuit Breaker', 'Daily Loss Limit'],
        notes: [
          {
            h: 'FOMO kya hai aur kyun nuqsaan deta hai?',
            p: "**FOMO (Fear Of Missing Out)** woh ghabrahat hai jo tez move dekh kar hoti hai: 'Agar abhi nahi ghusa to sab nikal jayega!' Is mein trader displacement ke **top** par market order maarta hai — Premium mein buy, SL door, RR kharab — aur aksar price wapas FVG ki taraf aata hai aur use bahar nikal deta hai. FOMO trade kabhi plan ka hissa nahi hoti; woh jazbaat ka hukm hoti hai. Yaad rakho: market roz naye setups deta hai, **missed trade ka nuqsaan zero hai**, ghalat trade ka nuqsaan asli."
          },
          {
            h: 'Anti-FOMO Rules',
            p: "(1) **No chase**: displacement ke baad market order nahi — sirf FVG/OTE par Limit. (2) **Missed = let go**: price aap ke zone ko chhooye baghair chala gaya to us move ko bhool jao. (3) **Checklist pehle**: har rule ✓ ho to hi order. (4) **Max 2-3 trades per din**, sirf Killzones mein. (5) **Plan likha hua**: entry, SL, TP pehle se — chart dekh kar naya plan nahi. (6) Social media par doosron ke profits dekh kar trade nahi. Yeh rules print karke screen ke saath lagao — jazbaat ke lamhe mein yaaddasht kaam nahi karti."
          },
          {
            h: 'Revenge Trading aur Overtrading',
            p: "Loss ke baad 'abhi wapas le leta hoon' wali soch **Revenge Trading** hai — lot size barh jata hai, rules choot jate hain, aur aksar ek chhota loss din ka sab se bara nuqsaan ban jata hai. **Overtrading** iska bhai hai: bore hokar ya 'kuch karne' ke liye ghatiya setups lena. Dono ki jar ek hai: loss ko zaati shikast samajhna (Truth #5 bhool jana). Ilaj sirf willpower nahi, **pehle se tay system** hai jo aap ko roke — yahi Circuit Breaker hai."
          },
          {
            h: 'Daily 2-Loss Circuit Breaker',
            p: "Rule bilkul seedha: **ek din mein 2 losses = us din trading band.** Platform band karo, chart band karo, kal naye dimagh se aao. 1% risk par iska matlab hai ke ek din mein max taqreeban **−2%**, jo kabhi account ko barbaad nahi kar sakta. Saath mein hafte ki limit bhi rakho (jaise **−4R** par hafte ke baqi din sirf backtest). Circuit breaker isliye kaam karta hai kyun ke faisla **loss se pehle**, thande dimagh se liya gaya — loss ke baad garam dimagh ko faisla karne ka mauqa hi nahi milta."
          }
        ],
        keyPoints: [
          'FOMO = tez move ke top par chase. **Missed trade = zero nuqsaan.**',
          'No chase · Missed = let go · Checklist pehle · Max 2-3 trades/din.',
          'Revenge trading aur overtrading ki jar: loss ko zaati shikast samajhna.',
          '**2 losses ek din mein = trading band** (max ~−2%).',
          'Hafte ki limit bhi (jaise −4R).'
        ],
        visual: {
          title: 'FOMO chase vs Patient Limit',
          candles: K(100, [[100.4], [100.1, 0.3, 0.3], [102.0, 0.1, 0.2], [103.6, 0.2, 0.1], [104.6, 0.4, 0.2], [103.6], [102.6], [101.7, 0.3, 0.4], [103.0], [104.4], [105.8]]),
          annotations: [
            { type: 'zone', from: 100.7, to: 101.9, i1: 1, color: 'bull', label: 'FVG: Patient Limit' },
            { type: 'label', i: 4, at: 'high', text: 'FOMO buy (chase)', color: 'bear' },
            { type: 'label', i: 6, at: 'low', text: 'FOMO panic exit', color: 'bear' },
            { type: 'label', i: 7, at: 'low', text: 'Limit fill ✓', color: 'bull' }
          ],
          caption: 'Teen bari green candles dekh kar FOMO trader ne candle #5 ke top par buy kiya. Pullback mein ghabra kar candle #7 par loss mein nikla. Sabr wale trader ka Limit FVG (100.7–101.9) mein candle #8 par fill hua — sasti entry, chhota SL, aur wahi move pakra.',
          task: {
            prompt: 'Woh candle click karo jahan **FOMO buyer** ne chase karke entry li.',
            answer: [4],
            explain: 'Candle #5 — teen displacement candles ke baad, Premium ke top par. SL door aur RR kharab. Asli entry FVG mein thi.',
            hint: 'Move ke sab se upar wali candle, pullback se bilkul pehle.'
          }
        },
        exercise: {
          title: 'Apne guardrails likho',
          steps: [
            'Apne liye 6 Anti-FOMO rules likho (upar wale + apne tajurbe se) aur print karo.',
            'Apni pichli trades mein FOMO aur revenge trades dhoondo aur un ka kul R nikalo.',
            'Circuit Breaker likho: daily limit (2 losses), weekly limit (___R), aur limit hit hone par kya karoge.',
            'Ek "cool-down routine" banao: loss ke baad 15 minute screen se door, phir journal.',
            'Visualizer mein FOMO entry wali candle click karo.'
          ],
          deliverable: 'Printed Anti-FOMO + Circuit Breaker sheet aur FOMO/revenge trades ka kul R.'
        }
      },

      /* ---------------- Day 27 · 4.2 ---------------- */
      {
        id: 'p4-d27',
        day: 'Day 27',
        section: '4.2',
        title: 'News Filter: CPI, NFP, FOMC',
        concepts: ['Economic Calendar', 'CPI', 'NFP', 'FOMC', 'Spread Widening', 'Slippage', 'Whipsaw'],
        notes: [
          {
            h: 'News ke waqt kya hota hai?',
            p: "High-impact news ke waqt market chand second mein bohot zyada move karta hai. Liquidity providers apne orders hata lete hain, is liye **spread kai guna phail jata hai** aur stop orders behtar price par fill nahi hote (**slippage**). Aksar price pehle ek taraf tez wick maarta hai, phir doosri taraf — isay **whipsaw** kehte hain, jo dono taraf ke stops ek saath le jata hai. News par 'andaza' lagana ICT/SMC trading nahi, jua hai. Hamara model clean structure aur liquidity par chalta hai; news us structure ko chand second ke liye be-maani kar deti hai."
          },
          {
            h: 'Teen sab se khatarnak events',
            p: "**NFP (Non-Farm Payrolls)**: US rozgaar report, aam taur par mahine ke **pehle Jumme** ko **8:30 NY** (sardiyon mein 18:30 PKT). **CPI (Consumer Price Index)**: mehngai (inflation) ki report, har mahine taqreeban beech mein, **8:30 NY**. **FOMC**: US Federal Reserve ka interest rate faisla, saal mein **8 dafa**, statement **2:00 PM NY** aur press conference **2:30 PM NY**. Inke ilawa GDP, PCE, retail sales aur central bank speeches bhi asar karte hain. Har hafte ki shuruaat mein **ForexFactory** ya kisi economic calendar par red (high-impact) events note karo."
          },
          {
            h: 'News Filter rules',
            p: "(1) **No new trades**: CPI aur NFP se taqreeban **30 minute pehle se 30 minute baad** tak koi naya order nahi. (2) **FOMC**: statement se pehle se le kar press conference khatam hone tak (taqreeban 2:00–3:30 PM NY) kuch nahi; bohot se traders FOMC wala poora din skip karte hain. (3) **Pending orders hatao**: news se pehle laga hua Limit spread phailne par ghalat fill ho sakta hai. (4) **Khuli trade**: agar trade profit mein hai to partial lo aur SL breakeven par; loss mein hai to plan ke mutabiq faisla news se **pehle** karo, news ke dauran nahi."
          },
          {
            h: 'News ke baad ka mauqa',
            p: "News khud trade karne ki cheez nahi, lekin news ke **baad** aksar saaf setups bante hain. News spike aksar ek taraf ki liquidity (jaise Asian high ya pichle din ka low) sweep karta hai, aur jab spread normal ho jaye aur price displacement + CHoCH de to wahi hamara aam model hai. Rule: news ke kam az kam **15-30 minute baad**, jab candles normal hon, phir checklist ke saath dekho. Is tarah news aap ka dushman nahi, **liquidity ka source** ban jati hai — bas aap us ke beech mein khare nahi hote."
          }
        ],
        keyPoints: [
          'News = spread phailna, slippage, **whipsaw** (dono taraf ke stops).',
          '**NFP** pehla Jumma 8:30 NY · **CPI** mahana 8:30 NY · **FOMC** 2:00 PM NY (+2:30 press conference).',
          'CPI/NFP: **±30 min** koi naya trade nahi; FOMC: statement se press conference tak kuch nahi.',
          'News se pehle pending orders hatao, khuli trade ka faisla pehle karo.',
          'News ke baad saaf sweep + CHoCH = aam setup.'
        ],
        visual: {
          title: 'NFP Whipsaw',
          decimals: 4,
          candles: K(1.0850, [[1.0853], [1.0849], [1.0852], [1.0851], [1.0858, 0.0042, 0.0048], [1.0880, 0.0006, 0.0010], [1.0842, 0.0006, 0.0008], [1.0866], [1.0858]], 0.0003),
          annotations: [
            { type: 'label', i: 4, at: 'high', text: 'NFP 8:30 NY', color: 'liq' },
            { type: 'hline', price: 1.0868, i1: 0, color: 'bear', label: 'Short ka SL (hit)' },
            { type: 'hline', price: 1.0835, i1: 0, color: 'bear', label: 'Long ka SL (hit)' }
          ],
          caption: 'News se pehle market shant tha. NFP par candle #5 ne pehle **1.0803** tak aur phir **1.0900** tak wick maari — longs aur shorts **dono ke SL** ek hi candle mein hit. Phir price wapas wahin aa gaya jahan se shuru hua tha.',
          task: {
            prompt: 'Woh **news candle** click karo jis ne dono taraf ke stops ek saath hit kiye.',
            answer: [4],
            explain: 'Candle #5: upar 1.0900 aur neeche 1.0803 — 97 pips ki range, dono SL hit. Isi liye news window mein koi trade nahi.',
            hint: 'Sab se lambi wicks wali candle.'
          }
        },
        exercise: {
          title: 'News calendar routine',
          steps: [
            'ForexFactory (ya koi economic calendar) kholo, filter mein sirf **High Impact** aur apni currencies (USD, EUR, GBP) rakho, aur timezone apna set karo.',
            'Is hafte aur agle hafte ke CPI, NFP aur FOMC (agar ho) ki dates aur PKT waqt likho.',
            'Pichli NFP ka 5M chart dekho aur news candle ki range (pips) aur spread ka andaza likho.',
            'Apne trading plan mein news filter rule likho (kitne minute pehle/baad, FOMC din ka rule).',
            'Visualizer mein news candle click karo.'
          ],
          deliverable: 'Do hafte ka news calendar (event / date / PKT waqt / meri no-trade window).'
        }
      },

      /* ---------------- Day 28 · 4.3 ---------------- */
      {
        id: 'p4-d28',
        day: 'Day 28',
        section: '4.3',
        title: 'Trading Plan aur Demo Execution Protocol',
        concepts: ['Trading Plan', 'Pre-Trade Checklist', 'Rule Compliance', 'Demo Account', 'Execution'],
        notes: [
          {
            h: 'Trading Plan: ek page ka qanoon',
            p: "Ab tak jo kuch seekha, use **ek page ke Trading Plan** mein likho: (1) Instruments aur sessions (jaise EURUSD, London + NY killzones), (2) HTF bias ka tareeqa, (3) Entry model: Sweep + CHoCH + FVG/OB/OTE, (4) SL rule: sweep wick ke bahar, (5) Risk: 1%, heat cap 5-6%, (6) Exit: 3-Stage (33/33/34), (7) Psychology: 2-loss circuit breaker, anti-FOMO, news filter. Yeh plan aap ka **qanoon** hai — demo aur live mein har trade isi ke mutabiq. Plan ke bahar ki trade, chahe jeet jaye, ghalat trade hai."
          },
          {
            h: 'Pre-Trade Checklist (9 rules)',
            p: "Har trade se pehle yeh 9 sawal: (1) HTF bias ke rukh mein? (2) Liquidity Sweep confirm? (3) Displacement + CHoCH (body close)? (4) Entry FVG/OB/OTE par, sahi Premium/Discount mein? (5) Structural SL sweep wick ke bahar? (6) Risk ≤ 1% aur heat ≤ 5-6%? (7) Killzone mein aur news window se bahar? (8) 3-Stage exit plan likha hua? (9) Aaj ke 2-loss limit aur anti-FOMO rules ka khayal? **Gate Lab** mein yahi 9 rules demo compliance ke liye istemal hote hain. Ek bhi 'nahi' = trade nahi."
          },
          {
            h: 'Demo kyun, aur kaise?',
            p: "Demo account par paisa asli nahi, lekin **process asli** hai. Maqsad paise kamana nahi, balki yeh sabit karna hai ke aap **live market ki raftaar mein** apne rules follow kar sakte ho. Demo ko real ki tarah treat karo: account size wahi rakho jo live mein rakhoge (jaise $1,000–$10,000, $100,000 nahi), har trade par 1% risk, aur har trade journal mein. Agar demo mein rules nahi tootte, tab hi chhote live account ki baari aati hai."
          },
          {
            h: 'Gate 4: 20 demo trades, 90% compliance',
            p: "Gate 4 tab pass hota hai jab Store mein **kam az kam 20 demo trades** hon aur **Rule Compliance ≥ 90%** ho. Compliance ka matlab: har trade mein 9 rules mein se kitne follow hue, aur sab trades ka average. Misaal: 20 trades × 9 rules = 180 checks; 162 ya zyada ✓ hon to **90%**. Dhyan do — Gate 4 profit nahi maangta! Ek rule-following losing trade 100% compliant hai, aur ek rule-breaking winning trade compliance kam karti hai. **Process par focus, nateeja khud aayega.**"
          }
        ],
        keyPoints: [
          'Trading Plan = ek page ka qanoon (instruments, model, SL, risk, exit, psychology).',
          '9-rule **Pre-Trade Checklist** — ek "nahi" = trade nahi.',
          'Demo ko real ki tarah: realistic account size, 1% risk, journal.',
          'Gate 4: **20 demo trades + Compliance ≥ 90%** (profit zaroori nahi).',
          'Compliance = follow hue rules ÷ kul rules (sab trades ka average).'
        ],
        visual: {
          title: 'A+ model trade: checklist chart par',
          decimals: 2,
          candles: K(103, [[102.2], [102.6], [101.4], [101.0, 0.25, 0.9], [101.3, 0.2, 0.2], [103.2, 0.1, 0.1], [103.6, 0.2, 0.2], [102.4, 0.2, 0.3], [103.8], [105.2], [104.6], [106.4], [107.2, 0.25, 0.2]], 0.25),
          annotations: [
            { type: 'label', i: 3, at: 'low', text: '1. SSL Sweep', color: 'liq' },
            { type: 'label', i: 5, at: 'high', text: '2. CHoCH', color: 'bull' },
            { type: 'zone', from: 101.5, to: 103.0, i1: 4, color: 'bull', label: '3. FVG' },
            { type: 'hline', price: 102.2, i1: 7, color: 'info', label: '4. Entry 102.2' },
            { type: 'hline', price: 99.9, i1: 3, color: 'bear', label: '5. SL 99.9' },
            { type: 'hline', price: 106.8, i1: 7, color: 'bull', label: '6. TP1 106.8 (1:2)' }
          ],
          caption: 'Checklist chart par: **Sweep** (candle #4) → **CHoCH** (candle #6) → **FVG** (101.5–103.0) → Limit **Entry 102.2** (candle #8) → **SL 99.9** sweep ke neeche (risk 2.3) → **TP1 106.8** (1:2) candle #13 par hit. Har step pehle se likha hua tha.',
          task: {
            prompt: 'Woh candle click karo jis par **Limit Entry (102.2)** fill hui.',
            answer: [7],
            explain: 'Candle #8 ki low 102.1 — FVG ke andar Limit 102.2 fill. Is se pehle sweep aur CHoCH dono confirm ho chuke the.',
            hint: 'CHoCH ke baad pehli pullback candle jo blue Entry line tak aayi.'
          }
        },
        exercise: {
          title: 'Plan likho aur demo shuru karo',
          steps: [
            'Ek page ka Trading Plan likho (upar ke 7 hisse) aur print karo.',
            '9-rule checklist ko apne journal template mein columns ki shakal mein daalo.',
            'Realistic size ka demo account kholo (jo live mein rakhoge, wahi balance).',
            'Pehli 3-5 demo trades checklist ke saath lo; har trade ke baad 9 rules ✓/✗ karo.',
            'Visualizer mein entry fill wali candle click karo.'
          ],
          deliverable: 'Printed Trading Plan + pehli 3-5 demo trades ka compliance score. (Demo trades journal module se Store "demo" mein jayengi.)'
        }
      },

      /* ---------------- Day 29 · 4.3 ---------------- */
      {
        id: 'p4-d29',
        day: 'Day 29',
        section: '4.3',
        title: 'Journal aur Weekly Review: Process > Outcome',
        concepts: ['Trading Journal', 'Process vs Outcome', 'Good Loss', 'Bad Win', 'Mistake Tags', 'Weekly Review'],
        notes: [
          {
            h: 'Journal mein kya likhna hai?',
            p: "Har trade ke baad: date, session, pair, direction, entry, SL, targets, **R result**, **9 rules ✓/✗**, before/after screenshot, aur ek line ka jazbaati haal ('trade se pehle main bored / ghabraya / pur-sukoon tha'). Jazbaati column bohot aham hai — kuch hafton mein pattern nazar aata hai ke kis haal mein aap rules torte ho. Journal sirf likhne ke liye nahi, **parhne ke liye** hai. Jo journal kabhi review nahi hota woh sirf diary hai."
          },
          {
            h: 'Good Loss aur Bad Win',
            p: "Har trade ko do cheezon par grade karo: **process** (rules follow hue?) aur **outcome** (profit/loss). Is se chaar khaane bante hain: **Good Win** (rules + profit), **Good Loss** (rules + loss — yeh bilkul theek hai, business ka kharcha), **Bad Loss** (rules toote + loss — sabaq), aur **Bad Win** (rules toote + profit — sab se khatarnak!). Bad win isliye khatarnak hai kyun ke dimagh ghalat aadat ko inaam deta hai, aur agli dafa wahi ghalti bari size par hoti hai. Grade hamesha **process** par do."
          },
          {
            h: 'Mistake tags',
            p: "Har toota hua rule ek **tag** ke saath likho: #NoSweep, #Chase, #PremiumBuy, #WickSL, #OverRisk, #NewsTrade, #ManualExit, #RevengeTrade. Mahine ke end par tags gino. Aksar 1-2 tags hi zyada tar nuqsaan ki wajah hote hain — misaal ke taur par sirf #Chase aur #ManualExit ne −8R kar diya. Ab aap ko poori trading theek karne ki zarurat nahi, sirf **un do aadaton** par kaam karna hai. Data aap ko batata hai ke kahan mehnat karni hai."
          },
          {
            h: 'Weekly Review routine',
            p: "Har Saturday/Sunday 30-45 minute: (1) Hafte ke stats: trades, win rate, total R, average R, **compliance %**. (2) Sab se achhi aur sab se buri trade ke screenshots dobara dekho. (3) Mistake tags gino. (4) Agle hafte ke liye **ek** behtari ka goal (jaise 'koi #Chase nahi'). (5) Agle hafte ka news calendar aur HTF bias. Ek waqt mein ek hi cheez theek karo — 10 goals ek saath kabhi kaam nahi karte. Yahi review aap ko 90% compliance tak le jayega."
          }
        ],
        keyPoints: [
          'Journal: R result + 9 rules ✓/✗ + screenshots + jazbaati haal.',
          'Grade **process** par: Good Win / **Good Loss** / Bad Loss / **Bad Win**.',
          'Bad Win sab se khatarnak — ghalat aadat ko inaam.',
          'Mistake tags gino; 1-2 aadatein hi zyada tar nuqsaan karti hain.',
          'Weekly review: stats, best/worst trade, tags, **ek** goal.'
        ],
        visual: [
          {
            title: 'Good Loss (rules ✓)',
            decimals: 2,
            candles: K(101, [[100.4], [100.7], [100.0, 0.25, 0.7], [101.4, 0.1, 0.1], [100.8, 0.2, 0.3], [99.9, 0.2, 0.2], [99.0, 0.2, 0.3], [98.6]], 0.25),
            annotations: [
              { type: 'label', i: 2, at: 'low', text: 'Sweep ✓', color: 'liq' },
              { type: 'label', i: 3, at: 'high', text: 'CHoCH ✓', color: 'bull' },
              { type: 'hline', price: 100.6, i1: 4, color: 'info', label: 'Entry ✓' },
              { type: 'hline', price: 99.1, i1: 2, color: 'bear', label: 'Structural SL ✓ (−1R)' }
            ],
            caption: 'Har rule follow hua: sweep, CHoCH, Limit entry, structural SL, 1% risk. Phir bhi candle #7 par SL hit. Journal grade: **Good Loss** — compliance 100%. Is trade par sharmindagi nahi, sirf data.',
            task: {
              prompt: 'Woh candle click karo jis par is "Good Loss" ka **SL hit** hua.',
              answer: [6],
              explain: 'Candle #7 ki low 98.7 — SL 99.1 hit. −1R, magar process perfect tha: yahi professional trading hai.',
              hint: 'Red SL line ke neeche jaane wali pehli candle.'
            }
          },
          {
            title: 'Bad Win (rules ✗)',
            decimals: 2,
            candles: K(100, [[101.0], [102.2], [103.4, 0.2, 0.1], [104.0], [103.5], [104.6], [105.4]], 0.25),
            annotations: [
              { type: 'label', i: 3, at: 'high', text: 'Chase entry (no sweep, Premium)', color: 'bear' },
              { type: 'label', i: 6, at: 'high', text: 'Profit… magar luck', color: 'muted' }
            ],
            caption: 'Na sweep, na CHoCH, Premium mein chase entry aur SL bhi nahi. Price upar chala gaya aur profit ho gaya — lekin yeh **Bad Win** hai. Tags: #NoSweep #Chase #PremiumBuy. Compliance kam, aur aadat khatarnak.',
            task: {
              prompt: 'Woh candle click karo jahan **rule-breaking entry** li gayi.',
              answer: [3],
              explain: 'Candle #4: teen green candles ke baad chase — koi sweep, CHoCH ya Discount nahi. Profit hua magar process fail.',
              hint: '"Chase entry" label wali candle.'
            }
          }
        ],
        exercise: {
          title: 'Journal upgrade + pehla review',
          steps: [
            'Apne journal mein yeh columns add karo: Process grade (Good/Bad), Outcome (Win/Loss), Mistake tags, Jazbaati haal.',
            'Ab tak ki saari demo trades ko chaar khaanon (Good Win / Good Loss / Bad Loss / Bad Win) mein baanto.',
            'Mistake tags gino aur top 2 tags likho.',
            'Is hafte ka Weekly Review karo aur agle hafte ka **ek** goal likho.',
            'Visualizer ke dono tabs hal karo.'
          ],
          deliverable: 'Chaar khaanon ki ginti, top 2 mistake tags, aur agle hafte ka ek goal.'
        }
      },

      /* ---------------- Day 30 · 4.3 ---------------- */
      {
        id: 'p4-d30',
        day: 'Day 30',
        section: '4.3',
        title: 'Graduation: Poora Model aur Live ki Taraf',
        concepts: ['Full Model Recap', 'Gate 4', 'Small Live Account', 'Scaling Plan', 'Risk Reduction', 'Consistency'],
        notes: [
          {
            h: 'Poora model ek nazar mein',
            p: "30 din ka khulasa ek flow mein: **(1)** Daily/4H par bias aur draw on liquidity. **(2)** Killzone mein 1H/15M par bias ke khilaf liquidity ka **Sweep**. **(3)** 5M/1M par **Displacement + CHoCH**. **(4)** FVG/OB/OTE par sahi Premium/Discount mein **Limit entry**. **(5)** **Structural SL** sweep wick ke bahar. **(6)** **1% risk** se position size, heat ≤ 5-6%. **(7)** **3-Stage Exit**: TP1 1:2 (33% + BE), TP2 internal (33%), TP3 HTF liquidity (34%). **(8)** News filter, 2-loss circuit breaker, journal. Yeh aap ka poora business hai."
          },
          {
            h: 'Gate 4 ke baad: chhota live account',
            p: "Gate 4 pass karne ka matlab hai ke aap ne process sabit kiya — ab **chhote live account** ki baari hai, bara nahi. Demo aur live mein sab se bara farq **jazbaat** ka hai: asli paisa dimagh ko alag tarah chalata hai. Is liye shuru mein risk **0.25%–0.5%** rakho, chahe demo mein 1% tha. Pehle 20-30 live trades ka maqsad sirf yeh hai ke compliance demo jaisi rahe. Agar live compliance 90% se gire to wapas demo par jao — is mein koi sharm nahi, yeh discipline hai."
          },
          {
            h: 'Scaling plan aur risk reduction',
            p: "Risk barhana **data** par ho, jazbaat par nahi. Misaal plan: 30 live trades + compliance ≥ 90% + positive Expectancy → risk 0.5% se **0.75%**; agle 30 trades mein bhi yahi → **1%**. Ulta rule bhi utna hi zaroori: drawdown **5%** par risk aadha, **10%** par live band aur poora review (journal, tags, backtest). Kabhi bhi ek bari jeet ke baad risk double mat karo — yeh FOMO ki ek aur shakal hai. Account ko 'jaldi' bara karne ki koshish hi zyada tar accounts ko khatam karti hai."
          },
          {
            h: 'Aakhri sabaq: consistency',
            p: "Trading mein kamyabi ek shandaar trade se nahi, **saikron average trades** se aati hai jo ek hi rules se li gayin. Aap ke paas ab model hai, risk ka hisaab hai, aur psychology ke guardrails hain. Ab sirf ek cheez baqi hai: **har din, har trade, wahi process**. Journal likhte raho, weekly review karte raho, aur har mahine apni Expectancy check karo. Yaad rakho Mark Douglas ki baat: edge sirf probability hai — aap ka kaam us probability ko **baar baar, bila jazbaat** execute karna hai."
          }
        ],
        keyPoints: [
          'Flow: Bias → Killzone Sweep → Displacement + CHoCH → Limit (FVG/OB/OTE) → Structural SL → 1% → 3-Stage Exit.',
          'Gate 4 ke baad **chhota live account**, risk 0.25%–0.5%.',
          'Risk sirf data par barhao (30 trades + 90% compliance + positive E).',
          'DD 5% = risk aadha · DD 10% = live band + review.',
          'Kamyabi = **consistency**, ek bari trade nahi.'
        ],
        visual: {
          title: 'Poora model: Sweep → CHoCH → FVG + OTE → 3-Stage Exit',
          decimals: 2,
          candles: K(104, [[103.0], [103.5], [102.2], [101.6, 0.25, 0.8], [102.0, 0.2, 0.2], [104.2, 0.1, 0.1], [104.6, 0.2, 0.2], [103.4], [102.6, 0.2, 0.3], [104.0], [105.1], [105.9, 0.2, 0.2], [105.3], [106.8], [108.2, 0.3, 0.2]], 0.25),
          annotations: [
            { type: 'label', i: 3, at: 'low', text: 'Sweep', color: 'liq' },
            { type: 'label', i: 5, at: 'high', text: 'CHoCH', color: 'bull' },
            { type: 'zone', from: 102.2, to: 104.0, i1: 4, i2: 9, color: 'bull', label: 'FVG + OTE' },
            { type: 'hline', price: 102.3, i1: 8, color: 'info', label: 'Entry 102.3' },
            { type: 'hline', price: 100.6, i1: 3, color: 'bear', label: 'SL 100.6' },
            { type: 'hline', price: 105.7, i1: 8, color: 'bull', label: 'TP1 1:2 (33% + BE)' },
            { type: 'hline', price: 107.0, i1: 8, color: 'bull', label: 'TP2 (33%)' },
            { type: 'hline', price: 108.3, i1: 8, color: 'liq', label: 'TP3 HTF (34%)' }
          ],
          caption: 'Sweep (100.8) → CHoCH → FVG jo OTE (61.8% ≈ 102.33) se overlap karta hai → Limit **102.3** (candle #9) → SL **100.6** (risk 1.7) → TP1 **105.7** (candle #12), TP2 **107.0** (candle #14), TP3 **108.3** (candle #15). Weighted total ≈ **+2.77R**.',
          task: {
            prompt: 'Woh candle click karo jis par **runner (TP3)** band hua.',
            answer: [14],
            explain: 'Candle #15 ka high 108.5 — TP3 (108.3) hit. 0.66R + 0.91R + 1.20R ≈ +2.77R. Poora plan pehle se likha tha, beech mein koi mann marzi nahi.',
            hint: 'Sab se upar wali amber TP3 line ko chhoone wali candle.'
          }
        },
        exercise: {
          title: 'Graduation checklist',
          steps: [
            'Apna Trading Plan dobara parho aur 30 din ke sabaq ke mutabiq update karo.',
            'Gate Lab mein check karo: 20 demo trades aur compliance ≥ 90% — agar kam hai to demo jari rakho.',
            'Live ke liye scaling plan likho: shuruati risk, risk barhane ki sharten, aur drawdown rules.',
            'Apne aap se ek "commitment letter" likho: kaun se 3 rules kabhi nahi todoge.',
            'Visualizer mein TP3 wali candle click karo, phir **Milestone Gate 4** attempt karo.'
          ],
          deliverable: 'Updated Trading Plan + scaling plan + commitment letter.'
        }
      }
    ],

    /* ---------------- MILESTONE GATE 4 ---------------- */
    gate: {
      id: 'gate4',
      title: 'Milestone Gate 4',
      passPct: 90,
      questions: [
        {
          q: 'Account $10,000, risk 1%, EURUSD entry 1.0850, SL 1.0820. Position size?',
          options: ['3.3 lot', '0.33 lot (≈33,333 units)', '0.03 lot', '1 lot'],
          answer: 1,
          explain: '$100 ÷ 0.0030 = 33,333 units ≈ 0.33 lot.'
        },
        {
          q: 'W = 40% aur R = 2 ho to Expectancy kya hai?',
          options: ['+0.80R', '+0.20R', '−0.20R', '+1.20R'],
          answer: 1,
          explain: 'E = (0.4 × 2) − (0.6 × 1) = 0.8 − 0.6 = +0.20R.'
        },
        {
          q: '25% drawdown ke baad wapas breakeven par aane ke liye kitna return chahiye?',
          options: ['25%', '33.3%', '50%', '20%'],
          answer: 1,
          explain: 'Recovery = DD ÷ (1 − DD) = 0.25 ÷ 0.75 = 33.3%.'
        },
        {
          q: 'Aap ke paas 1% risk wali 5 khuli trades hain. Ek nayi valid setup aayi. Heat Cap (5-6%) ke mutabiq?',
          options: [
            'Nayi trade 3% risk par lo',
            'Tabhi lo jab koi trade breakeven par ho ya heat cap ke andar jagah ho',
            'Saari trades band karo',
            'Heat ka koi asar nahi'
          ],
          answer: 1,
          explain: 'Heat 5% hai. 6% tak jagah hai magar correlation aur cap dekh kar; breakeven trades heat mein nahi gintin.'
        },
        {
          q: '10 pip SL par spread + commission 1.2 pips hai. Cost in R?',
          options: ['1.2R', '0.12R', '0.012R', '12R'],
          answer: 1,
          explain: 'Cost in R = 1.2 ÷ 10 = 0.12R — har trade ki Expectancy se itna kat jata hai.'
        },
        {
          q: 'Mark Douglas ki pehli Fundamental Truth kya hai?',
          options: [
            'Har setup jeetta hai',
            'Anything can happen — kuch bhi ho sakta hai',
            'Indicators sab se aham hain',
            'Bara risk = bara profit'
          ],
          answer: 1,
          explain: 'Truth #1: Anything can happen. Is liye har trade ka risk pehle se tay aur qabil-e-bardasht ho.'
        },
        {
          q: 'Aaj aap ki 2 trades loss mein band huin. Circuit Breaker kya kehta hai?',
          options: [
            'Teesri trade double size par',
            'Aaj ki trading band — kal fresh shuru',
            'Kisi aur pair par try karo',
            'SL hata kar trade karo'
          ],
          answer: 1,
          explain: 'Daily 2-Loss Circuit Breaker: 2 losses = din khatam. Faisla pehle se tay, jazbaat ko mauqa nahi.'
        },
        {
          q: 'NFP 8:30 NY par hai. News filter ke mutabiq?',
          options: [
            '8:29 par market order',
            'Taqreeban 8:00 se 9:00 NY tak koi naya trade nahi; pending orders hata do',
            'News par double size',
            'Sirf stop orders lagao'
          ],
          answer: 1,
          explain: 'CPI/NFP par ±30 minute no-trade window. Spread phailta hai aur whipsaw dono taraf ke stops leta hai.'
        },
        {
          q: 'Rules ke mutabiq li gayi trade SL par band hui. Journal grade?',
          options: ['Bad Loss', 'Good Loss', 'Bad Win', 'Delete karo'],
          answer: 1,
          explain: 'Process sahi + nateeja loss = Good Loss. Grade process par hota hai, nateeje par nahi.'
        },
        {
          q: 'Gate 4 pass karne ki practical shart kya hai?',
          options: [
            '20 demo trades mein profit',
            '20 demo trades aur Rule Compliance ≥ 90%',
            '100% win rate',
            '1 live trade'
          ],
          answer: 1,
          explain: 'Gate 4 process naapta hai: kam az kam 20 demo trades aur 90%+ rule compliance — profit zaroori nahi.'
        }
      ]
    }
  });

  /* =================================================================
     GATE LAB — practical gate requirements (gate2 / gate3 / gate4)
     ================================================================= */
  const DEMO_RULES = Object.freeze([
    { key: 'bias', text: 'HTF (Daily/4H) bias ke rukh mein trade' },
    { key: 'sweep', text: 'Liquidity Sweep confirm thi' },
    { key: 'choch', text: 'Displacement + CHoCH (body close)' },
    { key: 'entry', text: 'Entry FVG / OB / OTE par, sahi Premium/Discount mein' },
    { key: 'sl', text: 'Structural SL sweep wick ke bahar' },
    { key: 'risk', text: 'Risk ≤ 1% aur Portfolio Heat ≤ 5-6%' },
    { key: 'time', text: 'Killzone mein, CPI/NFP/FOMC window se bahar' },
    { key: 'exit', text: '3-Stage Exit plan follow kiya (mann marzi exit nahi)' },
    { key: 'discipline', text: 'Daily 2-Loss Circuit Breaker aur Anti-FOMO rules follow kiye' }
  ]);

  const r6 = (x) => Math.round(x * 1e6) / 1e6;
  const fmtR = (x) => (x >= 0 ? '+' : '') + x.toFixed(2) + 'R';
  function listOf(key) {
    const v = Store.get(key, []);
    if (Array.isArray(v)) return v;
    return v && Array.isArray(v.trades) ? v.trades : [];
  }
  const isValidSetup = (s) => !!(s && s.sweep && s.choch && (s.fvg || s.ob));
  function rOf(t) {
    if (typeof t === 'number') return isFinite(t) ? t : null;
    if (!t) return null;
    const raw = t.r != null ? t.r : (t.R != null ? t.R : t.rMultiple);
    if (raw == null || raw === '') return null;
    const r = Number(raw);
    return isFinite(r) ? r : null;
  }
  function complianceOf(t) {   // 0..1
    if (!t) return 0;
    if (typeof t.compliance === 'number') return Math.max(0, Math.min(1, t.compliance > 1 ? t.compliance / 100 : t.compliance));
    if (t.rules && typeof t.rules === 'object') {
      const vals = Object.values(t.rules).filter((v) => typeof v === 'boolean');
      return vals.length ? vals.filter(Boolean).length / vals.length : 0;
    }
    if (typeof t.compliant === 'boolean') return t.compliant ? 1 : 0;
    return 0;
  }

  const REQ = {
    gate2() {
      const all = listOf('setups');
      const valid = all.filter(isValidSetup).length;
      return { ok: valid >= 20, pct: Math.min(100, (valid / 20) * 100), total: all.length, valid, summary: valid + ' / 20 valid setups' };
    },
    gate3() {
      const rs = listOf('backtest').map(rOf).filter((r) => r !== null);
      const n = rs.length;
      const e = n ? r6(rs.reduce((a, b) => a + b, 0) / n) : 0;
      const wins = rs.filter((r) => r > 0).length;
      return {
        ok: n >= 50 && e >= 0.35, pct: Math.min(100, (n / 50) * 100), n, e,
        total: r6(rs.reduce((a, b) => a + b, 0)), winRate: n ? Math.round((wins / n) * 100) : 0,
        summary: n + ' / 50 trades · Expectancy ' + fmtR(e)
      };
    },
    gate4() {
      const ts = listOf('demo');
      const n = ts.length;
      const c = n ? r6((ts.reduce((a, t) => a + complianceOf(t), 0) / n) * 100) : 0;
      return { ok: n >= 20 && c >= 90, pct: Math.min(100, (n / 20) * 100), n, c, summary: n + ' / 20 trades · Compliance ' + c.toFixed(1) + '%' };
    }
  };

  /* Practical poora na ho to course ka quiz-gate Gate Lab par bhej do */
  function guard() {
    const m = /^#\/course\/gate\/(gate[234])\/?$/.exec(location.hash);
    if (m && !REQ[m[1]]().ok) location.replace('#/gatelab/' + m[1]);
  }
  window.addEventListener('hashchange', guard);
  guard();

  /* ---------------- Gate Lab view ---------------- */
  const LCARD = 'bg-card border border-slate-800 rounded-2xl p-5 md:p-6';
  const INPUT = 'mt-1 w-full bg-ink border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-liq';
  const CHECKS = [
    { key: 'sweep', label: 'Liquidity Sweep' },
    { key: 'choch', label: 'CHoCH (body close)' },
    { key: 'fvg', label: 'FVG' },
    { key: 'ob', label: 'Order Block' },
    { key: 'pd', label: 'Sahi Premium/Discount' }
  ];
  const GATE_NAMES = { gate2: 'Milestone Gate 2', gate3: 'Milestone Gate 3', gate4: 'Milestone Gate 4' };

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function quizPassed(gid) {
    const g = Store.get('gates', {});
    return !!(g && g[gid] && g[gid].passed);
  }
  function bar(pct, ok) {
    return '<div class="h-2 mt-3 rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full ' + (ok ? 'bg-bull' : 'bg-liq') +
      '" style="width:' + Math.round(pct) + '%"></div></div>';
  }
  function gateHead(gid, req, need, focus) {
    const passed = quizPassed(gid);
    const chip = passed
      ? '<span class="px-2 py-1 rounded bg-bull/15 text-bull text-xs font-semibold">✅ Gate Passed</span>'
      : req.ok
        ? '<span class="px-2 py-1 rounded bg-bull/15 text-bull text-xs font-semibold">Practical ✓ — quiz baqi</span>'
        : '<span class="px-2 py-1 rounded bg-liq/15 text-liq text-xs font-semibold">Practical jari</span>';
    const btn = passed ? ''
      : req.ok
        ? '<button type="button" data-quiz="' + gid + '" class="mt-4 px-4 py-2 rounded-lg bg-bull text-ink font-semibold hover:bg-emerald-400 text-sm">' + GATE_NAMES[gid] + ' quiz attempt karo →</button>'
        : '<p class="mt-4 text-xs text-slate-500">Quiz tab khulega jab practical shart poori ho.</p>';
    return '<section data-card="' + gid + '" class="' + LCARD + (focus === gid ? ' ring-2 ring-liq' : '') + '">' +
      '<div class="flex flex-wrap items-start justify-between gap-2">' +
        '<div><h2 class="text-lg font-bold text-white">🏁 ' + GATE_NAMES[gid] + '</h2>' +
        '<p class="text-sm text-slate-400 mt-1">' + need + '</p></div>' + chip +
      '</div>' +
      '<p class="text-sm text-slate-200 mt-3 font-semibold">' + App.esc(req.summary) + '</p>' + bar(req.pct, req.ok) + btn;
  }

  function setupRow(s) {
    const esc = App.esc;
    const valid = isValidSetup(s);
    const chips = CHECKS.map((c) => '<span class="px-1.5 py-0.5 rounded text-[11px] ' +
      (s[c.key] ? 'bg-bull/10 text-bull' : 'bg-slate-800 text-slate-500 line-through') + '">' + c.label + '</span>').join(' ');
    return '<li class="p-3 rounded-lg bg-ink/60 border ' + (valid ? 'border-bull/30' : 'border-slate-800') + '">' +
      '<div class="flex flex-wrap items-center gap-2 text-xs">' +
        '<span class="font-semibold text-white">' + esc(s.symbol) + '</span>' +
        '<span class="text-slate-400">' + esc(s.date) + ' · ' + esc(s.tf) + '</span>' +
        '<span class="px-1.5 py-0.5 rounded ' + (s.dir === 'short' ? 'bg-bear/15 text-bear' : 'bg-bull/15 text-bull') + '">' + (s.dir === 'short' ? 'Short' : 'Long') + '</span>' +
        '<span class="font-semibold ' + (valid ? 'text-bull' : 'text-liq') + '">' + (valid ? '✓ Valid' : '✗ Valid nahi') + '</span>' +
        '<button type="button" data-del="' + esc(s.id) + '" class="ml-auto text-slate-500 hover:text-bear" aria-label="Delete setup">🗑</button>' +
      '</div>' +
      '<div class="flex flex-wrap gap-1 mt-2">' + chips + '</div>' +
      (s.note ? '<p class="text-xs text-slate-400 mt-2">' + esc(s.note) + '</p>' : '') +
    '</li>';
  }

  function renderGateLab(el, params) {
    const focus = params && REQ[params[0]] ? params[0] : null;
    let showAll = false;

    function draw() {
      const r2 = REQ.gate2(), r3 = REQ.gate3(), r4 = REQ.gate4();
      const setups = listOf('setups').slice().reverse();
      const shown = showAll ? setups : setups.slice(0, 10);
      const blocked = focus && !REQ[focus]().ok;

      el.innerHTML =
        '<div class="max-w-4xl mx-auto space-y-6">' +
          '<div>' +
            '<p class="text-xs uppercase tracking-widest text-liq font-semibold">Practical Milestones</p>' +
            '<h1 class="text-2xl md:text-3xl font-bold text-white mt-1">🏁 Gate Lab</h1>' +
            '<p class="text-slate-400 mt-1 text-sm leading-6">Gates 2, 3 aur 4 ke do hisse hain: pehle **practical shart** (yahan), phir quiz (Curriculum mein). Practical poora kiye baghair quiz nahi khulta.</p>'.replace(/\*\*(.+?)\*\*/g, '<b class="text-white">$1</b>') +
          '</div>' +
          (blocked ? '<div class="p-4 rounded-xl border border-liq/40 bg-liq/10 text-sm text-amber-200">🔒 <b>' + GATE_NAMES[focus] + '</b> ka quiz abhi locked hai. Neeche wali practical shart poori karo, phir quiz attempt karo.</div>' : '') +

          /* Gate 2 + Setup Logger */
          gateHead('gate2', r2, 'Shart: **20 valid setups** (Liquidity Sweep + CHoCH + FVG ya OB) record karo.'.replace(/\*\*(.+?)\*\*/g, '<b class="text-white">$1</b>'), focus) +
            '<form data-setup-form class="grid gap-3 sm:grid-cols-2 mt-5 pt-5 border-t border-slate-800">' +
              '<h3 class="sm:col-span-2 font-semibold text-white">📝 Setup Logger</h3>' +
              '<label class="text-xs text-slate-400">Date<input type="date" name="date" value="' + todayStr() + '" class="' + INPUT + '"></label>' +
              '<label class="text-xs text-slate-400">Symbol<input name="symbol" placeholder="EURUSD" maxlength="20" autocomplete="off" class="' + INPUT + ' uppercase"></label>' +
              '<label class="text-xs text-slate-400">Timeframe<select name="tf" class="' + INPUT + '">' +
                ['1M', '5M', '15M', '1H', '4H'].map((t) => '<option' + (t === '15M' ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></label>' +
              '<label class="text-xs text-slate-400">Direction<select name="dir" class="' + INPUT + '"><option value="long">Long (Bullish)</option><option value="short">Short (Bearish)</option></select></label>' +
              '<fieldset class="sm:col-span-2"><legend class="text-xs text-slate-400 mb-2">Setup mein kya kya mojood hai?</legend>' +
                '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">' + CHECKS.map((c) =>
                  '<label class="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-ink/50 text-sm text-slate-300 cursor-pointer has-[:checked]:border-bull has-[:checked]:text-white">' +
                  '<input type="checkbox" name="' + c.key + '" class="accent-emerald-500 w-4 h-4">' + c.label + '</label>').join('') +
                '</div></fieldset>' +
              '<label class="sm:col-span-2 text-xs text-slate-400">Note (optional)<input name="note" maxlength="200" placeholder="Jaise: Asian low sweep, 15M CHoCH, FVG Discount mein" class="' + INPUT + '"></label>' +
              '<button type="submit" class="sm:col-span-2 px-4 py-2.5 rounded-lg bg-liq text-ink font-bold hover:bg-amber-400 text-sm">+ Setup save karo</button>' +
            '</form>' +
            '<div class="mt-5">' +
              '<p class="text-xs text-slate-400">Kul ' + r2.total + ' setups · ' + r2.valid + ' valid</p>' +
              (shown.length ? '<ul class="mt-2 space-y-2">' + shown.map(setupRow).join('') + '</ul>' : '<p class="text-sm text-slate-500 mt-2">Abhi koi setup record nahi hua.</p>') +
              (setups.length > 10 ? '<button type="button" data-showall class="mt-3 text-xs text-liq hover:underline">' + (showAll ? 'Sirf aakhri 10 dikhao' : 'Saare ' + setups.length + ' setups dikhao') + '</button>' : '') +
            '</div>' +
          '</section>' +

          /* Gate 3 */
          gateHead('gate3', r3, 'Shart: Store mein <b class="text-white">50 backtest trades</b> aur <b class="text-white">Expectancy ≥ +0.35R</b>.', focus) +
            '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">' +
              '<div class="p-3 rounded-lg bg-ink/60 border border-slate-800"><p class="text-[11px] text-slate-500">Trades</p><p class="text-lg font-bold text-white">' + r3.n + '</p></div>' +
              '<div class="p-3 rounded-lg bg-ink/60 border border-slate-800"><p class="text-[11px] text-slate-500">Expectancy</p><p class="text-lg font-bold ' + (r3.e >= 0.35 ? 'text-bull' : 'text-liq') + '">' + fmtR(r3.e) + '</p></div>' +
              '<div class="p-3 rounded-lg bg-ink/60 border border-slate-800"><p class="text-[11px] text-slate-500">Win rate</p><p class="text-lg font-bold text-white">' + r3.winRate + '%</p></div>' +
              '<div class="p-3 rounded-lg bg-ink/60 border border-slate-800"><p class="text-[11px] text-slate-500">Total</p><p class="text-lg font-bold ' + (r3.total >= 0 ? 'text-bull' : 'text-bear') + '">' + fmtR(r3.total) + '</p></div>' +
            '</div>' +
            '<p class="text-xs text-slate-400 mt-3 leading-5">Expectancy = sab trades ke R result ka average. Har trade ka <b class="text-slate-200">weighted R</b> (3-Stage exit ka total) backtest/journal module se Store "backtest" mein save hota hai.</p>' +
          '</section>' +

          /* Gate 4 */
          gateHead('gate4', r4, 'Shart: Store mein <b class="text-white">20 demo trades</b> aur <b class="text-white">Rule Compliance ≥ 90%</b>.', focus) +
            '<div class="grid grid-cols-2 gap-3 mt-4 text-center">' +
              '<div class="p-3 rounded-lg bg-ink/60 border border-slate-800"><p class="text-[11px] text-slate-500">Demo trades</p><p class="text-lg font-bold text-white">' + r4.n + '</p></div>' +
              '<div class="p-3 rounded-lg bg-ink/60 border border-slate-800"><p class="text-[11px] text-slate-500">Rule Compliance</p><p class="text-lg font-bold ' + (r4.c >= 90 ? 'text-bull' : 'text-liq') + '">' + r4.c.toFixed(1) + '%</p></div>' +
            '</div>' +
            '<p class="text-xs text-slate-400 mt-3">Har demo trade in 9 rules par check hoti hai (compliance = ✓ rules ÷ kul rules, sab trades ka average):</p>' +
            '<ol class="mt-2 space-y-1 list-decimal ml-5 text-sm text-slate-300 marker:text-liq">' + DEMO_RULES.map((r) => '<li>' + App.esc(r.text) + '</li>').join('') + '</ol>' +
          '</section>' +
        '</div>';
    }
    draw();

    el.addEventListener('submit', (e) => {
      const f = e.target.closest('[data-setup-form]');
      if (!f) return;
      e.preventDefault();
      const fd = new FormData(f);
      const symbol = String(fd.get('symbol') || '').trim().toUpperCase().slice(0, 20);
      if (!symbol) { App.toast('Symbol likho (jaise EURUSD).', 'warn'); return; }
      const s = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        ts: Date.now(),
        date: String(fd.get('date') || todayStr()),
        symbol,
        tf: String(fd.get('tf') || ''),
        dir: fd.get('dir') === 'short' ? 'short' : 'long',
        note: String(fd.get('note') || '').trim().slice(0, 200)
      };
      CHECKS.forEach((c) => { s[c.key] = fd.has(c.key); });
      const before = REQ.gate2().ok;
      const list = listOf('setups').slice();
      list.push(s);
      Store.set('setups', list);
      const now = REQ.gate2();
      if (!isValidSetup(s)) App.toast('Save ho gaya, lekin VALID nahi (Sweep + CHoCH + FVG/OB chahiye) — gate mein count nahi hoga.', 'warn');
      else if (!before && now.ok) App.toast('Shabash! 20 valid setups poore — ab Gate 2 quiz attempt karo.', 'success');
      else App.toast('Valid setup save ho gaya ✓ (' + now.valid + '/20)', 'success');
      draw();
    });

    el.addEventListener('click', (e) => {
      const q = e.target.closest('[data-quiz]');
      if (q) { App.navigate('course', 'gate', q.dataset.quiz); return; }
      if (e.target.closest('[data-showall]')) { showAll = !showAll; draw(); return; }
      const d = e.target.closest('[data-del]');
      if (d && window.confirm('Yeh setup delete karna hai?')) {
        Store.set('setups', listOf('setups').filter((s) => s.id !== d.dataset.del));
        draw();
      }
    });
  }

  App.registerModule({ id: 'gatelab', title: 'Gate Lab', icon: '🏁', order: 11, render: renderGateLab });

  // Doosre modules (journal / backtest) ke liye
  window.GateLab = Object.freeze({
    DEMO_RULES,
    requirement: (gid) => (REQ[gid] ? REQ[gid]() : null),
    isValidSetup
  });
})();
