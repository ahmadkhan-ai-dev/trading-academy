/* =====================================================================
   journal.js — PART 5: MODULE 5 · Trading Journal
   ---------------------------------------------------------------------
   Do tabs:
     A) 50-Trade Backtest Logger        Store key: "backtest"
     B) Mark Douglas 20-Trade Demo      Store key: "demo"
        + Automatic 2-Loss Daily Circuit Breaker (lock screen)

   DATA FORMAT (app.js Home Dashboard, tools.js aur Gate Lab isi ko parhte hain):
     backtest: [{ id, ts, date:'YYYY-MM-DD', pair, session, setup,
                  dir:'long'|'short', r:Number, notes, shot }]
     demo    : [{ ...upar wale saare fields..., compliant:Boolean,
                  emotion, mistake }]
       r         -> app.js tradeR() / GateLab rOf()   (hamesha Number)
       date      -> app.js + tools.js "aaj ke losses" (YYYY-MM-DD)
       compliant -> GateLab complianceOf()            (Gate 4: >= 90%)

   Routes: #/journal (Backtest tab)  ·  #/journal/demo (Demo tab)
   Sirf stable API: App.registerModule / navigate / toast / esc / todayKey,
   Store.get / Store.set
   ===================================================================== */
(function () {
  'use strict';

  const esc = App.esc;
  const todayKey = App.todayKey;

  /* ------------------------------------------------------------------
     1) RULES / CONSTANTS (course ke mutabiq)
     ------------------------------------------------------------------ */
  const BT_TARGET = 50;        // Gate 3: kam az kam 50 backtest trades
  const BT_PASS_E = 0.35;      // Gate 3: Expectancy >= +0.35R
  const DEMO_TARGET = 20;      // Gate 4: 20 demo trades (Mark Douglas batch)
  const DEMO_PASS_C = 90;      // Gate 4: Rule Compliance >= 90%
  const DAILY_LOSS_LIMIT = 2;  // 2 losses = us din trading band

  const SESSIONS = ['Asian', 'London', 'New York', 'London-NY Overlap'];
  const SETUPS = ['Sweep + CHoCH + FVG', 'Sweep + CHoCH + Order Block', 'OTE (61.8–79%) Limit', 'Breaker Block', 'FVG Inversion', 'Other'];
  const EMOTIONS = ['Pur-sukoon (calm)', 'Confident', 'Bored', 'Ghabrahat (anxious)', 'FOMO', 'Revenge / gussa', 'Thaka hua'];

  const CARD = 'bg-card border border-slate-800 rounded-2xl p-5 md:p-6';
  const INPUT = 'mt-1 w-full bg-ink border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-liq';

  /* ------------------------------------------------------------------
     2) HELPERS
     ------------------------------------------------------------------ */
  const r6 = (x) => Math.round(x * 1e6) / 1e6;              // floating error hatao (0.35 = 0.3499999 na bane)
  const fmtR = (x) => (x >= 0 ? '+' : '') + x.toFixed(2) + 'R';
  const pct = (x) => Math.round(x * 1000) / 10;              // 0.4567 -> 45.7
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  const pick = (v, list) => (list.indexOf(v) >= 0 ? v : list[0]);  // sirf allowed option
  const safeUrl = (u) => (/^https?:\/\/\S+$/i.test(String(u || '')) ? String(u) : ''); // javascript: links block

  /* Store value array ho ya { trades: [...] } — hamesha array lo */
  function load(key) {
    const v = Store.get(key, []);
    if (Array.isArray(v)) return v.slice();
    return v && Array.isArray(v.trades) ? v.trades.slice() : [];
  }
  function save(key, list) {
    if (!Store.set(key, list)) App.toast('Save nahi hua — browser storage full ho sakti hai.', 'error');
  }

  /* Win rate, Average R, Expectancy waghera */
  function stats(list) {
    const rs = list.map((t) => Number(t && t.r)).filter(Number.isFinite);
    const n = rs.length;
    const wins = rs.filter((r) => r > 0);
    const losses = rs.filter((r) => r < 0);
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr) => (arr.length ? sum(arr) / arr.length : 0);
    const winRate = n ? wins.length / n : 0;
    const lossRate = n ? losses.length / n : 0;
    const avgWin = avg(wins);
    const avgLoss = Math.abs(avg(losses));
    // Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss)  — yeh hamesha Average R ke barabar aata hai
    const expectancy = r6(winRate * avgWin - lossRate * avgLoss);
    return {
      n, wins: wins.length, losses: losses.length, be: n - wins.length - losses.length,
      winRate, avgWin, avgLoss, avgR: n ? r6(sum(rs) / n) : 0, expectancy, total: r6(sum(rs))
    };
  }

  /* Kisi date par kitne losing trades (Circuit Breaker ke liye) */
  function lossesOn(list, date) {
    return list.filter((t) => t && String(t.date || '').slice(0, 10) === date && Number(t.r) < 0).length;
  }
  const isLocked = () => lossesOn(load('demo'), todayKey()) >= DAILY_LOSS_LIMIT;

  /* Raat 12 baje tak kitna waqt baqi (HH:MM:SS) */
  function countdown() {
    const now = new Date();
    const mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s = Math.max(0, Math.floor((mid - now) / 1000));
    const p = (x) => String(x).padStart(2, '0');
    return p(Math.floor(s / 3600)) + ':' + p(Math.floor((s % 3600) / 60)) + ':' + p(s % 60);
  }

  /* Gate status — Gate Lab ka asal checker use karo (na ho to local hisaab) */
  function gateOk(gid) {
    if (window.GateLab && typeof window.GateLab.requirement === 'function') {
      const r = window.GateLab.requirement(gid);
      if (r) return !!r.ok;
    }
    if (gid === 'gate3') { const s = stats(load('backtest')); return s.n >= BT_TARGET && s.expectancy >= BT_PASS_E; }
    const d = load('demo');
    return d.length >= DEMO_TARGET && (d.filter((t) => t.compliant === true).length / d.length) * 100 >= DEMO_PASS_C;
  }

  /* ------------------------------------------------------------------
     3) CSV EXPORT
     ------------------------------------------------------------------ */
  function csvCell(v, numeric) {
    let s = v == null ? '' : String(v);
    if (!numeric && /^[=+\-@\t\r]/.test(s)) s = "'" + s;          // Excel formula injection se bachao
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function downloadCSV(filename, cols, rows) {
    const lines = [cols.map((c) => csvCell(c.h)).join(',')]
      .concat(rows.map((t, i) => cols.map((c) => csvCell(c.get(t, i), c.num)).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }); // BOM = Excel mein sahi
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const BASE_COLS = [
    { h: '#', num: true, get: (t, i) => i + 1 },
    { h: 'Date', get: (t) => t.date },
    { h: 'Pair', get: (t) => t.pair },
    { h: 'Session', get: (t) => t.session },
    { h: 'Setup', get: (t) => t.setup },
    { h: 'Direction', get: (t) => (t.dir === 'short' ? 'Short' : 'Long') },
    { h: 'R Result', num: true, get: (t) => t.r },
    { h: 'Notes', get: (t) => t.notes },
    { h: 'Screenshot', get: (t) => t.shot }
  ];
  const DEMO_COLS = BASE_COLS.concat([
    { h: 'Rules Followed', get: (t) => (t.compliant ? 'Yes' : 'No') },
    { h: 'Emotion', get: (t) => t.emotion },
    { h: 'Mistake', get: (t) => t.mistake }
  ]);

  /* ------------------------------------------------------------------
     4) UI PIECES
     ------------------------------------------------------------------ */
  function stat(label, value, cls, sub) {
    return '<div class="p-4 rounded-xl bg-ink/60 border border-slate-800">' +
      '<p class="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">' + label + '</p>' +
      '<p class="text-2xl font-bold mt-1 ' + (cls || 'text-white') + '">' + value + '</p>' +
      (sub ? '<p class="text-[11px] text-slate-500 mt-1 leading-4">' + sub + '</p>' : '') + '</div>';
  }
  function chip(text, color) {
    const map = { bull: 'bg-bull/15 text-bull border-bull/40', bear: 'bg-bear/15 text-bear border-bear/40', liq: 'bg-liq/15 text-liq border-liq/40', slate: 'bg-slate-800 text-slate-400 border-slate-700' };
    return '<span class="inline-block px-3 py-1 rounded-full border text-xs font-bold ' + map[color] + '">' + text + '</span>';
  }
  function progress(n, target, ok) {
    const w = Math.min(100, (n / target) * 100);
    return '<div class="flex justify-between text-xs text-slate-400 mt-5 mb-1"><span>Progress</span><span><b class="text-white">' + n + '</b> / ' + target + ' trades</span></div>' +
      '<div class="h-3 rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full transition-all ' + (ok ? 'bg-bull' : 'bg-liq') + '" style="width:' + w + '%"></div></div>';
  }
  function field(label, control, hint, span) {
    return '<label class="text-xs text-slate-400 ' + (span || '') + '">' + label + control +
      (hint ? '<span class="block mt-1 text-[11px] text-slate-500">' + hint + '</span>' : '') + '</label>';
  }
  const options = (list) => list.map((v) => '<option>' + esc(v) + '</option>').join('');

  /* Trade entry form (isDemo = true par 3 extra fields) */
  function formHTML(isDemo) {
    const today = todayKey();
    const rules = isDemo && window.GateLab && Array.isArray(window.GateLab.DEMO_RULES)
      ? '<details class="sm:col-span-2 lg:col-span-4 text-xs text-slate-400"><summary class="cursor-pointer text-liq">9 rules yaad karo (Gate Lab) ▾</summary>' +
        '<ol class="mt-2 ml-5 list-decimal space-y-1 text-slate-300">' + window.GateLab.DEMO_RULES.map((r) => '<li>' + esc(r.text) + '</li>').join('') + '</ol></details>'
      : '';
    return '<form data-form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" novalidate>' +
      field('Date', '<input type="date" name="date" value="' + today + '" max="' + today + '" class="' + INPUT + '">') +
      field('Pair', '<input name="pair" maxlength="20" placeholder="EURUSD" autocomplete="off" class="' + INPUT + ' uppercase">') +
      field('Session', '<select name="session" class="' + INPUT + '">' + options(SESSIONS) + '</select>') +
      field('Setup type', '<select name="setup" class="' + INPUT + '">' + options(SETUPS) + '</select>') +
      field('Direction', '<select name="dir" class="' + INPUT + '"><option value="long">Long (Bullish)</option><option value="short">Short (Bearish)</option></select>') +
      field('Actual R result', '<input name="r" inputmode="decimal" autocomplete="off" placeholder="+1.3 / -1 / 0" class="' + INPUT + '">', 'Partial exits ka weighted total. Full SL = -1, BE = 0.') +
      field('Screenshot link', '<input type="url" name="shot" maxlength="300" placeholder="https://www.tradingview.com/x/..." class="' + INPUT + '">', '', 'sm:col-span-2') +
      (isDemo
        ? '<fieldset class="text-xs text-slate-400"><legend>Saare rules follow hue?</legend>' +
            '<div class="mt-1 grid grid-cols-2 gap-2">' +
              '<label class="flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-700 bg-ink cursor-pointer has-[:checked]:border-bull has-[:checked]:text-bull"><input type="radio" name="compliant" value="yes" class="accent-emerald-500"> Haan</label>' +
              '<label class="flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-700 bg-ink cursor-pointer has-[:checked]:border-bear has-[:checked]:text-bear"><input type="radio" name="compliant" value="no" class="accent-red-500"> Nahi</label>' +
            '</div></fieldset>' +
          field('Trade se pehle jazbaat', '<select name="emotion" class="' + INPUT + '">' + options(EMOTIONS) + '</select>') +
          field('Mistake note', '<input name="mistake" maxlength="200" placeholder="Jaise: Killzone se bahar entry, SL move kiya" class="' + INPUT + '">', 'Rule toota ho to zaroori.', 'sm:col-span-2') +
          rules
        : '') +
      field('Notes', '<textarea name="notes" rows="2" maxlength="500" placeholder="Kya dekha, kyun liya, kya seekha?" class="' + INPUT + '"></textarea>', '', 'sm:col-span-2 lg:col-span-4') +
      '<button type="submit" class="sm:col-span-2 lg:col-span-4 px-4 py-2.5 rounded-lg bg-liq text-ink font-bold hover:bg-amber-400 text-sm">+ Trade save karo</button>' +
    '</form>';
  }

  /* Trade list (table, naya sab se upar) */
  function tableHTML(list, isDemo, canDelete) {
    if (!list.length) return '<p class="text-sm text-slate-500">Abhi koi trade record nahi hui.</p>';
    const th = (t) => '<th class="px-3 py-2 text-left font-semibold">' + t + '</th>';
    const td = (h) => '<td class="px-3 py-2 whitespace-nowrap">' + h + '</td>';
    const rows = list.map((t, i) => ({ t, i })).reverse().map(({ t, i }) => {
      const r = Number(t.r);
      const rCls = r > 0 ? 'text-bull' : r < 0 ? 'text-bear' : 'text-slate-300';
      const shot = safeUrl(t.shot);
      return '<tr class="border-t border-slate-800 align-top hover:bg-slate-800/30">' +
        td('<span class="text-slate-500">' + (i + 1) + '</span>') +
        td(esc(t.date)) +
        td('<b class="text-white">' + esc(t.pair) + '</b>') +
        td(esc(t.session)) +
        td(esc(t.setup)) +
        td(t.dir === 'short' ? '<span class="text-bear">▼ Short</span>' : '<span class="text-bull">▲ Long</span>') +
        td('<b class="' + rCls + '">' + (Number.isFinite(r) ? fmtR(r) : '—') + '</b>') +
        (isDemo ? td(t.compliant ? '<span class="text-bull">✓ Haan</span>' : '<span class="text-bear">✗ Nahi</span>') + td(esc(t.emotion)) : '') +
        '<td class="px-3 py-2 min-w-[180px] max-w-[280px] text-slate-400">' + esc(t.notes) +
          (isDemo && t.mistake ? '<p class="text-bear text-xs mt-1">⚠ ' + esc(t.mistake) + '</p>' : '') + '</td>' +
        td(shot ? '<a href="' + esc(shot) + '" target="_blank" rel="noopener noreferrer" class="text-liq hover:underline">📷 Dekho</a>' : '<span class="text-slate-600">—</span>') +
        td(canDelete ? '<button type="button" data-del="' + i + '" class="text-slate-500 hover:text-bear" aria-label="Trade delete karo">🗑</button>' : '') +
      '</tr>';
    }).join('');
    return '<div class="overflow-auto max-h-[480px] rounded-xl border border-slate-800">' +
      '<table class="w-full text-sm"><thead class="sticky top-0 bg-[#0c1220] text-[11px] uppercase tracking-wider text-slate-500"><tr>' +
        th('#') + th('Date') + th('Pair') + th('Session') + th('Setup') + th('Dir') + th('R') +
        (isDemo ? th('Rules') + th('Jazbaat') : '') + th(isDemo ? 'Notes / Mistake' : 'Notes') + th('Chart') + th('') +
      '</tr></thead><tbody class="text-slate-300">' + rows + '</tbody></table></div>';
  }

  /* ------------------------------------------------------------------
     5) TAB A — 50-Trade Backtest Logger
     ------------------------------------------------------------------ */
  function backtestHTML() {
    const list = load('backtest');
    const s = stats(list);
    const ePass = s.n > 0 && s.expectancy >= BT_PASS_E;
    const gate = gateOk('gate3');
    const badge = !s.n ? chip('— Abhi data nahi', 'slate')
      : ePass ? chip('✅ PASS · E ≥ +0.35R', 'bull') : chip('❌ FAIL · E < +0.35R', 'bear');
    const gateLine = gate
      ? '<div class="mt-4 p-3 rounded-xl border border-bull/40 bg-bull/10 text-sm text-emerald-200 flex flex-wrap items-center gap-3">🎉 Gate 3 ki practical shart poori! <button type="button" data-go="gatelab/gate3" class="px-3 py-1 rounded-lg bg-bull text-ink font-semibold text-xs">Gate Lab → Quiz</button></div>'
      : '<p class="mt-4 text-xs text-slate-400">Gate 3 shart: <b class="text-slate-200">' + BT_TARGET + ' trades</b> aur <b class="text-slate-200">Expectancy ≥ +0.35R</b>. ' +
        (s.n < BT_TARGET ? (BT_TARGET - s.n) + ' trades baqi.' : 'Trades poori — lekin Expectancy kam hai. Rules review karo, losses delete mat karo.') + '</p>';

    return '<section class="' + CARD + '">' +
        '<div class="flex flex-wrap items-start justify-between gap-3">' +
          '<div><h2 class="text-lg font-bold text-white">📊 50-Trade Backtest</h2>' +
          '<p class="text-sm text-slate-400 mt-1">Bar Replay par honest backtest — har loss bhi likho. Expectancy jeet aur haar dono se banti hai.</p></div>' + badge +
        '</div>' +
        '<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">' +
          stat('Trades', s.n, 'text-white', s.wins + 'W · ' + s.losses + 'L · ' + s.be + 'BE') +
          stat('Win Rate', pct(s.winRate) + '%', 'text-white', 'Avg Win ' + fmtR(s.avgWin) + ' · Avg Loss -' + s.avgLoss.toFixed(2) + 'R') +
          stat('Average R', fmtR(s.avgR), s.avgR >= 0 ? 'text-bull' : 'text-bear', 'Total ' + fmtR(s.total)) +
          stat('Expectancy', fmtR(s.expectancy), ePass ? 'text-bull' : (s.n ? 'text-bear' : 'text-slate-500'), '(W% × Avg Win) − (L% × Avg Loss)') +
        '</div>' +
        progress(s.n, BT_TARGET, gate) + gateLine +
      '</section>' +
      '<section class="' + CARD + '"><h3 class="font-semibold text-white mb-4">📝 Nayi backtest trade</h3>' + formHTML(false) + '</section>' +
      '<section class="' + CARD + '">' +
        '<div class="flex flex-wrap items-center justify-between gap-2 mb-4"><h3 class="font-semibold text-white">📒 Backtest log</h3>' +
        (list.length ? '<button type="button" data-csv="backtest" class="px-3 py-1.5 rounded-lg bg-bull/10 text-bull border border-bull/30 hover:bg-bull/20 text-xs font-semibold">⬇ CSV Export</button>' : '') + '</div>' +
        tableHTML(list, false, true) +
      '</section>';
  }

  /* ------------------------------------------------------------------
     6) TAB B — Mark Douglas 20-Trade Live Demo Tracker
     ------------------------------------------------------------------ */
  function lockHTML(losses) {
    return '<div data-lock class="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="cb-title">' +
      '<div class="max-w-lg w-full bg-card border-2 border-bear/60 rounded-2xl p-6 md:p-8 text-center shadow-2xl shadow-black">' +
        '<div class="text-5xl">🛑</div>' +
        '<p class="text-xs uppercase tracking-widest text-bear font-bold mt-3">2-Loss Daily Circuit Breaker</p>' +
        '<h2 id="cb-title" class="text-2xl md:text-3xl font-bold text-white mt-2">Aaj ki trading BAND</h2>' +
        '<p class="text-slate-300 text-sm mt-3 leading-6">Aaj (' + esc(todayKey()) + ') <b class="text-bear">' + losses + ' losses</b> ho chuke hain. Yeh saza nahi — <b class="text-white">hifazat</b> hai. ' +
          'Mark Douglas: har trade ka nateeja azaad hai; "wapas le loonga" wali soch hi Revenge Trading hai.</p>' +
        '<p class="mt-5 text-xs text-slate-400">Automatic unlock (agli calendar date)</p>' +
        '<p data-countdown class="text-3xl font-mono font-bold text-liq mt-1">' + countdown() + '</p>' +
        '<div class="mt-6 grid gap-2 sm:grid-cols-3">' +
          '<button type="button" data-go="home" class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700">🏠 Home</button>' +
          '<button type="button" data-tab="backtest" class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700">📊 Backtest</button>' +
          '<button type="button" data-go="flashcards" class="px-3 py-2 rounded-lg bg-bull/15 border border-bull/40 text-bull text-sm hover:bg-bull/25">🧠 Revision</button>' +
        '</div>' +
        '<p class="text-xs text-slate-500 mt-5 leading-5">Cool-down: 15 minute screen se door. Phir aaj ki dono trades ke mistake notes parho — kya rules toote ya sirf probability thi?</p>' +
      '</div></div>';
  }

  function demoHTML() {
    const list = load('demo');
    const s = stats(list);
    const today = todayKey();
    const todayLoss = lossesOn(list, today);
    const locked = todayLoss >= DAILY_LOSS_LIMIT;
    const followed = list.filter((t) => t.compliant === true).length;
    const comp = s.n ? r6((followed / s.n) * 100) : 0;
    const cPass = s.n > 0 && comp >= DEMO_PASS_C;
    const gate = gateOk('gate4');

    const badge = !s.n ? chip('— Abhi data nahi', 'slate')
      : cPass ? chip('✅ Compliance ≥ 90%', 'bull') : chip('❌ Compliance < 90%', 'bear');
    const warn = todayLoss === DAILY_LOSS_LIMIT - 1 && !locked
      ? '<div class="p-4 rounded-xl border border-liq/50 bg-liq/10 text-sm text-amber-200">⚠️ Aaj 1 loss ho chuka. <b>Ek aur loss = aaj ka din khatam.</b> Agli trade sirf A+ setup par, poori checklist ke saath.</div>'
      : '';
    const gateLine = gate
      ? '<div class="mt-4 p-3 rounded-xl border border-bull/40 bg-bull/10 text-sm text-emerald-200 flex flex-wrap items-center gap-3">🎉 Gate 4 ki practical shart poori! <button type="button" data-go="gatelab/gate4" class="px-3 py-1 rounded-lg bg-bull text-ink font-semibold text-xs">Gate Lab → Quiz</button></div>'
      : '<p class="mt-4 text-xs text-slate-400">Gate 4 shart: <b class="text-slate-200">' + DEMO_TARGET + ' demo trades</b> aur <b class="text-slate-200">Rule Compliance ≥ 90%</b>. Profit nahi — process grade hota hai.</p>';

    return warn +
      '<section class="' + CARD + '">' +
        '<div class="flex flex-wrap items-start justify-between gap-3">' +
          '<div><h2 class="text-lg font-bold text-white">🎯 Mark Douglas 20-Trade Demo</h2>' +
          '<p class="text-sm text-slate-400 mt-1">20 trades ko ek batch samjho. Akeli trade ka nateeja random hai — edge sirf series mein nazar aata hai.</p></div>' + badge +
        '</div>' +
        '<div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">' +
          stat('Trades', s.n, 'text-white', s.wins + 'W · ' + s.losses + 'L · ' + s.be + 'BE') +
          stat('Rule Compliance', comp.toFixed(1) + '%', cPass ? 'text-bull' : (s.n ? 'text-bear' : 'text-slate-500'), followed + ' / ' + s.n + ' trades mein saare rules') +
          stat('Win Rate', pct(s.winRate) + '%', 'text-white') +
          stat('Expectancy', fmtR(s.expectancy), s.expectancy >= 0 ? 'text-bull' : 'text-bear', 'Total ' + fmtR(s.total)) +
          stat('Aaj ke Losses', todayLoss + ' / ' + DAILY_LOSS_LIMIT, locked ? 'text-bear' : todayLoss ? 'text-liq' : 'text-white', 'Circuit Breaker') +
        '</div>' +
        progress(s.n, DEMO_TARGET, gate) + gateLine +
      '</section>' +
      '<section class="' + CARD + '"><h3 class="font-semibold text-white mb-4">📝 Nayi demo trade</h3>' +
        (locked
          ? '<p class="text-sm text-bear">🔒 Circuit Breaker active — aaj nayi entry nahi ho sakti.</p>'
          : formHTML(true)) +
      '</section>' +
      '<section class="' + CARD + '">' +
        '<div class="flex flex-wrap items-center justify-between gap-2 mb-4"><h3 class="font-semibold text-white">📒 Demo log</h3>' +
        (list.length ? '<button type="button" data-csv="demo" class="px-3 py-1.5 rounded-lg bg-bull/10 text-bull border border-bull/30 hover:bg-bull/20 text-xs font-semibold">⬇ CSV Export</button>' : '') + '</div>' +
        tableHTML(list, true, !locked) +   // lock mein delete band (loss mita kar lock torna mumkin na ho)
      '</section>' +
      (locked ? lockHTML(todayLoss) : '');
  }

  /* ------------------------------------------------------------------
     7) MODULE RENDER
     ------------------------------------------------------------------ */
  function render(el, params) {
    const tab = params && params[0] === 'demo' ? 'demo' : 'backtest';
    let drawnDay = todayKey();

    function draw() {
      drawnDay = todayKey();
      const tabBtn = (id, label) => '<button type="button" data-tab="' + id + '" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition ' +
        (tab === id ? 'bg-bull text-ink' : 'text-slate-300 hover:bg-slate-800') + '"' + (tab === id ? ' aria-current="page"' : '') + '>' + label + '</button>';
      el.innerHTML =
        '<div class="max-w-6xl mx-auto space-y-6">' +
          '<div>' +
            '<p class="text-xs uppercase tracking-widest text-liq font-semibold">Module 5</p>' +
            '<h1 class="text-2xl md:text-3xl font-bold text-white mt-1">📓 Trading Journal</h1>' +
            '<p class="text-slate-400 mt-1 text-sm leading-6">Journal sirf likhne ke liye nahi, <b class="text-white">parhne</b> ke liye hai. Yahan ka data Home Dashboard aur Gate 3 / Gate 4 ko chalata hai.</p>' +
          '</div>' +
          '<div class="flex gap-2 p-1 rounded-xl bg-card border border-slate-800 w-full sm:w-fit">' +
            tabBtn('backtest', '📊 Backtest (50)') + tabBtn('demo', '🎯 Live Demo (20)') +
          '</div>' +
          (tab === 'demo' ? demoHTML() : backtestHTML()) +
        '</div>';
    }
    draw();

    /* --- Save trade --- */
    el.addEventListener('submit', (e) => {
      const f = e.target.closest('[data-form]');
      if (!f) return;
      e.preventDefault();
      const isDemo = tab === 'demo';
      const key = isDemo ? 'demo' : 'backtest';
      if (isDemo && isLocked()) { App.toast('Circuit Breaker active — aaj nayi trade nahi.', 'error'); draw(); return; }

      const fd = new FormData(f);
      const pair = clean(fd.get('pair'), 20).toUpperCase();
      const rRaw = clean(fd.get('r'), 20).replace(/\s/g, '').replace(',', '.').replace(/[−–]/g, '-');
      const r = Number(rRaw);
      let date = clean(fd.get('date'), 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = todayKey();

      if (!pair) { App.toast('Pair likho (jaise EURUSD).', 'warn'); return; }
      if (rRaw === '' || !Number.isFinite(r) || Math.abs(r) > 50) { App.toast('R result number mein likho — jaise +1.3, -1 ya 0.', 'warn'); return; }
      if (date > todayKey()) { App.toast('Future date nahi chalegi.', 'warn'); return; }

      const t = {
        id: uid(), ts: Date.now(), date, pair,
        session: pick(fd.get('session'), SESSIONS),
        setup: pick(fd.get('setup'), SETUPS),
        dir: fd.get('dir') === 'short' ? 'short' : 'long',
        r: Math.round(r * 1000) / 1000,
        notes: clean(fd.get('notes'), 500),
        shot: safeUrl(clean(fd.get('shot'), 300))
      };
      if (clean(fd.get('shot'), 300) && !t.shot) App.toast('Screenshot link http(s):// se shuru nahi — link save nahi hua.', 'warn');

      if (isDemo) {
        const c = fd.get('compliant');
        if (c !== 'yes' && c !== 'no') { App.toast('Batao: saare rules follow hue — Haan ya Nahi?', 'warn'); return; }
        t.compliant = c === 'yes';
        t.emotion = pick(fd.get('emotion'), EMOTIONS);
        t.mistake = clean(fd.get('mistake'), 200);
        if (!t.compliant && !t.mistake) { App.toast('Rule toota hai to Mistake note zaroor likho — yahi asal sabaq hai.', 'warn'); return; }
      }

      const gid = isDemo ? 'gate4' : 'gate3';
      const before = gateOk(gid);
      const list = load(key);
      list.push(t);
      save(key, list);

      App.toast('Trade #' + list.length + ' save ho gayi (' + fmtR(t.r) + ').', 'success');
      if (t.r < -1.2) App.toast('Loss −1R se bara hai — SL move hua ya risk zyada tha? Note mein likho.', 'warn');
      if (!before && gateOk(gid)) App.toast('🎉 ' + (isDemo ? 'Gate 4' : 'Gate 3') + ' practical poora! Gate Lab se quiz attempt karo.', 'success');
      if (isDemo && t.r < 0 && isLocked()) App.toast('🛑 Aaj ke 2 losses poore — Circuit Breaker ON.', 'error');
      draw();
    });

    /* --- Clicks: tabs, delete, CSV, navigation --- */
    el.addEventListener('click', (e) => {
      const tb = e.target.closest('[data-tab]');
      if (tb) { App.navigate('journal', tb.dataset.tab); return; }

      const go = e.target.closest('[data-go]');
      if (go) { App.navigate.apply(null, go.dataset.go.split('/')); return; }

      const csv = e.target.closest('[data-csv]');
      if (csv) {
        const k = csv.dataset.csv;
        downloadCSV('ita-' + k + '-' + todayKey() + '.csv', k === 'demo' ? DEMO_COLS : BASE_COLS, load(k));
        App.toast('CSV download ho gayi.', 'success');
        return;
      }

      const del = e.target.closest('[data-del]');
      if (del) {
        const key = tab === 'demo' ? 'demo' : 'backtest';
        if (key === 'demo' && isLocked()) { App.toast('Lock ke dauran delete band hai.', 'error'); return; }
        const i = Number(del.dataset.del);
        const list = load(key);
        if (!list[i]) return;
        if (!window.confirm('Trade #' + (i + 1) + ' (' + (list[i].pair || '') + ') delete karni hai?\n\nYaad rahe: losing trade sirf is liye delete karna ke bura lagta hai = apne aap ko dhoka.')) return;
        list.splice(i, 1);
        save(key, list);
        draw();
      }
    });

    /* --- Har second: countdown update + naya din aate hi auto-unlock --- */
    const timer = setInterval(() => {
      if (!el.isConnected) { clearInterval(timer); return; }   // module band -> timer band
      if (todayKey() !== drawnDay) {
        const wasLocked = !!el.querySelector('[data-lock]');
        draw();
        if (wasLocked) App.toast('Naya din — Circuit Breaker reset. Fresh mind se trade karo.', 'success');
        return;
      }
      const cd = el.querySelector('[data-countdown]');
      if (cd) cd.textContent = countdown();
    }, 1000);
  }

  App.registerModule({ id: 'journal', title: 'Module 5: Trading Journal', icon: '📓', order: 50, render });
})();
