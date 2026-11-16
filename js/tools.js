/* =====================================================================
   tools.js — PART 4: Trading Tools
   ---------------------------------------------------------------------
   Do modules register karta hai:
     MODULE 3: Daily Pre-Trade Checklist (Anti-FOMO Gatekeeper)
               Store key: "checklist" -> { date: 'YYYY-MM-DD', checked: {id: true} }
               Store key: "demo" (sirf parhta hai) -> aaj ke losses ginne ke liye
     MODULE 4: Position Size, OTE & 3-Stage Exit Calculator
               Store key: "calc" -> { inputs: {...}, updatedAt: timestamp }

   Sirf stable API use hoti hai:
     App.registerModule, App.navigate, App.toast, App.esc, App.todayKey
     Store.get(key, default), Store.set(key, value)
   ===================================================================== */
(function () {
  'use strict';

  const esc = App.esc;
  const todayKey = App.todayKey;

  /* ------------------------------------------------------------------
     SHARED HELPERS
     ------------------------------------------------------------------ */

  /* Store ki value array ho ya {field: [...]} — dono ko list bana do */
  function asList(raw, field) {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw[field])) return raw[field];
    return [];
  }

  /* Ek trade ka R-multiple (app.js wali logic jaisa) — na mile to null */
  function tradeR(t) {
    if (typeof t === 'number') return t;
    if (!t || typeof t !== 'object') return null;
    if (typeof t.r === 'number') return t.r;
    if (typeof t.pnl === 'number') return t.pnl > 0 ? 1 : t.pnl < 0 ? -1 : 0;
    const res = String(t.result || '').toLowerCase();
    if (res === 'win') return typeof t.rr === 'number' ? t.rr : 1;
    if (res === 'loss') return -1;
    if (res === 'be') return 0;
    return null;
  }

  /* "demo" Store key se aaj ke losing trades gino */
  function todayLosses() {
    const list = asList(Store.get('demo', []), 'trades');
    const today = todayKey();
    return list.filter((t) => {
      if (!t || typeof t !== 'object') return false;
      let d = '';
      if (typeof t.date === 'string') d = t.date.slice(0, 10);
      else if (typeof t.ts === 'number') d = todayKey(new Date(t.ts));
      const r = tradeR(t);
      return d === today && typeof r === 'number' && r < 0;
    }).length;
  }

  /* Dollar format: 1234.5 -> "$1,234.50" (negative -> "-$1,234.50") */
  function usd(n) {
    if (!isFinite(n)) return '—';
    const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n < 0 ? '-$' : '$') + s;
  }

  /* Number format with fixed decimals + commas */
  function num(n, d) {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  /* R format: 2.345 -> "+2.35R" */
  function fmtR(r) {
    if (!isFinite(r)) return '—';
    return (r > 0 ? '+' : '') + r.toFixed(2) + 'R';
  }

  /* Floating point ka masla door karke neeche ki taraf round */
  function floorTo(x, decimals) {
    const f = Math.pow(10, decimals);
    return Math.floor(x * f + 1e-9) / f;
  }

  /* ==================================================================
     MODULE 3: DAILY PRE-TRADE CHECKLIST (Anti-FOMO Gatekeeper)
     ================================================================== */

  /* 12 rules — 4 hisson mein. id Store mein save hota hai (mat badlo). */
  const CHECK_SECTIONS = [
    {
      title: '1) Higher Timeframe Context',
      items: [
        { id: 'zone4h', label: '4H Zone mark hai', help: 'Price 4H Order Block / FVG / Supply-Demand zone ke andar ya bilkul qareeb hai.' },
        { id: 'pd', label: 'Price sahi Premium/Discount mein hai', help: 'Long sirf Discount (range ke 50% se neeche), Short sirf Premium (50% se upar).' }
      ]
    },
    {
      title: '2) Entry Model',
      items: [
        { id: 'sweep15', label: '15M Liquidity Sweep ho chuka hai', help: '15M par kisi high/low ki liquidity grab hui (stop hunt) — pehle sweep, phir entry.' },
        { id: 'disp5', label: '5M Displacement + CHoCH confirm', help: 'Sweep ke baad taqatwar candles (displacement) se 5M structure toota — CHoCH.' },
        { id: 'limit', label: 'FVG / OTE 70.5% par Limit Order', help: 'Price ka peecha nahi karna. FVG ya 70.5% OTE par pending limit order lagao.' },
        { id: 'sl', label: 'Structural SL lagaya', help: 'SL sweep wale high/low ke peeche — random pips nahi.' }
      ]
    },
    {
      title: '3) Timing',
      items: [
        { id: 'kz', label: 'Killzone session ke andar hoon', help: 'London Killzone (02:00–05:00 New York time) ya NY Killzone (07:00–10:00 New York time).' },
        { id: 'news', label: 'Agle 30 min mein koi high-impact news nahi', help: 'Economic calendar check kiya (CPI, NFP, FOMC, rate decision waghera).' }
      ]
    },
    {
      title: '4) Risk Rules',
      items: [
        { id: 'risk1', label: 'Risk ≤ 1% per trade', help: 'Position size calculator se nikala — andaaze se nahi.' },
        { id: 'rr2', label: 'R:R ≥ 1:2', help: 'Pehla target (TP1) kam az kam SL distance ka 2 guna.' },
        { id: 'heat', label: 'Portfolio Heat ≤ 5%', help: 'Saari open trades ka total risk mila kar 5% se kam.' },
        { id: 'dloss', label: 'Aaj ke losses 2 se kam hain', help: '2 losses ke baad us din trading band — revenge trading se bachao.' }
      ]
    }
  ];
  const ALL_CHECKS = CHECK_SECTIONS.reduce((a, s) => a.concat(s.items), []);
  const MAX_DAILY_LOSSES = 2;

  /* Checklist state load karo — naya din ho to sab auto-uncheck */
  function loadChecklist() {
    const today = todayKey();
    let s = Store.get('checklist', null);
    if (!s || typeof s !== 'object' || s.date !== today || !s.checked || typeof s.checked !== 'object') {
      s = { date: today, checked: {} };
      Store.set('checklist', s);
    }
    return s;
  }

  /* Abhi New York mein kitne baje hain (Killzone helper ke liye) */
  function nyTime() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === 'hour').value) % 24;
      const m = Number(parts.find((p) => p.type === 'minute').value);
      return { h, m };
    } catch (e) {
      return null; // purane browser mein timeZone support na ho
    }
  }

  /* Killzone status line ka HTML */
  function killzoneHtml() {
    const t = nyTime();
    if (!t) return '';
    const mins = t.h * 60 + t.m;
    const zones = [
      { name: 'London Killzone', s: 2 * 60, e: 5 * 60 },
      { name: 'New York Killzone', s: 7 * 60, e: 10 * 60 }
    ];
    const active = zones.find((z) => mins >= z.s && mins < z.e);
    const clock = String(t.h).padStart(2, '0') + ':' + String(t.m).padStart(2, '0');
    return active
      ? '<span class="text-bull font-semibold">● ' + active.name + ' ACTIVE</span> <span class="text-slate-400">(New York time ' + clock + ')</span>'
      : '<span class="text-liq font-semibold">○ Abhi koi Killzone nahi</span> <span class="text-slate-400">(New York time ' + clock + ' — London 02:00–05:00, NY 07:00–10:00)</span>';
  }

  function renderChecklist(container) {
    let state = loadChecklist();

    function draw() {
      // Din badal gaya ho (page raat bhar khula tha) to reset
      if (state.date !== todayKey()) state = loadChecklist();

      const losses = todayLosses();
      const forced = losses >= MAX_DAILY_LOSSES;      // 2 losses = zabardasti lock
      if (forced && state.checked.dloss) {            // "losses < 2" ab sach nahi
        delete state.checked.dloss;
        Store.set('checklist', state);
      }

      const total = ALL_CHECKS.length;
      const done = ALL_CHECKS.filter((c) => state.checked[c.id]).length;
      const pct = Math.round((done / total) * 100);
      const locked = forced || done < total;

      // --- Banner: RED jab tak 100% na ho, GREEN jab sab pass ---
      const banner = locked
        ? '<div class="rounded-2xl border-2 border-bear bg-bear/15 p-5 text-center">' +
            '<div class="text-2xl sm:text-3xl font-extrabold text-bear tracking-wide">🔒 LOCKED: DO NOT TRADE</div>' +
            '<p class="text-sm text-slate-300 mt-2">' + (forced
              ? 'Aaj ' + losses + ' losses ho chuke hain — Daily Loss Limit hit. Platform band karo, kal fresh dimagh se wapas aao.'
              : done + '/' + total + ' checks complete — ' + (total - done) + ' baqi. Ek bhi rule miss = koi trade nahi.') +
            '</p></div>'
        : '<div class="rounded-2xl border-2 border-bull bg-bull/15 p-5 text-center">' +
            '<div class="text-2xl sm:text-3xl font-extrabold text-bull tracking-wide">✅ A+ SETUP VERIFIED</div>' +
            '<p class="text-sm text-slate-300 mt-2">Saare ' + total + ' rules pass. Plan ke mutabiq execute karo — size calculator se lo, phir chart chhor do.</p>' +
          '</div>';

      // --- Checklist sections ---
      const sections = CHECK_SECTIONS.map((sec) => {
        const rows = sec.items.map((c) => {
          const isLossRow = c.id === 'dloss';
          const disabled = isLossRow && forced;
          const on = !!state.checked[c.id];
          return '<label class="flex items-start gap-3 p-3 rounded-xl border ' +
              (on ? 'border-bull/50 bg-bull/5' : disabled ? 'border-bear/50 bg-bear/5' : 'border-slate-800 hover:border-slate-600') +
              ' ' + (disabled ? 'cursor-not-allowed' : 'cursor-pointer') + '">' +
              '<input type="checkbox" data-check="' + c.id + '" class="mt-1 w-5 h-5 accent-emerald-500 shrink-0"' +
              (on ? ' checked' : '') + (disabled ? ' disabled' : '') + '>' +
              '<span><span class="block text-sm font-semibold ' + (on ? 'text-bull' : 'text-slate-100') + '">' + esc(c.label) + '</span>' +
              '<span class="block text-xs text-slate-400 mt-0.5">' +
                (disabled ? '<span class="text-bear font-semibold">Aaj ' + losses + ' losses — yeh rule fail hai.</span>' : esc(c.help)) +
              '</span></span></label>';
        }).join('');
        return '<div class="bg-card border border-slate-800 rounded-2xl p-4">' +
            '<h3 class="text-sm font-bold text-slate-300 mb-3">' + esc(sec.title) + '</h3>' +
            '<div class="space-y-2">' + rows + '</div></div>';
      }).join('');

      container.innerHTML =
        '<div class="max-w-4xl mx-auto space-y-5">' +
          '<div>' +
            '<h1 class="text-2xl font-bold text-slate-100">Daily Pre-Trade Checklist</h1>' +
            '<p class="text-sm text-slate-400 mt-1">Anti-FOMO Gatekeeper — har trade se pehle yeh 12 rules. Har naye din list khud reset ho jati hai.</p>' +
          '</div>' +
          banner +
          // Progress bar
          '<div class="bg-card border border-slate-800 rounded-2xl p-4">' +
            '<div class="flex justify-between text-xs text-slate-400 mb-2"><span>Progress</span><span>' + pct + '%</span></div>' +
            '<div class="h-2.5 bg-slate-800 rounded-full overflow-hidden">' +
              '<div class="h-full ' + (locked ? 'bg-bear' : 'bg-bull') + '" style="width:' + pct + '%"></div></div>' +
            '<div class="flex flex-wrap gap-x-6 gap-y-1 text-xs mt-3">' +
              '<span id="kz-line">' + killzoneHtml() + '</span>' +
              '<span class="' + (forced ? 'text-bear font-semibold' : 'text-slate-400') + '">Aaj ke losses (Demo log): ' + losses + '/' + MAX_DAILY_LOSSES + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="grid md:grid-cols-2 gap-4">' + sections + '</div>' +
          '<div class="flex flex-wrap gap-3">' +
            '<button data-act="reset" class="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-slate-500">Sab uncheck karo</button>' +
            '<button data-act="calc" class="px-4 py-2 rounded-lg bg-bull/15 border border-bull/50 text-sm text-bull font-semibold hover:bg-bull/25">🧮 Position Calculator kholo →</button>' +
          '</div>' +
        '</div>';
    }

    // Event delegation — container har route par naya hota hai
    container.addEventListener('change', (e) => {
      const id = e.target && e.target.getAttribute('data-check');
      if (!id) return;
      if (state.date !== todayKey()) state = loadChecklist();
      if (e.target.checked) state.checked[id] = true;
      else delete state.checked[id];
      Store.set('checklist', state);
      draw();
    });
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      if (act === 'reset') {
        state = { date: todayKey(), checked: {} };
        Store.set('checklist', state);
        draw();
        App.toast('Checklist reset ho gayi.', 'info');
      } else if (act === 'calc') {
        App.navigate('calculator');
      }
    });

    // Har minute: Killzone clock update + aadhi raat ko auto-reset.
    // Module se bahar jao (container DOM se hat jaye) to timer band.
    let lastDay = state.date;
    const timer = setInterval(() => {
      if (!document.body.contains(container)) { clearInterval(timer); return; }
      if (todayKey() !== lastDay) { lastDay = todayKey(); draw(); return; }
      const kz = container.querySelector('#kz-line');
      if (kz) kz.innerHTML = killzoneHtml();
    }, 60000);

    draw();
  }

  App.registerModule({
    id: 'checklist',
    title: 'Module 3: Pre-Trade Checklist',
    icon: '🛡️',
    order: 30,
    render: renderChecklist
  });

  /* ==================================================================
     MODULE 4: POSITION SIZE, OTE & 3-STAGE EXIT CALCULATOR
     ================================================================== */

  /* Asset settings
     - Forex : 1 lot = 100,000 units. Pip = 0.0001 (JPY pairs: 0.01).
               Quote currency USD maani gayi hai (EURUSD, GBPUSD...).
               Price >= 20 ho to JPY pair samjha jata hai aur P/L ko
               price se divide karke USD banaya jata hai (USDJPY ke liye exact).
     - Gold  : 1 lot = 100 oz, pip = 0.1  -> 1 pip per lot = $10
     - Crypto: Units (coins) mein size, spread price mein */
  const ASSETS = {
    forex: { name: 'Forex', contract: 100000 },
    gold: { name: 'Gold (XAUUSD)', contract: 100, pip: 0.1 },
    crypto: { name: 'Crypto', contract: 1 }
  };

  /* 3-stage exit plan: R multiple, close %, action */
  const EXITS = [
    { name: 'TP1', k: 2, part: 0.33, action: '33% close + SL Breakeven par' },
    { name: 'TP2', k: 3, part: 0.33, action: '33% close' },
    { name: 'TP3', k: 4, part: 0.34, action: '34% Runner close' }
  ];

  const FIBS = [0.618, 0.705, 0.79];

  const DEFAULTS = {
    asset: 'forex', capital: '10000', riskPct: '1', dir: 'long',
    entry: '', sl: '', leverage: '30', feePct: '0', spread: '0',
    swingHigh: '', swingLow: ''
  };

  /* $25,000 Demo: EURUSD Long, entry bilkul 70.5% OTE par, SL Swing Low ke neeche */
  const DEMO = {
    asset: 'forex', capital: '25000', riskPct: '1', dir: 'long',
    entry: '1.08090', sl: '1.07450', leverage: '30', feePct: '0.0035', spread: '0.8',
    swingHigh: '1.09500', swingLow: '1.07500'
  };

  /* Forex ka pip size (JPY pairs alag) */
  function forexIsJpy(entry) { return entry >= 20; }

  /* Price kitne decimals mein dikhani hai */
  function priceDecimals(asset, ref) {
    if (asset === 'forex') return forexIsJpy(ref) ? 3 : 5;
    if (asset === 'gold') return 2;
    if (ref >= 1000) return 2;
    if (ref >= 1) return 4;
    return 6;
  }

  /* ------------------------------------------------------------------
     CORE MATH — inputs (strings) -> { errors, warnings, r }
     ------------------------------------------------------------------ */
  function compute(v) {
    const errors = [];
    const warnings = [];
    const n = (x) => (x === '' || x == null ? NaN : Number(x));
    const n0 = (x) => (x === '' || x == null ? 0 : Number(x)); // khali = 0

    const asset = ASSETS[v.asset] ? v.asset : 'forex';
    const long = v.dir !== 'short';
    const capital = n(v.capital);
    const riskPct = n(v.riskPct);
    const entry = n(v.entry);
    const sl = n(v.sl);
    const lev = n(v.leverage);
    const fee = n0(v.feePct);
    const spreadIn = n0(v.spread);
    const hi = n(v.swingHigh);
    const lo = n(v.swingLow);

    // ---- 1) Validation (Roman Urdu errors) ----
    if (!(capital > 0)) errors.push('Capital ($) 0 se zyada likho.');
    if (!(riskPct > 0)) errors.push('Risk % 0 se zyada likho (e.g. 1).');
    else if (riskPct > 100) errors.push('Risk % 100 se zyada nahi ho sakta.');
    else if (riskPct > 1) warnings.push('Risk ' + riskPct + '% hai — rule 1% ka hai. Size chhota karo.');
    if (!(entry > 0)) errors.push('Entry price likho (0 se zyada).');
    if (!(sl > 0)) errors.push('Stop-Loss price likho (0 se zyada).');
    if (entry > 0 && sl > 0) {
      if (entry === sl) errors.push('Entry aur Stop-Loss barabar nahi ho sakte — risk distance 0 ho jayega.');
      else if (long && sl > entry) errors.push('Long trade mein Stop-Loss Entry se NEECHE hona chahiye. Abhi SL upar hai — Direction ya SL check karo.');
      else if (!long && sl < entry) errors.push('Short trade mein Stop-Loss Entry se UPAR hona chahiye. Abhi SL neeche hai — Direction ya SL check karo.');
    }
    if (!(lev >= 1)) errors.push('Leverage kam az kam 1 ho (1 = bina leverage).');
    if (!(fee >= 0) || fee >= 5) errors.push('Fee % per side 0 se 5 ke beech ho (e.g. 0.05).');
    if (!(spreadIn >= 0)) errors.push('Spread negative nahi ho sakta.');

    const hasHi = isFinite(hi) && hi > 0;
    const hasLo = isFinite(lo) && lo > 0;
    if (hasHi !== hasLo) warnings.push('OTE ke liye Swing High aur Swing Low dono likho.');
    if (hasHi && hasLo && hi <= lo) errors.push('Swing High hamesha Swing Low se UPAR hona chahiye.');

    if (errors.length) return { errors, warnings, r: null };

    // ---- 2) Position size ----
    const cfg = ASSETS[asset];
    const dist = Math.abs(entry - sl);
    let pip = null;
    let conv = 1;                                   // quote currency -> USD
    if (asset === 'forex') {
      pip = forexIsJpy(entry) ? 0.01 : 0.0001;
      conv = forexIsJpy(entry) ? 1 / entry : 1;
    } else if (asset === 'gold') {
      pip = cfg.pip;
    }

    const dollarRisk = capital * riskPct / 100;
    const lossPerUnit = dist * conv;                // 1 unit par SL hit = itne $
    const rawUnits = dollarRisk / lossPerUnit;

    let size, units, sizeLabel;
    if (asset === 'crypto') {
      // ~4 significant digits tak neeche round
      const dec = Math.max(0, Math.min(8, 3 - Math.floor(Math.log10(rawUnits))));
      size = floorTo(rawUnits, dec);
      units = size;
      sizeLabel = num(size, dec) + ' Units';
    } else {
      size = floorTo(rawUnits / cfg.contract, 2);   // broker min step 0.01 lot
      units = size * cfg.contract;
      sizeLabel = num(size, 2) + ' Lots';
    }
    if (!(size > 0)) {
      errors.push(asset === 'crypto'
        ? 'Position size 0 ban raha hai — SL bohat door hai ya risk bohat kam. Yeh trade skip karo.'
        : 'Position size 0.01 lot se bhi kam ban raha hai — is capital/risk par SL bohat door hai. Structural SL qareeb dhoondo ya trade skip karo.');
      return { errors, warnings, r: null };
    }

    const actualRisk = units * lossPerUnit;         // rounding ke baad asal risk
    const notional = units * entry * conv;          // position ki USD value
    const margin = notional / lev;
    const pipValuePerLot = pip ? cfg.contract * pip * conv : null;
    const distPips = pip ? dist / pip : null;

    if (margin > capital) warnings.push('Margin (' + usd(margin) + ') capital se zyada hai — broker order reject karega. Leverage ya size check karo.');

    // ---- 3) Costs: fees (dono sides) + spread ----
    const spreadPrice = pip ? spreadIn * pip : spreadIn;   // Forex/Gold: pips, Crypto: price
    const spreadCost = units * spreadPrice * conv;
    const entryFee = notional * fee / 100;
    const slExitFee = units * sl * conv * fee / 100;

    // ---- 4) 3-stage exits ----
    const sign = long ? 1 : -1;
    let exitFees = 0;
    let grossTotal = 0;
    const tps = EXITS.map((x) => {
      const price = entry + sign * x.k * dist;
      const partUnits = units * x.part;
      const gross = partUnits * x.k * dist * conv;
      const exitFee = partUnits * price * conv * fee / 100;
      // Entry fee + spread ko har stage par uske hisse (part) ke mutabiq baanto
      const net = gross - exitFee - x.part * (entryFee + spreadCost);
      exitFees += exitFee;
      grossTotal += gross;
      if (!(price > 0)) warnings.push(x.name + ' price 0 se neeche aa raha hai — Short target possible nahi, SL distance check karo.');
      return { name: x.name, k: x.k, part: x.part, action: x.action, price, gross, net, netR: net / actualRisk };
    });

    const totalFees = entryFee + exitFees;
    const totalCosts = totalFees + spreadCost;
    const netTotal = grossTotal - totalCosts;
    const slLossTotal = actualRisk + entryFee + slExitFee + spreadCost;   // SL hit par asal nuqsan
    // Scenario: TP1 hit, baqi 67% Breakeven (entry) par band
    const beUnits = units * (1 - EXITS[0].part);
    const tp1ThenBE = tps[0].gross - entryFee - spreadCost - (units * EXITS[0].part * tps[0].price * conv * fee / 100) -
      (beUnits * entry * conv * fee / 100);

    const costsR = totalCosts / actualRisk;
    if (costsR > 0.2) warnings.push('Costs (fees + spread) 1R ka ' + Math.round(costsR * 100) + '% kha rahe hain — SL bohat tight hai ya fees zyada.');

    // ---- 5) Fibonacci OTE ----
    let ote = null;
    if (hasHi && hasLo) {
      const range = hi - lo;
      const level = (f) => (long ? hi - range * f : lo + range * f);
      const retr = long ? (hi - entry) / range : (entry - lo) / range;  // entry kitna retrace hai
      ote = {
        levels: FIBS.map((f) => ({ f, price: level(f) })),
        eq: lo + range * 0.5,
        retr,
        inZone: retr >= 0.618 && retr <= 0.79
      };
      if (retr < 0.5) warnings.push(long
        ? 'Entry range ke Premium (50% se upar) mein hai — Long sirf Discount mein lo.'
        : 'Entry range ke Discount (50% se neeche) mein hai — Short sirf Premium mein lo.');
      if (long && sl >= lo) warnings.push('Structural SL: Long ka SL Swing Low (' + num(lo, priceDecimals(asset, lo)) + ') ke NEECHE hona chahiye.');
      if (!long && sl <= hi) warnings.push('Structural SL: Short ka SL Swing High (' + num(hi, priceDecimals(asset, hi)) + ') ke UPAR hona chahiye.');
    }

    return {
      errors, warnings,
      r: {
        asset, long, entry, sl, dist, distPips, pipValuePerLot, dollarRisk, actualRisk,
        size, units, sizeLabel, notional, margin, lev,
        entryFee, exitFees, totalFees, spreadCost, totalCosts, costsR, slLossTotal,
        tps, grossTotal, netTotal, tp1ThenBE, ote,
        dec: priceDecimals(asset, entry)
      }
    };
  }

  /* ------------------------------------------------------------------
     UI HELPERS
     ------------------------------------------------------------------ */
  const INPUT_CLS = 'w-full bg-ink border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-bull';

  function field(k, label, help, val, extra) {
    return '<div>' +
      '<label for="c-' + k + '" class="block text-xs font-semibold text-slate-300 mb-1" id="lbl-' + k + '">' + label + '</label>' +
      '<input id="c-' + k + '" data-k="' + k + '" type="number" step="any" inputmode="decimal" value="' + esc(val) + '" class="' + INPUT_CLS + '"' + (extra || '') + '>' +
      (help ? '<p class="text-[11px] text-slate-500 mt-1">' + help + '</p>' : '') +
      '</div>';
  }

  function stat(label, value, sub, color) {
    return '<div class="bg-ink/60 border border-slate-800 rounded-xl p-3">' +
      '<div class="text-[11px] uppercase tracking-wide text-slate-400">' + label + '</div>' +
      '<div class="text-lg font-bold mt-0.5 ' + (color || 'text-slate-100') + '">' + value + '</div>' +
      (sub ? '<div class="text-[11px] text-slate-500 mt-0.5">' + sub + '</div>' : '') +
      '</div>';
  }

  function spreadLabel(asset) {
    return asset === 'crypto' ? 'Spread (price mein, e.g. 5)' : 'Spread (pips mein, e.g. 0.8)';
  }

  /* Results panel ka HTML */
  function resultsHtml(res) {
    const warnHtml = res.warnings.length
      ? '<div class="rounded-xl border border-liq/50 bg-liq/10 p-3 space-y-1">' +
          res.warnings.map((w) => '<p class="text-xs text-liq">⚠ ' + esc(w) + '</p>').join('') + '</div>'
      : '';

    if (res.errors.length) {
      return '<div class="rounded-xl border border-bear/60 bg-bear/10 p-4 space-y-1">' +
          '<p class="text-sm font-bold text-bear mb-1">Inputs theek karo:</p>' +
          res.errors.map((e) => '<p class="text-sm text-bear">✖ ' + esc(e) + '</p>').join('') +
        '</div>' + warnHtml;
    }

    const r = res.r;
    const P = (x) => num(x, r.dec);

    // --- Core numbers ---
    const core =
      '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">' +
        stat('Dollar Risk', usd(r.dollarRisk), 'Capital × Risk %', 'text-bear') +
        stat('Position Size', r.sizeLabel, r.asset === 'crypto' ? 'Coins / units' : num(r.units, 0) + ' units', 'text-bull') +
        stat('Asal Risk (rounding ke baad)', usd(r.actualRisk), r.asset === 'crypto' ? '' : 'Lots 0.01 step mein round') +
        stat('SL Distance', r.distPips != null ? num(r.distPips, 1) + ' pips' : P(r.dist), r.pipValuePerLot != null ? 'Pip value: ' + usd(r.pipValuePerLot) + ' / lot' : 'Price distance') +
        stat('Margin Required', usd(r.margin), 'Leverage 1:' + num(r.lev, 0)) +
        stat('Notional Value', usd(r.notional), 'Poori position ki value') +
      '</div>';

    // --- Costs ---
    const costs =
      '<div class="bg-card border border-slate-800 rounded-2xl p-4">' +
        '<h3 class="text-sm font-bold text-slate-200 mb-3">Fees & Costs</h3>' +
        '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">' +
          stat('Entry Fee', usd(r.entryFee)) +
          stat('Exit Fees (3 TPs)', usd(r.exitFees)) +
          stat('Spread Cost', usd(r.spreadCost)) +
          stat('Total Costs', usd(r.totalCosts), num(r.costsR, 2) + 'R kha jate hain', r.costsR > 0.2 ? 'text-liq' : 'text-slate-100') +
          stat('SL Hit = Asal Nuqsan', usd(-r.slLossTotal), fmtR(-r.slLossTotal / r.actualRisk) + ' (fees samait)', 'text-bear') +
          stat('Net R (poora plan)', fmtR(r.netTotal / r.actualRisk), 'Gross ' + fmtR(r.grossTotal / r.actualRisk) + ' − costs', 'text-bull') +
        '</div>' +
      '</div>';

    // --- OTE ---
    let ote = '';
    if (r.ote) {
      const rows = r.ote.levels.map((l) =>
        '<tr class="border-t border-slate-800' + (l.f === 0.705 ? ' bg-bull/5' : '') + '">' +
          '<td class="py-2 pr-2 ' + (l.f === 0.705 ? 'text-bull font-bold' : 'text-slate-300') + '">' + (l.f * 100).toFixed(1) + '%' + (l.f === 0.705 ? ' (Sweet spot)' : '') + '</td>' +
          '<td class="py-2 text-right font-mono text-slate-100">' + P(l.price) + '</td>' +
          '<td class="py-2 text-right">' + (l.f === 0.705
            ? '<button data-act="use705" data-price="' + l.price + '" class="text-[11px] px-2 py-1 rounded bg-bull/15 text-bull border border-bull/40 hover:bg-bull/25">Entry banao</button>'
            : '') + '</td></tr>').join('');
      ote =
        '<div class="bg-card border border-slate-800 rounded-2xl p-4">' +
          '<h3 class="text-sm font-bold text-slate-200 mb-1">Fibonacci OTE (' + (r.long ? 'Long: High se neeche' : 'Short: Low se upar') + ')</h3>' +
          '<p class="text-[11px] text-slate-500 mb-2">Equilibrium 50%: <span class="font-mono">' + P(r.ote.eq) + '</span></p>' +
          '<table class="w-full text-sm"><tbody>' + rows + '</tbody></table>' +
          '<p class="text-xs mt-3 ' + (r.ote.inZone ? 'text-bull' : 'text-liq') + '">' +
            (r.ote.inZone
              ? '✅ Aapki Entry ' + (r.ote.retr * 100).toFixed(1) + '% retracement par hai — OTE zone (61.8%–79%) ke andar.'
              : '⚠ Aapki Entry ' + (r.ote.retr * 100).toFixed(1) + '% retracement par hai — OTE zone (61.8%–79%) se bahar.') +
          '</p>' +
        '</div>';
    } else {
      ote = '<div class="bg-card border border-dashed border-slate-700 rounded-2xl p-4 text-xs text-slate-500">Fibonacci OTE levels dekhne ke liye Swing High aur Swing Low likho.</div>';
    }

    // --- 3-stage exits ---
    const tpRows = r.tps.map((t) =>
      '<tr class="border-t border-slate-800">' +
        '<td class="py-2 pr-2 font-bold text-bull">' + t.name + '</td>' +
        '<td class="py-2 pr-2 font-mono text-slate-100">' + P(t.price) + '</td>' +
        '<td class="py-2 pr-2 text-slate-300">1:' + t.k + '</td>' +
        '<td class="py-2 pr-2 text-slate-300 hidden sm:table-cell">' + esc(t.action) + '</td>' +
        '<td class="py-2 pr-2 text-right text-slate-300">' + usd(t.gross) + '</td>' +
        '<td class="py-2 text-right font-semibold text-bull">' + usd(t.net) + '<div class="text-[10px] text-slate-500 font-normal">' + fmtR(t.netR) + '</div></td>' +
      '</tr>').join('');
    const exits =
      '<div class="bg-card border border-slate-800 rounded-2xl p-4">' +
        '<h3 class="text-sm font-bold text-slate-200 mb-3">3-Stage Exit Plan</h3>' +
        '<div class="overflow-x-auto"><table class="w-full text-sm">' +
          '<thead><tr class="text-[11px] uppercase text-slate-500 text-left">' +
            '<th class="pb-2 pr-2">Stage</th><th class="pb-2 pr-2">Price</th><th class="pb-2 pr-2">R:R</th>' +
            '<th class="pb-2 pr-2 hidden sm:table-cell">Action</th><th class="pb-2 pr-2 text-right">Gross</th><th class="pb-2 text-right">Net (fees ke baad)</th>' +
          '</tr></thead><tbody>' + tpRows + '</tbody></table></div>' +
        '<p class="text-[11px] text-slate-500 mt-2 sm:hidden">TP1: 33% close + SL Breakeven · TP2: 33% close · TP3: 34% runner</p>' +
        '<div class="grid sm:grid-cols-2 gap-3 mt-3">' +
          stat('Teeno TP hit (Net)', usd(r.netTotal), fmtR(r.netTotal / r.actualRisk), 'text-bull') +
          stat('Sirf TP1, baqi Breakeven (Net)', usd(r.tp1ThenBE), fmtR(r.tp1ThenBE / r.actualRisk), r.tp1ThenBE >= 0 ? 'text-bull' : 'text-bear') +
        '</div>' +
      '</div>';

    return warnHtml + core + exits + ote + costs;
  }

  /* ------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------ */
  function renderCalculator(container) {
    const saved = Store.get('calc', {});
    let inputs = Object.assign({}, DEFAULTS, saved && typeof saved === 'object' && saved.inputs ? saved.inputs : {});

    const sel = (k, opts) => '<select id="c-' + k + '" data-k="' + k + '" class="' + INPUT_CLS + '">' +
      opts.map((o) => '<option value="' + o[0] + '"' + (inputs[k] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') +
      '</select>';

    container.innerHTML =
      '<div class="max-w-6xl mx-auto space-y-5">' +
        '<div class="flex flex-wrap items-end justify-between gap-3">' +
          '<div>' +
            '<h1 class="text-2xl font-bold text-slate-100">Position Size, OTE & 3-Stage Exit Calculator</h1>' +
            '<p class="text-sm text-slate-400 mt-1">Pehle risk, phir size. Andaaze se lot kabhi nahi.</p>' +
          '</div>' +
          '<div class="flex gap-2">' +
            '<button data-act="demo" class="px-4 py-2 rounded-lg bg-liq/15 border border-liq/50 text-liq text-sm font-semibold hover:bg-liq/25">$25,000 Demo Example</button>' +
            '<button data-act="clear" class="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:border-slate-500">Reset</button>' +
          '</div>' +
        '</div>' +
        '<div class="grid lg:grid-cols-5 gap-5">' +
          // ---- Form ----
          '<form id="calc-form" class="lg:col-span-2 bg-card border border-slate-800 rounded-2xl p-4 space-y-4 self-start" onsubmit="return false">' +
            '<div class="grid grid-cols-2 gap-3">' +
              '<div><label for="c-asset" class="block text-xs font-semibold text-slate-300 mb-1">Asset Type</label>' +
                sel('asset', [['forex', 'Forex'], ['gold', 'Gold (XAUUSD)'], ['crypto', 'Crypto']]) + '</div>' +
              '<div><label for="c-dir" class="block text-xs font-semibold text-slate-300 mb-1">Direction</label>' +
                sel('dir', [['long', 'Long (Buy)'], ['short', 'Short (Sell)']]) + '</div>' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-3">' +
              field('capital', 'Capital ($)', 'Account balance', inputs.capital, ' min="0"') +
              field('riskPct', 'Risk %', 'Rule: max 1%', inputs.riskPct, ' min="0"') +
            '</div>' +
            '<div class="grid grid-cols-2 gap-3">' +
              field('entry', 'Entry Price', 'Limit order ki price', inputs.entry, ' min="0"') +
              field('sl', 'Stop-Loss', 'Structural level ke peeche', inputs.sl, ' min="0"') +
            '</div>' +
            '<div class="grid grid-cols-3 gap-3">' +
              field('leverage', 'Leverage', '1:X', inputs.leverage, ' min="1"') +
              field('feePct', 'Fee % / side', 'e.g. 0.05', inputs.feePct, ' min="0"') +
              field('spread', spreadLabel(inputs.asset), '', inputs.spread, ' min="0"') +
            '</div>' +
            '<div class="border-t border-slate-800 pt-4">' +
              '<p class="text-xs font-semibold text-slate-300 mb-2">Fibonacci OTE ke liye (optional)</p>' +
              '<div class="grid grid-cols-2 gap-3">' +
                field('swingHigh', 'Swing High', '', inputs.swingHigh, ' min="0"') +
                field('swingLow', 'Swing Low', '', inputs.swingLow, ' min="0"') +
              '</div>' +
            '</div>' +
            '<p class="text-[11px] text-slate-500 leading-relaxed">Forex: 1 lot = 100,000 units, quote currency USD maani gayi (EURUSD, GBPUSD). Price 20 se upar ho to JPY pair (pip 0.01). Gold: 1 lot = 100 oz, pip = 0.1 ($10/lot). Inputs khud save hote hain.</p>' +
          '</form>' +
          // ---- Results ----
          '<div id="calc-out" class="lg:col-span-3 space-y-4"></div>' +
        '</div>' +
      '</div>';

    const form = container.querySelector('#calc-form');
    const out = container.querySelector('#calc-out');

    // Form se saari values parho
    function readForm() {
      const v = {};
      form.querySelectorAll('[data-k]').forEach((el) => { v[el.getAttribute('data-k')] = String(el.value).trim(); });
      return v;
    }
    // Values form mein bharo (Demo / Reset / 70.5% button ke liye)
    function fillForm(v) {
      form.querySelectorAll('[data-k]').forEach((el) => {
        const k = el.getAttribute('data-k');
        if (k in v) el.value = v[k];
      });
    }
    // Recalculate + save — sirf results panel dobara banta hai (focus safe)
    function update() {
      inputs = readForm();
      const lbl = container.querySelector('#lbl-spread');
      if (lbl) lbl.textContent = spreadLabel(inputs.asset);
      Store.set('calc', { inputs, updatedAt: Date.now() });
      out.innerHTML = resultsHtml(compute(inputs));
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      if (act === 'demo') {
        fillForm(DEMO);
        update();
        App.toast('$25,000 Demo: EURUSD Long, Entry 70.5% OTE par.', 'success');
      } else if (act === 'clear') {
        fillForm(DEFAULTS);
        update();
      } else if (act === 'use705') {
        const price = Number(btn.getAttribute('data-price'));
        const dec = priceDecimals(inputs.asset, price);
        fillForm({ entry: price.toFixed(dec) });
        update();
      }
    });

    update();
  }

  App.registerModule({
    id: 'calculator',
    title: 'Module 4: Position Calculator',
    icon: '🧮',
    order: 40,
    render: renderCalculator
  });
})();
