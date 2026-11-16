/* =====================================================================
   flashcards.js — PART 5: MODULE 6 · Flashcards + Quick Drills
   ---------------------------------------------------------------------
   - 25 Roman Urdu flashcards (Day 0 se Phase 4 tak), 3D flip animation
   - "Mujhe aata hai" / "Dobara dikhao" -> Leitner box (0-4). Kamzor
     cards zyada baar aate hain; "Dobara" wala card 3 cards baad wapas.
   - Quick Drills: MCQ sawal, har sawal ek card se juda; ghalat jawab =
     woh card kamzor (box 0)
   - 5-minute daily revision timer + streak

   Store key: "flashcards" ->
     { cards:    { <cardId>: { box:0-4, seen, ok, again, last:ts } },
       revision: { date:'YYYY-MM-DD', sec:Number },
       streak:   { last:'YYYY-MM-DD', count:Number },
       drills:   { best:Number, last:Number, runs:Number } }

   Routes: #/flashcards (cards)  ·  #/flashcards/drill (quick drills)
   Keyboard (cards view): Space/Enter = flip, 1 = Mujhe aata hai, 2 = Dobara
   ===================================================================== */
(function () {
  'use strict';

  const esc = App.esc;
  const todayKey = App.todayKey;

  /* ------------------------------------------------------------------
     1) CONTENT — 25 cards
     ------------------------------------------------------------------ */
  const TOPICS = { d0: 'Day 0', p1: 'Phase 1', p2: 'Phase 2', p3: 'Phase 3', p4: 'Phase 4' };

  const CARDS = [
    // ---- DAY 0: Basics ----
    { id: 'd0-pip', t: 'd0', front: 'Pip, Lot aur Leverage — asal khatra kahan hai?',
      back: 'Pip = price ki chhoti standard move (EURUSD mein 0.0001). Lot = size: Standard 100,000 units, Mini 0.1, Micro 0.01. Leverage chhote Margin se bari position kholta hai — 1:100 par poora margin laga ho to 1% ulti move = taqreeban poora margin khatam. Asal risk Position Size hai, leverage nahi.' },
    { id: 'd0-orders', t: 'd0', front: 'Market, Limit aur Stop order mein farq? Spread kya hai?',
      back: 'Market = abhi foran (spread + slippage ke saath). Limit = behtar price ka intezar (buy neeche, sell upar) — OTE/FVG entries isi se. Stop = level cross hone par trigger (Stop-Loss, breakout). Spread = Bid aur Ask ka farq — har trade ki chhupi fees.' },
    { id: 'd0-crypto', t: 'd0', front: 'Crypto perpetuals: Funding Fee aur Liquidation?',
      back: 'Funding Fee = har kuch ghante (aksar 8h) long aur short ek doosre ko dete hain taake price spot ke qareeb rahe. Liquidation = margin khatam hone par exchange position zabardasti band kar deta hai. Jitna zyada leverage, liquidation price utni entry ke qareeb.' },

    // ---- PHASE 1: Market Structure ----
    { id: 'p1-auction', t: 'p1', front: 'Auction Theory: price asal mein kyun move karti hai?',
      back: 'Market ek auction hai — price orders (liquidity) dhoondhne ke liye move karti hai. Institutions ki quantity itni bari hoti hai ke ek price par poori nahi bharti (Institutional Slippage), is liye woh un jagahon ki taraf jaate hain jahan bohot orders/stops jama hon.' },
    { id: 'p1-candle', t: 'p1', front: 'Displacement body vs Rejection wick?',
      back: 'Displacement = bari, taqatwar body jo structure toray — institutional commitment. Rejection wick = lambi wick jo batati hai ke price us level par qubool nahi hui. Body = faisla, wick = test.' },
    { id: 'p1-states', t: 'p1', front: 'Market ki 3 states kaise pehchano?',
      back: 'Bullish = Higher Highs + Higher Lows. Bearish = Lower Highs + Lower Lows. Range = price do levels ke beech, naya HH/LL confirm nahi. Har state ka plan alag: trend mein pullback, range mein extremes.' },
    { id: 'p1-sd', t: 'p1', front: 'Supply/Demand zone retail Support/Resistance se kaise alag hai?',
      back: 'Retail S/R = lines jahan bohot touches — wahan sab ke stops jama hote hain (liquidity). Supply/Demand zone = woh base jahan se Displacement nikla (institutional orders). Bar bar test hone wala level kamzor hota hai, mazboot nahi.' },
    { id: 'p1-bos', t: 'p1', front: 'BOS aur CHoCH — aur Candle Body Close Rule?',
      back: 'BOS = trend ki simt mein structure break (continuation). CHoCH = trend ke ulat pehla break (reversal ki pehli nishani). Break tabhi valid jab candle ki BODY level ke paar close ho — sirf wick = Liquidity Sweep, break nahi.' },
    { id: 'p1-swing', t: 'p1', front: 'Swing structure vs Internal structure?',
      back: 'Swing = bare, HTF major highs/lows (asal trend). Internal = swing ke andar pullback ke chhote highs/lows. Internal CHoCH aksar sirf pullback hota hai — bias hamesha swing structure se lo.' },

    // ---- PHASE 2: Liquidity & Footprints ----
    { id: 'p2-bsl', t: 'p2', front: 'BSL aur SSL kya hain?',
      back: 'Buy-side Liquidity (BSL) = highs ke upar jama buy stops (sellers ke SL + breakout buyers). Sell-side Liquidity (SSL) = lows ke neeche sell stops. Equal highs / equal lows = sab se mota liquidity pool — price wahan zaroor jaati hai.' },
    { id: 'p2-sweep', t: 'p2', front: 'Liquidity Sweep (Stop-hunt) aur Inducement?',
      back: 'Sweep = price high/low ke paar wick maar kar stops le aur wapas andar close ho. Inducement = chhota, wazeh level jo retail ko jaldi entry par uksaata hai — unke stops asal move ka fuel bante hain. Pehle sweep, phir entry.' },
    { id: 'p2-ob', t: 'p2', front: 'Bullish Order Block kya hai?',
      back: 'Displacement se pehle ki AAKHRI bearish (down) candle, jis ke baad taqatwar move aur BOS aaya. Wapsi par wahan institutional buy orders ka zone. Bearish OB = rally ke baad girawat se pehle ki aakhri up candle.' },
    { id: 'p2-breaker', t: 'p2', front: 'Breaker Block kya hai?',
      back: 'Woh Order Block jo fail ho jaye — price usay body se tod kar paar close kare. Phir woh zone ulta role leta hai (fail bullish OB → resistance). Aksar liquidity sweep ke baad banta hai.' },
    { id: 'p2-fvg', t: 'p2', front: 'Fair Value Gap (FVG) aur FVG Inversion?',
      back: '3 candles: Bullish FVG = candle 1 ki HIGH aur candle 3 ki LOW ke beech ka khaali gap (beech wali bari candle ka imbalance). Price aksar wapas aa kar rebalance karti hai. Agar body FVG ke paar close ho kar ulta react kare = Inversion (support → resistance).' },
    { id: 'p2-pd', t: 'p2', front: 'Premium vs Discount (Equilibrium)?',
      back: 'Swing range ka 50% = Equilibrium. 50% se upar = Premium (sell ki jagah), neeche = Discount (buy ki jagah). Buy sirf Discount mein, sell sirf Premium mein — mehngi cheez mat khareedo.' },

    // ---- PHASE 3: Multi-Timeframe & Entry/Exit ----
    { id: 'p3-topdown', t: 'p3', front: 'Top-Down Analysis ka tareeqa?',
      back: 'HTF (Daily/4H) se bias aur liquidity targets → 1H/15M par setup zone → 5M/1M par entry trigger (CHoCH). HTF bias ke khilaaf LTF entry = kam probability.' },
    { id: 'p3-amd', t: 'p3', front: 'Killzones aur AMD (Power of 3)?',
      back: 'Killzones = London aur New York open ke high-volume ghante. AMD = Accumulation (Asian range) → Manipulation (range ka sweep / Judas swing) → Distribution (asal move). Entry manipulation ke BAAD, us ke saath nahi.' },
    { id: 'p3-ote', t: 'p3', front: 'OTE zone aur Structural Stop-Loss?',
      back: 'OTE = impulse leg ka 61.8%–79% Fibonacci retracement. Yahan FVG/OB mile to Limit order — price ka peecha nahi. SL = sweep wali wick / structural swing ke bahar thore buffer ke saath — jahan setup ghalat sabit ho. "X pips" wala SL nahi.' },
    { id: 'p3-exit', t: 'p3', front: '3-Stage Exit Plan aur targets?',
      back: 'Position 33% / 33% / 34%: TP1 qareebi internal liquidity, TP2 agla target, TP3 HTF liquidity tak runner. Journal mein weighted total R likho (jaise +1.3R). Beech mein mann marzi exit = backtest aur live ka farq.' },
    { id: 'p3-backtest', t: 'p3', front: 'Gate 3: backtest ki shart aur Expectancy formula?',
      back: '50 trades, sab rules ke mutabiq, har trade ka asal R — losses delete nahi. Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss) = sab R ka average. Gate 3: E ≥ +0.35R.' },

    // ---- PHASE 4: Risk Math & Psychology ----
    { id: 'p4-risk', t: 'p4', front: '1% Risk Rule se Position Size kaise?',
      back: 'Risk $ = Account × 1%. Lot = Risk $ ÷ (SL pips × pip value per lot). Misaal: $10,000, SL 20 pips, $10/pip → $100 ÷ (20 × $10) = 0.5 lot. Fees/spread Expectancy ko khaate hain — unhein bhi hisaab mein lo.' },
    { id: 'p4-heat', t: 'p4', front: 'Portfolio Heat aur Drawdown recovery?',
      back: 'Portfolio Heat = saari khuli trades ka kul risk — 5-6% se zyada nahi. Recovery math: −10% ke baad +11.1%, −20% ke baad +25%, −50% ke baad +100% chahiye. Drawdown 5% par risk aadha, 10% par live band aur review.' },
    { id: 'p4-douglas', t: 'p4', front: 'Mark Douglas ki probabilistic soch?',
      back: 'Kuch bhi ho sakta hai; profit ke liye agla qadam jaanna zaroori nahi; jeet/haar ka distribution random hai; edge sirf probability hai; har lamha unique hai. Is liye akeli trade nahi, 20 trades ka batch dekho.' },
    { id: 'p4-cb', t: 'p4', front: 'Daily 2-Loss Circuit Breaker, Anti-FOMO aur News filter?',
      back: 'Ek din mein 2 losses = us din trading BAND, setup kitna hi acha lage. Anti-FOMO: chhooti move ka peecha nahi, checklist ke baghair entry nahi. CPI / NFP / FOMC window mein nayi entry nahi.' },
    { id: 'p4-journal', t: 'p4', front: 'Good Loss vs Bad Win — journal kya grade kare?',
      back: 'Good Loss = saare rules follow, phir bhi SL — process sahi, nateeja random. Bad Win = rule tod kar profit — sab se khatarnak, ghalat aadat ko inaam. Journal process ko grade kare. Gate 4: 20 demo trades, compliance ≥ 90%.' }
  ];

  /* Quick Drills — har sawal ek card se juda (card = kamzori track karne ke liye) */
  const DRILLS = [
    { card: 'd0-pip', q: '1:100 leverage, poora margin laga hai, price 1% ulti gayi. Margin ka kya hua?', o: ['1% gaya', '10% gaya', 'Taqreeban 100% gaya', 'Kuch nahi hua'], a: 2, why: '100 × 1% = 100%. Is liye position size 1% risk rule se nikalo, leverage se nahi.' },
    { card: 'd0-orders', q: 'Price 1.1050 hai, aap 1.1020 (OTE) par BUY karna chahte ho. Kaun sa order?', o: ['Buy Market', 'Buy Limit', 'Buy Stop', 'Sell Limit'], a: 1, why: 'Abhi ki price se neeche buy = Buy Limit.' },
    { card: 'p1-states', q: 'Lower Highs + Lower Lows ka matlab?', o: ['Bullish trend', 'Range', 'Bearish trend', 'Accumulation'], a: 2, why: 'LH + LL = Bearish structure.' },
    { card: 'p1-bos', q: 'Price ne pichli high ke upar sirf WICK nikali, body neeche close hui. Yeh kya hai?', o: ['Bullish BOS', 'Liquidity Sweep — break nahi', 'Bullish CHoCH', 'Breaker Block'], a: 1, why: 'Body Close Rule: sirf wick = sweep. BOS/CHoCH ke liye body paar close honi chahiye.' },
    { card: 'p1-swing', q: 'Daily bearish hai, 5M par internal CHoCH upar ki taraf hua. Sab se behtar soch?', o: ['Foran long — trend badal gaya', 'Yeh aksar pullback hai; bias swing (Daily) se lo', 'Daily ignore karo', 'Dono taraf trade lo'], a: 1, why: 'Internal CHoCH swing trend nahi badalta — sirf pullback ho sakta hai.' },
    { card: 'p2-ob', q: 'Bullish Order Block kaun si candle hai?', o: ['Displacement ke baad pehli green candle', 'Displacement se pehle ki aakhri bearish candle', 'Sab se lambi wick wali candle', 'Range ki pehli candle'], a: 1, why: 'Taqatwar up-move se pehle ki aakhri down candle = Bullish OB.' },
    { card: 'p2-fvg', q: 'Bullish FVG ka gap kahan hota hai?', o: ['Candle 1 ki low aur candle 3 ki high ke beech', 'Candle 1 ki high aur candle 3 ki low ke beech', 'Do candles ke overlap mein', 'Lambi upper wick mein'], a: 1, why: 'Candle 1 ki HIGH aur candle 3 ki LOW ke beech jo khaali jagah = Bullish FVG.' },
    { card: 'p2-pd', q: 'Range 1.1000 – 1.1100. Long ke liye behtar jagah?', o: ['1.1080 (Premium)', '1.1030 (Discount)', '1.1050 se upar kahin bhi', 'Breakout 1.1101 par'], a: 1, why: '50% = 1.1050. Is se neeche Discount — buy wahan.' },
    { card: 'p2-sweep', q: 'Structural Stop-Loss kahan lagna chahiye?', o: ['Entry se fix 10 pips', 'Qareebi round number par', 'Sweep wick / swing point ke bahar, buffer ke saath', 'Koi SL nahi — mental stop'], a: 2, why: 'SL wahan jahan pahunch kar setup ghalat sabit ho — sweep wick ke bahar.' },
    { card: 'p3-ote', q: 'OTE zone ka Fibonacci range?', o: ['23.6% – 38.2%', '38.2% – 50%', '61.8% – 79%', '100% – 127%'], a: 2, why: 'Optimal Trade Entry = 61.8% – 79% retracement.' },
    { card: 'p3-amd', q: 'AMD mein "Manipulation" aksar kya hota hai?', o: ['Asian range ka false break / sweep', 'News candle', 'Weekly close', 'Spread ka barhna'], a: 0, why: 'Asian range ke ek taraf sweep (Judas swing), phir asal move doosri taraf.' },
    { card: 'p3-backtest', q: '50 backtest trades ka total +20R hai. Expectancy?', o: ['+0.20R', '+0.40R', '+2.5R', '+20R'], a: 1, why: '20 ÷ 50 = +0.40R — Gate 3 ki +0.35R shart poori.' },
    { card: 'p4-risk', q: '$5,000 account, 1% risk, SL 25 pips, $10/pip per lot. Lot size?', o: ['0.1 lot', '0.2 lot', '0.5 lot', '2 lot'], a: 1, why: '$50 ÷ (25 × $10) = 0.2 lot.' },
    { card: 'p4-heat', q: 'Account 20% drawdown mein hai. Wapas break-even ke liye kitna return?', o: ['+20%', '+25%', '+15%', '+40%'], a: 1, why: '80 se 100 = +25%. Drawdown gehra ho to recovery aur mushkil.' },
    { card: 'p4-cb', q: 'Aaj 2 losses ho chuke, phir ek A+ setup nazar aaya. Kya karna hai?', o: ['Le lo — A+ hai', 'Aadhe risk se le lo', 'Trade nahi — Circuit Breaker, kal dekho', 'Double risk se loss recover karo'], a: 2, why: '2 losses = din khatam. Koi exception nahi — yahi discipline hai.' },
    { card: 'p4-journal', q: 'Rules tod kar trade +3R par band hui. Journal grade?', o: ['Good Win', 'Bad Win', 'Good Loss', 'Neutral'], a: 1, why: 'Process ghalat tha — profit ne ghalat aadat ko inaam diya. Bad Win.' }
  ];

  const DAILY_SEC = 5 * 60;                 // 5-minute daily revision
  const DRILL_LEN = 5;                      // ek drill round mein sawal
  const WEIGHT = [6, 4, 2, 1, 0.5];         // box 0 (kamzor) sab se zyada aata hai
  const UNSEEN_WEIGHT = 3;                  // naya card

  /* ------------------------------------------------------------------
     2) STATE (Store "flashcards")
     ------------------------------------------------------------------ */
  function loadState() {
    const s = Store.get('flashcards', {});
    const st = s && typeof s === 'object' && !Array.isArray(s) ? s : {};
    st.cards = st.cards && typeof st.cards === 'object' ? st.cards : {};
    st.revision = st.revision && st.revision.date === todayKey() ? st.revision : { date: todayKey(), sec: 0 }; // naya din = timer reset
    st.streak = st.streak || { last: '', count: 0 };
    st.drills = st.drills || { best: 0, last: 0, runs: 0 };
    return st;
  }
  const saveState = (st) => Store.set('flashcards', st);
  const rec = (st, id) => st.cards[id] || (st.cards[id] = { box: 0, seen: 0, ok: 0, again: 0, last: 0 });
  const isWeak = (st, id) => !!(st.cards[id] && st.cards[id].seen && st.cards[id].box === 0);

  function yesterdayKey() {
    const d = new Date();
    return todayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  }

  /* Weighted random card: kamzor zyada, mazboot kam. `exclude` = abhi wala card */
  function weightedPick(st, pool, exclude) {
    const list = pool.length > 1 ? pool.filter((c) => c.id !== exclude) : pool;
    const w = list.map((c) => (st.cards[c.id] && st.cards[c.id].seen ? WEIGHT[st.cards[c.id].box] || 1 : UNSEEN_WEIGHT));
    let x = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) { x -= w[i]; if (x <= 0) return list[i]; }
    return list[list.length - 1];
  }

  /* Flip animation CSS (sirf ek baar inject) */
  function injectCSS() {
    if (document.getElementById('fc-style')) return;
    const s = document.createElement('style');
    s.id = 'fc-style';
    s.textContent =
      '.fc-scene{perspective:1200px}' +
      '.fc-inner{position:relative;width:100%;height:100%;transition:transform .55s cubic-bezier(.2,.7,.2,1);transform-style:preserve-3d}' +
      '.fc-inner.is-flipped{transform:rotateY(180deg)}' +
      '.fc-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}' +
      '.fc-back{transform:rotateY(180deg)}' +
      '@media (prefers-reduced-motion:reduce){.fc-inner{transition:none}}';
    document.head.appendChild(s);
  }

  const CARD = 'bg-card border border-slate-800 rounded-2xl p-5 md:p-6';
  const fmtTime = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

  /* ------------------------------------------------------------------
     3) MODULE RENDER
     ------------------------------------------------------------------ */
  function render(el, params) {
    injectCSS();
    const view = params && params[0] === 'drill' ? 'drill' : 'cards';
    let st = loadState();

    // Cards view ki session state
    let topic = 'all';
    let current = null;
    let flipped = false;
    let againQueue = [];          // [{ id, wait }] — "Dobara dikhao" wale cards jaldi wapas
    let sessionDone = 0;

    // Drill view ki state
    let drill = null;             // { qs:[], i, score, answered }

    // Timer state
    let running = false;

    /* ---------- Shell ---------- */
    const tabBtn = (id, label) => '<button type="button" data-view="' + id + '" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition ' +
      (view === id ? 'bg-bull text-ink' : 'text-slate-300 hover:bg-slate-800') + '">' + label + '</button>';
    el.innerHTML =
      '<div class="max-w-5xl mx-auto space-y-6">' +
        '<div>' +
          '<p class="text-xs uppercase tracking-widest text-liq font-semibold">Module 6</p>' +
          '<h1 class="text-2xl md:text-3xl font-bold text-white mt-1">🧠 Flashcards & Drills</h1>' +
          '<p class="text-slate-400 mt-1 text-sm leading-6">Roz 5 minute. Jo card kamzor hai woh zyada aayega — jab tak pakka na ho jaye.</p>' +
        '</div>' +
        '<div class="grid gap-4 md:grid-cols-3">' +
          '<div data-timer class="' + CARD + '"></div>' +
          '<div data-stats class="' + CARD + ' md:col-span-2"></div>' +
        '</div>' +
        '<div class="flex gap-2 p-1 rounded-xl bg-card border border-slate-800 w-full sm:w-fit">' +
          tabBtn('cards', '🃏 Flashcards') + tabBtn('drill', '⚡ Quick Drill') +
        '</div>' +
        '<div data-main></div>' +
      '</div>';
    const $timer = el.querySelector('[data-timer]');
    const $stats = el.querySelector('[data-stats]');
    const $main = el.querySelector('[data-main]');

    /* ---------- Timer (5-minute daily revision) ---------- */
    function drawTimer() {
      const sec = Math.min(DAILY_SEC, st.revision.sec);
      const done = sec >= DAILY_SEC;
      const C = 2 * Math.PI * 42;                               // ring circumference
      const off = C * (1 - sec / DAILY_SEC);
      $timer.innerHTML =
        '<div class="flex items-center gap-4">' +
          '<svg viewBox="0 0 100 100" class="w-24 h-24 shrink-0 -rotate-90" aria-hidden="true">' +
            '<circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" stroke-width="8"/>' +
            '<circle cx="50" cy="50" r="42" fill="none" stroke="' + (done ? '#10b981' : '#f59e0b') + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
          '</svg>' +
          '<div class="min-w-0">' +
            '<p class="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Daily Revision</p>' +
            '<p class="text-3xl font-mono font-bold ' + (done ? 'text-bull' : 'text-white') + '">' + (done ? '✅' : fmtTime(DAILY_SEC - sec)) + '</p>' +
            '<p class="text-xs text-slate-400">' + (done ? 'Aaj ki 5 minute poori!' : 'baqi') + ' · 🔥 ' + st.streak.count + ' din streak</p>' +
          '</div>' +
        '</div>' +
        (done ? '' :
          '<div class="mt-4 flex gap-2">' +
            '<button type="button" data-timer-act="toggle" class="flex-1 px-3 py-2 rounded-lg text-sm font-semibold ' + (running ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-bull text-ink hover:bg-emerald-400') + '">' + (running ? '⏸ Pause' : '▶ Start') + '</button>' +
          '</div>');
    }

    function tickTimer() {
      if (!running) return;
      if (todayKey() !== st.revision.date) st.revision = { date: todayKey(), sec: 0 };   // aadhi raat guzri
      st.revision.sec = Math.min(DAILY_SEC, st.revision.sec + 1);
      if (st.revision.sec >= DAILY_SEC) {
        running = false;
        const today = todayKey();
        if (st.streak.last !== today) {
          st.streak.count = st.streak.last === yesterdayKey() ? st.streak.count + 1 : 1;
          st.streak.last = today;
        }
        saveState(st);
        App.toast('🎉 Aaj ki 5-minute revision mukammal! Streak: ' + st.streak.count + ' din', 'success');
      } else if (st.revision.sec % 5 === 0) {
        saveState(st);                                          // har 5 second save
      }
      drawTimer();
    }

    /* ---------- Stats ---------- */
    function drawStats() {
      const seen = CARDS.filter((c) => st.cards[c.id] && st.cards[c.id].seen).length;
      const strong = CARDS.filter((c) => st.cards[c.id] && st.cards[c.id].box >= 3).length;
      const weak = CARDS.filter((c) => isWeak(st, c.id));
      const box = (label, val, cls) => '<div class="p-3 rounded-xl bg-ink/60 border border-slate-800 text-center"><p class="text-[11px] text-slate-500">' + label + '</p><p class="text-xl font-bold ' + cls + '">' + val + '</p></div>';
      $stats.innerHTML =
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
          box('Kul cards', CARDS.length, 'text-white') +
          box('Naye (unseen)', CARDS.length - seen, 'text-slate-300') +
          box('Mazboot', strong, 'text-bull') +
          box('Kamzor', weak.length, weak.length ? 'text-bear' : 'text-slate-500') +
        '</div>' +
        '<div class="h-2 mt-4 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-bull rounded-full" style="width:' + Math.round((strong / CARDS.length) * 100) + '%"></div></div>' +
        '<p class="text-xs text-slate-400 mt-2">Mastery: ' + strong + ' / ' + CARDS.length + ' cards · Drill best: ' + st.drills.best + '/' + DRILL_LEN + '</p>' +
        (weak.length
          ? '<div class="mt-3 flex flex-wrap gap-1.5">' + weak.slice(0, 8).map((c) =>
              '<button type="button" data-show="' + c.id + '" class="px-2 py-1 rounded-md bg-bear/10 border border-bear/30 text-[11px] text-red-300 hover:bg-bear/20 truncate max-w-[220px]">' + esc(c.front) + '</button>').join('') + '</div>'
          : '');
    }

    /* ---------- Cards view ---------- */
    function pool() { return topic === 'all' ? CARDS : CARDS.filter((c) => c.t === topic); }

    function nextCard() {
      // Pehle "Dobara" queue: jis ka wait khatam, woh wapas
      againQueue.forEach((q) => { q.wait--; });
      const dueIdx = againQueue.findIndex((q) => q.wait <= 0 && pool().some((c) => c.id === q.id));
      if (dueIdx >= 0) {
        const id = againQueue.splice(dueIdx, 1)[0].id;
        return CARDS.find((c) => c.id === id);
      }
      return weightedPick(st, pool(), current && current.id);
    }

    function drawCards() {
      if (!current || !pool().some((c) => c.id === current.id)) current = weightedPick(st, pool(), null);
      const r = st.cards[current.id];
      const level = !r || !r.seen ? ['Naya', 'text-slate-400'] : r.box === 0 ? ['Kamzor', 'text-bear'] : r.box >= 3 ? ['Mazboot', 'text-bull'] : ['Seekh rahe ho', 'text-liq'];
      const chips = [['all', 'Sab']].concat(Object.keys(TOPICS).map((k) => [k, TOPICS[k]])).map(([k, label]) =>
        '<button type="button" data-topic="' + k + '" class="px-3 py-1 rounded-full text-xs font-semibold border ' +
        (topic === k ? 'bg-liq/15 border-liq/50 text-liq' : 'border-slate-700 text-slate-400 hover:text-white') + '">' + label + '</button>').join('');

      $main.innerHTML =
        '<div class="flex flex-wrap gap-2 mb-4">' + chips + '</div>' +
        '<div data-flip class="fc-scene h-80 sm:h-72 cursor-pointer select-none" role="button" tabindex="0" aria-label="Card palto">' +
          '<div class="fc-inner' + (flipped ? ' is-flipped' : '') + '">' +
            // Front
            '<div class="fc-face rounded-2xl border border-slate-700 bg-gradient-to-br from-card to-ink p-6 flex flex-col">' +
              '<div class="flex justify-between text-[11px] uppercase tracking-wider"><span class="text-liq font-semibold">' + TOPICS[current.t] + '</span><span class="' + level[1] + ' font-semibold">' + level[0] + '</span></div>' +
              '<div class="flex-1 flex items-center justify-center text-center"><p class="text-xl md:text-2xl font-bold text-white leading-snug">' + esc(current.front) + '</p></div>' +
              '<p class="text-center text-xs text-slate-500">👆 Pehle khud socho, phir tap karke palto (Space)</p>' +
            '</div>' +
            // Back
            '<div class="fc-face fc-back rounded-2xl border border-bull/40 bg-card p-6 flex flex-col">' +
              '<p class="text-[11px] uppercase tracking-wider text-bull font-semibold">Jawab</p>' +
              '<div class="flex-1 overflow-y-auto mt-2"><p class="text-sm md:text-base text-slate-200 leading-7">' + esc(current.back) + '</p></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-3 mt-4">' +
          '<button type="button" data-ans="again" ' + (flipped ? '' : 'disabled') + ' class="px-4 py-3 rounded-xl font-semibold text-sm border border-bear/40 bg-bear/10 text-red-300 hover:bg-bear/20 disabled:opacity-40 disabled:cursor-not-allowed">🔁 Dobara dikhao <span class="hidden sm:inline text-xs opacity-60">(2)</span></button>' +
          '<button type="button" data-ans="ok" ' + (flipped ? '' : 'disabled') + ' class="px-4 py-3 rounded-xl font-semibold text-sm bg-bull text-ink hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed">✅ Mujhe aata hai <span class="hidden sm:inline text-xs opacity-60">(1)</span></button>' +
        '</div>' +
        '<p class="text-center text-xs text-slate-500 mt-3">Is session mein ' + sessionDone + ' cards' + (againQueue.length ? ' · ' + againQueue.length + ' jaldi wapas aayenge' : '') + '</p>';
    }

    function flip() {
      flipped = !flipped;
      const inner = $main.querySelector('.fc-inner');
      if (inner) inner.classList.toggle('is-flipped', flipped);   // poora redraw nahi -> animation smooth
      $main.querySelectorAll('[data-ans]').forEach((b) => { b.disabled = !flipped; });
    }

    function answer(ok) {
      if (!flipped || !current) return;
      const r = rec(st, current.id);
      r.seen++; r.last = Date.now();
      if (ok) { r.ok++; r.box = Math.min(4, r.box + 1); }
      else {
        r.again++; r.box = 0;
        againQueue = againQueue.filter((q) => q.id !== current.id);
        againQueue.push({ id: current.id, wait: 3 });          // 3 cards baad dobara
      }
      saveState(st);
      sessionDone++;
      current = nextCard();
      flipped = false;
      drawCards();
      drawStats();
    }

    /* ---------- Drill view ---------- */
    function newDrill() {
      // Kamzor cards wale sawal pehle aane ka zyada chance (weighted, bina repeat)
      const left = DRILLS.slice();
      const qs = [];
      while (qs.length < DRILL_LEN && left.length) {
        const w = left.map((d) => (st.cards[d.card] && st.cards[d.card].seen ? WEIGHT[st.cards[d.card].box] || 1 : UNSEEN_WEIGHT));
        let x = Math.random() * w.reduce((a, b) => a + b, 0);
        let k = 0;
        for (; k < left.length - 1; k++) { x -= w[k]; if (x <= 0) break; }
        qs.push(left.splice(k, 1)[0]);
      }
      drill = { qs, i: 0, score: 0, answered: null };
    }

    function drawDrill() {
      if (!drill) newDrill();
      if (drill.i >= drill.qs.length) {
        const s = drill.score;
        $main.innerHTML =
          '<div class="' + CARD + ' text-center">' +
            '<p class="text-5xl">' + (s === DRILL_LEN ? '🏆' : s >= 3 ? '👍' : '📘') + '</p>' +
            '<h2 class="text-2xl font-bold text-white mt-2">Score: ' + s + ' / ' + drill.qs.length + '</h2>' +
            '<p class="text-sm text-slate-400 mt-2">' + (s === DRILL_LEN ? 'Zabardast! Sab sahi.' : 'Ghalat sawalon ke cards "Kamzor" ho gaye — Flashcards mein woh zyada aayenge.') + '</p>' +
            '<div class="mt-5 flex flex-wrap justify-center gap-2">' +
              '<button type="button" data-drill="restart" class="px-4 py-2 rounded-lg bg-bull text-ink font-semibold text-sm hover:bg-emerald-400">⚡ Naya drill</button>' +
              '<button type="button" data-view="cards" class="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm">🃏 Flashcards</button>' +
            '</div>' +
          '</div>';
        return;
      }
      const d = drill.qs[drill.i];
      const card = CARDS.find((c) => c.id === d.card);
      const ans = drill.answered;
      $main.innerHTML =
        '<div class="' + CARD + '">' +
          '<div class="flex justify-between text-xs text-slate-400"><span class="text-liq font-semibold">' + (card ? TOPICS[card.t] : '') + '</span><span>Sawal ' + (drill.i + 1) + ' / ' + drill.qs.length + ' · Score ' + drill.score + '</span></div>' +
          '<div class="h-1.5 mt-2 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-liq" style="width:' + Math.round((drill.i / drill.qs.length) * 100) + '%"></div></div>' +
          '<h2 class="text-lg md:text-xl font-bold text-white mt-5 leading-snug">' + esc(d.q) + '</h2>' +
          '<div class="mt-4 grid gap-2">' + d.o.map((opt, k) => {
            let cls = 'border-slate-700 bg-ink/60 text-slate-200 hover:border-liq';
            if (ans !== null) {
              if (k === d.a) cls = 'border-bull bg-bull/10 text-emerald-200';
              else if (k === ans) cls = 'border-bear bg-bear/10 text-red-300';
              else cls = 'border-slate-800 bg-ink/40 text-slate-500';
            }
            return '<button type="button" data-opt="' + k + '" ' + (ans !== null ? 'disabled' : '') + ' class="text-left px-4 py-3 rounded-xl border text-sm transition ' + cls + '">' +
              '<span class="font-mono text-xs opacity-60 mr-2">' + 'ABCD'[k] + '</span>' + esc(opt) + '</button>';
          }).join('') + '</div>' +
          (ans !== null
            ? '<div class="mt-4 p-4 rounded-xl border ' + (ans === d.a ? 'border-bull/40 bg-bull/5' : 'border-bear/40 bg-bear/5') + '">' +
                '<p class="font-semibold ' + (ans === d.a ? 'text-bull' : 'text-bear') + '">' + (ans === d.a ? '✅ Sahi!' : '❌ Ghalat') + '</p>' +
                '<p class="text-sm text-slate-300 mt-1 leading-6">' + esc(d.why) + '</p></div>' +
              '<button type="button" data-drill="next" class="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-liq text-ink font-bold text-sm hover:bg-amber-400">' + (drill.i + 1 < drill.qs.length ? 'Agla sawal →' : 'Nateeja dekho →') + '</button>'
            : '') +
        '</div>';
    }

    function pickOption(k) {
      if (!drill || drill.answered !== null) return;
      const d = drill.qs[drill.i];
      drill.answered = k;
      const r = rec(st, d.card);
      r.seen++; r.last = Date.now();
      if (k === d.a) { drill.score++; r.ok++; r.box = Math.min(4, r.box + 1); }
      else { r.again++; r.box = 0; }                            // ghalat = card kamzor
      saveState(st);
      drawDrill();
      drawStats();
    }

    function finishDrillIfDone() {
      if (drill && drill.i >= drill.qs.length) {
        st.drills.last = drill.score;
        st.drills.best = Math.max(st.drills.best || 0, drill.score);
        st.drills.runs = (st.drills.runs || 0) + 1;
        saveState(st);
        drawStats();
      }
    }

    /* ---------- First draw ---------- */
    drawTimer();
    drawStats();
    if (view === 'drill') drawDrill(); else drawCards();

    /* ---------- Events ---------- */
    el.addEventListener('click', (e) => {
      const v = e.target.closest('[data-view]');
      if (v) { App.navigate('flashcards', v.dataset.view); return; }

      if (e.target.closest('[data-timer-act]')) {
        running = !running;
        if (!running) saveState(st);
        drawTimer();
        return;
      }

      const sh = e.target.closest('[data-show]');
      if (sh) {
        if (view !== 'cards') { App.navigate('flashcards'); return; }
        topic = 'all';
        current = CARDS.find((c) => c.id === sh.dataset.show) || current;
        flipped = false;
        drawCards();
        $main.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const tp = e.target.closest('[data-topic]');
      if (tp) { topic = tp.dataset.topic; current = null; flipped = false; drawCards(); return; }

      if (e.target.closest('[data-flip]')) { flip(); return; }

      const an = e.target.closest('[data-ans]');
      if (an && !an.disabled) { answer(an.dataset.ans === 'ok'); return; }

      const op = e.target.closest('[data-opt]');
      if (op && !op.disabled) { pickOption(Number(op.dataset.opt)); return; }

      const dr = e.target.closest('[data-drill]');
      if (dr) {
        if (dr.dataset.drill === 'restart') newDrill();
        else { drill.i++; drill.answered = null; finishDrillIfDone(); }
        drawDrill();
      }
    });

    // Keyboard shortcuts (sirf cards view, jab yeh module khula ho)
    function onKey(e) {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (view !== 'cards' || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === ' ' || (e.key === 'Enter' && e.target.closest && e.target.closest('[data-flip]'))) { e.preventDefault(); flip(); }
      else if (e.key === '1' && flipped) answer(true);
      else if (e.key === '2' && flipped) answer(false);
    }
    document.addEventListener('keydown', onKey);

    // Timer interval — module band hote hi khud ruk jata hai
    const iv = setInterval(() => {
      if (!el.isConnected) { clearInterval(iv); if (running) saveState(st); return; }
      tickTimer();
    }, 1000);
  }

  App.registerModule({ id: 'flashcards', title: 'Module 6: Flashcards', icon: '🧠', order: 60, render });
})();
